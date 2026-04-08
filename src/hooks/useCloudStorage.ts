import { useCallback } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { ProjectState, BeadType, ProjectSettings, ProjectVisibility } from '../types';

export interface UserTemplate {
  id: string;
  user_id: string;
  name: string;
  category: 'geometrique' | 'floral' | 'animal' | 'symbole' | 'alphabet' | 'custom';
  difficulty: 'debutant' | 'intermediaire' | 'avance';
  rows: number;
  columns: number;
  mode: string;
  grid: Record<string, string>;
  bead_colors: Record<string, string>;
  description: string | null;
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
}

export interface CloudProject {
  id: string;
  user_id: string;
  name: string;
  project_data: ProjectState;
  beads_data: BeadType[] | null;
  settings_data: ProjectSettings | null;
  thumbnail: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SharedProjectWithDetails extends CloudProject {
  shared_by_username: string;
}

export interface ShowcaseProject {
  id: string;
  user_id: string;
  name: string;
  project_data: ProjectState;
  beads_data: BeadType[] | null;
  settings_data: ProjectSettings | null;
  thumbnail: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  author_username: string;
  author_avatar: string | null;
  like_count: number;
  copy_count: number;
  is_liked_by_me: boolean;
}

export interface PublicProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string;
  created_at: string;
}

export const useCloudStorage = (userId: string | undefined) => {

  // ========================
  // PROJECTS CRUD
  // ========================

  const loadProjects = useCallback(async (): Promise<CloudProject[]> => {
    if (!userId || !supabaseConfigured) return [];

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading cloud projects:', error);
      return [];
    }
    return data || [];
  }, [userId]);

  const saveProject = useCallback(async (
    name: string,
    projectData: ProjectState,
    beadsData: BeadType[],
    settingsData: ProjectSettings,
    thumbnail: string,
    existingId?: string
  ): Promise<CloudProject | null> => {
    if (!userId) return null;

    if (!supabaseConfigured) return null;

    if (existingId) {
      // Update
      const { data, error } = await supabase
        .from('projects')
        .update({
          name,
          project_data: projectData,
          beads_data: beadsData,
          settings_data: settingsData,
          thumbnail,
        })
        .eq('id', existingId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating project:', error);
        return null;
      }
      return data;
    } else {
      // Insert
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          name,
          project_data: projectData,
          beads_data: beadsData,
          settings_data: settingsData,
          thumbnail,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving project:', error);
        return null;
      }
      return data;
    }
  }, [userId]);

  const deleteProject = useCallback(async (projectId: string) => {
    if (!userId || !supabaseConfigured) return false;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting project:', error);
      return false;
    }
    return true;
  }, [userId]);

  const renameProject = useCallback(async (projectId: string, newName: string) => {
    if (!userId || !supabaseConfigured) return false;

    const { error } = await supabase
      .from('projects')
      .update({ name: newName })
      .eq('id', projectId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error renaming project:', error);
      return false;
    }
    return true;
  }, [userId]);

  // ========================
  // FRIENDS
  // ========================

  const searchUsers = useCallback(async (query: string) => {
    if (!userId || !supabaseConfigured || query.length < 2) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .ilike('username', `%${query}%`)
      .neq('id', userId)
      .limit(10);

    if (error) {
      console.error('Error searching users:', error);
      return [];
    }
    return data || [];
  }, [userId]);

  const sendFriendRequest = useCallback(async (addresseeId: string) => {
    if (!userId || !supabaseConfigured) return false;

    const { error } = await supabase
      .from('friendships')
      .insert({
        requester_id: userId,
        addressee_id: addresseeId,
        status: 'pending',
      });

    if (error) {
      console.error('Error sending friend request:', error);
      return false;
    }
    return true;
  }, [userId]);


  const respondToFriendRequest = useCallback(async (friendshipId: string, accept: boolean) => {
    if (!userId || !supabaseConfigured) return false;

    const { error } = await supabase
      .from('friendships')
      .update({ status: accept ? 'accepted' : 'rejected' })
      .eq('id', friendshipId)
      .eq('addressee_id', userId);

    if (error) {
      console.error('Error responding to friend request:', error);
      return false;
    }
    return true;
  }, [userId]);

  const removeFriend = useCallback(async (friendshipId: string) => {
    if (!userId || !supabaseConfigured) return false;

    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    if (error) {
      console.error('Error removing friend:', error);
      return false;
    }
    return true;
  }, [userId]);

  const getFriends = useCallback(async () => {
    if (!userId || !supabaseConfigured) return [];

    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id,
        requester_id,
        addressee_id,
        status,
        created_at,
        requester:profiles!friendships_requester_id_fkey(id, username, avatar_url),
        addressee:profiles!friendships_addressee_id_fkey(id, username, avatar_url)
      `)
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .in('status', ['accepted', 'pending']);

    if (error) {
      console.error('Error loading friends:', error);
      return [];
    }
    return data || [];
  }, [userId]);

  // ========================
  // SHARING
  // ========================

  const shareProject = useCallback(async (projectId: string, friendUserId: string) => {
    if (!userId || !supabaseConfigured) return false;

    const { error } = await supabase
      .from('shared_projects')
      .insert({
        project_id: projectId,
        shared_by: userId,
        shared_with: friendUserId,
      });

    if (error) {
      console.error('Error sharing project:', error);
      return false;
    }
    return true;
  }, [userId]);

  const getSharedWithMe = useCallback(async (): Promise<SharedProjectWithDetails[]> => {
    if (!userId || !supabaseConfigured) return [];

    const { data, error } = await supabase
      .from('shared_projects')
      .select(`
        project_id,
        created_at,
        shared_by,
        projects!shared_projects_project_id_fkey(
          id, user_id, name, project_data, beads_data, settings_data, thumbnail, created_at, updated_at
        ),
        sharer:profiles!shared_projects_shared_by_fkey(username)
      `)
      .eq('shared_with', userId);

    if (error) {
      console.error('Error loading shared projects:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      ...item.projects,
      shared_by_username: item.sharer?.username || 'Inconnu',
    }));
  }, [userId]);

  const unshareProject = useCallback(async (projectId: string, sharedWithId: string) => {
    if (!userId || !supabaseConfigured) return false;

    const { error } = await supabase
      .from('shared_projects')
      .delete()
      .eq('project_id', projectId)
      .eq('shared_by', userId)
      .eq('shared_with', sharedWithId);

    if (error) {
      console.error('Error unsharing project:', error);
      return false;
    }
    return true;
  }, [userId]);

  // ========================
  // USER TEMPLATES
  // ========================

  const loadTemplates = useCallback(async (): Promise<UserTemplate[]> => {
    if (!userId || !supabaseConfigured) return [];

    const { data, error } = await supabase
      .from('user_templates')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading user templates:', error);
      return [];
    }
    return data || [];
  }, [userId]);

  const saveTemplate = useCallback(async (
    template: {
      name: string;
      category: UserTemplate['category'];
      difficulty: UserTemplate['difficulty'];
      rows: number;
      columns: number;
      mode: string;
      grid: Record<string, string>;
      bead_colors: Record<string, string>;
      description?: string;
      thumbnail?: string;
    }
  ): Promise<UserTemplate | null> => {
    if (!userId || !supabaseConfigured) return null;

    const { data, error } = await supabase
      .from('user_templates')
      .insert({
        user_id: userId,
        name: template.name,
        category: template.category,
        difficulty: template.difficulty,
        rows: template.rows,
        columns: template.columns,
        mode: template.mode,
        grid: template.grid,
        bead_colors: template.bead_colors,
        description: template.description || null,
        thumbnail: template.thumbnail || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving template:', error);
      return null;
    }
    return data;
  }, [userId]);

  const deleteTemplate = useCallback(async (templateId: string) => {
    if (!userId || !supabaseConfigured) return false;

    const { error } = await supabase
      .from('user_templates')
      .delete()
      .eq('id', templateId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting template:', error);
      return false;
    }
    return true;
  }, [userId]);

  // ========================
  // PUBLIC LINK SHARING
  // ========================

  // Fetch a project by ID (for public link sharing — needs RLS policy)
  const getProjectById = useCallback(async (projectId: string): Promise<CloudProject | null> => {
    if (!supabaseConfigured) return null;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Error fetching project by ID:', error);
      return null;
    }
    return data;
  }, []);

  // Fetch a profile by ID (for invite links)
  const getProfileById = useCallback(async (profileId: string) => {
    if (!supabaseConfigured) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .eq('id', profileId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  }, []);

  // Toggle public sharing on a project (legacy)
  const setProjectPublic = useCallback(async (projectId: string, isPublic: boolean) => {
    if (!userId || !supabaseConfigured) return false;

    const { error } = await supabase
      .from('projects')
      .update({ is_public: isPublic, visibility: isPublic ? 'public' : 'private' })
      .eq('id', projectId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating project visibility:', error);
      return false;
    }
    return true;
  }, [userId]);

  // ========================
  // SHOWCASE / VITRINE
  // ========================

  const setProjectVisibility = useCallback(async (projectId: string, visibility: ProjectVisibility) => {
    if (!userId || !supabaseConfigured) return false;

    const { error } = await supabase
      .from('projects')
      .update({ visibility })
      .eq('id', projectId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error setting project visibility:', error);
      return false;
    }
    return true;
  }, [userId]);

  const getShowcaseProjects = useCallback(async (sortBy: 'recent' | 'popular' = 'recent'): Promise<ShowcaseProject[]> => {
    if (!supabaseConfigured) return [];

    // Get showcased projects with author info
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        id, user_id, name, project_data, beads_data, settings_data, thumbnail, created_at, updated_at,
        author:profiles!projects_user_id_fkey(username, avatar_url)
      `)
      .eq('visibility', 'showcased')
      .order(sortBy === 'recent' ? 'updated_at' : 'created_at', { ascending: false });

    if (error || !projects) {
      console.error('Error loading showcase:', error);
      return [];
    }

    // Get like counts
    const projectIds = projects.map(p => p.id);
    const { data: likes } = await supabase
      .from('showcase_likes')
      .select('project_id')
      .in('project_id', projectIds);

    // Get copy counts
    const { data: copies } = await supabase
      .from('showcase_copies')
      .select('source_project_id')
      .in('source_project_id', projectIds);

    // Get current user's likes
    let myLikes: string[] = [];
    if (userId) {
      const { data: myLikeData } = await supabase
        .from('showcase_likes')
        .select('project_id')
        .eq('user_id', userId)
        .in('project_id', projectIds);
      myLikes = (myLikeData || []).map(l => l.project_id);
    }

    // Count per project
    const likeCounts: Record<string, number> = {};
    const copyCounts: Record<string, number> = {};
    (likes || []).forEach(l => { likeCounts[l.project_id] = (likeCounts[l.project_id] || 0) + 1; });
    (copies || []).forEach(c => { copyCounts[c.source_project_id] = (copyCounts[c.source_project_id] || 0) + 1; });

    const result: ShowcaseProject[] = projects.map((p: any) => ({
      id: p.id,
      user_id: p.user_id,
      name: p.name,
      project_data: p.project_data,
      beads_data: p.beads_data,
      settings_data: p.settings_data,
      thumbnail: p.thumbnail,
      photo_url: p.photo_url || null,
      created_at: p.created_at,
      updated_at: p.updated_at,
      author_username: p.author?.username || 'Inconnu',
      author_avatar: p.author?.avatar_url || null,
      like_count: likeCounts[p.id] || 0,
      copy_count: copyCounts[p.id] || 0,
      is_liked_by_me: myLikes.includes(p.id),
    }));

    // Sort by popularity if requested
    if (sortBy === 'popular') {
      result.sort((a, b) => (b.like_count + b.copy_count) - (a.like_count + a.copy_count));
    }

    return result;
  }, [userId]);

  const toggleLike = useCallback(async (projectId: string): Promise<{ liked: boolean; newCount: number } | null> => {
    if (!userId || !supabaseConfigured) return null;

    // Check if already liked
    const { data: existing } = await supabase
      .from('showcase_likes')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .limit(1);

    if (existing && existing.length > 0) {
      // Unlike
      await supabase.from('showcase_likes').delete().eq('id', existing[0].id);
      const { count } = await supabase.from('showcase_likes').select('id', { count: 'exact', head: true }).eq('project_id', projectId);
      return { liked: false, newCount: count || 0 };
    } else {
      // Like
      await supabase.from('showcase_likes').insert({ project_id: projectId, user_id: userId });
      const { count } = await supabase.from('showcase_likes').select('id', { count: 'exact', head: true }).eq('project_id', projectId);
      return { liked: true, newCount: count || 0 };
    }
  }, [userId]);

  const copyShowcaseProject = useCallback(async (project: ShowcaseProject): Promise<CloudProject | null> => {
    if (!userId || !supabaseConfigured) return null;

    // Create a copy of the project for the current user
    const { data: newProject, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        name: `${project.name} (copie)`,
        project_data: project.project_data,
        beads_data: project.beads_data,
        settings_data: project.settings_data,
        thumbnail: project.thumbnail,
        visibility: 'private',
      })
      .select()
      .single();

    if (error) {
      console.error('Error copying project:', error);
      return null;
    }

    // Track the copy
    await supabase.from('showcase_copies').insert({
      source_project_id: project.id,
      copied_by: userId,
    });

    return newProject;
  }, [userId]);

  const getPublicProfile = useCallback(async (profileId: string): Promise<PublicProfile | null> => {
    if (!supabaseConfigured) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, bio, created_at')
      .eq('id', profileId)
      .single();

    if (error) {
      console.error('Error fetching public profile:', error);
      return null;
    }
    return profile;
  }, []);

  const getPublicProjects = useCallback(async (profileId: string): Promise<ShowcaseProject[]> => {
    if (!supabaseConfigured) return [];

    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        id, user_id, name, project_data, beads_data, settings_data, thumbnail, created_at, updated_at,
        author:profiles!projects_user_id_fkey(username, avatar_url)
      `)
      .eq('user_id', profileId)
      .in('visibility', ['public', 'showcased'])
      .order('updated_at', { ascending: false });

    if (error || !projects) return [];

    const projectIds = projects.map(p => p.id);

    const { data: likes } = await supabase
      .from('showcase_likes')
      .select('project_id')
      .in('project_id', projectIds);

    const { data: copies } = await supabase
      .from('showcase_copies')
      .select('source_project_id')
      .in('source_project_id', projectIds);

    let myLikes: string[] = [];
    if (userId) {
      const { data: myLikeData } = await supabase
        .from('showcase_likes')
        .select('project_id')
        .eq('user_id', userId)
        .in('project_id', projectIds);
      myLikes = (myLikeData || []).map(l => l.project_id);
    }

    const likeCounts: Record<string, number> = {};
    const copyCounts: Record<string, number> = {};
    (likes || []).forEach((l: any) => { likeCounts[l.project_id] = (likeCounts[l.project_id] || 0) + 1; });
    (copies || []).forEach((c: any) => { copyCounts[c.source_project_id] = (copyCounts[c.source_project_id] || 0) + 1; });

    return projects.map((p: any) => ({
      id: p.id,
      user_id: p.user_id,
      name: p.name,
      project_data: p.project_data,
      beads_data: p.beads_data,
      settings_data: p.settings_data,
      thumbnail: p.thumbnail,
      photo_url: p.photo_url || null,
      created_at: p.created_at,
      updated_at: p.updated_at,
      author_username: p.author?.username || 'Inconnu',
      author_avatar: p.author?.avatar_url || null,
      like_count: likeCounts[p.id] || 0,
      copy_count: copyCounts[p.id] || 0,
      is_liked_by_me: myLikes.includes(p.id),
    }));
  }, [userId]);

  const uploadProjectPhoto = useCallback(async (projectId: string, file: File): Promise<string | null> => {
    if (!userId || !supabaseConfigured) return null;

    // Validate
    if (!file.type.startsWith('image/')) return null;
    if (file.size > 5 * 1024 * 1024) return null; // 5MB max

    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${projectId}.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadErr } = await supabase.storage
      .from('project-photos')
      .upload(filePath, file, { upsert: true });

    if (uploadErr) {
      console.error('Error uploading photo:', uploadErr);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('project-photos')
      .getPublicUrl(filePath);

    const photoUrl = urlData.publicUrl + '?t=' + Date.now();

    // Update project record
    const { error: updateErr } = await supabase
      .from('projects')
      .update({ photo_url: photoUrl })
      .eq('id', projectId)
      .eq('user_id', userId);

    if (updateErr) {
      console.error('Error saving photo URL:', updateErr);
      return null;
    }

    return photoUrl;
  }, [userId]);

  const removeProjectPhoto = useCallback(async (projectId: string): Promise<boolean> => {
    if (!userId || !supabaseConfigured) return false;

    // Remove from project record
    const { error } = await supabase
      .from('projects')
      .update({ photo_url: null })
      .eq('id', projectId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing photo:', error);
      return false;
    }
    return true;
  }, [userId]);

  const updateBio = useCallback(async (bio: string): Promise<boolean> => {
    if (!userId || !supabaseConfigured) return false;

    const { error } = await supabase
      .from('profiles')
      .update({ bio })
      .eq('id', userId);

    if (error) {
      console.error('Error updating bio:', error);
      return false;
    }
    return true;
  }, [userId]);

  const getProjectStats = useCallback(async (projectIds: string[]): Promise<Record<string, { likes: number; copies: number }>> => {
    if (!supabaseConfigured || projectIds.length === 0) return {};

    const { data: likes } = await supabase
      .from('showcase_likes')
      .select('project_id')
      .in('project_id', projectIds);

    const { data: copies } = await supabase
      .from('showcase_copies')
      .select('source_project_id')
      .in('source_project_id', projectIds);

    const stats: Record<string, { likes: number; copies: number }> = {};
    projectIds.forEach(id => { stats[id] = { likes: 0, copies: 0 }; });
    (likes || []).forEach((l: any) => { if (stats[l.project_id]) stats[l.project_id].likes++; });
    (copies || []).forEach((c: any) => { if (stats[c.source_project_id]) stats[c.source_project_id].copies++; });

    return stats;
  }, []);

  return {
    // Projects
    loadProjects,
    saveProject,
    deleteProject,
    renameProject,
    // Friends
    searchUsers,
    sendFriendRequest,
    respondToFriendRequest,
    removeFriend,
    getFriends,
    // Sharing
    shareProject,
    getSharedWithMe,
    unshareProject,
    // Public links
    getProjectById,
    getProfileById,
    setProjectPublic,
    // Showcase / Vitrine
    setProjectVisibility,
    getShowcaseProjects,
    toggleLike,
    copyShowcaseProject,
    getPublicProfile,
    getPublicProjects,
    updateBio,
    getProjectStats,
    uploadProjectPhoto,
    removeProjectPhoto,
    // Templates
    loadTemplates,
    saveTemplate,
    deleteTemplate,
  };
};
