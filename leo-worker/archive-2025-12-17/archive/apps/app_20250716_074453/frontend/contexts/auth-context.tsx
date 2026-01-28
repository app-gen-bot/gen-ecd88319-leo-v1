'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { apiClient } from '@/lib/api-client';
import { getMockUser } from '@/lib/mock-data';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, portal?: 'client' | 'staff', rememberMe?: boolean) => Promise<void>;
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
        // Check if rememberMe was used
        const rememberMe = localStorage.getItem('remember_me') === 'true';
        const storage = rememberMe ? localStorage : sessionStorage;
        
        const storedUser = storage.getItem('current_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string, portal: 'client' | 'staff' = 'client', rememberMe: boolean = false) => {
    try {
      // Special handling for demo account - it can access both portals
      if (email === 'demo@example.com' && password === 'demo123') {
        let demoUser: User;
        
        if (portal === 'staff') {
          // Create a staff version of the demo user
          demoUser = {
            id: 'demo-staff',
            email: 'demo@example.com',
            firstName: 'Demo',
            lastName: 'Staff',
            role: 'veterinarian', // Give veterinarian role for staff portal
            phone: '(555) 123-4567',
            clinicId: 'clinic1',
            avatar: '/avatars/demo.jpg',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        } else {
          // Use the regular demo user for client portal
          demoUser = {
            id: '1',
            email: 'demo@example.com',
            firstName: 'Demo',
            lastName: 'User',
            role: 'pet_owner',
            phone: '(555) 123-4567',
            avatar: '/avatars/demo.jpg',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Store user data with session/local storage based on rememberMe
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('current_user', JSON.stringify(demoUser));
        storage.setItem('auth_token', 'mock_token_' + demoUser.id);
        
        // Always store rememberMe preference
        localStorage.setItem('remember_me', rememberMe.toString());
        
        setUser(demoUser);

        // Redirect based on portal
        if (portal === 'client') {
          router.push('/client/dashboard');
        } else {
          router.push('/staff/dashboard');
        }
        
        return;
      }
      
      // For non-demo users, use the original logic
      const mockUser = getMockUser(email, password);
      
      if (!mockUser) {
        throw new Error('Invalid email or password');
      }

      // Check portal access
      if (portal === 'staff' && mockUser.role === 'pet_owner') {
        throw new Error('Invalid credentials for staff portal');
      }
      
      if (portal === 'client' && mockUser.role !== 'pet_owner') {
        throw new Error('Invalid credentials for client portal');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Store user data with session/local storage based on rememberMe
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('current_user', JSON.stringify(mockUser));
      storage.setItem('auth_token', 'mock_token_' + mockUser.id);
      
      // Always store rememberMe preference
      localStorage.setItem('remember_me', rememberMe.toString());
      
      setUser(mockUser);

      // Redirect based on role
      if (mockUser.role === 'pet_owner') {
        router.push('/client/dashboard');
      } else {
        router.push('/staff/dashboard');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const logout = async () => {
    try {
      // Clear all session data from both storages
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('current_user');
      localStorage.removeItem('remember_me');
      
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('current_user');
      
      setUser(null);
      
      // Redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    // Update in the same storage that was used for login
    const rememberMe = localStorage.getItem('remember_me') === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('current_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        login, 
        logout, 
        updateUser 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}