/**
 * Supabase Auth Adapter
 *
 * Production authentication adapter using Supabase Auth.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { IAuthAdapter, AuthUser, AuthResponse } from './factory';
import { storage } from '../storage/factory';

export class SupabaseAuthAdapter implements IAuthAdapter {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_ANON_KEY must be set when using supabase auth mode'
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[SupabaseAuth] Supabase authentication adapter initialized');
  }

  async signup(email: string, password: string, name: string): Promise<AuthResponse> {
    console.log(`[SupabaseAuth] Signup attempt: ${email}`);

    // Sign up with Supabase
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error(`[SupabaseAuth] Signup error:`, error);
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error('Failed to create user');
    }

    // Create user in our database
    const user = await storage.createUser({
      email,
      passwordHash: '', // Not used with Supabase
      name,
      role: 'user',
      isVerified: false,
    });

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'user' | 'admin' | 'verified',
    };

    console.log(`[SupabaseAuth] User created successfully: ${email} (ID: ${user.id})`);

    return {
      user: authUser,
      token: data.session.access_token,
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    console.log(`[SupabaseAuth] Login attempt: ${email}`);

    // Sign in with Supabase
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(`[SupabaseAuth] Login error:`, error);
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error('Invalid credentials');
    }

    // Get user from our database
    const user = await storage.getUserByEmail(email);
    if (!user) {
      throw new Error('User not found in database');
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'user' | 'admin' | 'verified',
    };

    console.log(`[SupabaseAuth] Login successful: ${email} (ID: ${user.id})`);

    return {
      user: authUser,
      token: data.session.access_token,
    };
  }

  async verifyToken(token: string): Promise<AuthUser | null> {
    console.log(`[SupabaseAuth] Verifying token`);

    try {
      const { data, error } = await this.supabase.auth.getUser(token);

      if (error || !data.user) {
        console.log('[SupabaseAuth] Token verification failed');
        return null;
      }

      // Get user from our database
      const user = await storage.getUserByEmail(data.user.email!);
      if (!user) {
        console.log('[SupabaseAuth] User not found in database');
        return null;
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'user' | 'admin' | 'verified',
      };

      console.log(`[SupabaseAuth] Token valid for user: ${user.email}`);
      return authUser;
    } catch (error) {
      console.error('[SupabaseAuth] Token verification error:', error);
      return null;
    }
  }

  async logout(token: string): Promise<void> {
    console.log('[SupabaseAuth] Logout');

    try {
      await this.supabase.auth.signOut();
    } catch (error) {
      console.error('[SupabaseAuth] Logout error:', error);
    }
  }
}
