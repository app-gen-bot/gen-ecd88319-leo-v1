# WSI Client v2 - Full Feature Parity

## Overview

This is a complete rewrite of the WSI client based on `wsi_server/server.py`, providing **100% feature parity** with the server implementation.

## Motivation

The original `wsi_client` (v1) had significant feature gaps:
- ❌ Only supported autonomous mode
- ❌ No interactive or confirm_first modes
- ❌ No decision handling
- ❌ No context commands (/context, /save, /clear)
- ❌ No multi-iteration support
- ❌ ~53% feature parity with server

This v2 implementation achieves:
- ✅ All 3 modes (autonomous, interactive, confirm_first)
- ✅ Full decision handling
- ✅ Context commands (/context, /save, /clear)
- ✅ Multi-iteration workflow
- ✅ Session management
- ✅ 100% feature parity with server

## Architecture

### Based on Server Implementation

The client v2 is directly based on `wsi_server/server.py` (890 lines), which has all features fully implemented and tested. We adapted the connection layer for client use while keeping **100% of the business logic** intact.

### Key Differences from Server

| Aspect | Server (v1) | Client (v2) | Change Type |
|--------|-------------|-------------|-------------|
| **Connection** | `websockets.serve()` | `websockets.connect()` | ✅ Adapted |
| **Multiplexing** | `Dict[websocket, context]` | Single `context` | ✅ Simplified |
| **Message Loop** | `async for msg in websocket` | `await websocket.recv()` | ✅ Adapted |
| **Reconnection** | N/A | Exponential backoff retry | ✅ Added |
| **Log Streaming** | N/A | `log_streamer` integration | ✅ Added |
| **Business Logic** | 559 lines | 559 lines (copied) | ✅ Identical |

### What Was Changed

**Connection Management (~100 lines):**
- `__init__()` - Added retry config, single context instead of dict
- `connect()` - NEW: Client connection with retry logic
- `send_ready()` - Adapted for client
- `receive_loop()` - NEW: Client message loop with reconnection
- `_send_message()` - Kept from server (unchanged)

**Business Logic (~559 lines):**
- `_handle_start_generation()` - COPIED from server, added log streaming
- `_send_decision_prompt()` - COPIED from server (unchanged)
- `_finish_generation()` - COPIED from server (unchanged)
- `_handle_decision_response()` - COPIED from server (unchanged)
- `_handle_context_command()` - COPIED from server (unchanged)
- `_execute_iteration()` - COPIED from server (unchanged)

**Log Streaming (~10 lines):**
- Added `log_streamer.start_streaming()` before generation
- Added `log_streamer.stop_streaming()` after generation
- Captures all agent logs and streams via WebSocket

## Usage

### Basic Usage (Same as v1)

```python
from wsi_client_v2 import WSIClient

client = WSIClient(
    ws_url="ws://orchestrator:5013/ws/job_abc123",
    use_mock=True,
    workspace="/workspace"
)

await client.run()
```

### Advanced Usage (NEW - Interactive Modes)

```python
# Autonomous mode (v1 behavior)
client = WSIClient(ws_url="...", use_mock=True)
await client.run()
# -> Generates once, sends all_work_complete, exits

# Interactive mode (NEW in v2)
client = WSIClient(ws_url="...", use_mock=True)
await client.run()
# -> Generates, sends decision_prompt, waits for decision_response
# -> Can iterate multiple times based on user input

# Confirm-first mode (NEW in v2)
client = WSIClient(ws_url="...", use_mock=True)
await client.run()
# -> Generates, AI suggests next task, sends decision_prompt
# -> User can confirm, modify, or provide custom task
```

## Testing

### Test with Original Server (Backwards Compatibility)

```bash
# Terminal 1: Start original server
cd /home/jake/LEO/leo-wsi
python -m wsi_server.server --port 8765

# Terminal 2: Run client v2
cd /home/jake/LEO/leo-container
python -c "
from src.wsi_client_v2 import WSIClient
import asyncio
client = WSIClient(ws_url='ws://localhost:8765', use_mock=True)
asyncio.run(client.run())
"
```

### Test with Orchestrator (Production)

```bash
# Terminal 1: Start orchestrator
cd /home/jake/LEO/leo-saas/app
AWS_PROFILE=jake-dev npm run dev

# Terminal 2: Container with client v2 will connect automatically
# (orchestrator spawns container with WS_URL env var)
```

## Migration from v1 to v2

### For Testing

Add environment variable to switch implementations:

```python
# In main.py
USE_WSI_V2 = os.environ.get("USE_WSI_V2", "false").lower() == "true"

if USE_WSI_V2:
    from src.wsi_client_v2.client import WSIClient
else:
    from src.wsi_client.client import WSIClient
```

Run with v2:
```bash
USE_WSI_V2=true python -m src.main
```

### For Production Cutover (Future)

When ready to replace v1:
1. Update `main.py` to import from `wsi_client_v2` by default
2. Archive `wsi_client/` to `wsi_client_legacy/`
3. Update documentation

## Features Matrix

| Feature | v1 Client | Server | v2 Client |
|---------|-----------|--------|-----------|
| **Autonomous Mode** | ✅ | ✅ | ✅ |
| **Interactive Mode** | ❌ | ✅ | ✅ |
| **Confirm-First Mode** | ❌ | ✅ | ✅ |
| **Decision Prompts** | ❌ | ✅ | ✅ |
| **Decision Handling** | ❌ | ✅ | ✅ |
| **Context Commands** | ❌ | ✅ | ✅ |
| **Multi-Iteration** | ❌ | ✅ | ✅ |
| **Session Management** | ❌ | ✅ | ✅ |
| **Log Streaming** | ✅ | ❌ | ✅ |
| **Reconnection** | ✅ | N/A | ✅ |
| **Feature Parity** | 53% | 100% | 100% |

## Code Size

- **v1 Client:** 559 lines (136 lines business logic)
- **Server:** 890 lines (559 lines business logic)
- **v2 Client:** 1087 lines (559 lines business logic + 100 lines connection + comments)

The v2 client is larger due to comprehensive documentation and comments, but the core business logic is identical to the server (copy-pasted).

## Maintenance

### Bug Fixes

If a bug is found in the message handling logic:
1. Fix it in `wsi_server/server.py` (source of truth)
2. Copy the fixed method to `wsi_client_v2/client.py`
3. Both implementations stay in sync

### New Features

To add a new feature:
1. Implement in `wsi_server/server.py` first
2. Test with server
3. Copy to `wsi_client_v2/client.py`
4. Both get the feature simultaneously

## Future: Shared Implementation

In the future, we could extract the business logic into a shared module:

```python
# wsi_common/message_handler.py
class WSIMessageHandler:
    """Shared business logic for both client and server"""
    async def handle_start_generation(self, message, context):
        # ... 559 lines of shared logic ...

# wsi_server_v2/server.py (thin wrapper)
class WSIServer:
    def __init__(self):
        self.handler = WSIMessageHandler()

    async def handle_connection(self, websocket):
        # Connection management only
        context = create_context(websocket)
        await self.handler.handle_start_generation(msg, context)

# wsi_client_v2/client.py (thin wrapper)
class WSIClient:
    def __init__(self):
        self.handler = WSIMessageHandler()

    async def receive_loop(self):
        # Connection + retry logic only
        msg = await self.websocket.recv()
        await self.handler.handle_start_generation(msg, self.context)
```

This would guarantee feature parity (single implementation) and eliminate all duplication.

## Status

- ✅ Implementation complete
- ⏳ Testing in progress
- ⏳ Production validation pending
- ⏳ Cutover date TBD

## Contact

For questions about this implementation, refer to:
- Source: `wsi_server/server.py` (line-by-line reference)
- Protocol: `wsi_server/protocol.py` (message definitions)
- State Machine: `wsi_server/state_machine.py` (state transitions)
- Original Analysis: `/home/jake/LEO/WSI_ARCHITECTURE.md`
