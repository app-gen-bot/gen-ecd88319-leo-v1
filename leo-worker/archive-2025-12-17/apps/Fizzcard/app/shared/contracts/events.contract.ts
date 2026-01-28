import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { events, insertEventsSchema, eventAttendees, eventsQuerySchema, eventAttendeesQuerySchema } from '../schema.zod';

const c = initContract();

const errorResponseSchema = z.object({
  error: z.string(),
});

const successResponseSchema = z.object({
  message: z.string(),
});

const eventWithDetails = events.extend({
  creatorName: z.string(),
  attendeeCount: z.number(),
  isAttending: z.boolean().optional(),
  hasCheckedIn: z.boolean().optional(),
});

const eventUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isExclusive: z.boolean().optional(),
  minFizzcoinRequired: z.number().min(0).optional(),
});

export const eventsContract = c.router({
  getAll: {
    method: 'GET',
    path: '/api/events',
    query: eventsQuerySchema,
    responses: {
      200: z.object({
        data: z.array(eventWithDetails),
        pagination: z.object({
          page: z.number(),
          limit: z.number(),
          total: z.number(),
          totalPages: z.number(),
        }),
      }),
      500: errorResponseSchema,
    },
    summary: 'Get all events with optional filters',
  },
  getById: {
    method: 'GET',
    path: '/api/events/:id',
    pathParams: z.object({
      id: z.coerce.number(),
    }),
    responses: {
      200: eventWithDetails,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Get single event by ID',
  },
  create: {
    method: 'POST',
    path: '/api/events',
    body: insertEventsSchema.omit({ createdBy: true }),
    responses: {
      201: events,
      400: errorResponseSchema,
      401: errorResponseSchema,
      403: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Create new event (requires authentication, admin only)',
  },
  update: {
    method: 'PUT',
    path: '/api/events/:id',
    pathParams: z.object({
      id: z.coerce.number(),
    }),
    body: eventUpdateSchema,
    responses: {
      200: events,
      400: errorResponseSchema,
      401: errorResponseSchema,
      403: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Update event (requires authentication, admin or creator only)',
  },
  delete: {
    method: 'DELETE',
    path: '/api/events/:id',
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
    summary: 'Delete event (requires authentication, admin or creator only)',
  },
  attend: {
    method: 'POST',
    path: '/api/events/:id/attend',
    pathParams: z.object({
      id: z.coerce.number(),
    }),
    body: z.object({}),
    responses: {
      201: eventAttendees,
      400: errorResponseSchema,
      401: errorResponseSchema,
      403: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Register attendance for an event (requires authentication)',
  },
  checkIn: {
    method: 'POST',
    path: '/api/events/:id/checkin',
    pathParams: z.object({
      id: z.coerce.number(),
    }),
    body: z.object({}),
    responses: {
      201: z.object({
        attendee: eventAttendees,
        fizzcoinsEarned: z.number(),
      }),
      400: errorResponseSchema,
      401: errorResponseSchema,
      403: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Check in to event and earn FizzCoins (requires authentication)',
  },
  getAttendees: {
    method: 'GET',
    path: '/api/events/:id/attendees',
    pathParams: z.object({
      id: z.coerce.number(),
    }),
    query: eventAttendeesQuerySchema,
    responses: {
      200: z.object({
        data: z.array(
          eventAttendees.extend({
            userName: z.string(),
            userAvatar: z.string().url().optional().nullable(),
            userTitle: z.string().optional().nullable(),
            userCompany: z.string().optional().nullable(),
          })
        ),
        pagination: z.object({
          page: z.number(),
          limit: z.number(),
          total: z.number(),
          totalPages: z.number(),
        }),
      }),
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Get event attendees with pagination',
  },
});
