/**
 * Pure Auth Express Middleware for Supabase
 * 
 * Handles ONLY authentication - validates tokens and provides user info.
 * Does NOT include database operations - use your existing database solution.
 */

import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// Extended Request interface with user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role?: string
    aud?: string
    [key: string]: any
  }
}

// Mock user for development
const MOCK_USER = {
  id: 'demo-user-123',
  email: 'demo@example.com',
  role: 'authenticated',
  aud: 'authenticated',
  app_metadata: {
    provider: 'mock'
  },
  user_metadata: {
    name: 'Demo User'
  }
}

/**
 * Main authentication middleware
 * 
 * Validates auth tokens and provides user information.
 * Use this with your existing database solution.
 * 
 * Usage:
 * app.use('/api', authMiddleware)
 * 
 * Or for specific routes:
 * app.get('/api/profile', authMiddleware, (req, res) => {
 *   const user = req.user
 *   // Use your database solution here
 *   const data = await yourDB.query('SELECT * FROM profiles WHERE id = ?', [user.id])
 *   res.json(data)
 * })
 */
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  
  if (!authHeader) {
    return res.status(401).json({ 
      error: 'Missing authorization header',
      code: 'MISSING_AUTH_HEADER'
    })
  }

  const token = authHeader.replace('Bearer ', '')
  
  // Handle mock tokens
  if (token === 'mock-access-token' || token.startsWith('mock')) {
    console.log('🎭 [Auth Middleware] Mock token detected, using demo user')
    req.user = MOCK_USER
    return next()
  }

  // Handle real Supabase JWTs
  try {
    const decoded = verifySupabaseJWT(token)
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      aud: decoded.aud,
      ...decoded
    }
    
    console.log('✅ [Auth Middleware] Valid JWT for user:', req.user.email)
    next()
  } catch (error) {
    console.error('❌ [Auth Middleware] JWT verification failed:', error)
    return res.status(401).json({ 
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    })
  }
}

/**
 * Optional authentication middleware
 * 
 * Sets user if token is valid, but doesn't require authentication.
 * Useful for routes that work for both authenticated and anonymous users.
 * 
 * Usage:
 * app.get('/api/public-data', optionalAuthMiddleware, (req, res) => {
 *   const user = req.user // May be null
 *   // Use your database solution
 *   const data = await yourDB.getPublicData(user?.id)
 *   res.json(data)
 * })
 */
export function optionalAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  
  if (!authHeader) {
    // No auth header, continue without user
    return next()
  }

  const token = authHeader.replace('Bearer ', '')
  
  // Handle mock tokens
  if (token === 'mock-access-token' || token.startsWith('mock')) {
    req.user = MOCK_USER
    return next()
  }

  // Try to verify real JWT, but don't fail if invalid
  try {
    const decoded = verifySupabaseJWT(token)
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      aud: decoded.aud,
      ...decoded
    }
  } catch (error) {
    console.log('⚠️ [Auth Middleware] Invalid token, continuing without user')
  }
  
  next()
}

/**
 * Role-based authorization middleware factory
 * 
 * Usage:
 * app.get('/api/admin-data', authMiddleware, requireRole('admin'), (req, res) => {
 *   // User guaranteed to have admin role
 *   // Use your database solution for admin data
 *   const adminData = await yourDB.getAdminData()
 *   res.json(adminData)
 * })
 */
export function requireRole(role: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      })
    }

    // In mock mode, allow all roles for demo purposes
    if (req.user.app_metadata?.provider === 'mock') {
      console.log(`🎭 [Auth Middleware] Mock mode: allowing ${role} access`)
      return next()
    }

    // Check role in user metadata or app metadata
    const userRole = req.user.role || req.user.app_metadata?.role || 'user'
    
    if (userRole !== role && userRole !== 'admin') { // Admin can access everything
      return res.status(403).json({ 
        error: `Required role: ${role}`,
        code: 'INSUFFICIENT_PERMISSIONS'
      })
    }

    next()
  }
}

/**
 * Verify Supabase JWT token
 */
function verifySupabaseJWT(token: string) {
  const jwtSecret = process.env.SUPABASE_JWT_SECRET
  
  if (!jwtSecret) {
    throw new Error('SUPABASE_JWT_SECRET environment variable is required for JWT verification')
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as any
    
    // Validate required claims
    if (!decoded.sub || !decoded.email) {
      throw new Error('Token missing required claims')
    }

    return decoded
  } catch (error) {
    throw new Error(`JWT verification failed: ${error}`)
  }
}

/**
 * Utility to get user from request
 */
export function getUser(req: AuthenticatedRequest) {
  return req.user || null
}

/**
 * Utility to require authenticated user
 */
export function requireUser(req: AuthenticatedRequest) {
  if (!req.user) {
    throw new Error('Authentication required')
  }
  return req.user
}

/**
 * Environment setup validation
 */
export function validateAuthEnvironment() {
  const issues: string[] = []
  
  // Check if we're in mock mode (no JWT secret needed)
  const isProductionMode = process.env.NODE_ENV === 'production'
  const hasJwtSecret = !!process.env.SUPABASE_JWT_SECRET
  
  if (isProductionMode && !hasJwtSecret) {
    issues.push('SUPABASE_JWT_SECRET is required in production')
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    mode: hasJwtSecret ? 'production' : 'development',
    message: issues.length === 0 
      ? 'Auth environment configuration is valid'
      : `Configuration issues: ${issues.join(', ')}`
  }
}

/**
 * Development helper to log auth state
 */
export function logAuthState(req: AuthenticatedRequest) {
  const user = req.user
  
  if (!user) {
    console.log('👤 [Auth] No authenticated user')
    return
  }
  
  console.log('👤 [Auth] User:', {
    id: user.id,
    email: user.email,
    role: user.role,
    provider: user.app_metadata?.provider || 'supabase'
  })
}

/**
 * CORS helper for Supabase
 */
export function supabaseCors() {
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin
    
    // Allow requests from localhost and Supabase
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173', // Vite default
      'http://localhost:4173', // Vite preview
      'https://app.supabase.com',
      process.env.FRONTEND_URL
    ].filter(Boolean)
    
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin)
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    res.header('Access-Control-Allow-Credentials', 'true')
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200)
    } else {
      next()
    }
  }
}

/**
 * Get auth token from request (utility)
 */
export function getAuthToken(req: Request): string | null {
  const authHeader = req.headers.authorization
  if (!authHeader) return null
  
  return authHeader.replace('Bearer ', '')
}

/**
 * Check if request is using mock auth
 */
export function isMockAuth(req: AuthenticatedRequest): boolean {
  return req.user?.app_metadata?.provider === 'mock'
}

/**
 * Create auth response helpers
 */
export function authErrorResponse(code: string, message: string, status = 401) {
  return {
    status,
    body: { error: message, code }
  }
}

export function authSuccessResponse(data: any) {
  return {
    status: 200,
    body: { data, error: null }
  }
}