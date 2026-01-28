"""User prompt creator for Routes Generator Agent."""

def create_user_prompt() -> str:
    """Create user prompt for the Routes Generator Agent.
        
    Returns:
        Formatted user prompt for the agent
    """
    return """Please read the schema and storage layer to generate complete API routes implementation.

## Your Task

1. **Read the schema file** from `shared/schema.ts` to understand entities and validation schemas
2. **Read the storage file** from `server/storage.ts` to understand available storage methods
3. **Generate a complete `server/routes.ts` file** that:
   - Creates RESTful endpoints for all entities in the schema
   - Uses the storage layer methods for data operations
   - Implements validation using the Zod schemas from schema.ts
   - Includes error handling with proper HTTP status codes
   - Adds special routes for any special storage methods
   - Returns HTTP server from registerRoutes function

## Implementation Process

1. Use the Read tool to read `shared/schema.ts`
2. Use the Read tool to read `server/storage.ts`
3. Analyze all entities, validation schemas, and storage methods
4. Use the Write tool to completely replace `server/routes.ts` with your implementation (overwrite the template file)
5. Use oxc to validate the TypeScript syntax
6. Fix any errors until the routes compile successfully"""