import { initClient } from '@ts-rest/core';
import { apiContract } from '@shared/contracts';

/**
 * API Client for FizzCard
 * Uses ts-rest for type-safe API calls
 *
 * CRITICAL: Auth header uses getter property for dynamic token access
 * This ensures the latest token is always used (ts-rest v3 requirement)
 */
// In production, use relative URL (same domain); in development, use VITE_API_URL
const getBaseUrl = () => {
  // If VITE_API_URL is set, use it (development)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // In production, API is served from same origin
  if (import.meta.env.PROD) {
    return window.location.origin;
  }
  // Fallback for development
  return 'http://localhost:5013';
};

export const apiClient = initClient(apiContract, {
  baseUrl: getBaseUrl(),
  jsonQuery: true,
  baseHeaders: {
    'Content-Type': 'application/json',
    // CRITICAL: Use getter property for dynamic auth headers (ts-rest v3 requirement)
    get Authorization() {
      const token = localStorage.getItem('auth_token');
      return token ? `Bearer ${token}` : '';
    },
  },
});
