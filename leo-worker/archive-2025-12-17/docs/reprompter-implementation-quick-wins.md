# Reprompter Quick Wins: Implementation Guide

**Focus**: High-impact, low-effort improvements (Phase 1)
**Timeline**: 1-2 days
**Expected Impact**: 60-70% context reduction

---

## Quick Win #1: Task History Compression (1 hour)

### Current Problem
```python
# agent.py:196-200 - Stores FULL prompts forever
session["reprompter_context"]["task_history"].append({
    "task": task,  # ← 2000+ characters per task!
    "success": success,
    "timestamp": datetime.now().isoformat()
})
```

**After 50 iterations**: 50 × 2000 chars = 100,000 chars ≈ 25K tokens 🔥

### Solution: Smart Task Summarization

```python
# agent.py - REPLACE record_task method

def record_task(self, task: str, success: bool):
    """
    Track task in session with smart compression.

    Strategy:
    - Last 5 tasks: Keep full detail (for loop detection)
    - Older tasks: Keep only summary + key changes
    """
    session_file = Path(self.app_path) / ".agent_session.json"

    try:
        if session_file.exists():
            session = json.loads(session_file.read_text())
        else:
            session = {}

        if "reprompter_context" not in session:
            session["reprompter_context"] = {"task_history": []}

        task_history = session["reprompter_context"]["task_history"]

        # Compress older tasks (keep only last 5 at full detail)
        if len(task_history) >= 5:
            # Compress the oldest full task to summary
            oldest = task_history[0]
            if "full_task" in oldest and oldest["full_task"]:
                # Extract key info before compressing
                oldest["task_summary"] = oldest["task"][:100] + "..."
                oldest["key_changes"] = self._extract_key_changes(oldest["task"])
                del oldest["full_task"]  # Remove full task to save space

        # Add new task
        task_history.append({
            "task": task[:100] + "...",  # Short summary for recent view
            "full_task": task,  # Keep full for last 5 tasks
            "key_changes": self._extract_key_changes(task),
            "success": success,
            "timestamp": datetime.now().isoformat()
        })

        session_file.write_text(json.dumps(session, indent=2))
        logger.info(f"📝 Recorded task (success={success})")

    except Exception as e:
        logger.warning(f"⚠️  Failed to record task: {e}")

def _extract_key_changes(self, task: str) -> list:
    """
    Extract key changes from a task prompt.

    Simple heuristics:
    - Look for delegate patterns ("delegate to X")
    - Extract main action verbs (fix, add, implement, test)
    - Identify file/component names
    """
    changes = []

    # Extract subagent delegations
    if "error_fixer" in task.lower():
        changes.append("error_fixer: debugging")
    if "quality_assurer" in task.lower():
        changes.append("quality_assurer: testing")
    if "code" in task.lower() and "subagent" in task.lower():
        changes.append("code: implementation")
    if "research" in task.lower():
        changes.append("research: investigation")

    # Extract action keywords (first 3 only)
    actions = []
    for verb in ["fix", "add", "implement", "test", "refactor", "optimize", "deploy"]:
        if verb in task.lower():
            actions.append(verb)
    changes.extend(actions[:3])

    return changes[:5]  # Max 5 items
```

### Expected Results

**Before**:
```json
{
  "task_history": [
    {"task": "[2000 chars...]", "success": true},
    {"task": "[2000 chars...]", "success": true},
    ... 50 tasks = 100K chars
  ]
}
```

**After**:
```json
{
  "task_history": [
    // Older task (compressed)
    {
      "task_summary": "Base Sepolia deployed (5 contracts, 35/35 tests...",
      "key_changes": ["quality_assurer: testing", "research: investigation", "deploy"],
      "success": true
    },
    // Recent task (full detail)
    {
      "task": "Commit session changes. Delegate QA to quality_assurer...",
      "full_task": "[2000 chars for loop detection]",
      "key_changes": ["quality_assurer: testing", "test"],
      "success": true
    }
  ]
}
```

**Savings**: 50 tasks × (2000 - 150) chars = 92,500 chars saved ≈ **23K tokens saved** 🎉

---

## Quick Win #2: Changelog Smart Limits (30 minutes)

### Current Problem
```python
# context_gatherer.py:66-67 - Reads ENTIRE latest file
if i == 0:
    content.append(f"=== {f.name} (FULL - latest session) ===\n{f.read_text()}")
```

**Example**: `summary-001.md` = 1111 lines = **5,500 tokens** 🔥

### Solution: Hard Limit on Latest File

```python
# context_gatherer.py - MODIFY _read_latest_changelog

def _read_latest_changelog(self, app_path: str) -> str:
    """
    Read recent changelog entries with HARD LIMITS.

    Strategy:
    - Latest file: Last 300 lines (was: unlimited)
    - Older files: Last 100 lines (was: 200)
    """
    app_path_obj = Path(app_path)

    # Try summary_changes/ first
    summary_dir = app_path_obj.parent / "summary_changes"
    if summary_dir.exists():
        max_entries = CONTEXT_CONFIG["max_changelog_entries"]  # 3
        files = sorted(summary_dir.glob("summary-*.md"), reverse=True)[:max_entries]

        if files:
            content = []
            max_lines_latest = 300  # ← HARD LIMIT (was: unlimited)
            max_lines_older = 100   # ← REDUCED (was: 200)

            for i, f in enumerate(files):
                try:
                    all_lines = f.read_text().splitlines()

                    if i == 0:
                        # Latest file: Last 300 lines (recent work)
                        if len(all_lines) > max_lines_latest:
                            truncated_lines = all_lines[-max_lines_latest:]
                            preview = "\n".join(truncated_lines)
                            content.append(
                                f"=== {f.name} (last {max_lines_latest} lines - latest) ===\n{preview}"
                            )
                        else:
                            content.append(f"=== {f.name} (latest) ===\n{f.read_text()}")
                    else:
                        # Older files: Last 100 lines only
                        if len(all_lines) > max_lines_older:
                            truncated_lines = all_lines[-max_lines_older:]
                            preview = "\n".join(truncated_lines)
                            content.append(
                                f"=== {f.name} (last {max_lines_older} lines - older) ===\n{preview}"
                            )
                        else:
                            content.append(f"=== {f.name} (older) ===\n{f.read_text()}")
                except Exception as e:
                    content.append(f"=== {f.name} ===\nError reading: {e}")

            return "\n\n".join(content)

    # Fallback to changelog/ (same limits)
    # ... (apply same 300/100 line limits)
```

### Expected Results

**Before**:
```
summary-001.md: 1111 lines (full)    = 5,500 tokens
summary-002.md: last 200 lines       = 1,000 tokens
summary-003.md: last 200 lines       = 1,000 tokens
                              Total  = 7,500 tokens
```

**After**:
```
summary-001.md: last 300 lines       = 1,500 tokens
summary-002.md: last 100 lines       =   500 tokens
summary-003.md: last 100 lines       =   500 tokens
                              Total  = 2,500 tokens
```

**Savings**: 7,500 - 2,500 = **5,000 tokens saved** 🎉

---

## Quick Win #3: Concise Prompt Instruction (15 minutes)

### Current Problem

Reprompter generates verbose prompts (2000+ chars) with lots of filler words.

### Solution: Add Conciseness Instructions

```python
# prompts.py - ADD to system prompt after line 52

REPROMPTER_SYSTEM_PROMPT = """
[... existing prompt ...]

## CRITICAL: PROMPT CONCISENESS

Your prompts MUST be concise (300-500 characters max). Use these compression techniques:

### 1. Remove Adjectives & Filler
❌ BAD:  "DADCOIN has achieved a remarkable milestone"
✅ GOOD: "DADCOIN completed"

❌ BAD:  "The perfect moment to conduct validation"
✅ GOOD: "Validate now"

### 2. Use Symbols & Abbreviations
❌ BAD:  "successfully deployed to Base Sepolia testnet"
✅ GOOD: "deployed to Base Sepolia ✓"

❌ BAD:  "followed by quality assurance testing"
✅ GOOD: "→ quality_assurer testing"

### 3. Arrow Notation for Flows
❌ BAD:  "First signup, then create wallet, then setup family"
✅ GOOD: "signup → wallet → family setup"

### 4. Bullet Points Over Prose
❌ BAD:  "Test the parent onboarding, verify quest creation, and check store redemptions"
✅ GOOD:
• Parent onboarding
• Quest creation
• Store redemptions

### 5. Remove Redundancy
❌ BAD:  "comprehensive quality assurance review... exhaustive production readiness validation"
✅ GOOD: "QA review"

### EXAMPLE CONCISE PROMPT (389 chars):

"Base Sepolia deployed (5 contracts, 35/35 tests ✓). Commit session changes.

Delegate QA to **quality_assurer**:
• Parent onboarding → CDP wallet → family
• Quest approval → DAD mint → BaseScan ✓
• Store redemption → DAD burn
• Zero console errors

If issues: **error_fixer** → re-test
If clean: **research** mainnet plan"

### YOUR OUTPUT MUST:
- Be 300-500 characters (hard limit)
- Use symbols (✓, →, •)
- Remove all adjectives
- Use abbreviations (QA, not "quality assurance")
- Natural prose OR bullets (your choice)
- NO numbered lists

[... rest of existing prompt ...]
"""
```

### Expected Results

**Before**: 1,847 characters (verbose)
**After**: 389 characters (concise)
**Savings**: **79% reduction** 🎉

---

## Quick Win #4: Plan File Headers Only (30 minutes)

### Current Problem
```python
# context_gatherer.py:145-154 - Reads first 200 lines of each plan file
if len(all_lines) > max_lines:
    preview_lines = all_lines[:max_lines]
```

**Problem**: First 200 lines might include verbose details we don't need.

### Solution: Extract Headers Only

```python
# context_gatherer.py - MODIFY _read_plan_files

def _read_plan_files(self, app_path: str) -> str:
    """
    Read plan files (headers only for quick reference).

    Strategy:
    - Extract H1, H2, H3 headers (structure)
    - Include short description under each header
    - Full file available via Read tool if needed
    """
    app_path_obj = Path(app_path)
    plan_dir = app_path_obj.parent / "plan"

    if not plan_dir.exists():
        specs_dir = app_path_obj / "specs"
        if specs_dir.exists():
            plan_dir = specs_dir
        else:
            return "No plan files found."

    files = list(plan_dir.glob("*.md"))[:CONTEXT_CONFIG["max_plan_files"]]

    if not files:
        return "No plan files found."

    content = []

    for f in files:
        try:
            headers = self._extract_markdown_headers(f)
            content.append(f"=== {f.name} (structure) ===\n{headers}\n\n[Read {f} for full details]")
        except Exception as e:
            content.append(f"=== {f.name} ===\nError reading: {e}")

    return "\n\n".join(content)

def _extract_markdown_headers(self, file_path: Path) -> str:
    """
    Extract H1, H2, H3 headers with first sentence of each section.

    Example output:
    # App Vision
    Family rewards economy teaching financial literacy.

    ## Features
    ### Quest System
    Parents create quests, kids complete for DAD tokens.

    ### Store Redemptions
    Kids spend DAD tokens on rewards.
    """
    lines = file_path.read_text().splitlines()
    headers = []
    current_header = None
    sentence_captured = False

    for line in lines:
        # Check if line is a header
        if line.startswith("#"):
            # Add current header if exists
            if current_header:
                headers.append(current_header)

            current_header = line
            sentence_captured = False

        # Capture first sentence after header
        elif current_header and not sentence_captured and line.strip():
            # First non-empty line after header
            first_sentence = line.strip().split('.')[0] + '.'
            current_header += f"\n{first_sentence}"
            sentence_captured = True

    # Add last header
    if current_header:
        headers.append(current_header)

    return "\n\n".join(headers)
```

### Expected Results

**Before**: First 200 lines × 5 files = **5,000 tokens**

**After**: Headers only × 5 files = **500 tokens**

Example output:
```
=== plan.md (structure) ===

# DADCOIN - Family Rewards Economy
Blockchain-powered app teaching kids financial literacy through quests.

## Core Features
Parents create quests, kids earn DAD tokens, redeem at family store.

### Quest System
Create, assign, approve quests with on-chain DAD minting.

### Store Redemptions
Burn DAD tokens for real-world rewards.

## Technical Architecture
Base L2, Coinbase CDP wallets, ERC-20 tokens.

[Read /Users/.../plan/plan.md for full details]
```

**Savings**: 5,000 - 500 = **4,500 tokens saved** 🎉

---

## Combined Impact Summary

```
Quick Win                   | Current  | After    | Savings
──────────────────────────────────────────────────────────────
Task History Compression    | 10,000 T |  2,500 T |  7,500 T (75%)
Changelog Smart Limits      |  7,500 T |  2,500 T |  5,000 T (67%)
Concise Prompts            |  (chars) |  (chars) |   (79% shorter)
Plan File Headers Only      |  5,000 T |    500 T |  4,500 T (90%)
──────────────────────────────────────────────────────────────
TOTAL CONTEXT              | 22,500 T |  5,500 T | 17,000 T (76%)
```

**Overall Context Reduction**: **76%** (22.5K → 5.5K tokens)

**Time Investment**: ~3 hours of coding
**ROI**: Massive - enables 4x more iterations before context issues

---

## Implementation Checklist

### Step 1: Code Changes (2 hours)

- [ ] Update `agent.py:record_task()` with compression logic
- [ ] Add `agent.py:_extract_key_changes()` helper method
- [ ] Update `context_gatherer.py:_read_latest_changelog()` with 300/100 limits
- [ ] Update `context_gatherer.py:_read_plan_files()` with header extraction
- [ ] Add `context_gatherer.py:_extract_markdown_headers()` helper method
- [ ] Update `prompts.py` with conciseness instructions

### Step 2: Testing (30 minutes)

- [ ] Test with existing app (dadcoin or similar)
- [ ] Verify task history compresses correctly
- [ ] Verify changelogs limited to 300/100 lines
- [ ] Verify plan headers extracted properly
- [ ] Verify prompts are concise (300-500 chars)
- [ ] Check backward compatibility (old session files)

### Step 3: Validation (30 minutes)

- [ ] Run 10 iterations and measure context size
- [ ] Verify context stays under 8K tokens
- [ ] Verify prompt quality (not too terse)
- [ ] User review: "Are prompts still clear?"
- [ ] Performance check: No significant latency increase

### Step 4: Rollout

- [ ] Create feature branch: `feature/reprompter-quick-wins`
- [ ] Commit changes with message: "Reprompter quick wins: 76% context reduction"
- [ ] Create PR with before/after metrics
- [ ] Get team review
- [ ] Merge to main
- [ ] Update documentation

---

## Rollback Plan (If Issues Occur)

### If prompts are too terse:
```python
# prompts.py - Adjust target length
# Change: "300-500 characters (hard limit)"
# To:     "400-600 characters"
```

### If losing important context:
```python
# context_gatherer.py - Increase limits
max_lines_latest = 500  # Was: 300
max_lines_older = 150   # Was: 100
```

### If task history causes loops:
```python
# agent.py - Keep more full tasks
if len(task_history) >= 10:  # Was: 5
    # Compress older tasks
```

**Safety**: All changes are in 3 files, easy to revert:
- `agent.py`
- `context_gatherer.py`
- `prompts.py`

---

## Before/After Examples

### Example 1: Task History

**Before** (100 chars shown, actual 2000+):
```json
{
  "task": "Looking at the current state, DADCOIN has achieved a remarkable milestone...",
  "success": true,
  "timestamp": "2025-01-08T10:00:00"
}
```

**After**:
```json
{
  "task_summary": "DADCOIN: Base Sepolia deployed, 35/35 tests passed, QA needed",
  "key_changes": ["quality_assurer: testing", "deploy", "test"],
  "success": true,
  "timestamp": "2025-01-08T10:00:00"
}
```

### Example 2: Generated Prompt

**Before** (1847 chars):
```
Looking at the current state, DADCOIN has achieved a remarkable milestone with all
five smart contracts successfully deployed to Base Sepolia testnet and comprehensive
end-to-end testing showing 35/35 tests passed. The git status shows only minor
uncommitted changes...
[continues for 1700 more characters]
```

**After** (389 chars):
```
Base Sepolia deployed (5 contracts, 35/35 tests ✓). Commit session changes.

Delegate QA to **quality_assurer**:
• Parent onboarding → CDP wallet → family
• Quest approval → DAD mint → BaseScan ✓
• Store redemption → DAD burn

If issues: **error_fixer** → re-test
If clean: **research** mainnet plan
```

### Example 3: Plan File Context

**Before** (200 lines, ~1000 tokens):
```
=== plan.md ===
# DADCOIN - Family Rewards Economy

## Vision
DADCOIN is a revolutionary family rewards economy platform that leverages
blockchain technology to teach kids about financial responsibility through
a gamified quest system where parents create educational tasks...
[continues for 195 more lines]
```

**After** (10 lines, ~100 tokens):
```
=== plan.md (structure) ===

# DADCOIN - Family Rewards Economy
Blockchain app teaching kids financial literacy.

## Quest System
Parents create quests, kids earn DAD tokens.

## Store Redemptions
Kids spend DAD on rewards.

[Read /Users/.../plan/plan.md for full details]
```

---

## Next Steps After Quick Wins

Once Phase 1 is deployed and validated:

### Phase 2: Strategic Layer (Week 2)
- Implement `StrategicAdvisor` class
- Add alignment scoring
- Create `.strategic_memory.json` schema

### Phase 3: LLM-Based Compression (Week 3)
- Add Haiku-based changelog summarization
- Implement progressive session summarization
- Add context budget manager

**For Now**: Focus on Phase 1 quick wins - 76% reduction with 3 hours of work!

---

**Document Version**: 1.0
**Last Updated**: January 8, 2025
**Implementation Status**: Ready for coding
**Estimated Time**: 3 hours total
