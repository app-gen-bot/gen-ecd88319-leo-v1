/**
 * Lightweight Auth-Only Mock Client
 * 
 * Provides only authentication methods, no database operations.
 * Designed to work with your existing database solution.
 */

// Demo user for mock mode
const DEMO_USER = {
  id: 'demo-user-123',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'demo@example.com',
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {
    provider: 'mock',
    providers: ['mock']
  },
  user_metadata: {
    name: 'Demo User',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  },
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const DEMO_SESSION = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token', 
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: DEMO_USER
}

// Auth event listeners storage
let authListeners: Array<{ callback: Function; unsubscribe: Function }> = []

/**
 * Mock Auth Implementation
 * 
 * Implements only Supabase auth methods, no database operations.
 */
class MockAuth {
  private session = DEMO_SESSION
  private user = DEMO_USER

  async signUp({ email, password, options }: any = {}) {
    console.log('[Mock Auth] signUp called with:', { email })
    
    // In mock mode, always succeed
    const response = {
      data: {
        user: this.user,
        session: this.session
      },
      error: null
    }

    // Notify listeners
    this.notifyListeners('SIGNED_UP', this.session)
    
    return response
  }

  async signInWithPassword({ email, password }: any = {}) {
    console.log('[Mock Auth] signInWithPassword called with:', { email })
    
    // Always succeed in mock mode
    const response = {
      data: {
        user: this.user,
        session: this.session
      },
      error: null
    }

    // Notify listeners
    this.notifyListeners('SIGNED_IN', this.session)
    
    return response
  }

  async signInWithOAuth({ provider, options }: any = {}) {
    console.log('[Mock Auth] signInWithOAuth called with:', { provider })
    
    // Always succeed in mock mode (no redirect needed)
    const response = {
      data: {
        url: null, // No redirect in mock mode
        provider
      },
      error: null
    }

    // Auto sign in after OAuth
    setTimeout(() => {
      this.notifyListeners('SIGNED_IN', this.session)
    }, 100)
    
    return response
  }

  async signOut() {
    console.log('[Mock Auth] signOut called')
    
    // Notify listeners
    this.notifyListeners('SIGNED_OUT', null)
    
    return {
      error: null
    }
  }

  async getSession() {
    return {
      data: {
        session: this.session
      },
      error: null
    }
  }

  async getUser() {
    return {
      data: {
        user: this.user
      },
      error: null
    }
  }

  async updateUser(attributes: any = {}) {
    console.log('[Mock Auth] updateUser called with:', attributes)
    
    // Update mock user
    this.user = { 
      ...this.user, 
      ...attributes,
      user_metadata: {
        ...this.user.user_metadata,
        ...attributes.data
      },
      updated_at: new Date().toISOString() 
    }
    
    // Update session
    this.session = {
      ...this.session,
      user: this.user
    }

    // Notify listeners
    this.notifyListeners('USER_UPDATED', this.session)
    
    return {
      data: {
        user: this.user
      },
      error: null
    }
  }

  async resetPasswordForEmail(email: string, options: any = {}) {
    console.log('[Mock Auth] resetPasswordForEmail called with:', email)
    
    return {
      data: {},
      error: null
    }
  }

  async refreshSession() {
    console.log('[Mock Auth] refreshSession called')
    
    return {
      data: {
        session: this.session,
        user: this.user
      },
      error: null
    }
  }

  async setSession({ access_token, refresh_token }: any = {}) {
    console.log('[Mock Auth] setSession called')
    
    return {
      data: {
        session: this.session,
        user: this.user
      },
      error: null
    }
  }

  // Event listeners
  onAuthStateChange(callback: Function) {
    console.log('[Mock Auth] onAuthStateChange registered')
    
    const unsubscribe = () => {
      authListeners = authListeners.filter(listener => listener.callback !== callback)
      console.log('[Mock Auth] Auth listener unsubscribed')
    }

    // Store listener
    authListeners.push({ callback, unsubscribe })
    
    // Immediately call with current state (signed in by default in mock)
    setTimeout(() => {
      callback('SIGNED_IN', this.session)
    }, 100)

    // Return subscription object
    return {
      data: {
        subscription: {
          unsubscribe
        }
      }
    }
  }

  private notifyListeners(event: string, session: any) {
    authListeners.forEach(listener => {
      try {
        listener.callback(event, session)
      } catch (error) {
        console.error('[Mock Auth] Error in auth listener:', error)
      }
    })
  }
}

/**
 * Main Mock Supabase Client (Auth Only)
 * 
 * This provides ONLY authentication methods.
 * Use your existing database solution for data operations.
 */
export class MockSupabaseAuthClient {
  auth: MockAuth

  constructor() {
    this.auth = new MockAuth()
    console.log('🎭 [Supabase Auth Mock] Initialized - Demo user: demo@example.com')
    console.log('   → For database operations, use your existing database solution')
  }

  // Explicitly NOT including database methods
  // Users should use their existing database solution

  // Not included: from(), storage, functions, channel, etc.
  // This is auth-only by design
}

export default MockSupabaseAuthClient