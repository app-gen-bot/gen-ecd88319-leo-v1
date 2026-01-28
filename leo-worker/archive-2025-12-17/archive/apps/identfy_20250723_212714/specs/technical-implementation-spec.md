# Technical Implementation Specification
*Bridge between Frontend Interaction Spec and Code Implementation*

## Overview

This specification defines the technical implementation patterns for features described in the Frontend Interaction Specification. All patterns are opinionated and standardized to ensure consistency across generated applications.

## Authentication & Session Management

### Clerk Integration

Authentication is handled entirely by Clerk, providing:
- Managed user authentication and sessions
- Social login providers (Google, GitHub, etc.)
- Multi-factor authentication
- User profile management
- Secure token handling
- Webhook integration for backend sync

### Environment Configuration
```typescript
// Required Clerk environment variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Authentication Flow with Clerk

#### Setup ClerkProvider
```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

#### Sign In/Sign Up Pages
```typescript
// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn />
    </div>
  )
}
```

#### User Menu & Logout
```typescript
// components/user-nav.tsx
import { UserButton } from '@clerk/nextjs'

export function UserNav() {
  return (
    <UserButton 
      afterSignOutUrl="/"
      appearance={{
        elements: {
          avatarBox: "h-8 w-8",
          userButtonPopoverCard: "dark:bg-gray-800",
          userButtonPopoverActionButton: "dark:hover:bg-gray-700"
        }
      }}
    />
  )
}
```

#### Accessing User Data
```typescript
// In any component
import { useUser, useAuth } from '@clerk/nextjs'

export function UserProfile() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { signOut } = useAuth()
  
  if (!isLoaded) return <LoadingSpinner />
  if (!isSignedIn) return null
  
  return (
    <div>
      <p>Welcome, {user.firstName || user.emailAddresses[0].emailAddress}!</p>
      <Button onClick={() => signOut()}>Sign Out</Button>
    </div>
  )
}
```

### Token Management with Clerk

```typescript
// lib/api-client.ts
import { auth } from '@clerk/nextjs'

class ApiClient {
  private baseURL: string;
  
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  }
  
  // Get token for client-side requests
  private async getAuthToken(): Promise<string | null> {
    if (typeof window !== 'undefined' && window.Clerk) {
      return await window.Clerk.session?.getToken();
    }
    return null;
  }
  
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    
    // Get fresh token from Clerk for each request
    const token = await this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // Redirect to sign-in on auth failure
        window.location.href = '/sign-in';
      }
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
}

export const apiClient = new ApiClient();
```

## Error Handling Patterns

### HTTP Status Code Handling

```typescript
// In API client request method
if (!response.ok) {
  switch (response.status) {
    case 401: // Unauthorized
      // Token expired or invalid
      this.handleUnauthorized();
      break;
    case 403: // Forbidden
      throw new ApiError('You do not have permission to perform this action', 'FORBIDDEN');
    case 404: // Not Found
      throw new ApiError('The requested resource was not found', 'NOT_FOUND');
    case 429: // Rate Limited
      const retryAfter = response.headers.get('Retry-After');
      throw new ApiError(`Rate limited. Try again in ${retryAfter} seconds`, 'RATE_LIMITED');
    case 500:
    case 502:
    case 503:
    case 504: // Server errors
      throw new ApiError('Server error. Please try again later.', 'SERVER_ERROR');
    default:
      throw new ApiError(data.detail || 'An error occurred', 'UNKNOWN_ERROR');
  }
}

private handleUnauthorized() {
  // Clerk handles session management
  // Just redirect to sign-in page
  if (typeof window !== 'undefined') {
    window.location.href = '/sign-in';
  }
}
```

### Error Display Patterns

```typescript
// Global error handler using toast notifications
function handleApiError(error: ApiError) {
  switch (error.code) {
    case 'FORBIDDEN':
      toast({
        title: "Permission Denied",
        description: error.message,
        variant: "destructive",
      });
      break;
    case 'NOT_FOUND':
      toast({
        title: "Not Found",
        description: error.message,
        variant: "destructive",
      });
      break;
    case 'RATE_LIMITED':
      toast({
        title: "Slow Down",
        description: error.message,
        variant: "warning",
      });
      break;
    case 'SERVER_ERROR':
      toast({
        title: "Server Error",
        description: error.message,
        variant: "destructive",
        action: <ToastAction altText="Retry" onClick={retry}>Retry</ToastAction>,
      });
      break;
    case 'NETWORK_ERROR':
      toast({
        title: "Connection Lost",
        description: "Please check your internet connection",
        variant: "warning",
      });
      break;
    default:
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
  }
}
```

### Network Error Handling

```typescript
// Add retry logic with exponential backoff
async function fetchWithRetry(
  fn: () => Promise<any>, 
  retries = 3,
  delay = 1000
): Promise<any> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0 || error.code === 'FORBIDDEN') {
      throw error;
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return fetchWithRetry(fn, retries - 1, delay * 2);
  }
}
```

## State Management Patterns

### Using Clerk Hooks

```typescript
// No custom auth context needed - use Clerk's built-in hooks:
import { useUser, useAuth, useSession, useClerk } from '@clerk/nextjs'

// Example: Check if user is authenticated
function MyComponent() {
  const { isLoaded, isSignedIn, user } = useUser();
  
  if (!isLoaded) return <LoadingSpinner />;
  if (!isSignedIn) return <RedirectToSignIn />;
  
  return <div>Hello {user.firstName}!</div>;
}

```

### Protected Routes with Clerk

#### Middleware Configuration
```typescript
// middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up"],
  ignoredRoutes: ["/api/webhook"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"]
};
```

#### Component Protection
```typescript
// Using Clerk components for protection
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs'

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
```

### Global Data Fetching Pattern

```typescript
// Use SWR for data fetching with proper error handling
export function useChannelMessages(channelId: string) {
  const { data, error, mutate } = useSWR(
    channelId ? `/messages?channel_id=${channelId}` : null,
    (url) => apiClient.getMessages(channelId),
    {
      refreshInterval: 30000, // Poll every 30 seconds
      revalidateOnFocus: true,
      onError: (error) => {
        if (error.code !== 'UNAUTHORIZED') {
          handleApiError(error);
        }
      },
    }
  );
  
  return {
    messages: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
```

## API Integration Patterns

### Standard API Client Structure

```typescript
class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    this.restoreToken();
  }
  
  // Standard request wrapper with all error handling
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...(options.headers as Record<string, string>),
        },
      });
      
      if (!response.ok) {
        await this.handleHttpError(response);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Network error. Please check your connection.',
        'NETWORK_ERROR'
      );
    }
  }
  
  private getAuthHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }
}
```

### Optimistic Updates Pattern

```typescript
// Example: Sending a message
async function sendMessage(content: string) {
  // Create optimistic message
  const optimisticMessage: Message = {
    id: `temp-${Date.now()}`,
    content,
    user_id: currentUser.id,
    user_name: currentUser.name,
    created_at: new Date().toISOString(),
    is_edited: false,
  };
  
  // Update UI immediately
  mutate(
    `/messages?channel_id=${channelId}`,
    (messages: Message[]) => [...messages, optimisticMessage],
    false // Don't revalidate yet
  );
  
  try {
    // Send to server
    const realMessage = await apiClient.sendMessage({
      channel_id: channelId,
      content,
    });
    
    // Replace optimistic message with real one
    mutate(
      `/messages?channel_id=${channelId}`,
      (messages: Message[]) => 
        messages.map(m => m.id === optimisticMessage.id ? realMessage : m),
      false
    );
  } catch (error) {
    // Revert on error
    mutate(
      `/messages?channel_id=${channelId}`,
      (messages: Message[]) => 
        messages.filter(m => m.id !== optimisticMessage.id),
      false
    );
    
    handleApiError(error);
  }
}
```

## WebSocket Integration Pattern

```typescript
// hooks/use-websocket.ts
export function useWebSocket() {
  const { user } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  
  useEffect(() => {
    if (!user) return;
    
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws?token=${token}`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Implement reconnection logic
    };
    
    setSocket(ws);
    
    return () => {
      ws.close();
    };
  }, [user]);
  
  return socket;
}
```

## Form Handling Pattern

```typescript
// Standard form with validation and error handling
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
    
    try {
      await login(email, password);
      // Navigation handled by auth context
    } catch (error) {
      if (error.code === 'INVALID_CREDENTIALS') {
        setError('Invalid email or password');
      } else {
        setError(error.message || 'An error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorAlert message={error} />}
      {/* Form fields */}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
```

## Demo Authentication

All generated applications MUST support demo authentication:
- **Email**: demo@example.com
- **Password**: demo123

This ensures all apps can be tested immediately without requiring real user registration.

## Implementation Checklist

When implementing any feature, ensure:

- [ ] Clerk is properly configured with environment variables
- [ ] ClerkProvider wraps the entire app
- [ ] Sign-in and sign-up pages are set up
- [ ] Middleware protects appropriate routes
- [ ] API client uses Clerk tokens for authentication
- [ ] All API errors are handled with proper UI feedback
- [ ] 401 errors redirect to sign-in page
- [ ] Forms show loading states during submission
- [ ] Optimistic updates are used for better UX
- [ ] Network errors show retry options
- [ ] Demo authentication works (demo@example.com/demo123)
- [ ] Protected routes use Clerk components
- [ ] All async operations handle errors gracefully

## Standard Error Codes

Always use these error codes for consistency:

- `UNAUTHORIZED` - 401, invalid or expired token
- `FORBIDDEN` - 403, user lacks permission
- `NOT_FOUND` - 404, resource doesn't exist
- `VALIDATION_ERROR` - 400, invalid input data
- `RATE_LIMITED` - 429, too many requests
- `SERVER_ERROR` - 500+, server-side error
- `NETWORK_ERROR` - Network failure
- `INVALID_CREDENTIALS` - Login failed
- `DUPLICATE_RESOURCE` - Resource already exists