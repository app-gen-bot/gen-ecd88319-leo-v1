/**
 * Retry Utility
 *
 * Provides configurable retry logic for operations that may fail transiently.
 * Useful for blockchain transactions, API calls, and database operations.
 */

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxAttempts?: number;
  /** Initial delay in milliseconds (default: 1000) */
  initialDelay?: number;
  /** Maximum delay in milliseconds (default: 10000) */
  maxDelay?: number;
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier?: number;
  /** Whether to use exponential backoff (default: true) */
  exponentialBackoff?: boolean;
  /** Custom function to determine if error is retryable */
  isRetryable?: (error: Error) => boolean;
  /** Callback called before each retry */
  onRetry?: (error: Error, attempt: number) => void;
}

export class RetryError extends Error {
  constructor(
    message: string,
    public readonly lastError: Error,
    public readonly attempts: number
  ) {
    super(message);
    this.name = 'RetryError';
  }
}

/**
 * Execute a function with automatic retry on failure
 *
 * @param fn Function to execute
 * @param options Retry configuration options
 * @returns Result of the function
 * @throws RetryError if all attempts fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    exponentialBackoff = true,
    isRetryable = defaultIsRetryable,
    onRetry,
  } = options;

  let lastError: Error | null = null;
  let currentDelay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is retryable
      if (!isRetryable(lastError)) {
        throw lastError;
      }

      // If this was the last attempt, throw RetryError
      if (attempt === maxAttempts) {
        throw new RetryError(
          `Operation failed after ${attempt} attempts: ${lastError.message}`,
          lastError,
          attempt
        );
      }

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(lastError, attempt);
      }

      // Wait before retrying
      await sleep(currentDelay);

      // Calculate next delay
      if (exponentialBackoff) {
        currentDelay = Math.min(currentDelay * backoffMultiplier, maxDelay);
      }
    }
  }

  // This should never be reached, but TypeScript requires it
  throw new RetryError(
    `Operation failed after ${maxAttempts} attempts`,
    lastError!,
    maxAttempts
  );
}

/**
 * Default function to determine if an error is retryable
 * Retries on network errors, timeouts, and rate limits
 */
function defaultIsRetryable(error: Error): boolean {
  const message = error.message.toLowerCase();

  // Retry on network errors
  if (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('econnrefused') ||
    message.includes('enotfound') ||
    message.includes('etimedout')
  ) {
    return true;
  }

  // Retry on rate limiting
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return true;
  }

  // Retry on temporary blockchain issues
  if (
    message.includes('nonce too low') ||
    message.includes('replacement transaction underpriced') ||
    message.includes('already known')
  ) {
    return true;
  }

  // Don't retry on permanent errors
  if (
    message.includes('insufficient funds') ||
    message.includes('invalid address') ||
    message.includes('execution reverted') ||
    message.includes('unauthorized') ||
    message.includes('forbidden')
  ) {
    return false;
  }

  // By default, retry unknown errors
  return true;
}

/**
 * Blockchain-specific retry options
 * Configured for blockchain transaction failures
 */
export const blockchainRetryOptions: RetryOptions = {
  maxAttempts: 3,
  initialDelay: 2000, // 2 seconds
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  exponentialBackoff: true,
  isRetryable: (error: Error) => {
    const message = error.message.toLowerCase();

    // Always retry network/RPC errors
    if (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('rpc')
    ) {
      return true;
    }

    // Retry nonce issues
    if (
      message.includes('nonce') ||
      message.includes('replacement transaction')
    ) {
      return true;
    }

    // Don't retry contract execution failures
    if (
      message.includes('execution reverted') ||
      message.includes('revert') ||
      message.includes('invalid')
    ) {
      return false;
    }

    // Don't retry insufficient funds
    if (message.includes('insufficient funds')) {
      return false;
    }

    // Retry everything else
    return true;
  },
  onRetry: (error: Error, attempt: number) => {
    console.warn(`[Retry] Blockchain operation failed (attempt ${attempt}/3):`, error.message);
    console.warn(`[Retry] Retrying in ${2 ** attempt} seconds...`);
  },
};

/**
 * API-specific retry options
 * Configured for HTTP API calls
 */
export const apiRetryOptions: RetryOptions = {
  maxAttempts: 3,
  initialDelay: 500,
  maxDelay: 5000,
  backoffMultiplier: 2,
  exponentialBackoff: true,
  isRetryable: (error: Error) => {
    const message = error.message.toLowerCase();

    // Retry on 5xx errors
    if (message.includes('500') || message.includes('502') || message.includes('503')) {
      return true;
    }

    // Retry on rate limits
    if (message.includes('429') || message.includes('rate limit')) {
      return true;
    }

    // Don't retry client errors
    if (message.includes('4')) {
      return false;
    }

    return true;
  },
};

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
