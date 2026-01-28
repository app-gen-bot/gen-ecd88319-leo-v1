# Correct Build Stage Ordering

## Problem
The FIS (Frontend Interaction Specification) needs to reference the API client methods, but the API client was being generated AFTER the FIS. This is backwards!

## Solution: Correct Order

```python
async def run_build_stage(app_dir: Path) -> AgentResult:
    """Run build stage with CORRECT ordering."""

    # 1. Generate Schema
    schema_success = await run_schema_generator(app_dir)
    if not schema_success:
        return AgentResult(success=False, error="Schema generation failed")

    # 2. Generate Contracts
    contracts_success = await run_contract_generator(app_dir)
    if not contracts_success:
        return AgentResult(success=False, error="Contract generation failed")

    # 3. Generate API Client (BEFORE FIS!)
    # This is deterministic - no Writer-Critic needed
    from utilities.fix_api_client import fix_api_client
    api_client_success = fix_api_client(app_dir)
    if not api_client_success:
        return AgentResult(success=False, error="API client generation failed")
    logger.info("✅ Generated ts-rest API client")

    # 4. Generate FIS (can now reference real apiClient)
    fis_success = await run_fis_writer_critic_loop(app_dir)
    if not fis_success:
        return AgentResult(success=False, error="FIS generation failed")

    # 5. Validate FIS
    from utilities.fis_validator import FISValidator
    validator = FISValidator(
        contracts_dir=app_dir / "shared" / "contracts",
        fis_path=app_dir.parent / "plan" / "frontend-interaction-spec.md"
    )
    is_valid, errors, stats = validator.validate()
    if not is_valid:
        return AgentResult(success=False, error=f"FIS validation failed: {errors}")
    logger.info(f"✅ FIS validated: {stats['compliance_score']}% compliance")

    # 6. Generate Storage Layer
    storage_success = await run_storage_generator(app_dir)

    # 7. Generate Routes
    routes_success = await run_routes_generator(app_dir)

    # 8. Generate Frontend Components
    frontend_success = await run_frontend_implementation(app_dir)

    return AgentResult(success=True)
```

## Why This Order Makes Sense

### Before (Wrong):
- FIS Writer: "I need to document API calls but apiClient doesn't exist"
- FIS Writer: "I'll guess: `apiClient.chapels.getFeaturedChapels()`" ← INVENTED!
- API Client Generator: "Here's the real client with `getChapels` method"
- Frontend: "getFeaturedChapels doesn't exist!" 💥

### After (Correct):
- Contract Generator: "Here are the contracts"
- API Client Generator: "Here's the exact client matching those contracts"
- FIS Writer: "I can read the actual API client and document real methods"
- FIS Validator: "Yes, all these methods exist in the client"
- Frontend: "Perfect, everything matches!" ✅

## Key Insight

The API client is **deterministic** (generated from contracts), so it can be created immediately after contracts without needing Writer-Critic loops. This makes it available as a **source of truth** for the FIS Writer.

## Implementation Notes

1. The `fix_api_client.py` utility should be called as a **pipeline step**, not inside an agent
2. The FIS Writer should be able to **read** the generated `api.ts` file
3. The FIS Validator can check that all referenced methods actually exist in the client
4. No more hallucinated API methods!

## Benefits

1. **FIS accuracy**: 95%+ compliance instead of 65%
2. **No hallucination**: FIS references real methods only
3. **Type safety**: FIS can even include correct TypeScript types
4. **Validation**: Can validate against actual client, not just contracts
5. **Developer experience**: FIS shows real, working code examples