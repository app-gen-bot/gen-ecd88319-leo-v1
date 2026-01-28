/**
 * Crypto Wallet Hook
 *
 * Manages blockchain wallet creation, balance queries, and reward claiming.
 * Integrates with Privy for wallet management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';
import { celebrateClaim, celebrateSuccess } from '@/lib/confetti';

export function useCryptoWallet() {
  const queryClient = useQueryClient();

  /**
   * Get my crypto wallet
   */
  const {
    data: wallet,
    isLoading: isLoadingWallet,
    refetch: refetchWallet,
  } = useQuery({
    queryKey: ['cryptoWallet'],
    queryFn: async () => {
      const response = await apiClient.cryptoWallet.getMyWallet();
      if (response.status !== 200) {
        throw new Error('Failed to fetch wallet');
      }
      return response.body;
    },
    enabled: true, // Always try to fetch, will return null if no wallet
  });

  /**
   * Get wallet balance (on-chain + pending)
   */
  const {
    data: balance,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: ['cryptoWalletBalance'],
    queryFn: async () => {
      const response = await apiClient.cryptoWallet.getBalance();
      if (response.status !== 200) {
        throw new Error('Failed to fetch balance');
      }
      return response.body;
    },
    enabled: !!wallet, // Only fetch balance if wallet exists
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  /**
   * Create or link wallet
   */
  const createWalletMutation = useMutation({
    mutationFn: async (walletAddress: string) => {
      const response = await apiClient.cryptoWallet.createWallet({
        body: {
          walletAddress,
          walletType: 'embedded',
        },
      });

      if (response.status !== 201) {
        if (response.status === 409 && response.body && 'existingWallet' in response.body) {
          // Wallet already exists
          return response.body.existingWallet;
        }
        const errorBody = response.body as any;
        throw new Error(errorBody?.error || 'Failed to create wallet');
      }

      return response.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cryptoWallet'] });
      queryClient.invalidateQueries({ queryKey: ['cryptoWalletBalance'] });

      // Celebrate wallet creation
      celebrateSuccess();

      toast.success('Crypto wallet connected!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create wallet: ${error.message}`);
    },
  });

  /**
   * Claim pending rewards
   */
  const claimRewardsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.cryptoWallet.claimRewards({
        body: {},
      });

      if (response.status !== 200) {
        const errorBody = response.body as any;
        throw new Error(errorBody?.error || 'Failed to claim rewards');
      }

      return response.body;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cryptoWalletBalance'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] }); // Also refresh legacy wallet
      queryClient.invalidateQueries({ queryKey: ['transactions'] }); // Refresh transaction history

      // Celebrate with confetti!
      celebrateClaim();

      // Show success message
      toast.success(`Claimed ${data.amount} FIZZ! 🎉`);

      // If BaseScan URL exists, show a second toast with the link
      if (data.basescanUrl) {
        setTimeout(() => {
          toast(
            `Transaction confirmed! View on BaseScan: ${data.txHash.slice(0, 10)}...`,
            {
              duration: 10000,
              icon: '🔗',
            }
          );
        }, 500);
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to claim rewards: ${error.message}`);
    },
  });

  return {
    // Wallet data
    wallet,
    balance,
    isLoadingWallet,
    isLoadingBalance,

    // Wallet status
    hasWallet: !!wallet,
    hasPendingRewards: (balance?.pendingClaims || 0) > 0,

    // Mutations
    createWallet: createWalletMutation.mutate,
    claimRewards: claimRewardsMutation.mutate,
    isCreatingWallet: createWalletMutation.isPending,
    isClaimingRewards: claimRewardsMutation.isPending,

    // Refetch functions
    refetchWallet,
    refetchBalance,
  };
}
