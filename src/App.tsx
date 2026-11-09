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
import { Project } from './types';
import { ProjectStore } from './services/projectStore';
import { fetchSystemStatus, SystemStatus } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [customPexelsKey, setCustomPexelsKey] = useState<string>(() => {
    return localStorage.getItem('nexora_pexels_api_key') || '';
  });

  // Cross-studio workflow states
  const [sharedTopic, setSharedTopic] = useState('');
  const [sharedHook, setSharedHook] = useState('');
  const [sharedScript, setSharedScript] = useState('');

  const refreshProjects = () => {
    const list = ProjectStore.getProjects();
    setProjects(list);
  };

  useEffect(() => {
    refreshProjects();
    fetchSystemStatus().then(setSystemStatus).catch(console.error);
  }, []);

  const handleSavePexelsKey = (key: string) => {
    setCustomPexelsKey(key);
    localStorage.setItem('nexora_pexels_api_key', key);
  };

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

          {currentTab === 'complete_video_maker' && (
            <CompleteVideoMakerStudio
              onLoadIntoEditor={handleLoadIntoEditor}
              onSaveProject={handleSaveProject}
              customPexelsKey={customPexelsKey}
            />
          )}

          {currentTab === 'business_documentary' && (
            <BusinessDocumentaryStudio
              onLoadIntoEditor={handleLoadIntoEditor}
              onSaveProject={handleSaveProject}
              customPexelsKey={customPexelsKey}
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
              onSendToScriptWriter={(hookText, topic) => {
                setSharedTopic(topic);
                setSharedHook(hookText);
                setCurrentTab('script_writer');
              }}
              onSendToCompleteMaker={(hookText, topic) => {
                setSharedTopic(topic);
                setSharedHook(hookText);
                setCurrentTab('complete_video_maker');
              }}
            />
          )}

          {currentTab === 'script_writer' && (
            <ScriptWriterStudio
              onLoadIntoEditor={handleLoadIntoEditor}
              onOpenVoiceStudio={() => setCurrentTab('urdu_voice')}
              initialTopic={sharedTopic}
              initialHook={sharedHook}
            />
          )}

          {currentTab === 'script_improver' && (
            <ScriptImproverStudio
              onSendToVoiceGenerator={(text: string) => {
                setSharedScript(text);
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

          {currentTab === 'urdu_voice' && <UrduVoiceStudio />}

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
              customPexelsKey={customPexelsKey}
            />
          )}

          {currentTab === 'subtitle_studio' && (
            <SubtitleStudio
              onLoadSubtitlesToEditor={() => {
                setCurrentTab('video_editor');
              }}
            />
          )}

          {currentTab === 'thumbnail_generator' && (
            <ThumbnailGeneratorStudio customPexelsKey={customPexelsKey} />
          )}

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

          {currentTab === 'settings' && (
            <SettingsStudio
              customPexelsKey={customPexelsKey}
              onSavePexelsKey={handleSavePexelsKey}
              systemStatus={systemStatus}
            />
          )}
        </main>
      </div>
    </div>
  );
}
