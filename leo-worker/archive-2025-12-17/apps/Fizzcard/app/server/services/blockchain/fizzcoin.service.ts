import { parseEther, formatEther, type Hash } from 'viem';
import { walletService } from './wallet.service';
import fizzCoinABI from '../../contracts/abis/FizzCoin.json';
import rewardsABI from '../../contracts/abis/FizzCoinRewards.json';
import { withRetry, blockchainRetryOptions } from '../../lib/retry';
import { logger, logBlockchainTransaction, logReward } from '../../lib/logger';
import { gasAnalyticsService } from '../gas-analytics.service';

/**
 * BlockchainFizzCoinService
 *
 * Manages FizzCoin blockchain operations including:
 * - Credit rewards to users (pending claim)
 * - Query on-chain balances
 * - Query pending rewards
 * - Facilitate gasless claiming
 *
 * Architecture:
 * - Database stores wallet addresses + pending claim cache
 * - Blockchain is source of truth for actual balances
 * - Smart contract manages reward distribution
 */
class BlockchainFizzCoinService {
  private fizzCoinAddress: `0x${string}` | null = null;
  private rewardsAddress: `0x${string}` | null = null;
  private isEnabled = false;
  private initialized = false;

  constructor() {
    // Don't initialize immediately - wait for first use
    // This ensures dotenv has loaded environment variables
  }

  /**
   * Initialize blockchain service with contract addresses
   * Called lazily on first use
   */
  private initialize() {
    if (this.initialized) return;
    this.initialized = true;

    const fizzcoinAddr = process.env.FIZZCOIN_CONTRACT_ADDRESS;
    const rewardsAddr = process.env.REWARDS_CONTRACT_ADDRESS;

    if (!fizzcoinAddr || !rewardsAddr) {
      console.warn('[BlockchainFizzCoinService] Contract addresses not set - blockchain features disabled');
      console.warn('[BlockchainFizzCoinService] Set FIZZCOIN_CONTRACT_ADDRESS and REWARDS_CONTRACT_ADDRESS to enable');
      return;
    }

    this.fizzCoinAddress = fizzcoinAddr as `0x${string}`;
    this.rewardsAddress = rewardsAddr as `0x${string}`;

    // Trigger wallet service initialization by calling getAddress
    try {
      walletService.getAddress(); // This triggers initialize()
      this.isEnabled = walletService.isReady();
    } catch (error) {
      console.warn('[BlockchainFizzCoinService] Wallet service initialization failed:', error instanceof Error ? error.message : 'Unknown error');
      this.isEnabled = false;
    }

    if (this.isEnabled) {
      console.log('[BlockchainFizzCoinService] Initialized');
      console.log(`[BlockchainFizzCoinService] FizzCoin: ${this.fizzCoinAddress}`);
      console.log(`[BlockchainFizzCoinService] Rewards: ${this.rewardsAddress}`);
    }
  }

  /**
   * Check if blockchain integration is enabled
   */
  isBlockchainEnabled(): boolean {
    this.initialize();
    return this.isEnabled;
  }

  /**
   * Credit reward to user's wallet address (pending claim)
   *
   * @param walletAddress User's Ethereum wallet address
   * @param amount Amount in FIZZ (e.g., 25 for 25 FIZZ)
   * @param reason Reason for reward (for logging)
   * @returns Transaction hash
   */
  async creditReward(
    walletAddress: string,
    amount: number,
    reason: string,
    userId?: number
  ): Promise<{ hash: string; amount: number }> {
    this.initialize();
    if (!this.isEnabled || !this.rewardsAddress) {
      throw new Error('Blockchain integration not enabled');
    }

    logger.info('blockchain', `Crediting ${amount} FIZZ to ${walletAddress}`, {
      walletAddress,
      amount,
      reason,
      userId,
    });

    try {
      // Convert amount to wei (18 decimals)
      const amountInWei = parseEther(amount.toString());

      const walletClient = walletService.getWalletClient();
      const account = walletService.getAccount();
      const chain = walletService.getChain();

      // Credit reward on smart contract with retry logic
      const hash = await withRetry(
        async () => {
          return await walletClient.writeContract({
            address: this.rewardsAddress!,
            abi: rewardsABI,
            functionName: 'creditReward',
            args: [walletAddress as `0x${string}`, amountInWei],
            account,
            chain,
          });
        },
        blockchainRetryOptions
      );

      logBlockchainTransaction('creditReward', hash, undefined, {
        walletAddress,
        amount,
        reason,
        userId,
      });

      if (userId) {
        logReward('credited', userId, amount, true, undefined, {
          txHash: hash,
          reason,
        });
      }

      // Record gas analytics
      await gasAnalyticsService.recordTransaction(hash, 'creditReward', userId, true);

      return { hash, amount };
    } catch (error: any) {
      logBlockchainTransaction('creditReward', undefined, error, {
        walletAddress,
        amount,
        reason,
        userId,
      });

      if (userId) {
        logReward('credit failed', userId, amount, false, error, { reason });
      }

      throw error;
    }
  }

  /**
   * Batch credit rewards to multiple users
   *
   * @param credits Array of {walletAddress, amount} objects
   * @returns Transaction hash
   */
  async batchCreditRewards(
    credits: Array<{ walletAddress: string; amount: number }>
  ): Promise<{ hash: string; totalAmount: number }> {
    this.initialize();
    if (!this.isEnabled || !this.rewardsAddress) {
      throw new Error('Blockchain integration not enabled');
    }

    const walletAddresses = credits.map(c => c.walletAddress as `0x${string}`);
    const amounts = credits.map(c => parseEther(c.amount.toString()));
    const totalAmount = credits.reduce((sum, c) => sum + c.amount, 0);

    console.log(`[FizzCoin] Batch crediting ${totalAmount} FIZZ to ${credits.length} users`);

    const walletClient = walletService.getWalletClient();
    const account = walletService.getAccount();
    const chain = walletService.getChain();

    const hash = await walletClient.writeContract({
      address: this.rewardsAddress,
      abi: rewardsABI,
      functionName: 'batchCreditRewards',
      args: [walletAddresses, amounts],
      account,
      chain,
    });

    console.log(`[FizzCoin] Batch rewards credited. TX: ${hash}`);

    return { hash, totalAmount };
  }

  /**
   * Get user's actual on-chain balance (claimed tokens in wallet)
   *
   * @param walletAddress User's Ethereum wallet address
   * @returns Balance in FIZZ (e.g., "150.5")
   */
  async getBalance(walletAddress: string): Promise<string> {
    this.initialize();
    if (!this.isEnabled || !this.fizzCoinAddress) {
      throw new Error('Blockchain integration not enabled');
    }

    const publicClient = walletService.getPublicClient();

    const balance = await publicClient.readContract({
      address: this.fizzCoinAddress,
      abi: fizzCoinABI,
      functionName: 'balanceOf',
      args: [walletAddress as `0x${string}`],
    }) as bigint;

    return formatEther(balance);
  }

  /**
   * Get user's pending rewards (not yet claimed from contract)
   *
   * @param walletAddress User's Ethereum wallet address
   * @returns Pending rewards in FIZZ (e.g., "25.0")
   */
  async getPendingRewards(walletAddress: string): Promise<string> {
    this.initialize();
    if (!this.isEnabled || !this.rewardsAddress) {
      throw new Error('Blockchain integration not enabled');
    }

    const publicClient = walletService.getPublicClient();

    const pending = await publicClient.readContract({
      address: this.rewardsAddress,
      abi: rewardsABI,
      functionName: 'getPendingRewards',
      args: [walletAddress as `0x${string}`],
    }) as bigint;

    return formatEther(pending);
  }

  /**
   * Get user's total claimed rewards (historical total)
   *
   * @param walletAddress User's Ethereum wallet address
   * @returns Claimed rewards in FIZZ
   */
  async getClaimedRewards(walletAddress: string): Promise<string> {
    this.initialize();
    if (!this.isEnabled || !this.rewardsAddress) {
      throw new Error('Blockchain integration not enabled');
    }

    const publicClient = walletService.getPublicClient();

    const claimed = await publicClient.readContract({
      address: this.rewardsAddress,
      abi: rewardsABI,
      functionName: 'getClaimedRewards',
      args: [walletAddress as `0x${string}`],
    }) as bigint;

    return formatEther(claimed);
  }

  /**
   * Get user's total rewards (pending + claimed)
   *
   * @param walletAddress User's Ethereum wallet address
   * @returns Total rewards in FIZZ
   */
  async getTotalRewards(walletAddress: string): Promise<string> {
    if (!this.isEnabled || !this.rewardsAddress) {
      throw new Error('Blockchain integration not enabled');
    }

    const publicClient = walletService.getPublicClient();

    const total = await publicClient.readContract({
      address: this.rewardsAddress,
      abi: rewardsABI,
      functionName: 'getTotalRewards',
      args: [walletAddress as `0x${string}`],
    }) as bigint;

    return formatEther(total);
  }

  /**
   * Wait for a transaction to be confirmed
   *
   * @param hash Transaction hash
   * @returns Transaction receipt
   */
  async waitForTransaction(hash: string) {
    if (!this.isEnabled) {
      throw new Error('Blockchain integration not enabled');
    }

    const publicClient = walletService.getPublicClient();

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: hash as Hash
    });

    console.log(`[FizzCoin] Transaction confirmed in block ${receipt.blockNumber}`);

    return receipt;
  }

  /**
   * Get contract addresses
   */
  getContractAddresses() {
    return {
      fizzcoin: this.fizzCoinAddress,
      rewards: this.rewardsAddress
    };
  }

  /**
   * Get the blockchain explorer URL for a transaction
   */
  getExplorerUrl(txHash: string): string {
    const chain = walletService.getChain();
    const baseUrl = chain.id === 8453 ? 'https://basescan.org' : 'https://sepolia.basescan.org';
    return `${baseUrl}/tx/${txHash}`;
  }

  /**
   * Get the blockchain explorer URL for an address
   */
  getAddressExplorerUrl(address: string): string {
    const chain = walletService.getChain();
    const baseUrl = chain.id === 8453 ? 'https://basescan.org' : 'https://sepolia.basescan.org';
    return `${baseUrl}/address/${address}`;
  }
}

// Export singleton instance
export const blockchainFizzCoinService = new BlockchainFizzCoinService();
