# Leonardo Replit Pipeline Documentation Enhancement Plan

## Executive Summary

Transform the Leonardo Replit pipeline from generating a simple 33-line plan into a comprehensive documentation system that produces small, focused "flashable" documents. This enables faster generation, reduced API costs, and parallel processing while maintaining the "magical" quality of generated applications.

## Problem Statement

Current limitations:
- Single monolithic plan.md file (33 lines) drives entire pipeline
- Large context windows for each agent (inefficient, expensive)
- No parallelization capability
- Missing interaction specifications and UX guidelines
- Agents must infer too much from minimal documentation

## Solution Overview

Create a multi-stage documentation generation system that:
1. Enriches the initial plan with structured data
2. Generates micro-documents at optimal pipeline points
3. Enables each agent to consume only relevant documentation
4. Supports Now/Later feature phasing for incremental delivery
5. Prepares for parallel page generation

## Architecture Changes

### Current Pipeline
```
User Prompt → Plan (33 lines) → Preview → Build (all from plan)
```

### Enhanced Pipeline
```
User Prompt → Rich Plan + Micro-docs → Enhanced Preview → Docs Stage → Focused Build
```

## Detailed Implementation Plan

### Phase 1: Enhanced Plan Generation

#### Modified Files
- `src/app_factory_leonardo_replit/agents/plan_orchestrator/orchestrator/system_prompt.py`
- `src/app_factory_leonardo_replit/agents/plan_orchestrator/orchestrator/agent.py`
- `src/app_factory_leonardo_replit/stages/plan_stage.py`

#### New Outputs
```
plan/
├── plan.md                    # Enhanced plan (60 lines)
├── features.json              # Structured feature inventory
├── user_journeys.md           # 3-5 key user flows
├── page_inventory.md          # Routes and purposes
└── experience_rails.md        # UX guidelines (states, tone, motion)
```

#### Enhanced Plan Structure
```markdown
# Plan: [Application Name]

## Application Overview
- **Goal**: [Primary objective]
- **Outcomes**: [Expected results]
- **Target Users**: [User personas]

## Feature Inventory
### Now (MVP)
- Feature 1 with detailed specification
- Feature 2 with detailed specification

### Later (Phase 2)
- Advanced feature 1
- Advanced feature 2

## User Journeys
1. [Primary Journey]: Step-by-step flow
2. [Secondary Journey]: Alternative path

## Page Structure
- /: Homepage with [purpose]
- /[route]: [Page] with [purpose]

## Experience Guidelines
- Loading: Skeleton screens with brand colors
- Empty: Friendly messages with CTAs
- Error: Recovery paths with helpful text
- Tone: Professional yet approachable
- Motion: Subtle transitions, no jarring movements
```

### Phase 2: Preview Enhancement

#### Modified Files
- `src/app_factory_leonardo_replit/agents/preview_generator/`
- `src/app_factory_leonardo_replit/stages/preview_stage.py`

#### New Outputs
```
preview-react/
├── App.tsx                    # Existing React component
├── component_map.json         # Extracted component inventory
├── layout_zones.md            # Page layout patterns
└── interaction_hints.json     # Detected interactions/events
```

#### Component Map Structure
```json
{
  "components": {
    "Header": {
      "type": "navigation",
      "contains": ["Logo", "NavMenu", "UserAvatar"]
    },
    "TaskList": {
      "type": "list",
      "contains": ["TaskItem"],
      "interactions": ["onAdd", "onFilter"]
    }
  }
}
```

### Phase 3: New Documentation Stage

#### New Files
```
src/app_factory_leonardo_replit/
├── stages/
│   └── docs_stage.py
└── agents/
    └── docs_generator/
        ├── __init__.py
        ├── agent.py
        ├── system_prompt.py
        └── user_prompt.py
```

#### Outputs
```
docs/
├── pages/
│   ├── HomePage.md            # Home page brief
│   ├── DashboardPage.md       # Dashboard brief
│   └── [PageName].md          # Other page briefs
└── backend/
    ├── routes_spec.md         # API endpoint specifications
    ├── storage_spec.md        # CRUD operations
    └── schema_hints.md        # Data relationships
```

#### Page Brief Template
```markdown
# [Page Name] Brief

## Purpose
[Single sentence describing page goal]

## Layout Zones
- Header: [NavigationBar, UserMenu]
- Main: [ContentArea, DataGrid]
- Sidebar: [FilterPanel, ActionButtons]

## Component Hierarchy
- PageContainer
  - Header
  - MainContent
    - DataList
      - DataItem
  - Sidebar

## States
- Loading: Show skeleton loader for 1-2 seconds
- Empty: "No items yet. Click 'Add' to get started!"
- Error: "Unable to load. [Retry] [Contact Support]"
- Ready: Display full interface

## Actions/Events
- onClickAdd: Open creation modal
- onSubmitForm: POST to /api/items
- onDeleteItem: DELETE /api/items/:id with confirmation

## API Interactions
- GET /api/items - Load all items
- POST /api/items - Create new item
- PUT /api/items/:id - Update item
- DELETE /api/items/:id - Delete item

## Data Requirements
- items: Array<Item>
- currentUser: User
- filters: FilterState
```

### Phase 4: Build Stage Updates

#### Modified Agents

Each agent updated to consume specific micro-docs:

1. **SchemaGenerator**
   - Reads: `schema_hints.md`, `features.json`
   - Outputs: `schema.ts`

2. **StorageGenerator**
   - Reads: `storage_spec.md`, `schema.ts`
   - Outputs: `storage.ts`

3. **RoutesGenerator**
   - Reads: `routes_spec.md`, `schema.ts`
   - Outputs: `routes.ts`

4. **AppShellGenerator**
   - Reads: `layout_zones.md`, `experience_rails.md`
   - Outputs: `App.tsx`

5. **MainPageGenerator**
   - Reads: `docs/pages/HomePage.md`
   - Outputs: `HomePage.tsx`

### Phase 5: Pipeline Integration

#### Modified main.py Flow
```python
async def run_pipeline():
    # Stage 1: Enhanced Plan
    plan_result = await plan_stage.run_stage(
        user_prompt, 
        output_micro_docs=True  # NEW FLAG
    )
    
    # Stage 2: Enhanced Preview
    preview_result = await preview_stage.run_stage(
        plan_path,
        extract_components=True  # NEW FLAG
    )
    
    # Stage 3: Documentation Generation (NEW)
    docs_result = await docs_stage.run_stage(
        plan_dir=plan_dir,
        preview_dir=preview_react_dir
    )
    
    # Stage 4: Build with Focused Docs
    build_result = await build_stage.run_stage(
        docs_dir=docs_dir,  # NEW: Pass docs directory
        output_dir=build_dir
    )
    
    # Stage 5: Validation
    validator_result = await validator_stage.run_validator_stage(app_dir)
```

## Benefits Analysis

### Performance Improvements

| Metric | Current | Enhanced | Improvement |
|--------|---------|----------|-------------|
| Context per agent | ~500-1000 tokens | ~200-300 tokens | 60-70% reduction |
| API cost per run | ~$0.50 | ~$0.20 | 60% reduction |
| Generation time | Sequential only | Parallel capable | 2-3x faster |
| Error rate | Higher (large context) | Lower (focused) | ~30% reduction |

### Quality Improvements

1. **Consistency**: Shared micro-docs ensure alignment
2. **Completeness**: Nothing left to inference
3. **Maintainability**: Clear document boundaries
4. **Debuggability**: Can inspect intermediate artifacts
5. **Reusability**: Micro-docs can be cached/reused

## Example: Todo App Documentation Flow

### Current Approach
- Input: "Create a todo app"
- Output: `plan.md` (33 lines)
- Every agent reads entire plan

### Enhanced Approach
- Input: "Create a todo app"
- Outputs:
  - `plan.md` (60 lines) - Rich overview
  - `features.json` - 15 features with metadata
  - `user_journeys.md` (20 lines) - Create, complete, filter flows
  - `page_inventory.md` (10 lines) - Routes and purposes
  - `experience_rails.md` (15 lines) - UX guidelines
  - `docs/pages/HomePage.md` (30 lines) - Main page specification
  - `docs/backend/routes_spec.md` (25 lines) - API endpoints
  - `docs/backend/storage_spec.md` (20 lines) - CRUD operations

Total: ~200 lines across 8 focused documents
Each agent reads only ~30-50 relevant lines

## Migration Strategy

### Step 1: Backward Compatible Enhancement
- Keep existing pipeline working
- Add new outputs alongside existing ones
- Test with both approaches

### Step 2: Gradual Agent Updates
- Update one agent at a time to use micro-docs
- Validate output quality at each step
- Maintain fallback to monolithic approach

### Step 3: Full Migration
- All agents using micro-docs
- Remove fallback code
- Enable parallel generation features

## Success Metrics

1. **Reduction in API costs**: Target 50-60% reduction
2. **Faster generation**: Target 2-3x speed improvement
3. **Higher success rate**: Target 90%+ first-run success
4. **Better code quality**: Measured by validator pass rate
5. **Developer satisfaction**: Easier to debug and maintain

## Future Enhancements

1. **Caching Layer**: Reuse micro-docs across similar requests
2. **Template Library**: Pre-generated docs for common app types
3. **Visual Doc Builder**: UI for editing micro-docs
4. **Doc Validation**: Schema validation for all micro-docs
5. **Version Control**: Track doc evolution across iterations

## Conclusion

This enhancement transforms the Leonardo Replit pipeline from a monolithic, inference-heavy system into a precise, document-driven architecture. By breaking down the massive Frontend Interaction Spec approach into digestible micro-documents, we achieve the goals of speed, cost-efficiency, and quality while maintaining the "magical" user experience.

The phased implementation approach ensures we can validate each enhancement before proceeding, minimizing risk while maximizing the benefits of the new architecture.