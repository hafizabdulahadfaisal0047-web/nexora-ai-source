import React, { useState } from 'react';
import {
  TrendingUp,
  Sparkles,
  Copy,
  Check,
  Search,
  RefreshCw,
  BarChart3,
  Hash,
  FileText,
  Target,
  Flame,
} from 'lucide-react';
import { generateSeoTools } from '../services/api';

export const YoutubeSeoStudio: React.FC = () => {
  const [topic, setTopic] = useState('پاکستان کا آئی ٹی انقلاب اور فری لانسنگ');
  const [audience, setAudience] = useState('Pakistan & South Asian Urdu audience');
  const [loading, setLoading] = useState(false);
  const [seoData, setSeoData] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await generateSeoTools(topic, audience);
      setSeoData(res.data);
    } catch (e: any) {
      setErrorMsg(`SEO analysis error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Studio Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1f0d1a] via-[#241122] to-[#121626] border border-rose-500/20 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 mb-2">
          <TrendingUp className="w-4 h-4" />
          <span>YOUTUBE ALGORITHM &amp; CTR OPTIMIZATION</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          YouTube SEO &amp; Viral Ranking Tools
        </h2>
        <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
          Rank #1 on YouTube with high-CTR title variations, auto-chapter timestamp descriptions,
          high-volume tag clusters, and keyword difficulty analysis.
        </p>

        {/* Input */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter your video title or documentary topic..."
            className="flex-1 px-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm outline-none focus:border-rose-400"
          />
          <button
            disabled={loading || !topic.trim()}
            onClick={handleGenerate}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-rose-950/50 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing Algorithm...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Optimize Video SEO</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200">
            {errorMsg}
          </div>
        )}
      </div>

      {/* SEO Results Display */}
      {seoData && (
        <div className="space-y-6">
          {/* High-CTR Titles */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" />
                <span>High-CTR Title Variations (کلک کی شرح بڑھانے والے ٹائٹلز)</span>
              </h3>
              <span className="text-xs text-slate-400">Predicted CTR Score</span>
            </div>

            <div className="space-y-3">
              {seoData.optimizedTitles?.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                        {item.hookType || 'Curiosity'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white">{item.title}</p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold text-xs">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{item.ctrScore || 90}% CTR</span>
                    </div>

                    <button
                      onClick={() => handleCopy(item.title, `t-${idx}`)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
                    >
                      {copiedKey === `t-${idx}` ? (
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
                </div>
              ))}
            </div>
          </div>

          {/* Description & Timestamps */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>SEO DESCRIPTION &amp; TIMESTAMPS TEMPLATE</span>
              </span>
              <button
                onClick={() => handleCopy(seoData.descriptionTemplate, 'desc')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                {copiedKey === 'desc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Description</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={6}
              value={seoData.descriptionTemplate}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 outline-none"
            />
          </div>

          {/* Tags & Hashtags Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span>YOUTUBE STUDIO TAGS</span>
                </span>
                <button
                  onClick={() => handleCopy(seoData.tags?.join(', ') || '', 'tags')}
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  {copiedKey === 'tags' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy All Tags</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {seoData.tags?.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-purple-400" />
                  <span>VIRAL HASHTAGS</span>
                </span>
                <button
                  onClick={() => handleCopy(seoData.hashtags?.join(' ') || '', 'hash')}
                  className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  {copiedKey === 'hash' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Hashtags</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {seoData.hashtags?.map((hash: string, i: number) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono"
                  >
                    {hash}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Keywords Search Volume & Competition Analysis */}
          {seoData.keywordsAnalysis && (
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Search Volume &amp; Competition Difficulty Matrix</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-3 font-semibold">KEYWORD PHRASE</th>
                      <th className="pb-3 font-semibold">SEARCH VOLUME</th>
                      <th className="pb-3 font-semibold">COMPETITION</th>
                      <th className="pb-3 font-semibold">OPPORTUNITY SCORE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {seoData.keywordsAnalysis.map((kw: any, i: number) => (
                      <tr key={i} className="text-slate-200">
                        <td className="py-3 font-semibold text-white">{kw.keyword}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-medium">
                            {kw.searchVolume}
                          </span>
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded font-medium ${
                              kw.competition === 'Low'
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : 'bg-amber-500/15 text-amber-300'
                            }`}
                          >
                            {kw.competition}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white">
                              {kw.opportunityScore || 90}/100
                            </span>
                            <div className="w-20 bg-slate-800 rounded-full h-1.5">
                              <div
                                className="bg-emerald-400 h-full rounded-full"
                                style={{ width: `${kw.opportunityScore || 90}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
