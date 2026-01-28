"""Session discovery utilities for Claude CLI sessions.

Claude stores sessions locally at:
    ~/.claude/projects/<encoded-cwd>/<session-id>.jsonl

This module provides utilities to discover and manage existing sessions.
"""

import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional


@dataclass
class SessionInfo:
    """Information about a discovered session."""
    session_id: str
    path: Path
    size: int  # bytes
    modified: float  # timestamp


def encode_cwd_for_session_path(cwd: str) -> str:
    """Encode a cwd path to match Claude's session directory naming.

    Claude uses dash-separated absolute path:
    /Users/labheshpatel/apps/app-factory/apps/dadcoin/app
    -> -Users-labheshpatel-apps-app-factory-apps-dadcoin-app

    Args:
        cwd: The working directory path

    Returns:
        Encoded path string matching Claude's directory naming
    """
    # Normalize the path (resolve symlinks, remove trailing slashes)
    normalized = str(Path(cwd).resolve())
    # Replace slashes with dashes
    return normalized.replace("/", "-")


def get_session_directory(cwd: str) -> Path:
    """Get the session storage directory for a given cwd.

    Args:
        cwd: The working directory path

    Returns:
        Path to the session directory (may not exist)
    """
    encoded = encode_cwd_for_session_path(cwd)
    return Path.home() / ".claude" / "projects" / encoded


def find_sessions_for_cwd(cwd: str) -> List[SessionInfo]:
    """Find all main sessions for a given working directory.

    Filters out subagent sessions (agent-* format) and invalid UUIDs.
    Returns list of SessionInfo sorted by modified time (newest first).

    Args:
        cwd: The working directory path

    Returns:
        List of SessionInfo objects, sorted newest first
    """
    session_dir = get_session_directory(cwd)
    if not session_dir.exists():
        return []

    sessions = []
    for f in session_dir.glob("*.jsonl"):
        # Skip subagent sessions (agent-xxxx format)
        # These are created by Task tool subagents and shouldn't be resumed as main sessions
        if f.name.startswith("agent-"):
            continue

        # Parse UUID from filename
        session_id = f.stem  # filename without .jsonl

        # Validate UUID format - only accept properly formatted UUIDs
        try:
            uuid.UUID(session_id)
        except ValueError:
            continue  # Not a valid UUID, skip

        try:
            stat = f.stat()
            sessions.append(SessionInfo(
                session_id=session_id,
                path=f,
                size=stat.st_size,
                modified=stat.st_mtime
            ))
        except OSError:
            continue  # File may have been deleted, skip

    # Sort by modified time (newest first)
    sessions.sort(key=lambda s: s.modified, reverse=True)
    return sessions


def find_latest_meaningful_session(cwd: str, min_size_bytes: int = 5000) -> Optional[str]:
    """Find the latest session with meaningful content.

    Filters out tiny sessions (likely failed or empty) by requiring a minimum size.
    Sessions under 5KB typically indicate failed initializations or very short sessions.

    Args:
        cwd: Working directory path
        min_size_bytes: Minimum file size to consider (default 5KB)

    Returns:
        Session ID string or None if no meaningful session exists
    """
    sessions = find_sessions_for_cwd(cwd)

    for session in sessions:
        if session.size >= min_size_bytes:
            return session.session_id

    return None


def session_exists(cwd: str, session_id: str) -> bool:
    """Check if a specific session file exists.

    Args:
        cwd: Working directory path
        session_id: The session UUID to check

    Returns:
        True if the session file exists
    """
    session_dir = get_session_directory(cwd)
    session_file = session_dir / f"{session_id}.jsonl"
    return session_file.exists()


def get_session_size(cwd: str, session_id: str) -> int:
    """Get the size of a session file in bytes.

    Args:
        cwd: Working directory path
        session_id: The session UUID

    Returns:
        Size in bytes, or 0 if file doesn't exist
    """
    session_dir = get_session_directory(cwd)
    session_file = session_dir / f"{session_id}.jsonl"
    try:
        return session_file.stat().st_size
    except OSError:
        return 0
