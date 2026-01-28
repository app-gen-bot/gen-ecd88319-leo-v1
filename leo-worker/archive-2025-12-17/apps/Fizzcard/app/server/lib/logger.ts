/**
 * Enhanced Logging System
 *
 * Provides categorized logging for different parts of the application.
 * Logs include timestamps, severity levels, and contextual information.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export type LogCategory =
  | 'auth'
  | 'blockchain'
  | 'database'
  | 'api'
  | 'wallet'
  | 'reward'
  | 'transaction'
  | 'network'
  | 'system'
  | 'general';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  userId?: number;
  requestId?: string;
}

export class Logger {
  private static instance: Logger;
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 1000; // Keep last 1000 logs in memory
  private minLevel: LogLevel = 'debug';

  private constructor() {
    // Set minimum log level based on environment
    const env = process.env.NODE_ENV || 'development';
    this.minLevel = env === 'production' ? 'info' : 'debug';
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Log a debug message (development only)
   */
  debug(category: LogCategory, message: string, context?: Record<string, any>): void {
    this.log('debug', category, message, context);
  }

  /**
   * Log an informational message
   */
  info(category: LogCategory, message: string, context?: Record<string, any>): void {
    this.log('info', category, message, context);
  }

  /**
   * Log a warning message
   */
  warn(category: LogCategory, message: string, context?: Record<string, any>): void {
    this.log('warn', category, message, context);
  }

  /**
   * Log an error message
   */
  error(category: LogCategory, message: string, error?: Error, context?: Record<string, any>): void {
    this.log('error', category, message, context, error);
  }

  /**
   * Log a critical error (system-threatening)
   */
  critical(category: LogCategory, message: string, error?: Error, context?: Record<string, any>): void {
    this.log('critical', category, message, context, error);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): void {
    // Skip if below minimum level
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      context,
      error,
    };

    // Store in history
    this.addToHistory(entry);

    // Output to console with formatting
    this.outputToConsole(entry);

    // In production, you might also send to external logging service
    // this.sendToExternalService(entry);
  }

  /**
   * Check if log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'critical'];
    const currentLevelIndex = levels.indexOf(this.minLevel);
    const logLevelIndex = levels.indexOf(level);
    return logLevelIndex >= currentLevelIndex;
  }

  /**
   * Add log entry to in-memory history
   */
  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry);

    // Keep history size limited
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory = this.logHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Format and output log to console
   */
  private outputToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const levelEmoji = this.getLevelEmoji(entry.level);
    const categoryTag = `[${entry.category.toUpperCase()}]`;
    const prefix = `${levelEmoji} ${timestamp} ${categoryTag}`;

    // Choose console method based on level
    const consoleMethod = entry.level === 'error' || entry.level === 'critical' ? 'error' :
                         entry.level === 'warn' ? 'warn' : 'log';

    // Output main message
    console[consoleMethod](`${prefix} ${entry.message}`);

    // Output context if present
    if (entry.context && Object.keys(entry.context).length > 0) {
      console[consoleMethod](`${prefix} Context:`, entry.context);
    }

    // Output error if present
    if (entry.error) {
      console[consoleMethod](`${prefix} Error:`, entry.error.message);
      if (entry.level === 'critical' || entry.level === 'error') {
        console[consoleMethod](entry.error.stack);
      }
    }
  }

  /**
   * Get emoji for log level
   */
  private getLevelEmoji(level: LogLevel): string {
    const emojis: Record<LogLevel, string> = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      critical: '🚨',
    };
    return emojis[level];
  }

  /**
   * Get recent logs (for admin endpoints)
   */
  getRecentLogs(filters?: {
    level?: LogLevel;
    category?: LogCategory;
    limit?: number;
  }): LogEntry[] {
    let logs = [...this.logHistory];

    // Filter by level
    if (filters?.level) {
      logs = logs.filter(log => log.level === filters.level);
    }

    // Filter by category
    if (filters?.category) {
      logs = logs.filter(log => log.category === filters.category);
    }

    // Limit results
    const limit = filters?.limit || 100;
    return logs.slice(-limit);
  }

  /**
   * Get log statistics
   */
  getStats(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    byCategory: Record<LogCategory, number>;
    recentErrors: number;
  } {
    const stats = {
      total: this.logHistory.length,
      byLevel: {
        debug: 0,
        info: 0,
        warn: 0,
        error: 0,
        critical: 0,
      } as Record<LogLevel, number>,
      byCategory: {
        auth: 0,
        blockchain: 0,
        database: 0,
        api: 0,
        wallet: 0,
        reward: 0,
        transaction: 0,
        network: 0,
        system: 0,
        general: 0,
      } as Record<LogCategory, number>,
      recentErrors: 0,
    };

    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    for (const log of this.logHistory) {
      stats.byLevel[log.level]++;
      stats.byCategory[log.category]++;

      // Count recent errors (last hour)
      if ((log.level === 'error' || log.level === 'critical') &&
          new Date(log.timestamp).getTime() > oneHourAgo) {
        stats.recentErrors++;
      }
    }

    return stats;
  }

  /**
   * Clear log history (for testing)
   */
  clearHistory(): void {
    this.logHistory = [];
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

/**
 * Helper function for blockchain-specific logging
 */
export function logBlockchainTransaction(
  action: string,
  txHash?: string,
  error?: Error,
  context?: Record<string, any>
): void {
  if (error) {
    logger.error('blockchain', `Transaction failed: ${action}`, error, {
      txHash,
      ...context,
    });
  } else {
    logger.info('blockchain', `Transaction successful: ${action}`, {
      txHash,
      ...context,
    });
  }
}

/**
 * Helper function for auth-specific logging
 */
export function logAuthEvent(
  event: string,
  userId?: number,
  success: boolean = true,
  error?: Error,
  context?: Record<string, any>
): void {
  if (success) {
    logger.info('auth', event, { userId, ...context });
  } else {
    logger.warn('auth', `Auth failed: ${event}`, { userId, error: error?.message, ...context });
  }
}

/**
 * Helper function for reward-specific logging
 */
export function logReward(
  action: string,
  userId: number,
  amount: number,
  success: boolean = true,
  error?: Error,
  context?: Record<string, any>
): void {
  if (success) {
    logger.info('reward', `Reward ${action}: ${amount} FIZZ`, {
      userId,
      amount,
      ...context,
    });
  } else {
    logger.error('reward', `Reward ${action} failed`, error, {
      userId,
      amount,
      ...context,
    });
  }
}
