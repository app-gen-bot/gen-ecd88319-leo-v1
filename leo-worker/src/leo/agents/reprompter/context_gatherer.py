"""
Context Gatherer for Reprompter Agent.

Simple file reader - no parsing, no complex logic. Just read files and return text.
"""

import json
import subprocess
from pathlib import Path
from typing import Dict

from .config import CONTEXT_CONFIG


class ContextGatherer:
    """
    Dead simple: Just read files and return text.
    No parsing. No complex logic. Just files → strings.
    """

    def gather_context(self, app_path: str) -> Dict[str, str]:
        """
        Return context as plain text strings.

        Args:
            app_path: Path to the app directory (e.g., apps/my-app/app)

        Returns:
            Dictionary with context strings
        """
        return {
            'session_context': self._read_session_context(app_path),  # NEW: Full session context
            'claude_md': self._read_claude_md(app_path),              # NEW: Architecture overview
            'latest_changelog': self._read_latest_changelog(app_path),
            'plan_files': self._read_plan_files(app_path),
            'error_logs': self._read_error_logs(app_path),
            'git_status': self._run_git_status(app_path),
            'recent_tasks': self._get_recent_tasks(app_path),
        }

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
                f"Original Request: {context.get('original_request', 'Not recorded')[:500]}",
                f"Features: {', '.join(context.get('features', [])[:10])}",
                f"Entities: {', '.join(context.get('entities', [])[:10])}",
                f"Last Action: {context.get('last_action', 'Unknown')[:200]}",
                f"Last Modified: {context.get('last_modified', 'Unknown')}",
            ]

            return "\n".join(lines)

        except Exception as e:
            return f"Error reading session context: {e}"

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

    def _read_latest_changelog(self, app_path: str) -> str:
        """
        Read recent changelog entries with HARD LIMITS (prefers concise summaries).

        Smart strategy:
        - Latest file: Last 300 lines (was: unlimited)
        - Older files: Last 100 lines (was: 200)

        Reads from summary_changes/ for token efficiency, falls back to changelog/ if unavailable.
        """
        app_path_obj = Path(app_path)

        # Try summary_changes/ first (MUCH more token-efficient)
        summary_dir = app_path_obj.parent / "summary_changes"
        if summary_dir.exists():
            max_entries = CONTEXT_CONFIG["max_changelog_entries"]
            files = sorted(summary_dir.glob("summary-*.md"), reverse=True)[:max_entries]

            if files:
                content = []
                max_lines_latest = 300  # Hard limit for latest (was: unlimited)
                max_lines_older = 100   # Reduced from 200

                for i, f in enumerate(files):
                    try:
                        all_lines = f.read_text().splitlines()

                        # Latest file (i==0): Last 300 lines (recent work)
                        if i == 0:
                            if len(all_lines) > max_lines_latest:
                                truncated_lines = all_lines[-max_lines_latest:]
                                preview = "\n".join(truncated_lines)
                                content.append(f"=== {f.name} (last {max_lines_latest} lines - latest) ===\n{preview}")
                            else:
                                content.append(f"=== {f.name} (latest) ===\n{f.read_text()}")
                        else:
                            # Older files: Last 100 lines only
                            if len(all_lines) > max_lines_older:
                                truncated_lines = all_lines[-max_lines_older:]
                                preview = "\n".join(truncated_lines)
                                content.append(f"=== {f.name} (last {max_lines_older} lines - older) ===\n{preview}")
                            else:
                                content.append(f"=== {f.name} (older) ===\n{f.read_text()}")
                    except Exception as e:
                        content.append(f"=== {f.name} ===\nError reading: {e}")

                return "\n\n".join(content)

        # Fallback to full changelog/ if summary_changes/ doesn't exist (backwards compatibility)
        changelog_dir = app_path_obj.parent / "changelog"
        if not changelog_dir.exists():
            return "No changelog found."

        max_entries = CONTEXT_CONFIG["max_changelog_entries"]
        files = sorted(changelog_dir.glob("changelog-*.md"), reverse=True)[:max_entries]

        if not files:
            return "No changelog entries found."

        content = []
        max_lines_latest = 300  # Reduced from 1000 (same limit as summary)
        max_lines_older = 100   # Reduced from 200

        for i, f in enumerate(files):
            try:
                all_lines = f.read_text().splitlines()

                # Latest file: 300 lines max (reduced for consistency)
                if i == 0:
                    if len(all_lines) > max_lines_latest:
                        truncated_lines = all_lines[-max_lines_latest:]
                        preview = "\n".join(truncated_lines)
                        content.append(f"=== {f.name} (last {max_lines_latest} lines, VERBOSE latest) ===\n{preview}")
                    else:
                        content.append(f"=== {f.name} (VERBOSE latest) ===\n{f.read_text()}")
                else:
                    # Older files: 100 lines max
                    if len(all_lines) > max_lines_older:
                        truncated_lines = all_lines[-max_lines_older:]
                        preview = "\n".join(truncated_lines)
                        content.append(f"=== {f.name} (last {max_lines_older} lines, VERBOSE older) ===\n{preview}")
                    else:
                        content.append(f"=== {f.name} (VERBOSE older) ===\n{f.read_text()}")
            except Exception as e:
                content.append(f"=== {f.name} ===\nError reading: {e}")

        return "\n\n".join(content)

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
            # Also check for plan files in app/specs/
            specs_dir = app_path_obj / "specs"
            if specs_dir.exists():
                plan_dir = specs_dir
            else:
                return "No plan files found."

        # Read all markdown files (skip binary files like PDFs)
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

        Args:
            file_path: Path to markdown file

        Returns:
            Extracted headers with first sentences
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
                # Limit sentence length
                if len(first_sentence) > 100:
                    first_sentence = first_sentence[:100] + '...'
                current_header += f"\n{first_sentence}"
                sentence_captured = True

        # Add last header
        if current_header:
            headers.append(current_header)

        return "\n\n".join(headers) if headers else "No headers found"

    def _read_error_logs(self, app_path: str) -> str:
        """Tail recent error logs."""
        # Try to find dev server logs
        app_path_obj = Path(app_path)
        log_pattern = ".dev_server_*.log"

        try:
            result = subprocess.run(
                f"tail -{CONTEXT_CONFIG['error_log_lines']} {app_path_obj}/{log_pattern} 2>/dev/null || echo 'No logs found'",
                shell=True,
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.stdout or "No error logs found."
        except subprocess.TimeoutExpired:
            return "Error: Log reading timed out."
        except Exception as e:
            return f"Error reading logs: {e}"

    def _run_git_status(self, app_path: str) -> str:
        """Get git status and recent diff."""
        try:
            result = subprocess.run(
                f"cd {app_path} && git status && echo '\n--- Recent Changes ---' && git diff --stat HEAD~1 2>/dev/null",
                shell=True,
                capture_output=True,
                text=True,
                timeout=10
            )
            return result.stdout or "Git not available."
        except subprocess.TimeoutExpired:
            return "Error: Git command timed out."
        except Exception as e:
            return f"Error running git: {e}"

    def _get_recent_tasks(self, app_path: str) -> str:
        """Read last N tasks from session for loop detection."""
        session_file = Path(app_path) / ".agent_session.json"

        if not session_file.exists():
            return "No task history available."

        try:
            session = json.loads(session_file.read_text())
            reprompter_context = session.get("reprompter_context", {})
            task_history = reprompter_context.get("task_history", [])

            if not task_history:
                return "No previous tasks recorded."

            # Get last N tasks
            recent = task_history[-CONTEXT_CONFIG["task_history_limit"]:]

            # Format as simple list
            lines = []
            for i, task_entry in enumerate(recent, 1):
                task = task_entry.get("task", "Unknown task")
                success = "✓" if task_entry.get("success") else "✗"
                lines.append(f"{i}. {success} {task}")

            return "\n".join(lines)

        except Exception as e:
            return f"Error reading task history: {e}"
