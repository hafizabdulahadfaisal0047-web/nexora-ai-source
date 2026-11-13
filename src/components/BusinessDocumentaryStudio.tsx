import React, { useState } from 'react';
import {
  Briefcase,
  Sparkles,
  Play,
  Pause,
  Film,
  Search,
  Volume2,
  Copy,
  Check,
  ArrowRight,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  Clock,
  Music,
  Share2,
  Upload,
  AlertCircle,
  Bookmark,
} from 'lucide-react';
import { DocumentaryPlan, Project, Scene, StockVideo } from '../types';
import {
  generateDocumentary,
  searchUnifiedMedia,
  saveScriptToLibrary,
} from '../services/api';
import { UrduVoiceService } from '../services/audioSynthesizer';
import { autoSyncAllScenesToSpeech } from '../services/audioEngine';

interface BusinessDocumentaryStudioProps {
  onLoadIntoEditor: (project: Project) => void;
  onSaveProject: (project: Project) => void;
  initialTopic?: string;
}

const TOPIC_SUGGESTIONS = [
  'پاکستان کی ٹیک انڈسٹری اور فری لانسنگ انقلاب',
  'How NVIDIA Built the AI Empire (Urdu Documentary)',
  'The Secret Strategy Behind Dubai Economic Miracle',
  'China EV Revolution vs Tesla: اربوں ڈالر کی جنگ',
  'The Collapse of Crypto Giants & Lessons for 2026',
];

export const BusinessDocumentaryStudio: React.FC<BusinessDocumentaryStudioProps> = ({
  onLoadIntoEditor,
  onSaveProject,
  initialTopic,
}) => {
  const [topic, setTopic] = useState(initialTopic || '');
  const [durationMinutes, setDurationMinutes] = useState(3);
  const [tone, setTone] = useState('gripping, investigative and cinematic');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [plan, setPlan] = useState<DocumentaryPlan | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [savedScript, setSavedScript] = useState(false);

  // Audio preview state
  const [isPlayingVoice, setIsPlayingVoice] = useState<number | null>(null);
  const [voiceService] = useState(() => new UrduVoiceService());

  // Stock footage modal
  const [searchingSceneIndex, setSearchingSceneIndex] = useState<number | null>(null);
  const [stockQuery, setStockQuery] = useState('');
  const [stockResults, setStockResults] = useState<StockVideo[]>([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockPage, setStockPage] = useState(1);
  const [stockHasMore, setStockHasMore] = useState(false);

  const handleGenerate = async (targetTopic?: string) => {
    const selectedTopic = targetTopic || topic;
    if (!selectedTopic.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setSavedScript(false);
    setLoadingStep('Researching business case study & writing structured documentary script...');

    try {
      const res = await generateDocumentary(selectedTopic, durationMinutes, tone);
      const generatedPlan = res.data;

      // Sequentially match each scene with unique stock footage (no repeated clips)
      const usedUrls: string[] = [];
      const enhancedScenes = [];

      for (let idx = 0; idx < generatedPlan.scenes.length; idx++) {
        const scene = generatedPlan.scenes[idx];
        const query = scene.stockSearchQuery || scene.visualDescription || 'business technology';
        setLoadingStep(`Matching unique B-roll for scene ${idx + 1}/${generatedPlan.scenes.length}: ${query}`);

        let chosen: StockVideo | null = null;
        try {
          const stockRes = await searchUnifiedMedia({
            query,
            orientation: 'landscape',
            perPage: 5,
            excludeUrls: usedUrls,
          });
          chosen = stockRes.videos.find((v) => !usedUrls.includes(v.videoUrl)) || stockRes.videos[0] || null;
        } catch {
          chosen = null;
        }

        if (chosen?.videoUrl) usedUrls.push(chosen.videoUrl);

        enhancedScenes.push({
          ...scene,
          videoUrl:
            chosen?.videoUrl ||
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          previewUrl:
            chosen?.preview ||
            'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
          sourceProvider: chosen?.source || 'curated',
          photographer: chosen?.photographer || 'Curated Archive',
          license: chosen?.license || 'CC0 / Royalty-Free',
          attributionText: chosen?.attributionText,
        });
      }

      generatedPlan.scenes = enhancedScenes as any;
      setPlan(generatedPlan);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating documentary plan.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleVoicePreview = (text: string, index: number) => {
    if (isPlayingVoice === index) {
      voiceService.stop();
      setIsPlayingVoice(null);
      return;
    }

    voiceService.stop();
    setIsPlayingVoice(index);
    voiceService.speak(text, {
      rate: 0.95,
      onEnd: () => setIsPlayingVoice(null),
      onError: () => setIsPlayingVoice(null),
    });
  };

  const getExcludedUrlsForScene = (idx: number): string[] => {
    if (!plan) return [];
    return plan.scenes
      .filter((_, i) => i !== idx)
      .map((s) => s.videoUrl || '')
      .filter(Boolean);
  };

  const openStockModal = async (sceneIndex: number, initialQuery: string) => {
    setSearchingSceneIndex(sceneIndex);
    setStockQuery(initialQuery);
    setStockPage(1);
    setStockLoading(true);
    try {
      const res = await searchUnifiedMedia({
        query: initialQuery,
        orientation: 'landscape',
        perPage: 9,
        page: 1,
        excludeUrls: getExcludedUrlsForScene(sceneIndex),
      });
      setStockResults(res.videos);
      setStockHasMore(!!res.hasMore);
    } catch (e) {
      console.error(e);
    } finally {
      setStockLoading(false);
    }
  };

  const handleSearchStock = async (pageToLoad: number = 1) => {
    if (!stockQuery.trim()) return;
    setStockLoading(true);
    try {
      const res = await searchUnifiedMedia({
        query: stockQuery,
        orientation: 'landscape',
        perPage: 9,
        page: pageToLoad,
        excludeUrls: searchingSceneIndex !== null ? getExcludedUrlsForScene(searchingSceneIndex) : [],
      });
      if (pageToLoad === 1) {
        setStockResults(res.videos);
      } else {
        setStockResults((prev) => [...prev, ...res.videos]);
      }
      setStockPage(pageToLoad);
      setStockHasMore(!!res.hasMore);
    } catch (e) {
      console.error(e);
    } finally {
      setStockLoading(false);
    }
  };

  const handleSelectStockClip = (video: StockVideo) => {
    if (searchingSceneIndex === null || !plan) return;
    const updated = { ...plan };
    updated.scenes[searchingSceneIndex] = {
      ...updated.scenes[searchingSceneIndex],
      videoUrl: video.videoUrl,
      previewUrl: video.preview,
      sourceProvider: video.source,
      photographer: video.photographer,
      license: video.license,
      attributionText: video.attributionText,
    } as any;
    setPlan(updated);
    setSearchingSceneIndex(null);
  };

  const handleSaveDocScript = async () => {
    if (!plan) return;
    try {
      const fullText = plan.scenes.map((s) => s.urduNarration).join('\n\n');
      await saveScriptToLibrary({
        title: plan.youtubeSeo?.titles?.[0] || plan.topic,
        topic: plan.topic,
        niche: 'business_documentaries',
        primaryLanguage: plan.primaryLanguage || 'urdu',
        alternativeHooks: plan.hook ? [plan.hook] : [],
        fullScript: fullText,
        scenesCount: plan.scenes.length,
        targetDurationSeconds: plan.scenes.reduce((acc, s) => acc + (s.durationSeconds || 10), 0),
        tags: plan.youtubeSeo?.tags || [],
      });
      setSavedScript(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save documentary script.');
    }
  };

  const handleCreateProject = () => {
    if (!plan) return;
    const rawScenes: Scene[] = plan.scenes.map((s, idx) => ({
      id: `sc_${Date.now()}_${idx}`,
      sceneNumber: s.sceneNumber,
      title: s.title,
      visualDescription: s.visualDescription,
      stockSearchQuery: s.stockSearchQuery,
      videoUrl:
        (s as any).videoUrl ||
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      previewUrl:
        (s as any).previewUrl ||
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
      urduNarration: s.urduNarration,
      englishSubtitle: s.englishSubtitle,
      durationSeconds: s.durationSeconds || 10,
      transition: s.transition || 'fade',
      soundEffect: s.soundEffect,
      sourceProvider: (s as any).sourceProvider || 'curated',
      photographer: (s as any).photographer,
      license: (s as any).license,
      attributionText: (s as any).attributionText,
    }));

    const syncedScenes = autoSyncAllScenesToSpeech(rawScenes, plan.primaryLanguage || 'urdu', 1.0, 0.4);

    const project: Project = {
      id: `doc_${Date.now()}`,
      title: plan.youtubeSeo?.titles?.[0] || plan.topic || 'Untitled Documentary',
      type: 'business_documentary',
      primaryLanguage: plan.primaryLanguage || 'urdu',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aspectRatio: '16:9',
      resolution: '1080p',
      bgMusicTrack: plan.musicRecommendation?.trackStyle || 'Cinematic Documentary',
      bgMusicVolume: 0.25,
      scenes: syncedScenes,
      youtubeSeo: plan.youtubeSeo,
    };

    onSaveProject(project);
    onLoadIntoEditor(project);
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Studio Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0b1322] via-[#0e172a] to-[#14122b] border border-cyan-500/20 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-2">
          <Briefcase className="w-4 h-4" />
          <span>FULL-LENGTH BUSINESS DOCUMENTARIES (16:9)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          AI Business Documentary Engine
        </h2>
        <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
          Produce investigative, Dhruv Rathee &amp; Magnates Media style Urdu documentaries. Complete with
          engaging storytelling, scene breakdown, Pexels video matching, and YouTube SEO.
        </p>

        {/* Input Form */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              DOCUMENTARY TOPIC OR CASE STUDY
            </label>
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. How Pakistan's Freelance Economy Exploded, or The Silicon Valley Bank Crash"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-slate-500 text-sm outline-none transition-all"
              />
              <button
                disabled={loading || !topic.trim()}
                onClick={() => handleGenerate()}
                className="absolute right-2 top-2 bottom-2 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-950/60 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Documentary</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">Inspiration:</span>
            {TOPIC_SUGGESTIONS.map((sugg, i) => (
              <button
                key={i}
                onClick={() => {
                  setTopic(sugg);
                  handleGenerate(sugg);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-all"
              >
                {sugg}
              </button>
            ))}
          </div>

          {/* Config Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
                <span>TARGET DURATION</span>
                <span className="text-cyan-400 font-bold">{durationMinutes} Minutes (~{durationMinutes * 60}s)</span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                NARRATIVE TONE &amp; STYLE
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none"
              >
                <option value="gripping, investigative and cinematic">Investigative &amp; Gripping (Magnates Style)</option>
                <option value="deep analytical, data-backed and authoritative">Data-Driven &amp; Authoritative (Bloomberg Style)</option>
                <option value="conversational, accessible and curiosity-driven">Curiosity-Driven &amp; Engaging (Dhruv Rathee Style)</option>
                <option value="motivational and inspiring entrepreneurial">Inspiring &amp; Entrepreneurial Case Study</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-300 hover:text-white font-bold">Dismiss</button>
        </div>
      )}

      {/* Loading Progress State */}
      {loading && (
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-cyan-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-white">NEXORA AI is Architecting Your Documentary...</h3>
          <p className="text-xs text-cyan-400 font-mono tracking-wide">{loadingStep}</p>
        </div>
      )}

      {/* Generated Documentary Results */}
      {plan && !loading && (
        <div className="space-y-8">
          {/* Top Actions & Summary Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Documentary Package Ready
              </span>
              <h3 className="text-xl font-extrabold text-white mt-0.5">{plan.topic}</h3>
              <p className="text-xs text-slate-400 mt-1">
                {plan.scenes.length} Scenes • ~
                {plan.scenes.reduce((acc, s) => acc + (s.durationSeconds || 10), 0)}s Timeline
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleSaveDocScript}
                disabled={savedScript}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-all disabled:opacity-60"
              >
                {savedScript ? <Check className="w-4 h-4 text-emerald-400" /> : <Bookmark className="w-4 h-4 text-cyan-400" />}
                <span>{savedScript ? 'Saved to Library' : 'Save Script'}</span>
              </button>

              <button
                onClick={handleCreateProject}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 transition-all"
              >
                <Film className="w-4 h-4 text-white" />
                <span>Open in Video Editor &amp; Render</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>

          {/* Research & Hook Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="p-6 rounded-2xl bg-[#090e1a] border border-cyan-500/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                <Sparkles className="w-4 h-4" />
                <span>NARRATIVE HOOK (افتتاحی کشش)</span>
              </div>
              <p className="font-urdu text-lg text-white leading-loose">{plan.hook}</p>
              <button
                onClick={() => handleVoicePreview(plan.hook, 9999)}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                {isPlayingVoice === 9999 ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Stop Voiceover
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" /> Listen Hook Voice
                  </>
                )}
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>BACKGROUND MUSIC &amp; AUDIO DIRECTION</span>
                <Music className="w-4 h-4 text-purple-400" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Recommended Track Style:</span>
                  <span className="text-white font-semibold">
                    {plan.musicRecommendation?.trackStyle || 'Cinematic Tension'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Tempo / BPM:</span>
                  <span className="text-cyan-400 font-mono font-semibold">
                    {plan.musicRecommendation?.tempoBpm || 95} BPM
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Vibe &amp; Emotional Mood:</span>
                  <span className="text-slate-300">{plan.musicRecommendation?.mood || 'High Stakes'}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 pt-1 leading-relaxed border-t border-slate-800">
                {plan.researchSummary}
              </p>
            </div>
          </div>

          {/* Scene By Scene Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Scene-by-Scene Storyboard &amp; Stock Footage</span>
              </h4>
              <span className="text-xs text-slate-400">
                Click "Replace Stock" to search free Pexels clips
              </span>
            </div>

            <div className="space-y-4">
              {plan.scenes.map((scene, idx) => (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-2xl bg-[#090d16] border border-slate-800/80 hover:border-slate-700/80 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center">
                        {scene.sceneNumber || idx + 1}
                      </span>
                      <h5 className="font-bold text-white text-sm sm:text-base">{scene.title}</h5>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{scene.durationSeconds || 15}s</span>
                      </span>
                      <span>•</span>
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {scene.transition || 'fade'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                    {/* Media Preview Box */}
                    <div className="lg:col-span-4">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-800 border border-slate-700/60 group">
                        <img
                          src={
                            (scene as any).previewUrl ||
                            'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80'
                          }
                          alt={scene.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() =>
                              openStockModal(idx, scene.stockSearchQuery || 'business technology')
                            }
                            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg"
                          >
                            <Search className="w-3.5 h-3.5" />
                            <span>Change Stock</span>
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-semibold text-cyan-300 uppercase">
                          {(scene as any).sourceProvider || 'Stock'} Footage
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 truncate">
                        Keywords: {scene.stockSearchQuery}
                      </p>
                      {(scene as any).photographer && (
                        <p className="text-[10px] text-slate-500 truncate">
                          Credit: {(scene as any).photographer} ({(scene as any).license || 'Commercial Free'})
                        </p>
                      )}
                    </div>

                    {/* Script & Narration Box */}
                    <div className="lg:col-span-8 space-y-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-cyan-400">
                          Urdu Voiceover Script
                        </span>
                        <p className="font-urdu text-base sm:text-lg text-white leading-loose mt-0.5">
                          {scene.urduNarration}
                        </p>
                      </div>

                      {scene.englishSubtitle && (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            English Caption / Subtitle
                          </span>
                          <p className="text-xs text-slate-300 italic">{scene.englishSubtitle}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
                        <div className="text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-300">SFX Cue:</span>{' '}
                          {scene.soundEffect || 'Subtle whoosh'}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVoicePreview(scene.urduNarration, idx)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5"
                          >
                            {isPlayingVoice === idx ? (
                              <>
                                <Pause className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Stop</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Voice Preview</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() =>
                              openStockModal(idx, scene.stockSearchQuery || 'business technology')
                            }
                            className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-medium flex items-center gap-1"
                          >
                            <Search className="w-3.5 h-3.5" />
                            <span>Replace Stock</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* YouTube SEO & Metadata Section */}
          {plan.youtubeSeo && (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <span>YouTube SEO &amp; Publishing Package</span>
                </h4>
                <span className="text-xs text-emerald-400 font-semibold">Ready for YouTube Studio</span>
              </div>

              {/* Title Options */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400">
                  HIGH-CTR TITLE OPTIONS (کلک کرنے پر مجبور کرنے والے ٹائٹل)
                </span>
                <div className="space-y-2">
                  {plan.youtubeSeo.titles?.map((titleOpt, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs sm:text-sm text-white"
                    >
                      <span className="font-medium truncate pr-2">{titleOpt}</span>
                      <button
                        onClick={() => handleCopyText(titleOpt, `title-${idx}`)}
                        className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs flex items-center gap-1 flex-shrink-0"
                      >
                        {copiedKey === `title-${idx}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description Template */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>SEO DESCRIPTION &amp; TIMESTAMPS</span>
                  <button
                    onClick={() => handleCopyText(plan.youtubeSeo.description, 'desc')}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    {copiedKey === 'desc' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Description
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={5}
                  value={plan.youtubeSeo.description}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono outline-none"
                />
              </div>

              {/* Tags & Hashtags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                    <span>YOUTUBE TAGS</span>
                    <button
                      onClick={() => handleCopyText(plan.youtubeSeo.tags.join(', '), 'tags')}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      {copiedKey === 'tags' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Comma Separated</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {plan.youtubeSeo.tags?.map((tag, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                    <span>HASHTAGS</span>
                    <button
                      onClick={() => handleCopyText(plan.youtubeSeo.hashtags.join(' '), 'hash')}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      {copiedKey === 'hash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {plan.youtubeSeo.hashtags?.map((hash, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono">
                        {hash}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stock Video Picker Modal */}
      {searchingSceneIndex !== null && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl p-6 max-h-[90vh] flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Select Pexels Stock Clip</h3>
                <p className="text-xs text-slate-400">
                  Search millions of free commercial HD videos from Pexels API
                </p>
              </div>
              <button
                onClick={() => setSearchingSceneIndex(null)}
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
                onKeyDown={(e) => e.key === 'Enter' && handleSearchStock(1)}
                placeholder="Search stock footage across Pexels, Pixabay & Curated archive..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white outline-none focus:border-cyan-400"
              />
              <button
                onClick={() => handleSearchStock(1)}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-2">
              {stockLoading && stockResults.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2" />
                  <span>Searching stock media catalog...</span>
                </div>
              ) : stockResults.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-400">
                  No video results found. Try another search query.
                </div>
              ) : (
                <>
                  {stockResults.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => handleSelectStockClip(v)}
                      className="cursor-pointer group relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700 hover:border-cyan-400 transition-all"
                    >
                      <div className="aspect-video bg-slate-950 relative">
                        <img src={v.preview} alt={v.title} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-bold uppercase text-cyan-300">
                          {v.source}
                        </span>
                        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-mono text-slate-200">
                          {v.duration}s
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-900/90 text-xs">
                        <p className="font-semibold text-white truncate">{v.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          By {v.photographer} • {v.license || 'Commercial Free'}
                        </p>
                      </div>
                      <div className="absolute inset-0 bg-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-3 py-1 rounded bg-cyan-500 text-slate-950 font-bold text-xs">
                          Use this Clip
                        </span>
                      </div>
                    </div>
                  ))}
                  {stockHasMore && (
                    <div className="col-span-full flex justify-center pt-2">
                      <button
                        disabled={stockLoading}
                        onClick={() => handleSearchStock(stockPage + 1)}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 disabled:opacity-50"
                      >
                        {stockLoading ? 'Loading...' : 'Load More Stock Clips'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
