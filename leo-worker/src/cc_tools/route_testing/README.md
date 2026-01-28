# Route Testing MCP Server

An MCP (Model Context Protocol) server for automated route discovery and testing in Next.js applications. This tool helps AI agents automatically discover all routes in a Next.js app and test them for errors, 404s, and other issues.

**Built with FastMCP** for consistency with other MCP servers in the project.

## Features

- **Automatic Route Discovery**: Discovers routes from both App Router and Pages Router
- **Sitemap Integration**: Can read routes from generated sitemaps
- **Comprehensive Testing**: Tests each route for:
  - HTTP errors (4xx, 5xx)
  - 404 pages
  - Runtime errors
  - Console errors
  - Empty pages
- **Screenshot Capture**: Takes screenshots of failed routes
- **Flexible Testing**: Test all routes or specific ones

## Installation

The server is automatically installed as part of the app-factory package:

```bash
uv pip install -e .
```

## Tools

### `test_all_routes`

Discovers and tests all routes in a Next.js application.

**Parameters:**
- `directory` (string, required): Path to the Next.js application
- `baseUrl` (string, optional): Base URL for testing (default: http://localhost:3000)
- `headless` (boolean, optional): Run browser in headless mode (default: true)
- `timeout` (number, optional): Timeout per page in milliseconds (default: 30000)

**Returns:**
```json
{
  "success": true,
  "summary": {
    "total": 15,
    "success": 12,
    "failed": 3,
    "notFound": 1,
    "errors": 1,
    "runtimeErrors": 1,
    "consoleErrors": 0,
    "empty": 0
  },
  "results": [
    {
      "url": "http://localhost:3000/broken-page",
      "status": "not_found",
      "statusCode": 404,
      "loadTime": 523,
      "errors": ["404 - Page not found"],
      "screenshot": "/path/to/screenshot.png"
    }
  ]
}
```

### `discover_routes`

Discovers all routes without testing them.

**Parameters:**
- `directory` (string, required): Path to the Next.js application
- `includeApi` (boolean, optional): Include API routes (default: false)

**Returns:**
```json
{
  "success": true,
  "routes": ["/", "/about", "/contact", "/blog", "/blog/[slug]"],
  "sources": {
    "fileSystem": 5,
    "sitemap": 3
  }
}
```

### `test_specific_routes`

Tests specific routes only.

**Parameters:**
- `directory` (string, required): Path to the Next.js application
- `routes` (array, required): Array of routes to test
- `baseUrl` (string, optional): Base URL for testing

## Usage in AI Agents

### Writer Agent
```python
# In Phase 2: Dev Server Testing
result = await mcp__route_testing__test_all_routes(
    directory=output_dir,
    baseUrl="http://localhost:3000"
)

if result['summary']['failed'] > 0:
    logger.error(f"Found {result['summary']['failed']} broken routes!")
    for route in result['results']:
        logger.error(f"Route {route['url']}: {route['errors']}")
        # Fix the issues...
```

### Critic Agent
```python
# Test all routes before evaluation
route_test = await mcp__route_testing__test_all_routes(
    directory=output_dir,
    headless=True
)

if route_test['summary']['failed'] > 0:
    critical_issues.append({
        'type': 'BROKEN_ROUTES',
        'severity': 'CRITICAL',
        'count': route_test['summary']['failed'],
        'details': route_test['results']
    })
```

### QC Agent
```python
# Discover all routes for comprehensive validation
routes = await mcp__route_testing__discover_routes(
    directory=output_dir,
    includeApi=True
)

# Validate against interaction spec
missing_routes = spec_routes - set(routes['routes'])
if missing_routes:
    issues.append(f"Missing routes: {missing_routes}")
```

## Configuration

Add to your MCP configuration:

```python
"route_testing": {
    "command": "uv",
    "args": ["run", "mcp-route-testing"],
    "env": {}
}
```

The server uses Playwright for browser automation, which will be automatically installed with the package dependencies.

## Route Discovery Methods

1. **File System Discovery**:
   - App Router: Looks for `page.{js,jsx,ts,tsx}` files
   - Pages Router: Looks for all component files
   - Handles dynamic routes, route groups, and nested routes

2. **Sitemap Discovery**:
   - Reads from `public/sitemap.xml` if available
   - Useful for dynamically generated routes

## Error Detection

The server detects various types of errors:

- **HTTP Errors**: 4xx and 5xx status codes
- **Next.js 404**: Custom Next.js not found pages
- **Runtime Errors**: JavaScript errors on the page
- **Console Errors**: Errors logged to browser console
- **Empty Pages**: Pages with minimal or no content

## Screenshots

Failed routes automatically get screenshots saved to `route-test-screenshots/` directory for debugging.

## Performance

- Tests routes sequentially to avoid overwhelming the dev server
- Configurable timeout per route
- Headless mode for faster testing in CI/CD

## Limitations

- Requires the Next.js dev server to be running
- Dynamic routes with parameters need to be tested with specific values
- API routes are discovered but not actively tested (would need different testing approach)