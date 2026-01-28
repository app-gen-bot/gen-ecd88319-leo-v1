import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { createGenerationRequestSchema, generationRequests } from '../schema.zod';

const c = initContract();

export const generationsContract = c.router({
  create: {
    method: 'POST',
    path: '/api/generations',
    body: createGenerationRequestSchema,
    responses: {
      201: generationRequests,
      400: z.object({
        error: z.string(),
      }),
      401: z.object({
        error: z.string(),
      }),
    },
    summary: 'Create a new generation request',
  },

  list: {
    method: 'GET',
    path: '/api/generations',
    responses: {
      200: z.array(generationRequests),
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
      200: generationRequests,
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
});
