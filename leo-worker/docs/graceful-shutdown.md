# Graceful Shutdown Protocol

This document describes the graceful shutdown protocol for stopping app generations while preserving work.

## Overview

When a user clicks "Stop Generation", the system initiates a graceful shutdown that:
1. Notifies the container to save its work
2. Commits any uncommitted changes to git
3. Pushes to GitHub (if configured)
4. Terminates the container only after work is saved

This prevents loss of partially-generated apps and ensures the user's work is preserved.

## Protocol Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     GRACEFUL SHUTDOWN PROTOCOL                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Browser                WSI Server                 Container           │
│      │                       │                          │               │
│      │  stop_request         │                          │               │
│      │──────────────────────>│                          │               │
│      │                       │                          │               │
│      │  shutdown_initiated   │                          │               │
│      │<──────────────────────│                          │               │
│      │                       │                          │               │
│      │                       │  prepare_shutdown        │               │
│      │                       │─────────────────────────>│               │
│      │                       │                          │               │
│      │                       │                          │ git add -A    │
│      │                       │                          │ git commit    │
│      │                       │                          │ git push      │
│      │                       │                          │               │
│      │                       │  shutdown_ready          │               │
│      │                       │<─────────────────────────│               │
│      │                       │                          │               │
│      │  shutdown_ready       │                          │               │
│      │<──────────────────────│                          │               │
│      │                       │                          │               │
│      │                       │  [Close WebSocket]       │               │
│      │                       │─────────────────────────>│               │
│      │                       │                          │               │
│      │  generation_stopped   │  [Docker rm container]   │               │
│      │<──────────────────────│  [Docker rm volume]      │               │
│      │                       │                          │               │
└─────────────────────────────────────────────────────────────────────────┘
```

## Message Types

### Browser → Server

#### stop_request
User clicked the Stop button.
```typescript
{
  type: "stop_request",
  reason?: string  // Optional reason for stopping
}
```

### Server → Container

#### prepare_shutdown (via control_command)
Server instructs container to save work.
```typescript
{
  type: "control_command",
  command: "prepare_shutdown",
  reason?: string
}
```

### Container → Server

#### shutdown_ready
Work has been saved successfully.
```typescript
{
  type: "shutdown_ready",
  commit_hash?: string,  // Git commit hash (first 8 chars)
  pushed?: boolean,      // Whether push to GitHub succeeded
  message?: string       // Human-readable status
}
```

#### shutdown_failed
Failed to save work (git error, timeout, etc).
```typescript
{
  type: "shutdown_failed",
  reason: string  // Why the save failed
}
```

### Server → Browser

#### shutdown_initiated
Shutdown process has started.
```typescript
{
  type: "shutdown_initiated",
  message: string,
  timeout_seconds: number  // Time until force kill (default: 30)
}
```

#### shutdown_ready
Work was saved, container will be terminated.
```typescript
{
  type: "shutdown_ready",
  message: string,
  commit_hash?: string,
  pushed?: boolean
}
```

#### shutdown_failed
Container couldn't save work. User can choose to force-stop.
```typescript
{
  type: "shutdown_failed",
  reason: string,
  message: string  // Instructions for user
}
```

#### shutdown_timeout
Container didn't respond in time, force-killing.
```typescript
{
  type: "shutdown_timeout",
  message: string
}
```

#### generation_stopped
Container has been terminated.
```typescript
{
  type: "generation_stopped",
  message: string,
  reason: string
}
```

## Timeout Safety

If the container doesn't respond to `prepare_shutdown` within 30 seconds, the server will force-kill the container. This prevents hung containers from blocking resources indefinitely.

The timeout is configurable via `SHUTDOWN_TIMEOUT_MS` in the WSI Server (default: 30000ms).

## Implementation Details

### WSI Server (TypeScript)

Location: `leo-saas/app/server/lib/wsi/wsi-server.ts`

Key methods:
- `handleStopRequest()` - Initiates graceful shutdown
- `handleShutdownReady()` - Container saved work successfully
- `handleShutdownFailed()` - Container failed to save
- `forceKillContainer()` - Timeout handler
- `killContainer()` - Actually terminates container

### Container Client (Python)

Location: `leo-container/src/runtime/wsi/client.py`

Key methods:
- `_handle_control_command()` - Routes control commands
- `_handle_prepare_shutdown()` - Saves work to git/GitHub

The container:
1. Finds the app directory with a `.git` folder
2. Stages all changes with `git add -A`
3. Commits with message "WIP: Auto-save before shutdown"
4. Pushes to GitHub if configured
5. Sends `shutdown_ready` or `shutdown_failed`

## Error Scenarios

### Container Doesn't Respond
- Server waits 30 seconds
- Sends `shutdown_timeout` to browser
- Force-kills container (work may be lost)

### Git Commit Fails
- Container logs warning
- Still attempts to push existing commits
- Sends `shutdown_ready` with available info

### GitHub Push Fails
- Container sends `shutdown_ready` with `pushed: false`
- Work is still saved in local git history
- User can retrieve from container volume (if preserved)

### Network Error During Shutdown
- Container WebSocket disconnects
- Server's `handleDisconnect()` triggers cleanup
- Container and volume are removed

## UI Integration

The UI should:
1. Show a "Stop" button when generation is running
2. Display confirmation dialog before stopping
3. Show "Saving work..." status during shutdown
4. Display success/failure message with commit hash
5. Disable the Stop button during shutdown

See `leo-saas/app/client/src/components/GenerationControls.tsx` for implementation.
