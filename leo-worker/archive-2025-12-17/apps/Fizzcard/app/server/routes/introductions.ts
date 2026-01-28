/**
 * Introductions Routes
 *
 * Handles introduction creation and management, allowing users to
 * introduce two of their connections and earn FizzCoins.
 */

import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { storage } from '../lib/storage/factory';
import { fizzCoinService } from '../services/fizzcoin.service';
import { blockchainFizzCoinService } from '../services/blockchain/fizzcoin.service';
import { badgeService } from '../services/badge.service';
import { insertIntroductionsSchema, introductionsQuerySchema } from '../../shared/schema.zod';
import type { Introduction } from '../../shared/schema.zod';

const router = Router();

/**
 * POST /introductions
 * Create a new introduction between two connections
 */
router.post('/introductions', authMiddleware(), async (req, res) => {
  try {
    console.log('[Introductions] Creating introduction:', req.body);

    // Validate request body
    const bodySchema = insertIntroductionsSchema.omit({
      introducerId: true,
      status: true,
      fizzcoinReward: true,
    });

    const validated = bodySchema.parse(req.body);

    // Verify introducer is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify personA and personB are different
    if (validated.personAId === validated.personBId) {
      return res.status(400).json({ error: 'Cannot introduce a person to themselves' });
    }

    // Verify personA and personB are in introducer's connections
    const connections = await storage.getConnectionsByUserId(req.user.id);
    const connectedUserIds = connections.map((c) => c.connectedUserId);

    if (!connectedUserIds.includes(validated.personAId)) {
      return res.status(403).json({ error: 'PersonA is not in your connections' });
    }

    if (!connectedUserIds.includes(validated.personBId)) {
      return res.status(403).json({ error: 'PersonB is not in your connections' });
    }

    // Verify both users exist
    const [personA, personB] = await Promise.all([
      storage.getUserById(validated.personAId),
      storage.getUserById(validated.personBId),
    ]);

    if (!personA) {
      return res.status(404).json({ error: 'PersonA not found' });
    }

    if (!personB) {
      return res.status(404).json({ error: 'PersonB not found' });
    }

    // Create introduction with status "pending"
    const introduction = await storage.createIntroduction({
      introducerId: req.user.id,
      personAId: validated.personAId,
      personBId: validated.personBId,
      context: validated.context || null,
      status: 'pending',
      fizzcoinReward: 0,
    });

    console.log('[Introductions] Introduction created:', introduction.id);
    res.status(201).json(introduction);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('[Introductions] Validation error:', error.errors);
      return res.status(400).json({ error: error.errors });
    }

    console.error('[Introductions] Error creating introduction:', error);
    res.status(500).json({ error: 'Failed to create introduction' });
  }
});

/**
 * GET /api/introductions/received
 * Get introductions where the authenticated user is personA or personB
 */
router.get('/introductions/received', authMiddleware(), async (req, res) => {
  try {
    console.log('[Introductions] Getting received introductions for user:', req.user?.id);

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Parse query parameters
    const query = introductionsQuerySchema.parse(req.query);

    // Get introductions where user is personA or personB
    let introductions = await storage.getIntroductionsByPersonId(req.user.id);

    // Filter by status
    if (query.status) {
      introductions = introductions.filter((i) => i.status === query.status);
    }

    // Enrich with user details
    const enrichedIntroductions = await Promise.all(
      introductions.map(async (intro) => {
        const [introducer, personA, personB] = await Promise.all([
          storage.getUserById(intro.introducerId),
          storage.getUserById(intro.personAId),
          storage.getUserById(intro.personBId),
        ]);

        return {
          ...intro,
          introducerName: introducer?.name || 'Unknown',
          personAName: personA?.name || 'Unknown',
          personBName: personB?.name || 'Unknown',
          personAAvatar: personA?.avatarUrl || null,
          personBAvatar: personB?.avatarUrl || null,
          personATitle: personA?.title || null,
          personBTitle: personB?.title || null,
          personACompany: personA?.company || null,
          personBCompany: personB?.company || null,
        };
      })
    );

    // Sort by createdAt (newest first)
    enrichedIntroductions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    // Pagination
    const total = enrichedIntroductions.length;
    const totalPages = Math.ceil(total / query.limit);
    const startIndex = (query.page - 1) * query.limit;
    const endIndex = startIndex + query.limit;
    const paginatedData = enrichedIntroductions.slice(startIndex, endIndex);

    console.log(
      `[Introductions] Found ${total} received introductions (page ${query.page}/${totalPages})`
    );

    res.json({
      data: paginatedData,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('[Introductions] Validation error:', error.errors);
      return res.status(400).json({ error: error.errors });
    }

    console.error('[Introductions] Error getting received introductions:', error);
    res.status(500).json({ error: 'Failed to get received introductions' });
  }
});

/**
 * GET /api/introductions/made
 * Get introductions made by the authenticated user (as introducer)
 */
router.get('/introductions/made', authMiddleware(), async (req, res) => {
  try {
    console.log('[Introductions] Getting made introductions for user:', req.user?.id);

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Parse query parameters
    const query = introductionsQuerySchema.parse(req.query);

    // Get introductions made by user
    let introductions = await storage.getIntroductionsByIntroducerId(req.user.id);

    // Filter by status
    if (query.status) {
      introductions = introductions.filter((i) => i.status === query.status);
    }

    // Enrich with user details
    const enrichedIntroductions = await Promise.all(
      introductions.map(async (intro) => {
        const [introducer, personA, personB] = await Promise.all([
          storage.getUserById(intro.introducerId),
          storage.getUserById(intro.personAId),
          storage.getUserById(intro.personBId),
        ]);

        return {
          ...intro,
          introducerName: introducer?.name || 'Unknown',
          personAName: personA?.name || 'Unknown',
          personBName: personB?.name || 'Unknown',
          personAAvatar: personA?.avatarUrl || null,
          personBAvatar: personB?.avatarUrl || null,
          personATitle: personA?.title || null,
          personBTitle: personB?.title || null,
          personACompany: personA?.company || null,
          personBCompany: personB?.company || null,
        };
      })
    );

    // Sort by createdAt (newest first)
    enrichedIntroductions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    // Pagination
    const total = enrichedIntroductions.length;
    const totalPages = Math.ceil(total / query.limit);
    const startIndex = (query.page - 1) * query.limit;
    const endIndex = startIndex + query.limit;
    const paginatedData = enrichedIntroductions.slice(startIndex, endIndex);

    console.log(
      `[Introductions] Found ${total} made introductions (page ${query.page}/${totalPages})`
    );

    res.json({
      data: paginatedData,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('[Introductions] Validation error:', error.errors);
      return res.status(400).json({ error: error.errors });
    }

    console.error('[Introductions] Error getting made introductions:', error);
    res.status(500).json({ error: 'Failed to get made introductions' });
  }
});

/**
 * PUT /api/introductions/:id/accept
 * Accept an introduction (must be personA or personB)
 */
router.put('/introductions/:id/accept', authMiddleware(), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    console.log('[Introductions] Accepting introduction:', id);

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid introduction ID' });
    }

    // Get introduction
    const introduction = await storage.getIntroductionById(id);
    if (!introduction) {
      return res.status(404).json({ error: 'Introduction not found' });
    }

    // Verify user is personA or personB
    if (introduction.personAId !== req.user.id && introduction.personBId !== req.user.id) {
      return res.status(403).json({ error: 'You are not part of this introduction' });
    }

    // Check if already completed or declined
    if (introduction.status === 'completed') {
      return res.status(400).json({ error: 'Introduction already completed' });
    }

    if (introduction.status === 'declined') {
      return res.status(400).json({ error: 'Introduction was declined' });
    }

    // Update status to completed (simplified: accept by either person completes it)
    // In a real app, you might track acceptance from both parties separately
    const updatedIntroduction = await storage.updateIntroduction(id, {
      status: 'completed',
    });

    if (!updatedIntroduction) {
      return res.status(500).json({ error: 'Failed to update introduction' });
    }

    // Award FizzCoins to introducer (blockchain-first, database fallback)
    // The service calculates super-connector bonus automatically
    let fizzcoinsAwarded = 50;

    // Try blockchain-first, fall back to database
    const introducerWallet = await storage.getCryptoWalletByUserId(introduction.introducerId);
    if (introducerWallet && blockchainFizzCoinService.isBlockchainEnabled()) {
      // Check if introducer is a super-connector for the amount
      const introducerBadges = await storage.getBadgesByUserId(introduction.introducerId);
      const hasSuperConnectorBadge = introducerBadges.some(
        (b) => b.badgeType === 'super_connector'
      );

      if (hasSuperConnectorBadge) {
        fizzcoinsAwarded = 100;
        console.log(`[Introductions] Super-connector bonus! ${introduction.introducerId} gets 100 FIZZ`);
      }

      console.log(`[Introductions] Awarding ${fizzcoinsAwarded} FIZZ to introducer ${introduction.introducerId} via blockchain`);
      try {
        const txResult = await blockchainFizzCoinService.creditReward(
          introducerWallet.walletAddress,
          fizzcoinsAwarded,
          'introduction_completed'
        );

        // Update pending claim amount cache in database
        await storage.incrementPendingClaims(introduction.introducerId, fizzcoinsAwarded);

        // Record transaction in database with blockchain metadata
        await storage.createFizzCoinTransaction({
          userId: introduction.introducerId,
          amount: fizzcoinsAwarded,
          transactionType: 'reward_earned',
          txHash: txResult.hash,
          metadata: {
            introductionId: id,
            reason: 'introduction_completed',
            personAId: introduction.personAId,
            personBId: introduction.personBId,
            isSuperConnector: hasSuperConnectorBadge,
          },
        });

        console.log(`[Introductions] Introducer reward credited on blockchain. TX: ${txResult.hash}`);
      } catch (error: any) {
        console.error(`[Introductions] Blockchain reward failed for introducer ${introduction.introducerId}, falling back to database:`, error.message);
        // Fallback to database - service calculates super-connector bonus
        fizzcoinsAwarded = await fizzCoinService.awardIntroductionReward(introduction.introducerId, id);
      }
    } else {
      console.log(`[Introductions] Awarding FIZZ to introducer ${introduction.introducerId} via database (no crypto wallet)`);
      // Fallback to database for users without crypto wallets - service calculates super-connector bonus
      fizzcoinsAwarded = await fizzCoinService.awardIntroductionReward(introduction.introducerId, id);
    }

    // Update introduction with reward amount
    const finalIntroduction = await storage.updateIntroduction(id, {
      fizzcoinReward: fizzcoinsAwarded,
    });

    // Check and update super-connector badges
    try {
      await badgeService.checkAndAwardSuperConnectorBadges();
    } catch (error) {
      console.error('[Introductions] Error updating badges:', error);
      // Don't fail the request if badge update fails
    }

    console.log(
      `[Introductions] Introduction accepted. Awarded ${fizzcoinsAwarded} FizzCoins to user ${introduction.introducerId}`
    );

    res.json({
      introduction: finalIntroduction,
      fizzcoinsAwarded,
    });
  } catch (error) {
    console.error('[Introductions] Error accepting introduction:', error);
    res.status(500).json({ error: 'Failed to accept introduction' });
  }
});

/**
 * PUT /api/introductions/:id/decline
 * Decline an introduction (must be personA or personB)
 */
router.put('/introductions/:id/decline', authMiddleware(), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    console.log('[Introductions] Declining introduction:', id);

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid introduction ID' });
    }

    // Get introduction
    const introduction = await storage.getIntroductionById(id);
    if (!introduction) {
      return res.status(404).json({ error: 'Introduction not found' });
    }

    // Verify user is personA or personB
    if (introduction.personAId !== req.user.id && introduction.personBId !== req.user.id) {
      return res.status(403).json({ error: 'You are not part of this introduction' });
    }

    // Check if already completed or declined
    if (introduction.status === 'completed') {
      return res.status(400).json({ error: 'Introduction already completed' });
    }

    if (introduction.status === 'declined') {
      return res.status(400).json({ error: 'Introduction already declined' });
    }

    // Update status to declined
    const updatedIntroduction = await storage.updateIntroduction(id, {
      status: 'declined',
    });

    if (!updatedIntroduction) {
      return res.status(500).json({ error: 'Failed to update introduction' });
    }

    console.log('[Introductions] Introduction declined');
    res.json(updatedIntroduction);
  } catch (error) {
    console.error('[Introductions] Error declining introduction:', error);
    res.status(500).json({ error: 'Failed to decline introduction' });
  }
});

export default router;
