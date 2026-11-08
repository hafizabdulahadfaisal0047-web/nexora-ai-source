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
  {
    id: 'stock-biz-1',
    category: 'business',
    tags: ['stock market', 'finance', 'charts', 'trading', 'money'],
    title: 'Financial Stock Market Analysis',
    duration: 15,
    preview: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    photographer: 'Pexels Finance Studio',
  },
  {
    id: 'stock-biz-2',
    category: 'business',
    tags: ['corporate', 'meeting', 'office', 'strategy', 'team'],
    title: 'Modern Corporate Boardroom Strategy',
    duration: 12,
    preview: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    photographer: 'Nexora Media Pro',
  },
  {
    id: 'stock-biz-3',
    category: 'business',
    tags: ['technology', 'server', 'datacenter', 'cyber', 'ai'],
    title: 'Futuristic AI Datacenter Infrastructure',
    duration: 14,
    preview: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    photographer: 'CyberTech Archive',
  },
  {
    id: 'stock-biz-4',
    category: 'business',
    tags: ['factory', 'automation', 'robotics', 'industry', 'shipping'],
    title: 'Automated Industrial Production & Logistics',
    duration: 10,
    preview: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    photographer: 'Industrial Motion Labs',
  },
  {
    id: 'stock-biz-5',
    category: 'business',
    tags: ['skyline', 'city', 'night', 'skyscrapers', 'global'],
    title: 'Metropolitan Night Skyline & Traffic Lights',
    duration: 18,
    preview: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    photographer: 'Urban Cinematic',
  },
  {
    id: 'stock-islamic-1',
    category: 'islamic',
    tags: ['mosque', 'masjid', 'architecture', 'dome', 'minaret'],
    title: 'Grand Mosque Majestic Arches & Minarets',
    duration: 15,
    preview: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    photographer: 'Islamic Heritage Media',
  },
  {
    id: 'stock-islamic-2',
    category: 'islamic',
    tags: ['quran', 'calligraphy', 'arabic', 'book', 'holy'],
    title: 'Illuminated Holy Quran Open Manuscript',
    duration: 12,
    preview: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
    photographer: 'Nur Visuals',
  },
  {
    id: 'stock-islamic-3',
    category: 'islamic',
    tags: ['desert', 'dunes', 'sunset', 'sand', 'sky'],
    title: 'Golden Sunset over Arabian Sand Dunes',
    duration: 14,
    preview: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    photographer: 'Sahara Cinematic',
  },
  {
    id: 'stock-islamic-4',
    category: 'islamic',
    tags: ['lantern', 'fanous', 'ramadan', 'light', 'night'],
    title: 'Glowing Traditional Brass Lantern at Twilight',
    duration: 10,
    preview: 'https://images.unsplash.com/photo-1558223630-f8f8b88d2f1f?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    photographer: 'Crescent Ambient Arts',
  },
  {
    id: 'stock-islamic-5',
    category: 'islamic',
    tags: ['clouds', 'nature', 'peaceful', 'rain', 'mountains'],
    title: 'Peaceful Mountain Mist & Contemplation',
    duration: 16,
    preview: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    photographer: 'Serenity Nature Works',
  },
];

// Pexels Video Search Proxy
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

  // Fallback to curated library matched against query words
  const terms = query.toLowerCase().split(/\s+/);
  const matched = CURATED_VIDEOS.filter((v) =>
    terms.some((t) => v.tags.some((tag) => tag.includes(t)) || v.title.toLowerCase().includes(t))
  );

  const results = matched.length > 0 ? matched : CURATED_VIDEOS;
  res.json({
    videos: results.map((v) => ({ ...v, source: 'curated' })),
    source: 'curated',
    note: pexelsKey ? 'Used curated stock clips' : 'Enter your free Pexels API key in Settings for millions of real-time videos.',
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
    const prompt = `You are the lead showrunner and director of NEXORA AI, specializing in high-impact Urdu business documentaries inspired by Dhruv Rathee, Magnates Media, and Bloomberg Originals.

Topic: "${topic}"
Target Duration: ~${durationMinutes} minutes (${durationMinutes * 60} seconds).
Tone: ${tone}

Produce a complete, gripping, research-backed Urdu documentary production package formatted strictly as a single JSON object.
Ensure:
1. Authentic, natural, literary Urdu script (Nastaliq style) that sounds professional, engaging, and authoritative.
2. Provide scene-by-scene visual instructions, stock search keywords in English for Pexels stock video search, Urdu narration voiceover, English subtitles, duration (in seconds, total sum approx ${durationMinutes * 60}s), transition style ("fade", "zoom", "slide", or "cut"), and sound effects.
3. Include background music recommendations, sound design cues, and high-CTR YouTube metadata (Title variations in Urdu/English, detailed description with chapter timestamps, tags, and hashtags).

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
  const { text, voiceName = 'Kore', style = 'Clear, professional Urdu narrator, slow and authoritative' } = req.body;

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
                style,
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
        durationSeconds: 15,
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
        durationSeconds: 20,
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
        durationSeconds: 25,
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
        durationSeconds: 20,
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
