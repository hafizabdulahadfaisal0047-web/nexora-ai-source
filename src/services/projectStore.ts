import { Project } from '../types';

const STORAGE_KEY = 'nexora_ai_projects_v1';

const DEFAULT_SAMPLE_PROJECTS: Project[] = [
  {
    id: 'demo-doc-1',
    title: 'پاکستان کا آئی ٹی انقلاب - اربوں ڈالر کا سفر',
    type: 'business_documentary',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    aspectRatio: '16:9',
    resolution: '1080p',
    bgMusicTrack: 'Cinematic Modern Cyberpunk & Tension Strings',
    bgMusicVolume: 0.25,
    scenes: [
      {
        id: 'scene-1',
        sceneNumber: 1,
        title: 'شروعات: ٹیک کا نیا دور',
        visualDescription: 'ٹیکنالوجی سرور رومز، جدید کمپیوٹر کوڈنگ اسکرینز اور نوجوان ڈویلپرز',
        stockSearchQuery: 'technology servers coding software developer dark',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        previewUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
        urduNarration: 'کیا آپ جانتے ہیں کہ پاکستان کے فری لانسرز اور ٹیک اسٹارٹ اپس نے دنیا کو کیسے حیران کیا؟',
        englishSubtitle: 'How Pakistani tech innovators and freelancers took the global market by storm.',
        durationSeconds: 8,
        transition: 'zoom',
        soundEffect: 'Subtle high-tech digital riser',
      },
      {
        id: 'scene-2',
        sceneNumber: 2,
        title: 'اسٹاک اور فنانس کا معرکہ',
        visualDescription: 'فنانشل چارٹس، بلومبرگ اسکرینز اور ٹریڈنگ ایکسچینج',
        stockSearchQuery: 'stock market financial charts trading dark office',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        previewUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
        urduNarration: 'صرف چند سالوں میں اربوں روپے کا کیپیٹل ملک میں آیا اور معیشت کو نئی طاقت ملی۔',
        englishSubtitle: 'Billions in venture capital flowed in, creating an unprecedented economic surge.',
        durationSeconds: 10,
        transition: 'fade',
        soundEffect: 'Tense cinematic low bass drone',
      },
      {
        id: 'scene-3',
        sceneNumber: 3,
        title: 'مستقبل کا وژن',
        visualDescription: 'ماڈرن کارپوریٹ اسکائی لائن، تیز رفتار روشنیاں اور نیا پاکستان',
        stockSearchQuery: 'metropolitan night skyline business vision technology',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
        previewUrl: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=800&auto=format&fit=crop&q=80',
        urduNarration: 'اب وقت آ چکا ہے کہ ہم مصنوعی ذہانت اور ٹیکنالوجی کی طاقت سے اپنی تقدیر خود بدلیں۔',
        englishSubtitle: 'Now is the time to leverage AI and innovation to author our collective destiny.',
        durationSeconds: 9,
        transition: 'slide',
        soundEffect: 'Inspiring orchestral crescendo',
      },
    ],
    youtubeSeo: {
      titles: [
        'پاکستان کا آئی ٹی انقلاب: اربوں ڈالر کی ان کہی کہانی!',
        'How Pakistan Became a Global Tech Powerhouse',
      ],
      description: 'اس خصوصی ڈاکومنٹری میں جانیے پاکستان کی ٹیک انڈسٹری کی شاندار کامیابی اور آنے والے چیلنجز!',
      tags: ['Pakistan Tech', 'IT Industry Pakistan', 'Urdu Documentary', 'Nexora AI'],
      hashtags: ['#PakistanTech', '#UrduDocumentary', '#NexoraAI'],
    },
  },
  {
    id: 'demo-reel-1',
    title: 'صبر اور توکل - دل کو چھو لینے والی آیت',
    type: 'islamic_reel',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    aspectRatio: '9:16',
    resolution: '1080p',
    bgMusicTrack: 'Peaceful Spiritual Ambient Drone',
    bgMusicVolume: 0.15,
    scenes: [
      {
        id: 'reel-s1',
        sceneNumber: 1,
        title: 'مسجد کی پرسکون محرابیں',
        visualDescription: 'مسجد الحرام کے شاندار ستون اور سنہری روشنی',
        stockSearchQuery: 'grand mosque architecture arches daylight serene',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        previewUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80',
        urduNarration: 'جب دنیا کے تمام دروازے بند لگیں...',
        englishSubtitle: 'When every worldly door seems closed...',
        durationSeconds: 6,
        transition: 'fade',
      },
      {
        id: 'reel-s2',
        sceneNumber: 2,
        title: 'قرآنی بشارت',
        visualDescription: 'کھلا ہوا قرآن پاک اور سنہری نور',
        stockSearchQuery: 'quran calligraphy holy book arabic golden light',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
        previewUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&auto=format&fit=crop&q=80',
        urduNarration: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ ہر مشکل کے ساتھ آسانی ہے!',
        englishSubtitle: 'Verily with hardship comes ease (Al-Inshirah: 5)',
        durationSeconds: 8,
        transition: 'zoom',
      },
    ],
  },
];

export class ProjectStore {
  public static getProjects(): Project[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_PROJECTS));
        return DEFAULT_SAMPLE_PROJECTS;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse projects from localStorage', e);
      return DEFAULT_SAMPLE_PROJECTS;
    }
  }

  public static getProjectById(id: string): Project | undefined {
    const list = this.getProjects();
    return list.find((p) => p.id === id);
  }

  public static saveProject(project: Project): void {
    const list = this.getProjects();
    const index = list.findIndex((p) => p.id === project.id);
    const updated = {
      ...project,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      list[index] = updated;
    } else {
      list.unshift(updated);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  public static deleteProject(id: string): void {
    const list = this.getProjects().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  public static duplicateProject(id: string): Project | null {
    const original = this.getProjectById(id);
    if (!original) return null;

    const duplicated: Project = {
      ...original,
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: `${original.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scenes: original.scenes.map((s) => ({
        ...s,
        id: `sc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      })),
    };

    this.saveProject(duplicated);
    return duplicated;
  }

  public static exportAllAsJson(): string {
    return JSON.stringify(this.getProjects(), null, 2);
  }

  public static importFromJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
