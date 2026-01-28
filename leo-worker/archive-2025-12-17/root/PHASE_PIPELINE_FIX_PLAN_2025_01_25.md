# PHASE PIPELINE FIX PLAN 2025-01-25

## Problem Summary
The phase-based pipeline is not working as intended. It generates ALL phases upfront but fails to properly isolate each phase during execution.

## Current Broken Behavior
1. Phase 1 generates all phases (plan-phase1.md, plan-phase2.md, plan-phase3.md)
2. plan_stage.py returns the correct phase-specific path (e.g., plan-phase1.md)
3. **BUG**: main.py ignores the returned path and uses generic plan.md
4. All subsequent stages (UI spec, design, preview, build) use wrong plan file
5. Agents see content from ALL phases instead of just current phase

## Root Cause
In `src/app_factory_leonardo_replit/main.py`:
- Line 107: Sets `plan_path = plan_dir / "plan.md"`
- Line 127: Calls plan_stage which returns `plan_path_result` (phase-specific)
- Line 135-149: Continues using original `plan_path` instead of `plan_path_result`
- All downstream stages receive wrong plan file

## Required Fix

### 1. Update main.py (Primary Fix)
```python
# After line 131 (plan_stage completes)
if plan_result.success and plan_path_result:
    plan_path = plan_path_result  # Use phase-specific path
    logger.info(f"📋 Using phase-specific plan: {plan_path}")
```

### 2. Handle Phase > 1 Check
Before checking if plan exists (line 122), add:
```python
# Check for phase-specific plan first
if phase > 1:
    phase_plan_path = plan_dir / f"plan-phase{phase}.md"
    if phase_plan_path.exists():
        plan_path = phase_plan_path
        logger.info(f"📋 Using existing phase {phase} plan: {plan_path}")
```

### 3. Ensure Backward Compatibility
Keep the current behavior for non-phased plans (when no phase files exist).

## Expected Behavior After Fix

### Phase 1 Execution
```bash
uv run python src/app_factory_leonardo_replit/run.py --phase 1
```
- Generates complete plan with all phases
- Splits into plan-phase1.md, plan-phase2.md, etc.
- **Uses ONLY plan-phase1.md for entire pipeline**
- Builds working app with just Phase 1 entities (e.g., 5 entities)

### Phase 2 Execution
```bash
uv run python src/app_factory_leonardo_replit/run.py --phase 2
```
- Finds existing plan-phase2.md
- **Uses ONLY plan-phase2.md for entire pipeline**
- Builds on Phase 1 foundation, adds Phase 2 entities
- Results in working app with Phase 1 + Phase 2 (e.g., 10 entities)

## Testing Plan
1. Clean workspace: `rm -rf apps/timeless-weddings`
2. Run Phase 1: Should create app with 5 entities only
3. Verify app/specs/plan.md contains ONLY Phase 1 content
4. Run Phase 2: Should extend app with next 5 entities
5. Verify app/specs/plan.md contains ONLY Phase 2 content

## Files to Modify
- `src/app_factory_leonardo_replit/main.py` - Primary fix
- No changes needed to:
  - plan_stage.py (already returns correct path)
  - build_stage.py (already copies correct phase to app/specs)

## Implementation Notes
- Simple fix: Use the path that plan_stage returns
- Maintains existing phase extraction logic
- Preserves build_stage's phase isolation
- Each phase gets complete end-to-end pipeline execution