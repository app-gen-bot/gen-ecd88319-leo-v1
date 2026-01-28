# Leonardo Pipeline Execution Flow - 2025-10-02

## Executive Summary

**Last Updated**: 2025-10-02 (UI Component Spec deprecated, pipeline flow corrected)

The Leonardo Pipeline executes in this order:
1. **Plan Stage** → Generates plan.md
2. **UI Component Spec Stage** → DEPRECATED (always skipped as of 2025-10-02)
3. **Build Stage** → The main pipeline containing:
   - Template Extraction
   - Backend Spec Stage (Schema Designer → Contracts Designer)
   - TypeScript Configuration
   - **Technical Architecture Spec** (pages-and-routes.md) ← Generated HERE
   - Agent Pipeline (Schema Generator → Storage → Routes → API Client → FIS → Frontend Implementation)
4. **Validator Stage** → Final validation

**Key Insight**: Technical Architecture Spec (pages-and-routes.md) is generated INSIDE Build Stage BEFORE the agent pipeline, not as a separate main.py stage.

## Complete Agent List in Order

### Backend Agents (Server-Side)
1. **Schema Designer** - Creates schema.zod.ts
2. **Contracts Designer** - Creates contracts/*.contract.ts
3. **Schema Generator** - Converts to schema.ts
4. **Storage Generator** - Creates storage.ts with CRUD operations
5. **Routes Generator** - Creates routes.ts Express endpoints

### Frontend Agents (Client-Side)
6. **TsRest API Client Generator** - Creates api.ts type-safe client
7. **Frontend Interaction Spec** - Creates frontend-interaction-spec.md
8. **Frontend Implementation** - Creates React components

## Complete Execution Flow

### 1. Entry Point: Shell Script
```bash
run-timeless-weddings-phase1.sh
    ↓
uv run python src/app_factory_leonardo_replit/run.py \
    "$PROMPT" \
    --workspace-name "timeless-weddings-phase1" \
    --frontend-port 5173 \
    --backend-port 8000 \
    --phase 1 \
    --max-entities-phase1 5
```

### 2. run.py
- Parses arguments
- Sets up logging
- Generates workspace path: `/apps/timeless-weddings-phase1/`
- Calls `main.py::run_pipeline()`

### 3. main.py::run_pipeline()
Orchestrates the following stages sequentially:

#### Stage 1: Plan Stage
- **Location**: `plan_stage.py`
- **Output**: `/plan/plan.md`
- **Skip Logic**: ✅ Correct - skips if `plan.md` exists
- **Agents**: Plan Orchestrator (single agent)

#### Stage 2: UI Component Spec Stage
- **Status**: DEPRECATED (as of 2025-10-02)
- **Location**: `stage_1_ui_component_spec.py`
- **Output**: `/plan/ui-component-spec.md`
- **Skip Logic**: ⏭️ ALWAYS SKIPPED - Redundant with Frontend Interaction Spec
- **Note**: Frontend Interaction Spec contains all UI Component Spec info plus implementation details

#### Stage 3: Build Stage (The Main Pipeline)
- **Location**: `build_stage.py::run_stage()`
- **Skip Logic**: ✅ FIXED - Always runs, handles internal skip logic per sub-stage/agent
- **Runs When**: plan.md exists

### 4. build_stage.py::run_stage() - The Main Pipeline

This is where the actual application generation happens. Contains multiple sub-stages and agents:

#### Sub-Stage A: Template Extraction
- **Function**: `extract_template()`
- **Output**: `/app/` directory with template files
- **Skip Logic**: ✅ Correct - skips if `/app/client/`, `/app/server/` exist
- **Action**: Extracts `vite-express-template-v2.1.1-2025.tar.gz`

#### Sub-Stage B: Backend Spec Stage
- **Location**: `backend_spec_stage.py::run_stage()`
- **Agents**:
  1. **Schema Designer**
     - Output: `/app/shared/schema.zod.ts`
     - Skip: Only if `schema.zod.ts` exists
  2. **Contracts Designer**
     - Output: `/app/shared/contracts/*.contract.ts`
     - Skip: Only if `contracts/` directory exists
- **Skip Logic**: ✅ Correct - each phase skips independently

#### Sub-Stage C: TypeScript Configuration
- **Function**: `setup_typescript_configuration()`
- **Updates**: `tsconfig.json` files, `vite.config.ts`
- **Skip Logic**: None (always runs)

#### Sub-Stage D: Technical Architecture Spec
- **Function**: `technical_architecture_spec_stage.run_stage()`
- **Output**: `/app/specs/pages-and-routes.md`
- **Skip Logic**: ✅ Correct - skips if file exists
- **Dependencies**: plan.md, ui-component-spec.md (optional, will be None now), App.tsx (optional)
- **Purpose**: Determines page structure and routing architecture
- **Note**: This runs BEFORE the Agent Pipeline, setting up the architecture for downstream agents

#### Sub-Stage E: Agent Pipeline
The following agents run sequentially with Writer-Critic loops (AFTER Technical Architecture Spec):

1. **Schema Generator** (Binary or Regular)
   - **Output**: `/app/shared/schema.ts`
   - **Skip Logic**: ❌ Never reached if main.py skips Build Stage (NOW FIXED)
   - **Dependencies**: plan.md, App.tsx (optional)
   - **Purpose**: Generates TypeScript schema from Zod schemas

2. **Storage Generator**
   - **Output**: `/app/server/storage.ts`
   - **Skip Logic**: ✅ Correct - skips if `storage.ts` exists
   - **Dependencies**: schema.ts, plan.md
   - **Purpose**: Generates Drizzle ORM storage layer with CRUD operations

3. **Routes Generator**
   - **Output**: `/app/server/routes.ts`
   - **Skip Logic**: ✅ Correct - skips if `routes.ts` exists
   - **Dependencies**: schema.ts, storage.ts, contracts/, plan.md
   - **Purpose**: Generates Express routes implementing ts-rest contracts

4. **TsRest API Client Generator** (was ApiClientGenerator)
   - **Class**: `TsRestApiClientGeneratorAgent`
   - **Output**: `/app/client/src/lib/api.ts`
   - **Skip Logic**: ✅ Correct - skips if `api.ts` exists
   - **Dependencies**: contracts/, plan.md
   - **Purpose**: Generates type-safe ts-rest client for frontend to call backend APIs
   - **Note**: Replaced old fetch-based ApiClientGenerator with ts-rest version

5. **Frontend Interaction Spec**
   - **Output**: `/app/specs/frontend-interaction-spec.md`
   - **Skip Logic**: ✅ Correct - skips if file exists
   - **Dependencies**: contracts/, schema.ts, plan.md
   - **Purpose**: Generates comprehensive frontend specification document

6. **Frontend Implementation**
   - **Output**: Multiple React component files
   - **Skip Logic**: No specific file check
   - **Dependencies**: frontend-interaction-spec.md, schema.ts, contracts/
   - **Purpose**: Generates actual React components and pages

### 4. Validator Stage
- **Location**: `validator_stage.py`
- **Action**: Runs OXC linting, build tests, fixes issues
- **Skip Logic**: Only runs if Build Stage succeeded and app/ directory exists
- **Purpose**: Final validation to ensure entire app compiles and works

## The Problem: Incorrect Skip Logic

### Current Behavior (WRONG)
```python
# main.py lines 193-217
if not schema_path.exists():  # ❌ WRONG CHECK
    # Run entire Build Stage
    build_result, schema_filename = await build_stage.run_stage(...)
else:
    logger.info("Build Stage: Schema exists, skipping")  # ❌ SKIPS EVERYTHING
    build_result = AgentResult(success=True, ...)
```

### What Actually Gets Skipped (BEFORE FIX)
When `schema.ts` exists, main.py was incorrectly skipping:
- ✅ Schema Generator (correct to skip if schema.ts exists)
- ❌ Backend Spec Stage (schema.zod.ts, contracts/)
- ❌ Storage Generator (storage.ts)
- ❌ Routes Generator (routes.ts)
- ❌ TsRest API Client Generator (api.ts)
- ❌ Frontend Interaction Spec (frontend-interaction-spec.md)
- ❌ Frontend Implementation (React components)

### Correct Behavior (SHOULD BE)
```python
# main.py should ALWAYS run build_stage
logger.info("Build Stage: Starting...")
build_result, schema_filename = await build_stage.run_stage(...)
# Let build_stage handle its own skip logic internally
```

## Artifact Dependencies

### Independent Artifacts (can be skipped individually)
- `plan.md` - no dependencies
- `ui-component-spec.md` - depends on plan.md
- `schema.zod.ts` - depends on plan.md
- `contracts/*.contract.ts` - depends on schema.zod.ts

### Dependent Artifacts (need prerequisites)
- `schema.ts` - depends on schema.zod.ts (converted)
- `storage.ts` - depends on schema.ts
- `routes.ts` - depends on storage.ts, contracts/
- `api.ts` - depends on contracts/
- `frontend-interaction-spec.md` - depends on contracts/, schema.ts
- React components - depend on frontend-interaction-spec.md

## Proper Skip Logic Rules

### Rule 1: Stage-Level Skipping
Only skip entire stages if ALL their outputs exist:
- Plan Stage: skip if plan.md exists
- UI Component Spec Stage: skip if ui-component-spec.md exists
- Build Stage: NEVER skip at stage level

### Rule 2: Agent-Level Skipping
Each agent should check its specific output:
```python
if output_file and output_file.exists():
    logger.info(f"⏭️ Skipping {agent_name} - output exists: {output_file}")
    continue
```

### Rule 3: Sub-Stage Skipping
- Template Extraction: skip if app/ has proper structure
- Backend Spec: skip phases independently (schema, contracts)
- Technical Spec: skip if pages-and-routes.md exists

### Rule 4: Dependency Validation
Before skipping, verify dependencies exist:
- Routes Generator needs storage.ts to exist
- API Client needs contracts/ to exist
- Frontend Implementation needs frontend-interaction-spec.md

## Implementation Fix

### 1. Fix main.py (lines 193-217)
```python
# Remove the schema.ts existence check
# Always run build_stage and let it handle skip logic
logger.info("\n⚡ Build Stage: Starting...")
build_result, schema_filename = await build_stage.run_stage(
    plan_path=plan_path,
    react_component_path=None,
    output_dir=build_dir,
    phase=phase
)
```

### 2. Verify build_stage.py Skip Logic
The skip logic in build_stage.py is already correct:
- Line 830: Checks for template extraction
- Line 851-852: Checks for backend specs
- Line 1115: Checks for individual agent outputs

### 3. Add Dependency Checks
Before skipping an agent, verify its dependencies:
```python
if output_file and output_file.exists():
    # Verify dependencies
    deps_exist = all(Path(dep).exists() for dep in agent.get("dependencies", []))
    if deps_exist:
        logger.info(f"⏭️ Skipping {agent_name} - output exists")
        continue
    else:
        logger.info(f"⚠️ Output exists but dependencies missing, regenerating")
```

## Testing the Fix

After implementing the fix, test these scenarios:

### Scenario 1: Fresh Run
- Delete apps/timeless-weddings-phase1/
- Run pipeline
- Should generate everything

### Scenario 2: Restart After Schema Generation
- Run until schema.ts is created
- Ctrl+C
- Restart
- Should skip schema, continue with storage.ts

### Scenario 3: Restart After Backend Complete
- Run until routes.ts is created
- Ctrl+C
- Restart
- Should skip backend agents, continue with frontend

### Scenario 4: Full Restart
- Complete full generation
- Restart
- Should skip everything, go straight to validator

## Summary

The Leonardo Pipeline has a sophisticated multi-agent architecture, but the skip logic in main.py is too coarse-grained. By removing the schema.ts check in main.py and relying on build_stage.py's internal per-agent skip logic, we can achieve proper incremental generation where only missing artifacts are created.

**Key Insight**: Each agent should manage its own skip logic based on its specific outputs, not have skipping decisions made at the orchestrator level based on unrelated artifacts.