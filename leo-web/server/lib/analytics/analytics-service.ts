/**
 * Analytics Service - Derives metrics from existing database tables
 *
 * No new schema required - queries generationRequests, profiles, apps tables
 * to compute usage analytics for admin dashboard.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, count, sql, gte, desc, inArray } from 'drizzle-orm';
import * as schema from '../../../shared/schema';

// Lazy-load database connection
let client: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!db) {
    const connectionString = process.env.LEO_DATABASE_URL_POOLING || process.env.LEO_DATABASE_URL ||
                             process.env.DATABASE_URL_POOLING || process.env.DATABASE_URL || 'postgresql://placeholder';
    client = postgres(connectionString, {
      connect_timeout: 10,
      idle_timeout: 20,
      max_lifetime: 60 * 30,
    });
    db = drizzle(client, { schema });
  }
  return db;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface OverviewMetrics {
  totalUsers: number;
  activeUsers: number;  // Users with at least one generation
  pendingUsers: number;
  approvedUsers: number;
  totalGenerations: number;
  completedGenerations: number;
  failedGenerations: number;
  successRate: number;  // Percentage
  totalApps: number;
  deployedApps: number;
  totalCreditsUsed: number;
  avgGenerationDuration: number;  // Seconds
  avgGenerationCost: number;  // USD
}

export interface TimeSeriesPoint {
  date: string;  // ISO date (YYYY-MM-DD)
  count: number;
}

export interface GenerationsByStatus {
  status: string;
  count: number;
}

export interface TopUser {
  userId: string;
  email: string;
  name: string | null;
  generationCount: number;
  successCount: number;
  totalCost: number;
}

export interface RecentGeneration {
  id: number;
  appName: string;
  userEmail: string;
  status: string;
  duration: number | null;
  cost: number | null;
  createdAt: string;
}

export interface AnalyticsDashboard {
  overview: OverviewMetrics;
  generationsByDay: TimeSeriesPoint[];
  generationsByStatus: GenerationsByStatus[];
  topUsers: TopUser[];
  recentGenerations: RecentGeneration[];
}

// ============================================================================
// ANALYTICS SERVICE
// ============================================================================

class AnalyticsService {
  /**
   * Get overview metrics for the dashboard
   */
  async getOverviewMetrics(): Promise<OverviewMetrics> {
    const db = getDb();

    // User counts by status
    const userStats = await db
      .select({
        status: schema.profiles.status,
        count: count(schema.profiles.id),
      })
      .from(schema.profiles)
      .groupBy(schema.profiles.status);

    const totalUsers = userStats.reduce((sum, s) => sum + Number(s.count), 0);
    const pendingUsers = Number(userStats.find(s => s.status === 'pending_approval')?.count || 0);
    const approvedUsers = Number(userStats.find(s => s.status === 'approved')?.count || 0);

    // Generation counts by status
    const genStats = await db
      .select({
        status: schema.generationRequests.status,
        count: count(schema.generationRequests.id),
      })
      .from(schema.generationRequests)
      .groupBy(schema.generationRequests.status);

    const totalGenerations = genStats.reduce((sum, s) => sum + Number(s.count), 0);
    const completedGenerations = Number(genStats.find(s => s.status === 'completed')?.count || 0);
    const failedGenerations = Number(genStats.find(s => s.status === 'failed')?.count || 0);
    const successRate = totalGenerations > 0 ? (completedGenerations / totalGenerations) * 100 : 0;

    // Active users (users with at least one generation)
    const [activeUsersResult] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${schema.apps.userId})` })
      .from(schema.generationRequests)
      .innerJoin(schema.apps, eq(schema.generationRequests.appRefId, schema.apps.id));

    const activeUsers = Number(activeUsersResult?.count || 0);

    // App counts
    const [appStats] = await db
      .select({
        total: count(schema.apps.id),
        deployed: sql<number>`COUNT(CASE WHEN ${schema.apps.deploymentUrl} IS NOT NULL THEN 1 END)`,
      })
      .from(schema.apps);

    const totalApps = Number(appStats?.total || 0);
    const deployedApps = Number(appStats?.deployed || 0);

    // Total credits used
    const [creditsResult] = await db
      .select({ total: sql<number>`COALESCE(SUM(${schema.profiles.creditsUsed}), 0)` })
      .from(schema.profiles);

    const totalCreditsUsed = Number(creditsResult?.total || 0);

    // Average duration and cost for completed generations
    const [avgStats] = await db
      .select({
        avgDuration: sql<number>`AVG(${schema.generationRequests.totalDuration})`,
        avgCost: sql<number>`AVG(CAST(${schema.generationRequests.totalCost} AS DECIMAL))`,
      })
      .from(schema.generationRequests)
      .where(eq(schema.generationRequests.status, 'completed'));

    const avgGenerationDuration = Number(avgStats?.avgDuration || 0);
    const avgGenerationCost = Number(avgStats?.avgCost || 0);

    return {
      totalUsers,
      activeUsers,
      pendingUsers,
      approvedUsers,
      totalGenerations,
      completedGenerations,
      failedGenerations,
      successRate: Math.round(successRate * 10) / 10,
      totalApps,
      deployedApps,
      totalCreditsUsed,
      avgGenerationDuration: Math.round(avgGenerationDuration),
      avgGenerationCost: Math.round(avgGenerationCost * 10000) / 10000,
    };
  }

  /**
   * Get generations per day for the last N days
   */
  async getGenerationsByDay(days: number = 30): Promise<TimeSeriesPoint[]> {
    const db = getDb();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const results = await db
      .select({
        date: sql<string>`DATE(${schema.generationRequests.createdAt})`,
        count: count(schema.generationRequests.id),
      })
      .from(schema.generationRequests)
      .where(gte(schema.generationRequests.createdAt, startDate))
      .groupBy(sql`DATE(${schema.generationRequests.createdAt})`)
      .orderBy(sql`DATE(${schema.generationRequests.createdAt})`);

    return results.map(r => ({
      date: r.date,
      count: Number(r.count),
    }));
  }

  /**
   * Get generation counts by status
   */
  async getGenerationsByStatus(): Promise<GenerationsByStatus[]> {
    const db = getDb();

    const results = await db
      .select({
        status: schema.generationRequests.status,
        count: count(schema.generationRequests.id),
      })
      .from(schema.generationRequests)
      .groupBy(schema.generationRequests.status);

    return results.map(r => ({
      status: r.status,
      count: Number(r.count),
    }));
  }

  /**
   * Get top users by generation count
   */
  async getTopUsers(limit: number = 10): Promise<TopUser[]> {
    const db = getDb();

    // Get user generation stats
    const results = await db
      .select({
        userId: schema.apps.userId,
        generationCount: count(schema.generationRequests.id),
        successCount: sql<number>`COUNT(CASE WHEN ${schema.generationRequests.status} = 'completed' THEN 1 END)`,
        totalCost: sql<number>`COALESCE(SUM(CAST(${schema.generationRequests.totalCost} AS DECIMAL)), 0)`,
      })
      .from(schema.generationRequests)
      .innerJoin(schema.apps, eq(schema.generationRequests.appRefId, schema.apps.id))
      .groupBy(schema.apps.userId)
      .orderBy(desc(count(schema.generationRequests.id)))
      .limit(limit);

    // Get user details
    const userIds = results.map(r => r.userId);
    const profiles = userIds.length > 0
      ? await db
          .select({
            id: schema.profiles.id,
            email: schema.profiles.email,
            name: schema.profiles.name,
          })
          .from(schema.profiles)
          .where(inArray(schema.profiles.id, userIds))
      : [];

    const profileMap = new Map(profiles.map(p => [p.id, p]));

    return results.map(r => {
      const profile = profileMap.get(r.userId);
      return {
        userId: r.userId,
        email: profile?.email || 'Unknown',
        name: profile?.name || null,
        generationCount: Number(r.generationCount),
        successCount: Number(r.successCount),
        totalCost: Math.round(Number(r.totalCost) * 10000) / 10000,
      };
    });
  }

  /**
   * Get recent generations for activity feed
   */
  async getRecentGenerations(limit: number = 20): Promise<RecentGeneration[]> {
    const db = getDb();

    const results = await db
      .select({
        id: schema.generationRequests.id,
        appName: schema.apps.appName,
        userId: schema.apps.userId,
        status: schema.generationRequests.status,
        duration: schema.generationRequests.totalDuration,
        cost: schema.generationRequests.totalCost,
        createdAt: schema.generationRequests.createdAt,
      })
      .from(schema.generationRequests)
      .innerJoin(schema.apps, eq(schema.generationRequests.appRefId, schema.apps.id))
      .orderBy(desc(schema.generationRequests.createdAt))
      .limit(limit);

    // Get user emails
    const userIds = [...new Set(results.map(r => r.userId))];
    const profiles = userIds.length > 0
      ? await db
          .select({
            id: schema.profiles.id,
            email: schema.profiles.email,
          })
          .from(schema.profiles)
          .where(inArray(schema.profiles.id, userIds))
      : [];

    const emailMap = new Map(profiles.map(p => [p.id, p.email]));

    return results.map(r => ({
      id: r.id,
      appName: r.appName,
      userEmail: emailMap.get(r.userId) || 'Unknown',
      status: r.status,
      duration: r.duration,
      cost: r.cost ? parseFloat(r.cost) : null,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  /**
   * Get full analytics dashboard data
   */
  async getDashboard(): Promise<AnalyticsDashboard> {
    const [overview, generationsByDay, generationsByStatus, topUsers, recentGenerations] = await Promise.all([
      this.getOverviewMetrics(),
      this.getGenerationsByDay(30),
      this.getGenerationsByStatus(),
      this.getTopUsers(10),
      this.getRecentGenerations(20),
    ]);

    return {
      overview,
      generationsByDay,
      generationsByStatus,
      topUsers,
      recentGenerations,
    };
  }
}

export const analyticsService = new AnalyticsService();
