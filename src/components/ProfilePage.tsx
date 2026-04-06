import React, { useState, useRef } from 'react';
import { User, Camera, Check, X, Edit3, Mail, Calendar, Cloud, LogOut } from 'lucide-react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import type { Profile } from '../hooks/useAuth';

interface ProfilePageProps {
  profile: Profile | null;
  userEmail: string;
  userCreatedAt: string;
  onUpdateUsername: (name: string) => Promise<any>;
  onLogout: () => Promise<void>;
  onProfileUpdate: (profile: Profile) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  userEmail,
  userCreatedAt,
  onUpdateUsername,
  onLogout,
  onProfileUpdate,
}) => {
  const [editingName, setEditingName] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [nameError, setNameError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveUsername = async () => {
    if (newUsername.length < 3) {
      setNameError('Min. 3 caractères');
      return;
    }
    if (newUsername.length > 30) {
      setNameError('Max. 30 caractères');
      return;
    }
    try {
      await onUpdateUsername(newUsername);
      setEditingName(false);
      setNameError('');
    } catch (err: any) {
      if (err?.message?.includes('duplicate')) {
        setNameError('Ce pseudo est déjà pris');
      } else {
        setNameError(err?.message || 'Erreur');
      }
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile || !supabaseConfigured) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setUploadError('Le fichier doit être une image');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('L\'image ne doit pas dépasser 2 Mo');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.id}/avatar.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl + '?t=' + Date.now(); // cache bust

      // Update profile
      const { data: updatedProfile, error: updateErr } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', profile.id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      onProfileUpdate(updatedProfile);
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      setUploadError(err?.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!profile) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-500">Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <div className="max-w-lg mx-auto p-4 sm:p-6 space-y-6">

        {/* Avatar + Name Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Banner */}
          <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-500" />

          {/* Avatar */}
          <div className="px-6 -mt-12">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-200">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-400">
                    <User size={40} className="text-white" />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                title="Changer la photo"
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Camera size={16} />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            {uploadError && (
              <p className="text-xs text-red-500 mt-2">{uploadError}</p>
            )}
          </div>

          {/* Username */}
          <div className="px-6 py-4">
            {editingName ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveUsername();
                    if (e.key === 'Escape') { setEditingName(false); setNameError(''); }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-lg font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ton pseudo"
                  autoFocus
                  maxLength={30}
                />
                {nameError && <p className="text-xs text-red-500">{nameError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveUsername}
                    className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                  >
                    <Check size={16} /> Sauvegarder
                  </button>
                  <button
                    onClick={() => { setEditingName(false); setNameError(''); }}
                    className="flex items-center gap-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-300"
                  >
                    <X size={16} /> Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-800">{profile.username}</h2>
                <button
                  onClick={() => { setEditingName(true); setNewUsername(profile.username); }}
                  className="p-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-600"
                  title="Modifier le pseudo"
                >
                  <Edit3 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase">Informations du compte</h3>

          <div className="flex items-center gap-3 text-sm">
            <Mail size={18} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Email</p>
              <p className="font-medium text-slate-700">{userEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Calendar size={18} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Membre depuis</p>
              <p className="font-medium text-slate-700">{formatDate(userCreatedAt || profile.created_at)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Cloud size={18} className="text-green-500" />
            <div>
              <p className="text-xs text-slate-400">Statut</p>
              <p className="font-medium text-green-600">Connecté — Sync cloud active</p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-red-200 text-red-600 rounded-2xl font-semibold hover:bg-red-50 hover:border-red-300 transition-colors"
        >
          <LogOut size={18} />
          Se déconnecter
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
