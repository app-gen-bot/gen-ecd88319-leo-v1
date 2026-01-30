"""
Process Monitor Summarizer - AI-powered trajectory analysis.

Uses GPT-4o-mini to analyze agent activity and assess trajectory quality.
Provides both a summary of what happened and efficiency scoring.

Also provides FriendlySummarizer for user-friendly status messages (non-dev users).

Cost: ~$0.001 per analysis (very cheap)
"""

import os
import json
import logging
from typing import Dict, Any, Optional, List
from dataclasses import dataclass

from .collector import LogBatch

logger = logging.getLogger(__name__)

# GPT-4o-mini for fast, cheap analysis
OPENAI_MODEL = "gpt-4o-mini"

# Maximum tokens for output
MAX_OUTPUT_TOKENS = 600

# System prompt for trajectory analysis (dev mode)
ANALYZER_SYSTEM_PROMPT = """You are an agent trajectory analyzer. Given agent activity logs, analyze efficiency and summarize progress.

Output JSON only with this structure:
{
  "summary": "2-3 sentences describing what the agent accomplished or attempted. Be specific about outcomes, not process.",
  "trajectory": {
    "score": "EFFICIENT|GOOD|STRUGGLING|INEFFICIENT",
    "signals": ["signal 1", "signal 2"]
  }
}

TRAJECTORY SCORES:
- EFFICIENT: Direct path to goal, minimal token waste, clean execution
- GOOD: Reasonable progress with minor detours or retries
- STRUGGLING: Multiple failures or approach changes, but making progress
- INEFFICIENT: Circular patterns, repeated failures on same issue, high waste

SIGNALS to look for (list 1-3):
- "Clean implementation, no retries"
- "3 consecutive Bash failures"
- "Read same file N times"
- "Changed approach after failure"
- "Stuck in edit-error-revert loop"
- "High token usage, few changes"

Be factual and concise. Focus on efficiency patterns, not just activity."""


@dataclass
class TrajectoryAnalysis:
    """Analysis of agent activity with trajectory scoring."""
    generation_id: Optional[str]
    window_start: str
    window_end: str
    summary: str
    trajectory_score: str  # EFFICIENT, GOOD, STRUGGLING, INEFFICIENT
    trajectory_signals: List[str]
    stats: Dict[str, Any]  # tokens, cost, tools, entry_count


class HaikuAnalyzer:
    """
    Analyzes log batches using GPT-4o-mini for trajectory assessment.

    Cost: ~$0.001 per analysis
    Latency: ~1-2 seconds
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize analyzer.

        Args:
            api_key: OpenAI API key (defaults to OPENAI_API_KEY env var)
        """
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY")
        self._client = None
        self._cumulative_cost = 0.0
        self._cumulative_tokens = {"input": 0, "output": 0}

    def _get_client(self):
        """Lazy-load OpenAI client."""
        if self._client is None:
            try:
                import openai
                self._client = openai.OpenAI(api_key=self.api_key)
            except ImportError:
                logger.error("openai package not installed")
                raise
        return self._client

    def analyze(self, batch: LogBatch) -> Optional[TrajectoryAnalysis]:
        """
        Analyze a batch of log entries for trajectory quality.

        Args:
            batch: LogBatch containing entries to analyze

        Returns:
            TrajectoryAnalysis object or None if analysis fails/skipped
        """
        if not batch.entries:
            return None

        if not self.api_key:
            logger.warning("No OpenAI API key - skipping trajectory analysis")
            return None  # No fallback - just skip

        try:
            # Prepare log content
            log_content = self._format_entries_for_prompt(batch.entries)

            # Call GPT-4o-mini
            client = self._get_client()
            response = client.chat.completions.create(
                model=OPENAI_MODEL,
                max_tokens=MAX_OUTPUT_TOKENS,
                messages=[
                    {"role": "system", "content": ANALYZER_SYSTEM_PROMPT},
                    {"role": "user", "content": f"Analyze this agent activity:\n\n{log_content}"}
                ]
            )

            # Parse response
            response_text = response.choices[0].message.content
            analysis_data = json.loads(response_text)

            # Update cumulative stats
            self._cumulative_cost += batch.total_cost
            batch_tokens = batch.total_tokens
            self._cumulative_tokens["input"] += batch_tokens["input"]
            self._cumulative_tokens["output"] += batch_tokens["output"]

            # Extract trajectory data
            trajectory = analysis_data.get("trajectory", {})

            return TrajectoryAnalysis(
                generation_id=batch.generation_id,
                window_start=batch.window_start.isoformat() + "Z",
                window_end=batch.window_end.isoformat() + "Z",
                summary=analysis_data.get("summary", "No summary available"),
                trajectory_score=trajectory.get("score", "GOOD"),
                trajectory_signals=trajectory.get("signals", []),
                stats={
                    "tokens": self._cumulative_tokens.copy(),
                    "cost_usd": self._cumulative_cost,
                    "tools": batch.tool_usage,
                    "entry_count": len(batch.entries)
                }
            )

        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse Haiku response as JSON: {e}")
            return None  # No fallback - just skip
        except Exception as e:
            logger.error(f"Haiku analysis failed: {e}")
            return None  # No fallback - just skip

    def _format_entries_for_prompt(self, entries: list) -> str:
        """Format log entries for the Haiku prompt."""
        lines = []
        for e in entries:
            entry_type = e.get("type", "unknown")
            agent = e.get("agent", "unknown")
            timestamp = e.get("timestamp", "")[:19]  # Trim to seconds

            if entry_type == "user_prompt":
                content = e.get("content", "")[:200]  # Truncate long prompts
                lines.append(f"[{timestamp}] {agent} received prompt: {content}...")

            elif entry_type == "assistant_message":
                turn = e.get("turn", "?")
                tools = e.get("tool_uses", [])
                tool_names = [t.get("name", "?") for t in tools]
                text_blocks = e.get("text_blocks", [])
                text_preview = (text_blocks[0][:100] if text_blocks else "")
                lines.append(f"[{timestamp}] {agent} turn {turn}: tools={tool_names}")
                if text_preview:
                    lines.append(f"    response: {text_preview}...")

            elif entry_type == "result":
                success = e.get("success", False)
                cost = e.get("cost_usd", 0)
                status = "SUCCESS" if success else "FAILED"
                lines.append(f"[{timestamp}] {agent} {status} (${cost:.4f})")

            elif entry_type == "error":
                error_msg = e.get("error_message", "unknown error")[:100]
                lines.append(f"[{timestamp}] {agent} ERROR: {error_msg}")

        # Limit total length to avoid token overflow
        result = "\n".join(lines)
        if len(result) > 4000:
            result = result[:4000] + "\n... (truncated)"
        return result

    def reset_cumulative_stats(self) -> None:
        """Reset cumulative cost and token counters (call at generation start)."""
        self._cumulative_cost = 0.0
        self._cumulative_tokens = {"input": 0, "output": 0}


# System prompt for user-friendly summaries (non-dev users)
FRIENDLY_SUMMARIZER_PROMPT = """You are a friendly assistant summarizing app building progress for non-technical users.

Given agent activity logs, create a SHORT, FRIENDLY message about what's happening.

Output JSON only with this structure:
{
  "message": "A single friendly sentence about current progress (max 15 words)",
  "category": "setup|planning|building|testing|deploying|working"
}

RULES:
- Keep it simple and positive
- NO technical jargon (no "tokens", "API", "schema", "database", "commit", "migration", "endpoint")
- NO AI/model references (no "agent", "Claude", "GPT", "LLM", "AI")
- Use friendly language like "Setting things up...", "Building your features...", "Almost there!"
- Category must match: setup (initializing), planning (designing), building (coding), testing (verifying), deploying (publishing), working (general progress)

EXAMPLE OUTPUTS:
{"message": "Getting everything ready for your app...", "category": "setup"}
{"message": "Designing your app's structure...", "category": "planning"}
{"message": "Building your features...", "category": "building"}
{"message": "Making sure everything works correctly...", "category": "testing"}
{"message": "Publishing your app online...", "category": "deploying"}
{"message": "Making progress on your app...", "category": "working"}"""


@dataclass
class FriendlyUpdate:
    """User-friendly status update for non-dev users."""
    generation_id: Optional[str]
    message: str  # User-friendly message
    category: str  # "setup" | "planning" | "building" | "testing" | "deploying" | "working"
    timestamp: str  # ISO timestamp


class FriendlySummarizer:
    """
    Generates user-friendly status messages from agent activity.

    For non-developer users who don't need technical details.
    Uses GPT-4o-mini for cheap, fast summarization.

    Cost: ~$0.001 per summary
    Latency: ~1-2 seconds
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize friendly summarizer.

        Args:
            api_key: OpenAI API key (defaults to OPENAI_API_KEY env var)
        """
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY")
        self._client = None

    def _get_client(self):
        """Lazy-load OpenAI client."""
        if self._client is None:
            try:
                import openai
                self._client = openai.OpenAI(api_key=self.api_key)
            except ImportError:
                logger.error("openai package not installed")
                raise
        return self._client

    def summarize(self, batch: LogBatch) -> Optional[FriendlyUpdate]:
        """
        Generate a user-friendly summary from a batch of log entries.

        Args:
            batch: LogBatch containing entries to summarize

        Returns:
            FriendlyUpdate object or None if summarization fails/skipped
        """
        if not batch.entries:
            return None

        if not self.api_key:
            logger.warning("No OpenAI API key - skipping friendly summary")
            return self._fallback_summary(batch)

        try:
            # Prepare simplified log content
            log_content = self._format_entries_simplified(batch.entries)

            # Call GPT-4o-mini
            client = self._get_client()
            response = client.chat.completions.create(
                model=OPENAI_MODEL,
                max_tokens=100,  # Short responses only
                messages=[
                    {"role": "system", "content": FRIENDLY_SUMMARIZER_PROMPT},
                    {"role": "user", "content": f"Summarize this progress:\n\n{log_content}"}
                ]
            )

            # Parse response
            response_text = response.choices[0].message.content
            data = json.loads(response_text)

            return FriendlyUpdate(
                generation_id=batch.generation_id,
                message=data.get("message", "Working on your app..."),
                category=data.get("category", "working"),
                timestamp=batch.window_end.isoformat() + "Z"
            )

        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse friendly summary response: {e}")
            return self._fallback_summary(batch)
        except Exception as e:
            logger.error(f"Friendly summarization failed: {e}")
            return self._fallback_summary(batch)

    def _format_entries_simplified(self, entries: list) -> str:
        """Format log entries in a simplified way for friendly summary."""
        lines = []
        for e in entries:
            entry_type = e.get("type", "unknown")

            if entry_type == "assistant_message":
                tools = e.get("tool_uses", [])
                tool_names = [t.get("name", "?") for t in tools]
                # Map technical tool names to friendly activities
                for tool in tool_names:
                    if tool in ("Read", "Glob", "Grep"):
                        lines.append("Looking at files")
                    elif tool in ("Write", "Edit"):
                        lines.append("Writing code")
                    elif tool == "Bash":
                        lines.append("Running commands")
                    elif "test" in tool.lower():
                        lines.append("Testing")
                    elif "build" in tool.lower():
                        lines.append("Building")

            elif entry_type == "result":
                success = e.get("success", False)
                if success:
                    lines.append("Completed a task")

        # Deduplicate and limit
        unique_lines = list(dict.fromkeys(lines))[:10]
        return "\n".join(unique_lines) if unique_lines else "Working..."

    def _fallback_summary(self, batch: LogBatch) -> FriendlyUpdate:
        """Generate a fallback summary when API is unavailable."""
        # Analyze entries to pick appropriate message
        has_writes = False
        has_tests = False
        has_bash = False

        for e in batch.entries:
            tools = e.get("tool_uses", [])
            for tool in tools:
                tool_name = tool.get("name", "")
                if tool_name in ("Write", "Edit"):
                    has_writes = True
                elif "test" in tool_name.lower():
                    has_tests = True
                elif tool_name == "Bash":
                    has_bash = True

        # Pick message based on activity
        if has_tests:
            message = "Making sure everything works correctly..."
            category = "testing"
        elif has_writes:
            message = "Building your features..."
            category = "building"
        elif has_bash:
            message = "Setting things up..."
            category = "setup"
        else:
            message = "Working on your app..."
            category = "working"

        return FriendlyUpdate(
            generation_id=batch.generation_id,
            message=message,
            category=category,
            timestamp=batch.window_end.isoformat() + "Z"
        )
