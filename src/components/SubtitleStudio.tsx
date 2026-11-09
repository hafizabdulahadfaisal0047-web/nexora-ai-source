import React, { useState } from 'react';
import {
  Type,
  Sparkles,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  Clock,
  Eye,
  Film,
  ArrowRight,
  FileText,
  Sliders,
} from 'lucide-react';
import { SubtitleItem, VideoLanguage } from '../types';

interface SubtitleStudioProps {
  onLoadSubtitlesToEditor?: (subtitles: SubtitleItem[]) => void;
}

const DEFAULT_SUBTITLES: SubtitleItem[] = [
  { id: 'sub-1', startTime: 0.0, endTime: 3.5, text: '21ویں صدی میں کامیابی کے تمام روایتی طریقے بدل چکے ہیں۔', translation: 'In the 21st century, all traditional ways of success have changed.' },
  { id: 'sub-2', startTime: 3.5, endTime: 7.2, text: 'مصنوعی ذہانت اور نئی ٹیکنالوجی نے عالمی معیشت کو نئی شکل دی ہے۔', translation: 'Artificial intelligence and new technology have reshaped the global economy.' },
  { id: 'sub-3', startTime: 7.2, endTime: 11.0, text: 'کیا آپ اس نئے صنعتی انقلاب کے لیے تیار ہیں؟', translation: 'Are you prepared for this new industrial revolution?' },
];

export const SubtitleStudio: React.FC<SubtitleStudioProps> = ({ onLoadSubtitlesToEditor }) => {
  const [subtitles, setSubtitles] = useState<SubtitleItem[]>(DEFAULT_SUBTITLES);
  const [language, setLanguage] = useState<VideoLanguage>('urdu');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [captionStyle, setCaptionStyle] = useState<'highlight_pill' | 'glow_shadow' | 'clean_minimal'>('highlight_pill');
  const [activePreviewIdx, setActivePreviewIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  // Auto split script into subtitles
  const [rawScript, setRawScript] = useState('');

  const handleAutoGenerateFromScript = () => {
    if (!rawScript.trim()) return;
    const sentences = rawScript.split(/[۔.?!]/).map((s) => s.trim()).filter(Boolean);
    let currentTime = 0;
    const generated: SubtitleItem[] = sentences.map((sent, idx) => {
      const words = sent.split(/\s+/).length;
      const duration = Math.max(2.5, Math.min(7.0, words * 0.45));
      const item: SubtitleItem = {
        id: `sub_${Date.now()}_${idx}`,
        startTime: parseFloat(currentTime.toFixed(1)),
        endTime: parseFloat((currentTime + duration).toFixed(1)),
        text: sent,
      };
      currentTime += duration;
      return item;
    });

    setSubtitles(generated);
    setActivePreviewIdx(0);
    setRawScript('');
  };

  const handleAddSubtitle = () => {
    const last = subtitles[subtitles.length - 1];
    const newStart = last ? last.endTime : 0;
    const newItem: SubtitleItem = {
      id: `sub_${Date.now()}`,
      startTime: newStart,
      endTime: newStart + 3.5,
      text: language === 'urdu' ? 'نیا سب ٹائٹل یہاں درج کریں...' : 'Enter new subtitle text here...',
    };
    setSubtitles([...subtitles, newItem]);
  };

  const handleUpdateItem = (id: string, updates: Partial<SubtitleItem>) => {
    setSubtitles(subtitles.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleDeleteItem = (id: string) => {
    if (subtitles.length <= 1) return;
    setSubtitles(subtitles.filter((s) => s.id !== id));
  };

  // Export SRT
  const formatSrtTime = (seconds: number) => {
    const pad = (n: number, z = 2) => ('00' + n).slice(-z);
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(ms, 3)}`;
  };

  const generateSrtContent = () => {
    return subtitles
      .map((s, idx) => {
        return `${idx + 1}\n${formatSrtTime(s.startTime)} --> ${formatSrtTime(s.endTime)}\n${s.text}\n`;
      })
      .join('\n');
  };

  const handleDownloadSrt = () => {
    const srt = generateSrtContent();
    const blob = new Blob([srt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NEXORA_Subtitles_${language}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadVtt = () => {
    const vtt = `WEBVTT\n\n` + subtitles
      .map((s, idx) => {
        const start = formatSrtTime(s.startTime).replace(',', '.');
        const end = formatSrtTime(s.endTime).replace(',', '.');
        return `${idx + 1}\n${start} --> ${end}\n${s.text}\n`;
      })
      .join('\n');

    const blob = new Blob([vtt], { type: 'text/vtt;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NEXORA_Subtitles_${language}.vtt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isRTL = language === 'urdu' || language === 'arabic';
  const activeSub = subtitles[activePreviewIdx] || subtitles[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Studio Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-blue-950/50 border border-cyan-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Type className="w-3.5 h-3.5 text-cyan-400" />
            <span>SUBTITLE STUDIO (سب ٹائٹل اور کیپشن اسٹوڈیو)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Synchronized Captions, SRT Export &amp; RTL Typography
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Generate and edit word-synchronized subtitles in Urdu, Arabic, English, or Hindi. Export industry-standard .SRT and .VTT files ready for YouTube, Premiere Pro, CapCut, or burn-in directly on your video.
          </p>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Subtitle List & Script Ingestion */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Auto-Chunking Tool */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Auto-Generate Subtitles From Script</span>
              </span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as VideoLanguage)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-cyan-400 outline-none"
              >
                <option value="urdu">اردو (Urdu)</option>
                <option value="english">English</option>
                <option value="roman_urdu">Roman Urdu</option>
                <option value="arabic">العربية (Arabic)</option>
                <option value="hindi">हिन्दी (Hindi)</option>
              </select>
            </div>

            <textarea
              value={rawScript}
              onChange={(e) => setRawScript(e.target.value)}
              placeholder="Paste raw script or paragraphs here to automatically calculate subtitle sentence chunks and timestamps..."
              rows={3}
              className={`w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-xs outline-none focus:border-cyan-400 ${
                isRTL ? 'font-urdu text-sm leading-loose text-right' : ''
              }`}
            />

            <button
              disabled={!rawScript.trim()}
              onClick={handleAutoGenerateFromScript}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chunk Script into Timed Subtitles</span>
            </button>
          </div>

          {/* Subtitle Lines Editor */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Subtitle Sequence ({subtitles.length} Lines)
              </span>
              <button
                onClick={handleAddSubtitle}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Line</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {subtitles.map((sub, idx) => (
                <div
                  key={sub.id}
                  onClick={() => setActivePreviewIdx(idx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    activePreviewIdx === idx
                      ? 'bg-cyan-950/30 border-cyan-500/50 shadow-md'
                      : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-cyan-400 font-bold">#{idx + 1}</span>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                      <input
                        type="number"
                        step="0.1"
                        value={sub.startTime}
                        onChange={(e) => handleUpdateItem(sub.id, { startTime: parseFloat(e.target.value) || 0 })}
                        className="w-16 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-center text-white"
                      />
                      <span>➔</span>
                      <input
                        type="number"
                        step="0.1"
                        value={sub.endTime}
                        onChange={(e) => handleUpdateItem(sub.id, { endTime: parseFloat(e.target.value) || 0 })}
                        className="w-16 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-center text-white"
                      />
                      <span>({(sub.endTime - sub.startTime).toFixed(1)}s)</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(sub.id);
                      }}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={sub.text}
                    onChange={(e) => handleUpdateItem(sub.id, { text: e.target.value })}
                    className={`w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-cyan-400 ${
                      isRTL ? 'font-urdu text-sm leading-loose text-right' : ''
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Export Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadSrt}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .SRT</span>
                </button>
                <button
                  onClick={handleDownloadVtt}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .VTT</span>
                </button>
              </div>

              {onLoadSubtitlesToEditor && (
                <button
                  onClick={() => onLoadSubtitlesToEditor(subtitles)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Apply to Video Editor</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Subtitle Canvas Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Live Visual Subtitle Overlay</span>
            </h3>

            {/* Video Canvas Mockup */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center p-4 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80"
                alt="B-roll background"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

              {/* Subtitle Render */}
              <div className="absolute bottom-6 inset-x-6 text-center z-10">
                {captionStyle === 'highlight_pill' ? (
                  <div className="inline-block px-4 py-2 rounded-xl bg-black/85 backdrop-blur-md border border-cyan-500/40 shadow-2xl max-w-full">
                    <p
                      className={`font-bold text-white leading-loose ${
                        isRTL ? 'font-urdu text-base sm:text-lg' : 'text-xs sm:text-sm'
                      }`}
                    >
                      {activeSub?.text}
                    </p>
                  </div>
                ) : captionStyle === 'glow_shadow' ? (
                  <p
                    className={`font-black text-cyan-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] leading-relaxed ${
                      isRTL ? 'font-urdu text-lg sm:text-xl' : 'text-sm sm:text-base'
                    }`}
                  >
                    {activeSub?.text}
                  </p>
                ) : (
                  <p
                    className={`font-semibold text-white drop-shadow-md ${
                      isRTL ? 'font-urdu text-base' : 'text-xs'
                    }`}
                  >
                    {activeSub?.text}
                  </p>
                )}
              </div>
            </div>

            {/* Styling Controls */}
            <div className="space-y-3 pt-2 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block mb-1.5">Caption Aesthetic:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setCaptionStyle('highlight_pill')}
                    className={`py-1.5 px-2 rounded-xl font-semibold border transition-all ${
                      captionStyle === 'highlight_pill'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Dark Pill
                  </button>
                  <button
                    onClick={() => setCaptionStyle('glow_shadow')}
                    className={`py-1.5 px-2 rounded-xl font-semibold border transition-all ${
                      captionStyle === 'glow_shadow'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Neon Glow
                  </button>
                  <button
                    onClick={() => setCaptionStyle('clean_minimal')}
                    className={`py-1.5 px-2 rounded-xl font-semibold border transition-all ${
                      captionStyle === 'clean_minimal'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Clean Shadow
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
