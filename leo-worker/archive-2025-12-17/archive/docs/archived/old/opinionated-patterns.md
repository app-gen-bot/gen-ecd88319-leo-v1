# AI App Factory: Opinionated Patterns

## Overview

This document defines the opinionated patterns used across all AI-generated applications. These patterns ensure consistency, quality, and rapid development by eliminating implementation decisions.

## Core Principles

1. **Convention over Configuration** - One way to do everything
2. **Best Practices by Default** - Security, performance, and UX built-in
3. **Consistency Across Projects** - Same patterns everywhere
4. **Developer Experience First** - Easy to understand and maintain

## Authentication Pattern

### NextAuth.js with JWT Strategy

All authentication is handled using NextAuth.js with JWT strategy, providing:
- Secure httpOnly cookies (no localStorage)
- Built-in CSRF protection
- Session management with automatic refresh
- OAuth provider support (optional)
- Demo user support for testing
- MSW (Mock Service Worker) for development
- Type-safe session handling

### NextAuth Configuration
```typescript
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

### Standard Authentication Flow

#### 1. NextAuth Setup
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

#### 2. Sign In/Sign Up Pages
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

#### 3. User Menu & Logout
```typescript
// components/user-nav.tsx
import { useSession, signOut } from 'next-auth/react';

export function UserNav() {
  const { data: session } = useSession();
  
  if (!session?.user) return null;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.user.image} alt={session.user.name} />
            <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session.user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
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

// Initialize MSW in development
if (process.env.NODE_ENV === 'development') {
  const { worker } = await import('@/mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
  });
}
```

## API Client Pattern

### Standard API Client Template with NextAuth
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

// Custom ApiError class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

## State Management Pattern

### Using NextAuth in Components
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

// Example usage in components:
import { useSession, signOut } from 'next-auth/react';

export function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <LoadingSpinner />;
  if (status === 'unauthenticated') return <Navigate to="/login" />;
  
  return (
    <div>
      <h1>Welcome, {session?.user?.name}!</h1>
      <Button onClick={() => signOut()}>Sign Out</Button>
    </div>
  );
}
```

### Protected Routes with NextAuth Middleware
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

// For more granular control:
export default withAuth(
  function middleware(req) {
    // Custom logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);
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

## Error Handling Pattern

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

## UI/UX Patterns

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

### Form Patterns
```typescript
// Example form with proper error handling and loading states
export function ExampleForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { handleError } = useErrorHandler();
  
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await apiClient.post('/api/resource', data);
      toast({
        title: 'Success',
        description: 'Resource created successfully',
      });
      // Navigate or update state
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Form onSubmit={onSubmit}>
      {/* Form fields */}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Creating...
          </>
        ) : (
          'Create'
        )}
      </Button>
    </Form>
  );
}
```

## Demo Authentication

All generated applications MUST support demo authentication:
```typescript
// Demo credentials (must work without backend)
// Email: demo@example.com
// Password: DemoRocks2025!

// Demo login button on sign-in page
<Button
  variant="outline"
  className="w-full"
  onClick={() => login(DEMO_USER.email, DEMO_USER.password)}
>
  Continue with Demo Account
</Button>

// Display demo credentials
<div className="rounded-lg bg-muted p-4 text-sm">
  <p className="font-medium mb-1">Demo Credentials:</p>
  <p className="text-muted-foreground">Email: demo@example.com</p>
  <p className="text-muted-foreground">Password: DemoRocks2025!</p>
</div>
```

## Required Attribution

Every generated app MUST include a "Powered by PlanetScale" attribution:
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

## Environment Variables

### Development (.env.local)
```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-development-secret-here

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_MSW=true
```

### Production (.env.production)
```bash
# NextAuth Configuration
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret-here

# API Configuration
NEXT_PUBLIC_API_URL=https://api.example.com/v1
NEXT_PUBLIC_WS_URL=wss://api.example.com
```

## File Structure Pattern

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── signup/
│       └── page.tsx
├── (protected)/
│   ├── dashboard/
│   │   └── page.tsx
│   └── layout.tsx
├── api/
│   └── ... (API routes if needed)
├── layout.tsx
└── page.tsx

components/
├── ui/           # ShadCN UI components
├── layout/       # Layout components (header, footer)
└── features/     # Feature-specific components

contexts/
└── auth-context.tsx

hooks/
├── use-auth.ts
├── use-data.ts
└── use-error-handler.ts

lib/
├── api-client.ts
└── utils.ts

mocks/
├── handlers.ts
└── browser.ts

utils/
├── auth-constants.ts
└── error-messages.ts
```

## Checklist for New Apps

- [ ] NextAuth.js configured with JWT strategy
- [ ] SessionProvider wrapping entire app
- [ ] MSW handlers for NextAuth and API endpoints
- [ ] Demo user authentication working
- [ ] Protected routes with NextAuth middleware
- [ ] Proper sign out flow with NextAuth
- [ ] All API errors handled with toast
- [ ] Loading states on all async operations
- [ ] Empty states with clear CTAs
- [ ] PlanetScale attribution in footer
- [ ] Proper error boundaries
- [ ] Responsive design (mobile-first)
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] SEO meta tags
- [ ] Performance optimizations (lazy loading, code splitting)