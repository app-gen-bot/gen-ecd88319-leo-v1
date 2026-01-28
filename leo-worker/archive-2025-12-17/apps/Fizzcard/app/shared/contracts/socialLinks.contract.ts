import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { socialLinks, insertSocialLinksSchema } from '../schema.zod';

const c = initContract();

const errorResponseSchema = z.object({
  error: z.string(),
});

const successResponseSchema = z.object({
  message: z.string(),
});

const socialLinkUpdateSchema = z.object({
  platform: z.enum(['linkedin', 'twitter', 'instagram', 'facebook', 'github', 'custom']).optional(),
  url: z.string().url().optional(),
});

export const socialLinksContract = c.router({
  getByFizzCardId: {
    method: 'GET',
    path: '/api/fizzcards/:fizzCardId/social-links',
    pathParams: z.object({
      fizzCardId: z.coerce.number(),
    }),
    responses: {
      200: z.array(socialLinks),
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Get all social links for a FizzCard',
  },
  create: {
    method: 'POST',
    path: '/api/fizzcards/:fizzCardId/social-links',
    pathParams: z.object({
      fizzCardId: z.coerce.number(),
    }),
    body: insertSocialLinksSchema.omit({ fizzcardId: true }),
    responses: {
      201: socialLinks,
      400: errorResponseSchema,
      401: errorResponseSchema,
      403: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Create new social link (requires authentication)',
  },
  update: {
    method: 'PUT',
    path: '/api/social-links/:id',
    pathParams: z.object({
      id: z.coerce.number(),
    }),
    body: socialLinkUpdateSchema,
    responses: {
      200: socialLinks,
      400: errorResponseSchema,
      401: errorResponseSchema,
      403: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Update social link (requires authentication)',
  },
  delete: {
    method: 'DELETE',
    path: '/api/social-links/:id',
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
    summary: 'Delete social link (requires authentication)',
  },
});
