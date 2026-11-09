import React, { useState } from 'react';
import {
  Wand2,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Scissors,
  Zap,
  Mic,
  Film,
} from 'lucide-react';
import { ScriptImprovementResult, VideoLanguage } from '../types';
import { improveScript } from '../services/api';

interface ScriptImproverStudioProps {
  onSendToVoiceGenerator: (text: string, language: VideoLanguage) => void;
  onSendToVideoEditor: (scriptText: string, language: VideoLanguage) => void;
}

const SAMPLE_SCRIPTS = [
  {
    label: 'Urdu Business Intro',
    lang: 'urdu' as VideoLanguage,
    text: 'آج ہم بات کریں گے کہ کس طرح دنیا کی بڑی ٹیک کمپنیوں نے مارکیٹ پر قبضہ کر لیا اور کیسے چھوٹے کاروبار تباہ ہو گئے۔ یہ ایک بہت اہم موضوع ہے جو سب کو سمجھنا چاہیے۔',
  },
  {
    label: 'English Tech Hook',
    lang: 'english' as VideoLanguage,
    text: 'Hello everyone and welcome back to my channel. Today I wanted to discuss how artificial intelligence might be changing everything in our daily life, and why you should probably pay attention to these new software updates.',
  },
  {
    label: 'Roman Urdu Viral Hook',
    lang: 'roman_urdu' as VideoLanguage,
    text: 'Dosto aaj hum dekhenge ke Dubai me log itna paisa kaise kama rahe hain aur tax free economy ke peeche asal me kya chal raha hai. Video ko end tak dekhein.',
  },
];

export const ScriptImproverStudio: React.FC<ScriptImproverStudioProps> = ({
  onSendToVoiceGenerator,
  onSendToVideoEditor,
}) => {
  const [originalText, setOriginalText] = useState(SAMPLE_SCRIPTS[0].text);
  const [primaryLanguage, setPrimaryLanguage] = useState<VideoLanguage>('urdu');
  const [goal, setGoal] = useState<'retention' | 'pacing' | 'vocabulary' | 'concise' | 'expand'>('retention');
  const [targetPacing, setTargetPacing] = useState('Fast and engaging with punchy cuts');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScriptImprovementResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleImprove = async () => {
    if (!originalText.trim()) return;
    setLoading(true);
    try {
      const res = await improveScript({
        originalText,
        primaryLanguage,
        goal,
        targetPacing,
      });
      setResult(res.data);
    } catch (err: any) {
      alert(`Notice: ${err.message || 'Error improving script'}`);
    } finally {
      setLoading(false);
    }
  };

  const isRTL = primaryLanguage === 'urdu' || primaryLanguage === 'arabic';

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Studio Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/50 border border-emerald-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI SCRIPT IMPROVER &amp; RETENTION DOCTOR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Elevate Any Script to Broadcast Retention Standards
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Paste your rough draft or existing narration. Our script doctor eliminates weak phrasing, tightens curiosity gaps, enhances vocabulary, and optimizes vocal delivery rhythm strictly in your chosen language.
          </p>
        </div>
      </div>

      {/* Editor & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Script Form */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              ORIGINAL SCRIPT OR DRAFT
            </label>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Language:</span>
              <select
                value={primaryLanguage}
                onChange={(e) => setPrimaryLanguage(e.target.value as VideoLanguage)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-emerald-400 outline-none"
              >
                <option value="urdu">اردو (Urdu)</option>
                <option value="english">English</option>
                <option value="roman_urdu">Roman Urdu</option>
                <option value="arabic">العربية (Arabic)</option>
                <option value="hindi">हिन्दी (Hindi)</option>
              </select>
            </div>
          </div>

          <textarea
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            rows={10}
            placeholder="Paste your rough script draft, narration paragraph, or YouTube voiceover here..."
            className={`w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 text-white placeholder-slate-600 text-sm outline-none transition-all leading-relaxed ${
              isRTL ? 'font-urdu text-base leading-loose text-right' : ''
            }`}
          />

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 font-semibold mr-1">Load Demo:</span>
            {SAMPLE_SCRIPTS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setOriginalText(s.text);
                  setPrimaryLanguage(s.lang);
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Optimization Goal Controls */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                OPTIMIZATION FOCUS
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 outline-none"
              >
                <option value="retention">Maximize 0-30s Retention</option>
                <option value="pacing">Accelerate Pacing &amp; Cuts</option>
                <option value="vocabulary">Enrich Vocabulary &amp; Gravitas</option>
                <option value="concise">Cut Filler &amp; Be Concise</option>
                <option value="expand">Expand with Factual Context</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                DELIVERY TEMPO
              </label>
              <select
                value={targetPacing}
                onChange={(e) => setTargetPacing(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 outline-none"
              >
                <option value="Fast and engaging with punchy cuts">Fast Paced (TikTok/Shorts)</option>
                <option value="Authoritative, documentary style">Documentary Tempo (Dhruv/Bloomberg)</option>
                <option value="Calm, spiritual and reflective">Calm &amp; Reflective (Islamic/Zen)</option>
                <option value="High-energy dramatic teaser">High-Energy Dramatic</option>
              </select>
            </div>
          </div>

          <button
            disabled={loading || !originalText.trim()}
            onClick={handleImprove}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/40 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Elevating Script...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Improve Script &amp; Boost Retention</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Improved Script & Metrics */}
        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/30 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> ELEVATED RETENTION SCRIPT
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result.improvedText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>

              {/* Improved Text Box */}
              <div className="p-4 rounded-2xl bg-black/60 border border-slate-800">
                <p
                  className={`text-slate-100 font-medium leading-relaxed ${
                    isRTL ? 'font-urdu text-lg leading-loose text-right' : 'text-sm'
                  }`}
                >
                  {result.improvedText}
                </p>
              </div>

              {/* Quality Metrics */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="block text-lg font-mono font-bold text-emerald-400">
                    {result.metrics.pacingScore}
                  </span>
                  <span className="text-[10px] text-slate-400">Pacing</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="block text-lg font-mono font-bold text-cyan-400">
                    {result.metrics.vocabularyScore}
                  </span>
                  <span className="text-[10px] text-slate-400">Vocabulary</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="block text-lg font-mono font-bold text-purple-400">
                    {result.metrics.hookStrengthScore}
                  </span>
                  <span className="text-[10px] text-slate-400">Hook CTR</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="block text-lg font-mono font-bold text-amber-400">
                    {result.metrics.clarityScore}
                  </span>
                  <span className="text-[10px] text-slate-400">Clarity</span>
                </div>
              </div>

              {/* Changes Made */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-300">Key Enhancements Applied:</span>
                <ul className="space-y-1 text-slate-400">
                  {result.changesMade.map((c, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Retention Boosters & Cut Suggestions */}
              {result.retentionBoosters && result.retentionBoosters.length > 0 && (
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs space-y-1">
                  <span className="font-bold text-emerald-300 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" /> Retention Boosters:
                  </span>
                  <p className="text-slate-300">{result.retentionBoosters.join(' • ')}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => onSendToVoiceGenerator(result.improvedText, result.primaryLanguage)}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Send to Voice Generator</span>
                </button>

                <button
                  onClick={() => onSendToVideoEditor(result.improvedText, result.primaryLanguage)}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Send to Video Editor</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-10 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3 flex flex-col items-center justify-center min-h-[360px]">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500">
                <Wand2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-300">Awaiting Your Draft</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Paste your script and click "Improve Script" to see the elevated retention rewrite, pacing scores, and vocabulary boost.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
