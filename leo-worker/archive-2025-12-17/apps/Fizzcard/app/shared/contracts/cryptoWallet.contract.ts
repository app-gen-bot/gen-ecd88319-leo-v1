import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { cryptoWallets } from '../schema.zod';

const c = initContract();

const errorResponseSchema = z.object({
  error: z.string(),
});

const createWalletRequestSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  walletType: z.enum(['embedded', 'external']).default('embedded'),
});

const walletBalanceSchema = z.object({
  onChainBalance: z.number(), // Balance from blockchain
  pendingClaims: z.number(),  // Pending rewards to be claimed
  totalBalance: z.number(),    // onChain + pending
});

const claimRewardsResponseSchema = z.object({
  txHash: z.string(),
  amount: z.number(),
  newBalance: z.number(),
  basescanUrl: z.string().optional(),
});

export const cryptoWalletContract = c.router({
  // Get my crypto wallet
  getMyWallet: {
    method: 'GET',
    path: '/api/crypto-wallet',
    responses: {
      200: cryptoWallets.nullable(),
      401: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Get my crypto wallet (requires authentication)',
  },

  // Create or link wallet
  createWallet: {
    method: 'POST',
    path: '/api/crypto-wallet',
    body: createWalletRequestSchema,
    responses: {
      201: cryptoWallets,
      400: errorResponseSchema,
      401: errorResponseSchema,
      409: z.object({
        error: z.string(),
        existingWallet: cryptoWallets,
      }),
      500: errorResponseSchema,
    },
    summary: 'Create or link crypto wallet to account (requires authentication)',
  },

  // Get wallet balance (on-chain + pending)
  getBalance: {
    method: 'GET',
    path: '/api/crypto-wallet/balance',
    responses: {
      200: walletBalanceSchema,
      401: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Get wallet balance including on-chain and pending claims',
  },

  // Claim pending rewards
  claimRewards: {
    method: 'POST',
    path: '/api/crypto-wallet/claim',
    body: z.object({}), // Empty body, just trigger the claim
    responses: {
      200: claimRewardsResponseSchema,
      400: errorResponseSchema,
      401: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Claim all pending rewards (gasless transaction)',
  },
});
