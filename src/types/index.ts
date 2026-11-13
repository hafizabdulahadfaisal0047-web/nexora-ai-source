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
  audioDurationSeconds?: number; // Calculated / measured spoken audio duration
  colorGrade?: 'documentary_cold' | 'warm_cinematic' | 'cyberpunk_glow' | 'spiritual_soft' | 'natural_crisp';
  kenBurnsEffect?: 'pan_right' | 'pan_left' | 'zoom_in' | 'zoom_out' | 'static';
  sourceProvider?: 'pexels' | 'pixabay' | 'curated' | 'upload';
  photographer?: string;
  license?: string;
  attributionText?: string;
  textOverlay?: {
    text: string;
    position: 'top' | 'center' | 'bottom';
    color: string;
    backgroundColor?: string;
  };
}

export interface TimelineHealthIssue {
  id: string;
  sceneIndex: number;
  type: 'silent_gap' | 'audio_overrun' | 'missing_media' | 'duplicate_clip' | 'missing_narration' | 'pacing_warning';
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestedDurationSeconds?: number;
}

export interface TimelineHealthReport {
  overallScore: number; // 0 - 100
  score?: number;
  healthy?: boolean;
  status: 'optimal' | 'warnings' | 'needs_fix';
  issues: TimelineHealthIssue[];
  totalDeadSilenceSeconds: number;
  totalAudioDurationSeconds: number;
  totalVideoDurationSeconds: number;
  duplicateClipsCount: number;
  missingMediaCount: number;
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
    videoUrl?: string;
    previewUrl?: string;
    sourceProvider?: 'pexels' | 'pixabay' | 'curated' | 'upload';
    photographer?: string;
    license?: string;
    attributionText?: string;
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
    videoUrl?: string;
    previewUrl?: string;
    photographer?: string;
    license?: string;
    attributionText?: string;
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
  source: 'pexels' | 'pixabay' | 'curated' | 'upload';
  license?: string;
  licenseUrl?: string;
  attributionText?: string;
  relevanceScore?: number;
  orientation?: 'landscape' | 'portrait' | 'square';
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
  overallScore: number; // 1-100 structural score
  first3SecondsScore: number; // 1-100
  pacingScore: number; // 1-100
  curiosityScore: number; // 1-100
  endingScore?: number; // 1-100
  retentionCurve: RetentionPoint[];
  dropOffRisks: {
    timestamp: string;
    issue: string;
    fixSuggestion: string;
  }[];
  viralRetentionFixes: string[];
  isHeuristic?: boolean;
  disclaimer?: string;
  structuralMetrics?: {
    wordCount: number;
    estimatedDurationSeconds: number;
    sentenceCount: number;
    avgWordsPerSentence: number;
    greetingDetected: boolean;
    transitionCount: number;
    hasCta: boolean;
  };
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

// Multi-Provider Architecture Types (No API keys stored or transmitted in frontend!)
export type LLMProviderType = 'gemini' | 'openai_compatible';
export type VoiceProviderType = 'web_speech' | 'gemini_tts' | 'local_synth';
export type ImageProviderType = 'gemini_image' | 'canvas_studio';
export type MediaProviderType = 'pexels' | 'pixabay' | 'curated';

export interface ProviderConfig {
  activeLLM: LLMProviderType;
  activeVoice: VoiceProviderType;
  activeImage: ImageProviderType;
  activeMedia: MediaProviderType;
  autoFallbackEnabled: boolean;
  maxRetries: number;
  cacheEnabled: boolean;
  costLimitDailyCalls: number;
  maxConcurrentJobs: number;
  // Read-only server key availability flags
  hasGeminiKey?: boolean;
  hasPexelsKey?: boolean;
  hasPixabayKey?: boolean;
  hasOpenAICompatibleKey?: boolean;
}

// Content Engine & Calendar Types
export type ContentNiche =
  | 'business_documentaries'
  | 'business_success_stories'
  | 'money_lessons'
  | 'islamic_educational'
  | 'motivational'
  | 'historical_documentaries'
  | 'educational_explainers'
  | 'viral_storytelling';

export interface TopicIdea {
  id: string;
  title: string;
  titleUrdu: string;
  niche: ContentNiche;
  viralHookAngle: string;
  targetAudience: string;
  estimatedDuration: string;
  keyConflict: string;
  viralityScore: number; // 1 - 100 structural hook rating
  similarityScore?: number; // 0 - 100
  tags: string[];
  dateGenerated?: string;
}

export type ContentStatus = 'idea' | 'scripted' | 'recorded' | 'rendered' | 'published';

export interface ContentCalendarItem {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  niche: ContentNiche;
  platform: 'youtube_long' | 'youtube_shorts' | 'instagram_reels';
  status: ContentStatus;
  primaryLanguage: VideoLanguage;
  scriptSnippet?: string;
  projectId?: string;
  notes?: string;
}

export interface SavedScriptItem {
  id: string;
  title: string;
  topic?: string;
  niche: ContentNiche | string;
  primaryLanguage: VideoLanguage;
  alternativeHooks: string[]; // 3 alternative hooks
  fullScript: string;
  factReferences?: string[];
  scenesCount: number;
  wordCount: number;
  targetDurationSeconds: number;
  createdAt: string;
  tags: string[];
}

export interface SavedHookItem {
  id: string;
  topic: string;
  hookType: string;
  openingLine: string;
  platform: string;
  primaryLanguage: VideoLanguage;
  soundEffectCue?: string;
  onScreenText?: string;
  createdAt: string;
}

export interface ContentHistoryItem {
  id: string;
  actionType: 'topic' | 'script' | 'hook' | 'documentary' | 'reel' | 'video' | 'retention_audit';
  title: string;
  niche?: string;
  language?: VideoLanguage;
  createdAt: string;
}

export interface ExportHistoryItem {
  id: string;
  projectId: string;
  projectTitle: string;
  platformTarget: 'YouTube 16:9' | 'YouTube Shorts 9:16' | 'Instagram Reels 9:16' | 'Square 1:1';
  resolution: Resolution;
  mimeType: string;
  durationSeconds: number;
  fileSizeBytes: number;
  hasVerifiedAudio: boolean;
  exportedAt: string;
}

export interface SystemErrorLog {
  id: string;
  timestamp: string;
  source: string;
  message: string;
  resolvedByFallback?: boolean;
}

export interface DuplicateAuditResult {
  isDuplicate: boolean;
  similarityScore: number; // 0 - 100
  status: 'unique' | 'borderline' | 'duplicate';
  message: string;
  matchedTopic?: string;
  suggestedUniqueAngle?: string;
}

export interface BulkContentPlan {
  batchId: string;
  niche: ContentNiche;
  theme: string;
  plans: {
    day: string;
    topic: string;
    hookIdea: string;
    format: '16:9 Documentary' | '9:16 Short/Reel';
    estimatedMinutes: number;
  }[];
}

// Background Job Queue Types
export interface BackgroundJob {
  id: string;
  taskType: 'script_generation' | 'bulk_planning' | 'video_render' | 'retention_audit' | 'topic_to_video';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number; // 0 - 100
  attempts: number;
  createdAt: string;
  completedAt?: string;
  payload?: any;
  result?: any;
  error?: string;
}
