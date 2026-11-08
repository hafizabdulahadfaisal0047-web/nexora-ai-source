import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Key,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Cpu,
  Video,
  Mic,
  Film,
  Sparkles,
} from 'lucide-react';
import { searchStockVideos } from '../services/api';

interface SettingsStudioProps {
  customPexelsKey: string;
  onSavePexelsKey: (key: string) => void;
  systemStatus: any;
}

export const SettingsStudio: React.FC<SettingsStudioProps> = ({
  customPexelsKey,
  onSavePexelsKey,
  systemStatus,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(customPexelsKey || '');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const handleTestConnection = async () => {
    if (!apiKeyInput.trim()) {
      setTestStatus('error');
      setTestMessage('Please enter a Pexels API key to test');
      return;
    }

    setTestStatus('testing');
    try {
      const res = await searchStockVideos('technology', 'landscape', 1, apiKeyInput.trim());
      if (res.videos && res.videos.length > 0) {
        setTestStatus('success');
        setTestMessage('Pexels API Connected Successfully! Commercial license active.');
        onSavePexelsKey(apiKeyInput.trim());
      } else {
        setTestStatus('error');
        setTestMessage('No response from Pexels API with this key.');
      }
    } catch (e: any) {
      setTestStatus('error');
      setTestMessage(`Connection failed: ${e.message}`);
    }
  };

  const handleSaveOnly = () => {
    onSavePexelsKey(apiKeyInput.trim());
    alert('Pexels API Key saved locally!');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Settings Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0d1627] via-[#101b33] to-[#121226] border border-cyan-500/20 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-2">
          <Settings className="w-4 h-4" />
          <span>FREE-FIRST SYSTEM ARCHITECTURE &amp; CONFIGURATION</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Studio Settings &amp; API Setup
        </h2>
        <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
          NEXORA AI is engineered from the ground up to operate on 100% free-tier services without requiring
          any paid subscriptions or hidden fees.
        </p>
      </div>

      {/* Free Tier Services Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-sm">Gemini 3.8 Flash</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Free high-speed AI reasoning for documentary research, Urdu narration, and YouTube SEO tags.
          </p>
          <div className="pt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Server Proxy Active</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-sm">Pexels Stock Footage</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Free 20,000 API requests/month for commercial HD video clips, plus built-in curated library.
          </p>
          <div className="pt-2 flex items-center gap-1.5 text-xs text-cyan-400 font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Zero Subscription</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Mic className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-sm">Urdu Voice Engine</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Runs client-side via SpeechSynthesis and Web Audio API with pitch &amp; rate modulation.
          </p>
          <div className="pt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Unlimited Local TTS</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center">
            <Film className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-sm">Client-Side Video Renderer</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            HTML5 Canvas + MediaRecorder pipeline compiles real MP4/WebM videos without server GPU fees.
          </p>
          <div className="pt-2 flex items-center gap-1.5 text-xs text-pink-400 font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>1080p HD Ready</span>
          </div>
        </div>
      </div>

      {/* Pexels API Key Setup */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              <span>Pexels Stock Footage API Configuration</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Connect your free personal Pexels API key for live search across millions of HD commercial videos.
            </p>
          </div>

          <a
            href="https://www.pexels.com/api/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
          >
            <span>Get Free Pexels Key</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Step-by-step instructions */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs text-slate-300">
          <p className="font-semibold text-white">How to get your free API key in 60 seconds:</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1 leading-relaxed">
            <li>
              Go to{' '}
              <a
                href="https://www.pexels.com/api/"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 underline"
              >
                pexels.com/api
              </a>{' '}
              and create a free account or log in.
            </li>
            <li>Click on <strong>"Your API Key"</strong> in the top menu.</li>
            <li>Copy the API key and paste it into the field below.</li>
            <li>
              Free tier allows <strong>200 requests/hour</strong> and <strong>20,000 requests/month</strong> (100% free for commercial use).
            </li>
          </ol>
        </div>

        {/* Key Input Field */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            ENTER YOUR PEXELS API KEY
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="e.g. 563492ad6f91700001000001..."
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm outline-none focus:border-cyan-400"
            />
            <div className="flex gap-2">
              <button
                disabled={testStatus === 'testing'}
                onClick={handleTestConnection}
                className="px-4 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {testStatus === 'testing' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Test Connection</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSaveOnly}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all"
              >
                Save Key
              </button>
            </div>
          </div>

          {/* Test Status Feedback */}
          {testStatus === 'success' && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{testMessage}</span>
            </div>
          )}

          {testStatus === 'error' && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{testMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
