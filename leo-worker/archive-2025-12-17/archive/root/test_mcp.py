#!/usr/bin/env python3
import fastmcp
import sys

# Test if show_banner works
mcp = fastmcp.create_mcp_server(
    name="test",
    version="1.0.0"
)

@mcp.tool()
def test_tool():
    """Test tool"""
    return "test"

if __name__ == "__main__":
    print("Testing MCP server...", file=sys.stderr)
    mcp.run(transport="stdio", show_banner=False)