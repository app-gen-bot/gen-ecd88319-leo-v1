import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { createFeedbackSchema, userFeedbackSchema } from '../schema.zod';

const c = initContract();

export const feedbackContract = c.router({
  create: {
    method: 'POST',
    path: '/api/feedback',
    body: createFeedbackSchema,
    responses: {
      201: userFeedbackSchema,
      400: z.object({
        error: z.string(),
      }),
      401: z.object({
        error: z.string(),
      }),
    },
    summary: 'Submit user feedback (feature request or bug report)',
  },

  list: {
    method: 'GET',
    path: '/api/feedback',
    responses: {
      200: z.array(userFeedbackSchema),
      401: z.object({
        error: z.string(),
      }),
    },
    summary: 'List all feedback for authenticated user',
  },
});
