"""Claude Code Agent - Base classes for multi-agent systems."""

from .base import Agent, AgentResult
from .cost_tracker import CostTracker
from .session_utils import (
    SessionInfo,
    encode_cwd_for_session_path,
    get_session_directory,
    find_sessions_for_cwd,
    find_latest_meaningful_session,
    session_exists,
    get_session_size,
)

__all__ = [
    "Agent",
    "AgentResult",
    "CostTracker",
    # Session utilities
    "SessionInfo",
    "encode_cwd_for_session_path",
    "get_session_directory",
    "find_sessions_for_cwd",
    "find_latest_meaningful_session",
    "session_exists",
    "get_session_size",
]
