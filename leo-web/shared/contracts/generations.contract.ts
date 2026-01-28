import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { createGenerationRequestSchema, generationRequestWithAppSchema } from '../schema.zod';

const c = initContract();

// Pool info schema for active generations response
const poolInfoSchema = z.object({
  available: z.number(),
  total: z.number(),
  mode: z.enum(['pooled', 'per-app']),
});

// Active generations response schema
const activeGenerationsResponseSchema = z.object({
  active: z.array(generationRequestWithAppSchema),
  activeCount: z.number(),
  maxConcurrent: z.number(),
  canStartNew: z.boolean(),
  poolInfo: poolInfoSchema,
});

// API responses include app fields (userId, appName, githubUrl, deploymentUrl)
// joined from apps table via appRefId
export const generationsContract = c.router({
  create: {
    method: 'POST',
    path: '/api/generations',
    body: createGenerationRequestSchema,
    responses: {
      201: generationRequestWithAppSchema,
      400: z.object({
        error: z.string(),
      }),
      401: z.object({
        error: z.string(),
      }),
      429: z.object({
        error: z.string(),
        activeCount: z.number(),
        maxConcurrent: z.number(),
      }),
    },
    summary: 'Create a new generation request',
  },

  // Get active generations and concurrency info
  getActive: {
    method: 'GET',
    path: '/api/generations/active',
    responses: {
      200: activeGenerationsResponseSchema,
      401: z.object({
        error: z.string(),
      }),
    },
    summary: 'Get active generations and concurrency limits',
  },

  list: {
    method: 'GET',
    path: '/api/generations',
    responses: {
      200: z.array(generationRequestWithAppSchema),
      401: z.object({
        error: z.string(),
      }),
    },
    summary: 'List all generation requests for authenticated user',
  },

  getById: {
    method: 'GET',
    path: '/api/generations/:id',
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: generationRequestWithAppSchema,
      401: z.object({
        error: z.string(),
      }),
      404: z.object({
        error: z.string(),
      }),
    },
    summary: 'Get a specific generation request',
  },

  getDownloadUrl: {
    method: 'GET',
    path: '/api/generations/:id/download',
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: z.object({
        downloadUrl: z.string().url(),
      }),
      401: z.object({
        error: z.string(),
      }),
      404: z.object({
        error: z.string(),
      }),
      400: z.object({
        error: z.string(),
      }),
    },
    summary: 'Get download URL for completed generation',
  },

  cancel: {
    method: 'POST',
    path: '/api/generations/:id/cancel',
    pathParams: z.object({
      id: z.string(),
    }),
    body: z.object({}).optional(),
    responses: {
      200: generationRequestWithAppSchema,
      400: z.object({
        error: z.string(),
      }),
      401: z.object({
        error: z.string(),
      }),
      404: z.object({
        error: z.string(),
      }),
    },
    summary: 'Cancel an active or paused generation',
  },
});
