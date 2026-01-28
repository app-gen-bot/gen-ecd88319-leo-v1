import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

// Error response schema
const errorResponseSchema = z.object({
  error: z.string(),
});

// Upload response schema
const uploadResponseSchema = z.object({
  avatarUrl: z.string(),
  size: z.number(),
  dimensions: z.object({
    width: z.number(),
    height: z.number(),
  }),
  mimeType: z.string(),
});

/**
 * Upload Contract
 *
 * Handles file uploads for FizzCard avatars
 *
 * NOTE: The uploadAvatar endpoint accepts multipart/form-data,
 * not JSON. The file should be sent as 'avatar' field.
 */
export const uploadContract = c.router({
  uploadAvatar: {
    method: 'POST',
    path: '/api/upload/avatar',
    // Note: multipart/form-data body is handled by multer middleware
    // ts-rest doesn't validate multipart bodies, only JSON
    body: z.any(), // Placeholder - actual validation happens in multer middleware
    responses: {
      200: uploadResponseSchema,
      400: errorResponseSchema, // Invalid file type, size, or missing file
      401: errorResponseSchema, // Authentication required
      413: errorResponseSchema, // Payload too large (>5MB)
      500: errorResponseSchema, // Server error
    },
    summary: 'Upload profile avatar image',
    description: `
      Upload a profile avatar image. Returns a data URI that can be stored in avatarUrl field.

      Requirements:
      - Authentication required
      - Max file size: 5MB
      - Allowed types: JPEG, PNG, WebP, GIF
      - Recommended dimensions: 400x400px (will be resized if larger)

      The image is converted to base64 data URI and returned.
      Store the returned avatarUrl in user or fizzcard records.
    `,
  },
});
