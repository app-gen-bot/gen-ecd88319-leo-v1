# Absolute Paths Implementation Plan

**Date**: 2025-10-01
**Status**: In Progress
**Completed**: SchemaDesigner ✅, ContractsDesigner ✅

## Executive Summary

This document outlines the comprehensive plan to migrate all agents in the Leonardo pipeline from relative path resolution (using `cwd` parameter) to explicit absolute path passing. This change is necessary because the cc_agent SDK's Write tool resolves relative paths relative to the **process working directory**, not the agent's `cwd` parameter, causing files to be written to incorrect locations.

### Core Principle: NO FALLBACKS
All paths must be explicitly provided as absolute paths. No defaults, no fallbacks, no implicit resolution.

---

## Pipeline Agent Order

Following the execution chain from `./run-timeless-weddings-phase1.sh`:

```
run-timeless-weddings-phase1.sh
  → src/app_factory_leonardo_replit/run.py
    → src/app_factory_leonardo_replit/main.py
      → src/app_factory_leonardo_replit/stages/build_stage.py
        → Agent Execution Order:
          1. ✅ SchemaDesigner (Writer + Critic)
          2. ✅ ContractsDesigner (Writer + Critic)
          3. ⏳ StorageGenerator (Writer + Critic)
          4. ⏳ RoutesGenerator (Writer + Critic)
          5. ⏳ TsRestApiClientGenerator (Writer + Critic)
          6. ⏳ FrontendInteractionSpec (Writer + Critic)
          7. ⏳ FrontendImplementation (Writer + Critic)
```

---

## Completed Agents

### 1. SchemaDesigner ✅
**Location**: `src/app_factory_leonardo_replit/agents/schema_designer/`

**Files Updated**:
- `agent.py` - Requires `schema_path` and `plan_path` as absolute paths
- `user_prompt.py` - Uses absolute paths in prompts
- `system_prompt.py` - References "ABSOLUTE PATH provided in user prompt"
- `critic/agent.py` - Requires same absolute paths
- `critic/user_prompt.py` - Uses absolute paths for validation

**Path Pattern**:
```python
# In backend_spec_stage.py
schema_path = str((output_dir / "schema.zod.ts").resolve())
plan_path = str((output_dir / "plan.md").resolve())

# In agent.__init__
workspace_dir = str(Path(schema_path).parent.parent.parent)
```

### 2. ContractsDesigner ✅
**Location**: `src/app_factory_leonardo_replit/agents/contracts_designer/`

**Files Updated**:
- `agent.py` - Requires `schema_path`, `contracts_dir`, and `plan_path`
- `user_prompt.py` - Uses all 3 absolute paths
- `system_prompt.py` - References paths from user prompt
- `critic/agent.py` - Requires all 3 absolute paths
- `critic/user_prompt.py` - Uses all paths for validation

---

## Remaining Agents - Implementation Plan

### 3. StorageGenerator ⏳
**Location**: `src/app_factory_leonardo_replit/agents/storage_generator/`

**Current Implementation**:
- Uses `cwd` parameter
- Reads from: `shared/schema.ts` (relative)
- Writes to: `server/storage.ts` (relative)

**Required Absolute Paths**:
1. `schema_path` - Input: `/abs/path/to/apps/workspace/app/shared/schema.zod.ts`
2. `storage_path` - Output: `/abs/path/to/apps/workspace/server/storage.ts`
3. `plan_path` - Reference: `/abs/path/to/apps/workspace/specs/plan.md`

**Files to Update**:
```
storage_generator/
├── agent.py
│   └── Update __init__ to require (schema_path, storage_path, plan_path)
│   └── Extract workspace_dir from paths
│   └── Pass absolute paths to generate_storage()
├── user_prompt.py
│   └── Require all 3 absolute paths
│   └── Use in prompt text: "Read schemas from {schema_path}"
│   └── Use in prompt text: "Write storage to {storage_path}"
├── system_prompt.py
│   └── Remove hardcoded "server/storage.ts" references
│   └── Reference "ABSOLUTE PATH provided in user prompt"
├── critic/
│   ├── agent.py
│   │   └── Require same 3 absolute paths
│   │   └── Pass to validate_storage()
│   └── user_prompt.py
│       └── Use paths: "Read {schema_path}", "Read {storage_path}"
```

**build_stage.py Changes** (Lines ~1000-1002):
```python
# Calculate absolute paths
storage_path = str((app_dir / "server" / "storage.ts").resolve())

# Initialize agent
storage_writer = StorageGeneratorAgent(
    schema_path=schema_path,  # Reuse from SchemaDesigner
    storage_path=storage_path,
    plan_path=plan_path  # Reuse from SchemaDesigner
)

storage_critic = StorageGeneratorCritic(
    schema_path=schema_path,
    storage_path=storage_path,
    plan_path=plan_path,
    logger=logger
)
```

---

### 4. RoutesGenerator ⏳
**Location**: `src/app_factory_leonardo_replit/agents/routes_generator/`

**Current Implementation**:
- Uses `cwd` parameter
- Reads from: `shared/schema.ts`, `server/storage.ts` (relative)
- Writes to: `server/routes.ts` (relative)

**Required Absolute Paths**:
1. `schema_path` - Input: `/abs/path/to/apps/workspace/app/shared/schema.zod.ts`
2. `storage_path` - Input: `/abs/path/to/apps/workspace/server/storage.ts`
3. `contracts_dir` - Input: `/abs/path/to/apps/workspace/app/shared/contracts/`
4. `routes_path` - Output: `/abs/path/to/apps/workspace/server/routes.ts`
5. `plan_path` - Reference: `/abs/path/to/apps/workspace/specs/plan.md`

**Files to Update**:
```
routes_generator/
├── agent.py
│   └── Update __init__ to require (schema_path, storage_path, contracts_dir, routes_path, plan_path)
│   └── Extract workspace_dir from paths
│   └── Pass absolute paths to generate_routes()
├── user_prompt.py
│   └── Require all 5 absolute paths
│   └── Use in prompts with specific instructions
├── system_prompt.py
│   └── Remove hardcoded paths
│   └── Reference "ABSOLUTE PATHS provided in user prompt"
├── critic/
│   ├── agent.py
│   │   └── Require same 5 absolute paths
│   └── user_prompt.py
│       └── Use all paths for comprehensive validation
```

**build_stage.py Changes** (Lines ~1006-1008):
```python
# Calculate absolute paths
routes_path = str((app_dir / "server" / "routes.ts").resolve())

# Initialize agent
routes_writer = RoutesGeneratorAgent(
    schema_path=schema_path,  # Reuse
    storage_path=storage_path,  # Reuse
    contracts_dir=contracts_dir,  # Reuse
    routes_path=routes_path,
    plan_path=plan_path  # Reuse
)

routes_critic = RoutesGeneratorCritic(
    schema_path=schema_path,
    storage_path=storage_path,
    contracts_dir=contracts_dir,
    routes_path=routes_path,
    plan_path=plan_path,
    logger=logger
)
```

---

### 5. TsRestApiClientGenerator ⏳
**Location**: `src/app_factory_leonardo_replit/agents/ts_rest_api_client_generator/`

**Current Implementation**:
- Uses `Path(cwd)` - deterministic wrapper approach
- Reads from: `shared/contracts/` (relative)
- Writes to: `client/src/lib/api.ts` (relative)

**Required Absolute Paths**:
1. `contracts_dir` - Input: `/abs/path/to/apps/workspace/app/shared/contracts/`
2. `api_client_path` - Output: `/abs/path/to/apps/workspace/client/src/lib/api.ts`
3. `plan_path` - Reference: `/abs/path/to/apps/workspace/specs/plan.md`

**Files to Update**:
```
ts_rest_api_client_generator/
├── agent.py
│   └── Update __init__ to require (contracts_dir, api_client_path, plan_path)
│   └── Remove Path(cwd) pattern
│   └── Extract workspace_dir from paths
│   └── Pass absolute paths to generate_api_client()
├── user_prompt.py
│   └── Require all 3 absolute paths
│   └── Use in prompts: "Read contracts from {contracts_dir}"
│   └── Use in prompts: "Write API client to {api_client_path}"
├── system_prompt.py
│   └── Remove hardcoded "client/src/lib/api.ts" references
│   └── Reference absolute paths from user prompt
├── critic/
│   ├── agent.py
│   │   └── Require same 3 absolute paths
│   └── user_prompt.py
│       └── Use paths for validation
```

**build_stage.py Changes** (Lines ~1012-1014):
```python
# Calculate absolute paths
api_client_path = str((app_dir / "client" / "src" / "lib" / "api.ts").resolve())

# Initialize agent
api_client_writer = TsRestApiClientGeneratorAgent(
    contracts_dir=contracts_dir,  # Reuse
    api_client_path=api_client_path,
    plan_path=plan_path  # Reuse
)

api_client_critic = TsRestApiClientGeneratorCritic(
    contracts_dir=contracts_dir,
    api_client_path=api_client_path,
    plan_path=plan_path,
    logger=logger
)
```

---

### 6. FrontendInteractionSpec ⏳
**Location**: `src/app_factory_leonardo_replit/agents/frontend_interaction_spec/`

**Current Implementation**:
- Uses `cwd` parameter
- Reads from: `shared/contracts/`, `shared/schema.zod.ts`
- Writes to: `specs/frontend-interaction-spec.md`

**Required Absolute Paths**:
1. `contracts_dir` - Input: `/abs/path/to/apps/workspace/app/shared/contracts/`
2. `schema_path` - Input: `/abs/path/to/apps/workspace/app/shared/schema.zod.ts`
3. `spec_path` - Output: `/abs/path/to/apps/workspace/specs/frontend-interaction-spec.md`
4. `plan_path` - Reference: `/abs/path/to/apps/workspace/specs/plan.md`

**Files to Update**:
```
frontend_interaction_spec/
├── agent.py
│   └── Update __init__ to require (contracts_dir, schema_path, spec_path, plan_path)
│   └── Extract workspace_dir from paths
│   └── Pass absolute paths to generate_spec()
├── user_prompt.py
│   └── Require all 4 absolute paths
│   └── Use in prompts with clear instructions
├── system_prompt.py
│   └── Remove hardcoded path references
│   └── Reference absolute paths from user prompt
├── critic/
│   ├── agent.py
│   │   └── Require same 4 absolute paths
│   └── user_prompt.py
│       └── Use all paths for validation
```

**build_stage.py Changes** (Lines ~1018-1020):
```python
# Calculate absolute paths
frontend_spec_path = str((app_dir / "specs" / "frontend-interaction-spec.md").resolve())

# Initialize agent
frontend_spec_writer = FrontendInteractionSpecAgent(
    contracts_dir=contracts_dir,  # Reuse
    schema_path=schema_path,  # Reuse
    spec_path=frontend_spec_path,
    plan_path=plan_path  # Reuse
)

frontend_spec_critic = FrontendInteractionSpecCritic(
    contracts_dir=contracts_dir,
    schema_path=schema_path,
    spec_path=frontend_spec_path,
    plan_path=plan_path,
    logger=logger
)
```

---

### 7. FrontendImplementation ⏳
**Location**: `src/app_factory_leonardo_replit/agents/frontend_implementation/`

**Current Implementation**:
- Uses `cwd` parameter
- Reads from: Multiple sources (contracts, schema, spec, api client)
- Writes to: Multiple client/ directories (comprehensive frontend generation)

**Required Absolute Paths**:
1. `contracts_dir` - Input: `/abs/path/to/apps/workspace/app/shared/contracts/`
2. `schema_path` - Input: `/abs/path/to/apps/workspace/app/shared/schema.zod.ts`
3. `spec_path` - Input: `/abs/path/to/apps/workspace/specs/frontend-interaction-spec.md`
4. `api_client_path` - Input: `/abs/path/to/apps/workspace/client/src/lib/api.ts`
5. `client_dir` - Output base: `/abs/path/to/apps/workspace/client/`
6. `plan_path` - Reference: `/abs/path/to/apps/workspace/specs/plan.md`

**Files to Update**:
```
frontend_implementation/
├── agent.py
│   └── Update __init__ to require 6 absolute paths
│   └── Extract workspace_dir from paths
│   └── Pass absolute paths to implement_frontend()
├── user_prompt.py
│   └── Require all 6 absolute paths
│   └── Use in prompts: "Read contracts from {contracts_dir}"
│   └── Use in prompts: "Read schemas from {schema_path}"
│   └── Use in prompts: "Read spec from {spec_path}"
│   └── Use in prompts: "Read API client from {api_client_path}"
│   └── Use in prompts: "Generate frontend in {client_dir}"
├── system_prompt.py
│   └── Remove all hardcoded path references
│   └── Reference absolute paths from user prompt
├── critic/
│   ├── agent.py
│   │   └── Require same 6 absolute paths
│   └── user_prompt.py
│       └── Use all paths for comprehensive validation
```

**build_stage.py Changes** (Lines ~1025-1027):
```python
# Calculate absolute paths
client_dir = str((app_dir / "client").resolve())

# Initialize agent
frontend_writer = FrontendImplementationAgent(
    contracts_dir=contracts_dir,  # Reuse
    schema_path=schema_path,  # Reuse
    spec_path=frontend_spec_path,  # Reuse
    api_client_path=api_client_path,  # Reuse
    client_dir=client_dir,
    plan_path=plan_path  # Reuse
)

frontend_critic = FrontendImplementationCritic(
    contracts_dir=contracts_dir,
    schema_path=schema_path,
    spec_path=frontend_spec_path,
    api_client_path=api_client_path,
    client_dir=client_dir,
    plan_path=plan_path,
    logger=logger
)
```

---

## Implementation Pattern (Reference)

Based on successful SchemaDesigner and ContractsDesigner migrations:

### 1. Agent __init__ Pattern
```python
def __init__(self, path1: str, path2: str, pathN: str):
    """Initialize agent with REQUIRED absolute paths.

    Args:
        path1: ABSOLUTE path to input/output file 1 (REQUIRED)
        path2: ABSOLUTE path to input/output file 2 (REQUIRED)
        pathN: ABSOLUTE path to input/output file N (REQUIRED)
    """
    if not path1 or not path2 or not pathN:
        raise ValueError("All paths are REQUIRED (no defaults)")

    self.path1 = path1
    self.path2 = path2
    self.pathN = pathN

    # Extract workspace directory for agent context
    # Assuming path structure: /abs/workspace/app/shared/file.ts
    # We want: /abs/workspace
    workspace_dir = str(Path(path1).parent.parent.parent)

    self.agent = Agent(
        system_prompt=SYSTEM_PROMPT,
        mcp_tools=["oxc"],  # Or other tools as needed
        cwd=workspace_dir,  # For context only, not file operations
        **AGENT_CONFIG
    )
```

### 2. User Prompt Pattern
```python
def create_user_prompt(
    plan_content: str,
    previous_critic_response: str = "",
    path1: str = None,
    path2: str = None
) -> str:
    """Create user prompt with REQUIRED absolute paths."""
    if not path1 or not path2:
        raise ValueError("All paths are REQUIRED (no defaults)")

    if previous_critic_response:
        return f"""The Critic has reviewed your work:

{previous_critic_response}

Fix the issues and regenerate.
Read from: {path1}
Write to: {path2}
"""
    else:
        return f"""Generate code based on this plan:
{plan_content}

Read schemas from: {path1}
Write output to: {path2}
Use the ABSOLUTE PATHS provided above - do not use relative paths.
"""
```

### 3. System Prompt Pattern
```python
SYSTEM_PROMPT = """You are an Agent specialized in...

## Key Responsibilities
1. Read files from ABSOLUTE PATHS provided in user prompt
2. Generate output files at ABSOLUTE PATHS provided in user prompt
3. DO NOT use relative paths - always use the paths from the user prompt

## File Operations
- Use Read tool with ABSOLUTE PATH from user prompt
- Use Write tool with ABSOLUTE PATH from user prompt
- After writing, use Read tool to verify file exists

Remember: All paths are ABSOLUTE and provided in the user prompt."""
```

### 4. Critic Pattern
Same as agent pattern, but validation-focused:
```python
class SomeAgentCritic:
    def __init__(self, path1: str, path2: str, logger=None):
        if not path1 or not path2:
            raise ValueError("All paths are REQUIRED (no defaults)")

        self.path1 = path1
        self.path2 = path2
        self.logger = logger or logging.getLogger(__name__)

        workspace_dir = str(Path(path1).parent.parent.parent)

        self.agent = Agent(
            system_prompt=CRITIC_SYSTEM_PROMPT,
            mcp_tools=["oxc"],
            cwd=workspace_dir,
            **CRITIC_CONFIG
        )

    async def validate(self, iteration: int, writer_claimed_success: bool) -> Tuple[str, Dict]:
        """Validate generated code."""
        prompt = create_critic_prompt(
            iteration,
            writer_claimed_success,
            path1=self.path1,
            path2=self.path2
        )
        # ... validation logic
```

---

## build_stage.py Path Calculation Strategy

All absolute paths should be calculated at the **top of build_stage.py** after workspace directory is determined:

```python
async def build_stage(
    output_dir: Path,
    frontend_port: int,
    plan_path: str,
    logger: logging.Logger
) -> bool:
    """Build stage implementation."""

    # Workspace setup
    workspace_dir = output_dir.parent.parent
    app_dir = workspace_dir / "apps" / workspace_dir.name

    # ========== CALCULATE ALL ABSOLUTE PATHS UPFRONT ==========
    # Plan (common to all agents)
    plan_path_abs = str((output_dir / "plan.md").resolve())

    # Schema paths
    schema_path = str((output_dir / "schema.zod.ts").resolve())

    # Contracts paths
    contracts_dir = str((output_dir / "contracts").resolve())

    # Backend paths
    storage_path = str((app_dir / "server" / "storage.ts").resolve())
    routes_path = str((app_dir / "server" / "routes.ts").resolve())

    # Frontend paths
    api_client_path = str((app_dir / "client" / "src" / "lib" / "api.ts").resolve())
    frontend_spec_path = str((app_dir / "specs" / "frontend-interaction-spec.md").resolve())
    client_dir = str((app_dir / "client").resolve())

    # ========== INITIALIZE ALL AGENTS WITH ABSOLUTE PATHS ==========
    # Agent 1: Schema
    schema_writer = SchemaDesignerAgent(
        schema_path=schema_path,
        plan_path=plan_path_abs
    )

    # Agent 2: Contracts
    contracts_writer = ContractsDesignerAgent(
        schema_path=schema_path,
        contracts_dir=contracts_dir,
        plan_path=plan_path_abs
    )

    # Agent 3: Storage
    storage_writer = StorageGeneratorAgent(
        schema_path=schema_path,
        storage_path=storage_path,
        plan_path=plan_path_abs
    )

    # ... continue for all agents
```

---

## Validation Checklist

For each agent migration, verify:

### Agent Files
- [ ] `agent.py` requires all paths as absolute (no defaults)
- [ ] `agent.py` raises ValueError if paths not provided
- [ ] `agent.py` extracts workspace_dir from paths
- [ ] `agent.py` passes absolute paths to methods
- [ ] `user_prompt.py` requires all paths (ValueError if missing)
- [ ] `user_prompt.py` uses paths in prompt text
- [ ] `system_prompt.py` removes hardcoded paths
- [ ] `system_prompt.py` references "ABSOLUTE PATH from user prompt"

### Critic Files
- [ ] `critic/agent.py` requires same paths as writer
- [ ] `critic/agent.py` raises ValueError if paths missing
- [ ] `critic/agent.py` extracts workspace_dir from paths
- [ ] `critic/user_prompt.py` requires all paths
- [ ] `critic/user_prompt.py` uses paths for validation instructions

### Integration
- [ ] `build_stage.py` calculates absolute path with `.resolve()`
- [ ] `build_stage.py` passes absolute paths to agent __init__
- [ ] `build_stage.py` passes absolute paths to critic __init__
- [ ] No `cwd` variable used for path construction
- [ ] All paths are strings (not Path objects)

### Testing
- [ ] Run pipeline and verify files created at correct absolute locations
- [ ] Check agent logs show absolute paths
- [ ] Verify no files created in `/Users/labheshpatel/apps/app-factory/app/` (wrong location)
- [ ] All files should be in `/Users/labheshpatel/apps/app-factory/apps/{workspace}/` (correct location)

---

## Execution Order

1. **StorageGenerator** - Depends on SchemaDesigner ✅
2. **RoutesGenerator** - Depends on StorageGenerator and ContractsDesigner ✅
3. **TsRestApiClientGenerator** - Depends on ContractsDesigner ✅
4. **FrontendInteractionSpec** - Depends on ContractsDesigner ✅ and SchemaDesigner ✅
5. **FrontendImplementation** - Depends on all above agents

---

## Common Pitfalls to Avoid

1. **Using cwd for path construction**: Never do `Path(cwd) / "relative/path"`
2. **Providing default paths**: All paths must be explicitly passed, no defaults
3. **Forgetting .resolve()**: Always use `.resolve()` when calculating paths
4. **Path objects vs strings**: Agents expect strings, not Path objects
5. **Hardcoded paths in prompts**: Always use f-strings with path variables
6. **Inconsistent critic paths**: Critics must use EXACT same paths as writers
7. **Missing ValueError checks**: Always validate paths are provided
8. **Wrong workspace extraction**: Understand your path structure for parent navigation

---

## Success Criteria

Pipeline run succeeds with:
- ✅ All files created at correct absolute locations under `apps/{workspace}/`
- ✅ No files created in incorrect locations (like `app-factory/app/`)
- ✅ All agents complete without path-related errors
- ✅ All critics can find and validate files
- ✅ Full Writer-Critic loops function correctly
- ✅ Build stage completes and generates working application

---

## Next Steps

1. **Immediate**: Update StorageGenerator (Agent 3)
2. Then: Update RoutesGenerator (Agent 4)
3. Then: Update TsRestApiClientGenerator (Agent 5)
4. Then: Update FrontendInteractionSpec (Agent 6)
5. Finally: Update FrontendImplementation (Agent 7)
6. Test complete pipeline with `./run-timeless-weddings-phase1.sh`

---

## References

- ✅ Completed: `src/app_factory_leonardo_replit/agents/schema_designer/`
- ✅ Completed: `src/app_factory_leonardo_replit/agents/contracts_designer/`
- Pipeline entry: `src/app_factory_leonardo_replit/stages/build_stage.py` (lines 998-1031)
