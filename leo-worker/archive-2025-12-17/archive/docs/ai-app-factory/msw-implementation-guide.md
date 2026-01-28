# Mock Service Worker (MSW) Implementation Guide

## Overview

Mock Service Worker (MSW) is a critical part of the AI App Factory development workflow. It enables frontend development to proceed independently of backend implementation by intercepting network requests at the service worker level.

## Why MSW?

1. **Parallel Development**: Frontend and backend teams can work simultaneously
2. **Consistent Testing**: Same mocks for development and testing
3. **Progressive Enhancement**: Easy switch from mocks to real APIs
4. **Type Safety**: TypeScript support for mock handlers

## Required Implementation

Every AI App Factory application MUST implement MSW for development mode. This is not optional.

### Directory Structure

```
frontend/
├── mocks/
│   ├── browser.ts      # Browser-side MSW setup
│   ├── handlers.ts     # Request handlers
│   ├── data.ts        # Mock data factories
│   └── index.ts       # MSW initialization
├── public/
│   └── mockServiceWorker.js  # MSW service worker (auto-generated)
```

### Installation

```bash
npm install --save-dev msw@latest
npx msw init public/ --save
```

### Basic Setup

#### 1. Create Mock Handlers (`mocks/handlers.ts`)

```typescript
import { http, HttpResponse } from 'msw';
import { mockUsers, mockWorkspaces } from './data';

export const handlers = [
  // Authentication
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json() as any;
    
    // Always allow demo user
    if (email === 'demo@example.com' && password === 'DemoRocks2025!') {
      return HttpResponse.json({
        access_token: 'demo-jwt-token',
        refresh_token: 'demo-refresh-token',
        user: {
          id: 'demo-user-id',
          email: 'demo@example.com',
          name: 'Demo User',
          role: 'user'
        }
      });
    }
    
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  // User endpoints
  http.get('/api/users', () => {
    return HttpResponse.json({
      users: mockUsers,
      total: mockUsers.length
    });
  }),

  // Workspace endpoints
  http.get('/api/workspaces', () => {
    return HttpResponse.json({
      workspaces: mockWorkspaces,
      total: mockWorkspaces.length
    });
  }),

  // Generic CRUD pattern
  http.post('/api/:resource', async ({ params, request }) => {
    const { resource } = params;
    const body = await request.json();
    
    return HttpResponse.json({
      id: crypto.randomUUID(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { status: 201 });
  })
];
```

#### 2. Create Mock Data (`mocks/data.ts`)

```typescript
export const mockUsers = [
  {
    id: '1',
    email: 'demo@example.com',
    name: 'Demo User',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'user@example.com',
    name: 'Test User',
    role: 'user',
    createdAt: '2024-01-02T00:00:00Z'
  }
];

export const mockWorkspaces = [
  {
    id: 'ws-1',
    name: 'Default Workspace',
    ownerId: '1',
    members: ['1', '2'],
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// Factory functions for dynamic data
export function createMockUser(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    email: `user-${Date.now()}@example.com`,
    name: 'Generated User',
    role: 'user',
    createdAt: new Date().toISOString(),
    ...overrides
  };
}
```

#### 3. Browser Setup (`mocks/browser.ts`)

```typescript
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

#### 4. Initialize MSW (`mocks/index.ts`)

```typescript
export async function initMocks() {
  if (typeof window === 'undefined') {
    return;
  }

  // Only enable in development
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // Check if MSW should be enabled via environment variable
  if (process.env.NEXT_PUBLIC_API_MOCKING !== 'enabled') {
    return;
  }

  const { worker } = await import('./browser');
  
  // Start the worker
  return worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  });
}

// Re-export handlers for testing
export { handlers } from './handlers';
```

#### 5. Initialize in Next.js (`app/layout.tsx`)

```typescript
import { initMocks } from '@/mocks';

// Initialize MSW before rendering
if (process.env.NODE_ENV === 'development') {
  initMocks();
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Environment Configuration

```bash
# .env.development
NEXT_PUBLIC_API_MOCKING=enabled
NEXT_PUBLIC_API_URL=http://localhost:3000

# .env.production
NEXT_PUBLIC_API_MOCKING=disabled
NEXT_PUBLIC_API_URL=https://api.production.com
```

### Progressive Enhancement Pattern

The API client should work with both MSW and real APIs:

```typescript
// lib/api-client.ts
class ApiClient {
  private baseURL: string;
  
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${this.baseURL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized
        window.location.href = '/login';
      }
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // API methods
  login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  getUsers() {
    return this.request('/api/users');
  }
  
  // ... other methods
}

export const apiClient = new ApiClient();
```

### Testing with MSW

MSW handlers can be reused in tests:

```typescript
// __tests__/setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from '@/mocks/handlers';

export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Common Patterns

#### 1. Delay Simulation

```typescript
http.get('/api/slow-endpoint', async () => {
  await delay(1000); // Simulate network delay
  return HttpResponse.json({ data: 'slow response' });
});
```

#### 2. Error Simulation

```typescript
http.get('/api/flaky-endpoint', () => {
  // 30% chance of error
  if (Math.random() < 0.3) {
    return HttpResponse.json(
      { error: 'Random server error' },
      { status: 500 }
    );
  }
  return HttpResponse.json({ data: 'success' });
});
```

#### 3. Pagination Support

```typescript
http.get('/api/items', ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  
  const allItems = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`
  }));
  
  const start = (page - 1) * limit;
  const items = allItems.slice(start, start + limit);
  
  return HttpResponse.json({
    items,
    pagination: {
      page,
      limit,
      total: allItems.length,
      totalPages: Math.ceil(allItems.length / limit)
    }
  });
});
```

## Best Practices

1. **Always Mock Authentication**: Include the demo user credentials
2. **Use Realistic Data**: Mock data should mirror production structure
3. **Handle All States**: Success, loading, error, and empty states
4. **Version Your Mocks**: Keep mocks in sync with API changes
5. **Document Deviations**: If mocks differ from real API, document why

## Checklist for Implementation

- [ ] MSW installed and initialized
- [ ] All API endpoints have mock handlers
- [ ] Demo user authentication works
- [ ] Environment variables configured
- [ ] Progressive enhancement tested
- [ ] Error states handled
- [ ] Loading states simulated
- [ ] Tests use same mock handlers

## Switching to Production

When ready to use real APIs:

1. Set `NEXT_PUBLIC_API_MOCKING=disabled`
2. Update `NEXT_PUBLIC_API_URL` to real API
3. Ensure authentication tokens are handled correctly
4. Test all API integrations
5. Keep MSW for development/testing

Remember: MSW is for development efficiency, not a replacement for real backend implementation.