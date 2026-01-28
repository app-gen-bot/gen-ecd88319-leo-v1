import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../../shared/schema';
// Type imports removed - using schema types directly

const router = Router();

// Lazy-load database connection
let client: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!db) {
    const connectionString = process.env.LEO_DATABASE_URL_POOLING || process.env.LEO_DATABASE_URL ||
                             process.env.DATABASE_URL_POOLING || process.env.DATABASE_URL || 'postgresql://placeholder';
    console.log('[Profile Routes] LAZY INIT - Connection:', connectionString.replace(/:[^:@]+@/, ':****@'));
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
 * GET /api/profile
 * Get the current user's profile (creates one if it doesn't exist)
 */
router.get('/api/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const email = req.user!.email;

    // Try to get existing profile
    let [profile] = await getDb()
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.id, userId));

    // If profile doesn't exist, create it with pending_approval status
    if (!profile) {
      const newProfile: typeof schema.profiles.$inferInsert = {
        id: userId,
        email: email,
        name: req.user?.user_metadata?.name || req.user?.user_metadata?.full_name || null,
        role: 'user',
        status: 'pending_approval',
        creditsRemaining: 0,
        creditsUsed: 0,
      };

      const [created] = await getDb()
        .insert(schema.profiles)
        .values(newProfile)
        .returning();

      profile = created;
      console.log(`[Profile] Created new profile for user ${userId} with pending_approval status`);
    }

    // Build response without sensitive token field
    const { claudeOauthToken, ...profileWithoutToken } = profile;
    res.json({
      success: true,
      profile: {
        ...profileWithoutToken,
        hasClaudeToken: !!claudeOauthToken, // Boolean flag instead of actual token
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('[Profile] Error fetching/creating profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
    });
  }
});

/**
 * PATCH /api/profile
 * Update the current user's profile (limited fields)
 */
router.patch('/api/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name } = req.body;

    // Users can only update their own name
    const updates: Partial<typeof schema.profiles.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      updates.name = name;
    }

    const [profile] = await getDb()
      .update(schema.profiles)
      .set(updates)
      .where(eq(schema.profiles.id, userId))
      .returning();

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
      });
    }

    // Build response without sensitive token field
    const { claudeOauthToken, ...profileWithoutToken } = profile;
    res.json({
      success: true,
      profile: {
        ...profileWithoutToken,
        hasClaudeToken: !!claudeOauthToken,
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('[Profile] Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
    });
  }
});

/**
 * GET /api/profile/credits
 * Get the current user's credit balance and recent transactions
 */
router.get('/api/profile/credits', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get profile for credit balance
    const [profile] = await getDb()
      .select({
        creditsRemaining: schema.profiles.creditsRemaining,
        creditsUsed: schema.profiles.creditsUsed,
      })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, userId));

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
      });
    }

    // Get recent transactions (last 20)
    const transactions = await getDb()
      .select()
      .from(schema.creditTransactions)
      .where(eq(schema.creditTransactions.userId, userId))
      .orderBy(schema.creditTransactions.createdAt)
      .limit(20);

    res.json({
      success: true,
      credits: {
        remaining: profile.creditsRemaining,
        used: profile.creditsUsed,
      },
      transactions: transactions.map(t => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('[Profile] Error fetching credits:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch credits',
    });
  }
});

export default router;

// ============================================================================
// ADMIN HELPERS (used by other parts of the system)
// ============================================================================

/**
 * Deduct credits from a user's balance
 * Returns true if successful, false if insufficient credits
 */
export async function deductCredits(
  userId: string,
  amount: number,
  description: string,
  generationRequestId?: number
): Promise<boolean> {
  try {
    const db = getDb();

    // Get current balance
    const [profile] = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.id, userId));

    if (!profile) {
      console.error(`[Credits] Profile not found for user ${userId}`);
      return false;
    }

    if (profile.creditsRemaining < amount) {
      console.log(`[Credits] Insufficient credits for user ${userId}: has ${profile.creditsRemaining}, needs ${amount}`);
      return false;
    }

    const balanceBefore = profile.creditsRemaining;
    const balanceAfter = profile.creditsRemaining - amount;

    // Update profile
    await db
      .update(schema.profiles)
      .set({
        creditsRemaining: balanceAfter,
        creditsUsed: profile.creditsUsed + amount,
        updatedAt: new Date(),
      })
      .where(eq(schema.profiles.id, userId));

    // Record transaction
    await db
      .insert(schema.creditTransactions)
      .values({
        userId,
        type: 'deduction',
        amount: -amount,
        balanceBefore,
        balanceAfter,
        description,
        generationRequestId: generationRequestId ?? null,
        createdBy: null, // System deduction
      });

    console.log(`[Credits] Deducted ${amount} credits from user ${userId}: ${balanceBefore} -> ${balanceAfter}`);
    return true;
  } catch (error) {
    console.error('[Credits] Error deducting credits:', error);
    return false;
  }
}

/**
 * Check if user has enough credits
 */
export async function hasEnoughCredits(userId: string, amount: number): Promise<boolean> {
  try {
    const db = getDb();

    const [profile] = await db
      .select({ creditsRemaining: schema.profiles.creditsRemaining })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, userId));

    if (!profile) {
      return false;
    }

    return profile.creditsRemaining >= amount;
  } catch (error) {
    console.error('[Credits] Error checking credits:', error);
    return false;
  }
}

/**
 * Check if user is approved
 */
export async function isUserApproved(userId: string): Promise<boolean> {
  try {
    const db = getDb();

    const [profile] = await db
      .select({ status: schema.profiles.status })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, userId));

    if (!profile) {
      return false;
    }

    return profile.status === 'approved';
  } catch (error) {
    console.error('[Profile] Error checking approval status:', error);
    return false;
  }
}

/**
 * Get credit config from settings
 */
export async function getCreditConfig(): Promise<{
  creditsPerGeneration: number;
  defaultCreditsForNewUsers: number;
  maxCreditsPerUser: number;
}> {
  try {
    const db = getDb();

    const [setting] = await db
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, 'credit_config'));

    if (setting && typeof setting.value === 'object' && setting.value !== null) {
      const config = setting.value as Record<string, unknown>;
      return {
        creditsPerGeneration: (config.creditsPerGeneration as number) ?? 1,
        defaultCreditsForNewUsers: (config.defaultCreditsForNewUsers as number) ?? 0,
        maxCreditsPerUser: (config.maxCreditsPerUser as number) ?? 100,
      };
    }

    // Default config
    return {
      creditsPerGeneration: 1,
      defaultCreditsForNewUsers: 0,
      maxCreditsPerUser: 100,
    };
  } catch (error) {
    console.error('[Credits] Error getting credit config:', error);
    return {
      creditsPerGeneration: 1,
      defaultCreditsForNewUsers: 0,
      maxCreditsPerUser: 100,
    };
  }
}
