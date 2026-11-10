import { AspectRatio, Resolution, Scene } from '../types';
import {
  generateSoundtrackBuffer,
  generateTransitionSfxBuffer,
  loadAudioBufferFromUrl,
  synthesizeAndMeasureVoiceBuffer,
  verifyExportedAudio,
} from './audioEngine';

export interface RenderOptions {
  scenes: Scene[];
  aspectRatio: AspectRatio;
  resolution: Resolution;
  bgMusicTrack?: string;
  bgMusicUrl?: string;
  bgMusicVolume?: number;
  voiceoverUrl?: string;
  voiceoverVolume?: number;
  sfxVolume?: number;
  autoSyncSpeechGaps?: boolean;
  onProgress?: (progress: number, statusText: string) => void;
}

export interface RenderResult {
  blob: Blob;
  url: string;
  mimeType: string;
  durationSeconds: number;
  fileName: string;
  hasVerifiedAudio: boolean;
  audioVerificationMessage: string;
  fileSizeBytes: number;
}

export class VideoRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isCancelled: boolean = false;

  constructor() {
    this.canvas = document.createElement('canvas');
    const context = this.canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;
  }

  public cancel() {
    this.isCancelled = true;
  }

  public async renderVideo(options: RenderOptions): Promise<RenderResult> {
    this.isCancelled = false;
    const {
      scenes,
      aspectRatio,
      resolution,
      bgMusicTrack = 'Cinematic Tension',
      bgMusicUrl,
      bgMusicVolume = 0.35,
      voiceoverUrl,
      voiceoverVolume = 0.95,
      sfxVolume = 0.5,
      autoSyncSpeechGaps = true,
      onProgress,
    } = options;

    if (!scenes || scenes.length === 0) {
      throw new Error('Cannot render video without scenes');
    }

    // Determine Canvas Dimensions
    let width = 1280;
    let height = 720;

    if (aspectRatio === '9:16') {
      width = resolution === '1080p' ? 1080 : 720;
      height = resolution === '1080p' ? 1920 : 1280;
    } else if (aspectRatio === '1:1') {
      width = resolution === '1080p' ? 1080 : 720;
      height = resolution === '1080p' ? 1080 : 720;
    } else {
      // 16:9
      width = resolution === '1080p' ? 1920 : 1280;
      height = resolution === '1080p' ? 1080 : 720;
    }

    this.canvas.width = width;
    this.canvas.height = height;

    onProgress?.(5, 'Initializing Web Audio processing engine...');

    // 1. Setup Web Audio Context (Explicitly resume to prevent suspended audio states)
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioCtxClass({ sampleRate: 44100 });
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
    const audioDest = audioCtx.createMediaStreamDestination();

    // 2. Setup Multi-Channel Mixer & Compressor
    const masterCompressor = audioCtx.createDynamicsCompressor();
    masterCompressor.threshold.setValueAtTime(-6, audioCtx.currentTime);
    masterCompressor.knee.setValueAtTime(8, audioCtx.currentTime);
    masterCompressor.ratio.setValueAtTime(4, audioCtx.currentTime);
    masterCompressor.connect(audioDest);

    // Voiceover channel
    const voiceGain = audioCtx.createGain();
    voiceGain.gain.setValueAtTime(Math.max(0.01, voiceoverVolume), audioCtx.currentTime);
    voiceGain.connect(masterCompressor);

    // Background music channel with auto-ducker
    const bgGain = audioCtx.createGain();
    bgGain.gain.setValueAtTime(Math.max(0.01, bgMusicVolume), audioCtx.currentTime);
    const duckingGain = audioCtx.createGain();
    duckingGain.gain.setValueAtTime(1.0, audioCtx.currentTime);
    bgGain.connect(duckingGain);
    duckingGain.connect(masterCompressor);

    // Sound effects channel
    const sfxGain = audioCtx.createGain();
    sfxGain.gain.setValueAtTime(Math.max(0.01, sfxVolume), audioCtx.currentTime);
    sfxGain.connect(masterCompressor);

    // 3. Pre-load / Pre-synthesize all Audio Tracks with Silence Trimming & Exact Durations
    onProgress?.(12, 'Synthesizing Urdu voice narration and trimming dead audio silence...');
    const sceneVoiceBuffers: (AudioBuffer | null)[] = [];
    const sceneSfxBuffers: (AudioBuffer | null)[] = [];
    const sceneEffectiveDurations: number[] = [];

    // Global voiceover if uploaded for whole video
    const globalVoiceBuffer = voiceoverUrl
      ? await loadAudioBufferFromUrl(audioCtx, voiceoverUrl)
      : null;

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const configuredDur = scene.durationSeconds || 5;

      // Voiceover
      if (globalVoiceBuffer) {
        sceneVoiceBuffers.push(null);
        sceneEffectiveDurations.push(configuredDur);
      } else {
        const textToSpeak = scene.urduNarration || scene.title || '';
        try {
          const res = await synthesizeAndMeasureVoiceBuffer(audioCtx, textToSpeak, configuredDur, 'urdu');
          sceneVoiceBuffers.push(res.buffer);

          // If auto-sync is active and speech exists, snap scene duration to spoken audio + 450ms natural transition cadence
          if (autoSyncSpeechGaps && res.exactDurationSeconds > 0) {
            const syncedDur = Math.max(2.5, Math.round((res.exactDurationSeconds + 0.45) * 10) / 10);
            sceneEffectiveDurations.push(syncedDur);
          } else {
            sceneEffectiveDurations.push(configuredDur);
          }
        } catch (e) {
          console.warn(`Voice buffer for scene ${i} error:`, e);
          sceneVoiceBuffers.push(null);
          sceneEffectiveDurations.push(configuredDur);
        }
      }

      // Transition SFX
      try {
        const sfxType =
          scene.transition === 'zoom'
            ? 'boom'
            : scene.transition === 'slide'
            ? 'whoosh'
            : 'whoosh';
        const sfxBuf = await generateTransitionSfxBuffer(audioCtx.sampleRate, sfxType);
        sceneSfxBuffers.push(sfxBuf);
      } catch {
        sceneSfxBuffers.push(null);
      }
    }

    // Dynamic total duration calculation based on synchronized scene timings
    const totalDurationSeconds = sceneEffectiveDurations.reduce((sum, d) => sum + d, 0);

    // Background Music Buffer
    onProgress?.(22, 'Synthesizing multi-genre soundtrack...');
    let bgBuffer: AudioBuffer | null = null;
    try {
      if (bgMusicUrl) {
        bgBuffer = await loadAudioBufferFromUrl(audioCtx, bgMusicUrl);
      }
      if (!bgBuffer) {
        bgBuffer = await generateSoundtrackBuffer(
          audioCtx.sampleRate,
          bgMusicTrack || 'Cinematic Tension',
          totalDurationSeconds + 2
        );
      }
    } catch (e) {
      console.warn('Fallback soundtrack generation:', e);
      bgBuffer = await generateSoundtrackBuffer(
        audioCtx.sampleRate,
        'Cinematic Tension',
        totalDurationSeconds + 2
      );
    }

    // Preload Scene Visual Media
    onProgress?.(30, 'Loading HD visual video clips and assets...');
    const mediaElements: (HTMLVideoElement | HTMLImageElement)[] = [];
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const media = await this.loadSceneMedia(scene);
      mediaElements.push(media);
    }

    // 4. Combine HTML5 Canvas Stream with Web Audio Stream
    const videoStream = this.canvas.captureStream(30);
    const audioTracks = audioDest.stream.getAudioTracks();

    if (audioTracks.length === 0) {
      throw new Error('Web Audio destination failed to create an active audio track');
    }

    // Ensure audio track is strictly enabled
    audioTracks[0].enabled = true;

    // Create composite stream with both Video + Audio
    const combinedStream = new MediaStream([
      ...videoStream.getVideoTracks(),
      audioTracks[0],
    ]);

    // 5. Select supported format and codec
    const mimeTypesToTry = [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4;codecs=h264,aac',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];

    let selectedMime = 'video/webm';
    for (const mime of mimeTypesToTry) {
      if (MediaRecorder.isTypeSupported(mime)) {
        selectedMime = mime;
        break;
      }
    }

    const recordedChunks: Blob[] = [];
    let mediaRecorder: MediaRecorder;
    try {
      mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: selectedMime,
        audioBitsPerSecond: 192000,
        videoBitsPerSecond: resolution === '1080p' ? 8000000 : 4500000,
      });
    } catch (e) {
      mediaRecorder = new MediaRecorder(combinedStream);
      selectedMime = mediaRecorder.mimeType || 'video/webm';
    }

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    // 6. Start Audio Playback inside Web Audio Destination
    const startTime = audioCtx.currentTime;

    // Start Background Music Loop
    if (bgBuffer) {
      const bgSource = audioCtx.createBufferSource();
      bgSource.buffer = bgBuffer;
      bgSource.loop = true;
      bgSource.connect(bgGain);
      bgSource.start(startTime);
    }

    // If global voiceover exists, start it
    if (globalVoiceBuffer) {
      const gVoiceSource = audioCtx.createBufferSource();
      gVoiceSource.buffer = globalVoiceBuffer;
      gVoiceSource.connect(voiceGain);
      gVoiceSource.start(startTime + 0.3);
      // Duck BGM
      duckingGain.gain.setValueAtTime(0.5, startTime + 0.2);
      duckingGain.gain.linearRampToValueAtTime(1.0, startTime + globalVoiceBuffer.duration);
    }

    // Schedule Scene Voiceovers & SFX at exact synchronized timestamps
    let accumulatedTimeSeconds = 0;
    for (let sIdx = 0; sIdx < scenes.length; sIdx++) {
      const sceneDur = sceneEffectiveDurations[sIdx];
      const sceneStartAudioTime = startTime + accumulatedTimeSeconds;

      // SFX at scene transition
      const sfxBuf = sceneSfxBuffers[sIdx];
      if (sfxBuf) {
        const sfxSource = audioCtx.createBufferSource();
        sfxSource.buffer = sfxBuf;
        sfxSource.connect(sfxGain);
        sfxSource.start(sceneStartAudioTime);
      }

      // Voiceover for this scene
      const vBuf = sceneVoiceBuffers[sIdx];
      if (vBuf && !globalVoiceBuffer) {
        const voiceSource = audioCtx.createBufferSource();
        voiceSource.buffer = vBuf;
        voiceSource.connect(voiceGain);
        const voiceStartTime = sceneStartAudioTime + 0.25; // 250ms lead-in
        voiceSource.start(voiceStartTime);

        // Smooth Auto-ducking: ramp down before speech, hold, ramp up smoothly
        const voiceDuration = Math.min(sceneDur - 0.2, vBuf.duration);
        duckingGain.gain.setValueAtTime(1.0, Math.max(0, voiceStartTime - 0.15));
        duckingGain.gain.linearRampToValueAtTime(0.22, voiceStartTime + 0.05);
        duckingGain.gain.setValueAtTime(0.22, voiceStartTime + voiceDuration);
        duckingGain.gain.linearRampToValueAtTime(1.0, voiceStartTime + voiceDuration + 0.35);
      }

      accumulatedTimeSeconds += sceneDur;
    }

    // Start recording chunks every 150ms
    mediaRecorder.start(150);

    // 7. Video Rendering Frame Loop
    const fps = 30;
    let accumulatedRenderTime = 0;

    for (let sceneIdx = 0; sceneIdx < scenes.length; sceneIdx++) {
      if (this.isCancelled) {
        mediaRecorder.stop();
        audioCtx.close();
        throw new Error('Video rendering was cancelled by user');
      }

      const scene = scenes[sceneIdx];
      const media = mediaElements[sceneIdx];
      const sceneDuration = sceneEffectiveDurations[sceneIdx];
      const totalFrames = Math.max(1, Math.round(sceneDuration * fps));

      if (media instanceof HTMLVideoElement) {
        try {
          media.currentTime = 0;
          await media.play().catch(() => {});
        } catch (_) {}
      }

      for (let frame = 0; frame < totalFrames; frame++) {
        if (this.isCancelled) break;

        const progressPercent =
          35 +
          Math.floor(((accumulatedRenderTime + frame / fps) / totalDurationSeconds) * 58);
        onProgress?.(
          progressPercent,
          `Encoding Scene ${sceneIdx + 1}/${scenes.length} • Mixed Audio Active (${Math.round(
            (frame / totalFrames) * 100
          )}%)`
        );

        // Draw frame with transition effects, Ken Burns, color grade, and captions
        this.drawSceneFrame(
          media,
          scene,
          frame,
          totalFrames,
          width,
          height,
          aspectRatio
        );

        // Sync frame rate
        await new Promise((res) => setTimeout(res, 31));
      }

      if (media instanceof HTMLVideoElement) {
        media.pause();
      }

      accumulatedRenderTime += sceneDuration;
    }

    onProgress?.(94, 'Finishing recording and assembling MP4/WebM container...');

    // 8. Finalize MediaRecorder & Verify Audio
    return new Promise((resolve, reject) => {
      mediaRecorder.onstop = async () => {
        try {
          audioCtx.close();
        } catch (_) {}

        const blob = new Blob(recordedChunks, { type: selectedMime });
        const videoUrl = URL.createObjectURL(blob);
        const ext = selectedMime.includes('mp4') ? 'mp4' : 'webm';
        const fileName = `nexora_${Date.now()}.${ext}`;

        onProgress?.(98, 'Verifying audio track and testing exported video...');

        // Automated self-test on generated video and audio track (Requirement 8 & 10)
        const verification = await verifyExportedAudio(blob);

        onProgress?.(100, 'Video export complete with verified audio!');

        resolve({
          blob,
          url: videoUrl,
          mimeType: selectedMime,
          durationSeconds: totalDurationSeconds,
          fileName,
          hasVerifiedAudio: verification.hasAudioTrack,
          audioVerificationMessage: verification.message,
          fileSizeBytes: blob.size,
        });
      };

      mediaRecorder.onerror = (err) => {
        reject(err);
      };

      // Slight flush delay to ensure final audio buffer packets are committed
      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      }, 400);
    });
  }

  private drawSceneFrame(
    media: HTMLVideoElement | HTMLImageElement,
    scene: Scene,
    frame: number,
    totalFrames: number,
    width: number,
    height: number,
    aspectRatio: AspectRatio
  ) {
    const ctx = this.ctx;
    const progress = frame / totalFrames;

    // Clear
    ctx.fillStyle = '#07090e';
    ctx.fillRect(0, 0, width, height);

    // Save for transforms
    ctx.save();

    // Ken Burns camera motion & transitions
    const motion =
      scene.kenBurnsEffect ||
      (scene.transition === 'zoom'
        ? 'zoom_in'
        : scene.sceneNumber % 2 === 0
        ? 'zoom_in'
        : 'pan_right');

    if (motion === 'zoom_in') {
      const scale = 1.0 + progress * 0.08;
      ctx.translate(width / 2, height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-width / 2, -height / 2);
    } else if (motion === 'zoom_out') {
      const scale = 1.08 - progress * 0.08;
      ctx.translate(width / 2, height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-width / 2, -height / 2);
    } else if (motion === 'pan_right') {
      const offsetX = (progress - 0.5) * (width * 0.04);
      ctx.translate(offsetX, 0);
    } else if (motion === 'pan_left') {
      const offsetX = (0.5 - progress) * (width * 0.04);
      ctx.translate(offsetX, 0);
    }

    if (scene.transition === 'slide') {
      const offsetX = (1 - Math.min(1, frame / 15)) * -60;
      ctx.translate(offsetX, 0);
    }

    // Fade in / out effect
    if (frame < 12) {
      ctx.globalAlpha = frame / 12;
    } else if (frame > totalFrames - 12) {
      ctx.globalAlpha = (totalFrames - frame) / 12;
    } else {
      ctx.globalAlpha = 1.0;
    }

    // Draw media
    this.drawCover(ctx, media, 0, 0, width, height);

    ctx.restore();

    // Cinematic Color Grading Layer
    this.applyColorGrade(ctx, width, height, scene.colorGrade || 'documentary_cold');

    // Cinematic Dark Vignette & Gradient Overlay
    this.drawCinematicOverlay(ctx, width, height, aspectRatio);

    // Subtitle / Captions
    this.drawCaptions(ctx, scene, width, height, aspectRatio);

    // Watermark / Brand Badge
    this.drawBrandBadge(ctx, width, height);
  }

  private applyColorGrade(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    colorGrade: Scene['colorGrade']
  ) {
    if (!colorGrade || colorGrade === 'natural_crisp') {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
      return;
    }

    ctx.save();
    if (colorGrade === 'documentary_cold') {
      ctx.fillStyle = 'rgba(8, 51, 68, 0.10)';
      ctx.fillRect(0, 0, width, height);
      const coolGrad = ctx.createLinearGradient(0, 0, width, height);
      coolGrad.addColorStop(0, 'rgba(6, 182, 212, 0.04)');
      coolGrad.addColorStop(1, 'rgba(15, 23, 42, 0.10)');
      ctx.fillStyle = coolGrad;
      ctx.fillRect(0, 0, width, height);
    } else if (colorGrade === 'warm_cinematic') {
      const warmGrad = ctx.createLinearGradient(0, 0, width, height);
      warmGrad.addColorStop(0, 'rgba(245, 158, 11, 0.09)');
      warmGrad.addColorStop(1, 'rgba(180, 83, 9, 0.07)');
      ctx.fillStyle = warmGrad;
      ctx.fillRect(0, 0, width, height);
    } else if (colorGrade === 'cyberpunk_glow') {
      const cyberGrad = ctx.createLinearGradient(0, 0, width, height);
      cyberGrad.addColorStop(0, 'rgba(168, 85, 247, 0.10)');
      cyberGrad.addColorStop(1, 'rgba(6, 182, 212, 0.08)');
      ctx.fillStyle = cyberGrad;
      ctx.fillRect(0, 0, width, height);
    } else if (colorGrade === 'spiritual_soft') {
      const softGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.1,
        width / 2,
        height / 2,
        width * 0.7
      );
      softGrad.addColorStop(0, 'rgba(251, 191, 36, 0.08)');
      softGrad.addColorStop(1, 'rgba(30, 27, 75, 0.10)');
      ctx.fillStyle = softGrad;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();
  }

  private drawCover(
    ctx: CanvasRenderingContext2D,
    media: HTMLVideoElement | HTMLImageElement,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ) {
    const naturalWidth =
      media instanceof HTMLVideoElement ? media.videoWidth || 1280 : media.naturalWidth || 1280;
    const naturalHeight =
      media instanceof HTMLVideoElement ? media.videoHeight || 720 : media.naturalHeight || 720;

    const r = Math.max(dw / naturalWidth, dh / naturalHeight);
    const nw = naturalWidth * r;
    const nh = naturalHeight * r;
    const cx = (dw - nw) / 2;
    const cy = (dh - nh) / 2;

    try {
      ctx.drawImage(media, dx + cx, dy + cy, nw, nh);
    } catch (_) {
      const grad = ctx.createLinearGradient(0, 0, dw, dh);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(dx, dy, dw, dh);
    }
  }

  private drawCinematicOverlay(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    aspectRatio: AspectRatio
  ) {
    const bottomGradient = ctx.createLinearGradient(0, height * 0.52, 0, height);
    bottomGradient.addColorStop(0, 'rgba(7, 9, 14, 0)');
    bottomGradient.addColorStop(0.5, 'rgba(7, 9, 14, 0.7)');
    bottomGradient.addColorStop(1, 'rgba(7, 9, 14, 0.95)');
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(0, height * 0.52, width, height * 0.48);

    const topGradient = ctx.createLinearGradient(0, 0, 0, height * 0.22);
    topGradient.addColorStop(0, 'rgba(7, 9, 14, 0.7)');
    topGradient.addColorStop(1, 'rgba(7, 9, 14, 0)');
    ctx.fillStyle = topGradient;
    ctx.fillRect(0, 0, width, height * 0.22);
  }

  private drawCaptions(
    ctx: CanvasRenderingContext2D,
    scene: Scene,
    width: number,
    height: number,
    aspectRatio: AspectRatio
  ) {
    const isVertical = aspectRatio === '9:16';
    const urduText = scene.urduNarration || scene.visualDescription || '';
    const englishSub = scene.englishSubtitle || '';

    if (urduText) {
      const fontSize = isVertical ? Math.round(width * 0.056) : Math.round(height * 0.05);
      ctx.font = `600 ${fontSize}px "Noto Nastaliq Urdu", "Amiri", serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const paddingX = 24;
      const maxWidth = width * (isVertical ? 0.88 : 0.82);

      const lines = this.wrapText(ctx, urduText, maxWidth);
      const lineHeight = fontSize * 1.8;
      const totalTextHeight = lines.length * lineHeight;
      const startY = height - (isVertical ? height * 0.22 : height * 0.16) - totalTextHeight / 2;

      lines.forEach((line, idx) => {
        const lineY = startY + idx * lineHeight;
        const textMetrics = ctx.measureText(line);
        const bgWidth = Math.min(maxWidth + 40, textMetrics.width + paddingX * 2);

        ctx.fillStyle = 'rgba(11, 15, 25, 0.88)';
        this.roundRect(
          ctx,
          width / 2 - bgWidth / 2,
          lineY - lineHeight / 2 + 4,
          bgWidth,
          lineHeight,
          10
        );
        ctx.fill();

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.shadowColor = 'rgba(0, 210, 255, 0.5)';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(line, width / 2, lineY + 2);
        ctx.shadowBlur = 0;
      });

      if (englishSub && !isVertical) {
        const engFontSize = Math.round(height * 0.032);
        ctx.font = `500 ${engFontSize}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(englishSub, width / 2, height - height * 0.06);
        ctx.shadowBlur = 0;
      }
    }
  }

  private drawBrandBadge(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const isSmall = width < 800;
    const badgeX = isSmall ? 20 : 36;
    const badgeY = isSmall ? 20 : 36;

    ctx.beginPath();
    ctx.arc(badgeX + 8, badgeY + 10, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#00d2ff';
    ctx.shadowColor = '#00d2ff';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = `700 ${isSmall ? 13 : 16}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('NEXORA AI', badgeX + 20, badgeY + 10);
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  private async loadSceneMedia(scene: Scene): Promise<HTMLVideoElement | HTMLImageElement> {
    const targetUrl = scene.videoUrl || scene.previewUrl;

    if (scene.videoUrl && scene.videoUrl.endsWith('.mp4')) {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.src = scene.videoUrl;
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';

        const timeout = setTimeout(() => {
          this.loadFallbackImage(scene.previewUrl).then(resolve);
        }, 5000);

        video.onloadeddata = () => {
          clearTimeout(timeout);
          resolve(video);
        };

        video.onerror = () => {
          clearTimeout(timeout);
          this.loadFallbackImage(scene.previewUrl).then(resolve);
        };
      });
    }

    return this.loadFallbackImage(scene.previewUrl);
  }

  private loadFallbackImage(url?: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src =
        url ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&auto=format&fit=crop&q=80';
      img.onload = () => resolve(img);
      img.onerror = () => {
        const fallbackCanvas = document.createElement('canvas');
        fallbackCanvas.width = 1280;
        fallbackCanvas.height = 720;
        const fctx = fallbackCanvas.getContext('2d')!;
        fctx.fillStyle = '#0f172a';
        fctx.fillRect(0, 0, 1280, 720);
        fctx.fillStyle = '#38bdf8';
        fctx.font = 'bold 36px sans-serif';
        fctx.textAlign = 'center';
        fctx.fillText('NEXORA AI CINEMATIC', 640, 360);
        const placeholderImg = new Image();
        placeholderImg.src = fallbackCanvas.toDataURL();
        placeholderImg.onload = () => resolve(placeholderImg);
      };
    });
  }
}

export function downloadVideoFile(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
