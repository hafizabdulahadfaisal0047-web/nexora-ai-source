export type AspectRatio = '16:9' | '9:16' | '1:1';
export type Resolution = '720p' | '1080p';
export type TransitionType = 'fade' | 'zoom' | 'slide' | 'cut';

export interface Scene {
  id: string;
  sceneNumber: number;
  title: string;
  visualDescription: string;
  stockSearchQuery: string;
  videoUrl: string;
  previewUrl: string;
  urduNarration: string;
  englishSubtitle: string;
  durationSeconds: number;
  transition: TransitionType;
  soundEffect?: string;
  isCustomUpload?: boolean;
}

export interface DocumentaryPlan {
  topic: string;
  hook: string;
  researchSummary: string;
  scenes: {
    sceneNumber: number;
    title: string;
    visualDescription: string;
    stockSearchQuery: string;
    urduNarration: string;
    englishSubtitle: string;
    durationSeconds: number;
    transition: TransitionType;
    soundEffect: string;
  }[];
  musicRecommendation: {
    trackStyle: string;
    tempoBpm: number;
    mood: string;
  };
  youtubeSeo: {
    titles: string[];
    description: string;
    tags: string[];
    hashtags: string[];
  };
}

export interface IslamicReelPlan {
  title: string;
  coreMessage: string;
  authenticReference: {
    arabicText: string;
    reference: string;
    urduMeaning: string;
  };
  scenes: {
    sceneNumber: number;
    visualDescription: string;
    stockSearchQuery: string;
    urduCaption: string;
    durationSeconds: number;
    cinematicTransition: string;
    ambientAudioCue: string;
  }[];
  audioDirection: {
    voicePacing: string;
    pauseMoments: string[];
    soundtrackSuggestion: string;
  };
  socialSeo: {
    hooks: string[];
    caption: string;
    hashtags: string[];
  };
}

export interface StockVideo {
  id: string;
  title: string;
  duration: number;
  preview: string;
  videoUrl: string;
  photographer: string;
  width?: number;
  height?: number;
  source: 'pexels' | 'curated' | 'upload';
}

export interface BackgroundMusic {
  id: string;
  name: string;
  genre: string;
  bpm: number;
  mood: string;
  audioUrl?: string; // audio source or synthesized tone generator
}

export interface Project {
  id: string;
  title: string;
  type: 'business_documentary' | 'islamic_reel' | 'custom_video' | 'script';
  createdAt: string;
  updatedAt: string;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  scenes: Scene[];
  voiceoverText?: string;
  voiceoverAudioUrl?: string;
  voiceoverOffsetSeconds?: number;
  bgMusicTrack?: string;
  bgMusicVolume?: number;
  exportedVideoUrl?: string;
  thumbnailDataUrl?: string;
  youtubeSeo?: {
    titles?: string[];
    description?: string;
    tags?: string[];
    hashtags?: string[];
  };
  scriptData?: any;
}
