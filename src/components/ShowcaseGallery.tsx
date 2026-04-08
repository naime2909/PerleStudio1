import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Copy, Search, TrendingUp, Clock, User, Eye, Sparkles, Grid } from 'lucide-react';
import type { ShowcaseProject } from '../hooks/useCloudStorage';
import type { ProjectState, BeadType } from '../types';

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
      setProjects(prev => prev.map(p =>
        p.id === project.id
          ? { ...p, like_count: result.newCount, is_liked_by_me: result.liked }
          : p
      ));
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
      setProjects(prev => prev.map(p =>
        p.id === project.id ? { ...p, copy_count: p.copy_count + 1 } : p
      ));
    }
  };

  const filteredProjects = projects.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.author_username.toLowerCase().includes(q);
  });

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="p-4 lg:p-6 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl text-white">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-slate-800">Vitrine</h2>
              <p className="text-xs lg:text-sm text-slate-500">Découvre les créations de la communauté</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom ou auteur..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            {/* Sort */}
            <div className="flex bg-slate-100 rounded-lg p-0.5 shrink-0">
              <button
                onClick={() => setSortBy('recent')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  sortBy === 'recent' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                <Clock size={14} /> Récents
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  sortBy === 'popular' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                <TrendingUp size={14} /> Populaires
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
                  <div className="h-36 bg-slate-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Grid size={64} className="text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                {searchQuery ? 'Aucun résultat' : 'La vitrine est vide'}
              </h3>
              <p className="text-sm text-slate-500">
                {searchQuery
                  ? 'Essaie avec d\'autres mots-clés'
                  : 'Sois le premier à publier un projet !'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden hover:border-indigo-300 hover:shadow-lg transition-all group"
                >
                  {/* Thumbnail */}
                  <div
                    onClick={() => onLoadProject(project.project_data, project.name, project.beads_data || undefined)}
                    className="bg-gradient-to-br from-slate-50 to-indigo-50 h-36 flex items-center justify-center overflow-hidden cursor-pointer relative"
                  >
                    {project.thumbnail ? (
                      <img src={project.thumbnail} alt={project.name} className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-center">
                        <Eye size={32} className="text-slate-300 mx-auto mb-1" />
                        <p className="text-xs text-slate-400">{project.project_data.columns}x{project.project_data.rows}</p>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3
                      onClick={() => onLoadProject(project.project_data, project.name, project.beads_data || undefined)}
                      className="font-semibold text-slate-800 mb-1 truncate hover:text-indigo-600 cursor-pointer"
                    >
                      {project.name}
                    </h3>

                    {/* Author */}
                    <button
                      onClick={() => onViewProfile(project.user_id)}
                      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 mb-3 transition-colors"
                    >
                      {project.author_avatar ? (
                        <img
                          src={project.author_avatar}
                          alt=""
                          className="w-4 h-4 rounded-full object-cover"
                          style={{ imageRendering: project.author_avatar.startsWith('data:image/svg') ? 'pixelated' : 'auto' }}
                        />
                      ) : (
                        <User size={12} />
                      )}
                      <span className="font-medium">{project.author_username}</span>
                    </button>

                    {/* Stats + Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Heart size={12} className={project.is_liked_by_me ? 'fill-red-500 text-red-500' : ''} />
                          {project.like_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Copy size={12} />
                          {project.copy_count}
                        </span>
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() => handleLike(project)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            project.is_liked_by_me
                              ? 'bg-red-50 text-red-500 hover:bg-red-100'
                              : 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500'
                          }`}
                          title={project.is_liked_by_me ? 'Retirer le like' : 'Liker'}
                        >
                          <Heart size={16} className={project.is_liked_by_me ? 'fill-current' : ''} />
                        </button>
                        <button
                          onClick={() => handleCopy(project)}
                          disabled={copyingId === project.id}
                          className={`p-1.5 rounded-lg transition-colors ${
                            copiedId === project.id
                              ? 'bg-green-100 text-green-600'
                              : 'bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
                          } disabled:opacity-50`}
                          title={copiedId === project.id ? 'Copié !' : 'Copier dans mes projets'}
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowcaseGallery;
