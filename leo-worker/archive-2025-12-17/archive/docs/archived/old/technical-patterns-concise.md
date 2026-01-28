# Technical Patterns - Quick Reference

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router), React 18, TypeScript
- **UI**: ShadCN UI, Tailwind CSS
- **State**: React Context + Hooks
- **Data**: SWR for fetching, Zod for validation
- **Development**: MSW for API mocking

### Backend
- **Framework**: FastAPI, Python 3.12+
- **Validation**: Pydantic
- **Database**: DynamoDB (multi-table design)
- **Auth**: JWT (python-jose[cryptography])
- **Testing**: pytest, ruff for linting

### Infrastructure
- AWS Lambda, API Gateway, CloudFront, S3, CDK

## Key Patterns

### Authentication
```typescript
// Required localStorage keys - DO NOT CHANGE
const AUTH_CONSTANTS = {
  AUTH_TOKEN_KEY: 'auth_token',
  REFRESH_TOKEN_KEY: 'refresh_token', 
  CURRENT_USER_KEY: 'current_user',
  CURRENT_WORKSPACE_KEY: 'current_workspace'
};

// Logout MUST use hard refresh
function logout() {
  // Clear all auth data
  Object.values(AUTH_CONSTANTS).forEach(key => 
    localStorage.removeItem(key)
  );
  window.location.href = '/login'; // NOT router.push()
}
```

### API Client
```typescript
// Singleton pattern with auto-auth
class ApiClient {
  private static instance: ApiClient;
  
  async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem(AUTH_CONSTANTS.AUTH_TOKEN_KEY);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });
    
    if (response.status === 401) logout();
    if (!response.ok) throw new ApiError(response.status, await response.text());
    
    return response.json();
  }
}
```

### Mock Service Worker (MSW)
```typescript
// mocks/handlers.ts
export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json();
    
    // Demo user MUST work
    if (email === 'demo@example.com' && password === 'DemoRocks2025!') {
      return HttpResponse.json({
        access_token: 'demo-jwt-token',
        user: { id: '1', email: 'demo@example.com', name: 'Demo User' }
      });
    }
    
    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }),
];

// Enable in development only
if (process.env.NODE_ENV === 'development') {
  worker.start({ onUnhandledRequest: 'bypass' });
}
```

### Component Patterns
```tsx
// Loading States
export function LoadingSpinner({ size = 'md' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return <Loader2 className={`animate-spin ${sizes[size]}`} />;
}

// Empty States  
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}
```

### Theme Selection
```css
/* Light Mode (Consumer apps, e-commerce) */
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  /* ... other light colors */
}

/* Dark Mode (Dev tools, analytics) */
.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  /* ... other dark colors */
}
```

### Error Handling
```typescript
// Standardized errors
const ERROR_MESSAGES = {
  400: 'Please check your input and try again',
  401: 'Please login to continue',
  403: 'You do not have permission',
  404: 'Resource not found',
  500: 'Something went wrong'
};

// Toast notifications
function useErrorHandler() {
  return (error: unknown) => {
    toast.error(error instanceof ApiError 
      ? error.message 
      : 'An unexpected error occurred'
    );
  };
}
```

### Backend Structure
```
backend/
├── api/        # Route handlers
├── models/     # Pydantic models
├── services/   # Business logic
├── utils/      # Helpers
└── main.py     # FastAPI app
```

### DynamoDB Pattern
```python
# Multi-table design
TABLES = {
    "users": "app-users",
    "workspaces": "app-workspaces",
    "messages": "app-messages"
}

class DynamoModel:
    @classmethod
    async def get(cls, id: str):
        table = boto3.resource('dynamodb').Table(cls.table_name)
        response = table.get_item(Key={'id': id})
        return cls(**response.get('Item', {}))
```

## Required Elements

### Attribution
```tsx
<footer className="border-t">
  <div className="container py-6 text-sm text-muted-foreground">
    <div>Powered by PlanetScale</div>
  </div>
</footer>
```

### Demo Login
- Email: `demo@example.com`
- Password: `DemoRocks2025!`
- Must have "Demo Login" button
- Must work without real backend

## Quick Checklist
- [ ] Using exact auth token keys
- [ ] Logout uses hard refresh
- [ ] MSW handlers for all API calls
- [ ] Demo user works
- [ ] Theme appropriate for app type
- [ ] PlanetScale attribution included
- [ ] Error handling with toasts
- [ ] Loading states on all async operations