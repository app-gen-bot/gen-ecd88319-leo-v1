import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { leaderboardQuerySchema } from '../schema.zod';

const c = initContract();

const errorResponseSchema = z.object({
  error: z.string(),
});

const leaderboardEntry = z.object({
  userId: z.number(),
  name: z.string(),
  avatarUrl: z.string().url().optional().nullable(),
  title: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  fizzCoinBalance: z.number(),
  connectionCount: z.number(),
  isSuperConnector: z.boolean(),
  badges: z.array(z.enum(['super_connector', 'early_adopter', 'top_earner', 'event_host', 'verified'])),
  rank: z.number(),
});

const superConnector = z.object({
  userId: z.number(),
  name: z.string(),
  avatarUrl: z.string().url().optional().nullable(),
  title: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  connectionCount: z.number(),
  fizzCoinBalance: z.number(),
  strengthScore: z.number().min(0).max(100),
  badges: z.array(z.enum(['super_connector', 'early_adopter', 'top_earner', 'event_host', 'verified'])),
  industries: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
});

export const leaderboardContract = c.router({
  getLeaderboard: {
    method: 'GET',
    path: '/api/leaderboard',
    query: leaderboardQuerySchema,
    responses: {
      200: z.object({
        data: z.array(leaderboardEntry),
        pagination: z.object({
          page: z.number(),
          limit: z.number(),
          total: z.number(),
          totalPages: z.number(),
        }),
      }),
      400: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Get leaderboard with optional filters (location, time range)',
  },
  getSuperConnectors: {
    method: 'GET',
    path: '/api/super-connectors',
    query: z.object({
      location: z.string().optional(),
      industry: z.string().optional(),
      minConnections: z.coerce.number().optional(),
      page: z.coerce.number().min(1).optional().default(1),
      limit: z.coerce.number().min(1).max(100).optional().default(20),
    }),
    responses: {
      200: z.object({
        data: z.array(superConnector),
        pagination: z.object({
          page: z.number(),
          limit: z.number(),
          total: z.number(),
          totalPages: z.number(),
        }),
      }),
      400: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Discover super-connectors (top 10% networkers) with filters',
  },
  getMyRank: {
    method: 'GET',
    path: '/api/leaderboard/my-rank',
    responses: {
      200: z.object({
        rank: z.number(),
        totalUsers: z.number(),
        percentile: z.number(),
        fizzCoinBalance: z.number(),
        connectionCount: z.number(),
      }),
      401: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Get my current rank on the leaderboard (requires authentication)',
  },
});
