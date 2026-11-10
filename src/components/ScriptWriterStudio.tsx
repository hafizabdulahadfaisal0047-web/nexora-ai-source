import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Film,
  Mic,
  Clock,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Share2,
} from 'lucide-react';
import { generateScript } from '../services/api';
import { Project } from '../types';

interface ScriptWriterStudioProps {
  onLoadIntoEditor: (project: Project) => void;
  onOpenVoiceStudio: () => void;
  initialTopic?: string;
  initialHook?: string;
}

export const ScriptWriterStudio: React.FC<ScriptWriterStudioProps> = ({
  onLoadIntoEditor,
  onOpenVoiceStudio,
  initialTopic,
  initialHook,
}) => {
  const [topic, setTopic] = useState(initialTopic || '');
  const [format, setFormat] = useState('documentary');
  const [language, setLanguage] = useState('urdu');
  const [tone, setTone] = useState('engaging, investigative and authoritative');
  const [loading, setLoading] = useState(false);
  const [scriptData, setScriptData] = useState<any | null>(null);
  const [selectedHookIdx, setSelectedHookIdx] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
    }
  }, [initialTopic]);

  const activeHookText = React.useMemo(() => {
    if (!scriptData) return initialHook || '';
    if (scriptData.alternativeHooks && scriptData.alternativeHooks[selectedHookIdx]) {
      return scriptData.alternativeHooks[selectedHookIdx].text;
    }
    return scriptData.hook || initialHook || '';
  }, [scriptData, selectedHookIdx, initialHook]);

  const handleGenerate = async (targetTopic?: string) => {
    const query = targetTopic || topic;
    if (!query.trim()) return;

    setLoading(true);
    setSelectedHookIdx(0);
    try {
      const res = await generateScript(query, format, language, tone);
      setScriptData(res.data);
    } catch (e: any) {
      alert(`Script generation error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyFullScript = () => {
    if (!scriptData) return;
    const fullText = `${scriptData.title}\n\n[SELECTED HOOK]\n${activeHookText}\n\n[INTRODUCTION]\n${
      scriptData.introduction
    }\n\n${scriptData.bodySections
      ?.map((s: any) => `[${s.heading}]\n${s.content}\n${s.transitionPhrase ? `(Transition: ${s.transitionPhrase})\n` : ''}(Visual Cue: ${s.visualCue})`)
      .join('\n\n')}\n\n[CONCLUSION]\n${scriptData.conclusion}\n\n[CALL TO ACTION]\n${scriptData.callToAction || ''}\n\n[FACT & SOURCE REFERENCES]\n${scriptData.factReferences?.join('\n') || ''}`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateProjectFromScript = () => {
    if (!scriptData) return;

    // Build scene array starting with the selected hook
    const scenes: any[] = [];

    // Scene 0: Hook Scene
    if (activeHookText) {
      scenes.push({
        id: `sc_hook_${Date.now()}`,
        sceneNumber: 1,
        title: 'Hook / Opening (0-5s)',
        visualDescription: 'Dramatic high-contrast visual with dynamic punch',
        stockSearchQuery: `${topic} dramatic cinema`,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        previewUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
        urduNarration: activeHookText,
        englishSubtitle: 'Opening hook',
        durationSeconds: 5,
        transition: 'zoom',
        colorGrade: 'documentary_cold',
        kenBurnsEffect: 'zoom_in',
      });
    }

    // Body scenes
    scriptData.bodySections?.forEach((sec: any, idx: number) => {
      scenes.push({
        id: `sc_sec_${idx}`,
        sceneNumber: scenes.length + 1,
        title: sec.heading || `Chapter ${idx + 1}`,
        visualDescription: sec.visualCue || 'Modern cinematic visual',
        stockSearchQuery: `${topic} chapter ${idx + 1}`,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        previewUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80',
        urduNarration: sec.content || '',
        englishSubtitle: '',
        durationSeconds: 8,
        transition: 'fade',
        colorGrade: 'documentary_cold',
        kenBurnsEffect: idx % 2 === 0 ? 'zoom_in' : 'pan_right',
      });
    });

    const project: Project = {
      id: `script_proj_${Date.now()}`,
      title: scriptData.title || topic || 'Script Project',
      type: format === 'reel' ? 'islamic_reel' : 'business_documentary',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aspectRatio: format === 'reel' ? '9:16' : '16:9',
      resolution: '1080p',
      scenes,
      scriptData: { ...scriptData, selectedHook: activeHookText },
    };

    onLoadIntoEditor(project);
  };

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
          Craft viral, emotionally resonant YouTube documentaries, explainers, and short-form reels. Complete
          with hooks, chapter breakdowns, visual cues, and reading duration estimates.
        </p>

        {/* Form Controls */}
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                SCRIPT FORMAT
              </label>
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
                SCRIPT LANGUAGE
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none"
              >
                <option value="urdu">Urdu (اردو نستعلیق)</option>
                <option value="english">English (US/UK)</option>
                <option value="bilingual">Bilingual Urdu + English</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                TONE &amp; CADENCE
              </label>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-400 uppercase">
                  Script Ready
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  ~{scriptData.estimatedReadingTimeSeconds || 180}s reading time
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white mt-1">{scriptData.title}</h3>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleCopyFullScript}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Full Script'}</span>
              </button>

              <button
                onClick={handleCreateProjectFromScript}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 flex items-center gap-1.5"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Send to Video Editor</span>
              </button>
            </div>
          </div>

          {/* Hook Selector Box */}
          <div className="p-6 rounded-2xl bg-[#130d22] border border-purple-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/20 pb-3">
              <span className="text-xs font-bold text-purple-400 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>3 High-Retention Alternative Hooks (پہلے 10 سیکنڈز کی کشش)</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Click a hook style to make it the active script opening
              </span>
            </div>

            {/* Hook Selector Pills */}
            {scriptData.alternativeHooks && scriptData.alternativeHooks.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {scriptData.alternativeHooks.map((h: any, idx: number) => {
                  const isSelected = selectedHookIdx === idx;
                  const label =
                    h.type === 'curiosity_high_stakes'
                      ? '⚡ High-Stakes Curiosity'
                      : h.type === 'mystery_question'
                      ? '❓ Mystery Question'
                      : '❄️ Cold Revelation';

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedHookIdx(idx)}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-purple-900/40 border-purple-400 text-white shadow-md shadow-purple-950/60'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                        <span className={isSelected ? 'text-purple-300' : 'text-slate-400'}>
                          {label}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                      </div>
                      <p className="text-xs line-clamp-2 text-slate-300 font-urdu">{h.text}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Active Hook Full Preview */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-purple-500/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1 block">
                ACTIVE OPENING HOOK (0-5s)
              </span>
              <p className="font-urdu text-lg sm:text-xl text-white leading-loose font-semibold">
                {activeHookText}
              </p>
            </div>
          </div>

          {/* Introduction Box */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-cyan-400 uppercase">
              INTRODUCTION (تمہید اور پس منظر)
            </span>
            <p className="font-urdu text-base sm:text-lg text-slate-200 leading-loose">
              {scriptData.introduction}
            </p>
          </div>

          {/* Body Sections */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-white tracking-tight flex items-center justify-between">
              <span>Chapters &amp; Story Timeline</span>
              <span className="text-xs font-normal text-slate-400">
                Smooth bridge transitions between core ideas
              </span>
            </h4>
            <div className="space-y-4">
              {scriptData.bodySections?.map((section: any, idx: number) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#090d16] border border-slate-800/80 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                    <span className="text-xs font-bold text-purple-400">
                      Chapter {idx + 1}: {section.heading}
                    </span>
                    {section.visualCue && (
                      <span className="text-[11px] text-slate-400 italic">
                        🎬 Visual: {section.visualCue}
                      </span>
                    )}
                  </div>
                  <p className="font-urdu text-base sm:text-lg text-white leading-loose">
                    {section.content}
                  </p>
                  {section.transitionPhrase && (
                    <div className="pt-2 border-t border-slate-800/40 flex items-center gap-2 text-xs text-indigo-300">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-700/40 uppercase font-mono font-bold">
                        Transition
                      </span>
                      <span className="font-urdu italic text-slate-300">
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
            <span className="text-xs font-bold text-emerald-400 uppercase">
              CONCLUSION (نتیجہ اور مرکزی سبق)
            </span>
            <p className="font-urdu text-base text-slate-200 leading-loose">
              {scriptData.conclusion}
            </p>
          </div>

          {/* Call to Action Box */}
          {scriptData.callToAction && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 space-y-2">
              <span className="text-xs font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5" />
                <span>STRONG CHANNEL CALL TO ACTION (سبسکرائب اور فالو کی ترغیب)</span>
              </span>
              <p className="font-urdu text-sm sm:text-base text-slate-200 leading-relaxed">
                {scriptData.callToAction}
              </p>
            </div>
          )}

          {/* Fact References & Grounding */}
          {scriptData.factReferences && scriptData.factReferences.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <span className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>ACCURATE FACTS &amp; SOURCES REFERENCES (مستند حقائق اور حوالہ جات)</span>
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
