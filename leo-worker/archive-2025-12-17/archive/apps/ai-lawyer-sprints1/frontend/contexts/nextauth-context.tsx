"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import type { User } from '@/shared/types/api';
import { toast } from '@/components/ui/use-toast';

interface NextAuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionTimeoutMinutes: number;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, userType: 'tenant' | 'landlord') => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetUserPassword: (token: string, newPassword: string) => Promise<void>;
  verifyUserEmail: (token: string) => Promise<void>;
  enableTOTP: () => Promise<{ secret: string; qrCode: string }>;
  verifyTOTP: (code: string) => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  pendingQuestion: string | null;
  setPendingQuestion: (question: string | null) => void;
}

const NextAuthContext = createContext<NextAuthContextValue | undefined>(undefined);

export function NextAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const sessionTimeoutMinutes = parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES || '30');

  // Convert NextAuth user to our User type
  const user: User | null = session?.user ? {
    id: session.user.id,
    email: session.user.email || '',
    name: session.user.name || '',
    userType: session.user.userType || 'tenant',
    phone: undefined,
    address: undefined,
    emailVerified: session.user.emailVerified || false,
    mfaEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } : null;

  // Session timeout management
  useEffect(() => {
    if (!user) return;

    const checkSessionTimeout = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      const timeoutMs = sessionTimeoutMinutes * 60 * 1000;

      if (timeSinceLastActivity >= timeoutMs) {
        // Session expired
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please sign in again.",
          variant: "destructive",
        });
        logout();
      } else {
        // Schedule next check
        const remainingTime = timeoutMs - timeSinceLastActivity;
        sessionTimeoutRef.current = setTimeout(checkSessionTimeout, Math.min(remainingTime, 60000));
      }
    };

    // Track user activity
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Add event listeners for user activity
    window.addEventListener('mousedown', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('touchstart', updateActivity);

    // Start timeout check
    checkSessionTimeout();

    return () => {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
      window.removeEventListener('mousedown', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
    };
  }, [user, sessionTimeoutMinutes]);

  // Preserve question in localStorage for non-authenticated users
  useEffect(() => {
    const savedQuestion = localStorage.getItem('pendingQuestion');
    if (savedQuestion && !user) {
      setPendingQuestion(savedQuestion);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error('Invalid email or password');
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      // Check if there's a pending question
      if (pendingQuestion) {
        router.push('/dashboard/chat?q=' + encodeURIComponent(pendingQuestion));
        localStorage.removeItem('pendingQuestion');
        setPendingQuestion(null);
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const signup = async (email: string, password: string, name: string, userType: 'tenant' | 'landlord') => {
    try {
      // Call backend API to create user
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, userType }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Signup failed');
      }

      const requiresVerification = process.env.NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION === 'true';
      
      toast({
        title: "Account created!",
        description: requiresVerification 
          ? "Please check your email to verify your account." 
          : "You can now sign in to your account.",
      });

      // If email verification is required, show verification page
      if (requiresVerification) {
        router.push('/verify-email?email=' + encodeURIComponent(email));
      } else {
        // Auto sign in if no verification required
        await login(email, password);
      }
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        throw new Error('Email already registered');
      }
      throw new Error(error.message || 'Signup failed');
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      
      // Clear session timeout
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
      
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/send-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send reset email');
      }

      toast({
        title: "Reset email sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send reset email');
    }
  };

  const resetUserPassword = async (token: string, newPassword: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reset password');
      }

      toast({
        title: "Password reset successful",
        description: "You can now sign in with your new password.",
      });

      router.push('/sign-in');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to reset password');
    }
  };

  const verifyUserEmail = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to verify email');
      }

      toast({
        title: "Email verified!",
        description: "Your email has been successfully verified.",
      });

      router.push('/sign-in');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to verify email');
    }
  };

  const enableTOTP = async () => {
    // TODO: Implement TOTP with NextAuth
    throw new Error('TOTP not implemented yet');
  };

  const verifyTOTP = async (code: string) => {
    // TODO: Implement TOTP with NextAuth
    throw new Error('TOTP not implemented yet');
  };

  const updateUser = (data: Partial<User>) => {
    // TODO: Implement user update
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const value = {
    user,
    isLoading: status === 'loading',
    isAuthenticated: !!user,
    sessionTimeoutMinutes,
    login,
    signup,
    logout,
    requestPasswordReset,
    resetUserPassword,
    verifyUserEmail,
    enableTOTP,
    verifyTOTP,
    updateUser,
    pendingQuestion,
    setPendingQuestion,
  };

  return <NextAuthContext.Provider value={value}>{children}</NextAuthContext.Provider>;
}

export function useNextAuth() {
  const context = useContext(NextAuthContext);
  if (context === undefined) {
    throw new Error('useNextAuth must be used within a NextAuthProvider');
  }
  return context;
}