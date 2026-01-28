/**
 * Gas Analytics Service
 *
 * Tracks gas usage, costs, and transaction statistics for blockchain operations.
 * Helps monitor operational costs and optimize gas efficiency.
 */

import { formatEther, type Hash } from 'viem';
import { walletService } from './blockchain/wallet.service';
import { logger } from '../lib/logger';

export interface GasTransaction {
  txHash: string;
  timestamp: Date;
  gasUsed: bigint;
  gasPrice: bigint;
  totalCost: bigint;
  totalCostEth: string;
  operation: string;
  userId?: number;
  success: boolean;
}

export interface GasAnalytics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalGasUsed: bigint;
  totalCost: bigint;
  totalCostEth: string;
  averageGasPerTx: bigint;
  averageCostPerTx: bigint;
  averageCostPerTxEth: string;
  byOperation: Record<string, {
    count: number;
    totalGas: bigint;
    totalCost: bigint;
    avgGas: bigint;
  }>;
  recentTransactions: GasTransaction[];
}

export class GasAnalyticsService {
  private transactions: GasTransaction[] = [];
  private maxHistorySize = 500; // Keep last 500 transactions

  /**
   * Record a transaction for analytics
   */
  async recordTransaction(
    txHash: Hash,
    operation: string,
    userId?: number,
    success: boolean = true
  ): Promise<GasTransaction> {
    try {
      const publicClient = walletService.getPublicClient();

      // Get transaction receipt
      const receipt = await publicClient.getTransactionReceipt({ hash: txHash });

      // Get transaction details for gas price
      const transaction = await publicClient.getTransaction({ hash: txHash });

      const gasUsed = receipt.gasUsed;
      const gasPrice = transaction.gasPrice || BigInt(0);
      const totalCost = gasUsed * gasPrice;

      const gasTransaction: GasTransaction = {
        txHash,
        timestamp: new Date(),
        gasUsed,
        gasPrice,
        totalCost,
        totalCostEth: formatEther(totalCost),
        operation,
        userId,
        success,
      };

      this.addTransaction(gasTransaction);

      logger.info('transaction', `Gas used: ${gasUsed.toString()} (${formatEther(totalCost)} ETH)`, {
        txHash,
        operation,
        userId,
        gasUsed: gasUsed.toString(),
        cost: formatEther(totalCost),
      });

      return gasTransaction;
    } catch (error: any) {
      logger.error('transaction', 'Failed to record transaction analytics', error, {
        txHash,
        operation,
        userId,
      });

      // Create a minimal record even if we couldn't fetch details
      const fallbackTransaction: GasTransaction = {
        txHash,
        timestamp: new Date(),
        gasUsed: BigInt(0),
        gasPrice: BigInt(0),
        totalCost: BigInt(0),
        totalCostEth: '0',
        operation,
        userId,
        success,
      };

      this.addTransaction(fallbackTransaction);
      return fallbackTransaction;
    }
  }

  /**
   * Add transaction to history
   */
  private addTransaction(transaction: GasTransaction): void {
    this.transactions.push(transaction);

    // Keep history size limited
    if (this.transactions.length > this.maxHistorySize) {
      this.transactions = this.transactions.slice(-this.maxHistorySize);
    }
  }

  /**
   * Get analytics for all transactions
   */
  getAnalytics(options?: {
    operation?: string;
    userId?: number;
    since?: Date;
    limit?: number;
  }): GasAnalytics {
    let filtered = this.transactions;

    // Apply filters
    if (options?.operation) {
      filtered = filtered.filter(tx => tx.operation === options.operation);
    }
    if (options?.userId) {
      filtered = filtered.filter(tx => tx.userId === options.userId);
    }
    if (options?.since) {
      filtered = filtered.filter(tx => tx.timestamp >= options.since!);
    }

    const successful = filtered.filter(tx => tx.success);
    const failed = filtered.filter(tx => !tx.success);

    const totalGasUsed = filtered.reduce((sum, tx) => sum + tx.gasUsed, BigInt(0));
    const totalCost = filtered.reduce((sum, tx) => sum + tx.totalCost, BigInt(0));

    const averageGasPerTx = filtered.length > 0 ? totalGasUsed / BigInt(filtered.length) : BigInt(0);
    const averageCostPerTx = filtered.length > 0 ? totalCost / BigInt(filtered.length) : BigInt(0);

    // Group by operation
    const byOperation: Record<string, {
      count: number;
      totalGas: bigint;
      totalCost: bigint;
      avgGas: bigint;
    }> = {};

    for (const tx of filtered) {
      if (!byOperation[tx.operation]) {
        byOperation[tx.operation] = {
          count: 0,
          totalGas: BigInt(0),
          totalCost: BigInt(0),
          avgGas: BigInt(0),
        };
      }

      byOperation[tx.operation].count++;
      byOperation[tx.operation].totalGas += tx.gasUsed;
      byOperation[tx.operation].totalCost += tx.totalCost;
    }

    // Calculate averages for each operation
    for (const op in byOperation) {
      const stats = byOperation[op];
      stats.avgGas = stats.totalGas / BigInt(stats.count);
    }

    // Get recent transactions (limited)
    const limit = options?.limit || 50;
    const recentTransactions = filtered.slice(-limit);

    return {
      totalTransactions: filtered.length,
      successfulTransactions: successful.length,
      failedTransactions: failed.length,
      totalGasUsed,
      totalCost,
      totalCostEth: formatEther(totalCost),
      averageGasPerTx,
      averageCostPerTx,
      averageCostPerTxEth: formatEther(averageCostPerTx),
      byOperation,
      recentTransactions,
    };
  }

  /**
   * Get recent transactions
   */
  getRecentTransactions(limit: number = 50): GasTransaction[] {
    return this.transactions.slice(-limit);
  }

  /**
   * Get cost projection for future transactions
   */
  getCostProjection(estimatedTransactionsPerDay: number): {
    dailyCost: string;
    weeklyCost: string;
    monthlyCost: string;
  } {
    const analytics = this.getAnalytics();

    if (analytics.totalTransactions === 0) {
      return {
        dailyCost: '0',
        weeklyCost: '0',
        monthlyCost: '0',
      };
    }

    const avgCost = analytics.averageCostPerTx;
    const dailyCostWei = avgCost * BigInt(estimatedTransactionsPerDay);
    const weeklyCostWei = dailyCostWei * BigInt(7);
    const monthlyCostWei = dailyCostWei * BigInt(30);

    return {
      dailyCost: formatEther(dailyCostWei),
      weeklyCost: formatEther(weeklyCostWei),
      monthlyCost: formatEther(monthlyCostWei),
    };
  }

  /**
   * Clear transaction history (for testing)
   */
  clearHistory(): void {
    this.transactions = [];
  }
}

// Export singleton
export const gasAnalyticsService = new GasAnalyticsService();
