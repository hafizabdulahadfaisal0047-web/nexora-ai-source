import { DocumentaryPlan, IslamicReelPlan, StockVideo } from '../types';

export interface SystemStatus {
  hasGemini: boolean;
  hasPexels: boolean;
  status: string;
  version: string;
  model: string;
}

export async function fetchSystemStatus(): Promise<SystemStatus> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('Status check failed');
    return await res.json();
  } catch (err) {
    return {
      hasGemini: false,
      hasPexels: false,
      status: 'offline',
      version: '1.0.0',
      model: 'gemini-3.8-flash',
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

export async function searchStockVideos(
  query: string,
  orientation: 'landscape' | 'portrait' = 'landscape',
  perPage: number = 10,
  customPexelsKey?: string
): Promise<{ videos: StockVideo[]; source: string; note?: string }> {
  const headers: Record<string, string> = {};
  if (customPexelsKey) {
    headers['x-pexels-key'] = customPexelsKey;
  }

  const url = `/api/pexels/videos?query=${encodeURIComponent(query)}&orientation=${orientation}&per_page=${perPage}`;
  const res = await fetch(url, { headers });
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
  voiceName: string = 'Kore'
): Promise<{ success: boolean; dataUri?: string; audioBase64?: string; error?: string }> {
  try {
    const res = await fetch('/api/gemini/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceName }),
    });
    if (!res.ok) throw new Error('TTS request failed');
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

