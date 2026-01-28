import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, desc, and, count, inArray, lt } from 'drizzle-orm';
import { IStorage, GenerationRequestWithApp } from './factory';
import {
  GenerationRequest,
  InsertGenerationRequest,
  UpdateGenerationRequest,
  App,
  InsertApp,
  UpdateApp,
  UserAppSummary,
  UserFeedback,
  CreateFeedback,
} from '../../../shared/schema.zod';
import * as schema from '../../../shared/schema';

// Lazy-load database connection to allow server/index.ts to set DATABASE_URL first
let client: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!db) {
    // Use LEO_ prefixed vars for Leo SaaS's own database (not the generated apps pool)
    // Prefer pooled connection for runtime, fallback to direct
    const connectionString = process.env.LEO_DATABASE_URL_POOLING || process.env.LEO_DATABASE_URL ||
                             process.env.DATABASE_URL_POOLING || process.env.DATABASE_URL || 'postgresql://placeholder';
    console.log('[Database Storage] LAZY INIT - Connection:', connectionString.replace(/:[^:@]+@/, ':****@'));
    // Supabase requires IPv6 connectivity - ECS tasks must have DUAL_STACK networking
    client = postgres(connectionString, {
      connect_timeout: 10,
      idle_timeout: 20,
      max_lifetime: 60 * 30,
    });
    db = drizzle(client, { schema });
    console.log('[Database Storage] Drizzle ORM initialized');
  }
  return db;
}

class DatabaseStorage implements IStorage {
  // ============================================================================
  // APP OPERATIONS - Stable app identity
  // ============================================================================

  async getAppById(id: number): Promise<App | null> {
    try {
      const [app] = await getDb()
        .select()
        .from(schema.apps)
        .where(eq(schema.apps.id, id));

      if (!app) return null;

      return {
        ...app,
        createdAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error('[Database Storage] GET APP BY ID ERROR:', error);
      throw error;
    }
  }

  async getAppByUuid(appUuid: string): Promise<App | null> {
    try {
      const [app] = await getDb()
        .select()
        .from(schema.apps)
        .where(eq(schema.apps.appUuid, appUuid));

      if (!app) return null;

      return {
        ...app,
        createdAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error('[Database Storage] GET APP BY UUID ERROR:', error);
      throw error;
    }
  }

  async getAppByUserAndName(userId: string, appName: string): Promise<App | null> {
    try {
      const [app] = await getDb()
        .select()
        .from(schema.apps)
        .where(
          and(
            eq(schema.apps.userId, userId),
            eq(schema.apps.appName, appName)
          )
        );

      if (!app) return null;

      return {
        ...app,
        createdAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error('[Database Storage] GET APP BY USER AND NAME ERROR:', error);
      throw error;
    }
  }

  async createApp(app: InsertApp): Promise<App> {
    try {
      console.log('[Database Storage] Creating app:', app.appName, 'for user:', app.userId);

      const [newApp] = await getDb()
        .insert(schema.apps)
        .values(app)
        .returning();

      console.log(`[Database Storage] App created: ID ${newApp.id}, UUID ${newApp.appUuid}`);

      return {
        ...newApp,
        createdAt: newApp.createdAt.toISOString(),
        updatedAt: newApp.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error('[Database Storage] CREATE APP ERROR:', error);
      throw error;
    }
  }

  async updateApp(id: number, updates: UpdateApp): Promise<App | null> {
    try {
      const dbUpdates: any = { ...updates };
      if (dbUpdates.updatedAt) {
        dbUpdates.updatedAt = new Date(dbUpdates.updatedAt);
      } else {
        dbUpdates.updatedAt = new Date();
      }

      const [updated] = await getDb()
        .update(schema.apps)
        .set(dbUpdates)
        .where(eq(schema.apps.id, id))
        .returning();

      if (!updated) return null;

      console.log(`[Database Storage] App updated: ID ${id}`);

      return {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error('[Database Storage] UPDATE APP ERROR:', error);
      throw error;
    }
  }

  async deleteApp(id: number): Promise<boolean> {
    try {
      console.log('[Database Storage] Deleting app:', id);

      // Delete app - cascade will delete related generation_requests
      const result = await getDb()
        .delete(schema.apps)
        .where(eq(schema.apps.id, id))
        .returning({ id: schema.apps.id });

      if (result.length === 0) {
        console.log('[Database Storage] App not found:', id);
        return false;
      }

      console.log(`[Database Storage] App deleted: ID ${id}`);
      return true;
    } catch (error) {
      console.error('[Database Storage] DELETE APP ERROR:', error);
      throw error;
    }
  }

  /**
   * Get user's apps for Resume dropdown
   * Queries the apps table (unique per user) instead of generation_requests
   * Only returns apps with at least one completed generation with github_url
   */
  async getUserApps(userId: string): Promise<UserAppSummary[]> {
    try {
      console.log('[Database Storage] Fetching apps for user:', userId);

      // Get apps with their latest generation status and count
      // Using a subquery approach for efficiency
      const appsWithStats = await getDb()
        .select({
          id: schema.apps.id,
          appUuid: schema.apps.appUuid,
          appName: schema.apps.appName,
          githubUrl: schema.apps.githubUrl,
          deploymentUrl: schema.apps.deploymentUrl,
          updatedAt: schema.apps.updatedAt,
        })
        .from(schema.apps)
        .where(eq(schema.apps.userId, userId))
        .orderBy(desc(schema.apps.updatedAt));

      // For each app, get generation count and last status
      const appsWithDetails = await Promise.all(
        appsWithStats.map(async (app) => {
          // Get generation count and latest status
          const [stats] = await getDb()
            .select({
              generationCount: count(schema.generationRequests.id),
            })
            .from(schema.generationRequests)
            .where(eq(schema.generationRequests.appRefId, app.id));

          // Get latest generation status
          const [latestGen] = await getDb()
            .select({
              status: schema.generationRequests.status,
            })
            .from(schema.generationRequests)
            .where(eq(schema.generationRequests.appRefId, app.id))
            .orderBy(desc(schema.generationRequests.updatedAt))
            .limit(1);

          return {
            id: app.id,
            appUuid: app.appUuid,
            appName: app.appName,
            githubUrl: app.githubUrl,
            deploymentUrl: app.deploymentUrl,
            updatedAt: app.updatedAt.toISOString(),
            generationCount: Number(stats?.generationCount || 0),
            lastStatus: latestGen?.status || undefined,
          };
        })
      );

      // Filter to only apps with github_url (resumable)
      const resumableApps = appsWithDetails.filter(app => app.githubUrl !== null);

      console.log(`[Database Storage] Found ${resumableApps.length} resumable apps out of ${appsWithDetails.length} total`);

      return resumableApps;
    } catch (error) {
      console.error('[Database Storage] GET USER APPS ERROR:', error);
      throw error;
    }
  }

  // ============================================================================
  // GENERATION REQUEST OPERATIONS
  // ============================================================================
  // Note: User management is handled by Supabase Auth.
  // userId is derived from apps table via appRefId join.

  async getGenerationRequests(userId: string): Promise<GenerationRequestWithApp[]> {
    try {
      console.log('[Database Storage] Fetching requests for user:', userId);

      // Join with apps table to get userId, appName, githubUrl, deploymentUrl
      const requests = await getDb()
        .select({
          // Generation request fields
          id: schema.generationRequests.id,
          appRefId: schema.generationRequests.appRefId,
          prompt: schema.generationRequests.prompt,
          status: schema.generationRequests.status,
          generationType: schema.generationRequests.generationType,
          createdAt: schema.generationRequests.createdAt,
          updatedAt: schema.generationRequests.updatedAt,
          completedAt: schema.generationRequests.completedAt,
          errorMessage: schema.generationRequests.errorMessage,
          mode: schema.generationRequests.mode,
          initialPrompt: schema.generationRequests.initialPrompt,
          maxIterations: schema.generationRequests.maxIterations,
          currentIteration: schema.generationRequests.currentIteration,
          lastSessionId: schema.generationRequests.lastSessionId,
          githubCommit: schema.generationRequests.githubCommit,
          totalCost: schema.generationRequests.totalCost,
          totalDuration: schema.generationRequests.totalDuration,
          warnings: schema.generationRequests.warnings,
          iterationData: schema.generationRequests.iterationData,
          poolIndex: schema.generationRequests.poolIndex,
          attachments: schema.generationRequests.attachments,
          // App fields (joined)
          userId: schema.apps.userId,
          appName: schema.apps.appName,
          appUuid: schema.apps.appUuid,
          githubUrl: schema.apps.githubUrl,
          deploymentUrl: schema.apps.deploymentUrl,
          cumulativeCost: schema.apps.cumulativeCost,
        })
        .from(schema.generationRequests)
        .innerJoin(schema.apps, eq(schema.generationRequests.appRefId, schema.apps.id))
        .where(eq(schema.apps.userId, userId))
        .orderBy(desc(schema.generationRequests.createdAt));
        // TODO: Add pagination - removed LIMIT 50 temporarily (see BACKLOG #3, #14)

      console.log(`[Database Storage] Found ${requests.length} requests`);

      return requests.map(r => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        completedAt: r.completedAt ? r.completedAt.toISOString() : null,
        warnings: r.warnings as GenerationRequestWithApp['warnings'],
        iterationData: r.iterationData as GenerationRequestWithApp['iterationData'],
        attachments: r.attachments as GenerationRequestWithApp['attachments'],
      }));
    } catch (error) {
      console.error('[Database Storage] GET ERROR DETAILS:', error);
      console.error('[Database Storage] Error name:', (error as any)?.constructor?.name);
      console.error('[Database Storage] Error message:', (error as any)?.message);
      console.error('[Database Storage] Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw error;
    }
  }

  async getGenerationRequestById(id: number): Promise<GenerationRequestWithApp | null> {
    // Join with apps table to get userId, appName, githubUrl, deploymentUrl
    const requests = await getDb()
      .select({
        // Generation request fields
        id: schema.generationRequests.id,
        appRefId: schema.generationRequests.appRefId,
        prompt: schema.generationRequests.prompt,
        status: schema.generationRequests.status,
        generationType: schema.generationRequests.generationType,
        createdAt: schema.generationRequests.createdAt,
        updatedAt: schema.generationRequests.updatedAt,
        completedAt: schema.generationRequests.completedAt,
        errorMessage: schema.generationRequests.errorMessage,
        mode: schema.generationRequests.mode,
        initialPrompt: schema.generationRequests.initialPrompt,
        maxIterations: schema.generationRequests.maxIterations,
        currentIteration: schema.generationRequests.currentIteration,
        lastSessionId: schema.generationRequests.lastSessionId,
        githubCommit: schema.generationRequests.githubCommit,
        totalCost: schema.generationRequests.totalCost,
        totalDuration: schema.generationRequests.totalDuration,
        warnings: schema.generationRequests.warnings,
        iterationData: schema.generationRequests.iterationData,
        poolIndex: schema.generationRequests.poolIndex,
        attachments: schema.generationRequests.attachments,
        // App fields (joined)
        userId: schema.apps.userId,
        appName: schema.apps.appName,
        appUuid: schema.apps.appUuid,
        githubUrl: schema.apps.githubUrl,
        deploymentUrl: schema.apps.deploymentUrl,
        cumulativeCost: schema.apps.cumulativeCost,
      })
      .from(schema.generationRequests)
      .innerJoin(schema.apps, eq(schema.generationRequests.appRefId, schema.apps.id))
      .where(eq(schema.generationRequests.id, id));

    if (requests.length === 0) return null;

    const r = requests[0];
    return {
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      completedAt: r.completedAt ? r.completedAt.toISOString() : null,
      warnings: r.warnings as GenerationRequestWithApp['warnings'],
      iterationData: r.iterationData as GenerationRequestWithApp['iterationData'],
      attachments: r.attachments as GenerationRequestWithApp['attachments'],
    };
  }

  async getGenerationsByAppId(appId: number): Promise<GenerationRequestWithApp[]> {
    try {
      console.log('[Database Storage] Fetching generations for app:', appId);

      const requests = await getDb()
        .select({
          // Generation request fields
          id: schema.generationRequests.id,
          appRefId: schema.generationRequests.appRefId,
          prompt: schema.generationRequests.prompt,
          status: schema.generationRequests.status,
          generationType: schema.generationRequests.generationType,
          createdAt: schema.generationRequests.createdAt,
          updatedAt: schema.generationRequests.updatedAt,
          completedAt: schema.generationRequests.completedAt,
          errorMessage: schema.generationRequests.errorMessage,
          mode: schema.generationRequests.mode,
          initialPrompt: schema.generationRequests.initialPrompt,
          maxIterations: schema.generationRequests.maxIterations,
          currentIteration: schema.generationRequests.currentIteration,
          lastSessionId: schema.generationRequests.lastSessionId,
          githubCommit: schema.generationRequests.githubCommit,
          totalCost: schema.generationRequests.totalCost,
          totalDuration: schema.generationRequests.totalDuration,
          warnings: schema.generationRequests.warnings,
          iterationData: schema.generationRequests.iterationData,
          poolIndex: schema.generationRequests.poolIndex,
          attachments: schema.generationRequests.attachments,
          // App fields (joined)
          userId: schema.apps.userId,
          appName: schema.apps.appName,
          appUuid: schema.apps.appUuid,
          githubUrl: schema.apps.githubUrl,
          deploymentUrl: schema.apps.deploymentUrl,
          cumulativeCost: schema.apps.cumulativeCost,
        })
        .from(schema.generationRequests)
        .innerJoin(schema.apps, eq(schema.generationRequests.appRefId, schema.apps.id))
        .where(eq(schema.generationRequests.appRefId, appId))
        .orderBy(desc(schema.generationRequests.createdAt));

      console.log(`[Database Storage] Found ${requests.length} generations for app ${appId}`);

      return requests.map(r => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        completedAt: r.completedAt ? r.completedAt.toISOString() : null,
        warnings: r.warnings as GenerationRequestWithApp['warnings'],
        iterationData: r.iterationData as GenerationRequestWithApp['iterationData'],
        attachments: r.attachments as GenerationRequestWithApp['attachments'],
      }));
    } catch (error) {
      console.error('[Database Storage] GET GENERATIONS BY APP ID ERROR:', error);
      throw error;
    }
  }

  async createGenerationRequest(request: InsertGenerationRequest): Promise<GenerationRequest> {
    try {
      console.log('[Database Storage] Attempting to create generation request:', JSON.stringify(request));

      // The request must have appRefId set by the caller (route handler)
      if (!request.appRefId) {
        throw new Error('appRefId is required - caller must find or create app first');
      }

      const [newRequest] = await getDb()
        .insert(schema.generationRequests)
        .values(request)
        .returning();

      console.log(`[Database Storage] Generation request created: ID ${newRequest.id}, appRefId: ${newRequest.appRefId}`);

      return {
        ...newRequest,
        createdAt: newRequest.createdAt.toISOString(),
        updatedAt: newRequest.updatedAt.toISOString(),
        completedAt: newRequest.completedAt ? newRequest.completedAt.toISOString() : null,
        warnings: newRequest.warnings as GenerationRequest['warnings'],
        iterationData: newRequest.iterationData as GenerationRequest['iterationData'],
        attachments: newRequest.attachments as GenerationRequest['attachments'],
      };
    } catch (error) {
      console.error('[Database Storage] CREATE ERROR DETAILS:', error);
      console.error('[Database Storage] Error name:', (error as any)?.constructor?.name);
      console.error('[Database Storage] Error message:', (error as any)?.message);
      console.error('[Database Storage] Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw error;
    }
  }

  async updateGenerationRequest(id: number, updates: UpdateGenerationRequest): Promise<GenerationRequest | null> {
    // Convert string dates to Date objects for Drizzle
    const dbUpdates: any = { ...updates };
    if (dbUpdates.completedAt) {
      dbUpdates.completedAt = new Date(dbUpdates.completedAt);
    }
    if (dbUpdates.updatedAt) {
      dbUpdates.updatedAt = new Date(dbUpdates.updatedAt);
    } else {
      // Always update the updatedAt timestamp
      dbUpdates.updatedAt = new Date();
    }
    const [updated] = await getDb()
      .update(schema.generationRequests)
      .set(dbUpdates)
      .where(eq(schema.generationRequests.id, id))
      .returning();

    if (!updated) return null;

    console.log(`[Database Storage] Generation request updated: ID ${id}, status: ${updated.status}`);

    return {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      completedAt: updated.completedAt ? updated.completedAt.toISOString() : null,
      warnings: updated.warnings as GenerationRequest['warnings'],
      iterationData: updated.iterationData as GenerationRequest['iterationData'],
      attachments: updated.attachments as GenerationRequest['attachments'],
    };
  }

  // Note: Iteration snapshot operations removed - table dropped

  // ============================================================================
  // MULTI-GENERATION SUPPORT
  // ============================================================================

  /**
   * Get all active (generating, queued, paused) generations for a user
   */
  async getActiveGenerations(userId: string): Promise<GenerationRequestWithApp[]> {
    try {
      console.log('[Database Storage] Fetching active generations for user:', userId);

      const requests = await getDb()
        .select({
          // Generation request fields
          id: schema.generationRequests.id,
          appRefId: schema.generationRequests.appRefId,
          prompt: schema.generationRequests.prompt,
          status: schema.generationRequests.status,
          generationType: schema.generationRequests.generationType,
          createdAt: schema.generationRequests.createdAt,
          updatedAt: schema.generationRequests.updatedAt,
          completedAt: schema.generationRequests.completedAt,
          errorMessage: schema.generationRequests.errorMessage,
          mode: schema.generationRequests.mode,
          initialPrompt: schema.generationRequests.initialPrompt,
          maxIterations: schema.generationRequests.maxIterations,
          currentIteration: schema.generationRequests.currentIteration,
          lastSessionId: schema.generationRequests.lastSessionId,
          githubCommit: schema.generationRequests.githubCommit,
          totalCost: schema.generationRequests.totalCost,
          totalDuration: schema.generationRequests.totalDuration,
          warnings: schema.generationRequests.warnings,
          iterationData: schema.generationRequests.iterationData,
          poolIndex: schema.generationRequests.poolIndex,
          attachments: schema.generationRequests.attachments,
          // App fields (joined)
          userId: schema.apps.userId,
          appName: schema.apps.appName,
          appUuid: schema.apps.appUuid,
          githubUrl: schema.apps.githubUrl,
          deploymentUrl: schema.apps.deploymentUrl,
          cumulativeCost: schema.apps.cumulativeCost,
        })
        .from(schema.generationRequests)
        .innerJoin(schema.apps, eq(schema.generationRequests.appRefId, schema.apps.id))
        .where(
          and(
            eq(schema.apps.userId, userId),
            inArray(schema.generationRequests.status, ['generating', 'queued', 'paused'])
          )
        )
        .orderBy(desc(schema.generationRequests.createdAt));

      console.log(`[Database Storage] Found ${requests.length} active generations`);

      return requests.map(r => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        completedAt: r.completedAt ? r.completedAt.toISOString() : null,
        warnings: r.warnings as GenerationRequestWithApp['warnings'],
        iterationData: r.iterationData as GenerationRequestWithApp['iterationData'],
        attachments: r.attachments as GenerationRequestWithApp['attachments'],
      }));
    } catch (error) {
      console.error('[Database Storage] GET ACTIVE GENERATIONS ERROR:', error);
      throw error;
    }
  }

  /**
   * Count active generations for a user (for concurrency limiting)
   */
  async countActiveGenerations(userId: string): Promise<number> {
    try {
      const [result] = await getDb()
        .select({ count: count(schema.generationRequests.id) })
        .from(schema.generationRequests)
        .innerJoin(schema.apps, eq(schema.generationRequests.appRefId, schema.apps.id))
        .where(
          and(
            eq(schema.apps.userId, userId),
            inArray(schema.generationRequests.status, ['generating', 'queued', 'paused'])
          )
        );

      return Number(result?.count || 0);
    } catch (error) {
      console.error('[Database Storage] COUNT ACTIVE GENERATIONS ERROR:', error);
      throw error;
    }
  }

  // ============================================================================
  // FEEDBACK OPERATIONS
  // ============================================================================

  async createFeedback(userId: string, feedback: CreateFeedback): Promise<UserFeedback> {
    try {
      console.log('[Database Storage] Creating feedback from user:', userId, 'type:', feedback.type);

      const [newFeedback] = await getDb()
        .insert(schema.userFeedback)
        .values({
          userId,
          type: feedback.type,
          content: feedback.content,
          sourcePage: feedback.sourcePage,
          attachments: feedback.attachments || null,
        })
        .returning();

      console.log(`[Database Storage] Feedback created: ID ${newFeedback.id}`);

      return {
        ...newFeedback,
        attachments: newFeedback.attachments as any,
        createdAt: newFeedback.createdAt.toISOString(),
        updatedAt: newFeedback.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error('[Database Storage] CREATE FEEDBACK ERROR:', error);
      throw error;
    }
  }

  async getUserFeedback(userId: string): Promise<UserFeedback[]> {
    try {
      const feedback = await getDb()
        .select()
        .from(schema.userFeedback)
        .where(eq(schema.userFeedback.userId, userId))
        .orderBy(desc(schema.userFeedback.createdAt));

      return feedback.map(f => ({
        ...f,
        attachments: f.attachments as any,
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
      }));
    } catch (error) {
      console.error('[Database Storage] GET USER FEEDBACK ERROR:', error);
      throw error;
    }
  }
}

export const databaseStorage = new DatabaseStorage();

// ============================================================================
// STALE GENERATION CLEANUP
// ============================================================================
// Marks generations stuck in 'generating', 'queued', or 'paused' for >24 hours as failed

const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function cleanupStaleGenerations(): Promise<number> {
  try {
    const threshold = new Date(Date.now() - STALE_THRESHOLD_MS);

    console.log('[Stale Cleanup] Checking for generations stuck since:', threshold.toISOString());

    const result = await getDb()
      .update(schema.generationRequests)
      .set({
        status: 'failed',
        errorMessage: 'Generation timed out after 24 hours (marked as stale)',
        updatedAt: new Date(),
      })
      .where(
        and(
          inArray(schema.generationRequests.status, ['generating', 'queued', 'paused']),
          lt(schema.generationRequests.updatedAt, threshold)
        )
      )
      .returning({ id: schema.generationRequests.id });

    const count = result.length;
    if (count > 0) {
      console.log(`[Stale Cleanup] ⚠️ Marked ${count} stale generation(s) as failed:`, result.map(r => r.id));
    } else {
      console.log('[Stale Cleanup] No stale generations found');
    }

    return count;
  } catch (error) {
    console.error('[Stale Cleanup] Error during cleanup:', error);
    return 0;
  }
}

// Start periodic cleanup (every 15 minutes)
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

export function startStaleGenerationCleanup(): void {
  // Run immediately on startup
  cleanupStaleGenerations().catch(console.error);

  // Then run every 15 minutes
  cleanupInterval = setInterval(() => {
    cleanupStaleGenerations().catch(console.error);
  }, 15 * 60 * 1000);

  console.log('[Stale Cleanup] 🔄 Periodic cleanup started (every 15 minutes)');
}

export function stopStaleGenerationCleanup(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log('[Stale Cleanup] Periodic cleanup stopped');
  }
}
