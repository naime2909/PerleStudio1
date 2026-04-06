import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Edit3, Check, X, Cloud, CloudOff } from 'lucide-react';
import type { Profile } from '../hooks/useAuth';

interface ProfileButtonProps {
  profile: Profile | null;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onLogout: () => Promise<void>;
  onUpdateUsername: (name: string) => Promise<any>;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({
  profile,
  isLoggedIn,
  onLoginClick,
  onLogout,
  onUpdateUsername,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [error, setError] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setEditingName(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isLoggedIn) {
    return (
      <button
        onClick={onLoginClick}
        className="flex items-center gap-1.5 px-2 lg:px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 text-white text-xs lg:text-sm font-semibold transition-colors"
      >
        <User size={16} />
        <span className="hidden sm:inline">Connexion</span>
      </button>
    );
  }

  const handleSaveUsername = async () => {
    if (newUsername.length < 3) {
      setError('Min. 3 caractères');
      return;
    }
    try {
      await onUpdateUsername(newUsername);
      setEditingName(false);
      setError('');
    } catch (err: any) {
      if (err?.message?.includes('duplicate')) {
        setError('Pseudo déjà pris');
      } else {
        setError('Erreur');
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-1.5 px-2 lg:px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 text-white text-xs lg:text-sm font-semibold transition-colors"
      >
        <Cloud size={16} />
        <span className="hidden sm:inline truncate max-w-[100px]">
          {profile?.username || 'Mon compte'}
        </span>
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 w-64 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200">
            {editingName ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Nouveau pseudo"
                  autoFocus
                  maxLength={30}
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
                <div className="flex gap-1">
                  <button
                    onClick={handleSaveUsername}
                    className="flex-1 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                  >
                    <Check size={12} className="inline mr-1" /> OK
                  </button>
                  <button
                    onClick={() => { setEditingName(false); setError(''); }}
                    className="px-2 py-1 bg-slate-200 rounded-lg text-xs hover:bg-slate-300"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">{profile?.username}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Cloud size={12} className="text-green-500" /> Connecté
                  </p>
                </div>
                <button
                  onClick={() => { setEditingName(true); setNewUsername(profile?.username || ''); }}
                  className="p-1.5 bg-white rounded-lg hover:bg-slate-100 text-slate-600"
                  title="Modifier le pseudo"
                >
                  <Edit3 size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="p-2">
            <button
              onClick={async () => {
                setShowDropdown(false);
                await onLogout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
            >
              <LogOut size={16} />
              Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileButton;
