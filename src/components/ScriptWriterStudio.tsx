import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Film,
  Mic,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Bookmark,
  AlertCircle,
} from 'lucide-react';
import {
  generateScript,
  saveScriptToLibrary,
  saveHookToLibrary,
  searchUnifiedMedia,
} from '../services/api';
import { Project, VideoLanguage } from '../types';

interface ScriptWriterStudioProps {
  onLoadIntoEditor: (project: Project) => void;
  onOpenVoiceStudio: (text?: string, language?: VideoLanguage) => void;
  initialTopic?: string;
  initialHook?: string;
  initialLanguage?: VideoLanguage;
}

export const ScriptWriterStudio: React.FC<ScriptWriterStudioProps> = ({
  onLoadIntoEditor,
  onOpenVoiceStudio,
  initialTopic,
  initialHook,
  initialLanguage,
}) => {
  const [topic, setTopic] = useState(initialTopic || '');
  const [format, setFormat] = useState('documentary');
  const [language, setLanguage] = useState<VideoLanguage>(initialLanguage || 'urdu');
  const [tone, setTone] = useState('engaging, investigative and authoritative');
  const [loading, setLoading] = useState(false);
  const [scriptData, setScriptData] = useState<any | null>(null);
  const [selectedHookIdx, setSelectedHookIdx] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [savedScript, setSavedScript] = useState(false);
  const [savedHook, setSavedHook] = useState(false);
  const [buildingScenes, setBuildingScenes] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
  }, [initialTopic]);

  useEffect(() => {
    if (initialLanguage) setLanguage(initialLanguage);
  }, [initialLanguage]);

  const activeHookText = useMemo(() => {
    if (!scriptData) return initialHook || '';
    if (scriptData.alternativeHooks && scriptData.alternativeHooks[selectedHookIdx]) {
      return (
        scriptData.alternativeHooks[selectedHookIdx].hookText ||
        scriptData.alternativeHooks[selectedHookIdx].text ||
        scriptData.hook ||
        ''
      );
    }
    return scriptData.hook || initialHook || '';
  }, [scriptData, selectedHookIdx, initialHook]);

  const handleGenerate = async (targetTopic?: string) => {
    const query = targetTopic || topic;
    if (!query.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setSelectedHookIdx(0);
    setSavedScript(false);
    setSavedHook(false);
    try {
      const res = await generateScript(query, format, language, tone);
      setScriptData(res.data);
    } catch (e: any) {
      setErrorMsg(`Script generation error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fullCompiledScript = useMemo(() => {
    if (!scriptData) return '';
    return `${scriptData.title}\n\n[SELECTED HOOK]\n${activeHookText}\n\n[INTRODUCTION]\n${
      scriptData.introduction
    }\n\n${scriptData.bodySections
      ?.map(
        (s: any) =>
          `[${s.heading}]\n${s.content}\n${s.transitionPhrase ? `(Transition: ${s.transitionPhrase})\n` : ''}(Visual Cue: ${s.visualCue || ''})`
      )
      .join('\n\n')}\n\n[CONCLUSION]\n${scriptData.conclusion}\n\n[CALL TO ACTION]\n${
      scriptData.callToAction || ''
    }\n\n[FACT & SOURCE REFERENCES]\n${scriptData.factReferences?.join('\n') || ''}`;
  }, [scriptData, activeHookText]);

  const handleCopyFullScript = () => {
    if (!scriptData) return;
    navigator.clipboard.writeText(fullCompiledScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToLibrary = async () => {
    if (!scriptData) return;
    try {
      const hooksList: string[] = Array.isArray(scriptData.alternativeHooks)
        ? scriptData.alternativeHooks.map((h: any) => h.hookText || h.text || '').filter(Boolean)
        : activeHookText
        ? [activeHookText]
        : [];
      const wordCount = fullCompiledScript.split(/\s+/).filter(Boolean).length;
      await saveScriptToLibrary({
        title: scriptData.title || topic,
        topic,
        niche: format,
        primaryLanguage: language,
        alternativeHooks: hooksList,
        fullScript: fullCompiledScript,
        factReferences: scriptData.factReferences || [],
        scenesCount: Math.max(1, scriptData.bodySections?.length || 1),
        wordCount,
        targetDurationSeconds: scriptData.estimatedReadingTimeSeconds || Math.round(wordCount / 2.2),
      });
      setSavedScript(true);
    } catch (e: any) {
      setErrorMsg(`Could not save script: ${e.message}`);
    }
  };

  const handleSaveActiveHook = async () => {
    if (!activeHookText) return;
    try {
      const hookType =
        scriptData?.alternativeHooks?.[selectedHookIdx]?.type || 'curiosity_high_stakes';
      await saveHookToLibrary({
        topic: topic || scriptData?.title || 'Custom Topic',
        hookType,
        openingLine: activeHookText,
        primaryLanguage: language,
        platform: format === 'reel' ? 'Reels/Shorts' : 'YouTube Long',
      });
      setSavedHook(true);
    } catch (e: any) {
      setErrorMsg(`Could not save hook: ${e.message}`);
    }
  };

  const handleCreateProjectFromScript = async () => {
    if (!scriptData) return;
    setBuildingScenes(true);
    const orientation = format === 'reel' ? 'portrait' : 'landscape';
    const usedUrls: string[] = [];
    const scenes: any[] = [];

    const draftItems: any[] = [];
    if (activeHookText) {
      draftItems.push({
        title: 'Cold Open Hook (0-5s)',
        visualDescription: 'High-impact opening cinematic sequence',
        stockSearchQuery: `${topic} dramatic dark cinematic`,
        narration: activeHookText,
        durationSeconds: 5,
        transition: 'zoom',
      });
    }
    scriptData.bodySections?.forEach((sec: any, idx: number) => {
      draftItems.push({
        title: sec.heading || `Chapter ${idx + 1}`,
        visualDescription: sec.visualCue || 'Cinematic documentary footage',
        stockSearchQuery: sec.visualCue || `${topic} chapter ${idx + 1}`,
        narration: sec.content || '',
        durationSeconds: 8,
        transition: 'fade',
      });
    });

    try {
      for (let i = 0; i < draftItems.length; i++) {
        const item = draftItems[i];
        let chosen: any = null;
        try {
          const mediaRes = await searchUnifiedMedia({
            query: item.stockSearchQuery,
            orientation,
            perPage: 4,
            excludeUrls: usedUrls,
          });
          chosen = mediaRes.videos?.[0] || null;
          if (chosen?.url) usedUrls.push(chosen.url);
        } catch (_) {}

        scenes.push({
          id: `sc_script_${Date.now()}_${i}`,
          sceneNumber: i + 1,
          title: item.title,
          visualDescription: item.visualDescription,
          stockSearchQuery: item.stockSearchQuery,
          videoUrl:
            chosen?.url ||
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          previewUrl:
            chosen?.preview ||
            'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
          sourceProvider: chosen?.sourceProvider,
          photographer: chosen?.photographer,
          license: chosen?.license,
          licenseUrl: chosen?.licenseUrl,
          attributionText: chosen?.attributionText,
          urduNarration: item.narration,
          englishSubtitle: language === 'english' ? item.narration : '',
          durationSeconds: item.durationSeconds,
          transition: item.transition,
          colorGrade: 'documentary_cold',
          kenBurnsEffect: i % 2 === 0 ? 'zoom_in' : 'pan_right',
        });
      }

      const project: Project = {
        id: `script_proj_${Date.now()}`,
        title: scriptData.title || topic || 'Script Project',
        type: format === 'reel' ? 'islamic_reel' : 'business_documentary',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aspectRatio: format === 'reel' ? '9:16' : '16:9',
        resolution: '1080p',
        primaryLanguage: language,
        scenes,
        scriptData: { ...scriptData, selectedHook: activeHookText },
      };

      onLoadIntoEditor(project);
    } finally {
      setBuildingScenes(false);
    }
  };

  const isRTL = language === 'urdu' || language === 'arabic';
  const textClass = isRTL ? 'font-urdu leading-loose text-right' : 'leading-relaxed';

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Studio Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#170e2a] via-[#1b1035] to-[#0e162f] border border-purple-500/20 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 mb-2">
          <FileText className="w-4 h-4" />
          <span>AI SCRIPT LABORATORY (مکمل ویڈیو اسکرپٹ رائٹر)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          AI Scriptwriter Studio
        </h2>
        <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
          Craft natural, structured documentaries, explainers, and short-form reels with 3 alternative cold-open hooks,
          smooth transitions, verified fact notes, and strict single-language isolation.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              VIDEO TOPIC OR CENTRAL QUESTION
            </label>
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. The Untold Story of Silicon Valley Bank Crash, or How Freelancers Are Changing Pakistan"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-slate-500 text-sm outline-none transition-all"
              />
              <button
                disabled={loading || !topic.trim()}
                onClick={() => handleGenerate()}
                className="absolute right-2 top-2 bottom-2 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-purple-950/60 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Writing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Write Script</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">SCRIPT FORMAT</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none"
              >
                <option value="documentary">Investigative Documentary (Long-Form)</option>
                <option value="explainer">YouTube Deep-Dive Explainer</option>
                <option value="reel">Viral 60s Reel / Short (9:16)</option>
                <option value="podcast">Podcast Intro &amp; Discussion</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                STRICT SCRIPT LANGUAGE
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as VideoLanguage)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none"
              >
                <option value="urdu">Urdu Only (اردو نستعلیق)</option>
                <option value="english">English Only</option>
                <option value="roman_urdu">Roman Urdu Only</option>
                <option value="arabic">Arabic Only (العربية)</option>
                <option value="hindi">Hindi Only (हिन्दी)</option>
                <option value="bilingual">Bilingual (Urdu + English)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">TONE &amp; CADENCE</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none"
              >
                <option value="engaging, investigative and authoritative">Investigative &amp; Gripping</option>
                <option value="poetic, emotional and philosophical">Emotional &amp; Philosophical</option>
                <option value="humorous, fast-paced and relatable">Fast-Paced &amp; Relatable</option>
                <option value="calm, informative and educational">Calm &amp; Educational</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Script Display */}
      {scriptData && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-400 uppercase">Script Ready</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  ~{scriptData.estimatedReadingTimeSeconds || 180}s speaking duration
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white mt-1">{scriptData.title}</h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSaveToLibrary}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  savedScript
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{savedScript ? 'Saved to Vault' : 'Save Script'}</span>
              </button>

              <button
                onClick={handleCopyFullScript}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Full Script'}</span>
              </button>

              <button
                onClick={() =>
                  onOpenVoiceStudio(
                    `${activeHookText}\n\n${scriptData.introduction || ''}\n\n${
                      scriptData.bodySections?.map((s: any) => s.content).join('\n\n') || ''
                    }`,
                    language
                  )
                }
                className="px-3.5 py-2 rounded-xl bg-blue-600/25 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Send to Voice</span>
              </button>

              <button
                onClick={handleCreateProjectFromScript}
                disabled={buildingScenes}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 flex items-center gap-1.5 disabled:opacity-50"
              >
                {buildingScenes ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Film className="w-3.5 h-3.5" />
                )}
                <span>{buildingScenes ? 'Matching Clips...' : 'Send to Video Editor'}</span>
              </button>
            </div>
          </div>

          {/* Hook Selector Box */}
          <div className="p-6 rounded-2xl bg-[#130d22] border border-purple-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/20 pb-3">
              <span className="text-xs font-bold text-purple-400 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>3 Alternative Cold-Open Hooks (No Greetings)</span>
              </span>

              <button
                onClick={handleSaveActiveHook}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                  savedHook
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <Bookmark className="w-3 h-3" />
                <span>{savedHook ? 'Hook Saved' : 'Save Active Hook'}</span>
              </button>
            </div>

            {scriptData.alternativeHooks && scriptData.alternativeHooks.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {scriptData.alternativeHooks.map((h: any, idx: number) => {
                  const isSelected = selectedHookIdx === idx;
                  const hookDisplay = h.hookText || h.text || '';
                  const label =
                    h.type === 'curiosity_high_stakes'
                      ? 'High-Stakes Curiosity'
                      : h.type === 'mystery_question'
                      ? 'Mystery Question'
                      : 'Cold Revelation';

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedHookIdx(idx);
                        setSavedHook(false);
                      }}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-purple-900/40 border-purple-400 text-white shadow-md shadow-purple-950/60'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                        <span className={isSelected ? 'text-purple-300' : 'text-slate-400'}>{label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                      </div>
                      <p className={`text-xs line-clamp-2 text-slate-300 ${isRTL ? 'font-urdu text-right' : ''}`}>
                        {hookDisplay}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-950/70 border border-purple-500/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1 block">
                ACTIVE OPENING HOOK (1-3s COLD OPEN)
              </span>
              <p className={`text-lg sm:text-xl text-white font-semibold ${textClass}`}>{activeHookText}</p>
            </div>
          </div>

          {/* Introduction Box */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-cyan-400 uppercase">INTRODUCTION</span>
            <p className={`text-base sm:text-lg text-slate-200 ${textClass}`}>{scriptData.introduction}</p>
          </div>

          {/* Body Sections */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-white tracking-tight flex items-center justify-between">
              <span>Chapters &amp; Story Timeline</span>
              <span className="text-xs font-normal text-slate-400">
                Logical storytelling &amp; smooth transitions
              </span>
            </h4>
            <div className="space-y-4">
              {scriptData.bodySections?.map((section: any, idx: number) => (
                <div key={idx} className="p-6 rounded-2xl bg-[#090d16] border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                    <span className="text-xs font-bold text-purple-400">
                      Chapter {idx + 1}: {section.heading}
                    </span>
                    {section.visualCue && (
                      <span className="text-[11px] text-slate-400 italic">Visual: {section.visualCue}</span>
                    )}
                  </div>
                  <p className={`text-base sm:text-lg text-white ${textClass}`}>{section.content}</p>
                  {section.transitionPhrase && (
                    <div className="pt-2 border-t border-slate-800/40 flex items-center gap-2 text-xs text-indigo-300">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-700/40 uppercase font-mono font-bold">
                        Transition
                      </span>
                      <span className={`italic text-slate-300 ${isRTL ? 'font-urdu' : ''}`}>
                        "{section.transitionPhrase}"
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Conclusion Box */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase">STRONG ENDING / CONCLUSION</span>
            <p className={`text-base text-slate-200 ${textClass}`}>{scriptData.conclusion}</p>
          </div>

          {/* Call to Action Box */}
          {scriptData.callToAction && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 space-y-2">
              <span className="text-xs font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5" />
                <span>FOLLOW &amp; SUBSCRIBE CALL TO ACTION</span>
              </span>
              <p className={`text-sm sm:text-base text-slate-200 ${textClass}`}>{scriptData.callToAction}</p>
            </div>
          )}

          {/* Fact References */}
          {scriptData.factReferences && scriptData.factReferences.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <span className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>FACT &amp; SOURCE REFERENCES</span>
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {scriptData.factReferences.map((fact: string, fIdx: number) => (
                  <li key={fIdx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
