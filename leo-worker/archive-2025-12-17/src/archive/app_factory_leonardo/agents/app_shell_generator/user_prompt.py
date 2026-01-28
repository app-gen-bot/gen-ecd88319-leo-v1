"""User prompt creator for App Shell Generator Agent."""

def create_user_prompt() -> str:
    """Create user prompt for the App Shell Generator Agent.
        
    Returns:
        Formatted user prompt for the agent
    """
    return """Please read the plan, UI preview, and schema to generate the main App.tsx shell component.

## Your Task

1. **Read the plan file** from `../plan/plan.md` to understand the app's purpose and features
2. **Read the preview component** from `../preview-react/App.tsx` to understand the UI structure
3. **Read the schema file** from `shared/schema.ts` to understand data entities and relationships
4. **Generate a complete `client/src/App.tsx` file** that:
   - Analyzes the preview to identify all distinct pages and UI states
   - Creates routing structure for all identified pages using Wouter
   - Adds context providers for theme and data management
   - Includes error boundaries and proper loading states
   - Structures the layout with header, main content, and navigation
   - Integrates with schema types and validation where needed

## Implementation Process

1. Use the Read tool to read `../plan/plan.md`
2. Use the Read tool to read `../preview-react/App.tsx`
3. Use the Read tool to read `shared/schema.ts`
4. Analyze all the content to understand the app requirements
5. Use the Write tool to create `client/src/App.tsx` following the patterns in the system prompt
6. Use oxc to validate the TypeScript and React syntax
7. Fix any errors until the App shell compiles successfully"""