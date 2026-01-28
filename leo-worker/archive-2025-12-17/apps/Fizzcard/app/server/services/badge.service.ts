/**
 * Badge Service
 *
 * Automatic badge award system that checks and awards badges based on user achievements.
 * Handles super-connector, early adopter, top earner, event host, and verified badges.
 */

import { storage } from '../lib/storage/factory';
import type { Badge } from '../../shared/schema.zod';

export class BadgeService {
  /**
   * Check and award Super-Connector badge to top 10% users
   * Run this periodically or after significant connection changes
   */
  async checkAndAwardSuperConnectorBadges(): Promise<void> {
    console.log('[BadgeService] Checking and awarding Super-Connector badges');

    try {
      // Get leaderboard sorted by connection count
      const leaderboard = await storage.getLeaderboard({ limit: 1000 });

      if (leaderboard.length === 0) {
        console.log('[BadgeService] No users found for Super-Connector badge check');
        return;
      }

      // Calculate top 10% threshold
      const top10PercentCount = Math.ceil(leaderboard.length * 0.1);
      const topUsers = leaderboard.slice(0, top10PercentCount);

      console.log(
        `[BadgeService] Top 10% = ${top10PercentCount} users out of ${leaderboard.length} total`
      );

      // Award badges to top users who qualify
      for (const user of topUsers) {
        // Minimum connection count requirement
        if (user.connectionCount < 10) {
          continue;
        }

        // Check if user already has super-connector badge
        const existingBadges = await storage.getBadgesByUserId(user.userId);
        const hasBadge = existingBadges.some((b) => b.badgeType === 'super_connector');

        if (!hasBadge) {
          // Award badge
          await storage.createBadge({
            userId: user.userId,
            badgeType: 'super_connector',
            earnedAt: new Date().toISOString(),
          });

          console.log(
            `[BadgeService] Awarded super_connector badge to user ${user.userId} ` +
              `(${user.connectionCount} connections)`
          );
        }
      }

      // Remove badge from users who fell out of top 10%
      const allBadges = await storage.getBadges();
      const superConnectorBadges = allBadges.filter((b) => b.badgeType === 'super_connector');
      const topUserIds = new Set(topUsers.map((u) => u.userId));

      for (const badge of superConnectorBadges) {
        if (!topUserIds.has(badge.userId)) {
          await storage.deleteBadge(badge.id);
          console.log(
            `[BadgeService] Removed super_connector badge from user ${badge.userId} ` +
              `(no longer in top 10%)`
          );
        }
      }

      console.log('[BadgeService] Super-Connector badge check completed');
    } catch (error) {
      console.error('[BadgeService] Error checking Super-Connector badges:', error);
      throw error;
    }
  }

  /**
   * Award early adopter badge to first 100 users
   */
  async checkAndAwardEarlyAdopterBadge(userId: number): Promise<void> {
    console.log(`[BadgeService] Checking early adopter badge for user ${userId}`);

    try {
      const users = await storage.getUsers();
      const userRank = users.findIndex((u) => u.id === userId) + 1;

      if (userRank <= 100) {
        const existingBadges = await storage.getBadgesByUserId(userId);
        const hasBadge = existingBadges.some((b) => b.badgeType === 'early_adopter');

        if (!hasBadge) {
          await storage.createBadge({
            userId,
            badgeType: 'early_adopter',
            earnedAt: new Date().toISOString(),
          });
          console.log(
            `[BadgeService] Awarded early_adopter badge to user ${userId} (rank: ${userRank})`
          );
        }
      }
    } catch (error) {
      console.error('[BadgeService] Error checking early adopter badge:', error);
      throw error;
    }
  }

  /**
   * Check and award Top Earner badge (top 5% by FizzCoins)
   */
  async checkAndAwardTopEarnerBadges(): Promise<void> {
    console.log('[BadgeService] Checking and awarding Top Earner badges');

    try {
      const leaderboard = await storage.getLeaderboard({ limit: 1000 });

      if (leaderboard.length === 0) {
        console.log('[BadgeService] No users found for Top Earner badge check');
        return;
      }

      // Sort by FizzCoin balance
      const sortedByBalance = [...leaderboard].sort(
        (a, b) => b.fizzCoinBalance - a.fizzCoinBalance
      );

      // Calculate top 5% threshold
      const top5PercentCount = Math.ceil(sortedByBalance.length * 0.05);
      const topEarners = sortedByBalance.slice(0, top5PercentCount);

      console.log(
        `[BadgeService] Top 5% = ${top5PercentCount} earners out of ${sortedByBalance.length} total`
      );

      // Award badges to top earners who qualify
      for (const user of topEarners) {
        // Minimum FizzCoin threshold
        if (user.fizzCoinBalance < 500) {
          continue;
        }

        const existingBadges = await storage.getBadgesByUserId(user.userId);
        const hasBadge = existingBadges.some((b) => b.badgeType === 'top_earner');

        if (!hasBadge) {
          await storage.createBadge({
            userId: user.userId,
            badgeType: 'top_earner',
            earnedAt: new Date().toISOString(),
          });
          console.log(
            `[BadgeService] Awarded top_earner badge to user ${user.userId} ` +
              `(${user.fizzCoinBalance} FizzCoins)`
          );
        }
      }

      // Remove badge from users who fell out of top 5%
      const allBadges = await storage.getBadges();
      const topEarnerBadges = allBadges.filter((b) => b.badgeType === 'top_earner');
      const topEarnerIds = new Set(topEarners.map((u) => u.userId));

      for (const badge of topEarnerBadges) {
        if (!topEarnerIds.has(badge.userId)) {
          await storage.deleteBadge(badge.id);
          console.log(
            `[BadgeService] Removed top_earner badge from user ${badge.userId} ` +
              `(no longer in top 5%)`
          );
        }
      }

      console.log('[BadgeService] Top Earner badge check completed');
    } catch (error) {
      console.error('[BadgeService] Error checking Top Earner badges:', error);
      throw error;
    }
  }

  /**
   * Award event host badge when user creates first event
   */
  async awardEventHostBadge(userId: number): Promise<void> {
    console.log(`[BadgeService] Checking event host badge for user ${userId}`);

    try {
      const existingBadges = await storage.getBadgesByUserId(userId);
      const hasBadge = existingBadges.some((b) => b.badgeType === 'event_host');

      if (!hasBadge) {
        await storage.createBadge({
          userId,
          badgeType: 'event_host',
          earnedAt: new Date().toISOString(),
        });
        console.log(`[BadgeService] Awarded event_host badge to user ${userId}`);
      }
    } catch (error) {
      console.error('[BadgeService] Error awarding event host badge:', error);
      throw error;
    }
  }

  /**
   * Get all badges for a user
   */
  async getUserBadges(userId: number): Promise<Badge[]> {
    return storage.getBadgesByUserId(userId);
  }

  /**
   * Refresh all automatic badges (super-connector and top earner)
   * This should be called periodically or on-demand
   */
  async refreshAllBadges(): Promise<void> {
    console.log('[BadgeService] Refreshing all automatic badges');

    try {
      await this.checkAndAwardSuperConnectorBadges();
      await this.checkAndAwardTopEarnerBadges();
      console.log('[BadgeService] All badges refreshed successfully');
    } catch (error) {
      console.error('[BadgeService] Error refreshing badges:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const badgeService = new BadgeService();
