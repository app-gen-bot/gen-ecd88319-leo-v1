"""User prompt creator for Component Generator Agent."""

import json
from typing import Dict, Any

def create_user_prompt(
    component_name: str,
    analysis_data: Dict[str, Any],
    preview_content: str,
    schema_content: str
) -> str:
    """Create user prompt for the Component Generator Agent.
    
    Args:
        component_name: Name of the component to generate
        analysis_data: Component analysis data from analyzer agent
        preview_content: Content of the preview-react/App.tsx file
        schema_content: Content of the generated schema.ts file
        
    Returns:
        Formatted user prompt for the agent
    """
    # Find the specific component in the analysis
    component_spec = None
    for component in analysis_data.get('components', []):
        if component.get('name') == component_name:
            component_spec = component
            break
    
    if not component_spec:
        raise ValueError(f"Component '{component_name}' not found in analysis data")
    
    return f"""Please generate the React component based on the following analysis and reference files.

## Component to Generate: {component_name}

## Component Specification

```json
{json.dumps(component_spec, indent=2)}
```

## Full Component Analysis Context

```json
{json.dumps(analysis_data, indent=2)}
```

## Preview Component Content (for reference)

```tsx
{preview_content}
```

## Schema File Content (for types)

```typescript
{schema_content}
```

## Your Task

Generate a complete TypeScript React component file for `{component_name}` that:

1. **Matches the specification** provided in the component analysis
2. **Implements the UI structure** referenced in the codeSection from preview
3. **Uses proper TypeScript types** from the schema where applicable
4. **Includes all required imports** as specified in the analysis
5. **Follows React best practices** for component structure and hooks
6. **Uses Tailwind CSS** for consistent styling
7. **Includes accessibility features** like ARIA labels and semantic HTML
8. **Handles edge cases** gracefully (missing props, empty data, etc.)

Remember: Return ONLY the TypeScript React component code, no explanations or markdown formatting."""

def create_batch_user_prompt(
    analysis_data: Dict[str, Any],
    preview_content: str,
    schema_content: str
) -> str:
    """Create user prompt for generating all components at once.
    
    Args:
        analysis_data: Component analysis data from analyzer agent
        preview_content: Content of the preview-react/App.tsx file
        schema_content: Content of the generated schema.ts file
        
    Returns:
        Formatted user prompt for batch component generation
    """
    component_count = len(analysis_data.get('components', []))
    component_names = [c.get('name') for c in analysis_data.get('components', [])]
    
    return f"""Please generate all React components based on the component analysis.

## Components to Generate ({component_count} total)

{', '.join(component_names)}

## Complete Component Analysis

```json
{json.dumps(analysis_data, indent=2)}
```

## Preview Component Content (for reference)

```tsx
{preview_content}
```

## Schema File Content (for types)

```typescript
{schema_content}
```

## Your Task

Generate TypeScript React component files for all {component_count} components identified in the analysis. For each component:

1. **Follow the component specification** from the analysis
2. **Extract UI structure** from the preview codeSection
3. **Use proper TypeScript interfaces** for props
4. **Import necessary dependencies** (UI components, icons, types)
5. **Implement React best practices** for hooks and component structure
6. **Apply Tailwind CSS styling** consistently
7. **Include accessibility features** and error handling

Please generate each component separately, clearly labeled with the component name and file path."""