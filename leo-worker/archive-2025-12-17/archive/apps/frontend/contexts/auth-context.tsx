"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import apiClient, { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, CURRENT_USER_KEY } from '@/lib/api-client'
import { User } from '@/types'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
  // Initialize session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY)
      if (token) {
        try {
          apiClient.setToken(token)
          const userData = localStorage.getItem(CURRENT_USER_KEY)
          if (userData) {
            setUser(JSON.parse(userData))
          }
          // Skip session validation for demo tokens
          if (!token.startsWith('mock-access-token-')) {
            // Verify token is still valid
            await apiClient.getSession()
          }
        } catch {
          // Token invalid, clear everything
          await logout()
        }
      }
      setIsLoading(false)
    }
    
    initAuth()
  }, [])
  
  const login = async (email: string, password: string) => {
    // Demo mode bypass
    if (email === 'demo@example.com' && password === 'demo123!') {
      const mockUser = {
        id: 'demo-user-123',
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'tenant' as const,
        created_at: new Date().toISOString()
      }
      
      const mockTokens = {
        access_token: 'mock-access-token-' + Date.now(),
        refresh_token: 'mock-refresh-token-' + Date.now(),
        user: mockUser
      }
      
      // Store everything
      localStorage.setItem(AUTH_TOKEN_KEY, mockTokens.access_token)
      localStorage.setItem(REFRESH_TOKEN_KEY, mockTokens.refresh_token)
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(mockUser))
      
      apiClient.setToken(mockTokens.access_token)
      setUser(mockUser)
      
      router.push('/dashboard')
      return
    }
    
    // Regular login flow
    const response = await apiClient.login(email, password)
    
    // Store everything
    localStorage.setItem(AUTH_TOKEN_KEY, response.access_token)
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token)
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.user))
    
    apiClient.setToken(response.access_token)
    setUser(response.user)
    
    router.push('/dashboard')
  }
  
  const signup = async (name: string, email: string, password: string) => {
    const response = await apiClient.signup(name, email, password)
    
    // Store everything
    localStorage.setItem(AUTH_TOKEN_KEY, response.access_token)
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token)
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.user))
    
    apiClient.setToken(response.access_token)
    setUser(response.user)
    
    router.push('/dashboard')
  }
  
  const logout = async () => {
    try {
      await apiClient.logout()
    } catch {
      // Ignore logout API errors
    }
    
    // Clear everything
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(CURRENT_USER_KEY)
    
    apiClient.setToken(null)
    setUser(null)
    
    router.push('/signin')
  }
  
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        isAuthenticated: !!user,
        login,
        signup, 
        logout,
        updateUser: (updates) => setUser(prev => prev ? {...prev, ...updates} : null)
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}