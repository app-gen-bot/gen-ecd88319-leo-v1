"""User prompt creator for Component Analyzer Agent."""

def create_user_prompt(preview_content: str) -> str:
    """Create user prompt for the Component Analyzer Agent.
    
    Args:
        preview_content: Content of the preview-react/App.tsx file
        
    Returns:
        Formatted user prompt for the agent
    """
    return f"""Please analyze the following preview wireframe to identify reusable React components.

## Preview Component Content

```tsx
{preview_content}
```

## Your Task

Analyze the preview code and identify components that should be extracted into separate files. Look for:

1. **Repeated UI patterns** that appear multiple times
2. **Complex UI sections** that handle specific functionality  
3. **Form components** for user input and interaction
4. **List items** that display individual data objects
5. **Layout components** for page structure
6. **Interactive elements** with specific behaviors

For each component identified, determine:
- Appropriate component name and description
- Category (layout, form, list_item, interactive, display)
- Required props with types and descriptions
- Necessary imports (UI components, icons, etc.)
- The specific JSX code section it represents

**CRITICAL**: Return ONLY the JSON analysis object, no explanations or markdown formatting. Start your response with {{ and end with }}. Do not use code blocks or any other text."""