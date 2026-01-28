import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { badges } from '../schema.zod';

const c = initContract();

const errorResponseSchema = z.object({
  error: z.string(),
});

const badgeWithDetails = badges.extend({
  badgeName: z.string(),
  badgeDescription: z.string(),
  badgeIcon: z.string().optional(),
});

export const badgesContract = c.router({
  getMyBadges: {
    method: 'GET',
    path: '/api/badges/my',
    responses: {
      200: z.array(badgeWithDetails),
      401: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Get my earned badges (requires authentication)',
  },
  getUserBadges: {
    method: 'GET',
    path: '/api/users/:userId/badges',
    pathParams: z.object({
      userId: z.coerce.number(),
    }),
    responses: {
      200: z.array(badgeWithDetails),
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Get badges for a specific user',
  },
  getAllBadgeTypes: {
    method: 'GET',
    path: '/api/badges/types',
    responses: {
      200: z.array(
        z.object({
          badgeType: z.enum(['super_connector', 'early_adopter', 'top_earner', 'event_host', 'verified']),
          name: z.string(),
          description: z.string(),
          icon: z.string().optional(),
          criteria: z.string(),
        })
      ),
      500: errorResponseSchema,
    },
    summary: 'Get all badge types and their criteria',
  },
});
