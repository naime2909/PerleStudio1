import React from 'react';
import { User, Cloud } from 'lucide-react';
import type { Profile } from '../hooks/useAuth';

interface ProfileButtonProps {
  profile: Profile | null;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onProfileClick: () => void;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({
  profile,
  isLoggedIn,
  onLoginClick,
  onProfileClick,
}) => {
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

  return (
    <button
      onClick={onProfileClick}
      className="flex items-center gap-1.5 px-2 lg:px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 text-white text-xs lg:text-sm font-semibold transition-colors"
    >
      {profile?.avatar_url ? (
        <img src={profile.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
      ) : (
        <Cloud size={16} />
      )}
      <span className="hidden sm:inline truncate max-w-[100px]">
        {profile?.username || 'Mon compte'}
      </span>
    </button>
  );
};

export default ProfileButton;
