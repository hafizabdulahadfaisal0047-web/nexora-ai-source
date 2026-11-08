import React, { useState, useRef } from 'react';
import {
  Moon,
  Sparkles,
  Upload,
  Play,
  Pause,
  Film,
  Volume2,
  Share2,
  Clock,
  ShieldCheck,
  Check,
  Copy,
  RefreshCw,
  Sliders,
  ArrowRight,
  Heart,
  MessageCircle,
  Bookmark,
  Send,
  Video,
  Download,
} from 'lucide-react';
import { IslamicReelPlan, Project, Scene } from '../types';
import { generateIslamicReel, getCuratedVideos } from '../services/api';
import { UrduVoiceService } from '../services/audioSynthesizer';
import { VideoRenderer, downloadVideoFile } from '../services/videoRenderer';

interface IslamicReelsStudioProps {
  onLoadIntoEditor: (project: Project) => void;
  onSaveProject: (project: Project) => void;
}

const AUTHENTIC_TOPICS = [
  {
    topic: 'صبر اور آزمائش پر صبر کی فضیلت',
    ref: 'سورۃ البقرۃ: 153 - إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
  },
  {
    topic: 'اللہ پر توکل اور ہر مشکل کا حل',
    ref: 'سورۃ الطلاق: 3 - وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
  },
  {
    topic: 'نمازِ تہجد اور دعاؤں کی قبولیت',
    ref: 'سورۃ الاسراء: 79 - وَمِنَ اللَّيْلِ فَتَهَجَّدْ بِهِ',
  },
  {
    topic: 'استغفار اور اللہ کی بے پایاں رحمت',
    ref: 'سورۃ الزمر: 53 - لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ',
  },
  {
    topic: 'والدین کے ساتھ حسنِ سلوک اور ادب',
    ref: 'سورۃ الاسراء: 23 - وَبِالْوَالِدَيْنِ إِحْسَانًا',
  },
];

export const IslamicReelsStudio: React.FC<IslamicReelsStudioProps> = ({
  onLoadIntoEditor,
  onSaveProject,
}) => {
  const [topic, setTopic] = useState('');
  const [voiceoverType, setVoiceoverType] = useState('calm_spiritual');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<IslamicReelPlan | null>(null);

  // Upload custom media
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [uploadedVoiceUrl, setUploadedVoiceUrl] = useState<string | null>(null);
  const [audioOffset, setAudioOffset] = useState<number>(0.5); // seconds
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // 9:16 Vertical Phone Player preview state
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceService] = useState(() => new UrduVoiceService());
  const phoneVideoRef = useRef<HTMLVideoElement>(null);
  const uploadedVoiceAudioRef = useRef<HTMLAudioElement | null>(null);

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState('');
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);

  const handleGenerate = async (selectedTopic?: string) => {
    const query = selectedTopic || topic;
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await generateIslamicReel(query, voiceoverType);
      const generatedPlan = res.data;

      // Enhance scenes with curated Islamic visuals
      const stockRes = await getCuratedVideos('islamic');
      const visuals = stockRes.videos;

      const enhancedScenes = generatedPlan.scenes.map((scene, idx) => {
        const visual = visuals[idx % visuals.length];
        return {
          ...scene,
          videoUrl: visual?.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
          previewUrl:
            visual?.preview ||
            'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80',
        };
      });

      generatedPlan.scenes = enhancedScenes as any;
      setPlan(generatedPlan);
      setCurrentSceneIdx(0);
    } catch (e: any) {
      alert(`Generation notice: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedVideoUrl(url);
    }
  };

  const handleCustomVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedVoiceUrl(url);
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      phoneVideoRef.current?.pause();
      voiceService.stop();
      if (uploadedVoiceAudioRef.current) {
        uploadedVoiceAudioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      phoneVideoRef.current?.play().catch(() => {});
      if (uploadedVoiceUrl && uploadedVoiceAudioRef.current) {
        uploadedVoiceAudioRef.current.currentTime = audioOffset;
        uploadedVoiceAudioRef.current.play().catch(() => {});
      } else if (activeScene?.urduCaption) {
        voiceService.speak(activeScene.urduCaption, {
          rate: 0.88,
          pitch: 0.95,
          onEnd: () => {},
        });
      }
      setIsPlaying(true);
    }
  };

  const handleRenderReel = async () => {
    if (!plan && !uploadedVideoUrl) return;

    setIsExporting(true);
    setExportProgress(0);
    setExportStatus('Preparing 9:16 vertical video renderer...');

    try {
      const renderer = new VideoRenderer();
      const scenesToRender: Scene[] = plan?.scenes.map((s, idx) => ({
        id: `reel_sc_${idx}`,
        sceneNumber: s.sceneNumber,
        title: `Part ${idx + 1}`,
        visualDescription: s.visualDescription,
        stockSearchQuery: s.stockSearchQuery,
        videoUrl: uploadedVideoUrl || (s as any).videoUrl,
        previewUrl: (s as any).previewUrl,
        urduNarration: s.urduCaption,
        englishSubtitle: '',
        durationSeconds: s.durationSeconds || 8,
        transition: 'fade',
      })) || [
        {
          id: 'custom_1',
          sceneNumber: 1,
          title: 'Islamic Reel',
          visualDescription: 'Uploaded Video',
          stockSearchQuery: '',
          videoUrl: uploadedVideoUrl!,
          previewUrl: '',
          urduNarration: topic || 'یا اللہ ہمارے دلوں کو سکون عطا فرما',
          englishSubtitle: '',
          durationSeconds: 15,
          transition: 'fade',
        },
      ];

      const result = await renderer.renderVideo({
        scenes: scenesToRender,
        aspectRatio: '9:16',
        resolution: '1080p',
        bgMusicTrack: 'Peaceful Spiritual Ambient Drone',
        bgMusicVolume: 0.25,
        voiceoverUrl: uploadedVoiceUrl || undefined,
        voiceoverVolume: 0.95,
        sfxVolume: 0.35,
        onProgress: (p, s) => {
          setExportProgress(p);
          setExportStatus(s);
        },
      });

      setExportedUrl(result.url);

      // Save project
      const proj: Project = {
        id: `reel_${Date.now()}`,
        title: plan?.title || 'Islamic 9:16 Reel',
        type: 'islamic_reel',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aspectRatio: '9:16',
        resolution: '1080p',
        scenes: scenesToRender,
        exportedVideoUrl: result.url,
      };
      onSaveProject(proj);
    } catch (e: any) {
      alert(`Export notice: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const activeScene = plan?.scenes[currentSceneIdx];

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Authentic Citations Mandate Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-300 uppercase tracking-wide">
              Strict Verification Mandate
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
              Quran &amp; Sahih Hadith Only
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            NEXORA AI adheres to authentic scholarly sources. Quranic verses and Hadith references are strictly
            cited with Surah name, Ayah number, or verified collections (Bukhari/Muslim). No fabricated texts.
          </p>
        </div>
      </div>

      {/* Main Studio Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#081816] via-[#091b1d] to-[#0d1526] border border-emerald-500/20 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2">
          <Moon className="w-4 h-4" />
          <span>VERTICAL ISLAMIC REELS (9:16)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Islamic Reels &amp; Short Studio
        </h2>
        <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
          Produce viral 9:16 spiritual reminders, Quran recitations, and wisdom reels. Features
          Urdu Nastaliq subtitles, cinematic pacing, voice-sync, and vertical export for Instagram, TikTok, and YouTube Shorts.
        </p>

        {/* Form Controls */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              REEL TOPIC OR HADITH / QURAN THEME
            </label>
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Sabr during hardships, Tahajjud prayers, or Surah Al-Inshirah reflection"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 text-white placeholder-slate-500 text-sm outline-none transition-all"
              />
              <button
                disabled={loading || !topic.trim()}
                onClick={() => handleGenerate()}
                className="absolute right-2 top-2 bottom-2 px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/60 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Reel</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Authentic Topic Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400">
              Verified Themes (مستند قرآنی موضوعات):
            </span>
            <div className="flex flex-wrap gap-2">
              {AUTHENTIC_TOPICS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTopic(item.topic);
                    handleGenerate(item.topic);
                  }}
                  className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-emerald-300 hover:text-white border border-emerald-500/20 transition-all flex items-center gap-1.5"
                >
                  <span className="font-urdu">{item.topic}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Custom Video & Voiceover Section */}
          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-dashed border-slate-700 hover:border-emerald-500/50 transition-colors">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Upload Custom 9:16 Video</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Upload your own mobile video, drone shot, or background clip (.mp4)
              </p>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-emerald-300 border border-emerald-500/30 transition-all">
                <Video className="w-3.5 h-3.5" />
                <span>{uploadedVideoUrl ? 'Replace Video' : 'Choose Video File'}</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleCustomVideoUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-dashed border-slate-700 hover:border-emerald-500/50 transition-colors">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Upload Custom Bayan Voiceover</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Upload a recitation or scholar voiceover track (.mp3 / .wav / .m4a)
              </p>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-300 border border-cyan-500/30 transition-all">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadedVoiceUrl ? 'Replace Voice Audio' : 'Choose Audio File'}</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleCustomVoiceUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Reel Studio Interactive Workspace */}
      {(plan || uploadedVideoUrl) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: 9:16 Vertical Smartphone Interactive Mockup Player */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="sticky top-20">
              <div className="w-[300px] sm:w-[340px] h-[580px] sm:h-[640px] bg-black rounded-[42px] border-[6px] border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
                {/* Phone Top Notch */}
                <div className="absolute top-0 inset-x-0 h-6 bg-transparent z-30 flex justify-center items-center pointer-events-none">
                  <div className="w-24 h-4 bg-slate-800 rounded-b-xl" />
                </div>

                {/* Video Playback Canvas */}
                <div className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
                  <video
                    ref={phoneVideoRef}
                    src={
                      uploadedVideoUrl ||
                      (activeScene as any)?.videoUrl ||
                      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
                    }
                    playsInline
                    loop
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                  />

                  {uploadedVoiceUrl && (
                    <audio
                      ref={uploadedVoiceAudioRef}
                      src={uploadedVoiceUrl}
                      preload="auto"
                      className="hidden"
                    />
                  )}

                  {/* Dark Vignette & Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none" />

                  {/* Right Social Actions Simulation */}
                  <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4 text-white z-20">
                    <button className="flex flex-col items-center gap-1 group">
                      <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                      </div>
                      <span className="text-[10px] font-bold">142K</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 group">
                      <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[10px] font-bold">1.8K</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 group">
                      <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Bookmark className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[10px] font-bold">34K</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 group">
                      <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Send className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[10px] font-bold">Share</span>
                    </button>
                  </div>

                  {/* Animated Urdu Nastaliq Subtitle Overlay */}
                  <div className="absolute bottom-16 inset-x-4 z-20 space-y-2 pointer-events-none">
                    <div className="p-3.5 rounded-2xl bg-black/80 backdrop-blur-md border border-emerald-500/40 text-center shadow-2xl">
                      <p className="font-urdu text-lg sm:text-xl font-bold text-white leading-loose text-shadow">
                        {activeScene?.urduCaption ||
                          plan?.authenticReference?.urduMeaning ||
                          'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ ہر مشکل کے ساتھ آسانی ہے'}
                      </p>
                    </div>

                    {plan?.authenticReference && (
                      <div className="text-center">
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                          {plan.authenticReference.reference}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Center Play / Pause Click Overlay */}
                  <div
                    onClick={togglePlayback}
                    className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
                  >
                    {!isPlaying && (
                      <div className="w-14 h-14 rounded-full bg-emerald-500/80 backdrop-blur-md text-white flex items-center justify-center shadow-xl">
                        <Play className="w-7 h-7 fill-white ml-1" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Timeline Indicator */}
                <div className="p-3 bg-black/90 flex items-center justify-between text-xs text-slate-400 z-30">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePlayback}
                      className="p-1 rounded bg-slate-800 text-emerald-400 hover:text-white"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <span className="text-[11px] font-mono">
                      Scene {currentSceneIdx + 1}/{plan?.scenes.length || 1}
                    </span>
                  </div>

                  {/* Scene Switchers */}
                  {plan && plan.scenes.length > 1 && (
                    <div className="flex items-center gap-1">
                      {plan.scenes.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setCurrentSceneIdx(i);
                            setIsPlaying(false);
                          }}
                          className={`w-2.5 h-2.5 rounded-full transition-all ${
                            i === currentSceneIdx ? 'bg-emerald-400 scale-125' : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Render 9:16 Action Button */}
              <div className="mt-4 w-full">
                <button
                  disabled={isExporting}
                  onClick={handleRenderReel}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{exportProgress}% • {exportStatus}</span>
                    </>
                  ) : (
                    <>
                      <Film className="w-4 h-4" />
                      <span>Render &amp; Export 9:16 MP4 Reel</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Authentic Citations, Voice Sync, Scene Breakdown & Social SEO */}
          <div className="lg:col-span-7 space-y-6">
            {/* Authentic Citation Card */}
            {plan?.authenticReference && (
              <div className="p-6 rounded-2xl bg-[#091b19] border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> AUTHENTIC CITATION (مستند حوالہ)
                  </span>
                  <span className="font-mono text-[11px]">{plan.authenticReference.reference}</span>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/20 text-center space-y-2">
                  <p className="font-urdu text-xl font-bold text-emerald-200 leading-loose">
                    {plan.authenticReference.arabicText}
                  </p>
                  <p className="font-urdu text-base text-white/90 leading-relaxed">
                    {plan.authenticReference.urduMeaning}
                  </p>
                </div>
              </div>
            )}

            {/* Voice & Video Synchronization Controls */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>VOICE &amp; VIDEO SYNCHRONIZATION</span>
                </span>
                <span className="text-emerald-400 font-mono">+{audioOffset.toFixed(1)}s offset</span>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span>Voiceover Start Offset:</span>
                  <span>(Allows cinematic opening before speech begins)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={audioOffset}
                  onChange={(e) => setAudioOffset(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {plan?.audioDirection && (
                <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-800">
                  <p>
                    <span className="font-semibold text-slate-300">Audio Pacing:</span>{' '}
                    {plan.audioDirection.voicePacing}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-300">Background Mood:</span>{' '}
                    {plan.audioDirection.soundtrackSuggestion}
                  </p>
                </div>
              )}
            </div>

            {/* Scene-by-Scene Reel Breakdown */}
            {plan?.scenes && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center justify-between">
                  <span>Scene Sequence ({plan.scenes.length} Scenes)</span>
                  <span className="text-xs text-slate-400">Click a scene to preview</span>
                </h4>

                <div className="space-y-3">
                  {plan.scenes.map((scene, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setCurrentSceneIdx(idx);
                        setIsPlaying(false);
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        currentSceneIdx === idx
                          ? 'bg-emerald-950/30 border-emerald-500/50 shadow-lg'
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-emerald-400">
                          Scene {scene.sceneNumber || idx + 1}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {scene.durationSeconds || 8}s • {scene.cinematicTransition}
                        </span>
                      </div>

                      <p className="font-urdu text-base text-white leading-loose">{scene.urduCaption}</p>
                      <p className="text-xs text-slate-400 mt-1 italic">{scene.visualDescription}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social SEO & Viral Caption */}
            {plan?.socialSeo && (
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-emerald-400" />
                    <span>INSTAGRAM &amp; TIKTOK VIRAL METADATA</span>
                  </span>
                  <button
                    onClick={() =>
                      handleCopyText(
                        `${plan.socialSeo.caption}\n\n${plan.socialSeo.hashtags.join(' ')}`,
                        'social'
                      )
                    }
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    {copiedKey === 'social' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Full Caption</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400">HIGH-CTR HOOK LINES:</span>
                  <div className="space-y-1">
                    {plan.socialSeo.hooks?.map((hook, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-slate-950 text-xs text-slate-200 border border-slate-800"
                      >
                        {hook}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {plan.socialSeo.hashtags?.map((hash, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                      {hash}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export Completed Dialog with Audio Verification */}
      {exportedUrl && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/90 to-slate-900 border border-emerald-500/50 space-y-4 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-400" />
                <span>9:16 Reel Exported with Verified Audio!</span>
              </h4>
              <p className="text-xs text-slate-300">
                Interleaved with Urdu voiceover narration, peaceful spiritual ambient soundtrack, and transitions SFX.
              </p>
            </div>

            <button
              onClick={() => downloadVideoFile(exportedUrl, `islamic_reel_${Date.now()}.webm`)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download 9:16 Video</span>
            </button>
          </div>

          {/* Embedded Audio/Video Player */}
          <div className="rounded-2xl overflow-hidden bg-black max-w-sm mx-auto aspect-[9/16] max-h-80 flex items-center justify-center border border-slate-800">
            <video
              src={exportedUrl}
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
