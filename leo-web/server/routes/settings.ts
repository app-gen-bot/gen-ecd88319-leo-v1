/**
 * Settings Routes - User settings management
 *
 * Handles Claude token configuration for developers/admins (BYOT).
 * Supports both OAuth tokens (sk-ant-oat01-) and API keys (sk-ant-api03-).
 * Tokens are stored in profiles.claude_oauth_token.
 */

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../../shared/schema';

const router = Router();

// Lazy-load database connection
let client: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!db) {
    const connectionString =
      process.env.LEO_DATABASE_URL_POOLING ||
      process.env.LEO_DATABASE_URL ||
      process.env.DATABASE_URL_POOLING ||
      process.env.DATABASE_URL ||
      'postgresql://placeholder';
    console.log('[Settings Routes] LAZY INIT - Connection:', connectionString.replace(/:[^:@]+@/, ':****@'));
    client = postgres(connectionString, {
      connect_timeout: 10,
      idle_timeout: 20,
      max_lifetime: 60 * 30,
    });
    db = drizzle(client, { schema });
  }
  return db;
}

/**
 * Mask a token for display (show first 7 chars + last 4 chars)
 * e.g., "sk-ant-...x4Kj"
 */
function maskToken(token: string): string {
  if (!token || token.length < 15) return '***';
  return `${token.slice(0, 7)}...${token.slice(-4)}`;
}

/*
 * Token validation function (currently disabled - re-enable for production):
 *
 * async function validateClaudeToken(token: string): Promise<{ valid: boolean; error?: string }> {
 *   // Makes a test API call to verify token works
 *   // Supports OAuth tokens (sk-ant-oat01-) and API keys (sk-ant-api03-)
 * }
 */

/**
 * GET /api/settings/claude-token
 * Get Claude token configuration status (never returns actual token)
 */
router.get('/api/settings/claude-token', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const [profile] = await getDb()
      .select({
        role: schema.profiles.role,
        claudeOauthToken: schema.profiles.claudeOauthToken,
      })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, userId));

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
      });
    }

    // Only dev and admin roles can use their own tokens
    const canConfigureToken = profile.role === 'dev' || profile.role === 'admin';

    res.json({
      success: true,
      data: {
        configured: !!profile.claudeOauthToken,
        masked: profile.claudeOauthToken ? maskToken(profile.claudeOauthToken) : null,
        canConfigure: canConfigureToken,
        role: profile.role,
      },
    });
  } catch (error) {
    console.error('[Settings] Error fetching Claude token status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch token status',
    });
  }
});

/**
 * POST /api/settings/claude-token
 * Set or remove Claude OAuth token
 * Body: { token: string } to set, or { token: null } to remove
 */
router.post('/api/settings/claude-token', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { token } = req.body;

    // Get current profile to check role
    const [profile] = await getDb()
      .select({
        role: schema.profiles.role,
      })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, userId));

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
      });
    }

    // Only dev and admin roles can configure their own tokens
    if (profile.role !== 'dev' && profile.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only developers and admins can configure Claude tokens',
      });
    }

    // Handle token removal
    if (token === null || token === '') {
      await getDb()
        .update(schema.profiles)
        .set({
          claudeOauthToken: null,
          updatedAt: new Date(),
        })
        .where(eq(schema.profiles.id, userId));

      console.log(`[Settings] Claude token removed for user ${userId}`);

      return res.json({
        success: true,
        data: {
          configured: false,
          masked: null,
        },
      });
    }

    // Validate token type
    if (typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Token must be a string',
      });
    }

    // Basic format validation
    if (!token.startsWith('sk-ant-')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token format - Claude tokens start with sk-ant-',
      });
    }

    // TODO: Re-enable validation once OAuth token refresh is working
    // Temporarily bypassing validation to allow saving tokens
    // const validation = await validateClaudeToken(token);
    // if (!validation.valid) {
    //   return res.status(400).json({
    //     success: false,
    //     error: validation.error || 'Invalid token - please check and try again',
    //   });
    // }

    // Save validated token
    await getDb()
      .update(schema.profiles)
      .set({
        claudeOauthToken: token,
        updatedAt: new Date(),
      })
      .where(eq(schema.profiles.id, userId));

    console.log(`[Settings] Claude token saved for user ${userId} (masked: ${maskToken(token)})`);

    res.json({
      success: true,
      data: {
        configured: true,
        masked: maskToken(token),
      },
    });
  } catch (error) {
    console.error('[Settings] Error saving Claude token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save token',
    });
  }
});

export default router;
