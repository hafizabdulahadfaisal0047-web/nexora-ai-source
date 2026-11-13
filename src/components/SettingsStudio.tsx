import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Cpu,
  Video,
  Mic,
  Database,
  Check,
  Activity,
  Trash2,
  Server,
  HardDrive,
  FileWarning,
  Layers,
} from 'lucide-react';
import {
  searchStockVideos,
  searchPixabayVideos,
  fetchProviderSettings,
  updateProviderSettings,
  fetchSystemUsage,
  fetchSystemLogs,
  clearSystemLogs,
  clearMediaCache,
  fetchSystemStorage,
  listBackgroundJobs,
  SystemStatus,
} from '../services/api';
import { ProviderConfig, SystemErrorLog, BackgroundJob } from '../types';

interface SettingsStudioProps {
  systemStatus: SystemStatus | null;
}

export const SettingsStudio: React.FC<SettingsStudioProps> = ({ systemStatus }) => {
  const [providers, setProviders] = useState<ProviderConfig>({
    activeLLM: 'gemini',
    activeVoice: 'gemini_tts',
    activeImage: 'canvas_studio',
    activeMedia: 'pexels',
    autoFallbackEnabled: true,
    maxRetries: 3,
    cacheEnabled: true,
    costLimitDailyCalls: 500,
    maxConcurrentJobs: 2,
  });

  const [usageStats, setUsageStats] = useState<any>(null);
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [errorLogs, setErrorLogs] = useState<SystemErrorLog[]>([]);
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [testingService, setTestingService] = useState<'pexels' | 'pixabay' | null>(null);
  const [testResult, setTestResult] = useState<{ service: string; success: boolean; message: string } | null>(null);
  const [clearingCache, setClearingCache] = useState(false);

  const loadAllDiagnostics = async () => {
    try {
      const [provRes, usageRes, storageRes, logsRes, jobsRes] = await Promise.allSettled([
        fetchProviderSettings(),
        fetchSystemUsage(),
        fetchSystemStorage(),
        fetchSystemLogs(),
        listBackgroundJobs(),
      ]);

      if (provRes.status === 'fulfilled' && provRes.value.success && provRes.value.providers) {
        setProviders((prev) => ({ ...prev, ...provRes.value.providers }));
      }
      if (usageRes.status === 'fulfilled' && usageRes.value.success) {
        setUsageStats(usageRes.value);
      }
      if (storageRes.status === 'fulfilled' && storageRes.value.success) {
        setStorageInfo(storageRes.value);
      }
      if (logsRes.status === 'fulfilled' && logsRes.value.success) {
        setErrorLogs(logsRes.value.logs || []);
      }
      if (jobsRes.status === 'fulfilled' && jobsRes.value.success) {
        setJobs(jobsRes.value.jobs || []);
      }
    } catch (_) {}
  };

  useEffect(() => {
    loadAllDiagnostics();
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await updateProviderSettings({
        activeLLM: providers.activeLLM,
        activeVoice: providers.activeVoice,
        activeImage: providers.activeImage,
        activeMedia: providers.activeMedia,
        autoFallbackEnabled: providers.autoFallbackEnabled,
        maxRetries: providers.maxRetries,
        cacheEnabled: providers.cacheEnabled,
        costLimitDailyCalls: providers.costLimitDailyCalls,
        maxConcurrentJobs: providers.maxConcurrentJobs,
      });
      if (res.providers) {
        setProviders((prev) => ({ ...prev, ...res.providers }));
      }
      setSaveMessage({ type: 'success', text: 'Server configuration saved and synchronized.' });
      setTimeout(() => setSaveMessage(null), 3500);
      loadAllDiagnostics();
    } catch (e: any) {
      setSaveMessage({ type: 'error', text: `Failed to save settings: ${e.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestPexels = async () => {
    setTestingService('pexels');
    setTestResult(null);
    try {
      const res = await searchStockVideos('technology', 'landscape', 1, 1);
      setTestResult({
        service: 'Pexels Video Pipeline',
        success: res.videos && res.videos.length > 0,
        message:
          res.videos && res.videos.length > 0
            ? `Active (${res.source}). Returned ${res.videos.length} attributed clip.`
            : 'No clips returned.',
      });
    } catch (err: any) {
      setTestResult({
        service: 'Pexels Video Pipeline',
        success: false,
        message: `Connection failed: ${err.message}`,
      });
    } finally {
      setTestingService(null);
      loadAllDiagnostics();
    }
  };

  const handleTestPixabay = async () => {
    setTestingService('pixabay');
    setTestResult(null);
    try {
      const res = await searchPixabayVideos('business', 1, 1);
      setTestResult({
        service: 'Pixabay Video Pipeline',
        success: res.videos && res.videos.length > 0,
        message:
          res.videos && res.videos.length > 0
            ? `Active (${res.source}). Returned ${res.videos.length} attributed clip.`
            : 'No clips returned.',
      });
    } catch (err: any) {
      setTestResult({
        service: 'Pixabay Video Pipeline',
        success: false,
        message: `Connection failed: ${err.message}`,
      });
    } finally {
      setTestingService(null);
      loadAllDiagnostics();
    }
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      const res = await clearMediaCache();
      setTestResult({
        service: 'Media Cache',
        success: true,
        message: `Cleared ${res.clearedCount} cached media search entries.`,
      });
      loadAllDiagnostics();
    } catch (e: any) {
      setTestResult({
        service: 'Media Cache',
        success: false,
        message: e.message,
      });
    } finally {
      setClearingCache(false);
    }
  };

  const handleClearLogs = async () => {
    try {
      await clearSystemLogs();
      setErrorLogs([]);
    } catch (_) {}
  };

  const stats = usageStats?.stats || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Settings Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0d1627] via-[#101b33] to-[#121226] border border-cyan-500/30 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-2">
          <Settings className="w-4 h-4" />
          <span>SCALABLE MULTI-PROVIDER AI &amp; SERVER OPERATIONS</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Multi-Provider Engine, Quotas &amp; Diagnostics
        </h2>
        <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
          Configure AI providers, stock media pipelines, daily call guardrails, caching, and inspect real-time
          server telemetry. All API credentials remain strictly server-side in environment secrets.
        </p>
      </div>

      {/* Live API Telemetry & Quota Dashboard */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Real-Time Server Telemetry &amp; Quota Health
            </h3>
          </div>
          <button
            onClick={loadAllDiagnostics}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh Telemetry</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Gemini AI Calls</span>
            <span className="text-lg font-bold text-cyan-400 font-mono">
              {stats.geminiCalls ?? 0}
            </span>
            <span className="text-[9px] text-slate-400 block mt-0.5">
              Daily Cap: {stats.dailyCallsToday ?? 0}/{providers.costLimitDailyCalls || 500}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Pexels Video Calls</span>
            <span className="text-lg font-bold text-purple-400 font-mono">
              {stats.pexelsCalls ?? 0}
            </span>
            <span className="text-[9px] text-slate-400 block mt-0.5">
              Cache Hits: {stats.cacheHits ?? 0}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Pixabay Video Calls</span>
            <span className="text-lg font-bold text-blue-400 font-mono">
              {stats.pixabayCalls ?? 0}
            </span>
            <span className="text-[9px] text-slate-400 block mt-0.5">
              Fallback Calls: {stats.fallbackCalls ?? 0}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Recorded Exports</span>
            <span className="text-lg font-bold text-pink-400 font-mono">
              {stats.renderJobs ?? 0}
            </span>
            <span className="text-[9px] text-pink-400 block mt-0.5">Client Canvas Render</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Scripts Generated</span>
            <span className="text-lg font-bold text-amber-400 font-mono">
              {stats.scriptsGenerated ?? 0}
            </span>
            <span className="text-[9px] text-amber-400 block mt-0.5">
              Saved: {storageInfo?.counts?.savedScripts ?? 0}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Topics Mined</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">
              {stats.topicsGenerated ?? 0}
            </span>
            <span className="text-[9px] text-emerald-400 block mt-0.5">
              OpenAI Fallbacks: {stats.openaiCompatibleCalls ?? 0}
            </span>
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
                title: 'Google Gemini 4 Hydrogen (Server Proxy)',
                desc: 'Primary server-side model with JSON schema enforcement and automatic retries.',
                badge: systemStatus?.hasGemini ? 'Active' : 'Fallback Ready',
              },
              {
                id: 'openai_compatible',
                title: 'OpenAI-Compatible Server Endpoint',
                desc: 'Routes prompts to OPENAI_COMPATIBLE_BASE_URL configured on the server.',
                badge: providers.hasOpenAICompatibleKey ? 'Configured' : 'Env Required',
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
                Sources attributed commercial footage with duplicate avoidance
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              {
                id: 'pexels',
                title: 'Pexels Video API (Primary)',
                desc: 'Commercial HD clips with creator attribution and intelligent concept ranking.',
              },
              {
                id: 'pixabay',
                title: 'Pixabay Video API (Secondary)',
                desc: 'Royalty-free stock footage library via server-side key.',
              },
              {
                id: 'curated',
                title: 'Built-in Licensed Studio Archive',
                desc: 'Verified open-license HD clips with zero external rate limits.',
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
              <h3 className="text-sm font-bold text-white">Voice Synthesis Engine</h3>
              <p className="text-[11px] text-slate-400">
                Synthesizes spoken narration with silence trimming and multi-language pacing
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              {
                id: 'gemini_tts',
                title: 'Gemini 3.8 Flash-Lite TTS (WAV Server Synthesis)',
                desc: 'Primary server-side natural vocal synthesis with real WAV output.',
              },
              {
                id: 'web_speech',
                title: 'Browser Web Speech & PCM AudioEngine',
                desc: 'Local Web Speech API + formant synthesis fallback with zero quota cost.',
              },
              {
                id: 'edge_tts',
                title: 'Cloud Voice Auto-Fallback Profile',
                desc: 'Uses neural TTS when online and transitions cleanly to Web Audio if unavailable.',
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

        {/* 4. Guardrails, Caching & Concurrency */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Fallback, Caching &amp; Cost Guardrails</h3>
              <p className="text-[11px] text-slate-400">
                Controls retries, 15-min media caching, daily AI budget, and job concurrency
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Auto-Fallback Protocol</span>
                <span className="text-[10px] text-slate-400">
                  Switch to secondary LLM or Curated Archive if primary provider fails
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

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">15-Minute Media Search Cache</span>
                <span className="text-[10px] text-slate-400">
                  Reduces duplicate external Pexels/Pixabay calls
                </span>
              </div>
              <input
                type="checkbox"
                checked={providers.cacheEnabled ?? true}
                onChange={(e) =>
                  setProviders({ ...providers, cacheEnabled: e.target.checked })
                }
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Max Retries</span>
                <select
                  value={providers.maxRetries || 3}
                  onChange={(e) =>
                    setProviders({ ...providers, maxRetries: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  <option value={1}>1 Retry</option>
                  <option value={3}>3 Retries</option>
                  <option value={5}>5 Retries</option>
                </select>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Daily AI Call Cap</span>
                <input
                  type="number"
                  min={20}
                  max={5000}
                  value={providers.costLimitDailyCalls || 500}
                  onChange={(e) =>
                    setProviders({
                      ...providers,
                      costLimitDailyCalls: parseInt(e.target.value, 10) || 500,
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Max Concurrent Jobs</span>
                <select
                  value={providers.maxConcurrentJobs || 2}
                  onChange={(e) =>
                    setProviders({ ...providers, maxConcurrentJobs: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  <option value={1}>1 Job</option>
                  <option value={2}>2 Jobs</option>
                  <option value={4}>4 Jobs</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Server Environment Integrations Status (Read-Only, Zero Client Keys) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Server-Side Integration Status &amp; Diagnostics</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              API secrets are managed strictly on the server via environment variables (never exposed to browser storage).
            </p>
          </div>

          <span className="text-xs text-emerald-400 font-medium">✓ Zero Frontend Key Exposure</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: 'GEMINI_API_KEY',
              configured: Boolean(providers.hasGeminiKey || systemStatus?.hasGemini),
              desc: 'Text, Research & TTS',
            },
            {
              label: 'PEXELS_API_KEY',
              configured: Boolean(providers.hasPexelsKey || systemStatus?.hasPexels),
              desc: 'Live Stock Video Search',
            },
            {
              label: 'PIXABAY_API_KEY',
              configured: Boolean(providers.hasPixabayKey || systemStatus?.hasPixabay),
              desc: 'Secondary Stock Provider',
            },
            {
              label: 'OPENAI_COMPATIBLE',
              configured: Boolean(providers.hasOpenAICompatibleKey || systemStatus?.hasOpenAICompatible),
              desc: 'Custom LLM Fallback',
            },
          ].map((env) => (
            <div
              key={env.label}
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-slate-200">{env.label}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    env.configured
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/15 text-amber-300'
                  }`}
                >
                  {env.configured ? 'Configured' : 'Archive Fallback'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">{env.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleTestPexels}
            disabled={testingService === 'pexels'}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
          >
            {testingService === 'pexels' ? 'Testing Pexels...' : 'Test Pexels Pipeline'}
          </button>

          <button
            onClick={handleTestPixabay}
            disabled={testingService === 'pixabay'}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
          >
            {testingService === 'pixabay' ? 'Testing Pixabay...' : 'Test Pixabay Pipeline'}
          </button>

          <button
            onClick={handleClearCache}
            disabled={clearingCache}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5" />
            <span>
              {clearingCache
                ? 'Clearing...'
                : `Clear Media Cache (${storageInfo?.counts?.mediaCacheEntries ?? usageStats?.cacheEntries ?? 0})`}
            </span>
          </button>
        </div>

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
            <span>
              <strong>{testResult.service}:</strong> {testResult.message}
            </span>
          </div>
        )}

        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400">
            Settings are persisted to the backend store and applied across all studios.
          </p>

          <div className="flex items-center gap-3">
            {saveMessage && (
              <span
                className={`text-xs font-semibold flex items-center gap-1 ${
                  saveMessage.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{saveMessage.text}</span>
              </span>
            )}
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-950/50 transition-all disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Server Configuration'}
            </button>
          </div>
        </div>
      </div>

      {/* Storage Summary, Background Jobs & System Error Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage & Job Queue */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span>Persistent Store &amp; Background Queue</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              {storageInfo ? `${Math.round((storageInfo.storeFileBytes || 0) / 1024)} KB on disk` : 'Active'}
            </span>
          </div>

          {storageInfo?.counts && (
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-base font-bold text-white block">
                  {storageInfo.counts.savedScripts}
                </span>
                <span className="text-[10px] text-slate-400">Saved Scripts</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-base font-bold text-white block">
                  {storageInfo.counts.savedHooks}
                </span>
                <span className="text-[10px] text-slate-400">Saved Hooks</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-base font-bold text-white block">
                  {storageInfo.counts.exportHistory}
                </span>
                <span className="text-[10px] text-slate-400">Export Logs</span>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-48 overflow-y-auto">
            <div className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Recent Background Queue Jobs ({jobs.length})</span>
            </div>
            {jobs.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">No background jobs queued yet.</p>
            ) : (
              jobs.slice(0, 6).map((job) => (
                <div
                  key={job.id}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white">{job.taskType}</span>
                    <span className="text-[10px] text-slate-400 block">
                      Attempt {job.attempts || 1} • {new Date(job.createdAt).toLocaleTimeString()}
                      {job.error ? ` • ${job.error}` : ''}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      job.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : job.status === 'failed'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-cyan-500/20 text-cyan-300'
                    }`}
                  >
                    {job.status} ({job.progress}%)
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Error Logs */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileWarning className="w-4 h-4 text-amber-400" />
              <span>System Diagnostic Logs ({errorLogs.length})</span>
            </h3>
            {errorLogs.length > 0 && (
              <button
                onClick={handleClearLogs}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear Logs</span>
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {errorLogs.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                No recent provider errors or fallbacks logged.
              </div>
            ) : (
              errorLogs.slice(0, 12).map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 uppercase text-[10px]">
                      [{log.resolvedByFallback ? 'RECOVERED' : 'ERROR'}] {log.source}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{log.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
