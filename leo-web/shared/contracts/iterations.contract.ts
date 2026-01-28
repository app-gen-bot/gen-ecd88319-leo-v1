import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

// Deprecated error schema for all iteration endpoints
const deprecatedError = z.object({
  error: z.string(),
  message: z.string(),
});

// Iteration snapshots feature has been deprecated (table dropped)
// All endpoints now return 501 Not Implemented
export const iterationsContract = c.router({
  // List iteration snapshots for a generation (DEPRECATED)
  listByGeneration: {
    method: 'GET',
    path: '/api/generations/:id/iterations',
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      501: deprecatedError,
    },
    summary: '[DEPRECATED] List iteration snapshots for a generation',
  },

  // Get specific iteration snapshot (DEPRECATED)
  getById: {
    method: 'GET',
    path: '/api/iterations/:snapshotId',
    pathParams: z.object({
      snapshotId: z.string(),
    }),
    responses: {
      501: deprecatedError,
    },
    summary: '[DEPRECATED] Get a specific iteration snapshot',
  },

  // Rollback to iteration (DEPRECATED)
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
      501: deprecatedError,
    },
    summary: '[DEPRECATED] Rollback generation to a specific iteration',
  },

  // Delete iteration snapshot (DEPRECATED)
  delete: {
    method: 'DELETE',
    path: '/api/iterations/:snapshotId',
    pathParams: z.object({
      snapshotId: z.string(),
    }),
    responses: {
      501: deprecatedError,
    },
    summary: '[DEPRECATED] Delete an iteration snapshot',
  },
});
