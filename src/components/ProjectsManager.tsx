import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Play,
  Copy,
  Trash2,
  Edit3,
  Download,
  Upload,
  Clock,
  Layers,
  ArrowRight,
  Plus,
  History,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Project, ExportHistoryItem } from '../types';
import { ProjectStore } from '../services/projectStore';
import { downloadVideoFile } from '../services/videoRenderer';
import { fetchExportHistory } from '../services/api';

interface ProjectsManagerProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onRefreshProjects: () => void;
  onNewProject: () => void;
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({
  projects,
  onSelectProject,
  onRefreshProjects,
  onNewProject,
}) => {
  const [viewMode, setViewMode] = useState<'projects' | 'exports'>('projects');
  const [filterType, setFilterType] = useState<string>('all');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>([]);
  const [loadingExports, setLoadingExports] = useState(false);

  const loadExports = async () => {
    setLoadingExports(true);
    try {
      const res = await fetchExportHistory();
      if (res.success) {
        setExportHistory(res.exports || []);
      }
    } catch (_) {
    } finally {
      setLoadingExports(false);
    }
  };

  useEffect(() => {
    loadExports();
  }, []);

  const filteredProjects =
    filterType === 'all'
      ? projects
      : projects.filter((p) => p.type === filterType);

  const handleStartRename = (p: Project) => {
    setEditingProjectId(p.id);
    setRenameTitle(p.title);
  };

  const handleSaveRename = (p: Project) => {
    if (!renameTitle.trim()) return;
    ProjectStore.saveProject({
      ...p,
      title: renameTitle.trim(),
    });
    setEditingProjectId(null);
    onRefreshProjects();
  };

  const handleConfirmDelete = (id: string) => {
    ProjectStore.deleteProject(id);
    setConfirmDeleteId(null);
    setNotice({ type: 'success', text: 'Project deleted successfully.' });
    setTimeout(() => setNotice(null), 3000);
    onRefreshProjects();
  };

  const handleDuplicate = (id: string) => {
    ProjectStore.duplicateProject(id);
    onRefreshProjects();
    setNotice({ type: 'success', text: 'Project duplicated.' });
    setTimeout(() => setNotice(null), 2500);
  };

  const handleExportBackup = () => {
    const json = ProjectStore.exportAllAsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexora_projects_backup_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (ProjectStore.importFromJson(text)) {
          setNotice({ type: 'success', text: 'Projects backup imported successfully!' });
          onRefreshProjects();
        } else {
          setNotice({ type: 'error', text: 'Invalid JSON backup file format.' });
        }
        setTimeout(() => setNotice(null), 3500);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0d1526] via-[#101b33] to-[#121226] border border-cyan-500/20 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-2">
            <FolderKanban className="w-4 h-4" />
            <span>PROJECT MANAGEMENT &amp; EXPORT HISTORY</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Video Projects &amp; Exports
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Manage saved timelines, inspect verified video exports, or back up your entire studio workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportBackup}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>

          <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all">
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            onClick={onNewProject}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-950/50 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {notice && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${
            notice.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Workspace Toggle + Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setViewMode('projects')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'projects' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Projects ({projects.length})</span>
          </button>
          <button
            onClick={() => {
              setViewMode('exports');
              loadExports();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'exports' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Export History ({exportHistory.length})</span>
          </button>
        </div>

        {viewMode === 'projects' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All Projects' },
              { id: 'business_documentary', label: 'Documentaries (16:9)' },
              { id: 'islamic_reel', label: 'Islamic Reels (9:16)' },
              { id: 'custom_video', label: 'Custom Edits' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  filterType === tab.id
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/40'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Export History View */}
      {viewMode === 'exports' ? (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              <span>Rendered Video Export Log</span>
            </h3>
            <button
              onClick={loadExports}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingExports ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {exportHistory.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No rendered exports logged yet. Export a video inside the Video Editor to record its verification details here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">PROJECT / FILE</th>
                    <th className="pb-3 font-semibold">PLATFORM PRESET</th>
                    <th className="pb-3 font-semibold">FORMAT</th>
                    <th className="pb-3 font-semibold">DURATION / SIZE</th>
                    <th className="pb-3 font-semibold">AUDIO VERIFICATION</th>
                    <th className="pb-3 font-semibold">EXPORTED</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {exportHistory.map((item) => (
                    <tr key={item.id} className="text-slate-200">
                      <td className="py-3">
                        <span className="font-bold text-white block">{item.projectTitle}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.projectId} • {item.mimeType}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 font-semibold">
                          {item.platformTarget}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-slate-300">
                        {item.resolution} • {item.mimeType.split('/')[1]?.split(';')[0]?.toUpperCase() || 'VIDEO'}
                      </td>
                      <td className="py-3 font-mono">
                        {item.durationSeconds.toFixed(1)}s •{' '}
                        {(item.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded font-semibold ${
                            item.hasVerifiedAudio
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : 'bg-rose-500/15 text-rose-300'
                          }`}
                        >
                          {item.hasVerifiedAudio ? 'Verified Audio' : 'Audio Issue'}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">
                        {new Date(item.exportedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
          <FolderKanban className="w-12 h-12 text-slate-600 mx-auto" />
          <h4 className="text-base font-bold text-white">No Projects Found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You don't have any projects in this category yet. Click "New Project" to start producing videos.
          </p>
          <button
            onClick={onNewProject}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const previewImg =
              project.scenes?.[0]?.previewUrl ||
              'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80';
            const duration =
              project.scenes?.reduce((acc, s) => acc + (s.durationSeconds || 5), 0) || 0;

            return (
              <div
                key={project.id}
                className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/30 transition-all flex flex-col justify-between space-y-4 group shadow-xl shadow-black/40"
              >
                {/* Media Preview Box */}
                <div
                  onClick={() => onSelectProject(project)}
                  className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 cursor-pointer border border-slate-800"
                >
                  <img
                    src={previewImg}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-xl">
                      <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
                    </div>
                  </div>

                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        project.type === 'business_documentary'
                          ? 'bg-cyan-500/80 text-slate-950'
                          : project.type === 'islamic_reel'
                          ? 'bg-emerald-500/80 text-slate-950'
                          : 'bg-purple-500/80 text-white'
                      }`}
                    >
                      {project.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/70 text-slate-300 font-mono">
                      {project.aspectRatio}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-mono text-cyan-300">
                    {duration.toFixed(1)}s
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 flex-1">
                  {editingProjectId === project.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={renameTitle}
                        onChange={(e) => setRenameTitle(e.target.value)}
                        className="flex-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-cyan-400 text-xs text-white outline-none"
                      />
                      <button
                        onClick={() => handleSaveRename(project)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        onClick={() => onSelectProject(project)}
                        className="font-bold text-white text-sm sm:text-base cursor-pointer hover:text-cyan-300 transition-colors line-clamp-1"
                      >
                        {project.title}
                      </h4>
                      <button
                        onClick={() => handleStartRename(project)}
                        className="p-1 rounded text-slate-500 hover:text-slate-300"
                        title="Rename"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{project.scenes?.length || 0} scenes</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{duration.toFixed(1)}s total</span>
                    </span>
                  </div>

                  {project.exportedVideoUrl && (
                    <div className="pt-1">
                      <button
                        onClick={() =>
                          downloadVideoFile(project.exportedVideoUrl!, `${project.title}.webm`)
                        }
                        className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download Rendered Video</span>
                      </button>
                    </div>
                  )}

                  {confirmDeleteId === project.id && (
                    <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/40 flex items-center justify-between gap-2 text-xs">
                      <span className="text-rose-200">Delete project?</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleConfirmDelete(project.id)}
                          className="px-2 py-1 rounded bg-rose-500 text-white font-bold text-[10px]"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDuplicate(project.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Duplicate Project"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(project.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectProject(project)}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <span>Open Editor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
