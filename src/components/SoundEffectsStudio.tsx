import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  Play,
  Pause,
  Download,
  Sparkles,
  Zap,
  ArrowRight,
  Sliders,
  Check,
  AlertCircle,
} from 'lucide-react';
import { SoundEffectItem } from '../types';
import {
  SOUND_EFFECTS_CATALOG,
  generateTransitionSfxBuffer,
  audioBufferToWavBlob,
} from '../services/audioEngine';

interface SoundEffectsStudioProps {
  onInsertIntoVideo?: (sfxName: string) => void;
}

export const SoundEffectsStudio: React.FC<SoundEffectsStudioProps> = ({ onInsertIntoVideo }) => {
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0.85);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    return () => {
      stopPlayback();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const stopPlayback = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch (_) {}
      sourceNodeRef.current = null;
    }
    setActivePlayingId(null);
  };

  const handleAudition = async (sfx: SoundEffectItem) => {
    if (activePlayingId === sfx.id) {
      stopPlayback();
      return;
    }

    stopPlayback();

    try {
      let ctx = audioCtxRef.current;
      if (!ctx || ctx.state === 'closed') {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        ctx = new AudioCtxClass();
        audioCtxRef.current = ctx;
      }
      if (ctx.state === 'suspended') await ctx.resume();

      const buffer = await generateTransitionSfxBuffer(ctx.sampleRate, sfx.type);

      const src = ctx.createBufferSource();
      src.buffer = buffer;

      const gain = ctx.createGain();
      gain.gain.value = volume;
      src.connect(gain);
      gain.connect(ctx.destination);

      sourceNodeRef.current = src;
      setActivePlayingId(sfx.id);

      src.onended = () => {
        if (activePlayingId === sfx.id) {
          setActivePlayingId(null);
        }
      };

      src.start(0);
    } catch (err) {
      console.warn('Audition error:', err);
      setActivePlayingId(null);
    }
  };

  const handleDownloadWav = async (sfx: SoundEffectItem) => {
    setDownloadingId(sfx.id);
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass();
      const buffer = await generateTransitionSfxBuffer(ctx.sampleRate, sfx.type);
      const blob = audioBufferToWavBlob(buffer);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NEXORA_SFX_${sfx.name.replace(/\s+/g, '_')}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to export WAV sound effect.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-amber-950/50 border border-rose-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-rose-400" />
            <span>SOUND EFFECTS STUDIO (صوتی اثرات لائبریری)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Cinematic Impact &amp; Transition Sound Effects
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Audition and download royalty-free studio sound effects for cinematic transitions, title reveals, glitch text animations, and documentary pacing.
          </p>
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

      {/* Volume Control */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4 max-w-md">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-rose-400" />
          <span>Audition Volume:</span>
        </span>
        <div className="flex items-center gap-3 flex-1">
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 accent-rose-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
          <span className="font-mono text-xs text-rose-400 font-bold">{Math.round(volume * 100)}%</span>
        </div>
      </div>

      {/* SFX Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SOUND_EFFECTS_CATALOG.map((sfx) => {
          const isPlaying = activePlayingId === sfx.id;

          return (
            <div
              key={sfx.id}
              className={`p-6 rounded-3xl border transition-all space-y-4 shadow-xl flex flex-col justify-between ${
                isPlaying
                  ? 'bg-rose-950/30 border-rose-500/50 shadow-rose-950/30'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-rose-400 uppercase tracking-wide border border-slate-700">
                      {sfx.category}
                    </span>
                    <h3 className="text-base font-extrabold text-white">{sfx.name}</h3>
                  </div>

                  <button
                    onClick={() => handleAudition(sfx)}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform hover:scale-105 shrink-0 ${
                      isPlaying
                        ? 'bg-rose-500 text-slate-950 shadow-lg shadow-rose-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-rose-300'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-rose-300 ml-0.5" />}
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{sfx.description}</p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Duration: ~{sfx.durationSeconds}s</span>
                  <span className="text-emerald-400 font-medium font-sans">✓ Free Commercial CC0</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  disabled={downloadingId === sfx.id}
                  onClick={() => handleDownloadWav(sfx)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloadingId === sfx.id ? 'Exporting...' : 'WAV'}</span>
                </button>

                {onInsertIntoVideo && (
                  <button
                    onClick={() => onInsertIntoVideo(sfx.name)}
                    className="flex-1 px-3 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>Use in Video</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
