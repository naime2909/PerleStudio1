import React, { useState } from 'react';
import { SavedProject, useLocalStorage } from '../useLocalStorage';
import { Folder, Trash2, Edit2, Download, Upload, Plus, Clock } from 'lucide-react';
import { ProjectState } from '../types';

interface ProjectsPanelProps {
  onLoadProject: (project: ProjectState, name: string) => void;
  onNewProject: () => void;
}

const ProjectsPanel: React.FC<ProjectsPanelProps> = ({ onLoadProject, onNewProject }) => {
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

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Folder size={24} className="text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-800">
            Mes Projets ({projects.length})
          </h2>
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

      {/* Projects Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Folder size={64} className="text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Aucun projet sauvegardé</h3>
            <p className="text-sm text-slate-500 mb-4">
              Créez votre premier bracelet et il sera automatiquement sauvegardé !
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
