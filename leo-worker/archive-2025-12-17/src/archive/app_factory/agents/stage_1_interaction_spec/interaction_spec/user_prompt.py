"""User prompt generation for the Interaction Specification Agent."""

from pathlib import Path


def create_user_prompt(prd_content: str) -> str:
    """Create the user prompt for interaction spec generation.
    
    Args:
        prd_content: The Business PRD content to transform
        
    Returns:
        Formatted prompt for the interaction spec agent
    """
    # Load the interaction spec template for reference
    template_path = Path(__file__).parent.parent.parent.parent.parent.parent / "docs" / "ai-app-factory" / "templates" / "interaction-spec.md"
    
    template_ref = ""
    if template_path.exists():
        template_ref = f"""

## Template Reference
Follow the structure and format from the interaction specification template at:
{template_path.relative_to(Path.cwd())}

Ensure your output matches this template's structure exactly."""
    
    return f"""Transform the following Business PRD into a comprehensive Frontend Interaction Specification.

## Business PRD to Transform:

{prd_content}

## Your Task:

Create a detailed interaction specification that:

1. **Covers 100% of features** mentioned in the PRD - verify nothing is missed
2. **Follows the exact template structure** with all required sections
3. **Defines every user interaction** including:
   - How users navigate to each feature
   - What happens when they click, type, swipe, etc.
   - All form fields with validation rules
   - All error messages and success feedback
   - Loading states and transitions

4. **Includes complete user flows** for:
   - First-time user onboarding
   - Every major feature workflow
   - Error recovery paths
   - Edge cases and exceptions

5. **Specifies UI behavior** including:
   - Page layouts and components
   - Modal/drawer behaviors
   - Real-time updates
   - Responsive breakpoints
   - Accessibility features

6. **Defines all states**:
   - Empty states with helpful messages
   - Loading states with indicators
   - Error states with recovery actions
   - Success states with next steps
   - Offline states if applicable

7. **Complete Navigation Mapping**:
   - Create exhaustive route inventory showing ALL URLs
   - List EVERY interactive element (buttons, links, menus, etc.)
   - Specify exact destination/action for each interaction
   - Include all dropdown menu items and context menus
   - Define 404 behavior for undefined routes
   - Remember: If an interaction isn't specified here, it will be broken in the app

## Critical Requirements:

- **Be exhaustive**: Every button, link, form field, and interaction must be specified
- **Be specific**: Use exact labels, not placeholders (e.g., "Sign In" not "[Login Button]")
- **Be consistent**: Similar features should have similar interaction patterns
- **Think mobile-first**: Define mobile interactions before desktop
- **Include edge cases**: What happens when things go wrong?
- **Validate everything**: End with a checklist confirming all PRD features are covered
{template_ref}

## Remember:

The development team will build EXACTLY what you specify. If you don't define it, it won't exist. Be thorough and leave no interaction undefined.

Begin your interaction specification now:"""