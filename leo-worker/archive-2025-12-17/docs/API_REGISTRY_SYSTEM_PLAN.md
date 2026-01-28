# API Registry System: Implementation Plan

**Date**: 2025-10-11
**Status**: Planning Phase
**Goal**: Eliminate API method hallucinations through metadata-driven contract propagation

---

## Executive Summary

**Problem**: FIS generators hallucinate API methods because they infer from schema rather than reading actual contracts.

**Root Cause Analysis**:
- Contracts generated Oct 3, FIS generated Oct 10 (7 days apart)
- FIS agent was instructed to read contracts but didn't
- Agent inferred methods from schema (e.g., `imageUrls` field → assumed `getChapelImages()` method)
- No validation caught hallucinated methods
- Page generators waste time discovering methods don't exist

**Solution**: Generate lightweight metadata files (`.meta.json`) alongside contracts, compile into API registry, propagate to all downstream consumers.

**Key Principle**: Generate metadata at the SAME TIME as contracts - never parse after the fact.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    GENERATION PHASE                          │
└─────────────────────────────────────────────────────────────┘
  Schema (schema.ts)
      ↓
  Contracts Generator Agent (LLM)
      ↓ [Generates simultaneously]
      ├─→ bookings.contract.ts      (TypeScript)
      └─→ bookings.contract.meta.json  (Metadata) ← NEW
      ├─→ chapels.contract.ts
      └─→ chapels.contract.meta.json   ← NEW
      └─→ ... (all entities)

┌─────────────────────────────────────────────────────────────┐
│                   COMPILATION PHASE                          │
└─────────────────────────────────────────────────────────────┘
  TsRestApiClientGenerator (Deterministic Python)
      ↓ [Reads all .meta.json]
      ├─→ api-client.ts            (ts-rest client)
      └─→ api-registry.md          (Compiled registry) ← NEW

┌─────────────────────────────────────────────────────────────┐
│                   CONSUMPTION PHASE                          │
└─────────────────────────────────────────────────────────────┘
  FIS Generator Agent (LLM)
      ↓ [Reads api-registry.md]
      ├─→ frontend-interaction-spec-master.md
      └─→ specs/pages/*.md

  Page Generator Agent (LLM)
      ↓ [Receives registry in context]
      └─→ client/src/pages/*.tsx

┌─────────────────────────────────────────────────────────────┐
│                   VERIFICATION PHASE                         │
└─────────────────────────────────────────────────────────────┘
  Critics at Each Level
      ├─→ Contract Critic: Validates metadata ↔ contract
      ├─→ FIS Critic: Validates methods exist in registry
      └─→ Page Critic: Validates apiClient.* calls exist
```

---

## Metadata Schema Design

### File Naming Convention
```
{entity}.contract.ts     → {entity}.contract.meta.json
chapels.contract.ts      → chapels.contract.meta.json
bookings.contract.ts     → bookings.contract.meta.json
```

### Metadata Structure

```json
{
  "$schema": "contract-metadata-v1",
  "entity": "chapels",
  "contractFile": "chapels.contract.ts",
  "generatedAt": "2025-10-11T10:00:00Z",
  "apiNamespace": "apiClient.chapels",
  "methods": [
    {
      "name": "getChapels",
      "signature": "getChapels(query?: {...})",
      "httpMethod": "GET",
      "path": "/chapels",
      "description": "Get all chapels with filtering, pagination, and sorting",
      "parameters": {
        "query": [
          "page?: number",
          "limit?: number",
          "city?: string",
          "state?: string",
          "minCapacity?: number",
          "maxCapacity?: number",
          "search?: string",
          "sortBy?: 'name'|'capacity'|'city'|'createdAt'",
          "sortOrder?: 'asc'|'desc'"
        ]
      },
      "returns": "{ chapels: Chapel[], total: number, page: number, limit: number }",
      "authRequired": false,
      "requiredRole": null
    }
  ]
}
```

### Why This Structure?

- ✅ **Self-documenting**: Includes descriptions for each method
- ✅ **Complete signatures**: Everything needed to call the method
- ✅ **Auth info**: Knows which methods require authentication
- ✅ **Timestamped**: Can detect stale metadata
- ✅ **Namespace**: Shows exact usage (`apiClient.chapels.getChapels`)

---

## Implementation Phases

### Phase 1: Contracts Generator Enhancement

**File**: `src/app_factory_leonardo_replit/agents/contracts_designer/system_prompt.py`

**Changes**:
1. Add instruction to generate `.contract.meta.json` alongside `.contract.ts`
2. Specify exact metadata structure
3. Require both files for success

**Success Criteria**:
- One contract generates both `.contract.ts` and `.contract.meta.json`
- Metadata is valid JSON with all required fields
- Validator passes

### Phase 2: Registry Compilation

**File**: `src/app_factory_leonardo_replit/utilities/fix_api_client.py`

**New Functions**:
1. `compile_api_registry_from_metadata()` - Compiles all `.meta.json` into `api-registry.md`
2. Integration with existing `fix_api_client()` function

**Output**: `client/src/lib/api-registry.md` (~2-5KB, human-readable)

**Success Criteria**:
- `api-registry.md` generated automatically after contracts
- Contains all methods from all entities
- < 5KB for typical app

### Phase 3: FIS Generator Integration

**Files**:
- `src/app_factory_leonardo_replit/agents/frontend_interaction_spec/system_prompt.py`
- `src/app_factory_leonardo_replit/agents/frontend_interaction_spec/user_prompt.py`

**Changes**:
1. Add explicit instruction to read `api-registry.md`
2. Require verification that all methods exist in registry
3. Add "Future: needs backend" pattern for missing methods

**Success Criteria**:
- FIS contains only methods from registry
- Zero hallucinated methods
- FIS Critic catches violations

### Phase 4: Page Generator Integration

**File**: `src/app_factory_leonardo_replit/agents/page_generator/critic/system_prompt.py`

**Changes**:
1. Add API method validation to critic
2. Verify all `apiClient.*` calls exist in registry

**Success Criteria**:
- Page critics validate against registry
- Zero API-related failures in parallel generation

### Phase 5: Validation Layer

**New Files**:
- `src/app_factory_leonardo_replit/agents/contracts_designer/metadata_validator.py`

**Functions**:
1. `validate_metadata_completeness()` - Check all contracts have valid metadata
2. Integration in build stage

**Success Criteria**:
- All metadata files present and valid
- Validation catches missing/invalid metadata

---

## File Locations

### Generated Files (per app)
```
apps/timeless-weddings/app/
├── shared/contracts/
│   ├── bookings.contract.ts
│   ├── bookings.contract.meta.json      ← NEW
│   ├── chapels.contract.ts
│   ├── chapels.contract.meta.json       ← NEW
│   └── ... (all entities)
├── client/src/lib/
│   ├── api-client.ts                    (existing)
│   └── api-registry.md                  ← NEW (compiled)
└── specs/
    ├── frontend-interaction-spec-master.md
    └── pages/*.md
```

### Source Files (pipeline)
```
src/app_factory_leonardo_replit/
├── agents/
│   ├── contracts_designer/
│   │   ├── system_prompt.py             [MODIFY]
│   │   └── metadata_validator.py        [NEW]
│   ├── tsrest_api_client_generator/
│   │   └── agent.py                     [MODIFY]
│   ├── frontend_interaction_spec/
│   │   ├── system_prompt.py             [MODIFY]
│   │   └── user_prompt.py               [MODIFY]
│   └── page_generator/
│       └── critic/system_prompt.py      [MODIFY]
└── utilities/
    └── fix_api_client.py                [MODIFY]
```

---

## Rollout Plan

### Week 1: Foundation & Compilation
1. Update Contracts Generator to produce metadata
2. Test with one entity
3. Implement metadata validator
4. Implement registry compiler
5. Test registry generation

**Deliverables**:
- Metadata files generated
- Registry compiled successfully
- Validator catches issues

### Week 2: Integration & Validation
1. Update FIS Generator to read registry
2. Update FIS Critic to validate methods
3. Update Page Critic to validate methods
4. Test FIS generation with registry

**Deliverables**:
- FIS uses only real methods
- Critics catch violations
- Zero hallucinated methods

### Week 3: Full Pipeline Test
1. Run complete pipeline on test app
2. Monitor success rates
3. Fix any issues
4. Document results

**Deliverables**:
- 90%+ page generation success rate
- Complete documentation
- Metrics report

---

## Success Metrics

### Metric 1: Metadata Coverage
- **Target**: 100% of contracts have valid metadata
- **Measurement**: `validate_metadata_completeness()`

### Metric 2: Registry Completeness
- **Target**: Registry contains all methods from all contracts
- **Measurement**: Compare method counts

### Metric 3: FIS Accuracy
- **Target**: 0 hallucinated API methods in FIS
- **Tool**: FIS Critic validation

### Metric 4: Page Generation Success Rate
- **Target**: 90%+ pages generated successfully
- **Tool**: Parallel frontend generator logs

### Metric 5: API Method Errors
- **Target**: 0 "method does not exist" errors
- **Tool**: Log analysis

---

## Troubleshooting Guide

### Problem: Metadata not generated

**Diagnosis**:
```bash
ls -la shared/contracts/*.meta.json
```

**Solutions**:
1. Check Contracts Generator system prompt
2. Check agent has Write tool
3. Review agent logs for errors

### Problem: Invalid JSON in metadata

**Diagnosis**:
```bash
python -m json.tool shared/contracts/chapels.contract.meta.json
```

**Solutions**:
1. Check for trailing commas
2. Check for unescaped quotes
3. Regenerate with Writer-Critic loop

### Problem: Registry not generated

**Diagnosis**:
```python
from utilities.fix_api_client import compile_api_registry_from_metadata
success = compile_api_registry_from_metadata(contracts_dir, output_path)
```

**Solutions**:
1. Check metadata files exist
2. Check valid JSON
3. Check output directory exists

### Problem: FIS still hallucinating

**Diagnosis**: Check FIS agent logs for registry read

**Solutions**:
1. Add explicit registry read instruction
2. Enable FIS Critic validation
3. Use Writer-Critic loop

---

## Why This Approach is Non-Brittle

### ❌ Brittle Approaches (Rejected)

1. **Regex parsing TypeScript** - Breaks with formatting changes
2. **Inferring from schema** - Makes wrong assumptions
3. **Manual registry maintenance** - Gets out of sync

### ✅ Our Approach (Robust)

1. **Generated at source** - Metadata created when contract is created
2. **Single source of truth** - Contract generator knows everything
3. **Multi-level validation** - Checked at generation, compilation, FIS, and page levels
4. **Human-readable** - Registry is markdown, easy to debug
5. **Atomic** - Contract and metadata generated together
6. **Self-correcting** - Regenerating contracts updates metadata automatically

---

## Expected Outcomes

### Before This System
- 22.2% page generation success rate
- 7/9 pages timed out
- Agents spent time discovering hallucinated methods
- Writers and Critics in conflict

### After This System
- 90%+ page generation success rate
- Pages use only real methods
- No wasted time on non-existent APIs
- Writers and Critics aligned

### Token Efficiency
- Reading 5 full contracts: ~15K tokens
- Reading registry: ~500-1000 tokens
- **Savings**: 93-97% token reduction

---

## Related Issues

This system addresses the root cause identified in:
- `PARALLEL_FRONTEND_ERROR_MITIGATION_PLAN.md`
- Log analysis from `parallel-frontend-20251011-072126.log`

This is **separate from** but **complementary to**:
- Timeout configuration fixes (600s total vs per-iteration)
- Missing UI components (LoadingState, ErrorState)
- XML parsing error handling
- File writing reliability

---

## Next Steps

1. Review this plan with team
2. Approve metadata schema
3. Begin Phase 1 implementation
4. Track metrics weekly
5. Iterate based on results

---

## References

- Original deep dive analysis: This conversation
- Related docs: `PARALLEL_FRONTEND_ERROR_MITIGATION_PLAN.md`
- Pipeline architecture: `docs/leonardo-pipeline-execution-flow-2025-10-02.md`
