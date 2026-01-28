/**
 * Privy Type Definitions
 *
 * TypeScript types for Privy embedded wallets and authentication.
 */

/**
 * Privy User type
 */
export interface PrivyUser {
  id: string;
  email?: {
    address: string;
  };
  wallet?: {
    address: string;
    chainId: string;
  };
  createdAt: string;
}

/**
 * Privy Wallet type
 */
export interface PrivyWallet {
  address: string;
  chainId: string;
  walletClientType: 'privy' | 'metamask' | 'coinbase_wallet' | 'wallet_connect';
  connectorType?: string;
  imported: boolean;
  delegated: boolean;
  recoveryMethod?: 'privy' | 'user-passcode' | 'google-drive' | 'icloud';
}

/**
 * Privy embedded wallet
 */
export interface PrivyEmbeddedWallet extends PrivyWallet {
  walletClientType: 'privy';
}

/**
 * Wallet creation result
 */
export interface WalletCreationResult {
  wallet: PrivyWallet;
  success: boolean;
  error?: string;
}

/**
 * Wallet sync status
 */
export interface WalletSyncStatus {
  synced: boolean;
  walletAddress: string | null;
  error?: string;
}

/**
 * Helper to check if wallet is embedded
 */
export function isEmbeddedWallet(wallet: PrivyWallet): wallet is PrivyEmbeddedWallet {
  return wallet.walletClientType === 'privy';
}

/**
 * Helper to validate Ethereum address format
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
