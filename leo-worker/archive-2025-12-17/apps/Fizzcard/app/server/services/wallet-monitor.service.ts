/**
 * Wallet Monitor Service
 *
 * Monitors backend wallet balance and sends alerts when balance is low.
 * Helps prevent service interruption due to insufficient gas funds.
 */

import { formatEther } from 'viem';
import { walletService } from './blockchain/wallet.service';

export interface WalletBalanceAlert {
  severity: 'warning' | 'critical' | 'urgent';
  currentBalance: string; // in ETH
  threshold: string; // in ETH
  transactionsRemaining: number;
  message: string;
  timestamp: Date;
}

export class WalletMonitorService {
  private isMonitoring = false;
  private checkInterval: NodeJS.Timeout | null = null;
  private lastAlert: WalletBalanceAlert | null = null;

  // Balance thresholds (in ETH)
  private readonly THRESHOLDS = {
    WARNING: 0.01, // ~200 transactions
    CRITICAL: 0.005, // ~100 transactions
    URGENT: 0.001, // ~20 transactions
  };

  // Average gas per transaction (estimated)
  private readonly AVG_GAS_PER_TX = 0.00005; // ~50,000 gas at 1 Gwei

  /**
   * Start monitoring wallet balance
   * Checks every 5 minutes by default
   */
  startMonitoring(intervalMinutes: number = 5): void {
    if (this.isMonitoring) {
      console.log('[WalletMonitor] Already monitoring');
      return;
    }

    console.log(`[WalletMonitor] Starting balance monitoring (checking every ${intervalMinutes} minutes)`);

    // Check immediately
    this.checkBalance();

    // Then check periodically
    this.checkInterval = setInterval(
      () => this.checkBalance(),
      intervalMinutes * 60 * 1000
    );

    this.isMonitoring = true;
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isMonitoring = false;
    console.log('[WalletMonitor] Stopped monitoring');
  }

  /**
   * Check wallet balance and send alert if needed
   */
  async checkBalance(): Promise<WalletBalanceAlert | null> {
    try {
      // Get wallet balance
      const balanceWei = await walletService.getBalance();
      const balance = Number(formatEther(balanceWei));

      // Calculate transactions remaining
      const transactionsRemaining = Math.floor(balance / this.AVG_GAS_PER_TX);

      // Determine severity
      let alert: WalletBalanceAlert | null = null;

      if (balance < this.THRESHOLDS.URGENT) {
        alert = {
          severity: 'urgent',
          currentBalance: balance.toFixed(6),
          threshold: this.THRESHOLDS.URGENT.toString(),
          transactionsRemaining,
          message: `URGENT: Backend wallet critically low! Only ${transactionsRemaining} transactions remaining. Service will stop soon!`,
          timestamp: new Date(),
        };
      } else if (balance < this.THRESHOLDS.CRITICAL) {
        alert = {
          severity: 'critical',
          currentBalance: balance.toFixed(6),
          threshold: this.THRESHOLDS.CRITICAL.toString(),
          transactionsRemaining,
          message: `CRITICAL: Backend wallet running low. Only ${transactionsRemaining} transactions remaining. Please fund wallet soon.`,
          timestamp: new Date(),
        };
      } else if (balance < this.THRESHOLDS.WARNING) {
        alert = {
          severity: 'warning',
          currentBalance: balance.toFixed(6),
          threshold: this.THRESHOLDS.WARNING.toString(),
          transactionsRemaining,
          message: `WARNING: Backend wallet below warning threshold. ${transactionsRemaining} transactions remaining. Consider funding wallet.`,
          timestamp: new Date(),
        };
      }

      // Send alert if we have one
      if (alert) {
        this.sendAlert(alert);
        this.lastAlert = alert;
        return alert;
      }

      // Log healthy status periodically
      console.log(`[WalletMonitor] ✓ Wallet balance healthy: ${balance.toFixed(6)} ETH (~${transactionsRemaining} transactions)`);
      this.lastAlert = null;
      return null;

    } catch (error: any) {
      console.error('[WalletMonitor] Error checking balance:', error.message);
      return null;
    }
  }

  /**
   * Send alert notification
   * Currently logs to console, but can be extended to send emails, Slack messages, etc.
   */
  private sendAlert(alert: WalletBalanceAlert): void {
    const emoji = {
      warning: '⚠️',
      critical: '🚨',
      urgent: '🔴',
    }[alert.severity];

    console.log('\n' + '='.repeat(80));
    console.log(`${emoji} [WalletMonitor] ${alert.severity.toUpperCase()} ALERT`);
    console.log('='.repeat(80));
    console.log(`Message: ${alert.message}`);
    console.log(`Current Balance: ${alert.currentBalance} ETH`);
    console.log(`Threshold: ${alert.threshold} ETH`);
    console.log(`Transactions Remaining: ~${alert.transactionsRemaining}`);
    console.log(`Timestamp: ${alert.timestamp.toISOString()}`);
    console.log('='.repeat(80) + '\n');

    // TODO: Integrate with notification services:
    // - Send email to admin
    // - Send Slack/Discord notification
    // - Trigger automated funding (if configured)
    // - Create dashboard alert
  }

  /**
   * Get current monitoring status
   */
  getStatus(): {
    isMonitoring: boolean;
    lastAlert: WalletBalanceAlert | null;
  } {
    return {
      isMonitoring: this.isMonitoring,
      lastAlert: this.lastAlert,
    };
  }

  /**
   * Get current balance without triggering alerts
   */
  async getCurrentBalance(): Promise<{
    balance: string;
    transactionsRemaining: number;
    isHealthy: boolean;
  }> {
    try {
      const balanceWei = await walletService.getBalance();
      const balance = Number(formatEther(balanceWei));
      const transactionsRemaining = Math.floor(balance / this.AVG_GAS_PER_TX);
      const isHealthy = balance >= this.THRESHOLDS.WARNING;

      return {
        balance: balance.toFixed(6),
        transactionsRemaining,
        isHealthy,
      };
    } catch (error: any) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }
}

// Export singleton instance
export const walletMonitorService = new WalletMonitorService();
