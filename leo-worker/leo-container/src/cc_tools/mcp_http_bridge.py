#!/usr/bin/env python3
"""
MCP HTTP Bridge Server

This server acts as a bridge between claude-code-sdk and MCP servers,
converting HTTP requests to MCP protocol over stdio.
"""

import os
import sys
import json
import asyncio
import subprocess
from pathlib import Path
from typing import Dict, Any, Optional
import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import uvicorn

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="MCP HTTP Bridge")

# Active MCP server processes
MCP_PROCESSES: Dict[str, subprocess.Popen] = {}

# MCP server configurations
MCP_CONFIGS = {
    "mem0": {
        "command": ["uv", "run", "mcp-mem0"],
        "env": {
            "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY", ""),
            "NEO4J_URI": "bolt://localhost:7687",
            "NEO4J_USER": "neo4j",
            "NEO4J_PASSWORD": "cc-core-password",
            "QDRANT_URL": "http://localhost:6333",
            "QDRANT_COLLECTION_NAME": "app_factory_memories",
            "MEM0_USER_ID": "app_factory",
            "MEM0_DEFAULT_CONTEXT": "app_factory"
        }
    },
    "graphiti": {
        "command": ["uv", "run", "mcp-graphiti"],
        "env": {
            "NEO4J_URI": "bolt://localhost:7687",
            "NEO4J_USER": "neo4j",
            "NEO4J_PASSWORD": "cc-core-password"
        }
    },
    "context_manager": {
        "command": ["uv", "run", "mcp-context-manager"],
        "env": {
            "CONTEXT_STORAGE_PATH": os.getenv("CONTEXT_STORAGE_PATH", os.path.expanduser("~/.cc_context_manager"))
        }
    },
    "tree_sitter": {
        "command": ["uv", "run", "mcp-tree-sitter"],
        "env": {}
    },
    "integration_analyzer": {
        "command": ["uv", "run", "mcp-integration-analyzer"],
        "env": {}
    }
}

async def send_to_mcp(server_name: str, request: Dict[str, Any]) -> Dict[str, Any]:
    """Send a request to an MCP server and get the response."""
    if server_name not in MCP_PROCESSES:
        logger.error(f"MCP server {server_name} not found")
        return {
            "jsonrpc": "2.0",
            "id": request.get("id", 1),
            "error": {
                "code": -32601,
                "message": f"MCP server {server_name} not found"
            }
        }
    
    process = MCP_PROCESSES[server_name]
    
    try:
        # Send request to MCP server's stdin
        request_str = json.dumps(request) + "\n"
        process.stdin.write(request_str.encode())
        process.stdin.flush()
        
        # Read response from stdout
        response_line = process.stdout.readline()
        if response_line:
            return json.loads(response_line.decode())
        else:
            return {
                "jsonrpc": "2.0",
                "id": request.get("id", 1),
                "error": {
                    "code": -32603,
                    "message": "No response from MCP server"
                }
            }
    except Exception as e:
        logger.error(f"Error communicating with MCP server {server_name}: {e}")
        return {
            "jsonrpc": "2.0",
            "id": request.get("id", 1),
            "error": {
                "code": -32603,
                "message": str(e)
            }
        }

@app.on_event("startup")
async def startup_event():
    """Start all MCP servers on startup."""
    logger.info("Starting MCP HTTP Bridge...")
    
    # Load environment
    from dotenv import load_dotenv
    env_path = Path(__file__).parent.parent.parent / ".env"
    load_dotenv(env_path, override=True)
    
    # Start each MCP server
    for server_name, config in MCP_CONFIGS.items():
        try:
            env = {**os.environ, **config["env"]}
            process = subprocess.Popen(
                config["command"],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env=env,
                text=False  # Use bytes for more control
            )
            MCP_PROCESSES[server_name] = process
            logger.info(f"Started MCP server: {server_name}")
        except Exception as e:
            logger.error(f"Failed to start MCP server {server_name}: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Stop all MCP servers on shutdown."""
    logger.info("Stopping MCP servers...")
    for server_name, process in MCP_PROCESSES.items():
        try:
            process.terminate()
            process.wait(timeout=5)
            logger.info(f"Stopped MCP server: {server_name}")
        except:
            process.kill()
            logger.warning(f"Force killed MCP server: {server_name}")

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "servers": list(MCP_PROCESSES.keys()),
        "bridge": "mcp-http-bridge"
    }

@app.post("/mcp/{server_name}")
async def mcp_handler(server_name: str, request: Request):
    """Handle MCP requests for a specific server."""
    try:
        body = await request.json()
        logger.info(f"[{server_name}] Received: {body.get('method', 'unknown')}")
        
        # Forward to MCP server
        response = await send_to_mcp(server_name, body)
        
        logger.info(f"[{server_name}] Response: {response.get('result', response.get('error', 'unknown'))}")
        return JSONResponse(response)
        
    except Exception as e:
        logger.error(f"[{server_name}] Error: {e}")
        return JSONResponse({
            "jsonrpc": "2.0",
            "id": 1,
            "error": {
                "code": -32603,
                "message": str(e)
            }
        })

def main():
    """Run the HTTP bridge server."""
    uvicorn.run(
        "cc_tools.mcp_http_bridge:app",
        host="127.0.0.1",
        port=8002,
        log_level="info",
        reload=False
    )

if __name__ == "__main__":
    main()