"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { User, Workspace } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { 
  AUTH_TOKEN_KEY, 
  REFRESH_TOKEN_KEY, 
  CURRENT_USER_KEY, 
  CURRENT_WORKSPACE_KEY 
} from "@/lib/constants";

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
  const { toast } = useToast();

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
            // Restore workspace from localStorage
            const savedWorkspace = localStorage.getItem(CURRENT_WORKSPACE_KEY);
            if (savedWorkspace) {
              setWorkspace(JSON.parse(savedWorkspace));
            }
          }
        } catch (error) {
          // Invalid session, clear everything
          handleLogout();
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      
      // Store tokens
      localStorage.setItem(AUTH_TOKEN_KEY, response.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.user));
      
      // Set token in API client
      apiClient.setToken(response.access_token);
      
      // Update state
      setUser(response.user);
      
      // Fetch workspaces and set the first one
      const workspaces = await apiClient.getWorkspaces();
      if (workspaces.length > 0) {
        setWorkspace(workspaces[0]);
        localStorage.setItem(CURRENT_WORKSPACE_KEY, JSON.stringify(workspaces[0]));
      }
      
      // Navigate to main app
      router.push("/app/channel/general");
      
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      });
    } catch (error: any) {
      if (error.code === "INVALID_CREDENTIALS") {
        throw new Error("Invalid email or password");
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    }
    
    handleLogout();
  };

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(CURRENT_WORKSPACE_KEY);
    
    // Reset API client
    apiClient.setToken(null);
    
    // Clear state
    setUser(null);
    setWorkspace(null);
    
    // Navigate to login
    router.push("/login");
    
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  };

  const setWorkspaceWithPersist = (newWorkspace: Workspace) => {
    setWorkspace(newWorkspace);
    localStorage.setItem(CURRENT_WORKSPACE_KEY, JSON.stringify(newWorkspace));
  };

  const value: AuthContextValue = {
    user,
    workspace,
    isLoading,
    login,
    logout,
    updateUser,
    setWorkspace: setWorkspaceWithPersist,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}