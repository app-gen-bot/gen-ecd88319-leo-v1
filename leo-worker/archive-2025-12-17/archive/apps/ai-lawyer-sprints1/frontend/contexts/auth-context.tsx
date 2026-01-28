"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import type { User } from '@/shared/types/api';
import { toast } from '@/components/ui/use-toast';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, userType: 'tenant' | 'landlord') => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = apiClient.getToken();
        if (token) {
          const session = await apiClient.getSession();
          if (session.valid && session.user) {
            setUser(session.user);
          } else {
            // Invalid session, clear everything
            apiClient.setToken(null);
            apiClient.setCurrentUser(null);
          }
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        // Clear invalid session
        apiClient.setToken(null);
        apiClient.setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login({ email, password });
      setUser(response.user);
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      // Navigate to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      if (error.code === 'INVALID_CREDENTIALS') {
        throw new Error('Invalid email or password');
      }
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string, userType: 'tenant' | 'landlord') => {
    try {
      const response = await apiClient.signup({
        email,
        password,
        name,
        userType: userType,
      });

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });

      // Navigate to sign in
      router.push('/sign-in');
    } catch (error: any) {
      if (error.code === 'EMAIL_EXISTS') {
        throw new Error('Email already registered');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      router.push('/');
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    apiClient.setCurrentUser(updatedUser);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateUser,
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