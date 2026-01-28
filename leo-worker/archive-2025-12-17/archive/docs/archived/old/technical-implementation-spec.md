# Technical Implementation Specification
*Bridge between Frontend Interaction Spec and Code Implementation*

## Overview

This specification defines the technical implementation patterns for features described in the Frontend Interaction Specification. All patterns are opinionated and standardized to ensure consistency across generated applications.

## Authentication & Session Management

### NextAuth.js with JWT Strategy

Authentication is handled by NextAuth.js using JWT strategy (no database sessions), providing:
- Secure httpOnly cookies for token storage
- Built-in CSRF protection
- Session management with automatic refresh
- Support for credentials provider
- Demo user authentication
- MSW (Mock Service Worker) for development

### Environment Configuration
```typescript
// Required environment variables
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-development-secret-here
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### Authentication Configuration
```typescript
// utils/auth-constants.ts
// Demo user for testing
export const DEMO_USER = {
  email: 'demo@example.com',
  password: 'DemoRocks2025!',
  name: 'Demo User',
  id: 'demo_user_1'
};

// NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
    }
  }
  interface User {
    id: string;
    email: string;
    name: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string;
  }
}
```

### NextAuth Configuration
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { DEMO_USER } from '@/utils/auth-constants';

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
        if (credentials?.email === DEMO_USER.email && 
            credentials?.password === DEMO_USER.password) {
          return {
            id: DEMO_USER.id,
            email: DEMO_USER.email,
            name: DEMO_USER.name
          };
        }
        
        // Real authentication against backend
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
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
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
```typescript
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
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Get session from NextAuth
    const session = await getSession();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(session?.user && { Authorization: `Bearer ${session.user.id}` }),
      ...(options.headers as Record<string, string>),
    };
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });
      
      if (response.status === 401) {
        // NextAuth handles sign out
        await signOut({ callbackUrl: '/login' });
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.detail || `Error: ${response.status}`,
          response.status
        );
      }
      
      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 0);
    }
  }
  
  // Generic CRUD methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }
  
  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = ApiClient.getInstance();
```

### MSW (Mock Service Worker) Setup
```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { DEMO_USER } from '@/utils/auth-constants';

export const handlers = [
  // Mock NextAuth endpoints for development
  http.post('/api/auth/callback/credentials', async ({ request }) => {
    const body = await request.formData();
    const email = body.get('email');
    const password = body.get('password');
    
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      return HttpResponse.json({
        user: {
          id: DEMO_USER.id,
          email: DEMO_USER.email,
          name: DEMO_USER.name
        }
      });
    }
    
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),
  
  // Mock backend API login endpoint (used by NextAuth)
  http.post('/api/v1/auth/login', async ({ request }) => {
    const { email, password } = await request.json();
    
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      return HttpResponse.json({
        id: DEMO_USER.id,
        email: DEMO_USER.email,
        name: DEMO_USER.name
      });
    }
    
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),
  
  // Add other API mocks as needed
];

// mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// app/providers.tsx - Initialize MSW
if (process.env.NODE_ENV === 'development') {
  const { worker } = await import('@/mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
  });
}
```

### Protected Routes with NextAuth
```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    // Protect all routes except public ones
    '/((?!api/auth|_next/static|_next/image|favicon.ico|login|signup|$).*)',
  ],
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

## Error Handling Patterns

### Standardized Error Messages
```typescript
// utils/error-messages.ts
export const ERROR_MESSAGES: Record<number, string> = {
  400: 'Please check your input and try again',
  401: 'Please login to continue',
  403: 'You do not have permission to perform this action',
  404: 'The requested resource was not found',
  429: 'Too many requests. Please try again later',
  500: 'Something went wrong. Please try again',
  0: 'Network error. Please check your connection'
};
```

### Toast Notifications
```typescript
// hooks/use-error-handler.ts
import { toast } from '@/components/ui/use-toast';
import { ERROR_MESSAGES } from '@/utils/error-messages';

export function useErrorHandler() {
  const handleError = (error: unknown) => {
    if (error instanceof ApiError) {
      toast({
        title: 'Error',
        description: ERROR_MESSAGES[error.status] || error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  return { handleError };
}
```

## State Management Patterns

### Using NextAuth with Providers
```typescript
// app/providers.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider defaultTheme="light" storageKey="app-theme">
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
```

### Data Fetching with SWR
```typescript
// hooks/use-data.ts
import useSWR from 'swr';
import { apiClient } from '@/lib/api-client';

export function useData<T>(endpoint: string | null) {
  const { data, error, mutate } = useSWR<T>(
    endpoint,
    () => apiClient.get<T>(endpoint!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
```

## Component Patterns

### Loading States
```typescript
// components/ui/loading-spinner.tsx
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoadingSpinner({ 
  size = 'default',
  className 
}: { 
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <Loader2 
      className={cn(
        'animate-spin',
        sizeClasses[size],
        className
      )} 
    />
  );
}
```

### Empty States
```typescript
// components/ui/empty-state.tsx
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

## Demo Authentication Implementation

### Sign-in Page with Demo Button
```typescript
// app/(auth)/login/page.tsx
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DEMO_USER } from '@/utils/auth-constants';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    
    if (result?.error) {
      setError('Invalid credentials');
      setIsLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    const result = await signIn('credentials', {
      email: DEMO_USER.email,
      password: DEMO_USER.password,
      redirect: false,
    });
    
    if (result?.ok) {
      router.push('/dashboard');
    }
    setIsDemoLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                name="email"
                placeholder="Email"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Input
                type="password"
                name="password"
                placeholder="Password"
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <LoadingSpinner size="sm" /> : 'Sign In'}
            </Button>
          </form>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={handleDemoLogin}
            disabled={isDemoLoading}
          >
            {isDemoLoading ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : null}
            Demo Account
          </Button>
          
          <div className="mt-4 rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium mb-1">Demo Credentials:</p>
            <p className="text-muted-foreground">Email: {DEMO_USER.email}</p>
            <p className="text-muted-foreground">Password: {DEMO_USER.password}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Required Attribution

Every generated app MUST include a "Powered by PlanetScale" attribution in the footer:

```tsx
// components/layout/footer.tsx
export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>© 2024 {APP_NAME}. All rights reserved.</div>
          <div>Powered by PlanetScale</div>
        </div>
      </div>
    </footer>
  );
}
```

## Implementation Checklist

When implementing any feature, ensure:

- [ ] NextAuth.js is properly configured with JWT strategy
- [ ] SessionProvider wraps the entire app
- [ ] API client uses NextAuth session for auth headers
- [ ] MSW handlers are set up for NextAuth and API endpoints
- [ ] Demo user authentication works
- [ ] Protected routes use NextAuth middleware
- [ ] Sign out uses NextAuth signOut function
- [ ] All API errors show toast notifications
- [ ] Forms show loading states
- [ ] Empty states have appropriate messaging
- [ ] PlanetScale attribution is included
- [ ] Theme is appropriate for app type