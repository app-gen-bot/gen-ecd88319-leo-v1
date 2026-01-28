# Technical Reference Implementation
*Detailed code examples and patterns - Read relevant sections as needed*

## Table of Contents
1. [NextAuth Implementation](#nextauth-implementation)
2. [API Client Pattern](#api-client-pattern)
3. [Mock Service Worker](#mock-service-worker)
4. [Component Patterns](#component-patterns)
5. [Error Handling](#error-handling)
6. [Demo Authentication Page](#demo-authentication-page)

## NextAuth Implementation

### Type Declarations
Create these types first to ensure TypeScript compatibility:

```typescript
// types/next-auth.d.ts
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

### Auth Constants
```typescript
// utils/auth-constants.ts
export const DEMO_USER = {
  email: 'demo@example.com',
  password: 'DemoRocks2025!',
  name: 'Demo User',
  id: 'demo_user_1'
};
```

### NextAuth Route Handler
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
        // Demo user authentication - MUST WORK
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
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider 
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        storageKey="app-theme"
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Protected Routes Middleware
```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';

// Simple configuration
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

// Advanced configuration with custom logic
export default withAuth(
  function middleware(req) {
    // Custom logic here
    // Example: Different redirect based on user role
    const token = req.nextauth.token;
    const isAdmin = token?.role === 'admin';
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
    
    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);
```

### Using Session in Components
```typescript
// components/user-menu.tsx
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function UserMenu() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return <LoadingSpinner size="sm" />;
  }
  
  if (status === 'unauthenticated' || !session?.user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={session.user.image || ''} 
              alt={session.user.name || ''} 
            />
            <AvatarFallback>
              {session.user.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.user.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/profile')}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## API Client Pattern

### API Client Implementation
```typescript
// lib/api-client.ts
import { getSession, signOut } from 'next-auth/react';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

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

### Using API Client with SWR
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

// Usage in component
export function UserList() {
  const { data: users, isLoading, isError } = useData<User[]>('/users');
  
  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorState />;
  
  return (
    <div>
      {users?.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

## Mock Service Worker

### MSW Handlers
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
  
  // Mock backend API login endpoint
  http.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, async ({ request }) => {
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
  
  // Example: Users list endpoint
  http.get(`${process.env.NEXT_PUBLIC_API_URL}/users`, () => {
    return HttpResponse.json([
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    ]);
  }),
  
  // Example: Create user endpoint
  http.post(`${process.env.NEXT_PUBLIC_API_URL}/users`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: Math.random().toString(),
      ...body,
      createdAt: new Date().toISOString(),
    });
  }),
];
```

### MSW Browser Setup
```typescript
// mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

### MSW Initialization
```typescript
// app/providers.tsx (add to existing file)
'use client';

import { useEffect, useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initMocks() {
      if (process.env.NODE_ENV === 'development') {
        const { worker } = await import('@/mocks/browser');
        await worker.start({
          onUnhandledRequest: 'bypass',
        });
      }
      setIsReady(true);
    }
    
    initMocks();
  }, []);

  if (!isReady) {
    return null; // Or a loading spinner
  }

  return (
    <SessionProvider>
      <ThemeProvider 
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        storageKey="app-theme"
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
```

### Public Directory Setup
```javascript
// public/mockServiceWorker.js
// Copy this file from: node_modules/msw/lib/mockServiceWorker.js
// This file is required for MSW to work in the browser
```

## Component Patterns

### Loading Spinner
```typescript
// components/ui/loading-spinner.tsx
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function LoadingSpinner({ 
  size = 'default',
  className 
}: LoadingSpinnerProps) {
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

// Full page loader
export function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

// Inline loader
export function InlineLoader() {
  return (
    <div className="flex items-center justify-center py-4">
      <LoadingSpinner size="sm" />
    </div>
  );
}
```

### Empty State
```typescript
// components/ui/empty-state.tsx
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
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

### Error State
```typescript
// components/ui/error-state.tsx
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = 'Something went wrong',
  description = 'An error occurred while loading this content.',
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-destructive/10 p-3 mb-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}
```

## Error Handling

### Error Messages
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

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return ERROR_MESSAGES[error.status] || error.message;
  }
  return 'An unexpected error occurred';
}
```

### Toast Notifications
```typescript
// hooks/use-error-handler.ts
import { toast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/utils/error-messages';

export function useErrorHandler() {
  const handleError = (error: unknown) => {
    const message = getErrorMessage(error);
    
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  };

  return { handleError };
}

// Usage in component
export function MyComponent() {
  const { handleError } = useErrorHandler();
  
  const handleSubmit = async () => {
    try {
      await apiClient.post('/items', data);
      toast({
        title: 'Success',
        description: 'Item created successfully',
      });
    } catch (error) {
      handleError(error);
    }
  };
}
```

### Form Validation
```typescript
// Example form with client-side validation
export function ContactForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateForm = (formData: FormData): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    const email = formData.get('email') as string;
    if (!email || !email.includes('@')) {
      errors.email = 'Please enter a valid email address';
    }
    
    const message = formData.get('message') as string;
    if (!message || message.length < 10) {
      errors.message = 'Message must be at least 10 characters';
    }
    
    return errors;
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    
    const formData = new FormData(e.currentTarget);
    const validationErrors = validateForm(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await apiClient.post('/contact', Object.fromEntries(formData));
      toast({ title: 'Message sent successfully!' });
      e.currentTarget.reset();
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="email"
          name="email"
          placeholder="Email"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-sm text-destructive mt-1">{errors.email}</p>
        )}
      </div>
      
      <div>
        <Textarea
          name="message"
          placeholder="Your message"
          rows={4}
          disabled={isSubmitting}
        />
        {errors.message && (
          <p className="text-sm text-destructive mt-1">{errors.message}</p>
        )}
      </div>
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <LoadingSpinner size="sm" /> : 'Send Message'}
      </Button>
    </form>
  );
}
```

## Demo Authentication Page

### Complete Login Page Implementation
```typescript
// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
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
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    setError('');
    
    try {
      const result = await signIn('credentials', {
        email: DEMO_USER.email,
        password: DEMO_USER.password,
        redirect: false,
      });
      
      if (result?.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError('Demo login failed. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                name="email"
                placeholder="name@example.com"
                required
                disabled={isLoading || isDemoLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Input
                type="password"
                name="password"
                placeholder="Enter your password"
                required
                disabled={isLoading || isDemoLoading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || isDemoLoading}
            >
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              Sign In
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
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleDemoLogin}
            disabled={isLoading || isDemoLoading}
          >
            {isDemoLoading && <LoadingSpinner size="sm" className="mr-2" />}
            Demo Account
          </Button>
          
          <div className="mt-4 rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium mb-1">Demo Credentials:</p>
            <p className="text-muted-foreground">
              Email: {DEMO_USER.email}
            </p>
            <p className="text-muted-foreground">
              Password: {DEMO_USER.password}
            </p>
          </div>
          
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <a href="/signup" className="text-primary hover:underline">
              Sign up
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Sign Up Page (Optional)
```typescript
// app/(auth)/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { apiClient } from '@/lib/api-client';
import { useErrorHandler } from '@/hooks/use-error-handler';

export default function SignUpPage() {
  const router = useRouter();
  const { handleError } = useErrorHandler();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };
    
    try {
      // Create account
      await apiClient.post('/auth/register', data);
      
      // Auto sign in
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      
      if (result?.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      handleError(error);
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Enter your information to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                name="name"
                placeholder="John Doe"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Input
                type="email"
                name="email"
                placeholder="name@example.com"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Input
                type="password"
                name="password"
                placeholder="Create a password"
                required
                minLength={8}
                disabled={isLoading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              Create Account
            </Button>
          </form>
          
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <a href="/login" className="text-primary hover:underline">
              Sign in
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Footer with Attribution

### Footer Component
```tsx
// components/layout/footer.tsx
export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>© {currentYear} AppName. All rights reserved.</div>
          <div>Powered by PlanetScale</div>
        </div>
      </div>
    </footer>
  );
}
```

## Notes

- All code examples are production-ready
- Follow TypeScript best practices
- Use proper error boundaries and loading states
- Ensure accessibility with proper ARIA labels
- Test with keyboard navigation
- Validate forms on both client and server