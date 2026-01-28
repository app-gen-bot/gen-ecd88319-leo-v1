# Issues Log Design: Learning from Errors

**Date**: January 8, 2025
**Purpose**: Design a system for tracking errors and fixes during app generation
**Goal**: Enable retrospective analysis and pipeline improvement

---

## Executive Summary

**Problem**: We encounter errors during app generation but don't systematically track them for learning. Each error is a valuable data point for improving the pipeline, but we're losing that information.

**Solution**: Maintain a curated `issues_found.md` log that captures:
1. **What** went wrong (error details)
2. **Why** it happened (root cause)
3. **How** it was fixed (solution)
4. **Prevention** (how to avoid in future)

**Impact**: Creates a learning feedback loop → better prompts → fewer errors → faster generation

---

## Motivation

### Current State: Errors are Lost

```
Error occurs → Agent fixes it → Moves on → Error forgotten
                                              ↓
                                    LEARNING LOST ❌
```

**Problems**:
- Same errors occur repeatedly across different apps
- No systematic analysis of error patterns
- Pipeline improvements are ad-hoc, not data-driven
- New team members can't learn from past mistakes

### Proposed State: Errors Become Learning

```
Error occurs → Agent fixes it → Logs to issues_found.md
                                         ↓
                                 Retrospective analysis
                                         ↓
                            Pipeline/prompt improvements
                                         ↓
                              Fewer future errors ✅
```

**Benefits**:
- Systematic error pattern analysis
- Data-driven pipeline improvements
- Onboarding resource for new team
- Documentation of "gotchas" and solutions

---

## Design Principles

### 1. **Curated, Not Verbose**

❌ **Don't capture**: Every line of error log (that's in changelog)
✅ **Do capture**: Distilled insights and learnings

### 2. **Action-Oriented**

Every entry should answer: "What should we change in the pipeline to prevent this?"

### 3. **Categorized**

Group issues by type for pattern recognition:
- Schema/Database errors
- API contract mismatches
- Frontend build failures
- Authentication issues
- etc.

### 4. **Retrospective-Ready**

Format should enable easy analysis:
- Frequency of error types
- Common root causes
- Effectiveness of fixes
- Prevention opportunities

---

## Schema Design

### Location Options

#### Option A: Per-App Log (Recommended)

```
apps/my-app/
├── docs/
│   └── issues_found.md    ← Per-app issues
├── app/
└── plan/
```

**Pros**:
- Scoped to specific app (relevant context)
- Can compare across apps
- Doesn't pollute global namespace

**Cons**:
- Need aggregation for cross-app analysis

#### Option B: Global Log

```
apps/
├── .global-issues-log.md   ← All apps combined
├── my-app/
└── another-app/
```

**Pros**:
- Single place for all learnings
- Easy to analyze patterns

**Cons**:
- Loses per-app context
- Can become huge
- Hard to attribute to specific app

**Recommendation**: Use **Option A** (per-app) with a separate aggregation script for global analysis.

---

### File Format: `issues_found.md`

```markdown
# Issues Found During Generation

**App**: my-app
**Generation Started**: 2025-01-08T10:00:00
**Generation Completed**: 2025-01-08T15:30:00
**Total Issues**: 12
**Critical Issues**: 3

---

## Summary by Category

| Category | Count | Critical | Resolved |
|----------|-------|----------|----------|
| Schema/Database | 4 | 1 | 4 |
| API Contracts | 3 | 1 | 3 |
| Frontend Build | 2 | 0 | 2 |
| Authentication | 2 | 1 | 2 |
| TypeScript Types | 1 | 0 | 1 |

---

## Issues Log

### Issue #1: Drizzle Schema Snake_Case Mismatch

**Category**: Schema/Database
**Severity**: Critical
**Iteration**: 12
**Timestamp**: 2025-01-08T11:23:45

**What Happened**:
API routes were querying `userId` but database column was `user_id` (snake_case).
All queries returned empty results despite data existing.

**Error Signature**:
```
GET /api/campaigns returned [] (expected 5 campaigns)
Database: user_id (snake_case)
Code: userId (camelCase)
```

**Root Cause**:
Schema generator created tables with snake_case (Drizzle default), but API
client expected camelCase. Missing column name mapping in Drizzle config.

**How It Was Fixed**:
1. Added `casing: 'snake_case'` to Drizzle config
2. Used Drizzle's automatic camelCase ↔ snake_case conversion
3. Updated all queries to use camelCase (Drizzle handles translation)

**Time to Fix**: 25 minutes (error_fixer subagent)

**Prevention Opportunities**:
1. ⚠️ **Pipeline**: Schema generator should ALWAYS configure casing in drizzle.config.ts
2. ⚠️ **Validation**: Critic should check for casing configuration before approval
3. ⚠️ **Template**: Include casing config in base template
4. 💡 **Skill**: Create `drizzle-orm-setup` skill teaching this pattern (DONE)

**Related Issues**: None (first occurrence)

**Learnings**:
- Drizzle defaults to snake_case but doesn't auto-convert without config
- This will bite EVERY app unless we fix the pipeline
- Simple config addition prevents hours of debugging

---

### Issue #2: API Contract Path Double-Prefix

**Category**: API Contracts
**Severity**: Medium
**Iteration**: 15
**Timestamp**: 2025-01-08T12:10:33

**What Happened**:
Frontend making requests to `/api/api/users` instead of `/api/users`.
All API calls returning 404.

**Error Signature**:
```typescript
// Contract defined path as:
path: '/api/users'  // ❌ WRONG - includes mount point

// Server mounted as:
app.use('/api', router)  // Router already at /api

// Result:
/api + /api/users = /api/api/users  // 404
```

**Root Cause**:
Contract generator included `/api` prefix in paths. Server also mounts
contracts at `/api`. Double prefix breaks routing.

**How It Was Fixed**:
1. Changed all contract paths from `/api/users` → `/users`
2. Paths are relative to mount point (/api)
3. Updated API client to handle relative paths

**Time to Fix**: 15 minutes (error_fixer subagent)

**Prevention Opportunities**:
1. ⚠️ **Pipeline Prompt**: Add explicit instruction: "Contract paths NEVER include /api prefix"
2. ⚠️ **Critic**: Validate contract paths don't start with /api
3. ⚠️ **Example**: Add comment in pipeline-prompt.md showing correct pattern
4. 💡 **Validation**: Check contract paths in build stage before frontend generation

**Related Issues**: None

**Learnings**:
- Contract paths are relative to mount point (ts-rest pattern)
- This is a common mistake - needs prominent warning in prompts
- Simple validation could catch this immediately

---

### Issue #3: Supabase Connection String "Tenant Not Found"

**Category**: Database
**Severity**: Critical
**Iteration**: 8
**Timestamp**: 2025-01-08T10:45:12

**What Happened**:
Database connection failing with "Tenant or user not found" error.
Drizzle couldn't connect to Supabase at all.

**Error Signature**:
```
Error: Tenant or user not found
Connection string: postgresql://postgres.[ref]:[pwd]@...pooler.supabase.com:6543/postgres
Mode: Session pooler (port 6543)
```

**Root Cause**:
1. Using Session Mode pooler (port 6543) instead of Transaction Mode
2. Drizzle requires Transaction Mode for prepared statements
3. Password had special characters that weren't URL-encoded

**How It Was Fixed**:
1. Changed connection string to Transaction Mode:
   - Old: `...pooler.supabase.com:6543`
   - New: `...pooler.supabase.com:6543` (same port, different mode in Supabase UI)
2. URL-encoded password special characters
3. Added `?pgbouncer=true` parameter

**Time to Fix**: 45 minutes (multiple attempts, research subagent helped)

**Prevention Opportunities**:
1. ⚠️ **Pipeline Prompt**: Add Supabase connection string guidance
2. ⚠️ **Validation**: Check DATABASE_URL format before starting generation
3. 💡 **Documentation**: Create troubleshooting guide for Supabase connection
4. 💡 **Template**: Include .env.example with correct connection string format

**Related Issues**: None

**Learnings**:
- Supabase has TWO pooler modes: Session (doesn't work) vs Transaction (works)
- Transaction Mode required for Drizzle prepared statements
- This is CRITICAL - should be in bold in docs
- Special characters in passwords must be URL-encoded

---

[... more issues ...]

---

## Retrospective Analysis

### Most Common Issues (Top 3)

1. **Schema/Database** (4 occurrences)
   - Drizzle casing mismatch
   - Supabase connection failures
   - Missing foreign key constraints
   - Auto-injection field validation errors

2. **API Contracts** (3 occurrences)
   - Double /api prefix
   - Missing request body schemas
   - Response type mismatches

3. **Frontend Build** (2 occurrences)
   - Import path resolution (@/ vs relative)
   - Missing shadcn component dependencies

### Pattern Recognition

**Auto-Injection Fields Pattern** (2 occurrences):
- Issue #1: userId omitted from schema but required in database
- Issue #7: createdBy validation failing (not in request body)

**Root Cause**: Schema generator including auto-injected fields in insert schemas
**Prevention**: Update schema generator to ALWAYS omit userId/createdBy from insertSchemas

---

## Pipeline Improvement Recommendations

Based on issues found, here are HIGH-PRIORITY pipeline improvements:

### 1. Schema Generator Updates (Critical)

**Issues Fixed**: #1, #7, #9
**Priority**: HIGH
**Changes**:
```
- Add Drizzle casing config to all generated schemas
- Auto-omit userId/createdBy from insert schemas
- Add validation for auto-injection patterns
```

### 2. Contract Generator Validation (High)

**Issues Fixed**: #2, #5, #8
**Priority**: HIGH
**Changes**:
```
- Reject paths starting with /api
- Add critic check for path prefixes
- Include explicit path examples in prompt
```

### 3. Supabase Connection Documentation (High)

**Issues Fixed**: #3
**Priority**: HIGH
**Changes**:
```
- Add connection string format to pipeline prompt
- Create .env.example with correct format
- Add validation step before generation
```

### 4. Frontend Import Path Standardization (Medium)

**Issues Fixed**: #4, #10
**Priority**: MEDIUM
**Changes**:
```
- Always use @/ imports (never relative)
- Update tsconfig.json paths in template
- Critic validates import consistency
```

---

## Implementation Plan

### Phase 1: Logging Infrastructure (1-2 hours)

**Goal**: Start capturing issues automatically

1. **Create IssueLogger class**
   ```python
   class IssueLogger:
       def __init__(self, app_path: str):
           self.issues_file = Path(app_path).parent / "docs" / "issues_found.md"
           self.issues = []

       def log_issue(
           self,
           category: str,
           severity: str,
           description: str,
           error_signature: str,
           root_cause: str,
           fix_applied: str,
           prevention: list,
           time_to_fix: int
       ):
           # Log issue with all details
           pass

       def generate_retrospective(self):
           # Analyze patterns and generate recommendations
           pass
   ```

2. **Integration Points**:
   - Reprompter: Detects errors from logs, prompts for logging
   - error_fixer subagent: Logs after successful fix
   - Main agent: Logs critical issues during generation

### Phase 2: Automatic Error Detection (2-3 hours)

**Goal**: Detect common error patterns automatically

1. **Error Pattern Matching**:
   ```python
   ERROR_PATTERNS = {
       "drizzle_casing": {
           "signature": r"(userId|createdBy).*not found",
           "category": "Schema/Database",
           "likely_cause": "Drizzle casing mismatch"
       },
       "api_prefix": {
           "signature": r"/api/api/",
           "category": "API Contracts",
           "likely_cause": "Double /api prefix in paths"
       },
       # ... more patterns
   }
   ```

2. **Smart Suggestions**:
   - Match error to pattern
   - Suggest likely fix based on past issues
   - Prompt for confirmation and details

### Phase 3: Retrospective Analysis (3-4 hours)

**Goal**: Generate insights from issue logs

1. **Aggregation Script**:
   ```python
   # Collect all issues_found.md files
   # Analyze patterns across apps
   # Generate pipeline improvement recommendations
   ```

2. **Dashboard**:
   ```
   === Global Issues Analysis ===

   Total Apps: 50
   Total Issues: 247
   Critical Issues: 38

   Most Common Issues:
   1. Drizzle casing (18 apps, 23 occurrences)
   2. API prefix double (12 apps, 15 occurrences)
   3. Supabase connection (8 apps, 10 occurrences)

   Pipeline Improvements Applied:
   ✅ Schema generator: Auto-configure casing
   ✅ Contract validator: Check path prefixes
   ⏳ Supabase guide: In progress
   ```

---

## Integration with Reprompter

### Error Detection Flow

```
Iteration N: Error occurs
    ↓
Reprompter reads error logs
    ↓
Pattern matching: Is this a known error type?
    ↓
YES: Suggest known fix + prompt to log
NO: Delegate to error_fixer + prompt to log after fix
    ↓
Issue logged to issues_found.md
    ↓
Continue generation
```

### Reprompter Prompt Addition

```python
# Add to reprompter system prompt:

## ISSUE LOGGING

When you encounter an error during generation:

1. **Detect Pattern**: Check if error matches known patterns
2. **Delegate Fix**: Use error_fixer subagent to diagnose and fix
3. **Log Issue**: After fix, log to issues_found.md with:
   - Clear description of what happened
   - Root cause (if known)
   - How it was fixed
   - Ideas for prevention
   - Time spent debugging

Format:
- Category: Schema/Database, API Contracts, Frontend Build, etc.
- Severity: Critical (blocks generation), High (major delay), Medium (minor delay)
- Prevention opportunities marked with ⚠️ (pipeline) or 💡 (idea)

**Goal**: Build a learning database to improve the pipeline over time.

Example log entry:
```
### Issue #5: Missing shadcn Component Dependency

**Category**: Frontend Build
**Severity**: Medium
**Iteration**: 18

**What Happened**: Button component imported lucide-react icons but package not installed.

**Root Cause**: shadcn add didn't detect icon usage and install lucide-react.

**Fix**: Ran `npm install lucide-react`

**Prevention**:
- ⚠️ Pipeline: shadcn generator should auto-install lucide-react when adding components
- 💡 Validation: Check imports match installed packages before approval
```
```

---

## Example Issues Log (Full)

See [issues_found_example.md](./issues_found_example.md) for a complete example
with 12 issues from a real generation session.

Key sections:
- Summary by category
- Individual issue entries
- Pattern recognition
- Pipeline improvement recommendations

---

## Metrics for Success

### Short-term (Per App)

- ✅ Issues logged within 5 minutes of fix
- ✅ Root cause identified for >80% of issues
- ✅ Prevention ideas documented for >70% of issues
- ✅ Retrospective generated at end of generation

### Medium-term (Across Apps)

- ✅ Same issue occurs in <20% of new apps (down from baseline)
- ✅ Time to fix common issues decreases by 50%
- ✅ At least 3 pipeline improvements implemented per 10 apps

### Long-term (Pipeline Evolution)

- ✅ Critical issues down 80% (through pipeline improvements)
- ✅ Total generation time down 30% (fewer errors to fix)
- ✅ New team members onboard 50% faster (using issues as learning resource)

---

## Risks & Mitigations

### Risk 1: Logging Overhead Slows Generation

**Mitigation**:
- Make logging async (non-blocking)
- Keep prompts concise (suggest format, don't force verbosity)
- Auto-populate what we can (timestamp, iteration, category)

### Risk 2: Logs Become Verbose Like Changelogs

**Mitigation**:
- Focus on LEARNINGS, not just "what happened"
- Template enforces concise format
- Reprompter summarizes before logging (not raw error text)

### Risk 3: Issues Not Actually Used for Improvement

**Mitigation**:
- Schedule monthly retrospectives (mandatory)
- Pipeline improvements tied to issue analysis
- Track "issues resolved through pipeline changes" metric

---

## Alternative Approaches Considered

### Option A: Structured JSON Instead of Markdown

**Pros**: Easier to parse, aggregate, analyze
**Cons**: Not human-readable, harder for retrospectives
**Verdict**: Keep Markdown for readability, add JSON export if needed

### Option B: Issue Tracking System (Jira/GitHub Issues)

**Pros**: Rich tooling, searchable, trackable
**Cons**: Heavyweight, context-switching, overhead
**Verdict**: Too heavy for this use case, Markdown is sufficient

### Option C: Automatic Pipeline Fixing (Self-Improving System)

**Pros**: Fully automated improvement loop
**Cons**: Complex, risky (could make things worse), needs validation
**Verdict**: Future goal, start with human-in-loop retrospectives

---

## Implementation Checklist

### Week 1: Foundation

- [ ] Create `IssueLogger` class in reprompter module
- [ ] Add issue logging prompts to reprompter system prompt
- [ ] Create `issues_found.md` template
- [ ] Test with one app manually

### Week 2: Integration

- [ ] Integrate with error_fixer subagent
- [ ] Add error pattern matching
- [ ] Auto-populate known issues
- [ ] Test with 3-5 apps

### Week 3: Analysis

- [ ] Create aggregation script
- [ ] Generate first cross-app analysis
- [ ] Identify top 3 pipeline improvements
- [ ] Implement first improvement

### Week 4: Iteration

- [ ] Measure impact of first improvement
- [ ] Refine logging prompts based on usage
- [ ] Add more error patterns
- [ ] Schedule monthly retrospectives

---

## Next Steps

1. **Review this design** with team
2. **Approve schema** for issues_found.md
3. **Assign developer** for Phase 1 implementation
4. **Create feature branch**: `feature/reprompter-issues-log`
5. **Implement Phase 1** (logging infrastructure)
6. **Test with 1 app** and iterate

---

## Appendix: Sample Issue Categories

```
Schema/Database:
- Drizzle casing mismatches
- Foreign key constraint failures
- Auto-injection field errors
- Migration issues

API Contracts:
- Path prefix errors (/api/api)
- Request/response type mismatches
- Missing validation schemas
- Contract-route misalignment

Frontend Build:
- Import path resolution
- Missing dependencies
- Type errors
- Build tool config issues

Authentication:
- Token validation failures
- Middleware ordering
- Session handling
- Role/permission errors

Storage Layer:
- Query failures
- Factory initialization
- Mode switching (memory/database)
- Connection pooling

Integration:
- API-frontend mismatches
- Schema-contract drift
- Contract-storage inconsistencies
```

---

**Document Version**: 1.0
**Last Updated**: January 8, 2025
**Status**: Design complete - Ready for implementation
**Estimated Implementation**: 1-2 weeks (3 phases)
