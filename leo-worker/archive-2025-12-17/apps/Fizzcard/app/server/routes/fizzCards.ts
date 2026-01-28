/**
 * FizzCards Routes
 *
 * CRUD operations for FizzCards (digital business cards)
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../lib/storage/factory';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import { insertFizzCardsSchema, fizzCardsQuerySchema } from '../../shared/schema.zod';

const router = Router();

/**
 * GET /api/fizzcards
 * Get all public FizzCards with pagination
 */
router.get('/', optionalAuthMiddleware(), async (req: Request, res: Response) => {
  try {
    console.log('[FizzCards Routes] Get all FizzCards');

    const query = fizzCardsQuerySchema.parse(req.query);
    const offset = (query.page - 1) * query.limit;

    // Get FizzCards with filters
    const allCards = await storage.getFizzCards({
      isActive: query.isActive,
    });

    // Manual pagination
    const total = allCards.length;
    const data = allCards.slice(offset, offset + query.limit);

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
    console.error('[FizzCards Routes] Get all error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/fizzcards/my
 * Get my FizzCards
 */
router.get('/my', authMiddleware(), async (req: Request, res: Response) => {
  try {
    console.log('[FizzCards Routes] Get my FizzCards');

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const cards = await storage.getFizzCardsByUserId(req.user.id);

    res.status(200).json(cards);
  } catch (error) {
    console.error('[FizzCards Routes] Get my FizzCards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/fizzcards/:id
 * Get single FizzCard by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`[FizzCards Routes] Get FizzCard: ${id}`);

    const card = await storage.getFizzCardById(id);
    if (!card) {
      return res.status(404).json({ error: 'FizzCard not found' });
    }

    res.status(200).json(card);
  } catch (error) {
    console.error('[FizzCards Routes] Get FizzCard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/fizzcards
 * Create new FizzCard
 */
router.post('/', authMiddleware(), async (req: Request, res: Response) => {
  try {
    console.log('[FizzCards Routes] Create FizzCard');

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Validate request body
    const createSchema = insertFizzCardsSchema.omit({ userId: true });
    const validated = createSchema.parse(req.body);

    // Create FizzCard
    const card = await storage.createFizzCard({
      ...validated,
      userId: req.user.id,
    });

    console.log(`[FizzCards Routes] FizzCard created: ${card.id}`);

    res.status(201).json(card);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }

    console.error('[FizzCards Routes] Create FizzCard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/fizzcards/:id
 * Update FizzCard
 */
router.put('/:id', authMiddleware(), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`[FizzCards Routes] Update FizzCard: ${id}`);

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if FizzCard exists
    const existingCard = await storage.getFizzCardById(id);
    if (!existingCard) {
      return res.status(404).json({ error: 'FizzCard not found' });
    }

    // Check ownership
    if (existingCard.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this FizzCard' });
    }

    // Validate request body
    const updateSchema = z.object({
      displayName: z.string().min(1).optional(),
      title: z.string().optional(),
      company: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      website: z.string().url().optional(),
      address: z.string().optional(),
      bio: z.string().optional(),
      avatarUrl: z.string().url().optional(),
      themeColor: z.string().optional(),
      isActive: z.boolean().optional(),
    });

    const validated = updateSchema.parse(req.body);

    // Update FizzCard
    const updatedCard = await storage.updateFizzCard(id, validated);
    if (!updatedCard) {
      return res.status(404).json({ error: 'FizzCard not found' });
    }

    console.log(`[FizzCards Routes] FizzCard updated: ${id}`);

    res.status(200).json(updatedCard);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }

    console.error('[FizzCards Routes] Update FizzCard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/fizzcards/:id
 * Delete FizzCard
 */
router.delete('/:id', authMiddleware(), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`[FizzCards Routes] Delete FizzCard: ${id}`);

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if FizzCard exists
    const existingCard = await storage.getFizzCardById(id);
    if (!existingCard) {
      return res.status(404).json({ error: 'FizzCard not found' });
    }

    // Check ownership
    if (existingCard.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this FizzCard' });
    }

    // Delete FizzCard
    const deleted = await storage.deleteFizzCard(id);
    if (!deleted) {
      return res.status(404).json({ error: 'FizzCard not found' });
    }

    console.log(`[FizzCards Routes] FizzCard deleted: ${id}`);

    res.status(200).json({ message: 'FizzCard deleted successfully' });
  } catch (error) {
    console.error('[FizzCards Routes] Delete FizzCard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
