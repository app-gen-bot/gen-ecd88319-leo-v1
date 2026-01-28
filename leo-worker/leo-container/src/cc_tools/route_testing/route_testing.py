#!/usr/bin/env python3
"""
Route Testing MCP Server

An MCP server for automated route discovery and testing in Next.js applications.
Helps AI agents automatically discover all routes and test them for errors.
"""

import asyncio
import json
import os
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
from urllib.parse import urljoin
import xml.etree.ElementTree as ET

from mcp.server.fastmcp import FastMCP
from playwright.async_api import async_playwright, Page, Browser
import aiohttp

# Create server instance
mcp = FastMCP("route_testing")


async def discover_routes_from_filesystem(directory: str, include_api: bool = False) -> List[str]:
    """Discover routes from Next.js file structure."""
    routes = []
    dir_path = Path(directory)
    
    # Check for app directory (App Router)
    app_dir = dir_path / "app"
    if app_dir.exists():
        # Find all page files
        page_files = list(app_dir.glob("**/page.{js,jsx,ts,tsx}"))
        
        for file in page_files:
            # Convert file path to route
            relative_path = file.parent.relative_to(app_dir)
            route_parts = []
            
            for part in relative_path.parts:
                # Skip route groups (parentheses)
                if part.startswith("(") and part.endswith(")"):
                    continue
                route_parts.append(part)
            
            route = "/" + "/".join(route_parts) if route_parts else "/"
            routes.append(route)
        
        # Include API routes if requested
        if include_api and (app_dir / "api").exists():
            api_files = list((app_dir / "api").glob("**/route.{js,jsx,ts,tsx}"))
            for file in api_files:
                relative_path = file.parent.relative_to(app_dir / "api")
                route = "/api/" + str(relative_path).replace("\\", "/")
                routes.append(route)
    
    # Check for pages directory (Pages Router)
    pages_dir = dir_path / "pages"
    if pages_dir.exists():
        # Find all page files
        for ext in ["js", "jsx", "ts", "tsx"]:
            for file in pages_dir.glob(f"**/*.{ext}"):
                # Skip special files
                if file.stem.startswith("_") or file.stem.endswith(".d"):
                    continue
                
                # Skip API routes unless requested
                if "api" in file.parts and not include_api:
                    continue
                
                # Convert to route
                relative_path = file.relative_to(pages_dir)
                route = "/" + str(relative_path).replace("\\", "/")
                route = route.replace(f".{ext}", "")
                
                # Handle index routes
                if route.endswith("/index"):
                    route = route[:-6] or "/"
                
                routes.append(route)
    
    # Remove duplicates and sort
    return sorted(list(set(routes)))


async def discover_routes_from_sitemap(directory: str) -> List[str]:
    """Discover routes from sitemap.xml if available."""
    sitemap_path = Path(directory) / "public" / "sitemap.xml"
    
    if not sitemap_path.exists():
        return []
    
    try:
        tree = ET.parse(sitemap_path)
        root = tree.getroot()
        
        # Handle namespace in sitemap
        namespace = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        
        routes = []
        for url in root.findall(".//ns:url/ns:loc", namespace):
            if url.text:
                # Extract pathname from URL
                from urllib.parse import urlparse
                parsed = urlparse(url.text)
                routes.append(parsed.path)
        
        return routes
    except Exception:
        return []


async def discover_routes_from_deployed_sitemap(base_url: str) -> List[str]:
    """Discover routes from a deployed website's sitemap."""
    sitemap_urls = [
        f"{base_url}/sitemap.xml",
        f"{base_url}/sitemap_index.xml",
        f"{base_url}/sitemap-0.xml"
    ]
    
    routes = []
    
    async with aiohttp.ClientSession() as session:
        for sitemap_url in sitemap_urls:
            try:
                async with session.get(sitemap_url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    if response.status == 200:
                        content = await response.text()
                        
                        # Parse XML
                        root = ET.fromstring(content)
                        
                        # Handle different sitemap formats
                        # Standard sitemap
                        namespace = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}
                        for url in root.findall(".//ns:url/ns:loc", namespace):
                            if url.text:
                                from urllib.parse import urlparse
                                parsed = urlparse(url.text)
                                routes.append(parsed.path)
                        
                        # Sitemap index (points to other sitemaps)
                        for sitemap in root.findall(".//ns:sitemap/ns:loc", namespace):
                            if sitemap.text:
                                # Recursively fetch sub-sitemaps
                                sub_routes = await discover_routes_from_deployed_sitemap(sitemap.text.replace("/sitemap.xml", ""))
                                routes.extend(sub_routes)
                        
                        # If we found routes, stop checking other sitemap URLs
                        if routes:
                            break
            except Exception:
                continue
    
    return list(set(routes))  # Remove duplicates


async def test_single_route(page: Page, url: str, timeout: int) -> Dict[str, Any]:
    """Test a single route and return results."""
    result = {
        "url": url,
        "status": "unknown",
        "statusCode": None,
        "loadTime": None,
        "errors": [],
        "consoleErrors": [],
        "screenshot": None
    }
    
    start_time = datetime.now()
    console_errors = []
    
    # Collect console errors
    async def handle_console(msg):
        if msg.type == "error":
            console_errors.append(msg.text)
    
    page.on("console", handle_console)
    
    try:
        # Navigate to the route
        response = await page.goto(url, wait_until="networkidle", timeout=timeout)
        
        result["loadTime"] = int((datetime.now() - start_time).total_seconds() * 1000)
        result["statusCode"] = response.status if response else None
        result["consoleErrors"] = console_errors
        
        # Get page content
        page_content = await page.content()
        page_text = await page.text_content("body") or ""
        
        # Check for errors
        if response and response.status >= 400:
            result["status"] = "error"
            result["errors"].append(f"HTTP {response.status} error")
        elif "__next-error-h1" in page_content or "This page could not be found" in page_text:
            result["status"] = "not_found"
            result["errors"].append("404 - Page not found")
        elif "Application error" in page_content or "Error:" in page_content:
            result["status"] = "runtime_error"
            error_match = re.search(r"Error:\s*([^\n]+)", page_text)
            if error_match:
                result["errors"].append(error_match.group(1))
            else:
                result["errors"].append("Runtime error detected")
        elif len(page_text.strip()) < 10:
            result["status"] = "empty"
            result["errors"].append("Page appears to be empty")
        elif console_errors:
            result["status"] = "console_errors"
            result["errors"].extend(console_errors)
        else:
            result["status"] = "success"
        
        # Take screenshot for failed routes
        if result["status"] != "success":
            screenshot_dir = Path.cwd() / "route-test-screenshots"
            screenshot_dir.mkdir(exist_ok=True)
            
            # Create safe filename
            safe_name = re.sub(r"[^a-z0-9]", "_", url.lower())
            screenshot_path = screenshot_dir / f"{safe_name}.png"
            
            await page.screenshot(path=str(screenshot_path), full_page=True)
            result["screenshot"] = str(screenshot_path)
            
    except Exception as e:
        result["status"] = "error"
        result["errors"].append(str(e))
        result["loadTime"] = int((datetime.now() - start_time).total_seconds() * 1000)
    
    # Clean up event listener
    page.remove_listener("console", handle_console)
    
    return result


@mcp.tool()
async def test_all_routes(
    directory: str = None,
    baseUrl: str = "http://localhost:5000",
    headless: bool = True,
    timeout: int = 30000,
    routes: List[str] = None
) -> Dict[str, Any]:
    """
    Discover and test all routes in a Next.js application.
    
    Args:
        directory: Path to the Next.js application directory (optional if routes provided)
        baseUrl: Base URL for testing (default: http://localhost:5000)
        headless: Run browser in headless mode (default: True)
        timeout: Timeout per page in milliseconds (default: 30000)
        routes: Optional list of routes to test (for deployed apps without local directory)
    
    Returns:
        Test results with summary and details for failed routes
    """
    # If routes are provided directly, use them (for deployed apps)
    if routes:
        all_routes = routes
    else:
        # Verify directory exists for local testing
        if not directory or not Path(directory).exists():
            return {
                "success": False,
                "error": f"Directory not found: {directory}",
                "results": []
            }
        
        # Discover routes
        filesystem_routes = await discover_routes_from_filesystem(directory)
        sitemap_routes = await discover_routes_from_sitemap(directory)
        
        # Combine and deduplicate
        all_routes = sorted(list(set(filesystem_routes + sitemap_routes)))
        
        if not all_routes:
            return {
                "success": False,
                "error": "No routes found in the application",
                "results": []
            }
    
    # Test routes with Playwright
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=headless)
        context = await browser.new_context(viewport={"width": 1280, "height": 720})
        page = await context.new_page()
        
        results = []
        for route in all_routes:
            url = urljoin(baseUrl, route)
            result = await test_single_route(page, url, timeout)
            results.append(result)
        
        await browser.close()
    
    # Create summary
    summary = {
        "total": len(results),
        "success": sum(1 for r in results if r["status"] == "success"),
        "failed": sum(1 for r in results if r["status"] != "success"),
        "notFound": sum(1 for r in results if r["status"] == "not_found"),
        "errors": sum(1 for r in results if r["status"] == "error"),
        "runtimeErrors": sum(1 for r in results if r["status"] == "runtime_error"),
        "consoleErrors": sum(1 for r in results if r["status"] == "console_errors"),
        "empty": sum(1 for r in results if r["status"] == "empty")
    }
    
    return {
        "success": True,
        "summary": summary,
        "results": [r for r in results if r["status"] != "success"],  # Only failed routes
        "allRoutes": len(all_routes)
    }


@mcp.tool()
async def discover_routes(
    directory: str,
    includeApi: bool = False
) -> Dict[str, Any]:
    """
    Discover all routes in a Next.js app without testing.
    
    Args:
        directory: Path to the Next.js application directory
        includeApi: Include API routes in discovery (default: False)
    
    Returns:
        List of discovered routes and their sources
    """
    if not Path(directory).exists():
        return {
            "success": False,
            "error": f"Directory not found: {directory}",
            "routes": []
        }
    
    filesystem_routes = await discover_routes_from_filesystem(directory, includeApi)
    sitemap_routes = await discover_routes_from_sitemap(directory)
    
    all_routes = sorted(list(set(filesystem_routes + sitemap_routes)))
    
    return {
        "success": True,
        "routes": all_routes,
        "sources": {
            "fileSystem": len(filesystem_routes),
            "sitemap": len(sitemap_routes)
        }
    }


@mcp.tool()
async def test_specific_routes(
    directory: str,
    routes: List[str],
    baseUrl: str = "http://localhost:3000"
) -> Dict[str, Any]:
    """
    Test specific routes in a Next.js application.
    
    Args:
        directory: Path to the Next.js application directory
        routes: Array of routes to test
        baseUrl: Base URL for testing (default: http://localhost:5000)
    
    Returns:
        Test results for the specified routes
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        results = []
        for route in routes:
            url = urljoin(baseUrl, route)
            result = await test_single_route(page, url, 30000)
            results.append(result)
        
        await browser.close()
    
    return {
        "success": True,
        "results": results
    }


@mcp.tool()
async def test_deployed_site(
    url: str,
    discover_from_sitemap: bool = True,
    routes: List[str] = None,
    headless: bool = True,
    timeout: int = 30000
) -> Dict[str, Any]:
    """
    Test a deployed website by discovering and testing all its routes.
    
    Args:
        url: Base URL of the deployed site (e.g., https://example.vercel.app)
        discover_from_sitemap: Whether to discover routes from sitemap (default: True)
        routes: Optional list of specific routes to test
        headless: Run browser in headless mode (default: True)
        timeout: Timeout per page in milliseconds (default: 30000)
    
    Returns:
        Test results with summary and details for failed routes
    """
    # Normalize base URL
    base_url = url.rstrip('/')
    
    # Determine routes to test
    if routes:
        all_routes = routes
    elif discover_from_sitemap:
        # Try to discover routes from sitemap
        discovered_routes = await discover_routes_from_deployed_sitemap(base_url)
        if not discovered_routes:
            # If no sitemap, test common routes
            all_routes = ["/", "/about", "/contact", "/login", "/signup", "/dashboard", "/pricing", "/blog", "/docs"]
        else:
            all_routes = discovered_routes
    else:
        # Default common routes
        all_routes = ["/"]
    
    # Test routes with Playwright
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=headless)
        context = await browser.new_context(viewport={"width": 1280, "height": 720})
        page = await context.new_page()
        
        results = []
        for route in all_routes:
            url = urljoin(base_url, route)
            result = await test_single_route(page, url, timeout)
            results.append(result)
        
        await browser.close()
    
    # Create summary
    summary = {
        "total": len(results),
        "success": sum(1 for r in results if r["status"] == "success"),
        "failed": sum(1 for r in results if r["status"] != "success"),
        "notFound": sum(1 for r in results if r["status"] == "not_found"),
        "errors": sum(1 for r in results if r["status"] == "error"),
        "runtimeErrors": sum(1 for r in results if r["status"] == "runtime_error"),
        "consoleErrors": sum(1 for r in results if r["status"] == "console_errors"),
        "empty": sum(1 for r in results if r["status"] == "empty")
    }
    
    return {
        "success": True,
        "baseUrl": base_url,
        "summary": summary,
        "results": [r for r in results if r["status"] != "success"],  # Only failed routes
        "allRoutes": len(all_routes),
        "testedRoutes": all_routes
    }


def main():
    """Run the MCP server."""
    import sys
    mcp.run()


if __name__ == "__main__":
    main()