import {
  DocumentaryPlan,
  IslamicReelPlan,
  StockVideo,
  HookDesignResult,
  LinkAnalysisResult,
  ScriptImprovementResult,
  RetentionAnalysisResult,
  VideoLanguage,
  ProviderConfig,
  SavedScriptItem,
  SavedHookItem,
  ContentHistoryItem,
  ExportHistoryItem,
  SystemErrorLog,
  BackgroundJob,
} from '../types';

export interface SystemStatus {
  hasGemini: boolean;
  hasPexels: boolean;
  hasPixabay?: boolean;
  hasOpenAICompatible?: boolean;
  status: string;
  version: string;
  model: string;
}

export async function fetchSystemStatus(): Promise<SystemStatus> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('Status check failed');
    return await res.json();
  } catch {
    return {
      hasGemini: false,
      hasPexels: false,
      hasPixabay: false,
      hasOpenAICompatible: false,
      status: 'offline',
      version: '3.0.0',
      model: 'gemini-4-hydrogen',
    };
  }
}

export async function generateDocumentary(
  topic: string,
  durationMinutes: number = 3,
  tone: string = 'gripping, investigative and cinematic'
): Promise<{ success: boolean; data: DocumentaryPlan; isFallback?: boolean; warning?: string }> {
  const res = await fetch('/api/gemini/documentary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, durationMinutes, tone }),
  });
  if (!res.ok) {
    throw new Error(`Failed to generate documentary plan: ${res.statusText}`);
  }
  return await res.json();
}

export async function generateIslamicReel(
  topic: string,
  voiceoverType: string = 'calm_spiritual'
): Promise<{ success: boolean; data: IslamicReelPlan; isFallback?: boolean; warning?: string }> {
  const res = await fetch('/api/gemini/islamic-reel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, voiceoverType }),
  });
  if (!res.ok) {
    throw new Error(`Failed to generate Islamic reel: ${res.statusText}`);
  }
  return await res.json();
}

export async function generateScript(
  topic: string,
  format: string = 'documentary',
  language: string = 'urdu',
  tone: string = 'engaging'
): Promise<{ success: boolean; data: any; isFallback?: boolean }> {
  const res = await fetch('/api/gemini/script', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, format, language, tone }),
  });
  if (!res.ok) {
    throw new Error(`Failed to generate script: ${res.statusText}`);
  }
  return await res.json();
}

export async function generateSeoTools(
  titleOrTopic: string,
  targetAudience: string = 'Pakistan & South Asian viewers'
): Promise<{ success: boolean; data: any; isFallback?: boolean }> {
  const res = await fetch('/api/gemini/seo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titleOrTopic, targetAudience }),
  });
  if (!res.ok) {
    throw new Error(`Failed to generate SEO analysis: ${res.statusText}`);
  }
  return await res.json();
}

export async function searchUnifiedMedia(params: {
  query: string;
  orientation?: 'landscape' | 'portrait' | 'square';
  perPage?: number;
  page?: number;
  excludeUrls?: string[];
  excludeIds?: string[];
  minDuration?: number;
  maxDuration?: number;
  provider?: 'all' | 'pexels' | 'pixabay' | 'curated';
}): Promise<{
  success: boolean;
  videos: StockVideo[];
  extractedConcepts?: string[];
  source: string;
  cached?: boolean;
  page?: number;
  hasMore?: boolean;
}> {
  const res = await fetch('/api/media/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`Intelligent media search failed: ${res.statusText}`);
  }
  return await res.json();
}

export async function searchStockVideos(
  query: string,
  orientation: 'landscape' | 'portrait' = 'landscape',
  perPage: number = 10,
  page: number = 1,
  excludeUrls: string[] = []
): Promise<{ videos: StockVideo[]; source: string; note?: string; cached?: boolean; hasMore?: boolean }> {
  const params = new URLSearchParams({
    query,
    orientation,
    per_page: String(perPage),
    page: String(page),
  });
  if (excludeUrls.length > 0) {
    params.set('exclude', excludeUrls.join(','));
  }
  const res = await fetch(`/api/pexels/videos?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Stock video search failed: ${res.statusText}`);
  }
  return await res.json();
}

export async function getCuratedVideos(category: string = 'all'): Promise<{ videos: StockVideo[] }> {
  const res = await fetch(`/api/pexels/curated?category=${encodeURIComponent(category)}`);
  if (!res.ok) {
    throw new Error(`Failed to load curated videos`);
  }
  return await res.json();
}

export async function generateSpeechAudio(
  text: string,
  voiceName: string = 'Kore',
  language: string = 'urdu',
  speed: number = 1.0,
  style?: string
): Promise<{ success: boolean; dataUri?: string; audioBase64?: string; mimeType?: string; error?: string }> {
  try {
    const res = await fetch('/api/gemini/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceName, language, speed, style }),
    });
    if (!res.ok) throw new Error('TTS request failed');
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function generateHooks(params: {
  topic: string;
  targetAudience?: string;
  platform?: string;
  primaryLanguage?: VideoLanguage;
  videoDuration?: string;
  tone?: string;
}): Promise<{ success: boolean; data: HookDesignResult; isFallback?: boolean }> {
  const res = await fetch('/api/gemini/hooks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Hook generation failed: ${res.statusText}`);
  return await res.json();
}

export async function improveScript(params: {
  originalText: string;
  primaryLanguage?: VideoLanguage;
  goal?: string;
  targetPacing?: string;
}): Promise<{ success: boolean; data: ScriptImprovementResult; isFallback?: boolean }> {
  const res = await fetch('/api/gemini/script-improve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Script improvement failed: ${res.statusText}`);
  return await res.json();
}

export async function analyzeVideoLink(url: string): Promise<{ success: boolean; data: LinkAnalysisResult; isFallback?: boolean }> {
  const res = await fetch('/api/gemini/link-analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error(`Link analysis failed: ${res.statusText}`);
  return await res.json();
}

export async function analyzeRetention(params: {
  contentText: string;
  platform?: string;
  durationSeconds?: number;
}): Promise<{ success: boolean; data: RetentionAnalysisResult; isFallback?: boolean }> {
  const res = await fetch('/api/gemini/retention', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Retention analysis failed: ${res.statusText}`);
  return await res.json();
}

export async function generateTopicToVideo(params: {
  topic: string;
  language?: VideoLanguage;
  aspectRatio?: string;
  durationMinutes?: number;
  tone?: string;
}): Promise<{ success: boolean; data: any; isFallback?: boolean }> {
  const res = await fetch('/api/gemini/topic-to-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Topic-to-video failed: ${res.statusText}`);
  return await res.json();
}

export async function searchPixabayVideos(
  query: string,
  perPage: number = 10,
  page: number = 1
): Promise<{ videos: StockVideo[]; source: string; note?: string; cached?: boolean; hasMore?: boolean }> {
  const url = `/api/pixabay/videos?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Pixabay search failed: ${res.statusText}`);
  return await res.json();
}

export async function fetchProviderSettings(): Promise<{ success: boolean; providers: ProviderConfig }> {
  const res = await fetch('/api/settings/providers');
  if (!res.ok) throw new Error('Failed to load provider settings');
  return await res.json();
}

export async function updateProviderSettings(
  config: Partial<ProviderConfig>
): Promise<{ success: boolean; providers: ProviderConfig; message: string }> {
  const res = await fetch('/api/settings/providers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error('Failed to update provider settings');
  return await res.json();
}

export async function fetchSystemUsage(): Promise<{
  success: boolean;
  stats: any;
  activeProviders: any;
  quotaHealth: any;
  cacheEntries?: number;
}> {
  const res = await fetch('/api/system/usage');
  if (!res.ok) throw new Error('Failed to fetch system usage stats');
  return await res.json();
}

export async function fetchContentTopics(
  niche: string = 'business_documentaries',
  count: number = 8,
  language: string = 'urdu'
): Promise<{ success: boolean; topics: any[]; isFallback?: boolean }> {
  const res = await fetch('/api/content/topics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ niche, count, language }),
  });
  if (!res.ok) throw new Error('Failed to generate content topics');
  return await res.json();
}

export async function fetchDailyIdeas(): Promise<{ success: boolean; date: string; ideas: any[] }> {
  const res = await fetch('/api/content/daily-ideas');
  if (!res.ok) throw new Error('Failed to load daily ideas');
  return await res.json();
}

export async function checkTopicDuplicate(topic: string): Promise<{
  success: boolean;
  topic: string;
  isDuplicate: boolean;
  similarityScore: number;
  status: 'unique' | 'borderline' | 'duplicate';
  message: string;
  matchedTopic?: string;
}> {
  const res = await fetch('/api/content/check-duplicate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }),
  });
  if (!res.ok) throw new Error('Failed to check duplicate topic');
  return await res.json();
}

export async function generateBulkPlan(
  niche: string = 'business_documentaries',
  theme: string = 'Market Titans & Unseen Disruptions',
  language: string = 'urdu'
): Promise<{ success: boolean; plan: any; isFallback?: boolean }> {
  const res = await fetch('/api/content/bulk-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ niche, theme, language }),
  });
  if (!res.ok) throw new Error('Failed to generate bulk plan');
  return await res.json();
}

// Persistent Library APIs (Saved Scripts, Saved Hooks, Content History)
export async function fetchSavedScripts(search?: string, language?: string): Promise<{ success: boolean; scripts: SavedScriptItem[] }> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (language) params.set('language', language);
  const res = await fetch(`/api/library/scripts?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch saved scripts');
  return await res.json();
}

export async function saveScriptToLibrary(payload: Partial<SavedScriptItem>): Promise<{ success: boolean; script: SavedScriptItem }> {
  const res = await fetch('/api/library/scripts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to save script');
  return await res.json();
}

export async function deleteSavedScript(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/library/scripts/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete script');
  return await res.json();
}

export async function fetchSavedHooks(search?: string, language?: string): Promise<{ success: boolean; hooks: SavedHookItem[] }> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (language) params.set('language', language);
  const res = await fetch(`/api/library/hooks?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch saved hooks');
  return await res.json();
}

export async function saveHookToLibrary(payload: Partial<SavedHookItem>): Promise<{ success: boolean; hook: SavedHookItem }> {
  const res = await fetch('/api/library/hooks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to save hook');
  return await res.json();
}

export async function deleteSavedHook(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/library/hooks/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete hook');
  return await res.json();
}

export async function fetchContentHistory(search?: string, type?: string): Promise<{ success: boolean; history: ContentHistoryItem[] }> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (type) params.set('type', type);
  const res = await fetch(`/api/library/history?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch content history');
  return await res.json();
}

export async function clearContentHistory(): Promise<{ success: boolean }> {
  const res = await fetch('/api/library/history', { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to clear history');
  return await res.json();
}

// Export History & Platform Package APIs
export async function fetchExportHistory(): Promise<{ success: boolean; exports: ExportHistoryItem[] }> {
  const res = await fetch('/api/exports/history');
  if (!res.ok) throw new Error('Failed to fetch export history');
  return await res.json();
}

export async function recordExportHistory(payload: Partial<ExportHistoryItem>): Promise<{ success: boolean; item: ExportHistoryItem }> {
  const res = await fetch('/api/exports/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to record export history');
  return await res.json();
}

// Background Job Queue APIs
export async function createBackgroundJob(taskType: string, payload?: any): Promise<{ success: boolean; job: BackgroundJob }> {
  const res = await fetch('/api/jobs/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskType, payload }),
  });
  if (!res.ok) throw new Error('Failed to create background job');
  return await res.json();
}

export async function fetchBackgroundJob(id: string): Promise<{ success: boolean; job: BackgroundJob }> {
  const res = await fetch(`/api/jobs/${id}`);
  if (!res.ok) throw new Error('Failed to fetch job status');
  return await res.json();
}

export async function listBackgroundJobs(): Promise<{ success: boolean; jobs: BackgroundJob[] }> {
  const res = await fetch('/api/jobs');
  if (!res.ok) throw new Error('Failed to list background jobs');
  return await res.json();
}

// System Logs, Cache & Storage Management APIs
export async function fetchSystemLogs(): Promise<{ success: boolean; logs: SystemErrorLog[] }> {
  const res = await fetch('/api/system/logs');
  if (!res.ok) throw new Error('Failed to load system logs');
  return await res.json();
}

export async function clearSystemLogs(): Promise<{ success: boolean }> {
  const res = await fetch('/api/system/logs', { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to clear system logs');
  return await res.json();
}

export async function clearMediaCache(): Promise<{ success: boolean; clearedCount: number }> {
  const res = await fetch('/api/system/cache/clear', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to clear media cache');
  return await res.json();
}

export async function fetchSystemStorage(): Promise<{
  success: boolean;
  storeFileBytes: number;
  counts: {
    savedScripts: number;
    savedHooks: number;
    contentHistory: number;
    exportHistory: number;
    topicHistory: number;
    mediaCacheEntries: number;
    errorLogs: number;
    activeJobs: number;
  };
}> {
  const res = await fetch('/api/system/storage');
  if (!res.ok) throw new Error('Failed to load storage summary');
  return await res.json();
}
