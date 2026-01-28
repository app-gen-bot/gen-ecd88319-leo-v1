# Supabase Architecture for App Factory SaaS

> Decision document for database provisioning strategy
>
> **Status**: APPROVED
> **Date**: 2025-12-13
> **Decision**: Hybrid model with platform-owned free tier pool + user-owned connected tier

## Executive Summary

**Agreed Approach:**
1. **MVP (Monday)**: Platform-owned pool of 5-10 Supabase projects for zero-friction first experience
2. **Week 2**: Add OAuth flow for users to connect their own Supabase
3. **End State**: Hybrid model where free tier uses our pool, connected users choose per-project or pooled mode in their own org

**Key Principle**: Users should experience a working generated app before being asked to connect external services.

---

## Overview

App Factory generates full-stack applications that use Supabase for:
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: Supabase Auth (email/password, OAuth providers)
- **Storage**: Supabase Storage (file uploads)
- **Realtime**: Supabase Realtime (subscriptions)

During generation, the agent needs a **real database** to:
1. Apply Drizzle migrations
2. Test CRUD operations
3. Run the app with Chrome DevTools for validation

We've moved away from `AUTH_MODE=mock` and `STORAGE_MODE=memory` because mocks push "last mile" work to human developers.

---

## Proposed Model: User-Owned with Mode Selection

### User Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        New Project Setup                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   1. User creates new project in App Factory                            │
│                                                                          │
│   2. "How should we handle your database?"                              │
│                                                                          │
│      ┌─────────────────────┐    ┌─────────────────────┐                │
│      │   Per-Project DB    │    │   Pooled DB         │                │
│      │   (Recommended)     │    │   (Ephemeral)       │                │
│      ├─────────────────────┤    ├─────────────────────┤                │
│      │ • Dedicated project │    │ • Shared/reused     │                │
│      │ • Persistent data   │    │ • Reset each run    │                │
│      │ • Full Supabase     │    │ • Quick iterations  │                │
│      │ • Production-ready  │    │ • Development only  │                │
│      └─────────────────────┘    └─────────────────────┘                │
│                                                                          │
│   3. "Connect your Supabase account"                                    │
│      → OAuth flow (same for both modes)                                 │
│      → We get permission to manage projects in their org                │
│                                                                          │
│   4. We create project(s) in THEIR Supabase org                        │
│      Per-Project: "appfactory-{app-name}-{short-id}"                   │
│      Pooled: "appfactory-pool-01", "appfactory-pool-02", etc.          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Mode Comparison

| Aspect | Per-Project | Pooled |
|--------|-------------|--------|
| **Ownership** | User's Supabase org | User's Supabase org |
| **Persistence** | Data survives generations | Reset between generations |
| **Project count** | 1 per app | N shared across apps |
| **Best for** | Production apps | Rapid prototyping |
| **Supabase plan needed** | Free (2 projects) or Pro | Pro (for multiple pools) |

---

## Technical Implementation

### Supabase OAuth + Management API

```typescript
// 1. Initiate OAuth
const authUrl = `https://api.supabase.com/v1/oauth/authorize?
  client_id=${SUPABASE_CLIENT_ID}&
  redirect_uri=${CALLBACK_URL}&
  response_type=code&
  scope=projects:create projects:delete projects:read`;

// 2. Exchange code for token (on callback)
const { access_token, refresh_token } = await exchangeCode(code);

// 3. Store encrypted tokens for user
await db.users.update({
  where: { id: userId },
  data: {
    supabaseAccessToken: encrypt(access_token),
    supabaseRefreshToken: encrypt(refresh_token),
  }
});

// 4. Create project via Management API
const project = await fetch('https://api.supabase.com/v1/projects', {
  method: 'POST',
  headers: { Authorization: `Bearer ${access_token}` },
  body: JSON.stringify({
    name: `appfactory-pool-01`,
    organization_id: userOrgId,
    region: 'us-east-1',
    plan: 'free', // or inherit from user's plan
  })
});

// 5. Get connection details
const { db_host, db_port, anon_key, service_role_key } = project;
```

### Pool Manager

```typescript
interface SupabaseProject {
  id: string;
  name: string;
  connectionString: string;
  supabaseUrl: string;
  anonKey: string;
  serviceRoleKey: string;
}

class SupabasePoolManager {
  // Lease a pooled project for a generation
  async acquire(userId: string, generationId: string): Promise<SupabaseProject> {
    // Find available pool project for this user
    const available = await this.findAvailablePool(userId);

    if (!available) {
      // Create new pool project in user's org
      const userTokens = await this.getUserSupabaseTokens(userId);
      const newProject = await this.createPoolProject(userTokens);
      return this.lease(newProject, generationId);
    }

    return this.lease(available, generationId);
  }

  // Release and reset for next use
  async release(generationId: string): Promise<void> {
    const project = this.getLeased(generationId);
    await this.resetDatabase(project); // Drop all tables
    this.leases.delete(generationId);
  }

  // Standard naming convention
  private getPoolName(index: number): string {
    return `appfactory-pool-${String(index).padStart(2, '0')}`;
  }
}
```

### Naming Convention

```
Per-Project Mode:
  appfactory-{app-name}-{8-char-id}
  Examples:
    appfactory-todo-app-a1b2c3d4
    appfactory-fitness-tracker-e5f6g7h8

Pooled Mode:
  appfactory-pool-{2-digit-index}
  Examples:
    appfactory-pool-01
    appfactory-pool-02
    appfactory-pool-03
```

---

## Potential Issues

### 1. Supabase Project Limits

**Problem**: Free tier = 2 projects. Pooled mode with 3+ parallel generations exceeds this.

**Impact**: Users hit limits quickly, forced to upgrade Supabase plan.

**Mitigation**:
- Clear messaging: "Pooled mode requires Supabase Pro for 3+ parallel generations"
- Start with 2 pool projects on free tier
- Prompt upgrade when they need more parallelism

### 2. Project Creation Latency

**Problem**: New Supabase projects take 30-60 seconds to provision.

**Impact**: First generation has cold start delay.

**Mitigation**:
- Pre-create pool projects during OAuth callback
- Show "Setting up your workspace..." with progress
- For per-project mode, create project while user reviews app spec

### 3. Naming Collisions

**Problem**: User might already have `appfactory-pool-01` in their org.

**Impact**: Project creation fails.

**Mitigation**:
- Check for existing projects before creating
- Add random suffix if collision: `appfactory-pool-01-x7k9`
- Or use UUIDs: `appfactory-pool-a1b2c3d4`

### 4. Cleanup Responsibility

**Problem**: Who deletes old/unused pooled projects?

**Impact**: User's Supabase org accumulates orphaned projects.

**Mitigation**:
- Dashboard shows "Your App Factory Projects" with delete button
- Auto-cleanup inactive pools after 30 days (with warning email)
- Clear ownership: "These projects are in YOUR Supabase org"

### 5. Cost Confusion

**Problem**: Users might not realize pool projects count against their Supabase limits/billing.

**Impact**: Surprise bills, angry users.

**Mitigation**:
- Explicit messaging: "This will create X projects in your Supabase account"
- Show current project count vs limit before creation
- Link to Supabase billing page

### 6. OAuth Permission Anxiety

**Problem**: "This app wants to manage your Supabase projects" feels scary.

**Impact**: Users abandon onboarding.

**Mitigation**:
- Clear explanation of what we do and don't access
- "We only create/manage projects prefixed with 'appfactory-'"
- Show exactly which permissions we request
- Option to revoke access anytime

### 7. Org Permission Issues

**Problem**: User might not be admin of their Supabase organization.

**Impact**: OAuth succeeds but project creation fails.

**Mitigation**:
- Check org permissions after OAuth
- Clear error: "You need Owner or Admin role in your Supabase org"
- Suggest: "Ask your org admin to grant permissions, or create a new org"

### 8. Database Reset Risk

**Problem**: Resetting wrong project could destroy production data.

**Impact**: Catastrophic data loss.

**Mitigation**:
- Only reset projects matching `appfactory-pool-*` pattern
- Never reset `appfactory-{app-name}-*` projects (per-project mode)
- Double-check project ID matches expected before any destructive operation
- Audit log of all reset operations

---

## User Friction Analysis

### Friction Points

| Step | Friction | Severity | Notes |
|------|----------|----------|-------|
| Requires Supabase account | Medium | User must sign up for external service |
| OAuth authorization | Medium | Permission grant feels risky |
| Mode selection | Low | Clear options, but adds decision |
| Project limits | High | Free tier only gets 2 projects |
| Waiting for provisioning | Low | 30-60s one-time delay |

### Compared to Competitors

| Platform | Database Setup | Friction Level |
|----------|---------------|----------------|
| **Lovable** | OAuth to user's Supabase | Medium |
| **Replit** | Built-in (Replit DB) | Low |
| **Bolt.new** | User deploys themselves | High |
| **App Factory (proposed)** | OAuth to user's Supabase | Medium |

---

## Agreed Architecture: Hybrid Tier Model

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    AGREED: Tier-Based Model                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   FREE TIER (Try before connecting) ← MVP MONDAY                        │
│   ├── PLATFORM-OWNED pool of Supabase projects                          │
│   ├── Ephemeral, reset between generations                              │
│   ├── Limited: 3 generations/day, 1 parallel                            │
│   ├── Zero friction: no Supabase account needed                         │
│   └── "Connect Supabase to unlock more"                                 │
│                                                                          │
│   CONNECTED TIER (User's Supabase) ← WEEK 2                             │
│   ├── OAuth to user's Supabase org                                      │
│   ├── User chooses: Per-project OR Pooled mode                          │
│   ├── WE create projects in THEIR org (standard naming)                 │
│   ├── Unlimited generations                                             │
│   └── Full parallelism (based on their Supabase plan)                   │
│                                                                          │
│   PRO TIER (Future)                                                     │
│   ├── We provision dedicated Supabase in OUR org                        │
│   ├── User pays us, we handle Supabase billing                          │
│   └── White-glove, enterprise features                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Why This Model

1. **Zero-friction first experience**: Users see a working app before connecting anything
2. **User ownership when ready**: Connected tier puts data in their org
3. **Consistent creation flow**: OAuth + Management API for both per-project and pooled
4. **Standard naming**: `appfactory-pool-XX` or `appfactory-{app}-{id}` in their org
5. **Scales with user**: Free → Connected → Pro as needs grow

### Key Decision: SaaS Creates All Projects

Whether pooled or per-project, **the SaaS creates the Supabase projects** via Management API. Users never manually enter credentials. This eliminates:
- Copy/paste errors
- Credential exposure
- Configuration mismatch

### MVP Monday: Platform-Owned Pool

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     MVP Architecture (Monday)                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   App Factory Platform                                                   │
│   └── Supabase Org: "app-factory-platform"                              │
│       ├── appfactory-pool-01  ←┐                                        │
│       ├── appfactory-pool-02  ←┼── Leased to generations                │
│       ├── appfactory-pool-03  ←┤   Reset between uses                   │
│       ├── appfactory-pool-04  ←┤   DatabaseResetManager                 │
│       └── appfactory-pool-05  ←┘                                        │
│                                                                          │
│   Credentials stored in AWS Secrets Manager:                            │
│   └── leo/supabase-pool-01-url                                          │
│   └── leo/supabase-pool-01-anon-key                                     │
│   └── leo/supabase-pool-01-service-role-key                             │
│   └── leo/supabase-pool-01-database-url                                 │
│   └── ... (repeat for each pool project)                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Cost**: ~$50-100/month for 5-10 projects
**Capacity**: 5-10 parallel generations
**Friction**: Zero (no user setup required)

---

## Implementation Phases

### Phase 1: Monday MVP (Free Tier Pool) ✅ COMPLETE

**Goal**: Zero-friction first experience with platform-owned pool

- [ ] Create Supabase org "app-factory-platform"
- [ ] Pre-create 5 projects: `appfactory-pool-01` through `appfactory-pool-05`
- [x] ~~Store credentials in AWS Secrets Manager~~ → Stored in .env, passed by container manager
- [x] DatabaseResetManager for cleaning between generations
- [x] SupabasePoolManager for lease/release allocation
- [x] Update container to receive pool assignment
- [ ] Fargate deployment with pool support

**Completed:**
- `DatabaseResetManager` created (`leo-container/src/runtime/managers/db_reset_manager.py`)
- `asyncpg` added to requirements
- Integration into WSI client (calls reset before generation, skips in per-app mode)
- `SupabasePoolManager` created (`remote/cli/src/supabase-pool.ts`)
- Container manager integrates pool allocation
- `.env.example` updated with pool configuration
- Two modes supported: pooled and per-app

---

## Leo-Remote Implementation

Leo-remote is the development/testing environment for the Leo container, WSI server, and container manager. It supports two Supabase modes configurable via `.env`.

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Leo-Remote Supabase Flow                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   .env                                                                   │
│   ├── SUPABASE_MODE=pooled|per-app                                      │
│   ├── SUPABASE_POOL_N_* (pooled mode)                                   │
│   └── SUPABASE_ACCESS_TOKEN (per-app mode)                              │
│           │                                                              │
│           ▼                                                              │
│   ┌─────────────────────┐                                               │
│   │ SupabasePoolManager │ ← Reads config at startup                     │
│   │ (supabase-pool.ts)  │                                               │
│   └─────────────────────┘                                               │
│           │                                                              │
│           │ acquire(generationId)                                       │
│           ▼                                                              │
│   ┌─────────────────────┐                                               │
│   │  Container Manager  │ ← Passes credentials as env vars              │
│   │ (container-manager) │                                               │
│   └─────────────────────┘                                               │
│           │                                                              │
│           │ SUPABASE_URL or SUPABASE_ACCESS_TOKEN                       │
│           ▼                                                              │
│   ┌─────────────────────┐                                               │
│   │   Leo Container     │                                               │
│   │   (WSI Client)      │                                               │
│   └─────────────────────┘                                               │
│           │                                                              │
│           ├── Pooled: DatabaseResetManager drops tables                 │
│           └── Per-app: Agent creates project via Supabase MCP           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Mode 1: Pooled (Cost-Effective Development)

**Use case**: Jake's setup - reuse pre-created projects across generations

**Configuration** (`.env`):
```bash
SUPABASE_MODE=pooled

# Pool project 1
SUPABASE_POOL_1_URL=https://xxx.supabase.co
SUPABASE_POOL_1_ANON_KEY=eyJ...
SUPABASE_POOL_1_SERVICE_ROLE_KEY=eyJ...
SUPABASE_POOL_1_DATABASE_URL=postgresql://...

# Pool project 2 (for concurrent generations)
SUPABASE_POOL_2_URL=https://yyy.supabase.co
SUPABASE_POOL_2_ANON_KEY=eyJ...
SUPABASE_POOL_2_SERVICE_ROLE_KEY=eyJ...
SUPABASE_POOL_2_DATABASE_URL=postgresql://...
```

**Flow**:
1. `SupabasePoolManager` reads pool config from environment
2. On generation start: `acquire(generationId)` → returns available pool project
3. Container manager passes `SUPABASE_URL`, `DATABASE_URL`, etc. as env vars
4. Container's `DatabaseResetManager` drops all tables (clean slate)
5. Agent uses provided credentials
6. On generation complete: `release(generationId)` → pool project available again

**Concurrency**: N pool projects = N concurrent generations

### Mode 2: Per-App (Isolated Development)

**Use case**: Coworker's setup - fresh project per generation

**Configuration** (`.env`):
```bash
SUPABASE_MODE=per-app
SUPABASE_ACCESS_TOKEN=sbp_xxxxx
```

**Flow**:
1. `SupabasePoolManager` sees per-app mode
2. On generation start: returns only `SUPABASE_ACCESS_TOKEN`
3. Container manager passes token as env var
4. Container skips `DatabaseResetManager` (no `DATABASE_URL`)
5. Agent uses Supabase MCP tool to create new project
6. Agent receives credentials from newly created project
7. Project persists in user's Supabase org after generation

**Concurrency**: Unlimited (each generation creates its own project)

### Key Files

| File | Purpose |
|------|---------|
| `remote/cli/src/supabase-pool.ts` | Pool manager with acquire/release |
| `remote/cli/src/container-manager.ts` | Integrates pool, passes creds to container |
| `leo-container/src/runtime/managers/db_reset_manager.py` | Resets database in pooled mode |
| `leo-container/src/runtime/wsi/client.py` | Calls reset (pooled) or skips (per-app) |
| `remote/.env.example` | Configuration template |

### Why Credentials Don't Come from AWS Secrets Manager

Originally, Supabase credentials were in AWS Secrets Manager. We changed this because:

1. **Pool allocation**: Container manager must choose WHICH pool project to use
2. **Per-app mode**: No pre-existing credentials - agent creates project
3. **Flexibility**: Different developers can have different setups via `.env`

AWS Secrets Manager is still used for platform secrets (GitHub bot token, etc.), just not for Supabase pool credentials.

---

---

## Alternative: Postgres Sidecar for Fargate

For maximum cost efficiency and isolation, consider running a Postgres container as a sidecar to each Leo container in Fargate instead of using shared Supabase projects.

### Options Compared

| Option | Image | Size | Startup | What You Get |
|--------|-------|------|---------|--------------|
| `postgres:16-alpine` | Plain Postgres | ~80MB | ~2s | Database only |
| `supabase/postgres:15` | Postgres + extensions | ~500MB | ~5s | Database + pgvector, etc. |
| `supabase start` | Full stack | ~2GB | ~60s | Auth, Storage, Realtime, everything |

### Fargate Task Definition with Sidecar

```json
{
  "family": "leo-generation-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "2048",
  "memory": "4096",
  "containerDefinitions": [
    {
      "name": "leo-container",
      "image": "YOUR_ECR_REPO/leo-container:latest",
      "essential": true,
      "environment": [
        {"name": "DATABASE_URL", "value": "postgresql://postgres:postgres@localhost:5432/app"},
        {"name": "SUPABASE_URL", "value": ""},
        {"name": "AUTH_MODE", "value": "mock"}
      ],
      "dependsOn": [
        {"containerName": "postgres", "condition": "START"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/leo-generation",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "leo"
        }
      }
    },
    {
      "name": "postgres",
      "image": "postgres:16-alpine",
      "essential": true,
      "environment": [
        {"name": "POSTGRES_PASSWORD", "value": "postgres"},
        {"name": "POSTGRES_DB", "value": "app"},
        {"name": "POSTGRES_USER", "value": "postgres"}
      ],
      "memory": 512,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/leo-generation",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "postgres"
        }
      }
    }
  ]
}
```

### Cost Comparison at Scale

| Approach | 100 gen/day | 1000 gen/day | 10000 gen/day |
|----------|-------------|--------------|---------------|
| **Pooled Supabase (5 projects)** | ~$50/mo | ~$50/mo | ~$50/mo (but contention) |
| **Postgres Sidecar** | ~$3/mo | ~$30/mo | ~$300/mo |

Sidecar cost = Fargate compute for Postgres container (~$0.01-0.05 per generation depending on duration)

### Trade-offs

| Factor | Pooled Supabase | Postgres Sidecar |
|--------|-----------------|------------------|
| **Real Supabase Auth** | ✅ Yes | ❌ No (mock only) |
| **Real Supabase Storage** | ✅ Yes | ❌ No |
| **Isolation** | Shared (reset between) | Complete |
| **Concurrency limit** | N pools = N parallel | Unlimited |
| **Cost at scale** | Fixed | Variable (cheaper) |
| **Complexity** | Pool manager | Simpler |
| **DatabaseResetManager** | Required | Not needed |

### When to Use Each

**Use Pooled Supabase when:**
- Generated apps need to test real Supabase Auth flows
- Generated apps use Supabase Storage
- You want generated apps to be "production-like"

**Use Postgres Sidecar when:**
- Only testing database/Drizzle migrations
- Using `AUTH_MODE=mock` is acceptable
- Cost optimization is priority
- Need unlimited parallel generations

### Hybrid Approach

Could offer both in the SaaS:

```
User creates app:
  "How should we test your app?"

  [ ] Quick mode (Postgres only, faster, cheaper)
      - Database works, auth is mocked
      - Best for rapid iteration

  [x] Full mode (Real Supabase)
      - Real auth, storage, everything
      - Best for production-ready testing
```

### Implementation Note

If using sidecar, the container needs to wait for Postgres to be ready:

```python
# In runtime startup (main.py)
import asyncpg
import asyncio

async def wait_for_postgres(max_retries=30):
    for i in range(max_retries):
        try:
            conn = await asyncpg.connect(os.environ['DATABASE_URL'])
            await conn.close()
            return True
        except Exception:
            await asyncio.sleep(1)
    raise RuntimeError("Postgres not ready after 30s")
```

---

### Phase 2: Week 2 (OAuth + Connected Tier)

**Goal**: Users can connect their own Supabase for unlimited usage

- [ ] Register Supabase OAuth application
- [ ] Implement OAuth flow in SaaS frontend
- [ ] Encrypted token storage in platform database
- [ ] Management API integration (create projects in user's org)
- [ ] "Connect Supabase" UI with clear permission explanation
- [ ] Mode selection: per-project vs pooled

### Phase 3: Week 3 (Polish + Limits)

**Goal**: Production-ready with proper guardrails

- [ ] Usage limits for free tier (3 generations/day, 1 parallel)
- [ ] "Upgrade" prompts when limits hit
- [ ] Project cleanup dashboard (for connected tier)
- [ ] Auto-cleanup of inactive pooled projects (30-day warning)
- [ ] Monitoring and alerting for pool exhaustion

### Phase 4: Future (Pro Tier)

**Goal**: Enterprise customers with managed infrastructure

- [ ] Billing integration (Stripe)
- [ ] Platform-managed dedicated projects
- [ ] Custom domains
- [ ] SLA guarantees
- [ ] Priority support

---

## Open Questions

1. ~~**Free tier limits**: How many free generations before requiring Supabase connection?~~
   **DECIDED**: 3 generations/day, 1 parallel for free tier
2. **Pool size**: Start with 5? 10? Auto-scale?
   **LEANING**: Start with 5, monitor usage, scale manually initially
3. **Supabase Partner Program**: Apply for bulk pricing?
   **TODO**: Research partner program requirements
4. **Per-project cleanup**: Auto-delete after 90 days of inactivity?
   **LEANING**: Yes, with 7-day warning email before deletion
5. **Multi-region**: Support eu-west-1 for GDPR users?
   **DEFERRED**: US-only for MVP, add EU region based on demand

---

## References

- [Supabase Management API](https://supabase.com/docs/reference/api/introduction)
- [Supabase OAuth](https://supabase.com/docs/guides/platform/oauth-apps)
- [Lovable Supabase Integration](https://docs.lovable.dev/integrations/supabase)
- [Neon Branching](https://neon.tech/docs/introduction/branching) (alternative considered)
