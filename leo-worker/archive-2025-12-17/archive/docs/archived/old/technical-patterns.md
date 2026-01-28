# Technical Patterns and Opinionated Design

## Overview

The AI App Factory enforces a standardized set of technical patterns across all generated applications. These opinionated choices eliminate decision fatigue, ensure consistency, and enable reliable quality at scale.

## Core Design Philosophy

### Convention Over Configuration
By making technology choices upfront, we enable:
- **Faster Development**: No time wasted on technology selection
- **Consistent Quality**: Same patterns = predictable results
- **Better Learning**: Agents improve on known patterns
- **Easier Maintenance**: All apps follow same structure

### The Power of Constraints
Constraints enable creativity, not limit it. By defining how authentication works, we free developers to focus on what makes their app unique.

## Technology Stack

### Frontend Stack

```typescript
const FRONTEND_STACK = {
  framework: "Next.js 14",
  router: "App Router",
  language: "TypeScript",
  ui: "ShadCN UI",
  styling: "Tailwind CSS",
  state: "React Context + Hooks",
  fetching: "SWR",
  validation: "Zod",
  testing: "Jest + React Testing Library",
  mocking: "MSW (Mock Service Worker)"
};
```

**Rationale**:
- **Next.js 14**: Best-in-class React framework with SSR/SSG
- **App Router**: Modern routing with layouts and loading states
- **TypeScript**: Type safety prevents runtime errors
- **ShadCN UI**: Beautiful, accessible components
- **Tailwind**: Utility-first CSS scales well
- **Context + Hooks**: Simple state management without complexity
- **SWR**: Smart caching and revalidation
- **MSW**: Development-first API mocking enables frontend development without backend dependencies

### Backend Stack

```python
BACKEND_STACK = {
    "framework": "FastAPI",
    "language": "Python 3.12+",
    "validation": "Pydantic",
    "database": "DynamoDB",
    "orm": "Boto3",
    "auth": "JWT validation (python-jose[cryptography])",
    "testing": "pytest",
    "linting": "ruff"
}
```

**Rationale**:
- **FastAPI**: Modern, fast, automatic API documentation
- **Pydantic**: Robust validation with type hints
- **DynamoDB**: Serverless, scalable, managed
- **JWT Auth**: Stateless, secure, standard

### Infrastructure Stack

```yaml
infrastructure:
  compute: AWS Lambda
  api: API Gateway
  cdn: CloudFront
  storage: S3
  database: DynamoDB
  iac: AWS CDK
  monitoring: CloudWatch
  ci_cd: GitHub Actions
```

## Authentication Patterns

### NextAuth.js with JWT Strategy

Authentication is handled by NextAuth.js using JWT strategy (no database sessions):
- Secure httpOnly cookies for token storage
- Built-in CSRF protection
- Session management with automatic refresh
- Support for credentials provider
- Demo user authentication
- MSW integration for development

### NextAuth Configuration

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Demo user authentication
        if (credentials?.email === 'demo@example.com' && 
            credentials?.password === 'DemoRocks2025!') {
          return {
            id: '1',
            email: 'demo@example.com',
            name: 'Demo User'
          };
        }
        
        // Real authentication
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" }
          });
          
          const user = await res.json();
          
          if (res.ok && user) {
            return user;
          }
          return null;
        } catch (error) {
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  }
});

export { handler as GET, handler as POST };
```

### Session Provider Setup

```tsx
// app/providers.tsx
'use client';

import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Protected Routes with NextAuth

```tsx
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/api/protected/:path*'
  ]
};

// Using in components
import { useSession } from 'next-auth/react';

export function ProtectedComponent() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <LoadingSpinner />;
  if (status === 'unauthenticated') return <RedirectToLogin />;
  
  return <div>Welcome {session?.user?.name}!</div>;
}
```

## API Client Patterns

### API Client with NextAuth Integration

```typescript
// lib/api-client.ts
import { getSession, signOut } from 'next-auth/react';

class ApiClient {
  private static instance: ApiClient;
  private baseURL: string;

  private constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Get session for authentication
    const session = await getSession();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };
    
    // Add auth token if available
    if (session?.user) {
      // NextAuth manages the JWT - we just need to pass it along
      headers['Authorization'] = `Bearer ${session.user.id}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // NextAuth handles sign out
          await signOut({ redirect: true });
        }
        throw new ApiError(response.status, await response.text());
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 'Network error');
    }
  }

  // Convenience methods
  get<T>(url: string) { return this.request<T>(url); }
  post<T>(url: string, data: any) { 
    return this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  put<T>(url: string, data: any) {
    return this.request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  delete<T>(url: string) {
    return this.request<T>(url, {
      method: 'DELETE'
    });
  }
}

export const apiClient = ApiClient.getInstance();
```

## Error Handling Patterns

### Standardized Error Codes

```typescript
export const ERROR_CODES = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  429: 'RATE_LIMITED',
  500: 'SERVER_ERROR',
  503: 'SERVICE_UNAVAILABLE'
} as const;

export const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'Please check your input and try again',
  UNAUTHORIZED: 'Please login to continue',
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  RATE_LIMITED: 'Too many requests. Please try again later',
  SERVER_ERROR: 'Something went wrong. Please try again',
  SERVICE_UNAVAILABLE: 'Service is temporarily unavailable'
};
```

### Global Error Handler

```typescript
// Custom Error Class
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message?: string
  ) {
    super(message || ERROR_MESSAGES[code] || 'An error occurred');
  }
}

// Global Error Boundary
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      fallback={<ErrorFallback />}
      onError={(error) => {
        console.error('Application error:', error);
        // Log to monitoring service
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

// Toast Notifications for User Feedback
export function useErrorHandler() {
  return (error: unknown) => {
    if (error instanceof ApiError) {
      toast.error(error.message);
    } else {
      toast.error('An unexpected error occurred');
    }
  };
}
```

## State Management Patterns

### Context + Hooks Pattern

```typescript
// 1. Create Context
interface AppState {
  user: User | null;
  workspace: Workspace | null;
  theme: 'light' | 'dark';
}

const AppContext = createContext<AppState | null>(null);

// 2. Create Provider
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    user: null,
    workspace: null,
    theme: 'light'  // Default theme - choose based on app type
  });

  return (
    <AppContext.Provider value={{ state, setState }}>
      {children}
    </AppContext.Provider>
  );
}

// 3. Create Custom Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

// 4. Usage in Components
function MyComponent() {
  const { user, theme } = useApp();
  // Use state directly
}
```

## Mock Service Worker (MSW) Patterns

### Development-First API Mocking

MSW enables frontend development without backend dependencies by intercepting network requests at the service worker level. This allows for:
- Rapid frontend iteration without waiting for backend
- Consistent mock data across all developers
- Progressive enhancement from mocks to real APIs
- Testing with predictable responses

### MSW Setup

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // NextAuth endpoints - MSW intercepts these for development
  http.post('/api/auth/callback/credentials', async ({ request }) => {
    // MSW handles NextAuth credential provider calls
    const body = await request.formData();
    const email = body.get('email');
    const password = body.get('password');
    
    if (email === 'demo@example.com' && password === 'DemoRocks2025!') {
      return HttpResponse.json({
        user: {
          id: '1',
          email: 'demo@example.com',
          name: 'Demo User'
        }
      });
    }
    
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),
  
  // Backend API endpoints for when NextAuth passes through
  http.post('/api/v1/auth/login', async ({ request }) => {
    const { email, password } = await request.json();
    
    if (email === 'demo@example.com' && password === 'DemoRocks2025!') {
      return HttpResponse.json({
        id: '1',
        email: 'demo@example.com',
        name: 'Demo User'
      });
    }
    
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  // User endpoints
  http.get('/api/users/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      email: 'user@example.com',
      name: 'Test User',
      createdAt: new Date().toISOString()
    });
  }),

  // List endpoints with pagination
  http.get('/api/items', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    const items = Array.from({ length: limit }, (_, i) => ({
      id: `${(page - 1) * limit + i + 1}`,
      name: `Item ${(page - 1) * limit + i + 1}`,
      createdAt: new Date().toISOString()
    }));
    
    return HttpResponse.json({
      items,
      total: 100,
      page,
      limit
    });
  })
];

// mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// mocks/index.ts
// Progressive enhancement pattern
export async function initMocks() {
  if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
    const { worker } = await import('./browser');
    
    return worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js'
      }
    });
  }
}
```

### Progressive Switch Pattern

```typescript
// lib/api-client.ts
class ApiClient {
  private baseURL: string;
  
  constructor() {
    // Use environment variable to switch between mock and real API
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
  }

  async request(path: string, options?: RequestInit) {
    // MSW will intercept if enabled, otherwise goes to real API
    const response = await fetch(`${this.baseURL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
}

// Environment-based configuration
// .env.development
NEXT_PUBLIC_API_MOCKING=enabled
NEXT_PUBLIC_API_URL=

// .env.production
NEXT_PUBLIC_API_MOCKING=disabled
NEXT_PUBLIC_API_URL=https://api.production.com
```

### MSW Testing Patterns

```typescript
// __tests__/api.test.ts
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';

describe('API Integration', () => {
  it('handles error responses', async () => {
    // Override handler for this test
    server.use(
      http.get('/api/users/:id', () => {
        return HttpResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      })
    );
    
    // Test error handling
    await expect(apiClient.getUser('999')).rejects.toThrow('User not found');
  });
});
```

### MSW Best Practices

1. **Consistent Mock Data**
   - Use factories for generating consistent test data
   - Share mock data between MSW and tests
   - Version mock data schemas

2. **Error Scenarios**
   - Mock all possible error states (400, 401, 403, 404, 500)
   - Test network failures and timeouts
   - Simulate rate limiting

3. **Development Workflow**
   - Start with MSW mocks for new features
   - Gradually replace with real API calls
   - Keep mocks updated with API changes

4. **Performance Testing**
   - Add artificial delays to simulate network latency
   - Test loading states and optimistic updates
   - Verify proper error boundaries

## Data Fetching Patterns

### SWR Configuration

```typescript
// Global SWR Configuration
export const swrConfig: SWRConfiguration = {
  fetcher: (url: string) => apiClient.get(url),
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  shouldRetryOnError: (error) => {
    // Don't retry on auth errors
    return error?.status !== 401 && error?.status !== 403;
  },
  errorRetryCount: 3,
  errorRetryInterval: 1000,
  onError: (error) => {
    if (error?.status === 401) {
      logout();
    }
  }
};

// Usage in Components
export function useUser(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    `/users/${id}`,
    {
      revalidateOnMount: true,
      dedupingInterval: 5000
    }
  );

  return {
    user: data,
    isLoading,
    isError: error,
    refresh: mutate
  };
}
```

## Component Patterns

### Loading States

```tsx
// Standardized Loading Component
export function LoadingSpinner({ 
  size = 'md',
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  return (
    <div className={`animate-spin ${sizeClasses[size]} ${className}`}>
      <Loader2 className="h-full w-full" />
    </div>
  );
}

// Page Loading Pattern
export function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
```

### Empty States

```tsx
// Standardized Empty State
export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

### Form Patterns

```tsx
// Form with Validation
export function LoginForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Client-side validation
    const validationErrors: Record<string, string> = {};
    if (!email || !email.includes('@')) {
      validationErrors.email = 'Please enter a valid email';
    }
    if (!password || password.length < 8) {
      validationErrors.password = 'Password must be at least 8 characters';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        setErrors(error.data.errors);
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="email"
          name="email"
          placeholder="Email"
          disabled={loading}
        />
        {errors.email && (
          <p className="text-sm text-destructive mt-1">{errors.email}</p>
        )}
      </div>
      
      <div>
        <Input
          type="password"
          name="password"
          placeholder="Password"
          disabled={loading}
        />
        {errors.password && (
          <p className="text-sm text-destructive mt-1">{errors.password}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <LoadingSpinner size="sm" /> : 'Login'}
      </Button>
    </form>
  );
}
```

## Backend Patterns

### FastAPI Structure

```python
# Standard Project Structure
backend/
├── api/
│   ├── __init__.py
│   ├── auth.py       # Auth endpoints
│   ├── users.py      # User endpoints
│   └── workspaces.py # Workspace endpoints
├── models/
│   ├── __init__.py
│   ├── user.py       # Pydantic models
│   └── workspace.py
├── services/
│   ├── __init__.py
│   ├── auth.py       # Business logic
│   └── database.py   # DB operations
├── utils/
│   ├── __init__.py
│   ├── auth.py       # JWT utilities
│   └── errors.py     # Error handlers
└── main.py           # FastAPI app
```

### API Endpoint Pattern

```python
from fastapi import APIRouter, Depends, HTTPException
from typing import List

router = APIRouter(prefix="/api/v1/users", tags=["users"])

@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    """Get all users with pagination."""
    users = await user_service.get_users(skip=skip, limit=limit)
    return users

@router.post("/", response_model=UserResponse, status_code=201)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(require_admin)
):
    """Create a new user (admin only)."""
    try:
        user = await user_service.create_user(user_data)
        return user
    except DuplicateError:
        raise HTTPException(400, "User already exists")
```

### Error Handling Pattern

```python
from fastapi import Request
from fastapi.responses import JSONResponse

async def api_error_handler(request: Request, exc: APIError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.error_code,
                "message": exc.message,
                "details": exc.details
            }
        }
    )

# Standard API Errors
class APIError(Exception):
    def __init__(
        self,
        status_code: int,
        error_code: str,
        message: str,
        details: dict = None
    ):
        self.status_code = status_code
        self.error_code = error_code
        self.message = message
        self.details = details or {}
```

## Database Patterns

### DynamoDB Multi-Table Design

```python
# Table per entity pattern
TABLES = {
    "users": "app-users",
    "workspaces": "app-workspaces",
    "messages": "app-messages"
}

# Base Model Pattern
class DynamoModel:
    table_name: str
    
    @classmethod
    async def get(cls, id: str):
        table = boto3.resource('dynamodb').Table(cls.table_name)
        response = table.get_item(Key={'id': id})
        return cls(**response.get('Item', {}))
    
    async def save(self):
        table = boto3.resource('dynamodb').Table(self.table_name)
        table.put_item(Item=self.dict())
```

## Testing Patterns

### Frontend Testing

```typescript
// Component Testing Pattern
describe('LoginForm', () => {
  it('should handle successful login', async () => {
    const { getByLabelText, getByText } = render(<LoginForm />);
    
    fireEvent.change(getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    fireEvent.click(getByText('Login'));
    
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });
});
```

### Backend Testing

```python
# API Testing Pattern
async def test_create_user(client: AsyncClient, admin_token: str):
    response = await client.post(
        "/api/v1/users",
        json={"email": "new@example.com", "password": "secure123"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 201
    assert response.json()["email"] == "new@example.com"
```

## Design System Patterns

### Color Palette

Choose the appropriate theme based on your application type:

```css
/* Light Mode Variables (Consumer Apps, E-commerce, Content Sites) */
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  --secondary: 0 0% 96.1%;
  --secondary-foreground: 0 0% 9%;
  --muted: 0 0% 96.1%;
  --muted-foreground: 0 0% 45.1%;
  --accent: 0 0% 96.1%;
  --accent-foreground: 0 0% 9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
}

/* Dark Mode Variables (Developer Tools, Analytics, Professional Apps) */
.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --card: 0 0% 3.9%;
  --card-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 0 0% 3.9%;
  --secondary: 0 0% 14.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 0 0% 14.9%;
  --muted-foreground: 0 0% 63.9%;
  --accent: 0 0% 14.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
}
```

### Typography Scale

```typescript
// Consistent Typography
export const typography = {
  h1: "text-4xl font-bold tracking-tight",
  h2: "text-3xl font-semibold tracking-tight",
  h3: "text-2xl font-semibold tracking-tight",
  h4: "text-xl font-semibold",
  body: "text-base",
  small: "text-sm",
  muted: "text-muted-foreground"
};
```

### Spacing System

```typescript
// 4px base unit
export const spacing = {
  xs: "0.5rem",   // 8px
  sm: "1rem",     // 16px
  md: "1.5rem",   // 24px
  lg: "2rem",     // 32px
  xl: "3rem",     // 48px
  xxl: "4rem"     // 64px
};
```

## Performance Patterns

### Image Optimization

```tsx
import Image from 'next/image';

export function OptimizedImage({ src, alt, ...props }) {
  return (
    <Image
      src={src}
      alt={alt}
      loading="lazy"
      placeholder="blur"
      blurDataURL={generateBlurDataURL(src)}
      {...props}
    />
  );
}
```

### Code Splitting

```typescript
// Dynamic imports for heavy components
const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);
```

## Security Patterns

### Content Security Policy

```typescript
// Next.js security headers
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options', 
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
];
```

### Input Sanitization

```typescript
// Always sanitize user input
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });
}
```

## Conclusion

These technical patterns form the foundation of every AI App Factory application. By standardizing these decisions, we enable:

1. **Consistent Quality**: Every app follows best practices
2. **Faster Development**: No time wasted on basic decisions
3. **Better Learning**: AI agents improve on known patterns
4. **Easier Maintenance**: Developers know what to expect

The patterns are opinionated by design—we've made the hard choices so you don't have to. Focus on what makes your application unique while we handle the foundation.