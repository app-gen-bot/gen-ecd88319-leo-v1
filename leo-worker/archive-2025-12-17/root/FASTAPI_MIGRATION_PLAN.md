# FastAPI Agent Server Migration Plan

## Overview
Transform the app-factory CLI tool into a FastAPI microservice that serves as a drop-in replacement for the TypeScript agent in the Happy Llama system, while preserving ALL the magic of the current pipeline.

## Core Principles
1. **PRESERVE THE MAGIC** - Keep ALL MCP servers, agents, and workflows intact
2. **MINIMAL CHANGES** - Wrap, don't modify the existing pipeline
3. **STREAM EXISTING MESSAGES** - Relay current output, don't reformat yet
4. **HARDCODE CONFIG** - Remove CLI parsing, use fixed values

## Architecture

### Current Flow (CLI)
```
User → CLI Arguments → app_factory.main_v2 → Generated App in apps/
```

### New Flow (FastAPI)
```
Orchestrator → FastAPI Server → app_factory.main_v2 → Generated App in workspace/
     ↑                ↓
     └── Message Stream
```

## What We KEEP (No Changes)
- ✅ ALL MCP server configurations (tree_sitter, context_manager, graphiti, oxc, ruff, heroicons, unsplash, browser)
- ✅ ALL agent logic and system prompts
- ✅ ALL stage workflows (Stage 0, 1, 2)
- ✅ ALL resource files and specifications
- ✅ docker-compose.yml and local services
- ✅ The entire src/app_factory/ directory
- ✅ The entire src/cc_agent/ directory
- ✅ .env configuration approach

## What We ADD (New Files)
```
src/agent_server/
├── main.py                 # FastAPI app with /health and /api/build endpoints
├── app_runner.py          # Wrapper that calls existing app_factory.main_v2
├── message_relay.py       # Captures logs and sends to orchestrator
└── config.py              # Hardcoded settings
```

## What We ARCHIVE (git mv to archive/)
- Remaining test files in root
- Utility scripts not needed for core pipeline
- Old documentation that's no longer relevant
- Example files and demos

## Implementation Details

### 1. FastAPI Server (main.py)
```python
from fastapi import FastAPI, BackgroundTasks
import uvicorn

app = FastAPI()

@app.get("/health")
async def health():
    return {"status": "ok", "service": "happy-llama-agent-python"}

@app.post("/api/build")
async def build(request: BuildRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(run_build, request.runId, request.prompt, request.workspaceId)
    return {"status": "started", "runId": request.runId}
```

### 2. App Runner (app_runner.py)
```python
async def run_build(run_id: str, prompt: str, workspace_id: str):
    # Send initial message
    await send_message(run_id, "status", "Initializing...")
    
    # Set workspace path
    workspace_path = f"/home/ec2-user/workspaces/{workspace_id}"
    
    # Call EXISTING pipeline - NO MODIFICATIONS
    from app_factory.main_v2 import run_pipeline_v2
    
    results = await run_pipeline_v2(
        user_prompt=prompt,
        app_name=f"app_{workspace_id}",
        skip_questions=True,        # Hardcoded
        iterative_stage_1=True,      # Hardcoded
        output_dir=workspace_path
    )
    
    # Transform file structure
    move_frontend_to_root(workspace_path)
    
    # Update port to 5000
    update_package_json_port(workspace_path)
    
    # Send completion
    await send_message(run_id, "success", "✅ Build completed")
```

### 3. Message Relay (message_relay.py)
```python
import logging
import requests

class OrchestratorHandler(logging.Handler):
    def __init__(self, run_id: str):
        super().__init__()
        self.run_id = run_id
        self.orchestrator_url = "http://localhost:3001"
    
    def emit(self, record):
        # Send log messages to orchestrator
        message = self.format(record)
        requests.post(
            f"{self.orchestrator_url}/api/runs/{self.run_id}/message",
            json={
                "type": "status",
                "content": message,
                "timestamp": datetime.now().isoformat()
            }
        )
```

### 4. Configuration (config.py)
```python
# Hardcoded configuration - no CLI parsing needed
SKIP_QUESTIONS = True
ITERATIVE_STAGE_1 = True
PORT = 3002
ORCHESTRATOR_URL = "http://localhost:3001"
APP_PORT = 5000
WORKSPACE_BASE = "/home/ec2-user/workspaces"
```

## File Structure Transformation
After generation, transform:
```
apps/app_20250831_225644/
├── frontend/           → Move all contents to workspace root
│   ├── package.json
│   ├── app/
│   └── ...
├── backend/           → Keep for future use
└── specs/             → Keep for reference
```

To:
```
/workspace/
├── package.json       (with start script using port 5000)
├── app/
├── components/
└── ... (all frontend files at root)
```

## Message Streaming Strategy
1. **Phase 1**: Capture existing log output and relay as-is
2. **Phase 2**: Add translation layer to match Happy Llama format (if needed)
3. **Keep existing messages**: Don't lose the detailed progress updates

## Testing Plan
1. Start FastAPI server on port 3002
2. Send test build request
3. Verify messages stream to orchestrator
4. Verify app generates in workspace
5. Verify app runs on port 5000
6. Test with Happy Llama orchestrator

## Migration Steps
1. ✅ Fix MCP configuration issues (DONE)
2. ✅ Test pipeline works with simple counter app (DONE)
3. Archive unnecessary files
4. Create agent_server directory
5. Implement FastAPI wrapper
6. Test with orchestrator
7. Commit and push to branch

## Critical Success Factors
- Must preserve ALL current functionality
- Must generate same quality apps
- Must work with existing Happy Llama orchestrator
- Must stream messages in real-time
- Must complete builds within 15 minutes

## What We're NOT Changing
- ❌ NO changes to MCP servers
- ❌ NO changes to agent logic
- ❌ NO changes to prompts
- ❌ NO changes to stage workflows
- ❌ NO simplification of the pipeline itself
- ❌ NO removal of "magic" features

## Final Note
This is a WRAPPER, not a rewrite. We're taking the existing, working, magical pipeline and making it accessible via HTTP instead of CLI. The core intelligence and capabilities remain untouched.