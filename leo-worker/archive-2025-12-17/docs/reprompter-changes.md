# Reprompter Strategic Improvements Plan

## Executive Summary

Transform the reprompter from a purely **reactive** system (looks at what was done, decides next step) to a **strategic** system that:

1. **Operates in two distinct modes**: NEW (fresh app) vs RESUME (continue with specific task)
2. **Enforces written plans in RESUME mode** - Non-trivial tasks require TASK_PLAN.md
3. **Senses MVP readiness** - Detects when core features are built and app is deployable
4. **Enforces UI/UX quality** - Verifies the ui-designer skill was followed
5. **Triggers deployment** - Knows when to deploy so users can start using the app
6. **Orchestrates testing** - Runs comprehensive tests at the right time

**Key Principles**:
- NO hardcoded iteration counts - All transitions are **signal-based**
- RESUME mode: The resume prompt intent is the ONLY goal
- NEW mode: Build → UI Quality → Stabilize → Deploy → Test → Iterate

**Master Plan Document**: `docs/reprompter-master-plan.md` - Read into system prompt for easy modification

---

## Problem Statement

### Current Behavior

The reprompter currently:
1. Reads recent changelog, plan files, errors, git status, task history
2. Asks LLM to generate next tactical task
3. Has no concept of "where we are" in the app lifecycle
4. Doesn't know when to trigger testing, deployment, or verification
5. **Never checks UI/UX quality** - apps can have generic, ugly interfaces
6. **No distinction between NEW and RESUME modes** - treats all tasks the same
7. **No written plans for complex RESUME tasks** - ad-hoc execution leads to incomplete work
8. **Context gap with main agent** - Rebuilds context from scratch instead of inheriting session

### Context Gap Analysis

The main agent and reprompter have a significant context gap:

| Context Source | Main Agent | Reprompter | Gap |
|----------------|-----------|------------|-----|
| Pipeline Prompt (85K) | ✅ Full system prompt | ❌ Only 199L subagent patterns | Major |
| Session Context (`app_name`, `features`, `entities`) | ✅ Full dict | ❌ Only task_history | Major |
| CLAUDE.md (architecture) | ✅ Generates it | ❌ Doesn't read it | Major |
| Working Directory | ✅ Set to app_path | ❌ Project root | Minor |
| Generation Context | ✅ Rich dict with original_request | ❌ Not passed | Major |
| Git Context | ✅ Full access | ✅ git diff shown | OK |
| Changelog | ✅ Full history | ✅ Last 300 lines | OK |

**Root Cause**: Reprompter rebuilds context from scratch each iteration instead of inheriting the rich `generation_context` that main agent maintains.

---

## Bridging the Context Gap

### Solution: Context Inheritance

The reprompter should inherit the same context the main agent has, not rebuild it from scratch.

### Implementation Steps

#### 1. Read Full Session File (NOT Just task_history)

**Key Insight**: The reprompter already reads `.agent_session.json` but ONLY extracts `reprompter_context.task_history`. The rich `context` dict with `app_name`, `features`, `entities`, `original_request` is **already in the same file** - we just need to read it!

**Current** (`context_gatherer.py` line 249-277):
```python
def _get_recent_tasks(self, app_path: str) -> str:
    session = json.loads(session_file.read_text())
    reprompter_context = session.get("reprompter_context", {})
    task_history = reprompter_context.get("task_history", [])
    # ONLY reads task_history, ignores session["context"]!
```

**Fix** - Add new method to read full session context:

**File**: `src/app_factory_leonardo_replit/agents/reprompter/context_gatherer.py`

```python
def _read_session_context(self, app_path: str) -> str:
    """
    Read the FULL session context from .agent_session.json.

    This includes app_name, features, entities, original_request -
    the same rich context the main agent uses!
    """
    session_file = Path(app_path) / ".agent_session.json"

    if not session_file.exists():
        return "No session context available."

    try:
        session = json.loads(session_file.read_text())

        # Extract the rich context (same as main agent uses!)
        context = session.get("context", {})

        if not context:
            return "Session exists but no context stored."

        # Format for reprompter consumption
        lines = [
            f"App Name: {context.get('app_name', 'Unknown')}",
            f"Original Request: {context.get('original_request', 'Not recorded')[:200]}...",
            f"Features: {', '.join(context.get('features', [])[:10])}",
            f"Entities: {', '.join(context.get('entities', [])[:10])}",
            f"Last Action: {context.get('last_action', 'Unknown')}",
            f"Last Modified: {context.get('last_modified', 'Unknown')}",
        ]

        return "\n".join(lines)

    except Exception as e:
        return f"Error reading session context: {e}"

def gather_context(self, app_path: str) -> Dict[str, str]:
    """Return context as plain text strings."""
    return {
        'session_context': self._read_session_context(app_path),  # NEW!
        'latest_changelog': self._read_latest_changelog(app_path),
        'plan_files': self._read_plan_files(app_path),
        'error_logs': self._read_error_logs(app_path),
        'git_status': self._run_git_status(app_path),
        'recent_tasks': self._get_recent_tasks(app_path),
    }
```

**No changes needed to app_generator/agent.py** - the context is already being saved, we just need to read it!

#### 2. Read CLAUDE.md in Context Gatherer

**File**: `src/app_factory_leonardo_replit/agents/reprompter/context_gatherer.py`

```python
def _read_claude_md(self, app_path: str) -> str:
    """
    Read CLAUDE.md for architecture overview.

    The main agent generates this file with:
    - Entities and tech stack
    - Key files and directories
    - Recent changes
    - Development commands
    """
    claude_md = Path(app_path) / "CLAUDE.md"

    if not claude_md.exists():
        return "No CLAUDE.md found."

    try:
        content = claude_md.read_text()
        # Limit to 5000 chars to avoid token bloat
        if len(content) > 5000:
            return content[:5000] + "\n\n[Truncated - read full file for details]"
        return content
    except Exception as e:
        return f"Error reading CLAUDE.md: {e}"

def gather_context(self, app_path: str) -> Dict[str, str]:
    """Return context as plain text strings."""
    return {
        'session_context': self._read_session_context(app_path),  # NEW!
        'claude_md': self._read_claude_md(app_path),              # NEW!
        'latest_changelog': self._read_latest_changelog(app_path),
        'plan_files': self._read_plan_files(app_path),
        'error_logs': self._read_error_logs(app_path),
        'git_status': self._run_git_status(app_path),
        'recent_tasks': self._get_recent_tasks(app_path),
    }
```

#### 3. Read Master Plan into System Prompt

**File**: `src/app_factory_leonardo_replit/agents/reprompter/agent.py`

```python
def _load_master_plan(self) -> str:
    """Load the reprompter master plan for system prompt."""
    # Path relative to this file: agents/reprompter/agent.py
    # Go up to src/, then to docs/
    master_plan_path = Path(__file__).parent.parent.parent.parent.parent / "docs" / "reprompter-master-plan.md"
    if master_plan_path.exists():
        return master_plan_path.read_text()
    return ""
```

Then in the system prompt construction, include the master plan:
```python
system_prompt = f"""
{REPROMPTER_SYSTEM_PROMPT}

## Strategic Master Plan

{self._load_master_plan()}
"""
```

### Context Flow After Changes

```
┌─────────────────────────────────────────────────────────────────┐
│               MAIN AGENT COMPLETES ITERATION                    │
│                                                                 │
│  Saves to .agent_session.json:                                 │
│    • session_id                                                │
│    • context: {app_name, features, entities, original_request} │
│    • reprompter_context: {task_history}                        │
│                                                                 │
│  Also maintains: CLAUDE.md (architecture overview)             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Files on disk (no explicit passing!)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 REPROMPTER READS FROM DISK                      │
│                                                                 │
│  .agent_session.json:                                          │
│    • session_context (app_name, features, entities, etc.) NEW! │
│    • task_history (existing)                                   │
│                                                                 │
│  CLAUDE.md: Architecture overview                         NEW! │
│  reprompter-master-plan.md: Strategic guidance            NEW! │
│  changelog, errors, git status: (existing)                     │
│                                                                 │
│  NOW HAS: Same context awareness as main agent                 │
│  NO EXPLICIT PASSING REQUIRED - just read the files!           │
└─────────────────────────────────────────────────────────────────┘
```

**Key Insight**: The main agent already saves everything to `.agent_session.json`. The reprompter just needs to read the FULL file, not just `task_history`!

### Benefits

| Before | After |
|--------|-------|
| Reprompter rebuilds context each time | Inherits rich session context |
| Doesn't know app name/features | Knows app_name, features, entities |
| No pipeline stage awareness | Has master plan with all stages |
| Ignores CLAUDE.md | Reads architecture overview |
| Generic prompts | Context-aware, targeted prompts |
| "Disconnected" feeling | Seamlessly continues from main agent |

### What's Missing

| Gap | Impact |
|-----|--------|
| Mode detection | NEW vs RESUME require different strategies |
| Written plans (RESUME) | Complex tasks get partially completed, intent not satisfied |
| Intent tracking (RESUME) | Reprompter doesn't know when the resume task is actually done |
| MVP detection | Apps keep building features forever, never deploy |
| UI/UX quality gate | Generic "AI slop" aesthetics, forgettable interfaces |
| Deployment trigger | Users can't start using the app early |
| Testing orchestration | No systematic testing before/after deployment |

---

## NEW vs RESUME Mode Architecture

### Mode Detection

```python
class ModeDetector:
    """Detect whether we're in NEW or RESUME mode."""

    def detect_mode(self, app_path: str, context: dict) -> str:
        """
        Detect operating mode based on how app-generator was started.

        Returns: "NEW" or "RESUME"
        """
        # Check for resume indicators
        agent_session = Path(app_path) / ".agent_session.json"

        if agent_session.exists():
            session_data = json.loads(agent_session.read_text())
            # If there's a last_action that looks like a resume prompt
            last_action = session_data.get("context", {}).get("last_action", "")
            if last_action and not self._is_initial_generation(last_action):
                return "RESUME"

        # Check if app structure already exists (resume into existing app)
        has_schema = (Path(app_path) / "shared/schema.ts").exists()
        has_routes = (Path(app_path) / "server/routes").exists()
        has_pages = (Path(app_path) / "client/src/pages").exists()

        if has_schema and has_routes and has_pages:
            # Existing app - likely RESUME mode
            return "RESUME"

        return "NEW"

    def _is_initial_generation(self, prompt: str) -> bool:
        """Check if prompt looks like initial app generation."""
        initial_keywords = ["create", "build", "generate", "new app", "application that"]
        return any(kw in prompt.lower() for kw in initial_keywords)
```

### RESUME Mode: Intent-Driven Execution

**The resume prompt contains a specific intent that MUST be completely satisfied.**

```
RESUME Mode Lifecycle:

1. UNDERSTAND_INTENT
   └─ Parse resume prompt, identify what user actually wants

2. ASSESS_COMPLEXITY
   ├─ Trivial: Single file, clear change → Execute directly
   └─ Non-trivial: Multi-file, schema changes → Require written plan

3. CREATE_PLAN (non-trivial only)
   └─ Prompt agent to create docs/TASK_PLAN_{unique_id}.md with:
      • Objective statement
      • Files to modify
      • Numbered execution steps
      • Verification criteria
      • Rollback plan
   └─ Each resume task gets its own plan file (preserves history)

4. EXECUTE_PLAN
   └─ Track completion of each step
   └─ Prompt agent with next uncompleted step
   └─ Enforce pipeline best practices

5. VERIFY_COMPLETION
   └─ All plan steps done
   └─ Typecheck passes
   └─ Build passes
   └─ Original intent satisfied
```

### RESUME Mode: Plan Enforcement

```python
class ResumePlanTracker:
    """Track and enforce execution of task plans in docs/TASK_PLAN_*.md"""

    def __init__(self, app_path: str):
        self.app_path = app_path
        self.docs_path = Path(app_path) / "docs"

    def get_current_plan_path(self) -> Optional[Path]:
        """Find the most recent task plan file."""
        if not self.docs_path.exists():
            return None
        plans = sorted(self.docs_path.glob("TASK_PLAN_*.md"), reverse=True)
        return plans[0] if plans else None

    def create_plan_path(self, task_summary: str) -> Path:
        """Generate unique plan path for a new task."""
        from datetime import datetime
        # Sanitize task summary for filename
        safe_name = "".join(c if c.isalnum() else "_" for c in task_summary[:30])
        unique_id = f"{datetime.now().strftime('%Y%m%d_%H%M')}_{safe_name}"
        self.docs_path.mkdir(exist_ok=True)
        return self.docs_path / f"TASK_PLAN_{unique_id}.md"

    def plan_exists(self) -> bool:
        return self.get_current_plan_path() is not None

    def parse_plan(self) -> dict:
        """Parse current task plan into structured format."""
        plan_path = self.get_current_plan_path()
        if not plan_path:
            return None

        content = plan_path.read_text()
        # Parse sections: Objective, Files, Steps, Verification, Rollback
        return self._parse_sections(content)

    def get_completed_steps(self, changelog: str) -> List[int]:
        """Determine which plan steps have been completed based on changelog."""
        plan = self.parse_plan()
        if not plan:
            return []

        completed = []
        for i, step in enumerate(plan.get("steps", [])):
            if self._step_appears_done(step, changelog):
                completed.append(i + 1)

        return completed

    def get_next_step(self, changelog: str) -> Optional[dict]:
        """Get the next uncompleted step."""
        plan = self.parse_plan()
        if not plan:
            return None

        completed = set(self.get_completed_steps(changelog))
        for i, step in enumerate(plan.get("steps", [])):
            if (i + 1) not in completed:
                return {"number": i + 1, "description": step}

        return None  # All steps complete

    def generate_continuation_prompt(self, changelog: str) -> str:
        """Generate prompt for continuing plan execution."""
        plan = self.parse_plan()
        plan_path = self.get_current_plan_path()
        completed = self.get_completed_steps(changelog)
        next_step = self.get_next_step(changelog)

        if not next_step:
            return self._generate_verification_prompt(plan)

        return f"""## TASK PROGRESS

**Plan**: {plan_path.name if plan_path else 'Unknown'}
**Objective**: {plan.get('objective', 'See plan file')}

**Completed Steps**: {completed if completed else 'None yet'}
**Current Step**: {next_step['number']}. {next_step['description']}

**NEXT ACTION**: Execute step {next_step['number']}

Remember:
- Follow the plan exactly
- Run `npm run typecheck` after code changes
- Verify step completion before moving on
- Maintain type safety throughout

Pipeline reminders:
- Schema changes → Update contracts → Update API client
- New routes → Must have corresponding contract
- Frontend → Use generated API client, not raw fetch
"""
```

### RESUME Mode: Trivial vs Non-Trivial Detection

```python
class TaskComplexityAnalyzer:
    """Analyze resume prompt to determine if task is trivial."""

    TRIVIAL_INDICATORS = [
        "fix typo", "rename", "change text", "update label",
        "add comment", "remove unused", "change color",
        "adjust padding", "fix spacing"
    ]

    NON_TRIVIAL_INDICATORS = [
        "add feature", "implement", "create", "refactor",
        "migrate", "integrate", "authentication", "api",
        "database", "schema", "multiple", "all pages"
    ]

    def is_trivial(self, resume_prompt: str) -> bool:
        """Determine if task is trivial (skip written plan)."""
        prompt_lower = resume_prompt.lower()

        # Check for non-trivial indicators first
        for indicator in self.NON_TRIVIAL_INDICATORS:
            if indicator in prompt_lower:
                return False

        # Check for trivial indicators
        for indicator in self.TRIVIAL_INDICATORS:
            if indicator in prompt_lower:
                return True

        # Default to non-trivial (safer to plan)
        return False
```

---

## Core Philosophy: Signal-Based Phase Transitions

**NO HARDCODED ITERATION COUNTS**

Apps vary wildly in complexity:
- Simple CRUD app: MVP in 3-5 iterations
- Complex multi-entity app: MVP in 15-20 iterations
- AI-integrated app: MVP in 25-30 iterations

**The reprompter must SENSE readiness, not count iterations.**

### Signal Detection Categories

```
┌────────────────────────────────────────────────────────────────┐
│                     SIGNAL CATEGORIES                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  1. BUILD COMPLETENESS SIGNALS                                │
│     • Schema implemented (shared/schema.ts exists)            │
│     • API routes exist (server/routes/*.ts)                   │
│     • Core pages exist (client/src/pages/*.tsx)               │
│     • Authentication flow works                                │
│     • plan.md features have corresponding code                │
│                                                                │
│  2. STABILITY SIGNALS                                          │
│     • `npm run typecheck` passes (0 errors)                   │
│     • `npm run build` succeeds                                │
│     • `npm run dev` starts without crashes                    │
│     • No critical console errors                               │
│                                                                │
│  3. UI/UX QUALITY SIGNALS (CRITICAL - NEW)                    │
│     • OKLCH colors (not hsl) in index.css                     │
│     • oklch() wrapper in tailwind.config.ts                   │
│     • 44px touch targets (min-h-11 min-w-11)                  │
│     • Four-state components (loading/error/empty/success)     │
│     • Mobile-first responsive (md: breakpoints)               │
│     • Distinctive typography (not Inter/Roboto/Arial)         │
│     • Dark mode works (.dark class outside @layer)            │
│                                                                │
│  4. MVP READINESS SIGNALS                                      │
│     • Core user flow works end-to-end                         │
│     • Build passes                                             │
│     • UI/UX quality gate passed                               │
│     • No blocking errors                                       │
│                                                                │
│  5. DEPLOYMENT SIGNALS                                         │
│     • fly.toml exists                                          │
│     • Health check returns 200                                 │
│     • Production URL accessible                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Lifecycle Phases (Signal-Triggered)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SIGNAL-BASED LIFECYCLE                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Phase 1: BUILD                                                    │
│  ├─ Schema, storage, API, pages, auth                              │
│  └─ EXIT WHEN: Core features from plan.md implemented              │
│                                                                     │
│  Phase 2: UI/UX QUALITY GATE (CRITICAL - NEW)                      │
│  ├─ Check ui-designer skill compliance                             │
│  ├─ If NOT compliant → redesign entire UI                          │
│  └─ EXIT WHEN: All 12 UI patterns verified                         │
│                                                                     │
│  Phase 3: STABILIZE                                                │
│  ├─ Fix TypeScript errors, build errors, runtime errors            │
│  └─ EXIT WHEN: typecheck + build pass                              │
│                                                                     │
│  Phase 4: MVP DEPLOY (Early deployment!)                           │
│  ├─ Deploy to fly.io so users can start using                      │
│  └─ EXIT WHEN: Health check passes on production URL               │
│                                                                     │
│  Phase 5: TEST                                                      │
│  ├─ Set up comprehensive testing (leo-testing-system.md)           │
│  └─ EXIT WHEN: Test suite created and passing                      │
│                                                                     │
│  Phase 6: ITERATE                                                  │
│  ├─ Fix bugs found in production                                   │
│  ├─ Add remaining features                                         │
│  ├─ Redeploy after significant changes                             │
│  └─ EXIT WHEN: All plan.md features complete + stable              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Change**: MVP deployment happens BEFORE comprehensive testing. Users get the app early, we iterate based on real usage.

---

## UI/UX Quality Gate (CRITICAL NEW FEATURE)

### Why This Matters

Generated apps often have:
- Generic fonts (Inter, Roboto, Arial) - forgettable
- Purple/blue gradients - "AI slop" aesthetic
- No mobile responsiveness - broken on phones
- Missing loading/error states - poor UX
- hsl() color wrapper - complete UI breakdown

### UI/UX Quality Check Implementation

**File**: `src/app_factory_leonardo_replit/agents/reprompter/ui_quality_checker.py` (NEW)

```python
from pathlib import Path
import subprocess
from dataclasses import dataclass
from typing import List, Tuple

@dataclass
class UIQualityResult:
    passes: bool
    score: int  # 0-100
    violations: List[str]
    recommendations: List[str]

class UIQualityChecker:
    """Check if app follows ui-designer skill patterns."""

    UI_DESIGNER_SKILL_PATH = "/Users/labheshpatel/apps/app-factory/apps/.claude/skills/ui-designer/SKILL.md"

    def check_ui_quality(self, app_path: str) -> UIQualityResult:
        """Run all UI quality checks."""
        violations = []
        recommendations = []

        # Check 1: OKLCH colors (not hsl wrapper)
        if not self._check_oklch_colors(app_path):
            violations.append("OKLCH colors misconfigured - using hsl() wrapper instead of oklch()")
            recommendations.append("Fix index.css: CSS variables = values only, tailwind.config.ts = oklch(var(--variable))")

        # Check 2: 44px touch targets
        if not self._check_touch_targets(app_path):
            violations.append("Touch targets < 44px - mobile usability issue")
            recommendations.append("Add min-h-11 min-w-11 to all icon buttons")

        # Check 3: Four-state components
        if not self._check_four_states(app_path):
            violations.append("Missing loading/error/empty states in data components")
            recommendations.append("Add isLoading, error, and empty (!data?.length) checks to all query components")

        # Check 4: Mobile-first responsive
        if not self._check_mobile_first(app_path):
            violations.append("Not mobile-first - missing md: breakpoints")
            recommendations.append("Use mobile-first: flex-col md:flex-row, not desktop-first")

        # Check 5: Distinctive typography
        if not self._check_typography(app_path):
            violations.append("Generic typography - using Inter/Roboto/Arial")
            recommendations.append("Use distinctive font pairing from Google Fonts (e.g., Space Mono + DM Sans)")

        # Check 6: Dark mode outside @layer
        if not self._check_dark_mode(app_path):
            violations.append("Dark mode inside @layer - gets tree-shaken in production")
            recommendations.append("Move .dark {} outside @layer base {} in index.css")

        # Check 7: Visual depth (gradients, glows)
        if not self._check_visual_depth(app_path):
            violations.append("Flat design - no visual depth or memorable moments")
            recommendations.append("Add gradient badges, glow effects, layered backgrounds")

        # Calculate score
        total_checks = 7
        passed_checks = total_checks - len(violations)
        score = int((passed_checks / total_checks) * 100)

        # Must pass at least 5/7 checks (71%)
        passes = score >= 71

        return UIQualityResult(
            passes=passes,
            score=score,
            violations=violations,
            recommendations=recommendations
        )

    def _check_oklch_colors(self, app_path: str) -> bool:
        """Check OKLCH color configuration."""
        index_css = Path(app_path) / "client/src/index.css"
        tailwind_config = Path(app_path) / "client/tailwind.config.ts"

        if not index_css.exists() or not tailwind_config.exists():
            return False

        css_content = index_css.read_text()
        tw_content = tailwind_config.read_text()

        # CSS should NOT have oklch() wrapper in variables
        has_oklch_wrapper_in_css = "oklch(" in css_content and "--primary:" in css_content
        # Check if it's values only (good) or wrapped (bad)
        bad_css = ": oklch(" in css_content  # Values wrapped in oklch()

        # Tailwind SHOULD have oklch() wrapper
        has_oklch_in_tailwind = "oklch(var(--" in tw_content

        # Bad: hsl() wrapper in tailwind
        has_hsl_wrapper = "hsl(var(--" in tw_content

        return not bad_css and has_oklch_in_tailwind and not has_hsl_wrapper

    def _check_touch_targets(self, app_path: str) -> bool:
        """Check for 44px minimum touch targets."""
        result = subprocess.run(
            ["grep", "-r", "min-h-11\\|min-w-11", f"{app_path}/client/src"],
            capture_output=True, text=True
        )
        # Should find min-h-11/min-w-11 in icon buttons
        return len(result.stdout.strip()) > 0

    def _check_four_states(self, app_path: str) -> bool:
        """Check for loading/error/empty/success states."""
        pages_dir = Path(app_path) / "client/src/pages"
        if not pages_dir.exists():
            return False

        # Check for isLoading in pages
        result = subprocess.run(
            ["grep", "-r", "isLoading", str(pages_dir)],
            capture_output=True, text=True
        )
        has_loading = len(result.stdout.strip()) > 0

        # Check for error handling
        result = subprocess.run(
            ["grep", "-r", "error", str(pages_dir)],
            capture_output=True, text=True
        )
        has_error = len(result.stdout.strip()) > 0

        return has_loading and has_error

    def _check_mobile_first(self, app_path: str) -> bool:
        """Check for mobile-first responsive patterns."""
        result = subprocess.run(
            ["grep", "-r", "md:flex\\|md:block\\|md:hidden\\|sm:grid-cols", f"{app_path}/client/src"],
            capture_output=True, text=True
        )
        return len(result.stdout.strip()) > 0

    def _check_typography(self, app_path: str) -> bool:
        """Check for distinctive typography (not generic fonts)."""
        index_css = Path(app_path) / "client/src/index.css"
        index_html = Path(app_path) / "client/index.html"

        content = ""
        if index_css.exists():
            content += index_css.read_text()
        if index_html.exists():
            content += index_html.read_text()

        # Check for Google Fonts import
        has_google_fonts = "fonts.googleapis.com" in content

        # Check for generic fonts (bad)
        generic_fonts = ["Inter", "Roboto", "Arial", "-apple-system", "BlinkMacSystemFont"]
        uses_generic = any(font in content for font in generic_fonts)

        # Good if has Google Fonts OR doesn't use generic
        return has_google_fonts or not uses_generic

    def _check_dark_mode(self, app_path: str) -> bool:
        """Check dark mode is outside @layer (won't be tree-shaken)."""
        index_css = Path(app_path) / "client/src/index.css"
        if not index_css.exists():
            return False

        content = index_css.read_text()

        # Dark mode should exist
        if ".dark" not in content:
            return True  # No dark mode is fine

        # Check if .dark is inside @layer base (bad)
        # Simple heuristic: if .dark comes after @layer base { and before the closing }
        # This is a simplified check
        return ".dark {" in content and "@layer base" in content

    def _check_visual_depth(self, app_path: str) -> bool:
        """Check for visual depth (gradients, shadows, glows)."""
        result = subprocess.run(
            ["grep", "-r", "gradient\\|shadow-\\|blur-\\|backdrop-blur", f"{app_path}/client/src"],
            capture_output=True, text=True
        )
        # Should have at least some visual depth elements
        matches = len(result.stdout.strip().split("\n"))
        return matches >= 5  # At least 5 uses of depth elements
```

### UI Quality Gate Prompt

When UI quality check fails, the reprompter generates:

```
## UI/UX QUALITY GATE FAILED

The app's UI does not meet quality standards. Score: {score}/100

**Violations:**
{violations_list}

**CRITICAL ACTION REQUIRED:**

Delegate to **ui_designer** subagent:

1. READ the complete ui-designer skill:
   `apps/.claude/skills/ui-designer/SKILL.md`

2. REDESIGN the entire app following ALL 12 patterns:
   • OKLCH colors (not hsl wrapper)
   • 44px touch targets
   • Four-state components
   • Mobile-first responsive
   • Distinctive typography (Google Fonts)
   • Visual depth (gradients, glows, shadows)
   • Dark mode outside @layer

3. Key files to update:
   • `client/src/index.css` - Color tokens, typography
   • `client/tailwind.config.ts` - oklch() wrappers
   • All pages - Four-state patterns, responsive
   • All icon buttons - min-h-11 min-w-11

**DO NOT proceed to deployment until UI quality passes.**
```

---

## MVP Detection Logic

### What Makes an MVP?

An MVP is deployable when:

1. **Core User Flow Works**
   - User can sign up/login
   - User can perform primary action (create/read/update something)
   - Data persists correctly

2. **Build Passes**
   - No TypeScript errors
   - Production build succeeds

3. **UI/UX Quality Gate Passed**
   - Score >= 71% (5/7 checks)

4. **No Blocking Errors**
   - Dev server starts
   - No critical console errors

### MVP Detection Implementation

```python
class MVPDetector:
    """Detect when app is ready for initial deployment."""

    def is_mvp_ready(self, app_path: str) -> Tuple[bool, str]:
        """Check if app is MVP-ready for deployment."""

        reasons = []

        # 1. Check schema exists
        schema_path = Path(app_path) / "shared/schema.ts"
        if not schema_path.exists():
            reasons.append("No schema.ts - database layer not implemented")

        # 2. Check routes exist
        routes_dir = Path(app_path) / "server/routes"
        if not routes_dir.exists() or not list(routes_dir.glob("*.ts")):
            reasons.append("No API routes - backend not implemented")

        # 3. Check pages exist
        pages_dir = Path(app_path) / "client/src/pages"
        if not pages_dir.exists():
            reasons.append("No pages - frontend not implemented")
        else:
            page_count = len(list(pages_dir.glob("*.tsx")))
            if page_count < 2:
                reasons.append(f"Only {page_count} page(s) - need at least 2 for MVP")

        # 4. Check build passes
        if not self._build_passes(app_path):
            reasons.append("Build fails - fix TypeScript/build errors first")

        # 5. Check UI quality
        ui_checker = UIQualityChecker()
        ui_result = ui_checker.check_ui_quality(app_path)
        if not ui_result.passes:
            reasons.append(f"UI quality score {ui_result.score}/100 - need 71%+")

        # 6. Check auth exists (if plan requires it)
        auth_context = Path(app_path) / "client/src/contexts/AuthContext.tsx"
        # Auth is optional for MVP if plan doesn't require it

        if reasons:
            return False, "MVP not ready:\n• " + "\n• ".join(reasons)

        return True, "MVP ready for deployment!"

    def _build_passes(self, app_path: str) -> bool:
        """Check if typecheck and build pass."""
        try:
            # Typecheck
            result = subprocess.run(
                ["npm", "run", "typecheck"],
                cwd=app_path, capture_output=True, timeout=60
            )
            if result.returncode != 0:
                return False

            # Build
            result = subprocess.run(
                ["npm", "run", "build"],
                cwd=app_path, capture_output=True, timeout=120
            )
            return result.returncode == 0
        except:
            return False
```

---

## Phase Transition Logic (Signal-Based)

```python
class PhaseTracker:
    """Track phases based on SIGNALS, not iteration counts."""

    def should_transition(self) -> Tuple[bool, Phase]:
        """Detect phase transition based on app signals."""
        current = self.state.current_phase

        if current == Phase.BUILD:
            # Transition when core features exist
            if self._core_features_exist():
                return True, Phase.UI_QUALITY_GATE

        elif current == Phase.UI_QUALITY_GATE:
            # Transition when UI quality passes
            ui_checker = UIQualityChecker()
            result = ui_checker.check_ui_quality(self.app_path)
            if result.passes:
                return True, Phase.STABILIZE

        elif current == Phase.STABILIZE:
            # Transition when build passes
            if self._build_passes():
                return True, Phase.MVP_DEPLOY

        elif current == Phase.MVP_DEPLOY:
            # Transition when deployed and healthy
            if self._is_deployed_and_healthy():
                return True, Phase.TEST

        elif current == Phase.TEST:
            # Transition when tests exist and mostly pass
            if self._tests_exist_and_pass():
                return True, Phase.ITERATE

        elif current == Phase.ITERATE:
            # Stay here until all plan.md features complete
            if self._all_features_complete():
                return True, Phase.COMPLETE

        return False, None

    def _core_features_exist(self) -> bool:
        """Check if core app structure exists."""
        app = Path(self.app_path)
        return all([
            (app / "shared/schema.ts").exists(),
            (app / "server/routes").exists(),
            (app / "client/src/pages").exists(),
            len(list((app / "client/src/pages").glob("*.tsx"))) >= 2
        ])

    def _is_deployed_and_healthy(self) -> bool:
        """Check if app is deployed to fly.io and healthy."""
        fly_toml = Path(self.app_path) / "fly.toml"
        if not fly_toml.exists():
            return False

        # Extract app name and check health
        try:
            content = fly_toml.read_text()
            # Parse app name from fly.toml
            for line in content.split("\n"):
                if line.startswith("app = "):
                    app_name = line.split("=")[1].strip().strip('"')
                    # Check health endpoint
                    result = subprocess.run(
                        ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}",
                         f"https://{app_name}.fly.dev/api/health"],
                        capture_output=True, text=True, timeout=10
                    )
                    return result.stdout.strip() == "200"
        except:
            pass
        return False
```

---

## Updated System Prompt with UI Quality Awareness

```python
REPROMPTER_SYSTEM_PROMPT = """You are a strategic development task manager for an AI app generator.

## YOUR ROLE

You orchestrate the full app lifecycle: Build → UI Quality → Stabilize → Deploy → Test → Iterate

**CRITICAL**: You detect SIGNALS, not count iterations. Apps vary in complexity - some are MVP-ready in 5 iterations, others need 30.

## SIGNAL DETECTION

Before generating each prompt, assess:

1. **Build Completeness**: Does schema, routes, pages exist?
2. **UI Quality**: Does it follow ui-designer skill patterns?
3. **Stability**: Does typecheck/build pass?
4. **MVP Readiness**: Can users start using this?
5. **Deployment Status**: Is it live on fly.io?

## UI/UX QUALITY GATE (CRITICAL)

**ALWAYS check UI quality before deployment.** Reference: `apps/.claude/skills/ui-designer/SKILL.md`

If UI quality score < 71%, generate a prompt to:
1. Read the COMPLETE ui-designer skill
2. Redesign the ENTIRE app following all 12 patterns
3. Focus on: OKLCH colors, distinctive typography, 44px touch targets, four-state components

**Generic "AI slop" aesthetics are UNACCEPTABLE.**

## PHASE GUIDANCE

### BUILD Phase
Focus: Implement features from plan.md
Exit Signal: Schema + routes + pages exist

### UI_QUALITY_GATE Phase
Focus: Verify and fix UI/UX quality
Exit Signal: UI quality score >= 71%
**If failing**: Delegate to ui_designer subagent to redesign entire app

### STABILIZE Phase
Focus: Fix TypeScript/build errors
Exit Signal: `npm run typecheck` && `npm run build` pass

### MVP_DEPLOY Phase
Focus: Deploy to fly.io for early user access
Exit Signal: Health check passes on production URL

### TEST Phase
Focus: Set up comprehensive testing (leo-testing-system.md)
Exit Signal: Test suite exists and mostly passes

### ITERATE Phase
Focus: Fix bugs, add remaining features, redeploy
Exit Signal: All plan.md features complete and stable

## KEY DOCUMENTS

- `apps/.claude/skills/ui-designer/SKILL.md` - UI/UX patterns (MANDATORY)
- `prompts/leo-testing-system.md` - Testing infrastructure
- `docs/production-checklist/production-checklist.md` - Pre-deploy verification
"""
```

---

## Iteration Awareness

The reprompter tracks iteration count for **awareness and debugging**, NOT for triggering transitions.

### Iteration Tracking Implementation

```python
class IterationTracker:
    """Track iterations for awareness, NOT for decisions."""

    def __init__(self, app_path: str):
        self.app_path = app_path
        self.state_file = Path(app_path) / ".reprompter_state.json"

    def get_state(self) -> dict:
        if self.state_file.exists():
            return json.loads(self.state_file.read_text())
        return {"iteration": 0, "mode": None, "phase": None, "errors_seen": []}

    def increment_iteration(self) -> int:
        state = self.get_state()
        state["iteration"] += 1
        self.state_file.write_text(json.dumps(state, indent=2))
        return state["iteration"]

    def detect_stuck_loop(self) -> Optional[str]:
        """Detect if we're stuck on the same error."""
        state = self.get_state()
        errors = state.get("errors_seen", [])

        if len(errors) >= 3:
            # Check if last 3 errors are similar
            recent = errors[-3:]
            if all(self._errors_similar(recent[0], e) for e in recent[1:]):
                return recent[0]  # Return the stuck error

        return None

    def should_emergency_stop(self) -> bool:
        """Emergency stop after 50+ iterations without progress."""
        state = self.get_state()
        return state.get("iteration", 0) >= 50 and not state.get("recent_progress", False)
```

### What Iteration Count IS For

1. **Logging**: Track how many iterations a task has taken
2. **Debugging**: Identify when things are taking too long
3. **Stuck Loop Detection**: Same error 3+ consecutive times
4. **Emergency Bailout**: 50+ iterations without progress (something is fundamentally broken)

### What Iteration Count Is NOT For

- Deciding when to deploy (use MVP signals)
- Deciding when to test (use stability signals)
- Deciding phase transitions (use app state signals)
- Determining task complexity (analyze the prompt)

---

## Files to Create/Modify

### Priority 1: Context Bridging (Fix "Disconnected" Feeling)

| File | Action | Description |
|------|--------|-------------|
| `docs/reprompter-master-plan.md` | ✅ CREATED | Master plan read into system prompt |
| `agents/reprompter/agent.py` | MODIFY | Load master plan into system prompt |
| `agents/reprompter/context_gatherer.py` | MODIFY | Read full session context + CLAUDE.md |

**Note**: No changes needed to `app_generator/agent.py` - context is already saved to disk!

### Priority 2: Mode Detection & Plan Tracking

| File | Action | Description |
|------|--------|-------------|
| `agents/reprompter/mode_detector.py` | CREATE | NEW vs RESUME mode detection |
| `agents/reprompter/plan_tracker.py` | CREATE | TASK_PLAN.md tracking for RESUME mode |
| `agents/reprompter/complexity_analyzer.py` | CREATE | Trivial vs non-trivial detection |
| `agents/reprompter/iteration_tracker.py` | CREATE | Iteration awareness (NOT for decisions) |

### Priority 3: Quality Gates & Signal Detection (NEW mode)

| File | Action | Description |
|------|--------|-------------|
| `agents/reprompter/ui_quality_checker.py` | CREATE | UI/UX quality validation |
| `agents/reprompter/mvp_detector.py` | CREATE | MVP readiness detection |
| `agents/reprompter/phase_tracker.py` | CREATE | Signal-based phase tracking |
| `agents/reprompter/prompts.py` | MODIFY | Mode-aware prompt templates |

---

## Example Prompts by Phase

### BUILD Phase
```
Schema and user routes implemented. Commit changes.

Next: Implement Dashboard page.
Delegate to **code** subagent → dashboard with:
• User stats summary
• Recent activity
• Quick actions

Then basic functional testing.
```

### UI_QUALITY_GATE Phase (Failing)
```
## UI QUALITY CHECK FAILED - Score: 42/100

Violations:
• OKLCH colors misconfigured (using hsl wrapper)
• Generic typography (Inter font)
• Missing four-state components
• No visual depth (flat design)

**CRITICAL**: Read and follow `apps/.claude/skills/ui-designer/SKILL.md`

Delegate to **ui_designer** subagent:
1. Fix index.css: OKLCH values only, oklch() wrapper in tailwind
2. Add Google Fonts (distinctive pairing, NOT Inter/Roboto)
3. Add gradient badges, glow effects, shadows
4. Ensure all data components have loading/error/empty states
5. Add min-h-11 min-w-11 to all icon buttons

**DO NOT proceed until UI quality >= 71%**
```

### MVP_DEPLOY Phase
```
MVP ready! UI quality: 85/100. Build passes.

Deploy to fly.io so users can start using the app:

Delegate to **code** subagent:
```bash
flyctl launch --no-deploy --name {app-name}
flyctl secrets set SUPABASE_URL="..." [...]
flyctl deploy
```

Then **quality_assurer**: verify https://{app-name}.fly.dev/api/health

Users can now access the app while we continue building.
```

---

## Key Changes from Previous Plan

| Previous | New |
|----------|-----|
| Hardcoded iteration counts (1-30, 31-38, etc.) | Signal-based detection |
| Testing before deployment | MVP deployment first, testing after |
| No UI quality check | Mandatory UI quality gate |
| Generic aesthetics acceptable | ui-designer skill compliance required |
| Fixed phase order | Flexible based on app signals |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| MVP deployment time | < 10 iterations for simple apps |
| UI quality score | >= 71% before any deployment |
| User access time | Deploy MVP ASAP, iterate after |
| Build success rate | 95%+ apps build without intervention |

---

## Summary

The reprompter becomes a **mode-aware, signal-driven lifecycle manager** that:

### NEW Mode (Fresh App)
1. **Senses MVP readiness** - Deploys when core features work, not after fixed iterations
2. **Enforces UI/UX quality** - No generic "AI slop" - apps must follow ui-designer skill
3. **Deploys early** - Users get access to MVP while we continue building/testing
4. **Adapts to complexity** - Simple apps deploy fast, complex apps take longer

### RESUME Mode (Specific Task)
1. **Intent-focused** - The resume prompt intent is the ONLY goal
2. **Plan-enforced** - Non-trivial tasks require TASK_PLAN.md before coding
3. **Step-tracked** - Each plan step is tracked and verified
4. **Pipeline-compliant** - Schema → contracts → routes → client enforced

### Both Modes
1. **Iteration-aware** - Tracks count for debugging, NOT for decisions
2. **Stuck-loop detection** - Same error 3+ times triggers reassessment
3. **Emergency bailout** - 50+ iterations without progress stops execution

### Key Documents
- **`docs/reprompter-master-plan.md`** - Read into system prompt for easy modification
- **`docs/reprompter-changes.md`** - Implementation plan (this file)
- **`apps/.claude/skills/ui-designer/SKILL.md`** - UI/UX quality standards
- **`prompts/leo-testing-system.md`** - Comprehensive testing guide

The key insight: **RESUME mode must satisfy the exact intent of the resume prompt. NEW mode should deploy as soon as apps are usable.** Both modes use signals, not iteration counts, to drive decisions.
