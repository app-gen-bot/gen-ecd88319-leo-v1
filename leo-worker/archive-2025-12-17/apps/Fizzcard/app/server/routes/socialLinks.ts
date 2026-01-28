/**
 * Social Links Routes
 *
 * CRUD operations for social links associated with FizzCards
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../lib/storage/factory';
import { authMiddleware } from '../middleware/auth';
import { insertSocialLinksSchema } from '../../shared/schema.zod';

const router = Router();

/**
 * GET /api/fizzcards/:fizzcardId/social-links
 * Get social links for a FizzCard
 */
router.get('/fizzcards/:fizzcardId/social-links', async (req: Request, res: Response) => {
  try {
    const fizzcardId = parseInt(req.params.fizzcardId);
    console.log(`[SocialLinks Routes] Get social links for FizzCard: ${fizzcardId}`);

    const links = await storage.getSocialLinksByFizzCardId(fizzcardId);

    res.status(200).json(links);
  } catch (error) {
    console.error('[SocialLinks Routes] Get social links error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/fizzcards/:fizzcardId/social-links
 * Create social link for a FizzCard
 */
router.post('/fizzcards/:fizzcardId/social-links', authMiddleware(), async (req: Request, res: Response) => {
  try {
    const fizzcardId = parseInt(req.params.fizzcardId);
    console.log(`[SocialLinks Routes] Create social link for FizzCard: ${fizzcardId}`);

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if FizzCard exists and belongs to user
    const fizzCard = await storage.getFizzCardById(fizzcardId);
    if (!fizzCard) {
      return res.status(404).json({ error: 'FizzCard not found' });
    }

    if (fizzCard.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to add links to this FizzCard' });
    }

    // Validate request body
    const createSchema = insertSocialLinksSchema.omit({ fizzcardId: true });
    const validated = createSchema.parse(req.body);

    // Create social link
    const link = await storage.createSocialLink({
      ...validated,
      fizzcardId,
    });

    console.log(`[SocialLinks Routes] Social link created: ${link.id}`);

    res.status(201).json(link);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }

    console.error('[SocialLinks Routes] Create social link error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/social-links/:id
 * Update social link
 */
router.put('/social-links/:id', authMiddleware(), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`[SocialLinks Routes] Update social link: ${id}`);

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Validate request body
    const updateSchema = z.object({
      platform: z.enum(['linkedin', 'twitter', 'instagram', 'facebook', 'github', 'custom']).optional(),
      url: z.string().url().optional(),
    });

    const validated = updateSchema.parse(req.body);

    // Get existing link to verify ownership
    const existing = await storage.getSocialLinkById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Social link not found' });
    }

    // Get FizzCard to verify ownership
    const fizzCard = await storage.getFizzCardById(existing.fizzcardId);
    if (!fizzCard || fizzCard.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this social link' });
    }

    // Update social link
    const updated = await storage.updateSocialLink(id, validated);
    if (!updated) {
      return res.status(404).json({ error: 'Social link not found' });
    }

    console.log(`[SocialLinks Routes] Social link updated: ${id}`);

    res.status(200).json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }

    console.error('[SocialLinks Routes] Update social link error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/social-links/:id
 * Delete social link
 */
router.delete('/social-links/:id', authMiddleware(), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`[SocialLinks Routes] Delete social link: ${id}`);

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get all user's FizzCards to check ownership
    const userCards = await storage.getFizzCardsByUserId(req.user.id);
    const userCardIds = userCards.map(card => card.id);

    // Get all social links to find the one to delete
    const allLinks = await storage.getSocialLinks();
    const linkToDelete = allLinks.find(link => link.id === id);

    if (!linkToDelete) {
      return res.status(404).json({ error: 'Social link not found' });
    }

    // Check ownership
    if (!userCardIds.includes(linkToDelete.fizzcardId)) {
      return res.status(403).json({ error: 'Not authorized to delete this social link' });
    }

    // Delete social link
    const deleted = await storage.deleteSocialLink(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Social link not found' });
    }

    console.log(`[SocialLinks Routes] Social link deleted: ${id}`);

    res.status(200).json({ message: 'Social link deleted successfully' });
  } catch (error) {
    console.error('[SocialLinks Routes] Delete social link error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
