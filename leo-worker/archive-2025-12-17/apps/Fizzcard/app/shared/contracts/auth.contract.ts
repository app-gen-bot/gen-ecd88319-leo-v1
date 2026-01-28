import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { users } from '../schema.zod';

const c = initContract();

// Auth request/response schemas
const signupRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const authResponseSchema = z.object({
  user: users.omit({ passwordHash: true }),
  token: z.string(),
});

const errorResponseSchema = z.object({
  error: z.string(),
});

const successResponseSchema = z.object({
  message: z.string(),
});

export const authContract = c.router({
  signup: {
    method: 'POST',
    path: '/api/auth/signup',
    body: signupRequestSchema,
    responses: {
      201: authResponseSchema,
      400: errorResponseSchema,
      409: errorResponseSchema,
    },
    summary: 'Sign up new user',
  },
  login: {
    method: 'POST',
    path: '/api/auth/login',
    body: loginRequestSchema,
    responses: {
      200: authResponseSchema,
      400: errorResponseSchema,
      401: errorResponseSchema,
    },
    summary: 'Login user',
  },
  logout: {
    method: 'POST',
    path: '/api/auth/logout',
    body: z.object({}),
    responses: {
      200: successResponseSchema,
      401: errorResponseSchema,
    },
    summary: 'Logout user (requires authentication)',
  },
  me: {
    method: 'GET',
    path: '/api/auth/me',
    responses: {
      200: users.omit({ passwordHash: true }),
      401: errorResponseSchema,
    },
    summary: 'Get current authenticated user',
  },
});
