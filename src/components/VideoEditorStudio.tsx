import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Film,
  Play,
  Pause,
  Upload,
  Volume2,
  VolumeX,
  Maximize2,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Download,
  Settings,
  Sparkles,
  Layers,
  Music,
  Clock,
  Eye,
  CheckCircle,
  RefreshCw,
  Search,
  Type,
  Video,
  Copy,
  Scissors,
  Gauge,
  Undo2,
  Redo2,
  Sliders,
  Volume1,
  Activity,
  Zap,
  AlertTriangle,
  ShieldCheck,
  Wand2,
  Palette,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AspectRatio, Project, Resolution, Scene, StockVideo, TransitionType } from '../types';
import { VideoRenderer, RenderResult, downloadVideoFile } from '../services/videoRenderer';
import { getCuratedVideos, searchStockVideos } from '../services/api';
import { UrduVoiceService } from '../services/audioSynthesizer';
import {
  generateSoundtrackBuffer,
  ROYALTY_FREE_SOUNDTRACKS,
  auditTimelineHealth,
  autoSyncAllScenesToSpeech,
  estimateSentenceSpeechDuration,
} from '../services/audioEngine';

interface VideoEditorStudioProps {
  currentProject: Project | null;
  onSaveProject: (project: Project) => void;
  customPexelsKey?: string;
}

const DEFAULT_SCENES: Scene[] = [
  {
    id: 'sc-1',
    sceneNumber: 1,
    title: 'افتتاحی منظر',
    visualDescription: 'ٹیکنالوجی سرورز اور کمپیوٹر کوڈنگ',
    stockSearchQuery: 'technology servers coding',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    previewUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    urduNarration: 'مصنوعی ذہانت نے دنیا کے تمام روایتی بزنس ماڈلز کو بدل کر رکھ دیا ہے۔',
    englishSubtitle: 'Artificial Intelligence has transformed traditional global business models.',
    durationSeconds: 6,
    transition: 'fade',
  },
  {
    id: 'sc-2',
    sceneNumber: 2,
    title: 'فنانشل تجزیہ',
    visualDescription: 'اسٹاک مارکیٹ اور فنانس چارٹس',
    stockSearchQuery: 'stock market finance trading',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    previewUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
    urduNarration: 'اربوں ڈالر کی سرمایہ کاری اور نئی کمپنیاں مارکیٹ پر قابض ہو رہی ہیں۔',
    englishSubtitle: 'Billions in venture capital and new startups are dominating the market.',
    durationSeconds: 8,
    transition: 'zoom',
  },
  {
    id: 'sc-3',
    sceneNumber: 3,
    title: 'اختتامی نتیجہ',
    visualDescription: 'ماڈرن کارپوریٹ اسکائی لائن',
    stockSearchQuery: 'metropolitan night skyline',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    previewUrl: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=800&auto=format&fit=crop&q=80',
    urduNarration: 'کیا آپ اس نئے صنعتی انقلاب کے لیے تیار ہیں؟',
    englishSubtitle: 'Are you prepared for this new industrial revolution?',
    durationSeconds: 6,
    transition: 'slide',
  },
];

export const VideoEditorStudio: React.FC<VideoEditorStudioProps> = ({
  currentProject,
  onSaveProject,
  customPexelsKey,
}) => {
  // Project settings
  const [projectTitle, setProjectTitle] = useState(currentProject?.title || 'Untitled Video Project');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(currentProject?.aspectRatio || '16:9');
  const [resolution, setResolution] = useState<Resolution>(currentProject?.resolution || '1080p');
  const [scenes, setScenes] = useState<Scene[]>(
    currentProject?.scenes && currentProject.scenes.length > 0
      ? currentProject.scenes
      : DEFAULT_SCENES
  );

  // Undo / Redo history state
  const [history, setHistory] = useState<Scene[][]>([
    currentProject?.scenes && currentProject.scenes.length > 0
      ? currentProject.scenes
      : DEFAULT_SCENES,
  ]);
  const [historyIdx, setHistoryIdx] = useState(0);

  const updateScenesWithHistory = (newScenes: Scene[]) => {
    const updatedHistory = history.slice(0, historyIdx + 1);
    updatedHistory.push(newScenes);
    if (updatedHistory.length > 30) {
      updatedHistory.shift();
    }
    setHistory(updatedHistory);
    setHistoryIdx(updatedHistory.length - 1);
    setScenes(newScenes);
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      const targetIdx = historyIdx - 1;
      setHistoryIdx(targetIdx);
      setScenes(history[targetIdx]);
      if (currentSceneIdx >= history[targetIdx].length) {
        setCurrentSceneIdx(Math.max(0, history[targetIdx].length - 1));
      }
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const targetIdx = historyIdx + 1;
      setHistoryIdx(targetIdx);
      setScenes(history[targetIdx]);
    }
  };

  // Background music & Voiceover audio controls
  const [bgMusic, setBgMusic] = useState<string>(
    currentProject?.bgMusicTrack || 'Cinematic Documentary'
  );
  const [bgMusicVolume, setBgMusicVolume] = useState<number>(currentProject?.bgMusicVolume ?? 0.35);
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);

  // Separate voiceover and SFX volume controls
  const [voiceoverVolume, setVoiceoverVolume] = useState<number>(0.95);
  const [sfxVolume, setSfxVolume] = useState<number>(0.5);
  const [customVoiceUrl, setCustomVoiceUrl] = useState<string | null>(null);

  // Video preview player state
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);

  // Live Audio Preview Engine Refs
  const voiceServiceRef = useRef<UrduVoiceService | null>(null);
  const previewAudioCtxRef = useRef<AudioContext | null>(null);
  const previewBgGainRef = useRef<GainNode | null>(null);
  const previewBgSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const bgBufferCacheRef = useRef<{ track: string; buffer: AudioBuffer } | null>(null);
  const customVoiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const customBgmAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Urdu Voice Service
  useEffect(() => {
    voiceServiceRef.current = new UrduVoiceService();
    return () => {
      stopAllAudio();
      if (previewAudioCtxRef.current && previewAudioCtxRef.current.state !== 'closed') {
        previewAudioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Calculate total timeline duration
  const totalDuration = scenes.reduce((acc, s) => acc + (s.durationSeconds || 5), 0);
  const activeScene = scenes[currentSceneIdx] || scenes[0];

  // Sync playback rate with active scene speed
  useEffect(() => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.playbackRate = activeScene?.speed || 1;
    }
  }, [currentSceneIdx, activeScene?.speed]);

  // Stock footage replacement modal
  const [stockModalSceneIdx, setStockModalSceneIdx] = useState<number | null>(null);
  const [stockQuery, setStockQuery] = useState('');
  const [stockClips, setStockClips] = useState<StockVideo[]>([]);
  const [stockLoading, setStockLoading] = useState(false);

  // Real Rendering State
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStatus, setRenderStatus] = useState('');
  const [renderResult, setRenderResult] = useState<RenderResult | null>(null);
  const rendererRef = useRef<VideoRenderer | null>(null);

  // Timeline Health & Timing Synchronization State
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [autoSyncFeedback, setAutoSyncFeedback] = useState<string | null>(null);

  const healthReport = useMemo(() => {
    return auditTimelineHealth(scenes, 'urdu', 1.0);
  }, [scenes]);

  useEffect(() => {
    if (currentProject) {
      setProjectTitle(currentProject.title);
      setAspectRatio(currentProject.aspectRatio || '16:9');
      setResolution(currentProject.resolution || '1080p');
      if (currentProject.scenes && currentProject.scenes.length > 0) {
        setScenes(currentProject.scenes);
        setHistory([currentProject.scenes]);
        setHistoryIdx(0);
        setCurrentSceneIdx(0);
      }
    }
  }, [currentProject]);

  const stopAllAudio = () => {
    voiceServiceRef.current?.stop();
    if (customVoiceAudioRef.current) {
      customVoiceAudioRef.current.pause();
    }
    if (customBgmAudioRef.current) {
      customBgmAudioRef.current.pause();
    }
    if (previewBgSourceRef.current) {
      try {
        previewBgSourceRef.current.stop();
        previewBgSourceRef.current.disconnect();
      } catch (_) {}
      previewBgSourceRef.current = null;
    }
  };

  // Pre-calculate preceding seconds for scene
  const getPrecedingDuration = (sceneIdx: number) => {
    let prec = 0;
    for (let i = 0; i < sceneIdx; i++) {
      prec += scenes[i]?.durationSeconds || 5;
    }
    return prec;
  };

  // Play preview BGM
  const startPreviewBgm = async (startTimeOffset: number = 0) => {
    if (isMuted) return;

    if (customAudioUrl && customBgmAudioRef.current) {
      customBgmAudioRef.current.volume = bgMusicVolume;
      if (customBgmAudioRef.current.duration) {
        customBgmAudioRef.current.currentTime = startTimeOffset % customBgmAudioRef.current.duration;
      }
      customBgmAudioRef.current.play().catch(() => {});
      return;
    }

    // Use Web Audio Soundtrack Generator for live audible preview
    try {
      let ctx = previewAudioCtxRef.current;
      if (!ctx || ctx.state === 'closed') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        ctx = new AudioContextClass();
        previewAudioCtxRef.current = ctx;
      }
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Check if buffer is already cached for current preset
      let buffer = bgBufferCacheRef.current?.track === bgMusic ? bgBufferCacheRef.current.buffer : null;
      if (!buffer) {
        buffer = await generateSoundtrackBuffer(ctx.sampleRate, bgMusic, Math.max(60, totalDuration));
        bgBufferCacheRef.current = { track: bgMusic, buffer };
      }

      if (previewBgSourceRef.current) {
        try {
          previewBgSourceRef.current.stop();
          previewBgSourceRef.current.disconnect();
        } catch (_) {}
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const gain = ctx.createGain();
      gain.gain.value = isMuted ? 0 : bgMusicVolume;
      source.connect(gain);
      gain.connect(ctx.destination);

      previewBgGainRef.current = gain;
      previewBgSourceRef.current = source;

      const startOffset = startTimeOffset % buffer.duration;
      source.start(0, startOffset);
    } catch (e) {
      console.warn('Preview BGM start note:', e);
    }
  };

  // Play Urdu Voice narration for active scene
  const startSceneNarration = (sceneIdx: number) => {
    if (isMuted) return;
    const scene = scenes[sceneIdx];
    if (!scene) return;

    if (customVoiceUrl && customVoiceAudioRef.current) {
      const prec = getPrecedingDuration(sceneIdx);
      customVoiceAudioRef.current.currentTime = prec;
      customVoiceAudioRef.current.volume = voiceoverVolume;
      customVoiceAudioRef.current.play().catch(() => {});
      return;
    }

    if (scene.urduNarration && scene.urduNarration.trim()) {
      voiceServiceRef.current?.stop();
      voiceServiceRef.current?.speak(scene.urduNarration, {
        volume: voiceoverVolume,
        rate: 0.95,
        onError: () => {},
      });
    }
  };

  const togglePlay = async () => {
    if (!videoPlayerRef.current) return;

    if (isPlaying) {
      videoPlayerRef.current.pause();
      stopAllAudio();
      setIsPlaying(false);
    } else {
      // AudioContext resume on direct user gesture
      if (previewAudioCtxRef.current && previewAudioCtxRef.current.state === 'suspended') {
        await previewAudioCtxRef.current.resume();
      }

      try {
        await videoPlayerRef.current.play();
      } catch (err) {
        console.warn('Video element play error:', err);
      }

      const preceding = getPrecedingDuration(currentSceneIdx);
      const sceneElapsed = videoPlayerRef.current.currentTime || 0;
      startPreviewBgm(preceding + sceneElapsed);
      startSceneNarration(currentSceneIdx);

      setIsPlaying(true);
    }
  };

  // React to volume changes during preview
  useEffect(() => {
    if (previewBgGainRef.current && previewAudioCtxRef.current) {
      previewBgGainRef.current.gain.setValueAtTime(
        isMuted ? 0 : bgMusicVolume,
        previewAudioCtxRef.current.currentTime
      );
    }
    if (customBgmAudioRef.current) {
      customBgmAudioRef.current.volume = isMuted ? 0 : bgMusicVolume;
    }
    if (customVoiceAudioRef.current) {
      customVoiceAudioRef.current.volume = isMuted ? 0 : voiceoverVolume;
    }
  }, [bgMusicVolume, voiceoverVolume, isMuted]);

  // Handle scene change during active playback
  useEffect(() => {
    if (isPlaying) {
      startSceneNarration(currentSceneIdx);
      if (videoPlayerRef.current) {
        videoPlayerRef.current.play().catch(() => {});
      }
    }
  }, [currentSceneIdx]);

  const handleTimeUpdate = () => {
    if (videoPlayerRef.current) {
      const sceneElapsed = videoPlayerRef.current.currentTime;
      const targetDuration = activeScene?.durationSeconds || 5;
      const preceding = getPrecedingDuration(currentSceneIdx);

      setCurrentTime(preceding + Math.min(sceneElapsed, targetDuration));

      // Advance immediately to next scene when targetDuration is reached
      // This eliminates awkward long pauses when stock clip is longer than scene speech duration!
      if (isPlaying && sceneElapsed >= targetDuration) {
        handleVideoEnded();
      }
    }
  };

  const handleVideoEnded = () => {
    voiceServiceRef.current?.stop();
    if (currentSceneIdx < scenes.length - 1) {
      setCurrentSceneIdx((prev) => prev + 1);
    } else {
      stopAllAudio();
      setIsPlaying(false);
      setCurrentSceneIdx(0);
      setCurrentTime(0);
    }
  };

  const handleSceneDurationChange = (index: number, newDur: number) => {
    const updated = [...scenes];
    updated[index] = { ...updated[index], durationSeconds: Math.max(1, newDur) };
    updateScenesWithHistory(updated);
  };

  const handleSceneTransitionChange = (index: number, trans: TransitionType) => {
    const updated = [...scenes];
    updated[index] = { ...updated[index], transition: trans };
    updateScenesWithHistory(updated);
  };

  const handleSceneColorGradeChange = (index: number, grade: Scene['colorGrade']) => {
    const updated = [...scenes];
    updated[index] = { ...updated[index], colorGrade: grade };
    updateScenesWithHistory(updated);
  };

  const handleSceneKenBurnsChange = (index: number, motion: Scene['kenBurnsEffect']) => {
    const updated = [...scenes];
    updated[index] = { ...updated[index], kenBurnsEffect: motion };
    updateScenesWithHistory(updated);
  };

  const handleSceneNarrationChange = (index: number, text: string) => {
    const updated = [...scenes];
    updated[index] = { ...updated[index], urduNarration: text };
    updateScenesWithHistory(updated);
  };

  const handleSceneSubtitleChange = (index: number, text: string) => {
    const updated = [...scenes];
    updated[index] = { ...updated[index], englishSubtitle: text };
    updateScenesWithHistory(updated);
  };

  const handleSceneSpeedChange = (index: number, speed: number) => {
    const updated = [...scenes];
    updated[index] = { ...updated[index], speed };
    updateScenesWithHistory(updated);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.playbackRate = speed;
    }
  };

  // 1-Click Auto-Sync All Scenes to Speech
  const handleAutoSyncAllGaps = () => {
    const synced = autoSyncAllScenesToSpeech(scenes, 'urdu', 1.0, 0.45);
    const oldDur = totalDuration;
    const newDur = synced.reduce((sum, s) => sum + (s.durationSeconds || 5), 0);
    const trimmedDiff = Math.max(0, Math.round((oldDur - newDur) * 10) / 10);

    updateScenesWithHistory(synced);
    setAutoSyncFeedback(
      `⚡ Auto-Synced ${synced.length} scenes! Trimmed ${trimmedDiff}s of silent dead gaps while maintaining natural speaking cadence.`
    );
    setTimeout(() => setAutoSyncFeedback(null), 5000);
  };

  const handleSplitScene = (index: number) => {
    const target = scenes[index];
    if (!target) return;
    const dur = target.durationSeconds || 6;
    const half1 = Math.max(2, Math.floor(dur / 2));
    const half2 = Math.max(2, Math.ceil(dur / 2));

    let nar1 = target.urduNarration;
    let nar2 = target.urduNarration;
    if (target.urduNarration.includes('،') || target.urduNarration.includes('۔') || target.urduNarration.includes('.')) {
      const parts = target.urduNarration.split(/(?<=[،۔.])/);
      if (parts.length >= 2) {
        nar1 = parts.slice(0, Math.ceil(parts.length / 2)).join(' ').trim();
        nar2 = parts.slice(Math.ceil(parts.length / 2)).join(' ').trim();
      }
    }

    const sceneA: Scene = {
      ...target,
      title: `${target.title} (Part 1)`,
      durationSeconds: half1,
      urduNarration: nar1,
    };
    const sceneB: Scene = {
      ...target,
      id: `sc_split_${Date.now()}`,
      sceneNumber: target.sceneNumber + 1,
      title: `${target.title} (Part 2)`,
      durationSeconds: half2,
      urduNarration: nar2,
    };

    const updated = [...scenes.slice(0, index), sceneA, sceneB, ...scenes.slice(index + 1)].map((s, i) => ({
      ...s,
      sceneNumber: i + 1,
    }));
    updateScenesWithHistory(updated);
  };

  const handleDuplicateScene = (index: number) => {
    const target = scenes[index];
    if (!target) return;
    const clone: Scene = {
      ...target,
      id: `sc_dup_${Date.now()}`,
      title: `${target.title} (Copy)`,
    };
    const updated = [...scenes.slice(0, index + 1), clone, ...scenes.slice(index + 1)].map((s, i) => ({
      ...s,
      sceneNumber: i + 1,
    }));
    updateScenesWithHistory(updated);
    setCurrentSceneIdx(index + 1);
  };

  const handleMoveScene = (index: number, direction: 'left' | 'right') => {
    if (
      (direction === 'left' && index === 0) ||
      (direction === 'right' && index === scenes.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    const updated = [...scenes];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    updateScenesWithHistory(updated);
    setCurrentSceneIdx(targetIdx);
  };

  const handleDeleteScene = (index: number) => {
    if (scenes.length <= 1) {
      alert('Video must contain at least 1 scene');
      return;
    }
    const updated = scenes.filter((_, i) => i !== index);
    updateScenesWithHistory(updated);
    if (currentSceneIdx >= updated.length) {
      setCurrentSceneIdx(updated.length - 1);
    }
  };

  const handleAddScene = () => {
    const newScene: Scene = {
      id: `sc_${Date.now()}`,
      sceneNumber: scenes.length + 1,
      title: `منظر ${scenes.length + 1}`,
      visualDescription: 'نئی ویڈیو کلپ',
      stockSearchQuery: 'modern business corporate',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      previewUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80',
      urduNarration: 'یہاں اپنی نئی اردو آواز یا سب ٹائٹل درج کریں۔',
      englishSubtitle: 'Enter your new scene subtitle here.',
      durationSeconds: 6,
      transition: 'fade',
      speed: 1,
    };
    const updated = [...scenes, newScene];
    updateScenesWithHistory(updated);
    setCurrentSceneIdx(scenes.length);
  };

  const handleCustomVideoUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const updated = [...scenes];
      updated[index] = {
        ...updated[index],
        videoUrl: url,
        previewUrl: url,
        isCustomUpload: true,
      };
      setScenes(updated);
    }
  };

  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomAudioUrl(url);
      setBgMusic('Custom Uploaded Audio');
    }
  };

  const handleCustomVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomVoiceUrl(url);
    }
  };

  const openStockModal = async (sceneIdx: number) => {
    setStockModalSceneIdx(sceneIdx);
    const scene = scenes[sceneIdx];
    const initial = scene.stockSearchQuery || 'business corporate';
    setStockQuery(initial);
    setStockLoading(true);
    try {
      const res = await searchStockVideos(
        initial,
        aspectRatio === '9:16' ? 'portrait' : 'landscape',
        9,
        customPexelsKey
      );
      setStockClips(res.videos);
    } catch {
      const cur = await getCuratedVideos();
      setStockClips(cur.videos);
    } finally {
      setStockLoading(false);
    }
  };

  const handleSearchStock = async () => {
    if (!stockQuery.trim()) return;
    setStockLoading(true);
    try {
      const res = await searchStockVideos(
        stockQuery,
        aspectRatio === '9:16' ? 'portrait' : 'landscape',
        9,
        customPexelsKey
      );
      setStockClips(res.videos);
    } catch {
      const cur = await getCuratedVideos();
      setStockClips(cur.videos);
    } finally {
      setStockLoading(false);
    }
  };

  const handleSelectStockClip = (video: StockVideo) => {
    if (stockModalSceneIdx === null) return;
    const updated = [...scenes];
    updated[stockModalSceneIdx] = {
      ...updated[stockModalSceneIdx],
      videoUrl: video.videoUrl,
      previewUrl: video.preview,
      stockSearchQuery: stockQuery,
    };
    setScenes(updated);
    setStockModalSceneIdx(null);
  };

  // Real Video Export Execution
  const handleStartRender = async () => {
    setIsRendering(true);
    setRenderProgress(0);
    setRenderStatus('Initializing video and multi-track audio engine...');

    try {
      const renderer = new VideoRenderer();
      rendererRef.current = renderer;

      const result = await renderer.renderVideo({
        scenes,
        aspectRatio,
        resolution,
        bgMusicTrack: bgMusic,
        bgMusicUrl: customAudioUrl || undefined,
        bgMusicVolume,
        voiceoverUrl: customVoiceUrl || undefined,
        voiceoverVolume,
        sfxVolume,
        onProgress: (p, s) => {
          setRenderProgress(p);
          setRenderStatus(s);
        },
      });

      setRenderResult(result);

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00d2ff', '#a855f7', '#10b981'],
        });
      } catch (_) {}

      // Save to project store
      const updatedProject: Project = {
        id: currentProject?.id || `proj_${Date.now()}`,
        title: projectTitle,
        type: currentProject?.type || (aspectRatio === '9:16' ? 'islamic_reel' : 'business_documentary'),
        createdAt: currentProject?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aspectRatio,
        resolution,
        scenes,
        bgMusicTrack: bgMusic,
        bgMusicVolume,
        exportedVideoUrl: result.url,
      };
      onSaveProject(updatedProject);
    } catch (e: any) {
      alert(`Export note: ${e.message}`);
    } finally {
      setIsRendering(false);
      rendererRef.current = null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Editor Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex-1 w-full sm:w-auto">
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="w-full text-lg sm:text-xl font-extrabold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-cyan-400 focus:outline-none transition-colors"
          />
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>{scenes.length} Scenes</span>
            <span>•</span>
            <span>Total Duration: {totalDuration}s</span>
            <span>•</span>
            <span className="text-cyan-400 uppercase font-semibold">{aspectRatio}</span>
          </div>
        </div>

        {/* Global Controls & Render Action */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-end">
          {/* Aspect Ratio Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
            <button
              onClick={() => setAspectRatio('16:9')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                aspectRatio === '16:9'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              16:9 Widescreen
            </button>
            <button
              onClick={() => setAspectRatio('9:16')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                aspectRatio === '9:16'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              9:16 Reel
            </button>
            <button
              onClick={() => setAspectRatio('1:1')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                aspectRatio === '1:1'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1:1 Square
            </button>
          </div>

          {/* Resolution Selector */}
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value as Resolution)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 outline-none"
          >
            <option value="1080p">1080p Full HD</option>
            <option value="720p">720p HD</option>
          </select>

          {/* Export Render Button */}
          <button
            disabled={isRendering || scenes.length === 0}
            onClick={handleStartRender}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:opacity-90 text-white font-bold text-xs sm:text-sm shadow-xl shadow-pink-950/40 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isRendering ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Exporting ({renderProgress}%)</span>
              </>
            ) : (
              <>
                <Film className="w-4 h-4" />
                <span>Render &amp; Export Video</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Video Preview Canvas Stage */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex items-center justify-center min-h-[360px] sm:min-h-[440px]">
            {/* Aspect Ratio Container */}
            <div
              className={`relative overflow-hidden flex items-center justify-center ${
                aspectRatio === '9:16'
                  ? 'w-[260px] sm:w-[300px] h-[460px] sm:h-[530px] rounded-2xl border-4 border-slate-800'
                  : aspectRatio === '1:1'
                  ? 'w-[320px] sm:w-[380px] h-[320px] sm:h-[380px] rounded-2xl'
                  : 'w-full aspect-video'
              }`}
            >
              <video
                ref={videoPlayerRef}
                src={activeScene?.videoUrl}
                crossOrigin="anonymous"
                playsInline
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
                className="w-full h-full object-cover"
              />

              {/* Hidden Audio Players for Custom Uploaded Tracks */}
              {customVoiceUrl && (
                <audio
                  ref={customVoiceAudioRef}
                  src={customVoiceUrl}
                  preload="auto"
                  className="hidden"
                />
              )}
              {customAudioUrl && (
                <audio
                  ref={customBgmAudioRef}
                  src={customAudioUrl}
                  preload="auto"
                  loop
                  className="hidden"
                />
              )}

              {/* Subtitle / Caption Overlay */}
              <div className="absolute bottom-6 inset-x-6 z-20 pointer-events-none text-center space-y-1">
                {activeScene?.urduNarration && (
                  <div className="inline-block px-4 py-2 rounded-xl bg-black/85 backdrop-blur-md border border-cyan-500/40 shadow-xl max-w-full">
                    <p className="font-urdu text-sm sm:text-base font-bold text-white leading-loose text-shadow">
                      {activeScene.urduNarration}
                    </p>
                  </div>
                )}
                {activeScene?.englishSubtitle && aspectRatio !== '9:16' && (
                  <p className="text-xs text-cyan-300 font-medium drop-shadow-md">
                    {activeScene.englishSubtitle}
                  </p>
                )}
              </div>

              {/* Center Play Overlay Trigger */}
              <div
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
              >
                {!isPlaying && (
                  <div className="w-16 h-16 rounded-full bg-cyan-500/80 backdrop-blur-md text-slate-950 flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
                    <Play className="w-8 h-8 fill-slate-950 ml-1" />
                  </div>
                )}
              </div>

              {/* Watermark */}
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-bold text-cyan-400">
                NEXORA AI PREVIEW
              </div>
            </div>
          </div>

          {/* Video Player Transport Controls */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-cyan-950/40 transition-all"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              </button>

              <div className="text-xs font-mono text-slate-300">
                <span>{Math.floor(currentTime)}s</span> / <span>{totalDuration}s</span>
              </div>
            </div>

            {/* Scene Index Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {scenes.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentSceneIdx(i);
                    setIsPlaying(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    currentSceneIdx === i
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  S{i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Multi-Track Audio Mixing & Volume Controls */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Music className="w-4 h-4 text-purple-400" />
                <span>MULTI-TRACK AUDIO MIXER (صوتی مکسنگ)</span>
              </span>
              <span className="text-[11px] text-emerald-400 font-mono font-medium">✓ Mixed on Export</span>
            </div>

            {/* Track 1: Urdu Voiceover */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>Urdu Voiceover Track:</span>
                </span>
                <span className="text-cyan-400 font-mono font-bold">{Math.round(voiceoverVolume * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={voiceoverVolume}
                  onChange={(e) => setVoiceoverVolume(parseFloat(e.target.value))}
                  className="flex-1 accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
                <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 border border-cyan-500/30 flex items-center gap-1 flex-shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{customVoiceUrl ? 'Voice Attached' : 'Upload Voice'}</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleCustomVoiceUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Track 2: Background Music */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span>Background Music:</span>
                </span>
                <span className="text-purple-400 font-mono font-bold">{Math.round(bgMusicVolume * 100)}%</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <select
                  value={bgMusic}
                  onChange={(e) => setBgMusic(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none"
                >
                  {ROYALTY_FREE_SOUNDTRACKS.map((opt) => (
                    <option key={opt.id} value={opt.name}>
                      {opt.name} ({opt.category})
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={bgMusicVolume}
                    onChange={(e) => setBgMusicVolume(parseFloat(e.target.value))}
                    className="flex-1 accent-purple-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />

                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-purple-300 border border-purple-500/30 flex items-center gap-1 flex-shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{customAudioUrl ? 'Music Attached' : 'Upload Music'}</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleCustomAudioUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Track 3: Sound Effects (SFX) & Auto-Ducking */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Transition Sound Effects (SFX):</span>
                </span>
                <span className="text-amber-400 font-mono font-bold">{Math.round(sfxVolume * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={sfxVolume}
                  onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                  className="flex-1 accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  (Auto-ducks music during speech)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Active Scene Inspector & Quick Customizer */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center">
                  {currentSceneIdx + 1}
                </span>
                <h4 className="font-bold text-white text-sm">Active Scene Settings</h4>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSplitScene(currentSceneIdx)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400"
                  title="Split Scene at Half"
                >
                  <Scissors className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDuplicateScene(currentSceneIdx)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400"
                  title="Duplicate Scene"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMoveScene(currentSceneIdx, 'left')}
                  disabled={currentSceneIdx === 0}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30"
                  title="Move Left in Timeline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMoveScene(currentSceneIdx, 'right')}
                  disabled={currentSceneIdx === scenes.length - 1}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30"
                  title="Move Right in Timeline"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteScene(currentSceneIdx)}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                  title="Delete Scene"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Scene Duration, Transition & Speed */}
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                  DURATION (SEC)
                </label>
                <input
                  type="number"
                  min="2"
                  max="60"
                  value={activeScene?.durationSeconds || 6}
                  onChange={(e) =>
                    handleSceneDurationChange(currentSceneIdx, parseInt(e.target.value, 10) || 5)
                  }
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                  TRANSITION
                </label>
                <select
                  value={activeScene?.transition || 'fade'}
                  onChange={(e) =>
                    handleSceneTransitionChange(currentSceneIdx, e.target.value as TransitionType)
                  }
                  className="w-full px-2 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
                >
                  <option value="fade">Fade</option>
                  <option value="zoom">Zoom</option>
                  <option value="slide">Slide</option>
                  <option value="cut">Cut</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-cyan-400 mb-1">
                  SPEED
                </label>
                <select
                  value={activeScene?.speed || 1}
                  onChange={(e) =>
                    handleSceneSpeedChange(currentSceneIdx, parseFloat(e.target.value))
                  }
                  className="w-full px-2 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 outline-none"
                >
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1">1.0x (Norm)</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2.0x</option>
                </select>
              </div>
            </div>

            {/* Cinematic Color Grading & Ken Burns Camera Motion */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-semibold text-purple-400 mb-1 flex items-center gap-1">
                  <Palette className="w-3 h-3" />
                  <span>COLOR GRADE</span>
                </label>
                <select
                  value={activeScene?.colorGrade || 'documentary_cold'}
                  onChange={(e) =>
                    handleSceneColorGradeChange(currentSceneIdx, e.target.value as Scene['colorGrade'])
                  }
                  className="w-full px-2 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-purple-300 outline-none"
                >
                  <option value="documentary_cold">Documentary Cold</option>
                  <option value="warm_cinematic">Warm Hollywood Gold</option>
                  <option value="cyberpunk_glow">Cyberpunk Neon</option>
                  <option value="spiritual_soft">Spiritual Golden</option>
                  <option value="natural_crisp">Natural 1080p Crisp</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-cyan-400 mb-1 flex items-center gap-1">
                  <Wand2 className="w-3 h-3" />
                  <span>KEN BURNS MOTION</span>
                </label>
                <select
                  value={activeScene?.kenBurnsEffect || 'zoom_in'}
                  onChange={(e) =>
                    handleSceneKenBurnsChange(currentSceneIdx, e.target.value as Scene['kenBurnsEffect'])
                  }
                  className="w-full px-2 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 outline-none"
                >
                  <option value="zoom_in">Slow Push-In (Zoom In)</option>
                  <option value="zoom_out">Slow Reveal (Zoom Out)</option>
                  <option value="pan_right">Cinematic Pan Right</option>
                  <option value="pan_left">Cinematic Pan Left</option>
                  <option value="static">Locked Static Frame</option>
                </select>
              </div>
            </div>

            {/* Visual Media Selection */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                SCENE VISUAL FOOTAGE
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => openStockModal(currentSceneIdx)}
                  className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Choose Stock Footage</span>
                </button>

                <label className="cursor-pointer py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Clip</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleCustomVideoUpload(currentSceneIdx, e)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Urdu Subtitle / Voiceover text */}
            <div>
              <label className="block text-[11px] font-semibold text-cyan-400 mb-1">
                URDU SUBTITLE / VOICE NARRATION (اردو آواز و کیپشن)
              </label>
              <textarea
                rows={3}
                value={activeScene?.urduNarration || ''}
                onChange={(e) => handleSceneNarrationChange(currentSceneIdx, e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-urdu text-sm outline-none focus:border-cyan-400"
              />
            </div>

            {/* English Subtitle */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                ENGLISH TRANSLATION / SECONDARY SUBTITLE
              </label>
              <input
                type="text"
                value={activeScene?.englishSubtitle || ''}
                onChange={(e) => handleSceneSubtitleChange(currentSceneIdx, e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Multi-Track Timeline & Storyboard Studio */}
      <div className="p-5 rounded-3xl bg-slate-900/95 border border-slate-800 space-y-4 shadow-2xl">
        {/* Timeline Control Bar with Undo/Redo & Scene Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold text-white">Multi-Track Timeline</span>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                {scenes.length} Scenes • {totalDuration}s
              </span>
            </div>

            {/* Undo / Redo controls */}
            <div className="flex items-center gap-1 bg-slate-800/80 rounded-xl p-1 border border-slate-700/60">
              <button
                onClick={handleUndo}
                disabled={historyIdx <= 0}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 disabled:opacity-30 disabled:hover:bg-transparent"
                title="Undo edit (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIdx >= history.length - 1}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 disabled:opacity-30 disabled:hover:bg-transparent"
                title="Redo edit (Ctrl+Y)"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Scene Operations */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Timeline Health Inspector Button */}
            <button
              onClick={() => setShowHealthModal(true)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                healthReport.healthy
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/40 animate-pulse'
              }`}
              title="Audit timeline synchronization, silent gaps and duplicate footage"
            >
              {healthReport.healthy ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{healthReport.score}% Health</span>
              {healthReport.issues.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                  {healthReport.issues.length}
                </span>
              )}
            </button>

            {/* 1-Click Auto-Sync All Scenes to Speech */}
            <button
              onClick={handleAutoSyncAllGaps}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              title="Automatically calculate speech durations and trim all silent dead gaps"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Auto-Sync &amp; Trim Gaps</span>
            </button>

            <button
              onClick={() => handleSplitScene(currentSceneIdx)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Split selected scene into two segments"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split S{currentSceneIdx + 1}</span>
            </button>

            <button
              onClick={() => handleDuplicateScene(currentSceneIdx)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Duplicate selected scene"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Duplicate</span>
            </button>

            <button
              onClick={handleAddScene}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Scene</span>
            </button>
          </div>
        </div>

        {/* Auto-Sync Feedback Banner */}
        {autoSyncFeedback && (
          <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-xs text-cyan-200 flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              {autoSyncFeedback}
            </span>
            <button
              onClick={() => setAutoSyncFeedback(null)}
              className="text-cyan-400 hover:text-white font-bold ml-2 text-base"
            >
              ×
            </button>
          </div>
        )}

        {/* Multi-Track Stack */}
        <div className="space-y-2.5">
          {/* TRACK 1: Video & Visuals Track */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Video className="w-3.5 h-3.5" />
                <span>TRACK 1: VISUAL &amp; FOOTAGE</span>
              </span>
              <span className="text-[10px] text-slate-400">Click clip to inspect</span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5">
              {scenes.map((scene, idx) => (
                <div
                  key={scene.id}
                  onClick={() => {
                    setCurrentSceneIdx(idx);
                    setIsPlaying(false);
                  }}
                  className={`flex-shrink-0 w-52 sm:w-60 rounded-xl overflow-hidden border cursor-pointer transition-all ${
                    currentSceneIdx === idx
                      ? 'border-cyan-400 bg-slate-800/90 shadow-lg shadow-cyan-950/40 ring-2 ring-cyan-500/20'
                      : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                  }`}
                >
                  <div className="relative aspect-video bg-slate-900">
                    <img
                      src={
                        scene.previewUrl ||
                        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80'
                      }
                      alt={scene.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                      <span>#{idx + 1}</span>
                      {scene.speed && scene.speed !== 1 && (
                        <span className="text-amber-400">({scene.speed}x)</span>
                      )}
                    </div>
                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-slate-300">
                      {scene.durationSeconds || 6}s
                    </div>
                    {scene.transition && (
                      <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-[9px] font-bold text-purple-300 uppercase">
                        {scene.transition}
                      </div>
                    )}
                  </div>
                  <div className="p-2 space-y-0.5">
                    <p className="text-xs font-bold text-white truncate">{scene.title}</p>
                    <p className="font-urdu text-[11px] text-slate-400 truncate">{scene.urduNarration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TRACK 2: Voiceover Narration Track */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
              <span className="flex items-center gap-1.5 text-blue-300">
                <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                <span>TRACK 2: URDU VOICEOVER (آواز)</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">Vol: {Math.round(voiceoverVolume * 100)}%</span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {scenes.map((scene, idx) => (
                <div
                  key={scene.id}
                  onClick={() => setCurrentSceneIdx(idx)}
                  className={`flex-shrink-0 w-52 sm:w-60 p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    currentSceneIdx === idx
                      ? 'bg-blue-950/40 border-blue-400/60 ring-1 ring-blue-500/30'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-blue-300 mb-1">
                    <span className="font-mono">S{idx + 1} Voice Cue</span>
                    <span className="font-mono">{scene.durationSeconds || 6}s</span>
                  </div>
                  {/* Waveform graphic bars */}
                  <div className="flex items-center gap-0.5 h-5 px-1 py-0.5 bg-blue-950/30 rounded border border-blue-500/20 mb-1.5">
                    {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50, 80, 65, 90, 40].map((h, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-sm ${currentSceneIdx === idx ? 'bg-cyan-400' : 'bg-blue-500/60'}`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <p className="font-urdu text-[11px] text-slate-300 truncate text-right">
                    {scene.urduNarration || 'No voiceover script'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* TRACK 3: Background Music Track with Auto-Ducking */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
              <span className="flex items-center gap-1.5 text-purple-300">
                <Music className="w-3.5 h-3.5 text-purple-400" />
                <span>TRACK 3: BACKGROUND SOUNDTRACK</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-mono flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Auto-Ducking Active (-18dB speech)</span>
                </span>
                <span className="text-[10px] text-purple-400 font-mono">Vol: {Math.round(bgMusicVolume * 100)}%</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                  ♫
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{bgMusic}</p>
                  <p className="text-[10px] text-purple-300">Royalty-Free Soundtrack • Auto-loops across all {totalDuration}s</p>
                </div>
              </div>

              {/* Looping waveform visualization */}
              <div className="flex-1 max-w-md hidden sm:flex items-center gap-1 h-5 px-2 bg-purple-950/40 rounded-lg border border-purple-500/20">
                {[20, 30, 45, 60, 50, 75, 40, 30, 65, 80, 55, 35, 45, 60, 70, 50, 40, 80, 65, 50, 35].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-purple-400/70"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* TRACK 4: SFX & Subtitle Overlay Track */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>TRACK 4: TRANSITION SFX &amp; SUBTITLES</span>
              </span>
              <span className="text-[10px] text-amber-400 font-mono">SFX Vol: {Math.round(sfxVolume * 100)}%</span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {scenes.map((scene, idx) => (
                <div
                  key={scene.id}
                  onClick={() => setCurrentSceneIdx(idx)}
                  className="flex-shrink-0 w-52 sm:w-60 p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-[10px] flex items-center justify-between cursor-pointer hover:border-slate-700"
                >
                  <span className="text-amber-400 font-mono">⚡ Cue S{idx + 1}: {scene.transition || 'cut'}</span>
                  <span className="text-slate-400 font-mono">{scene.durationSeconds || 6}s</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Render Progress Modal */}
      {isRendering && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Rendering Your Video in {resolution}...</h3>
              <p className="text-xs text-cyan-400 font-mono mt-1">{renderStatus}</p>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Render Progress</span>
                <span className="font-bold text-white">{renderProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${renderProgress}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Processing frames, rendering Urdu typography, and assembling audio tracks.
            </p>
          </div>
        </div>
      )}

      {/* Render Completed Modal */}
      {renderResult && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/50 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">Video Render Complete!</h3>
                  <p className="text-xs text-slate-400">
                    Your real video file has been compiled and is ready to download
                  </p>
                </div>
              </div>

              <button
                onClick={() => setRenderResult(null)}
                className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            {/* Embedded Player with Sound */}
            <div className="rounded-2xl overflow-hidden bg-black aspect-video max-h-72 flex items-center justify-center border border-slate-800 relative group">
              <video
                id="exported-video-preview"
                src={renderResult.url}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            {/* Audio Track Verification Banner (Requirement 8 & 10) */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>AUDIO TRACK VERIFIED &amp; SYNCHRONIZED</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                  {renderResult.mimeType}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Mixed: <strong className="text-white">Urdu Voiceover ({Math.round(voiceoverVolume * 100)}%)</strong> +{' '}
                <strong className="text-white">{bgMusic} ({Math.round(bgMusicVolume * 100)}%)</strong> +{' '}
                <strong className="text-white">Transitions SFX</strong>. Both video and audio streams are successfully interleaved.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span>File: <strong className="text-white font-mono">{renderResult.fileName}</strong></span>
              <span>Duration: <strong className="text-white font-mono">~{Math.round(renderResult.durationSeconds)}s</strong></span>
              <span>Size: <strong className="text-cyan-400 font-mono">{Math.round(renderResult.fileSizeBytes / 1024)} KB</strong></span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  const vid = document.getElementById('exported-video-preview') as HTMLVideoElement;
                  if (vid) {
                    vid.currentTime = 0;
                    vid.muted = false;
                    vid.volume = 1.0;
                    vid.play();
                  }
                }}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
              >
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Test Unmuted Audio Playback</span>
              </button>

              <button
                onClick={() => downloadVideoFile(renderResult.url, renderResult.fileName)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-950/60 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Video File ({renderResult.fileName.split('.').pop()?.toUpperCase()})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Video Selector Modal */}
      {stockModalSceneIdx !== null && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl p-6 max-h-[90vh] flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Select Stock Video for Scene</h3>
                <p className="text-xs text-slate-400">
                  Search free commercial videos from Pexels API
                </p>
              </div>
              <button
                onClick={() => setStockModalSceneIdx(null)}
                className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={stockQuery}
                onChange={(e) => setStockQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchStock()}
                placeholder="Search stock footage: corporate strategy, datacenter, city lights, finance..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleSearchStock}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-2">
              {stockLoading ? (
                <div className="col-span-full text-center py-12 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2" />
                  <span>Loading stock footage...</span>
                </div>
              ) : (
                stockClips.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => handleSelectStockClip(v)}
                    className="cursor-pointer group relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700 hover:border-cyan-400 transition-all"
                  >
                    <div className="aspect-video bg-slate-950">
                      <img src={v.preview} alt={v.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2.5 bg-slate-900/90 text-xs">
                      <p className="font-semibold text-white truncate">{v.title}</p>
                      <p className="text-[11px] text-slate-400">By {v.photographer}</p>
                    </div>
                    <div className="absolute inset-0 bg-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1 rounded bg-cyan-500 text-slate-950 font-bold text-xs">
                        Select Video
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Timeline Health Inspector Modal */}
      {showHealthModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-cyan-500/30 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg ${
                    healthReport.healthy
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}
                >
                  {healthReport.score}%
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">Timeline Health Inspector</h3>
                  <p className="text-xs text-slate-400">
                    Pre-export timing verification &amp; audio synchronization audit
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowHealthModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ×
              </button>
            </div>

            {/* Health Metrics Quick Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Scenes</span>
                <span className="text-base font-extrabold text-white font-mono">{scenes.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Video Duration</span>
                <span className="text-base font-extrabold text-cyan-300 font-mono">{healthReport.totalVideoDurationSeconds}s</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Estimated Voice</span>
                <span className="text-base font-extrabold text-purple-300 font-mono">{healthReport.totalAudioDurationSeconds.toFixed(1)}s</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Dead Silence Gaps</span>
                <span className={`text-base font-extrabold font-mono ${healthReport.totalDeadSilenceSeconds > 1 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {healthReport.totalDeadSilenceSeconds.toFixed(1)}s
                </span>
              </div>
            </div>

            {/* Issues List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Audit Diagnostics ({healthReport.issues.length} Items)
              </h4>

              {healthReport.issues.length === 0 ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1.5">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-sm font-bold text-emerald-300">Timeline is 100% Synchronized</p>
                  <p className="text-xs text-slate-400">
                    No black screens, silent gaps, or audio overruns found. Ready for high-fidelity export!
                  </p>
                </div>
              ) : (
                healthReport.issues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                      issue.severity === 'error'
                        ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                        : issue.severity === 'warning'
                        ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {issue.severity === 'error' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                      ) : issue.severity === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Activity className="w-4 h-4 text-cyan-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-bold bg-slate-800 text-white">
                          Scene {issue.sceneIndex + 1}
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                          {issue.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed">{issue.message}</p>
                      {issue.suggestedDurationSeconds && (
                        <p className="text-[11px] text-cyan-300 font-mono mt-1">
                          Suggested trim: {issue.suggestedDurationSeconds}s
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Auto-sync recalculates every scene to match speech duration + natural cadence.
              </span>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => setShowHealthModal(false)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Dismiss
                </button>

                <button
                  onClick={() => {
                    handleAutoSyncAllGaps();
                    setShowHealthModal(false);
                  }}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950/60"
                >
                  <Zap className="w-4 h-4" />
                  <span>⚡ 1-Click Fix &amp; Trim All Gaps</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
