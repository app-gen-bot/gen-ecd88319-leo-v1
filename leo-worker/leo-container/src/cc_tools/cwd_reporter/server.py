"""
CWD Reporter MCP Server

Simple MCP server to test and understand working directory behavior.
Provides tools to inspect how paths are resolved and what the tool sees.
"""

import os
import sys
import json
from pathlib import Path
from typing import List, Dict, Any

from fastmcp import FastMCP
from ..common.logging_utils import setup_mcp_server_logging, log_server_startup, log_server_shutdown, setup_signal_handlers

# Setup logging
server_logger = setup_mcp_server_logging("cwd_reporter")
server_logger.info("[SERVER_INIT] CWD Reporter MCP server module loaded")

# Create FastMCP instance
mcp = FastMCP("CWD Reporter")


@mcp.tool()
async def get_cwd() -> str:
    """
    Get the current working directory as seen by this MCP tool.
    
    Returns:
        JSON with current working directory information
    """
    cwd = os.getcwd()
    server_logger.info(f"[GET_CWD] Current working directory: {cwd}")
    
    return json.dumps({
        "cwd": cwd,
        "cwd_from_pathlib": str(Path.cwd()),
        "python_executable": sys.executable,
        "process_id": os.getpid()
    }, indent=2)


@mcp.tool()
async def resolve_path(path: str) -> str:
    """
    Show how a given path is resolved from the current working directory.
    
    Args:
        path: Path to resolve (can be relative or absolute)
        
    Returns:
        JSON with path resolution information
    """
    server_logger.info(f"[RESOLVE_PATH] Resolving path: {path}")
    
    path_obj = Path(path)
    cwd = Path.cwd()
    
    result = {
        "input_path": path,
        "is_absolute": path_obj.is_absolute(),
        "current_cwd": str(cwd),
        "resolved_path": str(path_obj.resolve()),
        "exists": path_obj.exists(),
        "relative_to_cwd": None
    }
    
    # Try to get relative path from cwd
    try:
        result["relative_to_cwd"] = str(path_obj.resolve().relative_to(cwd))
    except ValueError:
        result["relative_to_cwd"] = "Not relative to current directory"
    
    server_logger.info(f"[RESOLVE_PATH] Resolved to: {result['resolved_path']}")
    return json.dumps(result, indent=2)


@mcp.tool()
async def list_files(path: str = ".", max_items: int = 20) -> str:
    """
    List files in a directory to test access permissions.
    
    Args:
        path: Directory path to list (default: current directory)
        max_items: Maximum number of items to return
        
    Returns:
        JSON with directory listing
    """
    server_logger.info(f"[LIST_FILES] Listing files in: {path}")
    
    try:
        path_obj = Path(path)
        resolved = path_obj.resolve()
        
        if not resolved.exists():
            return json.dumps({
                "error": f"Path does not exist: {path}",
                "resolved_path": str(resolved)
            }, indent=2)
        
        if not resolved.is_dir():
            return json.dumps({
                "error": f"Path is not a directory: {path}",
                "resolved_path": str(resolved)
            }, indent=2)
        
        # List files
        items = []
        for i, item in enumerate(resolved.iterdir()):
            if i >= max_items:
                break
            items.append({
                "name": item.name,
                "type": "dir" if item.is_dir() else "file",
                "size": item.stat().st_size if item.is_file() else None
            })
        
        return json.dumps({
            "path": path,
            "resolved_path": str(resolved),
            "cwd": str(Path.cwd()),
            "can_access_parent": resolved.parent.exists(),
            "total_items": len(list(resolved.iterdir())),
            "items_shown": len(items),
            "items": items
        }, indent=2)
        
    except PermissionError as e:
        server_logger.warning(f"[LIST_FILES] Permission denied: {e}")
        return json.dumps({
            "error": "Permission denied",
            "path": path,
            "message": str(e)
        }, indent=2)
    except Exception as e:
        server_logger.error(f"[LIST_FILES] Error: {e}")
        return json.dumps({
            "error": "Unexpected error",
            "path": path,
            "message": str(e)
        }, indent=2)


@mcp.tool()
async def test_path_access(paths: List[str]) -> str:
    """
    Test if various paths can be accessed from current working directory.
    
    Args:
        paths: List of paths to test
        
    Returns:
        JSON with access test results for each path
    """
    server_logger.info(f"[TEST_ACCESS] Testing access to {len(paths)} paths")
    
    cwd = Path.cwd()
    results = {
        "cwd": str(cwd),
        "tests": []
    }
    
    for path_str in paths:
        path = Path(path_str)
        resolved = path.resolve()
        
        test_result = {
            "path": path_str,
            "resolved": str(resolved),
            "exists": resolved.exists(),
            "readable": False,
            "writable": False,
            "is_under_cwd": False
        }
        
        if resolved.exists():
            test_result["readable"] = os.access(resolved, os.R_OK)
            test_result["writable"] = os.access(resolved, os.W_OK)
        
        # Check if path is under cwd
        try:
            resolved.relative_to(cwd)
            test_result["is_under_cwd"] = True
        except ValueError:
            test_result["is_under_cwd"] = False
        
        results["tests"].append(test_result)
    
    return json.dumps(results, indent=2)


def main() -> None:
    """Main entry point for the server."""
    try:
        log_server_startup(server_logger, "cwd_reporter")
        setup_signal_handlers(server_logger, "cwd_reporter")
        
        # Log initial working directory
        server_logger.info(f"[MAIN] Initial working directory: {os.getcwd()}")
        
        mcp.run(transport="stdio", show_banner=False)
    except Exception as e:
        server_logger.error(f"[MAIN] Server error: {e}", exc_info=True)
        sys.exit(1)
    finally:
        log_server_shutdown(server_logger, "cwd_reporter")


if __name__ == "__main__":
    main()