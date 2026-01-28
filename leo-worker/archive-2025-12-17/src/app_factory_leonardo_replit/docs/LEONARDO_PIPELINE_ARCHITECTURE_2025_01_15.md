# LEONARDO PIPELINE ARCHITECTURE 2025-01-15

## Your Proposed Leonardo Pipeline Flow

```
Plan Stage → UI Component Spec → Design System → Preview Stage (FAST)
                                                      ↓
                                              [User Approves]
                                                      ↓
                                        Technical Spec → Build Stage (SLOWER OK)
```

## Why This Is Optimal

### 1. **Speed Optimization Where It Matters**
- **Preview needs to be FAST** - users want immediate visual feedback
- **UI Component Spec** (200-300 lines) is much faster to generate than full FIS (2000+ lines)
- **Preview only needs visual/UX info**, not routes/state/validation details
- **Build can be slower** - users have already committed after seeing preview

### 2. **Perfect Information Separation**

**UI Component Spec** (for Preview):
- Visual hierarchy and patterns
- Component behaviors and states  
- User flows and interactions
- Typography and spacing systems
- Emotional design language

**Technical Spec** (for Build):
- Routes and navigation structure
- State management patterns
- API integration details
- Validation rules and business logic
- Authentication and security patterns
- Database schema hints

### 3. **Progressive Commitment Model**
1. User provides prompt → Quick plan
2. See design language → Quick UI spec  
3. See visual preview → Quick preview
4. **Decision point** → "Build it" or iterate
5. Full technical generation → Only after commitment

## Why This Is Better Than Alternatives

### vs. Original FIS Approach
- FIS was monolithic (2000+ lines, slow to generate)
- Mixed concerns (visual + technical)
- Generated everything upfront even if user might reject

### vs. No Specs
- Loses the "magic" - specs ensure completeness
- Agents work better with structured input
- Hard to maintain consistency

### vs. Single Combined Spec  
- Too large and unfocused
- Slow to generate
- Mixes concerns that different agents need

## Implementation Recommendation

```python
# Leonardo Pipeline Stages

async def run_pipeline():
    # FAST PATH - Visual Preview
    plan = await plan_stage()           # ~10 seconds
    ui_spec = await ui_component_spec() # ~15 seconds  
    design_system = await design_system_stage() # ~10 seconds
    preview = await preview_stage()     # ~20 seconds
    # Total: ~55 seconds to preview
    
    if user_approves:
        # SLOWER PATH - Full Build
        tech_spec = await technical_spec_stage() # ~30 seconds
        schema = await build_stage()             # ~20 seconds
        routes = await routes_stage()            # ~20 seconds
        pages = await parallel_page_generation() # ~40 seconds
        # Additional: ~110 seconds to full app
```

## Information Architecture

### Current State (What We've Built)
The pipeline has **three key specification layers** that work together:

1. **Plan** - The business requirements document
   - Contains: High-level app description, features, user types
   - Used by: UI Component Spec generation
   - Location: `/plan/plan.md`

2. **UI Component Specification** (NEW) - The design language document  
   - Contains: UX/UI patterns, visual hierarchy, component behaviors (in designer terms)
   - Used by: Design System Agent (to generate CSS/tokens) and Preview Agent
   - Location: `/plan/ui-component-spec.md`
   - Size: 200-300 lines (optimized for speed)

3. **Technical Implementation Specification** (FUTURE) - The code patterns document
   - Contains: Authentication setup, state management patterns, API integration, error handling
   - Used by: Build stage agents (for implementation patterns)
   - Location: `/plan/technical-implementation-spec.md`
   - Generated: Only after user approves preview

### The Complete Flow

1. **Plan** defines business needs (fast)
2. **UI Component Spec** extracts design patterns in UX language (fast)
3. **Design System Agent** reads UI Component Spec → generates actual CSS/tokens (fast)
4. **Preview Agent** uses plan + UI spec + design system → generates static preview (fast)
5. **User approves** → commit to full build
6. **Technical Spec** provides code implementation patterns (slower, but acceptable)
7. **Build agents** read all specs → generate complete app (slower, but acceptable)

## One Potential Enhancement

Consider **partial technical spec** during preview for better React component generation:

```markdown
# UI Component Spec (Enhanced)
## Component Interactions (Brief)
- ChapelCard: onClick → navigate to detail
- BookingForm: onSubmit → show confirmation
- DatePicker: onChange → update availability
```

This gives preview stage just enough to make components interactive without full technical detail.

## Key Insights

Your approach is optimal because it:
1. **Optimizes for user experience** - fast preview, thorough build
2. **Separates concerns properly** - visual vs technical
3. **Enables progressive commitment** - don't waste time on rejected designs
4. **Maintains the "magic"** - structured specs ensure quality

The only adjustment suggested is ensuring the UI Component Spec includes **brief** interaction hints (not full technical details) to help the preview stage create clickable prototypes.

## Implementation Status

- ✅ Plan Stage: Working
- ✅ UI Component Spec Stage: Working (needs refactoring for UX/UI language)
- ✅ Design System Stage: Working
- ✅ Preview Stage: Working
- ⏳ Technical Spec Stage: Not yet implemented
- ⏳ Build Stage: Partially implemented

## File Locations

- Pipeline: `src/app_factory_leonardo_replit/main.py`
- Runner: `src/app_factory_leonardo_replit/run.py`
- UI Component Spec Agent: `src/app_factory_leonardo_replit/agents/stage_1_ui_component_spec/`
- Design System Agent: `src/app_factory_leonardo_replit/agents/design_system/`

## Next Steps

1. Refactor UI Component Spec agent to use proper UX/UI language
2. Implement Technical Spec stage (post-approval)
3. Enhance Build stage to use both UI and Technical specs
4. Add parallel page generation for faster builds