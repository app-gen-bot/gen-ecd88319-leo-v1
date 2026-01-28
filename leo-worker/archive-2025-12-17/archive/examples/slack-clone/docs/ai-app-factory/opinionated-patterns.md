# AI App Factory: Opinionated Patterns

## Overview

This document defines the opinionated patterns used across all AI-generated applications. These patterns ensure consistency, quality, and rapid development by eliminating implementation decisions.

## Core Principles

1. **Convention over Configuration** - One way to do everything
2. **Best Practices by Default** - Security, performance, and UX built-in
3. **Consistency Across Projects** - Same patterns everywhere
4. **Developer Experience First** - Easy to understand and maintain

## Authentication Pattern

### Token Storage Keys (Immutable)
```typescript
// ALWAYS use these exact keys across all projects
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const CURRENT_USER_KEY = 'current_user';
const CURRENT_WORKSPACE_KEY = 'current_workspace';  // For multi-tenant apps
```

### Standard Authentication Flow

#### 1. Login Implementation
```typescript
// Frontend login handler - ALWAYS follows this pattern
async function handleLogin(email: string, password: string) {
  try {
    // 1. Call API
    const response = await apiClient.login(email, password);
    
    // 2. Store tokens and user data
    localStorage.setItem(AUTH_TOKEN_KEY, response.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.user));
    
    // 3. Update API client
    apiClient.setToken(response.access_token);
    
    // 4. Navigate to default authenticated page
    router.push('/dashboard'); // or '/channel/general' for chat apps
    
  } catch (error) {
    // 5. Handle errors consistently
    if (error.code === 'INVALID_CREDENTIALS') {
      setError('Invalid email or password');
    } else {
      setError('Unable to sign in. Please try again.');
    }
  }
}
```

#### 2. Logout Implementation
```typescript
// ALWAYS implement logout exactly like this
async function handleLogout() {
  try {
    // 1. Call logout API (ignore errors)
    await apiClient.logout().catch(() => {});
  } finally {
    // 2. Clear ALL stored data
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(CURRENT_WORKSPACE_KEY);
    
    // 3. Reset API client
    apiClient.setToken(null);
    
    // 4. Redirect to login
    window.location.href = '/login';  // Hard refresh to clear all state
  }
}
```

#### 3. Session Check on App Load
```typescript
// In root layout or app component
useEffect(() => {
  const checkSession = async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    
    try {
      apiClient.setToken(token);
      const session = await apiClient.getSession();
      if (session.valid) {
        setIsAuthenticated(true);
        setUser(session.user);
      } else {
        handleLogout();
      }
    } catch (error) {
      handleLogout();
    }
  };
  
  checkSession();
}, []);
```

## API Client Pattern

### Standard API Client Template
```typescript
class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    // Auto-restore token
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem(AUTH_TOKEN_KEY);
    }
  }
  
  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    }
  }
  
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    
    // Always add auth header if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    try {
      const response = await fetch(url, { ...options, headers });
      
      // Handle non-OK responses
      if (!response.ok) {
        if (response.status === 401) {
          // Auto-logout on 401
          this.handleUnauthorized();
          throw new ApiError('Session expired', 'UNAUTHORIZED');
        }
        
        const data = await response.json().catch(() => ({}));
        throw new ApiError(
          data.detail || `Request failed with status ${response.status}`,
          this.getErrorCode(response.status),
          data
        );
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error', 'NETWORK_ERROR');
    }
  }
  
  private handleUnauthorized() {
    // Clear everything and redirect
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    this.token = null;
    
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
  
  private getErrorCode(status: number): string {
    const errorCodes: Record<number, string> = {
      400: 'VALIDATION_ERROR',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      429: 'RATE_LIMITED',
      500: 'SERVER_ERROR',
      502: 'SERVER_ERROR',
      503: 'SERVER_ERROR',
      504: 'SERVER_ERROR',
    };
    return errorCodes[status] || 'UNKNOWN_ERROR';
  }
  
  // Standard CRUD methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }
  
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Custom error class
class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Export singleton
const apiClient = new ApiClient();
export default apiClient;
```

## Error Handling Pattern

### Global Error Handler with Toast
```typescript
// utils/error-handler.ts
export function handleApiError(error: ApiError) {
  // Don't show toast for auth errors (handled by redirect)
  if (error.code === 'UNAUTHORIZED') return;
  
  const errorMessages: Record<string, { title: string; description: string }> = {
    FORBIDDEN: {
      title: 'Access Denied',
      description: 'You don\'t have permission to do that.',
    },
    NOT_FOUND: {
      title: 'Not Found',
      description: 'The requested item could not be found.',
    },
    VALIDATION_ERROR: {
      title: 'Invalid Input',
      description: error.message || 'Please check your input and try again.',
    },
    RATE_LIMITED: {
      title: 'Too Many Requests',
      description: 'Please slow down and try again later.',
    },
    SERVER_ERROR: {
      title: 'Server Error',
      description: 'Something went wrong. Please try again.',
    },
    NETWORK_ERROR: {
      title: 'Connection Lost',
      description: 'Please check your internet connection.',
    },
  };
  
  const { title, description } = errorMessages[error.code] || {
    title: 'Error',
    description: error.message || 'An unexpected error occurred.',
  };
  
  toast({
    title,
    description,
    variant: 'destructive',
  });
}
```

### Form Error Display
```typescript
// Standard form error component
export function FormError({ error }: { error: string | null }) {
  if (!error) return null;
  
  return (
    <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 mb-4">
      <div className="flex">
        <AlertCircle className="h-5 w-5 text-red-400" />
        <div className="ml-3">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      </div>
    </div>
  );
}
```

## State Management Pattern

### Auth Context (Required for all apps)
```typescript
// contexts/auth-context.tsx
interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  // Initialize session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        try {
          apiClient.setToken(token);
          const userData = localStorage.getItem(CURRENT_USER_KEY);
          if (userData) {
            setUser(JSON.parse(userData));
          }
          // Verify token is still valid
          await apiClient.get('/auth/session');
        } catch {
          // Token invalid, clear everything
          await logout();
        }
      }
      setIsLoading(false);
    };
    
    initAuth();
  }, []);
  
  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    
    // Store everything
    localStorage.setItem(AUTH_TOKEN_KEY, response.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.user));
    
    apiClient.setToken(response.access_token);
    setUser(response.user);
    
    router.push('/dashboard');
  };
  
  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore logout API errors
    }
    
    // Clear everything
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    
    apiClient.setToken(null);
    setUser(null);
    
    router.push('/login');
  };
  
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        isAuthenticated: !!user,
        login, 
        logout,
        updateUser: (updates) => setUser(prev => prev ? {...prev, ...updates} : null)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Protected Route Component
```typescript
// components/auth-check.tsx
export function AuthCheck({ 
  children,
  requiredRole,
  fallback = null 
}: { 
  children: React.ReactNode;
  requiredRole?: string;
  fallback?: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return null;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return fallback || <AccessDenied />;
  }
  
  return <>{children}</>;
}
```

## Data Fetching Pattern

### SWR Configuration
```typescript
// lib/swr-config.ts
export const swrConfig = {
  fetcher: (url: string) => apiClient.get(url),
  onError: (error: Error) => {
    if (error instanceof ApiError && error.code !== 'UNAUTHORIZED') {
      handleApiError(error);
    }
  },
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  shouldRetryOnError: (error: Error) => {
    if (error instanceof ApiError) {
      return !['UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND'].includes(error.code);
    }
    return true;
  },
};
```

### Standard Data Hook
```typescript
// Example: hooks/use-items.ts
export function useItems(filters?: ItemFilters) {
  const queryString = filters ? `?${new URLSearchParams(filters)}` : '';
  
  const { data, error, mutate } = useSWR<Item[]>(
    `/items${queryString}`,
    {
      refreshInterval: 30000, // Refresh every 30s
    }
  );
  
  return {
    items: data || [],
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
}
```

## Component Patterns

### Loading States
```typescript
// components/loading-spinner.tsx
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-primary border-t-transparent`} />
    </div>
  );
}
```

### Empty States
```typescript
// components/empty-state.tsx
export function EmptyState({ 
  icon: Icon,
  title,
  description,
  action
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Icon className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}
```

## Form Patterns

### Standard Form with Validation
```typescript
// Example login form
export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }
    
    try {
      await login(email, password);
      // Success - auth context handles navigation
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'INVALID_CREDENTIALS') {
          setError('Invalid email or password');
        } else {
          setError('Unable to sign in. Please try again.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormError error={error} />
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isLoading}
        />
      </div>
      
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={isLoading}
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <LoadingSpinner size="sm" /> : 'Sign In'}
      </Button>
    </form>
  );
}
```

## Testing Patterns

### API Mock for Development
```typescript
// lib/api-mock.ts (only in development)
if (process.env.NODE_ENV === 'development') {
  // Mock successful login
  window.mockLogin = () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    };
    
    localStorage.setItem(AUTH_TOKEN_KEY, 'mock-token');
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(mockUser));
    window.location.href = '/dashboard';
  };
}
```

## Deployment Patterns

### Environment Variables
```bash
# .env.local (Next.js)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# .env.production
NEXT_PUBLIC_API_URL=https://api.example.com/v1
NEXT_PUBLIC_WS_URL=wss://api.example.com
```

### Build-time Checks
```typescript
// next.config.js
module.exports = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  },
  // Fail build if required env vars missing in production
  webpack: (config, { isServer }) => {
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_API_URL) {
      throw new Error('NEXT_PUBLIC_API_URL is required in production');
    }
    return config;
  },
};
```

## Migration Guide

When updating existing apps to use these patterns:

1. **Update token keys** - Search and replace old keys with standard ones
2. **Update API client** - Replace with standard template
3. **Add Auth context** - Wrap app with AuthProvider
4. **Update error handling** - Use standard error handler
5. **Update forms** - Use standard form pattern
6. **Test auth flow** - Ensure login/logout work correctly

## Checklist for New Apps

- [ ] Use standard token storage keys
- [ ] Implement API client with 401 handling
- [ ] Add AuthProvider and useAuth hook
- [ ] Use AuthCheck for protected routes
- [ ] Handle all API errors with toast
- [ ] Show loading states during async operations
- [ ] Implement logout with full cleanup
- [ ] Test session restoration on refresh
- [ ] Add environment variables
- [ ] Configure SWR with error handling