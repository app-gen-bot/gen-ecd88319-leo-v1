/**
 * Contact Exchanges Routes
 *
 * Endpoints for initiating, accepting, and rejecting contact exchanges
 * Includes GPS capture and FizzCoin rewards
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../lib/storage/factory';
import { authMiddleware } from '../middleware/auth';
import { geocodingService } from '../services/geocoding.service';
import { fizzCoinService } from '../services/fizzcoin.service';
import { blockchainFizzCoinService } from '../services/blockchain/fizzcoin.service';
import { badgeService } from '../services/badge.service';
import { insertContactExchangesSchema, contactExchangesQuerySchema } from '../../shared/schema.zod';

const router = Router();

/**
 * POST /api/contact-exchanges
 * Initiate contact exchange (sender scans receiver QR code)
 */
router.post('/', authMiddleware(), async (req: Request, res: Response) => {
  try {
    console.log('[ContactExchanges Routes] Initiate contact exchange');

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Validate request body
    const createSchema = insertContactExchangesSchema.omit({ senderId: true, status: true });
    const validated = createSchema.parse(req.body);

    // Check if receiver exists
    const receiver = await storage.getUserById(validated.receiverId);
    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Reverse geocode if coordinates provided
    let locationName = validated.locationName;
    if (validated.latitude && validated.longitude && !locationName) {
      locationName = await geocodingService.reverseGeocode(
        validated.latitude,
        validated.longitude
      );
      console.log(`[ContactExchanges Routes] Geocoded location: ${locationName}`);
    }

    // Create contact exchange
    const exchange = await storage.createContactExchange({
      ...validated,
      status: 'pending',
      senderId: req.user.id,
      locationName: locationName || null,
    });

    console.log(
      `[ContactExchanges Routes] Contact exchange created: ${exchange.id} ` +
        `(${req.user.id} → ${validated.receiverId})`
    );

    res.status(201).json(exchange);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }

    console.error('[ContactExchanges Routes] Initiate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/contact-exchanges/received
 * Get received contact exchange requests
 */
router.get('/received', authMiddleware(), async (req: Request, res: Response) => {
  try {
    console.log('[ContactExchanges Routes] Get received exchanges');

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const query = contactExchangesQuerySchema.parse(req.query);
    const offset = (query.page - 1) * query.limit;

    // Get exchanges
    const allExchanges = await storage.getContactExchangesByReceiverId(req.user.id, {
      status: query.status,
    });

    // Enrich with sender details
    const enrichedExchanges = await Promise.all(
      allExchanges.map(async (exchange) => {
        const sender = await storage.getUserById(exchange.senderId);
        return {
          ...exchange,
          senderName: sender?.name,
          senderAvatar: sender?.avatarUrl || null,
        };
      })
    );

    // Manual pagination
    const total = enrichedExchanges.length;
    const data = enrichedExchanges.slice(offset, offset + query.limit);

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
    console.error('[ContactExchanges Routes] Get received error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/contact-exchanges/sent
 * Get sent contact exchange requests
 */
router.get('/sent', authMiddleware(), async (req: Request, res: Response) => {
  try {
    console.log('[ContactExchanges Routes] Get sent exchanges');

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const query = contactExchangesQuerySchema.parse(req.query);
    const offset = (query.page - 1) * query.limit;

    // Get exchanges
    const allExchanges = await storage.getContactExchangesBySenderId(req.user.id, {
      status: query.status,
    });

    // Enrich with receiver details
    const enrichedExchanges = await Promise.all(
      allExchanges.map(async (exchange) => {
        const receiver = await storage.getUserById(exchange.receiverId);
        return {
          ...exchange,
          receiverName: receiver?.name,
          receiverAvatar: receiver?.avatarUrl || null,
        };
      })
    );

    // Manual pagination
    const total = enrichedExchanges.length;
    const data = enrichedExchanges.slice(offset, offset + query.limit);

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
    console.error('[ContactExchanges Routes] Get sent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/contact-exchanges/:id/accept
 * Accept contact exchange
 */
router.put('/:id/accept', authMiddleware(), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`[ContactExchanges Routes] Accept exchange: ${id}`);

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get exchange
    const exchange = await storage.getContactExchangeById(id);
    if (!exchange) {
      return res.status(404).json({ error: 'Exchange not found' });
    }

    // Check if user is receiver
    if (exchange.receiverId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to accept this exchange' });
    }

    // Check if already processed
    if (exchange.status !== 'pending') {
      return res.status(400).json({ error: 'Exchange already processed' });
    }

    // Update exchange status
    const updatedExchange = await storage.updateContactExchange(id, {
      status: 'accepted',
    });

    if (!updatedExchange) {
      return res.status(404).json({ error: 'Exchange not found' });
    }

    // Create bidirectional connections
    const connection1 = await storage.createConnection({
      userId: exchange.senderId,
      connectedUserId: exchange.receiverId,
      exchangeId: exchange.id,
      tags: [],
      strengthScore: 50, // Initial score
    });

    const connection2 = await storage.createConnection({
      userId: exchange.receiverId,
      connectedUserId: exchange.senderId,
      exchangeId: exchange.id,
      tags: [],
      strengthScore: 50, // Initial score
    });

    // Award FizzCoins to both users (blockchain-first, database fallback)
    const REWARD_AMOUNT = 25;
    let fizzcoinsEarned = REWARD_AMOUNT;

    // Check if users have crypto wallets
    const senderWallet = await storage.getCryptoWalletByUserId(exchange.senderId);
    const receiverWallet = await storage.getCryptoWalletByUserId(exchange.receiverId);

    // Track if we used blockchain for proper fallback handling
    let usedBlockchain = false;

    // Award to sender
    if (senderWallet && blockchainFizzCoinService.isBlockchainEnabled()) {
      console.log(`[ContactExchanges] Awarding ${REWARD_AMOUNT} FIZZ to sender ${exchange.senderId} via blockchain`);
      try {
        const txResult = await blockchainFizzCoinService.creditReward(
          senderWallet.walletAddress,
          REWARD_AMOUNT,
          'contact_exchange_accepted'
        );

        // Update pending claim amount cache in database
        await storage.incrementPendingClaims(exchange.senderId, REWARD_AMOUNT);

        // Record transaction in database with blockchain metadata
        await storage.createFizzCoinTransaction({
          userId: exchange.senderId,
          amount: REWARD_AMOUNT,
          transactionType: 'reward_earned',
          txHash: txResult.hash,
          metadata: {
            exchangeId: exchange.id,
            reason: 'contact_exchange_accepted',
            recipientId: exchange.receiverId,
          },
        });

        usedBlockchain = true;
        console.log(`[ContactExchanges] Sender reward credited on blockchain. TX: ${txResult.hash}`);
      } catch (error: any) {
        console.error(`[ContactExchanges] Blockchain reward failed for sender ${exchange.senderId}, falling back to database:`, error.message);
        // Fallback to database - use legacy service method that handles both users
        const fallbackAmount = await fizzCoinService.awardExchangeReward(exchange.senderId, exchange.receiverId);
        fizzcoinsEarned = fallbackAmount;

        // CRITICAL FIX: If sender has a crypto wallet but blockchain failed,
        // we still need to increment their pending_claim_amount so they can claim later
        if (senderWallet) {
          try {
            await storage.incrementPendingClaims(exchange.senderId, REWARD_AMOUNT);
            console.log(`[ContactExchanges] Updated pending claims for sender ${exchange.senderId} after blockchain fallback`);
          } catch (pendingError: any) {
            console.error(`[ContactExchanges] Failed to update pending claims for sender:`, pendingError.message);
          }
        }

        // Also update receiver's pending claims if they have a wallet
        if (receiverWallet) {
          try {
            await storage.incrementPendingClaims(exchange.receiverId, REWARD_AMOUNT);
            console.log(`[ContactExchanges] Updated pending claims for receiver ${exchange.receiverId} after blockchain fallback`);
          } catch (pendingError: any) {
            console.error(`[ContactExchanges] Failed to update pending claims for receiver:`, pendingError.message);
          }
        }
      }
    } else {
      console.log(`[ContactExchanges] Awarding FIZZ to sender ${exchange.senderId} via database (no crypto wallet)`);
      // Fallback to database for users without crypto wallets
      const fallbackAmount = await fizzCoinService.awardExchangeReward(exchange.senderId, exchange.receiverId);
      fizzcoinsEarned = fallbackAmount;
    }

    // Award to receiver (only if sender blockchain succeeded)
    if (receiverWallet && blockchainFizzCoinService.isBlockchainEnabled() && usedBlockchain) {
      console.log(`[ContactExchanges] Awarding ${REWARD_AMOUNT} FIZZ to receiver ${exchange.receiverId} via blockchain`);
      try {
        const txResult = await blockchainFizzCoinService.creditReward(
          receiverWallet.walletAddress,
          REWARD_AMOUNT,
          'contact_exchange_accepted'
        );

        // Update pending claim amount cache in database
        await storage.incrementPendingClaims(exchange.receiverId, REWARD_AMOUNT);

        // Record transaction in database with blockchain metadata
        await storage.createFizzCoinTransaction({
          userId: exchange.receiverId,
          amount: REWARD_AMOUNT,
          transactionType: 'reward_earned',
          txHash: txResult.hash,
          metadata: {
            exchangeId: exchange.id,
            reason: 'contact_exchange_accepted',
            recipientId: exchange.senderId,
          },
        });

        console.log(`[ContactExchanges] Receiver reward credited on blockchain. TX: ${txResult.hash}`);
      } catch (error: any) {
        console.error(`[ContactExchanges] Blockchain reward failed for receiver ${exchange.receiverId}:`, error.message);
        // Receiver blockchain failed - sender succeeded via blockchain, receiver gets database fallback
        // Note: This creates inconsistency, but ensures users still get rewards
        await fizzCoinService.awardExchangeReward(exchange.receiverId, exchange.senderId);

        // CRITICAL FIX: If receiver has a crypto wallet but blockchain failed,
        // we still need to increment their pending_claim_amount so they can claim later
        if (receiverWallet) {
          try {
            await storage.incrementPendingClaims(exchange.receiverId, REWARD_AMOUNT);
            console.log(`[ContactExchanges] Updated pending claims for receiver ${exchange.receiverId} after blockchain fallback`);
          } catch (pendingError: any) {
            console.error(`[ContactExchanges] Failed to update pending claims for receiver:`, pendingError.message);
          }
        }
      }
    } else if (!usedBlockchain) {
      // If sender used database, the awardExchangeReward call above already handled both users
      console.log(`[ContactExchanges] Receiver ${exchange.receiverId} reward already awarded via database fallback`);
    }

    // Check and update super-connector badges
    try {
      await badgeService.checkAndAwardSuperConnectorBadges();
    } catch (error) {
      console.error('[ContactExchanges Routes] Error updating badges:', error);
      // Don't fail the request if badge update fails
    }

    console.log(
      `[ContactExchanges Routes] Exchange accepted, connections created, ` +
        `FizzCoins awarded: ${fizzcoinsEarned} each`
    );

    res.status(200).json({
      exchange: updatedExchange,
      connection: {
        id: connection2.id,
        userId: connection2.userId,
        connectedUserId: connection2.connectedUserId,
      },
      fizzcoinsEarned,
    });
  } catch (error) {
    console.error('[ContactExchanges Routes] Accept error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/contact-exchanges/:id/reject
 * Reject contact exchange
 */
router.put('/:id/reject', authMiddleware(), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`[ContactExchanges Routes] Reject exchange: ${id}`);

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get exchange
    const exchange = await storage.getContactExchangeById(id);
    if (!exchange) {
      return res.status(404).json({ error: 'Exchange not found' });
    }

    // Check if user is receiver
    if (exchange.receiverId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to reject this exchange' });
    }

    // Check if already processed
    if (exchange.status !== 'pending') {
      return res.status(400).json({ error: 'Exchange already processed' });
    }

    // Update exchange status
    const updatedExchange = await storage.updateContactExchange(id, {
      status: 'rejected',
    });

    if (!updatedExchange) {
      return res.status(404).json({ error: 'Exchange not found' });
    }

    console.log(`[ContactExchanges Routes] Exchange rejected: ${id}`);

    res.status(200).json(updatedExchange);
  } catch (error) {
    console.error('[ContactExchanges Routes] Reject error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
