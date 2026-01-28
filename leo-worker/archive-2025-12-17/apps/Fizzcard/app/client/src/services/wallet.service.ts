/**
 * Wallet Service
 *
 * Utility functions for Privy embedded wallet management.
 * Handles wallet creation, address extraction, and backend synchronization.
 */

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { apiClient } from '@/lib/api-client';

/**
 * Get the user's embedded wallet (if exists)
 */
export function getEmbeddedWallet(wallets: any[]) {
  return wallets.find(
    (wallet: any) => wallet.walletClientType === 'privy'
  );
}

/**
 * Get wallet address from embedded wallet
 */
export function getWalletAddress(wallet: any): string | null {
  if (!wallet || !wallet.address) {
    return null;
  }
  return wallet.address;
}

/**
 * Sync wallet address to backend
 */
export async function syncWalletToBackend(
  walletAddress: string
): Promise<boolean> {
  try {
    console.log('[Wallet Service] Syncing wallet to backend:', walletAddress);

    const response = await apiClient.cryptoWallet.createWallet({
      body: {
        walletAddress,
        walletType: 'embedded',
      },
    });

    if (response.status === 201) {
      console.log('[Wallet Service] Wallet synced successfully');
      return true;
    } else if (response.status === 409) {
      console.log('[Wallet Service] Wallet already exists in backend');
      return true; // Wallet already exists, which is fine
    } else {
      console.error('[Wallet Service] Failed to sync wallet:', response.status);
      return false;
    }
  } catch (error) {
    console.error('[Wallet Service] Error syncing wallet:', error);
    return false;
  }
}

/**
 * Hook to manage embedded wallet lifecycle
 */
export function useEmbeddedWalletSync() {
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();

  const embeddedWallet = getEmbeddedWallet(wallets);
  const walletAddress = embeddedWallet ? getWalletAddress(embeddedWallet) : null;

  return {
    ready,
    authenticated,
    user,
    wallets,
    embeddedWallet,
    walletAddress,
    hasWallet: !!embeddedWallet,
  };
}
