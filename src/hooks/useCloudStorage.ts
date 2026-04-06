import { useCallback } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { ProjectState, BeadType, ProjectSettings } from '../types';

export interface CloudProject {
  id: string;
  user_id: string;
  name: string;
  project_data: ProjectState;
  beads_data: BeadType[] | null;
  settings_data: ProjectSettings | null;
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
}

export interface SharedProjectWithDetails extends CloudProject {
  shared_by_username: string;
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
  };
};
