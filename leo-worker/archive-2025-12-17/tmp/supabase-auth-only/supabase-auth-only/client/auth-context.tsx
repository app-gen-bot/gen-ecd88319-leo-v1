/**
 * Auth-Only React Context for Supabase
 * 
 * Provides authentication state and methods throughout the React app.
 * Does NOT include database operations - use your existing database solution.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient, SupabaseAuthClient } from './supabase-auth-client'

// Types
interface User {
  id: string
  email: string
  user_metadata?: {
    name?: string
    avatar_url?: string
    [key: string]: any
  }
  app_metadata?: {
    provider?: string
    [key: string]: any
  }
}

interface Session {
  access_token: string
  refresh_token?: string
  expires_at?: number
  user: User
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signUp: (email: string, password: string, options?: any) => Promise<{ error?: any }>
  signOut: () => Promise<{ error?: any }>
  signInWithOAuth: (provider: string) => Promise<{ error?: any }>
  updateProfile: (updates: Partial<User>) => Promise<{ error?: any }>
  resetPassword: (email: string) => Promise<{ error?: any }>
  // Note: No database client exposed - use your existing database solution
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Initialize Supabase auth client
const supabase = createClient(
  import.meta.env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  import.meta.env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

/**
 * Auth Provider Component
 * 
 * Wrap your app with this provider to enable authentication throughout.
 * For database operations, use your existing database solution.
 * 
 * Usage:
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('[Auth Context] Error getting session:', error)
        } else {
          setSession(session)
          setUser(session?.user || null)
        }
      } catch (error) {
        console.error('[Auth Context] Session initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth Context] Auth state changed:', event)
      
      setSession(session)
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('[Auth Context] Sign in error:', error)
        return { error }
      }

      console.log('[Auth Context] Sign in successful')
      return { error: null }
    } catch (error) {
      console.error('[Auth Context] Sign in exception:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, options?: any) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options
      })

      if (error) {
        console.error('[Auth Context] Sign up error:', error)
        return { error }
      }

      console.log('[Auth Context] Sign up successful')
      return { error: null }
    } catch (error) {
      console.error('[Auth Context] Sign up exception:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('[Auth Context] Sign out error:', error)
        return { error }
      }

      console.log('[Auth Context] Sign out successful')
      return { error: null }
    } catch (error) {
      console.error('[Auth Context] Sign out exception:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // OAuth sign in
  const signInWithOAuth = async (provider: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as any
      })

      if (error) {
        console.error('[Auth Context] OAuth sign in error:', error)
        return { error }
      }

      console.log('[Auth Context] OAuth sign in initiated')
      return { error: null }
    } catch (error) {
      console.error('[Auth Context] OAuth sign in exception:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // Update user profile
  const updateProfile = async (updates: Partial<User>) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      })

      if (error) {
        console.error('[Auth Context] Profile update error:', error)
        return { error }
      }

      console.log('[Auth Context] Profile updated successfully')
      return { error: null }
    } catch (error) {
      console.error('[Auth Context] Profile update exception:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)

      if (error) {
        console.error('[Auth Context] Password reset error:', error)
        return { error }
      }

      console.log('[Auth Context] Password reset email sent')
      return { error: null }
    } catch (error) {
      console.error('[Auth Context] Password reset exception:', error)
      return { error }
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    updateProfile,
    resetPassword
    // Note: No database client exposed - use your existing database solution
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to use auth context
 * 
 * Usage:
 * const { user, signIn, signOut } = useAuth()
 */
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

/**
 * Higher-order component for protected routes
 * 
 * Usage:
 * const ProtectedComponent = withAuth(MyComponent)
 */
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth()

    if (loading) {
      return <div className="flex items-center justify-center p-8">Loading...</div>
    }

    if (!user) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600">Please sign in to access this page.</p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}

/**
 * Component for conditional rendering based on auth state
 */
interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, fallback, requireAuth = true }: AuthGuardProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  const isAuthenticated = !!user

  if (requireAuth && !isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access this content.</p>
        </div>
      </div>
    )
  }

  if (!requireAuth && isAuthenticated) {
    return fallback || null
  }

  return <>{children}</>
}

/**
 * Utility hooks for common auth patterns
 */

// Hook to check if user is authenticated
export function useIsAuthenticated() {
  const { user, loading } = useAuth()
  return { isAuthenticated: !!user, loading }
}

// Hook to get current user
export function useUser() {
  const { user, loading } = useAuth()
  return { user, loading }
}

// Hook to get auth methods only
export function useAuthActions() {
  const { signIn, signUp, signOut, signInWithOAuth, updateProfile, resetPassword } = useAuth()
  return { signIn, signUp, signOut, signInWithOAuth, updateProfile, resetPassword }
}

/**
 * Development helper component
 */
export function AuthDebugInfo() {
  const { user, session, loading } = useAuth()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-xs">
      <div className="font-bold mb-2">Auth Debug (Auth Only)</div>
      <div>Loading: {loading ? 'Yes' : 'No'}</div>
      <div>User: {user ? user.email : 'None'}</div>
      <div>Provider: {user?.app_metadata?.provider || 'N/A'}</div>
      <div>Session: {session ? 'Active' : 'None'}</div>
      <div className="mt-2 text-xs text-gray-300">
        Database: Use your existing solution
      </div>
    </div>
  )
}