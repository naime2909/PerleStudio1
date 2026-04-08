import React, { useMemo } from 'react';
import { X, Heart, Copy, User, Calendar, Grid, Maximize2 } from 'lucide-react';
import type { ShowcaseProject } from '../hooks/useCloudStorage';
import type { ProjectState, BeadType } from '../types';

interface ProjectPreviewModalProps {
  project: ShowcaseProject;
  onClose: () => void;
  onLike?: () => void;
  onCopy?: () => void;
  onViewProfile?: (userId: string) => void;
  copying?: boolean;
  copied?: boolean;
  isLoggedIn?: boolean;
}

const ProjectPreviewModal: React.FC<ProjectPreviewModalProps> = ({
  project,
  onClose,
  onLike,
  onCopy,
  onViewProfile,
  copying = false,
  copied = false,
  isLoggedIn = false,
}) => {
  const { project_data, beads_data } = project;

  // Build color map from beads
  const beadColors = useMemo(() => {
    const map: Record<string, string> = {};
    if (beads_data) {
      beads_data.forEach((b: BeadType) => {
        map[b.id] = b.hex;
      });
    }
    return map;
  }, [beads_data]);

  // Calculate cell size to fit the preview area
  const maxPreviewWidth = 600;
  const maxPreviewHeight = 500;
  const cellSize = Math.max(
    2,
    Math.min(
      Math.floor(maxPreviewWidth / project_data.columns),
      Math.floor(maxPreviewHeight / project_data.rows),
      24
    )
  );

  const gridWidth = project_data.columns * cellSize;
  const gridHeight = project_data.rows * cellSize;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-800 truncate">{project.name}</h2>
            <button
              onClick={() => onViewProfile?.(project.user_id)}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors mt-0.5"
            >
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
              <span className="font-medium">{project.author_username}</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Grid Preview */}
        <div className="flex-1 overflow-auto bg-slate-50 flex items-center justify-center p-6">
          <div
            className="bg-white rounded-xl shadow-inner border border-slate-200 p-3"
            style={{ maxWidth: '100%', overflow: 'auto' }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${project_data.columns}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${project_data.rows}, ${cellSize}px)`,
                gap: '0px',
                width: gridWidth,
                height: gridHeight,
              }}
            >
              {Array.from({ length: project_data.rows }, (_, r) =>
                Array.from({ length: project_data.columns }, (_, c) => {
                  const key = `${r}-${c}`;
                  const beadId = project_data.grid[key];
                  const color = beadId ? beadColors[beadId] : undefined;
                  return (
                    <div
                      key={key}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: color || '#f8fafc',
                        borderRight: c < project_data.columns - 1 ? '1px solid #e2e8f0' : 'none',
                        borderBottom: r < project_data.rows - 1 ? '1px solid #e2e8f0' : 'none',
                      }}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Info */}
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Grid size={14} />
                {project_data.columns} × {project_data.rows}
              </span>
              <span className="capitalize">{project_data.mode}</span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {formatDate(project.updated_at)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Stats */}
              <div className="flex items-center gap-3 text-sm text-slate-500 mr-2">
                <span className="flex items-center gap-1">
                  <Heart size={14} className={project.is_liked_by_me ? 'fill-red-500 text-red-500' : ''} />
                  {project.like_count}
                </span>
                <span className="flex items-center gap-1">
                  <Copy size={14} />
                  {project.copy_count}
                </span>
              </div>

              {/* Like button */}
              {onLike && (
                <button
                  onClick={onLike}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    project.is_liked_by_me
                      ? 'bg-red-50 text-red-500 hover:bg-red-100'
                      : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-500'
                  }`}
                >
                  <Heart size={16} className={project.is_liked_by_me ? 'fill-current' : ''} />
                  {project.is_liked_by_me ? 'Aimé' : 'J\'aime'}
                </button>
              )}

              {/* Copy button */}
              {onCopy && (
                <button
                  onClick={onCopy}
                  disabled={copying}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  } disabled:opacity-50`}
                >
                  <Copy size={16} />
                  {copied ? 'Copié !' : copying ? 'Copie...' : 'Copier dans mes projets'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPreviewModal;
