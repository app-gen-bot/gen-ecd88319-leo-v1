# Code Writer Subagent → Skill Migration Analysis

## Pre-Migration Analysis (Required Before Migration)

Following the playbook in [SUBAGENT_TO_SKILL_MIGRATION_PLAYBOOK.md](SUBAGENT_TO_SKILL_MIGRATION_PLAYBOOK.md)

---

## 1. Step Back and Understand Purpose

### Core Responsibility
**code_writer** generates production-ready TypeScript/React code for routes and pages.

### What It Does
1. **Implements Backend Routes** (`server/routes/*.ts`)
   - Full CRUD implementations with error handling
   - Storage integration with factory pattern
   - ts-rest handler implementations
   - Input validation with Zod schemas

2. **Implements Frontend Pages** (`client/src/pages/*.tsx`)
   - React components with hooks
   - TanStack Query for data fetching
   - Loading/error/empty states
   - Form handling with react-hook-form

3. **Applies 13+ Patterns**:
   - Storage completeness
   - Interactive state
   - Auth helpers
   - ESM imports (.js extensions)
   - Wouter routing
   - Date calculations
   - ID flexibility
   - ts-rest v3 API
   - React Query provider
   - Proxy method binding
   - ShadCN exports
   - Wouter Link
   - Port configuration

### Problems Solved
- **Storage Completeness**: All CRUD methods implemented, no stubs
- **Interactive State**: Real API data, no mock/placeholder data
- **Auth Helpers**: Token management and protected routes
- **ESM Imports**: Correct .js extensions for imports
- **Wouter Routing**: Proper client-side navigation

### Pattern Files (16 total)
- CORE_IDENTITY.md
- STORAGE_COMPLETENESS.md
- INTERACTIVE_STATE.md
- AUTH_HELPERS.md
- ESM_IMPORTS.md
- WOUTER_ROUTING.md
- DATE_CALCULATIONS.md
- ID_FLEXIBILITY.md
- TS_REST_V3_API.md
- REACT_QUERY_PROVIDER.md
- PROXY_METHOD_BINDING.md
- SHADCN_EXPORTS.md
- WOUTER_LINK.md
- CODE_PATTERNS.md (general best practices)
- VALIDATION_CHECKLIST.md
- RECONCILIATION_REPORT.md

**Total Pattern Content**: ~4,212 lines

---

## 2. Context Needs Assessment

**Does it need full context for resume scenarios?**

**Scenarios**:
1. **Add new page** (e.g., "add user profile page")
   - Needs: Read existing pages/, know routing structure
   - Preserve: All existing pages
   - Add: New page only

2. **Add new route** (e.g., "add order analytics endpoint")
   - Needs: Read existing routes/, know storage interface
   - Preserve: Other routes untouched
   - Modify: Only specified route

3. **Modify existing page** (e.g., "add dark mode toggle to settings")
   - Needs: Read specific page, understand component structure
   - Preserve: Other functionality
   - Modify: Add feature only

4. **Fix bug in route** (e.g., "fix pagination in users endpoint")
   - Needs: Read route, understand context
   - Preserve: Other endpoints
   - Fix: Specific endpoint only

**Conclusion**: **YES, needs full context** for resume/modification workflows.

---

## 3. Decision Criteria Analysis

### Migrate to Skill when:
- ✅ **Resume/modification workflows common**: YES - Adding pages/routes, modifying implementations
- ✅ **Needs existing code state**: YES - Must preserve existing implementations
- ✅ **Pattern-based work**: PARTIALLY - Has patterns BUT also requires complex implementation logic
- ⚠️ **Low iteration count**: MAYBE - Can be 1-3 turns for simple additions, but 5+ for complex features

### Keep as Subagent when:
- ✅ **Complex multi-turn reasoning required**: YES - Often needs 3-5 iterations with critic
- ⚠️ **Isolated context beneficial**: MAYBE - Writer-Critic pattern works with isolation
- ❌ **Initial generation only**: NO - Modifications are very common
- ⚠️ **Independent task execution**: PARTIALLY - Generates code but needs context

---

## 4. Key Differences from schema_designer and api_architect

| Aspect | schema_designer | api_architect | code_writer |
|--------|----------------|---------------|-------------|
| **Pattern Count** | 6 P0 | 5 P0 | 13+ patterns |
| **Pattern Content** | ~500 lines | ~800 lines | ~4,200 lines |
| **Complexity** | Low (schema rules) | Low (contract rules) | HIGH (full implementations) |
| **Iteration Count** | 1-2 | 1-2 | 3-5+ |
| **Context Needs** | YES | YES | YES |
| **Resume Common** | YES | YES | YES |
| **Writer-Critic** | No | No | YES (critical!) |

### Critical Difference: Writer-Critic Pattern

**code_writer uses Writer-Critic loop**:
```python
for iteration in range(5):
    # Writer generates code
    code = code_writer.generate()

    # Critic validates independently
    result = critic.validate(code)

    if result.decision == "complete":
        break
    elif result.decision == "continue":
        # Iterate with feedback
        continue
    else:
        # fail
        raise Error
```

**This requires**:
- **Isolated context** for critic to validate independently
- **Multiple turns** (3-5 iterations typical)
- **Subagent tool invocation** for orchestration

**Skills don't support this pattern** - skills are "learn patterns and apply", not "generate and iterate with critic".

---

## 5. Analyze Overlap with Pipeline-Prompt

### Search Results

```bash
grep -n "code_writer" docs/pipeline-prompt.md
```

Found 6 references:
1. Line 1625: Subagent list
2. Line 1647: Parallel opportunities
3. Line 1720: Delegation mandate
4. Line 1743: Route implementations delegation
5. Line 1795: Example delegation

### Overlap Assessment

**Pipeline-prompt has**:
- Generic guidance on when to delegate to code_writer
- NO implementation patterns (those are in docs/patterns/code_writer/)
- Basic orchestration instructions

**Pattern files have**:
- 4,212 lines of implementation details
- 13+ specific patterns with ✅/❌ examples
- Complete coding guidelines

**Redundancy**: **~5%** - Pipeline-prompt doesn't duplicate pattern content (unlike schema_designer/api_architect)

**Why**: code_writer is already properly separated - patterns in docs/patterns/, orchestration in pipeline-prompt.

---

## 6. Skill Size Feasibility

**Target skill size**: 250-500 lines
**Pattern content**: 4,212 lines

**To fit in skill**:
- Would need to cut **90%** of pattern content
- Would lose critical implementation details
- Patterns are already concise (no bloat)

**Options**:
1. **Create mega-skill** (4,000+ lines) - ❌ Too large, won't perform well
2. **Extract P0-only** (maybe 1,000 lines) - ⚠️ Still too large
3. **Keep as subagent** - ✅ Appropriate for complexity

---

## 7. Final Recommendation

### ❌ DO NOT MIGRATE code_writer to skill

**Reasons**:

1. **Writer-Critic Pattern Dependency**
   - Requires isolated context for independent validation
   - Needs multiple iterations (3-5 turns)
   - Skills don't support this orchestration pattern

2. **Pattern Volume Too Large**
   - 4,212 lines of pattern content
   - 13+ complex patterns with implementation details
   - Cannot be condensed to 250-500 lines without losing value

3. **Complexity Level**
   - Generates full implementations, not just specs
   - Requires complex reasoning about state, hooks, error handling
   - Higher iteration count than schema/API design

4. **Already Properly Separated**
   - Only 5% overlap with pipeline-prompt
   - Patterns already in dedicated files
   - No redundancy to eliminate

5. **Subagent Benefits Apply**
   - Complex multi-turn reasoning required ✅
   - Isolated context beneficial for Writer-Critic ✅
   - Independent task execution (within context) ✅

### Comparison with Migrated Subagents

| Criteria | schema_designer | api_architect | code_writer |
|----------|----------------|---------------|-------------|
| **Pattern-based** | ✅ YES | ✅ YES | ⚠️ PARTIAL |
| **Low complexity** | ✅ YES | ✅ YES | ❌ NO |
| **Low iteration** | ✅ YES | ✅ YES | ❌ NO (3-5+) |
| **Skill-size patterns** | ✅ 500 lines | ✅ 800 lines | ❌ 4,200 lines |
| **No orchestration** | ✅ YES | ✅ YES | ❌ NO (Writer-Critic) |
| **Pipeline overlap** | ✅ 65% | ✅ 82% | ❌ 5% |
| **Migrate?** | ✅ YES | ✅ YES | ❌ NO |

---

## 8. Alternative: Optimize Subagent Usage

Instead of migrating, **optimize how code_writer is used**:

### Current State
```python
# Main agent delegates to code_writer
Task("Implement users page", "Create client/src/pages/Users.tsx with...", "code_writer")
```

### Optimizations

1. **Reduce Context Passing**
   - code_writer should auto-read schemas, contracts, existing pages
   - Main agent doesn't need to pass all file contents

2. **Better Pattern References**
   - Ensure code_writer has access to all 16 pattern files
   - Update CORE_IDENTITY.md to reference specific patterns by name

3. **Improve Critic Feedback**
   - Critic should give specific pattern violations
   - Link to exact pattern file and line number

4. **Add Validation Script** (like schema/API)
   - Quick validation for common code patterns
   - Check ESM imports, no mock data, storage completeness

---

## 9. Recommended Actions

### DO (Improve Subagent)

1. **Create validation script**: `scripts/validate-code-quick.sh`
   - Check: ESM imports have .js extensions
   - Check: No mock/placeholder data in pages
   - Check: All storage methods implemented
   - Check: Pages use apiClient (not fetch)

2. **Ensure pattern access**: Verify code_writer can read all pattern files

3. **Update delegation guidance**: Clarify when to use code_writer vs other subagents

### DON'T (Migrate to Skill)

- ❌ Don't create code-writer skill (too large, wrong pattern)
- ❌ Don't try to condense 4,200 lines of patterns
- ❌ Don't break Writer-Critic pattern

---

## 10. Summary

**Decision**: ✅ **KEEP AS SUBAGENT**

**Why**:
- Complex implementation logic (not just pattern application)
- Writer-Critic orchestration required
- Pattern volume too large for skill (4,200 lines)
- Only 5% overlap with pipeline-prompt (no redundancy)
- Multi-turn iteration count (3-5+)

**Instead**: Optimize subagent with validation script and better pattern access

**Status**: Analysis complete. No migration planned.

---

## Comparison Table: All Subagents

| Subagent | Patterns | Lines | Overlap | Iterations | Writer-Critic | Decision |
|----------|----------|-------|---------|------------|---------------|----------|
| schema_designer | 6 P0 | 500 | 65% | 1-2 | No | ✅ MIGRATED |
| api_architect | 5 P0 | 800 | 82% | 1-2 | No | ✅ MIGRATED |
| code_writer | 13+ | 4,200 | 5% | 3-5+ | Yes | ❌ KEEP SUBAGENT |
| ui_designer | ? | ? | ? | ? | Yes | ⏸️ TBD |
| quality_assurer | ? | ? | ? | ? | No | ⏸️ TBD |
| error_fixer | ? | ? | ? | ? | No | ⏸️ TBD |

**Next Analysis**: ui_designer (also uses Writer-Critic, likely similar to code_writer)
