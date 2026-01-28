# WSI vs CLI Parity Analysis

This document analyzes the functionality parity between the WSI (WebSocket Interface) implementation and the original CLI (`run_app_generator.py`).

## State Diagram

See `wsi-state-diagram.png` for the visual representation.

```
                    ┌─────────────────┐
                    │   CONNECTING    │
                    │  (connecting)   │
                    └────────┬────────┘
                             │ ready msg sent
                             ▼
                    ┌─────────────────┐
          ┌─────────│     READY       │◄────────────┐
          │         │    (ready)      │             │
          │         └────────┬────────┘             │
          │                  │ start_generation     │ connection reuse
          │                  ▼                      │
          │         ┌─────────────────┐             │
          │    ┌───►│     ACTIVE      │◄───┐       │
          │    │    │    (active)     │    │       │
          │    │    └───┬─────────┬───┘    │       │
          │    │        │         │        │       │
          │    │        │decision │self-loop│       │
          │    │        │required │(autonomous)    │
          │    │        ▼         │        │       │
          │    │   ┌─────────────────┐     │       │
          │    └───│   PROMPTING     │─────┘       │
          │        │   (prompting)   │             │
          │        └───┬─────────────┘             │
          │            │ done                      │
          │            ▼                           │
          │   ┌─────────────────┐                  │
          │   │   COMPLETED     │──────────────────┘
          │   │   (completed)   │
          │   └────────┬────────┘
          │            │ graceful close
          ▼            ▼
    ┌─────────────────────────────────┐
    │          DISCONNECTED           │
    │        (disconnected)           │
    └─────────────────────────────────┘
                    ▲
                    │ cleanup
           ┌────────┴────────┐
           │      ERROR      │
           │     (error)     │
           └─────────────────┘
           (reachable from any state)
```

## Feature Comparison

| Feature | CLI (`run_app_generator.py`) | WSI (client.py) | Parity |
|---------|------------------------------|-----------------|--------|
| **New App Generation** | ✅ `--app-name` | ✅ `app_name` field | ✅ |
| **Resume Existing** | ✅ `--resume <path>` | ✅ `app_path` field | ✅ |
| **Resume from GitHub** | ❌ Not supported | ✅ `GITHUB_CLONE_URL` env | WSI > CLI |
| **Output Directory** | ✅ `--output-dir` | ✅ `output_dir` field | ✅ |
| **Prompt Expansion** | ✅ `--no-expansion` | ❌ Always disabled | CLI > WSI |
| **Subagents Toggle** | ✅ `--no-subagents` | ✅ `enable_subagents` | ✅ |
| **Prompt Input** | ✅ CLI argument | ✅ `prompt` field | ✅ |
| **Interactive Mode** | ❌ Not implemented | ✅ `mode: interactive` | WSI > CLI |
| **Confirm First Mode** | ❌ Not implemented | ✅ `mode: confirm_first` | WSI > CLI |
| **Autonomous Mode** | ✅ (only mode) | ✅ `mode: autonomous` | ✅ |
| **Max Iterations** | ❌ Hardcoded | ✅ `max_iterations` | WSI > CLI |
| **Session Resume** | ❌ Not supported | ✅ `resume_session_id` | WSI > CLI |
| **Real-time Logs** | ✅ Console output | ✅ WebSocket streaming | ✅ |
| **Progress Updates** | ❌ Not supported | ✅ `progress` messages | WSI > CLI |
| **Database Reset** | ❌ Manual | ✅ Auto on generation start | WSI > CLI |
| **Git Integration** | ❌ Manual | ✅ Auto-init + GitHub push | WSI > CLI |
| **Supabase Credentials** | ❌ Manual | ✅ Auto-inject from env | WSI > CLI |

## Summary

- **CLI Feature Count**: 6 features
- **WSI Feature Count**: 15 features
- **Full Parity**: CLI is a strict subset of WSI

The WSI implementation supports **all** CLI features and adds:
1. Multiple operation modes (interactive, confirm_first, autonomous)
2. Resume from GitHub repositories
3. Session-based iteration with max_iterations control
4. Real-time progress streaming
5. Automatic database/git/credential management

## State Machine Separation of Concerns

### Current Architecture

The state machine currently mixes two concerns:

1. **Connection Lifecycle** (WebSocket-specific):
   - CONNECTING → READY (WS handshake)
   - Any state → DISCONNECTED (WS close)
   - Any state → ERROR (WS error)

2. **Generation Workflow** (CLI-equivalent):
   - READY → ACTIVE (start generation)
   - ACTIVE → PROMPTING (need user input)
   - PROMPTING → ACTIVE (continue after input)
   - ACTIVE → COMPLETED (generation done)

### Separation Proposal

The state machine could be refactored into two layers:

```
┌────────────────────────────────────────────────────────┐
│                 Connection Layer                        │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐ │
│  │CONNECTING│───►│CONNECTED │───►│   DISCONNECTED   │ │
│  └──────────┘    └────┬─────┘    └──────────────────┘ │
│                       │                                 │
└───────────────────────┼─────────────────────────────────┘
                        │ (delegates to)
                        ▼
┌────────────────────────────────────────────────────────┐
│               Generation Workflow Layer                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐         │
│  │   IDLE   │───►│ RUNNING  │───►│COMPLETED │         │
│  └──────────┘    └────┬─────┘    └──────────┘         │
│                       │                                 │
│                       ▼                                 │
│                 ┌───────────┐                          │
│                 │ PROMPTING │ (interactive modes only) │
│                 └───────────┘                          │
└────────────────────────────────────────────────────────┘
```

**Benefits**:
1. The Generation Workflow Layer would map directly to CLI capabilities
2. Easier to test each layer independently
3. Connection recovery doesn't affect generation state
4. Could add WebSocket reconnection without interrupting generation

**Current Assessment**: The existing state machine is well-designed and works correctly. Separation would add complexity without immediate benefit. **Recommend keeping as-is** unless WebSocket reconnection becomes a requirement.

## Files Referenced

- **State Machine**: `leo-container/src/runtime/wsi/state_machine.py` (255 lines)
- **WSI Client**: `leo-container/src/runtime/wsi/client.py` (1625 lines)
- **CLI Runner**: `leo-container/src/leo/run_app_generator.py` (137 lines)
- **WSI Protocol Spec**: `specs/wsi-protocol.md`
