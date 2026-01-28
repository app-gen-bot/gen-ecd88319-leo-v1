/**
 * Smart Supabase Auth Client Factory
 * 
 * This file provides auth-only Supabase client creation.
 * It automatically falls back to mock mode when credentials are missing.
 * 
 * For database operations, use your existing database solution.
 * 
 * Usage (AI writes this standard code):
 * 
 * import { createClient } from './supabase-auth-client'
 * 
 * const supabase = createClient(
 *   process.env.VITE_SUPABASE_URL,      // undefined initially
 *   process.env.VITE_SUPABASE_ANON_KEY  // undefined initially  
 * )
 * 
 * // Only use for auth operations
 * const { user } = await supabase.auth.getUser()
 * 
 * // Use your existing database for data
 * const todos = await yourDatabase.query('...')
 */

import { MockSupabaseAuthClient } from './mock-supabase-auth'

// Type definitions for auth-only client
export interface SupabaseAuthClient {
  auth: {
    signUp: (params: any) => Promise<any>
    signInWithPassword: (params: any) => Promise<any>
    signInWithOAuth: (params: any) => Promise<any>
    signOut: () => Promise<any>
    getSession: () => Promise<any>
    getUser: () => Promise<any>
    updateUser: (params: any) => Promise<any>
    resetPasswordForEmail: (email: string, options?: any) => Promise<any>
    refreshSession: () => Promise<any>
    setSession: (params: any) => Promise<any>
    onAuthStateChange: (callback: Function) => any
  }
}

/**
 * Create Supabase auth client with automatic mock fallback
 * 
 * This function signature matches the real createClient exactly,
 * but only provides auth functionality.
 */
export function createClient(
  supabaseUrl?: string,
  supabaseKey?: string,
  options?: any
): SupabaseAuthClient {
  
  // Check if we should use mock mode
  const shouldUseMock = (
    !supabaseUrl || 
    !supabaseKey || 
    supabaseUrl.includes('mock') ||
    supabaseKey.includes('mock') ||
    supabaseUrl === 'undefined' ||
    supabaseKey === 'undefined'
  )

  if (shouldUseMock) {
    console.log('🎭 [Supabase Auth] No credentials provided, using mock mode')
    console.log('   → Demo user: demo@example.com')
    console.log('   → Use your existing database solution for data operations')
    console.log('   → To use real Supabase auth, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
    
    return new MockSupabaseAuthClient() as SupabaseAuthClient
  }

  // Use real Supabase client (auth only)
  console.log('🔗 [Supabase Auth] Connecting to:', supabaseUrl)
  
  try {
    // Dynamic import to avoid bundling real Supabase when not needed
    const { createClient: createRealClient } = require('@supabase/supabase-js')
    const client = createRealClient(supabaseUrl, supabaseKey, options)
    
    // Return only auth interface to prevent database confusion
    return {
      auth: client.auth
    } as SupabaseAuthClient
    
  } catch (error) {
    console.warn('⚠️ [Supabase Auth] Real client failed to load, falling back to mock:', error)
    console.log('   Install @supabase/supabase-js to use real Supabase auth')
    
    return new MockSupabaseAuthClient() as SupabaseAuthClient
  }
}

// Re-export types that AI might need
export type { SupabaseAuthClient }

// Default export for convenience
export default createClient

/**
 * Environment variable helpers
 */

export function getSupabaseAuthConfig() {
  const url = import.meta.env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = import.meta.env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  
  return {
    url,
    key,
    isConfigured: !!(url && key && !url.includes('mock') && !key.includes('mock')),
    isMockMode: !url || !key || url.includes('mock') || key.includes('mock')
  }
}

export function logSupabaseAuthConfig() {
  const config = getSupabaseAuthConfig()
  
  console.log('📋 [Supabase Auth Configuration]')
  console.log('   URL:', config.url || '(not set)')
  console.log('   Key:', config.key ? `${config.key.substring(0, 20)}...` : '(not set)')
  console.log('   Mode:', config.isMockMode ? 'Mock' : 'Real')
  console.log('   Purpose: Authentication only (use your database solution for data)')
  
  if (config.isMockMode) {
    console.log('\n📝 To use real Supabase auth:')
    console.log('   1. Create a Supabase project at https://supabase.com')
    console.log('   2. Set VITE_SUPABASE_URL=your_project_url')
    console.log('   3. Set VITE_SUPABASE_ANON_KEY=your_anon_key')
    console.log('   4. Restart your dev server')
    console.log('   5. Continue using your existing database solution')
  }
}

/**
 * Test auth connection
 */
export async function testAuthConnection(client: SupabaseAuthClient) {
  try {
    console.log('🔍 [Supabase Auth] Testing connection...')
    
    const { data, error } = await client.auth.getSession()
    
    if (error) {
      console.error('❌ [Supabase Auth] Connection test failed:', error)
      return false
    }
    
    console.log('✅ [Supabase Auth] Connection successful')
    return true
  } catch (error) {
    console.error('❌ [Supabase Auth] Connection test error:', error)
    return false
  }
}

/**
 * Validate auth environment
 */
export function validateAuthEnvironment() {
  const config = getSupabaseAuthConfig()
  const issues: string[] = []
  
  if (config.isMockMode) {
    return {
      isValid: true,
      mode: 'mock' as const,
      issues: [],
      message: 'Mock auth mode active - no configuration required'
    }
  }
  
  if (!config.url) {
    issues.push('VITE_SUPABASE_URL is required')
  } else if (!config.url.includes('supabase')) {
    issues.push('VITE_SUPABASE_URL should be a valid Supabase URL')
  }
  
  if (!config.key) {
    issues.push('VITE_SUPABASE_ANON_KEY is required')
  } else if (config.key.length < 100) {
    issues.push('VITE_SUPABASE_ANON_KEY seems too short')
  }
  
  return {
    isValid: issues.length === 0,
    mode: 'real' as const,
    issues,
    message: issues.length > 0 
      ? `Configuration issues: ${issues.join(', ')}`
      : 'Real Supabase auth configuration looks good'
  }
}

/**
 * Development utilities
 */
export function enableAuthDebug() {
  localStorage.setItem('supabase-auth-debug', 'true')
  console.log('🐛 [Supabase Auth] Debug mode enabled')
}

export function disableAuthDebug() {
  localStorage.removeItem('supabase-auth-debug')
  console.log('🐛 [Supabase Auth] Debug mode disabled')
}

export function isAuthDebugMode() {
  return localStorage.getItem('supabase-auth-debug') === 'true'
}