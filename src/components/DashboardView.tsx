import React from 'react';
import {
  Briefcase,
  Moon,
  Mic,
  Film,
  TrendingUp,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  Play,
  Clock,
  CheckCircle,
  ShieldCheck,
  Video,
  Layers,
  FolderOpen,
  Flame,
  Link2,
  Wand2,
  Music2,
  Subtitles,
  Zap,
} from 'lucide-react';
import { Project } from '../types';
import { TabType } from './Sidebar';

interface DashboardViewProps {
  projects: Project[];
  onSelectTab: (tab: TabType) => void;
  onOpenProject: (project: Project) => void;
  onNewProject: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  onSelectTab,
  onOpenProject,
  onNewProject,
}) => {
  const totalScenes = projects.reduce((acc, p) => acc + (p.scenes?.length || 0), 0);
  const totalSeconds = projects.reduce(
    (acc, p) => acc + (p.scenes?.reduce((sAcc, s) => sAcc + (s.durationSeconds || 0), 0) || 0),
    0
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d1627] via-[#101935] to-[#17122b] border border-cyan-500/20 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-20 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Next-Gen Urdu AI Video Studio</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Create Viral Business Documentaries &amp; Islamic Reels with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
              Real AI Power
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Automate research, write poetic and authoritative Urdu scripts, auto-sync free Pexels stock
            footage, synthesize natural Urdu voiceovers, and render real 1080p MP4 videos—all in one place.
          </p>

          <div className="pt-2 flex flex-wrap gap-3 sm:gap-4">
            <button
              onClick={() => onSelectTab('business_documentary')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-xl shadow-cyan-950/60 flex items-center gap-2 transition-all"
            >
              <Briefcase className="w-4 h-4" />
              <span>Start Business Documentary</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => onSelectTab('islamic_reels')}
              className="px-5 py-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold text-sm flex items-center gap-2 transition-all"
            >
              <Moon className="w-4 h-4 text-emerald-400" />
              <span>Create 9:16 Islamic Reel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>TOTAL PROJECTS</span>
            <FolderOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{projects.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Ready for editing &amp; export</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>PRODUCED SCENES</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{totalScenes}</div>
          <p className="text-[11px] text-slate-400 mt-1">Matched with HD stock clips</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>TIMELINE DURATION</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {Math.floor(totalSeconds / 60)}m {totalSeconds % 60}s
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total cinematic footage</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>FREE TIER SYSTEM</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">100% Free</div>
          <p className="text-[11px] text-slate-400 mt-1">No monthly subscription</p>
        </div>
      </div>

      {/* Creation Studios Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Production Studios</span>
          </h3>
          <span className="text-xs text-slate-400">Select a workflow to begin</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Studio: Complete Video Maker */}
          <div
            onClick={() => onSelectTab('complete_video_maker')}
            className="group cursor-pointer p-6 rounded-2xl bg-gradient-to-b from-[#0b1c2b] to-[#090d16] border border-cyan-500/30 hover:border-cyan-400/60 shadow-lg hover:shadow-cyan-950/60 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <h4 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                Complete Video Maker
              </h4>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                12-Step AI
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              End-to-end intelligent pipeline: enters 1 topic and generates script, voice, stock clips, music, subtitles, and final video.
            </p>
            <div className="flex items-center text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>Launch Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Studio: Hook Designer */}
          <div
            onClick={() => onSelectTab('hook_designer')}
            className="group cursor-pointer p-6 rounded-2xl bg-gradient-to-b from-[#22170b] to-[#090d16] border border-amber-500/30 hover:border-amber-400/60 shadow-lg hover:shadow-amber-950/60 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <Flame className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <h4 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">
                Advanced Hook Designer
              </h4>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                10 Styles
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              First 3 seconds optimization with 10 psychology-backed hook formulas, vocal tone guidance, and transition SFX.
            </p>
            <div className="flex items-center text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Design Hooks</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Studio: Video Link Analyzer */}
          <div
            onClick={() => onSelectTab('video_link_analyzer')}
            className="group cursor-pointer p-6 rounded-2xl bg-gradient-to-b from-[#0c1f24] to-[#090d16] border border-teal-500/30 hover:border-teal-400/60 shadow-lg hover:shadow-teal-950/60 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-4 group-hover:scale-110 transition-transform">
              <Link2 className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <h4 className="font-bold text-white text-base group-hover:text-teal-300 transition-colors">
                Video Link Analyzer
              </h4>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300">
                YT / IG / TikTok
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Input any video link: analyzes story structure, hook anatomy, editing pacing, and generates original inspired scripts.
            </p>
            <div className="flex items-center text-xs font-semibold text-teal-400 group-hover:translate-x-1 transition-transform">
              <span>Analyze Link</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Studio 1: Business Documentary */}
          <div
            onClick={() => onSelectTab('business_documentary')}
            className="group cursor-pointer p-6 rounded-2xl bg-gradient-to-b from-[#0e1424] to-[#090d16] border border-cyan-500/20 hover:border-cyan-400/50 shadow-lg hover:shadow-cyan-950/50 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <h4 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                Business Documentary
              </h4>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400">
                16:9
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Enter any topic: AI researches, writes Urdu script, maps scenes, finds Pexels videos, and generates YouTube SEO.
            </p>
            <div className="flex items-center text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>Open Studio</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Studio 2: Islamic Reels Studio */}
          <div
            onClick={() => onSelectTab('islamic_reels')}
            className="group cursor-pointer p-6 rounded-2xl bg-gradient-to-b from-[#0c181e] to-[#090d16] border border-emerald-500/20 hover:border-emerald-400/50 shadow-lg hover:shadow-emerald-950/50 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <Moon className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <h4 className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors">
                Islamic Reels Studio
              </h4>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                9:16
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Authentic Quran &amp; Hadith citations, Urdu Nastaliq subtitles, vertical visual matching, and voice sync.
            </p>
            <div className="flex items-center text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Open Studio</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Studio 3: Video Editor Workspace */}
          <div
            onClick={() => onSelectTab('video_editor')}
            className="group cursor-pointer p-6 rounded-2xl bg-gradient-to-b from-[#170e24] to-[#090d16] border border-pink-500/20 hover:border-pink-400/50 shadow-lg hover:shadow-pink-950/50 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-4 group-hover:scale-110 transition-transform">
              <Film className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <h4 className="font-bold text-white text-base group-hover:text-pink-300 transition-colors">
                Video Editor &amp; Render
              </h4>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-pink-500/15 text-pink-400">
                Multi-Track
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Multi-track timeline, scene split/trim/duplicate, playback speed, and real MP4 export with audio verification.
            </p>
            <div className="flex items-center text-xs font-semibold text-pink-400 group-hover:translate-x-1 transition-transform">
              <span>Launch Editor</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Studio: Script Improver */}
          <div
            onClick={() => onSelectTab('script_improver')}
            className="group cursor-pointer p-6 rounded-2xl bg-gradient-to-b from-[#1d0e22] to-[#090d16] border border-purple-500/30 hover:border-purple-400/60 shadow-lg hover:shadow-purple-950/60 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
              <Wand2 className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <h4 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">
                Script Improver &amp; Retention
              </h4>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                Retention AI
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Enhance pacing, remove fluff, optimize Urdu vocabulary, and analyze second-by-second viewer retention curve.
            </p>
            <div className="flex items-center text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">
              <span>Improve Script</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Studio: Background Music Studio */}
          <div
            onClick={() => onSelectTab('music_studio')}
            className="group cursor-pointer p-6 rounded-2xl bg-gradient-to-b from-[#180f2b] to-[#090d16] border border-indigo-500/30 hover:border-indigo-400/60 shadow-lg hover:shadow-indigo-950/60 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
              <Music2 className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <h4 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">
                Background Music Studio
              </h4>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                8 Moods
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              8 royalty-free soundtrack categories with instant auditioning, auto-speech ducking (-18dB), and WAV export.
            </p>
            <div className="flex items-center text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
              <span>Open Music Studio</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Studio 4: Urdu Voice Generator */}
          <div
            onClick={() => onSelectTab('urdu_voice')}
            className="group cursor-pointer p-6 rounded-2xl bg-gradient-to-b from-[#0f172a] to-[#090d16] border border-blue-500/20 hover:border-blue-400/50 shadow-lg hover:shadow-blue-950/50 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
              <Mic className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <h4 className="font-bold text-white text-base group-hover:text-blue-300 transition-colors">
                Multi-Lang Voice Studio
              </h4>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400">
                5 Languages
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              High-fidelity speech synthesis for Urdu, English, Roman Urdu, Arabic and Hindi with pitch, speed and WAV downloads.
            </p>
            <div className="flex items-center text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform">
              <span>Open Voice Studio</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Studio: Subtitle Studio */}
          <div
            onClick={() => onSelectTab('subtitle_studio')}
            className="group cursor-pointer p-6 rounded-2xl bg-gradient-to-b from-[#091a26] to-[#090d16] border border-cyan-500/30 hover:border-cyan-400/60 shadow-lg hover:shadow-cyan-950/60 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
              <Subtitles className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <h4 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                Subtitle &amp; Caption Studio
              </h4>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                SRT / VTT
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Auto-chunking captions with Nastaliq RTL styling, synchronized timestamps, and downloadable SRT/VTT files.
            </p>
            <div className="flex items-center text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>Open Subtitle Studio</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Studio 5: Thumbnail Studio */}
          <div
            onClick={() => onSelectTab('thumbnail_generator')}
            className="group cursor-pointer p-6 rounded-2xl bg-gradient-to-b from-[#1b1509] to-[#090d16] border border-amber-500/20 hover:border-amber-400/50 shadow-lg hover:shadow-amber-950/50 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <h4 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">
                Thumbnail Generator
              </h4>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">
                High CTR
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Bold viral Urdu typography, badges, glow borders, and cinematic light effects ready for YouTube 16:9 and 9:16.
            </p>
            <div className="flex items-center text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Create Thumbnail</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Studio 6: YouTube SEO Tools */}
          <div
            onClick={() => onSelectTab('youtube_seo')}
            className="group cursor-pointer p-6 rounded-2xl bg-gradient-to-b from-[#1e0d16] to-[#090d16] border border-rose-500/20 hover:border-rose-400/50 shadow-lg hover:shadow-rose-950/50 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <h4 className="font-bold text-white text-base group-hover:text-rose-300 transition-colors">
                YouTube SEO Tools
              </h4>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400">
                Viral
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Rank high on YouTube with high-CTR title variations, auto timestamps, viral tags, and keyword volume.
            </p>
            <div className="flex items-center text-xs font-semibold text-rose-400 group-hover:translate-x-1 transition-transform">
              <span>Optimize SEO</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-cyan-400" />
            <span>Recent Projects</span>
          </h3>
          <button
            onClick={() => onSelectTab('projects')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View All ({projects.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.slice(0, 4).map((project) => (
            <div
              key={project.id}
              onClick={() => onOpenProject(project)}
              className="p-4 sm:p-5 rounded-2xl bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/30 transition-all cursor-pointer flex gap-4 items-center group"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-800 overflow-hidden relative flex-shrink-0 border border-slate-700/50">
                {project.scenes?.[0]?.previewUrl ? (
                  <img
                    src={project.scenes[0].previewUrl}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                    <Video className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-6 h-6 text-white fill-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      project.type === 'business_documentary'
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : project.type === 'islamic_reel'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-purple-500/20 text-purple-400'
                    }`}
                  >
                    {project.type.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400">{project.aspectRatio}</span>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                  {project.title}
                </h4>

                <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                  <span>{project.scenes?.length || 0} scenes</span>
                  <span>•</span>
                  <span>
                    {project.scenes?.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) || 0}s duration
                  </span>
                </p>
              </div>

              <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
