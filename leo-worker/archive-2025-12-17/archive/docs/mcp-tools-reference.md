# MCP Tools Reference

This document provides a reference for the MCP (Model Context Protocol) tools available from the mcp-tools package that can be used in the AI App Factory pipeline.

## Environment Configuration

Add to your `.env` file:
```
MCP_TOOLS=/path/to/mcp-tools
```

Example for the current setup:
```
MCP_TOOLS=/home/jake/SPRINT8/mcp-tools
```

## Available Tools

### 1. Build Test Tool (`build_test`)

**Purpose**: Runs build and test commands to verify code compiles and runs without errors.

**Primary Function**:
- `build_test(command)` - Runs verification commands

**Commands**:
- `"verify"` - Run all critical checks (type-check, build, lint) - **RECOMMENDED**
- `"type-check"` - Run TypeScript type checking only
- `"build"` - Run the build process only
- `"lint"` - Run the linter only
- `"test"` - Run tests if configured
- `"dev"` - Check if the development server can start

**Key Features**:
- Automatically uses npm package manager
- Uses pre-configured workspace path
- Detects common issues like missing dependencies, syntax errors, type errors
- No need to specify directory paths or ports

**Example Usage**:
```python
result = await build_test(command="verify")
```

### 2. Browser Tool (`browser`)

**Purpose**: Web page interaction, navigation, screenshots, and error detection.

**Primary Function**:
- `browser(action, headless, screenshot_dir, timeout, url, selector, interaction, value, wait_time)`

**Actions**:
- `"open"` - Open a browser session
- `"navigate"` - Navigate to a URL
- `"interact"` - Interact with page elements (click, type, etc.)
- `"close"` - Close the browser session

**Key Features**:
- Captures console logs and JavaScript errors
- Takes screenshots automatically
- Headless or visible mode
- Error detection matching Chrome DevTools format

**Example Usage**:
```python
# Open browser
await browser(action="open", headless=True)

# Navigate to URL
await browser(action="navigate", url="http://localhost:3000")

# Interact with element
await browser(action="interact", selector="#button", interaction="click")

# Close browser
await browser(action="close")
```

### 3. Integration Analyzer Tool

**Purpose**: Analyzes integration points in TypeScript/JavaScript projects, finding differences between template and generated code.

**Functions**:
- `analyze_project(project_path, output_format)` - Analyze a project for integration points
- `find_stubs(project_path, pattern_type)` - Find specific types of stubs

**Key Features**:
- Identifies API stubs, mock data, environment variables
- Finds hardcoded URLs and auth stubs
- Outputs in markdown or JSON format
- Perfect for QC agent to focus review scope

**Pattern Types**:
- `"api_stubs"` - API integration points
- `"mock_data"` - Mock data implementations
- `"env_vars"` - Environment variable usage
- `"hardcoded_urls"` - Hardcoded URLs
- `"auth_stubs"` - Authentication stubs
- `"all"` - All patterns

**Example Usage**:
```python
# Analyze entire project
result = await analyze_project(
    project_path="/path/to/project",
    output_format="markdown"
)

# Find specific stubs
stubs = await find_stubs(
    project_path="/path/to/project",
    pattern_type="api_stubs"
)
```

### 4. Frontend Init Tool

**Purpose**: Initializes frontend projects with templates.

**Key Features**:
- Creates NextJS projects from templates
- Pre-configured with dependencies
- Fast initialization (5 seconds vs 50+ seconds with npm)

### 5. Dev Server Tool

**Purpose**: Manages development server lifecycle.

**Key Features**:
- Starts and stops development servers
- Manages server processes
- Separate from browser tool for better separation of concerns

### 6. Editor Tool

**Purpose**: Advanced file editing capabilities.

**Key Features**:
- String replacement operations
- Indent-aware editing
- Multiple edit operations

### 7. Shadcn Tool

**Purpose**: Manages Shadcn UI components.

**Key Features**:
- Adds Shadcn components to projects
- Manages component dependencies
- Configures Tailwind CSS

## Tool Integration in Stage 2

For the wireframe agent in Stage 2, the recommended workflow is:

1. Generate the frontend code based on specifications
2. Use `build_test(command="verify")` to ensure code compiles
3. Use `browser(action="open")` to start a browser session
4. Use `browser(action="navigate", url="http://localhost:3000")` to test the app
5. Check for console errors and take screenshots
6. Use `browser(action="close")` when done

The QC agent can use:
- `integration_analyzer` to identify changed files
- Focus review only on added/modified files
- Generate compliance reports

## Best Practices

1. **Always verify before testing**: Run `build_test("verify")` before using browser tools
2. **Use headless mode in CI**: Set `headless=True` for automated testing
3. **Capture errors**: The browser tool automatically captures console errors
4. **Screenshot on errors**: Screenshots are automatically taken when errors occur
5. **Clean up resources**: Always close browser sessions when done

## Notes

- All tools use FastMCP for the Model Context Protocol
- Tools are designed to work with pre-configured workspace paths
- Error handling and logging are built into all tools
- Tools can be chained together for complex workflows