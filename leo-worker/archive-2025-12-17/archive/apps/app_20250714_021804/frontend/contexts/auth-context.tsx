'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { User, Family } from '@/lib/types'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

interface AuthContextValue {
  user: User | null
  family: Family | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (data: any) => Promise<void>
  signOut: () => Promise<void>
  updateUser: (user: User) => void
  updateFamily: (family: Family) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [family, setFamily] = useState<Family | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        try {
          apiClient.setToken(token)
          const session = await apiClient.getSession()
          if (session.valid && session.user && session.family) {
            setUser(session.user)
            setFamily(session.family)
          } else {
            handleLogout()
          }
        } catch (error) {
          handleLogout()
        }
      }
      setIsLoading(false)
    }

    restoreSession()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('current_user')
    localStorage.removeItem('current_family')
    apiClient.setToken(null)
    setUser(null)
    setFamily(null)
  }

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.signIn(email, password)
      setUser(response.user)
      setFamily(response.family)
      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (error: any) {
      if (error.code === 'INVALID_CREDENTIALS') {
        throw new Error('Invalid email or password')
      }
      throw error
    }
  }

  const signUp = async (data: any) => {
    try {
      const response = await apiClient.signUp(data)
      setUser(response.user)
      setFamily(response.family)
      toast.success('Welcome to LoveyTasks!')
      router.push('/dashboard')
    } catch (error: any) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      await apiClient.signOut()
    } catch (error) {
      // Continue with local logout
    }
    handleLogout()
    router.push('/signin')
  }

  const updateUser = (user: User) => {
    setUser(user)
    localStorage.setItem('current_user', JSON.stringify(user))
  }

  const updateFamily = (family: Family) => {
    setFamily(family)
    localStorage.setItem('current_family', JSON.stringify(family))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        family,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateUser,
        updateFamily,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthCheck({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/signin')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}