"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";

// Token keys - ALWAYS use these exact keys
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const CURRENT_USER_KEY = 'current_user';
const CURRENT_WORKSPACE_KEY = 'current_workspace';

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  status?: string;
  workspaces?: Array<{ id: string; name: string }>;
}

interface Workspace {
  id: string;
  name: string;
  created_at?: string;
  owner_id?: string;
}

interface AuthContextValue {
  user: User | null;
  workspace: Workspace | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  setWorkspace: (workspace: Workspace) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        try {
          apiClient.setToken(token);
          const session = await apiClient.getSession();
          
          if (session.valid && session.user) {
            setUser(session.user);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(session.user));
            
            // Restore workspace from localStorage
            const savedWorkspace = localStorage.getItem(CURRENT_WORKSPACE_KEY);
            if (savedWorkspace) {
              setWorkspace(JSON.parse(savedWorkspace));
            } else if (session.user.workspaces && session.user.workspaces.length > 0) {
              // Set first workspace if none saved
              const firstWorkspace = session.user.workspaces[0];
              setWorkspace(firstWorkspace);
              localStorage.setItem(CURRENT_WORKSPACE_KEY, JSON.stringify(firstWorkspace));
            }
          } else {
            // Invalid session, clear everything
            handleLogout();
          }
        } catch (error) {
          console.error("Session restoration failed:", error);
          // Invalid session, clear everything
          handleLogout();
        }
      }
      setIsLoading(false);
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
      const response = await apiClient.login(email, password);
      
      // Store tokens
      localStorage.setItem(AUTH_TOKEN_KEY, response.access_token);
      if (response.refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
      }
      
      // Store user
      setUser(response.user);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.user));
      
      // Set first workspace
      if (response.user.workspaces && response.user.workspaces.length > 0) {
        const firstWorkspace = response.user.workspaces[0];
        setWorkspace(firstWorkspace);
        localStorage.setItem(CURRENT_WORKSPACE_KEY, JSON.stringify(firstWorkspace));
      }
      
      // Navigate to default page
      router.push('/channel/general');
    } catch (error) {
      // Re-throw error for form to handle
      throw error;
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      // Call logout API
      await apiClient.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Continue with local logout even if API fails
    }
    
    // Clear all session data
    handleLogout();
    
    // Navigate to login
    router.push('/login');
  }, [router, handleLogout]);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  }, []);

  const setWorkspaceWithStorage = useCallback((workspace: Workspace) => {
    setWorkspace(workspace);
    localStorage.setItem(CURRENT_WORKSPACE_KEY, JSON.stringify(workspace));
  }, []);

  const value: AuthContextValue = {
    user,
    workspace,
    isLoading,
    login,
    logout,
    updateUser,
    setWorkspace: setWorkspaceWithStorage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}