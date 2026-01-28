# Pipeline Refactor Plan

## Problem Statement

The current `pipeline-prompt.md` is **~2000 lines** of accumulated guidance, workarounds, conflict resolutions, and micromanagement. It should be **~300 lines** of clear orchestration.

### Current Issues

1. **Extreme verbosity** - 2000 lines when 300 would suffice
2. **Inline code examples** - should be in skills/templates
3. **"CONFLICT RESOLVED" sections** - accumulated confusion from iterative fixes
4. **Same information repeated 5+ times** - skills exist but aren't trusted
5. **Debugging tips scattered throughout** - should be in troubleshooting doc
6. **Historical context** - "why we did this" isn't needed for execution
7. **Micromanagement** - "Read SKILL.md COMPLETELY" appears 47 times

---

## First Principles: The Pipeline is a Dependency Graph

The pipeline exists because of **TypeScript imports**. If File B imports from File A, File A must exist first. That's the ONLY fundamental constraint.

### The Dependency Graph

```
                    ┌─────────────────┐
                    │  User Prompt    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   plan/plan.md  │  (understand requirements)
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
┌────────▼────────┐ ┌────────▼────────┐         │
│ schema.zod.ts   │ │   schema.ts     │         │
│ (Zod schemas)   │ │ (Drizzle tables)│         │
└────────┬────────┘ └────────┬────────┘         │
         │                   │                   │
         │          ┌────────▼────────┐         │
         │          │  Supabase MCP   │         │
         │          │ (needs schema   │         │
         │          │  for SQL)       │         │
         │          └────────┬────────┘         │
         │                   │                   │
┌────────▼────────┐ ┌────────▼────────┐         │
│   contracts/    │ │    db.ts        │         │
│ *.contract.ts   │ │ (Drizzle client)│         │
│ (imports zod)   │ └────────┬────────┘         │
└────────┬────────┘          │                   │
         │          ┌────────▼────────┐         │
         │          │  storage/       │         │
         │          │ (uses db)       │         │
         │          └────────┬────────┘         │
         │                   │                   │
         │          ┌────────▼────────┐         │
         │          │  auth/          │         │
         │          │ (factory)       │         │
         │          └────────┬────────┘         │
         │                   │                   │
┌────────▼────────┐ ┌────────▼────────┐         │
│  api-client.ts  │ │ server/routes/  │         │
│ (uses contract) │ │ (uses storage,  │         │
└────────┬────────┘ │  auth, contract)│         │
         │          └────────┬────────┘         │
         │                   │                   │
         │          ┌────────▼────────┐         │
         │          │ server/index.ts │         │
         │          │ (mounts routes) │         │
         │          └─────────────────┘         │
         │                                       │
┌────────▼────────┐                   ┌─────────▼────────┐
│ AuthContext.tsx │                   │ Design System    │
│ (uses api-client│                   │ (index.css,      │
│  or direct fetch│                   │  tailwind.config)│
└────────┬────────┘                   └─────────┬────────┘
         │                                       │
         └───────────────────┬───────────────────┘
                             │
                    ┌────────▼────────┐
                    │     App.tsx     │
                    │   + pages/*.tsx │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   Validation    │
                    └─────────────────┘
```

---

## The 9-Phase Pipeline

| Phase | Name | Artifacts | Depends On | Skill |
|-------|------|-----------|------------|-------|
| **0** | Setup | Directory structure, .claude/agents | Nothing | - |
| **1** | Schema | `schema.zod.ts`, `schema.ts` | Nothing | `schema-designer` |
| **2** | Contracts | `contracts/*.contract.ts` | schema.zod.ts | `api-architect` |
| **3** | Supabase | `.env`, `supabase/` | schema.ts | `supabase-project-setup` |
| **4** | DB & Storage | `db.ts`, `storage/` | schema.ts, .env | `drizzle-orm-setup` |
| **5** | Auth | `auth/`, `middleware/` | Nothing | `factory-lazy-init` |
| **6** | Routes | `routes/*.ts`, `index.ts` | contracts, storage, auth | `code-writer` |
| **7** | API Client | `api-client.ts`, `AuthContext.tsx` | contracts | - |
| **8** | UI | `index.css`, `App.tsx`, `pages/*.tsx` | api-client | `ui-designer` |
| **9** | Validate | - | Everything | - |

---

## Phase Details

### Phase 0: Setup

**Purpose**: Initialize project structure and copy agent/skill definitions.

**Artifacts**:
```
{app_path}/
├── .claude/
│   ├── agents/     # Copy from apps/.claude/agents/
│   └── skills/     # Copy from apps/.claude/skills/
├── client/
├── server/
├── shared/
├── package.json
├── tsconfig.json
└── .env
```

**Actions**:
1. Create directory structure
2. Copy `.claude/agents/*.md` from source
3. Copy `.claude/skills/` from source
4. Initialize package.json with dependencies

**Skill**: None needed

---

### Phase 1: Schema (FOUNDATION)

**Purpose**: Define the data model. This is the source of truth for the entire application.

**Artifacts**:
```
shared/
├── schema.zod.ts   # Zod validation schemas (SOURCE OF TRUTH)
└── schema.ts       # Drizzle ORM table definitions
```

**Key Principle**: `schema.zod.ts` is imported by contracts. It MUST exist before Phase 2.

**Skill**: `~/.claude/skills/schema-designer/SKILL.md`

**What the skill teaches**:
- Auto-injected fields (id, createdAt, updatedAt - omit from insert schemas)
- Zod transform order (parse → transform → refine)
- Fixed UUIDs for seed data
- Field parity between Zod and Drizzle

---

### Phase 2: Contracts

**Purpose**: Define type-safe API contracts using ts-rest.

**Artifacts**:
```
shared/contracts/
├── auth.contract.ts
├── users.contract.ts
├── {entity}.contract.ts
└── index.ts         # Barrel export
```

**Depends On**: `schema.zod.ts` (contracts import validation schemas)

**Skill**: `~/.claude/skills/api-architect/SKILL.md`

**What the skill teaches**:
- Contract path consistency (no /api prefix in contract, added at mount)
- Dynamic auth headers (getter function pattern)
- Response serialization (BigInt/Date handling)
- HTTP status codes mapping

---

### Phase 3: Supabase Setup (Optional)

**Purpose**: Provision Supabase project and configure database.

**Artifacts**:
```
{app_path}/
├── .env             # With SUPABASE_URL, keys, DATABASE_URL
└── supabase/        # Supabase CLI directory
```

**Depends On**: `schema.ts` (to generate SQL migration)

**Tool**: `mcp__supabase_setup__create_supabase_project`

**Skill**: `~/.claude/skills/supabase-project-setup/SKILL.md`

**What the skill teaches**:
- Why pooler URL is required (IPv4 compatibility)
- Correct STORAGE_MODE value (`database`, NOT `supabase`)
- What the MCP tool automates

**Note**: This phase is OPTIONAL. Apps can run with `STORAGE_MODE=memory` for development.

---

### Phase 4: Database & Storage

**Purpose**: Set up database client and storage layer with factory pattern.

**Artifacts**:
```
server/lib/
├── db.ts                      # Drizzle client
└── storage/
    ├── factory.ts             # Async factory (NOT Proxy)
    ├── interface.ts           # IStorage interface
    ├── mem-storage.ts         # In-memory (dev)
    └── drizzle-storage.ts     # Drizzle ORM (prod)
```

**Depends On**:
- `schema.ts` (for Drizzle client)
- `.env` (for DATABASE_URL)

**Skills**:
- `~/.claude/skills/drizzle-orm-setup/SKILL.md`
- `~/.claude/skills/factory-lazy-init/SKILL.md`

**What the skills teach**:
- Drizzle client creation with snake_case ↔ camelCase conversion
- Async factory pattern for storage (NOT Proxy)
- Lazy imports to prevent env variable bugs

---

### Phase 5: Auth

**Purpose**: Set up authentication with factory pattern for mock/production switching.

**Artifacts**:
```
server/lib/auth/
├── factory.ts           # Lazy Proxy pattern
├── interface.ts         # IAuthAdapter interface
├── mock-adapter.ts      # Mock auth (dev)
└── supabase-adapter.ts  # Supabase auth (prod)

server/middleware/
└── auth.ts              # Express middleware
```

**Depends On**: Nothing (factory pattern handles env at runtime)

**Skill**: `~/.claude/skills/factory-lazy-init/SKILL.md`

**What the skill teaches**:
- Lazy Proxy pattern for auth (different from storage!)
- Why: auth methods are sync wrappers around async operations
- Standard mock credentials (john@app.com / Demo2025_)

---

### Phase 6: Server Routes

**Purpose**: Implement API endpoints using ts-rest handlers.

**Artifacts**:
```
server/
├── routes/
│   ├── auth.routes.ts
│   ├── users.routes.ts
│   ├── {entity}.routes.ts
│   └── index.ts         # Combined router
└── index.ts             # Express app (mounts at /api)
```

**Depends On**:
- `contracts/` (for type-safe handlers)
- `storage/` (for data operations)
- `auth/` (for middleware)

**Skill**: `~/.claude/skills/code-writer/SKILL.md`

**What the skill teaches**:
- ts-rest handler patterns
- Auth middleware integration
- Storage method calls
- Error handling

---

### Phase 7: API Client & Auth Context

**Purpose**: Set up frontend API client and authentication context.

**Artifacts**:
```
client/src/
├── lib/
│   ├── api-client.ts      # ts-rest client with auth headers
│   └── auth-helpers.ts    # Token management
├── contexts/
│   └── AuthContext.tsx    # Auth state management
└── components/auth/
    └── ProtectedRoute.tsx # Route guard
```

**Depends On**: `contracts/` (api-client uses contract types)

**Skill**: None needed (patterns are straightforward)

**Key Pattern**: Dynamic auth header using getter function:
```typescript
Authorization: () => {
  const token = localStorage.getItem('auth_token');
  return token ? `Bearer ${token}` : '';
}
```

---

### Phase 8: UI (Design System + Pages)

**Purpose**: Create design system and implement all pages.

**Artifacts**:
```
client/src/
├── index.css              # OKLCH colors, design tokens
├── App.tsx                # Router + providers
├── components/
│   ├── ui/                # shadcn/ui components
│   └── layout/
│       └── AppLayout.tsx  # Shared layout
└── pages/
    ├── HomePage.tsx
    ├── LoginPage.tsx
    ├── DashboardPage.tsx
    └── {Entity}Page.tsx

client/
├── tailwind.config.ts
└── postcss.config.js
```

**Depends On**: `api-client.ts` (pages call API)

**Skill**: `~/.claude/skills/ui-designer/SKILL.md`

**What the skill teaches**:
- OKLCH color configuration (NOT hsl!)
- 44px minimum touch targets
- Four-state components (loading, error, empty, success)
- Mobile-first responsive (375px+)
- WCAG 2.2 accessibility

---

### Phase 9: Validation

**Purpose**: Verify the application works end-to-end.

**Checks**:
1. `npm run build` - TypeScript compiles
2. `npm run dev` - Server starts
3. Auth flow works (login → protected route → logout)
4. CRUD operations work

**Subagent**: `quality_assurer`

**Skill**: `~/.claude/skills/production-smoke-test/SKILL.md`

---

## Parallelization Opportunities

```
SEQUENTIAL (must wait):
schema.zod.ts → contracts → api-client → pages

PARALLEL GROUP A (after schema.zod.ts):
├── contracts/*.contract.ts
└── schema.ts

PARALLEL GROUP B (after schema.ts + .env):
├── Supabase provisioning
├── db.ts
└── auth/ (independent of db)

PARALLEL GROUP C (after db.ts):
├── storage/
└── (auth already done)

PARALLEL GROUP D (after storage + auth + contracts):
├── server/routes/*
└── api-client.ts

PARALLEL GROUP E (after api-client):
├── AuthContext.tsx
├── Design system (independent)
└── Individual pages (each independent)
```

---

## Skills Audit Checklist

Each skill should be reviewed to ensure it:
1. Contains ONLY the patterns relevant to its phase
2. Has clear, minimal examples (not verbose)
3. Doesn't duplicate content from other skills
4. Is self-contained (agent can execute after reading just that skill)

| Skill | Phase | Status | Notes |
|-------|-------|--------|-------|
| `schema-designer` | 1 | TO AUDIT | |
| `api-architect` | 2 | TO AUDIT | |
| `supabase-project-setup` | 3 | TO AUDIT | |
| `drizzle-orm-setup` | 4 | TO AUDIT | |
| `factory-lazy-init` | 4, 5 | TO AUDIT | Used by both storage and auth |
| `storage-factory-validation` | 4 | TO AUDIT | May be redundant |
| `supabase-auth` | 5 | TO AUDIT | |
| `code-writer` | 6, 8 | TO AUDIT | |
| `ui-designer` | 8 | TO AUDIT | |
| `schema-query-validator` | 8 | TO AUDIT | May be redundant |
| `production-smoke-test` | 9 | TO AUDIT | |

---

## Subagent Delegation Rules

| Subagent | When to Use |
|----------|-------------|
| `code_writer` | Complex backend routes, complex pages, multi-file implementations |
| `quality_assurer` | After code generation, before declaring complete |
| `error_fixer` | When errors occur (don't debug yourself > 5 min) |
| `research_agent` | Unfamiliar tech, external APIs, complex integrations |
| `ai_integration` | Chat interfaces, AI features, ML integration |

**Simple Rule**: If a task is complex OR you're unsure, delegate. Subagents have embedded patterns.

---

## New Pipeline Prompt Structure (Target: ~300 lines)

```markdown
# Pipeline Prompt

## Overview
Transform user prompt into full-stack app.
Pipeline: Schema → Contracts → Backend → Frontend → Validate

## Phase 1: Schema
Read: ~/.claude/skills/schema-designer/SKILL.md
Create: shared/schema.zod.ts, shared/schema.ts

## Phase 2: Contracts
Read: ~/.claude/skills/api-architect/SKILL.md
Create: shared/contracts/*.contract.ts
Depends: schema.zod.ts

## Phase 3: Supabase (if requested)
Read: ~/.claude/skills/supabase-project-setup/SKILL.md
Tool: mcp__supabase_setup__create_supabase_project
Depends: schema.ts

## Phase 4: Database & Storage
Read: ~/.claude/skills/drizzle-orm-setup/SKILL.md
Read: ~/.claude/skills/factory-lazy-init/SKILL.md
Create: server/lib/db.ts, server/lib/storage/

## Phase 5: Auth
Read: ~/.claude/skills/factory-lazy-init/SKILL.md
Create: server/lib/auth/, server/middleware/auth.ts

## Phase 6: Routes
Read: ~/.claude/skills/code-writer/SKILL.md
Create: server/routes/*.ts, server/index.ts
Depends: contracts, storage, auth

## Phase 7: Frontend Infrastructure
Create: api-client.ts, AuthContext.tsx, ProtectedRoute.tsx
Depends: contracts

## Phase 8: UI
Read: ~/.claude/skills/ui-designer/SKILL.md
Create: index.css, tailwind.config.ts, App.tsx, pages/*.tsx
Depends: api-client

## Phase 9: Validate
Delegate: quality_assurer
Checks: build, dev server, auth flow

## Delegation
- Complex tasks → delegate to subagents
- Errors → delegate to error_fixer
- Validation → delegate to quality_assurer

## Dependencies (Critical)
schema.zod.ts → contracts → api-client → pages
schema.ts → Supabase → db.ts → storage → routes
```

---

## Next Steps

1. **Audit each skill** - Review content, remove duplication, ensure self-contained
2. **Consolidate redundant skills** - Some may be mergeable
3. **Write new pipeline-prompt.md** - ~300 lines, orchestration only
4. **Move code examples to templates** - Keep pipeline clean
5. **Test with fresh app generation** - Verify simplified pipeline works
