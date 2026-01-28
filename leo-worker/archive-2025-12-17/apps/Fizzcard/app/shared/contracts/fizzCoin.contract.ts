import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { fizzCoinWallets, fizzCoinTransactions, fizzCoinTransactionsQuerySchema } from '../schema.zod';

const c = initContract();

const errorResponseSchema = z.object({
  error: z.string(),
});

const successResponseSchema = z.object({
  message: z.string(),
});

const transferRequestSchema = z.object({
  recipientUserId: z.number(),
  amount: z.number().min(1),
  note: z.string().optional(),
});

const transactionWithDetails = fizzCoinTransactions.extend({
  recipientName: z.string().optional(),
  senderName: z.string().optional(),
});

export const fizzCoinContract = c.router({
  getWallet: {
    method: 'GET',
    path: '/api/wallet',
    responses: {
      200: fizzCoinWallets,
      401: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Get my wallet balance (requires authentication)',
  },
  getTransactions: {
    method: 'GET',
    path: '/api/wallet/transactions',
    query: fizzCoinTransactionsQuerySchema,
    responses: {
      200: z.object({
        data: z.array(transactionWithDetails),
        pagination: z.object({
          page: z.number(),
          limit: z.number(),
          total: z.number(),
          totalPages: z.number(),
        }),
      }),
      401: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Get transaction history (requires authentication)',
  },
  transfer: {
    method: 'POST',
    path: '/api/wallet/transfer',
    body: transferRequestSchema,
    responses: {
      201: z.object({
        transaction: fizzCoinTransactions,
        newBalance: z.number(),
      }),
      400: errorResponseSchema,
      401: errorResponseSchema,
      403: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Transfer FizzCoins to another user (requires authentication)',
  },
});
