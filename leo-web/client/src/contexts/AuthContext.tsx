import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import type { User, Session, Provider } from '@supabase/supabase-js';
import type { Profile } from '../../../shared/schema.zod';

/**
 * Auth Context using Supabase SDK with OAuth and Profile support
 *
 * Provides authentication state and methods throughout the app.
 * Includes profile fetching for gated beta signup (status, credits).
 *
 * Usage:
 *   import { useAuth } from '@/contexts/AuthContext';
 *
 *   function Component() {
 *     const { user, profile, isAuthenticated, isApproved } = useAuth();
 *
 *     if (!isAuthenticated) {
 *       return <LoginForm />;
 *     }
 *
 *     if (!isApproved) {
 *       return <PendingApproval />;
 *     }
 *
 *     return <div>Welcome {profile?.name || user?.email}</div>;
 *   }
 */

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isApproved: boolean;
  isPending: boolean;
  isRejected: boolean;
  isSuspended: boolean;
  creditsRemaining: number;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithOAuth: (provider: Provider) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profile from our profiles table
  const fetchProfile = useCallback(async (_userId: string, accessToken: string) => {
    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      } else if (response.status === 404) {
        // Profile doesn't exist yet - this happens on first OAuth sign-in
        // The server will create it automatically
        setProfile(null);
      } else {
        console.error('Failed to fetch profile:', response.statusText);
        setProfile(null);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfile(null);
    }
  }, []);

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (session?.access_token && user?.id) {
      await fetchProfile(user.id, session.access_token);
    }
  }, [session, user, fetchProfile]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user && session.access_token) {
        await fetchProfile(session.user.id, session.access_token);
      }

      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user && session.access_token) {
        await fetchProfile(session.user.id, session.access_token);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name || '' },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Sign up failed - no user returned');
    }

    // Session is automatically set by onAuthStateChange listener
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Sign in failed - no user returned');
    }

    // Session is automatically set by onAuthStateChange listener
  };

  const signInWithOAuth = async (provider: Provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // User will be redirected to OAuth provider
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    setProfile(null);
    // Session is automatically cleared by onAuthStateChange listener
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  // Compute status flags
  const isApproved = profile?.status === 'approved';
  const isPending = profile?.status === 'pending_approval';
  const isRejected = profile?.status === 'rejected';
  const isSuspended = profile?.status === 'suspended';

  const value: AuthContextType = {
    user,
    session,
    profile,
    isAuthenticated: !!user,
    isLoading,
    isApproved,
    isPending,
    isRejected,
    isSuspended,
    creditsRemaining: profile?.creditsRemaining ?? 0,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 * @throws Error if used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
