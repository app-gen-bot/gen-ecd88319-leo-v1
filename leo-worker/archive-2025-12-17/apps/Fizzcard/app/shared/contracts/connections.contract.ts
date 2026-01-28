import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { connections, connectionsQuerySchema } from '../schema.zod';

const c = initContract();

const errorResponseSchema = z.object({
  error: z.string(),
});

const successResponseSchema = z.object({
  message: z.string(),
});

const connectionWithDetails = connections.extend({
  connectedUserName: z.string(),
  connectedUserAvatar: z.string().url().optional().nullable(),
  connectedUserTitle: z.string().optional().nullable(),
  connectedUserCompany: z.string().optional().nullable(),
  locationName: z.string().optional().nullable(),
  metAt: z.string().datetime().optional().nullable(),
});

const connectionUpdateSchema = z.object({
  relationshipNote: z.string().optional(),
  tags: z.array(z.string()).optional(),
  strengthScore: z.number().min(0).max(100).optional(),
});

export const connectionsContract = c.router({
  getAll: {
    method: 'GET',
    path: '/api/connections',
    query: connectionsQuerySchema,
    responses: {
      200: z.object({
        data: z.array(connectionWithDetails),
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
    summary: 'Get all my connections with filters (requires authentication)',
  },
  getById: {
    method: 'GET',
    path: '/api/connections/:id',
    pathParams: z.object({
      id: z.coerce.number(),
    }),
    responses: {
      200: connectionWithDetails,
      401: errorResponseSchema,
      403: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Get single connection by ID (requires authentication)',
  },
  update: {
    method: 'PUT',
    path: '/api/connections/:id',
    pathParams: z.object({
      id: z.coerce.number(),
    }),
    body: connectionUpdateSchema,
    responses: {
      200: connections,
      400: errorResponseSchema,
      401: errorResponseSchema,
      403: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Update connection (relationship note, tags, strength score) (requires authentication)',
  },
  delete: {
    method: 'DELETE',
    path: '/api/connections/:id',
    pathParams: z.object({
      id: z.coerce.number(),
    }),
    body: z.object({}),
    responses: {
      200: successResponseSchema,
      401: errorResponseSchema,
      403: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Remove connection (requires authentication)',
  },
});
