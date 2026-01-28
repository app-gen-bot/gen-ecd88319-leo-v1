/**
 * Smart Contract Configuration
 * Contract addresses and network configuration for FizzCard
 */

import { baseSepolia } from 'viem/chains';

// Contract addresses (deployed on Base Sepolia)
export const FIZZCOIN_ADDRESS = '0x8C6E04f93BB1c639ca1CBacF145D624e7BDF4Ca7' as const;
export const REWARDS_ADDRESS = '0x9c8376CA2ffdCfBA55AB46dBe168b8c1d09dA21a' as const;

// Network configuration
export const CHAIN = baseSepolia;
export const CHAIN_ID = baseSepolia.id;

// RPC URLs
export const RPC_URL = import.meta.env.VITE_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org';

// Block explorer
export const BLOCK_EXPLORER_URL = 'https://sepolia.basescan.org';

// Helper to get block explorer link for transaction
export function getTxExplorerLink(txHash: string): string {
  return `${BLOCK_EXPLORER_URL}/tx/${txHash}`;
}

// Helper to get block explorer link for address
export function getAddressExplorerLink(address: string): string {
  return `${BLOCK_EXPLORER_URL}/address/${address}`;
}
