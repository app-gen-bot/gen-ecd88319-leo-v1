/**
 * Auth Middleware
 *
 * Protects routes by verifying authentication tokens and attaching
 * the authenticated user to the request object.
 */

import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth/factory';
import type { AuthUser } from '../lib/auth/factory';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Middleware to verify authentication token
 *
 * Extracts Bearer token from Authorization header, verifies it,
 * and attaches the user to req.user. Returns 401 if invalid.
 */
export function authMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        console.log('[AuthMiddleware] No authorization header present');
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check for Bearer token format
      if (!authHeader.startsWith('Bearer ')) {
        console.log('[AuthMiddleware] Invalid authorization header format');
        return res.status(401).json({ error: 'Invalid authorization header format' });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify token
      const user = await auth.verifyToken(token);
      if (!user) {
        console.log('[AuthMiddleware] Token verification failed');
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      // Attach user to request
      req.user = user;
      console.log(`[AuthMiddleware] Authenticated user: ${user.email} (ID: ${user.id})`);

      next();
    } catch (error) {
      console.error('[AuthMiddleware] Error:', error);
      return res.status(401).json({ error: 'Authentication failed' });
    }
  };
}

/**
 * Optional auth middleware - doesn't fail if no token present
 */
export function optionalAuthMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
      }

      const token = authHeader.substring(7);
      const user = await auth.verifyToken(token);

      if (user) {
        req.user = user;
        console.log(`[OptionalAuth] Authenticated user: ${user.email} (ID: ${user.id})`);
      }

      next();
    } catch (error) {
      console.error('[OptionalAuth] Error:', error);
      next();
    }
  };
}
