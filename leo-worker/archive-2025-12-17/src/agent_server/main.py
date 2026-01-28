"""FastAPI Agent Server for Happy Llama Integration.

This server provides a drop-in replacement for the TypeScript agent server
in the Happy Llama system, integrating the app-factory pipeline.
"""

import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

import requests
import uvicorn
from app_factory.main import run_pipeline
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel

sys.path.append(str(Path(__file__).parent))
from log_streamer import log_streamer

# Configure logging
logging.basicConfig(level=logging.INFO, format='[AGENT-PYTHON] %(message)s')
logger = logging.getLogger(__name__)

# Configuration
ORCHESTRATOR_URL = os.getenv("ORCHESTRATOR_URL", "http://localhost:3011")
PORT = int(os.getenv("PORT", "3012"))

# FastAPI app
app = FastAPI(title="Happy Llama Python Agent", version="1.0.0")

# Cleanup handler
@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on server shutdown."""
    log_streamer.cleanup_all()
    logger.info("🧹 Cleaned up all log streaming handlers")


class BuildRequest(BaseModel):
    """Build request model."""
    runId: str
    prompt: str 
    workspaceId: str  # Keep for backward compatibility
    workspacePath: str  # Full workspace path from orchestrator
    assignedPort: int   # Port assigned by orchestrator


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "happy-llama-agent-python"}


@app.post("/api/build")
async def build(request: BuildRequest, background_tasks: BackgroundTasks):
    """Start a new build process."""
    logger.info(f"Received build request - Run ID: {request.runId}, Workspace: {request.workspacePath}")
    logger.info(f"Port: {request.assignedPort}, Prompt: {request.prompt[:100]}...")
    
    # Start background build process
    background_tasks.add_task(run_build, request.runId, request.prompt, request.workspacePath, request.assignedPort)
    
    return {
        "status": "started",
        "runId": request.runId,
        "message": "Agent is building your application..."
    }


async def send_message(run_id: str, message_type: str, content: str):
    """Send a message to the orchestrator."""
    try:
        response = requests.post(
            f"{ORCHESTRATOR_URL}/api/runs/{run_id}/message",
            json={
                "type": message_type,
                "content": content,
                "timestamp": datetime.now().isoformat()
            },
            timeout=5
        )
        if response.status_code != 200:
            logger.error(f"Failed to send message to orchestrator: {response.status_code}")
    except Exception as e:
        logger.error(f"Error sending message to orchestrator: {e}")


async def run_build(run_id: str, prompt: str, workspace_path: str, assigned_port: int):
    """Run the build process for a workspace."""
    # Start log streaming for this build
    log_handler = log_streamer.start_streaming(run_id, send_message)
    
    try:
        logger.info(f"🚀 Starting build process for run {run_id}")
        
        # Send initial message
        await send_message(run_id, "status", "Initializing Happy Llama Python agent...")
        
        # Use workspace path provided by orchestrator
        logger.info(f"📁 Workspace path: {workspace_path}")
        logger.info(f"🔌 Assigned port: {assigned_port}")
        
        # Send progress message
        await send_message(run_id, "status", "Stage 0: Generating business requirements...")
        
        # Run the simplified app factory pipeline
        logger.info("🤖 Starting simplified AI App Factory pipeline...")
        results = await run_pipeline(
            workspace_path=workspace_path,
            user_prompt=prompt,
            frontend_port=assigned_port
        )
        
        # Send stage-specific progress updates based on results
        if results.get("prd", {}).success:
            await send_message(run_id, "status", "✅ Business requirements completed")
            await send_message(run_id, "status", "Stage 1: Generating interaction specification...")
        
        if results.get("interaction_spec", {}).success:
            await send_message(run_id, "status", "✅ Interaction specification completed")  
            await send_message(run_id, "status", "Stage 2: Creating wireframes and components...")
        
        # Check if pipeline succeeded
        if not results.get("wireframe", {}).success:
            error_msg = "Failed to generate application wireframe"
            logger.error(f"[AGENT-PYTHON-ERROR] {error_msg}")
            await send_message(run_id, "error", error_msg)
            return
        
        # Send final progress messages
        await send_message(run_id, "status", "✅ Wireframes and components completed")
        await send_message(run_id, "status", "Finalizing application structure...")
        
        # Port is already configured during pipeline initialization
        logger.info(f"✅ Application configured with port {assigned_port}")
        
        # Send final messages
        await send_message(run_id, "status", "Installing dependencies...")
        await send_message(run_id, "status", "Starting application server...")
        await send_message(run_id, "success", f"✅ Application build completed on port {assigned_port}. Orchestrator will verify health.")
        
        logger.info(f"✅ Build completed successfully for run {run_id}")
        
    except Exception as e:
        error_msg = f"Build failed: {str(e)}"
        logger.error(f"❌ [AGENT-PYTHON-ERROR] {error_msg}")
        await send_message(run_id, "error", error_msg)
    finally:
        # Always clean up log streaming
        log_streamer.stop_streaming(run_id)
        logger.info(f"🧹 Log streaming stopped for run {run_id}")



if __name__ == "__main__":
    logger.info(f"Starting Happy Llama Python Agent on port {PORT}")
    uvicorn.run(app, host="0.0.0.0", port=PORT, log_level="info")