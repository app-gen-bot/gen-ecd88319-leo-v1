import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { userAppSummarySchema } from '../schema.zod';

const c = initContract();

export const appsContract = c.router({
  list: {
    method: 'GET',
    path: '/api/apps',
    responses: {
      200: z.array(userAppSummarySchema),
      401: z.object({
        error: z.string(),
      }),
    },
    summary: 'List all apps for authenticated user (for Resume dropdown)',
  },
});
