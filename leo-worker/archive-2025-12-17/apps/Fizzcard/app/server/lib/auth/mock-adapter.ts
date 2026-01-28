/**
 * Mock Auth Adapter
 *
 * Development-only authentication adapter that accepts any credentials
 * and returns mock user data with simple JWT-like tokens.
 */

import type { IAuthAdapter, AuthUser, AuthResponse } from './factory';
import { storage } from '../storage/factory';
import * as bcrypt from 'bcryptjs';

export class MockAuthAdapter implements IAuthAdapter {
  constructor() {
    console.log('[MockAuth] Mock authentication adapter initialized');
  }

  async signup(email: string, password: string, name: string): Promise<AuthResponse> {
    console.log(`[MockAuth] Signup attempt: ${email}`);

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in storage
    const user = await storage.createUser({
      email,
      passwordHash,
      name,
      role: 'user',
      isVerified: false,
    });

    // Generate mock token with embedded user ID
    const token = `mock_token_${user.id}_${Date.now()}`;
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'user' | 'admin' | 'verified',
    };

    console.log(`[MockAuth] User created successfully: ${email} (ID: ${user.id})`);

    return { user: authUser, token };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    console.log(`[MockAuth] Login attempt: ${email}`);

    // Get user from storage
    const user = await storage.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate mock token with embedded user ID
    const token = `mock_token_${user.id}_${Date.now()}`;
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'user' | 'admin' | 'verified',
    };

    console.log(`[MockAuth] Login successful: ${email} (ID: ${user.id})`);

    return { user: authUser, token };
  }

  async verifyToken(token: string): Promise<AuthUser | null> {
    console.log(`[MockAuth] Verifying token: ${token.substring(0, 20)}...`);

    // Extract userId from token format: mock_token_{userId}_{timestamp}
    const parts = token.split('_');
    if (parts.length !== 4 || parts[0] !== 'mock' || parts[1] !== 'token') {
      console.log('[MockAuth] Invalid token format');
      return null;
    }

    const userId = parseInt(parts[2]);
    if (isNaN(userId)) {
      console.log('[MockAuth] Invalid user ID in token');
      return null;
    }

    // Look up user from storage
    const user = await storage.getUserById(userId);
    if (!user) {
      console.log('[MockAuth] User not found');
      return null;
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'user' | 'admin' | 'verified',
    };

    console.log(`[MockAuth] Token valid for user: ${user.email}`);
    return authUser;
  }

  async logout(token: string): Promise<void> {
    console.log(`[MockAuth] Logout: ${token.substring(0, 20)}...`);
    // In mock mode, tokens are stateless, so logout is a no-op
    // In production, you'd invalidate the token in a token blacklist
  }
}
