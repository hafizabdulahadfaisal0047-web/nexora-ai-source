import { generateSpeechAudio } from './api';

export interface VoiceOption {
  voice: SpeechSynthesisVoice;
  lang: string;
  name: string;
  isUrdu: boolean;
  isRegional: boolean;
  label: string;
}

export interface SpeechSupportInfo {
  isSupported: boolean;
  hasUrduVoice: boolean;
  hasRegionalVoice: boolean;
  totalVoices: number;
  urduVoiceName?: string;
  alternativeAvailable: boolean;
}

export class UrduVoiceService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private state: 'idle' | 'playing' | 'paused' = 'idle';
  private onStateChangeCallback?: (state: 'idle' | 'playing' | 'paused') => void;

  constructor(onStateChange?: (state: 'idle' | 'playing' | 'paused') => void) {
    this.onStateChangeCallback = onStateChange;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
    }
  }

  private initVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();

    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth?.getVoices() || [];
      };
    }

    // Polling retry for browsers where getVoices() takes 100-300ms to populate
    if (this.voices.length === 0) {
      let retries = 0;
      const interval = setInterval(() => {
        if (!this.synth) return clearInterval(interval);
        const list = this.synth.getVoices();
        if (list.length > 0 || retries > 10) {
          this.voices = list;
          clearInterval(interval);
        }
        retries++;
      }, 100);
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    if (this.voices.length === 0) {
      this.voices = this.synth.getVoices();
    }
    return this.voices;
  }

  public getVoiceOptions(): VoiceOption[] {
    const list = this.getVoices();
    return list.map((v) => {
      const langLower = v.lang.toLowerCase();
      const nameLower = v.name.toLowerCase();

      const isUrdu =
        langLower.startsWith('ur') ||
        nameLower.includes('urdu') ||
        nameLower.includes('pakistan');

      const isRegional =
        isUrdu ||
        langLower.startsWith('hi') ||
        nameLower.includes('hindi') ||
        langLower.startsWith('ar') ||
        nameLower.includes('arabic');

      let label = v.name;
      if (isUrdu) label = `★ Urdu - ${v.name} (${v.lang})`;
      else if (isRegional) label = `◆ Regional (${v.lang}) - ${v.name}`;
      else label = `${v.name} (${v.lang})`;

      return {
        voice: v,
        lang: v.lang,
        name: v.name,
        isUrdu,
        isRegional,
        label,
      };
    });
  }

  public getVoicesForLanguage(targetLang: string = 'urdu'): VoiceOption[] {
    const list = this.getVoiceOptions();
    const l = targetLang.toLowerCase();
    if (l.includes('urdu') || l.includes('roman')) {
      const urduOrReg = list.filter((v) => v.isUrdu || v.isRegional);
      return urduOrReg.length > 0 ? urduOrReg : list;
    }
    if (l.includes('english')) {
      const eng = list.filter((v) => v.lang.toLowerCase().startsWith('en'));
      return eng.length > 0 ? eng : list;
    }
    if (l.includes('arabic')) {
      const ar = list.filter((v) => v.lang.toLowerCase().startsWith('ar'));
      return ar.length > 0 ? ar : list;
    }
    if (l.includes('hindi')) {
      const hi = list.filter((v) => v.lang.toLowerCase().startsWith('hi'));
      return hi.length > 0 ? hi : list;
    }
    return list;
  }

  public checkSupport(): SpeechSupportInfo {
    const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    const voices = this.getVoiceOptions();
    const urduVoice = voices.find((v) => v.isUrdu);
    const regionalVoice = voices.find((v) => v.isRegional);

    return {
      isSupported,
      hasUrduVoice: !!urduVoice,
      hasRegionalVoice: !!regionalVoice,
      totalVoices: voices.length,
      urduVoiceName: urduVoice?.name,
      alternativeAvailable: true, // We provide Gemini 3.8 TTS & Web Audio formant synthesizer
    };
  }

  public speak(
    text: string,
    options: {
      voice?: SpeechSynthesisVoice | null;
      rate?: number;
      pitch?: number;
      volume?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    } = {}
  ): SpeechSynthesisUtterance | null {
    if (!this.synth) {
      options.onError?.(new Error('Speech Synthesis not supported in this browser'));
      return null;
    }

    // Always cancel ongoing speech first to clear Chrome's internal queue
    this.stop();

    if (!text || !text.trim()) return null;

    const utterance = new SpeechSynthesisUtterance(text.trim());

    // Select chosen voice or best available Urdu / Regional voice
    if (options.voice) {
      utterance.voice = options.voice;
      utterance.lang = options.voice.lang;
    } else {
      const optionsList = this.getVoiceOptions();
      const best =
        optionsList.find((v) => v.isUrdu)?.voice ||
        optionsList.find((v) => v.isRegional)?.voice ||
        optionsList[0]?.voice;

      if (best) {
        utterance.voice = best;
        utterance.lang = best.lang;
      }
    }

    utterance.rate = Math.max(0.5, Math.min(2.0, options.rate ?? 0.95));
    utterance.pitch = Math.max(0.5, Math.min(2.0, options.pitch ?? 1.0));
    utterance.volume = Math.max(0.0, Math.min(1.0, options.volume ?? 1.0));

    // Chrome garbage collection prevention
    this.currentUtterance = utterance;
    (window as any).__lastUtterance = utterance;

    utterance.onstart = () => {
      this.setState('playing');
      options.onStart?.();
    };

    utterance.onend = () => {
      this.setState('idle');
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.setState('idle');
      this.currentUtterance = null;
      options.onError?.(e);
    };

    utterance.onpause = () => {
      this.setState('paused');
    };

    utterance.onresume = () => {
      this.setState('playing');
    };

    try {
      this.synth.speak(utterance);
      // In some browsers, if the window was in the background, resume kicks it off
      if (this.synth.paused) {
        this.synth.resume();
      }
    } catch (err) {
      options.onError?.(err);
    }

    return utterance;
  }

  public pause() {
    if (!this.synth) return;
    if (this.state === 'playing') {
      this.synth.pause();
      this.setState('paused');
    }
  }

  public resume() {
    if (!this.synth) return;
    if (this.state === 'paused') {
      this.synth.resume();
      this.setState('playing');
    }
  }

  public stop() {
    if (!this.synth) return;
    this.synth.cancel();
    this.setState('idle');
    this.currentUtterance = null;
  }

  public getState(): 'idle' | 'playing' | 'paused' {
    return this.state;
  }

  private setState(newState: 'idle' | 'playing' | 'paused') {
    this.state = newState;
    this.onStateChangeCallback?.(newState);
  }
}

// Microphone Voice Recorder
export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  public async startRecording(): Promise<MediaStream> {
    this.audioChunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(this.stream);

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.audioChunks.push(e.data);
      }
    };

    this.mediaRecorder.start(100);
    return this.stream;
  }

  public stopRecording(): Promise<{ blob: Blob; url: string; duration: number }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject(new Error('Recorder not initialized'));
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);

        this.stream?.getTracks().forEach((track) => track.stop());

        const tempAudio = new Audio(url);
        tempAudio.onloadedmetadata = () => {
          resolve({ blob, url, duration: tempAudio.duration || 5 });
        };
        tempAudio.onerror = () => {
          resolve({ blob, url, duration: 5 });
        };
      };

      this.mediaRecorder.stop();
    });
  }
}

// Sound FX and Audio Generator (Creates real downloadable WAV audio file using Web Audio)
export function synthesizeSoundEffect(
  type: 'boom' | 'whoosh' | 'drone' | 'chime'
): Promise<{ blob: Blob; url: string }> {
  return new Promise((resolve) => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const sampleRate = 44100;
    const duration = type === 'drone' ? 5 : type === 'boom' ? 3 : 1.5;
    const frameCount = sampleRate * duration;
    const offlineCtx = new OfflineAudioContext(2, frameCount, sampleRate);

    if (type === 'boom') {
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, 0);
      osc.frequency.exponentialRampToValueAtTime(25, duration);
      gain.gain.setValueAtTime(0.9, 0);
      gain.gain.exponentialRampToValueAtTime(0.001, duration);
      osc.connect(gain);
      gain.connect(offlineCtx.destination);
      osc.start(0);
      osc.stop(duration);
    } else if (type === 'whoosh') {
      const bufferSize = frameCount;
      const noiseBuffer = offlineCtx.createBuffer(1, bufferSize, sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = offlineCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = offlineCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(200, 0);
      filter.frequency.exponentialRampToValueAtTime(2400, duration * 0.5);
      filter.frequency.exponentialRampToValueAtTime(150, duration);

      const gain = offlineCtx.createGain();
      gain.gain.setValueAtTime(0.01, 0);
      gain.gain.linearRampToValueAtTime(0.7, duration * 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, duration);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(offlineCtx.destination);
      whiteNoise.start(0);
      whiteNoise.stop(duration);
    } else if (type === 'chime') {
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = offlineCtx.createOscillator();
        const gain = offlineCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, idx * 0.15);
        gain.gain.linearRampToValueAtTime(0.3, idx * 0.15 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, duration);
        osc.connect(gain);
        gain.connect(offlineCtx.destination);
        osc.start(idx * 0.15);
        osc.stop(duration);
      });
    } else {
      // Drone
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110, 0);
      gain.gain.setValueAtTime(0.4, 0);
      gain.gain.linearRampToValueAtTime(0.5, duration * 0.5);
      gain.gain.linearRampToValueAtTime(0.01, duration);
      osc.connect(gain);
      gain.connect(offlineCtx.destination);
      osc.start(0);
      osc.stop(duration);
    }

    offlineCtx.startRendering().then((renderedBuffer) => {
      const wavBlob = audioBufferToWavBlob(renderedBuffer);
      const url = URL.createObjectURL(wavBlob);
      resolve({ blob: wavBlob, url });
    });
  });
}

export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const length = buffer.length * blockAlign;
  const wavBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(wavBuffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, length, true);

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: 'audio/wav' });
}
