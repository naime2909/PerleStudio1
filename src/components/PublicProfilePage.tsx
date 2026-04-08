import React, { useState, useEffect } from 'react';
import { User, ArrowLeft, UserPlus, Check, Heart, Copy, Calendar, Eye, Clock } from 'lucide-react';
import type { PublicProfile, ShowcaseProject } from '../hooks/useCloudStorage';
import type { ProjectState, BeadType } from '../types';

interface PublicProfilePageProps {
  profileId: string;
  currentUserId?: string;
  getPublicProfile: (id: string) => Promise<PublicProfile | null>;
  getPublicProjects: (id: string) => Promise<ShowcaseProject[]>;
  sendFriendRequest: (addresseeId: string) => Promise<boolean>;
  getFriends: () => Promise<any[]>;
  onLoadProject: (project: ProjectState, name: string, beads?: BeadType[]) => void;
  onBack: () => void;
  onRequireLogin: () => void;
  isLoggedIn: boolean;
}

const PublicProfilePage: React.FC<PublicProfilePageProps> = ({
  profileId,
  currentUserId,
  getPublicProfile,
  getPublicProjects,
  sendFriendRequest,
  getFriends,
  onLoadProject,
  onBack,
  onRequireLogin,
  isLoggedIn,
}) => {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [projects, setProjects] = useState<ShowcaseProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState<'none' | 'pending' | 'accepted' | 'self'>('none');
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [profileData, projectsData] = await Promise.all([
        getPublicProfile(profileId),
        getPublicProjects(profileId),
      ]);
      setProfile(profileData);
      setProjects(projectsData);

      // Check friendship status
      if (currentUserId === profileId) {
        setFriendStatus('self');
      } else if (currentUserId) {
        const friends = await getFriends();
        const friendship = friends.find((f: any) =>
          (f.requester_id === profileId || f.addressee_id === profileId)
        );
        if (friendship) {
          setFriendStatus(friendship.status === 'accepted' ? 'accepted' : 'pending');
        }
      }
      setLoading(false);
    };
    load();
  }, [profileId, currentUserId]);

  const handleAddFriend = async () => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    const ok = await sendFriendRequest(profileId);
    if (ok) {
      setRequestSent(true);
      setFriendStatus('pending');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-50 gap-4">
        <p className="text-slate-500">Profil introuvable</p>
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">
          <ArrowLeft size={16} /> Retour
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">

        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={16} /> Retour
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-500" />

          <div className="px-6 -mt-12">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-200">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                  style={{ imageRendering: profile.avatar_url.startsWith('data:image/svg') ? 'pixelated' : 'auto' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-400">
                  <User size={40} className="text-white" />
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{profile.username}</h2>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <Calendar size={12} /> Membre depuis {formatDate(profile.created_at)}
                </p>
              </div>

              {/* Friend button */}
              {friendStatus !== 'self' && (
                <div>
                  {friendStatus === 'accepted' ? (
                    <span className="flex items-center gap-1.5 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                      <Check size={16} /> Amis
                    </span>
                  ) : friendStatus === 'pending' || requestSent ? (
                    <span className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-500 rounded-lg text-sm font-semibold">
                      <Clock size={16} /> Demande envoyée
                    </span>
                  ) : (
                    <button
                      onClick={handleAddFriend}
                      className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      <UserPlus size={16} /> Ajouter en ami
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="mt-3 text-sm text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-100">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Public Projects */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Eye size={20} className="text-indigo-600" />
            Projets publics ({projects.length})
          </h3>

          {projects.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <Eye size={40} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Aucun projet public</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => onLoadProject(project.project_data, project.name, project.beads_data || undefined)}
                >
                  <div className="bg-gradient-to-br from-slate-50 to-indigo-50 h-32 flex items-center justify-center overflow-hidden">
                    {project.thumbnail ? (
                      <img src={project.thumbnail} alt={project.name} className="w-full h-full object-contain" />
                    ) : (
                      <Eye size={32} className="text-slate-300" />
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-sm text-slate-800 truncate mb-2">{project.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Heart size={12} className={project.is_liked_by_me ? 'fill-red-500 text-red-500' : ''} />
                        {project.like_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Copy size={12} />
                        {project.copy_count}
                      </span>
                      <span className="text-slate-400">
                        {project.project_data.columns}×{project.project_data.rows}
                      </span>
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

export default PublicProfilePage;
