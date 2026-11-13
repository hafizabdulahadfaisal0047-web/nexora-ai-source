import React, { useState } from 'react';
import {
  Link as LinkIcon,
  Search,
  Sparkles,
  RefreshCw,
  Film,
  FileText,
  Upload,
  Layers,
  Clock,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  SlidersHorizontal as Sliders,
} from 'lucide-react';
import { LinkAnalysisResult, VideoLanguage } from '../types';
import { analyzeVideoLink } from '../services/api';

interface VideoLinkAnalyzerStudioProps {
  onSendToScriptWriter: (topic: string, angle: string) => void;
  onSendToCompleteMaker: (topic: string, styleNotes: string) => void;
  onOpenVideoEditor: () => void;
}

const SAMPLE_URLS = [
  { platform: 'YouTube', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', label: 'YouTube Video Case Study' },
  { platform: 'Instagram', url: 'https://www.instagram.com/reel/C123456789/', label: 'Viral Instagram Reel' },
  { platform: 'TikTok', url: 'https://www.tiktok.com/@creator/video/71234567890', label: 'Fast-Paced TikTok' },
];

export const VideoLinkAnalyzerStudio: React.FC<VideoLinkAnalyzerStudioProps> = ({
  onSendToScriptWriter,
  onSendToCompleteMaker,
  onOpenVideoEditor,
}) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LinkAnalysisResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnalyze = async (targetUrl?: string) => {
    const activeUrl = targetUrl || url;
    if (!activeUrl.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await analyzeVideoLink(activeUrl);
      setResult(res.data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error analyzing video link.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Studio Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/50 border border-blue-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
            <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>ALGORITHMIC VIDEO LINK ANALYZER (ویڈیو لنک تجزیہ)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Deconstruct Any Viral YouTube, Instagram or TikTok Video
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Analyze the story arc, hook mechanics, retention pacing, and editing secrets of top-performing videos. Then turn the formula into your own original content with licensed stock footage.
          </p>
        </div>

        {/* Ethical Compliance Banner */}
        <div className="mt-5 p-3.5 rounded-2xl bg-black/40 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            <span className="font-semibold text-slate-200">Ethical &amp; Copyright Compliance:</span> NEXORA AI does not download protected copyrighted media or bypass platform access barriers. All produced videos use your owned footage or authorized CC0/Pexels stock clips.
          </p>
        </div>
      </div>

      {/* URL Input Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            PASTE VIDEO LINK (YOUTUBE, INSTAGRAM REEL OR TIKTOK)
          </label>
          <div className="relative">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or https://www.instagram.com/reel/..."
              className="w-full pl-11 pr-36 py-3.5 rounded-2xl bg-slate-950 border border-slate-700/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 text-white placeholder-slate-500 text-sm outline-none transition-all"
            />
            <div className="absolute left-4 top-4 text-slate-500">
              <LinkIcon className="w-4 h-4" />
            </div>

            <button
              disabled={loading || !url.trim()}
              onClick={() => handleAnalyze()}
              className="absolute right-2 top-2 bottom-2 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-950/40 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing Formula...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Analyze Video</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sample Links */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold mr-1">Quick Demos:</span>
          {SAMPLE_URLS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setUrl(s.url);
                handleAnalyze(s.url);
              }}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <span className="font-semibold text-blue-400">[{s.platform}]</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </span>
            <button onClick={() => setErrorMsg(null)} className="text-rose-300 hover:text-white font-bold">Dismiss</button>
          </div>
        )}
      </div>

      {/* Analysis Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Top 4 Actionable Pathways (User Requirement 5) */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>CHOOSE YOUR CREATOR NEXT STEP (4 ACTION MODES)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Option 1: Analyze Only */}
              <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" /> Mode 1: Analyze Only
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Review the deconstructed report below for research and creative ideation.
                  </p>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready Below
                </span>
              </div>

              {/* Option 2: Create Original Script */}
              <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/30 hover:border-purple-400 transition-colors flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Mode 2: Original Script
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Write a fresh, authentic original script on "{result.topic}" with no copyright conflicts.
                  </p>
                </div>
                <button
                  onClick={() => onSendToScriptWriter(result.topic, result.actionSuggestions.originalScriptTopic)}
                  className="w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1 transition-all"
                >
                  <span>Open in Script Writer</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Option 3: Create Inspired Video */}
              <div className="p-4 rounded-2xl bg-black/40 border border-cyan-500/30 hover:border-cyan-400 transition-colors flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5" /> Mode 3: Inspired Video
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Produce a full video using the matching fast-paced cut style and Pexels HD clips.
                  </p>
                </div>
                <button
                  onClick={() => onSendToCompleteMaker(result.topic, result.actionSuggestions.styleInspirationNotes)}
                  className="w-full py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-1 transition-all"
                >
                  <span>Build with AI Studio</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Option 4: Edit User Upload */}
              <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/30 hover:border-amber-400 transition-colors flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" /> Mode 4: Edit My Video
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Upload your own raw footage into our multi-track timeline editor and apply this pace.
                  </p>
                </div>
                <button
                  onClick={onOpenVideoEditor}
                  className="w-full py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1 transition-all"
                >
                  <span>Open Video Editor</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Deep Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Story Structure & 5-Part Arc */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    <span>Story Structure Arc (کہانی کی ساخت)</span>
                  </h3>
                  <span className="text-xs text-blue-400 font-mono font-semibold">{result.platform} Video</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wide">
                      1. The Hook (0 - 5 seconds):
                    </span>
                    <p className="text-xs text-slate-200 mt-1">{result.storyStructure.hook}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wide">
                      2. The Relatable Problem:
                    </span>
                    <p className="text-xs text-slate-200 mt-1">{result.storyStructure.problem}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                      3. Escalation &amp; Conflict:
                    </span>
                    <p className="text-xs text-slate-200 mt-1">{result.storyStructure.escalation}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wide">
                      4. Climax &amp; Key Revelation:
                    </span>
                    <p className="text-xs text-slate-200 mt-1">{result.storyStructure.climax}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">
                      5. Resolution &amp; Retention Call-to-Action:
                    </span>
                    <p className="text-xs text-slate-200 mt-1">{result.storyStructure.resolution}</p>
                  </div>
                </div>
              </div>

              {/* Key Takeaways */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Algorithmic Takeaways for Creators
                </h4>
                <ul className="space-y-2">
                  {result.keyTakeaways.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <span className="text-cyan-400 font-bold shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column: Hook Anatomy & Editing Style */}
            <div className="lg:col-span-5 space-y-6">
              {/* Hook Anatomy Box */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span>Hook Anatomy Breakdown</span>
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30">
                    <span className="font-bold text-purple-300 block mb-1">Opening Line:</span>
                    <p className="text-white italic">"{result.hookAnatomy.openingLine}"</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="font-bold text-cyan-400 block mb-1">Primary Retention Driver:</span>
                    <p className="text-slate-300">{result.hookAnatomy.retentionDriver}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="font-bold text-amber-400 block mb-1">Visual Disruption Trigger:</span>
                    <p className="text-slate-300">{result.hookAnatomy.visualTrigger}</p>
                  </div>
                </div>
              </div>

              {/* Editing Style Metrics */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  <span>Editing Style Blueprint</span>
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Pacing:</span>
                    <span className="font-bold text-white">{result.editingStyle.pacing}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Cuts Per Minute:</span>
                    <span className="font-bold text-cyan-400 font-mono">{result.editingStyle.cutsPerMinute}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">B-Roll Density:</span>
                    <span className="font-bold text-purple-400">{result.editingStyle.bRollDensity}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Color Grade:</span>
                    <span className="font-bold text-slate-200">{result.editingStyle.colorGradeVibe}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Music Mood:</span>
                    <span className="font-bold text-amber-400">{result.editingStyle.musicVibe}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
