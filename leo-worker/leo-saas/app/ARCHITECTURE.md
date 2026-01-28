# Leo V2 Architecture - Generation Flow

**Last Updated**: 2025-11-03

## Overview

Leo V2 uses a unified WebSocket REPL protocol for real-time app generation with streaming logs.

---

## Target Architecture ✅

### Components
- **Frontend**: V2 REPL Console UI (`ConsolePage.tsx`) with xterm.js terminal
- **Backend**: V2 WebSocket REPL handler (`websocket-server.ts`) at `/ws`
- **Generator**: `leo-websocket` container with native REPL protocol support
- **Authentication**: Supabase JWT validation
- **Protocol**: Single WebSocket connection for entire session (no protocol translation needed)

---

## Generation Flow (Current Implementation)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User Action                                                   │
├─────────────────────────────────────────────────────────────────┤
│ User connects to: ws://localhost:5013/ws                        │
│ Authenticates via Supabase JWT                                  │
│ Joins session: join_session(sessionId)                          │
│ Submits prompt: { type: 'start_generation', prompt: '...' }     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. WebSocket REPL Handler                                       │
│    (server/lib/websocket-server.ts:593)                         │
├─────────────────────────────────────────────────────────────────┤
│ - Validates authentication & session                            │
│ - Creates DB record (status: 'queued')                          │
│ - Sends 'generation_started' to client                          │
│ - Calls orchestrator.startGeneration(requestId, userId, prompt) │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Local Orchestrator                                           │
│    (server/lib/orchestrator/local-orchestrator.ts)              │
├─────────────────────────────────────────────────────────────────┤
│ - Updates DB (status: 'generating')                             │
│ - Spawns Docker container via dockerManager.runGeneration()     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Container Spawned (PROBLEM: Using OLD gen:v1)                │
│    (server/lib/orchestrator/docker-manager.ts)                  │
├─────────────────────────────────────────────────────────────────┤
│ docker run --rm --name gen_{requestId} \                        │
│   -e WEBSOCKET_URL=ws://host.docker.internal:5013/ws/job_{id} \ │
│   -e PROMPT="..." \                                              │
│   gen:v1  ← OLD V1 GENERATOR (NOT leo-websocket!)               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Generator Runs                                               │
├─────────────────────────────────────────────────────────────────┤
│ - Container connects to /ws/job_{requestId}                     │
│ - Sends log messages: { type: 'log', log: { line: '...' }}      │
│ - Backend forwards logs to REPL /ws connection                  │
│ - User sees real-time logs in xterm.js terminal                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. Completion (PROBLEM: Broadcast to wrong WebSocket)           │
├─────────────────────────────────────────────────────────────────┤
│ - dockerManager.waitForCompletion() detects exit                │
│ - dockerManager.extractFiles() copies /workspace/app            │
│ - githubManager.createRepo() pushes to GitHub                   │
│ - Updates DB (status: 'completed', downloadUrl, githubUrl)      │
│ - wsManager.broadcastToClients() ← Goes to /ws/job_{id}!        │
│   ❌ REPL client on /ws never receives completion message       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Container Lifecycle

### Trigger: Container Creation
**Location**: `server/lib/orchestrator/local-orchestrator.ts:29`
```typescript
containerId = await dockerManager.runGeneration(requestId, prompt);
```

**Environment Variables Passed**:
- `WEBSOCKET_URL`: `ws://host.docker.internal:5013/ws/job_{requestId}`
- `PROMPT`: User's generation prompt
- `MODE`: `autonomous`
- `MAX_ITERATIONS`: `10`

### Trigger: Container Cleanup
**Location**: `server/lib/orchestrator/local-orchestrator.ts:32-100`

**Sequence**:
1. **Wait for completion** (up to 1 hour timeout)
2. **Extract files** from `/workspace/app` to `/tmp/generations/{requestId}`
3. **Create GitHub repo** (if enabled)
4. **Update database** with completion status
5. **Broadcast status** (currently broken - wrong WebSocket path)
6. **Container auto-removed** (via `--rm` flag)

---

## WebSocket Protocol

### REPL Client → Server Messages

| Message Type | Payload | Description |
|--------------|---------|-------------|
| `authenticate` | `{ token }` | JWT authentication |
| `join_session` | `{ sessionId }` | Join session room |
| `leave_session` | `{ sessionId }` | Leave session room |
| `start_generation` | `{ prompt, mode?, maxIterations? }` | Start app generation |

### Server → REPL Client Messages

| Message Type | Payload | Description |
|--------------|---------|-------------|
| `connected` | `{ timestamp }` | Connection established |
| `authenticated` | `{ userId, email }` | Auth successful |
| `generation_started` | `{ sessionId, requestId }` | Generation began |
| `log` | `{ log: { line, timestamp } }` | Generator log line |
| `completed` | `{ downloadUrl, githubUrl }` | Generation done (NOT WORKING) |
| `error` | `{ error }` | Error occurred |

---

## Files & Locations

### Frontend (V2 REPL)
- **Main Console**: `client/src/pages/ConsolePage.tsx`
- **Terminal Component**: `client/src/components/terminal/REPLTerminal.tsx`
- **WebSocket Client**: `client/src/lib/websocket.ts`

### Backend (V2)
- **REPL Handler**: `server/lib/websocket-server.ts`
- **Orchestrator**: `server/lib/orchestrator/local-orchestrator.ts`
- **Docker Manager**: `server/lib/orchestrator/docker-manager.ts`

### Generator (V1 - OLD)
- **Image**: `gen:v1`
- **Source**: `/home/jake/WORK/APP_GEN_SAAS/V1/gen` (leonardo-saas branch)
- **Protocol**: Expects `/ws/job_{id}` WebSocket URL

### Generator (V2 - NEW, NOT USED YET)
- **Image**: `leo-websocket` (presumed)
- **Protocol**: Should understand REPL WebSocket protocol natively
- **Status**: Not integrated yet

---

## Next Steps

### Priority 1: Switch to leo-websocket Container
**File**: `server/lib/orchestrator/docker-manager.ts`
- Change image from `gen:v1` to `leo-websocket`
- Update environment variables for V2 protocol
- Test REPL protocol compatibility

### Priority 2: Fix Completion Broadcast
**File**: `server/lib/orchestrator/local-orchestrator.ts:79-82`
- Add method to broadcast to REPL sessions
- Send completion message to correct WebSocket path
- Include downloadUrl and githubUrl in message

### Priority 3: Handle Completion in UI
**File**: `client/src/pages/ConsolePage.tsx:106-108`
- Add handler for `completed` message
- Show success state in UI
- Provide download and deploy buttons

---

## Configuration

### Environment Variables
- `ORCHESTRATOR_MODE`: `local` (Docker) or `ecs` (AWS)
- `DOCKER_IMAGE`: Generator container image (currently hardcoded to `gen:v1`)
- `WORKSPACE_DIR`: Local path for generated apps (`/tmp/generations`)

### Docker Configuration
- **Container naming**: `gen_{requestId}`
- **Auto-remove**: Yes (`--rm` flag)
- **Network**: `bridge` mode with `host.docker.internal` for WebSocket

---

## Troubleshooting

### Logs not streaming
1. Check container is connecting to WebSocket
2. Verify log forwarding in `websocket-server.ts:340-370`
3. Check browser console for WebSocket errors

### Completion not shown
1. Verify generation actually completed (check DB)
2. Check server logs for broadcast message
3. Confirm REPL client is still connected

### Old generator running
1. Check `docker-manager.ts` for hardcoded `gen:v1` image
2. Verify `leo-websocket` container exists
3. Update Docker image reference

---

## Version History

- **2025-11-03**: Initial architecture doc
  - Documented V2 REPL flow
  - Identified `gen:v1` vs `leo-websocket` issue
  - Documented completion broadcast problem
