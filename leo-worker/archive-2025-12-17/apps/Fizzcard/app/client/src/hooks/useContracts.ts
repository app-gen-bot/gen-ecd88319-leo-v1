/**
 * Contract Hooks
 * React hooks for interacting with FizzCoin and Rewards smart contracts
 */

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits, type Address } from 'viem';
import { FIZZCOIN_ADDRESS, REWARDS_ADDRESS } from '@/contracts/config';
import FizzCoinABI from '@/contracts/FizzCoinABI.json';
import RewardsABI from '@/contracts/RewardsABI.json';

/**
 * Hook to read FizzCoin balance for an address
 */
export function useFizzCoinBalance(address: Address | undefined) {
  const { data: balance, isLoading, refetch } = useReadContract({
    address: FIZZCOIN_ADDRESS,
    abi: FizzCoinABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    balance: balance ? Number(formatUnits(balance as bigint, 18)) : 0,
    balanceRaw: balance as bigint | undefined,
    isLoading,
    refetch,
  };
}

/**
 * Hook to read FizzCoin total supply
 */
export function useFizzCoinTotalSupply() {
  const { data: totalSupply, isLoading } = useReadContract({
    address: FIZZCOIN_ADDRESS,
    abi: FizzCoinABI,
    functionName: 'totalSupply',
  });

  return {
    totalSupply: totalSupply ? Number(formatUnits(totalSupply as bigint, 18)) : 0,
    isLoading,
  };
}

/**
 * Hook to read FizzCoin max supply
 */
export function useFizzCoinMaxSupply() {
  const { data: maxSupply, isLoading } = useReadContract({
    address: FIZZCOIN_ADDRESS,
    abi: FizzCoinABI,
    functionName: 'MAX_SUPPLY',
  });

  return {
    maxSupply: maxSupply ? Number(formatUnits(maxSupply as bigint, 18)) : 1_000_000_000,
    isLoading,
  };
}

/**
 * Hook to mint connection reward (on-chain)
 * This should be called from the backend via a wallet with the rewardDistributor role
 */
export function useMintConnectionReward() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mintConnectionReward = (user1: Address, user2: Address) => {
    writeContract({
      address: REWARDS_ADDRESS,
      abi: RewardsABI,
      functionName: 'mintConnectionReward',
      args: [user1, user2],
    });
  };

  return {
    mintConnectionReward,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook to mint introduction reward (on-chain)
 */
export function useMintIntroductionReward() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mintIntroductionReward = (introducer: Address) => {
    writeContract({
      address: REWARDS_ADDRESS,
      abi: RewardsABI,
      functionName: 'mintIntroductionReward',
      args: [introducer],
    });
  };

  return {
    mintIntroductionReward,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook to mint referral reward (on-chain)
 */
export function useMintReferralReward() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mintReferralReward = (referrer: Address) => {
    writeContract({
      address: REWARDS_ADDRESS,
      abi: RewardsABI,
      functionName: 'mintReferralReward',
      args: [referrer],
    });
  };

  return {
    mintReferralReward,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook to mint event check-in reward (on-chain)
 */
export function useMintEventReward() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mintEventReward = (user: Address) => {
    writeContract({
      address: REWARDS_ADDRESS,
      abi: RewardsABI,
      functionName: 'mintEventReward',
      args: [user],
    });
  };

  return {
    mintEventReward,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Helper to format FIZZ amount for display
 */
export function formatFizz(amount: number | bigint): string {
  if (typeof amount === 'bigint') {
    return Number(formatUnits(amount, 18)).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Helper to parse FIZZ amount from string
 */
export function parseFizz(amount: string): bigint {
  return parseUnits(amount, 18);
}
