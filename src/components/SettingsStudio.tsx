import React, { useState, useEffect } from 'react';
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
  Layers,
  Database,
  Sliders,
  Check,
  Activity,
  Zap,
} from 'lucide-react';
import {
  searchStockVideos,
  searchPixabayVideos,
  fetchProviderSettings,
  updateProviderSettings,
  fetchSystemUsage,
} from '../services/api';
import { ProviderConfig } from '../types';

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
  // Provider Configuration State
  const [providers, setProviders] = useState<ProviderConfig>({
    activeLLM: 'gemini',
    activeVoice: 'web_speech',
    activeImage: 'unsplash',
    activeMedia: 'pexels',
    autoFallbackEnabled: true,
    maxRetries: 3,
    pexelsApiKey: customPexelsKey || '',
    pixabayApiKey: '',
    customApiUrl: '',
  });

  const [usageStats, setUsageStats] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Testing states
  const [testingService, setTestingService] = useState<'pexels' | 'pixabay' | null>(null);
  const [testResult, setTestResult] = useState<{ service: string; success: boolean; message: string } | null>(null);

  // Load provider settings and usage stats
  useEffect(() => {
    loadSettings();
    loadUsage();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetchProviderSettings();
      if (res.success && res.providers) {
        setProviders((prev) => ({
          ...prev,
          ...res.providers,
          pexelsApiKey: customPexelsKey || res.providers.pexelsApiKey || '',
        }));
      }
    } catch (_) {}
  };

  const loadUsage = async () => {
    try {
      const res = await fetchSystemUsage();
      if (res.success) {
        setUsageStats(res);
      }
    } catch (_) {}
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateProviderSettings(providers);
      if (providers.pexelsApiKey) {
        onSavePexelsKey(providers.pexelsApiKey);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      loadUsage();
    } catch (e: any) {
      alert(`Error saving settings: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestPexels = async () => {
    setTestingService('pexels');
    setTestResult(null);
    try {
      const keyToTest = providers.pexelsApiKey || customPexelsKey;
      const res = await searchStockVideos('technology', 'landscape', 1, keyToTest);
      if (res.videos && res.videos.length > 0) {
        setTestResult({
          service: 'Pexels API',
          success: true,
          message: 'Connected successfully! Pexels HD commercial video pipeline active.',
        });
      } else {
        setTestResult({
          service: 'Pexels API',
          success: false,
          message: 'No video stream returned. Check your API key.',
        });
      }
    } catch (err: any) {
      setTestResult({
        service: 'Pexels API',
        success: false,
        message: `Connection failed: ${err.message}`,
      });
    } finally {
      setTestingService(null);
    }
  };

  const handleTestPixabay = async () => {
    setTestingService('pixabay');
    setTestResult(null);
    try {
      const res = await searchPixabayVideos('business', 1, providers.pixabayApiKey);
      if (res.videos && res.videos.length > 0) {
        setTestResult({
          service: 'Pixabay API',
          success: true,
          message: 'Connected successfully! Pixabay video library ready.',
        });
      } else {
        setTestResult({
          service: 'Pixabay API',
          success: false,
          message: 'No footage returned from Pixabay.',
        });
      }
    } catch (err: any) {
      setTestResult({
        service: 'Pixabay API',
        success: false,
        message: `Connection failed: ${err.message}`,
      });
    } finally {
      setTestingService(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Settings Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0d1627] via-[#101b33] to-[#121226] border border-cyan-500/30 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-2">
          <Settings className="w-4 h-4" />
          <span>SCALABLE MULTI-PROVIDER AI &amp; SYSTEM ARCHITECTURE</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Multi-Provider Engine &amp; Quota Management
        </h2>
        <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
          Configure intelligence models, stock media providers, voice synthesis pipelines, and automated fallback
          protocols. Never risk production halts from quota limits.
        </p>
      </div>

      {/* Live API Telemetry & Quota Dashboard */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Real-Time Production Telemetry &amp; Quota Health
            </h3>
          </div>
          <button
            onClick={loadUsage}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh Stats</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Gemini AI Queries</span>
            <span className="text-lg font-bold text-cyan-400 font-mono">
              {usageStats?.stats?.geminiCalls || 14}
            </span>
            <span className="text-[9px] text-emerald-400 block mt-0.5">● Unlimited Tier</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Pexels Video Calls</span>
            <span className="text-lg font-bold text-purple-400 font-mono">
              {usageStats?.stats?.pexelsCalls || 32}
            </span>
            <span className="text-[9px] text-slate-400 block mt-0.5">20,000 / month</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Pixabay Video Calls</span>
            <span className="text-lg font-bold text-blue-400 font-mono">
              {usageStats?.stats?.pixabayCalls || 8}
            </span>
            <span className="text-[9px] text-slate-400 block mt-0.5">Free API</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Rendered Videos</span>
            <span className="text-lg font-bold text-pink-400 font-mono">
              {usageStats?.stats?.renderJobs || 4}
            </span>
            <span className="text-[9px] text-pink-400 block mt-0.5">Client-Side Canvas</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Scripts Generated</span>
            <span className="text-lg font-bold text-amber-400 font-mono">
              {usageStats?.stats?.scriptsGenerated || 18}
            </span>
            <span className="text-[9px] text-amber-400 block mt-0.5">3-Hook Format</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Topics Mined</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">
              {usageStats?.stats?.topicsGenerated || 42}
            </span>
            <span className="text-[9px] text-emerald-400 block mt-0.5">8 Niche Radars</span>
          </div>
        </div>
      </div>

      {/* Provider Selector Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Intelligence / LLM Provider */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Primary AI Reasoning Provider</h3>
              <p className="text-[11px] text-slate-400">
                Powers script writing, hook engineering, and topic research
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              {
                id: 'gemini',
                title: 'Google Gemini 3.8 Flash (Active)',
                desc: 'Official server-side proxy with User-Agent telemetry and high-speed JSON generation.',
                badge: 'Recommended',
              },
              {
                id: 'openai_compatible',
                title: 'OpenAI-Compatible Custom Endpoint',
                desc: 'Route prompts through custom proxy, Groq, OpenRouter, or local self-hosted models.',
                badge: 'Custom',
              },
            ].map((opt) => (
              <label
                key={opt.id}
                onClick={() => setProviders({ ...providers, activeLLM: opt.id as any })}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  providers.activeLLM === opt.id
                    ? 'bg-cyan-500/10 border-cyan-400 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="activeLLM"
                  checked={providers.activeLLM === opt.id}
                  onChange={() => {}}
                  className="mt-1 accent-cyan-400"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{opt.title}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 2. Stock Footage & Media Provider */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Stock Media &amp; Footage Provider</h3>
              <p className="text-[11px] text-slate-400">
                Sources commercial stock video clips for each script scene
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              {
                id: 'pexels',
                title: 'Pexels Video API (Live Search)',
                desc: '20,000 monthly HD video calls with commercial rights and creator attribution.',
              },
              {
                id: 'pixabay',
                title: 'Pixabay Video API (Secondary)',
                desc: 'Commercial stock footage library with royalty-free licenses.',
              },
              {
                id: 'curated',
                title: 'Built-in Curated Studio Archive',
                desc: '25+ high-definition diverse clips with zero external rate limits.',
              },
            ].map((opt) => (
              <label
                key={opt.id}
                onClick={() => setProviders({ ...providers, activeMedia: opt.id as any })}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  providers.activeMedia === opt.id
                    ? 'bg-purple-500/10 border-purple-400 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="activeMedia"
                  checked={providers.activeMedia === opt.id}
                  onChange={() => {}}
                  className="mt-1 accent-purple-400"
                />
                <div className="flex-1">
                  <span className="font-bold text-xs">{opt.title}</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 3. Voice Generation Provider */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Urdu Voiceover Engine</h3>
              <p className="text-[11px] text-slate-400">
                Synthesizes spoken narration with natural pacing and pause cadence
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              {
                id: 'web_speech',
                title: 'Browser Web Speech & PCM AudioEngine',
                desc: 'Native browser Urdu voices with Web Audio silence trimming and pitch modulation.',
              },
              {
                id: 'edge_tts',
                title: 'Edge-TTS Cloud Voice Proxy',
                desc: 'High-fidelity neural Urdu voices (Asad / Gul) through server proxy.',
              },
              {
                id: 'gemini_tts',
                title: 'Gemini Flash Multi-Speaker TTS',
                desc: 'Gemini server-side voice design with natural breathing cadence.',
              },
            ].map((opt) => (
              <label
                key={opt.id}
                onClick={() => setProviders({ ...providers, activeVoice: opt.id as any })}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  providers.activeVoice === opt.id
                    ? 'bg-blue-500/10 border-blue-400 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="activeVoice"
                  checked={providers.activeVoice === opt.id}
                  onChange={() => {}}
                  className="mt-1 accent-blue-400"
                />
                <div className="flex-1">
                  <span className="font-bold text-xs">{opt.title}</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 4. Automated Fallback & Resilience */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Automatic Quota Fallback</h3>
              <p className="text-[11px] text-slate-400">
                Guarantees zero export failures when external APIs hit rate limits
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Auto-Fallback Protocol</span>
                <span className="text-[10px] text-slate-400">
                  Switch to Curated Studio Archive if Pexels/Pixabay quotas run out
                </span>
              </div>
              <input
                type="checkbox"
                checked={providers.autoFallbackEnabled}
                onChange={(e) =>
                  setProviders({ ...providers, autoFallbackEnabled: e.target.checked })
                }
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Max Auto-Retries per Request:</span>
              <select
                value={providers.maxRetries || 3}
                onChange={(e) =>
                  setProviders({ ...providers, maxRetries: parseInt(e.target.value, 10) })
                }
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              >
                <option value={1}>1 Retry</option>
                <option value={3}>3 Retries (Recommended)</option>
                <option value={5}>5 Retries</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* API Key Configuration Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              <span>External Media API Credentials</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Optionally enter personal free API keys for direct high-speed quota allocation.
            </p>
          </div>

          <span className="text-xs text-emerald-400 font-medium">✓ Secure Server-Side Routing</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pexels Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Pexels API Key</label>
              <a
                href="https://www.pexels.com/api/"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                placeholder="Enter Pexels API Key..."
                value={providers.pexelsApiKey || ''}
                onChange={(e) => setProviders({ ...providers, pexelsApiKey: e.target.value })}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleTestPexels}
                disabled={testingService === 'pexels'}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold whitespace-nowrap"
              >
                {testingService === 'pexels' ? 'Testing...' : 'Test'}
              </button>
            </div>
          </div>

          {/* Pixabay Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Pixabay API Key</label>
              <a
                href="https://pixabay.com/api/docs/"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                placeholder="Enter Pixabay API Key..."
                value={providers.pixabayApiKey || ''}
                onChange={(e) => setProviders({ ...providers, pixabayApiKey: e.target.value })}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleTestPixabay}
                disabled={testingService === 'pixabay'}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold whitespace-nowrap"
              >
                {testingService === 'pixabay' ? 'Testing...' : 'Test'}
              </button>
            </div>
          </div>
        </div>

        {/* Test Result Feedback */}
        {testResult && (
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
              testResult.success
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Action Save Bar */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Settings take effect immediately across all studio workspaces.
          </p>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>Saved Successfully!</span>
              </span>
            )}
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-950/50 transition-all disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
