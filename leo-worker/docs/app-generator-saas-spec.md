# Leo SaaS - AI App Generator Platform

> Web interface for Leo, the AI-powered application generator
>
> **Status**: Specification
> **Date**: 2025-12-14
> **Branch**: jake/leo-remote-v2

## Mission

Provide a web-based interface for users to generate full-stack applications from natural language prompts using Leo (Claude Code). The platform handles authentication, generation orchestration, real-time progress streaming, and deployment to production infrastructure.

## Core Value Proposition

1. **Zero Setup**: Users describe their app in plain English, receive production-ready code
2. **Real Database**: Generated apps use real Supabase (not mocks) for immediate testing
3. **Git-Native**: Every generation creates a GitHub repository with incremental commits
4. **Deploy-Ready**: Generated apps include Fly.io deployment configuration

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Leo SaaS Architecture                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Browser                                                                │
│   └── React SPA                                                          │
│       ├── Auth (Supabase)                                               │
│       ├── Console (xterm.js)                                            │
│       └── Preview (iframe)                                              │
│                ↓ HTTPS                                                   │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Express Server                                                  │   │
│   │ ├── REST API (generations, iterations)                         │   │
│   │ ├── WSI Server (from Leo Remote)                               │   │
│   │ ├── Container Manager (from Leo Remote)                        │   │
│   │ └── Supabase Pool Manager                                      │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                ↓ Docker/Fargate                                          │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Leo Container                                                   │   │
│   │ ├── WSI Client (WebSocket connection)                          │   │
│   │ ├── AppGeneratorAgent (Claude Code)                            │   │
│   │ ├── Git Manager (push/clone)                                   │   │
│   │ └── Database Reset Manager (pooled mode)                       │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                ↓                                                         │
│   External Services                                                      │
│   ├── GitHub (generated app repos)                                      │
│   ├── Supabase (auth + app databases)                                   │
│   ├── AWS Secrets Manager (platform credentials)                        │
│   └── Fly.io (deployed apps)                                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Reuse Leo Remote Modules**: WSI Server, Container Manager, and Supabase Pool Manager are imported from `remote/cli/src/` - single implementation for CLI and SaaS
2. **WSI Protocol v2.1**: Standard bidirectional communication between server and container
3. **Leo Container**: Same container image for local development (Leo Remote) and production (Leo SaaS)
4. **Supabase Pooled Mode**: Free tier users share platform-owned Supabase projects with database reset between generations

## User Tiers

### Free Tier (MVP)

- **Database**: Platform-owned Supabase pool (reset between generations)
- **Limits**: 3 generations/day, 1 concurrent
- **Output**: GitHub repository in platform bot account
- **Purpose**: Try before connecting external services

### Connected Tier (Phase 2)

- **Database**: User's own Supabase via OAuth
- **Limits**: Unlimited generations
- **Output**: GitHub repository in user's account
- **Modes**: Per-project (persistent) or Pooled (reset)

### Pro Tier (Future)

- **Database**: Platform-managed dedicated Supabase
- **Limits**: Priority queue, higher concurrency
- **Output**: Custom GitHub org, white-label options

## Features

### MVP Features (Phase 1)

#### 1. Authentication
- Supabase Auth (email/password)
- Session persistence with JWT tokens
- Protected routes for authenticated pages

#### 2. Generation Console
- **Prompt Input**: Text area for app description (10-5000 chars)
- **Log Viewer**: Real-time terminal output with xterm.js
- **Progress Bar**: Visual indicator with iteration count
- **Status Display**: Connection status, generation state

#### 3. Real-Time Streaming
- WebSocket connection to WSI Server
- Message types: `ready`, `log`, `progress`, `iteration_complete`, `all_work_complete`, `error`
- Auto-reconnect on connection loss

#### 4. Generation Output
- GitHub repository URL
- Success/failure status
- Error details if failed

### Phase 2 Features

#### 5. Iteration History
- Timeline of generation snapshots
- View intermediate states
- Compare iterations side-by-side

#### 6. Generation Controls
- Pause/Resume during generation
- Cancel with cleanup
- Restart from checkpoint

#### 7. Connected Tier
- Supabase OAuth flow
- Project creation in user's org
- Mode selection (per-project vs pooled)

### Phase 3 Features

#### 8. Deployment
- Fly.io deployment from UI
- Environment variable configuration
- Deployment status tracking

#### 9. Apps Dashboard
- List of user's generated apps
- Quick actions (view repo, deploy, delete)
- Generation history per app

## User Flows

### Flow 1: First-Time User

```
1. User visits landing page
2. Clicks "Get Started" → Login/Register page
3. Creates account with email/password
4. Redirected to Console page
5. Sees empty console with prompt input
6. Enters app description: "Create a todo app with..."
7. Clicks "Generate"
8. Sees real-time logs streaming in terminal
9. Generation completes (2-10 minutes)
10. Sees success message with GitHub URL
11. Can view generated code or start new generation
```

### Flow 2: Returning User

```
1. User visits site, auto-logged in via session
2. Redirected to Console or Apps page
3. Previous generations shown in sidebar/history
4. Can start new generation or view past results
```

### Flow 3: Generation with Resume (Phase 2)

```
1. User starts generation
2. Logs stream in real-time
3. User clicks "Pause" after iteration 3
4. Container saves state, enters paused mode
5. User reviews current state
6. User clicks "Resume"
7. Container continues from iteration 4
8. Generation completes
```

## Technical Specifications

### Database Schema

```sql
-- Platform database (Leo SaaS's own Supabase)

-- Generation requests
CREATE TABLE generation_requests (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,              -- Supabase Auth user ID
    prompt TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    logs TEXT,
    github_url TEXT,
    error_message TEXT,

    -- WSI tracking
    session_id VARCHAR(255),
    container_id VARCHAR(255),

    -- Supabase pool tracking
    pool_project_id VARCHAR(255),       -- Which pool project was used

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Iteration snapshots (for history feature)
CREATE TABLE iteration_snapshots (
    id SERIAL PRIMARY KEY,
    generation_request_id INTEGER REFERENCES generation_requests(id),
    iteration_number INTEGER NOT NULL,
    snapshot_data JSONB,                -- Agent state at this iteration
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User integration tokens (Phase 2)
CREATE TABLE user_integration_tokens (
    user_id UUID PRIMARY KEY,           -- Supabase Auth user ID
    supabase_access_token BYTEA,        -- KMS encrypted
    supabase_refresh_token BYTEA,       -- KMS encrypted
    supabase_org_id TEXT,
    github_access_token BYTEA,          -- KMS encrypted
    github_username TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints

```
Authentication (via Supabase Auth SDK):
  POST /auth/signup      - Register new user
  POST /auth/login       - Login with email/password
  POST /auth/logout      - Clear session
  GET  /auth/me          - Get current user

Generations:
  GET    /api/generations           - List user's generations
  POST   /api/generations           - Start new generation
  GET    /api/generations/:id       - Get generation details
  DELETE /api/generations/:id       - Cancel/delete generation

Iterations (Phase 2):
  GET    /api/generations/:id/iterations    - List snapshots
  GET    /api/iterations/:id                - Get snapshot details

WebSocket:
  WS /ws                            - WSI Protocol connection
```

### WSI Protocol Messages

**Modes:**
- `autonomous`: Reprompter runs continuously until `max_iterations` reached
- `confirm_first`: Reprompter suggests next task, user confirms each iteration

Server → Client:
```typescript
{ type: 'ready', container_id?: string, workspace?: string }
{ type: 'log', line: string, level: 'info' | 'warn' | 'error' | 'debug' }
{ type: 'progress', iteration?: number, total_iterations?: number, percentage?: number }
{ type: 'iteration_complete', iteration: number, app_path: string, session_id?: string, duration?: number }
{ type: 'decision_prompt', id: string, prompt: string, suggested_task?: string, iteration?: number, max_iterations?: number }
{ type: 'all_work_complete', completion_reason: string, app_path: string, total_iterations: number, github_url?: string }
{ type: 'error', message: string, error_code?: string, fatal?: boolean }
```

Client → Server:
```typescript
// Start generation (autonomous or confirm_first mode)
{
  type: 'start_generation',
  prompt: string,
  mode: 'autonomous' | 'confirm_first',
  max_iterations: number,           // Required for autonomous mode
  app_name?: string,                // Required for new apps
  app_path?: string,                // For resume
  resume_session_id?: string,       // For session continuity
  enable_subagents?: boolean,       // Default: true
  user_id: string,                  // Required for GitHub repo naming
  app_id?: string
}

// Decision response (confirm_first mode)
{
  type: 'decision_response',
  id: string,                       // Matches decision_prompt.id
  choice: 'yes' | 'add' | 'redirect' | 'done' | string,  // Or custom prompt
  input?: string                    // Additional input for add/redirect/custom
}

// Control commands
{ type: 'control_command', command: 'pause' | 'resume' | 'cancel' | 'prepare_shutdown' }
```

### Environment Variables

```bash
# Server
PORT=5013
NODE_ENV=development|production

# Supabase (Leo SaaS's own project)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://...

# Supabase Pool (for free tier generated apps)
SUPABASE_MODE=pooled|per-app
SUPABASE_POOL_1_URL=https://pool1.supabase.co
SUPABASE_POOL_1_ANON_KEY=eyJ...
SUPABASE_POOL_1_SERVICE_ROLE_KEY=eyJ...
SUPABASE_POOL_1_DATABASE_URL=postgresql://...
# ... additional pools

# Container
CONTAINER_IMAGE=leo-container:latest
WS_PORT=8765

# GitHub (platform bot for free tier)
GITHUB_BOT_TOKEN=ghp_xxx

# AWS (for production)
AWS_REGION=us-east-1
AWS_SECRET_NAME=leo/secrets
```

## UI Components

### Console Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Back    Leo Console    🟢 Connected    Session: abc123           │
├───────────────────────────────────┬─────────────────────────────────┤
│ [Console] [History]               │ Preview                         │
├───────────────────────────────────┤                                 │
│                                   │  ┌─────────────────────────┐   │
│  $ Starting generation...         │  │                         │   │
│  $ Creating schema...             │  │   [App Preview Here]    │   │
│  $ Running migrations...          │  │                         │   │
│  $ Generating components...       │  │                         │   │
│  $ [iteration 3/10]               │  └─────────────────────────┘   │
│                                   │                                 │
├───────────────────────────────────┤                                 │
│ ████████████░░░░░░░░░ 60%         │                                 │
│ [Pause] [Cancel]                  │                                 │
├───────────────────────────────────┤                                 │
│ Describe your app...              │                                 │
│ [__________________________] [↑]  │                                 │
└───────────────────────────────────┴─────────────────────────────────┘
```

### Component Hierarchy

```
App
├── AuthProvider (Supabase context)
├── Routes
│   ├── / → HomePage
│   ├── /login → LoginPage
│   ├── /register → RegisterPage
│   ├── /console/:id? → ConsolePage (protected)
│   │   ├── ConsoleHeader
│   │   ├── ConsolePanel
│   │   │   ├── REPLTerminal (xterm.js)
│   │   │   ├── ProgressBar
│   │   │   └── PromptInput
│   │   └── PreviewPanel
│   └── /apps → AppsPage (protected)
└── Toaster (notifications)
```

## Implementation Phases

### Phase 1: MVP (3-5 days)

| Task | Priority | Effort |
|------|----------|--------|
| Import WSI Server from Leo Remote | High | 4h |
| Import Container Manager from Leo Remote | High | 4h |
| Update Express routes for new modules | High | 4h |
| Map V2 WebSocket to WSI Protocol | High | 4h |
| Update ConsolePage for WSI messages | High | 4h |
| Integration testing with Leo Container | High | 8h |
| GitHub push verification | High | 2h |

**Deliverable**: User can login, generate an app, see logs, get GitHub URL

### Phase 2: Features (2-3 days)

| Task | Priority | Effort |
|------|----------|--------|
| Supabase Pool Manager integration | High | 4h |
| Database reset before generation | High | 2h |
| Iteration history UI | Medium | 4h |
| Pause/Resume controls | Medium | 4h |
| Apps dashboard page | Medium | 4h |

**Deliverable**: Full generation workflow with history and controls

### Phase 3: Production (5-7 days)

| Task | Priority | Effort |
|------|----------|--------|
| Supabase OAuth for connected tier | High | 8h |
| User's own Supabase project creation | High | 4h |
| Fly deployment UI | Medium | 8h |
| Usage limits and quotas | Medium | 4h |
| Fargate deployment | Medium | 8h |
| Monitoring and alerting | Medium | 4h |

**Deliverable**: Production-ready platform with paid tier support

## Success Metrics

### MVP Success Criteria

1. User can log in with Supabase auth
2. User can enter prompt and start generation
3. Logs stream to console in real-time
4. Generation completes within 10 minutes
5. GitHub repository created with generated code
6. User sees success message with repo URL

### Phase 2 Success Criteria

1. All MVP criteria plus:
2. Iteration history shows snapshots
3. Pause/Resume works correctly
4. Free tier uses Supabase pool
5. Database reset works between generations

### Phase 3 Success Criteria

1. All Phase 2 criteria plus:
2. Connected tier OAuth flow works
3. Projects created in user's Supabase org
4. Fly deployment works from UI
5. Usage limits enforced for free tier

## Event/Message Persistence

### Current (Single Generation)
- **Browser**: Messages stored in `sessionStorage` via WSI client singleton
- **Container**: Logs written to file, pushed to GitHub on completion/stop
- Survives: HMR, page refresh. Lost on: tab close

### Future (Multi-App)
When supporting concurrent generations:
- Key messages by `generation_id` in sessionStorage
- Add LRU eviction (sessionStorage ~5-10MB limit)
- WSI protocol: include `generation_id` in all messages
- UI switches which generation's messages to render

## References

- [Leo Container Internal Architecture](architecture/leo-container-internal.dot)
- [Leo Remote Architecture](architecture/leo-remote-architecture.dot)
- [Leo SaaS Architecture](architecture/leo-saas-architecture.dot)
- [WSI Protocol v2.1](../specs/wsi-protocol.md)
- [Supabase Architecture](SUPABASE-ARCHITECTURE.md)
- [Secrets Architecture](SECRETS-ARCHITECTURE.md)
