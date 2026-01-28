import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { contactExchanges, insertContactExchangesSchema, contactExchangesQuerySchema } from '../schema.zod';

const c = initContract();

const errorResponseSchema = z.object({
  error: z.string(),
});

const successResponseSchema = z.object({
  message: z.string(),
});

const contactExchangeWithDetails = contactExchanges.extend({
  senderName: z.string().optional(),
  receiverName: z.string().optional(),
  senderAvatar: z.string().url().optional().nullable(),
  receiverAvatar: z.string().url().optional().nullable(),
});

export const contactExchangesContract = c.router({
  initiate: {
    method: 'POST',
    path: '/api/contact-exchanges',
    body: insertContactExchangesSchema.omit({ senderId: true, status: true }),
    responses: {
      201: contactExchanges,
      400: errorResponseSchema,
      401: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Initiate contact exchange (sender scans receiver QR code, requires authentication)',
  },
  getReceived: {
    method: 'GET',
    path: '/api/contact-exchanges/received',
    query: contactExchangesQuerySchema,
    responses: {
      200: z.object({
        data: z.array(contactExchangeWithDetails),
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
    summary: 'Get received contact exchange requests (requires authentication)',
  },
  getSent: {
    method: 'GET',
    path: '/api/contact-exchanges/sent',
    query: contactExchangesQuerySchema,
    responses: {
      200: z.object({
        data: z.array(contactExchangeWithDetails),
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
    summary: 'Get sent contact exchange requests (requires authentication)',
  },
  accept: {
    method: 'PUT',
    path: '/api/contact-exchanges/:id/accept',
    pathParams: z.object({
      id: z.coerce.number(),
    }),
    body: z.object({}),
    responses: {
      200: z.object({
        exchange: contactExchanges,
        connection: z.object({
          id: z.number(),
          userId: z.number(),
          connectedUserId: z.number(),
        }),
        fizzcoinsEarned: z.number(),
      }),
      400: errorResponseSchema,
      401: errorResponseSchema,
      403: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Accept contact exchange (requires authentication)',
  },
  reject: {
    method: 'PUT',
    path: '/api/contact-exchanges/:id/reject',
    pathParams: z.object({
      id: z.coerce.number(),
    }),
    body: z.object({}),
    responses: {
      200: contactExchanges,
      400: errorResponseSchema,
      401: errorResponseSchema,
      403: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Reject contact exchange (requires authentication)',
  },
});
