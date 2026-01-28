/**
 * Badges Routes
 *
 * Badge management and admin endpoints
 */

import { Router, Request, Response } from 'express';
import { storage } from '../lib/storage/factory';
import { authMiddleware } from '../middleware/auth';
import { badgeService } from '../services/badge.service';

const router = Router();

/**
 * GET /api/badges
 * Get all badges (admin only)
 */
router.get('/', authMiddleware(), async (req: Request, res: Response) => {
  try {
    console.log('[Badges Routes] Get all badges');

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const badges = await storage.getBadges();

    res.status(200).json({ data: badges, total: badges.length });
  } catch (error) {
    console.error('[Badges Routes] Get all badges error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/badges/user/:userId
 * Get badges for a specific user
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    console.log(`[Badges Routes] Get badges for user: ${userId}`);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const badges = await storage.getBadgesByUserId(userId);

    // Enhance badges with metadata
    const enhancedBadges = badges.map((badge) => {
      const metadata = BADGE_METADATA[badge.badgeType] || {
        name: badge.badgeType,
        description: '',
      };
      return {
        ...badge,
        badgeName: metadata.name,
        badgeDescription: metadata.description,
      };
    });

    res.status(200).json(enhancedBadges);
  } catch (error) {
    console.error('[Badges Routes] Get user badges error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Badge type metadata
 */
const BADGE_METADATA: Record<string, { name: string; description: string }> = {
  super_connector: {
    name: 'Super-Connector',
    description: 'Top 10% networker by connection quality',
  },
  early_adopter: {
    name: 'Early Adopter',
    description: 'One of the first 100 users',
  },
  top_earner: {
    name: 'Top Earner',
    description: 'Top 5% FizzCoin earner',
  },
  event_host: {
    name: 'Event Host',
    description: 'Created an event',
  },
  verified: {
    name: 'Verified',
    description: 'Verified account',
  },
};

/**
 * GET /api/badges/my
 * Get badges for current user
 */
router.get('/my', authMiddleware(), async (req: Request, res: Response) => {
  try {
    console.log('[Badges Routes] Get my badges');

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const badges = await storage.getBadgesByUserId(req.user.id);

    // Enhance badges with metadata
    const enhancedBadges = badges.map((badge) => {
      const metadata = BADGE_METADATA[badge.badgeType] || {
        name: badge.badgeType,
        description: '',
      };
      return {
        ...badge,
        badgeName: metadata.name,
        badgeDescription: metadata.description,
      };
    });

    res.status(200).json(enhancedBadges);
  } catch (error) {
    console.error('[Badges Routes] Get my badges error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/badges/refresh
 * Refresh automatic badges (admin only)
 * Recalculates and awards super-connector and top earner badges
 */
router.post('/refresh', authMiddleware(), async (req: Request, res: Response) => {
  try {
    console.log('[Badges Routes] Refresh badges');

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Refresh all automatic badges
    await badgeService.refreshAllBadges();

    res.status(200).json({
      success: true,
      message: 'Badges refreshed successfully',
    });
  } catch (error) {
    console.error('[Badges Routes] Refresh badges error:', error);
    res.status(500).json({ error: 'Failed to refresh badges' });
  }
});

/**
 * POST /api/badges/award-verified
 * Manually award verified badge (admin only)
 */
router.post('/award-verified', authMiddleware(), async (req: Request, res: Response) => {
  try {
    console.log('[Badges Routes] Award verified badge');

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.body;

    if (!userId || typeof userId !== 'number') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Check if user exists
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user already has verified badge
    const existingBadges = await storage.getBadgesByUserId(userId);
    const hasBadge = existingBadges.some((b) => b.badgeType === 'verified');

    if (hasBadge) {
      return res.status(400).json({ error: 'User already has verified badge' });
    }

    // Award badge
    const badge = await storage.createBadge({
      userId,
      badgeType: 'verified',
      earnedAt: new Date().toISOString(),
    });

    console.log(`[Badges Routes] Verified badge awarded to user ${userId}`);

    res.status(201).json(badge);
  } catch (error) {
    console.error('[Badges Routes] Award verified badge error:', error);
    res.status(500).json({ error: 'Failed to award verified badge' });
  }
});

/**
 * DELETE /api/badges/:id
 * Remove a badge (admin only)
 */
router.delete('/:id', authMiddleware(), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`[Badges Routes] Delete badge: ${id}`);

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid badge ID' });
    }

    const deleted = await storage.deleteBadge(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Badge not found' });
    }

    console.log(`[Badges Routes] Badge deleted: ${id}`);

    res.status(200).json({ message: 'Badge deleted successfully' });
  } catch (error) {
    console.error('[Badges Routes] Delete badge error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
