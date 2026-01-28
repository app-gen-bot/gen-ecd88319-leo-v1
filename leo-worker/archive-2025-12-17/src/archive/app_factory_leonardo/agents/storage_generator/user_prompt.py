"""User prompt creator for Storage Generator Agent."""

def create_user_prompt() -> str:
    """Create user prompt for the Storage Generator Agent.
        
    Returns:
        Formatted user prompt for the agent
    """
    return """Please read the Drizzle ORM schema and generate a complete storage layer implementation.

## Your Task

1. **Read the schema file** from `shared/schema.ts` to understand all entities and types
2. **Generate a complete `server/storage.ts` file** that:
   - Creates an IStorage interface with methods for each entity
   - Implements a MemStorage class using Map-based storage
   - Includes special methods for entities with boolean fields
   - Exports a storage instance ready for use

## Implementation Process

1. Use the Read tool to read `shared/schema.ts`
2. Analyze all entities, their types, and validation schemas
3. Use the Write tool to create `server/storage.ts` following the patterns in the system prompt
4. Use oxc to validate the TypeScript syntax
5. Fix any errors until the storage layer compiles successfully"""