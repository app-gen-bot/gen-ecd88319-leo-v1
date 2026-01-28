/**
 * Admin Routes
 *
 * Administrative endpoints for monitoring and managing the FizzCard system.
 *
 * SECURITY NOTE: In production, these routes should be protected with:
 * - Admin role authentication
 * - IP whitelisting
 * - Rate limiting
 *
 * For development, routes are open for testing purposes.
 */

import express, { Request, Response } from 'express';
import { walletMonitorService } from '../services/wallet-monitor.service';
import { storage } from '../lib/storage/factory';
import { logger, type LogLevel, type LogCategory } from '../lib/logger';
import { gasAnalyticsService } from '../services/gas-analytics.service';

const router = express.Router();

// TODO: Add admin authentication middleware in production
// router.use(adminAuthMiddleware());

/**
 * GET /api/admin/wallet-status
 * Get current backend wallet status and balance
 */
router.get('/wallet-status', async (req: Request, res: Response) => {
  try {
    const balance = await walletMonitorService.getCurrentBalance();
    const status = walletMonitorService.getStatus();

    res.status(200).json({
      balance: balance.balance,
      transactionsRemaining: balance.transactionsRemaining,
      isHealthy: balance.isHealthy,
      monitoring: status.isMonitoring,
      lastAlert: status.lastAlert,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/reward-stats
 * Get reward distribution statistics
 */
router.get('/reward-stats', async (req: Request, res: Response) => {
  try {
    // Get all users with crypto wallets
    const allUsers = await storage.getUsers();
    const usersWithWallets = [];

    for (const user of allUsers) {
      const wallet = await storage.getCryptoWalletByUserId(user.id);
      if (wallet) {
        usersWithWallets.push({
          userId: user.id,
          email: user.email,
          walletAddress: wallet.walletAddress,
          pendingClaims: wallet.pendingClaimAmount,
          lastClaimAt: wallet.lastClaimAt,
        });
      }
    }

    // Get transaction statistics
    const totalPendingClaims = usersWithWallets.reduce(
      (sum, u) => sum + u.pendingClaims,
      0
    );

    res.status(200).json({
      totalUsers: allUsers.length,
      usersWithWallets: usersWithWallets.length,
      usersWithoutWallets: allUsers.length - usersWithWallets.length,
      totalPendingClaims,
      walletDetails: usersWithWallets,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/system-health
 * Get overall system health status
 */
router.get('/system-health', async (req: Request, res: Response) => {
  try {
    const walletBalance = await walletMonitorService.getCurrentBalance();
    const walletStatus = walletMonitorService.getStatus();

    // Get database statistics
    const allUsers = await storage.getUsers();
    let walletCount = 0;
    let pendingClaimsSum = 0;

    for (const user of allUsers) {
      const wallet = await storage.getCryptoWalletByUserId(user.id);
      if (wallet) {
        walletCount++;
        pendingClaimsSum += wallet.pendingClaimAmount;
      }
    }

    // Determine overall health
    const isHealthy =
      walletBalance.isHealthy &&
      !walletStatus.lastAlert;

    res.status(200).json({
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      components: {
        backendWallet: {
          status: walletBalance.isHealthy ? 'healthy' : 'warning',
          balance: walletBalance.balance,
          transactionsRemaining: walletBalance.transactionsRemaining,
        },
        database: {
          status: 'healthy', // Assume healthy if we can query
          mode: process.env.STORAGE_MODE || 'memory',
        },
        blockchain: {
          status: 'healthy', // Assume healthy if wallet service works
          network: 'Base Sepolia',
        },
        rewards: {
          totalUsers: allUsers.length,
          walletsCreated: walletCount,
          pendingClaims: pendingClaimsSum,
        },
      },
      alerts: walletStatus.lastAlert ? [walletStatus.lastAlert] : [],
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/check-wallet-balance
 * Manually trigger wallet balance check
 */
router.post('/check-wallet-balance', async (req: Request, res: Response) => {
  try {
    const alert = await walletMonitorService.checkBalance();

    res.status(200).json({
      message: 'Wallet balance checked',
      alert: alert || null,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/logs
 * Get recent logs with optional filtering
 */
router.get('/logs', async (req: Request, res: Response) => {
  try {
    const { level, category, limit } = req.query;

    const filters: {
      level?: LogLevel;
      category?: LogCategory;
      limit?: number;
    } = {};

    if (level) filters.level = level as LogLevel;
    if (category) filters.category = category as LogCategory;
    if (limit) filters.limit = parseInt(limit as string, 10);

    const logs = logger.getRecentLogs(filters);

    res.status(200).json({
      count: logs.length,
      logs,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/logs/stats
 * Get logging statistics
 */
router.get('/logs/stats', async (req: Request, res: Response) => {
  try {
    const stats = logger.getStats();
    res.status(200).json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/gas-analytics
 * Get gas usage analytics
 */
router.get('/gas-analytics', async (req: Request, res: Response) => {
  try {
    const { operation, userId, since, limit } = req.query;

    const options: {
      operation?: string;
      userId?: number;
      since?: Date;
      limit?: number;
    } = {};

    if (operation) options.operation = operation as string;
    if (userId) options.userId = parseInt(userId as string, 10);
    if (since) options.since = new Date(since as string);
    if (limit) options.limit = parseInt(limit as string, 10);

    const analytics = gasAnalyticsService.getAnalytics(options);

    // Convert BigInt fields to strings for JSON serialization
    const serialized = {
      ...analytics,
      totalGasUsed: analytics.totalGasUsed.toString(),
      totalCost: analytics.totalCost.toString(),
      averageGasPerTx: analytics.averageGasPerTx.toString(),
      averageCostPerTx: analytics.averageCostPerTx.toString(),
      byOperation: Object.fromEntries(
        Object.entries(analytics.byOperation).map(([op, stats]) => [
          op,
          {
            count: stats.count,
            totalGas: stats.totalGas.toString(),
            totalCost: stats.totalCost.toString(),
            avgGas: stats.avgGas.toString(),
          },
        ])
      ),
      recentTransactions: analytics.recentTransactions.map(tx => ({
        ...tx,
        gasUsed: tx.gasUsed.toString(),
        gasPrice: tx.gasPrice.toString(),
        totalCost: tx.totalCost.toString(),
        timestamp: tx.timestamp.toISOString(),
      })),
    };

    res.status(200).json(serialized);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/gas-projection
 * Get cost projection for future transactions
 */
router.get('/gas-projection', async (req: Request, res: Response) => {
  try {
    const { transactionsPerDay } = req.query;
    const estimate = parseInt(transactionsPerDay as string, 10) || 100;

    const projection = gasAnalyticsService.getCostProjection(estimate);

    res.status(200).json({
      estimatedTransactionsPerDay: estimate,
      ...projection,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
