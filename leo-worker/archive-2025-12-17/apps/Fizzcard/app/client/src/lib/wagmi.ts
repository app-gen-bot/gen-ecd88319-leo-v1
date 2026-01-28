/**
 * Wagmi Configuration for FizzCard
 * Sets up blockchain connection and wallet integration
 */

import { createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { CHAIN, RPC_URL } from '@/contracts/config';

// Create wagmi config
export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(RPC_URL),
  },
});

// Export chain for convenience
export { CHAIN };
