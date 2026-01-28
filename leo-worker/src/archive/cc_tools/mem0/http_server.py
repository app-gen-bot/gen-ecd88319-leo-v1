#!/usr/bin/env python3
"""HTTP wrapper for mem0 MCP server."""

import os
import sys
from pathlib import Path
import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, JSONResponse
import json
import asyncio
from typing import Dict, Any, AsyncIterator
import logging

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

# Load environment first
from dotenv import load_dotenv
env_path = Path(__file__).parent.parent.parent.parent / ".env"
load_dotenv(env_path, override=True)

# Import the MCP server
from cc_tools.mem0.server import mcp, server

app = FastAPI(title="Mem0 MCP HTTP Server")

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get tools from FastMCP
TOOLS = {}

@app.on_event("startup")
async def startup_event():
    """Initialize server on startup."""
    logger.info("[HTTP] Starting mem0 HTTP server")
    logger.info(f"[HTTP] OPENAI_API_KEY: {'set' if os.getenv('OPENAI_API_KEY') else 'NOT SET'}")
    logger.info(f"[HTTP] NEO4J_URI: {os.getenv('NEO4J_URI', 'NOT SET')}")
    logger.info(f"[HTTP] QDRANT_URL: {os.getenv('QDRANT_URL', 'NOT SET')}")
    
    # Initialize the server
    await server.initialize()
    
    # Get tools from MCP server
    global TOOLS
    for name, tool in mcp._tool_manager.tools.items():
        TOOLS[name] = tool.handler
        logger.info(f"[HTTP] Registered tool: {name}")
    
    logger.info(f"[HTTP] Server initialized with {len(TOOLS)} tools")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    await server.cleanup()
    logger.info("[HTTP] Server shutdown complete")

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "server": "mem0-http", "tools": list(TOOLS.keys())}

@app.post("/mcp")
async def mcp_handler(request: Request):
    """Handle MCP requests over HTTP."""
    try:
        body = await request.json()
        logger.info(f"[HTTP] Received request: {body.get('method', 'unknown')}")
        
        method = body.get("method")
        params = body.get("params", {})
        request_id = body.get("id", 1)
        
        # Handle different MCP methods
        if method == "initialize":
            # Return server capabilities
            return JSONResponse({
                "jsonrpc": "2.0",
                "id": request_id,
                "result": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {
                        "tools": {}
                    },
                    "serverInfo": {
                        "name": "mem0",
                        "version": "1.0.0"
                    }
                }
            })
            
        elif method == "tools/list":
            # List available tools
            tools_list = []
            for name in TOOLS.keys():
                tool = mcp._tool_manager.tools.get(name)
                if tool:
                    tools_list.append({
                        "name": name,
                        "description": tool.description or "No description available",
                        "inputSchema": tool.input_schema or {
                            "type": "object",
                            "properties": {},
                            "required": []
                        }
                    })
            
            return JSONResponse({
                "jsonrpc": "2.0",
                "id": request_id,
                "result": {
                    "tools": tools_list
                }
            })
            
        elif method == "tools/call":
            # Call a specific tool
            tool_name = params.get("name")
            tool_args = params.get("arguments", {})
            
            logger.info(f"[HTTP] Calling tool: {tool_name} with args: {tool_args}")
            
            if tool_name not in TOOLS:
                return JSONResponse({
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "error": {
                        "code": -32601,
                        "message": f"Tool not found: {tool_name}"
                    }
                })
            
            # Call the tool
            try:
                result = await TOOLS[tool_name](**tool_args)
                logger.info(f"[HTTP] Tool {tool_name} returned: {result}")
                
                return JSONResponse({
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "result": {
                        "content": [
                            {
                                "type": "text",
                                "text": json.dumps(result, indent=2)
                            }
                        ]
                    }
                })
            except Exception as e:
                logger.error(f"[HTTP] Tool {tool_name} failed: {e}", exc_info=True)
                return JSONResponse({
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "error": {
                        "code": -32603,
                        "message": f"Tool execution failed: {str(e)}"
                    }
                })
                
        else:
            # Unknown method
            return JSONResponse({
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {
                    "code": -32601,
                    "message": f"Method not found: {method}"
                }
            })
            
    except Exception as e:
        logger.error(f"[HTTP] Request handling failed: {e}", exc_info=True)
        return JSONResponse({
            "jsonrpc": "2.0",
            "id": request.get("id", 1) if isinstance(request, dict) else 1,
            "error": {
                "code": -32603,
                "message": f"Internal error: {str(e)}"
            }
        })

@app.post("/sse")
async def sse_handler(request: Request):
    """Handle MCP requests over Server-Sent Events."""
    async def event_generator() -> AsyncIterator[str]:
        try:
            body = await request.json()
            logger.info(f"[SSE] Received request: {body}")
            
            # Process the request similar to HTTP handler
            method = body.get("method")
            params = body.get("params", {})
            request_id = body.get("id", 1)
            
            # Create response based on method
            response = None
            if method == "initialize":
                response = {
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "result": {
                        "protocolVersion": "2024-11-05",
                        "capabilities": {"tools": {}},
                        "serverInfo": {"name": "mem0", "version": "1.0.0"}
                    }
                }
            elif method == "tools/call":
                tool_name = params.get("name")
                tool_args = params.get("arguments", {})
                if tool_name in TOOLS:
                    try:
                        result = await TOOLS[tool_name](**tool_args)
                        response = {
                            "jsonrpc": "2.0",
                            "id": request_id,
                            "result": {
                                "content": [{"type": "text", "text": json.dumps(result, indent=2)}]
                            }
                        }
                    except Exception as e:
                        response = {
                            "jsonrpc": "2.0",
                            "id": request_id,
                            "error": {"code": -32603, "message": str(e)}
                        }
            
            if response:
                yield f"data: {json.dumps(response)}\n\n"
            
        except Exception as e:
            logger.error(f"[SSE] Error: {e}", exc_info=True)
            error_response = {
                "jsonrpc": "2.0",
                "id": 1,
                "error": {"code": -32603, "message": str(e)}
            }
            yield f"data: {json.dumps(error_response)}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

def main():
    """Run HTTP server."""
    uvicorn.run(
        "cc_tools.mem0.http_server:app",
        host="127.0.0.1",
        port=8001,
        log_level="info",
        reload=False
    )

if __name__ == "__main__":
    main()