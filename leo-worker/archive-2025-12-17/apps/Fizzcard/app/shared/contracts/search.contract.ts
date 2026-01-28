import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { searchConnectionsQuerySchema, searchUsersQuerySchema } from '../schema.zod';

const c = initContract();

const errorResponseSchema = z.object({
  error: z.string(),
});

const connectionSearchResult = z.object({
  connectionId: z.number(),
  userId: z.number(),
  name: z.string(),
  title: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  bio: z.string().optional().nullable(),
  locationName: z.string().optional().nullable(),
  metAt: z.string().datetime().optional().nullable(),
  tags: z.array(z.string()),
  strengthScore: z.number().min(0).max(100),
  relationshipNote: z.string().optional().nullable(),
});

export const searchContract = c.router({
  searchConnections: {
    method: 'GET',
    path: '/api/search/connections',
    query: searchConnectionsQuerySchema,
    responses: {
      200: z.object({
        data: z.array(connectionSearchResult),
        pagination: z.object({
          page: z.number(),
          limit: z.number(),
          total: z.number(),
          totalPages: z.number(),
        }),
        filters: z.object({
          locations: z.array(z.string()),
          companies: z.array(z.string()),
          tags: z.array(z.string()),
        }),
      }),
      401: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Search connections with advanced filters (requires authentication)',
  },
  searchUsers: {
    method: 'GET',
    path: '/api/search/users',
    query: searchUsersQuerySchema,
    responses: {
      200: z.object({
        data: z.array(
          z.object({
            userId: z.number(),
            name: z.string(),
            title: z.string().optional().nullable(),
            company: z.string().optional().nullable(),
            avatarUrl: z.string().url().optional().nullable(),
            bio: z.string().optional().nullable(),
            isSuperConnector: z.boolean(),
            connectionCount: z.number(),
            isConnection: z.boolean().optional(),
          })
        ),
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
    summary: 'Search all users (public)',
  },
});
