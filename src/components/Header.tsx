import React from 'react';
import {
  Menu,
  Film,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { TabType } from './Sidebar';
import { SystemStatus } from '../services/api';

interface HeaderProps {
  currentTab: TabType;
  onOpenMobileMenu: () => void;
  systemStatus: SystemStatus | null;
  onQuickNewProject: () => void;
  onOpenVideoEditor: () => void;
}

const TAB_TITLES: Record<TabType, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Command Dashboard',
    subtitle: 'Real-time metrics, quick AI workflows & project library',
  },
  content_engine: {
    title: 'Content Strategy & Topic Radar',
    subtitle: '8-niche topic mining, daily viral prompts, duplicate auditing & 7-day calendar',
  },
  complete_video_maker: {
    title: 'Complete Video Maker Studio',
    subtitle: '12-Step automated AI pipeline from topic to final MP4 video',
  },
  business_documentary: {
    title: 'Business Documentary Studio',
    subtitle: 'Research, Urdu narration, scene division & Pexels footage',
  },
  islamic_reels: {
    title: 'Islamic Reels Studio (9:16)',
    subtitle: 'Strict authentic citations, Urdu Nastaliq subtitles & spiritual visuals',
  },
  hook_designer: {
    title: 'Advanced Hook Designer Studio',
    subtitle: '10 unique high-retention hook formulas with voice pacing & SFX',
  },
  script_writer: {
    title: 'AI Script Laboratory',
    subtitle: 'Multi-format Urdu & English narrative scripts with timings',
  },
  script_improver: {
    title: 'Script Improver & Retention Analyzer',
    subtitle: 'Retention curve analytics, drop-off fixes & Urdu vocabulary polish',
  },
  video_link_analyzer: {
    title: 'Video Link Analyzer Studio',
    subtitle: 'Analyze YouTube, Reels & TikTok structure, pacing & style inspiration',
  },
  urdu_voice: {
    title: 'Multi-Language Voice Generator Studio',
    subtitle: 'Audible TTS for Urdu, English, Roman Urdu, Arabic & Hindi with pitch and speed',
  },
  voice_recorder: {
    title: 'Voice Studio & Microphone Recorder',
    subtitle: 'Record narration with live audio frequency visualizer & instant WAV export',
  },
  music_studio: {
    title: 'Background Music Studio',
    subtitle: '8 genuine royalty-free mood tracks with auto-speech ducking and WAV export',
  },
  sfx_studio: {
    title: 'Sound Effects & Transitions Studio',
    subtitle: 'Synthesized cinematic whooshes, impacts, risers & interface cues',
  },
  video_editor: {
    title: 'Video Editor & Media Studio',
    subtitle: 'Multi-track timeline, scene split/trim/duplicate & verified audio export',
  },
  subtitle_studio: {
    title: 'Subtitle & Caption Studio',
    subtitle: 'Auto-chunking captions with Nastaliq RTL typography & SRT/VTT downloads',
  },
  thumbnail_generator: {
    title: 'YouTube & Reel Thumbnail Studio',
    subtitle: 'Viral high-CTR Urdu typography, dark overlays & 4K canvas export',
  },
  youtube_seo: {
    title: 'YouTube SEO & CTR Engine',
    subtitle: 'High-converting titles, chapter timestamps & ranking tag clusters',
  },
  projects: {
    title: 'Projects Library',
    subtitle: 'Manage saved video projects, duplicate & export video renders',
  },
  settings: {
    title: 'Studio Settings & Integrations',
    subtitle: 'Free Pexels API setup, Gemini AI status & export presets',
  },
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileMenu,
  systemStatus,
  onQuickNewProject,
  onOpenVideoEditor,
}) => {
  const info = TAB_TITLES[currentTab] || {
    title: 'NEXORA AI Studio',
    subtitle: 'Professional AI Video Production',
  };

  return (
    <header className="sticky top-0 z-30 bg-[#07090e]/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            {info.title}
            {currentTab === 'business_documentary' && (
              <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                AI Powered
              </span>
            )}
            {currentTab === 'islamic_reels' && (
              <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                100% Authentic Citations
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">{info.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* API Status Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex rounded-full h-2 w-2 ${
                systemStatus?.hasGemini ? 'bg-cyan-400' : 'bg-amber-400'
              }`}
            />
            <span className="font-medium text-slate-300">
              {systemStatus?.hasGemini ? 'Gemini 4 AI' : 'Fallback Ready'}
            </span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Stock Media:</span>
            <span className="text-emerald-400 font-medium">
              {systemStatus?.hasPexels || systemStatus?.hasPixabay ? 'Live API' : 'Archive Ready'}
            </span>
          </div>
        </div>

        {/* Quick Launch Video Editor */}
        <button
          onClick={onOpenVideoEditor}
          className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
          title="Open Video Editor"
        >
          <Film className="w-3.5 h-3.5 text-pink-400" />
          <span className="hidden sm:inline">Open</span> Editor
        </button>

        {/* New Project Button */}
        <button
          onClick={onQuickNewProject}
          className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-cyan-900/40 hover:shadow-cyan-800/60 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>
    </header>
  );
};
