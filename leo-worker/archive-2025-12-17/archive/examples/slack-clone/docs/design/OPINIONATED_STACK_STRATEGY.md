# Opinionated Stack Strategy for Deterministic AI Generation

**Purpose**: Document how mandated tech stacks and pre-built components enable deterministic, high-quality AI-generated applications.

## Executive Summary

By constraining the decision space through opinionated tech stacks and pre-built components, we transform AI code generation from a creative process to an assembly process. This dramatically improves reliability, consistency, and integration quality.

**Key Principle**: Constraints enable creativity. By removing choices, we enable better outcomes.

## The Power of Opinionated Stacks

### Why Opinionation Works

1. **Reduced Decision Fatigue**: LLMs don't need to choose between 50 auth libraries
2. **Increased Determinism**: Same requirements → same implementation
3. **Component Reuse**: Build once, use everywhere
4. **Integration Guarantees**: Pre-tested combinations
5. **Faster Generation**: 80% less code to generate

### The Mandated Stack

```yaml
appfactory_stack:
  core_principle: "Everything runs in customer's AWS account"
  
  frontend:
    framework: "Next.js 14 with App Router"
    ui_library: "ShadCN UI"
    css: "Tailwind CSS"
    state: "Zustand"  # Simpler than Redux
    auth_storage: "localStorage"  # Not cookies
    api_client: "Generated from FastAPI OpenAPI spec"
    type_safety: "OpenAPI → TypeScript generator"
    
  backend:
    framework: "FastAPI"
    database: "DynamoDB Multi-Table Design"
    auth: "FastAPI-Users or AWS Cognito (customer's account)"
    api_style: "RESTful with OpenAPI documentation"
    response_format: "Direct JSON (not wrapped)"
    
  realtime:
    primary: "AWS IoT Core"  # Managed WebSockets in customer account
    alternative: "API Gateway WebSockets"  # For simpler needs
    
  infrastructure:
    all_services: "AWS-native in customer account"
    iac: "AWS CDK v2"
    storage: "S3 in customer account"
    compute: "Lambda or ECS Fargate"
    
  integration:
    auth_flow: "Email/password + Google OAuth only"
    api_prefix: "/api/v1"
    error_format: "{ error: { message, code, details } }"
    date_format: "ISO 8601"
    trailing_slashes: "Forbidden"
```

## Pre-Built Component Architecture

### Component Library Structure

```
@appfactory/ui-kit/
├── auth/
│   ├── LoginForm.tsx              # Email + OAuth, no variations
│   ├── RegisterForm.tsx           # With workspace creation
│   ├── PasswordReset.tsx          # Standard flow
│   ├── AuthProvider.tsx           # Token management
│   └── contracts.ts               # TypeScript interfaces
│
├── messaging/
│   ├── MessageInput.tsx           # Formatting toolbar included
│   ├── MessageList.tsx            # Virtual scrolling, reactions
│   ├── ThreadView.tsx             # Nested conversations
│   ├── ReactionPicker.tsx         # Standard emoji set
│   └── contracts.ts               # Message interfaces
│
├── workspace/
│   ├── ChannelList.tsx            # With unread counts
│   ├── ChannelCreator.tsx         # Public/private only
│   ├── UserList.tsx               # With presence
│   ├── UserProfilePopover.tsx     # Standard fields
│   ├── WorkspaceSwitcher.tsx      # Multi-workspace
│   └── contracts.ts               # Workspace interfaces
│
├── search/
│   ├── GlobalSearch.tsx           # Cmd+K interface
│   ├── SearchResults.tsx          # Tabbed by type
│   └── contracts.ts               # Search interfaces
│
└── common/
    ├── ErrorBoundary.tsx          # Consistent error UI
    ├── LoadingStates.tsx          # Skeleton screens
    ├── NotificationToast.tsx      # Success/error messages
    └── FileUpload.tsx             # S3 pre-signed URLs
```

### Backend Module Structure

```
@appfactory/fastapi-modules/
├── auth/
│   ├── __init__.py
│   ├── router.py                  # /auth/* endpoints
│   ├── models.py                  # User, Token schemas
│   ├── service.py                 # Business logic
│   ├── dependencies.py            # get_current_user
│   └── config.py                  # JWT settings
│
├── messaging/
│   ├── __init__.py
│   ├── router.py                  # /messages/* endpoints
│   ├── models.py                  # Message, Reaction schemas
│   ├── service.py                 # Send, edit, delete logic
│   └── validators.py              # Content validation
│
├── workspace/
│   ├── __init__.py
│   ├── router.py                  # /workspaces/*, /channels/*
│   ├── models.py                  # Workspace, Channel schemas
│   ├── service.py                 # Creation, membership
│   └── permissions.py             # Access control
│
└── common/
    ├── database.py                # DynamoDB multi-table setup
    ├── middleware.py              # CORS, error handling
    ├── exceptions.py              # Standard exceptions
    └── responses.py               # Consistent formatting
```

## Integration Contracts

### Component Contract Definition

```typescript
interface ComponentContract {
  component: {
    name: string;
    version: string;
    props: Record<string, PropType>;
    events: EventDefinition[];
    dependencies: string[];
  };
  
  api: {
    endpoints: EndpointDefinition[];
    websockets?: WebSocketDefinition[];
    expectedResponses: ResponseFormat[];
    errorHandling: ErrorFormat;
  };
  
  state: {
    localStorage?: string[];
    sessionStorage?: string[];
    globalState?: StateDefinition[];
  };
  
  behavior: {
    onSuccess: string;  // e.g., "redirect to /workspace"
    onError: string;    // e.g., "show toast notification"
    validation: ValidationRule[];
  };
}
```

### Example: Login Component Contract

```yaml
LoginForm:
  component:
    name: "@appfactory/ui-kit/auth/LoginForm"
    version: "1.0.0"
    props:
      onSuccess: "() => void"
      redirectTo: "string (optional)"
    events:
      - "login.start"
      - "login.success"
      - "login.error"
      
  api:
    endpoints:
      - method: "POST"
        path: "/api/v1/auth/login"
        body:
          email: "string"
          password: "string"
        response:
          success:
            access_token: "string"
            refresh_token: "string"
            user: "User"
          error:
            detail: "string"
            
  state:
    localStorage:
      - "auth_token"
      - "refresh_token"
      - "current_user"
      
  behavior:
    onSuccess: "Store tokens, redirect to redirectTo || '/workspace'"
    onError: "Show error toast with message"
    validation:
      - field: "email"
        rules: ["required", "email"]
      - field: "password"
        rules: ["required", "min:8"]
```

## How LLMs Use This System

### Generation Prompt Template

```
Generate a [APP_TYPE] application using AppFactory components:

MUST USE these pre-built components:
- Authentication: @appfactory/ui-kit/auth/LoginForm
- Messaging: @appfactory/ui-kit/messaging/MessageInput
- Search: @appfactory/ui-kit/search/GlobalSearch

MUST USE these backend modules:
- Auth: @appfactory/fastapi-modules/auth
- Messaging: @appfactory/fastapi-modules/messaging

ONLY GENERATE custom features for:
- [CUSTOM_FEATURE_1]
- [CUSTOM_FEATURE_2]

All integration is pre-handled by the components.
```

### LLM Assembly Process

1. **Import Pre-Built Components**
   ```typescript
   import { LoginForm, AuthProvider } from '@appfactory/ui-kit/auth';
   import { MessageInput, MessageList } from '@appfactory/ui-kit/messaging';
   ```

2. **Import Backend Modules**
   ```python
   from appfactory.auth import router as auth_router
   from appfactory.messaging import router as messaging_router
   ```

3. **Wire Together**
   ```typescript
   // LLM only needs to create the page structure
   export default function App() {
     return (
       <AuthProvider>
         <WorkspaceLayout>
           <ChannelList />
           <MessageList />
           <MessageInput />
         </WorkspaceLayout>
       </AuthProvider>
     );
   }
   ```

## Stack Optimization for AI Generation

### Current Stack Analysis

| Component | Current Choice | AI Generation Score | Notes |
|-----------|---------------|-------------------|-------|
| Frontend Framework | Next.js App Router | 9/10 | Excellent for AI generation |
| UI Library | ShadCN | 10/10 | Component-based, predictable |
| CSS | Tailwind | 9/10 | Utility-first works well |
| State Management | Zustand | 9/10 | Simple, less boilerplate |
| Type Safety | OpenAPI → TypeScript | 9/10 | Auto-generated types |
| Backend Framework | FastAPI | 9/10 | Clear patterns, auto-docs |
| Database | DynamoDB Multi-Table | 8/10 | AWS-native, scalable |
| Auth | FastAPI-Users/Cognito | 8/10 | Pre-built, in your account |
| Real-time | AWS IoT Core | 8/10 | Managed, in your account |

### Why This Stack Works for AI Generation

1. **DynamoDB Multi-Table Design**
   - Each entity gets its own table (Users, Workspaces, Messages)
   - Clearer mental model for AI - table name = entity type
   - No complex single-table patterns to generate
   - Native to AWS ecosystem

2. **OpenAPI → TypeScript Generation**
   - FastAPI automatically generates OpenAPI spec
   - Use openapi-typescript-codegen for frontend types
   - No manual contract maintenance
   - Type safety without framework lock-in

3. **AWS-Native Services**
   - Everything runs in customer's AWS account
   - No external dependencies
   - Consistent authentication/authorization model
   - Pay-per-use pricing model

4. **Pre-Built Auth Modules**
   - FastAPI-Users for self-hosted auth
   - AWS Cognito for managed auth
   - Both options keep data in customer's account

## DynamoDB Multi-Table Patterns for AI Generation

### Table Design Principles

```python
# Each entity gets its own table - clear and predictable
TABLES = {
    "Users": {
        "PK": "USER#{user_id}",
        "SK": "PROFILE",
        "GSI1PK": "EMAIL#{email}",  # For login lookup
        "GSI1SK": "USER"
    },
    "Workspaces": {
        "PK": "WORKSPACE#{workspace_id}",
        "SK": "METADATA",
        "GSI1PK": "USER#{owner_id}",  # Find workspaces by owner
        "GSI1SK": "WORKSPACE#{created_at}"
    },
    "Messages": {
        "PK": "CHANNEL#{channel_id}",
        "SK": "MESSAGE#{timestamp}#{message_id}",
        "GSI1PK": "USER#{user_id}",  # Find messages by user
        "GSI1SK": "MESSAGE#{timestamp}"
    }
}
```

### Why Multi-Table Works Better for AI

1. **Direct Mapping**: Table name = Entity name
2. **Simple Queries**: No complex SK patterns to remember
3. **Clear Access Patterns**: Each table has obvious indexes
4. **Easier Testing**: Can test each table independently

### Pre-Built DynamoDB Base Service

```python
# @appfactory/fastapi-modules/common/dynamodb_service.py
class DynamoDBService:
    """Base service all entities inherit from"""
    
    def __init__(self, table_name: str):
        self.table = boto3.resource('dynamodb').Table(table_name)
    
    async def get_by_id(self, entity_id: str) -> dict:
        """Standard get by ID - works for any entity"""
        response = self.table.get_item(
            Key={
                'PK': f'{self.entity_prefix}#{entity_id}',
                'SK': self.metadata_sk
            }
        )
        return response.get('Item')
    
    async def create(self, data: dict) -> dict:
        """Standard create with auto-ID and timestamps"""
        item = {
            'PK': f'{self.entity_prefix}#{data["id"]}',
            'SK': self.metadata_sk,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat(),
            **data
        }
        self.table.put_item(Item=item)
        return item
```

## Implementation Examples

### Pre-Built Login Component

```typescript
// @appfactory/ui-kit/auth/LoginForm.tsx
import { useState } from 'react';
import { Button, Input, Form } from '@/components/ui';
import { apiClient } from '@/lib/api-client';

// ALL DECISIONS MADE - NO CUSTOMIZATION
export const LoginForm = ({ 
  onSuccess = () => window.location.href = '/workspace' 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (data: LoginData) => {
    setIsLoading(true);
    try {
      // ALWAYS uses this endpoint, format, and flow
      const response = await apiClient.post('/api/v1/auth/login', {
        email: data.email,
        password: data.password
      });
      
      // ALWAYS stores tokens this way
      localStorage.setItem('auth_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('current_user', JSON.stringify(response.user));
      
      // ALWAYS redirects on success
      onSuccess();
    } catch (error) {
      // ALWAYS shows errors this way
      toast.error(error.detail || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      {/* ALWAYS these fields, this order, these validations */}
      <Input name="email" type="email" required />
      <Input name="password" type="password" required minLength={8} />
      <Button type="submit" loading={isLoading}>
        Sign In
      </Button>
      <Button variant="outline" onClick={handleGoogleLogin}>
        Continue with Google
      </Button>
    </Form>
  );
};
```

### Pre-Built Backend Module

```python
# @appfactory/fastapi-modules/auth/router.py
from fastapi import APIRouter, Depends, HTTPException
from .models import LoginRequest, TokenResponse
from .service import AuthService
from .config import JWT_EXPIRY, REFRESH_EXPIRY

router = APIRouter()

# ALL DECISIONS MADE - NO CUSTOMIZATION
@router.post("/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    auth_service: AuthService = Depends()
) -> TokenResponse:
    """
    ALWAYS:
    - Validates email/password
    - Returns JWT + refresh token
    - Token expires in 7 days
    - Refresh expires in 30 days
    - Includes user object in response
    """
    user = await auth_service.authenticate(
        email=request.email,
        password=request.password
    )
    
    if not user:
        # ALWAYS this error format
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # ALWAYS these tokens
    access_token = auth_service.create_token(
        user_id=user.id,
        expiry=JWT_EXPIRY
    )
    refresh_token = auth_service.create_token(
        user_id=user.id,
        expiry=REFRESH_EXPIRY,
        token_type="refresh"
    )
    
    # ALWAYS this response format
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user
    )
```

## Type Safety Through OpenAPI Generation

### How It Works

```bash
# 1. FastAPI automatically generates OpenAPI spec
GET http://localhost:8000/openapi.json

# 2. Generate TypeScript types from OpenAPI
npx openapi-typescript http://localhost:8000/openapi.json \
  --output ./lib/api-types.ts

# 3. Use generated types in frontend
import type { User, Message, LoginRequest } from '@/lib/api-types';
```

### Benefits Over tRPC

1. **Language Agnostic**: Works with Python backend
2. **Standards-Based**: OpenAPI is industry standard
3. **Tool Ecosystem**: Many generators available
4. **No Lock-In**: Can switch frontend frameworks

### Pre-Built Type Generation Script

```json
// package.json
{
  "scripts": {
    "generate-types": "openapi-typescript http://localhost:8000/openapi.json --output ./lib/api-types.ts",
    "dev": "npm run generate-types && next dev"
  }
}
```

## The "LLM as Assembler" Paradigm

### Traditional Approach (LLM as Creator)
```
Requirements → LLM → Generated Code (variable quality)
```

### New Approach (LLM as Assembler)
```
Requirements → LLM → Assembly Instructions → Pre-built Components → Consistent App
```

### Benefits

1. **Quality**: Pre-built = pre-tested = production-ready
2. **Speed**: 80% less code to generate
3. **Consistency**: Every app uses same patterns
4. **Maintainability**: Update component = update all apps
5. **Determinism**: Same input = same output

## Implementation Roadmap

### Phase 1: Core Components (Months 1-2)
- [ ] Authentication suite (login, register, reset, OAuth)
- [ ] Basic CRUD operations (list, create, edit, delete)
- [ ] Search and filtering
- [ ] File upload with S3

### Phase 2: Domain Components (Months 3-4)
- [ ] Messaging (chat, comments, notifications)
- [ ] User management (profiles, settings, teams)
- [ ] Admin dashboards (analytics, user management)
- [ ] Billing integration (Stripe)

### Phase 3: Advanced Features (Months 5-6)
- [ ] Real-time collaboration (presence, live updates)
- [ ] Advanced search (Elasticsearch integration)
- [ ] Workflow automation (state machines)
- [ ] Multi-tenancy patterns

## Success Metrics

1. **Generation Speed**: <5 minutes for complete app
2. **Integration Success**: 100% of pre-built components work together
3. **Code Quality**: 0 linting errors, 100% type safety
4. **Customization Time**: <1 hour to add custom features
5. **Maintenance**: Update all apps by updating components

## Conclusion

By embracing radical opinionation and pre-building common patterns, we transform AI code generation from an unpredictable creative process into a reliable assembly process. The LLM becomes a sophisticated assembler, combining pre-tested, pre-integrated components to create consistent, high-quality applications.

The key insight: **The best code is the code you don't have to generate.**