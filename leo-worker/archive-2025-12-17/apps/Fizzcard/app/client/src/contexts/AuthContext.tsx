import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@shared/schema.zod';
import {
  getAuthToken,
  setAuthToken,
  getAuthUser,
  setAuthUser,
  clearAuth,
  isAuthenticated as checkIsAuthenticated,
} from '@/lib/auth-helpers';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component
 * Manages authentication state and provides auth methods
 *
 * Uses direct fetch for auth endpoints since we don't have a token yet
 * All other API calls should use apiClient
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Get API base URL
   * Matches the logic in api-client.ts for consistent URL handling
   */
  const getApiUrl = (): string => {
    // If VITE_API_URL is set, use it (development)
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    // In production, API is served from same origin
    if (import.meta.env.PROD) {
      return window.location.origin;
    }
    // Fallback for development
    return 'http://localhost:5013';
  };

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      const token = getAuthToken();
      const savedUser = getAuthUser();

      if (token && savedUser) {
        setUser(savedUser);
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Login user with email and password
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await fetch(
        `${getApiUrl()}/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();

      // Store token and user
      setAuthToken(data.token);
      setAuthUser(data.user);
      setUser(data.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  /**
   * Signup new user
   */
  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<void> => {
    try {
      const response = await fetch(
        `${getApiUrl()}/api/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, password }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }

      const data = await response.json();

      // Store token and user
      setAuthToken(data.token);
      setAuthUser(data.user);
      setUser(data.user);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = (): void => {
    clearAuth();
    setUser(null);
  };

  /**
   * Refresh user data from server
   */
  const refreshUser = async (): Promise<void> => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(
        `${getApiUrl()}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to refresh user');
      }

      const data = await response.json();
      setAuthUser(data);
      setUser(data);
    } catch (error) {
      console.error('Refresh user error:', error);
      // If refresh fails, logout
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: checkIsAuthenticated() && user !== null,
    isLoading,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
