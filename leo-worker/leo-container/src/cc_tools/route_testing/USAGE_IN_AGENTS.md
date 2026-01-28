# Using Route Testing MCP Server in AI Agents

## Adding to Agent Configuration

In your agent's `__init__.py` or configuration:

```python
# Add route_testing to allowed tools
self.allowed_tools = [
    "Read", "Write", "Edit", "Bash",
    "mcp__route_testing__test_all_routes",
    "mcp__route_testing__discover_routes", 
    "mcp__route_testing__test_specific_routes"
]

# Configure MCP servers
self.mcp_config = {
    "route_testing": {
        "command": "uv",
        "args": ["run", "mcp-route-testing"],
        "env": {}
    }
}
```

## Example Usage in Writer Agent

```python
# In stage_2_wireframe/writer/agent.py

# Phase 2: Dev Server Testing
logger.info("Testing all routes in the application...")
route_test_result = await mcp__route_testing__test_all_routes(
    directory=output_dir,
    baseUrl="http://localhost:3000",
    headless=True
)

if route_test_result['summary']['failed'] > 0:
    logger.error(f"❌ Found {route_test_result['summary']['failed']} broken routes!")
    
    # Analyze failed routes
    for route in route_test_result['results']:
        logger.error(f"Route {route['url']}: {route['status']}")
        logger.error(f"Errors: {', '.join(route['errors'])}")
        
        # Fix common issues
        if route['status'] == 'not_found':
            # Check if route should exist according to spec
            # Create missing page.tsx file if needed
            pass
        elif route['status'] == 'runtime_error':
            # Fix the runtime error
            # Check route['errors'] for details
            pass
```

## Example Usage in Critic Agent

```python
# In stage_2_wireframe/critic/agent.py

# Comprehensive route testing
logger.info("Discovering and testing all routes...")

# First discover all routes
routes_info = await mcp__route_testing__discover_routes(
    directory=output_dir,
    includeApi=True
)

logger.info(f"Found {len(routes_info['routes'])} routes")

# Test all routes
test_results = await mcp__route_testing__test_all_routes(
    directory=output_dir,
    headless=True,
    timeout=60000  # Longer timeout for thorough testing
)

# Add to evaluation
if test_results['summary']['failed'] > 0:
    issues.append({
        'type': 'BROKEN_ROUTES',
        'severity': 'CRITICAL',
        'message': f"{test_results['summary']['failed']} routes are broken",
        'details': {
            'notFound': test_results['summary']['notFound'],
            'errors': test_results['summary']['errors'],
            'runtimeErrors': test_results['summary']['runtimeErrors'],
            'failedRoutes': [r['url'] for r in test_results['results']]
        }
    })
```

## Example Usage in QC Agent

```python
# Quality control validation

# Validate all specified routes exist
spec_routes = extract_routes_from_spec(interaction_spec)
discovered_routes = await mcp__route_testing__discover_routes(
    directory=output_dir
)

missing_routes = set(spec_routes) - set(discovered_routes['routes'])
extra_routes = set(discovered_routes['routes']) - set(spec_routes)

if missing_routes:
    qc_issues.append(f"Missing routes from spec: {missing_routes}")
    
if extra_routes:
    qc_issues.append(f"Extra routes not in spec: {extra_routes}")

# Test critical user flows
critical_routes = ["/", "/login", "/dashboard", "/settings"]
critical_test = await mcp__route_testing__test_specific_routes(
    directory=output_dir,
    routes=critical_routes
)

for result in critical_test['results']:
    if result['status'] != 'success':
        qc_issues.append(f"Critical route {result['url']} is broken: {result['errors']}")
```

## Integration with Pipeline

In `app_factory/stages/stage_2_wireframe.py`:

```python
# Add to Writer agent configuration
writer_agent = Agent(
    name="Stage_2_Wireframe_Writer",
    allowed_tools=[
        "Read", "Write", "Edit", "MultiEdit",
        "mcp__route_testing__test_all_routes",
        "mcp__route_testing__discover_routes"
    ],
    # ... other config
)

# Pass MCP config when running
result = await writer_agent.run(
    user_prompt=prompt,
    mcp_servers={
        "route_testing": {
            "command": "uv",
            "args": ["run", "mcp-route-testing"],
            "env": {}
        }
    }
)
```

## Best Practices

1. **Always test after dev server starts**: Wait for server to be ready before testing
2. **Use headless mode in CI/CD**: Set `headless=True` for automated testing
3. **Capture screenshots**: Failed routes automatically get screenshots for debugging
4. **Test incrementally**: Test specific routes during development, all routes before completion
5. **Handle dynamic routes**: Test with realistic parameter values for dynamic routes

## Common Issues and Solutions

### Dev Server Not Running
```python
# Check server status first
server_status = await check_dev_server_status()
if not server_status['running']:
    await start_dev_server()
    await asyncio.sleep(5)  # Wait for startup
```

### Dynamic Routes
```python
# Test dynamic routes with specific values
dynamic_routes = [
    "/blog/my-first-post",
    "/user/123",
    "/product/abc-123"
]
await mcp__route_testing__test_specific_routes(
    directory=output_dir,
    routes=dynamic_routes
)
```

### Authentication Required Routes
```python
# For routes requiring auth, ensure demo user works
# The route testing will detect if login redirects are happening
```