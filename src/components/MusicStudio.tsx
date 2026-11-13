import React, { useState, useRef, useEffect } from 'react';
import {
  Music,
  Play,
  Pause,
  Download,
  Volume2,
  Sliders,
  ShieldCheck,
  Sparkles,
  Check,
  Disc,
  Radio,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { BgmCategory } from '../types';
import {
  ROYALTY_FREE_SOUNDTRACKS,
  SoundtrackTrack,
  generateSoundtrackBuffer,
  audioBufferToWavBlob,
} from '../services/audioEngine';

interface MusicStudioProps {
  onSelectMusicForProject?: (trackName: string) => void;
}

const CATEGORIES: { id: BgmCategory | 'All'; label: string }[] = [
  { id: 'All', label: 'All Categories' },
  { id: 'Cinematic Documentary', label: 'Cinematic Documentary' },
  { id: 'Emotional', label: 'Emotional & Moving' },
  { id: 'Suspense', label: 'Suspense & Stakes' },
  { id: 'Motivational', label: 'Motivational & Epic' },
  { id: 'Islamic Ambient', label: 'Islamic Ambient (432Hz)' },
  { id: 'Corporate', label: 'Corporate & Strategy' },
  { id: 'Technology', label: 'Technology & Cyber' },
  { id: 'News', label: 'News & Broadcast' },
  { id: 'Silence', label: 'Silence (No BGM)' },
];

export const MusicStudio: React.FC<MusicStudioProps> = ({ onSelectMusicForProject }) => {
  const [selectedCategory, setSelectedCategory] = useState<BgmCategory | 'All'>('All');
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0.7);
  const [duckingLevel, setDuckingLevel] = useState<number>(0.3); // 30% during speech
  const [fadeInSeconds, setFadeInSeconds] = useState<number>(1.5);
  const [fadeOutSeconds, setFadeOutSeconds] = useState<number>(2.0);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live Web Audio Preview Controller
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

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

  const handleTogglePlay = async (track: SoundtrackTrack) => {
    if (track.category === 'Silence') {
      stopPlayback();
      return;
    }

    if (activePlayingId === track.id) {
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
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Generate a 45-second high-fidelity audition buffer
      const buffer = await generateSoundtrackBuffer(ctx.sampleRate, track.name, 45);

      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + fadeInSeconds);

      src.connect(gain);
      gain.connect(ctx.destination);

      sourceNodeRef.current = src;
      gainNodeRef.current = gain;
      setActivePlayingId(track.id);

      src.start(0);
    } catch (err) {
      console.warn('Track audition error:', err);
      setActivePlayingId(null);
    }
  };

  // Adjust volume live
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Export full .WAV audio file
  const handleDownloadWav = async (track: SoundtrackTrack) => {
    setDownloadingId(track.id);
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass();
      const buffer = await generateSoundtrackBuffer(ctx.sampleRate, track.name, 60);
      const blob = audioBufferToWavBlob(buffer);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NEXORA_${track.name.replace(/\s+/g, '_')}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to generate downloadable WAV track.');
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredTracks =
    selectedCategory === 'All'
      ? ROYALTY_FREE_SOUNDTRACKS
      : ROYALTY_FREE_SOUNDTRACKS.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Studio Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-rose-950/50 border border-amber-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Music className="w-3.5 h-3.5 text-amber-400" />
            <span>ROYALTY-FREE MUSIC STUDIO (موسیقی اسٹوڈیو)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Broadcast-Grade Music with Auto-Ducking
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Choose from 8 curated categories plus pure silence. Every track is commercial royalty-free, seamlessly spans your video duration without loop glitches, and automatically ducks down 70% during speech.
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

      {/* Global Volume & Auto-Ducking Controls */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Audio Mastering &amp; Voice-Over Auto-Ducking</span>
          </span>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> 100% Commercial Royalty-Free
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Master Music Volume:</span>
              <span className="font-mono text-cyan-400 font-bold">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Speech Auto-Ducking Level:</span>
              <span className="font-mono text-amber-400 font-bold">{Math.round(duckingLevel * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.6"
              step="0.05"
              value={duckingLevel}
              onChange={(e) => setDuckingLevel(parseFloat(e.target.value))}
              className="w-full accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Ducks music to {Math.round(duckingLevel * 100)}% when narration speaks</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Fade In Duration:</span>
              <span className="font-mono text-purple-400 font-bold">{fadeInSeconds}s</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.5"
              value={fadeInSeconds}
              onChange={(e) => setFadeInSeconds(parseFloat(e.target.value))}
              className="w-full accent-purple-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Fade Out Duration:</span>
              <span className="font-mono text-rose-400 font-bold">{fadeOutSeconds}s</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={fadeOutSeconds}
              onChange={(e) => setFadeOutSeconds(parseFloat(e.target.value))}
              className="w-full accent-rose-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategory === cat.id
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-950/40'
                : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTracks.map((track) => {
          const isPlaying = activePlayingId === track.id;
          const isSilence = track.category === 'Silence';

          return (
            <div
              key={track.id}
              className={`p-6 rounded-3xl border transition-all space-y-4 shadow-xl flex flex-col justify-between ${
                isPlaying
                  ? 'bg-amber-950/30 border-amber-500/50 shadow-amber-950/30'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 uppercase tracking-wide border border-slate-700">
                      {track.category}
                    </span>
                    <h3 className="text-base font-extrabold text-white">{track.name}</h3>
                  </div>

                  {!isSilence && (
                    <button
                      onClick={() => handleTogglePlay(track)}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform hover:scale-105 shrink-0 ${
                        isPlaying
                          ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/40'
                          : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-amber-300 ml-0.5" />}
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{track.description}</p>

                {/* Track Specs */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>BPM: {track.bpm > 0 ? track.bpm : '—'}</span>
                  <span>Tempo: {track.tempo}</span>
                  <span className="text-emerald-400 font-medium font-sans">✓ Verified CC0</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                {!isSilence && (
                  <button
                    disabled={downloadingId === track.id}
                    onClick={() => handleDownloadWav(track)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloadingId === track.id ? 'Generating...' : 'WAV'}</span>
                  </button>
                )}

                {onSelectMusicForProject && (
                  <button
                    onClick={() => onSelectMusicForProject(track.name)}
                    className="flex-1 px-3 py-2 rounded-xl bg-amber-600/30 hover:bg-amber-600 text-amber-200 hover:text-white border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>Use in Video Project</span>
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
