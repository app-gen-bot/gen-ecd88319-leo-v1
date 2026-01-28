import { initClient } from '@ts-rest/core';
import { contract } from '@shared/contracts';
import { getAuthToken } from './auth-helpers';

/**
 * ts-rest API client with dynamic auth headers
 * Uses relative URLs to support any domain (localhost, ALB, custom domain)
 * In development, Vite proxy forwards requests to backend (vite.config.ts)
 * In production, frontend and backend are served from same origin
 */
export const apiClient = initClient(contract, {
  baseUrl: '', // Relative URLs - works with any domain
  baseHeaders: {
    'Content-Type': 'application/json',
    // Use getter for dynamic Authorization header
    get Authorization() {
      const token = getAuthToken();
      return token ? `Bearer ${token}` : '';
    },
  },
});
