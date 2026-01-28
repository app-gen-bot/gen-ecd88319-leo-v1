"""
Configuration for the Reprompter Agent.

This agent analyzes context and generates prompts for the next development task.
"""

# Container paths (absolute - no dynamic resolution needed in container)
MASTER_PLAN_PATH = "/factory/leo/agents/reprompter/master-plan.md"

# Agent configuration (borrowed from AppGeneratorAgent)
REPROMPTER_CONFIG = {
    "name": "ReprompterAgent",
    "model": "claude-opus-4-5",  # Claude Opus 4.5 (same as AppGeneratorAgent)
    "max_turns": 100,   # Enough turns to read files and analyze complex context
    "allowed_tools": [
        "Read",      # Might need to read files for deeper context
        "Bash",      # Might need to check logs/status
    ],
}

# Context gathering configuration
CONTEXT_CONFIG = {
    "max_changelog_entries": 3,           # Read last N changelog/summary files (reduced from 5)
    "max_changelog_lines_latest": None,   # Latest file: read ALL (no limit for current session)
    "max_changelog_lines_older": 200,     # Older files: last 200 lines only
    # Strategy: Full history of latest file + previews of older files
    # Example: latest summary-003.md (15K lines) + summary-002.md (last 200) + summary-001.md (last 200)
    # Total: ~15,400 lines (~77K tokens) vs 262K if reading all fully
    "max_plan_files": 5,                  # Read up to N plan files
    "max_plan_lines": 200,                # First N lines per plan file (preview)
    "error_log_lines": 100,               # Tail N lines of error logs
    "task_history_limit": 5,              # Show last N tasks for loop detection
}

# Reprompter modes
DEFAULT_MODE = "confirm_first"  # Options: "autonomous", "confirm_first", "interactive"
DEFAULT_MAX_ITERATIONS = 10
