"""Conversation logger for capturing full agent execution flow.

This module provides comprehensive logging of agent conversations including:
- User prompts
- Assistant responses (text, thinking, tool uses)
- Tool results
- Session metadata

Conversations are logged to both:
1. Human-readable text files (for quick review)
2. JSONL files (for detailed forensics and replay)
"""

import json
import logging
from pathlib import Path
from datetime import datetime
from typing import Optional, Any, Dict
from claude_agent_sdk import AssistantMessage, UserMessage, ResultMessage, SystemMessage

logger = logging.getLogger(__name__)

# Maximum size for tool input to log (1MB to prevent buffer overflow)
MAX_TOOL_INPUT_SIZE = 1024 * 1024  # 1MB


# Type for callback function
from typing import Callable
ConversationCallback = Callable[[Dict[str, Any]], None]


class ConversationLogger:
    """Logs full conversation flow for an agent execution."""

    def __init__(
        self,
        agent_name: str,
        log_dir: Path,
        session_id: Optional[str] = None,
        enable_jsonl: bool = True,
        enable_text: bool = True,
        on_log: Optional[ConversationCallback] = None
    ):
        """
        Initialize conversation logger.

        Args:
            agent_name: Name of the agent
            log_dir: Directory to write logs
            session_id: Optional session ID for continuity
            enable_jsonl: Enable JSONL transcript logging
            enable_text: Enable human-readable text logging
            on_log: Optional callback for real-time log streaming (receives dict entries)
        """
        self.agent_name = agent_name
        self.log_dir = Path(log_dir)
        self.session_id = session_id or datetime.now().strftime("%Y%m%d_%H%M%S")
        self.enable_jsonl = enable_jsonl
        self.enable_text = enable_text
        self.on_log = on_log

        # Create log directory
        self.log_dir.mkdir(parents=True, exist_ok=True)

        # Generate safe filename from agent name
        safe_name = agent_name.replace(" ", "_").replace("/", "_")

        # Initialize log files
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.jsonl_path = self.log_dir / f"conversation_{safe_name}_{timestamp}.jsonl"
        self.text_path = self.log_dir / f"conversation_{safe_name}_{timestamp}.txt"

        # Initialize text log with header
        if self.enable_text:
            with open(self.text_path, 'w') as f:
                f.write(f"{'='*80}\n")
                f.write(f"Agent: {agent_name}\n")
                f.write(f"Session: {self.session_id}\n")
                f.write(f"Started: {datetime.now().isoformat()}\n")
                f.write(f"{'='*80}\n\n")

        logger.info(f"📝 Conversation logging initialized for '{agent_name}'")
        if self.enable_jsonl:
            logger.info(f"   JSONL: {self.jsonl_path}")
        if self.enable_text:
            logger.info(f"   Text: {self.text_path}")
        if self.on_log:
            logger.info(f"   Callback: enabled (real-time streaming)")

    def _emit_callback(self, entry: Dict[str, Any]):
        """Emit log entry to callback if registered."""
        if self.on_log:
            try:
                self.on_log(entry)
            except Exception as e:
                logger.warning(f"Conversation callback error: {e}")

    def log_user_prompt(self, prompt: str, metadata: Optional[Dict[str, Any]] = None):
        """Log a user prompt."""
        timestamp = datetime.now().isoformat()

        entry = {
            "timestamp": timestamp,
            "type": "user_prompt",
            "agent": self.agent_name,
            "content": prompt,
            "metadata": metadata or {}
        }

        # Emit to callback for real-time streaming
        self._emit_callback(entry)

        # JSONL format
        if self.enable_jsonl:
            self._append_jsonl(entry)

        # Human-readable format
        if self.enable_text:
            with open(self.text_path, 'a') as f:
                f.write(f"\n{'='*80}\n")
                f.write(f"USER PROMPT [{timestamp}]\n")
                f.write(f"{'='*80}\n")
                f.write(f"{prompt}\n")

    def _sanitize_tool_input(self, tool_name: str, tool_input: Any) -> Any:
        """
        Sanitize tool input to prevent buffer overflow.

        For screenshot/binary tools, replace large payloads with metadata.
        """
        # Convert to JSON to check size
        try:
            json_str = json.dumps(tool_input)
            size = len(json_str)

            # If size exceeds limit, return sanitized version
            if size > MAX_TOOL_INPUT_SIZE:
                logger.warning(
                    f"Tool input for {tool_name} exceeds {MAX_TOOL_INPUT_SIZE} bytes "
                    f"({size:,} bytes). Truncating for log."
                )

                # Return metadata instead of full payload
                return {
                    "_truncated": True,
                    "_original_size_bytes": size,
                    "_reason": "Exceeded maximum log size (likely binary/image data)",
                    "_tool": tool_name,
                    # Include non-binary fields if it's a dict
                    **({k: v for k, v in tool_input.items()
                        if isinstance(v, (str, int, float, bool)) and len(str(v)) < 1000}
                       if isinstance(tool_input, dict) else {})
                }

            return tool_input

        except (TypeError, ValueError) as e:
            # If it can't be JSON serialized, return metadata
            logger.warning(f"Failed to serialize tool input for {tool_name}: {e}")
            return {
                "_error": "Failed to serialize",
                "_tool": tool_name,
                "_type": str(type(tool_input))
            }

    def log_assistant_message(
        self,
        message: AssistantMessage,
        turn: int,
        max_turns: int
    ):
        """Log an assistant message with all its content blocks."""
        timestamp = datetime.now().isoformat()

        # Extract all content blocks
        text_blocks = []
        thinking_blocks = []
        tool_use_blocks = []

        for block in message.content:
            block_type = type(block).__name__

            if block_type == "TextBlock":
                text_blocks.append(block.text)
            elif block_type == "ThinkingBlock":
                thinking_blocks.append(block.thinking)
            elif block_type == "ToolUseBlock":
                # Sanitize tool input to prevent buffer overflow
                sanitized_input = self._sanitize_tool_input(block.name, block.input)

                tool_use_blocks.append({
                    "name": block.name,
                    "id": block.id,
                    "input": sanitized_input
                })

        # Build entry
        entry = {
            "timestamp": timestamp,
            "type": "assistant_message",
            "agent": self.agent_name,
            "turn": f"{turn}/{max_turns}",
            "text_blocks": text_blocks,
            "thinking_blocks": thinking_blocks,
            "tool_uses": tool_use_blocks
        }

        # Emit to callback for real-time streaming
        self._emit_callback(entry)

        # JSONL format
        if self.enable_jsonl:
            self._append_jsonl(entry)

        # Human-readable format
        if self.enable_text:
            with open(self.text_path, 'a') as f:
                f.write(f"\n{'='*80}\n")
                f.write(f"ASSISTANT RESPONSE - Turn {turn}/{max_turns} [{timestamp}]\n")
                f.write(f"{'='*80}\n")

                # Log thinking blocks (if any)
                if thinking_blocks:
                    f.write(f"\n--- Thinking ---\n")
                    for thinking in thinking_blocks:
                        f.write(f"{thinking}\n")

                # Log text blocks
                if text_blocks:
                    f.write(f"\n--- Response ---\n")
                    for text in text_blocks:
                        f.write(f"{text}\n")

                # Log tool uses
                if tool_use_blocks:
                    f.write(f"\n--- Tool Uses ---\n")
                    for tool in tool_use_blocks:
                        f.write(f"🔧 {tool['name']} (id: {tool['id']})\n")

                        # Try to format input, handle large payloads gracefully
                        try:
                            input_str = json.dumps(tool['input'], indent=2)

                            # Truncate very large inputs for text log
                            if len(input_str) > 5000:
                                f.write(f"   Input: [Truncated - {len(input_str):,} chars]\n")
                                if tool['input'].get('_truncated'):
                                    f.write(f"   {tool['input']}\n")
                                else:
                                    f.write(f"   {input_str[:5000]}...\n")
                            else:
                                f.write(f"   Input: {input_str}\n")
                        except Exception as e:
                            f.write(f"   Input: [Error formatting: {e}]\n")

    def log_result(
        self,
        result: ResultMessage,
        success: bool,
        termination_reason: str
    ):
        """Log final result message."""
        timestamp = datetime.now().isoformat()

        # Extract token usage from usage dict (may be None)
        usage = result.usage or {}
        input_tokens = usage.get("input_tokens", 0)
        output_tokens = usage.get("output_tokens", 0)

        # Build entry
        entry = {
            "timestamp": timestamp,
            "type": "result",
            "agent": self.agent_name,
            "success": success,
            "termination_reason": termination_reason,
            "cost_usd": result.total_cost_usd,
            "duration_ms": result.duration_ms,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "num_turns": getattr(result, "num_turns", 0)
        }

        # Emit to callback for real-time streaming
        self._emit_callback(entry)

        # JSONL format
        if self.enable_jsonl:
            self._append_jsonl(entry)

        # Human-readable format
        if self.enable_text:
            with open(self.text_path, 'a') as f:
                f.write(f"\n{'='*80}\n")
                f.write(f"RESULT [{timestamp}]\n")
                f.write(f"{'='*80}\n")
                f.write(f"Success: {success}\n")
                f.write(f"Termination: {termination_reason}\n")
                f.write(f"Cost: ${result.total_cost_usd:.4f}\n")
                f.write(f"Duration: {result.duration_ms}ms\n")
                f.write(f"Tokens: {input_tokens:,} in, {output_tokens:,} out\n")

    def log_error(
        self,
        error: Exception,
        turn: int,
        partial_content: str
    ):
        """Log an error during execution."""
        timestamp = datetime.now().isoformat()

        entry = {
            "timestamp": timestamp,
            "type": "error",
            "agent": self.agent_name,
            "turn": turn,
            "error_type": type(error).__name__,
            "error_message": str(error),
            "partial_content": partial_content
        }

        # Emit to callback for real-time streaming
        self._emit_callback(entry)

        # JSONL format
        if self.enable_jsonl:
            self._append_jsonl(entry)

        # Human-readable format
        if self.enable_text:
            with open(self.text_path, 'a') as f:
                f.write(f"\n{'='*80}\n")
                f.write(f"ERROR at Turn {turn} [{timestamp}]\n")
                f.write(f"{'='*80}\n")
                f.write(f"Type: {type(error).__name__}\n")
                f.write(f"Message: {str(error)}\n")
                if partial_content:
                    f.write(f"\nPartial output before error:\n{partial_content}\n")

    def log_system_message(self, message: str, level: str = "INFO"):
        """Log a system/metadata message."""
        timestamp = datetime.now().isoformat()

        entry = {
            "timestamp": timestamp,
            "type": "system",
            "agent": self.agent_name,
            "level": level,
            "message": message
        }

        # Emit to callback for real-time streaming
        self._emit_callback(entry)

        # JSONL format
        if self.enable_jsonl:
            self._append_jsonl(entry)

        # Human-readable format
        if self.enable_text:
            with open(self.text_path, 'a') as f:
                f.write(f"\n[{level}] {message}\n")

    def _append_jsonl(self, entry: Dict[str, Any]):
        """Append an entry to the JSONL log file with graceful error handling."""
        try:
            # Try to serialize to JSON first (may fail with large/binary data)
            json_str = json.dumps(entry)

            # Check size before writing
            size = len(json_str)
            if size > MAX_TOOL_INPUT_SIZE * 2:  # 2MB max for entire entry
                logger.warning(
                    f"Entry size ({size:,} bytes) exceeds safe limit. "
                    f"Creating truncated version."
                )

                # Create a minimal version with just metadata
                truncated_entry = {
                    "timestamp": entry.get("timestamp"),
                    "type": entry.get("type"),
                    "agent": entry.get("agent"),
                    "_truncated": True,
                    "_original_size_bytes": size,
                    "_reason": "Entry exceeded 2MB limit"
                }

                # Add type-specific essential fields
                if entry.get("type") == "assistant_message":
                    truncated_entry["turn"] = entry.get("turn")
                    truncated_entry["tool_count"] = len(entry.get("tool_uses", []))
                elif entry.get("type") == "result":
                    truncated_entry.update({
                        "success": entry.get("success"),
                        "cost_usd": entry.get("cost_usd"),
                        "duration_ms": entry.get("duration_ms")
                    })

                json_str = json.dumps(truncated_entry)

            # Write to file
            with open(self.jsonl_path, 'a') as f:
                f.write(json_str + '\n')

        except (TypeError, ValueError) as e:
            # JSON serialization failed - log error entry instead
            logger.error(f"Failed to serialize entry to JSON: {e}")
            error_entry = {
                "timestamp": datetime.now().isoformat(),
                "type": "logging_error",
                "agent": self.agent_name,
                "error": str(e),
                "original_type": entry.get("type", "unknown")
            }
            try:
                with open(self.jsonl_path, 'a') as f:
                    f.write(json.dumps(error_entry) + '\n')
            except Exception as e2:
                logger.error(f"Failed to write error entry: {e2}")

        except Exception as e:
            # File write or other error
            logger.error(f"Failed to write JSONL log: {e}")

    def finalize(self):
        """Finalize the conversation log."""
        if self.enable_text:
            with open(self.text_path, 'a') as f:
                f.write(f"\n{'='*80}\n")
                f.write(f"Conversation ended: {datetime.now().isoformat()}\n")
                f.write(f"{'='*80}\n")

        logger.info(f"✅ Conversation log finalized for '{self.agent_name}'")
