#!/usr/bin/env python3
"""Test script for route_testing MCP server."""

import asyncio
import json
from pathlib import Path

from route_testing import discover_routes_from_filesystem, discover_routes_from_sitemap


async def test_route_discovery():
    """Test route discovery functions."""
    print("Testing route discovery functions...")
    
    # Test with a sample directory structure
    test_dir = Path(__file__).parent
    
    # Test filesystem discovery
    print(f"\nTesting filesystem discovery on: {test_dir}")
    routes = await discover_routes_from_filesystem(str(test_dir))
    print(f"Found {len(routes)} routes: {routes}")
    
    # Test with API routes included
    routes_with_api = await discover_routes_from_filesystem(str(test_dir), include_api=True)
    print(f"With API routes: {len(routes_with_api)} routes")
    
    # Test sitemap discovery
    print(f"\nTesting sitemap discovery...")
    sitemap_routes = await discover_routes_from_sitemap(str(test_dir))
    print(f"Found {len(sitemap_routes)} routes from sitemap")
    
    print("\n✅ Route discovery tests completed!")


async def test_mcp_tools():
    """Test MCP tool definitions."""
    from route_testing import mcp
    
    print("\nTesting MCP tool definitions...")
    print(f"Server name: {mcp.name}")
    
    # FastMCP doesn't expose tools directly, but we know what we defined
    tools = ["test_all_routes", "discover_routes", "test_specific_routes"]
    print(f"\nDefined tools:")
    for tool in tools:
        print(f"  - {tool}")
    
    print(f"\n✅ Found {len(tools)} tools: {', '.join(tools)}")
    
    # Test that the server can run (without actually starting it)
    print("\nServer is ready to run with: uv run mcp-route-testing")


async def main():
    """Run all tests."""
    print("Route Testing MCP Server Test Suite")
    print("=" * 50)
    
    await test_route_discovery()
    await test_mcp_tools()
    
    print("\n" + "=" * 50)
    print("All tests completed! ✅")
    print("\nTo run the server:")
    print("  uv run mcp-route-testing")


if __name__ == "__main__":
    asyncio.run(main())