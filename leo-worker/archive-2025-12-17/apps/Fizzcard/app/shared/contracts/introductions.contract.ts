import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { introductions, insertIntroductionsSchema, introductionsQuerySchema } from '../schema.zod';

const c = initContract();

const errorResponseSchema = z.object({
  error: z.string(),
});

const successResponseSchema = z.object({
  message: z.string(),
});

const introductionWithDetails = introductions.extend({
  introducerName: z.string(),
  personAName: z.string(),
  personBName: z.string(),
  personAAvatar: z.string().url().optional().nullable(),
  personBAvatar: z.string().url().optional().nullable(),
  personATitle: z.string().optional().nullable(),
  personBTitle: z.string().optional().nullable(),
  personACompany: z.string().optional().nullable(),
  personBCompany: z.string().optional().nullable(),
});

export const introductionsContract = c.router({
  create: {
    method: 'POST',
    path: '/api/introductions',
    body: insertIntroductionsSchema.omit({ introducerId: true, status: true, fizzcoinReward: true }),
    responses: {
      201: introductions,
      400: errorResponseSchema,
      401: errorResponseSchema,
      403: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Create introduction between two connections (requires authentication)',
  },
  getReceived: {
    method: 'GET',
    path: '/api/introductions/received',
    query: introductionsQuerySchema,
    responses: {
      200: z.object({
        data: z.array(introductionWithDetails),
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
    summary: 'Get introduction requests received (requires authentication)',
  },
  getMade: {
    method: 'GET',
    path: '/api/introductions/made',
    query: introductionsQuerySchema,
    responses: {
      200: z.object({
        data: z.array(introductionWithDetails),
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
    summary: 'Get introductions I have made (requires authentication)',
  },
  accept: {
    method: 'PUT',
    path: '/api/introductions/:id/accept',
    pathParams: z.object({
      id: z.coerce.number(),
    }),
    body: z.object({}),
    responses: {
      200: z.object({
        introduction: introductions,
        fizzcoinsAwarded: z.number(),
      }),
      400: errorResponseSchema,
      401: errorResponseSchema,
      403: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Accept introduction (requires authentication)',
  },
  decline: {
    method: 'PUT',
    path: '/api/introductions/:id/decline',
    pathParams: z.object({
      id: z.coerce.number(),
    }),
    body: z.object({}),
    responses: {
      200: introductions,
      400: errorResponseSchema,
      401: errorResponseSchema,
      403: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Decline introduction (requires authentication)',
  },
});
