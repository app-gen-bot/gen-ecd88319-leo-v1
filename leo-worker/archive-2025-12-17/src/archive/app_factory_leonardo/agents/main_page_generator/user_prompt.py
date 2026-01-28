"""User prompt creator for Main Page Generator Agent."""

def create_user_prompt() -> str:
    """Create user prompt for the Main Page Generator Agent.
        
    Returns:
        Formatted user prompt for the agent
    """
    return """Please read the plan, UI preview, and schema to generate the main page component.

## Your Task

1. **Read the plan file** from `../plan/plan.md` to understand the app's core functionality
2. **Read the preview component** from `../preview-react/App.tsx` to understand the UI layout
3. **Read the schema file** from `shared/schema.ts` to understand data entities and validation
4. **Generate a complete main page component** (typically `client/src/pages/HomePage.tsx`) that:
   - Implements the core functionality described in the plan
   - Matches the UI layout shown in the preview component
   - Uses the data entities defined in the schema
   - Includes CRUD operations for the primary data entity
   - Handles form validation using Zod schemas from schema.ts
   - Implements loading states and error handling
   - Follows the preview design for layout and interactions
   - Uses ShadCN UI components and Tailwind CSS styling

## Implementation Process

1. Use the Read tool to read `../plan/plan.md`
2. Use the Read tool to read `../preview-react/App.tsx`
3. Use the Read tool to read `shared/schema.ts`
4. Analyze all the content to understand requirements and data structure
5. Use the Write tool to create `client/src/pages/HomePage.tsx` following the patterns in the system prompt
6. Use oxc to validate the TypeScript and React syntax
7. Fix any errors until the main page compiles successfully"""