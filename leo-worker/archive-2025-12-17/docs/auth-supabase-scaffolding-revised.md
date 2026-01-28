# Supabase Auth Integration - Revised Scaffolding Architecture

**Author**: Claude
**Date**: 2025-01-21
**Status**: Revised Design (Scaffolding-First Approach)
**Key Insight**: Maximize scaffolding, minimize generation

---

## Executive Summary

This revised architecture takes a **scaffolding-first approach** where:

1. **80% Scaffolding**: Generic auth components are coded once and added to the template
2. **20% Generation**: Only app-specific auth integration is generated
3. **Same IStorage Interface**: SupabaseStorage implements existing IStorage - no separate code paths
4. **Context Provider Addition**: Added to pipeline between API Client and App Shell stages

**Core Principle**: "If it's the same for every app, it's scaffolding. If it varies per app, it's generated."

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                   Template Scaffolding                        │
│                 (Added Once to Template)                      │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Auth Infrastructure (Generic/Reusable):                      │
│  ├── server/lib/auth/                                         │
│  │   ├── interfaces.ts      (IAuthAdapter interface)         │
│  │   ├── mock-adapter.ts    (MockAuthAdapter class)          │
│  │   ├── supabase-adapter.ts(SupabaseAuthAdapter class)      │
│  │   ├── factory.ts         (createAuthAdapter function)     │
│  │   └── types.ts           (User, Session types)            │
│  ├── server/lib/storage/                                      │
│  │   ├── interfaces.ts      (IStorage interface - existing)  │
│  │   ├── mem-storage.ts     (MemStorage - existing)          │
│  │   ├── supabase-storage.ts(SupabaseStorage - NEW)          │
│  │   └── factory.ts         (createStorage function)         │
│  ├── server/middleware/                                       │
│  │   └── auth.ts            (authMiddleware function)        │
│  ├── server/config/                                           │
│  │   └── env.ts             (Environment config/validation)  │
│  ├── client/src/components/auth/                              │
│  │   └── ProtectedRoute.tsx (Generic wrapper component)      │
│  └── client/src/lib/                                          │
│      └── auth-helpers.ts    (Token management utilities)     │
│                                                                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    Generated Components                       │
│                   (Per-App Customization)                     │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  App-Specific Auth Integration:                               │
│  ├── shared/schema.ts        (+ users table)                  │
│  ├── server/routes/auth.ts   (Auth routes)                    │
│  ├── client/src/contexts/                                     │
│  │   └── AuthContext.tsx     (App-specific user fields)      │
│  ├── client/src/pages/                                        │
│  │   ├── LoginPage.tsx       (App branding)                  │
│  │   └── SignupPage.tsx      (App-specific fields)           │
│  └── client/src/components/layout/                            │
│      └── AppLayout.tsx       (+ Auth UI integration)         │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## Part 1: Template Scaffolding (Code Once, Copy Always)

These components are **100% generic** and will be added to the vite-express template.

### 1.1 Auth Adapter Infrastructure

**Location**: `server/lib/auth/`

#### interfaces.ts
```typescript
export interface IAuthAdapter {
  verifyToken(token: string): Promise<User | null>
  createSession(credentials: LoginCredentials): Promise<AuthSession>
  refreshSession(refreshToken: string): Promise<AuthSession>
  destroySession(token: string): Promise<void>
  getCurrentUser(token: string): Promise<User | null>
  signUp(credentials: SignUpCredentials): Promise<AuthSession>
  validateApiKey?(key: string): Promise<User | null> // Optional for API keys
}
```

#### mock-adapter.ts
```typescript
import { IAuthAdapter, User, AuthSession, LoginCredentials, SignUpCredentials } from './interfaces'

export class MockAuthAdapter implements IAuthAdapter {
  private mockUser: User = {
    id: 'mock-user-001',
    email: 'demo@example.com',
    name: 'Demo User',
    role: 'user',
    createdAt: new Date().toISOString()
  }

  async verifyToken(token: string): Promise<User | null> {
    // Accept any token in mock mode
    return this.mockUser
  }

  async createSession(credentials: LoginCredentials): Promise<AuthSession> {
    // Always succeed with mock user
    return {
      user: this.mockUser,
      accessToken: 'mock-token-' + Date.now(),
      refreshToken: 'mock-refresh-' + Date.now(),
      expiresAt: Date.now() + 3600000
    }
  }

  async getCurrentUser(token: string): Promise<User | null> {
    return this.mockUser
  }

  async signUp(credentials: SignUpCredentials): Promise<AuthSession> {
    return this.createSession(credentials)
  }

  async refreshSession(refreshToken: string): Promise<AuthSession> {
    return this.createSession({ email: 'demo@example.com', password: 'mock' })
  }

  async destroySession(token: string): Promise<void> {
    // No-op in mock mode
  }
}
```

#### supabase-adapter.ts
```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { IAuthAdapter, User, AuthSession, LoginCredentials, SignUpCredentials } from './interfaces'

export class SupabaseAuthAdapter implements IAuthAdapter {
  private supabase: SupabaseClient

  constructor() {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_KEY

    if (!url || !key) {
      throw new Error('Supabase configuration missing. Set SUPABASE_URL and SUPABASE_SERVICE_KEY')
    }

    this.supabase = createClient(url, key)
  }

  async verifyToken(token: string): Promise<User | null> {
    const { data, error } = await this.supabase.auth.getUser(token)

    if (error || !data.user) {
      return null
    }

    return {
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata?.name || data.user.email!,
      role: data.user.user_metadata?.role || 'user',
      createdAt: data.user.created_at
    }
  }

  async createSession(credentials: LoginCredentials): Promise<AuthSession> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    })

    if (error || !data.session) {
      throw new Error(error?.message || 'Login failed')
    }

    return {
      user: await this.mapUser(data.user),
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at! * 1000
    }
  }

  async signUp(credentials: SignUpCredentials): Promise<AuthSession> {
    const { data, error } = await this.supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: credentials.name
        }
      }
    })

    if (error || !data.session) {
      throw new Error(error?.message || 'Signup failed')
    }

    return {
      user: await this.mapUser(data.user!),
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at! * 1000
    }
  }

  async refreshSession(refreshToken: string): Promise<AuthSession> {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken
    })

    if (error || !data.session) {
      throw new Error('Session refresh failed')
    }

    return {
      user: await this.mapUser(data.user!),
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at! * 1000
    }
  }

  async getCurrentUser(token: string): Promise<User | null> {
    return this.verifyToken(token)
  }

  async destroySession(token: string): Promise<void> {
    await this.supabase.auth.signOut()
  }

  private async mapUser(supabaseUser: any): Promise<User> {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      name: supabaseUser.user_metadata?.name || supabaseUser.email!,
      role: supabaseUser.user_metadata?.role || 'user',
      createdAt: supabaseUser.created_at
    }
  }
}
```

#### factory.ts
```typescript
import { IAuthAdapter } from './interfaces'
import { MockAuthAdapter } from './mock-adapter'
import { SupabaseAuthAdapter } from './supabase-adapter'

let authAdapterInstance: IAuthAdapter | null = null

export function createAuthAdapter(): IAuthAdapter {
  if (!authAdapterInstance) {
    const mode = process.env.AUTH_MODE || 'mock'

    switch (mode) {
      case 'mock':
        authAdapterInstance = new MockAuthAdapter()
        break
      case 'supabase':
        authAdapterInstance = new SupabaseAuthAdapter()
        break
      default:
        throw new Error(`Unknown AUTH_MODE: ${mode}`)
    }

    console.log(`🔐 Auth Mode: ${mode.toUpperCase()}`)
  }

  return authAdapterInstance
}
```

### 1.2 Storage Infrastructure (Using SAME IStorage Interface)

**Key Insight**: SupabaseStorage implements the EXISTING IStorage interface - no separate code paths!

**Location**: `server/lib/storage/`

#### supabase-storage.ts
```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { IStorage } from './interfaces' // EXISTING interface!

export class SupabaseStorage implements IStorage {
  private supabase: SupabaseClient

  constructor() {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_KEY

    if (!url || !key) {
      throw new Error('Supabase configuration missing')
    }

    this.supabase = createClient(url, key)
  }

  async create<T extends Record<string, any>>(
    table: string,
    data: T
  ): Promise<T & { id: string }> {
    const { data: result, error } = await this.supabase
      .from(table)
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return result
  }

  async findById<T extends Record<string, any>>(
    table: string,
    id: string
  ): Promise<(T & { id: string }) | null> {
    const { data, error } = await this.supabase
      .from(table)
      .select()
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || null
  }

  async findMany<T extends Record<string, any>>(
    table: string,
    filters: Record<string, any> = {}
  ): Promise<(T & { id: string })[]> {
    let query = this.supabase.from(table).select()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        query = query.eq(key, value)
      }
    })

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async update<T extends Record<string, any>>(
    table: string,
    id: string,
    data: Partial<T>
  ): Promise<T & { id: string }> {
    const { data: result, error } = await this.supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return result
  }

  async delete(table: string, id: string): Promise<void> {
    const { error } = await this.supabase
      .from(table)
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async query<T extends Record<string, any>>(
    table: string,
    options: {
      where?: Record<string, any>
      orderBy?: { field: string; direction?: 'asc' | 'desc' }
      limit?: number
      offset?: number
    } = {}
  ): Promise<(T & { id: string })[]> {
    let query = this.supabase.from(table).select()

    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    if (options.orderBy) {
      query = query.order(
        options.orderBy.field,
        { ascending: options.orderBy.direction === 'asc' }
      )
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }
}
```

#### factory.ts (Enhanced)
```typescript
import { IStorage } from './interfaces'
import { MemStorage } from './mem-storage' // Existing
import { SupabaseStorage } from './supabase-storage' // New

let storageInstance: IStorage | null = null

export function createStorage(): IStorage {
  if (!storageInstance) {
    const mode = process.env.STORAGE_MODE || 'memory'

    switch (mode) {
      case 'memory':
        storageInstance = new MemStorage()
        break
      case 'supabase':
        storageInstance = new SupabaseStorage()
        break
      default:
        throw new Error(`Unknown STORAGE_MODE: ${mode}`)
    }

    console.log(`💾 Storage Mode: ${mode.toUpperCase()}`)
  }

  return storageInstance
}
```

### 1.3 Auth Middleware (Generic)

**Location**: `server/middleware/auth.ts`

```typescript
import { Request, Response, NextFunction } from 'express'
import { createAuthAdapter } from '../lib/auth/factory'

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

export function authMiddleware() {
  const authAdapter = createAuthAdapter()

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract token from Authorization header or cookie
      const authHeader = req.headers.authorization
      const token = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : req.cookies?.auth_token

      if (!token) {
        return res.status(401).json({ error: 'No token provided' })
      }

      const user = await authAdapter.verifyToken(token)

      if (!user) {
        return res.status(401).json({ error: 'Invalid token' })
      }

      // Attach user to request
      req.user = user
      next()
    } catch (error) {
      console.error('Auth middleware error:', error)
      res.status(401).json({ error: 'Authentication failed' })
    }
  }
}

// Optional: Role-based middleware
export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: `${role} access required` })
    }
    next()
  }
}
```

### 1.4 Environment Configuration

**Location**: `server/config/env.ts`

```typescript
export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),

  auth: {
    mode: process.env.AUTH_MODE || 'mock',
    sessionSecret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  storage: {
    mode: process.env.STORAGE_MODE || 'memory'
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY
  },

  validate() {
    // Warn about insecure configurations
    if (this.nodeEnv === 'production') {
      if (this.auth.mode === 'mock') {
        console.error('🚨 CRITICAL: Running production with mock auth!')
        console.error('   This is EXTREMELY insecure!')
        console.error('   Set AUTH_MODE=supabase for production')

        // Give time to see the warning
        const delay = 10000
        console.error(`   Starting anyway in ${delay/1000} seconds...`)

        // Block startup to ensure warning is seen
        const start = Date.now()
        while (Date.now() - start < delay) {
          // Busy wait to ensure message is visible
        }
      }

      if (this.storage.mode === 'memory') {
        console.warn('⚠️  WARNING: Using in-memory storage in production!')
        console.warn('   Data will be lost on restart!')
      }
    }

    // Validate required Supabase config
    if (this.auth.mode === 'supabase' && !this.supabase.url) {
      throw new Error('SUPABASE_URL required when AUTH_MODE=supabase')
    }

    if (this.storage.mode === 'supabase' && !this.supabase.url) {
      throw new Error('SUPABASE_URL required when STORAGE_MODE=supabase')
    }

    // Log configuration (excluding secrets)
    console.log('🔧 Configuration:')
    console.log(`   Environment: ${this.nodeEnv}`)
    console.log(`   Auth Mode: ${this.auth.mode}`)
    console.log(`   Storage Mode: ${this.storage.mode}`)

    if (this.supabase.url) {
      console.log(`   Supabase: ${this.supabase.url}`)
    }
  }
}

// Validate on import
config.validate()
```

### 1.5 Protected Route Component

**Location**: `client/src/components/auth/ProtectedRoute.tsx`

```typescript
import React from 'react'
import { Navigate } from 'wouter'
import { useAuth } from '../../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireRole?: string
  fallback?: string
}

export function ProtectedRoute({
  children,
  requireRole,
  fallback = '/login'
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to={fallback} replace />
  }

  if (requireRole && user.role !== requireRole) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
```

### 1.6 Auth Helper Utilities

**Location**: `client/src/lib/auth-helpers.ts`

```typescript
export const authHelpers = {
  // Token management
  setToken(token: string) {
    localStorage.setItem('auth_token', token)
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token')
  },

  clearToken() {
    localStorage.removeItem('auth_token')
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },

  // Session management
  setSession(session: any) {
    this.setToken(session.accessToken)
    if (session.refreshToken) {
      localStorage.setItem('refresh_token', session.refreshToken)
    }
  },

  clearSession() {
    this.clearToken()
    localStorage.removeItem('refresh_token')
  },

  // Development helpers
  isDevelopment(): boolean {
    return import.meta.env.MODE === 'development'
  },

  getMockCredentials() {
    if (this.isDevelopment()) {
      return {
        email: 'demo@example.com',
        password: 'password'
      }
    }
    return null
  }
}
```

### 1.7 Template Files (.env.example)

**Location**: `.env.example`

```bash
# Server Configuration
NODE_ENV=development
PORT=5000

# Auth Configuration
# Options: "mock" (development) | "supabase" (production)
AUTH_MODE=mock

# Storage Configuration
# Options: "memory" (development) | "supabase" (production)
STORAGE_MODE=memory

# Supabase Configuration (Production Only)
# Get these from: https://app.supabase.com/project/_/settings/api
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# Session Configuration
SESSION_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5000
```

---

## Part 2: Generated Components (App-Specific)

These components are generated by agents based on the specific app requirements.

### 2.1 Enhanced Schema Generation

The Schema Generator Agent needs a minor update to ALWAYS include a users table:

**Agent**: SchemaGeneratorAgent
**Modification**: Add users table to every schema

```typescript
// Always generated in schema.ts
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull().default('user'),
  // App-specific fields can be added here
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// All user-owned entities get userId
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  // ... other fields
})
```

### 2.2 Auth Routes Generation

**Agent**: RoutesGeneratorAgent
**New File**: `server/routes/auth.ts`

```typescript
import { Router } from 'express'
import { createAuthAdapter } from '../lib/auth/factory'
import { authMiddleware } from '../middleware/auth'

const router = Router()
const authAdapter = createAuthAdapter()

// Public routes
router.post('/api/auth/login', async (req, res) => {
  try {
    const session = await authAdapter.createSession(req.body)
    res.json(session)
  } catch (error) {
    res.status(401).json({ error: 'Invalid credentials' })
  }
})

router.post('/api/auth/signup', async (req, res) => {
  try {
    const session = await authAdapter.signUp(req.body)
    res.json(session)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Protected routes
router.post('/api/auth/logout', authMiddleware(), async (req, res) => {
  const token = req.headers.authorization?.slice(7)
  if (token) {
    await authAdapter.destroySession(token)
  }
  res.json({ success: true })
})

router.get('/api/auth/me', authMiddleware(), (req, res) => {
  res.json({ user: req.user })
})

export default router
```

### 2.3 Context Provider Generation (NEW STAGE)

**NEW Agent**: ContextProviderGeneratorAgent
**Position**: Between API Client Generation and App Shell Generation
**Output**: `client/src/contexts/AuthContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiClient } from '../lib/api-client'
import { authHelpers } from '../lib/auth-helpers'

// App-specific user type (generated based on schema)
interface User {
  id: string
  email: string
  name: string
  role: string
  // App-specific fields added here
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>(null!)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  async function checkSession() {
    const token = authHelpers.getToken()

    if (!token) {
      // In development mode with mock auth, auto-login
      if (authHelpers.isDevelopment() && !token) {
        const mockCreds = authHelpers.getMockCredentials()
        if (mockCreds) {
          try {
            await login(mockCreds.email, mockCreds.password)
            return
          } catch (error) {
            console.log('Mock auto-login not available')
          }
        }
      }

      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const { user } = await response.json()
        setUser(user)
      } else {
        authHelpers.clearToken()
      }
    } catch (error) {
      console.error('Session check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  async function login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      throw new Error('Login failed')
    }

    const session = await response.json()
    authHelpers.setSession(session)
    setUser(session.user)
  }

  async function signup(email: string, password: string, name: string) {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Signup failed')
    }

    const session = await response.json()
    authHelpers.setSession(session)
    setUser(session.user)
  }

  async function logout() {
    const token = authHelpers.getToken()

    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
    }

    authHelpers.clearSession()
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    refreshSession: checkSession
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

---

## Part 3: Pipeline Integration

### Updated Pipeline Stages

```
Current Pipeline:
1. Plan Stage
2. Build Stage:
   2.1 Backend Spec Generation
   2.2 Main Build:
       1. Schema Generation
       2. Storage Generation
       3. Routes Generation
       4. API Client Generation
       5. App Shell Generation
       6. FIS Master Spec Generation
       7. Layout Generation
       8. Frontend Implementation
3. Validator Stage

REVISED Pipeline:
1. Plan Stage
2. Build Stage:
   2.1 Backend Spec Generation
   2.2 Main Build:
       1. Schema Generation (ENHANCED: adds users table)
       2. Storage Generation (uses enhanced factory)
       3. Routes Generation (ENHANCED: adds auth routes)
       4. API Client Generation (ENHANCED: adds auth headers)
       5. Context Provider Generation (NEW: AuthContext)
       6. App Shell Generation (ENHANCED: wraps with AuthProvider)
       7. FIS Master Spec Generation
       8. Layout Generation (ENHANCED: adds auth UI)
       9. Frontend Implementation (ENHANCED: protected routes)
3. Validator Stage
```

### Agent Modifications Summary

| Agent | Change Level | Modifications |
|-------|-------------|--------------|
| SchemaGeneratorAgent | MINOR | Add users table to all schemas |
| StorageGeneratorAgent | NONE | Uses factory from scaffolding |
| RoutesGeneratorAgent | MINOR | Generate auth routes, apply middleware |
| TsRestApiClientGeneratorAgent | MINOR | Add auth headers to requests |
| **ContextProviderGeneratorAgent** | **NEW** | Generate AuthContext |
| AppShellGeneratorAgent | MINOR | Wrap with AuthProvider |
| LayoutGeneratorAgent | MINOR | Add user menu/auth UI |
| FrontendImplementationAgent | MINOR | Generate login/signup pages |

### Template Update Process

1. **Create new template version**: `vite-express-template-v3.0.0-auth.tar.gz`
2. **Add scaffolding files**:
   ```
   server/lib/auth/
   server/lib/storage/supabase-storage.ts
   server/lib/storage/factory.ts
   server/middleware/auth.ts
   server/config/env.ts
   client/src/components/auth/ProtectedRoute.tsx
   client/src/lib/auth-helpers.ts
   .env.example
   ```
3. **Update package.json dependencies**:
   ```json
   {
     "dependencies": {
       "@supabase/supabase-js": "^2.39.0"
     }
   }
   ```

---

## Testing Strategy

### Development Mode (AI Agents)

```typescript
// AI agents test without auth barriers
describe('AI Agent Testing', () => {
  beforeEach(() => {
    process.env.AUTH_MODE = 'mock'
    process.env.STORAGE_MODE = 'memory'
  })

  it('should access protected routes immediately', async () => {
    // No login needed - mock auth accepts everything
    const response = await fetch('/api/users/me')
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.user.email).toBe('demo@example.com')
  })

  it('should use in-memory storage', async () => {
    const storage = createStorage()
    const user = await storage.create('users', {
      email: 'test@example.com',
      name: 'Test User'
    })

    expect(user.id).toBeDefined()

    // Data is in memory
    const found = await storage.findById('users', user.id)
    expect(found).toEqual(user)
  })
})
```

### Production Mode Testing

```bash
# Set production environment
export AUTH_MODE=supabase
export STORAGE_MODE=supabase
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_KEY=your-service-key

# Test real auth flow
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!","name":"Test User"}'

# Response includes JWT
# {"user":{...},"accessToken":"eyJ...","refreshToken":"..."}
```

---

## Migration Path

### Phase 1: Template Update (Week 1)
1. Add scaffolding files to template
2. Update package.json dependencies
3. Test template extraction
4. Release v3.0.0-auth template

### Phase 2: Agent Updates (Week 2-3)
1. Update SchemaGeneratorAgent (add users table)
2. Create ContextProviderGeneratorAgent
3. Update RoutesGeneratorAgent (auth routes)
4. Update AppShellGeneratorAgent (AuthProvider wrap)
5. Update LayoutGeneratorAgent (auth UI)

### Phase 3: Testing & Validation (Week 4)
1. Test with mock auth (AI agents work)
2. Test with Supabase auth (production ready)
3. Validate existing apps still work
4. Document migration for existing apps

---

## Key Benefits of Revised Architecture

### 1. Minimal Generation Required
- 80% of auth code is in scaffolding
- Agents only generate app-specific parts
- Faster pipeline execution
- More consistent auth implementation

### 2. Same IStorage Interface
- No separate code paths
- Business logic unchanged
- Factory pattern handles switching
- Clean abstraction

### 3. Zero Impact on AI Testing
- Mock mode by default
- No auth barriers
- Predictable behavior
- Fast testing

### 4. Production Ready
- Supabase integration built-in
- Environment-based switching
- Security best practices
- Clear warnings for misconfigurations

### 5. Easy Maintenance
- Scaffolding updated in one place
- Template versioning
- Clear separation of concerns
- Well-documented interfaces

---

## Conclusion

This revised architecture maximizes reusability through scaffolding while minimizing what needs to be generated. The key insights are:

1. **Generic auth code is scaffolding** - MockAuthAdapter, SupabaseAuthAdapter, middleware, etc.
2. **Same IStorage interface** - No separate code paths, just different implementations
3. **Context Provider is a new stage** - Added between API Client and App Shell
4. **Minimal agent changes** - Most agents need minor updates, only one new agent

The result is a simpler, more maintainable architecture that:
- ✅ Works immediately for AI testing (mock mode)
- ✅ Scales to production (Supabase mode)
- ✅ Requires minimal code generation
- ✅ Maintains backward compatibility
- ✅ Provides clear upgrade path

**Timeline**: 4 weeks (reduced from 8 weeks due to scaffolding approach)
- Week 1: Template update with scaffolding
- Week 2-3: Agent modifications
- Week 4: Testing and documentation

This approach ensures every Leonardo-generated app has production-ready auth with minimal generation overhead and zero impact on AI testing workflows.