"""
Integration Analyzer MCP Server - Template Comparison

Provides tools for comparing projects against their templates.
"""

import json
import os
import sys
from pathlib import Path
from typing import Dict, Any, Optional

from fastmcp import FastMCP
from ..common.logging_utils import setup_mcp_server_logging, log_server_startup, log_server_shutdown, setup_signal_handlers
from .template_comparator import TemplateComparator

# Setup logging early using shared utility
server_logger = setup_mcp_server_logging("integration_analyzer")
server_logger.info("[SERVER_INIT] Integration Analyzer MCP server module loaded")

# Create a FastMCP server instance
mcp = FastMCP("Integration Analyzer")


@mcp.tool()
async def compare_with_template(workspace: str = ".") -> str:
    """
    Compare a project against its template to find custom code.
    
    This tool identifies which files were added or modified compared to the
    original template. It uses the .baseline_manifest.json file in the project
    to determine the template and perform efficient hash-based comparison.
    
    Args:
        workspace: Path to the project directory to analyze. This is the directory
                   where you'll find the .baseline_manifest.json file and all project
                   files to compare. Defaults to current directory if not specified.
        
    Returns:
        JSON with summary counts and lists of added/modified files
    """
    server_logger.info(f"[COMPARE_TEMPLATE] Starting comparison for workspace: {workspace}")
    
    # Validate workspace path
    workspace_path = Path(workspace).resolve()
    server_logger.info(f"[COMPARE_TEMPLATE] Resolved workspace path: {workspace_path}")
    
    if not workspace_path.exists() or not workspace_path.is_dir():
        server_logger.warning(f"[COMPARE_TEMPLATE] Invalid workspace path: {workspace}")
        return json.dumps({"error": f"Invalid workspace path: {workspace}"})
    
    comparator = None
    try:
        # Create comparator and run comparison
        comparator = TemplateComparator()
        server_logger.info("[COMPARE_TEMPLATE] Running template comparison...")
        
        # Compare using the baseline manifest
        result = comparator.compare_with_manifest(str(workspace_path))
        
        # Log the full JSON response for debugging
        server_logger.info(f"[COMPARE_TEMPLATE] Full result JSON: {json.dumps(result)}")
        
        server_logger.info(f"[COMPARE_TEMPLATE] Comparison complete - Found {result['summary']['added_files']} added files, {result['summary']['modified_files']} modified files")
        
        # Return the result as JSON
        return json.dumps(result, indent=2)
        
    except FileNotFoundError as e:
        server_logger.error(f"[COMPARE_TEMPLATE] FileNotFoundError: {e}")
        return json.dumps({"error": str(e)})
    except ValueError as e:
        server_logger.error(f"[COMPARE_TEMPLATE] ValueError: {e}")
        return json.dumps({"error": str(e)})
    except Exception as e:
        server_logger.error(f"[COMPARE_TEMPLATE] Error: {e}", exc_info=True)
        return json.dumps({"error": str(e)})


def main() -> None:
    """Main entry point for the server."""
    try:
        log_server_startup(server_logger, "integration_analyzer")
        setup_signal_handlers(server_logger, "integration_analyzer")
        
        # Log initial working directory
        server_logger.info(f"[MAIN] Initial working directory: {os.getcwd()}")
        
        mcp.run(transport="stdio", show_banner=False)
    except Exception as e:
        server_logger.error(f"[MAIN] Server error: {e}", exc_info=True)
        sys.exit(1)
    finally:
        log_server_shutdown(server_logger, "integration_analyzer")


if __name__ == "__main__":
    main()