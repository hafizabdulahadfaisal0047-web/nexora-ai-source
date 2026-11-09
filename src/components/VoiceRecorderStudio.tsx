import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  Download,
  RotateCcw,
  Sparkles,
  Volume2,
  Film,
  CheckCircle2,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { VoiceRecorder } from '../services/audioSynthesizer';

interface VoiceRecorderStudioProps {
  onLoadVoiceToEditor?: (audioUrl: string) => void;
}

export const VoiceRecorderStudio: React.FC<VoiceRecorderStudioProps> = ({
  onLoadVoiceToEditor,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);

  const recorderRef = useRef<VoiceRecorder | null>(null);
  const timerRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    recorderRef.current = new VoiceRecorder();
    return () => {
      clearInterval(timerRef.current);
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
  }, []);

  const handleToggleRecord = async () => {
    if (!recorderRef.current) return;

    if (isRecording) {
      clearInterval(timerRef.current);
      setIsRecording(false);
      try {
        const res = await recorderRef.current.stopRecording();
        setRecordedAudioUrl(res.url);
        setRecordedBlob(res.blob);
      } catch (e: any) {
        alert(`Recording note: ${e.message}`);
      }
    } else {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
      setRecordedAudioUrl(null);
      setRecordedBlob(null);
      setRecordingSeconds(0);
      try {
        await recorderRef.current.startRecording();
        setIsRecording(true);
        timerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      } catch (err: any) {
        alert(`Microphone permission note: ${err.message || 'Please allow microphone access.'}`);
        setIsRecording(false);
      }
    }
  };

  const handleTogglePlay = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    if (!recordedAudioUrl) return;
    const a = document.createElement('a');
    a.href = recordedAudioUrl;
    a.download = `NEXORA_Recorded_Voiceover_${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950/60 via-slate-900 to-rose-950/50 border border-red-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span>STANDALONE VOICE RECORDER (صوتی ریکارڈنگ اسٹوڈیو)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Studio-Quality Microphone Recording
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Record your original Urdu bayan, commentary, or English narration directly with automatic gain staging. Preview instantly and export as a clean audio file or apply to your video project.
          </p>
        </div>
      </div>

      {/* Main Recording Console */}
      <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col items-center justify-center space-y-8 text-center">
        {/* Animated Visual Recording Radar / Timer */}
        <div className="relative flex items-center justify-center">
          {isRecording && (
            <div className="absolute w-44 h-44 rounded-full bg-red-500/20 animate-ping" />
          )}
          <div
            className={`w-36 h-36 rounded-full flex flex-col items-center justify-center border-4 transition-all shadow-2xl ${
              isRecording
                ? 'bg-red-600/20 border-red-500 text-red-400'
                : recordedAudioUrl
                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <Mic className={`w-10 h-10 ${isRecording ? 'animate-bounce' : ''}`} />
            <span className="font-mono text-lg font-black mt-2">
              {formatSeconds(recordingSeconds)}
            </span>
          </div>
        </div>

        {/* Recording Status & Action Trigger */}
        <div className="space-y-3 max-w-sm">
          <p className="text-xs text-slate-400">
            {isRecording
              ? 'Recording live audio from your microphone... Speak clearly.'
              : recordedAudioUrl
              ? 'Voiceover recording complete! Test playback below or download.'
              : 'Click the record button to start recording your voiceover.'}
          </p>

          <button
            onClick={handleToggleRecord}
            className={`px-8 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 mx-auto transition-all shadow-xl ${
              isRecording
                ? 'bg-red-500 hover:bg-red-400 text-slate-950 shadow-red-500/40'
                : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-950/50'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-4 h-4 fill-slate-950" />
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>{recordedAudioUrl ? 'Record New Take' : 'Start Recording'}</span>
              </>
            )}
          </button>
        </div>

        {/* Playback & Export Console (When Recording Exists) */}
        {recordedAudioUrl && (
          <div className="w-full max-w-md p-6 rounded-2xl bg-black/50 border border-slate-800 space-y-4">
            <audio
              ref={audioPlayerRef}
              src={recordedAudioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />

            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Recorded Audio Track</span>
              </span>
              <span className="font-mono text-slate-400">{formatSeconds(recordingSeconds)}</span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleTogglePlay}
                className="w-12 h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-950/40 transition-all font-bold"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
              </button>

              <button
                onClick={handleDownload}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download .WAV</span>
              </button>

              {onLoadVoiceToEditor && (
                <button
                  onClick={() => onLoadVoiceToEditor(recordedAudioUrl)}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Film className="w-4 h-4" />
                  <span>Use in Video</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
