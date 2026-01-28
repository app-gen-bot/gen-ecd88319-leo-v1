/**
 * Super-Connector Service
 *
 * Algorithms for identifying and ranking super-connectors based on:
 * - Number of verified connections
 * - Connection diversity (different locations)
 * - Introduction success rate
 * - FizzCoin balance
 */

import { storage } from '../lib/storage/factory';
import type { User } from '../../shared/schema.zod';

interface ConnectionStrengthScore {
  userId: number;
  connectionCount: number;
  locationDiversity: number;
  introductionSuccessRate: number;
  fizzCoinBalance: number;
  strengthScore: number;
}

interface SuperConnectorProfile {
  userId: number;
  name: string;
  avatarUrl: string | null;
  title: string | null;
  company: string | null;
  bio: string | null;
  connectionCount: number;
  fizzCoinBalance: number;
  strengthScore: number;
  badges: string[];
  industries: string[];
  locations: string[];
}

export class SuperConnectorService {
  /**
   * Calculate connection strength score for a user
   * Score is 0-100 based on multiple factors
   */
  async calculateConnectionStrength(userId: number): Promise<number> {
    console.log(`[SuperConnector] Calculating connection strength for user ${userId}`);

    const [connections, introductions, wallet] = await Promise.all([
      storage.getConnectionsByUserId(userId),
      storage.getIntroductionsByIntroducerId(userId),
      storage.getWalletByUserId(userId),
    ]);

    // 1. Connection Count (max 40 points)
    const connectionCount = connections.length;
    const connectionScore = Math.min(connectionCount * 2, 40);

    // 2. Location Diversity (max 20 points)
    const uniqueLocations = new Set(
      connections.map((c) => c.exchangeId).filter(Boolean)
    ).size;
    const locationScore = Math.min(uniqueLocations * 4, 20);

    // 3. Introduction Success Rate (max 20 points)
    const completedIntros = introductions.filter((i) => i.status === 'completed').length;
    const introSuccessRate = introductions.length > 0 ? completedIntros / introductions.length : 0;
    const introScore = introSuccessRate * 20;

    // 4. FizzCoin Balance (max 20 points)
    const balance = wallet?.balance || 0;
    const balanceScore = Math.min(balance / 50, 20); // 1000 FizzCoins = max score

    const strengthScore = Math.round(connectionScore + locationScore + introScore + balanceScore);

    console.log(
      `[SuperConnector] Strength score for user ${userId}: ${strengthScore} ` +
        `(connections: ${connectionScore}, location: ${locationScore}, ` +
        `intros: ${introScore}, balance: ${balanceScore})`
    );

    return strengthScore;
  }

  /**
   * Get top super-connectors
   */
  async getSuperConnectors(limit = 20): Promise<SuperConnectorProfile[]> {
    console.log(`[SuperConnector] Getting top ${limit} super-connectors`);

    // Get all users
    const users = await storage.getUsers();

    // Calculate strength scores for all users
    const scoresPromises = users.map(async (user) => {
      const score = await this.calculateConnectionStrength(user.id);
      return {
        user,
        strengthScore: score,
      };
    });

    const scores = await Promise.all(scoresPromises);

    // Sort by strength score (descending)
    scores.sort((a, b) => b.strengthScore - a.strengthScore);

    // Take top limit
    const topConnectors = scores.slice(0, limit);

    // Build full profiles
    const profiles = await Promise.all(
      topConnectors.map(async ({ user, strengthScore }) => {
        const [connections, wallet, badges] = await Promise.all([
          storage.getConnectionsByUserId(user.id),
          storage.getWalletByUserId(user.id),
          storage.getBadgesByUserId(user.id),
        ]);

        // Extract unique locations and industries from connections
        const locations = new Set<string>();
        const industries = new Set<string>();

        for (const conn of connections) {
          // Get connected user's info for diversity
          const connectedUser = await storage.getUserById(conn.connectedUserId);
          if (connectedUser?.company) {
            industries.add(connectedUser.company);
          }

          // Get exchange for location
          if (conn.exchangeId) {
            const exchange = await storage.getContactExchangeById(conn.exchangeId);
            if (exchange?.locationName) {
              locations.add(exchange.locationName);
            }
          }
        }

        const profile: SuperConnectorProfile = {
          userId: user.id,
          name: user.name,
          avatarUrl: user.avatarUrl || null,
          title: user.title || null,
          company: user.company || null,
          bio: user.bio || null,
          connectionCount: connections.length,
          fizzCoinBalance: wallet?.balance || 0,
          strengthScore,
          badges: badges.map((b) => b.badgeType),
          industries: Array.from(industries).slice(0, 5),
          locations: Array.from(locations).slice(0, 5),
        };

        return profile;
      })
    );

    console.log(`[SuperConnector] Returning ${profiles.length} super-connector profiles`);
    return profiles;
  }

  /**
   * Check if a user qualifies as a super-connector
   * Top 10% of users by strength score
   */
  async isSuperConnector(userId: number): Promise<boolean> {
    console.log(`[SuperConnector] Checking if user ${userId} is a super-connector`);

    const users = await storage.getUsers();
    const scoresPromises = users.map(async (user) => ({
      userId: user.id,
      score: await this.calculateConnectionStrength(user.id),
    }));

    const scores = await Promise.all(scoresPromises);
    scores.sort((a, b) => b.score - a.score);

    // Top 10% threshold
    const top10PercentIndex = Math.ceil(scores.length * 0.1);
    const userScore = scores.find((s) => s.userId === userId)?.score || 0;
    const threshold = scores[top10PercentIndex - 1]?.score || 0;

    const isSuper = userScore >= threshold;

    console.log(
      `[SuperConnector] User ${userId} ${isSuper ? 'IS' : 'is NOT'} a super-connector ` +
        `(score: ${userScore}, threshold: ${threshold})`
    );

    return isSuper;
  }

  /**
   * Award super-connector badge to qualifying users
   */
  async updateSuperConnectorBadges(): Promise<void> {
    console.log('[SuperConnector] Updating super-connector badges');

    const users = await storage.getUsers();

    for (const user of users) {
      const isSuper = await this.isSuperConnector(user.id);
      const badges = await storage.getBadgesByUserId(user.id);
      const hasBadge = badges.some((b) => b.badgeType === 'super_connector');

      if (isSuper && !hasBadge) {
        // Award badge
        await storage.createBadge({
          userId: user.id,
          badgeType: 'super_connector',
          earnedAt: new Date().toISOString(),
        });
        console.log(`[SuperConnector] Awarded super-connector badge to user ${user.id}`);
      }
    }

    console.log('[SuperConnector] Badge update completed');
  }

  /**
   * Get user's rank on the leaderboard
   */
  async getUserRank(userId: number): Promise<{
    rank: number;
    totalUsers: number;
    percentile: number;
    fizzCoinBalance: number;
    connectionCount: number;
  }> {
    console.log(`[SuperConnector] Getting rank for user ${userId}`);

    const users = await storage.getUsers();
    const scoresPromises = users.map(async (user) => ({
      userId: user.id,
      score: await this.calculateConnectionStrength(user.id),
    }));

    const scores = await Promise.all(scoresPromises);
    scores.sort((a, b) => b.score - a.score);

    const userIndex = scores.findIndex((s) => s.userId === userId);
    const rank = userIndex + 1; // 1-indexed

    const [wallet, connections] = await Promise.all([
      storage.getWalletByUserId(userId),
      storage.getConnectionsByUserId(userId),
    ]);

    const percentile = Math.round((1 - userIndex / scores.length) * 100);

    return {
      rank,
      totalUsers: scores.length,
      percentile,
      fizzCoinBalance: wallet?.balance || 0,
      connectionCount: connections.length,
    };
  }
}

// Export singleton instance
export const superConnectorService = new SuperConnectorService();
