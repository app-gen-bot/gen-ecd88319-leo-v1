import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { iterationSnapshotSchema } from '../schema.zod';

const c = initContract();

export const iterationsContract = c.router({
  // List iteration snapshots for a generation
  listByGeneration: {
    method: 'GET',
    path: '/api/generations/:id/iterations',
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: z.array(iterationSnapshotSchema),
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
    summary: 'List iteration snapshots for a generation',
  },

  // Get specific iteration snapshot
  getById: {
    method: 'GET',
    path: '/api/iterations/:snapshotId',
    pathParams: z.object({
      snapshotId: z.string(),
    }),
    responses: {
      200: iterationSnapshotSchema,
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
    summary: 'Get a specific iteration snapshot',
  },

  // Rollback to iteration
  rollback: {
    method: 'POST',
    path: '/api/generations/:id/rollback',
    pathParams: z.object({
      id: z.string(),
    }),
    body: z.object({
      snapshotId: z.number(),
    }),
    responses: {
      200: z.object({
        success: z.boolean(),
        message: z.string(),
        snapshot: iterationSnapshotSchema,
      }),
      400: z.object({
        error: z.string(),
      }),
      401: z.object({
        error: z.string(),
      }),
      404: z.object({
        error: z.string(),
      }),
      500: z.object({
        error: z.string(),
      }),
    },
    summary: 'Rollback generation to a specific iteration',
  },

  // Delete iteration snapshot
  delete: {
    method: 'DELETE',
    path: '/api/iterations/:snapshotId',
    pathParams: z.object({
      snapshotId: z.string(),
    }),
    responses: {
      200: z.object({
        success: z.boolean(),
      }),
      400: z.object({
        error: z.string(),
      }),
      401: z.object({
        error: z.string(),
      }),
      404: z.object({
        error: z.string(),
      }),
      500: z.object({
        error: z.string(),
      }),
    },
    summary: 'Delete an iteration snapshot',
  },
});
