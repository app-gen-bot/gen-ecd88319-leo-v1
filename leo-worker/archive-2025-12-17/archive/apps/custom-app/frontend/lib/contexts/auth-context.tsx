"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import type { User, Property } from '@/lib/types'
import { CURRENT_USER_KEY, CURRENT_PROPERTY_KEY } from '@/lib/constants'

interface AuthContextValue {
  user: User | null
  currentProperty: Property | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string
    password: string
    first_name: string
    last_name: string
    user_type: 'tenant' | 'landlord' | 'property_manager'
    phone?: string
  }) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
  setCurrentProperty: (property: Property | null) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const router = useRouter()

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Restore session on mount (after hydration)
  useEffect(() => {
    if (!isHydrated) return

    const restoreSession = async () => {
      // Check if user is already logged in from localStorage
      const savedUser = localStorage.getItem(CURRENT_USER_KEY)
      const savedProperty = localStorage.getItem(CURRENT_PROPERTY_KEY)
      
      if (savedUser && savedProperty) {
        setUser(JSON.parse(savedUser))
        setCurrentProperty(JSON.parse(savedProperty))
      }
      
      setIsLoading(false)
    }

    restoreSession()
  }, [isHydrated])

  const login = async (email: string, password: string) => {
    // DEMO MODE: Accept specific credentials
    if (email === 'tenant@demo.com' && password === 'demo123') {
      const tenantUser: User = {
        id: '1',
        email: 'tenant@demo.com',
        first_name: 'Demo',
        last_name: 'Tenant',
        full_name: 'Demo Tenant',
        user_type: 'tenant',
        subscription_tier: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const tenantProperty: Property = {
        id: '1',
        user_id: '1',
        address: '123 Demo Street',
        unit_number: 'Apt 4B',
        property_type: 'apartment',
        bedrooms: 2,
        bathrooms: 1,
        monthly_rent: 2000,
        move_in_date: '2024-01-01',
        landlord_name: 'John Landlord',
        landlord_email: 'landlord@demo.com',
        landlord_phone: '555-0123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setUser(tenantUser)
      setCurrentProperty(tenantProperty)
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(tenantUser))
      localStorage.setItem(CURRENT_PROPERTY_KEY, JSON.stringify(tenantProperty))
      router.push('/dashboard')
      return
    } else if (email === 'landlord@demo.com' && password === 'demo123') {
      const landlordUser: User = {
        id: '2',
        email: 'landlord@demo.com',
        first_name: 'John',
        last_name: 'Landlord',
        full_name: 'John Landlord',
        user_type: 'landlord',
        subscription_tier: 'pro',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const landlordProperty: Property = {
        id: '1',
        user_id: '2',
        address: '123 Demo Street',
        unit_number: 'Apt 4B',
        property_type: 'apartment',
        bedrooms: 2,
        bathrooms: 1,
        monthly_rent: 2000,
        move_in_date: '2024-01-01',
        landlord_name: 'John Landlord',
        landlord_email: 'landlord@demo.com',
        landlord_phone: '555-0123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setUser(landlordUser)
      setCurrentProperty(landlordProperty)
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(landlordUser))
      localStorage.setItem(CURRENT_PROPERTY_KEY, JSON.stringify(landlordProperty))
      router.push('/dashboard')
      return
    } else {
      // Invalid credentials
      throw new ApiError('Invalid email or password', 'INVALID_CREDENTIALS')
    }
    
    // Original API call code (commented out for demo)
    /*
    const response = await apiClient.login(email, password)
    setUser(response.user)
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.user))
    
    // Load properties after login
    try {
      const properties = await apiClient.getProperties()
      if (properties.length > 0) {
        setCurrentProperty(properties[0])
        localStorage.setItem(CURRENT_PROPERTY_KEY, JSON.stringify(properties[0]))
      }
    } catch (error) {
      console.error('Failed to load properties:', error)
    }
    
    // Navigate to dashboard after successful login
    router.push('/dashboard')
    */
  }

  const register = async (data: {
    email: string
    password: string
    first_name: string
    last_name: string
    user_type: 'tenant' | 'landlord' | 'property_manager'
    phone?: string
  }) => {
    const response = await apiClient.register(data)
    setUser(response.user)
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.user))
    
    // Navigate to onboarding for property setup
    router.push('/onboarding')
  }

  const logout = async () => {
    try {
      await apiClient.logout()
    } finally {
      setUser(null)
      setCurrentProperty(null)
      localStorage.removeItem(CURRENT_USER_KEY)
      localStorage.removeItem(CURRENT_PROPERTY_KEY)
      router.push('/')
    }
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser))
  }

  const setCurrentPropertyHandler = (property: Property | null) => {
    setCurrentProperty(property)
    if (property) {
      localStorage.setItem(CURRENT_PROPERTY_KEY, JSON.stringify(property))
    } else {
      localStorage.removeItem(CURRENT_PROPERTY_KEY)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        currentProperty,
        isLoading,
        login,
        signIn: login, // Alias for compatibility
        register,
        logout,
        updateUser,
        setCurrentProperty: setCurrentPropertyHandler,
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