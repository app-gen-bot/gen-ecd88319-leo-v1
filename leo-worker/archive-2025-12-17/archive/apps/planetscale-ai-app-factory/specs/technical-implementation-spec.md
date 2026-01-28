# Technical Implementation Specification
*Bridge between Frontend Interaction Spec and Code Implementation*

## Overview

This specification defines the technical implementation patterns for features described in the Frontend Interaction Specification. All patterns are opinionated and standardized to ensure consistency across generated applications.

## Authentication & Session Management

### Token Storage
```typescript
// Token keys - ALWAYS use these exact keys
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const CURRENT_USER_KEY = 'current_user';
const CURRENT_WORKSPACE_KEY = 'current_workspace';
```

### Authentication Flow

#### Login Success
1. Receive tokens from API: `{ access_token, refresh_token, user }`
2. Store tokens:
   ```typescript
   localStorage.setItem(AUTH_TOKEN_KEY, response.access_token);
   localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
   localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.user));
   ```
3. Set token in API client: `apiClient.setToken(response.access_token)`
4. Navigate to default page: `router.push('/channel/general')`

#### Logout Flow
1. Call logout API: `await apiClient.logout()`
2. Clear ALL session data:
   ```typescript
   localStorage.removeItem(AUTH_TOKEN_KEY);
   localStorage.removeItem(REFRESH_TOKEN_KEY);
   localStorage.removeItem(CURRENT_USER_KEY);
   localStorage.removeItem(CURRENT_WORKSPACE_KEY);
   ```
3. Reset API client: `apiClient.setToken(null)`
4. Navigate to login: `router.push('/login')`

#### Session Restoration (on app load)
```typescript
const token = localStorage.getItem(AUTH_TOKEN_KEY);
if (token) {
  apiClient.setToken(token);
  // Verify token is still valid
  try {
    await apiClient.getSession();
  } catch (error) {
    // Token invalid, trigger logout
    handleLogout();
  }
}
```

### Token Management in API Client

```typescript
class ApiClient {
  private token: string | null = null;
  
  constructor() {
    // Auto-restore token on initialization
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
    // Always include token if available
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    // ... rest of request logic
  }
}
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
  // Clear all auth data
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(CURRENT_WORKSPACE_KEY);
  this.token = null;
  
  // Redirect to login
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
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

### Auth Context Provider

```typescript
// contexts/auth-context.tsx
interface AuthContextValue {
  user: User | null;
  workspace: Workspace | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        try {
          apiClient.setToken(token);
          const session = await apiClient.getSession();
          if (session.valid && session.user) {
            setUser(session.user);
            // Restore workspace from localStorage
            const savedWorkspace = localStorage.getItem(CURRENT_WORKSPACE_KEY);
            if (savedWorkspace) {
              setWorkspace(JSON.parse(savedWorkspace));
            }
          }
        } catch (error) {
          // Invalid session, clear everything
          handleLogout();
        }
      }
      setIsLoading(false);
    };
    
    restoreSession();
  }, []);
  
  // ... rest of implementation
}
```

### Protected Route Component

```typescript
// components/auth-check.tsx
export function AuthCheck({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return null;
  }
  
  return <>{children}</>;
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

## Implementation Checklist

When implementing any feature, ensure:

- [ ] Authentication tokens use standard keys
- [ ] All API errors are handled with proper UI feedback
- [ ] 401 errors trigger automatic logout
- [ ] Forms show loading states during submission
- [ ] Optimistic updates are used for better UX
- [ ] Network errors show retry options
- [ ] Session is restored on app load
- [ ] Protected routes redirect to login when unauthorized
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