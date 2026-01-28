import type { User } from '@shared/schema.zod';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Get authentication token from Supabase's localStorage session
 * Supabase stores session as sb-<project-ref>-auth-token
 */
export const getAuthToken = (): string | null => {
  // First check for Supabase session token
  const supabaseKey = Object.keys(localStorage).find(key =>
    key.startsWith('sb-') && key.endsWith('-auth-token')
  );

  if (supabaseKey) {
    try {
      const session = JSON.parse(localStorage.getItem(supabaseKey) || '{}');
      if (session.access_token) {
        return session.access_token;
      }
    } catch {
      // Fall through to legacy check
    }
  }

  // Fallback to legacy auth_token key
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Set authentication token in localStorage
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Get authenticated user from localStorage
 */
export const getAuthUser = (): User | null => {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;

  try {
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
};

/**
 * Set authenticated user in localStorage
 */
export const setAuthUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Clear authentication data from localStorage
 */
export const clearAuth = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};
