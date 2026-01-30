import { Request, Response, NextFunction } from 'express';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../../shared/schema';
import { UserRole } from '../../shared/schema.zod';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        [key: string]: any;
      };
    }
  }
}

// Lazy-load database connection
let client: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!db) {
    const connectionString = process.env.LEO_DATABASE_URL_POOLING || process.env.LEO_DATABASE_URL ||
                             process.env.DATABASE_URL_POOLING || process.env.DATABASE_URL || 'postgresql://placeholder';
    client = postgres(connectionString, { connect_timeout: 10 });
    db = drizzle(client, { schema });
  }
  return db;
}

// Cache for validated user tokens (5 minute TTL)
const tokenCache = new Map<string, { user: any; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache for user profiles (role lookup)
const profileCache = new Map<string, { role: UserRole; expires: number }>();
const PROFILE_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

/**
 * Get user role from profiles table (with caching)
 */
async function getUserRole(userId: string): Promise<UserRole> {
  // Check cache first
  const cached = profileCache.get(userId);
  if (cached && cached.expires > Date.now()) {
    return cached.role;
  }

  try {
    const [profile] = await getDb()
      .select({ role: schema.profiles.role })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, userId))
      .limit(1);

    const role = (profile?.role || 'user') as UserRole;

    // Cache the result
    profileCache.set(userId, { role, expires: Date.now() + PROFILE_CACHE_TTL });

    return role;
  } catch (error) {
    console.error('[Auth] Failed to fetch user role from profiles:', error);
    return 'user'; // Default to most restrictive role
  }
}

/**
 * Validate a JWT token directly against Supabase Auth API
 * Uses the service role key for admin access
 */
async function validateToken(token: string): Promise<{ user: any | null; error: string | null }> {
  // Check cache first
  const cached = tokenCache.get(token);
  if (cached && cached.expires > Date.now()) {
    return { user: cached.user, error: null };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return { user: null, error: 'Missing Supabase credentials' };
  }

  try {
    const authUrl = `${supabaseUrl}/auth/v1/user`;
    console.log(`[Auth] Fetching: ${authUrl}`);
    console.log(`[Auth] Service key length: ${serviceRoleKey.length}, full key: ${serviceRoleKey}`);

    const response = await fetch(authUrl, {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`[Auth] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[Auth] Error response: ${errorText}`);
      let errorData: any = {};
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      return { user: null, error: errorData.message || errorData.msg || `HTTP ${response.status}` };
    }

    const user = await response.json();

    // Cache the result
    tokenCache.set(token, { user, expires: Date.now() + CACHE_TTL });

    // Clean old cache entries periodically
    if (tokenCache.size > 1000) {
      const now = Date.now();
      tokenCache.forEach((value, key) => {
        if (value.expires < now) {
          tokenCache.delete(key);
        }
      });
    }

    return { user, error: null };
  } catch (err) {
    return { user: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Authentication middleware
 * Validates JWT tokens with Supabase
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
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

  try {
    const { user, error } = await validateToken(token);

    if (error || !user) {
      console.log(`[Auth Middleware] ❌ Token validation failed: ${error || 'No user'}`);
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }

    console.log(`[Auth Middleware] ✅ User authenticated: ${user.id} (${user.email})`);

    // Get user role from profiles table (not user_metadata)
    const profileRole = await getUserRole(user.id);
    console.log(`[Auth Middleware] User role from profiles: ${profileRole}`);

    req.user = {
      id: user.id,
      email: user.email!,
      role: profileRole,
      ...user.user_metadata,
    };

    next();
  } catch (err) {
    console.error('[Auth Middleware] ❌ Exception during validation:', err);
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication failed',
    });
  }
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
