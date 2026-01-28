"use client";

import { createAuthClient } from "better-auth/react";

// Use backend API for auth endpoints
// Backend now handles Better Auth endpoint mapping at /api/v1/
export const authClient = createAuthClient({
  baseURL: "http://localhost:8000/api/v1",
  // Credentials must be included for cross-origin requests
  fetchOptions: {
    credentials: 'include',
  },
});

// Export hooks for easy use
export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;