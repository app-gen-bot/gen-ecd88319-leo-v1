#!/usr/bin/env python3
"""
Browser MCP Server

Provides browser automation capabilities through Playwright, with error detection
and screenshot capture.

Tools provided:
- browser: Web page interaction, navigation, screenshots, error detection
"""

import json
import os
import sys
import asyncio
from pathlib import Path
from typing import Dict, Any, Optional, Union
from datetime import datetime

from fastmcp import FastMCP
from ..common.logging_utils import setup_mcp_server_logging

# Setup logging
server_logger = setup_mcp_server_logging("browser")
server_logger.info("[SERVER_INIT] Browser MCP server module loaded")

# Create server instance
mcp = FastMCP("Browser Tool")

# Global browser state
browser_state = {
    "browser": None,
    "context": None,
    "page": None,
    "playwright": None,
    "screenshot_dir": "./screenshots",
    "errors": []
}


@mcp.tool()
async def open_browser(
    headless: Optional[Union[bool, str]] = None,
    screenshot_dir: Optional[str] = "./screenshots",
    timeout: Optional[int] = 30000
) -> str:
    """Open a new browser session with Playwright.
    
    Opens a Chromium browser instance that can be used for web automation.
    The browser will remain open until close_browser() is called.
    
    Args:
        headless: Whether to run browser in headless mode. Accepts boolean or string values.
                 String values: "false", "0", "no", "off" = False; all others = True.
                 If not specified, defaults to the BROWSER_HEADLESS environment variable or True.
        screenshot_dir: Directory to save screenshots (relative to current directory).
        timeout: Default timeout in milliseconds for browser operations.
    
    Returns:
        JSON with success status and path to initial screenshot.
        
    Example:
        {"success": true, "screenshot": "./screenshots/browser_opened_20250706_120000.png"}
    """
    server_logger.info(f"[OPEN_BROWSER] Opening browser: headless={headless}, screenshot_dir={screenshot_dir}")
    
    try:
        return await _open_browser(headless, screenshot_dir, timeout)
    except Exception as e:
        server_logger.error(f"[OPEN_BROWSER] Failed: {e}", exc_info=True)
        return json.dumps({
            "success": False,
            "error": str(e)
        })


@mcp.tool()
async def navigate_browser(url: str) -> str:
    """Navigate the browser to a URL.
    
    Navigates the open browser to the specified URL and waits for the page to load.
    Captures any JavaScript errors, console errors, and takes a screenshot.
    
    Args:
        url: The URL to navigate to (must include protocol, e.g., https://)
    
    Returns:
        JSON with success status, screenshot path, and any detected errors.
        
    Example:
        {
            "success": true,
            "url": "https://example.com",
            "screenshot": "./screenshots/navigate_20250706_120100.png",
            "errors": {
                "javascript_errors": [],
                "console_logs": []
            }
        }
    """
    server_logger.info(f"[NAVIGATE_BROWSER] Navigating to: {url}")
    
    try:
        return await _navigate(url)
    except Exception as e:
        server_logger.error(f"[NAVIGATE_BROWSER] Failed: {e}", exc_info=True)
        return json.dumps({
            "success": False,
            "error": str(e)
        })


@mcp.tool()
async def interact_browser(
    selector: str,
    interaction: str,
    value: Optional[str] = None,
    wait_time: Optional[float] = 1.0
) -> str:
    """Interact with a page element in the browser.
    
    Performs an interaction with an element on the page using CSS selectors.
    Takes a screenshot after the interaction and captures any errors.
    
    Args:
        selector: CSS selector for the element to interact with.
        interaction: Type of interaction to perform. Options:
                    - "click": Click the element
                    - "fill": Fill input with text (requires value)
                    - "select": Select option in dropdown (requires value)
                    - "hover": Hover over element
                    - "check": Check a checkbox
                    - "uncheck": Uncheck a checkbox
                    - "evaluate": Run JavaScript on element (requires value)
        value: Value for interactions that require input (fill, select, evaluate).
        wait_time: Time to wait after interaction in seconds (default: 1.0).
    
    Returns:
        JSON with success status, screenshot, and any detected errors.
        
    Examples:
        Click: interact_browser("#submit-btn", "click")
        Fill: interact_browser("input[name='email']", "fill", "test@example.com")
        Select: interact_browser("select#country", "select", "US")
    """
    server_logger.info(f"[INTERACT_BROWSER] Interaction: {interaction} on {selector}")
    
    try:
        return await _interact(selector, interaction, value, wait_time)
    except Exception as e:
        server_logger.error(f"[INTERACT_BROWSER] Failed: {e}", exc_info=True)
        return json.dumps({
            "success": False,
            "error": str(e)
        })


@mcp.tool()
async def close_browser() -> str:
    """Close the browser session.
    
    Closes the browser, all open pages, and cleans up resources.
    Safe to call even if browser is already closed.
    
    Returns:
        JSON with success status.
        
    Example:
        {"success": true, "timestamp": "2025-07-06T12:00:00"}
    """
    server_logger.info("[CLOSE_BROWSER] Closing browser session")
    
    try:
        return await _close_browser()
    except Exception as e:
        server_logger.error(f"[CLOSE_BROWSER] Failed: {e}", exc_info=True)
        return json.dumps({
            "success": False,
            "error": str(e)
        })


async def _open_browser(headless: Optional[Union[bool, str]], screenshot_dir: str, timeout: int) -> str:
    """Open a new browser session."""
    global browser_state
    
    # Check if browser is already open
    if browser_state["browser"] is not None:
        return json.dumps({
            "success": False,
            "error": "Browser is already open. Close it first."
        })
    
    try:
        # Import playwright
        from playwright.async_api import async_playwright
        
        # Use current working directory as base for screenshots
        if not os.path.isabs(screenshot_dir):
            screenshot_dir = os.path.join(os.getcwd(), screenshot_dir)
        
        # Create screenshot directory
        Path(screenshot_dir).mkdir(parents=True, exist_ok=True)
        browser_state["screenshot_dir"] = screenshot_dir
        
        # Determine headless mode
        # Priority: parameter > env variable > default (True)
        if headless is None:
            headless_env = os.environ.get('BROWSER_HEADLESS', 'true').lower()
            headless = headless_env not in ['false', '0', 'no', 'off']
        elif isinstance(headless, str):
            # Convert string to boolean
            headless = headless.lower() not in ['false', '0', 'no', 'off']
        
        # Launch browser
        playwright = await async_playwright().start()
        browser_state["playwright"] = playwright
        
        # Log browser mode
        mode = "headless" if headless else "visible"
        server_logger.info(f"[BROWSER_LAUNCH] Launching in {mode} mode")
        
        server_logger.info("[BROWSER_LAUNCH] About to launch chromium")
        browser = await playwright.chromium.launch(
            headless=headless,
            args=['--no-sandbox', '--disable-setuid-sandbox']
        )
        server_logger.info("[BROWSER_LAUNCH] Chromium launched successfully")
        browser_state["browser"] = browser
        
        # Create context with viewport
        server_logger.info("[BROWSER_LAUNCH] Creating browser context")
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 1024},
            ignore_https_errors=True
        )
        server_logger.info("[BROWSER_LAUNCH] Browser context created")
        browser_state["context"] = context
        
        # Create page
        server_logger.info("[BROWSER_LAUNCH] Creating new page")
        page = await context.new_page()
        server_logger.info("[BROWSER_LAUNCH] Page created successfully")
        browser_state["page"] = page
        
        # Set default timeout
        page.set_default_timeout(timeout)
        
        # Set up error detection
        browser_state["errors"] = []
        
        # Listen for console messages
        async def handle_console_msg(msg):
            if msg.type in ["error", "warning"]:
                browser_state["errors"].append({
                    "type": "console",
                    "level": msg.type,
                    "text": msg.text,
                    "location": msg.location
                })
        
        page.on("console", handle_console_msg)
        
        # Listen for page errors
        async def handle_page_error(error):
            browser_state["errors"].append({
                "type": "pageerror",
                "error": str(error)
            })
        
        page.on("pageerror", handle_page_error)
        
        # Take initial screenshot
        screenshot_path = Path(screenshot_dir) / f"browser_opened_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        
        try:
            server_logger.info(f"[BROWSER_LAUNCH] Taking screenshot to: {screenshot_path}")
            await page.screenshot(path=str(screenshot_path))
            server_logger.info(f"[BROWSER_LAUNCH] Screenshot saved successfully")
        except Exception as screenshot_error:
            server_logger.warning(f"[BROWSER_LAUNCH] Screenshot failed: {screenshot_error}")
            # Continue without screenshot
        
        return json.dumps({
            "success": True,
            "screenshot": str(screenshot_path) if screenshot_path.exists() else None,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        # Clean up on error
        browser_state = {
            "browser": None,
            "context": None,
            "page": None,
            "playwright": None,
            "screenshot_dir": screenshot_dir,
            "errors": []
        }
        return json.dumps({
            "success": False,
            "error": f"Failed to open browser: {str(e)}"
        })


async def _navigate(url: str) -> str:
    """Navigate to a URL."""
    global browser_state
    
    # Check if browser is open
    if browser_state["page"] is None:
        return json.dumps({
            "success": False,
            "error": "Browser not initialized. Call 'open' first."
        })
    
    if not url:
        return json.dumps({
            "success": False,
            "error": "URL not provided"
        })
    
    try:
        page = browser_state["page"]
        
        # Clear previous errors
        browser_state["errors"] = []
        
        # Navigate to URL
        response = await page.goto(url, wait_until="networkidle")
        
        # Wait a bit for any errors to be captured
        await asyncio.sleep(1)
        
        # Take screenshot
        screenshot_path = Path(browser_state["screenshot_dir"]) / f"navigate_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        await page.screenshot(path=str(screenshot_path))
        
        # Collect any JavaScript errors
        js_errors = [e for e in browser_state["errors"] if e.get("type") == "pageerror" or (e.get("type") == "console" and e.get("level") == "error")]
        
        result = {
            "success": True,
            "url": url,
            "screenshot": str(screenshot_path),
            "timestamp": datetime.now().isoformat(),
            "errors": {
                "javascript_errors": js_errors,
                "console_logs": browser_state["errors"]
            }
        }
        
        if response and not response.ok:
            result["http_status"] = response.status
            result["http_status_text"] = response.status_text
        
        return json.dumps(result)
        
    except Exception as e:
        return json.dumps({
            "success": False,
            "error": f"Navigation failed: {str(e)}"
        })


async def _interact(selector: str, interaction: str, value: Optional[str], wait_time: float) -> str:
    """Interact with a page element."""
    global browser_state
    
    # Check if browser is open
    if browser_state["page"] is None:
        return json.dumps({
            "success": False,
            "error": "Browser not initialized. Call 'open' first."
        })
    
    if not selector or not interaction:
        return json.dumps({
            "success": False,
            "error": "Selector and interaction type must be provided"
        })
    
    try:
        page = browser_state["page"]
        
        # Clear previous errors
        browser_state["errors"] = []
        
        # Wait for element
        element = await page.wait_for_selector(selector, timeout=10000)
        
        if not element:
            return json.dumps({
                "success": False,
                "error": f"Element not found: {selector}"
            })
        
        # Perform interaction
        if interaction == "click":
            await element.click()
        elif interaction == "fill":
            if not value:
                return json.dumps({
                    "success": False,
                    "error": "Value required for fill interaction"
                })
            await element.fill(value)
        elif interaction == "select":
            if not value:
                return json.dumps({
                    "success": False,
                    "error": "Value required for select interaction"
                })
            await element.select_option(value)
        elif interaction == "hover":
            await element.hover()
        elif interaction == "check":
            await element.check()
        elif interaction == "uncheck":
            await element.uncheck()
        elif interaction == "evaluate":
            if not value:
                return json.dumps({
                    "success": False,
                    "error": "JavaScript code required for evaluate interaction"
                })
            result = await element.evaluate(value)
        else:
            return json.dumps({
                "success": False,
                "error": f"Unknown interaction type: {interaction}"
            })
        
        # Wait after interaction
        await asyncio.sleep(wait_time)
        
        # Take screenshot
        screenshot_path = Path(browser_state["screenshot_dir"]) / f"interact_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        await page.screenshot(path=str(screenshot_path))
        
        # Collect any JavaScript errors
        js_errors = [e for e in browser_state["errors"] if e.get("type") == "pageerror" or (e.get("type") == "console" and e.get("level") == "error")]
        
        return json.dumps({
            "success": True,
            "selector": selector,
            "action": interaction,
            "value": value,
            "screenshot": str(screenshot_path),
            "timestamp": datetime.now().isoformat(),
            "errors": {
                "javascript_errors": js_errors,
                "console_logs": browser_state["errors"]
            }
        })
        
    except Exception as e:
        return json.dumps({
            "success": False,
            "error": f"Interaction failed: {str(e)}"
        })


async def _close_browser() -> str:
    """Close the browser session."""
    global browser_state
    
    # Check if browser is open
    if browser_state["browser"] is None:
        return json.dumps({
            "success": True,
            "message": "Browser already closed"
        })
    
    try:
        # Close page
        if browser_state["page"]:
            await browser_state["page"].close()
        
        # Close context
        if browser_state["context"]:
            await browser_state["context"].close()
        
        # Close browser
        if browser_state["browser"]:
            await browser_state["browser"].close()
        
        # Stop playwright
        if browser_state.get("playwright"):
            await browser_state["playwright"].stop()
        
        # Reset state
        browser_state.update({
            "browser": None,
            "context": None,
            "page": None,
            "playwright": None,
            "screenshot_dir": "./screenshots",
            "errors": []
        })
        
        return json.dumps({
            "success": True,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        # Force reset state even on error
        browser_state.update({
            "browser": None,
            "context": None,
            "page": None,
            "playwright": None,
            "screenshot_dir": "./screenshots",
            "errors": []
        })
        
        return json.dumps({
            "success": False,
            "error": f"Error closing browser: {str(e)}",
            "warning": "Browser state has been reset"
        })


def main():
    """Main entry point for the server."""
    try:
        server_logger.info("[MAIN] Starting Browser MCP server")
        server_logger.info("[MAIN] Default screenshot directory: ./screenshots")
        
        mcp.run(transport="stdio", show_banner=False)
        
    except KeyboardInterrupt:
        server_logger.info("[MAIN] Received KeyboardInterrupt - graceful shutdown")
        # Ensure browser is closed on shutdown
        if browser_state["browser"] is not None:
            server_logger.info("[MAIN] Closing browser before shutdown")
            asyncio.run(_close_browser())
        sys.exit(0)
    except Exception as e:
        server_logger.error(f"[MAIN] Fatal error: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()