"""Configuration management for AI App Factory."""

import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# Set up module logger
logger = logging.getLogger(__name__)

# Load environment variables from .env file
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)

# MCP Tools configuration
MCP_TOOLS_PATH = os.getenv("MCP_TOOLS")
if not MCP_TOOLS_PATH:
    logger.warning("⚠️ Warning: MCP_TOOLS environment variable not set")
    logger.warning("   Please set it in your .env file or environment")
    logger.warning("   Example: MCP_TOOLS=/home/jake/SPRINT8/mcp-tools")

# Browser configuration
# Read from environment variable (set in .env file)
# The browser tool will use this environment variable directly
BROWSER_HEADLESS = os.getenv("BROWSER_HEADLESS", "false").lower() in ["true", "1", "yes"]

def get_mcp_tools_path() -> Path:
    """Get the MCP tools path, raising an error if not configured."""
    if not MCP_TOOLS_PATH:
        raise ValueError(
            "MCP_TOOLS environment variable not set. "
            "Please set it in your .env file. "
            "Example: MCP_TOOLS=/home/jake/SPRINT8/mcp-tools"
        )
    return Path(MCP_TOOLS_PATH)