import React, { useState, useRef, useEffect } from 'react';
import {
  Image as ImageIcon,
  Download,
  Sparkles,
  Upload,
  Type,
  Layers,
  Palette,
  Search,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { AspectRatio, StockVideo } from '../types';
import { searchStockVideos } from '../services/api';

const BADGE_PRESETS = ['DOCUMENTARY', 'EXPOSED', 'حقائق', 'MUST WATCH', 'NEW 2026', 'حیران کن'];

export const ThumbnailGeneratorStudio: React.FC = () => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [urduHeadline, setUrduHeadline] = useState('اربوں ڈالر کا خفیہ کھیل فاش!');
  const [englishHook, setEnglishHook] = useState('THE SHOCKING TRUTH BEHIND THIS CRISIS');
  const [selectedBadge, setSelectedBadge] = useState('DOCUMENTARY');
  const [headlineColor, setHeadlineColor] = useState('#facc15'); // Viral YouTube Yellow
  const [fontSize, setFontSize] = useState(64);
  const [showVignette, setShowVignette] = useState(true);

  // Background
  const [bgType, setBgType] = useState<'gradient' | 'image'>('gradient');
  const [gradientPreset, setGradientPreset] = useState<'cyber' | 'investigative' | 'royal' | 'gold'>('cyber');
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);

  // Pexels stock image search
  const [stockSearchQuery, setStockSearchQuery] = useState('stock trading office dark');
  const [stockLoading, setStockLoading] = useState(false);
  const [stockResults, setStockResults] = useState<StockVideo[]>([]);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Redraw canvas on any change
  useEffect(() => {
    drawThumbnail();
  }, [
    aspectRatio,
    urduHeadline,
    englishHook,
    selectedBadge,
    headlineColor,
    fontSize,
    showVignette,
    bgType,
    gradientPreset,
    bgImageUrl,
  ]);

  const drawThumbnail = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = aspectRatio === '9:16' ? 1080 : 1280;
    const height = aspectRatio === '9:16' ? 1920 : 720;
    canvas.width = width;
    canvas.height = height;

    const renderLayers = (loadedImg?: HTMLImageElement) => {
      // 1. Draw Background
      if (loadedImg && bgType === 'image') {
        const r = Math.max(width / loadedImg.width, height / loadedImg.height);
        const nw = loadedImg.width * r;
        const nh = loadedImg.height * r;
        const cx = (width - nw) / 2;
        const cy = (height - nh) / 2;
        ctx.drawImage(loadedImg, cx, cy, nw, nh);
      } else {
        // Gradient
        const grad = ctx.createLinearGradient(0, 0, width, height);
        if (gradientPreset === 'cyber') {
          grad.addColorStop(0, '#061727');
          grad.addColorStop(0.5, '#0b0f19');
          grad.addColorStop(1, '#1e1035');
        } else if (gradientPreset === 'investigative') {
          grad.addColorStop(0, '#2e0a0a');
          grad.addColorStop(0.5, '#09090b');
          grad.addColorStop(1, '#180e0e');
        } else if (gradientPreset === 'royal') {
          grad.addColorStop(0, '#130d24');
          grad.addColorStop(0.5, '#07090e');
          grad.addColorStop(1, '#0c1b2c');
        } else {
          // Gold
          grad.addColorStop(0, '#2b1a06');
          grad.addColorStop(0.5, '#0f0a05');
          grad.addColorStop(1, '#07090e');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Cinematic Vignette & Color Grades
      if (showVignette) {
        const radGrad = ctx.createRadialGradient(
          width / 2,
          height / 2,
          width * 0.2,
          width / 2,
          height / 2,
          width * 0.7
        );
        radGrad.addColorStop(0, 'rgba(0,0,0,0)');
        radGrad.addColorStop(1, 'rgba(0,0,0,0.85)');
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, width, height);

        // Bottom dark bar for text support
        const bottomFade = ctx.createLinearGradient(0, height * 0.4, 0, height);
        bottomFade.addColorStop(0, 'rgba(0,0,0,0)');
        bottomFade.addColorStop(1, 'rgba(0,0,0,0.9)');
        ctx.fillStyle = bottomFade;
        ctx.fillRect(0, height * 0.4, width, height * 0.6);
      }

      // 3. Draw Badge (Top Left or Center Top)
      if (selectedBadge) {
        ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
        const badgeMetrics = ctx.measureText(selectedBadge);
        const badgeW = badgeMetrics.width + 36;
        const badgeH = 44;
        const badgeX = aspectRatio === '9:16' ? width / 2 - badgeW / 2 : 60;
        const badgeY = aspectRatio === '9:16' ? 140 : 60;

        // Badge background
        ctx.fillStyle = '#ef4444'; // Red viral badge
        ctx.fillRect(badgeX, badgeY, badgeW, badgeH);

        // Badge text
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(selectedBadge, badgeX + badgeW / 2, badgeY + badgeH / 2);
      }

      // 4. Draw Primary Urdu Headline with Viral YouTube Outline
      if (urduHeadline) {
        ctx.font = `800 ${fontSize}px "Noto Nastaliq Urdu", "Amiri", serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const textY =
          aspectRatio === '9:16' ? height / 2 + 100 : height - height * 0.32;

        // Thick Black Outline for maximum contrast against any background
        ctx.lineWidth = 14;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(urduHeadline, width / 2, textY);

        // Secondary glow shadow
        ctx.shadowColor = headlineColor;
        ctx.shadowBlur = 18;
        ctx.fillStyle = headlineColor;
        ctx.fillText(urduHeadline, width / 2, textY);
        ctx.shadowBlur = 0;
      }

      // 5. Draw Secondary English Subtitle / Hook
      if (englishHook) {
        const engSize = Math.round(fontSize * 0.42);
        ctx.font = `800 ${engSize}px "Plus Jakarta Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const subY =
          aspectRatio === '9:16' ? height / 2 + 220 : height - height * 0.16;

        // Black outline
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(englishHook, width / 2, subY);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(englishHook, width / 2, subY);
      }
    };

    if (bgImageUrl && bgType === 'image') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = bgImageUrl;
      img.onload = () => renderLayers(img);
      img.onerror = () => renderLayers();
    } else {
      renderLayers();
    }
  };

  const handleDownloadThumbnail = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png', 0.95);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexora_thumbnail_${aspectRatio === '9:16' ? 'reel' : 'yt'}_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBgImageUrl(url);
      setBgType('image');
    }
  };

  const handleSearchStock = async () => {
    if (!stockSearchQuery.trim()) return;
    setStockLoading(true);
    try {
      const res = await searchStockVideos(
        stockSearchQuery,
        aspectRatio === '9:16' ? 'portrait' : 'landscape',
        9
      );
      setStockResults(res.videos);
    } catch (e) {
      console.error(e);
    } finally {
      setStockLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Studio Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1c140a] via-[#241a0d] to-[#121626] border border-amber-500/20 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-2">
          <ImageIcon className="w-4 h-4" />
          <span>VIRAL YOUTUBE &amp; REELS THUMBNAIL STUDIO</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          High-CTR Thumbnail Studio
        </h2>
        <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
          Design high-converting YouTube 16:9 and Reel 9:16 thumbnails. Includes viral Urdu Nastaliq typography,
          thick stroke outlines, dramatic cinematic light leaks, and Pexels background imagery.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Canvas Live Preview Stage */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center">
            <div className="flex items-center justify-between w-full mb-3 text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Canvas Live Render</span>
              <span>
                {aspectRatio === '16:9' ? '1280 × 720 (YouTube)' : '1080 × 1920 (Reels)'}
              </span>
            </div>

            <div
              className={`rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700 max-w-full flex items-center justify-center bg-black ${
                aspectRatio === '9:16' ? 'w-[280px] h-[497px]' : 'w-full aspect-video'
              }`}
            >
              <canvas ref={canvasRef} className="w-full h-full object-contain" />
            </div>

            <div className="pt-4 w-full flex justify-end">
              <button
                onClick={handleDownloadThumbnail}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-950/50 flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download High-Res Thumbnail (PNG)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Controls & Customizer */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-400" />
                <span>Thumbnail Customizer</span>
              </h3>

              {/* Aspect Ratio Switch */}
              <div className="flex items-center p-1 rounded-xl bg-slate-800 border border-slate-700 text-xs">
                <button
                  onClick={() => setAspectRatio('16:9')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    aspectRatio === '16:9' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  16:9 YT
                </button>
                <button
                  onClick={() => setAspectRatio('9:16')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    aspectRatio === '9:16' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  9:16 Reel
                </button>
              </div>
            </div>

            {/* Urdu Headline */}
            <div>
              <label className="block text-xs font-semibold text-amber-400 mb-1">
                PRIMARY URDU HEADLINE (بڑا اردو عنوان)
              </label>
              <input
                type="text"
                value={urduHeadline}
                onChange={(e) => setUrduHeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-urdu text-base outline-none focus:border-amber-400"
              />
            </div>

            {/* English Secondary Hook */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                ENGLISH HOOK / SUBTITLE
              </label>
              <input
                type="text"
                value={englishHook}
                onChange={(e) => setEnglishHook(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold outline-none"
              />
            </div>

            {/* Color & Size Controls */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  HEADLINE COLOR
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={headlineColor}
                    onChange={(e) => setHeadlineColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs font-mono text-slate-300 uppercase">{headlineColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex justify-between">
                  <span>FONT SIZE</span>
                  <span className="text-amber-400 font-mono">{fontSize}px</span>
                </label>
                <input
                  type="range"
                  min="32"
                  max="110"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Badges */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                CLICKABLE BADGE STICKER
              </label>
              <div className="flex flex-wrap gap-1.5">
                {BADGE_PRESETS.map((badge) => (
                  <button
                    key={badge}
                    onClick={() => setSelectedBadge(badge === selectedBadge ? '' : badge)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition-all ${
                      selectedBadge === badge
                        ? 'bg-rose-500 text-white border-rose-400 shadow'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {badge}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Style */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                BACKGROUND SOURCE
              </label>

              <div className="flex gap-2">
                <button
                  onClick={() => setBgType('gradient')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    bgType === 'gradient'
                      ? 'bg-slate-800 text-amber-300 border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Dark Gradient
                </button>
                <button
                  onClick={() => setBgType('image')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    bgType === 'image'
                      ? 'bg-slate-800 text-amber-300 border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Stock Photo / Upload
                </button>
              </div>

              {bgType === 'gradient' ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setGradientPreset('cyber')}
                    className="p-2 rounded-lg bg-[#061727] border border-cyan-500/30 text-xs text-cyan-300 font-semibold"
                  >
                    Cyber Cyan
                  </button>
                  <button
                    onClick={() => setGradientPreset('investigative')}
                    className="p-2 rounded-lg bg-[#2e0a0a] border border-rose-500/30 text-xs text-rose-300 font-semibold"
                  >
                    Investigation Red
                  </button>
                  <button
                    onClick={() => setGradientPreset('royal')}
                    className="p-2 rounded-lg bg-[#130d24] border border-purple-500/30 text-xs text-purple-300 font-semibold"
                  >
                    Royal Purple
                  </button>
                  <button
                    onClick={() => setGradientPreset('gold')}
                    className="p-2 rounded-lg bg-[#2b1a06] border border-amber-500/30 text-xs text-amber-300 font-semibold"
                  >
                    Golden Desert
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsStockModalOpen(true)}
                      className="flex-1 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Search Pexels Photo</span>
                    </button>

                    <label className="cursor-pointer py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCustomImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stock Image Modal */}
      {isStockModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Search Stock Photo</h3>
              <button
                onClick={() => setIsStockModalOpen(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={stockSearchQuery}
                onChange={(e) => setStockSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchStock()}
                placeholder="Search thumbnail background photo..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white outline-none"
              />
              <button
                onClick={handleSearchStock}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Search
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
              {stockLoading ? (
                <div className="col-span-full text-center py-10 text-slate-400">Loading...</div>
              ) : (
                stockResults.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => {
                      setBgImageUrl(v.preview);
                      setBgType('image');
                      setIsStockModalOpen(false);
                    }}
                    className="cursor-pointer aspect-video rounded-xl overflow-hidden border border-slate-700 hover:border-amber-400"
                  >
                    <img src={v.preview} alt={v.title} className="w-full h-full object-cover" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
