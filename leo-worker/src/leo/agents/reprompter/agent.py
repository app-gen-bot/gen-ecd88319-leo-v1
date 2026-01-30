"""
Simple Reprompter Agent

LLM-first approach: Read context files, ask LLM what to do next.
No brittle parsing, no complex logic - just context → LLM → prompt.

Enhanced with strategic master plan and full session context awareness.
"""

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional

from cc_agent import Agent

from .config import REPROMPTER_CONFIG, CONTEXT_CONFIG, MASTER_PLAN_PATH
from .context_gatherer import ContextGatherer
from .prompts import REPROMPTER_SYSTEM_PROMPT, REPROMPTER_LITE_SYSTEM_PROMPT

logger = logging.getLogger(__name__)


def _load_master_plan() -> str:
    """
    Load the reprompter master plan for system prompt.

    The master plan provides strategic guidance for:
    - NEW vs RESUME mode detection
    - Signal-based phase transitions
    - UI/UX quality gates
    - Written plan enforcement for non-trivial tasks
    """
    # Container path for reprompter master plan (from config)
    master_plan_path = Path(MASTER_PLAN_PATH)

    if master_plan_path.exists():
        try:
            content = master_plan_path.read_text()
            logger.info(f"📋 Loaded master plan ({len(content):,} chars)")
            return content
        except Exception as e:
            logger.warning(f"⚠️ Failed to load master plan: {e}")
            return ""
    else:
        logger.warning(f"⚠️ Master plan not found at {master_plan_path}")
        return ""


def _build_enhanced_system_prompt() -> str:
    """Build system prompt with master plan included (or lite prompt for leo-lite mode)."""
    import os
    agent_mode = os.environ.get('AGENT_MODE', 'leo')

    # Leo-Lite mode: use simplified reprompter
    if agent_mode == 'leo-lite':
        logger.info("🪶 Leo-Lite mode: using simplified reprompter")
        return REPROMPTER_LITE_SYSTEM_PROMPT

    # Full Leo mode: include master plan
    master_plan = _load_master_plan()

    if master_plan:
        return f"""{REPROMPTER_SYSTEM_PROMPT}

---

## STRATEGIC MASTER PLAN

The following master plan provides strategic guidance for how to operate.
Follow this plan carefully based on the current mode (NEW vs RESUME).

{master_plan}
"""
    else:
        return REPROMPTER_SYSTEM_PROMPT


class SimpleReprompter:
    """
    LLM-first reprompter. No complex logic, just context → LLM → prompt.

    This class analyzes the current state of an app and generates the next
    development task prompt using an LLM.
    """

    def __init__(self, app_path: str):
        """
        Initialize the reprompter.

        Args:
            app_path: Path to the app directory (e.g., apps/my-app/app)
        """
        self.app_path = app_path
        self.context_gatherer = ContextGatherer()

        # Build enhanced system prompt with master plan
        enhanced_system_prompt = _build_enhanced_system_prompt()

        # Simple reprompter agent with strategic awareness
        self.agent = Agent(
            system_prompt=enhanced_system_prompt,
            model=REPROMPTER_CONFIG["model"],
            max_turns=REPROMPTER_CONFIG["max_turns"],
            allowed_tools=REPROMPTER_CONFIG["allowed_tools"],
            name=REPROMPTER_CONFIG["name"],
            cwd=app_path,  # Set working directory for Read/Bash tools
        )

        logger.info(f"✅ SimpleReprompter initialized for {app_path}")
        logger.info(f"📋 System prompt size: {len(enhanced_system_prompt):,} chars")

    async def get_next_prompt(
        self,
        strategic_guidance: Optional[str] = None,
        original_prompt: Optional[str] = None
    ) -> str:
        """
        Main method: Gather context, ask LLM, return prompt.

        Args:
            strategic_guidance: Optional high-level strategic direction from user
                               to regenerate the prompt with new focus
            original_prompt: Optional original prompt suggestion (for context during redirect)
                            Allows smart merging when user says "do this but also X"

        Returns:
            Multi-paragraph prompt string for the main agent
        """
        logger.info("🔍 Gathering context...")

        # 1. Gather context (just read files)
        context = self.context_gatherer.gather_context(self.app_path)

        logger.info("🤖 Asking LLM to generate next prompt...")

        # 2. Build user message for LLM
        if strategic_guidance:
            # User provided strategic guidance - regenerate with new direction
            user_message = f"""
STRATEGIC GUIDANCE FROM USER:
{strategic_guidance}

ORIGINAL PROMPT SUGGESTION:
{original_prompt if original_prompt else "N/A - first generation"}

Based on this strategic direction, analyze the current app state and generate a new development prompt.
You have access to my original suggestion above. The user may want you to:
- Keep the original and add new requirements
- Completely pivot to a new direction
- Refine/adjust the original approach

Use smart judgment to merge appropriately based on the user's guidance.

## APP SESSION CONTEXT (from main agent)
{context['session_context']}

## APP ARCHITECTURE (CLAUDE.md)
{context['claude_md']}

## RECENT WORK (Changelog)
{context['latest_changelog']}

## PLANNED WORK
{context['plan_files']}

## RECENT ERRORS
{context['error_logs']}

## GIT STATUS
{context['git_status']}

## RECENT TASKS (Last {CONTEXT_CONFIG['task_history_limit']} - for context)
{context['recent_tasks']}

Generate a multi-paragraph prompt for the main agent that:
- Aligns with the user's strategic guidance above
- Considers the current app state but prioritizes the strategic direction
- Encourages liberal subagent use (research, code, error_fixer, quality_assurer, ui_designer)
- Includes testing requirements
- Be bold and propose significant changes if the guidance calls for it
- Follow the master plan phases (NEW vs RESUME mode)
"""
        else:
            # Normal mode - analyze current state
            user_message = f"""
Analyze the current state and generate the next development task prompt.

## APP SESSION CONTEXT (from main agent)
{context['session_context']}

## APP ARCHITECTURE (CLAUDE.md)
{context['claude_md']}

## RECENT WORK (Changelog)
{context['latest_changelog']}

## PLANNED WORK
{context['plan_files']}

## RECENT ERRORS
{context['error_logs']}

## GIT STATUS
{context['git_status']}

## RECENT TASKS (Last {CONTEXT_CONFIG['task_history_limit']} - for loop detection)
{context['recent_tasks']}

Generate a multi-paragraph prompt for the main agent that:
- Addresses the highest priority task based on the master plan phases
- Uses the session context to understand app name, features, and original request
- Encourages liberal subagent use (research, code, error_fixer, quality_assurer, ui_designer)
- Includes testing requirements (chrome dev tools for visual verification)
- Detects if we're stuck (same task 2+ times) and escalates appropriately
- For RESUME mode: ensures the original request intent is being satisfied
- For NEW mode: follows signal-based phase progression
"""

        # Debug: log prompt size
        logger.info(f"📊 User message size: {len(user_message):,} chars (~{len(user_message)//4:,} tokens)")

        # 3. Ask LLM
        try:
            result = await self.agent.run(user_message)

            # 4. Return the prompt (LLM outputs plain text, not JSON)
            next_prompt = result.content.strip()

            logger.info(f"✅ Generated prompt ({len(next_prompt)} chars)")

            return next_prompt

        except Exception as e:
            logger.error(f"❌ Error generating prompt: {e}")
            # Fallback: return a generic prompt
            return "Continue working on the next priority item from the plan. Use subagents appropriately."

    def should_continue(self, iteration: int, max_iterations: int) -> bool:
        """
        Simple iteration limit check.

        Args:
            iteration: Current iteration number
            max_iterations: Maximum allowed iterations

        Returns:
            True if should continue, False if should stop
        """
        return iteration < max_iterations

    def record_task(self, task: str, success: bool):
        """
        Track task in session with smart compression.

        Strategy:
        - Last 5 tasks: Keep full detail (for loop detection)
        - Older tasks: Keep only summary + key changes

        Args:
            task: The task prompt that was executed
            success: Whether the task completed successfully
        """
        session_file = Path(self.app_path) / ".agent_session.json"

        try:
            if session_file.exists():
                session = json.loads(session_file.read_text())
            else:
                session = {}

            # Ensure reprompter_context exists
            if "reprompter_context" not in session:
                session["reprompter_context"] = {"task_history": []}

            task_history = session["reprompter_context"]["task_history"]

            # Compress older tasks (keep only last 5 at full detail)
            if len(task_history) >= 5:
                # Find and compress the oldest task that still has full_task
                for task_entry in task_history:
                    if "full_task" in task_entry and task_entry["full_task"]:
                        # Extract key info before compressing
                        task_entry["task_summary"] = task_entry["task"][:100] + "..."
                        task_entry["key_changes"] = self._extract_key_changes(task_entry["full_task"])
                        del task_entry["full_task"]  # Remove full task to save space
                        break  # Only compress one task per addition

            # Add new task
            task_history.append({
                "task": task[:100] + "..." if len(task) > 100 else task,  # Short summary
                "full_task": task,  # Keep full for last 5 tasks
                "key_changes": self._extract_key_changes(task),
                "success": success,
                "timestamp": datetime.now().isoformat()
            })

            # Write back to file
            session_file.write_text(json.dumps(session, indent=2))

            logger.info(f"📝 Recorded task (success={success}, compressed={len(task_history) >= 5})")

        except Exception as e:
            logger.warning(f"⚠️  Failed to record task: {e}")
            # Not critical - continue anyway

    def _extract_key_changes(self, task: str) -> list:
        """
        Extract key changes from a task prompt.

        Simple heuristics:
        - Look for delegate patterns ("delegate to X")
        - Extract main action verbs (fix, add, implement, test)
        - Identify file/component names

        Args:
            task: The task prompt

        Returns:
            List of key changes (max 5 items)
        """
        changes = []
        task_lower = task.lower()

        # Extract subagent delegations
        if "error_fixer" in task_lower:
            changes.append("error_fixer: debugging")
        if "quality_assurer" in task_lower:
            changes.append("quality_assurer: testing")
        if "code" in task_lower and "subagent" in task_lower:
            changes.append("code: implementation")
        if "research" in task_lower and "subagent" in task_lower:
            changes.append("research: investigation")

        # Extract action keywords (first 3 only)
        actions = []
        for verb in ["fix", "add", "implement", "test", "refactor", "optimize", "deploy", "commit"]:
            if verb in task_lower:
                actions.append(verb)
        changes.extend(actions[:3])

        return changes[:5]  # Max 5 items


def create_reprompter(app_path: str) -> SimpleReprompter:
    """
    Factory function to create a SimpleReprompter instance.

    Args:
        app_path: Path to the app directory

    Returns:
        SimpleReprompter instance
    """
    return SimpleReprompter(app_path)
