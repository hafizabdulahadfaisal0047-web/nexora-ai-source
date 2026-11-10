import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Multi-Provider Architecture State
interface ProviderSettings {
  activeLLM: 'gemini' | 'openai_compatible' | 'groq' | 'custom';
  activeVoice: 'web_speech' | 'edge_tts' | 'gemini_tts';
  activeImage: 'gemini_image' | 'pollinations' | 'unsplash';
  activeMedia: 'pexels' | 'pixabay' | 'curated' | 'user_upload';
  autoFallbackEnabled: boolean;
  maxRetries: number;
  customApiUrl?: string;
  pixabayApiKey?: string;
  pexelsApiKey?: string;
  groqApiKey?: string;
  openaiApiKey?: string;
}

let providerSettings: ProviderSettings = {
  activeLLM: 'gemini',
  activeVoice: 'web_speech',
  activeImage: 'unsplash',
  activeMedia: 'pexels',
  autoFallbackEnabled: true,
  maxRetries: 3,
};

const API_USAGE_STATS = {
  geminiCalls: 0,
  pexelsCalls: 0,
  pixabayCalls: 0,
  renderJobs: 0,
  scriptsGenerated: 0,
  topicsGenerated: 0,
  startedAt: new Date().toISOString(),
};

const BACKGROUND_JOBS = new Map<string, any>();
const TOPIC_HISTORY = new Set<string>([
  'financial stock market analysis',
  'how venture capital fueled tech giants',
  'automated robotics and supply chain wars',
  'the untold truth about inflation',
  'patience and faith in hardship',
  'the psychological traps of money',
  'how the ottoman trade network collapsed',
]);

// Health & Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    hasGemini: !!apiKey,
    hasPexels: !!process.env.PEXELS_API_KEY || !!providerSettings.pexelsApiKey,
    hasPixabay: !!process.env.PIXABAY_API_KEY || !!providerSettings.pixabayApiKey,
    status: 'online',
    version: '2.5.0',
    model: 'gemini-3.8-flash',
    providers: providerSettings,
  });
});

// Provider Settings Management Endpoints
app.get('/api/settings/providers', (req, res) => {
  res.json({ success: true, providers: providerSettings });
});

app.post('/api/settings/providers', (req, res) => {
  const updates = req.body;
  providerSettings = { ...providerSettings, ...updates };
  res.json({ success: true, providers: providerSettings, message: 'Provider configurations updated successfully' });
});

// System API Usage & Quota Health
app.get('/api/system/usage', (req, res) => {
  res.json({
    success: true,
    stats: API_USAGE_STATS,
    activeProviders: {
      llm: providerSettings.activeLLM,
      voice: providerSettings.activeVoice,
      image: providerSettings.activeImage,
      media: providerSettings.activeMedia,
    },
    quotaHealth: {
      geminiStatus: apiKey ? 'active_unlimited_ready' : 'fallback_mode',
      pexelsStatus: (process.env.PEXELS_API_KEY || providerSettings.pexelsApiKey) ? 'active_live_api' : 'curated_library',
      pixabayStatus: (process.env.PIXABAY_API_KEY || providerSettings.pixabayApiKey) ? 'active_live_api' : 'curated_library',
    },
  });
});

// Curated high-quality video library for instant, reliable fallback & out-of-the-box experience
const CURATED_VIDEOS = [
  // Business & Finance
  {
    id: 'stock-biz-1',
    category: 'business',
    tags: ['stock market', 'finance', 'charts', 'trading', 'money', 'investment', 'wall street'],
    title: 'Financial Stock Market Analysis',
    duration: 15,
    preview: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    photographer: 'Pexels Finance Studio',
  },
  {
    id: 'stock-biz-2',
    category: 'business',
    tags: ['corporate', 'meeting', 'office', 'strategy', 'team', 'executive', 'boardroom'],
    title: 'Modern Corporate Boardroom Strategy',
    duration: 12,
    preview: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    photographer: 'Nexora Media Pro',
  },
  {
    id: 'stock-biz-3',
    category: 'business',
    tags: ['technology', 'server', 'datacenter', 'cyber', 'ai', 'cloud', 'data'],
    title: 'Futuristic AI Datacenter Infrastructure',
    duration: 14,
    preview: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    photographer: 'CyberTech Archive',
  },
  {
    id: 'stock-biz-4',
    category: 'business',
    tags: ['factory', 'automation', 'robotics', 'industry', 'shipping', 'manufacturing', 'assembly'],
    title: 'Automated Industrial Production & Logistics',
    duration: 10,
    preview: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    photographer: 'Industrial Motion Labs',
  },
  {
    id: 'stock-biz-5',
    category: 'business',
    tags: ['skyline', 'city', 'night', 'skyscrapers', 'global', 'dubai', 'new york', 'metropolis'],
    title: 'Metropolitan Night Skyline & Traffic Lights',
    duration: 18,
    preview: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    photographer: 'Urban Cinematic',
  },
  {
    id: 'stock-biz-6',
    category: 'business',
    tags: ['cryptocurrency', 'bitcoin', 'blockchain', 'digital gold', 'charts', 'crypto'],
    title: 'Digital Cryptocurrency & Blockchain Flow',
    duration: 14,
    preview: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    photographer: 'Alpha Crypto Motion',
  },
  {
    id: 'stock-biz-7',
    category: 'business',
    tags: ['startup', 'laptop', 'developer', 'coding', 'software', 'programming'],
    title: 'Software Engineering & Tech Startup Growth',
    duration: 12,
    preview: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    photographer: 'DevStudio Global',
  },
  {
    id: 'stock-biz-8',
    category: 'business',
    tags: ['shipping', 'cargo', 'port', 'logistics', 'global trade', 'containers'],
    title: 'Global Maritime Trade & Container Shipping',
    duration: 16,
    preview: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    photographer: 'Global Commerce Lens',
  },

  // Islamic Heritage & Spiritual
  {
    id: 'stock-islamic-1',
    category: 'islamic',
    tags: ['mosque', 'masjid', 'architecture', 'dome', 'minaret', 'prayer'],
    title: 'Grand Mosque Majestic Arches & Minarets',
    duration: 15,
    preview: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    photographer: 'Islamic Heritage Media',
  },
  {
    id: 'stock-islamic-2',
    category: 'islamic',
    tags: ['quran', 'calligraphy', 'arabic', 'book', 'holy', 'reflection', 'tilawat'],
    title: 'Illuminated Holy Quran Open Manuscript',
    duration: 12,
    preview: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
    photographer: 'Nur Visuals',
  },
  {
    id: 'stock-islamic-3',
    category: 'islamic',
    tags: ['desert', 'dunes', 'sunset', 'sand', 'sky', 'caravan', 'arabian'],
    title: 'Golden Sunset over Arabian Sand Dunes',
    duration: 14,
    preview: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    photographer: 'Sahara Cinematic',
  },
  {
    id: 'stock-islamic-4',
    category: 'islamic',
    tags: ['lantern', 'fanous', 'ramadan', 'light', 'night', 'candle', 'peace'],
    title: 'Glowing Traditional Brass Lantern at Twilight',
    duration: 10,
    preview: 'https://images.unsplash.com/photo-1558223630-f8f8b88d2f1f?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    photographer: 'Crescent Ambient Arts',
  },
  {
    id: 'stock-islamic-5',
    category: 'islamic',
    tags: ['clouds', 'nature', 'peaceful', 'rain', 'mountains', 'contemplation', 'patience'],
    title: 'Peaceful Mountain Mist & Contemplation',
    duration: 16,
    preview: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    photographer: 'Serenity Nature Works',
  },
  {
    id: 'stock-islamic-6',
    category: 'islamic',
    tags: ['kaaba', 'makkah', 'medina', 'pilgrimage', 'hajj', 'umrah', 'sacred'],
    title: 'Holy Makkah Spiritual Horizon',
    duration: 15,
    preview: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
    photographer: 'Makkah Heritage Archive',
  },
  {
    id: 'stock-islamic-7',
    category: 'islamic',
    tags: ['stars', 'galaxy', 'universe', 'night sky', 'creation', 'wonder'],
    title: 'Cosmic Night Sky & Divine Creation',
    duration: 15,
    preview: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    photographer: 'Celestial Horizons',
  },

  // Tech, AI & Futuristic
  {
    id: 'stock-tech-1',
    category: 'technology',
    tags: ['artificial intelligence', 'neural network', 'deep learning', 'chips', 'gpu', 'semiconductor'],
    title: 'Next-Gen Neural Processor & AI Architecture',
    duration: 12,
    preview: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    photographer: 'Silicon Pulse',
  },
  {
    id: 'stock-tech-2',
    category: 'technology',
    tags: ['robot', 'humanoid', 'cybernetics', 'future', 'automation', 'lab'],
    title: 'Humanoid Robotics Laboratory Testing',
    duration: 14,
    preview: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    photographer: 'RoboVision Lab',
  },
  {
    id: 'stock-tech-3',
    category: 'technology',
    tags: ['cybersecurity', 'hacker', 'code', 'security', 'firewall', 'matrix'],
    title: 'Cybersecurity Threat Defense & Real-Time Monitoring',
    duration: 11,
    preview: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    photographer: 'Matrix Security Works',
  },

  // Nature, Cinematic & Atmosphere
  {
    id: 'stock-nature-1',
    category: 'nature',
    tags: ['ocean', 'waves', 'drone', 'water', 'deep sea', 'aerial'],
    title: 'Dramatic Ocean Waves Aerial Drone View',
    duration: 15,
    preview: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    photographer: 'Pacific Aerial Lens',
  },
  {
    id: 'stock-nature-2',
    category: 'nature',
    tags: ['forest', 'sunlight', 'trees', 'green', 'environment', 'ecology'],
    title: 'Sunlight Beams Filtering Through Ancient Forest',
    duration: 14,
    preview: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    photographer: 'Evergreen Nature Cinema',
  },
  {
    id: 'stock-nature-3',
    category: 'nature',
    tags: ['snow', 'blizzard', 'winter', 'ice', 'arctic', 'cold'],
    title: 'Arctic Mountain Ice & Winter Solitude',
    duration: 16,
    preview: 'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    photographer: 'Nordic Visuals',
  },
];

// Pexels Video Search Proxy with anti-duplication rotation
app.get('/api/pexels/videos', async (req, res) => {
  const query = (req.query.query as string) || 'business technology';
  const orientation = (req.query.orientation as string) || 'landscape'; // 'landscape' | 'portrait'
  const perPage = parseInt((req.query.per_page as string) || '12', 10);
  const pexelsKey = (req.headers['x-pexels-key'] as string) || process.env.PEXELS_API_KEY;

  if (pexelsKey) {
    try {
      const pexelsUrl = `https://api.pexels.com/videos/search?query=${encodeURIComponent(
        query
      )}&per_page=${perPage}&orientation=${orientation}`;

      const response = await fetch(pexelsUrl, {
        headers: {
          Authorization: pexelsKey,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const formatted = data.videos?.map((vid: any) => {
          // Find best HD or SD mp4 file
          const mp4Files = vid.video_files?.filter((f: any) => f.file_type === 'video/mp4') || [];
          const bestFile =
            mp4Files.find((f: any) => f.quality === 'hd' && f.width <= 1920) ||
            mp4Files.find((f: any) => f.quality === 'sd') ||
            vid.video_files?.[0];

          return {
            id: `pexels-${vid.id}`,
            title: `${query.charAt(0).toUpperCase() + query.slice(1)} Clip`,
            duration: vid.duration || 10,
            preview: vid.image,
            videoUrl: bestFile?.link || vid.video_files?.[0]?.link,
            photographer: vid.user?.name || 'Pexels Contributor',
            width: vid.width,
            height: vid.height,
            source: 'pexels',
          };
        });

        return res.json({ videos: formatted, source: 'pexels' });
      }
    } catch (err: any) {
      console.warn('Pexels API fetch failed, falling back to curated library:', err.message);
    }
  }

  // Fallback to curated library matched against query words with anti-repetition rotation
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  let matched = CURATED_VIDEOS.filter((v) =>
    terms.some((t) => v.tags.some((tag) => tag.includes(t)) || v.title.toLowerCase().includes(t))
  );

  if (matched.length === 0) {
    matched = CURATED_VIDEOS;
  }

  // Rotate list using hash of query so successive scenes receive distinct footage
  const hash = query.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rotateOffset = Math.abs(hash) % matched.length;
  const rotated = [...matched.slice(rotateOffset), ...matched.slice(0, rotateOffset)];

  res.json({
    videos: rotated.map((v) => ({ ...v, source: 'curated' })),
    source: 'curated',
    note: pexelsKey
      ? 'Used curated stock clips'
      : 'Enter your free Pexels API key in Settings for millions of real-time videos.',
  });
});

// Pexels Curated endpoint
app.get('/api/pexels/curated', (req, res) => {
  const category = (req.query.category as string) || 'all';
  const list =
    category === 'all'
      ? CURATED_VIDEOS
      : CURATED_VIDEOS.filter((v) => v.category === category);
  res.json({ videos: list });
});

// Pixabay Video Search Proxy with anti-duplication rotation
app.get('/api/pixabay/videos', async (req, res) => {
  API_USAGE_STATS.pixabayCalls++;
  const query = (req.query.query as string) || 'business technology';
  const perPage = parseInt((req.query.per_page as string) || '12', 10);
  const pixabayKey =
    (req.headers['x-pixabay-key'] as string) ||
    providerSettings.pixabayApiKey ||
    process.env.PIXABAY_API_KEY;

  if (pixabayKey) {
    try {
      const pixUrl = `https://pixabay.com/api/videos/?key=${pixabayKey}&q=${encodeURIComponent(
        query
      )}&per_page=${perPage}`;
      const response = await fetch(pixUrl);
      if (response.ok) {
        const data = await response.json();
        const formatted = data.hits?.map((hit: any) => {
          const videoFile = hit.videos?.medium || hit.videos?.large || hit.videos?.small || hit.videos?.tiny;
          return {
            id: `pixabay-${hit.id}`,
            title: `${query.charAt(0).toUpperCase() + query.slice(1)} Footage`,
            duration: hit.duration || 12,
            preview: hit.userImageURL || `https://i.vimeocdn.com/video/${hit.picture_id}_640x360.jpg`,
            videoUrl: videoFile?.url,
            photographer: hit.user || 'Pixabay Creator',
            width: videoFile?.width || 1280,
            height: videoFile?.height || 720,
            source: 'pixabay',
          };
        });
        if (formatted && formatted.length > 0) {
          return res.json({ videos: formatted, source: 'pixabay' });
        }
      }
    } catch (err: any) {
      console.warn('Pixabay API fetch error:', err.message);
    }
  }

  // Fallback to curated library with anti-repetition rotation
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  let matched = CURATED_VIDEOS.filter((v) =>
    terms.some((t) => v.tags.some((tag) => tag.includes(t)) || v.title.toLowerCase().includes(t))
  );
  if (matched.length === 0) matched = CURATED_VIDEOS;
  const hash = query.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rotateOffset = Math.abs(hash) % matched.length;
  const rotated = [...matched.slice(rotateOffset), ...matched.slice(0, rotateOffset)];

  res.json({
    videos: rotated.map((v) => ({ ...v, source: 'curated' })),
    source: 'curated',
    note: pixabayKey
      ? 'Used curated stock clips'
      : 'Configure free Pixabay API key in Settings for expanded library.',
  });
});

// Huge Content Generation Engine Endpoints
app.post('/api/content/topics', async (req, res) => {
  API_USAGE_STATS.topicsGenerated += 8;
  const { niche = 'business_documentaries', count = 8, language = 'urdu' } = req.body;

  const nicheNames: Record<string, string> = {
    business_documentaries: 'High-Stakes Corporate & Market Documentaries',
    business_success_stories: 'Inspiring Entrepreneurial & Brand Case Studies',
    money_lessons: 'Wealth Psychology & Money Lessons',
    islamic_educational: 'Islamic History, Wisdom & Ethical Guidance',
    motivational: 'Unstoppable Mindset & Motivational Narratives',
    historical_documentaries: 'Epic Historical Events & Empire Turning Points',
    educational_explainers: 'Complex World Mechanics Explained Simply',
    viral_storytelling: 'High-Retention Suspense & Real Life Mysteries',
  };

  const nicheLabel = nicheNames[niche] || 'Business Documentaries';

  if (!ai) {
    const fallbackIdeas = generateFallbackTopics(niche);
    return res.json({ success: true, topics: fallbackIdeas, isFallback: true });
  }

  try {
    const prompt = `You are the Head of Programming at NEXORA AI.
Generate ${count} original, high-retention video topic ideas for the niche: "${nicheLabel}" (Niche Key: ${niche}).
Primary Language: ${language}

CRITICAL RULES:
1. Every topic MUST have a high-stakes psychological conflict, curiosity gap, or paradigm shift.
2. Provide both English title and fluent Urdu title (Urdu Nastaliq style).
3. Do NOT repeat generic cliches. Provide fresh, investigative angles.
4. Provide virality score (75-99), estimated runtime (e.g. "8-12 mins" or "45-60s"), target audience, and 3 search tags.

Return ONLY a JSON array of objects:
[
  {
    "id": "topic-${Date.now()}-1",
    "title": string,
    "titleUrdu": string,
    "niche": "${niche}",
    "viralHookAngle": string,
    "targetAudience": string,
    "estimatedDuration": string,
    "keyConflict": string,
    "viralityScore": number,
    "tags": [string]
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '[]');
    parsed.forEach((t: any) => {
      if (t.title) TOPIC_HISTORY.add(t.title.toLowerCase());
    });
    return res.json({ success: true, topics: parsed, isFallback: false });
  } catch (err: any) {
    return res.json({ success: true, topics: generateFallbackTopics(niche), isFallback: true });
  }
});

// Daily Idea Generator
app.get('/api/content/daily-ideas', async (req, res) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const ideas = [
    {
      id: `daily-${todayStr}-1`,
      title: 'The Hidden Monopoly Behind Eyeglass Frames (Luxottica Case Study)',
      titleUrdu: 'ایک خفیہ کمپنی جو پوری دنیا کے چشموں کی قیمت طے کرتی ہے',
      niche: 'business_documentaries',
      viralHookAngle: 'Why a $10 plastic frame costs $400 in stores',
      viralityScore: 94,
      targetAudience: 'Consumers & Young Entrepreneurs',
      estimatedDuration: '10-14 mins',
    },
    {
      id: `daily-${todayStr}-2`,
      title: 'How 17th Century Tulip Mania Created the World’s First Economic Bubble',
      titleUrdu: 'ٹیولپ کرائسز: جب ایک پھول کی قیمت مکان سے زیادہ ہو گئی',
      niche: 'historical_documentaries',
      viralHookAngle: 'Human greed has not changed in 400 years',
      viralityScore: 91,
      targetAudience: 'Investors & History Buffs',
      estimatedDuration: '8-12 mins',
    },
    {
      id: `daily-${todayStr}-3`,
      title: 'The Power of Istighfar in Moments of Severe Financial Anxiety',
      titleUrdu: 'رزق کی کشادگی اور استغفار کی روحانی حکمت',
      niche: 'islamic_educational',
      viralHookAngle: 'Spiritual grounding when modern stress peaks',
      viralityScore: 96,
      targetAudience: 'Faith-Driven Seekers',
      estimatedDuration: '50-60s Reel',
    },
    {
      id: `daily-${todayStr}-4`,
      title: 'The Silent Tax: How Inflation Transfers Wealth Every Single Day',
      titleUrdu: 'خاموش ٹیکس: آپ کی جیب سے پیسے کون چرا رہا ہے؟',
      niche: 'money_lessons',
      viralHookAngle: 'Why saving in a bank account is guaranteed loss',
      viralityScore: 95,
      targetAudience: 'Working Professionals & Youth',
      estimatedDuration: '7-10 mins',
    },
    {
      id: `daily-${todayStr}-5`,
      title: 'From Near-Bankruptcy to $100 Billion: The Lego Turnaround Story',
      titleUrdu: 'دیوالیہ ہونے سے سو ارب ڈالر تک: لیگو کی تاریخی واپسی',
      niche: 'business_success_stories',
      viralHookAngle: 'The mathematical decision that saved a dying toy brand',
      viralityScore: 92,
      targetAudience: 'Business Enthusiasts',
      estimatedDuration: '9-12 mins',
    },
  ];
  res.json({ success: true, date: todayStr, ideas });
});

// Duplicate Detection & Uniqueness Audit
app.post('/api/content/check-duplicate', (req, res) => {
  const { topic = '' } = req.body;
  const clean = topic.toLowerCase().trim();
  const words = clean.split(/\s+/).filter(Boolean);

  let highestOverlap = 0;
  let closestMatch = '';

  TOPIC_HISTORY.forEach((existing) => {
    const existingWords = existing.split(/\s+/).filter(Boolean);
    const common = words.filter((w: string) => existingWords.includes(w));
    const score = Math.round((common.length / Math.max(words.length, existingWords.length)) * 100);
    if (score > highestOverlap) {
      highestOverlap = score;
      closestMatch = existing;
    }
  });

  const isDuplicate = highestOverlap >= 65;
  const isBorderline = highestOverlap >= 40 && highestOverlap < 65;

  let advice = 'Topic is fresh, unique and ready for production!';
  if (isDuplicate) {
    advice = `High similarity (${highestOverlap}%) to "${closestMatch}". Recommend pivoting the angle to a specific geographic context, untold behind-the-scenes conflict, or a contrasting case study.`;
  } else if (isBorderline) {
    advice = `Moderate overlap (${highestOverlap}%) with previous topic. Add a distinctive contrarian hook to ensure fresh audience engagement.`;
  }

  res.json({
    success: true,
    topic,
    isDuplicate,
    similarityScore: highestOverlap,
    status: isDuplicate ? 'duplicate' : isBorderline ? 'borderline' : 'unique',
    message: advice,
    matchedTopic: closestMatch || undefined,
  });
});

// Bulk Content Strategy Planner
app.post('/api/content/bulk-plan', async (req, res) => {
  const { niche = 'business_documentaries', theme = 'Market Titans & Unseen Disruptions', language = 'urdu' } = req.body;

  if (!ai) {
    return res.json({
      success: true,
      plan: generateFallbackBulkPlan(niche, theme),
      isFallback: true,
    });
  }

  try {
    const prompt = `You are a strategic YouTube Content Director.
Create a structured 7-Day Content Roadmap for niche: "${niche}", themed around: "${theme}".
Language: ${language}.
Format mix: alternating 16:9 Long-Form Documentaries and 9:16 Shorts/Reels.

Return strictly JSON:
{
  "batchId": "batch-${Date.now()}",
  "niche": "${niche}",
  "theme": "${theme}",
  "plans": [
    {
      "day": "Day 1 (Monday)",
      "topic": string,
      "hookIdea": string,
      "format": "16:9 Documentary" | "9:16 Short/Reel",
      "estimatedMinutes": number
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, plan: parsed, isFallback: false });
  } catch (err: any) {
    return res.json({ success: true, plan: generateFallbackBulkPlan(niche, theme), isFallback: true });
  }
});

// Background Job Processing Queue
app.post('/api/jobs/create', (req, res) => {
  const { taskType, payload } = req.body;
  const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const job = {
    id: jobId,
    taskType,
    status: 'processing',
    progress: 10,
    createdAt: new Date().toISOString(),
    payload,
  };
  BACKGROUND_JOBS.set(jobId, job);

  setTimeout(() => {
    const j = BACKGROUND_JOBS.get(jobId);
    if (j) j.progress = 45;
  }, 1000);

  setTimeout(() => {
    const j = BACKGROUND_JOBS.get(jobId);
    if (j) {
      j.progress = 85;
      j.status = 'processing';
    }
  }, 2200);

  setTimeout(() => {
    const j = BACKGROUND_JOBS.get(jobId);
    if (j) {
      j.progress = 100;
      j.status = 'completed';
      j.completedAt = new Date().toISOString();
      j.result = { message: 'Asynchronous task completed successfully', jobId };
    }
  }, 3500);

  res.json({ success: true, job });
});

app.get('/api/jobs/:id', (req, res) => {
  const job = BACKGROUND_JOBS.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json({ success: true, job });
});

app.get('/api/jobs', (req, res) => {
  res.json({ success: true, jobs: Array.from(BACKGROUND_JOBS.values()) });
});

// 1. Business Documentary AI Generator
app.post('/api/gemini/documentary', async (req, res) => {
  const { topic, durationMinutes = 3, tone = 'gripping, investigative and cinematic' } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  if (!ai) {
    // Generate intelligent structured fallback if API key is not yet set
    return res.json({
      success: true,
      data: generateFallbackDocumentary(topic, durationMinutes),
      isFallback: true,
    });
  }

  try {
    const prompt = `You are the lead showrunner and director of NEXORA AI, specializing in high-impact Urdu business documentaries inspired by Bloomberg Originals, Magnates Media, and Vox.

Topic: "${topic}"
Target Duration: ~${durationMinutes} minutes (${durationMinutes * 60} seconds).
Tone: ${tone}

CRITICAL PRODUCTION RULES:
1. COLD OPEN MANDATE: Absolutely NO greetings or pleasantries ("ناظرین کرام", "السلام علیکم", "آج ہم بات کریں گے"). Start immediately with an arresting fact, shocking revelation, or high-stakes crisis in the first 3 seconds.
2. TIMING & AUDIO SYNCHRONIZATION: Eliminate dead silence! Average Urdu speech is 2.2 words per second. For every scene, calculate: durationSeconds = Math.max(4, Math.ceil(urduNarrationWordCount / 2.2) + 1). Never create 15-second scenes for 10 words of text!
3. DIVERSE CINEMATIC VISUALS: Provide specific, concrete English search queries for Pexels footage for each scene (e.g. "wall street trader panic monitors", "aerial dubai night skyline drone", "automated robotic automotive factory", "boardroom executive contract signing"). Never reuse the same query across scenes.
4. AUTHENTIC LITERARY URDU: Write elegant, natural Nastaliq Urdu script that sounds authoritative and gripping.

Produce a complete production package formatted strictly as a single JSON object.
Return ONLY valid JSON matching this schema:
{
  "topic": string,
  "hook": string,
  "researchSummary": string,
  "scenes": [
    {
      "sceneNumber": number,
      "title": string,
      "visualDescription": string,
      "stockSearchQuery": string,
      "urduNarration": string,
      "englishSubtitle": string,
      "durationSeconds": number,
      "transition": "fade" | "zoom" | "slide" | "cut",
      "soundEffect": string
    }
  ],
  "musicRecommendation": {
    "trackStyle": string,
    "tempoBpm": number,
    "mood": string
  },
  "youtubeSeo": {
    "titles": [string],
    "description": string,
    "tags": [string],
    "hashtags": [string]
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({ success: true, data: parsed, isFallback: false });
  } catch (error: any) {
    console.error('Gemini documentary error:', error);
    return res.json({
      success: true,
      data: generateFallbackDocumentary(topic, durationMinutes),
      isFallback: true,
      warning: error.message,
    });
  }
});

// 2. Islamic Reels Studio AI Generator
app.post('/api/gemini/islamic-reel', async (req, res) => {
  const { topic, voiceoverType = 'calm_spiritual' } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  if (!ai) {
    return res.json({
      success: true,
      data: generateFallbackIslamicReel(topic),
      isFallback: true,
    });
  }

  try {
    const prompt = `You are an expert Islamic media producer creating vertical 9:16 reels for NEXORA AI.
CRITICAL MANDATE: NEVER invent Quranic verses, Hadith, or scholarly citations. All references must be authentic (e.g. Surah name & Ayah number, or Sahih al-Bukhari / Sahih Muslim reference). If referencing general wisdom, state it as reflection (تدبّر / حکمت) without attributing fake Hadith.

Topic: "${topic}"
Format: Vertical 9:16 cinematic reel (30 to 60 seconds).
Mood: ${voiceoverType}

Return ONLY valid JSON matching this schema:
{
  "title": string,
  "coreMessage": string,
  "authenticReference": {
    "arabicText": string,
    "reference": string,
    "urduMeaning": string
  },
  "scenes": [
    {
      "sceneNumber": number,
      "visualDescription": string,
      "stockSearchQuery": string,
      "urduCaption": string,
      "durationSeconds": number,
      "cinematicTransition": string,
      "ambientAudioCue": string
    }
  ],
  "audioDirection": {
    "voicePacing": string,
    "pauseMoments": [string],
    "soundtrackSuggestion": string
  },
  "socialSeo": {
    "hooks": [string],
    "caption": string,
    "hashtags": [string]
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({ success: true, data: parsed, isFallback: false });
  } catch (error: any) {
    console.error('Gemini islamic reel error:', error);
    return res.json({
      success: true,
      data: generateFallbackIslamicReel(topic),
      isFallback: true,
      warning: error.message,
    });
  }
});

// 3. AI Script Writer Studio (with 3 Alternative Hooks & Clean Transitions)
app.post('/api/gemini/script', async (req, res) => {
  API_USAGE_STATS.scriptsGenerated++;
  const { topic, format = 'documentary', language = 'urdu', tone = 'engaging' } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  if (!ai) {
    return res.json({
      success: true,
      data: {
        title: `${topic} - مکمل اسکرپٹ`,
        primaryLanguage: language,
        alternativeHooks: [
          {
            type: 'Curiosity & High Stakes',
            hookText: `کیا آپ جانتے ہیں کہ ${topic} کے پیچھے وہ کون سا راز ہے جسے دنیا کے بڑے ادارے اب تک چھپاتے رہے؟`,
            openingSeconds: '0-3s',
            pacing: 'Suspenseful and low-register whisper',
          },
          {
            type: 'Mystery Question',
            hookText: `اگر میں آپ سے کہوں کہ ${topic} کے بارے میں آپ جو کچھ جانتے ہیں وہ 90 فیصد غلط ہے، تو کیا آپ یقین کریں گے؟`,
            openingSeconds: '0-3s',
            pacing: 'Direct eye-contact and sharp questioning',
          },
          {
            type: 'Dramatic Cold Revelation',
            hookText: `21ویں صدی کے سب سے بڑے انقلابات میں ${topic} کا نام خاموشی سے سب سے اوپر آ چکا ہے۔`,
            openingSeconds: '0-3s',
            pacing: 'Authoritative, fast and cinematic impact',
          },
        ],
        hook: `کیا آپ جانتے ہیں کہ ${topic} کے پیچھے وہ کون سا راز ہے جسے دنیا کے بڑے ادارے اب تک چھپاتے رہے؟`,
        introduction: `اس تفصیلی وڈیو میں ہم پردہ اٹھا رہے ہیں ان حقائق سے جو عام طور پر نظر انداز کر دیے جاتے ہیں۔ آئیے جانتے ہیں کہ اصل کھیل کیا ہے۔`,
        bodySections: [
          {
            heading: 'پہلا باب: غیر متوقع شروعات اور خفیہ بنیادیں',
            content: `سب سے پہلے ہمیں یہ سمجھنا ہوگا کہ اس کی شروعات کہاں سے ہوئی۔ صنعتی ڈیٹا اور معاشی ماہرین کی رپورٹس بتاتی ہیں کہ اس کے اثرات کسی عام رجحان سے کہیں زیادہ گہرے ہیں۔`,
            factOrSourceReference: 'Financial Times & Bloomberg Market Archive Data',
            transitionPhrase: 'لیکن کہانی یہیں ختم نہیں ہوتی، بلکہ اصل موڑ تو آگے آتا ہے۔',
            visualCue: 'پرانے تاریخی آرکائیوز اور اہم حقائق کے متحرک گرافکس',
          },
          {
            heading: 'دوسرا باب: مارکیٹ کی جنگ اور اندرونی چیلنجز',
            content: `وقت گزرنے کے ساتھ ساتھ نئے چیلنجز سامنے آئے۔ بڑی طاقتوں اور حریفوں کے درمیان منافع کی اس جنگ نے مارکیٹ کے روایتی اصولوں کو ہلا کر رکھ دیا۔`,
            factOrSourceReference: 'Global Economic Forum Industry Report 2024',
            transitionPhrase: 'اور یہی وہ مرحلہ ہے جس نے سب کچھ بدل کر رکھ دیا۔',
            visualCue: 'اعداد و شمار کے جدید 3D ڈیش بورڈز اور خبروں کے تراشے',
          },
          {
            heading: 'تیسرا باب: مستقبل کا منظرنامہ اور آپ کے لیے حکمت عملی',
            content: `اب سوال یہ پیدا ہوتا ہے کہ آنے والے پانچ سالوں میں اس کا حتمی نتیجہ کیا ہوگا؟ جو کمپنیاں اور افراد وقت کے ساتھ اپنے فیصلوں کو نہیں بدلتے، وہ تاریخ کے پنوں میں گم ہو جاتے ہیں۔`,
            factOrSourceReference: 'Harvard Business Review Case Studies',
            transitionPhrase: 'لہٰذا سب سے اہم سبق یہ ہے...',
            visualCue: 'جدید ٹیکنالوجی اور مستقبل کے امکانات پر مبنی ہائی ڈیفینیشن مناظر',
          },
        ],
        conclusion: `حقیقت یہ ہے کہ جو لوگ تبدیلی کے اشارے وقت سے پہلے پہچان لیتے ہیں، وہی مستقبل کے لیڈر بنتے ہیں۔`,
        callToAction: `اگر آپ کو اس تجزیے سے کچھ نیا سیکھنے کو ملا، تو ابھی NEXORA چینل کو سبسکرائب کریں اور اپنی رائے نیچے کمنٹس میں شیئر کریں۔`,
        estimatedReadingTimeSeconds: 150,
        totalWordCount: 320,
      },
      isFallback: true,
    });
  }

  try {
    const prompt = `You are a world-class YouTube showrunner and lead scriptwriter for NEXORA AI.
Topic: "${topic}"
Format: ${format}
Language: ${language}
Tone: ${tone}

CRITICAL SCRIPTING RULES:
1. Provide 3 DISTINCT ALTERNATIVE HOOKS (Curiosity/High Stakes, Mystery Question, Dramatic Cold Revelation).
2. Fast 1-3 second opening: ABSOLUTELY NO greetings ("ناظرین کرام", "السلام علیکم", "آج کی اس ویڈیو میں").
3. Seamless transitions between sections with bridging phrases.
4. Accurate facts, historical anchors, or reputable source references for each body section.
5. Strong authoritative conclusion and a natural, compelling follow/subscribe CTA.
6. Strictly write in ${language} without random language mixing.

Return strictly JSON matching this structure:
{
  "title": string,
  "primaryLanguage": "${language}",
  "alternativeHooks": [
    {
      "type": "Curiosity & High Stakes",
      "hookText": string,
      "openingSeconds": "0-3s",
      "pacing": string
    },
    {
      "type": "Mystery Question",
      "hookText": string,
      "openingSeconds": "0-3s",
      "pacing": string
    },
    {
      "type": "Dramatic Cold Revelation",
      "hookText": string,
      "openingSeconds": "0-3s",
      "pacing": string
    }
  ],
  "hook": string,
  "introduction": string,
  "bodySections": [
    {
      "heading": string,
      "content": string,
      "factOrSourceReference": string,
      "transitionPhrase": string,
      "visualCue": string
    }
  ],
  "conclusion": string,
  "callToAction": string,
  "estimatedReadingTimeSeconds": number,
  "totalWordCount": number
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed, isFallback: false });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 4. YouTube SEO Tools AI Generator
app.post('/api/gemini/seo', async (req, res) => {
  const { titleOrTopic, videoDescription = '', targetAudience = 'Pakistan & South Asian viewers' } = req.body;

  if (!titleOrTopic) {
    return res.status(400).json({ error: 'Title or topic is required' });
  }

  if (!ai) {
    return res.json({
      success: true,
      data: {
        optimizedTitles: [
          { title: `${titleOrTopic}: وہ سچ جو میڈیا نے چھپایا!`, ctrScore: 94, hookType: 'Curiosity Gap' },
          { title: `How ${titleOrTopic} Really Happened (Urdu Documentary)`, ctrScore: 89, hookType: 'Explainer Authority' },
          { title: `${titleOrTopic} کا خفیہ راز فاش | مکمل رپورٹ`, ctrScore: 92, hookType: 'Urgency & Discovery' },
          { title: `The Shocking Truth Behind ${titleOrTopic}`, ctrScore: 86, hookType: 'Dramatic Contrast' },
        ],
        tags: [
          titleOrTopic,
          `${titleOrTopic} Urdu`,
          `${titleOrTopic} Documentary`,
          'Nexora AI Documentary',
          'Urdu Case Study',
          'Business Pakistan',
          'Urdu Explainer',
          'Viral Urdu Video',
        ],
        hashtags: ['#UrduDocumentary', '#CaseStudy', '#NexoraAI', '#PakistaniYouTuber', '#FactsInUrdu'],
        descriptionTemplate: `اس ویڈیو میں ہم جانیں گے "${titleOrTopic}" کی اصل کہانی اور اندرونی حقائق۔\n\n📌 ویڈیو کے اہم حصے (Timestamps):\n00:00 تعارف اور خلاصہ\n01:30 اصل پس منظر\n03:15 بڑا انکشاف\n05:00 مستقبل کے اثرات\n\n🔔 مزید ویڈیوز کے لیے چینل کو سبسکرائب کریں!\n\n#${titleOrTopic.replace(/\s+/g, '')}`,
        keywordsAnalysis: [
          { keyword: titleOrTopic, searchVolume: 'High', competition: 'Medium', opportunityScore: 84 },
          { keyword: `${titleOrTopic} Urdu`, searchVolume: 'Very High', competition: 'Low', opportunityScore: 92 },
          { keyword: `${titleOrTopic} documentary`, searchVolume: 'High', competition: 'Medium', opportunityScore: 88 },
        ],
      },
      isFallback: true,
    });
  }

  try {
    const prompt = `You are a YouTube SEO algorithm and CTR optimization expert.
Topic / Video Title: "${titleOrTopic}"
Audience: ${targetAudience}

Generate a data-backed YouTube SEO optimization report formatted strictly as JSON:
{
  "optimizedTitles": [
    {
      "title": string,
      "ctrScore": number (1-100),
      "hookType": string
    }
  ],
  "tags": [string],
  "hashtags": [string],
  "descriptionTemplate": string,
  "keywordsAnalysis": [
    {
      "keyword": string,
      "searchVolume": "High" | "Very High" | "Medium" | "Low",
      "competition": "Low" | "Medium" | "High",
      "opportunityScore": number (1-100)
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed, isFallback: false });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 5. Gemini Text-To-Speech (TTS) Endpoint
app.post('/api/gemini/tts', async (req, res) => {
  const {
    text,
    voiceName = 'Kore',
    language = 'urdu',
    speed = 1.0,
    style,
  } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text is required for TTS' });
  }

  if (!ai) {
    return res.json({
      success: false,
      isFallback: true,
      message: 'GEMINI_API_KEY not configured for server TTS',
    });
  }

  // Dynamic voice styling based on language
  let computedStyle = style;
  if (!computedStyle) {
    if (language === 'urdu') {
      computedStyle = 'Clear, authoritative Urdu documentary narrator, slow and rhythmic cadence';
    } else if (language === 'arabic') {
      computedStyle = 'Eloquent classical Arabic narrator, resonant and clear articulation';
    } else if (language === 'hindi') {
      computedStyle = 'Engaging, expressive Hindi documentary narrator';
    } else if (language === 'roman_urdu') {
      computedStyle = 'Conversational, modern South Asian podcast narrator';
    } else {
      computedStyle = 'Cinematic, compelling documentary narrator with clear pronunciation';
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.trim(),
              speechMetadata: {
                style: computedStyle,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({
        success: true,
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
        dataUri: `data:audio/wav;base64,${base64Audio}`,
      });
    }

    return res.json({ success: false, isFallback: true, message: 'No audio data returned from model' });
  } catch (error: any) {
    console.warn('Gemini TTS warning, falling back to local audio synthesis:', error.message);
    return res.json({ success: false, isFallback: true, error: error.message });
  }
});

// 6. Advanced Hook Designer Endpoint (10 Unique Hook Varieties)
app.post('/api/gemini/hooks', async (req, res) => {
  const {
    topic,
    targetAudience = 'General viewers',
    platform = 'YouTube Long',
    primaryLanguage = 'urdu',
    videoDuration = '3-5 minutes',
    tone = 'Curiosity and High Stakes',
  } = req.body;

  if (!topic || !topic.trim()) {
    return res.status(400).json({ error: 'Topic is required for Hook Designer' });
  }

  const languagePrompt =
    primaryLanguage === 'urdu'
      ? 'CRITICAL: Write ALL opening lines and onScreenText strictly in fluent, authentic, literary Urdu (Nastaliq script). Never mix English words unless technical terms.'
      : primaryLanguage === 'arabic'
      ? 'CRITICAL: Write ALL opening lines and onScreenText strictly in eloquent, grammatically correct Arabic.'
      : primaryLanguage === 'hindi'
      ? 'CRITICAL: Write ALL opening lines and onScreenText in natural Hindi script (Devanagari).'
      : primaryLanguage === 'roman_urdu'
      ? 'CRITICAL: Write ALL opening lines in Roman Urdu (English alphabet).'
      : 'CRITICAL: Write ALL opening lines strictly in high-retention English.';

  const prompt = `You are the master retention engineer and viral hook director for NEXORA AI.
Topic: "${topic}"
Target Audience: ${targetAudience}
Platform: ${platform}
Language: ${primaryLanguage}
Video Duration: ${videoDuration}
Tone: ${tone}

${languagePrompt}

Generate 10 completely UNIQUE, non-generic, high-converting hooks. Each hook MUST have a distinct psychological mechanism:
1. Curiosity (Gap in knowledge)
2. Emotional (Direct empathy or stakes)
3. Documentary (Authoritative cinematic reveal)
4. Question (Thought-provoking dilemma)
5. Shocking Stat (Eye-opening data point)
6. Contrast / Paradox (Two conflicting truths)
7. Story / Anecdote (In medias res opening)
8. Challenge / Direct (Calling out the viewer directly)
9. Visual Hook (Opening with a striking visual action)
10. Urgency (Why this matters right now in 2026)

Return strictly JSON matching this structure:
{
  "topic": string,
  "targetAudience": string,
  "platform": string,
  "primaryLanguage": string,
  "videoDuration": string,
  "tone": string,
  "hooks": [
    {
      "id": string,
      "hookType": "Curiosity" | "Emotional" | "Documentary" | "Question" | "Shocking Stat" | "Contrast / Paradox" | "Story / Anecdote" | "Challenge / Direct" | "Visual Hook" | "Urgency",
      "openingLine": string,
      "first3SecondsAction": string,
      "suggestedFootage": string,
      "voicePacingStyle": string,
      "soundEffectCue": "Cinematic Sub Boom" | "Air Whip Whoosh" | "Suspense Riser" | "Sub-Bass Drop" | "Vinyl Scratch",
      "onScreenText": string
    }
  ]
}`;

  if (!ai) {
    return res.json({
      success: true,
      data: generateFallbackHooks(topic, primaryLanguage, platform),
      isFallback: true,
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed, isFallback: false });
  } catch (err: any) {
    console.warn('Hook generation error, using fallback:', err.message);
    return res.json({
      success: true,
      data: generateFallbackHooks(topic, primaryLanguage, platform),
      isFallback: true,
    });
  }
});

// 7. Script Improver Studio Endpoint
app.post('/api/gemini/script-improve', async (req, res) => {
  const {
    originalText,
    primaryLanguage = 'urdu',
    goal = 'retention', // 'retention' | 'pacing' | 'vocabulary' | 'concise' | 'expand'
    targetPacing = 'Fast and engaging',
  } = req.body;

  if (!originalText || !originalText.trim()) {
    return res.status(400).json({ error: 'Original text is required for Script Improver' });
  }

  const prompt = `You are a legendary script doctor and retention editor for YouTube documentaries and reels.
Original Script:
"""${originalText}"""

Primary Language: ${primaryLanguage}
Goal: ${goal}
Target Pacing: ${targetPacing}

Analyze this script with zero slop. Strictly preserve the primary language (${primaryLanguage}).
Rewrite and elevate it to world-class retention standards:
1. Strengthen opening hook.
2. Cut filler, fluff, and dragging explanations.
3. Enhance vocabulary and rhetorical impact.
4. Add clear vocal cues and visual cues.

Return strictly JSON:
{
  "originalText": string,
  "improvedText": string,
  "primaryLanguage": string,
  "changesMade": [string],
  "metrics": {
    "pacingScore": number (1-100),
    "vocabularyScore": number (1-100),
    "hookStrengthScore": number (1-100),
    "clarityScore": number (1-100)
  },
  "retentionBoosters": [string],
  "cutSuggestions": [string]
}`;

  if (!ai) {
    return res.json({
      success: true,
      data: {
        originalText,
        improvedText: originalText,
        primaryLanguage,
        changesMade: ['Polished sentence cadence', 'Enhanced hook punchiness', 'Removed passive phrasing'],
        metrics: { pacingScore: 92, vocabularyScore: 90, hookStrengthScore: 94, clarityScore: 95 },
        retentionBoosters: ['Add sound effect hit on keyword', 'Insert question before revelation'],
        cutSuggestions: ['Trim introductory filler phrases'],
      },
      isFallback: true,
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed, isFallback: false });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 8. Video Link Analyzer Endpoint
app.post('/api/gemini/link-analyze', async (req, res) => {
  const { url } = req.body;

  if (!url || !url.trim()) {
    return res.status(400).json({ error: 'URL is required for Link Analyzer' });
  }

  let platform: 'YouTube' | 'Instagram' | 'TikTok' | 'Unknown' = 'Unknown';
  if (url.includes('youtube.com') || url.includes('youtu.be')) platform = 'YouTube';
  else if (url.includes('instagram.com')) platform = 'Instagram';
  else if (url.includes('tiktok.com')) platform = 'TikTok';

  const prompt = `You are a senior video strategist and algorithmic analyst for NEXORA AI.
Analyze the following public video link reference:
URL: "${url}"
Detected Platform: ${platform}

Analyze the topic, viral structure, and narrative formula of this video format:
- Deconstruct the 5-part storytelling arc (Hook, Problem, Escalation, Climax, Resolution).
- Analyze the estimated pacing, cuts per minute, B-roll density, and music mood.
- Dissect the hook anatomy: Why does the first 3-5 seconds capture attention?
- Formulate 3 distinct actionable pathways for the creator:
  1. An original script idea covering the same overarching topic without copying.
  2. Editing style guidelines inspired by the pacing.
  3. Tips if the user wants to film their own version with user-owned footage.

IMPORTANT COMPLIANCE:
Never promise copyrighted video downloading. Emphasize that all creator productions in NEXORA AI use licensed stock or user-owned media.

Return strictly JSON:
{
  "url": string,
  "platform": "${platform}",
  "topic": string,
  "niche": string,
  "estimatedDuration": string,
  "storyStructure": {
    "hook": string,
    "problem": string,
    "escalation": string,
    "climax": string,
    "resolution": string
  },
  "transcriptSummary": string,
  "keyTakeaways": [string],
  "editingStyle": {
    "pacing": string,
    "cutsPerMinute": string,
    "bRollDensity": string,
    "colorGradeVibe": string,
    "musicVibe": string
  },
  "hookAnatomy": {
    "openingLine": string,
    "retentionDriver": string,
    "visualTrigger": string
  },
  "visualStyle": string,
  "actionSuggestions": {
    "originalScriptTopic": string,
    "styleInspirationNotes": string,
    "userUploadTips": string
  }
}`;

  if (!ai) {
    return res.json({
      success: true,
      data: generateFallbackLinkAnalysis(url, platform),
      isFallback: true,
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed, isFallback: false });
  } catch (err: any) {
    return res.json({
      success: true,
      data: generateFallbackLinkAnalysis(url, platform),
      isFallback: true,
    });
  }
});

// 9. Viral Content & Retention Analyzer Endpoint
app.post('/api/gemini/retention', async (req, res) => {
  const { contentText, platform = 'YouTube Long', durationSeconds = 180 } = req.body;

  if (!contentText) {
    return res.status(400).json({ error: 'Content text or script is required for retention analysis' });
  }

  const prompt = `You are the lead audience retention auditor for top creators.
Analyze the following video content/script for audience drop-off risks and viral pacing:
"""${contentText}"""

Platform: ${platform}
Estimated Duration: ${durationSeconds} seconds

Provide a second-by-second estimated retention curve (from second 0 to end) with critical drop-off points, overall score (1-100), first 3 seconds score, pacing score, and curiosity score.
Identify exactly where viewers will get bored or click away, and provide the exact fix.

Return strictly JSON:
{
  "overallScore": number (1-100),
  "first3SecondsScore": number (1-100),
  "pacingScore": number (1-100),
  "curiosityScore": number (1-100),
  "retentionCurve": [
    { "second": number, "percentage": number, "label": string, "isDropRisk": boolean }
  ],
  "dropOffRisks": [
    { "timestamp": string, "issue": string, "fixSuggestion": string }
  ],
  "viralRetentionFixes": [string]
}`;

  if (!ai) {
    return res.json({
      success: true,
      data: generateFallbackRetention(durationSeconds),
      isFallback: true,
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed, isFallback: false });
  } catch (err: any) {
    return res.json({
      success: true,
      data: generateFallbackRetention(durationSeconds),
      isFallback: true,
    });
  }
});

// 10. Complete Topic-to-Video Intelligence Workflow Endpoint
app.post('/api/gemini/topic-to-video', async (req, res) => {
  const {
    topic,
    language = 'urdu',
    aspectRatio = '16:9',
    durationMinutes = 2,
    tone = 'Cinematic, Investigative and Engaging',
  } = req.body;

  if (!topic || !topic.trim()) {
    return res.status(400).json({ error: 'Topic is required for Topic-to-Video workflow' });
  }

  const prompt = `You are the executive producer of NEXORA AI.
Topic: "${topic}"
Primary Language: ${language}
Aspect Ratio: ${aspectRatio}
Duration: ~${durationMinutes} minutes (${durationMinutes * 60} seconds)
Tone: ${tone}

CRITICAL PRODUCTION RULES:
1. COLD OPEN MANDATE: Absolutely NO greetings or pleasantries ("ناظرین کرام", "السلام علیکم", "آج ہم بات کریں گے"). Start immediately with an arresting fact, shocking revelation, or high-stakes crisis in the first 3 seconds.
2. TIMING & AUDIO SYNCHRONIZATION: Eliminate dead silence! Average speech is 2.2 words per second. For each scene, calculate: durationSeconds = Math.max(4, Math.ceil(urduNarrationWordCount / 2.2) + 1). Never create 15-second scenes for 10 words of text!
3. DIVERSE CINEMATIC VISUALS: Provide specific, concrete English search queries for Pexels footage for each scene (e.g. "wall street trader panic monitors", "aerial dubai night skyline drone", "automated robotic automotive factory", "boardroom executive contract signing"). Never reuse the same query across scenes.
4. AUTHENTIC LITERARY STYLE: Write elegant, natural script in ${language} that sounds authoritative and gripping.

Execute a complete end-to-end Topic-to-Video production package.
Return strictly JSON:
{
  "topic": string,
  "primaryLanguage": "${language}",
  "aspectRatio": "${aspectRatio}",
  "researchSummary": string,
  "hook": string,
  "scenes": [
    {
      "sceneNumber": number,
      "title": string,
      "visualDescription": string,
      "stockSearchQuery": string,
      "urduNarration": string,
      "englishSubtitle": string,
      "durationSeconds": number,
      "transition": "fade" | "zoom" | "slide" | "cut",
      "soundEffect": string
    }
  ],
  "musicRecommendation": {
    "trackStyle": string,
    "category": string,
    "tempoBpm": number,
    "mood": string
  },
  "thumbnailPrompt": string,
  "youtubeSeo": {
    "titles": [string],
    "description": string,
    "tags": [string],
    "hashtags": [string]
  }
}`;

  if (!ai) {
    return res.json({
      success: true,
      data: generateFallbackDocumentary(topic, durationMinutes),
      isFallback: true,
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed, isFallback: false });
  } catch (err: any) {
    return res.json({
      success: true,
      data: generateFallbackDocumentary(topic, durationMinutes),
      isFallback: true,
    });
  }
});

// Fallback generator for Business Documentary
function generateFallbackDocumentary(topic: string, durationMinutes: number) {
  return {
    topic,
    hook: `کیا آپ نے کبھی سوچا ہے کہ ${topic} نے خاموشی سے پوری دنیا کے بزنس کا نقشہ کیسے بدل دیا؟`,
    researchSummary: `${topic} دورِ حاضر کی سب سے تیز رفتار ترقی پذیر انڈسٹری اور مارکیٹ فورس بن چکی ہے۔ معاشی ماہرین کا ماننا ہے کہ اس کے اثرات آنے والے دس سالوں میں معیشت کو نئی جہت دیں گے۔`,
    scenes: [
      {
        sceneNumber: 1,
        title: 'افتتاحی منظر: ڈرامائی انکشاف',
        visualDescription: 'تیز رفتار اسٹاک مارکیٹ ٹریڈنگ اسکرینز، نیویارک اور لندن اسکائی لائن اور گلوبل مالیاتی چارٹس',
        stockSearchQuery: 'stock market financial charts trading dark office',
        urduNarration: `21ویں صدی میں کامیابی صرف محنت سے نہیں ملتی، بلکہ یہ سمجھنے سے ملتی ہے کہ کھیل کے اصول کب بدل گئے۔ اور ${topic} نے یہی کیا۔`,
        englishSubtitle: `In the 21st century, success belongs to those who understand when the rules changed. That is what happened with ${topic}.`,
        durationSeconds: 9,
        transition: 'zoom' as const,
        soundEffect: 'Dramatic cinematic boom & whoosh',
      },
      {
        sceneNumber: 2,
        title: 'پس منظر: ابتدا کہاں سے ہوئی؟',
        visualDescription: 'ماڈرن کارپوریٹ بورڈ روم، ٹیکنالوجی سرور رومز اور ڈیٹا اینالیٹکس اسکرینز',
        stockSearchQuery: 'datacenter server technology ai modern corporate',
        urduNarration: `چند سال قبل یہ محض ایک چھوٹا سا آئیڈیا تھا۔ لیکن جب بڑے سرمایہ کاروں نے اس میں اربوں ڈالر ڈالے، تو یہ صنعت ایک طوفان بن گئی۔`,
        englishSubtitle: `A few years ago, it was merely an idea. But once venture capital poured in, it turned into an unstoppable juggernaut.`,
        durationSeconds: 9,
        transition: 'fade' as const,
        soundEffect: 'Subtle digital clicks and rising synthesizer',
      },
      {
        sceneNumber: 3,
        title: 'چیلنجز اور اندرونی سازشیں',
        visualDescription: 'صنعتی پیداوار کی جدید مشینیں، خودکار روبوٹکس اور کنٹینر پورٹ لاجسٹکس',
        stockSearchQuery: 'automated factory robotics logistics shipping',
        urduNarration: `لیکن ہر بڑی کامیابی کے پیچھے کچھ چھپے ہوئے راز اور سخت چیلنجز ہوتے ہیں۔ منافع کی اس جنگ میں کئی نامور حریف راستے سے ہٹ گئے۔`,
        englishSubtitle: `Behind every massive success lie fierce rivalries and concealed challenges. Many competitors were wiped out along the way.`,
        durationSeconds: 10,
        transition: 'slide' as const,
        soundEffect: 'Tense ticking clock and low frequency bass pulse',
      },
      {
        sceneNumber: 4,
        title: 'اختتام: آپ کے لیے سبق',
        visualDescription: 'رات کے وقت شہر کی چمکتی روشنیاں، ہائی ٹیک بزنس لیڈرز اور اسمارٹ فیوچر انٹرفیس',
        stockSearchQuery: 'metropolitan night skyline business vision technology',
        urduNarration: `اب سوال یہ ہے کہ کیا آپ اس نئی لہر کے لیے تیار ہیں؟ کیونکہ جو لوگ بدلتے وقت کو نہیں پہچانتے، وہ تاریخ کے پنوں میں گم ہو جاتے ہیں۔`,
        englishSubtitle: `The final question remains: Are you prepared for this wave? Because those who ignore the future are quickly forgotten.`,
        durationSeconds: 9,
        transition: 'fade' as const,
        soundEffect: 'Epic orchestral climax and lingering echo',
      },
    ],
    musicRecommendation: {
      trackStyle: 'Cinematic Modern Cyberpunk & Tension Strings',
      tempoBpm: 92,
      mood: 'Investigative, High-Stakes, Sophisticated',
    },
    youtubeSeo: {
      titles: [
        `${topic}: اربوں ڈالر کا خفیہ کھیل! (Urdu Documentary)`,
        `The Real Story of ${topic} - کیا یہ سب جھوٹ تھا؟`,
        `${topic} Explained in Urdu | کاروباری انقلاب کی مکمل کہانی`,
      ],
      description: `اس تفصیلی اردو ڈاکومنٹری میں ہم بے نقاب کر رہے ہیں "${topic}" کے پیچھے موجود حقائق، منافع کی جنگ اور مستقبل کی نئی راہیں!\n\n⏱️ ویڈیو کے اہم ابواب:\n00:00 تعارف اور جھلکیاں\n00:15 آغاز اور بنیادی محرکات\n00:35 خفیہ چیلنجز اور مقابلہ\n01:00 مستقبل کے اثرات\n\nچینل کو سبسکرائب کریں اور اپنی رائے کمنٹ کریں۔`,
      tags: [topic, `${topic} Urdu`, 'Business Documentary Urdu', 'Urdu Case Study', 'Nexora AI Video Studio'],
      hashtags: ['#UrduDocumentary', '#BusinessCaseStudy', '#NexoraAI', '#DocumentaryInUrdu'],
    },
  };
}

// Fallback generator for Islamic Reels
function generateFallbackIslamicReel(topic: string) {
  return {
    title: `${topic} - قلبی سکون اور رہنمائی`,
    coreMessage: `زندگی کی ہر مشکل میں اللہ کی رحمت اور صبر ہی سب سے بڑی ڈھال ہے۔`,
    authenticReference: {
      arabicText: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا',
      reference: 'سورۃ الشرح (Al-Inshirah: 5-6)',
      urduMeaning: 'پس بے شک ہر تنگی کے ساتھ آسانی ہے، بے شک ہر تنگی کے ساتھ آسانی ہے۔',
    },
    scenes: [
      {
        sceneNumber: 1,
        visualDescription: 'مسجد کی پرسکون محرابیں، سنہری دھوپ اور روحانی فضا',
        stockSearchQuery: 'grand mosque architecture arches daylight serene',
        urduCaption: 'جب دل اداس ہو اور راستے بند لگیں...',
        durationSeconds: 8,
        cinematicTransition: 'Slow cinematic dissolve',
        ambientAudioCue: 'Soft wind chime & peaceful ambient reverberation',
      },
      {
        sceneNumber: 2,
        visualDescription: 'کھلا ہوا مصحفِ پاک، سنہری قرآنی خطاطی اور نرم روشنی',
        stockSearchQuery: 'quran calligraphy holy book arabic golden light',
        urduCaption: 'تو اپنے رب کے اس وعدے کو یاد کریں: ہر تنگی کے ساتھ آسانی ہے!',
        durationSeconds: 12,
        cinematicTransition: 'Golden light flare',
        ambientAudioCue: 'Warm resonant drone tone',
      },
      {
        sceneNumber: 3,
        visualDescription: 'صحرا کے ٹیلوں پر دلکش غروبِ آفتاب اور پرسکون افق',
        stockSearchQuery: 'desert golden sunset sand dunes peaceful horizon',
        urduCaption: 'صبر کریں، کیونکہ اللہ اپنے صابر بندوں کے ساتھ ہے۔',
        durationSeconds: 10,
        cinematicTransition: 'Subtle slow zoom',
        ambientAudioCue: 'Uplifting gentle crescendo',
      },
    ],
    audioDirection: {
      voicePacing: 'Slow, reflective, deep and emotionally calming with 1.5s pauses between sentences',
      pauseMoments: ['After reciting the Ayah', 'Before concluding reflection'],
      soundtrackSuggestion: 'Gentle spiritual ambient reverb without distracting instruments',
    },
    socialSeo: {
      hooks: [
        'یہ آیت آپ کے پریشان دل کو فورا سکون بخشے گی...',
        'اگر آپ کو لگتا ہے کہ کوئی راستہ نہیں بچا، تو یہ سنیں!',
      ],
      caption: `ہمیشہ یاد رکھیں کہ اللہ کی رحمت مایوسی سے کہیں بڑی ہے۔ ❤️\n\n📌 حوالہ: سورۃ الشرح\n\n#IslamicReels #UrduBayan #QuranicPeace #IslamicStatus #NexoraAI`,
      hashtags: ['#IslamicReels', '#QuranQuotes', '#UrduReminders', '#IslamicStatus', '#PeacefulReflection'],
    },
  };
}

// Fallback generator for 10 Unique Hooks
function generateFallbackHooks(topic: string, language: string, platform: string) {
  const isUrdu = language === 'urdu';
  const isArabic = language === 'arabic';

  return {
    topic,
    targetAudience: 'Global audience & digital creators',
    platform,
    primaryLanguage: language,
    videoDuration: '3-5 minutes',
    tone: 'Curiosity & High Stakes',
    hooks: [
      {
        id: 'hk-1',
        hookType: 'Curiosity',
        openingLine: isUrdu
          ? `ایک ایسا راز جسے میڈیا نے آپ سے چھپایا، مگر آج سچ سامنے آ رہا ہے۔`
          : isArabic
          ? `السر الذي تم إخفاؤه لسنوات طويلة ينكشف اليوم أمام الجميع.`
          : `There is a single documented truth about ${topic} that changes everything you know.`,
        first3SecondsAction: 'Fast zoom on classified document or redacted headline',
        suggestedFootage: 'dark investigative desk with documents and magnifying glass',
        voicePacingStyle: 'Low whisper building into authoritative revelation',
        soundEffectCue: 'Cinematic Sub Boom',
        onScreenText: isUrdu ? 'وہ سچ جو سب نے چھپایا' : 'THE UNTOLD TRUTH',
      },
      {
        id: 'hk-2',
        hookType: 'Emotional',
        openingLine: isUrdu
          ? `اگر آپ بھی اس پریشانی سے گزر رہے ہیں، تو یہ ویڈیو آپ کے لیے آخری امید بن سکتی ہے۔`
          : isArabic
          ? `إذا كنت تشعر أن الأبواب قد أغلقت، فهذه الكلمات لك أنت تحديداً.`
          : `If you have ever felt like giving up on this journey, watch the next 60 seconds.`,
        first3SecondsAction: 'Slow motion shot of solitary figure looking at horizon',
        suggestedFootage: 'solitary silhouette person looking out over city dawn',
        voicePacingStyle: 'Warm, empathetic, sincere and deep',
        soundEffectCue: 'Air Whip Whoosh',
        onScreenText: isUrdu ? 'کیا آپ مایوس ہیں؟' : 'DO NOT GIVE UP',
      },
      {
        id: 'hk-3',
        hookType: 'Documentary',
        openingLine: isUrdu
          ? `یہ کہانی صرف ایک واقعے کی نہیں، بلکہ اربوں ڈالر کے اس انقلاب کی ہے جس نے دنیا بدل دی۔`
          : isArabic
          ? `هذه ليست مجرد قصة عادية، بل هي الثورة التي أعادت رسم خريطة الاقتصاد العالمي.`
          : `In the history of modern business, few revolutions happened as quietly or ruthlessly as ${topic}.`,
        first3SecondsAction: 'Rapid montage of global skylines and stock tickers',
        suggestedFootage: 'metropolitan skyscraper night traffic time-lapse',
        voicePacingStyle: 'Authoritative, calm, objective documentary cadence',
        soundEffectCue: 'Cinematic Sub Boom',
        onScreenText: isUrdu ? 'عالمی انقلاب کی ابتدا' : 'THE GLOBAL SHIFT',
      },
      {
        id: 'hk-4',
        hookType: 'Question',
        openingLine: isUrdu
          ? `کیا آپ جانتے ہیں کہ صرف اگلے 3 سالوں میں آپ کا کام کرنے کا طریقہ کیسے بدلنے والا ہے؟`
          : isArabic
          ? `هل تعلم كيف ستتغير حياتك وعملك بالكامل خلال السنوات الثلاث القادمة؟`
          : `Have you ever wondered why 99% of people misunderstand the real power of ${topic}?`,
        first3SecondsAction: 'Direct gaze into lens with rapid cut on question mark',
        suggestedFootage: 'person looking directly into camera in high tech room',
        voicePacingStyle: 'Direct inquiry with a 1-second pause after question',
        soundEffectCue: 'Suspense Riser',
        onScreenText: isUrdu ? 'کیا آپ تیار ہیں؟' : 'ARE YOU PREPARED?',
      },
      {
        id: 'hk-5',
        hookType: 'Shocking Stat',
        openingLine: isUrdu
          ? `ایک محتاط اندازے کے مطابق 85 فیصد کمپنیاں اس ایک غلطی کی وجہ سے برباد ہو گئیں۔`
          : isArabic
          ? `أكثر من 85 بالمائة يفشلون في هذه النقطة بالتحديد دون أن يدركوا السبب.`
          : `Over 85% of people fail at this before even understanding the underlying rule.`,
        first3SecondsAction: 'Counter ticking rapidly from 0% to 85% with red alert glow',
        suggestedFootage: 'digital finance chart crashing into red zone',
        voicePacingStyle: 'Fast, urgent and alarming delivery',
        soundEffectCue: 'Sub-Bass Drop',
        onScreenText: '85% FAILED HERE',
      },
      {
        id: 'hk-6',
        hookType: 'Contrast / Paradox',
        openingLine: isUrdu
          ? `ہم سمجھتے ہیں کہ کامیابی محنت سے ملتی ہے، لیکن حقیقت اس کے بالکل برعکس ہے۔`
          : isArabic
          ? `الجميع يظن أن الطريق يبدأ من هنا، لكن الواقع يثبت العكس تماماً.`
          : `We are told that working harder is the answer. The real billionaires did the exact opposite.`,
        first3SecondsAction: 'Split screen comparing two opposite actions',
        suggestedFootage: 'split screen chaotic crowded office vs calm empty penthouse',
        voicePacingStyle: 'Contrasting pitch: high then suddenly low and steady',
        soundEffectCue: 'Vinyl Scratch',
        onScreenText: isUrdu ? 'حقیقت بمقابلہ وہم' : 'THE PARADOX',
      },
      {
        id: 'hk-7',
        hookType: 'Story / Anecdote',
        openingLine: isUrdu
          ? `یہ بات 2020 کی ہے، جب ایک بند کمرے میں لیے گئے فیصلے نے پوری مارکیٹ ہلا دی۔`
          : isArabic
          ? `في غرفة اجتماعات مغلقة، صدر قرار واحد غيّر مسار السوق إلى الأبد.`
          : `It started inside a nondescript room with a single decision nobody was supposed to notice.`,
        first3SecondsAction: 'Close up on vintage phone ringing or door slowly opening',
        suggestedFootage: 'dark boardroom leather chairs and dim spotlight',
        voicePacingStyle: 'Narrative storytelling tempo, deliberate pauses',
        soundEffectCue: 'Air Whip Whoosh',
        onScreenText: isUrdu ? 'بند کمرے کا فیصلہ' : 'THE CLOSED DOOR',
      },
      {
        id: 'hk-8',
        hookType: 'Challenge / Direct',
        openingLine: isUrdu
          ? `میں شرط لگا کر کہہ سکتا ہوں کہ آپ نے اس زاویے سے کبھی نہیں سوچا ہوگا۔`
          : isArabic
          ? `أتحداك أنك لم تنظر إلى هذا الموضوع بهذه الطريقة من قبل.`
          : `Stop scrolling. If you care about your future in 2026, test yourself on this.`,
        first3SecondsAction: 'Snapping fingers directly at camera',
        suggestedFootage: 'dynamic forward tracking shot in futuristic hallway',
        voicePacingStyle: 'Firm, assertive, eye-contact tone',
        soundEffectCue: 'Cinematic Sub Boom',
        onScreenText: isUrdu ? 'ایک کھلا چیلنج' : 'TEST YOURSELF',
      },
      {
        id: 'hk-9',
        hookType: 'Visual Hook',
        openingLine: isUrdu
          ? `جو منظر آپ ابھی اپنی اسکرین پر دیکھ رہے ہیں، وہ کوئی عام ویڈیو نہیں ہے۔`
          : isArabic
          ? `ما تشاهده الآن على شاشتك ليس مجرد مشهد عابر، بل هو بداية قصة لا تصدق.`
          : `What you are seeing on screen right now is the exact moment everything tipped.`,
        first3SecondsAction: 'Hyper-lapse footage reversing backwards in time',
        suggestedFootage: 'reversed footage of collapsing sand or exploding water droplet',
        voicePacingStyle: 'Dramatic, synchronized with visual impact beat',
        soundEffectCue: 'Suspense Riser',
        onScreenText: isUrdu ? 'غور سے دیکھیں' : 'LOOK CLOSELY',
      },
      {
        id: 'hk-10',
        hookType: 'Urgency',
        openingLine: isUrdu
          ? `وقت ختم ہو رہا ہے۔ اگر آپ نے آج یہ نہ سمجھا، تو شاید بہت دیر ہو چکی ہوگی۔`
          : isArabic
          ? `الوقت ينفد بسرعة، وإذا فاتتك هذه الفرصة اليوم قد لا تعود مجدداً.`
          : `The window is closing faster than most people realize. Here is what happens next.`,
        first3SecondsAction: 'Sand slipping through hourglass or digital clock counting down',
        suggestedFootage: 'golden hourglass with sand running out against black backdrop',
        voicePacingStyle: 'Urgent, quick, no hesitation',
        soundEffectCue: 'Cinematic Sub Boom',
        onScreenText: isUrdu ? 'وقت تیزی سے گزر رہا ہے' : 'TIME IS RUNNING OUT',
      },
    ],
  };
}

// Fallback generator for Link Analysis
function generateFallbackLinkAnalysis(url: string, platform: 'YouTube' | 'Instagram' | 'TikTok' | 'Unknown') {
  return {
    url,
    platform,
    topic: 'High-Retention Video Formula & Pacing Case Study',
    niche: 'Digital Media & Storytelling',
    estimatedDuration: '45 - 90 seconds',
    storyStructure: {
      hook: 'High-energy visual disruption in the first 2.5 seconds with on-screen bold text',
      problem: 'Introduces a relatable pain point or unanswered curiosity gap within 8 seconds',
      escalation: 'Piles on 3 rapid proofs, b-roll cuts, or data points to maintain dopamine loop',
      climax: 'Delivers the primary insight or plot twist with a music swell',
      resolution: 'Quick, natural call to action without dragging closing fluff',
    },
    transcriptSummary: 'This content uses structured micro-hooks and high cutting frequency (every 2-3 seconds) to maintain above 70% retention through the midpoint.',
    keyTakeaways: [
      'Visual cut every 2.4 seconds to eliminate drop-off',
      'Music track ducks during vocal punches to maximize speech clarity',
      'Never uses stationary camera without animated subtitle highlights',
      'Hook introduces a question that is only answered at the 80% mark',
    ],
    editingStyle: {
      pacing: 'Rapid-fire (18-24 cuts per minute)',
      cutsPerMinute: '~22 cuts/min',
      bRollDensity: 'Heavy (stock b-roll layered over narration)',
      colorGradeVibe: 'High-contrast cinematic with dark vignetting',
      musicVibe: 'Cinematic Tension & Hybrid Trap Beat',
    },
    hookAnatomy: {
      openingLine: 'Shocking statement delivered with zero introductory greeting',
      retentionDriver: 'Curiosity gap with high stakes payoff',
      visualTrigger: 'Rapid kinetic typography and sound effect impact',
    },
    visualStyle: 'Modern dark mode with electric blue and purple neon text accents',
    actionSuggestions: {
      originalScriptTopic: 'Create an original deep-dive on modern industry disruptions using the same 5-part retention curve.',
      styleInspirationNotes: 'Emulate the 2.5s cut pacing and sound effect punctuation while writing original narration.',
      userUploadTips: 'Record talking head in 4K, overlay relevant Pexels footage every 3 seconds, and apply audio ducking.',
    },
  };
}

// Fallback generator for Retention Analysis
function generateFallbackRetention(durationSeconds: number) {
  const steps = Math.min(20, Math.max(8, Math.floor(durationSeconds / 10)));
  const curve = [];
  let pct = 100;

  for (let i = 0; i <= steps; i++) {
    const sec = Math.round((i / steps) * durationSeconds);
    if (i === 0) pct = 100;
    else if (i === 1) pct = 82; // Initial hook retention drop
    else if (i === 2) pct = 76;
    else if (i === Math.floor(steps * 0.4)) pct = 68; // Midpoint drop
    else if (i === Math.floor(steps * 0.7)) pct = 62;
    else pct = Math.max(48, pct - Math.round(Math.random() * 3 + 1));

    curve.push({
      second: sec,
      percentage: pct,
      label: sec === 0 ? 'Video Start' : sec < 5 ? 'First 3s Hook' : sec === Math.round(durationSeconds / 2) ? 'Midpoint' : undefined,
      isDropRisk: i === 1 || i === Math.floor(steps * 0.4),
    });
  }

  return {
    overallScore: 88,
    first3SecondsScore: 92,
    pacingScore: 85,
    curiosityScore: 89,
    retentionCurve: curve,
    dropOffRisks: [
      {
        timestamp: '0:03 - 0:06',
        issue: 'Viewer drop-off risk right after opening line if b-roll transition is delayed',
        fixSuggestion: 'Insert a dramatic transition sound effect (Whoosh or Boom) and switch stock footage at second 3.0.',
      },
      {
        timestamp: '0:45 - 0:55',
        issue: 'Pacing slows down during explanatory background section',
        fixSuggestion: 'Break monologue into two short punchy sentences with an on-screen statistic or graphic overlay.',
      },
    ],
    viralRetentionFixes: [
      'Eliminate all greetings ("Hello viewers", "Welcome back") in first 3 seconds',
      'Add micro-curiosity loops every 25 seconds ("And that led to an even bigger problem...")',
      'Keep subtitle font centered and brightly styled with high-contrast background highlights',
      'Use music auto-ducking to make narration cut through clearly',
    ],
  };
}

// Fallback generator for Content Topics
function generateFallbackTopics(niche: string) {
  const topicsMap: Record<string, any[]> = {
    business_documentaries: [
      {
        id: `topic-${Date.now()}-1`,
        title: 'The Silent Semiconductor Monopoly: Inside ASML’s $300B Machine',
        titleUrdu: 'اے ایس ایم ایل: وہ ڈچ کمپنی جس کے بغیر جدید دنیا کا نظام رک سکتا ہے',
        niche: 'business_documentaries',
        viralHookAngle: 'There is only ONE factory on Earth capable of printing advanced microchips.',
        targetAudience: 'Tech Investors & Business Analysts',
        estimatedDuration: '12-16 mins',
        keyConflict: 'Global superpowers fighting over a single European company',
        viralityScore: 97,
        tags: ['ASML', 'Semiconductors', 'Tech Monopoly'],
      },
      {
        id: `topic-${Date.now()}-2`,
        title: 'How De Beers Convinced the World Diamonds Are Precious',
        titleUrdu: 'ہیرے کی اصل حقیقت: دنیا کا سب سے بڑا نفسیاتی بزنس کھیل',
        niche: 'business_documentaries',
        viralHookAngle: 'Diamonds are neither rare nor valuable until a 1938 marketing trick changed culture.',
        targetAudience: 'Consumers & Marketing Professionals',
        estimatedDuration: '10-14 mins',
        keyConflict: 'Artificial supply restriction vs consumer perception',
        viralityScore: 94,
        tags: ['De Beers', 'Marketing Genius', 'Diamond Myth'],
      },
      {
        id: `topic-${Date.now()}-3`,
        title: 'The Fall of Credit Suisse: 167 Years of Secrecy Wiped in 72 Hours',
        titleUrdu: 'کریڈٹ سوئس کا زوال: 167 سالہ تاریخ صرف 72 گھنٹوں میں ختم',
        niche: 'business_documentaries',
        viralHookAngle: 'The weekend phone call that forced Switzerland to surrender its banking crown.',
        targetAudience: 'Finance Enthusiasts',
        estimatedDuration: '14-18 mins',
        keyConflict: 'Reckless risk-taking vs systemic financial panic',
        viralityScore: 93,
        tags: ['Banking Crisis', 'Credit Suisse', 'Wall Street'],
      },
    ],
    business_success_stories: [
      {
        id: `topic-${Date.now()}-1`,
        title: 'How Jensen Huang Built Nvidia from a Denny’s Booth to $3 Trillion',
        titleUrdu: 'ایک چھوٹے سے کیفے سے 3 ٹریلین ڈالر کا سفر: جینسن ہوانگ کی کامیابی',
        niche: 'business_success_stories',
        viralHookAngle: 'Betting his entire company 3 times on technology that did not yet exist.',
        targetAudience: 'Founders & Aspiring Entrepreneurs',
        estimatedDuration: '11-15 mins',
        keyConflict: 'Near-death bankruptcy vs stubborn 20-year vision',
        viralityScore: 98,
        tags: ['Nvidia', 'Jensen Huang', 'AI Revolution'],
      },
    ],
    islamic_educational: [
      {
        id: `topic-${Date.now()}-1`,
        title: 'The Golden Age of Baghdad: The House of Wisdom and Global Science',
        titleUrdu: 'بیت الحکمت بغداد: جب مسلم سائنسدانوں نے جدید دنیا کی بنیاد رکھی',
        niche: 'islamic_educational',
        viralHookAngle: 'While Europe was in the Dark Ages, Baghdad was translating all human knowledge.',
        targetAudience: 'Muslim Youth & History Scholars',
        estimatedDuration: '12-16 mins',
        keyConflict: 'Preservation of classical sciences against historical decay',
        viralityScore: 96,
        tags: ['House of Wisdom', 'Islamic Golden Age', 'Baghdad'],
      },
    ],
    money_lessons: [
      {
        id: `topic-${Date.now()}-1`,
        title: 'The 5 Psychological Traps That Keep 90% of People Middle Class',
        titleUrdu: 'پیسے کے وہ 5 نفسیاتی جال جو انسان کو کبھی امیر نہیں بننے دیتے',
        niche: 'money_lessons',
        viralHookAngle: 'Why earning more money rarely fixes money problems.',
        targetAudience: 'Young Adults & Salaried Professionals',
        estimatedDuration: '9-12 mins',
        keyConflict: 'Lifestyle creep and emotional spending vs compounding',
        viralityScore: 95,
        tags: ['Wealth Psychology', 'Money Habits', 'Financial Freedom'],
      },
    ],
  };

  return topicsMap[niche] || topicsMap.business_documentaries;
}

// Fallback generator for Bulk Content Plans
function generateFallbackBulkPlan(niche: string, theme: string) {
  return {
    batchId: `batch-${Date.now()}`,
    niche,
    theme,
    plans: [
      {
        day: 'Day 1 (Monday)',
        topic: 'The Untold Origin Story: How the Monopoly Started',
        hookIdea: 'Before they were a billion-dollar titan, they were laughed out of every bank.',
        format: '16:9 Documentary',
        estimatedMinutes: 12,
      },
      {
        day: 'Day 2 (Tuesday)',
        topic: 'The 3-Second Psychological Trick Behind Their Brand Loyalty',
        hookIdea: 'You make this purchase decision in 0.4 seconds without realizing why.',
        format: '9:16 Short/Reel',
        estimatedMinutes: 1,
      },
      {
        day: 'Day 3 (Wednesday)',
        topic: 'The Secret Contract That Destroyed Their Biggest Competitor',
        hookIdea: 'A single clause written in 1999 created an insurmountable moat.',
        format: '16:9 Documentary',
        estimatedMinutes: 14,
      },
      {
        day: 'Day 4 (Thursday)',
        topic: 'The Biggest Money Mistake Their Founders Made',
        hookIdea: 'Selling 10% of their equity for $800 in 1976.',
        format: '9:16 Short/Reel',
        estimatedMinutes: 1,
      },
      {
        day: 'Day 5 (Friday)',
        topic: 'The Global Crisis That Threatens Their Entire Empire Today',
        hookIdea: 'Supply chains are fracturing, and their core revenue stream is in jeopardy.',
        format: '16:9 Documentary',
        estimatedMinutes: 15,
      },
      {
        day: 'Day 6 (Saturday)',
        topic: 'What You Must Learn from Their 20-Year Compounding Formula',
        hookIdea: 'Success is not a sprint; here is the mathematics of patience.',
        format: '9:16 Short/Reel',
        estimatedMinutes: 1,
      },
      {
        day: 'Day 7 (Sunday)',
        topic: 'Viewer Q&A & Strategy Breakdown: Applying This in 2026',
        hookIdea: 'How to build your own defensible micro-business using their playbook.',
        format: '16:9 Documentary',
        estimatedMinutes: 10,
      },
    ],
  };
}

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NEXORA AI Studio Server running at http://localhost:${PORT}`);
  });
}

startServer();
