import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, desc, asc, and, isNotNull } from 'drizzle-orm';
import { IStorage } from './factory';
import { GenerationRequest, InsertGenerationRequest, UpdateGenerationRequest, IterationSnapshot, InsertIterationSnapshot } from '../../../shared/schema.zod';
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
  // GENERATION REQUEST OPERATIONS
  // ============================================================================
  // Note: User management is handled by Supabase Auth.
  // We store userId (Supabase UUID) in generation_requests but no users table.

  /**
   * Get resumable apps for a user (for Resume dropdown)
   * Only returns completed generations with a github_url (required for resume)
   * Returns apps ordered by most recently updated
   * Includes all fields needed to populate a resume generation request
   */
  async getUserApps(userId: string): Promise<Array<{
    id: number;
    appId: string;
    appName: string;
    githubUrl: string;  // Guaranteed non-null (filtered)
    deploymentUrl: string | null;  // Fly.io URL for resume
    lastSessionId: string | null;
    updatedAt: string;
    status: string;
  }>> {
    try {
      console.log('[Database Storage] Fetching resumable apps for user:', userId);

      const apps = await getDb()
        .select({
          id: schema.generationRequests.id,
          appId: schema.generationRequests.appId,
          appName: schema.generationRequests.appName,
          githubUrl: schema.generationRequests.githubUrl,
          deploymentUrl: schema.generationRequests.deploymentUrl,
          lastSessionId: schema.generationRequests.lastSessionId,
          updatedAt: schema.generationRequests.updatedAt,
          status: schema.generationRequests.status,
        })
        .from(schema.generationRequests)
        .where(
          and(
            eq(schema.generationRequests.userId, userId),
            eq(schema.generationRequests.status, 'completed'),
            isNotNull(schema.generationRequests.githubUrl)
          )
        )
        .orderBy(desc(schema.generationRequests.updatedAt));

      console.log(`[Database Storage] Found ${apps.length} resumable apps`);

      return apps.map(app => ({
        ...app,
        githubUrl: app.githubUrl!,  // Safe - filtered by isNotNull
        updatedAt: app.updatedAt.toISOString(),
      }));
    } catch (error) {
      console.error('[Database Storage] GET APPS ERROR:', error);
      throw error;
    }
  }

  async getGenerationRequests(userId: string): Promise<GenerationRequest[]> {
    try {
      console.log('[Database Storage] Fetching requests for user:', userId);

      const requests = await getDb()
        .select()
        .from(schema.generationRequests)
        .where(eq(schema.generationRequests.userId, userId))
        .orderBy(desc(schema.generationRequests.createdAt))
        .limit(3); // Only show last 3 generations for performance

      console.log(`[Database Storage] Found ${requests.length} requests`);

      return requests.map(r => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        completedAt: r.completedAt ? r.completedAt.toISOString() : null,
      }));
    } catch (error) {
      console.error('[Database Storage] GET ERROR DETAILS:', error);
      console.error('[Database Storage] Error name:', (error as any)?.constructor?.name);
      console.error('[Database Storage] Error message:', (error as any)?.message);
      console.error('[Database Storage] Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw error;
    }
  }

  async getGenerationRequestById(id: number): Promise<GenerationRequest | null> {
    const requests = await getDb()
      .select()
      .from(schema.generationRequests)
      .where(eq(schema.generationRequests.id, id));

    if (requests.length === 0) return null;

    const r = requests[0];
    return {
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      completedAt: r.completedAt ? r.completedAt.toISOString() : null,
    };
  }

  async createGenerationRequest(request: InsertGenerationRequest): Promise<GenerationRequest> {
    try {
      console.log('[Database Storage] Attempting to create generation request:', JSON.stringify(request));

      const [newRequest] = await getDb()
        .insert(schema.generationRequests)
        .values(request)
        .returning();

      console.log(`[Database Storage] Generation request created: ID ${newRequest.id} for user ${newRequest.userId}`);

      return {
        ...newRequest,
        createdAt: newRequest.createdAt.toISOString(),
        updatedAt: newRequest.updatedAt.toISOString(),
        completedAt: newRequest.completedAt ? newRequest.completedAt.toISOString() : null,
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
    };
  }

  // ============================================================================
  // ITERATION SNAPSHOT OPERATIONS
  // ============================================================================

  async getIterationSnapshots(generationRequestId: number): Promise<IterationSnapshot[]> {
    try {
      console.log('[Database Storage] Fetching iteration snapshots for generation:', generationRequestId);

      const snapshots = await getDb()
        .select()
        .from(schema.iterationSnapshots)
        .where(eq(schema.iterationSnapshots.generationRequestId, generationRequestId))
        .orderBy(asc(schema.iterationSnapshots.iterationNumber));

      console.log(`[Database Storage] Found ${snapshots.length} snapshots`);

      return snapshots.map(s => ({
        ...s,
        timestamp: s.timestamp.toISOString(),
        // Ensure metadata is properly typed (JSONB may return as string)
        metadata: s.metadata ? (typeof s.metadata === 'string' ? JSON.parse(s.metadata) : s.metadata) : null,
      }));
    } catch (error) {
      console.error('[Database Storage] GET SNAPSHOTS ERROR:', error);
      throw error;
    }
  }

  async getIterationSnapshot(id: number): Promise<IterationSnapshot | null> {
    try {
      const [snapshot] = await getDb()
        .select()
        .from(schema.iterationSnapshots)
        .where(eq(schema.iterationSnapshots.id, id));

      if (!snapshot) return null;

      return {
        ...snapshot,
        timestamp: snapshot.timestamp.toISOString(),
        // Ensure metadata is properly typed (JSONB may return as string)
        metadata: snapshot.metadata ? (typeof snapshot.metadata === 'string' ? JSON.parse(snapshot.metadata) : snapshot.metadata) : null,
      };
    } catch (error) {
      console.error('[Database Storage] GET SNAPSHOT ERROR:', error);
      throw error;
    }
  }

  async createIterationSnapshot(snapshot: InsertIterationSnapshot): Promise<IterationSnapshot> {
    try {
      console.log('[Database Storage] Creating iteration snapshot:', {
        generationRequestId: snapshot.generationRequestId,
        iterationNumber: snapshot.iterationNumber,
        snapshotType: snapshot.snapshotType,
      });

      const [newSnapshot] = await getDb()
        .insert(schema.iterationSnapshots)
        .values(snapshot)
        .returning();

      console.log(`[Database Storage] Iteration snapshot created: ID ${newSnapshot.id} for generation ${newSnapshot.generationRequestId}, iteration ${newSnapshot.iterationNumber}`);

      return {
        ...newSnapshot,
        timestamp: newSnapshot.timestamp.toISOString(),
        // Ensure metadata is properly typed (JSONB may return as string)
        metadata: newSnapshot.metadata ? (typeof newSnapshot.metadata === 'string' ? JSON.parse(newSnapshot.metadata) : newSnapshot.metadata) : null,
      };
    } catch (error) {
      console.error('[Database Storage] CREATE SNAPSHOT ERROR:', error);
      throw error;
    }
  }

  async deleteIterationSnapshot(id: number): Promise<boolean> {
    try {
      console.log('[Database Storage] Deleting iteration snapshot:', id);

      const result = await getDb()
        .delete(schema.iterationSnapshots)
        .where(eq(schema.iterationSnapshots.id, id))
        .returning();

      const success = result.length > 0;
      console.log(`[Database Storage] Snapshot ${id} deleted: ${success}`);

      return success;
    } catch (error) {
      console.error('[Database Storage] DELETE SNAPSHOT ERROR:', error);
      throw error;
    }
  }
}

export const databaseStorage = new DatabaseStorage();
