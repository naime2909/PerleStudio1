import React, { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, Check, X, Users, Clock, Trash2, Share2, Link, Copy } from 'lucide-react';
import type { Profile } from '../hooks/useAuth';
import type { CloudProject } from '../hooks/useCloudStorage';

interface FriendsPanelProps {
  userId: string;
  searchUsers: (query: string) => Promise<any[]>;
  sendFriendRequest: (addresseeId: string) => Promise<boolean>;
  respondToFriendRequest: (friendshipId: string, accept: boolean) => Promise<boolean>;
  removeFriend: (friendshipId: string) => Promise<boolean>;
  getFriends: () => Promise<any[]>;
  shareProject: (projectId: string, friendUserId: string) => Promise<boolean>;
  cloudProjects: CloudProject[];
  onViewProfile?: (userId: string) => void;
}

const FriendsPanel: React.FC<FriendsPanelProps> = ({
  userId,
  searchUsers,
  sendFriendRequest,
  respondToFriendRequest,
  removeFriend,
  getFriends,
  shareProject,
  cloudProjects,
  onViewProfile,
}) => {
  const [friends, setFriends] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showShareModal, setShowShareModal] = useState<string | null>(null); // friendUserId
  const [shareSuccess, setShareSuccess] = useState('');

  const loadFriends = useCallback(async () => {
    const data = await getFriends();
    setFriends(data);
  }, [getFriends]);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    setSearching(true);
    const results = await searchUsers(searchQuery);
    // Filter out existing friends
    const friendIds = friends.map((f: any) =>
      f.requester_id === userId ? f.addressee_id : f.requester_id
    );
    setSearchResults(results.filter((u: any) => !friendIds.includes(u.id)));
    setSearching(false);
  };

  const handleSendRequest = async (addresseeId: string) => {
    const ok = await sendFriendRequest(addresseeId);
    if (ok) {
      setSearchResults(prev => prev.filter(u => u.id !== addresseeId));
      await loadFriends();
    }
  };

  const handleRespond = async (friendshipId: string, accept: boolean) => {
    await respondToFriendRequest(friendshipId, accept);
    await loadFriends();
  };

  const handleRemove = async (friendshipId: string) => {
    if (confirm('Supprimer cet ami ?')) {
      await removeFriend(friendshipId);
      await loadFriends();
    }
  };

  const handleShare = async (projectId: string, friendUserId: string) => {
    const ok = await shareProject(projectId, friendUserId);
    if (ok) {
      setShareSuccess('Projet partagé !');
      setTimeout(() => setShareSuccess(''), 2000);
    }
  };

  // Separate pending requests from accepted friends
  const pendingReceived = friends.filter(
    (f: any) => f.status === 'pending' && f.addressee_id === userId
  );
  const pendingSent = friends.filter(
    (f: any) => f.status === 'pending' && f.requester_id === userId
  );
  const acceptedFriends = friends.filter((f: any) => f.status === 'accepted');

  const getFriendProfile = (friendship: any) => {
    if (friendship.requester_id === userId) {
      return friendship.addressee;
    }
    return friendship.requester;
  };

  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyInviteLink = () => {
    const link = `${window.location.origin}?invite=${userId}`;
    navigator.clipboard.writeText(link).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
        <Users size={20} /> Amis
      </h2>

      {/* Invite Link */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-3">
        <p className="text-xs font-bold text-indigo-700 mb-2 flex items-center gap-1">
          <Link size={14} /> Invite tes amis
        </p>
        <p className="text-xs text-indigo-600 mb-2">Partage ce lien pour ajouter un ami directement :</p>
        <button
          onClick={handleCopyInviteLink}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
            linkCopied
              ? 'bg-green-600 text-white'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {linkCopied ? (
            <><Check size={16} /> Lien copié !</>
          ) : (
            <><Copy size={16} /> Copier mon lien d'ami</>
          )}
        </button>
      </div>

      {/* Search Users */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Rechercher par pseudo..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching || searchQuery.length < 2}
            className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {searching ? '...' : 'Chercher'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
            {searchResults.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between p-3">
                <div>
                  <button
                    onClick={() => onViewProfile?.(user.id)}
                    className="font-semibold text-sm text-slate-800 hover:text-indigo-600 transition-colors"
                  >
                    {user.username}
                  </button>
                </div>
                <button
                  onClick={() => handleSendRequest(user.id)}
                  className="flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-200"
                >
                  <UserPlus size={14} /> Ajouter
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Received */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-amber-600 flex items-center gap-2">
          <Clock size={14} /> Demandes reçues
          {pendingReceived.length > 0 && (
            <span className="bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {pendingReceived.length}
            </span>
          )}
        </h3>
        {pendingReceived.length === 0 ? (
          <p className="text-xs text-slate-400 italic px-2">Aucune demande en attente</p>
        ) : (
          <div className="space-y-1">
            {pendingReceived.map((f: any) => {
              const profile = getFriendProfile(f);
              return (
                <div key={f.id} className="flex items-center justify-between p-2.5 bg-amber-50 border-2 border-amber-300 rounded-xl animate-pulse-slow">
                  <div className="flex items-center gap-2">
                    <UserPlus size={16} className="text-amber-600" />
                    <span className="font-semibold text-sm">{profile?.username || 'Utilisateur'}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleRespond(f.id, true)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xs font-semibold"
                      title="Accepter"
                    >
                      <Check size={14} /> Accepter
                    </button>
                    <button
                      onClick={() => handleRespond(f.id, false)}
                      className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      title="Refuser"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending Sent */}
      {pendingSent.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-500 flex items-center gap-2">
            <Clock size={14} /> Demandes envoyées
            <span className="bg-slate-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {pendingSent.length}
            </span>
          </h3>
          <div className="space-y-1">
            {pendingSent.map((f: any) => {
              const profile = getFriendProfile(f);
              return (
                <div key={f.id} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-sm text-slate-600">{profile?.username || 'Utilisateur'}</span>
                  <span className="text-xs text-slate-400 italic">En attente...</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Accepted Friends */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-green-600 flex items-center gap-1">
          <Users size={14} /> Mes amis ({acceptedFriends.length})
        </h3>
        {acceptedFriends.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Aucun ami pour l'instant. Cherche des utilisateurs ci-dessus !</p>
        ) : (
          <div className="space-y-1">
            {acceptedFriends.map((f: any) => {
              const profile = getFriendProfile(f);
              const friendUserId = f.requester_id === userId ? f.addressee_id : f.requester_id;
              return (
                <div key={f.id} className="relative p-2 bg-white border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <button onClick={() => onViewProfile?.(friendUserId)} className="font-semibold text-sm text-slate-800 hover:text-indigo-600 transition-colors">{profile?.username || 'Utilisateur'}</button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setShowShareModal(showShareModal === friendUserId ? null : friendUserId)}
                        className={`p-1.5 rounded-lg ${showShareModal === friendUserId ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
                        title="Partager un projet"
                      >
                        <Share2 size={14} />
                      </button>
                      <button
                        onClick={() => handleRemove(f.id)}
                        className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Share dropdown */}
                  {showShareModal === friendUserId && (
                    <div className="mt-2 bg-slate-50 border border-slate-200 rounded-lg p-2">
                      <p className="text-xs font-bold text-slate-500 mb-2">Partager un projet :</p>
                      {cloudProjects.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Aucun projet sauvegardé dans le cloud</p>
                      ) : (
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {cloudProjects.map(p => (
                            <button
                              key={p.id}
                              onClick={() => handleShare(p.id, friendUserId)}
                              className="w-full text-left px-2 py-1.5 text-xs bg-white border border-slate-100 rounded hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 truncate"
                            >
                              {p.name}
                            </button>
                          ))}
                        </div>
                      )}
                      {shareSuccess && (
                        <p className="text-xs text-green-600 font-semibold mt-2">{shareSuccess}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPanel;
