import React, { useState } from 'react';
import {
  Film,
  Sparkles,
  Zap,
  Play,
  CheckCircle2,
  RefreshCw,
  Search,
  Music,
  Type,
  TrendingUp,
  Image as ImageIcon,
  ArrowRight,
  ShieldCheck,
  Check,
  Sliders,
} from 'lucide-react';
import { AspectRatio, Project, Resolution, Scene, VideoLanguage } from '../types';
import { generateTopicToVideo, searchStockVideos, getCuratedVideos } from '../services/api';

interface CompleteVideoMakerStudioProps {
  onLoadIntoEditor: (project: Project) => void;
  onSaveProject: (project: Project) => void;
  customPexelsKey?: string;
}

const TOPIC_TEMPLATES = [
  { topic: 'How NVIDIA Conquered the Global AI Microchip Monopoly', lang: 'urdu' as VideoLanguage, aspect: '16:9' as AspectRatio },
  { topic: 'The Science of High Performance & Deep Sleep Mastery', lang: 'english' as VideoLanguage, aspect: '9:16' as AspectRatio },
  { topic: 'Surah Al-Waqiah: The Wealth of Faith & Provision', lang: 'urdu' as VideoLanguage, aspect: '9:16' as AspectRatio },
  { topic: 'Why Modern Electric Vehicles Are Crashing Used Car Markets', lang: 'roman_urdu' as VideoLanguage, aspect: '16:9' as AspectRatio },
];

export const CompleteVideoMakerStudio: React.FC<CompleteVideoMakerStudioProps> = ({
  onLoadIntoEditor,
  onSaveProject,
  customPexelsKey,
}) => {
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState<VideoLanguage>('urdu');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [durationMinutes, setDurationMinutes] = useState<number>(2);
  const [tone, setTone] = useState('Cinematic, Investigative and Gripping');

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepsLog, setStepsLog] = useState<string[]>([]);
  const [generatedProject, setGeneratedProject] = useState<Project | null>(null);

  const STEPS_DESCRIPTION = [
    '1. Topic Understanding & Semantic Extraction',
    '2. Factual Research & Context Verification',
    '3. Engineering High-Retention Hook Angle',
    '4. Writing Multi-Section Script in Chosen Language',
    '5. Structuring Logical Scene Sequences',
    '6. Fetching Matched HD Stock B-Roll via Pexels',
    '7. Generating Narration Cadence & Voice Tracks',
    '8. Matching Category Soundtrack & Ducking Level',
    '9. Generating Synchronized Subtitles',
    '10. Assembling Multi-Track Timeline Matrix',
    '11. Creating 4K Thumbnail Visual Concept',
    '12. Generating YouTube SEO Titles & Metadata',
  ];

  const handleGenerateCompleteVideo = async (targetTopic?: string, targetLang?: VideoLanguage, targetAspect?: AspectRatio) => {
    const activeTopic = targetTopic || topic;
    const activeLang = targetLang || language;
    const activeAspect = targetAspect || aspectRatio;
    if (!activeTopic.trim()) return;

    setLoading(true);
    setStepsLog([]);
    setGeneratedProject(null);

    try {
      // Step progression simulation for user visual feedback
      for (let s = 1; s <= 4; s++) {
        setCurrentStep(s);
        setStepsLog((prev) => [...prev, STEPS_DESCRIPTION[s - 1]]);
        await new Promise((r) => setTimeout(r, 450));
      }

      const res = await generateTopicToVideo({
        topic: activeTopic,
        language: activeLang,
        aspectRatio: activeAspect,
        durationMinutes,
        tone,
      });

      const plan = res.data;

      for (let s = 5; s <= 8; s++) {
        setCurrentStep(s);
        setStepsLog((prev) => [...prev, STEPS_DESCRIPTION[s - 1]]);
        await new Promise((r) => setTimeout(r, 350));
      }

      // Fetch stock videos for each scene
      const rawScenes = plan.scenes || [];
      const enrichedScenes: Scene[] = await Promise.all(
        rawScenes.map(async (sc: any, idx: number) => {
          const query = sc.stockSearchQuery || 'technology corporate business';
          try {
            const orientation = activeAspect === '9:16' ? 'portrait' : 'landscape';
            const stock = await searchStockVideos(query, orientation, 3, customPexelsKey);
            const chosen = stock.videos[0];
            return {
              id: `scene_${Date.now()}_${idx}`,
              sceneNumber: idx + 1,
              title: sc.title || `Scene ${idx + 1}`,
              visualDescription: sc.visualDescription || query,
              stockSearchQuery: query,
              videoUrl: chosen?.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              previewUrl: chosen?.preview || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
              urduNarration: sc.urduNarration || sc.title || '',
              englishSubtitle: sc.englishSubtitle || '',
              durationSeconds: sc.durationSeconds || 6,
              transition: sc.transition || 'fade',
              soundEffect: sc.soundEffect || 'whoosh',
            };
          } catch {
            return {
              id: `scene_${Date.now()}_${idx}`,
              sceneNumber: idx + 1,
              title: sc.title || `Scene ${idx + 1}`,
              visualDescription: sc.visualDescription || query,
              stockSearchQuery: query,
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              previewUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
              urduNarration: sc.urduNarration || sc.title || '',
              englishSubtitle: sc.englishSubtitle || '',
              durationSeconds: sc.durationSeconds || 6,
              transition: sc.transition || 'fade',
              soundEffect: sc.soundEffect || 'whoosh',
            };
          }
        })
      );

      for (let s = 9; s <= 12; s++) {
        setCurrentStep(s);
        setStepsLog((prev) => [...prev, STEPS_DESCRIPTION[s - 1]]);
        await new Promise((r) => setTimeout(r, 250));
      }

      const finalProject: Project = {
        id: `project_auto_${Date.now()}`,
        title: plan.youtubeSeo?.titles?.[0] || activeTopic,
        type: 'topic_to_video',
        primaryLanguage: activeLang,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aspectRatio: activeAspect,
        resolution: '1080p',
        scenes: enrichedScenes,
        bgMusicTrack: plan.musicRecommendation?.trackStyle || 'The Investigator\'s Ledger',
        bgMusicVolume: 0.35,
        youtubeSeo: plan.youtubeSeo,
        scriptData: plan,
      };

      setGeneratedProject(finalProject);
      onSaveProject(finalProject);
    } catch (err: any) {
      alert(`Topic-to-Video note: ${err.message || 'Generation error'}`);
    } finally {
      setLoading(false);
    }
  };

  const isRTL = language === 'urdu' || language === 'arabic';

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-purple-950/60 border border-cyan-500/30 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>12-STEP TOPIC-TO-VIDEO INTELLIGENCE (مکمل خودکار ویڈیو تخلیق)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            One Topic. 12 Automated Production Steps. A Complete Video.
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Enter any thesis or question. NEXORA AI analyzes the topic, conducts factual research, generates hooks, writes the script strictly in your chosen language, matches Pexels HD B-roll, tunes background music, synchronizes subtitles, and prepares an export-ready timeline.
          </p>
        </div>
      </div>

      {/* Main Topic Input Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
            ENTER TOPIC, QUESTION OR CASE STUDY
          </label>
          <div className="relative">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Why NVIDIA Built an Unbeatable $3 Trillion AI Monopoly"
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-700/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-slate-500 text-sm outline-none transition-all"
            />

            <button
              disabled={loading || !topic.trim()}
              onClick={() => handleGenerateCompleteVideo()}
              className="absolute right-2 top-2 bottom-2 px-5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:opacity-90 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950/40 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing 12 Steps...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Generate Complete Video</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Demo Templates */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold mr-1">Quick Demos:</span>
          {TOPIC_TEMPLATES.map((t, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTopic(t.topic);
                setLanguage(t.lang);
                setAspectRatio(t.aspect);
                handleGenerateCompleteVideo(t.topic, t.lang, t.aspect);
              }}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
            >
              {t.topic}
            </button>
          ))}
        </div>

        {/* Configuration Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">
              PRIMARY LANGUAGE
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as VideoLanguage)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-cyan-400 outline-none"
            >
              <option value="urdu">اردو (Urdu)</option>
              <option value="english">English</option>
              <option value="roman_urdu">Roman Urdu</option>
              <option value="arabic">العربية (Arabic)</option>
              <option value="hindi">हिन्दी (Hindi)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">
              ASPECT RATIO
            </label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 outline-none"
            >
              <option value="16:9">16:9 Widescreen (YouTube Long)</option>
              <option value="9:16">9:16 Vertical (Shorts / Reels / TikTok)</option>
              <option value="1:1">1:1 Square (Instagram / LinkedIn)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">
              TARGET DURATION
            </label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 outline-none"
            >
              <option value={1}>1 Minute (Fast Teaser)</option>
              <option value={2}>2 Minutes (Standard Explainer)</option>
              <option value={3}>3 Minutes (Documentary Short)</option>
              <option value={5}>5 Minutes (Full Case Study)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">
              TONE &amp; CADENCE
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 outline-none"
            >
              <option value="Cinematic, Investigative and Gripping">Investigative Documentary</option>
              <option value="Fast-paced and high energy">Fast-Paced High Energy</option>
              <option value="Calm, spiritual and contemplative">Spiritual &amp; Contemplative</option>
              <option value="Analytical and business focused">Corporate &amp; Analytical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Progress & 12-Step Status Display */}
      {loading && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold text-cyan-400">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Executing Production Pipeline ({currentStep}/12)...</span>
            </span>
            <span className="font-mono">{Math.round((currentStep / 12) * 100)}%</span>
          </div>

          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-cyan-500 to-purple-600 h-full transition-all duration-300"
              style={{ width: `${(currentStep / 12) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
            {STEPS_DESCRIPTION.map((step, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-xl text-[11px] flex items-center gap-2 border ${
                  idx < currentStep
                    ? 'bg-emerald-950/20 text-emerald-300 border-emerald-500/30'
                    : idx === currentStep - 1
                    ? 'bg-cyan-950/30 text-cyan-300 border-cyan-500/40 animate-pulse'
                    : 'bg-slate-950 text-slate-500 border-slate-800'
                }`}
              >
                {idx < currentStep ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />
                )}
                <span className="truncate">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Complete Video Package */}
      {generatedProject && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-emerald-500/30 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> 12-STEP PRODUCTION READY
              </span>
              <h2 className="text-xl font-extrabold text-white mt-1">{generatedProject.title}</h2>
              <p className="text-xs text-slate-400 mt-1">
                {generatedProject.scenes.length} Scenes • {generatedProject.aspectRatio} • {(generatedProject.primaryLanguage || 'urdu').toUpperCase()} • Music: {generatedProject.bgMusicTrack}
              </p>
            </div>

            <button
              onClick={() => onLoadIntoEditor(generatedProject)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:opacity-90 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-purple-950/50 transition-all"
            >
              <Film className="w-4 h-4" />
              <span>Open in Multi-Track Video Editor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Scene Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {generatedProject.scenes.map((scene, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-black/50 border border-slate-800 space-y-3">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950">
                  <img
                    src={scene.previewUrl}
                    alt={scene.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-bold text-cyan-400">
                    S{idx + 1} • {scene.durationSeconds}s
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white truncate">{scene.title}</h4>
                  <p
                    className={`text-slate-300 leading-relaxed text-xs line-clamp-3 ${
                      isRTL ? 'font-urdu text-sm text-right leading-loose' : ''
                    }`}
                  >
                    {scene.urduNarration}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
