export type AspectRatio = '16:9' | '9:16' | '1:1';
export type Resolution = '720p' | '1080p';
export type TransitionType = 'fade' | 'zoom' | 'slide' | 'cut' | 'wipe' | 'dissolve';

export type VideoLanguage =
  | 'urdu'
  | 'english'
  | 'roman_urdu'
  | 'arabic'
  | 'hindi'
  | 'bilingual';

export type BgmCategory =
  | 'Cinematic Documentary'
  | 'Emotional'
  | 'Suspense'
  | 'Motivational'
  | 'Islamic Ambient'
  | 'Corporate'
  | 'Technology'
  | 'News'
  | 'Silence';

export interface Scene {
  id: string;
  sceneNumber: number;
  title: string;
  visualDescription: string;
  stockSearchQuery: string;
  videoUrl: string;
  previewUrl: string;
  urduNarration: string; // Narration in primary language
  englishSubtitle: string; // Subtitle text
  durationSeconds: number;
  transition: TransitionType;
  soundEffect?: string;
  isCustomUpload?: boolean;
  speed?: number; // 0.5x, 1x, 1.5x, etc.
  zoomLevel?: number; // 1.0 = normal, 1.2 = zoom
  textOverlay?: {
    text: string;
    position: 'top' | 'center' | 'bottom';
    color: string;
    backgroundColor?: string;
  };
}

export interface DocumentaryPlan {
  topic: string;
  primaryLanguage?: VideoLanguage;
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
    category?: BgmCategory;
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
  primaryLanguage?: VideoLanguage;
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
  category: BgmCategory;
  bpm: number;
  mood: string;
  license: string;
  durationSeconds: number;
  audioUrl?: string;
}

export interface SoundEffectItem {
  id: string;
  name: string;
  category: 'Impact' | 'Transition' | 'Riser' | 'Ambient' | 'Foley' | 'Interface';
  type: 'boom' | 'whoosh' | 'riser' | 'chime' | 'glitch' | 'keyboard' | 'shutter' | 'subdrop' | 'vinyl';
  durationSeconds: number;
  description: string;
}

export interface HookItem {
  id: string;
  hookType:
    | 'Curiosity'
    | 'Emotional'
    | 'Documentary'
    | 'Question'
    | 'Shocking Stat'
    | 'Contrast / Paradox'
    | 'Story / Anecdote'
    | 'Challenge / Direct'
    | 'Visual Hook'
    | 'Urgency';
  openingLine: string;
  first3SecondsAction: string;
  suggestedFootage: string;
  voicePacingStyle: string;
  soundEffectCue: string;
  onScreenText: string;
}

export interface HookDesignResult {
  topic: string;
  targetAudience: string;
  platform: 'YouTube Long' | 'YouTube Shorts' | 'Instagram Reels' | 'TikTok' | 'LinkedIn';
  primaryLanguage: VideoLanguage;
  videoDuration: string;
  tone: string;
  hooks: HookItem[];
}

export interface LinkAnalysisResult {
  url: string;
  platform: 'YouTube' | 'Instagram' | 'TikTok' | 'Unknown';
  topic: string;
  niche: string;
  estimatedDuration: string;
  storyStructure: {
    hook: string;
    problem: string;
    escalation: string;
    climax: string;
    resolution: string;
  };
  transcriptSummary: string;
  keyTakeaways: string[];
  editingStyle: {
    pacing: string;
    cutsPerMinute: string;
    bRollDensity: string;
    colorGradeVibe: string;
    musicVibe: string;
  };
  hookAnatomy: {
    openingLine: string;
    retentionDriver: string;
    visualTrigger: string;
  };
  visualStyle: string;
  actionSuggestions: {
    originalScriptTopic: string;
    styleInspirationNotes: string;
    userUploadTips: string;
  };
}

export interface ScriptImprovementResult {
  originalText: string;
  improvedText: string;
  primaryLanguage: VideoLanguage;
  changesMade: string[];
  metrics: {
    pacingScore: number;
    vocabularyScore: number;
    hookStrengthScore: number;
    clarityScore: number;
  };
  retentionBoosters: string[];
  cutSuggestions: string[];
}

export interface RetentionPoint {
  second: number;
  percentage: number;
  label?: string;
  isDropRisk?: boolean;
}

export interface RetentionAnalysisResult {
  overallScore: number; // 1-100
  first3SecondsScore: number; // 1-100
  pacingScore: number; // 1-100
  curiosityScore: number; // 1-100
  retentionCurve: RetentionPoint[];
  dropOffRisks: {
    timestamp: string;
    issue: string;
    fixSuggestion: string;
  }[];
  viralRetentionFixes: string[];
}

export interface SubtitleItem {
  id: string;
  startTime: number; // seconds
  endTime: number; // seconds
  text: string;
  translation?: string;
}

export interface Project {
  id: string;
  title: string;
  type: 'business_documentary' | 'islamic_reel' | 'custom_video' | 'script' | 'topic_to_video';
  primaryLanguage?: VideoLanguage;
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
  subtitles?: SubtitleItem[];
  youtubeSeo?: {
    titles?: string[];
    description?: string;
    tags?: string[];
    hashtags?: string[];
  };
  scriptData?: any;
}
