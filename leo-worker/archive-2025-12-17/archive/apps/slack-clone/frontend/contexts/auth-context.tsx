'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { ApiError } from '@/lib/api-error';
import type { User, Workspace } from '@/types/api';

// Token keys
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const CURRENT_USER_KEY = 'current_user';
const CURRENT_WORKSPACE_KEY = 'current_workspace';

interface AuthContextValue {
  user: User | null;
  workspace: Workspace | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, workspaceName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  updateWorkspace: (workspace: Workspace) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
          apiClient.setToken(token);
          const session = await apiClient.getSession();
          
          if (session.valid && session.user) {
            setUser(session.user);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(session.user));
            
            if (session.workspace) {
              setWorkspace(session.workspace);
              localStorage.setItem(CURRENT_WORKSPACE_KEY, JSON.stringify(session.workspace));
            } else {
              // Try to restore workspace from localStorage
              const savedWorkspace = localStorage.getItem(CURRENT_WORKSPACE_KEY);
              if (savedWorkspace) {
                setWorkspace(JSON.parse(savedWorkspace));
              }
            }
          } else {
            // Invalid session, clear everything
            handleLogout();
          }
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const handleLogout = useCallback(() => {
    // Clear all auth data
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(CURRENT_WORKSPACE_KEY);
    apiClient.setToken(null);
    setUser(null);
    setWorkspace(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await apiClient.login({ email, password });
      
      // Store tokens
      localStorage.setItem(AUTH_TOKEN_KEY, response.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
      
      // Store user and workspace
      setUser(response.user);
      setWorkspace(response.workspace);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.user));
      localStorage.setItem(CURRENT_WORKSPACE_KEY, JSON.stringify(response.workspace));
      
      // Set token in API client
      apiClient.setToken(response.access_token);
      
      // Navigate to workspace
      router.push('/channel/general');
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('Login failed');
    }
  }, [router]);

  const register = useCallback(async (
    email: string,
    password: string,
    name: string,
    workspaceName: string
  ) => {
    try {
      const response = await apiClient.register({
        email,
        password,
        name,
        workspace_name: workspaceName,
      });
      
      // Store tokens
      localStorage.setItem(AUTH_TOKEN_KEY, response.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
      
      // Store user and workspace
      setUser(response.user);
      setWorkspace(response.workspace);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.user));
      localStorage.setItem(CURRENT_WORKSPACE_KEY, JSON.stringify(response.workspace));
      
      // Set token in API client
      apiClient.setToken(response.access_token);
      
      // Navigate to workspace
      router.push('/channel/general');
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('Registration failed');
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      handleLogout();
      router.push('/login');
    }
  }, [handleLogout, router]);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  }, []);

  const updateWorkspace = useCallback((updatedWorkspace: Workspace) => {
    setWorkspace(updatedWorkspace);
    localStorage.setItem(CURRENT_WORKSPACE_KEY, JSON.stringify(updatedWorkspace));
  }, []);

  const value: AuthContextValue = {
    user,
    workspace,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    updateWorkspace,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}