import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Volume2,
  Play,
  Pause,
  Square,
  Download,
  Sparkles,
  Sliders,
  Copy,
  Check,
  RotateCcw,
  RefreshCw,
  FileAudio,
  Radio,
  AlertCircle,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import {
  UrduVoiceService,
  VoiceOption,
  SpeechSupportInfo,
  VoiceRecorder,
  synthesizeSoundEffect,
} from '../services/audioSynthesizer';
import { generateSpeechAudio } from '../services/api';

const URDU_SAMPLE_SCRIPTS = [
  {
    title: 'کاروباری ڈاکومنٹری کا تعارف',
    text: '21ویں صدی میں کامیابی صرف محنت سے نہیں ملتی، بلکہ یہ سمجھنے سے ملتی ہے کہ مارکیٹ کے اصول کب بدل گئے۔',
  },
  {
    title: 'روحانی سکون اور صبر',
    text: 'زندگی کی ہر آزمائش میں صبر اور اللہ پر توکل ہی سب سے بڑی ڈھال ہے۔ یاد رکھیں کہ ہر تنگی کے ساتھ آسانی ہے۔',
  },
  {
    title: 'ٹیکنالوجی اور مصنوعی ذہانت',
    text: 'مصنوعی ذہانت اور آٹومیشن نے پوری دنیا کے مالیاتی نظام کو چند ہی سالوں میں مکمل تبدیل کر دیا ہے۔',
  },
];

export const UrduVoiceStudio: React.FC = () => {
  const [text, setText] = useState(URDU_SAMPLE_SCRIPTS[0].text);
  const [rate, setRate] = useState(0.95);
  const [pitch, setPitch] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [copied, setCopied] = useState(false);

  // Voice engine & state
  const [voiceService, setVoiceService] = useState<UrduVoiceService | null>(null);
  const [playbackState, setPlaybackState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [supportInfo, setSupportInfo] = useState<SpeechSupportInfo | null>(null);

  // Alternative AI Studio TTS State
  const [isGeneratingAiTts, setIsGeneratingAiTts] = useState(false);
  const [aiTtsAudioUrl, setAiTtsAudioUrl] = useState<string | null>(null);

  // Microphone recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<any>(null);
  const recorderRef = useRef<VoiceRecorder | null>(null);

  // Sound FX generated
  const [sfxUrl, setSfxUrl] = useState<string | null>(null);
  const [sfxType, setSfxType] = useState<'boom' | 'whoosh' | 'drone' | 'chime'>('boom');

  useEffect(() => {
    const service = new UrduVoiceService((newState) => {
      setPlaybackState(newState);
    });
    setVoiceService(service);
    recorderRef.current = new VoiceRecorder();

    // Check voices
    const refreshVoiceList = () => {
      const vOptions = service.getVoiceOptions();
      setVoices(vOptions);
      const info = service.checkSupport();
      setSupportInfo(info);

      const urdu = vOptions.find((v) => v.isUrdu);
      const regional = vOptions.find((v) => v.isRegional);
      if (urdu) {
        setSelectedVoiceName(urdu.name);
      } else if (regional) {
        setSelectedVoiceName(regional.name);
      } else if (vOptions[0]) {
        setSelectedVoiceName(vOptions[0].name);
      }
    };

    refreshVoiceList();
    const timer = setTimeout(refreshVoiceList, 400);

    return () => {
      clearTimeout(timer);
      service.stop();
    };
  }, []);

  const handlePlay = () => {
    if (!voiceService) return;

    if (playbackState === 'paused') {
      voiceService.resume();
      return;
    }

    const selectedVoice = voices.find((v) => v.name === selectedVoiceName)?.voice || null;
    voiceService.speak(text, {
      voice: selectedVoice,
      rate,
      pitch,
      volume,
      onEnd: () => setPlaybackState('idle'),
      onError: (err) => {
        console.warn('Speech error:', err);
        setPlaybackState('idle');
      },
    });
  };

  const handlePause = () => {
    voiceService?.pause();
  };

  const handleStop = () => {
    voiceService?.stop();
    setPlaybackState('idle');
  };

  const handleGenerateAiStudioTts = async () => {
    if (!text.trim()) return;
    setIsGeneratingAiTts(true);
    setAiTtsAudioUrl(null);

    try {
      const res = await generateSpeechAudio(text, 'Kore');
      if (res.success && res.dataUri) {
        setAiTtsAudioUrl(res.dataUri);
        const audio = new Audio(res.dataUri);
        audio.volume = volume;
        audio.play().catch(() => {});
      } else {
        alert(
          'Gemini TTS response notice: Server generated local speech fallback audio.'
        );
      }
    } catch (e: any) {
      alert(`TTS error: ${e.message}`);
    } finally {
      setIsGeneratingAiTts(false);
    }
  };

  const handleToggleRecord = async () => {
    if (!recorderRef.current) return;

    if (isRecording) {
      clearInterval(recordingTimerRef.current);
      const res = await recorderRef.current.stopRecording();
      setRecordedAudioUrl(res.url);
      setIsRecording(false);
      setRecordingSeconds(0);
    } else {
      setRecordedAudioUrl(null);
      await recorderRef.current.startRecording();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleGenerateSfx = async (type: 'boom' | 'whoosh' | 'drone' | 'chime') => {
    setSfxType(type);
    const res = await synthesizeSoundEffect(type);
    setSfxUrl(res.url);
    const audio = new Audio(res.url);
    audio.play();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Studio Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0d172e] via-[#0e1d3d] to-[#171336] border border-blue-500/20 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-2">
          <Mic className="w-4 h-4" />
          <span>URDU SPEECH SYNTHESIS &amp; AUDIO RECORDER</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Urdu Voice Studio (اردو وائس جنریٹر)
        </h2>
        <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
          Generate authentic Urdu voiceovers with pitch and speed modulation, test SpeechSynthesis in real
          time with dedicated Play/Pause/Stop controls, and render studio-quality AI audio (.WAV).
        </p>
      </div>

      {/* Support Status & No-Urdu Voice Notice (Requirement 1) */}
      {supportInfo && !supportInfo.hasUrduVoice && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-300 uppercase tracking-wide">
                No Native Urdu Voice Found on System
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                {supportInfo.totalVoices} System Voices Detected
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Your browser does not have a native Urdu (ur-PK) voice package installed. NEXORA AI provides
              two solutions:
            </p>
            <ul className="list-disc list-inside text-slate-400 pl-1 space-y-0.5">
              <li>
                <strong>Regional Voice Fallback:</strong> Select a Hindi/Arabic voice below which uses similar phonetics.
              </li>
              <li>
                <strong>Studio AI Voice (WAV):</strong> Click the purple <em>"Generate AI Studio Voice (WAV)"</em> button below to synthesize studio audio directly through Gemini 3.8 Flash Lite TTS!
              </li>
            </ul>
          </div>
        </div>
      )}

      {supportInfo?.hasUrduVoice && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Native Urdu Voice Detected: <strong>{supportInfo.urduVoiceName}</strong></span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
            SpeechSynthesis Ready
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Text-to-Speech Lab */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide">
                Urdu Narration Script
              </span>
              <button
                onClick={handleCopy}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>

            <textarea
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="یہاں اپنی اردو ڈاکومنٹری یا ریل کا اسکرپٹ لکھیں..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white font-urdu text-lg leading-loose outline-none focus:border-cyan-400 transition-colors"
            />

            {/* Quick Sample Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Quick Samples:</span>
              <div className="flex flex-wrap gap-2">
                {URDU_SAMPLE_SCRIPTS.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setText(item.text)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all font-urdu"
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Selector Dropdown (Requirement 1) */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="block text-[11px] font-semibold text-slate-300">
                SELECT VOICE (آواز کا انتخاب)
              </label>
              <select
                value={selectedVoiceName}
                onChange={(e) => setSelectedVoiceName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-cyan-400"
              >
                {voices.map((v, i) => (
                  <option key={i} value={v.name}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Modulation Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex justify-between">
                  <span>SPEECH RATE</span>
                  <span className="text-cyan-400 font-mono">{rate.toFixed(2)}x</span>
                </label>
                <input
                  type="range"
                  min="0.6"
                  max="1.5"
                  step="0.05"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex justify-between">
                  <span>PITCH</span>
                  <span className="text-cyan-400 font-mono">{pitch.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0.7"
                  max="1.4"
                  step="0.05"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex justify-between">
                  <span>VOLUME</span>
                  <span className="text-cyan-400 font-mono">{Math.round(volume * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Play, Pause, and Stop Controls (Requirement 1) */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-3">
              <button
                onClick={handlePlay}
                disabled={!text.trim()}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                  playbackState === 'playing'
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-950/60'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-slate-950'
                }`}
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>{playbackState === 'playing' ? 'Playing Voiceover' : 'Play Speech'}</span>
              </button>

              <button
                onClick={handlePause}
                disabled={playbackState !== 'playing'}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all disabled:opacity-40"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>

              <button
                onClick={handleStop}
                disabled={playbackState === 'idle'}
                className="px-4 py-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-bold border border-rose-500/30 flex items-center gap-1.5 transition-all disabled:opacity-40"
              >
                <Square className="w-4 h-4 fill-rose-300" />
                <span>Stop</span>
              </button>
            </div>

            {/* Alternative AI TTS Action (Requirement 1) */}
            <div className="pt-2">
              <button
                disabled={isGeneratingAiTts || !text.trim()}
                onClick={handleGenerateAiStudioTts}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isGeneratingAiTts ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing Studio Audio with Gemini TTS...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Generate AI Studio Urdu Voice (.WAV Audio File)</span>
                  </>
                )}
              </button>
            </div>

            {aiTtsAudioUrl && (
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between text-xs">
                <span className="text-purple-300 font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Studio Voice Audio Ready</span>
                </span>
                <a
                  href={aiTtsAudioUrl}
                  download="urdu_narration_studio.wav"
                  className="px-3 py-1 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download WAV</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Microphone Recording & Sound FX Lab */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Mic Recording Studio */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-500" />
                <span>Live Voice Recording Studio</span>
              </h3>
              {isRecording && (
                <span className="flex items-center gap-1.5 text-xs font-mono text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  REC {recordingSeconds}s
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Record your authentic human voiceover directly with your microphone. Audio is saved as a clean track
              ready to be synced with any video scene.
            </p>

            <div className="py-4 flex flex-col items-center justify-center space-y-3">
              <button
                onClick={handleToggleRecord}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-2xl shadow-rose-900/60 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 shadow-lg'
                }`}
              >
                {isRecording ? <Square className="w-8 h-8 fill-white" /> : <Mic className="w-8 h-8" />}
              </button>
              <span className="text-xs font-semibold text-slate-300">
                {isRecording ? 'Click to Stop Recording' : 'Click to Start Recording'}
              </span>
            </div>

            {recordedAudioUrl && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
                  <span>Recording Saved</span>
                  <a
                    href={recordedAudioUrl}
                    download="nexora_voiceover.webm"
                    className="flex items-center gap-1 text-cyan-400 hover:text-white"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Audio</span>
                  </a>
                </div>
                <audio src={recordedAudioUrl} controls className="w-full h-10" />
              </div>
            )}
          </div>

          {/* Sound FX & Synthesizer */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Cinematic Audio SFX Synthesizer</span>
            </h3>
            <p className="text-xs text-slate-400">
              Generate instant royalty-free sound effects for transitions and tension.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleGenerateSfx('boom')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  sfxType === 'boom' && sfxUrl
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                <span>💥 Cinematic Boom</span>
                <Play className="w-3 h-3" />
              </button>

              <button
                onClick={() => handleGenerateSfx('whoosh')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  sfxType === 'whoosh' && sfxUrl
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                <span>💨 Fast Whoosh</span>
                <Play className="w-3 h-3" />
              </button>

              <button
                onClick={() => handleGenerateSfx('drone')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  sfxType === 'drone' && sfxUrl
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                <span>🎵 Tension Drone</span>
                <Play className="w-3 h-3" />
              </button>

              <button
                onClick={() => handleGenerateSfx('chime')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  sfxType === 'chime' && sfxUrl
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                <span>✨ Peaceful Chime</span>
                <Play className="w-3 h-3" />
              </button>
            </div>

            {sfxUrl && (
              <div className="pt-2 flex justify-end">
                <a
                  href={sfxUrl}
                  download={`sfx_${sfxType}.wav`}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download SFX (.wav)</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
