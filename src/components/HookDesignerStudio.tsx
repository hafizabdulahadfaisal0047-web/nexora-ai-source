import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Copy,
  Check,
  ArrowRight,
  RefreshCw,
  Film,
  Volume2,
  FileText,
  Sliders,
  Eye,
  Bookmark,
  Share2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { HookDesignResult, HookItem, VideoLanguage } from '../types';
import { generateHooks } from '../services/api';
import { generateTransitionSfxBuffer } from '../services/audioEngine';

interface HookDesignerStudioProps {
  onSendToScriptWriter: (hookText: string, topic: string, language: VideoLanguage) => void;
  onSendToCompleteMaker?: (hookText: string, topic: string, language: VideoLanguage) => void;
}

const PRESET_TOPICS = [
  { label: 'AI Economy (مصنوعی ذہانت اور معیشت)', topic: 'How AI is silently crashing traditional banking jobs in 2026', lang: 'urdu' as VideoLanguage },
  { label: 'Dubai Economic Model', topic: 'The real untold mathematical secret behind Dubai tax-free economy', lang: 'english' as VideoLanguage },
  { label: 'Islamic Mindfulness (صبر اور حکمت)', topic: 'Why silent patience in difficult moments changes human brain chemistry', lang: 'urdu' as VideoLanguage },
  { label: 'Crypto & Billionaire Psychology', topic: 'How top crypto whales manipulate retail investors during market panic', lang: 'roman_urdu' as VideoLanguage },
];

export const HookDesignerStudio: React.FC<HookDesignerStudioProps> = ({
  onSendToScriptWriter,
  onSendToCompleteMaker,
}) => {
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('Digital Creators & Tech Viewers');
  const [platform, setPlatform] = useState<'YouTube Long' | 'YouTube Shorts' | 'Instagram Reels' | 'TikTok' | 'LinkedIn'>('YouTube Long');
  const [primaryLanguage, setPrimaryLanguage] = useState<VideoLanguage>('urdu');
  const [videoDuration, setVideoDuration] = useState('3-5 minutes');
  const [tone, setTone] = useState('Curiosity, High Stakes & Investigative');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HookDesignResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingHookId, setEditingHookId] = useState<string | null>(null);
  const [editedOpeningLine, setEditedOpeningLine] = useState('');

  // Audio preview for SFX cues
  const playSfxPreview = async (sfxName: string) => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass();
      if (ctx.state === 'suspended') await ctx.resume();

      const buffer = await generateTransitionSfxBuffer(ctx.sampleRate, sfxName);
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(ctx.destination);
      src.start(0);
    } catch (e) {
      console.warn('SFX preview note:', e);
    }
  };

  const handleGenerate = async (presetTopic?: string, presetLang?: VideoLanguage) => {
    const activeTopic = presetTopic || topic;
    const activeLang = presetLang || primaryLanguage;
    if (!activeTopic.trim()) return;

    setLoading(true);
    try {
      const res = await generateHooks({
        topic: activeTopic,
        targetAudience,
        platform,
        primaryLanguage: activeLang,
        videoDuration,
        tone,
      });
      setResult(res.data);
    } catch (err: any) {
      alert(`Notice: ${err.message || 'Error generating hooks'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (hook: HookItem) => {
    const textToCopy = `[HOOK: ${hook.hookType.toUpperCase()}]\n"${hook.openingLine}"\n\n📌 First 3s Action: ${hook.first3SecondsAction}\n🎬 Suggested Visual: ${hook.suggestedFootage}\n🎙️ Voice Delivery: ${hook.voicePacingStyle}\n🔊 SFX: ${hook.soundEffectCue}\n📺 On-Screen Text: ${hook.onScreenText}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(hook.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveEdit = (hookId: string) => {
    if (!result) return;
    const updated = result.hooks.map((h) =>
      h.id === hookId ? { ...h, openingLine: editedOpeningLine } : h
    );
    setResult({ ...result, hooks: updated });
    setEditingHookId(null);
  };

  const isRTL = primaryLanguage === 'urdu' || primaryLanguage === 'arabic';

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Studio Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-cyan-950/50 border border-purple-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>ADVANCED HOOK DESIGNER V2 (ہائی ریٹینشن ہکس)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Master the First 3 Seconds. Eliminate Drop-Off.
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Generate 10 psychologically distinct hook angles for YouTube, Shorts, Reels, and TikTok. Each hook comes engineered with visual disruption cues, sound effect hits, and delivery pacing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-black/40 border border-slate-800 text-center">
              <span className="block text-xl font-mono font-black text-cyan-400">10</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Unique Angles</span>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-black/40 border border-slate-800 text-center">
              <span className="block text-xl font-mono font-black text-purple-400">&lt; 3.0s</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Drop-Off Defense</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inputs Configuration Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
            VIDEO TOPIC OR CORE THESIS
          </label>
          <div className="relative">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. How Dubai built an artificial economic miracle without income tax"
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-700/80 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-slate-500 text-sm outline-none transition-all"
            />
            <button
              disabled={loading || !topic.trim()}
              onClick={() => handleGenerate()}
              className="absolute right-2 top-2 bottom-2 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-950/40 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Engineering Hooks...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate 10 Hooks</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold mr-1">Quick Presets:</span>
          {PRESET_TOPICS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTopic(p.topic);
                setPrimaryLanguage(p.lang);
                handleGenerate(p.topic, p.lang);
              }}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Multi-parameter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">
              PRIMARY LANGUAGE
            </label>
            <select
              value={primaryLanguage}
              onChange={(e) => setPrimaryLanguage(e.target.value as VideoLanguage)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 outline-none focus:border-purple-400"
            >
              <option value="urdu">اردو (Urdu)</option>
              <option value="english">English</option>
              <option value="roman_urdu">Roman Urdu</option>
              <option value="arabic">العربية (Arabic)</option>
              <option value="hindi">हिन्दी (Hindi)</option>
              <option value="bilingual">Bilingual (Urdu + English)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">
              TARGET PLATFORM
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 outline-none focus:border-purple-400"
            >
              <option value="YouTube Long">YouTube Long-Form (16:9)</option>
              <option value="YouTube Shorts">YouTube Shorts (9:16)</option>
              <option value="Instagram Reels">Instagram Reels (9:16)</option>
              <option value="TikTok">TikTok (9:16)</option>
              <option value="LinkedIn">LinkedIn Video (1:1 / 16:9)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">
              TARGET DURATION
            </label>
            <select
              value={videoDuration}
              onChange={(e) => setVideoDuration(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 outline-none focus:border-purple-400"
            >
              <option value="Shorts (< 60s)">Shorts (&lt; 60 seconds)</option>
              <option value="3-5 minutes">3 - 5 Minutes (Fast Explainer)</option>
              <option value="8-12 minutes">8 - 12 Minutes (Documentary)</option>
              <option value="15+ minutes">15+ Minutes (Deep Dive / Case Study)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">
              PSYCHOLOGICAL TONE
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 outline-none focus:border-purple-400"
            >
              <option value="Curiosity, High Stakes & Investigative">Investigative Curiosity</option>
              <option value="Dramatic and Urgent">Dramatic &amp; Urgent</option>
              <option value="Warm, Spiritual and Reflective">Spiritual &amp; Reflective</option>
              <option value="Shocking and High-Energy">Shocking &amp; High Energy</option>
              <option value="Educational and Authoritative">Authoritative Educational</option>
            </select>
          </div>
        </div>
      </div>

      {/* Generated 10 Hooks Display */}
      {result && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                <span>10 Engineered Hooks for:</span>
                <span className="text-cyan-400 font-normal">"{result.topic}"</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Language: <span className="text-white font-semibold uppercase">{result.primaryLanguage}</span> • Platform: <span className="text-white font-semibold">{result.platform}</span>
              </p>
            </div>

            <button
              onClick={() => handleGenerate()}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate Fresh Hooks</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {result.hooks.map((hook, index) => (
              <div
                key={hook.id || index}
                className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition-all shadow-xl space-y-4 group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Hook Category & Badges */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[11px] border border-purple-500/30">
                      #{index + 1} {hook.hookType.toUpperCase()} HOOK
                    </span>
                    <button
                      onClick={() => handleCopy(hook)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                    >
                      {copiedId === hook.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Hook</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Opening Line */}
                  {editingHookId === hook.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editedOpeningLine}
                        onChange={(e) => setEditedOpeningLine(e.target.value)}
                        className={`w-full p-3 rounded-xl bg-slate-950 border border-purple-500 text-white text-base ${
                          isRTL ? 'font-urdu text-right' : ''
                        }`}
                        rows={3}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingHookId(null)}
                          className="px-3 py-1 text-xs rounded-lg bg-slate-800 text-slate-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(hook.id)}
                          className="px-3 py-1 text-xs rounded-lg bg-purple-600 text-white font-bold"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setEditingHookId(hook.id);
                        setEditedOpeningLine(hook.openingLine);
                      }}
                      className="p-3.5 rounded-xl bg-black/40 border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer group-hover:bg-black/60"
                      title="Click to edit opening line"
                    >
                      <p
                        className={`text-base font-bold text-white leading-relaxed ${
                          isRTL ? 'font-urdu text-lg leading-loose text-right' : ''
                        }`}
                      >
                        "{hook.openingLine}"
                      </p>
                    </div>
                  )}

                  {/* Production Blueprint Specs */}
                  <div className="space-y-2 text-xs pt-1">
                    <div className="flex items-start gap-2 text-slate-300">
                      <span className="text-purple-400 font-bold shrink-0">⚡ 0-3s Action:</span>
                      <span className="text-slate-300">{hook.first3SecondsAction}</span>
                    </div>

                    <div className="flex items-start gap-2 text-slate-300">
                      <span className="text-cyan-400 font-bold shrink-0">🎬 Suggested B-Roll:</span>
                      <span className="text-slate-400 italic">{hook.suggestedFootage}</span>
                    </div>

                    <div className="flex items-start gap-2 text-slate-300">
                      <span className="text-amber-400 font-bold shrink-0">🎙️ Delivery:</span>
                      <span className="text-slate-400">{hook.voicePacingStyle}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300 pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-rose-400 font-bold">🔊 SFX Hit:</span>
                        <span className="text-slate-300 font-mono text-[11px]">{hook.soundEffectCue}</span>
                      </div>
                      <button
                        onClick={() => playSfxPreview(hook.soundEffectCue)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] flex items-center gap-1 font-semibold"
                      >
                        <Volume2 className="w-3 h-3" /> Audition SFX
                      </button>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">On-Screen Text Overlay:</span>
                      <span className="text-cyan-300 font-black tracking-wider uppercase">{hook.onScreenText}</span>
                    </div>
                  </div>
                </div>

                {/* Workflow Actions */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSendToScriptWriter(hook.openingLine, result.topic, result.primaryLanguage)}
                    className="flex-1 px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Send to Script Writer</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>

                  {onSendToCompleteMaker && (
                    <button
                      onClick={() => onSendToCompleteMaker(hook.openingLine, result.topic, result.primaryLanguage)}
                      className="px-3 py-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600 text-cyan-200 hover:text-white border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Make Video</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
