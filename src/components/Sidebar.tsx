import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Moon,
  FileText,
  Mic,
  Film,
  Image as ImageIcon,
  TrendingUp,
  FolderKanban,
  Settings,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Zap,
  Flame,
  Link2,
  Wand2,
  Music2,
  Radio,
  Subtitles,
  Volume2,
  Compass,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'content_engine'
  | 'complete_video_maker'
  | 'business_documentary'
  | 'islamic_reels'
  | 'hook_designer'
  | 'script_writer'
  | 'script_improver'
  | 'video_link_analyzer'
  | 'urdu_voice'
  | 'voice_recorder'
  | 'music_studio'
  | 'sfx_studio'
  | 'video_editor'
  | 'subtitle_studio'
  | 'thumbnail_generator'
  | 'youtube_seo'
  | 'projects'
  | 'settings';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

interface NavSection {
  title: string;
  items: {
    id: TabType;
    label: string;
    icon: any;
    badge: string | null;
    badgeColor?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onCloseMobile,
}) => {
  const navSections: NavSection[] = [
    {
      title: 'Studio Workspaces',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          badge: null,
        },
        {
          id: 'content_engine',
          label: 'Content Engine & Topics',
          icon: Compass,
          badge: '8 Niches',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        },
        {
          id: 'complete_video_maker',
          label: 'Complete Video Maker',
          icon: Sparkles,
          badge: '12-Step AI',
          badgeColor: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
        },
        {
          id: 'business_documentary',
          label: 'Business Documentary',
          icon: Briefcase,
          badge: 'PRO',
          badgeColor: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
        },
        {
          id: 'islamic_reels',
          label: 'Islamic Reels Studio',
          icon: Moon,
          badge: '9:16',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        },
      ],
    },
    {
      title: 'Creative & Scripting',
      items: [
        {
          id: 'hook_designer',
          label: 'Hook Designer',
          icon: Flame,
          badge: '10 Styles',
          badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        },
        {
          id: 'script_writer',
          label: 'AI Script Writer',
          icon: FileText,
          badge: 'Urdu/Multi',
          badgeColor: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
        },
        {
          id: 'script_improver',
          label: 'Script Improver & Retention',
          icon: Wand2,
          badge: 'CTR',
          badgeColor: 'bg-pink-500/20 text-pink-400 border border-pink-500/30',
        },
        {
          id: 'video_link_analyzer',
          label: 'Video Link Analyzer',
          icon: Link2,
          badge: 'Viral AI',
          badgeColor: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
        },
      ],
    },
    {
      title: 'Audio & Voice Suite',
      items: [
        {
          id: 'urdu_voice',
          label: 'Voice Generator Studio',
          icon: Mic,
          badge: 'TTS',
          badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
        },
        {
          id: 'voice_recorder',
          label: 'Voice Recorder Studio',
          icon: Radio,
          badge: 'Live Mic',
          badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
        },
        {
          id: 'music_studio',
          label: 'Background Music Studio',
          icon: Music2,
          badge: '8 Moods',
          badgeColor: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
        },
        {
          id: 'sfx_studio',
          label: 'Sound Effects Studio',
          icon: Volume2,
          badge: 'SFX',
          badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        },
      ],
    },
    {
      title: 'Editing & Visuals',
      items: [
        {
          id: 'video_editor',
          label: 'Video Editor & Render',
          icon: Film,
          badge: 'Timeline',
          badgeColor: 'bg-pink-500/20 text-pink-400 border border-pink-500/30',
        },
        {
          id: 'subtitle_studio',
          label: 'Subtitle Studio',
          icon: Subtitles,
          badge: 'SRT/VTT',
          badgeColor: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
        },
        {
          id: 'thumbnail_generator',
          label: 'Thumbnail Studio',
          icon: ImageIcon,
          badge: '4K',
          badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        },
        {
          id: 'youtube_seo',
          label: 'YouTube SEO Tools',
          icon: TrendingUp,
          badge: 'Tags',
          badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
        },
      ],
    },
    {
      title: 'Management',
      items: [
        {
          id: 'projects',
          label: 'My Projects',
          icon: FolderKanban,
          badge: null,
        },
        {
          id: 'settings',
          label: 'Settings & APIs',
          icon: Settings,
          badge: null,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#080c14]/95 backdrop-blur-xl border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
                  NEXORA
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 tracking-widest">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Video Production Studio</p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {navSections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {sec.title}
              </div>
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      onCloseMobile();
                    }}
                    className={`w-full group flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/15 via-indigo-500/10 to-transparent text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-950/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                          isActive
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'bg-slate-800/50 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {item.badge && (
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400 opacity-80" />}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Studio Status Box */}
        <div className="p-4 m-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0d1322] border border-cyan-500/20 shadow-xl shadow-cyan-950/20">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" /> Multi-Provider Engine
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-bold">
              Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            Multi-language scripts, attributed HD stock clips, 1080p canvas rendering &amp; verified audio export.
          </p>
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full w-full rounded-full" />
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/60 text-center text-xs text-slate-400">
          <div className="flex items-center justify-center gap-2">
            <span className="font-urdu text-sm font-semibold text-slate-300">نیکسورا اے آئی</span>
            <span className="text-slate-500">•</span>
            <span>v3.0 Pro</span>
          </div>
        </div>
      </aside>
    </>
  );
};
