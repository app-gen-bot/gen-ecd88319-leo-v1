import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

// User app summary for Resume dropdown
// Contains all fields needed to populate a resume generation request
export const userAppSummarySchema = z.object({
  id: z.number(),
  appId: z.string().uuid(),
  appName: z.string(),
  githubUrl: z.string().url().nullable(),
  deploymentUrl: z.string().url().nullable(), // Fly.io URL for resume
  lastSessionId: z.string().nullable(),
  updatedAt: z.string().datetime(),
  status: z.string(),
});

export type UserAppSummary = z.infer<typeof userAppSummarySchema>;

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
