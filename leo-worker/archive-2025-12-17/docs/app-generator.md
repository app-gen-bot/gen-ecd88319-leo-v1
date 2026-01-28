# App Generator Pipeline - Complete Technical Documentation

**Last Updated**: January 2025
**Purpose**: Detailed technical documentation of the app-factory pipeline for AI agents and developers

---

## Table of Contents

1. [Overview](#overview)
2. [Entry Point and Initialization](#entry-point-and-initialization)
3. [AppGeneratorAgent Architecture](#appgeneratoragent-architecture)
4. [Three-Stage Pipeline](#three-stage-pipeline)
5. [File Generation Order](#file-generation-order)
6. [Writer-Critic Pattern](#writer-critic-pattern)
7. [Subagent Delegation System](#subagent-delegation-system)
8. [Session Management](#session-management)
9. [Factory Pattern Architecture](#factory-pattern-architecture)
10. [Critical Implementation Details](#critical-implementation-details)

---

## Overview

The App Factory is a **prompt-to-production** system that generates complete full-stack web applications from natural language descriptions. It transforms user prompts like "Create a marketplace for advisory boards" into fully functional applications with authentication, database, API, and modern UI.

**Core Philosophy:**
- **Schema-First Development**: `schema.zod.ts` is the single source of truth
- **Factory Pattern**: Environment-based switching between dev/production modes
- **80/20 Scaffolding**: Pre-built infrastructure, generate app-specific integration
- **Development First**: `npm install && npm run dev` works immediately with zero configuration
- **Type Safety**: End-to-end type checking from database to UI

**Tech Stack:**
- **Frontend**: React 18 + TypeScript + Vite + Wouter + TanStack Query + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript + PostgreSQL + Drizzle ORM
- **API**: ts-rest contracts (type-safe REST endpoints)
- **Auth**: Supabase (production) / Mock (development)
- **Storage**: Database (production) / In-memory (development)

---

## Entry Point and Initialization

### Call Chain

```
run-app-generator.py (CLI entry point)
    ↓
AppGeneratorAgent.__init__() (agent initialization)
    ↓
Agent (cc-agent with pipeline-prompt.md as system prompt)
    ↓
generate_app() or resume_generation()
    ↓
agent.run_with_session() (executes pipeline)
    ↓
Pipeline Stages: Plan → Build → Validate
```

### Command Line Usage

```bash
# Generate new app (--app-name required)
uv run python run-app-generator.py "Create a todo app" --app-name todo-app

# Generate with custom output directory
uv run python run-app-generator.py "Travel planner" --app-name travel-buddy --output-dir ~/projects

# Resume/modify existing app
uv run python run-app-generator.py --resume apps/my-app/app "Add dark mode"

# Resume with specific session for context continuity
uv run python run-app-generator.py --resume apps/my-app/app --resume-session abc123 "Add user profiles"

# Disable prompt expansion
uv run python run-app-generator.py "Todo app" --app-name todos --no-expand

# Disable subagents
uv run python run-app-generator.py "Todo app" --app-name todos --disable-subagents
```

### run-app-generator.py Responsibilities

**Location**: `/Users/labheshpatel/apps/app-factory/run-app-generator.py`

**Key Functions:**

1. **Argument Parsing**: Validates required arguments (prompt, app-name for new apps)
2. **Logging Setup**: Configures both console and file logging
3. **Agent Creation**: Calls `create_app_generator()` with settings
4. **Execution**: Runs `generate_app()` or `resume_generation()` based on mode
5. **Interactive Loop**: Offers continuous modification after generation
6. **Error Handling**: Graceful handling of interrupts and errors

**Interactive Mode Features:**
- Continuous conversation after app generation
- Special commands: `/context`, `/clear`, `/save`, `done`
- Automatic session persistence
- Git commit for each modification

---

## AppGeneratorAgent Architecture

**Location**: `src/app_factory_leonardo_replit/agents/app_generator/agent.py`

### Initialization Parameters

```python
AppGeneratorAgent(
    output_dir: Optional[str] = None,      # Default: ~/apps/app-factory/apps/
    enable_expansion: bool = True,          # Prompt expansion with LLM
    enable_subagents: bool = True          # Specialized subagent delegation
)
```

### Core Components

#### 1. System Prompt

**Source**: `docs/pipeline-prompt.md` (913 lines)

The system prompt is the **complete instruction set** for the agent, containing:
- Three-stage pipeline specification (Plan → Build → Validate)
- Backend architecture patterns (schema-first, factory pattern)
- Frontend design system requirements (dark mode, Tailwind, shadcn/ui)
- Auth scaffolding patterns (mock vs. Supabase)
- Storage scaffolding patterns (memory vs. database)
- UI consistency checklist
- Writer-Critic validation criteria
- Subagent delegation guidelines

**Loaded Once**: Read at initialization and set as agent's system prompt

#### 2. Configuration

**Location**: `agents/app_generator/config.py`

```python
AGENT_CONFIG = {
    "name": "AppGeneratorAgent",
    "model": "sonnet",              # Claude Sonnet 4.5
    "max_turns": 1000,              # Extended for complete app generation
    "allowed_tools": [
        # Core file operations
        "Read", "Write", "Edit", "Glob", "Grep",

        # Task management
        "TodoWrite", "Task",

        # System operations
        "Bash", "WebSearch", "WebFetch",

        # MCP Tools (33 specialized tools)
        "mcp__browser__*",          # Browser automation (4 tools)
        "mcp__build_test__*",       # Build verification
        "mcp__package_manager__*",  # npm with approved list
        "mcp__dev_server__*",       # Dev server management (4 tools)
        "mcp__shadcn__*",           # shadcn/ui components
        "mcp__cwd_reporter__*",     # Path utilities (4 tools)
        "mcp__mem0__*",             # Memory system (6 tools)
        "mcp__graphiti__*",         # Knowledge graph (5 tools)
        "mcp__context_manager__*",  # Context management (6 tools)
        "mcp__integration_analyzer__*", # Template comparison
    ],
}

# Paths
PIPELINE_PROMPT_PATH = "/Users/labheshpatel/apps/app-factory/docs/pipeline-prompt.md"
PROMPTING_GUIDE_PATH = "/Users/labheshpatel/apps/app-factory/docs/PROMPTING-GUIDE.md"
APPS_OUTPUT_DIR = "/Users/labheshpatel/apps/app-factory/apps"

# Prompt expansion configuration
EXPANSION_CONFIG = {
    "model": "sonnet",
    "max_turns": 5,
    "enabled": True,
}
```

#### 3. MCP Tools Integration

The agent has access to **33 MCP (Model Context Protocol) tools** organized by category:

**Browser Automation** (4 tools):
- `open_browser()` - Launch Chromium with Playwright
- `navigate_browser(url)` - Navigate and capture errors
- `interact_browser(selector, interaction, value)` - Click, fill, select, hover
- `close_browser()` - Cleanup

**Build & Test** (1 tool):
- `verify_project()` - Run ESLint, TypeScript check, tests, build

**Package Management** (1 tool):
- `package_management(action, packages)` - npm with approved package list

**Dev Server** (4 tools):
- `start_dev_server(port)` - Launch npm run dev in background
- `stop_dev_server()` - Kill all dev servers
- `check_dev_server_status()` - Check running processes
- `get_dev_server_logs(lines)` - Read recent logs

**shadcn/ui** (1 tool):
- `shadcn_add(components)` - Install shadcn/ui components

**Memory & Knowledge** (11 tools):
- mem0: Add, search, update, delete memories with graph integration
- graphiti: Knowledge graph for entities and relationships
- context_manager: Session tracking and tool coordination

**Integration Analysis** (1 tool):
- `compare_with_template()` - Find custom code vs. template

#### 4. Prompt Expansion

**Purpose**: Enhance user prompts following best practices from `PROMPTING-GUIDE.md`

**Process**:
1. User provides brief prompt: "Create a todo app"
2. PromptExpander analyzes using LLM
3. Expands to detailed specification:
   - Core entities and relationships
   - User roles and permissions
   - Key workflows
   - Technical considerations
   - AI requirements (if applicable)

**Context Awareness**:
- For resume operations: includes recent git commits
- For new apps: focuses on domain understanding
- Expansion note shown to user for transparency

**Configuration**:
```python
{
    "model": "sonnet",      # Claude Sonnet for quality
    "max_turns": 5,         # Allow iterative refinement
    "enabled": True         # Can be disabled with --no-expand
}
```

#### 5. Subagent System

**8 Specialized Subagents** with programmatic SDK integration:

1. **research_agent** (Opus) - Complex domains, external APIs, unfamiliar tech
2. **schema_designer** (Sonnet) - Database schema design
3. **api_architect** (Sonnet) - API structure, contracts, auth
4. **ui_designer** (Sonnet) - Dark mode UI, component architecture
5. **code_writer** (Sonnet) - Production TypeScript/React code
6. **quality_assurer** (Sonnet) - Testing, validation, browser automation
7. **error_fixer** (Opus) - Debug and fix issues
8. **ai_integration** (Opus) - AI features, chat, ML, multi-turn conversations

**SDK Format** (claude-agent-sdk v0.1.4+):
- Defined as `AgentDefinition` dataclass instances
- Passed programmatically via `agents` parameter
- Also written to `.claude/agents/*.md` as fallback

**Delegation Syntax**:
```python
Task(
    description="Brief task description",
    prompt="Detailed requirements with full context",
    subagent_type="schema_designer"
)
```

#### 6. Session Management

**Per-App Session Files**: `.agent_session.json` in each app directory

**Session Data Structure**:
```json
{
    "session_id": "uuid-v4-string",
    "app_path": "/full/path/to/app",
    "timestamp": "2025-01-15T10:30:00",
    "context": {
        "app_name": "marketplace",
        "original_request": "Create a marketplace...",
        "features": ["User authentication", "CRUD operations", "RESTful API"],
        "entities": ["users", "products", "orders"],
        "generated_at": "2025-01-15T10:00:00",
        "last_action": "Add dark mode support",
        "last_modified": "2025-01-15T10:30:00"
    }
}
```

**Session Lifecycle**:
1. **New Generation**: Create fresh session with UUID
2. **Save**: Automatic after generation and each modification
3. **Load**: Automatic on resume (finds app-specific session)
4. **Resume**: Continue with same session ID for context continuity
5. **Clear**: Remove session with `/clear` command or on invalid UUID

**Session Recovery**:
- Handles expired sessions (creates new session)
- Validates UUID format before attempting resume
- Graceful fallback to fresh session on errors

#### 7. Git Integration

**GitHelper** (`git_helper.py`) manages version control:

**Operations**:
1. **initialize_repo()** - `git init` if not already a repo
2. **create_initial_commit()** - First commit after generation
3. **create_checkpoint_commit()** - Before modifications
4. **has_uncommitted_changes()** - Check working tree status
5. **get_commit_history()** - Recent commits for context

**Commit Messages**:
```
feat: Initial generation of {app_name}

Generated with AI App Factory
Features: User auth, CRUD operations, RESTful API

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Changelog Tracking**:
- File: `{app-name}.md` in app directory
- Format: Newest entries first
- Includes: timestamp, operation type, request, files changed, features, commit hash, session ID

---

## Three-Stage Pipeline

The pipeline is defined in `pipeline-prompt.md` and executed by the agent through its system prompt.

### Stage 1: Plan (Product Thinking)

**Objective**: Transform user prompt into structured feature specification

**Input**: User's natural language description
**Output**: `plan/plan.md`

**Analysis Process**:

1. **Entity Extraction**:
   - Identify core data models (e.g., users, products, orders)
   - Determine relationships (one-to-many, many-to-many)
   - Define attributes and constraints

2. **User Role Analysis**:
   - Identify roles (admin, user, guest)
   - Define permissions per role
   - Plan authentication requirements

3. **Workflow Mapping**:
   - Key user journeys
   - CRUD operations for each entity
   - Page flows and navigation

4. **AI Requirements** (if applicable):
   - Identify intelligent behaviors
   - Plan AI integration points
   - Define fallback strategies

**plan.md Structure**:
```markdown
# {App Name} - Feature Specification

## Overview
Brief description of the application

## Entities
- **Users**: id, email, name, role, createdAt
- **Products**: id, name, description, price, userId, createdAt
- **Orders**: id, userId, total, status, createdAt

## Relationships
- User has many Products (creator)
- User has many Orders (buyer)
- Order belongs to User

## User Roles
- **Admin**: Full access, user management
- **User**: Create products, place orders
- **Guest**: View products only

## Key Features
1. User authentication (login, signup, logout)
2. Product management (CRUD for authenticated users)
3. Order management (create, view history)
4. Admin dashboard (user and product analytics)

## User Flows
1. **New User Registration**: Signup → Email verification → Dashboard
2. **Product Creation**: Login → Dashboard → Create Product → Publish
3. **Purchase Flow**: Browse → Add to Cart → Checkout → Order Confirmation

## Technical Considerations
- PostgreSQL for persistence
- Real-time order updates (optional)
- Email notifications for orders
- Image upload for products (future enhancement)
```

**Key Principle**: **ALWAYS** include a `users` table with authentication, even if not explicitly mentioned in the prompt.

---

### Stage 2: Build (Code Generation)

This is the **most complex stage** with 5 sub-phases. Order of execution is critical.

#### 2.1 Backend Specification (Schema & Contracts)

**CRITICAL**: Schema must be created BEFORE contracts.

##### 2.1.1 Zod Schema (`shared/schema.zod.ts`)

**First Code File Created** - Single source of truth for all types.

**Purpose**:
- Runtime validation
- Type inference for TypeScript
- API request/response validation
- Form validation
- Database insert validation

**Structure**:
```typescript
import { z } from 'zod';

// ============================================================================
// USERS TABLE (ALWAYS INCLUDED)
// ============================================================================
export const users = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().min(1, "Name is required"),
  role: z.enum(['user', 'admin']).default('user'),
  createdAt: z.string().datetime(),
});

export const insertUsersSchema = users.omit({ id: true, createdAt: true });

// ============================================================================
// PRODUCTS TABLE (EXAMPLE ENTITY)
// ============================================================================
export const products = z.object({
  id: z.number(),
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  price: z.number().positive(),
  userId: z.number(),  // Foreign key to users
  createdAt: z.string().datetime(),
});

export const insertProductsSchema = products.omit({ id: true, createdAt: true });

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type User = z.infer<typeof users>;
export type InsertUser = z.infer<typeof insertUsersSchema>;
export type Product = z.infer<typeof products>;
export type InsertProduct = z.infer<typeof insertProductsSchema>;
```

**Principles**:
- Every entity needs: table schema + insert schema
- Use proper Zod types: `z.string()`, `z.number()`, `z.boolean()`, `z.enum()`, `z.array()`
- Include validation constraints: `.min()`, `.max()`, `.email()`, `.positive()`, `.regex()`
- Foreign keys are just numbers (relationships defined in Drizzle)
- Dates are ISO strings: `z.string().datetime()`
- Enums for limited choices: `z.enum(['value1', 'value2'])`

##### 2.1.2 ts-rest Contracts (`shared/contracts/*.contract.ts`)

**Purpose**: Type-safe REST API definition (compile-time checking on both client and server)

**One Contract Per Resource**:

```typescript
// shared/contracts/users.contract.ts
import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { users, insertUsersSchema } from '../schema.zod';

const c = initContract();

export const usersContract = c.router({
  getUsers: {
    method: 'GET',
    path: '/api/users',
    responses: {
      200: z.array(users),
    },
    summary: 'Get all users',
  },

  getUser: {
    method: 'GET',
    path: '/api/users/:id',
    responses: {
      200: users,
      404: z.object({ error: z.string() }),
    },
    summary: 'Get user by ID',
  },

  createUser: {
    method: 'POST',
    path: '/api/users',
    body: insertUsersSchema,
    responses: {
      201: users,
      400: z.object({ error: z.string() }),
    },
    summary: 'Create new user',
  },

  updateUser: {
    method: 'PUT',
    path: '/api/users/:id',
    body: insertUsersSchema.partial(), // All fields optional
    responses: {
      200: users,
      404: z.object({ error: z.string() }),
    },
    summary: 'Update user',
  },

  deleteUser: {
    method: 'DELETE',
    path: '/api/users/:id',
    body: z.object({}),
    responses: {
      204: z.object({}),
      404: z.object({ error: z.string() }),
    },
    summary: 'Delete user',
  },
});
```

**Main Contract** (combines all resources):
```typescript
// shared/contracts/index.ts
import { initContract } from '@ts-rest/core';
import { usersContract } from './users.contract';
import { productsContract } from './products.contract';
import { ordersContract } from './orders.contract';

const c = initContract();

export const contract = c.router({
  users: usersContract,
  products: productsContract,
  orders: ordersContract,
});
```

**Principles**:
- HTTP methods match REST conventions (GET, POST, PUT, DELETE)
- Path parameters use `:param` syntax
- Query parameters defined with `query` field
- All responses use Zod schemas for type safety
- Include error responses (400, 404, 500)
- Summaries for API documentation

#### 2.2 Backend Implementation

##### 2.2.1 Drizzle Schema (`shared/schema.ts`)

**Purpose**: PostgreSQL ORM schema (runtime database operations)

**Convert Zod → Drizzle**:

```typescript
import { pgTable, serial, text, timestamp, integer, decimal } from 'drizzle-orm/pg-core';

// ============================================================================
// USERS TABLE
// ============================================================================
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull().default('user'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================================================
// PRODUCTS TABLE
// ============================================================================
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================================================
// ORDERS TABLE
// ============================================================================
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

**Principles**:
- Table names are lowercase, plural (PostgreSQL convention)
- Column names use snake_case (`created_at`, not `createdAt`)
- Primary keys: `serial('id').primaryKey()`
- Foreign keys: `.references(() => parentTable.id, { onDelete: 'cascade' })`
- Timestamps: `.defaultNow()` for automatic creation time
- Unique constraints: `.unique()`
- Not null: `.notNull()`
- Defaults: `.default('value')`

**Field Name Parity Critical**:
- Zod uses camelCase: `createdAt`, `userId`
- Drizzle uses snake_case: `created_at`, `user_id`
- Drizzle automatically converts between conventions
- **DO NOT** manually convert in code

##### 2.2.2 Auth Scaffolding (80% Template, 20% Generated)

**Philosophy**: Factory pattern for environment-based switching

**Interface Definition** (`server/lib/auth/factory.ts`):

```typescript
import { mockAuth } from './mock-adapter';
import { supabaseAuth } from './supabase-adapter';

// ============================================================================
// INTERFACE (CONTRACT FOR ALL AUTH IMPLEMENTATIONS)
// ============================================================================
export interface IAuthAdapter {
  login(email: string, password: string): Promise<{ user: any; token: string }>;
  signup(email: string, password: string, name: string): Promise<{ user: any; token: string }>;
  verifyToken(token: string): Promise<any>;
  logout(token: string): Promise<void>;
}

// ============================================================================
// FACTORY FUNCTION (ENV-BASED SELECTION)
// ============================================================================
export function createAuth(): IAuthAdapter {
  const mode = process.env.AUTH_MODE || 'mock';

  if (mode === 'supabase') {
    console.log('🔐 Auth Mode: SUPABASE (production)');
    return supabaseAuth;
  }

  console.log('🔓 Auth Mode: MOCK (development)');
  return mockAuth;
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================
export const auth = createAuth();
```

**Mock Adapter** (`server/lib/auth/mock-adapter.ts`):

```typescript
import { IAuthAdapter } from './factory';

// ============================================================================
// MOCK AUTH (DEVELOPMENT ONLY - ACCEPTS ANY CREDENTIALS)
// ============================================================================
export const mockAuth: IAuthAdapter = {
  async login(email: string, password: string) {
    console.log(`[Mock Auth] Login: ${email}`);

    // Accept ANY credentials in development
    return {
      user: {
        id: 1,
        email,
        name: 'Demo User',
        role: 'user',
      },
      token: 'mock-token-' + Date.now(),
    };
  },

  async signup(email: string, password: string, name: string) {
    console.log(`[Mock Auth] Signup: ${email}`);

    return {
      user: {
        id: 1,
        email,
        name,
        role: 'user',
      },
      token: 'mock-token-' + Date.now(),
    };
  },

  async verifyToken(token: string) {
    console.log(`[Mock Auth] Verify token: ${token.substring(0, 20)}...`);

    // Accept ANY token in development
    return {
      id: 1,
      email: 'demo@example.com',
      name: 'Demo User',
      role: 'user',
    };
  },

  async logout(token: string) {
    console.log(`[Mock Auth] Logout: ${token.substring(0, 20)}...`);
    // No-op in mock mode
  },
};
```

**Supabase Adapter** (`server/lib/auth/supabase-adapter.ts`):

```typescript
import { createClient } from '@supabase/supabase-js';
import { IAuthAdapter } from './factory';

// ============================================================================
// SUPABASE CLIENT INITIALIZATION
// ============================================================================
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// ============================================================================
// SUPABASE AUTH (PRODUCTION - REAL AUTHENTICATION)
// ============================================================================
export const supabaseAuth: IAuthAdapter = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);
    if (!data.session) throw new Error('No session returned');

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name || 'User',
        role: data.user.user_metadata?.role || 'user',
      },
      token: data.session.access_token,
    };
  },

  async signup(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) throw new Error(error.message);
    if (!data.session) throw new Error('No session returned');

    return {
      user: {
        id: data.user!.id,
        email: data.user!.email!,
        name,
        role: 'user',
      },
      token: data.session.access_token,
    };
  },

  async verifyToken(token: string) {
    const { data, error } = await supabase.auth.getUser(token);

    if (error) throw new Error(error.message);

    return {
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata?.name || 'User',
      role: data.user.user_metadata?.role || 'user',
    };
  },

  async logout(token: string) {
    await supabase.auth.signOut();
  },
};
```

**Auth Middleware** (`server/middleware/auth.ts`):

```typescript
import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth/factory';

// ============================================================================
// EXTEND EXPRESS REQUEST TYPE
// ============================================================================
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// ============================================================================
// AUTH MIDDLEWARE (PROTECT ROUTES)
// ============================================================================
export function authMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Log every auth attempt
    console.log(`[Auth] ${req.method} ${req.path}`);

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('[Auth] No token provided');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      // Verify token using active auth adapter
      const user = await auth.verifyToken(token);
      console.log('[Auth] Token verified for user:', user.id);

      // Attach user to request for route handlers
      req.user = user;
      next();
    } catch (error: any) {
      console.error('[Auth] Token verification failed:', error.message);
      res.status(401).json({ error: 'Invalid token' });
    }
  };
}
```

##### 2.2.3 Storage Scaffolding (Factory Pattern)

**Philosophy**: Same interface for in-memory (dev) and database (production)

**Interface Definition** (`server/lib/storage/factory.ts`):

```typescript
import { MemoryStorage } from './mem-storage';
import { DatabaseStorage } from './supabase-storage';
import { User, InsertUser, Product, InsertProduct } from '@shared/schema.zod';

// ============================================================================
// INTERFACE (CONTRACT FOR ALL STORAGE IMPLEMENTATIONS)
// ============================================================================
export interface IStorage {
  // Users
  getUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | null>;
  deleteUser(id: number): Promise<boolean>;

  // Products
  getProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | null>;
  getProductsByUserId(userId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | null>;
  deleteProduct(id: number): Promise<boolean>;

  // Add methods for ALL entities in the app
}

// ============================================================================
// FACTORY FUNCTION (ENV-BASED SELECTION)
// ============================================================================
export function createStorage(): IStorage {
  const mode = process.env.STORAGE_MODE || 'memory';

  if (mode === 'database') {
    console.log('💾 Storage Mode: DATABASE (production)');
    return new DatabaseStorage();
  }

  console.log('💾 Storage Mode: MEMORY (development)');
  return new MemoryStorage();
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================
export const storage = createStorage();
```

**Memory Storage** (`server/lib/storage/mem-storage.ts`):

```typescript
import { IStorage } from './factory';
import { User, InsertUser, Product, InsertProduct } from '@shared/schema.zod';

// ============================================================================
// IN-MEMORY STORAGE (DEVELOPMENT ONLY - DATA LOST ON RESTART)
// ============================================================================
export class MemoryStorage implements IStorage {
  private users: User[] = [];
  private products: Product[] = [];
  private nextUserId = 1;
  private nextProductId = 1;

  // ========================================================================
  // USERS
  // ========================================================================
  async getUsers(): Promise<User[]> {
    return [...this.users];
  }

  async getUserById(id: number): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      ...user,
      id: this.nextUserId++,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | null> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    this.users[index] = { ...this.users[index], ...updates };
    return this.users[index];
  }

  async deleteUser(id: number): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;

    this.users.splice(index, 1);
    return true;
  }

  // ========================================================================
  // PRODUCTS
  // ========================================================================
  async getProducts(): Promise<Product[]> {
    return [...this.products];
  }

  async getProductById(id: number): Promise<Product | null> {
    return this.products.find(p => p.id === id) || null;
  }

  async getProductsByUserId(userId: number): Promise<Product[]> {
    return this.products.filter(p => p.userId === userId);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: this.nextProductId++,
      createdAt: new Date().toISOString(),
    };
    this.products.push(newProduct);
    return newProduct;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | null> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    this.products[index] = { ...this.products[index], ...updates };
    return this.products[index];
  }

  async deleteProduct(id: number): Promise<boolean> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.products.splice(index, 1);
    return true;
  }

  // Implement methods for ALL entities...
}
```

**Database Storage** (`server/lib/storage/supabase-storage.ts`):

```typescript
import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { IStorage } from './factory';
import { users, products } from '@shared/schema';
import { User, InsertUser, Product, InsertProduct } from '@shared/schema.zod';

// ============================================================================
// DATABASE CLIENT INITIALIZATION
// ============================================================================
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

// ============================================================================
// DATABASE STORAGE (PRODUCTION - POSTGRESQL VIA DRIZZLE)
// ============================================================================
export class DatabaseStorage implements IStorage {
  // ========================================================================
  // USERS
  // ========================================================================
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUserById(id: number): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | null> {
    const result = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  // ========================================================================
  // PRODUCTS
  // ========================================================================
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProductById(id: number): Promise<Product | null> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0] || null;
  }

  async getProductsByUserId(userId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.userId, userId));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | null> {
    const result = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  // Implement methods for ALL entities...
}
```

##### 2.2.4 API Routes

**Auth Routes** (`server/routes/auth.ts`):

```typescript
import express from 'express';
import { auth } from '../lib/auth/factory';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// ============================================================================
// PUBLIC AUTH ROUTES
// ============================================================================

// POST /api/auth/login
router.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await auth.login(email, password);
    res.json(result);
  } catch (error: any) {
    console.error('[Auth] Login error:', error.message);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// POST /api/auth/signup
router.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name required' });
    }

    const result = await auth.signup(email, password, name);
    res.json(result);
  } catch (error: any) {
    console.error('[Auth] Signup error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ============================================================================
// PROTECTED AUTH ROUTES
// ============================================================================

// GET /api/auth/me
router.get('/api/auth/me', authMiddleware(), async (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/logout
router.post('/api/auth/logout', authMiddleware(), async (req, res) => {
  try {
    const token = req.headers.authorization!.replace('Bearer ', '');
    await auth.logout(token);
    res.json({ success: true });
  } catch (error: any) {
    console.error('[Auth] Logout error:', error.message);
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;
```

**Resource Routes** (`server/routes/products.ts` - example):

```typescript
import express from 'express';
import { storage } from '../lib/storage/factory';
import { authMiddleware } from '../middleware/auth';
import { insertProductsSchema } from '@shared/schema.zod';

const router = express.Router();

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

// GET /api/products - Get all products
router.get('/api/products', async (req, res) => {
  try {
    const products = await storage.getProducts();
    res.json(products);
  } catch (error: any) {
    console.error('[Products] Get all error:', error.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id - Get single product
router.get('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = await storage.getProductById(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error: any) {
    console.error('[Products] Get by ID error:', error.message);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// ============================================================================
// PROTECTED ROUTES (REQUIRE AUTHENTICATION)
// ============================================================================

// POST /api/products - Create product
router.post('/api/products', authMiddleware(), async (req, res) => {
  try {
    // Validate request body
    const validatedData = insertProductsSchema.parse(req.body);

    // Automatically attach userId from auth
    const product = await storage.createProduct({
      ...validatedData,
      userId: req.user.id,
    });

    res.status(201).json(product);
  } catch (error: any) {
    console.error('[Products] Create error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/products/:id - Update product
router.put('/api/products/:id', authMiddleware(), async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Check ownership
    const existing = await storage.getProductById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (existing.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Validate and update
    const validatedData = insertProductsSchema.partial().parse(req.body);
    const product = await storage.updateProduct(id, validatedData);

    res.json(product);
  } catch (error: any) {
    console.error('[Products] Update error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/api/products/:id', authMiddleware(), async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Check ownership
    const existing = await storage.getProductById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (existing.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await storage.deleteProduct(id);
    res.status(204).send();
  } catch (error: any) {
    console.error('[Products] Delete error:', error.message);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
```

**Main Server** (`server/index.ts`):

```typescript
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import productsRoutes from './routes/products';
// Import all other route files...

const app = express();
const PORT = process.env.PORT || 5013;

// ============================================================================
// MIDDLEWARE
// ============================================================================
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ============================================================================
// STARTUP LOGGING
// ============================================================================
console.log('🚀 Starting server...');
console.log(`🔐 Auth Mode: ${process.env.AUTH_MODE || 'mock'}`);
console.log(`💾 Storage Mode: ${process.env.STORAGE_MODE || 'memory'}`);

// ============================================================================
// ROUTES
// ============================================================================
app.use(authRoutes);
app.use(productsRoutes);
// Mount all other routes...

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    auth: process.env.AUTH_MODE || 'mock',
    storage: process.env.STORAGE_MODE || 'memory',
  });
});

// ============================================================================
// START SERVER
// ============================================================================
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
```

##### 2.2.5 AI Integration (If Required)

**When to Use**:
- Chat interfaces
- Content generation
- Recommendations
- Intelligent search
- Data analysis
- Natural language processing

**Delegation Mandate**:
When ANY AI capability is required, **delegate to `ai_integration` subagent**.

**What the Subagent Handles**:
- Multi-turn conversation management
- Context tracking across messages
- Streaming responses
- Fallback strategies
- Appropriate UI patterns (chat bubbles, loading states)
- Error handling and retries

**Example Task Delegation**:
```python
Task(
    description="Implement AI chat for product recommendations",
    prompt="""
    Implement an AI-powered chat feature that provides product recommendations.

    Requirements:
    - Multi-turn conversation support
    - Context awareness of user preferences
    - Streaming responses for better UX
    - Fallback to static recommendations if AI fails
    - Chat UI with message history

    Entities available: users, products
    Storage: Use storage.getProducts() for recommendations

    Create:
    - server/lib/ai/product-advisor.ts (AI agent)
    - server/routes/chat.ts (API endpoint)
    - client/src/pages/ChatPage.tsx (UI)
    - client/src/components/chat/* (chat components)
    """,
    subagent_type="ai_integration"
)
```

#### 2.3 Frontend Specification

##### 2.3.1 API Client (`client/src/lib/api-client.ts`)

**CRITICAL**: Uses getter property for dynamic auth headers (ts-rest v3 requirement)

```typescript
import { initClient } from '@ts-rest/core';
import { contract } from '@shared/contracts';

// ============================================================================
// TS-REST CLIENT WITH AUTO-AUTH
// ============================================================================
export const apiClient = initClient(contract, {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5013',
  jsonQuery: true,
  baseHeaders: {
    'Content-Type': 'application/json',

    // CRITICAL: Use getter property, NOT function
    // ts-rest v3 reads this property on EVERY request
    // This ensures fresh token is always used
    get Authorization() {
      const token = localStorage.getItem('auth_token');
      return token ? `Bearer ${token}` : '';
    },
  },
});

// ============================================================================
// USAGE IN COMPONENTS
// ============================================================================
// const { data } = await apiClient.products.getProducts();
// Auto-injects Authorization header if token exists
```

**Why Getter Property**:
- **NOT** `Authorization: () => ...` (function, evaluated once)
- **YES** `get Authorization() { ... }` (getter, evaluated every request)
- Ensures fresh token after login/logout
- No manual header management needed

##### 2.3.2 Auth Helpers (`client/src/lib/auth-helpers.ts`)

```typescript
// ============================================================================
// LOCALSTORAGE KEYS
// ============================================================================
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================
export function getAuthUser(): any | null {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function setAuthUser(user: any): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthUser(): void {
  localStorage.removeItem(USER_KEY);
}

// ============================================================================
// COMBINED OPERATIONS
// ============================================================================
export function clearAuth(): void {
  clearAuthToken();
  clearAuthUser();
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
```

##### 2.3.3 Auth Context (`client/src/contexts/AuthContext.tsx`)

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuthUser, getAuthToken, setAuthToken, setAuthUser, clearAuth } from '@/lib/auth-helpers';

// ============================================================================
// CONTEXT TYPE DEFINITION
// ============================================================================
interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// AUTH PROVIDER
// ============================================================================
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore auth state on mount
  useEffect(() => {
    const token = getAuthToken();
    const savedUser = getAuthUser();

    if (token && savedUser) {
      setUser(savedUser);
    }

    setIsLoading(false);
  }, []);

  // ========================================================================
  // LOGIN
  // ========================================================================
  const login = async (email: string, password: string) => {
    // Auth endpoints use direct fetch (not apiClient)
    // Because we don't have a token yet
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5013';

    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();

    // Save token and user
    setAuthToken(data.token);
    setAuthUser(data.user);
    setUser(data.user);
  };

  // ========================================================================
  // SIGNUP
  // ========================================================================
  const signup = async (email: string, password: string, name: string) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5013';

    const response = await fetch(`${apiUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    const data = await response.json();

    // Save token and user
    setAuthToken(data.token);
    setAuthUser(data.user);
    setUser(data.user);
  };

  // ========================================================================
  // LOGOUT
  // ========================================================================
  const logout = async () => {
    // Clear local state first
    clearAuth();
    setUser(null);

    // Optional: Call server logout endpoint
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5013';
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
    } catch (error) {
      // Ignore server errors during logout
      console.error('Logout error:', error);
    }
  };

  // ========================================================================
  // PROVIDER VALUE
  // ========================================================================
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

##### 2.3.4 Protected Route Component

```typescript
import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'wouter';

// ============================================================================
// LOADING SCREEN
// ============================================================================
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// ============================================================================
// PROTECTED ROUTE
// ============================================================================
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking auth
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Render children if authenticated
  return <>{children}</>;
}
```

#### 2.4 Frontend Implementation

##### 2.4.1 Design System Requirements

**CRITICAL PRINCIPLES** (apply to ALL pages):

**1. Dark Mode First**:
- Prefer dark backgrounds: `bg-background` (dark gray/black)
- Excellent contrast: Light text on dark background
- Modern minimalist aesthetic
- Card backgrounds slightly lighter than main background

**2. Tailwind CSS + shadcn/ui**:
- Use utility classes, not custom CSS
- shadcn/ui components for consistency
- Responsive design (mobile-first)

**3. Unsplash Images**:
- Hero sections: `1200x400` or `800x600`
- Cards: `400x300`
- Avatars: `200x200`
- Format: `https://images.unsplash.com/{width}x{height}/?{keyword}`
- Examples: `/800x600/?travel`, `/400x300/?food`, `/200x200/?person`

**4. Color Palette** (Tailwind classes):
```
Primary:     bg-primary, text-primary
Background:  bg-background (dark)
Card:        bg-card (slightly lighter than background)
Text:        text-foreground (light)
Muted:       text-muted-foreground (gray)
Border:      border-border (subtle)
```

**5. Typography**:
```
H1: text-4xl font-bold
H2: text-3xl font-bold
H3: text-2xl font-semibold
H4: text-xl font-semibold
Body: text-base
Small: text-sm text-muted-foreground
```

**6. Spacing**:
```
Sections: py-16, py-12
Content: space-y-6, space-y-4
Padding: px-4, px-6, px-8
Margins: mb-4, mb-6, mb-8
```

**7. shadcn/ui Components**:
- Button: `<Button variant="default|outline|ghost">`
- Card: `<Card><CardHeader><CardTitle>`, `<CardContent>`
- Form: `<Input>`, `<Label>`, `<Textarea>`, `<Select>`
- Dialog: `<Dialog>`, `<DialogContent>`, `<DialogHeader>`

##### 2.4.2 App Shell (`client/src/App.tsx`)

```typescript
import { Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Page imports
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
// Import all other pages...

// ============================================================================
// QUERY CLIENT CONFIGURATION
// ============================================================================
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// ============================================================================
// APP COMPONENT
// ============================================================================
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          {/* ============================================================ */}
          {/* PUBLIC ROUTES                                                */}
          {/* ============================================================ */}
          <Route path="/" component={HomePage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/signup" component={SignupPage} />
          <Route path="/products" component={ProductsPage} />
          <Route path="/products/:id" component={ProductDetailPage} />

          {/* ============================================================ */}
          {/* PROTECTED ROUTES (REQUIRE AUTHENTICATION)                   */}
          {/* ============================================================ */}
          <Route path="/dashboard">
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          </Route>

          <Route path="/products/new">
            <ProtectedRoute>
              <CreateProductPage />
            </ProtectedRoute>
          </Route>

          {/* Add all other protected routes... */}

          {/* ============================================================ */}
          {/* 404 NOT FOUND                                               */}
          {/* ============================================================ */}
          <Route>
            <NotFoundPage />
          </Route>
        </Switch>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

##### 2.4.3 Layout Component (`client/src/components/layout/AppLayout.tsx`)

**Used on EVERY page** for consistency:

```typescript
import { ReactNode } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/auth/UserMenu';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* ==================================================================== */}
      {/* NAVIGATION                                                          */}
      {/* ==================================================================== */}
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo - Wouter Link renders <a>, don't wrap with another <a> */}
          <Link href="/" className="text-2xl font-bold text-primary hover:opacity-80">
            AppName
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link href="/products" className="text-foreground hover:text-primary">
              Products
            </Link>

            <Link href="/about" className="text-foreground hover:text-primary">
              About
            </Link>

            {/* Authenticated vs. Guest */}
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-foreground hover:text-primary">
                  Dashboard
                </Link>
                <UserMenu user={user} />
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ==================================================================== */}
      {/* MAIN CONTENT                                                        */}
      {/* ==================================================================== */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* ==================================================================== */}
      {/* FOOTER                                                              */}
      {/* ==================================================================== */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            © 2025 AppName. Crafted by <a href="https://leodavinci.ai" target="_blank" rel="noopener noreferrer" className="hover:underline">Leo</a>.
          </div>
        </div>
      </footer>
    </div>
  );
}
```

**UserMenu Component** (`client/src/components/auth/UserMenu.tsx`):

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

export function UserMenu({ user }: { user: any }) {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <span>{user?.name || 'User'}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => setLocation('/dashboard')}>
          Dashboard
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setLocation('/settings')}>
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

##### 2.4.4 Page Structure Patterns

**Landing/Feature Page Pattern**:

```typescript
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function HomePage() {
  return (
    <AppLayout>
      {/* ==================================================================== */}
      {/* HERO SECTION                                                        */}
      {/* ==================================================================== */}
      <section className="py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to AppName
        </h1>

        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          The best way to manage your products and grow your business
        </p>

        {/* Hero Image from Unsplash */}
        <img
          src="https://images.unsplash.com/1200x400/?business,technology"
          alt="Hero"
          className="rounded-lg shadow-lg mx-auto mb-8"
        />

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/products">
            <Button size="lg" variant="outline">Browse Products</Button>
          </Link>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* FEATURES GRID                                                       */}
      {/* ==================================================================== */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Key Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <img
                src="https://images.unsplash.com/400x300/?dashboard"
                alt="Dashboard"
                className="rounded-md mb-4"
              />
              <CardTitle>Powerful Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Manage everything from one central location
              </p>
            </CardContent>
          </Card>

          {/* More feature cards... */}
        </div>
      </section>
    </AppLayout>
  );
}
```

**List Page Pattern** (with TanStack Query):

```typescript
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { apiClient } from '@/lib/api-client';
import { Loader2 } from 'lucide-react';

export default function ProductsPage() {
  // ========================================================================
  // DATA FETCHING
  // ========================================================================
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await apiClient.products.getProducts();
      if (response.status !== 200) throw new Error('Failed to fetch products');
      return response.body;
    },
  });

  return (
    <AppLayout>
      {/* ==================================================================== */}
      {/* PAGE HEADER                                                         */}
      {/* ==================================================================== */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Products</h1>
          <p className="text-muted-foreground">
            Browse our collection of amazing products
          </p>
        </div>

        <Link href="/products/new">
          <Button>Create Product</Button>
        </Link>
      </div>

      {/* ==================================================================== */}
      {/* LOADING STATE                                                       */}
      {/* ==================================================================== */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading products...</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ERROR STATE                                                         */}
      {/* ==================================================================== */}
      {error && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
          <p className="text-destructive font-semibold mb-2">Failed to load products</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      )}

      {/* ==================================================================== */}
      {/* EMPTY STATE                                                         */}
      {/* ==================================================================== */}
      {!isLoading && !error && products?.length === 0 && (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground mb-4">
            No products yet
          </p>
          <Link href="/products/new">
            <Button>Create Your First Product</Button>
          </Link>
        </div>
      )}

      {/* ==================================================================== */}
      {/* PRODUCTS GRID                                                       */}
      {/* ==================================================================== */}
      {!isLoading && !error && products && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <img
                  src={`https://images.unsplash.com/400x300/?product,${product.name}`}
                  alt={product.name}
                  className="rounded-md mb-4"
                />
                <CardTitle>{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">${product.price}</span>
                  <Link href={`/products/${product.id}`}>
                    <Button variant="outline">View Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
```

**Form Page Pattern** (Create/Edit):

```typescript
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';

export default function CreateProductPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // ========================================================================
  // FORM STATE
  // ========================================================================
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ========================================================================
  // MUTATION
  // ========================================================================
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.products.createProduct({
        body: {
          name: data.name,
          description: data.description,
          price: parseFloat(data.price),
        },
      });

      if (response.status !== 201) {
        throw new Error(response.body.error || 'Failed to create product');
      }

      return response.body;
    },
    onSuccess: () => {
      // Invalidate products list to refetch
      queryClient.invalidateQueries({ queryKey: ['products'] });
      // Redirect to products page
      setLocation('/products');
    },
    onError: (error: any) => {
      setErrors({ form: error.message });
    },
  });

  // ========================================================================
  // HANDLERS
  // ========================================================================
  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit
    createMutation.mutate(formData);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* ================================================================== */}
        {/* PAGE HEADER                                                       */}
        {/* ================================================================== */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create Product</h1>
          <p className="text-muted-foreground">
            Add a new product to your catalog
          </p>
        </div>

        {/* ================================================================== */}
        {/* FORM CARD                                                         */}
        {/* ================================================================== */}
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form-level error */}
              {errors.form && (
                <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
                  <p className="text-destructive text-sm">{errors.form}</p>
                </div>
              )}

              {/* Name field */}
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Description field */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter product description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              {/* Price field */}
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  className={errors.price ? 'border-destructive' : ''}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price}</p>
                )}
              </div>

              {/* Submit button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Product'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation('/products')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
```

##### 2.4.5 Auth Pages

**Login Page**:

```typescript
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, Link } from 'wouter';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      setLocation('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-md mx-auto py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
```

#### 2.5 Environment Configuration

**`.env` File** (Development defaults):

```bash
# ============================================================================
# DEVELOPMENT MODE (DEFAULT)
# ============================================================================
# Auth: Mock adapter accepts any credentials
AUTH_MODE=mock

# Storage: In-memory (data lost on restart)
STORAGE_MODE=memory

# Server
PORT=5013

# Client API URL
VITE_API_URL=http://localhost:5013

# ============================================================================
# PRODUCTION MODE (UNCOMMENT AND CONFIGURE)
# ============================================================================
# Auth: Real Supabase authentication
# AUTH_MODE=supabase
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-anon-key

# Storage: PostgreSQL database
# STORAGE_MODE=database
# DATABASE_URL=postgresql://user:pass@host:5432/db

# ============================================================================
# AI FEATURES (IF REQUIRED)
# ============================================================================
# Required only if app has AI capabilities
# Get from: https://console.anthropic.com/
# ANTHROPIC_API_KEY=sk-ant-api03-...
```

**Key Principles**:
1. **One Variable Switching**: Change `AUTH_MODE` and `STORAGE_MODE` to go from dev to production
2. **Development First**: Default values allow `npm run dev` to work immediately
3. **No Breaking Changes**: Same code works in both modes (factory pattern)

**Vite Configuration** (`vite.config.ts`):

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  server: {
    port: 5173,  // Vite dev server (optional, proxied in production)
  },
});
```

**Package.json Scripts**:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run server:dev\" \"npm run client:dev\"",
    "server:dev": "tsx watch server/index.ts",
    "client:dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

---

### Stage 3: Validate

**Objective**: Ensure application works correctly before completion

**Quality Checks** (run in order):

1. **Type Check**:
   ```bash
   npx tsc --noEmit
   ```
   - Verify no TypeScript errors
   - Check all imports resolve
   - Validate type safety end-to-end

2. **Lint** (OXC or ESLint):
   ```bash
   npm run lint
   ```
   - Code style consistency
   - Catch potential bugs
   - Enforce best practices

3. **Build Test**:
   ```bash
   npm run build
   ```
   - Verify production build succeeds
   - Check bundle size
   - Validate optimizations

4. **Server Start**:
   ```bash
   npm run dev
   ```
   - Verify server starts without errors
   - Check all routes respond
   - Validate middleware chains

5. **Browser Testing** (using MCP browser tools):
   - Navigate to home page
   - Test login flow
   - Create/read/update/delete operations
   - Verify protected routes redirect
   - Check responsive design

**MCP Browser Tool Usage**:

```typescript
// Open browser
await mcp__browser__open_browser({ headless: false });

// Navigate to app
await mcp__browser__navigate_browser({
  url: 'http://localhost:5013'
});

// Test login
await mcp__browser__interact_browser({
  selector: 'input[type="email"]',
  interaction: 'fill',
  value: 'test@example.com'
});

await mcp__browser__interact_browser({
  selector: 'input[type="password"]',
  interaction: 'fill',
  value: 'password'
});

await mcp__browser__interact_browser({
  selector: 'button[type="submit"]',
  interaction: 'click'
});

// Verify dashboard loaded
await mcp__browser__navigate_browser({
  url: 'http://localhost:5013/dashboard'
});

// Close browser
await mcp__browser__close_browser();
```

---

## File Generation Order

**CRITICAL**: Files must be generated in this exact order due to dependencies.

### Phase 1: Planning & Specification

```
1. plan/plan.md                          # Feature specification
```

### Phase 2: Backend Specification (Schema-First)

```
2. shared/schema.zod.ts                  # FIRST CODE FILE - Source of truth
3. shared/contracts/*.contract.ts        # API contracts (one per resource)
4. shared/contracts/index.ts             # Main contract combiner
```

### Phase 3: Backend Implementation

```
5. shared/schema.ts                      # Drizzle ORM (from Zod)

# Auth scaffolding
6. server/lib/auth/factory.ts            # IAuthAdapter interface + factory
7. server/lib/auth/mock-adapter.ts       # Development auth
8. server/lib/auth/supabase-adapter.ts   # Production auth

# Storage scaffolding
9. server/lib/storage/factory.ts         # IStorage interface + factory
10. server/lib/storage/mem-storage.ts    # Development storage
11. server/lib/storage/supabase-storage.ts # Production storage

# Middleware & routes
12. server/middleware/auth.ts            # Auth middleware
13. server/routes/auth.ts                # Auth endpoints
14. server/routes/*.ts                   # Resource routes (one per entity)
15. server/index.ts                      # Main server file

# AI (if needed)
16. server/lib/ai/*.ts                   # AI agents (delegate to ai_integration subagent)
```

### Phase 4: Frontend Specification

```
17. client/src/lib/api-client.ts         # ts-rest client with auto-auth
18. client/src/lib/auth-helpers.ts       # Token/user management
19. client/src/contexts/AuthContext.tsx  # Auth context provider
```

### Phase 5: Frontend Implementation

```
# Auth components
20. client/src/components/auth/ProtectedRoute.tsx
21. client/src/components/auth/UserMenu.tsx

# Layout
22. client/src/components/layout/AppLayout.tsx

# App shell
23. client/src/App.tsx                   # Routes + providers

# Pages (can be parallelized if using subagents)
24. client/src/pages/HomePage.tsx
25. client/src/pages/LoginPage.tsx
26. client/src/pages/SignupPage.tsx
27. client/src/pages/DashboardPage.tsx
28. client/src/pages/*Page.tsx           # All other pages
```

### Phase 6: Configuration

```
29. .env                                 # Environment variables
30. vite.config.ts                       # Vite configuration
31. package.json                         # Scripts and dependencies
32. tsconfig.json                        # TypeScript config
```

**Parallelization Opportunities**:
- Resource routes can be generated in parallel (after auth routes)
- Frontend pages can be generated in parallel (after App.tsx)
- Use subagents to parallelize independent work

**Dependencies to Respect**:
- Schema MUST come before contracts
- Contracts MUST come before routes
- Auth context MUST come before protected routes
- App shell MUST come before pages
- Layout MUST come before pages

---

## Writer-Critic Pattern

**Applied to EVERY component, page, and route** to ensure quality.

### Process

1. **Write**: Generate initial code
2. **Critique**: Validate against checklists
3. **Iterate**: Fix issues (max 5 attempts)
4. **Complete**: When all checks pass

### Critique Checklists

#### UI Consistency Checklist

Every page MUST have:
- ✅ `<AppLayout>` wrapper with navigation
- ✅ Proper heading hierarchy (h1 → h2 → h3)
- ✅ Consistent button styles (`Button` component with variants)
- ✅ `Card` components for grouped content
- ✅ Responsive design (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- ✅ Loading states (Loader2 spinner + message)
- ✅ Error states (destructive styling + helpful message)
- ✅ Empty states (message + call-to-action button)
- ✅ Unsplash images where appropriate
- ✅ Dark mode colors (bg-background, text-foreground)

#### Auth Integration Checklist

- ✅ Protected routes use `<ProtectedRoute>` wrapper
- ✅ API calls use `apiClient` (auto-injects auth token)
- ✅ Login/Signup pages with proper validation
- ✅ `UserMenu` component in AppLayout navigation
- ✅ Logout functionality in UserMenu
- ✅ Auth state persists on page refresh (localStorage)
- ✅ Unauthorized users redirected to /login

#### API Integration Checklist

- ✅ All routes use `storage` singleton (factory pattern)
- ✅ Protected routes use `authMiddleware()`
- ✅ Request bodies validated with Zod schemas
- ✅ User ID attached from `req.user` (from auth middleware)
- ✅ Ownership checks for update/delete operations
- ✅ Proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- ✅ Error responses include `{ error: string }` format
- ✅ Logging for debugging (`console.log`, `console.error`)

#### Type Safety Checklist

- ✅ Zod schemas defined in `schema.zod.ts`
- ✅ Drizzle schemas use exact same field names (snake_case conversion automatic)
- ✅ ts-rest contracts reference Zod schemas
- ✅ Frontend imports types from `@shared/schema.zod`
- ✅ TanStack Query types match API responses
- ✅ No `any` types (except for user objects in auth)

#### Code Quality Checklist

- ✅ TypeScript strict mode passes
- ✅ No ESLint errors
- ✅ Consistent formatting
- ✅ Meaningful variable names
- ✅ Comments for complex logic
- ✅ Error handling with try/catch
- ✅ Logging for debugging

### Iteration Strategy

**First Attempt**: Generate code following all patterns

**Critique**: Run through ALL checklists, identify issues

**Second Attempt**: Fix identified issues

**Critique**: Re-check, identify remaining issues

**Continue**: Up to 5 total attempts

**Failure Handling**:
- If 5 attempts exhausted and still failing → escalate to `error_fixer` subagent
- If critical infrastructure failing → stop pipeline, report to user

### TodoWrite Integration

Track Writer-Critic iterations with TodoWrite:

```
1. Write ProductsPage component (in_progress)
   - Generate initial code

2. Critique ProductsPage (pending)
   - Check UI consistency
   - Check API integration
   - Check type safety

3. Fix ProductsPage issues (pending)
   - Add missing loading state
   - Fix auth integration

4. Final validation ProductsPage (pending)
   - All checks passed
```

---

## Subagent Delegation System

### Available Subagents

**1. research_agent** (Opus - 200K context)
- **When**: Unfamiliar domains, external APIs, new technologies
- **Examples**:
  - Integrating Stripe payments
  - Implementing Twilio SMS
  - Using AWS S3 for file uploads
  - Setting up Cloudflare Workers
  - Understanding complex domain (healthcare, legal, finance)
- **Output**: Implementation strategy with code examples

**2. schema_designer** (Sonnet - 200K context)
- **When**: ALL schema creation tasks
- **Responsibilities**:
  - Create `schema.zod.ts` (single source of truth)
  - Create `schema.ts` (Drizzle ORM)
  - Ensure EXACT field name parity
  - Design relationships (foreign keys, cascades)
- **Critical**: Schema is foundation, must be perfect

**3. api_architect** (Sonnet - 200K context)
- **When**: API design and contracts
- **Responsibilities**:
  - Design `contracts/*.contract.ts` files
  - Plan authentication flows
  - Structure REST endpoints with proper HTTP methods
  - Define query parameters, pagination
  - Plan error responses
- **Output**: Complete contract specifications

**4. ui_designer** (Sonnet - 200K context)
- **When**: Design system and UI planning
- **Responsibilities**:
  - Create design tokens and global styles
  - Plan component hierarchy
  - Define interaction patterns
  - Design dark mode color palettes
  - Plan responsive layouts
- **Output**: Design specifications and component structure

**5. code_writer** (Sonnet - 200K context)
- **When**: Implementing individual files
- **Responsibilities**:
  - Write route implementations (`routes/*.ts`)
  - Write React pages (`pages/*.tsx`)
  - Write API integration code
  - Implement specific features
- **Good For**: Parallelizing page generation

**6. quality_assurer** (Sonnet - 200K context)
- **When**: Testing and validation
- **Responsibilities**:
  - Run type-check, lint, build
  - Browser automation testing
  - End-to-end flow validation
  - Performance testing
- **Output**: Test results and quality report

**7. error_fixer** (Opus - 200K context)
- **When**: Debugging failures
- **Responsibilities**:
  - Resolve TypeScript errors
  - Fix failing tests
  - Debug runtime issues
  - Correct integration problems
- **Output**: Fixed code with explanation

**8. ai_integration** (Opus - 200K context)
- **When**: ANY AI feature required
- **Responsibilities**:
  - Multi-turn conversation management
  - Context tracking
  - Streaming responses
  - Fallback strategies
  - Chat UI patterns
  - Error handling
- **Output**: Complete AI implementation

### Delegation Strategy

**Before implementing any task yourself, ask**:
"Is there a subagent designed for this specific task?"

**If YES**:
```typescript
Task(
  description="Brief 3-5 word description",
  prompt=`Detailed requirements with ALL context:

  - What to build
  - Available entities/resources
  - Constraints and requirements
  - Expected output format
  - Integration points
  `,
  subagent_type="subagent_name"
)
```

**Parallelization**:
- Identify independent tasks
- Delegate to multiple subagents simultaneously
- Example: Generate 5 pages in parallel with 5 `code_writer` instances

**Tracking**:
After each Task delegation:
1. Add to TodoWrite: "Delegated [task] to [subagent]"
2. When complete, verify output matches requirements
3. Mark todo as complete

### Example Delegation Scenarios

**Scenario 1: Complex External API Integration**

```typescript
// User wants Stripe payment processing

Task(
  description="Research Stripe integration strategy",
  prompt=`Research and provide implementation strategy for Stripe payment processing.

  Requirements:
  - Accept credit card payments
  - Handle webhooks for payment status
  - Support refunds
  - Subscription billing

  Current architecture:
  - Express.js backend
  - Factory pattern for storage (IStorage)
  - ts-rest API contracts

  Provide:
  - Recommended Stripe SDK version
  - Webhook setup instructions
  - Code examples for payment flow
  - Security best practices
  - Testing strategy
  `,
  subagent_type="research_agent"
)

// After research agent completes, implement with code_writer
Task(
  description="Implement Stripe payment routes",
  prompt=`Implement Stripe payment processing based on research findings.

  [Include research agent output here]

  Create:
  - server/lib/payments/stripe-adapter.ts
  - server/routes/payments.ts
  - Webhook handler for payment events
  `,
  subagent_type="code_writer"
)
```

**Scenario 2: Parallel Page Generation**

```typescript
// Generate 5 pages simultaneously

// Delegate to 5 code_writer instances in parallel
const pages = [
  { name: "DashboardPage", description: "User dashboard with stats" },
  { name: "ProductsPage", description: "Products list with search" },
  { name: "OrdersPage", description: "Orders history with filters" },
  { name: "SettingsPage", description: "User settings and profile" },
  { name: "AdminPage", description: "Admin panel for user management" },
];

// Create all Task delegations in one message for parallelization
pages.forEach(page => {
  Task(
    description=`Generate ${page.name}`,
    prompt=`Create ${page.name} component.

    ${page.description}

    Requirements:
    - Use AppLayout wrapper
    - Follow design system (dark mode, Tailwind, shadcn/ui)
    - Implement loading/error/empty states
    - Use TanStack Query for data fetching
    - Use apiClient for API calls

    Available entities: users, products, orders
    API client: import { apiClient } from '@/lib/api-client'

    Output: Complete page component with all states handled
    `,
    subagent_type="code_writer"
  );
});
```

**Scenario 3: Schema Design**

```typescript
// ALWAYS delegate schema creation to schema_designer

Task(
  description="Design database schema",
  prompt=`Design complete database schema for the application.

  Based on plan.md:
  - Users (authentication)
  - Products (marketplace items)
  - Orders (purchase records)
  - Reviews (product reviews)
  - Categories (product organization)

  Relationships:
  - User has many Products (seller)
  - User has many Orders (buyer)
  - Order belongs to User
  - Product has many Reviews
  - Review belongs to User and Product
  - Product belongs to Category

  Create:
  1. shared/schema.zod.ts - Zod schemas (source of truth)
  2. shared/schema.ts - Drizzle ORM schemas

  Ensure:
  - Field name parity between Zod and Drizzle
  - Proper foreign key relationships
  - Cascade delete where appropriate
  - Validation constraints (min, max, email, etc.)
  - Insert schemas for all tables
  `,
  subagent_type="schema_designer"
)
```

---

## Session Management

### Session Lifecycle

**1. New App Generation**:
- Create fresh UUID session ID
- Initialize `generation_context` with app metadata
- Save to `.agent_session.json` in app directory
- Track features, entities, original request

**2. Resume/Modification**:
- Load existing session from app directory
- Validate UUID format
- Resume with same session ID for context continuity
- Update `last_action` and `last_modified`

**3. Session Context**:
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "app_path": "/Users/user/apps/app-factory/apps/marketplace/app",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "context": {
    "app_name": "marketplace",
    "original_request": "Create a marketplace for advisory boards",
    "features": [
      "User authentication",
      "Product listings",
      "Search and filters",
      "Payment processing"
    ],
    "entities": ["users", "products", "orders", "reviews"],
    "generated_at": "2025-01-15T10:00:00.000Z",
    "last_action": "Add dark mode toggle to settings",
    "last_modified": "2025-01-15T10:30:00.000Z"
  }
}
```

**4. Session Recovery**:
- Handles expired sessions (creates new session)
- Validates UUID format before resume
- Graceful fallback on errors
- Forces client cleanup if session process terminated

### Interactive Mode Commands

**Available in run-app-generator.py after generation**:

- `/context` - Show current session information
- `/save` - Explicitly save session
- `/clear` - Remove session and start fresh
- `done`, `exit`, `quit` - Exit interactive mode

### Git Integration with Sessions

**Initial Commit**:
```
feat: Initial generation of marketplace

Generated with AI App Factory
Features: User auth, Product listings, Search

Session ID: 550e8400
Co-Authored-By: Claude <noreply@anthropic.com>
```

**Checkpoint Commits** (before modifications):
```
checkpoint: Before adding dark mode support

User request: Add dark mode toggle to settings
Expanded: Implement dark mode with theme switcher...

Session ID: 550e8400
```

**Changelog** (`{app-name}.md`):
```markdown
# Marketplace - Development Changelog

---

## Jan 15, 2025 10:30 AM - Modification

**Request**: Add dark mode toggle to settings

**Changes**:
- client/src/components/ThemeToggle.tsx
- client/src/contexts/ThemeContext.tsx
- client/src/pages/SettingsPage.tsx

**Session ID**: 550e8400-e29b-41d4-a716-446655440000

---

## Jan 15, 2025 10:00 AM - Initial Generation

**Request**: Create a marketplace for advisory boards

**Features Added/Modified**:
- User authentication
- Product listings
- Search and filters

**Git Commit**: a1b2c3d4
**Session ID**: 550e8400-e29b-41d4-a716-446655440000

---
```

---

## Factory Pattern Architecture

### Why Factory Pattern?

**Problem**: How to support both development and production environments with the same code?

**Solution**: Factory pattern with environment-based selection

**Benefits**:
- One codebase, two modes
- No code changes to switch environments
- Type-safe interfaces ensure compatibility
- Easy to add new implementations (e.g., Firebase auth)

### Auth Factory Implementation

**Interface** (contract):
```typescript
export interface IAuthAdapter {
  login(email: string, password: string): Promise<{ user: any; token: string }>;
  signup(email: string, password: string, name: string): Promise<{ user: any; token: string }>;
  verifyToken(token: string): Promise<any>;
  logout(token: string): Promise<void>;
}
```

**Factory** (selector):
```typescript
export function createAuth(): IAuthAdapter {
  const mode = process.env.AUTH_MODE || 'mock';

  if (mode === 'supabase') return supabaseAuth;
  return mockAuth;
}

export const auth = createAuth(); // Singleton
```

**Implementations**:
- `mockAuth` - Development (accepts any credentials)
- `supabaseAuth` - Production (real Supabase API)

**Usage in Routes**:
```typescript
import { auth } from '../lib/auth/factory';

// Same code works in both modes!
router.post('/api/auth/login', async (req, res) => {
  const result = await auth.login(email, password);
  res.json(result);
});
```

### Storage Factory Implementation

**Interface** (contract):
```typescript
export interface IStorage {
  getUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  // ... CRUD for ALL entities
}
```

**Factory** (selector):
```typescript
export function createStorage(): IStorage {
  const mode = process.env.STORAGE_MODE || 'memory';

  if (mode === 'database') return new DatabaseStorage();
  return new MemoryStorage();
}

export const storage = createStorage(); // Singleton
```

**Implementations**:
- `MemoryStorage` - Development (in-memory arrays)
- `DatabaseStorage` - Production (PostgreSQL via Drizzle)

**Usage in Routes**:
```typescript
import { storage } from '../lib/storage/factory';

// Same code works in both modes!
router.get('/api/users', async (req, res) => {
  const users = await storage.getUsers();
  res.json(users);
});
```

### Environment-Based Switching

**Development** (`.env`):
```bash
AUTH_MODE=mock
STORAGE_MODE=memory
```

**Production** (`.env`):
```bash
AUTH_MODE=supabase
STORAGE_MODE=database
SUPABASE_URL=https://...
DATABASE_URL=postgresql://...
```

**No Code Changes Required** - factory pattern handles everything!

---

## Critical Implementation Details

### 1. Schema-First Development

**Principle**: `schema.zod.ts` is the SINGLE source of truth

**Flow**:
```
schema.zod.ts (Zod schemas)
    ↓
schema.ts (Drizzle tables)
    ↓
contracts/*.contract.ts (API definitions)
    ↓
TypeScript types (inferred)
    ↓
Runtime validation + Database operations + API contracts
```

**Why Zod First**:
- Runtime validation (API requests, form inputs)
- Type inference (TypeScript types derived from Zod)
- Schema evolution (change once, propagates everywhere)
- Developer experience (write schema once, use everywhere)

### 2. Field Name Parity (Zod ↔ Drizzle)

**CRITICAL**: Drizzle automatically converts between camelCase and snake_case

**Zod** (camelCase):
```typescript
export const users = z.object({
  id: z.number(),
  createdAt: z.string().datetime(),
  userId: z.number(),
});
```

**Drizzle** (snake_case):
```typescript
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow(),
  userId: integer('user_id'),
});
```

**Runtime** (automatic conversion):
- Database stores as `created_at`
- Drizzle returns as `createdAt`
- TypeScript sees `createdAt`
- No manual conversion needed!

**DO NOT**:
- Manually convert field names in code
- Use different field names between Zod and Drizzle
- Mix camelCase and snake_case in the same layer

### 3. ts-rest v3 Authorization Getter

**CRITICAL**: Must use getter property, NOT function

**WRONG** (function, evaluated once):
```typescript
baseHeaders: {
  Authorization: () => {
    return localStorage.getItem('auth_token');
  }
}
```

**CORRECT** (getter, evaluated every request):
```typescript
baseHeaders: {
  get Authorization() {
    const token = localStorage.getItem('auth_token');
    return token ? `Bearer ${token}` : '';
  }
}
```

**Why Getter**:
- Re-evaluated on EVERY API call
- Always uses fresh token
- Works after login/logout
- No manual header management

### 4. Auth Routes Use Direct Fetch

**Why NOT use apiClient for auth endpoints**?

Because we don't have a token yet!

```typescript
// Login endpoint - no token available
const login = async (email: string, password: string) => {
  // Use direct fetch, not apiClient
  const response = await fetch(`${apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  // Save token for future apiClient calls
  setAuthToken(data.token);
};
```

**After login**: All other API calls use `apiClient` (auto-injects token)

### 5. Protected Routes Pattern

**Middleware** (server):
```typescript
router.post('/api/products', authMiddleware(), async (req, res) => {
  // req.user available here (set by middleware)
  const product = await storage.createProduct({
    ...req.body,
    userId: req.user.id, // Auto-attach user ID
  });
});
```

**Component** (client):
```typescript
<Route path="/dashboard">
  <ProtectedRoute>
    <DashboardPage />
  </ProtectedRoute>
</Route>
```

**Flow**:
1. User tries to access `/dashboard`
2. `ProtectedRoute` checks `isAuthenticated`
3. If false → redirect to `/login`
4. If true → render `<DashboardPage />`

### 6. TanStack Query Integration

**Pattern**: Separate query key, query function, mutation function

```typescript
// List query
const { data, isLoading, error } = useQuery({
  queryKey: ['products'],
  queryFn: async () => {
    const response = await apiClient.products.getProducts();
    if (response.status !== 200) throw new Error('Failed');
    return response.body;
  },
});

// Create mutation
const createMutation = useMutation({
  mutationFn: async (data) => {
    const response = await apiClient.products.createProduct({ body: data });
    if (response.status !== 201) throw new Error('Failed');
    return response.body;
  },
  onSuccess: () => {
    // Invalidate list query to refetch
    queryClient.invalidateQueries({ queryKey: ['products'] });
  },
});
```

### 7. Wouter Navigation

**Link Component** (renders `<a>`, don't wrap):
```typescript
// CORRECT
<Link href="/products" className="text-foreground">
  Products
</Link>

// WRONG (creates nested <a>)
<a href="/products">
  <Link href="/products">Products</Link>
</a>
```

**Programmatic Navigation**:
```typescript
import { useLocation } from 'wouter';

const [, setLocation] = useLocation();

// Navigate programmatically
setLocation('/dashboard');
```

### 8. Unsplash Image URLs

**Format**: `https://images.unsplash.com/{width}x{height}/?{keywords}`

**Examples**:
- Hero: `/1200x400/?business,technology`
- Card: `/400x300/?product,${productName}`
- Avatar: `/200x200/?person,portrait`

**Best Practices**:
- Use descriptive keywords
- Match image size to usage
- Add alt text for accessibility

### 9. Error Boundaries

**Every page should handle**:
- Loading state (spinner + message)
- Error state (destructive styling + retry option)
- Empty state (message + call-to-action)

**Example**:
```typescript
{isLoading && <LoadingState />}
{error && <ErrorState error={error} />}
{!isLoading && !error && data?.length === 0 && <EmptyState />}
{!isLoading && !error && data && data.length > 0 && <DataGrid data={data} />}
```

### 10. Environment Variable Access

**Server** (Node.js):
```typescript
process.env.AUTH_MODE
process.env.DATABASE_URL
```

**Client** (Vite):
```typescript
import.meta.env.VITE_API_URL
```

**CRITICAL**: Client env vars MUST be prefixed with `VITE_`

---

## Success Criteria

### Backend Checklist

- ✅ `schema.zod.ts` created FIRST
- ✅ All entities have Zod schemas (table + insert)
- ✅ Drizzle schemas match Zod schemas (field parity)
- ✅ ts-rest contracts reference Zod schemas
- ✅ Auth factory with mock + Supabase implementations
- ✅ Storage factory with memory + database implementations
- ✅ Auth middleware protects routes
- ✅ All routes use `storage` singleton
- ✅ User ID auto-attached from `req.user`
- ✅ Error responses include `{ error: string }`
- ✅ Logging for debugging

### Frontend Checklist

- ✅ `api-client.ts` uses getter for Authorization header
- ✅ `AuthContext` provides login/signup/logout
- ✅ All pages wrapped in `<AppLayout>`
- ✅ Protected routes use `<ProtectedRoute>`
- ✅ Dark mode colors throughout
- ✅ Tailwind CSS + shadcn/ui components
- ✅ Unsplash images where appropriate
- ✅ Loading/error/empty states on all pages
- ✅ TanStack Query for data fetching
- ✅ Responsive design (mobile, tablet, desktop)

### Developer Experience Checklist

- ✅ `npm install && npm run dev` works immediately
- ✅ No configuration needed for development
- ✅ TypeScript strict mode passes
- ✅ ESLint passes
- ✅ `npm run build` succeeds
- ✅ Fast HMR with Vite
- ✅ Clear error messages

### Production Readiness Checklist

- ✅ Change 2 env vars → production mode
- ✅ Supabase auth ready (just add credentials)
- ✅ PostgreSQL database ready (just add connection)
- ✅ Type-safe end-to-end
- ✅ No breaking changes between modes
- ✅ Build optimized for production

---

## Conclusion

This pipeline transforms natural language prompts into production-ready full-stack applications through a carefully orchestrated three-stage process (Plan → Build → Validate) with schema-first development, factory pattern architecture, and comprehensive quality validation.

**Key Takeaways**:

1. **Schema First**: `schema.zod.ts` is the foundation, everything derives from it
2. **Factory Pattern**: One codebase, two modes (dev/production)
3. **Type Safety**: End-to-end from database to UI
4. **Writer-Critic**: Quality through iterative validation
5. **Subagent Delegation**: Specialized agents for complex tasks
6. **Session Management**: Context continuity across modifications
7. **Development First**: Zero config for immediate `npm run dev`

The result: Apps that work immediately in development and are deployment-ready with minimal configuration changes.
