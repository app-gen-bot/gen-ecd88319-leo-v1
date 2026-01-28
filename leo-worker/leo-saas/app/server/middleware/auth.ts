import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role?: string;
        [key: string]: any;
      };
    }
  }
}

// Lazy-initialize Supabase client after loadConfig() sets env vars
let supabaseAdmin: ReturnType<typeof createClient> | null = null;

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        'Missing Supabase credentials. Ensure loadConfig() ran and AWS Secrets Manager has credentials.'
      );
    }

    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    console.log('🔐 Auth Middleware: Supabase client initialized');
  }
  return supabaseAdmin;
}

/**
 * Authentication middleware
 * Validates JWT tokens with Supabase
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  console.log(`[Auth Middleware] Path: ${req.path}`);
  console.log(`[Auth Middleware] Auth header present: ${!!authHeader}`);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log(`[Auth Middleware] ❌ Rejecting: No valid auth header`);
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authorization header required',
    });
  }

  const token = authHeader.replace('Bearer ', '');
  console.log(`[Auth Middleware] Token length: ${token.length}`);

  getSupabaseAdmin().auth
    .getUser(token)
    .then(({ data: { user }, error }) => {
      if (error || !user) {
        console.log(`[Auth Middleware] ❌ Token validation failed: ${error?.message || 'No user'}`);
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Invalid or expired token',
        });
      }

      console.log(`[Auth Middleware] ✅ User authenticated: ${user.id} (${user.email})`);

      req.user = {
        id: user.id,
        email: user.email!,
        role: user.user_metadata?.role || 'user',
        ...user.user_metadata,
      };

      next();
    })
    .catch((err) => {
      console.error('[Auth Middleware] ❌ Exception during validation:', err);
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication failed',
      });
    });
}

/**
 * Role-based access control middleware
 * Use after authMiddleware
 */
export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const userRole = req.user.role || 'user';

    if (userRole !== role) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Role '${role}' required. Current role: '${userRole}'`,
      });
    }

    next();
  };
}

/**
 * Admin-only access middleware
 */
export function adminMiddleware() {
  return requireRole('admin');
}
