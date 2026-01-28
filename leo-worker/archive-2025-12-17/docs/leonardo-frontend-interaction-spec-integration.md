# Frontend Interaction Specification Integration - Leonardo Pipeline

## Overview

This document describes the integration of the Frontend Interaction Specification generator into the Leonardo App Factory pipeline. The goal is to create contract-aware, comprehensive frontend specifications that produce amazing web applications with exceptional design.

## Background

The Frontend Interaction Spec generator from the `michaelangelo-happyllama-new-stack-validated` branch creates detailed UI/UX specifications that result in beautiful, well-designed applications. This integration brings that capability to the Leonardo pipeline while ensuring all frontend interactions use the generated backend contracts.

## Key Changes

### 1. New Frontend Interaction Spec Stage

**Location**: `src/app_factory_leonardo_replit/stages/frontend_interaction_spec_stage.py`

- Runs AFTER the Build Stage to use generated contracts
- Uses Writer-Critic pattern for iterative improvement
- Generates comprehensive, contract-aware specifications
- Maximum 3 iterations for convergence

### 2. Agent Structure

Following the established Leonardo pattern with three-layer architecture:

```
src/app_factory_leonardo_replit/agents/frontend_interaction_spec/
├── __init__.py
├── agent.py                 # Writer agent
├── config.py               # Agent configuration
├── system_prompt.py        # Writer system prompt
├── user_prompt.py          # Prompt builder
└── critic/
    ├── __init__.py
    ├── agent.py            # Critic agent
    ├── config.py           # Critic configuration
    ├── system_prompt.py    # Critic system prompt
    └── user_prompt.py      # Critic prompt builder
```

### 3. Design System Deprecation

The Design System stage (`design_system_stage.py`) is now deprecated because:
- It only injected 3 semantic colors based on domain keywords
- Too simplistic for comprehensive design needs
- Frontend Interaction Spec provides complete design specifications
- ASTOUNDING design principles are built into the Frontend Interaction Spec

### 4. Pipeline Order

Updated pipeline sequence:

```
1. Plan Stage → generates plan.md
2. UI Component Spec Stage → generates ui-component-spec.md
3. Build Stage → generates schema.ts, contracts/*.contract.ts
4. Frontend Interaction Spec Stage → generates frontend-interaction-spec.md (NEW)
5. Validator Stage → validates the application
```

## Contract-Aware Design

The Frontend Interaction Spec is fully contract-aware:

### Input Context

The agent receives:
1. **Application Plan** (`plan.md`) - Business requirements
2. **UI Component Spec** (`ui-component-spec.md`) - Initial components
3. **Drizzle Schema** (`schema.ts`) - Database entities
4. **API Contracts** (`contracts/*.contract.ts`) - All endpoints
5. **Common Utilities** (`contracts/common.ts`) - Shared types

### Contract Compliance

Every interaction in the specification:
- Maps to an actual contract endpoint
- Uses correct request/response types
- Handles contract-defined error cases
- Follows pagination/filtering from contracts
- No invented API calls

### Example Mapping

```typescript
// Contract: bookingsContract.getBookings
// Frontend Spec: Bookings List Page
const useBookings = () => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: () => client.bookings.getBookings(),
    staleTime: 5 * 60 * 1000
  });
};
```

## Writer-Critic Implementation

### Writer Agent

**Purpose**: Generate comprehensive frontend specifications

**Key Features**:
- Accepts previous critic feedback for iterations
- Outputs to `frontend-interaction-spec.md`
- Uses contracts to ensure API alignment
- Applies ASTOUNDING design principles

### Critic Agent

**Purpose**: Evaluate specifications for completeness and accuracy

**Evaluation Criteria**:
1. **Contract Compliance** (≥95% required)
2. **Completeness** (≥90% required)
3. **Implementation Readiness** (≥85% required)
4. **Schema Alignment**
5. **Design Consistency**

**Decision Logic**:
- Returns `complete` when all criteria met
- Returns `continue` with specific feedback for improvements

### Iteration Loop

```python
async def run_writer_critic_loop(
    writer_agent: FrontendInteractionSpecAgent,
    critic_agent: FrontendInteractionSpecCriticAgent,
    # ... inputs
    max_iterations: int = 3
) -> Tuple[bool, str, Dict[str, Any]]:
```

## ASTOUNDING Design Principles

Built into the Frontend Interaction Spec system prompt:

1. **Dark Theme First**: Deep backgrounds (#0A0A0B), high contrast
2. **Glassmorphism**: Subtle transparency with backdrop-filter
3. **Neon Accents**: Vibrant colors for CTAs and highlights
4. **Smooth Animations**: 300-500ms transitions, ease-in-out
5. **Typography**: Modern, clean fonts with excellent readability
6. **Spacing**: Generous whitespace, 8px grid system
7. **Elevation**: Multiple depth layers using shadows and blur

## Specification Output

The generated `frontend-interaction-spec.md` includes:

### Complete Coverage
- Application overview and personas
- Navigation architecture with sitemap
- Page-by-page specifications
- Component details with contract mappings
- Form specifications with validation
- State management patterns
- Error handling strategies
- Performance considerations
- Accessibility requirements (WCAG 2.1 AA)

### Contract Integration
- Every data interaction mapped to contracts
- Hook patterns for API calls
- Cache invalidation strategies
- Optimistic update patterns
- Error recovery mechanisms

### Implementation Ready
- No ambiguity in specifications
- Code examples for complex patterns
- Visual descriptions for CSS translation
- Responsive breakpoint behaviors
- Animation and transition details

## Usage

### Running the Pipeline

The Frontend Interaction Spec stage runs automatically after the Build Stage:

```bash
uv run python src/app_factory_leonardo_replit/run.py "Create a wedding venue booking app"
```

### Manual Execution

For testing or re-generation:

```python
from app_factory_leonardo_replit.stages import frontend_interaction_spec_stage

result, filename = await frontend_interaction_spec_stage.run_stage(
    plan_path=Path("plan/plan.md"),
    ui_component_spec_path=Path("plan/ui-component-spec.md"),
    schema_path=Path("app/shared/schema.ts"),
    contracts_dir=Path("app/shared/contracts"),
    output_dir=Path("plan"),
    max_iterations=3
)
```

## Benefits

1. **Contract Compliance**: No mismatch between frontend and backend
2. **Design Excellence**: ASTOUNDING aesthetic principles applied consistently
3. **Complete Specifications**: Every interaction detailed for implementation
4. **Quality Assurance**: Writer-Critic ensures high-quality output
5. **Generic Solution**: Works for any application domain, not wedding-specific

## Migration Notes

### For Existing Apps

Apps generated before this integration can add the Frontend Interaction Spec:

1. Ensure Build Stage has completed (contracts exist)
2. Delete `frontend-interaction-spec.md` if it exists
3. Re-run the pipeline - it will generate the new spec
4. Frontend implementation can use the new spec

### Deprecation Impact

The Design System stage is deprecated but:
- Existing `design-system/` directories remain valid
- Color schemes can be extracted from Frontend Interaction Spec
- No breaking changes to existing applications

## Future Enhancements

1. **Frontend Code Generation**: Use the spec to generate React components
2. **Visual Preview**: Generate visual mockups from specifications
3. **Test Generation**: Create test cases from interaction specs
4. **Accessibility Audit**: Automated WCAG compliance checking
5. **Performance Budgets**: Define and enforce performance metrics

## Conclusion

The Frontend Interaction Specification integration brings professional-grade UI/UX design to the Leonardo pipeline while maintaining strict contract compliance. This ensures beautiful, functional applications that work correctly with their backends from day one.