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

// Health & Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    hasGemini: !!apiKey,
    hasPexels: !!process.env.PEXELS_API_KEY,
    status: 'online',
    version: '1.0.0',
    model: 'gemini-3.8-flash',
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

// 3. AI Script Writer Studio
app.post('/api/gemini/script', async (req, res) => {
  const { topic, format = 'documentary', language = 'urdu', tone = 'engaging' } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  if (!ai) {
    return res.json({
      success: true,
      data: {
        title: `${topic} - مکمل اسکرپٹ`,
        hook: `کیا آپ جانتے ہیں کہ ${topic} کے پیچھے اصل حقیقت کیا ہے؟ آئیے جانتے ہیں اس ویڈیو میں۔`,
        introduction: `آج کی اس تفصیلی ویڈیو میں ہم ${topic} کا مکمل جائزہ لیں گے۔ تاریخ سے لے کر موجودہ دور تک، وہ سب کچھ جو آپ کے لیے جاننا ضروری ہے۔`,
        bodySections: [
          {
            heading: 'پہلا باب: بنیاد اور پس منظر',
            content: `سب سے پہلے ہمیں یہ سمجھنا ہوگا کہ اس کی شروعات کہاں سے ہوئی۔ ماہرین کے مطابق اس کے بنیادی محرکات انتہائی گہرے اور دلچسپ ہیں۔`,
            visualCue: 'پرانے تاریخی آرکائیوز اور اہم حقائق کے گرافکس',
          },
          {
            heading: 'دوسرا باب: اصل موڑ اور چیلنجز',
            content: `وقت گزرنے کے ساتھ ساتھ نئے چیلنجز سامنے آئے۔ معاشی اور سماجی تبدیلیوں نے اس کے اثرات کو کئی گنا بڑھا دیا۔`,
            visualCue: 'اعداد و شمار کے جدید ڈیش بورڈز اور خبروں کے تراشے',
          },
          {
            heading: 'تیسرا باب: مستقبل اور حتمی نتیجہ',
            content: `اب سوال یہ پیدا ہوتا ہے کہ آنے والے وقت میں اس کا اثر کیا ہوگا؟ جو کمپنیاں یا افراد وقت کے ساتھ تبدیل نہیں ہوتے وہ پیچھے رہ جاتے ہیں۔`,
            visualCue: 'جدید ٹیکنالوجی اور مستقبل کے امکانات پر مبنی مناظر',
          },
        ],
        conclusion: `اگر آپ کو یہ ویڈیو معلوماتی لگی تو چینل کو ضرور سبسکرائب کریں اور اپنی قیمتی رائے کمنٹس میں شیئر کریں۔`,
        estimatedReadingTimeSeconds: 180,
      },
      isFallback: true,
    });
  }

  try {
    const prompt = `You are a world-class YouTube scriptwriter for NEXORA AI.
Topic: "${topic}"
Format: ${format} (e.g. Documentary, Explainer, Reel, Story, Podcast)
Language: ${language} (Write in high-quality Urdu script with clear punctuation)
Tone: ${tone}

Return a complete, production-ready script formatted strictly as JSON:
{
  "title": string,
  "hook": string,
  "introduction": string,
  "bodySections": [
    {
      "heading": string,
      "content": string,
      "visualCue": string
    }
  ],
  "conclusion": string,
  "estimatedReadingTimeSeconds": number
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
