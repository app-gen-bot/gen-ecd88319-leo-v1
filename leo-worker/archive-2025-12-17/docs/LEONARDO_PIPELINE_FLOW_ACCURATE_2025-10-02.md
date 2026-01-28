# Leonardo Pipeline - Accurate Execution Flow
**Date: 2025-10-02**
**Verified from actual code call flow**

## Complete Pipeline Execution Order

### Entry Point
```bash
./run-timeless-weddings-phase1.sh
  ↓
uv run python src/app_factory_leonardo_replit/run.py "$PROMPT" --workspace-name "timeless-weddings-phase1"
  ↓
main.py::run_pipeline()
```

## Main Pipeline Stages (main.py)

### Stage 1: Plan Stage
- **Location**: `stages/plan_stage.py::run_stage()`
- **Output**: `/plan/plan.md`
- **Skip**: If plan.md exists
- **Agent**: Plan Orchestrator

### Stage 2: UI Component Spec Stage ⏭️ DEPRECATED
- **Location**: `stages/stage_1_ui_component_spec.py::run_stage()`
- **Output**: `/plan/ui-component-spec.md`
- **Status**: **ALWAYS SKIPPED** (as of 2025-10-02)
- **Reason**: Redundant with Frontend Interaction Spec
- **Cost Savings**: ~$0.05-0.10 per run

### Stage 3: Build Stage (The Main Pipeline)
- **Location**: `stages/build_stage.py::run_stage()`
- **Trigger**: Always runs if plan.md exists
- **Skip Logic**: Internal - each sub-stage/agent handles its own skipping

#### Build Stage Sub-Stages (in order):

##### 3.1. Template Extraction
```python
extract_template() → /app/client/, /app/server/, /app/shared/
```
- **Skip**: If `/app/client/` and `/app/server/` exist
- **Action**: Extracts vite-express-template-v2.1.1-2025.tar.gz

##### 3.2. Backend Spec Stage
```python
backend_spec_stage.run_stage()
```
- **Agents**:
  1. Schema Designer → `/app/shared/schema.zod.ts`
  2. Contracts Designer → `/app/shared/contracts/*.contract.ts`
- **Skip**: Each agent skips if its output exists

##### 3.3. TypeScript Configuration
```python
setup_typescript_configuration()
```
- **Updates**: tsconfig.json files, vite.config.ts
- **Skip**: None (always runs)

##### 3.4. Technical Architecture Spec ⭐ KEY FINDING
```python
technical_architecture_spec_stage.run_stage()
  ↓
/app/specs/pages-and-routes.md
```
- **Location**: Build Stage line 950
- **Skip**: If pages-and-routes.md exists
- **Dependencies**: plan.md, ui-component-spec.md (optional, now None), App.tsx (optional)
- **Purpose**: Determines page structure and routing before agent pipeline

##### 3.5. Agent Pipeline (Writer-Critic Loops)
Runs sequentially AFTER Technical Architecture Spec:

1. **Schema Generator** → `/app/shared/schema.ts`
   - Converts schema.zod.ts to Drizzle ORM

2. **Storage Generator** → `/app/server/storage.ts`
   - Creates CRUD operations

3. **Routes Generator** → `/app/server/routes.ts`
   - Creates Express routes

4. **TsRest API Client Generator** → `/app/client/src/lib/api.ts`
   - Creates type-safe API client

5. **Frontend Interaction Spec** → `/app/specs/frontend-interaction-spec.md`
   - Comprehensive frontend specification (contains ALL ui-component-spec info)

6. **Frontend Implementation** → React components
   - Generates actual UI components

### Stage 4: Validator Stage
- **Location**: `stages/validator_stage.py::run_validator_stage()`
- **Trigger**: If Build Stage succeeded and /app/ exists
- **Action**: OXC linting, build tests, auto-fixes

## Key Insights

### 1. Technical Architecture Spec Location
**The document was WRONG about this being a separate stage in main.py**

- ❌ **Incorrect**: "Stage 4: Technical Architecture Spec Stage in main.py"
- ✅ **Correct**: Sub-Stage 3.4 INSIDE Build Stage, runs at line 950

### 2. Execution Order in Build Stage
```
Template Extraction
  ↓
Backend Spec (Schema Designer + Contracts Designer)
  ↓
TypeScript Configuration
  ↓
Technical Architecture Spec ← HERE (before agent pipeline!)
  ↓
Agent Pipeline:
  - Schema Generator
  - Storage Generator
  - Routes Generator
  - API Client Generator
  - Frontend Interaction Spec
  - Frontend Implementation
```

### 3. UI Component Spec Deprecation
- Previously: Plan → UI Component Spec → Build Stage
- Now: Plan → [SKIPPED] → Build Stage
- Technical Architecture Spec no longer receives ui-component-spec.md (gets None)
- Frontend Interaction Spec contains everything UI Component Spec had plus more

## Verification Commands

```bash
# Check when Technical Architecture Spec is called
grep -n "technical_architecture_spec_stage.run_stage" src/app_factory_leonardo_replit/**/*.py

# Result: stages/build_stage.py:950
# Confirms it's inside Build Stage, not main.py
```

## Updated Architecture Diagram

```
main.py::run_pipeline()
├── Stage 1: Plan Stage
│   └── plan.md
│
├── Stage 2: UI Component Spec [DEPRECATED - SKIPPED]
│   └── (would create ui-component-spec.md)
│
├── Stage 3: Build Stage
│   ├── 3.1: Template Extraction
│   │   └── /app/ structure
│   │
│   ├── 3.2: Backend Spec Stage
│   │   ├── Schema Designer → schema.zod.ts
│   │   └── Contracts Designer → contracts/*.contract.ts
│   │
│   ├── 3.3: TypeScript Configuration
│   │   └── tsconfig.json updates
│   │
│   ├── 3.4: Technical Architecture Spec ⭐
│   │   └── pages-and-routes.md
│   │
│   └── 3.5: Agent Pipeline
│       ├── Schema Generator → schema.ts
│       ├── Storage Generator → storage.ts
│       ├── Routes Generator → routes.ts
│       ├── API Client Generator → api.ts
│       ├── Frontend Interaction Spec → frontend-interaction-spec.md
│       └── Frontend Implementation → React components
│
└── Stage 4: Validator Stage
    └── OXC linting, build tests
```

## Corrections Made to Documentation

1. ✅ Updated `/docs/leonardo-pipeline-execution-flow-2025-10-02.md`
   - Corrected Technical Architecture Spec location (Build Stage sub-stage, not main.py stage)
   - Marked UI Component Spec as deprecated
   - Updated stage numbering (removed Design System and Preview stages)

2. ✅ Created `/docs/UI_COMPONENT_SPEC_DEPRECATION.md`
   - Documented deprecation rationale
   - Showed cost savings
   - Updated pipeline flow diagram

3. ✅ This document
   - Provides accurate call flow verified from actual code
   - Clarifies Technical Architecture Spec timing
   - Shows complete Build Stage sub-stage structure
