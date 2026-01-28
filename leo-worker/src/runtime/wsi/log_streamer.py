"""
Log Streaming for WSI Client.

Captures Python log messages from AppGeneratorAgent and streams them
to the orchestrator via WSI Protocol log messages.
"""

import asyncio
import logging
import re
import sys
from pathlib import Path
from typing import Optional
from datetime import datetime
from io import StringIO


class LogFileWriter:
    """
    Writes log messages to a file for persistence.

    Logs are written to /workspace/leo-artifacts/logs/generation.log
    and can be pushed to GitHub for retrieval after container termination.

    Thread-safe: Uses synchronous file I/O with immediate flush.
    """

    def __init__(self, artifacts_dir: str = "/workspace/leo-artifacts"):
        """
        Initialize log file writer.

        Args:
            artifacts_dir: Base directory for artifacts (default: /workspace/leo-artifacts)
        """
        self.artifacts_dir = Path(artifacts_dir)
        self.log_dir = self.artifacts_dir / "logs"
        self.log_path = self.log_dir / "generation.log"
        self.file = None
        self._initialized = False

    def start(self) -> bool:
        """
        Start writing logs to file.

        Creates directory structure and opens log file.

        Returns:
            True if successful, False otherwise
        """
        try:
            # DEBUG: Log initialization details
            print(f"[LogFileWriter] Initializing with:", file=sys.__stderr__)
            print(f"[LogFileWriter]   artifacts_dir = {self.artifacts_dir}", file=sys.__stderr__)
            print(f"[LogFileWriter]   log_dir = {self.log_dir}", file=sys.__stderr__)
            print(f"[LogFileWriter]   log_path = {self.log_path}", file=sys.__stderr__)

            # Create directory structure
            self.log_dir.mkdir(parents=True, exist_ok=True)
            print(f"[LogFileWriter]   log_dir created/exists = {self.log_dir.exists()}", file=sys.__stderr__)

            # Open log file for appending
            self.file = open(self.log_path, "a", encoding="utf-8")
            print(f"[LogFileWriter]   File opened successfully", file=sys.__stderr__)

            # Write header
            timestamp = datetime.utcnow().isoformat() + "Z"
            self.file.write(f"\n{'='*60}\n")
            self.file.write(f"Generation started: {timestamp}\n")
            self.file.write(f"{'='*60}\n\n")
            self.file.flush()

            self._initialized = True
            print(f"[LogFileWriter] ✅ Initialized successfully at {self.log_path}", file=sys.__stderr__)
            return True

        except Exception as e:
            print(f"[LogFileWriter] ❌ Failed to initialize: {e}", file=sys.__stderr__)
            import traceback
            traceback.print_exc(file=sys.__stderr__)
            return False

    def write(self, message: str, level: str = "info") -> None:
        """
        Write a log message to file.

        Args:
            message: Log message text
            level: Log level (info, warn, error, debug)
        """
        if not self._initialized or not self.file:
            return

        try:
            timestamp = datetime.utcnow().isoformat() + "Z"
            self.file.write(f"{timestamp} [{level.upper():5}] {message}\n")
            self.file.flush()  # Ensure crash-safety
        except Exception:
            # Never let logging failures break the application
            pass

    def stop(self) -> None:
        """
        Stop writing logs and close file.
        """
        if self.file:
            try:
                # Write footer
                timestamp = datetime.utcnow().isoformat() + "Z"
                self.file.write(f"\n{'='*60}\n")
                self.file.write(f"Generation ended: {timestamp}\n")
                self.file.write(f"{'='*60}\n")
                self.file.flush()
                self.file.close()
            except Exception:
                pass
            finally:
                self.file = None
                self._initialized = False


class StdoutCapture:
    """
    Captures stdout and redirects it to Python's logging system.

    This allows us to capture Claude's responses which are printed to stdout
    by cc-agent's console handler.
    """

    def __init__(self, logger_name: str = "stdout"):
        self.logger = logging.getLogger(logger_name)
        self.original_stdout = None
        self.buffer = StringIO()

    def write(self, message: str):
        """Intercept stdout.write() calls."""
        # Also write to original stdout so it still appears in Docker logs
        if self.original_stdout:
            self.original_stdout.write(message)
            self.original_stdout.flush()

        # Skip empty messages and lone newlines
        if not message or message == '\n':
            return

        # Log the message through Python's logging system
        # This will be picked up by LogCaptureHandler
        self.logger.info(message.rstrip('\n'))

    def flush(self):
        """Flush the stream."""
        if self.original_stdout:
            self.original_stdout.flush()

    def start(self):
        """Start capturing stdout."""
        self.original_stdout = sys.stdout
        sys.stdout = self

    def stop(self):
        """Stop capturing stdout and restore original."""
        if self.original_stdout:
            sys.stdout = self.original_stdout
            self.original_stdout = None


class LogCaptureHandler(logging.Handler):
    """
    Custom logging handler that captures log messages and sends them
    via WebSocket using WSI Protocol.

    Attaches to Python's root logger to capture ALL log output from:
    - AppGeneratorAgent
    - Subagents (research, schema, api, ui, code, qa, error, ai)
    - Tool calls (Read, Write, Edit, Bash, Grep, Glob, etc.)
    - Pipeline stages
    - Errors and warnings
    """

    def __init__(self, wsi_client, file_writer: Optional[LogFileWriter] = None):
        """
        Initialize the log capture handler.

        Args:
            wsi_client: WSIClient instance to send messages through
            file_writer: Optional LogFileWriter for file persistence
        """
        super().__init__()
        self.wsi_client = wsi_client
        self.file_writer = file_writer
        self.start_time = datetime.now()

        # Patterns to filter out noise
        self.skip_patterns = [
            r'\[HEARTBEAT\]',  # V1 heartbeat messages
            r'\[AGENT-PYTHON\]',  # V1 agent server prefix
            r'^DEBUG:',  # Debug level logs
            r'httpx',  # HTTP client logs
            r'httpcore',  # HTTP core logs
        ]

        # Patterns to clean up messages
        self.cleanup_patterns = [
            (r'^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2},\d{3}\s+-\s+\w+\s+-\s+', ''),  # Timestamp prefix
            (r'\[AGENT-PYTHON\]\s*', ''),  # V1 prefix
        ]

    def emit(self, record: logging.LogRecord):
        """
        Process and stream a log record.

        Called automatically by Python logging system for each log message.
        """
        try:
            # Skip DEBUG level logs (too noisy)
            if record.levelno < logging.INFO:
                return

            # Get the message
            message = record.getMessage()

            # Skip filtered patterns
            if self._should_skip(message):
                return

            # Clean up the message
            clean_message = self._clean_message(message)

            # Skip empty messages after cleanup
            if not clean_message.strip():
                return

            # Determine log level for WSI Protocol
            level = self._get_wsi_level(record.levelname)

            # Write to file for persistence (synchronous, crash-safe)
            if self.file_writer:
                self.file_writer.write(clean_message, level)

            # Send via WebSocket (non-blocking)
            # We need to handle both sync and async contexts
            try:
                # Try to get event loop
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    # We're in an async context - schedule the send
                    asyncio.create_task(self._send_log(clean_message, level))
                else:
                    # No running loop - can't send (shouldn't happen in WSI client)
                    pass
            except RuntimeError:
                # No event loop - can't send (shouldn't happen in WSI client)
                pass

        except Exception:
            # NEVER let logging errors break the application
            # Silently ignore logging failures
            pass

    def _should_skip(self, message: str) -> bool:
        """Check if message should be filtered out."""
        for pattern in self.skip_patterns:
            if re.search(pattern, message):
                return True
        return False

    def _clean_message(self, message: str) -> str:
        """Clean up message for display."""
        for pattern, replacement in self.cleanup_patterns:
            message = re.sub(pattern, replacement, message)
        return message.strip()

    def _get_wsi_level(self, python_level: str) -> str:
        """
        Map Python logging levels to WSI Protocol log levels.

        Python: DEBUG, INFO, WARNING, ERROR, CRITICAL
        WSI: debug, info, warning, error
        """
        level_map = {
            'DEBUG': 'debug',
            'INFO': 'info',
            'WARNING': 'warning',
            'ERROR': 'error',
            'CRITICAL': 'error',
        }
        return level_map.get(python_level.upper(), 'info')

    async def _send_log(self, message: str, level: str):
        """Send log message via WSI Protocol."""
        try:
            # Import here to avoid circular dependency
            from .protocol import create_log_message

            # Create WSI log message
            log_msg = create_log_message(message, level)

            # Send via WebSocket
            await self.wsi_client._send_message(log_msg)

        except Exception:
            # Silently ignore send failures
            pass


class LogStreamer:
    """
    Manager for log streaming in WSI Client.

    Simple wrapper to start/stop log capture for a generation.
    Captures both Python logging AND stdout (for Claude responses).
    Also writes logs to file for persistence in /workspace/leo-artifacts/logs/.
    """

    def __init__(self):
        self.handler: Optional[LogCaptureHandler] = None
        self.stdout_capture: Optional[StdoutCapture] = None
        self.file_writer: Optional[LogFileWriter] = None
        self.logger = logging.getLogger()

    def start_streaming(self, wsi_client, artifacts_dir: str = "/workspace/leo-artifacts") -> LogCaptureHandler:
        """
        Start capturing logs and streaming via WebSocket.

        Also starts file logging for persistence.

        Args:
            wsi_client: WSIClient instance
            artifacts_dir: Directory for artifacts (default: /workspace/leo-artifacts)

        Returns:
            LogCaptureHandler instance
        """
        # Stop any existing streaming
        self.stop_streaming()

        # Create and start file writer for persistence
        self.file_writer = LogFileWriter(artifacts_dir)
        if not self.file_writer.start():
            # Non-fatal - continue without file logging
            print("[LogStreamer] File logging disabled - continuing with WebSocket only", file=sys.__stderr__)
            self.file_writer = None

        # Create stdout capture to intercept print() calls
        self.stdout_capture = StdoutCapture()
        self.stdout_capture.start()

        # Create new handler with file writer
        self.handler = LogCaptureHandler(wsi_client, self.file_writer)
        self.handler.setLevel(logging.INFO)

        # Attach to root logger to capture ALL logs
        self.logger.addHandler(self.handler)

        # Temporarily lower root logger level if needed
        if self.logger.level > logging.INFO:
            self.logger.setLevel(logging.INFO)

        return self.handler

    def stop_streaming(self):
        """Stop log streaming and clean up."""
        # Stop stdout capture
        if self.stdout_capture:
            try:
                self.stdout_capture.stop()
            except:
                pass
            self.stdout_capture = None

        # Remove logging handler
        if self.handler:
            try:
                self.logger.removeHandler(self.handler)
            except:
                pass
            self.handler = None

        # Stop file writer
        if self.file_writer:
            try:
                self.file_writer.stop()
            except:
                pass
            self.file_writer = None


# Global instance for easy access
log_streamer = LogStreamer()
