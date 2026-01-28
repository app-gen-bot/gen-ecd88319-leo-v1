import { createWalletClient, createPublicClient, http, type WalletClient, type PublicClient, type Chain } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { privateKeyToAccount, type PrivateKeyAccount } from 'viem/accounts';

/**
 * Wallet Service for Backend Wallet Management
 *
 * Manages the backend wallet used for:
 * - Deploying smart contracts
 * - Funding reward contracts
 * - Crediting rewards to users
 *
 * Security:
 * - Private key stored in environment variable
 * - Never exposed to client
 * - Used only for backend operations
 */
class WalletService {
  private walletClient: WalletClient | null = null;
  private publicClient: PublicClient | null = null;
  private account: PrivateKeyAccount | null = null;
  private chain: Chain;
  private isInitialized = false;

  constructor() {
    // Determine chain based on environment
    const blockchainMode = process.env.BLOCKCHAIN_MODE || 'testnet';
    this.chain = blockchainMode === 'mainnet' ? base : baseSepolia;
  }

  /**
   * Initialize the wallet service
   * Must be called before using any wallet functions
   */
  private initialize() {
    if (this.isInitialized) {
      return;
    }

    const privateKey = process.env.REWARD_WALLET_PRIVATE_KEY;
    if (!privateKey) {
      console.warn('[WalletService] REWARD_WALLET_PRIVATE_KEY not set - blockchain features disabled');
      return;
    }

    try {
      // Create account from private key
      this.account = privateKeyToAccount(privateKey as `0x${string}`);

      const rpcUrl = process.env.BASE_RPC_URL;
      if (!rpcUrl) {
        throw new Error('BASE_RPC_URL environment variable not set');
      }

      // Create wallet client for transactions
      this.walletClient = createWalletClient({
        account: this.account,
        chain: this.chain,
        transport: http(rpcUrl)
      });

      // Create public client for queries
      this.publicClient = createPublicClient({
        chain: this.chain,
        transport: http(rpcUrl)
      });

      this.isInitialized = true;
      console.log(`[WalletService] Initialized on ${this.chain.name}`);
      console.log(`[WalletService] Backend wallet: ${this.account.address}`);
    } catch (error) {
      console.error('[WalletService] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Get the backend wallet address
   */
  getAddress(): string {
    this.initialize();
    if (!this.account) {
      throw new Error('Wallet not initialized');
    }
    return this.account.address;
  }

  /**
   * Get the balance of the backend wallet (in ETH)
   */
  async getBalance(): Promise<bigint> {
    this.initialize();
    if (!this.publicClient || !this.account) {
      throw new Error('Wallet not initialized');
    }

    const balance = await this.publicClient.getBalance({
      address: this.account.address
    });

    return balance;
  }

  /**
   * Get the balance of any address (in ETH)
   */
  async getBalanceOf(address: string): Promise<bigint> {
    this.initialize();
    if (!this.publicClient) {
      throw new Error('Wallet not initialized');
    }

    const balance = await this.publicClient.getBalance({
      address: address as `0x${string}`
    });

    return balance;
  }

  /**
   * Send ETH to an address
   * @param to Recipient address
   * @param value Amount in wei
   */
  async sendTransaction(to: string, value: bigint): Promise<string> {
    this.initialize();
    if (!this.walletClient || !this.account) {
      throw new Error('Wallet not initialized');
    }

    const hash = await this.walletClient.sendTransaction({
      account: this.account,
      to: to as `0x${string}`,
      value,
      gas: 21000n,
      chain: this.chain
    });

    console.log(`[WalletService] Transaction sent: ${hash}`);
    return hash;
  }

  /**
   * Get wallet client for contract interactions
   */
  getWalletClient(): WalletClient {
    this.initialize();
    if (!this.walletClient) {
      throw new Error('Wallet not initialized');
    }
    return this.walletClient;
  }

  /**
   * Get public client for read operations
   */
  getPublicClient(): PublicClient {
    this.initialize();
    if (!this.publicClient) {
      throw new Error('Wallet not initialized');
    }
    return this.publicClient;
  }

  /**
   * Get the current chain
   */
  getChain(): Chain {
    return this.chain;
  }

  /**
   * Get the account
   */
  getAccount(): PrivateKeyAccount {
    this.initialize();
    if (!this.account) {
      throw new Error('Wallet not initialized');
    }
    return this.account;
  }

  /**
   * Check if wallet is initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.walletClient !== null && this.account !== null;
  }
}

// Export singleton instance
export const walletService = new WalletService();
