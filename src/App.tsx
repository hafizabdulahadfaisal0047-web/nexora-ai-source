import React, { useState, useEffect } from 'react';
import { Sidebar, TabType } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { BusinessDocumentaryStudio } from './components/BusinessDocumentaryStudio';
import { IslamicReelsStudio } from './components/IslamicReelsStudio';
import { ScriptWriterStudio } from './components/ScriptWriterStudio';
import { UrduVoiceStudio } from './components/UrduVoiceStudio';
import { VideoEditorStudio } from './components/VideoEditorStudio';
import { ThumbnailGeneratorStudio } from './components/ThumbnailGeneratorStudio';
import { YoutubeSeoStudio } from './components/YoutubeSeoStudio';
import { ProjectsManager } from './components/ProjectsManager';
import { SettingsStudio } from './components/SettingsStudio';
import { CompleteVideoMakerStudio } from './components/CompleteVideoMakerStudio';
import { HookDesignerStudio } from './components/HookDesignerStudio';
import { ScriptImproverStudio } from './components/ScriptImproverStudio';
import { VideoLinkAnalyzerStudio } from './components/VideoLinkAnalyzerStudio';
import { MusicStudio } from './components/MusicStudio';
import { SoundEffectsStudio } from './components/SoundEffectsStudio';
import { SubtitleStudio } from './components/SubtitleStudio';
import { VoiceRecorderStudio } from './components/VoiceRecorderStudio';
import { ContentEngineStudio } from './components/ContentEngineStudio';
import { Project, VideoLanguage } from './types';
import { ProjectStore } from './services/projectStore';
import { fetchSystemStatus, SystemStatus } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  // Cross-studio workflow states
  const [sharedTopic, setSharedTopic] = useState('');
  const [sharedHook, setSharedHook] = useState('');
  const [sharedScript, setSharedScript] = useState('');
  const [sharedLanguage, setSharedLanguage] = useState<VideoLanguage>('urdu');

  const refreshProjects = () => {
    const list = ProjectStore.getProjects();
    setProjects(list);
  };

  useEffect(() => {
    refreshProjects();
    fetchSystemStatus().then(setSystemStatus).catch(console.error);
  }, []);

  const handleSaveProject = (project: Project) => {
    ProjectStore.saveProject(project);
    refreshProjects();
  };

  const handleLoadIntoEditor = (project: Project) => {
    setEditingProject(project);
    setCurrentTab('video_editor');
  };

  const handleQuickNewProject = () => {
    const newProj: Project = {
      id: `proj_${Date.now()}`,
      title: 'New Video Project',
      type: 'business_documentary',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aspectRatio: '16:9',
      resolution: '1080p',
      scenes: [
        {
          id: `sc_${Date.now()}_1`,
          sceneNumber: 1,
          title: 'Opening Scene',
          visualDescription: 'Corporate and Technology visual',
          stockSearchQuery: 'technology modern business',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          previewUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
          urduNarration: 'یہاں اپنی نئی اردو آواز یا سب ٹائٹل درج کریں۔',
          englishSubtitle: 'Enter your new scene narration subtitle.',
          durationSeconds: 8,
          transition: 'fade',
        },
      ],
    };

    ProjectStore.saveProject(newProj);
    refreshProjects();
    setEditingProject(newProj);
    setCurrentTab('video_editor');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setIsMobileMenuOpen(false);
        }}
        isOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          systemStatus={systemStatus}
          onQuickNewProject={handleQuickNewProject}
          onOpenVideoEditor={() => setCurrentTab('video_editor')}
        />

        {/* Dynamic Studio Workspace */}
        <main className="flex-1 p-4 sm:p-8 radial-bg">
          {currentTab === 'dashboard' && (
            <DashboardView
              projects={projects}
              onSelectTab={setCurrentTab}
              onOpenProject={(proj) => {
                setEditingProject(proj);
                setCurrentTab('video_editor');
              }}
              onNewProject={handleQuickNewProject}
            />
          )}

          {currentTab === 'content_engine' && (
            <ContentEngineStudio
              onSendToScriptWriter={(topic: string, language: VideoLanguage, hook?: string) => {
                setSharedTopic(topic);
                setSharedLanguage(language);
                if (hook) setSharedHook(hook);
                setCurrentTab('script_writer');
              }}
              onSendToDocumentary={(topic: string) => {
                setSharedTopic(topic);
                setCurrentTab('business_documentary');
              }}
              onSendToReels={(topic: string) => {
                setSharedTopic(topic);
                setCurrentTab('islamic_reels');
              }}
              onSendToHookDesigner={(topic: string) => {
                setSharedTopic(topic);
                setCurrentTab('hook_designer');
              }}
            />
          )}

          {currentTab === 'complete_video_maker' && (
            <CompleteVideoMakerStudio
              onLoadIntoEditor={handleLoadIntoEditor}
              onSaveProject={handleSaveProject}
              initialTopic={sharedTopic}
              initialHook={sharedHook}
            />
          )}

          {currentTab === 'business_documentary' && (
            <BusinessDocumentaryStudio
              onLoadIntoEditor={handleLoadIntoEditor}
              onSaveProject={handleSaveProject}
              initialTopic={sharedTopic}
            />
          )}

          {currentTab === 'islamic_reels' && (
            <IslamicReelsStudio
              onLoadIntoEditor={handleLoadIntoEditor}
              onSaveProject={handleSaveProject}
            />
          )}

          {currentTab === 'hook_designer' && (
            <HookDesignerStudio
              onSendToScriptWriter={(hookText, topic, language) => {
                setSharedTopic(topic);
                setSharedHook(hookText);
                setSharedLanguage(language);
                setCurrentTab('script_writer');
              }}
              onSendToCompleteMaker={(hookText, topic, language) => {
                setSharedTopic(topic);
                setSharedHook(hookText);
                setSharedLanguage(language);
                setCurrentTab('complete_video_maker');
              }}
            />
          )}

          {currentTab === 'script_writer' && (
            <ScriptWriterStudio
              onLoadIntoEditor={handleLoadIntoEditor}
              onOpenVoiceStudio={(text?: string, language?: VideoLanguage) => {
                if (text) setSharedScript(text);
                if (language) setSharedLanguage(language);
                setCurrentTab('urdu_voice');
              }}
              initialTopic={sharedTopic}
              initialHook={sharedHook}
              initialLanguage={sharedLanguage}
            />
          )}

          {currentTab === 'script_improver' && (
            <ScriptImproverStudio
              onSendToVoiceGenerator={(text: string, language: VideoLanguage) => {
                setSharedScript(text);
                setSharedLanguage(language);
                setCurrentTab('urdu_voice');
              }}
              onSendToVideoEditor={() => {
                handleQuickNewProject();
              }}
            />
          )}

          {currentTab === 'video_link_analyzer' && (
            <VideoLinkAnalyzerStudio
              onSendToScriptWriter={(topic: string) => {
                setSharedTopic(topic);
                setCurrentTab('script_writer');
              }}
              onSendToCompleteMaker={(topic: string) => {
                setSharedTopic(topic);
                setCurrentTab('complete_video_maker');
              }}
              onOpenVideoEditor={() => {
                setCurrentTab('video_editor');
              }}
            />
          )}

          {currentTab === 'urdu_voice' && (
            <UrduVoiceStudio
              initialText={sharedScript}
              initialLanguage={sharedLanguage}
              onLoadVoiceToEditor={() => {
                setCurrentTab('video_editor');
              }}
            />
          )}

          {currentTab === 'voice_recorder' && (
            <VoiceRecorderStudio
              onLoadVoiceToEditor={() => {
                setCurrentTab('video_editor');
              }}
            />
          )}

          {currentTab === 'music_studio' && (
            <MusicStudio
              onSelectMusicForProject={(trackName: string) => {
                if (editingProject) {
                  const updated = { ...editingProject, bgMusicTrack: trackName };
                  handleSaveProject(updated);
                  setEditingProject(updated);
                }
                setCurrentTab('video_editor');
              }}
            />
          )}

          {currentTab === 'sfx_studio' && (
            <SoundEffectsStudio
              onInsertIntoVideo={() => {
                setCurrentTab('video_editor');
              }}
            />
          )}

          {currentTab === 'video_editor' && (
            <VideoEditorStudio
              currentProject={editingProject}
              onSaveProject={handleSaveProject}
            />
          )}

          {currentTab === 'subtitle_studio' && (
            <SubtitleStudio
              onLoadSubtitlesToEditor={() => {
                setCurrentTab('video_editor');
              }}
            />
          )}

          {currentTab === 'thumbnail_generator' && <ThumbnailGeneratorStudio />}

          {currentTab === 'youtube_seo' && <YoutubeSeoStudio />}

          {currentTab === 'projects' && (
            <ProjectsManager
              projects={projects}
              onSelectProject={(proj) => {
                setEditingProject(proj);
                setCurrentTab('video_editor');
              }}
              onRefreshProjects={refreshProjects}
              onNewProject={handleQuickNewProject}
            />
          )}

          {currentTab === 'settings' && <SettingsStudio systemStatus={systemStatus} />}
        </main>
      </div>
    </div>
  );
}
