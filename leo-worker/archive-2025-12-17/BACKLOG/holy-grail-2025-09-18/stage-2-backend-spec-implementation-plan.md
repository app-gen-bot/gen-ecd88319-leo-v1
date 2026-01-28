# Stage 2: Backend Spec - Implementation Plan

## Overview
Implement Stage 2 of the Holy Grail pipeline to generate pure Zod schemas and ts-rest contracts as the foundation for type-safe backend/frontend communication.

## Implementation Following Leonardo Patterns

### File Structure
```
src/app_factory_leonardo_replit/
├── stages/
│   ├── docs/
│   │   └── STAGES.md  (NEW - document stage patterns)
│   └── backend_spec_stage.py  (NEW - following design_system_stage.py pattern)
└── agents/
    ├── schema_designer/  (NEW)
    │   ├── __init__.py
    │   ├── agent.py  (following AGENT_PATTERN.md)
    │   ├── config.py
    │   ├── system_prompt.py
    │   └── user_prompt.py
    └── contracts_designer/  (NEW)
        ├── __init__.py
        ├── agent.py
        ├── config.py
        ├── system_prompt.py
        └── user_prompt.py
```

## Stage Implementation Pattern

### backend_spec_stage.py
Following the established stage pattern:

```python
async def run_stage(
    plan_path: Path,
    output_dir: Path,
    **kwargs
) -> Tuple[AgentResult, str]:
    """
    Generate backend specifications: Zod schemas and ts-rest contracts.
    
    Args:
        plan_path: Path to plan.md
        output_dir: Output directory for specs (workspace/specs)
        
    Returns:
        Tuple of (AgentResult, message)
    """
```

Key features:
- **Auto-detection**: Skip if artifacts exist
- **Stateless**: Can resume from any point
- **Sequential agents**: schema_designer → contracts_designer
- **Error handling**: Return early on failure

## Agent Architecture (Three-Layer Pattern)

### Layer 1: Agent Wrapper
```python
class SchemaDesignerAgent:
    def __init__(self, cwd: str = None):
        self.agent = Agent(
            system_prompt=SYSTEM_PROMPT,
            mcp_tools=["oxc", "tree_sitter"],  # Validation tools
            cwd=cwd,
            **AGENT_CONFIG
        )
    
    async def generate_zod_schemas(self, plan_content: str) -> Tuple[bool, str, str]:
        """Generate pure Zod schemas from plan."""
        # Domain-specific method, not generic run()
```

### Layer 2: Configuration
```python
AGENT_CONFIG = {
    "name": "Schema Designer",
    "model": "sonnet",  # Fast for straightforward generation
    "allowed_tools": ["Write", "Read", "Edit", "MultiEdit"],
    "max_turns": 10
}
```

### Layer 3: Prompts
- **system_prompt.py**: Agent expertise and rules
- **user_prompt.py**: Template for generating schemas/contracts

## Integration into Main Pipeline

### main.py changes:
```python
# After UI Component Spec, before Design System
if not (workspace / "specs" / "schema.zod.ts").exists():
    logger.info("⚡ Backend Spec Stage: Generating Zod schemas and contracts...")
    
    backend_spec_result, message = await backend_spec_stage.run_stage(
        plan_path=plan_path,
        output_dir=workspace / "specs"
    )
    results["backend_spec"] = backend_spec_result
    
    if backend_spec_result.success:
        logger.info(f"✅ Backend specs generated: {message}")
    else:
        logger.error(f"❌ Backend Spec Stage failed: {backend_spec_result.content}")
        return results
else:
    logger.info("⏭️ Backend Spec Stage: Specs exist, skipping")
```

## Generated Artifacts

### Output Structure:
```
workspace/specs/
├── schema.zod.ts           # All Zod schemas
└── contracts/
    ├── users.contract.ts   # User-related endpoints
    ├── chapels.contract.ts # Chapel endpoints
    ├── bookings.contract.ts # Booking endpoints
    └── index.ts           # Export aggregator
```

### Example schema.zod.ts:
```typescript
import { z } from 'zod';

// Pure Zod schemas (no Drizzle coupling)
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['couple', 'chapel_owner']),
  // ...
});

export const ChapelSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  ownerId: z.string().uuid(),
  // ...
});

// Insert/Update schemas
export const InsertUserSchema = UserSchema.omit({ id: true, createdAt: true });
export const UpdateUserSchema = InsertUserSchema.partial();
```

### Example contracts/users.contract.ts:
```typescript
import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { UserSchema, InsertUserSchema, UpdateUserSchema } from '../schema.zod';

const c = initContract();

export const usersContract = c.router({
  getUser: {
    method: 'GET',
    path: '/users/:id',
    responses: {
      200: UserSchema,
      404: z.object({ error: z.string() })
    }
  },
  createUser: {
    method: 'POST',
    path: '/users',
    body: InsertUserSchema,
    responses: {
      201: UserSchema,
      400: z.object({ error: z.string() })
    }
  },
  // ...
});
```

## Writer-Critic Pattern Consideration

After reviewing the Build stage, the Writer-Critic pattern is used for complex multi-file generation with validation loops. For Stage 2:

**Current Design (Simple Sequential)**:
- ✅ Appropriate for deterministic schema generation
- ✅ Contracts can reference schemas directly
- ✅ Validation via MCP tools (oxc, tree_sitter)

**Writer-Critic Alternative** (if complexity increases):
```python
# Add critics for validation
agents/
├── schema_designer/
│   ├── agent.py  (Writer)
│   └── critic/
│       └── agent.py  (Validator)
```

**Decision**: Start with simple sequential pattern. Add Writer-Critic if needed based on:
- Generation failures requiring iteration
- Complex validation requirements
- Quality issues in generated contracts

## Success Criteria

1. ✅ Generates valid TypeScript/Zod code
2. ✅ Schemas are pure Zod (no Drizzle coupling)
3. ✅ Contracts reference schema types correctly
4. ✅ All CRUD operations covered
5. ✅ Business operations included (based on plan)
6. ✅ Compiles with TypeScript
7. ✅ Passes oxc linting

## Next Steps

1. Create STAGES.md documentation
2. Implement schema_designer agent
3. Implement contracts_designer agent
4. Create backend_spec_stage.py
5. Integrate into main.py
6. Test with timeless-weddings plan

## Notes

- Keep agents focused (single responsibility)
- Use MCP tools for validation
- Follow existing patterns exactly
- Start simple, iterate if needed
- Zod as single source of truth