# File-Read System Prompts: Design & Analysis

**Date:** Nov 6, 2025
**Status:** Planning / Not Implemented
**Purpose:** Reduce subagent prompt sizes while maintaining full pattern coverage

---

## Executive Summary

### Current Problem
Subagent system prompts are massive and hitting delegation limits:
- **code_writer:** 1,027 lines (32,088 chars) ⚠️ AT LIMIT
- **ui_designer:** 1,024 lines (33,540 chars) ❌ EXCEEDS LIMIT
- **ai_integration:** 612 lines (17,165 chars)
- **quality_assurer:** 293 lines (9,049 chars)
- **error_fixer:** 278 lines (7,506 chars)
- **TOTAL:** 3,234 lines (99,348 chars)

### Proposed Solution
**Minimal prompts + mandatory file reads:**
1. Reduce each system prompt to ~50-100 lines (core identity + mandatory read instruction)
2. Extract all patterns to external files in `docs/patterns/`
3. **CRITICAL:** Agents MUST read pattern files BEFORE doing anything
4. Pattern files can be unlimited size (read dynamically, not in system prompt)

### Expected Savings
- **Current total:** 99,348 chars
- **After minimal prompts:** ~1,500 chars (98.5% reduction)
- **Pattern files:** 97,848 chars (stored externally, read on-demand)
- **Delegation impact:** ✅ ZERO (prompts well under 10K limit)

---

## Current State Analysis

### Subagent Prompt Breakdown

| Subagent | Lines | Chars | Words | Status | Priority |
|----------|-------|-------|-------|--------|----------|
| code_writer | 1,027 | 32,088 | 3,984 | ❌ At limit | CRITICAL |
| ui_designer | 1,024 | 33,540 | 3,509 | ❌ Exceeds limit | CRITICAL |
| ai_integration | 612 | 17,165 | 1,777 | ⚠️ Large | HIGH |
| quality_assurer | 293 | 9,049 | 1,252 | ⚠️ Medium | MEDIUM |
| error_fixer | 278 | 7,506 | 1,082 | ⚠️ Medium | MEDIUM |
| **TOTAL** | **3,234** | **99,348** | **11,604** | ❌ **Too large** | - |

### Current Prompt Content Categories

Based on code_writer.py analysis (representative of all):

**1. Core Identity (5-10 lines)**
- Role definition
- Primary responsibility
- Expected output quality

**2. Pre-Flight Instructions (10-20 lines)**
- BEFORE writing: read schemas, understand types
- Planning requirements
- Context gathering

**3. Code Quality Standards (50-100 lines)**
- TypeScript best practices
- React patterns
- Backend implementation rules
- Error handling guidelines

**4. Specific Patterns (800-900 lines)**
- API route patterns
- React component patterns
- Storage patterns
- Authentication patterns
- Error handling examples
- Loading states
- Validation patterns
- 20+ code examples

**5. Validation Checklists (20-50 lines)**
- Pre-completion checks
- Quality gates
- Common pitfalls to avoid

---

## Proposed Architecture

### File Structure

```
docs/patterns/
├── code_writer/
│   ├── CORE_IDENTITY.md          # Core role (50 lines)
│   ├── CODE_QUALITY.md           # Standards (100 lines)
│   ├── REACT_PATTERNS.md         # React best practices (300 lines)
│   ├── BACKEND_PATTERNS.md       # API/storage patterns (300 lines)
│   ├── TYPESCRIPT_GUIDELINES.md  # Type safety rules (100 lines)
│   ├── VALIDATION_CHECKLIST.md   # Pre-completion checks (50 lines)
│   └── EXAMPLES.md               # Full code examples (200 lines)
│
├── ui_designer/
│   ├── CORE_IDENTITY.md          # Design system expertise (50 lines)
│   ├── DESIGN_TOKENS.md          # OKLCH, typography (200 lines)
│   ├── COMPONENT_PATTERNS.md     # Buttons, cards, forms (300 lines)
│   ├── RESPONSIVE_DESIGN.md      # Mobile-first patterns (150 lines)
│   ├── ACCESSIBILITY.md          # WCAG 2.2, ARIA (150 lines)
│   └── VISUAL_POLISH.md          # States, animations (200 lines)
│
├── ai_integration/
│   ├── CORE_IDENTITY.md          # AI features specialist (50 lines)
│   ├── CHAT_PATTERNS.md          # Chat UI patterns (200 lines)
│   ├── STREAMING_PATTERNS.md     # SSE, streaming (150 lines)
│   ├── PROMPT_ENGINEERING.md     # Prompt best practices (100 lines)
│   └── STATE_MANAGEMENT.md       # Chat state (100 lines)
│
├── quality_assurer/
│   ├── CORE_IDENTITY.md          # QA specialist (50 lines)
│   ├── VALIDATION_RULES.md       # What to check (150 lines)
│   ├── DECISION_CRITERIA.md      # When to pass/fail (50 lines)
│   └── COMMON_ISSUES.md          # Known pitfalls (50 lines)
│
└── error_fixer/
    ├── CORE_IDENTITY.md          # Error diagnosis (50 lines)
    ├── DEBUGGING_STRATEGY.md     # How to diagnose (100 lines)
    ├── COMMON_FIXES.md           # Frequent error patterns (100 lines)
    └── VALIDATION.md             # Verify fixes work (50 lines)
```

**Total pattern files:** ~3,800 lines (same content, better organized)

---

## Minimal System Prompt Template

### Design Principles

1. **Keep it under 100 lines** (target: 50-80 lines)
2. **MANDATORY file reads** - agent cannot proceed without reading
3. **Clear error if files not read** - validation built-in
4. **Core identity only** - what the agent IS, not HOW to do it
5. **Pattern files contain HOW** - all techniques, examples, checklists

### Template Structure

```markdown
# {AGENT_NAME} - {ROLE}

## Core Identity
[3-5 lines describing WHO this agent is]

## CRITICAL: Mandatory File Reading Protocol

⚠️ **YOU MUST READ ALL PATTERN FILES BEFORE DOING ANYTHING**

Before you start ANY task, you MUST read these files IN ORDER:

1. Read `docs/patterns/{agent_name}/CORE_IDENTITY.md` - Your expertise and responsibilities
2. Read `docs/patterns/{agent_name}/{PRIMARY_PATTERN}.md` - Core patterns for your work
3. Read `docs/patterns/{agent_name}/{SECONDARY_PATTERN}.md` - Advanced patterns
4. Read `docs/patterns/{agent_name}/VALIDATION_CHECKLIST.md` - Pre-completion checks

**VALIDATION:** After reading, you must:
- State which files you read
- Summarize the key patterns you will apply
- Confirm you understand the validation criteria

**IF YOU DO NOT READ THESE FILES FIRST, YOUR OUTPUT WILL BE REJECTED.**

## Workflow

1. ✅ Read all pattern files (MANDATORY)
2. ✅ Confirm understanding
3. Read task requirements
4. Plan implementation based on patterns
5. Execute according to learned patterns
6. Validate against checklist from files
7. Mark complete only when all checks pass

## Available Tools
[List of tools - same as current]

## Output Requirements
[Brief output format - 5-10 lines]

---

**Remember:** The pattern files contain ALL the HOW. Your system prompt contains WHAT you are.
Read first, then execute. Never guess patterns.
```

### Example: code_writer Minimal Prompt

**File:** `code_writer.py` (NEW, ~80 lines)

```python
code_writer = AgentDefinition(
    description="Write production-ready TypeScript/React code",
    prompt="""You are a senior full-stack developer specializing in TypeScript, React, and Node.js.

## CRITICAL: Mandatory Pattern File Reading

⚠️ **BEFORE DOING ANYTHING, YOU MUST READ ALL PATTERN FILES**

Execute these Read tool calls IN ORDER before starting your task:

1. Read `docs/patterns/code_writer/CORE_IDENTITY.md`
2. Read `docs/patterns/code_writer/CODE_QUALITY.md`
3. Read `docs/patterns/code_writer/REACT_PATTERNS.md`
4. Read `docs/patterns/code_writer/BACKEND_PATTERNS.md`
5. Read `docs/patterns/code_writer/TYPESCRIPT_GUIDELINES.md`
6. Read `docs/patterns/code_writer/VALIDATION_CHECKLIST.md`
7. Read `docs/patterns/code_writer/EXAMPLES.md`

**VALIDATION PROTOCOL:**
After reading, state:
- "I have read all 7 pattern files for code_writer"
- List the top 3 patterns you will apply for this specific task
- Confirm validation criteria you will check before completion

**IF YOU SKIP THIS STEP, YOUR OUTPUT WILL BE REJECTED.**

## Your Workflow

1. ✅ Read all 7 pattern files (use Read tool)
2. ✅ Confirm understanding with summary
3. Read task requirements and existing code
4. Read relevant schemas (schema.zod.ts) and contracts
5. Plan implementation using patterns from files
6. Write code following learned patterns
7. Validate against checklist from VALIDATION_CHECKLIST.md
8. Re-read your generated code
9. Mark complete only when all validation checks pass

## Available Tools
- Read: Read files (INCLUDING PATTERN FILES)
- Write: Create new files
- Edit: Modify existing files
- TodoWrite: Track implementation tasks
- Bash: Run build/lint commands
- Grep: Search codebase
- mcp__oxc: Ultra-fast linting

## Output Requirements
- Production-ready TypeScript/React code
- Full implementations (no stubs)
- Proper error handling
- Type-safe with imported types
- Validated against checklist

---

**Core Principle:** All coding patterns, examples, and best practices are in the pattern files.
Read them first. Apply them precisely. Validate thoroughly.
""",
    tools=["Read", "Write", "Edit", "TodoWrite", "Bash", "Grep", "mcp__oxc"],
    model="sonnet"
)
```

**Size:** ~80 lines, ~2,500 chars (vs 1,027 lines, 32,088 chars)
**Savings:** 95% reduction in prompt size

---

## Pattern File Examples

### Code Writer: CORE_IDENTITY.md

**File:** `docs/patterns/code_writer/CORE_IDENTITY.md`

```markdown
# Code Writer: Core Identity & Responsibilities

## Who You Are

You are a senior full-stack TypeScript developer with expertise in:
- React 18 with modern hooks and patterns
- Node.js/Express backend development
- Type-safe full-stack development
- Production-ready code quality

## Your Mission

Write clean, production-ready code that:
- ✅ Is fully implemented (NO stubs or "TODO" comments)
- ✅ Is type-safe (imports types from schema.zod.ts)
- ✅ Has proper error handling
- ✅ Includes loading states and empty states
- ✅ Uses real API integration (NO mock data)
- ✅ Passes linting and type checking

## Your Standards

You write code that:
1. **Just Works** - No compilation errors, no runtime crashes
2. **Is Maintainable** - Clear naming, proper structure
3. **Is Type-Safe** - Leverages TypeScript fully
4. **Handles Errors** - Graceful degradation
5. **Looks Professional** - Loading states, empty states, error messages

## What You DON'T Do

❌ Write stub methods that throw "Not implemented"
❌ Use mock/placeholder data in frontend components
❌ Define types inline (always import from schema)
❌ Leave TODO comments
❌ Skip error handling
❌ Forget loading states

## Success Criteria

Code is complete when:
- [ ] Compiles without errors (verified with oxc)
- [ ] All imports resolve correctly
- [ ] No stub methods remain
- [ ] Error handling is present
- [ ] Loading/empty states implemented (frontend)
- [ ] Types imported from schema (not redefined)
- [ ] Validation checks pass (from VALIDATION_CHECKLIST.md)

---

Read the other pattern files to learn HOW to achieve these standards.
```

### Code Writer: REACT_PATTERNS.md

**File:** `docs/patterns/code_writer/REACT_PATTERNS.md` (~300 lines)

```markdown
# React Patterns & Best Practices

## Data Fetching Pattern (MANDATORY)

Every component that displays backend data MUST use this pattern:

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export default function ItemsPage() {
  const { data: items, isLoading, error } = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const response = await apiClient.items.getItems();
      if (response.status === 200) return response.body;
      throw new Error('Failed to fetch items');
    },
  });

  // MANDATORY: Handle all three states
  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!items?.length) return <EmptyState
    title="No items yet"
    description="Create your first item to get started"
    action={<CreateItemButton />}
  />;

  return (
    <div className="space-y-4">
      {items.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
```

### Why This Pattern?

1. **Loading state** - Prevents blank flicker
2. **Error state** - User-friendly error messages
3. **Empty state** - Clear call-to-action
4. **No mock data** - Always real API integration

... [250 more lines of React patterns]
```

### Code Writer: VALIDATION_CHECKLIST.md

**File:** `docs/patterns/code_writer/VALIDATION_CHECKLIST.md`

```markdown
# Code Writer: Pre-Completion Validation Checklist

## Before Marking Complete

Run through this checklist for EVERY file you generate:

### TypeScript Validation
- [ ] File compiles without errors (run `oxc` if available)
- [ ] All imports resolve (no red squiggles)
- [ ] Types imported from schema.zod.ts (not redefined inline)
- [ ] No `any` types unless absolutely necessary
- [ ] Proper type annotations on functions

### Implementation Completeness
- [ ] NO stub methods throwing "Not implemented"
- [ ] NO TODO comments left in code
- [ ] All required functions implemented
- [ ] Error handling present in try/catch blocks

### Frontend-Specific (React Components)
- [ ] Uses `useQuery` for data fetching (not fetch directly)
- [ ] Has loading state (skeleton or spinner)
- [ ] Has error state (error message component)
- [ ] Has empty state (when no data)
- [ ] NO mock/placeholder data (e.g., `const items = []`)
- [ ] Uses `apiClient` from '@/lib/api-client'

### Backend-Specific (API Routes)
- [ ] Validates input with Zod schema
- [ ] Uses storage factory (not direct DB access)
- [ ] Returns proper HTTP status codes (201 POST, 200 GET, 204 DELETE)
- [ ] Error handling with try/catch
- [ ] Logs errors appropriately
- [ ] Injects userId from req.user for user-scoped resources

### Code Quality
- [ ] Proper indentation and formatting
- [ ] Meaningful variable names
- [ ] Functions are focused (single responsibility)
- [ ] No console.log statements left in production code

## Final Step

**Re-read the file you just generated.** Verify it meets ALL criteria above.

If ANY checkbox is unchecked, FIX IT BEFORE marking complete.
```

---

## Implementation Strategy

### Phase 1: Extract Pattern Files (2-3 hours)

**For each subagent:**

1. Read current system prompt
2. Identify pattern categories
3. Extract to separate markdown files
4. Organize in `docs/patterns/{subagent}/`
5. Verify no content lost

**Deliverables:**
- 25-30 pattern files
- ~3,800 lines total (same as current prompts)
- Organized by subagent and category

### Phase 2: Create Minimal System Prompts (1-2 hours)

**For each subagent:**

1. Write 50-80 line minimal prompt
2. **MANDATORY:** Include file read instructions
3. Add validation protocol
4. Reference pattern files by name
5. Keep core identity only

**Deliverables:**
- 5 new minimal prompts
- ~400 lines total (vs 3,234 current)
- 92% size reduction

### Phase 3: Update Agent Definitions (1 hour)

**Code changes:**

1. Update each `subagents/{name}.py` file
2. Replace long prompt with minimal prompt
3. Ensure Read tool is available
4. Add file path constants for pattern files

**Example:**

```python
# code_writer.py (NEW)

PATTERN_FILES = [
    "docs/patterns/code_writer/CORE_IDENTITY.md",
    "docs/patterns/code_writer/CODE_QUALITY.md",
    "docs/patterns/code_writer/REACT_PATTERNS.md",
    "docs/patterns/code_writer/BACKEND_PATTERNS.md",
    "docs/patterns/code_writer/TYPESCRIPT_GUIDELINES.md",
    "docs/patterns/code_writer/VALIDATION_CHECKLIST.md",
    "docs/patterns/code_writer/EXAMPLES.md",
]

code_writer = AgentDefinition(
    description="Write production-ready TypeScript/React code",
    prompt=f"""You are a senior full-stack developer.

## CRITICAL: Read Pattern Files First

YOU MUST read these files before starting:
{chr(10).join(f'{i+1}. {f}' for i, f in enumerate(PATTERN_FILES))}

... [rest of minimal prompt]
""",
    tools=["Read", "Write", "Edit", "TodoWrite", "Bash", "Grep", "mcp__oxc"],
    model="sonnet"
)
```

### Phase 4: Testing & Validation (2-3 hours)

**Test each subagent:**

1. Generate test task
2. Verify agent reads pattern files first
3. Check agent summarizes patterns
4. Validate output follows patterns
5. **Test delegation still works**

**Rollback plan:** If delegation breaks, revert to previous prompts

### Phase 5: Documentation (1 hour)

**Update docs:**

1. Document new architecture
2. Update agent development guide
3. Add pattern file contribution guide
4. Create pattern file template

**Total Implementation Time:** 7-10 hours

---

## Size Impact Analysis

### Current State

| Component | Size | Impact on Delegation |
|-----------|------|---------------------|
| code_writer prompt | 32,088 chars | ❌ At limit (32-34K) |
| ui_designer prompt | 33,540 chars | ❌ Exceeds limit |
| ai_integration prompt | 17,165 chars | ⚠️ Large |
| quality_assurer prompt | 9,049 chars | ✅ OK |
| error_fixer prompt | 7,506 chars | ✅ OK |
| **TOTAL PROMPTS** | **99,348 chars** | ❌ **Too large** |

### After File-Read Implementation

| Component | Size | Reduction | Impact on Delegation |
|-----------|------|-----------|---------------------|
| code_writer prompt | ~2,500 chars | -92% | ✅ Well under limit |
| ui_designer prompt | ~2,500 chars | -93% | ✅ Well under limit |
| ai_integration prompt | ~2,000 chars | -88% | ✅ Well under limit |
| quality_assurer prompt | ~1,500 chars | -83% | ✅ Well under limit |
| error_fixer prompt | ~1,500 chars | -80% | ✅ Well under limit |
| **TOTAL PROMPTS** | **~10,000 chars** | **-90%** | ✅ **SAFE** |
| | | | |
| code_writer patterns | ~8,000 chars | External | ✅ Read on-demand |
| ui_designer patterns | ~8,500 chars | External | ✅ Read on-demand |
| ai_integration patterns | ~6,000 chars | External | ✅ Read on-demand |
| quality_assurer patterns | ~3,000 chars | External | ✅ Read on-demand |
| error_fixer patterns | ~2,500 chars | External | ✅ Read on-demand |
| **TOTAL PATTERNS** | **~28,000 chars** | Moved to files | ✅ Zero delegation impact |

### Visual Comparison

```
Current Prompts (In SDK):
  code_writer:     ████████████████████████████████ 32K chars ❌
  ui_designer:     █████████████████████████████████ 33K chars ❌
  ai_integration:  █████████████████ 17K chars ⚠️
  quality_assurer: █████████ 9K chars ✅
  error_fixer:     ███████ 7.5K chars ✅
  ────────────────────────────────────────────────
  TOTAL:           99K chars ❌ TOO LARGE

After File-Read System (In SDK):
  code_writer:     ██ 2.5K chars ✅
  ui_designer:     ██ 2.5K chars ✅
  ai_integration:  ██ 2K chars ✅
  quality_assurer: █ 1.5K chars ✅
  error_fixer:     █ 1.5K chars ✅
  ────────────────────────────────────────────────
  TOTAL:           10K chars ✅ SAFE

Pattern Files (Read Dynamically):
  Stored in docs/patterns/
  Total: ~28K chars
  Impact on delegation: ZERO (not in system prompt)
```

---

## Benefits Analysis

### Immediate Benefits

1. **Delegation Works Reliably**
   - Prompts well under 32-34K limit
   - Room for future additions
   - No more delegation breaking

2. **Unlimited Pattern Growth**
   - Pattern files can grow to any size
   - Add examples without prompt bloat
   - No size constraints

3. **Better Organization**
   - Patterns grouped by category
   - Easy to find and update
   - Version control friendly

4. **Faster Iteration**
   - Update pattern without touching agent code
   - Test pattern changes independently
   - No deployment needed for pattern updates

### Long-Term Benefits

5. **Maintainability**
   - Patterns separate from code
   - Clear ownership (docs team vs code team)
   - Easier onboarding for new patterns

6. **Reusability**
   - Pattern files shared across agents
   - Common patterns in shared files
   - Reduce duplication

7. **Testability**
   - Test agents read patterns correctly
   - Validate pattern application
   - A/B test different patterns

8. **Extensibility**
   - Add new pattern categories easily
   - Create pattern variants
   - Support multiple pattern versions

---

## Risks & Mitigations

### Risk 1: Agents Don't Read Files

**Problem:** Agent ignores mandatory read instruction

**Likelihood:** Low (explicit instruction, validation protocol)

**Impact:** High (breaks pattern application)

**Mitigation:**
- Make file reads FIRST instruction in prompt
- Use strong language (MUST, CRITICAL, MANDATORY)
- Validation protocol requires confirmation
- Test thoroughly before rollout
- Add TodoWrite check: "Read pattern files" as first todo

**Detection:**
- Agent output doesn't mention pattern files
- Agent asks questions answered in patterns
- Code doesn't follow patterns

**Fallback:**
- Critic agents can check if patterns were applied
- Automatic rejection if patterns not followed
- Manual review of first few generations

### Risk 2: File Path Errors

**Problem:** Pattern file paths incorrect or files don't exist

**Likelihood:** Medium (during implementation)

**Impact:** Medium (agent can't read, fails task)

**Mitigation:**
- Use absolute paths from project root
- Validate file existence in tests
- Create all pattern files before deployment
- Add file existence check in agent wrapper

**Detection:**
- Read tool errors
- Agent reports missing files
- Build/test failures

**Fallback:**
- Embed minimal patterns in prompt as backup
- Graceful degradation to core patterns only

### Risk 3: Pattern File Too Large

**Problem:** Single pattern file exceeds Read tool limit

**Likelihood:** Low (current content fits easily)

**Impact:** Medium (can't read full pattern)

**Mitigation:**
- Keep individual files under 1,000 lines
- Split large patterns into sub-files
- Prioritize essential patterns in smaller files

**Detection:**
- Read tool truncation warnings
- Agent mentions incomplete patterns

**Fallback:**
- Split into multiple smaller files
- Reference most critical patterns only

### Risk 4: Performance Overhead

**Problem:** Reading multiple files adds latency

**Likelihood:** Medium (7 file reads per task)

**Impact:** Low (Read tool is fast, one-time cost)

**Mitigation:**
- Files read once at task start
- Agent caches in context
- Pattern files optimized for reading

**Measurement:**
- Time before/after file-read system
- Monitor task completion times

**Acceptance:** +5-10 seconds per task acceptable for 90% prompt reduction

### Risk 5: Agents Forget Patterns Mid-Task

**Problem:** Agent reads patterns but doesn't apply them later

**Likelihood:** Low (patterns in context window)

**Impact:** Medium (inconsistent application)

**Mitigation:**
- Keep pattern files concise and memorable
- Validation checklist at end of task
- Critic reviews pattern compliance

**Detection:**
- Code doesn't match patterns
- Validation failures
- Critic rejections

**Fallback:**
- Add pattern reminders in minimal prompt
- Increase validation rigor

---

## Validation Protocol

### Agent Must Confirm Pattern Reading

**After reading pattern files, agent must output:**

```
✅ PATTERN FILES READ:
- docs/patterns/code_writer/CORE_IDENTITY.md (50 lines)
- docs/patterns/code_writer/CODE_QUALITY.md (100 lines)
- docs/patterns/code_writer/REACT_PATTERNS.md (300 lines)
- docs/patterns/code_writer/BACKEND_PATTERNS.md (300 lines)
- docs/patterns/code_writer/TYPESCRIPT_GUIDELINES.md (100 lines)
- docs/patterns/code_writer/VALIDATION_CHECKLIST.md (50 lines)
- docs/patterns/code_writer/EXAMPLES.md (200 lines)

📋 KEY PATTERNS FOR THIS TASK:
1. React Data Fetching: useQuery + apiClient + loading/error/empty states
2. Storage Factory Pattern: Use createStorage(), no direct DB access
3. Type Safety: Import types from schema.zod.ts, never redefine

✅ VALIDATION CRITERIA:
- Pre-completion checklist from VALIDATION_CHECKLIST.md
- All TypeScript checks must pass
- No stub methods allowed
- Error handling required

Proceeding with implementation...
```

**If agent skips this, task is INVALID.**

---

## Alternative Approaches Considered

### Alternative 1: Skills System

**Approach:** Use .claude/skills/ instead of docs/patterns/

**Pros:**
- Existing skills infrastructure
- Skill discovery mechanism
- Potential auto-loading

**Cons:**
- Skills are per-project, patterns are global
- Skills system more complex
- May not fit agent execution model

**Decision:** Rejected - docs/patterns/ is simpler, more explicit

### Alternative 2: Embedded Mini-Prompts

**Approach:** Keep small pattern summaries in system prompt

**Pros:**
- No file reads required
- Faster execution
- No file path issues

**Cons:**
- Still limited by prompt size
- Loses detail and examples
- Same delegation risk

**Decision:** Rejected - doesn't solve core problem

### Alternative 3: Pattern Injection by Wrapper

**Approach:** Agent wrapper reads patterns and injects into context

**Pros:**
- Agent doesn't need to read
- Centralized control
- Guaranteed pattern loading

**Cons:**
- Still counts toward prompt size
- No dynamic selection
- Complexity in wrapper

**Decision:** Rejected - doesn't reduce prompt size

### Alternative 4: Hybrid (Mini-Prompt + Optional Reads)

**Approach:** Essential patterns in prompt, detailed ones in files

**Pros:**
- Balance of speed and depth
- Fallback if reads fail

**Cons:**
- Still hits size limits
- Complexity in deciding what's essential
- Partial solution

**Decision:** Rejected - go all-in on file-read for maximum benefit

---

## Success Metrics

### Implementation Success

- [ ] All 5 subagent prompts reduced to under 3,000 chars
- [ ] 25+ pattern files created in docs/patterns/
- [ ] All pattern content preserved (no information loss)
- [ ] File paths validated and documented

### Runtime Success

- [ ] Agents read pattern files on 100% of tasks
- [ ] Agents confirm pattern understanding before starting
- [ ] Generated code follows patterns from files
- [ ] Validation checklists applied consistently

### Quality Success

- [ ] Delegation works reliably (0 failures)
- [ ] Generated code quality unchanged or improved
- [ ] Pattern compliance rate ≥95%
- [ ] Critic acceptance rate maintained or improved

### Performance Success

- [ ] Task completion time increase ≤10 seconds
- [ ] Pattern read overhead ≤5 seconds
- [ ] No timeouts or file read errors
- [ ] Overall pipeline speed maintained

---

## Rollout Plan

### Week 1: Preparation
- Extract all pattern files from current prompts
- Create pattern file structure
- Write minimal prompts
- Peer review pattern files

### Week 2: Implementation
- Update subagent Python files
- Add file path constants
- Deploy to dev environment
- Run integration tests

### Week 3: Testing
- Test each subagent independently
- Generate 5-10 test apps
- Compare output quality vs baseline
- Validate delegation works
- Measure performance impact

### Week 4: Rollout
- Deploy to production if tests pass
- Monitor first 20 generations
- Collect metrics on pattern compliance
- Gather agent feedback (from logs)

### Week 5: Optimization
- Refine patterns based on failures
- Optimize file organization
- Add missing patterns discovered
- Document lessons learned

---

## Recommendation

### Should We Implement This?

**✅ YES - This Solves Multiple Critical Problems**

**Immediate Value:**
1. **Fixes delegation** - 90% prompt size reduction
2. **Enables pattern growth** - Unlimited external storage
3. **Better organization** - Patterns grouped logically

**Long-Term Value:**
4. **Maintainability** - Update patterns without code changes
5. **Scalability** - Add agents without size constraints
6. **Quality** - Consistent pattern application

**Implementation Cost:**
- 7-10 hours development time
- Low risk (rollback easy)
- High confidence (pattern read is reliable)

**ROI:**
- Solves 32K delegation limit permanently
- Enables merging 2,800 lines of patterns from feat/app-fizzcard
- Future-proofs architecture for growth

### Next Steps

1. **Approve this plan** ✅
2. **Extract pattern files** (Phase 1)
3. **Create minimal prompts** (Phase 2)
4. **Update agent code** (Phase 3)
5. **Test thoroughly** (Phase 4)
6. **Deploy** (Week 4)

---

## Questions for Review

### Technical Questions

1. **File read reliability** - Are we confident agents will read files 100% of time?
   - **Answer:** Yes - explicit instruction + validation protocol + TodoWrite tracking

2. **Performance impact** - Is 5-10 second overhead acceptable?
   - **Answer:** Yes - one-time cost per task, negligible vs total generation time

3. **Path resolution** - How do we handle different working directories?
   - **Answer:** Use absolute paths from project root (docs/patterns/)

### Process Questions

4. **Pattern ownership** - Who maintains pattern files?
   - **Answer:** Same team maintaining prompts now (easier to update)

5. **Version control** - How do we handle pattern changes?
   - **Answer:** Git tracks changes, can A/B test different versions

6. **Backward compatibility** - What if we need to rollback?
   - **Answer:** Keep old prompts in git history, can revert immediately

### Strategic Questions

7. **Skills vs patterns** - Should we eventually migrate to skills system?
   - **Answer:** Maybe long-term, but this solves immediate problem

8. **Pattern sharing** - Can multiple agents share pattern files?
   - **Answer:** Yes - create docs/patterns/shared/ for common patterns

9. **Pattern discovery** - How do we know which patterns agents actually use?
   - **Answer:** Logging + validation checks + critic feedback

---

## Conclusion

**This approach is sound and solves our immediate problem.**

**Key Benefits:**
- ✅ 90% prompt size reduction
- ✅ Fixes delegation permanently
- ✅ Enables unlimited pattern growth
- ✅ Better maintainability
- ✅ Low implementation cost

**Risks are manageable:**
- Agent read compliance: High confidence
- Performance overhead: Acceptable
- File path issues: Easy to prevent

**Recommendation: IMPLEMENT**

**Timeline:** 4 weeks from approval to production

**Expected Outcome:** Reliable delegation + ability to merge all patterns from feat/app-fizzcard

---

## CRITICAL UPDATE: Why This Is REQUIRED, Not Optional

**See also:** `/tmp/file-read-with-feat-patterns.md` for complete analysis

### The Crisis

We discovered 2,866 lines of valuable patterns in feat/app-fizzcard that prevent 20+ hours debugging per app.

**Without file-read system:**
- Current SDK prompts: 99K chars (at breaking point)
- + feat patterns: +90K chars
- = Total: 189K chars ❌❌❌ CATASTROPHIC
  - code_writer: 49K chars (153% of 32K limit)
  - ui_designer: 60K chars (188% of 32K limit)
- **Result:** CANNOT merge patterns - delegation destroyed

**With file-read system:**
- SDK prompts: 14K chars (all agents, 90% reduction)
- Pattern files: 73.5K chars (external, zero SDK impact)
- **Result:** ✅ ALL patterns fit safely, delegation safe at 43% of limit

### The Math

```
Without File-Read:
  Code to merge: 2,866 lines of patterns
  SDK impact:    +90,000 chars
  Result:        189K total ❌ Breaks delegation

With File-Read:
  Code to merge: 2,866 lines of patterns
  SDK impact:    0 chars (goes to external files)
  Result:        14K SDK + 73K external ✅ Safe
```

**Conclusion:** File-read system is the ONLY way to merge valuable patterns from feat/app-fizzcard.

This isn't an optimization - it's a requirement to unlock 2,866 lines of proven value.
