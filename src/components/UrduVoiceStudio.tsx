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
  ArrowRight,
  Film,
} from 'lucide-react';
import {
  UrduVoiceService,
  VoiceOption,
  SpeechSupportInfo,
  VoiceRecorder,
} from '../services/audioSynthesizer';
import { generateSpeechAudio } from '../services/api';
import { VideoLanguage } from '../types';

interface UrduVoiceStudioProps {
  onLoadVoiceToEditor?: (audioUrl: string, language: VideoLanguage) => void;
}

const SAMPLE_SCRIPTS_BY_LANG: Record<VideoLanguage, { title: string; text: string }[]> = {
  urdu: [
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
  ],
  english: [
    {
      title: 'Documentary Cold Open',
      text: 'In the history of global economics, few transformations happened as quietly or ruthlessly as this.',
    },
    {
      title: 'High-Retention Hook',
      text: 'There is a single documented truth about modern financial monopolies that nobody is talking about.',
    },
  ],
  roman_urdu: [
    {
      title: 'Business Mystery Hook',
      text: 'Dosto aaj hum dekhenge ke Dubai me log itna paisa kaise kama rahe hain aur tax free economy ke peeche asal haqeeqat kya hai.',
    },
  ],
  arabic: [
    {
      title: 'روحانية وتأمل',
      text: 'إن مع العسر يسراً، فإذا أغلقت أمامك الأبواب فتذكر أن رحمة الله وسعت كل شيء.',
    },
  ],
  hindi: [
    {
      title: 'बिजनेस केस स्टडी',
      text: 'इक्कीसवीं सदी में असली सफलता केवल मेहनत से नहीं, बल्कि मार्केट के बदलते नियमों को समझने से मिलती है।',
    },
  ],
  bilingual: [
    {
      title: 'Bilingual Tech Explainer',
      text: 'Artificial Intelligence ne globally traditional business models ko completely transform kar diya hai.',
    },
  ],
};

const GEMINI_TTS_VOICES = [
  { id: 'Kore', name: 'Kore (Authoritative & Deep Narrator)', gender: 'Female', mood: 'Calm & Authoritative' },
  { id: 'Puck', name: 'Puck (Dynamic & Engaging Storyteller)', gender: 'Male', mood: 'Punchy & Energetic' },
  { id: 'Charon', name: 'Charon (Cinematic Documentary Deep)', gender: 'Male', mood: 'Low & Resonant' },
  { id: 'Fenrir', name: 'Fenrir (Commanding & Investigative)', gender: 'Male', mood: 'Serious & Strong' },
  { id: 'Zephyr', name: 'Zephyr (Warm & Expressive)', gender: 'Female', mood: 'Empathetic & Smooth' },
];

export const UrduVoiceStudio: React.FC<UrduVoiceStudioProps> = ({ onLoadVoiceToEditor }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<VideoLanguage>('urdu');
  const [text, setText] = useState(SAMPLE_SCRIPTS_BY_LANG.urdu[0].text);
  const [rate, setRate] = useState(0.95);
  const [pitch, setPitch] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [copied, setCopied] = useState(false);

  // Gemini AI Voice selection
  const [aiVoiceName, setAiVoiceName] = useState('Kore');
  const [isGeneratingAiTts, setIsGeneratingAiTts] = useState(false);
  const [aiTtsAudioUrl, setAiTtsAudioUrl] = useState<string | null>(null);

  // Browser Speech synthesis engine
  const [voiceService, setVoiceService] = useState<UrduVoiceService | null>(null);
  const [playbackState, setPlaybackState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [supportInfo, setSupportInfo] = useState<SpeechSupportInfo | null>(null);

  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isAiAudioPlaying, setIsAiAudioPlaying] = useState(false);

  useEffect(() => {
    const service = new UrduVoiceService((newState) => {
      setPlaybackState(newState);
    });
    setVoiceService(service);

    const refreshVoiceList = () => {
      const vOptions = service.getVoicesForLanguage(selectedLanguage);
      setVoices(vOptions);
      const info = service.checkSupport();
      setSupportInfo(info);

      if (vOptions[0]) {
        setSelectedVoiceName(vOptions[0].name);
      }
    };

    refreshVoiceList();
    const timer = setTimeout(refreshVoiceList, 400);

    return () => {
      clearTimeout(timer);
      service.stop();
      if (aiTtsAudioUrl) {
        URL.revokeObjectURL(aiTtsAudioUrl);
      }
    };
  }, [selectedLanguage]);

  // Handle language switch
  const handleLanguageChange = (lang: VideoLanguage) => {
    setSelectedLanguage(lang);
    const samples = SAMPLE_SCRIPTS_BY_LANG[lang] || SAMPLE_SCRIPTS_BY_LANG.urdu;
    if (samples[0]) {
      setText(samples[0].text);
    }
    setAiTtsAudioUrl(null);
  };

  // Browser speech handlers
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

  // Server Gemini 3.8 Flash Lite TTS Studio Voice
  const handleGenerateAiStudioTts = async () => {
    if (!text.trim()) return;
    setIsGeneratingAiTts(true);
    setAiTtsAudioUrl(null);

    try {
      const res = await generateSpeechAudio(text, aiVoiceName, selectedLanguage, rate);
      if (res.success && res.dataUri) {
        setAiTtsAudioUrl(res.dataUri);
        // Instant test playback
        const audio = new Audio(res.dataUri);
        audio.volume = volume;
        audio.play().catch(() => {});
      } else {
        alert('Server generated speech synthesis fallback audio.');
      }
    } catch (e: any) {
      alert(`TTS error: ${e.message}`);
    } finally {
      setIsGeneratingAiTts(false);
    }
  };

  const isRTL = selectedLanguage === 'urdu' || selectedLanguage === 'arabic';

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Studio Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-cyan-950/50 border border-blue-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
            <Mic className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI VOICE GENERATOR &amp; TTS STUDIO (صوتی تخلیق کار)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Authentic Multi-Language Urdu &amp; Global AI Voices
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Generate authentic Urdu documentary narration, classical Arabic bayan recitation, and English case study voiceovers. Includes Gemini 3.8 Flash Lite studio WAV audio generation and browser speech synthesis.
          </p>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Script Text & Parameters */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                VOICEOVER SCRIPT TO SYNTHESIZE
              </label>

              {/* Language Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Language:</span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value as VideoLanguage)}
                  className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-cyan-400 outline-none"
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
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="Enter voiceover text..."
              className={`w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-slate-600 text-sm outline-none transition-all leading-relaxed ${
                isRTL ? 'font-urdu text-base leading-loose text-right' : ''
              }`}
            />

            {/* Sample Prompts for this language */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-slate-400 font-semibold mr-1">Sample Scripts:</span>
              {(SAMPLE_SCRIPTS_BY_LANG[selectedLanguage] || []).map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setText(s.text)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                >
                  {s.title}
                </button>
              ))}
            </div>

            {/* Vocal Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Speech Rate / Speed:</span>
                  <span className="font-mono text-cyan-400 font-bold">{rate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Voice Pitch:</span>
                  <span className="font-mono text-purple-400 font-bold">{pitch.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.3"
                  step="0.05"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full accent-purple-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Volume:</span>
                  <span className="font-mono text-emerald-400 font-bold">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Play, Pause & Stop Controls */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlay}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-950/40"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>{playbackState === 'paused' ? 'Resume Speech' : 'Play Preview'}</span>
                </button>

                <button
                  onClick={handlePause}
                  disabled={playbackState !== 'playing'}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition-colors"
                >
                  <Pause className="w-4 h-4" />
                </button>

                <button
                  onClick={handleStop}
                  disabled={playbackState === 'idle'}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition-colors"
                >
                  <Square className="w-4 h-4" />
                </button>
              </div>

              {/* Native Voice Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Voice:</span>
                <select
                  value={selectedVoiceName}
                  onChange={(e) => setSelectedVoiceName(e.target.value)}
                  className="max-w-[200px] px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none truncate"
                >
                  {voices.map((v, i) => (
                    <option key={i} value={v.name}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Studio Broadcast WAV Generation */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/30 space-y-5 shadow-2xl">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>AI Studio Master Voice (.WAV)</span>
              </div>
              <h3 className="text-base font-extrabold text-white">
                Generate Studio-Grade WAV Voice File
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Uses Google Gemini 3.8 Flash Lite TTS to generate a broadcast 24kHz lossless WAV narration file.
              </p>
            </div>

            {/* AI Voice Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase">
                Select Persona &amp; Cadence
              </label>
              <div className="grid grid-cols-1 gap-2">
                {GEMINI_TTS_VOICES.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setAiVoiceName(v.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between text-xs ${
                      aiVoiceName === v.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md'
                        : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-white block">{v.name}</span>
                      <span className="text-[10px] text-slate-400">{v.mood}</span>
                    </div>
                    {aiVoiceName === v.id && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              disabled={isGeneratingAiTts || !text.trim()}
              onClick={handleGenerateAiStudioTts}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-90 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-950/50 transition-all disabled:opacity-50"
            >
              {isGeneratingAiTts ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing 24kHz Audio...</span>
                </>
              ) : (
                <>
                  <FileAudio className="w-4 h-4" />
                  <span>Generate AI Studio Voice (.WAV)</span>
                </>
              )}
            </button>

            {/* Generated Audio Card */}
            {aiTtsAudioUrl && (
              <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Ready for Export
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">24kHz WAV</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <a
                    href={aiTtsAudioUrl}
                    download={`NEXORA_${aiVoiceName}_${selectedLanguage}.wav`}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .WAV</span>
                  </a>

                  {onLoadVoiceToEditor && (
                    <button
                      onClick={() => onLoadVoiceToEditor(aiTtsAudioUrl, selectedLanguage)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-emerald-950/40"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Use in Video</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
