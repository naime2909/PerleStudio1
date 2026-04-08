import React, { useState } from 'react';
import { SavedProject, useLocalStorage } from '../useLocalStorage';
import { Folder, Trash2, Edit2, Download, Upload, Plus, Clock, Cloud, Monitor, Link, Check, Eye, EyeOff, Heart, Copy, Sparkles, Camera, X, Image as ImageIcon } from 'lucide-react';
import { ProjectState, BeadType, ProjectVisibility } from '../types';
import MiniGridPreview from './MiniGridPreview';
import type { CloudProject } from '../hooks/useCloudStorage';

interface ProjectsPanelProps {
  onLoadProject: (project: ProjectState, name: string, beads?: BeadType[]) => void;
  onNewProject: () => void;
  cloudProjects?: CloudProject[];
  onLoadCloudProject?: (cp: CloudProject) => void;
  onDeleteCloudProject?: (id: string) => Promise<boolean>;
  onRenameCloudProject?: (id: string, name: string) => Promise<boolean>;
  onSetProjectPublic?: (id: string, isPublic: boolean) => Promise<boolean>;
  onSetProjectVisibility?: (id: string, visibility: ProjectVisibility) => Promise<boolean>;
  onUploadPhoto?: (projectId: string, file: File) => Promise<string | null>;
  onRemovePhoto?: (projectId: string) => Promise<boolean>;
  projectStats?: Record<string, { likes: number; copies: number }>;
  isLoggedIn?: boolean;
}

const ProjectsPanel: React.FC<ProjectsPanelProps> = ({ onLoadProject, onNewProject, cloudProjects = [], onLoadCloudProject, onDeleteCloudProject, onRenameCloudProject, onSetProjectPublic, onSetProjectVisibility, onUploadPhoto, onRemovePhoto, projectStats = {}, isLoggedIn = false }) => {
  const storage = useLocalStorage();
  const [projects, setProjects] = useState<SavedProject[]>(storage.loadProjects());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const refreshProjects = () => {
    setProjects(storage.loadProjects());
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Supprimer "${name}" ?`)) {
      storage.deleteProject(id);
      refreshProjects();
    }
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      storage.renameProject(id, editName.trim());
      refreshProjects();
      setEditingId(null);
      setEditName('');
    }
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleExport = (project: SavedProject) => {
    storage.exportProject(project);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imported = await storage.importProject(file);
      if (imported) {
        refreshProjects();
        alert(`Projet "${imported.name}" importé avec succès !`);
      }
    }
    e.target.value = '';
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const [viewMode, setViewMode] = useState<'local' | 'cloud'>(isLoggedIn ? 'cloud' : 'local');
  const [editingCloudId, setEditingCloudId] = useState<string | null>(null);
  const [editCloudName, setEditCloudName] = useState('');
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  const handleCopyShareLink = async (cp: CloudProject) => {
    // Make project public first if needed
    if (onSetProjectPublic) {
      await onSetProjectPublic(cp.id, true);
    }
    const link = `${window.location.origin}?shared=${cp.id}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLinkId(cp.id);
      setTimeout(() => setCopiedLinkId(null), 2000);
    });
  };

  const [togglingShowcase, setTogglingShowcase] = useState<string | null>(null);
  const [uploadingPhotoId, setUploadingPhotoId] = useState<string | null>(null);
  const [showPhotoId, setShowPhotoId] = useState<string | null>(null);

  const handlePhotoUpload = async (cp: CloudProject, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadPhoto) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5 Mo');
      return;
    }
    setUploadingPhotoId(cp.id);
    await onUploadPhoto(cp.id, file);
    setUploadingPhotoId(null);
    e.target.value = '';
  };

  const handleToggleShowcase = async (cp: CloudProject) => {
    if (!onSetProjectVisibility) return;
    setTogglingShowcase(cp.id);
    const currentVisibility = (cp as any).visibility || 'private';
    const newVisibility: ProjectVisibility = currentVisibility === 'showcased' ? 'private' : 'showcased';
    await onSetProjectVisibility(cp.id, newVisibility);
    setTogglingShowcase(null);
  };

  const handleDeleteCloud = async (id: string, name: string) => {
    if (onDeleteCloudProject && confirm(`Supprimer "${name}" du cloud ?`)) {
      await onDeleteCloudProject(id);
    }
  };

  const handleRenameCloud = async (id: string) => {
    if (onRenameCloudProject && editCloudName.trim()) {
      await onRenameCloudProject(id, editCloudName.trim());
      setEditingCloudId(null);
      setEditCloudName('');
    }
  };

  const formatDateCloud = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Folder size={24} className="text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-800">
            Mes Projets
          </h2>
          {isLoggedIn && (
            <div className="flex bg-slate-100 rounded-lg p-0.5 ml-2">
              <button
                onClick={() => setViewMode('cloud')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-colors ${
                  viewMode === 'cloud' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                <Cloud size={12} /> Cloud ({cloudProjects.length})
              </button>
              <button
                onClick={() => setViewMode('local')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-colors ${
                  viewMode === 'local' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                <Monitor size={12} /> Local ({projects.length})
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg cursor-pointer transition-colors">
            <Upload size={16} />
            Importer
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          <button
            onClick={onNewProject}
            className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Plus size={16} />
            Nouveau
          </button>
        </div>
      </div>

      {/* Cloud Projects Grid */}
      {isLoggedIn && viewMode === 'cloud' && (
        <div className="flex-1 overflow-y-auto p-4">
          {cloudProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Cloud size={64} className="text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Aucun projet dans le cloud</h3>
              <p className="text-sm text-slate-500 mb-4">
                Sauvegarde un projet pour le retrouver sur tous tes appareils !
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cloudProjects.map((cp) => (
                <div
                  key={cp.id}
                  className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div
                    onClick={() => onLoadCloudProject?.(cp)}
                    className="bg-gradient-to-br from-indigo-50 to-purple-50 h-32 flex items-center justify-center overflow-hidden relative"
                  >
                    <MiniGridPreview
                      projectData={cp.project_data}
                      beadsData={cp.beads_data}
                      width={220}
                      height={128}
                    />
                    {(cp as any).visibility === 'showcased' && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Sparkles size={10} /> Vitrine
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    {editingCloudId === cp.id ? (
                      <div className="flex gap-1 mb-2">
                        <input
                          type="text"
                          value={editCloudName}
                          onChange={(e) => setEditCloudName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameCloud(cp.id);
                            if (e.key === 'Escape') setEditingCloudId(null);
                          }}
                          className="flex-1 px-2 py-1 text-sm border border-indigo-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                          autoFocus
                        />
                        <button onClick={() => handleRenameCloud(cp.id)} className="px-2 py-1 bg-indigo-600 text-white text-xs rounded">✓</button>
                        <button onClick={() => setEditingCloudId(null)} className="px-2 py-1 bg-slate-200 text-xs rounded">✗</button>
                      </div>
                    ) : (
                      <h3 onClick={() => onLoadCloudProject?.(cp)} className="font-semibold text-slate-800 mb-1 truncate hover:text-indigo-600">
                        {cp.name}
                      </h3>
                    )}

                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                      <Cloud size={12} className="text-indigo-400" />
                      <Clock size={12} />
                      {formatDateCloud(cp.updated_at)}
                    </div>

                    <div className="text-xs text-slate-600 mb-2">
                      {cp.project_data.columns} × {cp.project_data.rows} • {cp.project_data.mode}
                    </div>

                    {/* Stats (for showcased projects) */}
                    {(cp as any).visibility === 'showcased' && projectStats[cp.id] && (
                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-2 px-1">
                        <span className="flex items-center gap-1">
                          <Heart size={12} className="text-red-400" />
                          {projectStats[cp.id].likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Copy size={12} className="text-indigo-400" />
                          {projectStats[cp.id].copies}
                        </span>
                      </div>
                    )}

                    {/* Photo du projet physique */}
                    {cp.photo_url && (
                      <div className="mb-2 relative">
                        <img
                          src={cp.photo_url}
                          alt="Photo du projet"
                          className="w-full h-20 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-90"
                          onClick={(e) => { e.stopPropagation(); setShowPhotoId(showPhotoId === cp.id ? null : cp.id); }}
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); onRemovePhoto?.(cp.id); }}
                          className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                          title="Supprimer la photo"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    )}

                    <div className="flex gap-1 flex-wrap">
                      <button
                        onClick={() => onLoadCloudProject?.(cp)}
                        className="flex-1 px-2 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded transition-colors"
                      >
                        Ouvrir
                      </button>
                      <button
                        onClick={() => handleToggleShowcase(cp)}
                        disabled={togglingShowcase === cp.id}
                        className={`px-2 py-1.5 rounded transition-colors text-xs font-semibold ${
                          (cp as any).visibility === 'showcased'
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                        } disabled:opacity-50`}
                        title={(cp as any).visibility === 'showcased' ? 'Retirer de la vitrine' : 'Publier dans la vitrine'}
                      >
                        {(cp as any).visibility === 'showcased' ? <EyeOff size={14} /> : <Sparkles size={14} />}
                      </button>
                      <label
                        className={`px-2 py-1.5 rounded transition-colors cursor-pointer ${
                          uploadingPhotoId === cp.id
                            ? 'bg-green-100 text-green-600'
                            : cp.photo_url
                              ? 'bg-green-50 text-green-600 hover:bg-green-100'
                              : 'bg-slate-100 text-slate-500 hover:bg-green-50 hover:text-green-600'
                        }`}
                        title={cp.photo_url ? 'Changer la photo' : 'Ajouter une photo du résultat'}
                      >
                        {uploadingPhotoId === cp.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-green-300 border-t-green-600 rounded-full animate-spin" />
                        ) : (
                          <Camera size={14} />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(cp, e)}
                          disabled={uploadingPhotoId === cp.id}
                        />
                      </label>
                      <button
                        onClick={() => handleCopyShareLink(cp)}
                        className={`px-2 py-1.5 rounded transition-colors ${
                          copiedLinkId === cp.id
                            ? 'bg-green-100 text-green-700'
                            : 'bg-purple-50 hover:bg-purple-100 text-purple-600'
                        }`}
                        title={copiedLinkId === cp.id ? 'Lien copié !' : 'Partager par lien'}
                      >
                        {copiedLinkId === cp.id ? <Check size={14} /> : <Link size={14} />}
                      </button>
                      <button
                        onClick={() => { setEditingCloudId(cp.id); setEditCloudName(cp.name); }}
                        className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded"
                        title="Renommer"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteCloud(cp.id, cp.name)}
                        className="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Local Projects Grid */}
      <div className="flex-1 overflow-y-auto p-4" style={{ display: (!isLoggedIn || viewMode === 'local') ? 'block' : 'none' }}>
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Folder size={64} className="text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Aucun projet sauvegardé</h3>
            <p className="text-sm text-slate-500 mb-4">
              Créez votre premier projet et il sera automatiquement sauvegardé !
            </p>
            <button
              onClick={onNewProject}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Plus size={20} />
              Créer mon premier projet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer group"
              >
                {/* Thumbnail */}
                <div
                  onClick={() => onLoadProject(project.project, project.name)}
                  className="bg-slate-100 h-32 flex items-center justify-center overflow-hidden"
                >
                  <img
                    src={project.thumbnail}
                    alt={project.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Info */}
                <div className="p-3">
                  {editingId === project.id ? (
                    <div className="flex gap-1 mb-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRename(project.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="flex-1 px-2 py-1 text-sm border border-indigo-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleRename(project.id)}
                        className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded hover:bg-slate-300"
                      >
                        ✗
                      </button>
                    </div>
                  ) : (
                    <h3
                      onClick={() => onLoadProject(project.project, project.name)}
                      className="font-semibold text-slate-800 mb-1 truncate hover:text-indigo-600"
                    >
                      {project.name}
                    </h3>
                  )}

                  <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                    <Clock size={12} />
                    {formatDate(project.updatedAt)}
                  </div>

                  <div className="text-xs text-slate-600 mb-3">
                    {project.project.columns} × {project.project.rows} • {project.project.mode}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => onLoadProject(project.project, project.name)}
                      className="flex-1 px-2 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded transition-colors"
                    >
                      Ouvrir
                    </button>
                    <button
                      onClick={() => startEdit(project.id, project.name)}
                      className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors"
                      title="Renommer"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleExport(project)}
                      className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors"
                      title="Exporter"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id, project.name)}
                      className="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPanel;
