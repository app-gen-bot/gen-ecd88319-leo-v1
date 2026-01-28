# Leonardo App Factory Pipeline - Complete Documentation

**Generated**: 2025-10-11
**Last Updated**: 2025-10-11
**Version**: v2.1.1 (Post AppShellGenerator Fixes)

---

## 🔄 Regeneration Prompt

To regenerate this document when the pipeline changes, use this prompt:

```
I need you to create a comprehensive pipeline document (Pipeline_Oct11_Claude.md in docs/) that details our entire Leonardo App Factory pipeline. For each stage and agent, document:

1. What it consumes (input files/artifacts)
2. What it produces (output files/artifacts)
3. The order of execution
4. Whether it's critical or can be skipped
5. Writer-Critic pattern details (if applicable)

Make it accurate based on the actual code in:
- src/app_factory_leonardo_replit/main.py (main pipeline)
- src/app_factory_leonardo_replit/run.py (entry point)
- src/app_factory_leonardo_replit/stages/build_stage.py (build stage agents)
- Individual agent directories under src/app_factory_leonardo_replit/agents/

Include this regeneration prompt at the top so the document can be updated when things change.
```

---

## 📋 Table of Contents

1. [Pipeline Overview](#pipeline-overview)
2. [Entry Point](#entry-point)
3. [Stage 1: Plan Stage](#stage-1-plan-stage)
4. [Stage 2: Build Stage](#stage-2-build-stage)
   - [2.1 Template Extraction](#21-template-extraction)
   - [2.2 Technical Architecture Spec](#22-technical-architecture-spec)
   - [2.3 Backend Spec Generation](#23-backend-spec-generation)
   - [2.4 Schema Generator](#24-schema-generator)
   - [2.5 Storage Generator](#25-storage-generator)
   - [2.6 Routes Generator](#26-routes-generator)
   - [2.7 API Client Generator](#27-api-client-generator)
   - [2.8 App Shell Generator](#28-app-shell-generator)
   - [2.9 Frontend Interaction Spec Master](#29-frontend-interaction-spec-master)
   - [2.10 Frontend Interaction Spec Pages](#210-frontend-interaction-spec-pages)
   - [2.11 Layout Generator](#211-layout-generator)
   - [2.12 Page Generator Orchestrator](#212-page-generator-orchestrator)
   - [2.13 Frontend Implementation](#213-frontend-implementation)
5. [Stage 3: Validator Stage](#stage-3-validator-stage)
6. [Deprecated/Skipped Stages](#deprecatedskipped-stages)
7. [Writer-Critic Pattern](#writer-critic-pattern)
8. [Skip Logic](#skip-logic)
9. [Pipeline Execution Flow](#pipeline-execution-flow)

---

## Pipeline Overview

The Leonardo App Factory transforms a user prompt into a fully functional full-stack web application through a multi-stage pipeline. The pipeline follows a "stateless" design where each stage auto-detects existing work and skips if artifacts already exist.

**Core Principles**:
- **Stateless**: Each stage checks for existing artifacts and skips if present
- **Never Broken**: Pipeline stops on first critical failure
- **Writer-Critic**: Code generation uses iterative refinement loops
- **Modular**: Each agent is independent and reusable

**Tech Stack Generated**:
- **Frontend**: React 18 + TypeScript + Vite + Wouter + TanStack Query + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript + RESTful API
- **Database**: PostgreSQL + Drizzle ORM
- **API Layer**: ts-rest contracts with type-safe client

---

## Entry Point

### `run.py` → `main.py::run_pipeline()`

**Command**:
```bash
uv run python src/app_factory_leonardo_replit/run.py "Create a wedding chapel booking platform"
```

**Parameters**:
- `prompt`: User's app description
- `--workspace-name`: Workspace directory name (default: `timeless-weddings`)
- `--frontend-port`: Frontend dev server port (default: 5173)
- `--backend-port`: Backend dev server port (default: 8000)
- `--phase`: Which phase to build (default: 1)
- `--max-entities-phase1`: Max entities per phase (default: 5)
- `--clean`: Clean workspace before generation
- `--clean-contracts`: Clean only contracts and API client
- `--clean-specs`: Clean only FIS specifications
- `--clean-pages`: Clean only generated frontend pages

**Workspace Structure Created**:
```
apps/{workspace-name}/
├── logs/                      # Pipeline execution logs
├── plan/                      # Business planning documents
├── specs/                     # Backend specifications
├── design-system/             # Design tokens and configs (deprecated)
└── app/                       # Generated application
    ├── client/                # React frontend
    ├── server/                # Express backend
    └── shared/                # Shared types/contracts
```

---

## Stage 1: Plan Stage

**File**: `stages/plan_stage.py`
**Agent**: `PlanOrchestratorAgent`
**Status**: ✅ **CRITICAL** (pipeline stops if fails)

### Purpose
Transforms user prompt into a comprehensive business plan with phased implementation strategy.

### Consumes
- **User Prompt**: Natural language app description
- **Phase Number**: Which phase to generate (1 generates all phases)
- **Max Entities**: Maximum entities per phase

### Produces
```
plan/
├── plan.md                    # Full business plan with all phases
├── _phases/                   # Hidden directory with phase breakdown
│   ├── plan-phase1.md        # Phase 1: Core entities
│   ├── plan-phase2.md        # Phase 2: Additional features
│   └── plan-phase3.md        # Phase 3: Advanced features
└── _research/                 # Optional: Research artifacts (if enabled)
```

### Output Format

**`plan.md`** contains:
- **Application Overview**: Name, purpose, target audience
- **Core Entities**: Database schema entities with relationships
- **Features**: User stories and functionality
- **Technical Stack**: Frontend, backend, database choices
- **Phased Implementation**: Breakdown by phase with entity limits

### Skip Logic
✅ Skips if `plan/plan.md` exists

### Execution Time
~$0.10-0.15 per run (~30-45 seconds)

---

## Stage 2: Build Stage

**File**: `stages/build_stage.py`
**Status**: ✅ **CRITICAL** (contains all code generation)

The Build Stage is the heart of the pipeline. It orchestrates multiple Writer-Critic loops to generate all code artifacts. Each sub-stage has its own skip logic.

---

### 2.1 Template Extraction

**Function**: `extract_template()`
**Status**: ✅ **CRITICAL**

#### Purpose
Extracts the pre-built Vite-Express template to create the app structure.

#### Consumes
- **Template Archive**: `~/.mcp-tools/templates/vite-express-template-v2.1.1-2025.tar.gz`

#### Produces
```
app/
├── client/                    # Vite React frontend (skeleton)
│   ├── src/
│   │   ├── components/       # shadcn/ui components
│   │   ├── hooks/            # React hooks
│   │   ├── lib/              # Utilities
│   │   ├── pages/            # Page components (empty initially)
│   │   ├── index.css         # Tailwind styles
│   │   └── main.tsx          # React entry point
│   ├── vite.config.ts
│   └── package.json
├── server/                    # Express backend (skeleton)
│   ├── index.ts              # Server entry point
│   └── package.json
├── shared/                    # Shared directory (empty initially)
├── package.json               # Root package.json
└── tsconfig.json              # TypeScript config
```

#### Skip Logic
✅ Skips if `app/client/` and `app/server/` exist

#### Special Operations
- Applies domain-specific colors if `design-system/domain-colors.json` exists
- Sets up TypeScript path aliases for imports
- Configures Vite resolve aliases

---

### 2.2 Technical Architecture Spec

**File**: `stages/technical_architecture_spec_stage.py`
**Agent**: `TechnicalArchitectureSpecAgent`
**Status**: ✅ **CRITICAL**

#### Purpose
Generates a comprehensive technical specification with all pages, routes, and component hierarchy.

#### Consumes
- **Plan**: `app/specs/plan.md`
- **UI Spec** (optional): `plan/ui-component-spec.md` (if exists)
- **Preview** (optional): `app/specs/App.tsx` (if exists)

#### Produces
```
app/specs/
└── pages-and-routes.md        # Complete technical architecture
```

#### Output Format

**`pages-and-routes.md`** contains:
- **Application Structure**: Overview and architecture
- **Pages List**: All page components with routes and purposes
- **Component Hierarchy**: Shared components and layouts
- **Navigation Map**: Site navigation structure
- **State Management**: Global state and auth patterns
- **API Integration**: Contract usage patterns

**Example**:
```markdown
## Pages

- **HomePage**: Landing page with hero section and CTA (Route: `/`)
- **ChapelsPage**: Browse all wedding chapels (Route: `/chapels`)
- **ChapelDetailPage**: View chapel details (Route: `/chapels/:id`)
- **LoginPage**: User authentication (Route: `/login`)
- **SignupPage**: User registration (Route: `/signup`)
...
```

#### Skip Logic
✅ Skips if `app/specs/pages-and-routes.md` exists

#### Execution Time
~$0.05-0.08 per run (~20-30 seconds)

---

### 2.3 Backend Spec Generation

**File**: `stages/backend_spec_stage.py`
**Agents**:
- `SchemaDesignerAgent` (generates Zod schemas)
- `ContractsDesignerAgent` (generates ts-rest contracts)

**Status**: ✅ **CRITICAL**

#### Purpose
Generates Zod validation schemas and ts-rest API contracts from the business plan.

#### Consumes
- **Plan**: `app/specs/plan.md`

#### Produces
```
app/shared/
├── schema.zod.ts              # Zod validation schemas
└── contracts/                 # ts-rest API contracts
    ├── auth.contract.ts
    ├── users.contract.ts
    ├── {entity}.contract.ts   # One per entity
    ├── index.ts               # Contract exports
    └── *.contract.meta.json   # Metadata for API Registry
```

#### Output Format

**`schema.zod.ts`** example:
```typescript
import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['couple', 'chapel_owner', 'admin']),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type User = z.infer<typeof userSchema>;
```

**`contracts/users.contract.ts`** example:
```typescript
import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { userSchema } from '../schema.zod';

const c = initContract();

export const usersContract = c.router({
  getUsers: {
    method: 'GET',
    path: '/api/users',
    responses: {
      200: z.array(userSchema)
    }
  },
  getUser: {
    method: 'GET',
    path: '/api/users/:id',
    responses: {
      200: userSchema,
      404: z.object({ error: z.string() })
    }
  }
});
```

**`.contract.meta.json`** example:
```json
{
  "entity": "users",
  "apiNamespace": "apiClient.users",
  "methods": [
    {
      "name": "getUsers",
      "httpMethod": "GET",
      "path": "/api/users",
      "description": "Get all users",
      "authRequired": true,
      "signature": "getUsers(): Promise<User[]>"
    }
  ]
}
```

#### Skip Logic
✅ Skips if both `app/shared/schema.zod.ts` AND `app/shared/contracts/` exist

#### Execution Time
~$0.10-0.15 per run (~40-60 seconds)

---

### 2.4 Schema Generator

**Agent**: `SchemaGeneratorAgent` + `SchemaGeneratorCritic`
**Pattern**: ⚙️ **Writer-Critic Loop** (max 40 iterations)
**Status**: ✅ **CRITICAL**

#### Purpose
Converts Zod schemas to Drizzle ORM schema with PostgreSQL-specific types.

#### Consumes
- **Zod Schema**: `app/shared/schema.zod.ts` (source of truth)
- **Plan**: `app/specs/plan.md` (for context)

#### Produces
```
app/shared/
└── schema.ts                  # Drizzle ORM schema
```

#### Output Format

**`schema.ts`** example:
```typescript
import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['couple', 'chapel_owner', 'admin']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: roleEnum('role').default('couple').notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
```

#### Writer-Critic Loop
1. **Writer** reads Zod schema and generates Drizzle schema
2. **Writer** validates with `oxc` (linting)
3. **Critic** validates:
   - All Zod entities converted to Drizzle tables
   - Correct PostgreSQL types
   - Proper relationships (foreign keys)
   - Type exports present
4. **Loop** continues until Critic approves or max iterations reached

#### Skip Logic
✅ Skips if `app/shared/schema.ts` exists

#### Execution Time
~$0.05-0.10 per iteration (~1-3 iterations typical)

---

### 2.5 Storage Generator

**Agent**: `StorageGeneratorAgent` + `StorageGeneratorCritic`
**Pattern**: ⚙️ **Writer-Critic Loop** (max 40 iterations)
**Status**: ✅ **CRITICAL**

#### Purpose
Generates storage layer with IStorage interface pattern (MemStorage + PostgresStorage).

#### Consumes
- **Drizzle Schema**: `app/shared/schema.ts`
- **Plan**: `app/specs/plan.md`

#### Produces
```
app/server/
└── storage.ts                 # Storage layer implementation
```

#### Output Format

**`storage.ts`** structure:
```typescript
import { db } from './db';
import * as schema from '../shared/schema';

// Interface for storage operations
export interface IStorage {
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  createUser(data: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // ... other entities
}

// In-memory storage for development
export class MemStorage implements IStorage {
  private users: User[] = [];

  async getUsers(): Promise<User[]> {
    return this.users;
  }
  // ... other methods
}

// PostgreSQL storage for production
export class PostgresStorage implements IStorage {
  async getUsers(): Promise<User[]> {
    return await db.select().from(schema.users);
  }
  // ... other methods
}

// Export singleton
const storage: IStorage = process.env.NODE_ENV === 'production'
  ? new PostgresStorage()
  : new MemStorage();

export default storage;
```

#### Writer-Critic Loop
1. **Writer** generates CRUD operations for all entities
2. **Writer** validates with `oxc`
3. **Critic** validates:
   - IStorage interface complete
   - Both MemStorage and PostgresStorage implement interface
   - All entity CRUD operations present
   - Proper error handling
4. **Loop** continues until approved

#### Skip Logic
✅ Skips if `app/server/storage.ts` exists

#### Execution Time
~$0.05-0.10 per iteration (~1-3 iterations typical)

---

### 2.6 Routes Generator

**Agent**: `RoutesGeneratorAgent` + `RoutesGeneratorCritic`
**Pattern**: ⚙️ **Writer-Critic Loop** (max 40 iterations)
**Status**: ✅ **CRITICAL**

#### Purpose
Generates Express routes that implement all ts-rest contracts.

#### Consumes
- **Drizzle Schema**: `app/shared/schema.ts`
- **Storage Layer**: `app/server/storage.ts`
- **Contracts**: `app/shared/contracts/*.contract.ts`
- **Plan**: `app/specs/plan.md`

#### Produces
```
app/server/
└── routes.ts                  # Express route handlers
```

#### Output Format

**`routes.ts`** structure:
```typescript
import express from 'express';
import { initServer } from '@ts-rest/express';
import storage from './storage';
import { usersContract } from '../shared/contracts/users.contract';

const s = initServer();

export const usersRouter = s.router(usersContract, {
  getUsers: async () => {
    try {
      const users = await storage.getUsers();
      return {
        status: 200,
        body: users
      };
    } catch (error) {
      return {
        status: 500,
        body: { error: 'Failed to fetch users' }
      };
    }
  },

  getUser: async ({ params: { id } }) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return {
          status: 404,
          body: { error: 'User not found' }
        };
      }
      return {
        status: 200,
        body: user
      };
    } catch (error) {
      return {
        status: 500,
        body: { error: 'Failed to fetch user' }
      };
    }
  }
});

// Main router combining all entity routers
export const router = express.Router();
router.use('/users', usersRouter);
// ... other routes
```

#### Writer-Critic Loop
1. **Writer** implements all contract endpoints
2. **Writer** validates with `oxc` and `tree_sitter`
3. **Critic** validates:
   - All contracts implemented
   - Correct HTTP methods and paths
   - Proper error handling
   - Storage operations called correctly
   - Authentication/authorization present
4. **Loop** continues until approved

#### Skip Logic
✅ Skips if `app/server/routes.ts` exists

#### Execution Time
~$0.10-0.15 per iteration (~2-4 iterations typical)

---

### 2.7 API Client Generator

**Agent**: `TsRestApiClientGeneratorAgent` + `TsRestApiClientGeneratorCritic`
**Pattern**: ⚙️ **Writer-Critic Loop** (max 40 iterations)
**Status**: ✅ **CRITICAL**

#### Purpose
Generates type-safe ts-rest API client with authentication support.

#### Consumes
- **Contracts**: `app/shared/contracts/*.contract.ts`
- **Contract Metadata**: `app/shared/contracts/*.contract.meta.json`
- **Plan**: `app/specs/plan.md`

#### Produces
```
app/client/src/lib/
├── api-client.ts              # Type-safe API client with auth
└── api-registry.md            # API method registry (generated from metadata)
```

#### Output Format

**`api-client.ts`** example:
```typescript
import { initClient } from '@ts-rest/core';
import { authContract } from '@shared/contracts/auth.contract.ts';
import { blockedDatesContract } from '@shared/contracts/blocked-dates.contract.ts';
import { bookingsContract } from '@shared/contracts/bookings.contract.ts';
import { chapelAvailabilityContract } from '@shared/contracts/chapel-availability.contract.ts';
import { chapelImagesContract } from '@shared/contracts/chapel-images.contract.ts';
import { chapelsContract } from '@shared/contracts/chapels.contract.ts';
import { recurringAvailabilityContract } from '@shared/contracts/recurring-availability.contract.ts';
import { usersContract } from '@shared/contracts/users.contract.ts';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

// Combine all contracts into a single router
const contractsRouter = {
  auth: authContract,
  blockedDates: blockedDatesContract,  // ✅ camelCase (fixed)
  bookings: bookingsContract,
  chapelAvailability: chapelAvailabilityContract,  // ✅ camelCase
  chapelImages: chapelImagesContract,  // ✅ camelCase
  chapels: chapelsContract,
  recurringAvailability: recurringAvailabilityContract,  // ✅ camelCase
  users: usersContract
};

// Initialize the ts-rest client with all contracts
export const apiClient = initClient(contractsRouter, {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  baseHeaders: () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }
});

// Type exports
export type ApiClient = typeof apiClient;
export type ContractsRouter = typeof contractsRouter;

// Auth helpers
export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export default apiClient;
```

**Key Fix Applied**: Contract names are converted to camelCase (e.g., `blocked-dates` → `blockedDates`) to create valid JavaScript identifiers.

**`api-registry.md`** example (27KB for timeless-weddings):
```markdown
# API Registry

**Generated**: 2025-10-11T15:30:00
**Purpose**: Authoritative list of all API methods available in apiClient

## chapels

**Namespace**: `apiClient.chapels`
**Methods**: 5

| Method | HTTP | Path | Description | Auth |
|--------|------|------|-------------|------|
| `getChapels` | GET | `/api/chapels` | Get all chapels | |
| `getChapel` | GET | `/api/chapels/:id` | Get single chapel | |
| `createChapel` | POST | `/api/chapels` | Create chapel | 🔒 chapel_owner |
| `updateChapel` | PUT | `/api/chapels/:id` | Update chapel | 🔒 chapel_owner |
| `deleteChapel` | DELETE | `/api/chapels/:id` | Delete chapel | 🔒 admin |

### Method Details

#### `apiClient.chapels.getChapels()`
**Signature**: `getChapels(query?: { page?: number }): Promise<Chapel[]>`
**HTTP**: `GET /api/chapels`
**Returns**: `Chapel[]`
**Description**: Retrieve all wedding chapels with pagination
```

#### Writer-Critic Loop
1. **Writer** generates API client from contracts
2. **Writer** compiles API Registry from metadata
3. **Writer** validates with `oxc`
4. **Critic** validates:
   - All contracts imported with camelCase names
   - Router object correct
   - Auth helpers present
   - API Registry complete
5. **Loop** continues until approved

#### Skip Logic
✅ Skips if `app/client/src/lib/api-client.ts` exists

#### Execution Time
~$0.05-0.08 per iteration (~1-2 iterations typical)

---

### 2.8 App Shell Generator

**Agent**: `AppShellGeneratorAgent` + `AppShellGeneratorCritic`
**Pattern**: ⚙️ **Writer-Critic Loop** (max 40 iterations)
**Status**: ✅ **CRITICAL** (Fixed October 11, 2025)

#### Purpose
Generates the main App.tsx with routing for all pages using Wouter.

#### Consumes
- **Technical Spec**: `app/specs/pages-and-routes.md` ← **Fixed**: Was reading wrong file
- **Plan**: `app/specs/plan.md`
- **Schema**: `app/shared/schema.ts`

#### Produces
```
app/client/src/
└── App.tsx                    # Main app shell with routing
```

#### Output Format

**`App.tsx`** example (268 lines):
```typescript
import React from 'react';
import { Switch, Route, Redirect } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { queryClient } from './lib/queryClient';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Page imports
import { HomePage } from './pages/HomePage';
import { ChapelsPage } from './pages/ChapelsPage';
import { LoginPage } from './pages/LoginPage';
// ... 15+ more pages

// Protected Route Component
function ProtectedRoute({ component: Component, requiredRole }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Redirect to="/login" />;
  if (requiredRole && user?.role !== requiredRole) return <Redirect to="/404" />;

  return <Component />;
}

// App Routes
function AppRoutes() {
  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <Switch>
        {/* Public Routes */}
        <Route path="/" component={HomePage} />
        <Route path="/chapels" component={ChapelsPage} />
        <Route path="/chapels/:id">
          {(params) => <ChapelDetailPage chapelId={params.id} />}
        </Route>

        {/* Auth Routes */}
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />

        {/* Protected Routes - Couple Role */}
        <Route path="/dashboard">
          {() => <ProtectedRoute component={CoupleDashboardPage} requiredRole="couple" />}
        </Route>

        {/* Protected Routes - Owner Role */}
        <Route path="/owner/dashboard">
          {() => <ProtectedRoute component={OwnerDashboardPage} requiredRole="chapel_owner" />}
        </Route>

        {/* 404 */}
        <Route component={NotFoundPage} />
      </Switch>
      <Toaster />
    </div>
  );
}

// Error Boundary
class ErrorBoundary extends React.Component {
  // ... error boundary implementation
}

// Main App Component
export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <AppRoutes />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
```

#### Critical Fixes Applied (October 11, 2025)

**Fix #1: Correct File Name**
- ❌ OLD: User prompt referenced `specs/technical-architecture-spec.md`
- ✅ NEW: User prompt references `specs/pages-and-routes.md`

**Fix #2: File Verification**
- ✅ NEW: Wrapper verifies `client/src/App.tsx` exists after agent completes
- Catches known bug where agent claims success without creating file

**Fix #3: Added to Pipeline**
- ✅ NEW: AppShellGenerator added to agent_pairs (position #5)
- Previously: Agent was imported but never executed!

#### Writer-Critic Loop
1. **Writer** reads pages-and-routes.md and generates App.tsx
2. **Writer** uses Write tool to create file
3. **Wrapper** verifies file exists (catches known bug)
4. **Writer** validates with `oxc`
5. **Critic** validates:
   - Uses Wouter (not React Router)
   - All pages from tech spec imported
   - All routes created
   - Providers present (QueryClient, AuthProvider, TooltipProvider)
   - ErrorBoundary present
   - Protected routes for authenticated pages
6. **Loop** continues until approved

#### Skip Logic
✅ Skips if `app/client/src/App.tsx` exists

#### Execution Time
~$0.05-0.10 per iteration (~1-2 iterations typical)

---

### 2.9 Frontend Interaction Spec Master

**Agent**: `FrontendInteractionSpecMasterAgent` (NO CRITIC)
**Pattern**: 🔨 **Single Generation** (no Writer-Critic loop)
**Status**: ✅ **CRITICAL**

#### Purpose
Generates master frontend specification with reusable patterns, design system, and API registry.

#### Consumes
- **Plan**: `app/specs/plan.md`
- **API Registry**: `app/client/src/lib/api-registry.md` ← **Fixed**: Now passed directly

#### Produces
```
app/specs/
└── frontend-interaction-spec-master.md    # Master FIS
```

#### Output Format

**`frontend-interaction-spec-master.md`** structure (~7K tokens):
```markdown
# Frontend Interaction Specification - Master Patterns

## Design System

### Colors
- Primary: hsl(217 91% 60%) - Blue for trust/reliability
- Accent: hsl(142 71% 45%) - Green for success
- Emotion: hsl(340 82% 52%) - Pink for romance/weddings

### Typography
- Headings: font-bold tracking-tight
- Body: text-gray-400
- CTAs: font-semibold

### Layout Patterns
- Container: max-w-7xl mx-auto px-4
- Card: rounded-xl border bg-card text-card-foreground shadow
- Spacing: gap-4 (sections), gap-2 (elements)

## Component Patterns

### Button Pattern
\`\`\`tsx
<Button variant="default" size="md" className="gradient-button">
  {text}
</Button>
\`\`\`

### Form Pattern
\`\`\`tsx
<Form {...form}>
  <FormField
    control={form.control}
    name="fieldName"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Label</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
\`\`\`

## API Integration

All API methods available (from API Registry):

### apiClient.chapels
- getChapels(): Promise<Chapel[]>
- getChapel(id: string): Promise<Chapel>
- createChapel(data): Promise<Chapel> 🔒 chapel_owner
- updateChapel(id, data): Promise<Chapel> 🔒 chapel_owner

### apiClient.bookings
- getBookings(): Promise<Booking[]>
- createBooking(data): Promise<Booking> 🔒 couple
- ...

## State Management

### TanStack Query Patterns
\`\`\`tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['chapels'],
  queryFn: () => apiClient.chapels.getChapels()
});
\`\`\`

### Mutation Patterns
\`\`\`tsx
const mutation = useMutation({
  mutationFn: (data) => apiClient.bookings.createBooking({ body: data }),
  onSuccess: () => {
    queryClient.invalidateQueries(['bookings']);
    toast({ title: 'Success!' });
  }
});
\`\`\`

## Navigation Map

- **Public**: Home (/) → Chapels (/chapels) → Chapel Detail (/chapels/:id)
- **Auth**: Login (/login) → Signup (/signup)
- **Couple**: Dashboard (/dashboard) → My Bookings (/my-bookings)
- **Owner**: Owner Dashboard (/owner/dashboard) → My Chapels (/owner/chapels)
```

#### Critical Fix Applied (October 11, 2025)

**API Registry Integration**:
- ❌ OLD: Agent parsed TypeScript with regex (fragile, 78 lines of code)
- ✅ NEW: Agent receives API Registry directly in prompt (authoritative)
- **Benefit**: No wasted agent turns, guaranteed accuracy, ~$0.05-0.10 savings per page

#### No Critic
This agent has no critic because the master spec is straightforward pattern documentation. Page specs use the master spec as guidance.

#### Skip Logic
✅ Skips if `app/specs/frontend-interaction-spec-master.md` exists

#### Execution Time
~$0.10 per run (~30-45 seconds)

---

### 2.10 Frontend Interaction Spec Pages

**Agent**: `FrontendInteractionSpecPageAgent` (NO CRITIC)
**Pattern**: 🔨 **Single Generation Per Page** (no Writer-Critic loop)
**Status**: ✅ **CRITICAL**

#### Purpose
Generates detailed interaction specification for each individual page.

#### Consumes
- **Master Spec**: `app/specs/frontend-interaction-spec-master.md`
- **API Registry**: `app/client/src/lib/api-registry.md` ← **Fixed**: Now passed directly
- **Page Info**: Page name and route from pages-and-routes.md

#### Produces
```
app/specs/pages/
├── homepage.md                # HomePage spec
├── chapelspage.md             # ChapelsPage spec
├── chapeldetailpage.md        # ChapelDetailPage spec
├── loginpage.md               # LoginPage spec
└── ... (one per page)
```

#### Output Format

**`chapeldetailpage.md`** example (~1.2K tokens):
```markdown
# ChapelDetailPage - Frontend Interaction Specification

**Route**: `/chapels/:id`
**Purpose**: Display detailed information about a specific wedding chapel

## Layout

Use AppLayout from master spec with:
- Header with site navigation
- Main content area (single column)
- Footer

## Content Structure

### Hero Section
- Chapel image gallery (slideshow)
- Chapel name (h1)
- Location (with map icon)
- Price per ceremony
- "Book Now" CTA button

### Details Tabs
- About: Description, features, amenities
- Photos: Full gallery grid
- Availability: Calendar view with available dates
- Reviews: Customer testimonials (future)

### Booking Section
- Date picker (only available dates selectable)
- Time slot selector (morning/afternoon/evening)
- Guest count input
- Special requests textarea
- Total price calculation
- "Confirm Booking" button

## Interactions

1. **On Page Load**
   - Fetch chapel details: `apiClient.chapels.getChapel({ params: { id } })`
   - Fetch availability: `apiClient.chapelAvailability.getAvailability({ query: { chapelId: id } })`

2. **On "Book Now" Click**
   - Scroll to booking section
   - Focus date picker

3. **On Date Select**
   - Filter time slots by availability
   - Show available times only

4. **On "Confirm Booking" Click**
   - Validate form
   - Call `apiClient.bookings.createBooking({ body: bookingData })` 🔒 couple
   - Show success toast
   - Navigate to dashboard

## API Calls

**ONLY use methods from API Registry**:
- `apiClient.chapels.getChapel({ params: { id } })` - Get chapel details
- `apiClient.chapelAvailability.getAvailability({ query: { chapelId } })` - Get available dates
- `apiClient.bookings.createBooking({ body: data })` - Create booking (requires auth)

## States

### Loading State
- Show skeleton loaders for chapel details
- Show shimmer effect for images

### Empty State
- "Chapel not found" message if invalid ID
- "No available dates" if chapel fully booked

### Error State
- Show error toast if API call fails
- Provide retry button

### Success State
- Show success toast "Booking created!"
- Navigate to dashboard

## Validation

- Date: Required, must be in future, must be available
- Time slot: Required
- Guest count: Required, min 1, max chapel capacity
- Special requests: Optional, max 500 characters
```

#### Critical Fix Applied (October 11, 2025)

**API Registry Integration**:
- ❌ OLD: Agent had to use Read tool to find API Registry (wasted ~10-15 turns)
- ✅ NEW: Agent receives API Registry directly in prompt
- **Impact**: Every link/button uses routes from master spec, every API call uses registry methods

#### No Critic
Page specs are guidance documents reviewed by PageGenerator's critic later.

#### Skip Logic
✅ Skips if `app/specs/pages/{pagename}.md` exists for each page

#### Execution Time
~$0.05 per page (~20-30 seconds each)

---

### 2.11 Layout Generator

**Agent**: `LayoutGeneratorAgent` + `LayoutGeneratorCritic`
**Pattern**: ⚙️ **Writer-Critic Loop** (max 40 iterations)
**Status**: ⚠️ **NON-CRITICAL** (app can work without custom layout)

#### Purpose
Generates shared layout components (AppLayout, Header, Footer, Navigation).

#### Consumes
- **Master Spec**: `app/specs/frontend-interaction-spec-master.md`
- **API Registry**: For auth state checks

#### Produces
```
app/client/src/components/layout/
├── AppLayout.tsx              # Main layout wrapper
├── Header.tsx                 # Site header with navigation
├── Footer.tsx                 # Site footer
└── Navigation.tsx             # Navigation menu
```

#### Output Format

**`AppLayout.tsx`** example:
```typescript
import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
```

**`Header.tsx`** example:
```typescript
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/">
          <a className="text-2xl font-bold gradient-text">Timeless Weddings</a>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/chapels">Browse Chapels</Link>

          {isAuthenticated ? (
            <>
              <Link href={user?.role === 'chapel_owner' ? '/owner/dashboard' : '/dashboard'}>
                Dashboard
              </Link>
              <Button onClick={logout} variant="outline">Logout</Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button variant="default">Sign Up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
```

#### Writer-Critic Loop
1. **Writer** generates layout components
2. **Writer** validates with `oxc`
3. **Critic** validates:
   - AppLayout wraps children correctly
   - Header has navigation from master spec
   - Footer has required links
   - Responsive design
   - Auth state integrated
4. **Loop** continues until approved

#### Skip Logic
✅ Skips if `app/client/src/components/layout/AppLayout.tsx` exists

#### Execution Time
~$0.05-0.08 per iteration (~1-2 iterations typical)

---

### 2.12 Page Generator Orchestrator

**Agent**: `PageGeneratorOrchestrator`
**Sub-Agent**: `PageGeneratorAgent` + `PageGeneratorCritic` per page
**Pattern**: ⚙️ **Writer-Critic Loop Per Page** (max 5 iterations per page)
**Status**: ⚠️ **NON-CRITICAL** (but essential for complete app)

#### Purpose
Orchestrates parallel generation of all page components from page specs.

#### Consumes
- **Technical Spec**: `app/specs/pages-and-routes.md` (for page list)
- **Page Specs**: `app/specs/pages/*.md` (one per page)
- **Master Spec**: `app/specs/frontend-interaction-spec-master.md` (for patterns)

#### Produces
```
app/client/src/pages/
├── HomePage.tsx
├── ChapelsPage.tsx
├── ChapelDetailPage.tsx
├── LoginPage.tsx
├── SignupPage.tsx
├── CoupleDashboardPage.tsx
├── MyBookingsPage.tsx
├── BookingDetailPage.tsx
├── OwnerDashboardPage.tsx
├── MyChapelsPage.tsx
├── CreateChapelPage.tsx
├── EditChapelPage.tsx
├── ManageAvailabilityPage.tsx
├── OwnerBookingsPage.tsx
├── NotFoundPage.tsx
└── ... (all pages from tech spec)
```

#### Output Format

**`ChapelDetailPage.tsx`** example:
```typescript
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function ChapelDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch chapel details
  const { data: chapel, isLoading, error } = useQuery({
    queryKey: ['chapel', id],
    queryFn: () => apiClient.chapels.getChapel({ params: { id } })
  });

  // Fetch availability
  const { data: availability } = useQuery({
    queryKey: ['availability', id],
    queryFn: () => apiClient.chapelAvailability.getAvailability({ query: { chapelId: id } })
  });

  // Create booking mutation
  const bookingMutation = useMutation({
    mutationFn: (data) => apiClient.bookings.createBooking({ body: data }),
    onSuccess: () => {
      toast({ title: 'Booking confirmed!' });
      queryClient.invalidateQueries(['bookings']);
    },
    onError: () => {
      toast({ title: 'Booking failed', variant: 'destructive' });
    }
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState />;
  if (!chapel) return <NotFound />;

  return (
    <AppLayout>
      <div className="container py-8">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <img
              src={chapel.mainImage}
              alt={chapel.name}
              className="w-full h-[400px] object-cover rounded-xl"
            />
          </div>

          <div>
            <h1 className="text-4xl font-bold mb-4">{chapel.name}</h1>
            <p className="text-gray-400 mb-6">{chapel.description}</p>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl font-bold text-purple-400">
                ${chapel.pricePerCeremony}
              </span>
              <span className="text-gray-500">per ceremony</span>
            </div>

            <Button
              size="lg"
              onClick={() => document.getElementById('booking')?.scrollIntoView()}
              className="gradient-button"
            >
              Book This Chapel
            </Button>
          </div>
        </div>

        {/* Booking Form */}
        <div id="booking" className="mt-12">
          <BookingForm
            chapel={chapel}
            availability={availability}
            onSubmit={(data) => bookingMutation.mutate(data)}
            isLoading={bookingMutation.isPending}
          />
        </div>
      </div>
    </AppLayout>
  );
}
```

#### Parallel Generation

The orchestrator generates pages in parallel (default: 10 concurrent):
```python
# Parallel execution
async with asyncio.TaskGroup() as tg:
    for page in pages:
        tg.create_task(generate_page(page))
```

#### Writer-Critic Loop (Per Page)
1. **Writer** reads page spec and generates page component
2. **Writer** uses TodoWrite tool to track file writing
3. **Writer** validates with `oxc`
4. **Critic** validates:
   - Imports from master spec patterns
   - API calls match registry exactly
   - Links use routes from master spec
   - TanStack Query patterns correct
   - Loading/error/empty states present
   - Forms use react-hook-form + zod
5. **Loop** continues up to 5 iterations

#### Skip Logic
✅ Skips individual pages if `app/client/src/pages/{PageName}.tsx` exists

#### Execution Time
~$0.05-0.10 per page (~30-60 seconds per page, but parallel)

---

### 2.13 Frontend Implementation

**Agent**: `FrontendImplementationAgent` + `BrowserVisualCriticAgent`
**Pattern**: ⚙️ **Writer-Critic Loop with Visual Testing** (max 40 iterations)
**Status**: ⚠️ **NON-CRITICAL** (but fixes issues missed by other agents)

#### Purpose
Final validation agent that launches the app in a browser and visually tests it.

#### Consumes
- **All FIS Specs**: Master + page specs
- **Schema**: `app/shared/schema.zod.ts`
- **Contracts**: All contract files
- **Generated App**: Entire `app/` directory

#### Produces
- **Fixes**: Edits to existing files to fix issues
- **No new files**: Only modifies existing code

#### Special Behavior

This agent is unique:
1. **Starts dev server**: `npm run dev` in background
2. **Opens browser**: Launches automated browser with MCP browser tools
3. **Visual testing**: Clicks through app, checks for errors
4. **Fixes issues**: Edits files to fix bugs found during testing

**Common Fixes**:
- Missing files (e.g., App.tsx if AppShellGenerator bug occurred)
- Import errors (named vs default exports)
- API client bugs (wrong method calls)
- Routing errors (404s)
- TypeScript errors caught at runtime

#### Writer-Critic Loop
1. **Writer** reviews all generated code
2. **Critic** launches browser and tests:
   - Home page loads
   - Navigation works
   - Forms submit
   - API calls succeed (with mock data)
   - No console errors
3. **Writer** fixes issues found
4. **Critic** re-tests
5. **Loop** continues until all tests pass

#### Skip Logic
❌ Never skips (always runs as final validation)

#### Execution Time
~$0.20-0.50 per run (~3-8 minutes with browser testing)

---

## Stage 3: Validator Stage

**File**: `stages/validator_stage.py`
**Agent**: `ValidatorAgent`
**Status**: ✅ **CRITICAL**

### Purpose
Final validation to ensure the generated app compiles and runs successfully.

### Consumes
- **Generated App**: Entire `app/` directory

### Produces
- **Validation Report**: Console output with test results
- **No files**: Only validates, doesn't modify

### Validation Checks

1. **TypeScript Compilation**
   - Runs `npm run check` (tsc)
   - Reports type errors

2. **Build Process**
   - Runs `npm run build` (Vite + esbuild)
   - Ensures production build succeeds

3. **File Existence**
   - Verifies all critical files present
   - Checks schema, routes, storage, contracts, pages

4. **Import Resolution**
   - Validates no broken imports
   - Checks shadcn/ui components available

### Output Format

```
🔍 Enhanced Multi-Page App Validation

✅ TypeScript compilation: PASSED
✅ Build process: PASSED
✅ Route files: ALL 15 pages generated
✅ Import resolution: Layout components available

🔍 Multi-Page Validation Score: 100%

🎉 MULTI-PAGE BUILD PIPELINE COMPLETED SUCCESSFULLY
```

### Skip Logic
❌ Never skips (always runs if build succeeds)

### Execution Time
~$0.00 (free) (~1-2 minutes)

---

## Deprecated/Skipped Stages

### UI Component Spec Stage ⏭️ DEPRECATED

**Reason**: Redundant with Frontend Interaction Spec

The Frontend Interaction Spec (generated in Build Stage) contains ALL information from UI Component Spec plus:
- Detailed implementation code
- Contract mappings
- API integration patterns
- Component patterns

**Savings**: ~$0.05-0.10 per run, no functionality loss

### Design System Stage ⏭️ DEPRECATED

**Reason**: Frontend Interaction Spec Master handles comprehensive design

The Master FIS includes:
- Design tokens
- Color system
- Typography
- Component patterns
- Layout guidelines

**Savings**: ~$0.05-0.08 per run, better design consistency

### Preview Stage ⏭️ REMOVED

**Reason**: Replaced by Frontend Interaction Spec for UI guidance

Previously generated HTML/React preview for user approval. Now:
- FIS Master provides design guidance
- AppShellGenerator creates structure
- PageGenerator creates pages directly

**Savings**: ~$0.10-0.15 per run, faster pipeline

---

## Writer-Critic Pattern

### Overview

The Writer-Critic pattern is used for all code generation agents to ensure quality through iterative refinement.

### Components

**Writer Agent**:
- Generates code based on inputs
- Self-tests with linting tools (oxc, tree_sitter)
- Claims success when satisfied

**Critic Agent**:
- Independently validates Writer's output
- Checks for:
  - Code completeness
  - Correctness
  - Best practices
  - Compliance with requirements
- Returns decision: `complete`, `continue`, or `fail`

### Loop Flow

```
┌─────────────────────────────────────────────────┐
│  Iteration 1                                    │
├─────────────────────────────────────────────────┤
│  1. Writer generates code                       │
│  2. Writer self-tests (oxc)                     │
│  3. Writer claims success                       │
│  4. Critic validates output                     │
│  5. Critic decision: continue                   │
│  6. Critic provides XML feedback                │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│  Iteration 2                                    │
├─────────────────────────────────────────────────┤
│  1. Writer reads previous Critic XML            │
│  2. Writer improves code                        │
│  3. Writer self-tests (oxc)                     │
│  4. Writer claims success                       │
│  5. Critic validates output                     │
│  6. Critic decision: complete ✅                │
└─────────────────────────────────────────────────┘
              ↓
         SUCCESS
```

### Max Iterations

- **Default**: 3 iterations
- **Dev Mode**: 40 iterations (set via `get_max_iterations(3)`)
- **If max reached**: Pipeline stops with failure (Never Broken principle)

### Critic XML Format

Critics return structured XML feedback:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<critic_evaluation>
  <decision>continue</decision>
  <compliance_score>75</compliance_score>
  <issues>
    <issue>Missing error handling in createUser method</issue>
    <issue>PostgresStorage.getUsers() not implemented</issue>
  </issues>
  <recommendations>
    <recommendation>Add try-catch blocks to all storage methods</recommendation>
    <recommendation>Implement PostgresStorage.getUsers() using db.select()</recommendation>
  </recommendations>
</critic_evaluation>
```

Writers receive the **raw XML** (not parsed) and must interpret it.

---

## Skip Logic

### Stage-Level Skip Logic

Each major stage (Plan, Build, Validator) has its own skip logic:

**Plan Stage**:
```python
if plan_path.exists():
    logger.info("⏭️ Plan Stage: Plan exists, skipping")
else:
    # Generate plan
```

**Build Stage**:
- Never skips at stage level
- Each agent within Build Stage has its own skip logic

**Validator Stage**:
- Never skips (always validates if build succeeds)

### Agent-Level Skip Logic

Each agent within Build Stage checks for its output file:

**Example: Schema Generator**
```python
output_file = app_dir / "shared" / "schema.ts"

if output_file.exists():
    logger.info(f"⏭️ Schema Generator: Skipping - schema.ts exists")
    continue
else:
    # Run Writer-Critic loop
```

### Skip Benefits

- **Fast Iteration**: Re-run pipeline without regenerating everything
- **Selective Cleaning**: Clean specific artifacts (contracts, specs, pages)
- **Development Speed**: Work on one agent at a time

### Force Regeneration

**Full Clean**:
```bash
uv run python run.py "prompt" --clean
```

**Selective Clean**:
```bash
# Clean contracts and API client
uv run python run.py "prompt" --clean-contracts

# Clean FIS specifications
uv run python run.py "prompt" --clean-specs

# Clean generated pages
uv run python run.py "prompt" --clean-pages
```

---

## Pipeline Execution Flow

### Full Pipeline Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                        ENTRY POINT                              │
│  run.py → main.py::run_pipeline()                              │
└────────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────────┐
│                      STAGE 1: PLAN                              │
│  PlanOrchestratorAgent                                         │
│  Input:  User prompt                                           │
│  Output: plan/plan.md, plan/_phases/plan-phase*.md            │
│  Time:   ~30-45s ($0.10-0.15)                                  │
│  Skip:   If plan.md exists                                     │
└────────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────────┐
│                    STAGE 2: BUILD                               │
│  (Multi-agent orchestration)                                   │
└────────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │  2.1 Template Extraction              │
        │  Input:  Template tarball             │
        │  Output: app/ directory structure     │
        │  Time:   ~5s (free)                   │
        │  Skip:   If app/client/ exists        │
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │  2.2 Technical Architecture Spec      │
        │  Input:  plan.md                      │
        │  Output: specs/pages-and-routes.md    │
        │  Time:   ~20-30s ($0.05-0.08)         │
        │  Skip:   If pages-and-routes.md exists│
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │  2.3 Backend Spec Generation          │
        │  Input:  plan.md                      │
        │  Output: schema.zod.ts, contracts/    │
        │  Time:   ~40-60s ($0.10-0.15)         │
        │  Skip:   If both outputs exist        │
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │  2.4 Schema Generator                 │
        │  Writer-Critic Loop (max 40 iters)   │
        │  Input:  schema.zod.ts                │
        │  Output: schema.ts (Drizzle)          │
        │  Time:   ~1-3 iters ($0.05-0.10)      │
        │  Skip:   If schema.ts exists          │
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │  2.5 Storage Generator                │
        │  Writer-Critic Loop (max 40 iters)   │
        │  Input:  schema.ts                    │
        │  Output: server/storage.ts            │
        │  Time:   ~1-3 iters ($0.05-0.10)      │
        │  Skip:   If storage.ts exists         │
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │  2.6 Routes Generator                 │
        │  Writer-Critic Loop (max 40 iters)   │
        │  Input:  schema.ts, storage.ts,       │
        │          contracts/*.contract.ts      │
        │  Output: server/routes.ts             │
        │  Time:   ~2-4 iters ($0.10-0.15)      │
        │  Skip:   If routes.ts exists          │
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │  2.7 API Client Generator             │
        │  Writer-Critic Loop (max 40 iters)   │
        │  Input:  contracts/*.contract.ts      │
        │  Output: lib/api-client.ts,           │
        │          lib/api-registry.md          │
        │  Time:   ~1-2 iters ($0.05-0.08)      │
        │  Skip:   If api-client.ts exists      │
        │  Fix:    camelCase contract names     │
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │  2.8 App Shell Generator              │
        │  Writer-Critic Loop (max 40 iters)   │
        │  Input:  pages-and-routes.md          │
        │  Output: client/src/App.tsx           │
        │  Time:   ~1-2 iters ($0.05-0.10)      │
        │  Skip:   If App.tsx exists            │
        │  Fix:    File verification, in pipeline│
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │  2.9 FIS Master                       │
        │  Single Generation (no critic)        │
        │  Input:  plan.md, api-registry.md     │
        │  Output: specs/FIS-master.md          │
        │  Time:   ~30-45s ($0.10)              │
        │  Skip:   If FIS-master.md exists      │
        │  Fix:    Receives API Registry directly│
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │  2.10 FIS Pages (N pages)             │
        │  Single Generation per page           │
        │  Input:  FIS-master.md,               │
        │          api-registry.md              │
        │  Output: specs/pages/*.md             │
        │  Time:   ~20-30s per page ($0.05 each)│
        │  Skip:   If page spec exists          │
        │  Fix:    Receives API Registry directly│
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │  2.11 Layout Generator                │
        │  Writer-Critic Loop (max 40 iters)   │
        │  Input:  FIS-master.md                │
        │  Output: components/layout/*.tsx      │
        │  Time:   ~1-2 iters ($0.05-0.08)      │
        │  Skip:   If AppLayout.tsx exists      │
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │  2.12 Page Generator Orchestrator     │
        │  Parallel Writer-Critic (per page)    │
        │  Input:  specs/pages/*.md             │
        │  Output: client/src/pages/*.tsx       │
        │  Time:   ~30-60s per page (parallel)  │
        │           ($0.05-0.10 per page)       │
        │  Skip:   If page file exists          │
        │  Parallel: 10 concurrent by default   │
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │  2.13 Frontend Implementation         │
        │  Browser Visual Testing               │
        │  Input:  Entire app/                  │
        │  Output: Fixes to existing files      │
        │  Time:   ~3-8 mins ($0.20-0.50)       │
        │  Skip:   Never (always runs)          │
        │  Browser: Automated visual testing    │
        └───────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────────┐
│                   STAGE 3: VALIDATOR                            │
│  ValidatorAgent                                                │
│  Input:  app/ directory                                        │
│  Output: Validation report                                     │
│  Checks: TypeScript compilation, build process,                │
│          file existence, import resolution                     │
│  Time:   ~1-2 mins (free)                                      │
│  Skip:   Never (always runs)                                   │
└────────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────────┐
│                     PIPELINE COMPLETE                           │
│  🎉 App generated at apps/{workspace-name}/app/                │
│  💰 Total cost: $0.80-1.50 (typical)                           │
│  ⏱️ Total time: 5-10 minutes (typical)                         │
└────────────────────────────────────────────────────────────────┘
```

### Typical Execution Times

**First Run** (nothing cached):
- Plan: 30-45s
- Build: 4-7 minutes
- Validator: 1-2 minutes
- **Total**: 6-10 minutes

**Second Run** (everything cached):
- All stages skip
- **Total**: 10-20 seconds (just skip checks)

**Selective Regeneration** (clean contracts only):
- Contracts: 40-60s
- API Client: 20-30s
- FIS Pages: 3-5 minutes (if regenerating)
- Pages: 2-4 minutes (if regenerating)
- **Total**: 6-10 minutes

### Typical Costs

**First Run**:
- Plan: $0.10-0.15
- Backend Spec: $0.10-0.15
- Schema: $0.05-0.10
- Storage: $0.05-0.10
- Routes: $0.10-0.15
- API Client: $0.05-0.08
- App Shell: $0.05-0.10
- FIS Master: $0.10
- FIS Pages (15): $0.75 ($0.05 × 15)
- Layout: $0.05-0.08
- Pages (15): $0.75-1.50 ($0.05-0.10 × 15)
- Frontend Implementation: $0.20-0.50
- **Total**: $2.35-3.66

**Second Run** (cached): $0.00

---

## Critical Path

The following agents **MUST** succeed for a working app:

1. ✅ **Plan Stage** - Defines what to build
2. ✅ **Template Extraction** - Creates app structure
3. ✅ **Technical Architecture Spec** - Defines pages and routes
4. ✅ **Backend Spec** - Creates Zod schemas and contracts
5. ✅ **Schema Generator** - Creates Drizzle schema
6. ✅ **Storage Generator** - Creates data layer
7. ✅ **Routes Generator** - Creates API endpoints
8. ✅ **API Client Generator** - Creates frontend API client
9. ✅ **App Shell Generator** - Creates routing structure
10. ✅ **FIS Master** - Defines design patterns

Non-critical agents that enhance the app:
- ⚠️ FIS Pages (app works without, but better with)
- ⚠️ Layout Generator (app works with default layout)
- ⚠️ Page Generator (app works with placeholder pages)
- ⚠️ Frontend Implementation (fixes issues, not required)

---

## Never Broken Principle

The pipeline follows a **Never Broken** principle:

1. **Writer-Critic Loops** ensure code quality before proceeding
2. **Critical agents** stop pipeline if they fail
3. **Non-critical agents** allow pipeline to continue if they fail
4. **Skip logic** prevents regenerating working code
5. **Validator Stage** ensures final app compiles and runs

**Result**: Generated apps always compile and run (or pipeline stops early with clear error).

---

## Summary

The Leonardo App Factory pipeline is a sophisticated multi-stage system that transforms user prompts into production-ready full-stack applications. Key innovations:

- **Stateless Design**: Auto-detects existing work, skips completed stages
- **Writer-Critic Pattern**: Iterative refinement ensures code quality
- **Modular Architecture**: Each agent is independent and reusable
- **Parallel Execution**: Pages generated concurrently for speed
- **Never Broken**: Pipeline stops on critical failures, no broken code
- **Cost Efficient**: Typical app costs $2-4, completes in 6-10 minutes

Recent fixes (October 11, 2025):
- ✅ AppShellGenerator file verification
- ✅ AppShellGenerator added to pipeline
- ✅ Contract naming (camelCase conversion)
- ✅ API Registry direct passing (no regex parsing)

The pipeline is production-ready and generates working apps consistently.

---

**End of Pipeline Documentation**
