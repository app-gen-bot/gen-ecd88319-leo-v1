/**
 * Leaderboard Routes
 *
 * Rankings and super-connector discovery
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../lib/storage/factory';
import { authMiddleware } from '../middleware/auth';
import { superConnectorService } from '../services/super-connector.service';
import { leaderboardQuerySchema } from '../../shared/schema.zod';

const router = Router();

/**
 * GET /api/leaderboard
 * Get leaderboard with optional filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('[Leaderboard Routes] Get leaderboard');

    const query = leaderboardQuerySchema.parse(req.query);
    const offset = (query.page - 1) * query.limit;

    // Get all users with their stats
    const users = await storage.getUsers();

    const leaderboardEntries = await Promise.all(
      users.map(async (user, index) => {
        const [wallet, connections, badges] = await Promise.all([
          storage.getWalletByUserId(user.id),
          storage.getConnectionsByUserId(user.id),
          storage.getBadgesByUserId(user.id),
        ]);

        const isSuperConnector = badges.some((b) => b.badgeType === 'super_connector');

        return {
          userId: user.id,
          name: user.name,
          avatarUrl: user.avatarUrl || null,
          title: user.title || null,
          company: user.company || null,
          fizzCoinBalance: wallet?.balance || 0,
          connectionCount: connections.length,
          isSuperConnector,
          badges: badges.map((b) => b.badgeType),
          rank: 0, // Will be set after sorting
        };
      })
    );

    // Sort by FizzCoin balance (descending)
    leaderboardEntries.sort((a, b) => b.fizzCoinBalance - a.fizzCoinBalance);

    // Set ranks
    leaderboardEntries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Manual pagination
    const total = leaderboardEntries.length;
    const data = leaderboardEntries.slice(offset, offset + query.limit);

    res.status(200).json({
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    console.error('[Leaderboard Routes] Get leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/super-connectors
 * Discover super-connectors with filters
 */
router.get('/super-connectors', async (req: Request, res: Response) => {
  try {
    console.log('[Leaderboard Routes] Get super-connectors');

    const querySchema = z.object({
      location: z.string().optional(),
      industry: z.string().optional(),
      minConnections: z.coerce.number().optional(),
      page: z.coerce.number().min(1).optional().default(1),
      limit: z.coerce.number().min(1).max(100).optional().default(20),
    });

    const query = querySchema.parse(req.query);
    const offset = (query.page - 1) * query.limit;

    // Get super-connectors
    let superConnectors = await superConnectorService.getSuperConnectors(100);

    // Apply filters
    if (query.minConnections !== undefined) {
      superConnectors = superConnectors.filter(
        (sc) => sc.connectionCount >= query.minConnections!
      );
    }

    if (query.location) {
      superConnectors = superConnectors.filter((sc) =>
        sc.locations.some((loc) => loc.toLowerCase().includes(query.location!.toLowerCase()))
      );
    }

    if (query.industry) {
      superConnectors = superConnectors.filter((sc) =>
        sc.industries.some((ind) => ind.toLowerCase().includes(query.industry!.toLowerCase()))
      );
    }

    // Manual pagination
    const total = superConnectors.length;
    const data = superConnectors.slice(offset, offset + query.limit);

    res.status(200).json({
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    console.error('[Leaderboard Routes] Get super-connectors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/leaderboard/my-rank
 * Get my current rank on the leaderboard
 */
router.get('/my-rank', authMiddleware(), async (req: Request, res: Response) => {
  try {
    console.log('[Leaderboard Routes] Get my rank');

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const rank = await superConnectorService.getUserRank(req.user.id);

    res.status(200).json(rank);
  } catch (error) {
    console.error('[Leaderboard Routes] Get my rank error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
