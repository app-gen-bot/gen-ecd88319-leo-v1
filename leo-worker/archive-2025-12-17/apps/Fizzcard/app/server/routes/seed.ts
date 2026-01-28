/**
 * Seed Route
 *
 * API endpoint to seed the database with test data
 * Only works in development mode
 */

import { Router, Request, Response } from 'express';
import { seedDatabase } from '../lib/seed-data';
import { seedEnhancedDatabase } from '../lib/seed-data-enhanced';

const router = Router();

/**
 * POST /api/seed
 * Seed the database with basic test data (development only)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Seeding not allowed in production' });
    }

    console.log('[Seed Route] Starting database seeding...');

    const summary = await seedDatabase();

    console.log('[Seed Route] Seeding completed successfully');

    res.status(200).json({
      success: true,
      message: 'Database seeded successfully',
      summary,
    });
  } catch (error) {
    console.error('[Seed Route] Seeding error:', error);
    res.status(500).json({
      error: 'Seeding failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/seed/enhanced
 * Seed the database with enhanced network data for graph visualization (development only)
 */
router.post('/enhanced', async (req: Request, res: Response) => {
  try {
    // Allow in production if AUTH_MODE is mock (demo mode)
    if (process.env.NODE_ENV === 'production' && process.env.AUTH_MODE !== 'mock') {
      return res.status(403).json({ error: 'Seeding not allowed in production (except in demo mode with AUTH_MODE=mock)' });
    }

    console.log('[Seed Route] Starting enhanced database seeding...');

    const summary = await seedEnhancedDatabase();

    console.log('[Seed Route] Enhanced seeding completed successfully');

    res.status(200).json({
      success: true,
      message: 'Database seeded with enhanced network data',
      summary,
    });
  } catch (error) {
    console.error('[Seed Route] Enhanced seeding error:', error);
    res.status(500).json({
      error: 'Enhanced seeding failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
