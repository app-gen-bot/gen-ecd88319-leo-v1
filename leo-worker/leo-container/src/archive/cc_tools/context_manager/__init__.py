"""
Context Manager MCP Server

Orchestrates and coordinates multiple MCP tools based on user queries.
"""

from .server import mcp

__all__ = ["mcp"]