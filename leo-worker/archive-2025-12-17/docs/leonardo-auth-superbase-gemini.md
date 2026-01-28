# Design Proposal: Integrating Supabase Auth & Storage

This document outlines a design for integrating Supabase for authentication and database storage into the Leonardo pipeline, ensuring that generated applications are production-ready while maintaining a seamless development and testing experience.

## 1. Overview

The core of this proposal is a **dual-mode architecture** controlled by a single environment variable. This allows the generated application to operate in either a "development" mode with mocks for easy testing, or a "production" mode that uses live Supabase services.

*   **`APP_MODE=development` (Default):**
    *   **Auth:** A mock `useAuth` context provides a hardcoded user object, bypassing real authentication.
    *   **Database:** The existing in-memory `iStorage` interface is used for data persistence, ensuring that internal tests run quickly and without external dependencies.

*   **`APP_MODE=production`:**
    *   **Auth:** The `useAuth` context wraps the real Supabase client (`@supabase/supabase-js`) to handle user sessions, login, logout, and registration.
    *   **Database:** The storage layer uses a new Supabase client to interact with a Postgres database, providing persistent, production-grade data storage.

This approach isolates the development and testing environment from the complexities of a live backend, while allowing for a simple switch to a full-featured, production-ready stack.

## 2. Architectural Changes

### 2.1. Backend Modifications

The backend, an Express.js server, will be enhanced to support the dual-mode storage and a new authentication middleware.

#### **Storage Layer (`server/storage.ts`)**

The `storage.ts` file will be refactored to conditionally export either the existing in-memory storage or a new Supabase storage provider.

1.  **New `SupabaseStorage` Class:** A new class will be created to interact with the Supabase database. It will implement the same interface as the current in-memory store, ensuring that the data access patterns in the routes remain consistent.
2.  **Conditional Export:** The file will use the `APP_MODE` environment variable to determine which storage provider to export.

```typescript
// server/storage.ts (conceptual)

import { createClient }from '@supabase/supabase-js';

// Existing in-memory storage
class InMemoryStorage { /* ... */ }

// New Supabase storage
class SupabaseStorage {
  private client;
  constructor() {
    this.client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  }
  // Implement the same methods as InMemoryStorage
  async createUser(data) { /* ... */ }
  async getProperties() { /* ... */ }
}

// Export the correct storage based on APP_MODE
export const storage = process.env.APP_MODE === 'production'
  ? new SupabaseStorage()
  : new InMemoryStorage();
```

#### **Authentication Middleware (`server/middleware/auth.ts`)**

A new middleware will be created to protect routes.

1.  **JWT Verification:** It will extract the JWT from the `Authorization: Bearer <token>` header.
2.  **Supabase User:** It will use the Supabase client to verify the token and fetch the user.
3.  **Request Augmentation:** The authenticated user object will be attached to the Express `request` object for use in downstream route handlers.

```typescript
// server/middleware/auth.ts (conceptual)

export const authMiddleware = async (req, res, next) => {
  if (process.env.APP_MODE === 'development') {
    // In dev mode, bypass auth
    return next();
  }
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).send('Unauthorized');
  }
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error) {
    return res.status(401).send('Unauthorized');
  }
  req.user = user;
  next();
};
```

### 2.2. Frontend Modifications

The frontend, a React application, will be updated to handle both mock and real authentication.

#### **Auth Context (`client/src/hooks/useAuth.tsx`)**

The existing `useAuth` hook will be transformed into a full-fledged Auth Context Provider.

1.  **Dual-Mode Provider:** The `AuthProvider` will conditionally render either a mock provider or a real Supabase provider.
2.  **Mock Provider:** In `development` mode, it will provide a static, hardcoded user object.
3.  **Supabase Provider:** In `production` mode, it will wrap the Supabase client, manage the user session, and expose auth functions (`login`, `logout`, `signUp`).

```typescript
// client/src/hooks/useAuth.tsx (conceptual)

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  if (import.meta.env.VITE_APP_MODE === 'production') {
    // Real Supabase logic
    // ...
  } else {
    // Mock auth logic
    const mockUser = { id: '123', email: 'dev@example.com', role: 'host' };
    // ...
  }
  return <AuthContext.Provider value={...}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
```

#### **API Client (`client/src/lib/api-client.ts`)**

The API client will be updated to automatically include the auth token in requests.

1.  **Token Injection:** The ts-rest client will be configured with an interceptor that retrieves the session token from the `useAuth` hook (or Supabase client directly) and adds it to the `Authorization` header of every outgoing request.

## 3. Pipeline & Agent Modifications

To automate this integration, several agents in the pipeline will need to be updated.

1.  **`StorageGeneratorAgent` (Writer):**
    *   **New Responsibility:** This agent must be taught to generate the `SupabaseStorage` class in `storage.ts`.
    *   **Logic:** It will need to read the Drizzle schema (`schema.ts`) and generate the corresponding Supabase queries (e.g., `supabase.from('users').insert(...)`).
    *   **Modification:** It will also generate the conditional export logic based on the `APP_MODE` environment variable.

2.  **`RoutesGeneratorAgent` (Writer):**
    *   **New Responsibility:** This agent will generate the new `auth.ts` middleware.
    *   **Modification:** It will also need to identify which routes should be protected (based on the `plan.md` or conventions) and apply the `authMiddleware` to them in `routes.ts`.

3.  **`ContextProviderGeneratorAgent` (Writer):**
    *   **New Responsibility:** This agent will be responsible for generating the new dual-mode `AuthProvider` in `useAuth.tsx`.
    *   **Modification:** It will generate the logic to switch between the mock provider and the real Supabase provider.

4.  **`PageGeneratorOrchestrator` & `PageGeneratorAgent` (Writers):**
    *   **Modification:** The agents that generate the `LoginPage` and `RegisterPage` will need to be updated to call the `useAuth` hook's `login` and `signUp` functions, which will in turn call the Supabase client in production mode.

5.  **Template & Scaffolding:**
    *   The `vite-express-template` will need to be updated to include `@supabase/supabase-js` in its `package.json`.
    *   The template's `.env.example` file will be updated to include `VITE_APP_MODE`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY`.

## 4. Development and Testing Workflow

This design explicitly preserves the existing testing workflow.

*   **Internal Testing:** The `BrowserVisualCriticAgent` and other internal testing agents will run the application in the default `development` mode. They will interact with the mock user and the in-memory database, ensuring that tests remain fast, deterministic, and free from external dependencies.
*   **Production-Mode Testing:** A new, separate testing suite could be introduced to run against a live Supabase instance in a staging environment. This would provide end-to-end testing for the authentication and database integration.

By separating the development and production environments at the code level, we can ensure that the autonomous pipeline continues to function effectively while still producing applications that are ready for real-world deployment.
