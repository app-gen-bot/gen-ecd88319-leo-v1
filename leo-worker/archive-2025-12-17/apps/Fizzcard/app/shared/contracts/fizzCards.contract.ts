import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { fizzCards, insertFizzCardsSchema, fizzCardsQuerySchema } from '../schema.zod';

const c = initContract();

const errorResponseSchema = z.object({
  error: z.string(),
});

const successResponseSchema = z.object({
  message: z.string(),
});

const fizzCardUpdateSchema = z.object({
  displayName: z.string().min(1).optional(),
  title: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  themeColor: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const fizzCardsContract = c.router({
  getAllPublic: {
    method: 'GET',
    path: '/api/fizzcards',
    query: fizzCardsQuerySchema,
    responses: {
      200: z.object({
        data: z.array(fizzCards),
        pagination: z.object({
          page: z.number(),
          limit: z.number(),
          total: z.number(),
          totalPages: z.number(),
        }),
      }),
      500: errorResponseSchema,
    },
    summary: 'Get all public FizzCards with pagination',
  },
  getMyFizzCards: {
    method: 'GET',
    path: '/api/fizzcards/my',
    responses: {
      200: z.array(fizzCards),
      401: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Get my FizzCards (requires authentication)',
  },
  getById: {
    method: 'GET',
    path: '/api/fizzcards/:id',
    pathParams: z.object({
      id: z.coerce.number(),
    }),
    responses: {
      200: fizzCards,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Get single FizzCard by ID',
  },
  create: {
    method: 'POST',
    path: '/api/fizzcards',
    body: insertFizzCardsSchema.omit({ userId: true }),
    responses: {
      201: fizzCards,
      400: errorResponseSchema,
      401: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Create new FizzCard (requires authentication)',
  },
  update: {
    method: 'PUT',
    path: '/api/fizzcards/:id',
    pathParams: z.object({
      id: z.coerce.number(),
    }),
    body: fizzCardUpdateSchema,
    responses: {
      200: fizzCards,
      400: errorResponseSchema,
      401: errorResponseSchema,
      403: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Update FizzCard (requires authentication)',
  },
  delete: {
    method: 'DELETE',
    path: '/api/fizzcards/:id',
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
    summary: 'Delete FizzCard (requires authentication)',
  },
});
