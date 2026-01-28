/**
 * Auth Factory Pattern
 *
 * Provides a pluggable authentication system that can switch between
 * mock (development) and Supabase (production) adapters based on env vars.
 */

import type { User } from '../../../shared/schema.zod';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'verified';
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface IAuthAdapter {
  /**
   * Sign up a new user
   */
  signup(email: string, password: string, name: string): Promise<AuthResponse>;

  /**
   * Login an existing user
   */
  login(email: string, password: string): Promise<AuthResponse>;

  /**
   * Verify a token and return the user
   */
  verifyToken(token: string): Promise<AuthUser | null>;

  /**
   * Logout a user (invalidate token if needed)
   */
  logout(token: string): Promise<void>;
}

/**
 * Create the appropriate auth adapter based on environment
 */
export function createAuth(): IAuthAdapter {
  const authMode = process.env.AUTH_MODE || 'mock';

  console.log(`[Auth Factory] Initializing auth in ${authMode} mode`);

  if (authMode === 'supabase') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { SupabaseAuthAdapter } = require('./supabase-adapter');
    return new SupabaseAuthAdapter();
  }

  // Default to mock adapter for development
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MockAuthAdapter } = require('./mock-adapter');
  return new MockAuthAdapter();
}

// Lazy singleton - only create when first accessed
let authInstance: IAuthAdapter | null = null;

export const auth: IAuthAdapter = new Proxy({} as IAuthAdapter, {
  get(target, prop) {
    if (!authInstance) {
      authInstance = createAuth();
    }
    return (authInstance as any)[prop];
  }
});
