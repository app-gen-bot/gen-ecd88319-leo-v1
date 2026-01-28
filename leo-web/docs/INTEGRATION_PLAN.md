# Leo SaaS Integration Plan

> Integrating the leo-monorepo-v2 SaaS frontend with Leo Remote's backend modules
>
> **Status**: Planning
> **Date**: 2025-12-14
> **Branch**: jake/leo-remote-v2

## Executive Summary

This app (`apps/leo-saas/app`) was copied from `leo-monorepo-v2/saas` - the most developed SaaS implementation with excellent UI layout. The goal is to make the browser's left pane (ConsolePage) behave **exactly like the Leo Remote CLI terminal** - same WSI protocol, same interaction model.

## Core Principle: Browser as WSI Client

**The browser left pane IS a WSI client** - just like Leo Remote CLI, but rendered in a browser instead of a terminal.

```
Original app-factory:   User → Terminal → app-factory CLI (local)

Leo Remote:             User → Terminal → Leo Remote CLI → WSI Server ← Leo Container

Leo SaaS:               User → Browser Left Pane → WSI Server ← Leo Container
                               (WSI Client)         (Express)
```

**Key insight:** No message translation or adapter layers. The browser speaks WSI protocol natively, identical to what Leo Remote CLI does. V2's custom message format is legacy - we discard it entirely.

## Architecture Overview

### Current State (V2 Seed - Legacy)

```
Browser → V2 Express Server → Local/AWS Orchestrator → gen:v1 container
                ↓
         V2's Custom WebSocket Protocol (DISCARD)
```

**V2 provided:**
- Excellent UI layout (ConsolePage, xterm.js, iteration history) - **KEEP**
- Own orchestrators (`local-orchestrator.ts`, `aws-orchestrator.ts`) - **DISCARD**
- Own WebSocket server with custom protocol (`websocket-server.ts`) - **DISCARD**
- Own generator container (`gen:v1`) - **DISCARD**

### Target State (Browser = WSI Client)

```
┌─────────────────────────────────────────────────────────────┐
│                      Express Server                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   WSI Server                         │    │
│  │            (from Leo Remote, speaks WSI)             │    │
│  └──────────────┬────────────────────┬─────────────────┘    │
│                 │                    │                       │
│          Browser WS              Container WS                │
│          Connection              Connection                  │
└─────────────────┼────────────────────┼──────────────────────┘
                  │                    │
                  ▼                    ▼
         ┌──────────────┐      ┌──────────────┐
         │   Browser    │      │Leo Container │
         │  Left Pane   │      │ (WSI Client) │
         │ (WSI Client) │      └──────────────┘
         └──────────────┘
```

**Both browser and container are WSI clients connecting to the same WSI Server.**

**Target:**
- Browser left pane speaks WSI protocol directly (like Leo Remote CLI)
- Express runs WSI Server as WebSocket endpoint
- Container Manager spawns Leo Containers
- No V2 message translation - pure WSI throughout
- Keep V2's layout/routing patterns only

## What to Keep vs Replace

### Keep (From V2)

| Component | Location | Why Keep |
|-----------|----------|----------|
| ConsolePage | `client/src/pages/ConsolePage.tsx` | Excellent UI with xterm.js |
| Iteration components | `client/src/components/iteration/` | Feature-complete history viewer |
| Auth components | `client/src/components/auth/` | Working Supabase auth UI |
| AuthContext | `client/src/contexts/AuthContext.tsx` | Solid auth state management |
| GitHub Manager | `server/lib/github-manager.ts` | 450 lines, fully implemented |
| Fly templates | `server/lib/templates/` | Dockerfile, fly.toml generation |
| Database schema | `shared/schema.ts` | Generations, iterations tables |

### Replace (With Leo Remote Modules)

| V2 Component | Replace With | Location |
|--------------|--------------|----------|
| `local-orchestrator.ts` | Container Manager | `remote/cli/src/container-manager.ts` |
| `aws-orchestrator.ts` | Container Manager (Fargate mode) | Same as above |
| `websocket-server.ts` | WSI Server | `remote/cli/src/wsi-server.ts` |
| `docker-manager.ts` | Container Manager | Already handles Docker |
| gen:v1 container | Leo Container | `remote/container/` |

### Integrate (New Modules)

| Module | Source | Purpose |
|--------|--------|---------|
| Supabase Pool Manager | `remote/cli/src/supabase-pool.ts` | Pool allocation for free tier |
| Database Reset Manager | `remote/container/managers/db_reset_manager.py` | Clean DB between generations |

## Phase Plan

### Phase 1: MVP

**Goal**: Basic flow working - Login → Generate → View logs → GitHub push

**Tasks:**
1. [ ] Import WSI Server from Leo Remote into Express
2. [ ] Import Container Manager from Leo Remote
3. [ ] Create browser WSI client (`client/src/lib/wsi-client.ts`)
4. [ ] Update REPLTerminal to handle WSI message types natively
5. [ ] Update ConsolePage input to send WSI messages
6. [ ] Test with Leo Container locally
7. [ ] Verify GitHub push works

**Out of scope for MVP:**
- Iteration history (existing logs work)
- Pause/Resume/Cancel
- Fly deployment UI
- OAuth connected tier
- Multi-container switching (see note below)

**Note: Multi-Container Support (Future)**

MVP is 1:1 (one browser session, one container). Multi-container switching (user running multiple generations, switching between them) would need session routing.

**V2 already had this** - see `apps/leo-saas/app/server/lib/websocket-server.ts`:
- `joinSession(sessionId)` / `leaveSession(sessionId)` pattern
- Session rooms for routing messages to correct browser
- Reference this when implementing multi-container support

See also: `remote/docs/app-generator-saas-spec.md` for multi-generation design.

### Phase 2: Features (2-3 days)

**Goal**: Restore V2's advanced features

**Tasks:**
1. [ ] Wire up iteration history to WSI `iteration_complete` messages
2. [ ] Implement pause/resume via WSI protocol
3. [ ] Integrate Supabase Pool Manager
4. [ ] Add database reset before generation (pooled mode)

### Phase 3: Production (5-7 days)

**Goal**: Production-ready with connected tier

**Tasks:**
1. [ ] Add Supabase OAuth flow for connected tier
2. [ ] Implement Fly deployment UI (using existing templates)
3. [ ] Add usage limits for free tier
4. [ ] Fargate deployment support
5. [ ] Monitoring and alerting

## WSI Protocol Messages (Native - No Mapping)

The browser speaks WSI protocol directly. No translation from V2 format.

### Messages Browser Sends (to WSI Server)

| Message | Purpose | Trigger |
|---------|---------|---------|
| `start_generation` | Begin new generation | User enters prompt |
| `decision_response` | Answer agent question | User responds to prompt |
| `control_command` | Pause/Resume/Cancel | User clicks control button |

### Messages Browser Receives (from WSI Server)

| Message | Purpose | UI Action |
|---------|---------|-----------|
| `ready` | Container connected | Show "Connected" status |
| `log` | Output line from agent | Write to xterm.js |
| `progress` | Progress update | Update progress indicator |
| `decision_prompt` | Agent needs input | Show input modal/field |
| `iteration_complete` | Iteration snapshot ready | Update iteration history |
| `all_work_complete` | Generation finished | Show completion, GitHub URL |
| `error` | Something failed | Display error message |

### Interaction Model (Same as Leo Remote CLI)

```
1. User enters prompt in input field
2. Browser sends: { type: "start_generation", prompt: "..." }
3. WSI Server spawns container, routes messages
4. Browser receives log/progress messages → renders in xterm.js
5. If agent needs input: Browser receives decision_prompt → shows input UI
6. User responds → Browser sends decision_response
7. Generation completes → Browser receives all_work_complete
```

This is identical to typing in Leo Remote CLI - the browser just renders it graphically.

## File Changes Required

### Server Changes

```
server/
├── index.ts                    # Add WSI Server startup
├── lib/
│   ├── orchestrator/           # REMOVE entirely
│   ├── websocket-server.ts     # REMOVE entirely
│   └── wsi/                    # NEW: Import from Leo Remote
│       ├── wsi-server.ts       # WebSocket server speaking WSI protocol
│       ├── container-manager.ts # Docker/Fargate container orchestration
│       └── supabase-pool.ts    # Database pool management
└── routes/
    └── generations.ts          # Update to use Container Manager
```

### Client Changes

```
client/src/
├── lib/
│   ├── websocket.ts            # REMOVE (V2's custom protocol)
│   └── wsi-client.ts           # NEW: Browser WSI client (like Leo Remote CLI)
├── hooks/
│   └── useWsi.ts               # NEW: React hook for WSI connection
├── components/terminal/
│   └── REPLTerminal.tsx        # Update to handle WSI message types
├── pages/
│   └── ConsolePage.tsx         # Update to use useWsi hook
└── types/
    └── wsi-messages.ts         # NEW: WSI protocol message types
```

### Key Principle

The new `wsi-client.ts` should mirror Leo Remote CLI's WSI handling:
- Same message types
- Same connection lifecycle
- Same interaction patterns

If it works in Leo Remote CLI terminal, it works in the browser left pane.

## Environment Variables

### Current (V2)

```bash
# Auth
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=

# Orchestrator
ORCHESTRATOR_MODE=local|aws
GENERATOR_IMAGE=gen:v1

# AWS (for ECS)
AWS_REGION=
```

### Target (Integrated)

```bash
# Auth (same)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database (same)
DATABASE_URL=

# Container (new)
CONTAINER_IMAGE=leo-container:latest
WS_PORT=8765

# Supabase Pool (new - for free tier)
SUPABASE_MODE=pooled|per-app
SUPABASE_POOL_1_URL=
SUPABASE_POOL_1_DATABASE_URL=
# ... etc

# AWS Secrets (for production)
AWS_SECRET_NAME=leo/secrets
```

## Testing Strategy

### Phase 1 Testing

1. **Unit**: WSI Server message handling
2. **Integration**: Container Manager → Docker → Leo Container
3. **E2E**: Login → Generate "Hello World" → See logs → GitHub repo created

### Smoke Test Commands

```bash
# Start server
npm run dev

# In another terminal, test WebSocket
wscat -c ws://localhost:5013/ws

# Send start_generation
{"type": "start_generation", "prompt": "Create a hello world app"}
```

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| WSI protocol changes | Reference Leo Remote CLI as source of truth |
| Container connectivity | Test WSI Server with both browser and container clients |
| Auth regression | Keep V2's Supabase auth code unchanged |
| Database schema conflicts | Use same schema, add columns if needed |

## Success Criteria

### MVP Complete When:

1. User can log in with Supabase auth
2. User can enter prompt and start generation
3. Logs stream to ConsolePage in real-time
4. Generation completes and creates GitHub repo
5. User sees success message with repo URL

### Full Integration Complete When:

1. All MVP criteria plus:
2. Iteration history shows snapshots
3. Pause/Resume works during generation
4. Free tier uses Supabase pool with DB reset
5. Connected tier creates projects in user's Supabase
6. Fly deployment works from UI

## References

- [WSI Protocol v2.1](../../specs/wsi-protocol.md)
- [Leo Remote Architecture](../../docs/architecture/README.md)
- [Supabase Architecture](../../docs/SUPABASE-ARCHITECTURE.md)
- [Secrets Architecture](../../docs/SECRETS-ARCHITECTURE.md)
- [V2 Architecture](../app/ARCHITECTURE.md)
