import React, { useState, useEffect, useCallback } from 'react';
import { Share2, Download, Eye, RefreshCw } from 'lucide-react';
import type { SharedProjectWithDetails } from '../hooks/useCloudStorage';
import type { ProjectState, BeadType } from '../types';

interface SharedProjectsPanelProps {
  getSharedWithMe: () => Promise<SharedProjectWithDetails[]>;
  onLoadProject: (project: ProjectState, name: string, beads?: BeadType[]) => void;
}

const SharedProjectsPanel: React.FC<SharedProjectsPanelProps> = ({
  getSharedWithMe,
  onLoadProject,
}) => {
  const [sharedProjects, setSharedProjects] = useState<SharedProjectWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getSharedWithMe();
    setSharedProjects(data);
    setLoading(false);
  }, [getSharedWithMe]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCopyToMyProjects = (sp: SharedProjectWithDetails) => {
    if (confirm(`Copier "${sp.name}" dans tes projets ? Tu pourras le modifier librement.`)) {
      onLoadProject(
        sp.project_data,
        `${sp.name} (copie de ${sp.shared_by_username})`,
        sp.beads_data || undefined
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Share2 size={20} /> Partagés avec moi
        </h2>
        <button
          onClick={load}
          className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-600"
          title="Rafraîchir"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {sharedProjects.length === 0 ? (
        <div className="text-center py-8">
          <Share2 size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">Aucun projet partagé avec toi pour l'instant</p>
          <p className="text-xs text-slate-400 mt-1">Quand un ami partage un projet, il apparaîtra ici</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sharedProjects.map((sp) => (
            <div key={sp.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-slate-800 truncate">{sp.name}</h3>
                  <p className="text-xs text-indigo-600 font-medium">
                    par {sp.shared_by_username}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                <span>{sp.project_data.columns}x{sp.project_data.rows}</span>
                <span>-</span>
                <span>{sp.project_data.mode}</span>
              </div>

              <button
                onClick={() => handleCopyToMyProjects(sp)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-200 transition-colors"
              >
                <Download size={14} />
                Copier dans mes projets
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedProjectsPanel;
