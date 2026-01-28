/**
 * Auth Routes
 *
 * Authentication endpoints: signup, login, logout, me
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { auth } from '../lib/auth/factory';
import { storage } from '../lib/storage/factory';
import { authMiddleware } from '../middleware/auth';
import { badgeService } from '../services/badge.service';
import { logAuthEvent } from '../lib/logger';

const router = Router();

/**
 * POST /api/auth/signup
 * Sign up a new user
 */
router.post('/signup', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const signupSchema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(1),
      walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Must be a valid Ethereum address').optional(),
    });

    const validated = signupSchema.parse(req.body);

    logAuthEvent(`Signup attempt: ${validated.email}`, undefined, true, undefined, {
      email: validated.email,
      hasWalletAddress: !!validated.walletAddress,
    });

    // Sign up user
    const authResponse = await auth.signup(
      validated.email,
      validated.password,
      validated.name
    );

    // Create legacy FizzCoin wallet for new user (backwards compatibility)
    await storage.createWallet({
      userId: authResponse.user.id,
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
    });

    // Create crypto wallet if wallet address was provided
    if (validated.walletAddress) {
      try {
        await storage.createCryptoWallet({
          userId: authResponse.user.id,
          walletAddress: validated.walletAddress.toLowerCase(), // Normalize to lowercase
          walletType: 'embedded',
          pendingClaimAmount: 0,
        });
      } catch (walletError) {
        logAuthEvent('Crypto wallet creation failed during signup', authResponse.user.id, false, walletError as Error);
        // Don't fail signup if wallet creation fails - can be retried later
      }
    }

    // Check early adopter badge
    try {
      await badgeService.checkAndAwardEarlyAdopterBadge(authResponse.user.id);
    } catch (error) {
      // Don't fail signup if badge check fails
    }

    logAuthEvent('User signup successful', authResponse.user.id, true, undefined, {
      email: validated.email,
    });

    res.status(201).json(authResponse);
  } catch (error) {
    logAuthEvent(`Signup failed: ${req.body.email}`, undefined, false, error as Error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({ error: 'User already exists' });
      }
      return res.status(400).json({ error: error.message });
    }

    console.error('[Auth Routes] Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/login
 * Login an existing user
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
    });

    const validated = loginSchema.parse(req.body);

    // Login user
    const authResponse = await auth.login(validated.email, validated.password);

    logAuthEvent('User login successful', authResponse.user.id, true, undefined, {
      email: validated.email,
    });

    res.status(200).json(authResponse);
  } catch (error) {
    logAuthEvent(`Login failed: ${req.body.email}`, undefined, false, error as Error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    if (error instanceof Error) {
      if (error.message.includes('Invalid credentials')) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/logout
 * Logout the current user
 */
router.post('/logout', authMiddleware(), async (req: Request, res: Response) => {
  try {
    console.log('[Auth Routes] Logout request');

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await auth.logout(token);
    }

    console.log('[Auth Routes] User logged out successfully');

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('[Auth Routes] Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authMiddleware(), async (req: Request, res: Response) => {
  try {
    console.log('[Auth Routes] Get current user request');

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get full user details from storage
    const user = await storage.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Omit password hash
    const { passwordHash, ...userWithoutPassword } = user;

    console.log(`[Auth Routes] Returning user details for: ${user.email}`);

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('[Auth Routes] Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
