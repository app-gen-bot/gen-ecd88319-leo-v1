"""User prompt creation for the Integration Analyzer agent."""


def create_integration_analyzer_prompt(
    output_dir: str = "",
    app_name: str = "",
    pages_to_analyze: list[str] = None
) -> str:
    """Create the prompt for the integration analyzer agent.
    
    Args:
        output_dir: Directory where the implementation was generated
        app_name: Name of the application being analyzed
        pages_to_analyze: List of specific pages/routes to analyze (optional)
        
    Returns:
        Formatted prompt for the integration analyzer agent
    """
    pages_section = ""
    if pages_to_analyze:
        pages_list = "\n".join([f"- {page}" for page in pages_to_analyze])
        pages_section = f"""
## Specific Pages to Analyze
Focus your analysis on these pages/routes:
{pages_list}
"""

    return f"""Analyze the integration points and interactive components in the "{app_name}" frontend implementation.

## Working Directory
Your current working directory is: {output_dir}
All file paths in your analysis should be relative to this directory.

## Analysis Task

You must perform a comprehensive integration analysis of the frontend implementation to identify:
1. All API integration points
2. WebSocket connections and real-time features
3. Interactive UI elements (buttons, forms, menus, etc.)
4. Functional vs non-functional features
5. Implementation completeness

### Step 1: Use Integration Analyzer Tool
First, use the `compare_with_template` function from the integration_analyzer tool to identify:
- All added/modified files compared to the template
- Focus on component files, pages, and integration code

### Step 2: Systematic Code Analysis
For each modified page/component:

1. **Identify Integration Points**:
   - API calls (fetch, axios, custom clients)
   - WebSocket event handlers
   - State management connections
   - External service integrations

2. **Audit Interactive Elements**:
   - All buttons and their onClick handlers
   - Form submissions and validation
   - Dropdown menus and their items
   - Links and navigation elements
   - Any element with cursor-pointer styling

3. **Classify Functionality**:
   - ✅ Fully Functional: Works as expected
   - 🟡 Partially Functional: Some features work
   - ❌ Non-functional: UI exists but no behavior
   - 🔴 Broken: Implementation exists but fails

4. **Document Code Locations**:
   - Include file paths and line numbers
   - Show code snippets for problematic areas
   - Note missing implementations
{pages_section}
### Step 3: Generate Comprehensive Report
Create a detailed markdown report following the structure in your system prompt:
1. Overview
2. Fully Functional Integration Points
3. Non-Functional Integration Points  
4. Clickable Elements Audit
5. Integration Points Summary Table
6. Code Quality Issues
7. Recommendations

### Step 4: Focus Areas
Pay special attention to:
- Event handlers without implementation (e.g., empty onClick)
- API calls to non-existent endpoints
- WebSocket events not properly handled
- UI elements that appear clickable but do nothing
- Forms without submission logic
- Navigation that doesn't work

## Output Requirements

Your analysis should:
- Be systematic and thorough
- Include specific code examples and locations
- Clearly indicate what works vs what doesn't
- Provide actionable recommendations
- Use status indicators (✅/🟡/❌/🔴)
- Be formatted for AI consumption (clear, structured, concise)

## Example Issues to Look For

1. **Dropdown menus with non-functional items**:
   ```typescript
   <DropdownMenuItem>Settings</DropdownMenuItem>  // No onClick handler
   ```

2. **Buttons without handlers**:
   ```typescript
   <Button>Click Me</Button>  // Missing onClick
   ```

3. **API calls to missing endpoints**:
   ```typescript
   apiClient.uploadFile()  // No backend implementation
   ```

4. **Broken data fetching**:
   ```typescript
   // Fetching wrong data for threads
   getMessages(channelId) // Should be getThreadReplies(parentId)
   ```

Remember: Your goal is to provide a complete picture of what's implemented, what's missing, and what needs to be fixed for the application to be fully functional."""