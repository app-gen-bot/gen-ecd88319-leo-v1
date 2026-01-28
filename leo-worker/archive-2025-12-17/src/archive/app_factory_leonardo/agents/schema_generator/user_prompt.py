"""User prompt template for Schema Generator Agent."""

def create_user_prompt(plan_content: str, react_component: str) -> str:
    """Create a user prompt from plan content and React component.
    
    Args:
        plan_content: The content of the plan.md file
        react_component: The content of the App.tsx React component
        
    Returns:
        Formatted user prompt for the agent
    """
    return f"""Generate a database schema for this application based on the plan and React component implementation:

## Application Plan
---
{plan_content}
---

## React Component Implementation  
---
{react_component}
---

## Schema Generation Requirements

Based on the application plan and React component, create a complete database schema that:

1. **Analyzes the Data Model**: 
   - Extract entities from the plan's feature descriptions
   - Identify data structures from React component state and props
   - Understand CRUD operations from UI interactions

2. **Creates Appropriate Tables**:
   - Primary entity tables based on the app's core functionality
   - User authentication tables if login/signup is present  
   - Supporting tables for categories, relationships, or metadata

3. **Defines Proper Validation**:
   - Input validation based on form fields in the React component
   - Business rules derived from the application plan
   - Appropriate constraints and defaults

4. **Follows Best Practices**:
   - Use UUID primary keys with auto-generation
   - Include created/updated timestamps
   - Apply proper field types and constraints
   - Create separate insert/update schemas

5. **Generates Complete Types**:
   - Export database record types
   - Export validation schema types
   - Ensure type safety across the application

Please complete these steps:

1. **Read the existing template** from `shared/schema.ts` to see the structure
2. **Generate a complete database schema** following the Drizzle ORM + Zod pattern
3. **Write the final schema** to `shared/schema.ts` using the Write tool
4. **Validate the code** using oxc to ensure it compiles correctly

Replace the entire template file with your generated schema.ts content."""