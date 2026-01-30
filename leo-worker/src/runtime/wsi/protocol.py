"""
WSI Protocol v2.1 Message Types and Parser/Serializer

Defines Pydantic models for all WSI Protocol v2.1 messages and provides
parsing/serialization utilities for WebSocket communication.
"""

import json
import logging
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field, field_validator

logger = logging.getLogger(__name__)


# ============================================================================
# Base Message Type
# ============================================================================

class WSIMessage(BaseModel):
    """Base class for all WSI Protocol messages"""
    type: str

    class Config:
        extra = "allow"  # Allow extra fields for forward compatibility


# ============================================================================
# Server  Client Messages
# ============================================================================

class ReadyMessage(WSIMessage):
    """
    Container initialized and ready to accept commands.
    Sent immediately after WebSocket connection established.
    """
    type: str = "ready"
    container_id: Optional[str] = None
    workspace: Optional[str] = None
    generator_mode: Optional[str] = None  # "real" or "mock"


class LogMessage(WSIMessage):
    """
    Console output streaming from AppGeneratorAgent.
    Sent continuously during generation.
    """
    type: str = "log"
    line: str
    level: Optional[str] = "info"  # "info", "warn", "error", "debug"


class ConversationLogMessage(WSIMessage):
    """
    Real-time conversation log entry from cc-agent's ConversationLogger.
    Streams agent reasoning, tool uses, and responses for monitoring.
    NEW in v2.1
    """
    type: str = "conversation_log"
    timestamp: str
    entry_type: str  # "user_prompt", "assistant_message", "result", "error", "system"
    agent: str  # Name of the agent emitting the log
    # Entry-specific fields (varies by entry_type)
    content: Optional[str] = None  # user_prompt content
    text_blocks: Optional[List[str]] = None  # assistant text blocks
    thinking_blocks: Optional[List[str]] = None  # assistant thinking blocks
    tool_uses: Optional[List[Dict[str, Any]]] = None  # assistant tool uses
    turn: Optional[str] = None  # e.g., "3/10"
    success: Optional[bool] = None  # result success
    termination_reason: Optional[str] = None  # result termination reason
    cost_usd: Optional[float] = None  # result cost
    duration_ms: Optional[int] = None  # result duration
    input_tokens: Optional[int] = None  # result tokens
    output_tokens: Optional[int] = None  # result tokens
    error_type: Optional[str] = None  # error type name
    error_message: Optional[str] = None  # error message
    level: Optional[str] = None  # system log level
    message: Optional[str] = None  # system message


class ProgressMessage(WSIMessage):
    """
    Structured progress updates at key generation milestones.
    """
    type: str = "progress"
    stage: Optional[str] = None  # e.g., "planning", "coding"
    step: Optional[str] = None
    percentage: Optional[int] = None
    iteration: Optional[int] = None
    total_iterations: Optional[int] = None


class DecisionPromptMessage(WSIMessage):
    """
    Request user decision in interactive/confirm_first modes.
    """
    type: str = "decision_prompt"
    id: str  # Correlation ID for response matching
    prompt: str
    suggested_task: Optional[str] = None  # Renamed from suggested_prompt in v2.1
    allow_editor: Optional[bool] = True
    iteration: Optional[int] = None
    max_iterations: Optional[int] = None
    options: Optional[List[str]] = None


class DecisionFollowUpMessage(WSIMessage):
    """
    Two-step decision flow - request follow-up details for add/redirect.
    NEW in v2.1
    """
    type: str = "decision_follow_up"
    id: str  # New correlation ID for this follow-up
    parent_id: str  # ID of original decision_prompt
    prompt: str
    action: str  # "add" or "redirect"


class SessionLoadedMessage(WSIMessage):
    """
    Session successfully loaded from disk (when resuming).
    NEW in v2.1
    """
    type: str = "session_loaded"
    session_id: str
    app_path: str
    features: Optional[List[str]] = None
    iterations: Optional[int] = None
    last_action: Optional[str] = None


class SessionSavedMessage(WSIMessage):
    """
    Session saved to disk confirmation.
    NEW in v2.1
    """
    type: str = "session_saved"
    session_id: str
    app_path: str
    auto: Optional[bool] = False  # True if auto-saved vs explicit /save


class SessionClearedMessage(WSIMessage):
    """
    Session cleared from disk confirmation.
    NEW in v2.1
    """
    type: str = "session_cleared"
    app_path: str


class ContextDisplayMessage(WSIMessage):
    """
    Current session context information.
    NEW in v2.1
    """
    type: str = "context_display"
    session_id: Optional[str] = None
    app_path: str
    features: Optional[List[str]] = None
    iterations: Optional[int] = None
    last_action: Optional[str] = None
    mode: Optional[str] = None


class IterationCompleteMessage(WSIMessage):
    """
    Single iteration completed, more work may follow.
    """
    type: str = "iteration_complete"
    iteration: int
    session_id: Optional[str] = None
    session_saved: Optional[bool] = None
    app_path: str
    stats: Optional[Dict[str, Any]] = None
    duration: Optional[int] = None  # milliseconds
    iteration_cost: Optional[float] = None  # USD - cost for this iteration only
    # App credentials to persist for resume (for early persistence in case of crash)
    # Each credential: {"key": str, "value": str}
    credentials: Optional[List[Dict[str, str]]] = None


class AllWorkCompleteMessage(WSIMessage):
    """
    All iterations done, ready for shutdown.
    Container has already pushed to GitHub and uploaded to S3.
    """
    type: str = "all_work_complete"
    # Completion reasons:
    # - "autonomous_complete": Autonomous mode finished successfully
    # - "max_iterations": Reached max iterations limit
    # - "user_done": User indicated they're done (interactive mode)
    # - "error": Generation failed with error
    completion_reason: str
    app_path: str
    session_id: Optional[str] = None
    github_url: Optional[str] = None
    github_commit: Optional[str] = None  # Git commit SHA pushed to GitHub
    flyio_url: Optional[str] = None  # Fly.io deployment URL (e.g., https://app-name.fly.dev)
    s3_url: Optional[str] = None
    download_url: Optional[str] = None
    total_iterations: int
    total_duration: Optional[int] = None  # milliseconds
    total_cost: Optional[float] = None  # USD - aggregated from all agent calls
    stats: Optional[Dict[str, Any]] = None
    # Warnings detected during generation (e.g., RLS not enabled)
    # Each warning: {"code": str, "message": str, "details": dict}
    warnings: Optional[List[Dict[str, Any]]] = None
    # App credentials to persist for resume (Supabase, DB URLs)
    # Each credential: {"key": str, "value": str}
    credentials: Optional[List[Dict[str, str]]] = None


class TaskInterruptedMessage(WSIMessage):
    """
    Task interrupted by user (Ctrl+C, stop button).
    NEW in v2.1
    """
    type: str = "task_interrupted"
    iteration: Optional[int] = None
    session_id: Optional[str] = None
    app_path: str
    can_resume: Optional[bool] = True


class ErrorMessage(WSIMessage):
    """
    Fatal or non-fatal error occurred.
    """
    type: str = "error"
    message: str
    error_code: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    fatal: Optional[bool] = True  # If false, container can recover
    recovery_hint: Optional[str] = None


class ScreenshotMessage(WSIMessage):
    """
    Screenshot captured during testing/quality assurance.
    Streams screenshots to the browser for live preview.
    NEW in v2.2
    """
    type: str = "screenshot"
    timestamp: str  # ISO timestamp when screenshot was captured
    image_base64: str  # data:image/png;base64,... format
    filename: str  # Original filename (e.g., "homepage-test.png")
    description: Optional[str] = None  # What the screenshot shows
    width: Optional[int] = None  # Image width in pixels
    height: Optional[int] = None  # Image height in pixels
    stage: Optional[str] = None  # Generation stage (e.g., "quality_assurance", "iteration_1")


class SummaryUpdateMessage(WSIMessage):
    """
    Haiku-generated summary of agent activity.
    Streamed periodically (every 60s) during generation.
    NEW in v2.3
    """
    type: str = "summary_update"
    generation_id: Optional[str] = None
    window: Optional[Dict[str, str]] = None  # {"start": ISO, "end": ISO}
    cumulative: Optional[Dict[str, Any]] = None  # {"cost_usd": float, "tokens": {...}}
    agents: Optional[List[Dict[str, Any]]] = None  # Agent activity summaries
    tool_usage: Optional[Dict[str, int]] = None  # Tool counts
    errors: Optional[List[str]] = None
    warnings: Optional[List[str]] = None
    entry_count: Optional[int] = None  # Number of log entries summarized


class ProcessMonitorMessage(WSIMessage):
    """
    Real-time trajectory analysis of agent activity.
    Provides summary of what happened and trajectory efficiency scoring.
    Streamed periodically (every 60s) during generation.
    NEW in v2.4
    """
    type: str = "process_monitor"
    generation_id: Optional[str] = None
    window: Optional[Dict[str, str]] = None  # {"start": ISO, "end": ISO}
    summary: Optional[str] = None  # 2-3 sentence summary of what agent accomplished
    trajectory: Optional[Dict[str, Any]] = None  # {"score": str, "signals": list}
    stats: Optional[Dict[str, Any]] = None  # {"tokens": {...}, "cost_usd": float, "tools": {...}}


class FriendlyLogMessage(WSIMessage):
    """
    User-friendly status update for non-developer users.
    Shows simple, non-technical progress messages.
    Emitted at key generation phases (every 60s or at phase transitions).
    NEW in v2.5
    """
    type: str = "friendly_log"
    message: str  # User-friendly message (e.g., "Building your features...")
    category: str  # "setup" | "planning" | "building" | "testing" | "deploying" | "done" | "working"
    timestamp: str  # ISO timestamp
    generation_id: Optional[str] = None


# ============================================================================
# Client  Server Messages
# ============================================================================

class AttachmentInfo(BaseModel):
    """Metadata for an attached context file."""
    name: str  # Original filename
    storagePath: str  # Path in Supabase Storage
    size: int  # File size in bytes
    mimeType: str  # MIME type


class StartGenerationMessage(WSIMessage):
    """
    Begin app generation with specified prompt and mode.

    Modes:
    - autonomous: Reprompter runs continuously until max_iterations reached
    - confirm_first: Reprompter suggests, user confirms each iteration

    For new apps: app_name is required
    For resume: app_path is required
    """
    type: str = "start_generation"
    prompt: str
    mode: str  # "autonomous" or "confirm_first"
    max_iterations: Optional[int] = 10  # Required for autonomous mode
    app_path: Optional[str] = None  # Resume existing app if provided
    app_name: Optional[str] = None  # Required for new apps
    resume_session_id: Optional[str] = None
    enable_subagents: Optional[bool] = True
    output_dir: Optional[str] = None
    attachments: Optional[List[AttachmentInfo]] = None  # Context files from user

    @field_validator('mode')
    @classmethod
    def validate_mode(cls, v):
        """Enforce that mode is only 'autonomous' or 'confirm_first'"""
        valid_modes = ['autonomous', 'confirm_first']
        if v not in valid_modes:
            raise ValueError(f"Invalid mode '{v}'. Must be one of: {valid_modes}")
        return v

    def model_post_init(self, __context) -> None:
        """Validate that max_iterations is set for autonomous mode"""
        if self.mode == 'autonomous' and not self.max_iterations:
            raise ValueError("max_iterations is required for autonomous mode")


class DecisionResponseMessage(WSIMessage):
    """
    User's decision in response to decision_prompt or decision_follow_up.
    """
    type: str = "decision_response"
    id: str  # Matches decision_prompt.id or decision_follow_up.id
    parent_id: Optional[str] = None  # If responding to follow-up
    choice: str  # "yes", "add", "redirect", "done", "/context", "/save", "/clear", or custom
    input: Optional[str] = None  # Additional input for follow-ups or custom prompts


class UserInputMessage(WSIMessage):
    """
    Mid-generation user input to inject additional guidance into the agent.
    NEW in v2.2

    Allows users to send messages to the agent while it's actively working,
    similar to typing in the Claude Code CLI while the agent is running.
    """
    type: str = "user_input"
    content: str  # User's message to inject into agent


class ControlCommandMessage(WSIMessage):
    """
    Control command from orchestrator (pause, resume, cancel, shutdown).
    """
    type: str = "control_command"
    command: str  # "pause", "resume", "cancel", "stop_request", "prepare_shutdown"
    reason: Optional[str] = None


class ShutdownReadyMessage(WSIMessage):
    """
    Container has saved all work and is ready to be terminated.
    Sent in response to prepare_shutdown command.
    """
    type: str = "shutdown_ready"
    commit_hash: Optional[str] = None
    pushed: Optional[bool] = None
    message: Optional[str] = None


class ShutdownFailedMessage(WSIMessage):
    """
    Container failed to save work during shutdown.
    Sent in response to prepare_shutdown command if save fails.
    """
    type: str = "shutdown_failed"
    reason: str


# ============================================================================
# Message Parser
# ============================================================================

class MessageParser:
    """
    Parse incoming JSON messages into typed message objects.
    """

    # Map message types to their corresponding classes
    MESSAGE_TYPES = {
        "ready": ReadyMessage,
        "log": LogMessage,
        "conversation_log": ConversationLogMessage,
        "progress": ProgressMessage,
        "decision_prompt": DecisionPromptMessage,
        "decision_follow_up": DecisionFollowUpMessage,
        "decision_response": DecisionResponseMessage,
        "user_input": UserInputMessage,
        "control_command": ControlCommandMessage,
        "shutdown_ready": ShutdownReadyMessage,
        "shutdown_failed": ShutdownFailedMessage,
        "session_loaded": SessionLoadedMessage,
        "session_saved": SessionSavedMessage,
        "session_cleared": SessionClearedMessage,
        "context_display": ContextDisplayMessage,
        "iteration_complete": IterationCompleteMessage,
        "all_work_complete": AllWorkCompleteMessage,
        "task_interrupted": TaskInterruptedMessage,
        "error": ErrorMessage,
        "screenshot": ScreenshotMessage,
        "summary_update": SummaryUpdateMessage,
        "process_monitor": ProcessMonitorMessage,
        "friendly_log": FriendlyLogMessage,
        "start_generation": StartGenerationMessage,
    }

    @classmethod
    def parse(cls, json_str: str) -> WSIMessage:
        """
        Parse JSON string into appropriate message type.

        Args:
            json_str: JSON string representation of message

        Returns:
            Parsed message object

        Raises:
            ValueError: If JSON is invalid or message type is unknown
            ValidationError: If message structure is invalid
        """
        try:
            data = json.loads(json_str)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON: {e}")

        if "type" not in data:
            raise ValueError("Message missing required 'type' field")

        msg_type = data["type"]
        msg_class = cls.MESSAGE_TYPES.get(msg_type)

        if msg_class is None:
            logger.warning(f"Unknown message type: {msg_type}, using base WSIMessage")
            return WSIMessage(**data)

        try:
            return msg_class(**data)
        except Exception as e:
            raise ValueError(f"Failed to parse {msg_type} message: {e}")


# ============================================================================
# Message Serializer
# ============================================================================

class MessageSerializer:
    """
    Serialize message objects into JSON strings for WebSocket transmission.
    """

    @classmethod
    def serialize(cls, message: WSIMessage) -> str:
        """
        Serialize message object to JSON string.

        Args:
            message: Message object to serialize

        Returns:
            JSON string representation
        """
        try:
            # Use Pydantic's model_dump to convert to dict, excluding None values
            data = message.model_dump(exclude_none=True, by_alias=False)
            return json.dumps(data)
        except Exception as e:
            logger.error(f"Failed to serialize message: {e}")
            raise ValueError(f"Serialization failed: {e}")


# ============================================================================
# Convenience Functions
# ============================================================================

def create_ready_message(
    container_id: Optional[str] = None,
    workspace: Optional[str] = None,
    generator_mode: Optional[str] = "mock"
) -> ReadyMessage:
    """Create a ready message"""
    return ReadyMessage(
        container_id=container_id,
        workspace=workspace,
        generator_mode=generator_mode
    )


def create_log_message(line: str, level: str = "info") -> LogMessage:
    """Create a log message"""
    return LogMessage(line=line, level=level)


def create_progress_message(
    stage: Optional[str] = None,
    step: Optional[str] = None,
    percentage: Optional[int] = None,
    iteration: Optional[int] = None,
    total_iterations: Optional[int] = None
) -> ProgressMessage:
    """Create a progress message"""
    return ProgressMessage(
        stage=stage,
        step=step,
        percentage=percentage,
        iteration=iteration,
        total_iterations=total_iterations
    )


def create_error_message(
    message: str,
    error_code: Optional[str] = None,
    fatal: bool = True,
    details: Optional[Dict[str, Any]] = None,
    recovery_hint: Optional[str] = None
) -> ErrorMessage:
    """Create an error message"""
    return ErrorMessage(
        message=message,
        error_code=error_code,
        fatal=fatal,
        details=details,
        recovery_hint=recovery_hint
    )


def create_iteration_complete_message(
    iteration: int,
    app_path: str,
    session_id: Optional[str] = None,
    session_saved: Optional[bool] = None,
    stats: Optional[Dict[str, Any]] = None,
    duration: Optional[int] = None,
    iteration_cost: Optional[float] = None,
    credentials: Optional[List[Dict[str, str]]] = None
) -> IterationCompleteMessage:
    """Create an iteration complete message"""
    return IterationCompleteMessage(
        iteration=iteration,
        app_path=app_path,
        session_id=session_id,
        session_saved=session_saved,
        stats=stats,
        duration=duration,
        iteration_cost=iteration_cost,
        credentials=credentials
    )


def create_all_work_complete_message(
    completion_reason: str,
    app_path: str,
    total_iterations: int,
    session_id: Optional[str] = None,
    github_url: Optional[str] = None,
    github_commit: Optional[str] = None,
    flyio_url: Optional[str] = None,
    s3_url: Optional[str] = None,
    download_url: Optional[str] = None,
    total_duration: Optional[int] = None,
    total_cost: Optional[float] = None,
    stats: Optional[Dict[str, Any]] = None,
    warnings: Optional[List[Dict[str, Any]]] = None,
    credentials: Optional[List[Dict[str, str]]] = None
) -> AllWorkCompleteMessage:
    """Create an all work complete message"""
    return AllWorkCompleteMessage(
        completion_reason=completion_reason,
        app_path=app_path,
        total_iterations=total_iterations,
        session_id=session_id,
        github_url=github_url,
        github_commit=github_commit,
        flyio_url=flyio_url,
        s3_url=s3_url,
        download_url=download_url,
        total_duration=total_duration,
        total_cost=total_cost,
        stats=stats,
        warnings=warnings,
        credentials=credentials
    )


def create_shutdown_ready_message(
    commit_hash: Optional[str] = None,
    pushed: Optional[bool] = None,
    message: Optional[str] = None
) -> ShutdownReadyMessage:
    """Create a shutdown ready message"""
    return ShutdownReadyMessage(
        commit_hash=commit_hash,
        pushed=pushed,
        message=message
    )


def create_shutdown_failed_message(
    reason: str
) -> ShutdownFailedMessage:
    """Create a shutdown failed message"""
    return ShutdownFailedMessage(
        reason=reason
    )


def create_conversation_log_message(entry: Dict[str, Any]) -> ConversationLogMessage:
    """
    Create a conversation log message from a ConversationLogger entry dict.

    Args:
        entry: Dictionary from ConversationLogger callback containing:
            - timestamp: ISO timestamp
            - type: Entry type (user_prompt, assistant_message, result, error, system)
            - agent: Agent name
            - Plus entry-specific fields

    Returns:
        ConversationLogMessage ready to send via WSI
    """
    # Convert turn to string if present (cc-agent sends it as an integer)
    turn_value = entry.get("turn")
    if turn_value is not None and not isinstance(turn_value, str):
        turn_value = str(turn_value)

    return ConversationLogMessage(
        timestamp=entry.get("timestamp", ""),
        entry_type=entry.get("type", "unknown"),
        agent=entry.get("agent", "unknown"),
        # User prompt fields
        content=entry.get("content"),
        # Assistant message fields
        text_blocks=entry.get("text_blocks"),
        thinking_blocks=entry.get("thinking_blocks"),
        tool_uses=entry.get("tool_uses"),
        turn=turn_value,
        # Result fields
        success=entry.get("success"),
        termination_reason=entry.get("termination_reason"),
        cost_usd=entry.get("cost_usd"),
        duration_ms=entry.get("duration_ms"),
        input_tokens=entry.get("input_tokens"),
        output_tokens=entry.get("output_tokens"),
        # Error fields
        error_type=entry.get("error_type"),
        error_message=entry.get("error_message"),
        # System fields
        level=entry.get("level"),
        message=entry.get("message"),
    )


def create_screenshot_message(
    timestamp: str,
    image_base64: str,
    filename: str,
    description: Optional[str] = None,
    width: Optional[int] = None,
    height: Optional[int] = None,
    stage: Optional[str] = None
) -> ScreenshotMessage:
    """
    Create a screenshot message for streaming to the browser.

    Args:
        timestamp: ISO timestamp when screenshot was captured
        image_base64: Base64 encoded image with data URI prefix (data:image/png;base64,...)
        filename: Original filename
        description: What the screenshot shows
        width: Image width in pixels
        height: Image height in pixels
        stage: Generation stage (e.g., "quality_assurance")

    Returns:
        ScreenshotMessage ready to send via WSI
    """
    return ScreenshotMessage(
        timestamp=timestamp,
        image_base64=image_base64,
        filename=filename,
        description=description,
        width=width,
        height=height,
        stage=stage
    )


def create_process_monitor_message(
    generation_id: Optional[str] = None,
    window: Optional[Dict[str, str]] = None,
    summary: Optional[str] = None,
    trajectory: Optional[Dict[str, Any]] = None,
    stats: Optional[Dict[str, Any]] = None
) -> ProcessMonitorMessage:
    """
    Create a process monitor message for trajectory analysis.

    Args:
        generation_id: ID of the current generation
        window: Time window {"start": ISO, "end": ISO}
        summary: 2-3 sentence summary of what agent accomplished
        trajectory: Trajectory assessment {"score": str, "signals": list}
        stats: Statistics {"tokens": {...}, "cost_usd": float, "tools": {...}}

    Returns:
        ProcessMonitorMessage ready to send via WSI
    """
    return ProcessMonitorMessage(
        generation_id=generation_id,
        window=window,
        summary=summary,
        trajectory=trajectory,
        stats=stats
    )


def create_friendly_log_message(
    message: str,
    category: str,
    generation_id: Optional[str] = None
) -> FriendlyLogMessage:
    """
    Create a user-friendly log message for non-developer users.

    Args:
        message: User-friendly message (e.g., "Building your features...")
        category: One of: "setup", "planning", "building", "testing", "deploying", "done", "working"
        generation_id: Optional ID of the current generation

    Returns:
        FriendlyLogMessage ready to send via WSI
    """
    from datetime import datetime
    return FriendlyLogMessage(
        message=message,
        category=category,
        timestamp=datetime.now().isoformat() + "Z",
        generation_id=generation_id
    )
