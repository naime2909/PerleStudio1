import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Copy, Search, TrendingUp, Clock, User, Eye, Sparkles, Grid } from 'lucide-react';
import type { ShowcaseProject } from '../hooks/useCloudStorage';
import type { ProjectState, BeadType } from '../types';
import ProjectPreviewModal from './ProjectPreviewModal';
import MiniGridPreview from './MiniGridPreview';

interface ShowcaseGalleryProps {
  userId?: string;
  getShowcaseProjects: (sortBy: 'recent' | 'popular') => Promise<ShowcaseProject[]>;
  toggleLike: (projectId: string) => Promise<{ liked: boolean; newCount: number } | null>;
  copyShowcaseProject: (project: ShowcaseProject) => Promise<any>;
  onViewProfile: (userId: string) => void;
  onLoadProject: (project: ProjectState, name: string, beads?: BeadType[]) => void;
  onRequireLogin: () => void;
  isLoggedIn: boolean;
}

const ShowcaseGallery: React.FC<ShowcaseGalleryProps> = ({
  userId,
  getShowcaseProjects,
  toggleLike,
  copyShowcaseProject,
  onViewProfile,
  onLoadProject,
  onRequireLogin,
  isLoggedIn,
}) => {
  const [projects, setProjects] = useState<ShowcaseProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewProject, setPreviewProject] = useState<ShowcaseProject | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    const data = await getShowcaseProjects(sortBy);
    setProjects(data);
    setLoading(false);
  }, [getShowcaseProjects, sortBy]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleLike = async (project: ShowcaseProject) => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    const result = await toggleLike(project.id);
    if (result) {
      const updater = (p: ShowcaseProject) =>
        p.id === project.id ? { ...p, like_count: result.newCount, is_liked_by_me: result.liked } : p;
      setProjects(prev => prev.map(updater));
      if (previewProject?.id === project.id) {
        setPreviewProject(prev => prev ? updater(prev) : prev);
      }
    }
  };

  const handleCopy = async (project: ShowcaseProject) => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    setCopyingId(project.id);
    const newProject = await copyShowcaseProject(project);
    setCopyingId(null);
    if (newProject) {
      setCopiedId(project.id);
      setTimeout(() => setCopiedId(null), 2000);
      const updater = (p: ShowcaseProject) =>
        p.id === project.id ? { ...p, copy_count: p.copy_count + 1 } : p;
      setProjects(prev => prev.map(updater));
      if (previewProject?.id === project.id) {
        setPreviewProject(prev => prev ? updater(prev) : prev);
      }
    }
  };

  const filteredProjects = projects.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.author_username.toLowerCase().includes(q);
  });

  return (
    <div className="h-full w-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="p-4 lg:p-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl text-white shadow-md">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-800">Vitrine</h2>
            <p className="text-xs lg:text-sm text-slate-500">Découvre les créations de la communauté</p>
          </div>
          <div className="ml-auto text-sm text-slate-400">
            {!loading && `${filteredProjects.length} projet${filteredProjects.length !== 1 ? 's' : ''}`}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom ou auteur..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="flex bg-slate-100 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setSortBy('recent')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                sortBy === 'recent' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Clock size={14} /> Récents
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                sortBy === 'popular' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <TrendingUp size={14} /> Populaires
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
                <div className="h-40 bg-slate-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Grid size={40} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              {searchQuery ? 'Aucun résultat' : 'La vitrine est vide pour l\'instant'}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm">
              {searchQuery
                ? 'Essaie avec d\'autres mots-clés'
                : 'Sois le premier à publier un projet ! Va dans "Mes Projets" et clique sur l\'étoile pour publier.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-indigo-300 hover:shadow-xl transition-all group cursor-pointer"
                onClick={() => setPreviewProject(project)}
              >
                {/* Preview */}
                <div className="bg-gradient-to-br from-slate-50 to-indigo-50 h-40 lg:h-44 flex items-center justify-center overflow-hidden relative">
                  <MiniGridPreview
                    projectData={project.project_data}
                    beadsData={project.beads_data}
                    width={240}
                    height={170}
                  />
                  <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors" />
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-slate-800 mb-1.5 truncate group-hover:text-indigo-600">
                    {project.name}
                  </h3>

                  {/* Author */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                    {project.author_avatar ? (
                      <img
                        src={project.author_avatar}
                        alt=""
                        className="w-5 h-5 rounded-full object-cover border border-slate-200"
                        style={{ imageRendering: project.author_avatar.startsWith('data:image/svg') ? 'pixelated' : 'auto' }}
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
                        <User size={10} className="text-slate-400" />
                      </div>
                    )}
                    <span className="font-medium truncate">{project.author_username}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Heart size={12} className={project.is_liked_by_me ? 'fill-red-500 text-red-500' : ''} />
                      {project.like_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Copy size={12} />
                      {project.copy_count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewProject && (
        <ProjectPreviewModal
          project={previewProject}
          onClose={() => setPreviewProject(null)}
          onLike={() => handleLike(previewProject)}
          onCopy={() => handleCopy(previewProject)}
          onViewProfile={(id) => { setPreviewProject(null); onViewProfile(id); }}
          copying={copyingId === previewProject.id}
          copied={copiedId === previewProject.id}
          isLoggedIn={isLoggedIn}
        />
      )}
    </div>
  );
};

export default ShowcaseGallery;
