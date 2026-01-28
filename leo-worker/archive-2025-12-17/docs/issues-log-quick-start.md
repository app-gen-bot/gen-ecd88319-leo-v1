# Issues Log: Quick Start Implementation Guide

**Goal**: Add issue logging to reprompter in 1-2 hours
**Result**: Start capturing learnings immediately

---

## Quick Integration (Minimal Changes)

### Step 1: Add to Reprompter System Prompt (15 min)

File: `src/app_factory_leonardo_replit/agents/reprompter/prompts.py`

Add this section after line 151:

```python
REPROMPTER_SYSTEM_PROMPT = """
[... existing prompt ...]

## CRITICAL: ISSUE LOGGING FOR LEARNING

When you detect an error during generation (from error logs or changelog):

### When to Log an Issue

Log when you see:
- Error patterns in dev server logs (500 errors, build failures, etc.)
- Repeated fix attempts (same error 2+ times)
- Complex debugging (>10 minutes to fix)
- Pattern that could be prevented in pipeline

### What to Log

Create entry in `{app_path}/../docs/issues_found.md`:

```markdown
### Issue #{number}: {Brief Title}

**Category**: Schema/Database | API Contracts | Frontend Build | Authentication | etc.
**Severity**: Critical | High | Medium | Low
**Iteration**: {current iteration}
**Time to Fix**: {minutes}

**What Happened**: [One sentence - what broke?]

**Root Cause**: [Why did it happen?]

**How It Was Fixed**: [What solution worked?]

**Prevention**:
- ⚠️ PIPELINE: [How to fix in pipeline/prompt]
- 💡 IDEA: [Other prevention ideas]

**Related Issues**: #{previous issue if pattern}
```

### Issue Categories

- **Schema/Database**: Drizzle, SQL, migrations, foreign keys
- **API Contracts**: Path prefixes, type mismatches, contract-route alignment
- **Frontend Build**: TypeScript, imports, dependencies
- **Authentication**: Tokens, middleware, sessions
- **Integration**: API-frontend mismatches, schema drift

### Severity Guidelines

- **Critical**: Blocks generation completely (database connection, auth broken)
- **High**: Major feature broken (all API calls fail, build broken)
- **Medium**: Single feature broken (one endpoint, one page)
- **Low**: Minor issue (styling, edge case)

### Example

```markdown
### Issue #1: Drizzle Casing Mismatch

**Category**: Schema/Database
**Severity**: Critical
**Iteration**: 12
**Time to Fix**: 25 minutes

**What Happened**: All API queries returning [] despite database having data.

**Root Cause**: Database uses snake_case (user_id) but code uses camelCase (userId).
No column mapping configured in drizzle.config.ts.

**How It Was Fixed**: Added `casing: "snake_case"` to drizzle.config.ts.

**Prevention**:
- ⚠️ PIPELINE: Schema generator should ALWAYS add casing config
- 💡 IDEA: Validate drizzle.config.ts has casing before approval
```

### When to Delegate to error_fixer

If you see an error in logs:
1. First, delegate to **error_fixer** to diagnose and fix
2. After error_fixer reports success, prompt main agent to log the issue
3. Use error_fixer's findings to populate root cause and fix

### Frequency Tracking

If you see the same error type again:
- Note it as "Related Issues: #{previous}"
- Mark severity higher if it's a repeat
- Flag for URGENT pipeline fix if 3+ apps hit same issue

"""
```

---

### Step 2: Create Template File (5 min)

Add to template or create on first use:

File: `apps/{app-name}/docs/issues_found.md`

```markdown
# Issues Found During Generation

**App**: {app-name}
**Generation Started**: {timestamp}
**Status**: In Progress

---

## Summary by Category

| Category | Count | Critical | Avg Fix Time |
|----------|-------|----------|--------------|
| (populated at end) | - | - | - |

---

## Issues Log

(Issues will be added here as they occur)

---

## Retrospective Analysis

(Generated at end of generation)
```

---

### Step 3: Update Reprompter to Create File (10 min)

File: `src/app_factory_leonardo_replit/agents/reprompter/agent.py`

Add method after `get_next_prompt()`:

```python
def _ensure_issues_log_exists(self) -> Path:
    """
    Ensure issues_found.md exists, create if needed.

    Returns:
        Path to issues_found.md
    """
    docs_dir = Path(self.app_path).parent / "docs"
    docs_dir.mkdir(exist_ok=True)

    issues_file = docs_dir / "issues_found.md"

    if not issues_file.exists():
        # Get app name from path
        app_name = Path(self.app_path).parent.name

        # Create initial file
        content = f"""# Issues Found During Generation

**App**: {app_name}
**Generation Started**: {datetime.now().isoformat()}
**Status**: In Progress

---

## Summary by Category

| Category | Count | Critical | Avg Fix Time |
|----------|-------|----------|--------------|
| (will be populated at end) | - | - | - |

---

## Issues Log

(Issues will be added here as they occur)

---

## Retrospective Analysis

(Will be generated at end of generation)
"""
        issues_file.write_text(content)
        logger.info(f"📋 Created issues log: {issues_file}")

    return issues_file
```

Add to `__init__()`:

```python
def __init__(self, app_path: str):
    # ... existing code ...

    # Ensure issues log exists
    self.issues_log_path = self._ensure_issues_log_exists()
```

---

### Step 4: Prompt for Logging (5 min)

Update `get_next_prompt()` to include issues log context:

```python
async def get_next_prompt(self, ...) -> str:
    # ... existing code ...

    # Build user message
    user_message = f"""
Analyze the current state and generate the next development task prompt.

## RECENT WORK (Changelog)
{context['latest_changelog']}

## RECENT ERRORS
{context['error_logs']}

## ISSUES LOG
Path: {self.issues_log_path}
Use this to track patterns and learnings.

When you detect an error being fixed:
1. Note the error type and fix
2. Consider if it's worth logging (>10min fix, pattern, preventable)
3. If yes, mention in your prompt: "Log this issue to issues_found.md"

[... rest of existing prompt ...]
"""
```

---

## That's It! (Minimal Version)

With these changes:
1. ✅ Reprompter is aware of issue logging
2. ✅ Issues log file is created automatically
3. ✅ Reprompter can suggest logging in its prompts
4. ✅ Main agent can manually log issues

**Time**: ~35 minutes
**Impact**: Start capturing learnings immediately

---

## Enhanced Version (Optional - Add Later)

### Add IssueLogger Helper Class (30 min)

File: `src/app_factory_leonardo_replit/agents/reprompter/issue_logger.py`

```python
"""
Issue logger for tracking errors and fixes during generation.
"""

import json
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, List

class IssueLogger:
    """
    Logs issues to issues_found.md for retrospective analysis.
    """

    def __init__(self, app_path: str):
        self.app_path = app_path
        self.docs_dir = Path(app_path).parent / "docs"
        self.issues_file = self.docs_dir / "issues_found.md"
        self.issues_count = 0

        # Ensure file exists
        self._ensure_file_exists()

    def _ensure_file_exists(self):
        """Create issues_found.md if it doesn't exist."""
        self.docs_dir.mkdir(exist_ok=True)

        if not self.issues_file.exists():
            app_name = Path(self.app_path).parent.name
            content = f"""# Issues Found During Generation

**App**: {app_name}
**Generation Started**: {datetime.now().isoformat()}
**Status**: In Progress

---

## Issues Log

"""
            self.issues_file.write_text(content)

    def log_issue(
        self,
        title: str,
        category: str,
        severity: str,
        iteration: int,
        what_happened: str,
        root_cause: str,
        how_fixed: str,
        prevention: List[str],
        time_to_fix: Optional[int] = None,
        related_issues: Optional[List[int]] = None
    ):
        """
        Log a single issue to the markdown file.

        Args:
            title: Brief title (e.g., "Drizzle Casing Mismatch")
            category: Schema/Database, API Contracts, etc.
            severity: Critical, High, Medium, Low
            iteration: Which iteration this occurred
            what_happened: One sentence description
            root_cause: Why it happened
            how_fixed: What solution worked
            prevention: List of prevention ideas
            time_to_fix: Minutes to fix (optional)
            related_issues: List of issue numbers (optional)
        """
        self.issues_count += 1

        # Build issue entry
        entry = f"""
### Issue #{self.issues_count}: {title}

**Category**: {category}
**Severity**: {severity}
**Iteration**: {iteration}
"""

        if time_to_fix:
            entry += f"**Time to Fix**: {time_to_fix} minutes\n"

        entry += f"""
**What Happened**: {what_happened}

**Root Cause**: {root_cause}

**How It Was Fixed**: {how_fixed}

**Prevention**:
"""
        for p in prevention:
            entry += f"- {p}\n"

        if related_issues:
            entry += f"\n**Related Issues**: {', '.join(f'#{i}' for i in related_issues)}\n"

        entry += "\n---\n"

        # Append to file
        current_content = self.issues_file.read_text()
        # Insert before "## Retrospective" if exists, otherwise append
        if "## Retrospective" in current_content:
            parts = current_content.split("## Retrospective")
            new_content = parts[0] + entry + "\n## Retrospective" + parts[1]
        else:
            new_content = current_content + entry

        self.issues_file.write_text(new_content)

        return self.issues_count

    def get_issue_count(self) -> int:
        """Return number of issues logged."""
        return self.issues_count
```

Usage in reprompter:

```python
from .issue_logger import IssueLogger

class SimpleReprompter:
    def __init__(self, app_path: str):
        # ... existing code ...
        self.issue_logger = IssueLogger(app_path)

    # Main agent can call:
    # issue_logger.log_issue(
    #     title="Drizzle Casing Mismatch",
    #     category="Schema/Database",
    #     ...
    # )
```

---

## Testing the Integration (10 min)

### 1. Manual Test

```python
# In Python console
from src.app_factory_leonardo_replit.agents.reprompter.issue_logger import IssueLogger

logger = IssueLogger("apps/test-app/app")

logger.log_issue(
    title="Test Issue",
    category="Schema/Database",
    severity="Medium",
    iteration=5,
    what_happened="Testing the logger",
    root_cause="Manual test",
    how_fixed="Called log_issue()",
    prevention=["⚠️ PIPELINE: Add validation", "💡 IDEA: Auto-detect pattern"],
    time_to_fix=10
)

# Check file
# cat apps/test-app/docs/issues_found.md
```

### 2. Test with Reprompter

```python
# Run reprompter on existing app
reprompter = create_reprompter("apps/dadcoin/app")

# Check that issues_found.md was created
# ls apps/dadcoin/docs/issues_found.md
```

---

## Usage Workflow

### During Generation

1. **Reprompter detects error** (from logs or changelog)
2. **Delegates to error_fixer** to diagnose and fix
3. **After fix**, reprompter's next prompt says:
   > "The userId casing issue was fixed by adding Drizzle config.
   > This took 25 minutes and should be logged to issues_found.md
   > as it's preventable in the pipeline."

4. **Main agent** can then manually log:
   ```
   Use the issue_logger to log this Drizzle casing issue with:
   - Category: Schema/Database
   - Severity: Critical
   - Prevention: Add casing config in schema generator
   ```

### At End of Generation

1. Read all issues from issues_found.md
2. Generate retrospective analysis:
   - Patterns found
   - Pipeline improvements recommended
   - Time savings if fixes implemented

---

## What You Get

After implementing this:

1. **Immediate**: Start capturing learnings in issues_found.md
2. **Per App**: Track all errors and fixes with context
3. **Cross-App**: Analyze patterns across multiple apps
4. **Pipeline Improvements**: Data-driven decisions about what to fix

**Example After 10 Apps**:
```
Most Common Issues:
1. Drizzle casing (8 apps) → Fixed in pipeline → Now 0 occurrences
2. API prefix double (6 apps) → Fixed in pipeline → Now 0 occurrences
3. Supabase connection (4 apps) → Added validation → Now caught pre-generation

Total Debug Time Saved: 15h (1.5h per app × 10 apps)
```

---

## Next Steps

1. **Implement minimal version** (35 min) → Start logging today
2. **Use for 3-5 apps** → Build up examples
3. **Analyze patterns** → Find top 3 issues
4. **Fix pipeline** → Implement top 3 fixes
5. **Measure impact** → Validate time savings
6. **Add enhanced version** → Automate logging (optional)

---

## Success Metrics

After 1 month:
- ✅ 10+ apps with issues_found.md
- ✅ 50+ issues logged total
- ✅ Top 5 patterns identified
- ✅ 3+ pipeline improvements implemented
- ✅ 30%+ reduction in debug time

---

**Time to Implement**: 35 min (minimal) or 1-2 hours (enhanced)
**Time to Value**: Immediate (first app with issues log)
**ROI**: Massive (each pipeline fix saves 15-45 min per future app)

---

**Ready to Start?**

1. Add system prompt text → 15 min
2. Create template file → 5 min
3. Update reprompter agent → 15 min
4. Test with one app → 10 min

**Total**: 45 minutes to start capturing learnings! 🚀
