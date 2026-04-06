import { useState, useEffect, useCallback } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile from DB — create if missing (e.g. trigger didn't fire)
  const fetchProfile = useCallback(async (userId: string, userMeta?: any) => {
    if (!supabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile not found — create it
        const username = userMeta?.username || userMeta?.full_name || userMeta?.name || 'user_' + userId.slice(0, 8);
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ id: userId, username })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError);
          return null;
        }
        setProfile(newProfile);
        return newProfile;
      }

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      return null;
    }
  }, []);

  // Listen to auth changes
  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    // Subscribe to auth changes FIRST (catches the OAuth redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        console.log('[Auth] event:', event, 'user:', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Use setTimeout to avoid Supabase deadlock on initial SIGNED_IN
          setTimeout(() => {
            if (mounted) {
              fetchProfile(session.user.id, session.user.user_metadata);
            }
          }, 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Then get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      console.log('[Auth] initial session:', session?.user?.email || 'none');
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.user_metadata);
      }
      setLoading(false);
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign up with email
  const signUp = async (email: string, password: string, username: string) => {
    if (!supabaseConfigured) throw new Error('Service non disponible');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });
    if (error) throw error;
    return data;
  };

  // Sign in with email
  const signIn = async (email: string, password: string) => {
    if (!supabaseConfigured) throw new Error('Service non disponible');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    if (!supabaseConfigured) throw new Error('Service non disponible');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  };

  // Sign out
  const signOut = async () => {
    if (!supabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  // Update username
  const updateUsername = async (newUsername: string) => {
    if (!supabaseConfigured) throw new Error('Service non disponible');
    if (!user) throw new Error('Not logged in');

    const { data, error } = await supabase
      .from('profiles')
      .update({ username: newUsername })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(data);
    return data;
  };

  return {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateUsername,
    fetchProfile,
  };
};
