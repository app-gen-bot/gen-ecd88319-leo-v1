/**
 * Wallet Routes
 *
 * FizzCoin wallet balance and transaction management
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../lib/storage/factory';
import { authMiddleware } from '../middleware/auth';
import { fizzCoinService } from '../services/fizzcoin.service';
import { fizzCoinTransactionsQuerySchema } from '../../shared/schema.zod';

const router = Router();

/**
 * GET /api/wallet
 * Get my wallet balance
 */
router.get('/', authMiddleware(), async (req: Request, res: Response) => {
  try {
    console.log('[Wallet Routes] Get wallet');

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const wallet = await storage.getWalletByUserId(req.user.id);
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.status(200).json(wallet);
  } catch (error) {
    console.error('[Wallet Routes] Get wallet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/wallet/transactions
 * Get transaction history
 */
router.get('/transactions', authMiddleware(), async (req: Request, res: Response) => {
  try {
    console.log('[Wallet Routes] Get transactions');

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const query = fizzCoinTransactionsQuerySchema.parse(req.query);
    const offset = (query.page - 1) * query.limit;

    // Get transactions
    const allTransactions = await storage.getTransactionsByUserId(req.user.id, {
      type: query.type,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    });

    // Manual pagination
    const total = allTransactions.length;
    const data = allTransactions.slice(offset, offset + query.limit);

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
    console.error('[Wallet Routes] Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/wallet/transfer
 * Transfer FizzCoins to another user
 */
router.post('/transfer', authMiddleware(), async (req: Request, res: Response) => {
  try {
    console.log('[Wallet Routes] Transfer FizzCoins');

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Validate request body
    const transferSchema = z.object({
      recipientUserId: z.number(),
      amount: z.number().min(1),
      note: z.string().optional(),
    });

    const validated = transferSchema.parse(req.body);

    // Check if recipient exists
    const recipient = await storage.getUserById(validated.recipientUserId);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Check if user has sufficient balance
    const canAfford = await fizzCoinService.canAfford(req.user.id, validated.amount);
    if (!canAfford) {
      return res.status(403).json({ error: 'Insufficient FizzCoin balance' });
    }

    // Transfer coins
    const success = await fizzCoinService.transferCoins(
      req.user.id,
      validated.recipientUserId,
      validated.amount,
      validated.note
    );

    if (!success) {
      return res.status(400).json({ error: 'Transfer failed' });
    }

    // Get latest transaction and wallet balance
    const transactions = await storage.getTransactionsByUserId(req.user.id);
    const latestTransaction = transactions[0]; // Assuming sorted by date desc

    const wallet = await storage.getWalletByUserId(req.user.id);

    console.log(`[Wallet Routes] Transfer completed: ${validated.amount} FizzCoins to user ${validated.recipientUserId}`);

    res.status(201).json({
      transaction: latestTransaction,
      newBalance: wallet?.balance || 0,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }

    console.error('[Wallet Routes] Transfer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
