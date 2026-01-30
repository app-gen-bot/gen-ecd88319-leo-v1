"""
WSI Client - WebSocket Client Implementation

Implements the WebSocket client that connects to an orchestrator and handles the
WSI Protocol v2.1 message flow from the container side.

Architecture:
- Container connects TO orchestrator (client role)
- Sends 'ready' message after connection
- Waits for 'start_generation' command from orchestrator
- Sends progress updates back to orchestrator
"""

import asyncio
import json
import logging
import os
import re
import shutil
import socket
import subprocess
import sys
from pathlib import Path
from typing import Optional, List, Dict, Any
from datetime import datetime

import asyncpg
import websockets
from websockets.client import WebSocketClientProtocol

# Import protocol and state machine (same package)
import httpx

from .protocol import (
    MessageParser,
    MessageSerializer,
    WSIMessage,
    StartGenerationMessage,
    AttachmentInfo,
    DecisionResponseMessage,
    DecisionPromptMessage,
    UserInputMessage,
    ControlCommandMessage,
    SessionLoadedMessage,
    SessionSavedMessage,
    SessionClearedMessage,
    ContextDisplayMessage,
    create_ready_message,
    create_log_message,
    create_error_message,
    create_all_work_complete_message,
    create_iteration_complete_message,
    create_shutdown_ready_message,
    create_shutdown_failed_message,
    create_conversation_log_message,
    create_screenshot_message,
)
from .state_machine import StateMachine, ConnectionState
from .config import (
    LOG_TRUNCATE_PROMPT_DEBUG,
    LOG_TRUNCATE_PROMPT_DISPLAY,
    LOG_TRUNCATE_PROMPT_REPROMPTER,
    LOG_TRUNCATE_PROMPT_MESSAGE,
    LOG_TRUNCATE_PROMPT_CONFIRM,
    LOG_TRUNCATE_PROMPT_EXECUTE,
)

# Import log streaming
from .log_streamer import log_streamer

# Import screenshot watcher
from .screenshot_watcher import create_screenshot_watcher, ScreenshotWatcher

# Import managers for artifact detection, git, and database reset
# S3 removed - Git is the source of truth for versioning and state
# from ..managers.s3_manager import S3Manager, S3UploadResult
from ..managers.artifact_detector import detect_all_artifacts, DeploymentArtifacts
from ..managers.git_manager import GitManager, push_to_github
from cc_agent import CostTracker

# Import real Leo agents (required - no mock mode in remote CLI)
from leo.agents.app_generator import (
    create_app_generator as create_real_app_generator,
    AppGeneratorAgent,
)
from leo.agents.reprompter import (
    create_reprompter as create_real_reprompter,
    SimpleReprompter,
)
REAL_LEO_AVAILABLE = True

# Import cc-agent callback registration for conversation logging
from cc_agent.base import set_global_conversation_callback

# Import process monitor for trajectory analysis
from leo.monitor import ProcessMonitorStreamer

# Import prompt saver for audit trail
from leo.prompts import PromptSaver

logger = logging.getLogger(__name__)


# ============================================================================
# Recoverable Error Detection
# ============================================================================

# Errors that should NOT end the generation - the agent can recover on next iteration
RECOVERABLE_ERROR_PATTERNS = [
    "maximum buffer size",  # JSON buffer overflow (>1MB)
    "JSON message exceeded",  # Same error, different wording
    "exceeded maximum allowed",  # Generic size limit
]

def is_recoverable_error(error: Exception) -> bool:
    """
    Check if an error is recoverable (agent can continue to next iteration).

    Recoverable errors are typically resource limits that the agent can work around
    by using different commands (e.g., adding | head -c 100000 to truncate output).
    """
    error_str = str(error).lower()
    return any(pattern.lower() in error_str for pattern in RECOVERABLE_ERROR_PATTERNS)


# ============================================================================
# WSI Client
# ============================================================================

class WSIClient:
    """
    WebSocket client implementing WSI Protocol v2.1 from container side.

    Connects to orchestrator WebSocket server and handles app generation
    commands, translating WSI Protocol messages to AppGeneratorAgent method calls.
    """

    def __init__(
        self,
        ws_url: str,
        workspace: str = "/workspace",
        connect_timeout: int = 30,
        send_timeout: int = 10,
        max_retries: int = 5,
        retry_backoff_base: float = 1.0,
    ):
        """
        Initialize WSI Client.

        Args:
            ws_url: WebSocket URL to connect to (e.g., ws://backend:5013/ws/job_abc123)
            workspace: Workspace directory path (default: /workspace)
            connect_timeout: Timeout for connection in seconds (default: 30)
            send_timeout: Timeout for sending messages in seconds (default: 10)
            max_retries: Maximum connection retry attempts (default: 5)
            retry_backoff_base: Base delay for exponential backoff (default: 1.0)
        """
        self.ws_url = ws_url
        self.workspace = workspace
        self.connect_timeout = connect_timeout
        self.send_timeout = send_timeout
        self.max_retries = max_retries
        self.retry_backoff_base = retry_backoff_base

        # Connection state
        self.websocket: Optional[WebSocketClientProtocol] = None
        self.connected = False
        self.running = True
        self.retry_count = 0

        # Get container ID
        self.container_id = self._get_container_id()

        # State machine
        self.state_machine = StateMachine(ConnectionState.CONNECTING)

        # Agent state (single generation per container lifecycle)
        self.agent = None
        self.reprompter = None
        self.iteration_state = None
        self.pending_decisions = {}  # decision_id -> decision_info
        self.generation_task = None  # Background task for generation
        self.cancellation_requested = False  # Flag to signal cancellation

        # Conversation logging state
        self._conversation_callback_registered = False

        # Screenshot watcher
        self.screenshot_watcher: Optional[ScreenshotWatcher] = None

        # Process monitor for Haiku-powered trajectory analysis
        self.process_monitor: Optional[ProcessMonitorStreamer] = None

        # Prompt saver for audit trail
        self.prompt_saver: Optional[PromptSaver] = None

        logger.info("WSI Client initialized")
        logger.info(f"   URL: {ws_url}")
        logger.info(f"   Mode: REAL (remote CLI)")
        logger.info(f"   Workspace: {workspace}")
        logger.info(f"   Container ID: {self.container_id}")

    def _setup_conversation_logging(self, generation_id: Optional[str] = None) -> None:
        """
        Set up conversation logging for real-time streaming via WSI.

        Enables conversation logging and registers a callback that sends
        conversation log entries to the orchestrator via WebSocket.
        Also starts the Haiku-powered summary streamer.

        Args:
            generation_id: Optional ID for the current generation (for tracking)
        """
        # Set environment variables for cc-agent's ConversationLogger
        artifacts_dir = f"{self.workspace}/leo-artifacts"
        agent_log_dir = f"{artifacts_dir}/logs"
        os.environ["ENABLE_CONVERSATION_LOGGING"] = "true"
        os.environ["AGENT_LOG_DIR"] = agent_log_dir

        # DEBUG: Log exact paths being used
        logger.info(f"[DEBUG-LOGS] self.workspace = {self.workspace}")
        logger.info(f"[DEBUG-LOGS] artifacts_dir = {artifacts_dir}")
        logger.info(f"[DEBUG-LOGS] AGENT_LOG_DIR = {agent_log_dir}")

        # Create all leo-artifacts subdirectories upfront (fail-fast if workspace is broken)
        # This ensures the workspace is writable before we start expensive operations
        artifacts_path = Path(artifacts_dir)
        (artifacts_path / "logs" / "conversations").mkdir(parents=True, exist_ok=True)
        (artifacts_path / "state").mkdir(parents=True, exist_ok=True)
        (artifacts_path / "sessions").mkdir(parents=True, exist_ok=True)
        (artifacts_path / "prompts").mkdir(parents=True, exist_ok=True)
        logger.info(f"[WORKSPACE] Artifacts directories ready: {artifacts_dir}")
        print(f"[WORKSPACE] Artifacts directories ready: {artifacts_dir}", file=sys.__stderr__, flush=True)

        # Verify parent directories exist
        logger.info(f"[DEBUG-LOGS] artifacts_dir exists = {Path(artifacts_dir).exists()}")
        logger.info(f"[DEBUG-LOGS] logs dir exists = {Path(agent_log_dir).exists()}")

        # Create process monitor for Haiku-powered trajectory analysis
        self.process_monitor = ProcessMonitorStreamer(
            wsi_client=self,
            batch_interval_seconds=60,  # Analyze every 60 seconds
            artifacts_dir=artifacts_dir  # Write logs to artifacts
        )

        # Register callback to stream conversation logs via WSI AND to process monitor
        def conversation_callback(entry: dict) -> None:
            """Callback invoked for each conversation log entry."""
            try:
                # Create WSI message from entry
                msg = create_conversation_log_message(entry)
                # Queue the message for async sending
                asyncio.create_task(self._send_message(msg))

                # Also feed to process monitor for trajectory analysis
                if self.process_monitor:
                    self.process_monitor.add_entry(entry)
            except Exception as e:
                logger.warning(f"Failed to send conversation log: {e}")

        set_global_conversation_callback(conversation_callback)
        self._conversation_callback_registered = True
        logger.info(f"Conversation logging enabled: {agent_log_dir}")

        # Start process monitor
        asyncio.create_task(self._start_process_monitor(generation_id))

    async def _start_process_monitor(self, generation_id: Optional[str] = None) -> None:
        """Start the process monitor (async helper)."""
        if self.process_monitor:
            await self.process_monitor.start(generation_id=generation_id)
            logger.info(f"Process monitor started (generation: {generation_id})")

    def _teardown_conversation_logging(self) -> None:
        """Clean up conversation logging callback and process monitor."""
        if self._conversation_callback_registered:
            set_global_conversation_callback(None)
            self._conversation_callback_registered = False
            logger.info("Conversation logging callback cleared")

        # Stop process monitor
        if self.process_monitor:
            asyncio.create_task(self._stop_process_monitor())

    async def _stop_process_monitor(self) -> None:
        """Stop the process monitor (async helper)."""
        if self.process_monitor:
            await self.process_monitor.stop()
            self.process_monitor = None
            logger.info("Process monitor stopped")

    def _get_container_id(self) -> str:
        """Get container ID from hostname or environment"""
        # Try common container ID sources
        container_id = os.environ.get("CONTAINER_ID")
        if container_id:
            return container_id

        try:
            return socket.gethostname()
        except Exception:
            return f"wsi_client_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    def _calculate_backoff_delay(self) -> float:
        """Calculate exponential backoff delay (capped at 60s)"""
        delay = self.retry_backoff_base * (2 ** self.retry_count)
        return min(delay, 60.0)

    async def connect(self) -> None:
        """
        Connect to orchestrator WebSocket with automatic retry.

        Implements exponential backoff on connection failures.
        """
        # If disconnected, create new state machine (DISCONNECTED is terminal)
        if self.state_machine.state == ConnectionState.DISCONNECTED:
            self.state_machine = StateMachine(ConnectionState.CONNECTING)
            logger.info("Created new state machine for reconnection")

        while self.retry_count < self.max_retries:
            try:
                logger.info(
                    f"Connecting to orchestrator",
                    extra={
                        "url": self.ws_url,
                        "attempt": self.retry_count + 1,
                        "max_retries": self.max_retries
                    }
                )

                # Attempt connection with timeout
                self.websocket = await asyncio.wait_for(
                    websockets.connect(
                        self.ws_url,
                        ping_interval=20,
                        ping_timeout=10,
                        close_timeout=5
                    ),
                    timeout=self.connect_timeout
                )

                self.connected = True
                self.retry_count = 0
                logger.info("Connected to orchestrator successfully")

                # Send ready message
                await self.send_ready()
                return

            except asyncio.TimeoutError:
                self.retry_count += 1
                delay = self._calculate_backoff_delay()

                logger.warning(
                    f"Connection timeout, will retry",
                    extra={
                        "timeout": self.connect_timeout,
                        "retry_count": self.retry_count,
                        "max_retries": self.max_retries,
                        "retry_delay": delay
                    }
                )

                if self.retry_count >= self.max_retries:
                    error_msg = (
                        f"Connection timeout after {self.max_retries} attempts. "
                        f"Check network connectivity and orchestrator availability."
                    )
                    logger.error("Max connection retries exceeded", extra={"error": error_msg})
                    raise ConnectionError(error_msg)

                await asyncio.sleep(delay)

            except (websockets.exceptions.WebSocketException, OSError) as e:
                self.retry_count += 1
                delay = self._calculate_backoff_delay()

                logger.warning(
                    f"Connection failed: {e}",
                    extra={
                        "error_type": type(e).__name__,
                        "retry_count": self.retry_count,
                        "max_retries": self.max_retries,
                        "retry_delay": delay
                    }
                )

                if self.retry_count >= self.max_retries:
                    error_msg = (
                        f"Connection failed after {self.max_retries} attempts: {str(e)}. "
                        f"Check network connectivity and orchestrator availability."
                    )
                    logger.error("Max connection retries exceeded", extra={"error": error_msg})
                    raise ConnectionError(error_msg) from e

                await asyncio.sleep(delay)

            except Exception as e:
                logger.error(
                    f"Unexpected connection error: {e}",
                    exc_info=True
                )
                raise ConnectionError(f"Unexpected connection error: {str(e)}") from e

    async def send_ready(self) -> None:
        """Send ready message to orchestrator"""
        self.state_machine.transition_to(ConnectionState.READY, "connection established")
        ready = create_ready_message(
            container_id=self.container_id,
            workspace=self.workspace,
            generator_mode="real"
        )
        await self._send_message(ready)
        logger.info("Sent ready message")

    async def _send_message(self, message: WSIMessage) -> None:
        """
        Send message to orchestrator with timeout.

        Args:
            message: WSI message to send

        Raises:
            TimeoutError: If send times out
        """
        if not self.websocket or not self.connected:
            logger.warning(f"Not connected, cannot send message: {message.type}")
            return

        try:
            json_data = MessageSerializer.serialize(message)
            await asyncio.wait_for(
                self.websocket.send(json_data),
                timeout=self.send_timeout
            )
            logger.debug(f"Sent message: {message.type}")

        except asyncio.TimeoutError:
            logger.error(f"Message send timeout: {message.type}")
            self.connected = False
            raise TimeoutError(f"Failed to send message of type {message.type} within {self.send_timeout}s")

    async def _send_raw_message(self, message_dict: dict) -> None:
        """
        Send a raw dict message to orchestrator (for dynamic message types).

        Args:
            message_dict: Dict with 'type' field and message data

        Used by ProcessMonitorStreamer for process_monitor messages.
        """
        if not self.websocket or not self.connected:
            msg_type = message_dict.get("type", "unknown")
            logger.warning(f"Not connected, cannot send message: {msg_type}")
            return

        try:
            import json
            json_data = json.dumps(message_dict)
            await asyncio.wait_for(
                self.websocket.send(json_data),
                timeout=self.send_timeout
            )
            logger.debug(f"Sent raw message: {message_dict.get('type', 'unknown')}")

        except asyncio.TimeoutError:
            msg_type = message_dict.get("type", "unknown")
            logger.error(f"Raw message send timeout: {msg_type}")
            self.connected = False

        except Exception as e:
            logger.error(f"Failed to send message: {e}", exc_info=True)
            self.connected = False
            raise

    async def send_screenshot(
        self,
        file_path: str,
        description: Optional[str] = None,
        stage: Optional[str] = None
    ) -> bool:
        """
        Send a screenshot to the orchestrator for live preview.

        Reads an image file, base64 encodes it, and sends via WSI protocol.
        This enables real-time screenshot streaming to the browser during
        quality assurance testing.

        Args:
            file_path: Path to the screenshot image file (PNG, JPG, etc.)
            description: Optional description of what the screenshot shows
            stage: Optional generation stage (e.g., "quality_assurance", "iteration_1")

        Returns:
            True if screenshot was sent successfully, False otherwise
        """
        import base64
        from PIL import Image

        try:
            # Verify file exists
            if not os.path.exists(file_path):
                logger.warning(f"Screenshot file not found: {file_path}")
                return False

            # Read and encode the image
            with open(file_path, 'rb') as f:
                image_data = f.read()

            # Get image dimensions
            try:
                with Image.open(file_path) as img:
                    width, height = img.size
            except Exception:
                width, height = None, None

            # Determine MIME type from extension
            ext = os.path.splitext(file_path)[1].lower()
            mime_types = {
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
            }
            mime_type = mime_types.get(ext, 'image/png')

            # Create base64 data URL
            b64_data = base64.b64encode(image_data).decode('utf-8')
            image_base64 = f"data:{mime_type};base64,{b64_data}"

            # Extract filename from path
            filename = os.path.basename(file_path)

            # Create timestamp
            timestamp = datetime.now().isoformat()

            # Create and send the message
            msg = create_screenshot_message(
                timestamp=timestamp,
                image_base64=image_base64,
                filename=filename,
                description=description,
                width=width,
                height=height,
                stage=stage
            )
            await self._send_message(msg)

            logger.info(f"Sent screenshot: {filename} ({width}x{height})")
            return True

        except Exception as e:
            logger.error(f"Failed to send screenshot {file_path}: {e}")
            return False

    async def receive_loop(self) -> None:
        """
        Main receive loop - processes messages from orchestrator.

        Automatically attempts to reconnect on connection loss.
        """
        logger.info("Starting receive loop")

        while self.running:
            try:
                # Ensure we're connected
                if not self.connected:
                    logger.info("Not connected, attempting to connect")
                    await self.connect()

                # Receive messages
                while self.running and self.connected:
                    try:
                        # Receive message
                        raw_data = await asyncio.wait_for(
                            self.websocket.recv(),
                            timeout=30.0  # 30 second timeout
                        )

                        # Parse message
                        message = MessageParser.parse(raw_data)
                        logger.debug(f"Received message: {message.type}")

                        # Route message (import from server to reuse handlers)
                        if isinstance(message, StartGenerationMessage):
                            # Run generation in background task so receive_loop stays responsive
                            # This allows us to process control commands (like prepare_shutdown) during generation
                            if self.generation_task is None or self.generation_task.done():
                                self.generation_task = asyncio.create_task(
                                    self._handle_start_generation(message)
                                )
                                # Add callback to handle any unhandled exceptions in the task
                                self.generation_task.add_done_callback(self._on_generation_done)
                            else:
                                logger.warning("Generation already in progress, ignoring start_generation")
                        elif isinstance(message, DecisionResponseMessage):
                            await self._handle_decision_response(message)
                        elif isinstance(message, UserInputMessage):
                            await self._handle_user_input(message)
                        elif isinstance(message, ControlCommandMessage):
                            await self._handle_control_command(message)
                        else:
                            logger.warning(f"Unhandled message type: {message.type}")

                    except asyncio.TimeoutError:
                        # No message in 30s, connection still alive (pings handle keepalive)
                        logger.debug("Receive timeout, connection still alive")
                        continue

                    except json.JSONDecodeError as e:
                        logger.error(f"Invalid JSON: {e}")
                        continue

                    except ValueError as e:
                        logger.error(f"Invalid message: {e}")
                        continue

            except websockets.exceptions.ConnectionClosed:
                logger.warning("Connection closed by server, will attempt reconnect")
                self.connected = False
                # Reset state machine to DISCONNECTED before reconnecting
                self.state_machine.transition_to(ConnectionState.DISCONNECTED, "connection closed")

                if self.running:
                    delay = self._calculate_backoff_delay()
                    logger.info(f"Waiting before reconnect: {delay}s")
                    await asyncio.sleep(delay)

            except (ConnectionError, TimeoutError) as e:
                logger.error(f"Connection error in receive loop: {e}")
                self.connected = False

                if self.running:
                    delay = self._calculate_backoff_delay()
                    logger.info(f"Waiting before reconnect: {delay}s")
                    await asyncio.sleep(delay)
                else:
                    break

            except Exception as e:
                logger.error(f"Receive loop error: {e}", exc_info=True)
                self.connected = False

                # Send error to orchestrator if still connected
                if self.websocket:
                    try:
                        error_msg = create_error_message(
                            str(e),
                            error_code="FATAL_ERROR",
                            fatal=True
                        )
                        await self._send_message(error_msg)
                    except:
                        pass

                # Don't retry on unknown fatal errors
                break

        logger.info("Receive loop terminated")

    def _on_generation_done(self, task: asyncio.Task) -> None:
        """
        Callback for when the generation background task completes.

        Logs any unhandled exceptions to prevent silent failures.
        This ensures generation errors are visible even when running in background.
        """
        try:
            # Check if the task raised an exception
            exc = task.exception()
            if exc:
                logger.error(f"Generation task failed with unhandled exception: {exc}", exc_info=exc)
                # Try to send error to orchestrator (fire-and-forget since we're in sync callback)
                asyncio.create_task(self._send_generation_error(exc))
        except asyncio.CancelledError:
            logger.info("Generation task was cancelled")
        except asyncio.InvalidStateError:
            # Task not done yet (shouldn't happen in done callback)
            pass

    async def _send_generation_error(self, exc: Exception) -> None:
        """Send generation error to orchestrator."""
        try:
            error_msg = create_error_message(
                f"Generation failed: {exc}",
                error_code="GENERATION_ERROR",
                fatal=True
            )
            await self._send_message(error_msg)
        except Exception as e:
            logger.error(f"Failed to send generation error: {e}")

    async def _init_git_for_workspace(self, output_dir: str) -> None:
        """
        Initialize git repository in workspace early so agent can commit throughout.

        This ensures:
        1. Git user.name and user.email are configured
        2. Git repo is initialized before agent starts
        3. Agent commits are preserved even if container crashes

        Args:
            output_dir: The output directory (e.g., /workspace/app)
        """
        try:
            # Ensure output directory exists
            os.makedirs(output_dir, exist_ok=True)

            # Check if git already initialized
            git_dir = os.path.join(output_dir, '.git')
            if not os.path.exists(git_dir):
                logger.info(f"Initializing git in {output_dir}")
                subprocess.run(
                    ['git', 'init'],
                    cwd=output_dir,
                    check=True,
                    capture_output=True,
                    text=True
                )

            # Always configure git user (idempotent)
            subprocess.run(
                ['git', 'config', 'user.email', 'leo-bot@app-gen-saas.com'],
                cwd=output_dir,
                check=True,
                capture_output=True,
                text=True
            )
            subprocess.run(
                ['git', 'config', 'user.name', 'Leo App Generator'],
                cwd=output_dir,
                check=True,
                capture_output=True,
                text=True
            )

            logger.info(f"Git initialized and configured in {output_dir}")
            await self._send_message(create_log_message(f"Git initialized in {output_dir}", "info"))

        except subprocess.CalledProcessError as e:
            logger.warning(f"Git init warning: {e.stderr or e.stdout}")
        except Exception as e:
            logger.warning(f"Git init warning: {e}")

    async def _restore_schema_for_resume(self, app_path: str) -> bool:
        """
        Restore database schema from a cloned app for resume.

        When resuming from GitHub, runs `drizzle-kit push` from the
        cloned app to sync the schema to the app's Supabase database.

        Args:
            app_path: Path to the cloned app (e.g., /workspace/app/todo)

        Returns:
            True if schema restored successfully
        """
        drizzle_config = os.path.join(app_path, "drizzle.config.ts")

        if not os.path.exists(drizzle_config):
            logger.info(f"No drizzle.config.ts found at {app_path}, skipping schema restore")
            await self._send_message(create_log_message("No Drizzle config found, skipping schema restore", "info"))
            return True

        logger.info(f"Restoring database schema from {app_path}")
        await self._send_message(create_log_message("Restoring database schema for resume...", "info"))

        try:
            # Check if node_modules exists, install if needed
            node_modules = os.path.join(app_path, "node_modules")
            if not os.path.exists(node_modules):
                logger.info("Installing npm dependencies for schema restore...")
                await self._send_message(create_log_message("Installing dependencies...", "info"))

                install_result = subprocess.run(
                    ["npm", "install"],
                    cwd=app_path,
                    capture_output=True,
                    text=True,
                    timeout=300  # 5 minutes max for npm install
                )

                if install_result.returncode != 0:
                    logger.warning(f"npm install warning: {install_result.stderr}")
                    # Continue anyway - drizzle-kit might still work

            # Run drizzle-kit push to sync schema to database
            logger.info("Running drizzle-kit push to restore schema...")
            await self._send_message(create_log_message("Pushing schema to database...", "info"))

            push_result = subprocess.run(
                ["npx", "drizzle-kit", "push"],
                cwd=app_path,
                capture_output=True,
                text=True,
                timeout=60  # 1 minute max
            )

            if push_result.returncode == 0:
                logger.info("Schema restored successfully")
                await self._send_message(create_log_message("✅ Database schema restored", "info"))
                return True
            else:
                # Log the error but don't fail - agent might be able to fix it
                logger.warning(f"drizzle-kit push failed: {push_result.stderr}")
                await self._send_message(create_log_message(
                    f"Schema restore warning: {push_result.stderr[:200]}",
                    "warning"
                ))
                return False

        except subprocess.TimeoutExpired:
            logger.warning("Schema restore timed out")
            await self._send_message(create_log_message("Schema restore timed out", "warning"))
            return False
        except Exception as e:
            logger.warning(f"Schema restore error: {e}")
            await self._send_message(create_log_message(f"Schema restore error: {e}", "warning"))
            return False

    async def _check_rls_warnings(self, app_path: str) -> List[Dict[str, Any]]:
        """
        Check if RLS is enabled on all public schema tables.

        Reads DATABASE_URL from the app's .env file and queries pg_tables
        to find tables without Row Level Security enabled.

        Args:
            app_path: Path to the generated app

        Returns:
            List of warning dicts, empty if all tables have RLS or check fails
        """
        warnings = []

        try:
            # Read DATABASE_URL from app's .env file
            env_path = Path(app_path) / ".env"
            if not env_path.exists():
                logger.debug("No .env file found, skipping RLS check")
                return warnings

            env_content = env_path.read_text()

            # Extract DATABASE_URL (prefer pooling URL for connection)
            db_url = None
            for line in env_content.split('\n'):
                if line.startswith('DATABASE_URL_POOLING='):
                    db_url = line.split('=', 1)[1].strip().strip('"\'')
                    break
                elif line.startswith('DATABASE_URL=') and not db_url:
                    db_url = line.split('=', 1)[1].strip().strip('"\'')

            if not db_url:
                logger.debug("No DATABASE_URL found in .env, skipping RLS check")
                return warnings

            # Skip if it's a placeholder or example URL
            if 'example.com' in db_url or 'placeholder' in db_url.lower():
                logger.debug("DATABASE_URL appears to be placeholder, skipping RLS check")
                return warnings

            # Connect to database and check RLS status
            logger.info("Checking RLS status on public schema tables...")

            # For pooled connections, we need to disable prepared statements
            conn = await asyncio.wait_for(
                asyncpg.connect(db_url, statement_cache_size=0),
                timeout=10.0
            )

            try:
                # Query tables without RLS enabled in public schema
                rows = await conn.fetch("""
                    SELECT tablename
                    FROM pg_tables
                    WHERE schemaname = 'public'
                    AND rowsecurity = false
                    ORDER BY tablename
                """)

                tables_without_rls = [row['tablename'] for row in rows]

                if tables_without_rls:
                    logger.warning(f"RLS not enabled on {len(tables_without_rls)} tables: {tables_without_rls}")
                    warnings.append({
                        "code": "rls_disabled",
                        "message": f"Row Level Security not enabled on {len(tables_without_rls)} table(s)",
                        "details": {
                            "tables": tables_without_rls,
                            "remediation_url": "https://supabase.com/docs/guides/database/postgres/row-level-security"
                        }
                    })
                else:
                    logger.info("All public schema tables have RLS enabled")

            finally:
                await conn.close()

        except asyncio.TimeoutError:
            logger.warning("RLS check timed out (non-fatal)")
        except Exception as e:
            # Non-fatal - don't block completion for RLS check failure
            logger.warning(f"RLS check failed (non-fatal): {e}")

        return warnings

    async def _clone_from_github(self, github_url: str, app_name: str) -> str:
        """
        Clone an existing app from GitHub for resume.

        Args:
            github_url: GitHub repository URL to clone
            app_name: Name for the local directory

        Returns:
            Path to the cloned app directory

        Raises:
            RuntimeError: If clone fails
        """
        # Clone to /workspace/app to match original generation path
        # This ensures session files are stored at the same encoded path
        # (Original generates to /workspace/app, sessions at ~/.claude/projects/-workspace-app/)
        output_dir = os.path.join(self.workspace, "app")

        logger.info(f"Cloning {github_url} to {output_dir}")
        await self._send_message(create_log_message(f"Cloning from GitHub: {github_url}", "info"))

        try:
            # Ensure parent directory exists
            os.makedirs(os.path.dirname(output_dir), exist_ok=True)

            # Clean up existing directory if present (Dockerfile creates /workspace/app empty)
            if os.path.exists(output_dir):
                shutil.rmtree(output_dir, ignore_errors=True)
                logger.info(f"Cleaned up existing directory: {output_dir}")

            # Add authentication for private repos
            # Uses GITHUB_BOT_TOKEN if available
            clone_url = github_url
            github_token = os.environ.get("GITHUB_BOT_TOKEN")
            if github_token and "github.com" in github_url:
                # Convert to authenticated URL: https://x-access-token:TOKEN@github.com/...
                clone_url = github_url.replace(
                    "https://github.com/",
                    f"https://x-access-token:{github_token}@github.com/"
                )
                logger.info("Using authenticated GitHub URL for clone")

            # Clone the repository with retry logic
            max_retries = 3
            retry_delays = [2, 4, 8]  # Exponential backoff: 2s, 4s, 8s
            last_error = None

            for attempt in range(max_retries):
                try:
                    logger.info(f"Git clone attempt {attempt + 1}/{max_retries}")
                    if attempt > 0:
                        await self._send_message(create_log_message(
                            f"Clone retry attempt {attempt + 1}/{max_retries}...", "info"
                        ))

                    result = subprocess.run(
                        ["git", "clone", clone_url, output_dir],
                        capture_output=True,
                        text=True,
                        timeout=120  # 2 minute timeout for clone
                    )

                    if result.returncode == 0:
                        logger.info(f"Git clone succeeded on attempt {attempt + 1}")
                        break  # Success - exit retry loop

                    # Clone command failed
                    last_error = f"Git clone failed: {result.stderr}"
                    logger.warning(f"Clone attempt {attempt + 1} failed: {result.stderr}")

                except subprocess.TimeoutExpired:
                    last_error = f"Git clone timed out for {github_url}"
                    logger.warning(f"Clone attempt {attempt + 1} timed out")
                    # Clean up partial clone if any
                    if os.path.exists(output_dir):
                        shutil.rmtree(output_dir, ignore_errors=True)

                # If not last attempt, wait and retry
                if attempt < max_retries - 1:
                    delay = retry_delays[attempt]
                    logger.info(f"Waiting {delay}s before retry...")
                    await asyncio.sleep(delay)
                    # Clean up failed clone directory for retry
                    if os.path.exists(output_dir):
                        shutil.rmtree(output_dir, ignore_errors=True)
            else:
                # All retries exhausted
                error_msg = f"Git clone failed after {max_retries} attempts. Last error: {last_error}"
                logger.error(error_msg)
                raise RuntimeError(error_msg)

            # Verify clone succeeded (result should exist from successful attempt)
            if result.returncode != 0:
                error_msg = f"Git clone failed: {result.stderr}"
                logger.error(error_msg)
                raise RuntimeError(error_msg)

            # Configure git user for future commits
            subprocess.run(
                ["git", "config", "user.email", "leo-bot@app-gen-saas.com"],
                cwd=output_dir,
                check=True,
                capture_output=True,
                text=True
            )
            subprocess.run(
                ["git", "config", "user.name", "Leo App Generator"],
                cwd=output_dir,
                check=True,
                capture_output=True,
                text=True
            )

            logger.info(f"Successfully cloned to {output_dir}")
            await self._send_message(create_log_message(f"Clone complete: {output_dir}", "info"))

            return output_dir

        except Exception as e:
            error_msg = f"Failed to clone {github_url}: {e}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)

    # =========================================================================
    # EFS Persistent Storage Helpers
    # =========================================================================

    def _efs_has_app(self, app_id: str) -> bool:
        """
        Check if EFS has any files for this app.

        Simple check: if the app directory exists and has any files,
        assume it's usable. Don't over-validate - let errors surface downstream.

        Args:
            app_id: The app ID to check for

        Returns:
            True if EFS has files for this app, False otherwise
        """
        efs_app_dir = Path(f"/efs/{app_id}/workspace/app")
        return efs_app_dir.exists() and any(efs_app_dir.iterdir())

    async def _setup_efs_workspace(self, app_id: str) -> Path:
        """
        Setup EFS workspace if EFS is available.

        When EFS is mounted at /efs (via access point with /apps root):
        - Creates app-specific directories: /efs/{app_id}/workspace/app
        - Symlinks ~/.claude → /efs/{app_id}/.claude for session persistence
        - Returns EFS workspace path directly (not /workspace)

        When EFS is not mounted:
        - Returns /workspace unchanged (ephemeral Docker volume)

        Note: We use EFS directly instead of symlinking /workspace because
        /workspace is a Docker volume mount point that can't be replaced.

        Args:
            app_id: The app ID for directory structure

        Returns:
            Path to the workspace directory (EFS path or /workspace)
        """
        efs_base = Path("/efs")

        # DEBUG: Print to stderr for guaranteed visibility (bypasses log_streamer)
        print(f"[DEBUG-EFS] Checking EFS at {efs_base}, exists={efs_base.exists()}", file=sys.__stderr__, flush=True)

        if not efs_base.exists():
            print(f"[DEBUG-EFS] EFS NOT available, returning /workspace", file=sys.__stderr__, flush=True)
            logger.info("EFS not available, using ephemeral /workspace")
            return Path("/workspace")

        # Create app-specific directories on EFS
        efs_app_dir = efs_base / str(app_id)
        efs_workspace = efs_app_dir / "workspace"
        efs_claude = efs_app_dir / ".claude"

        efs_workspace.mkdir(parents=True, exist_ok=True)
        (efs_workspace / "app").mkdir(exist_ok=True)
        efs_claude.mkdir(parents=True, exist_ok=True)

        # DISABLED: Symlink ~/.claude → EFS was causing Claude CLI init timeout
        # Sessions are restored from artifacts anyway, so this is not critical
        # TODO: Re-enable after investigating EFS I/O performance
        # claude_dir = Path.home() / ".claude"
        # if claude_dir.exists() and not claude_dir.is_symlink():
        #     shutil.rmtree(claude_dir)
        # if not claude_dir.exists():
        #     claude_dir.symlink_to(efs_claude)
        #     logger.info(f"Linked ~/.claude → {efs_claude}")
        logger.info("EFS: Using local ~/.claude (symlink disabled for performance)")

        print(f"[DEBUG-EFS] EFS IS available, returning {efs_workspace}", file=sys.__stderr__, flush=True)
        logger.info(f"EFS workspace ready: {efs_workspace}")
        return efs_workspace

    async def _try_git_pull(self, app_path: Path) -> bool:
        """
        Try git pull to sync latest changes from remote.

        Used when EFS has existing files - pulls latest changes that may have
        been pushed by a previous session or external commit.

        Args:
            app_path: Path to the app directory with .git

        Returns:
            True if pull succeeded, False if failed (caller should fall back to clone)
        """
        try:
            if not (app_path / ".git").exists():
                logger.info(f"No .git directory at {app_path}, cannot pull")
                return False

            result = await asyncio.create_subprocess_exec(
                "git", "pull", "--ff-only",
                cwd=str(app_path),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await result.communicate()

            if result.returncode == 0:
                logger.info(f"git pull successful: {stdout.decode().strip()}")
                await self._send_message(create_log_message(
                    "EFS sync: pulled latest changes from remote", "info"
                ))
                return True
            else:
                logger.warning(f"git pull failed: {stderr.decode().strip()}")
                return False

        except Exception as e:
            logger.warning(f"git pull error: {e}")
            return False

    def _init_or_clone_artifacts_repo(
        self,
        git_manager,
        workspace_dir: str,
        artifacts_repo_url: str,
        artifacts_repo_name: str
    ):
        """
        Initialize or clone the artifacts repo for resume mode.

        Artifacts repo is cloned to workspace root (/workspace/) and contains:
        - changelog/
        - summary_changes/
        - leo-artifacts/ (logs, state, sessions)

        The app/ directory is excluded via .gitignore (separate repo).

        For resume: clone existing artifacts repo to preserve history.
        If clone fails (repo doesn't exist), init a fresh one.
        """
        from ..managers.git_manager import GitHubRepo

        github_token = os.environ.get("GITHUB_BOT_TOKEN")
        if not github_token:
            return None

        # Try to clone existing artifacts repo
        try:
            os.makedirs(workspace_dir, exist_ok=True)

            # Add auth to URL
            clone_url = artifacts_repo_url.replace(
                "https://github.com/",
                f"https://x-access-token:{github_token}@github.com/"
            )

            # Clone if .git doesn't exist at workspace root
            if not os.path.exists(os.path.join(workspace_dir, ".git")):
                # For workspace root, we can't clear it entirely - just check for conflicts
                # The clone will fail if there are conflicting files, which is expected
                # if app/ was already cloned (but app/ should be cloned AFTER artifacts)

                # Use init/fetch/checkout pattern - works even if dir exists
                # This preserves history unlike clone which fails on existing dirs
                subprocess.run(["git", "init"], cwd=workspace_dir, capture_output=True, check=True)
                subprocess.run(["git", "remote", "add", "origin", clone_url],
                               cwd=workspace_dir, capture_output=True)  # May fail if remote exists, that's ok

                # Configure git user before fetch
                subprocess.run(["git", "config", "user.email", "leo-bot@app-gen-saas.com"],
                               cwd=workspace_dir, check=True, capture_output=True)
                subprocess.run(["git", "config", "user.name", "Leo App Generator"],
                               cwd=workspace_dir, check=True, capture_output=True)

                # Fetch from remote
                fetch_result = subprocess.run(
                    ["git", "fetch", "origin"],
                    cwd=workspace_dir,
                    capture_output=True,
                    text=True,
                    timeout=60
                )

                if fetch_result.returncode == 0:
                    # Checkout main branch, force to overwrite any local changes
                    checkout_result = subprocess.run(
                        ["git", "checkout", "-f", "origin/main", "-B", "main"],
                        cwd=workspace_dir,
                        capture_output=True,
                        text=True
                    )
                    if checkout_result.returncode == 0:
                        logger.info(f"Fetched and checked out artifacts repo: {artifacts_repo_name}")
                    else:
                        logger.warning(f"Checkout failed for {artifacts_repo_name}: {checkout_result.stderr}")
                        return self._create_fresh_artifacts_repo(
                            git_manager, workspace_dir, artifacts_repo_url, artifacts_repo_name, github_token
                        )
                else:
                    # Fetch failed - repo may not exist yet, create fresh
                    logger.warning(f"Fetch failed for {artifacts_repo_name}: {fetch_result.stderr}")
                    return self._create_fresh_artifacts_repo(
                        git_manager, workspace_dir, artifacts_repo_url, artifacts_repo_name, github_token
                    )

            return GitHubRepo(
                url=artifacts_repo_url,
                clone_url=artifacts_repo_url + ".git",
                name=artifacts_repo_name
            )

        except Exception as e:
            logger.warning(f"Failed to clone artifacts repo: {e}")
            # Try to create fresh
            return self._create_fresh_artifacts_repo(
                git_manager, workspace_dir, artifacts_repo_url, artifacts_repo_name, github_token
            )

    def _create_fresh_artifacts_repo(
        self,
        git_manager,
        workspace_dir: str,
        artifacts_repo_url: str,
        artifacts_repo_name: str,
        github_token: str
    ):
        """Create a fresh artifacts repo at workspace root when clone fails."""
        from ..managers.git_manager import GitHubRepo
        from github import Github, GithubException

        try:
            # Create repo via GitHub API
            gh = Github(github_token)
            user = gh.get_user()

            try:
                user.create_repo(
                    name=artifacts_repo_name,
                    description=f"Leo artifacts for {artifacts_repo_name.replace('-artifacts', '')}",
                    private=True,
                    auto_init=False,
                )
                logger.info(f"Created new artifacts repo: {artifacts_repo_name}")
            except GithubException as e:
                if e.status != 422:  # 422 = already exists
                    raise

            # Create directory structure at workspace root
            os.makedirs(workspace_dir, exist_ok=True)
            os.makedirs(os.path.join(workspace_dir, 'changelog'), exist_ok=True)
            os.makedirs(os.path.join(workspace_dir, 'summary_changes'), exist_ok=True)
            os.makedirs(os.path.join(workspace_dir, 'leo-artifacts', 'logs'), exist_ok=True)
            os.makedirs(os.path.join(workspace_dir, 'leo-artifacts', 'state'), exist_ok=True)
            os.makedirs(os.path.join(workspace_dir, 'leo-artifacts', 'sessions'), exist_ok=True)
            os.makedirs(os.path.join(workspace_dir, 'leo-artifacts', 'prompts'), exist_ok=True)

            # Init local git at workspace root
            subprocess.run(["git", "init"], cwd=workspace_dir, capture_output=True, check=True)
            subprocess.run(["git", "config", "user.email", "leo-bot@app-gen-saas.com"],
                           cwd=workspace_dir, capture_output=True, check=True)
            subprocess.run(["git", "config", "user.name", "Leo App Generator"],
                           cwd=workspace_dir, capture_output=True, check=True)

            # Add remote
            auth_url = artifacts_repo_url.replace(
                "https://github.com/",
                f"https://x-access-token:{github_token}@github.com/"
            ) + ".git"
            subprocess.run(["git", "remote", "add", "origin", auth_url],
                           cwd=workspace_dir, capture_output=True)

            # Create .gitignore - MUST exclude app/ (separate repo)
            gitignore_path = os.path.join(workspace_dir, ".gitignore")
            with open(gitignore_path, "w") as f:
                f.write("# App is a separate git repo\n")
                f.write("app/\n")
                f.write("\n")
                f.write("# Python\n")
                f.write("*.pyc\n")
                f.write("__pycache__/\n")
                f.write("\n")
                f.write("# OS\n")
                f.write(".DS_Store\n")

            # Create README
            readme_path = os.path.join(workspace_dir, "README.md")
            with open(readme_path, "w") as f:
                f.write(f"# Leo Artifacts: {artifacts_repo_name.replace('-artifacts', '')}\n\n")
                f.write("Artifacts from Leo app generation (app code is in separate repo).\n\n")
                f.write("## Contents\n\n")
                f.write("- `changelog/` - Generation changelog files\n")
                f.write("- `summary_changes/` - Concise summaries for reprompter\n")
                f.write("- `leo-artifacts/` - Internal logs, state, sessions, prompts\n")

            # Initial commit
            subprocess.run(["git", "add", "."], cwd=workspace_dir, capture_output=True)
            subprocess.run(["git", "commit", "-m", "Initial commit: artifacts repo"],
                           cwd=workspace_dir, capture_output=True)
            subprocess.run(["git", "branch", "-M", "main"], cwd=workspace_dir, capture_output=True)
            subprocess.run(["git", "push", "-u", "origin", "main"],
                           cwd=workspace_dir, capture_output=True, timeout=60)
            logger.info(f"Initial artifacts commit pushed to {artifacts_repo_name}")

            return GitHubRepo(
                url=artifacts_repo_url,
                clone_url=artifacts_repo_url + ".git",
                name=artifacts_repo_name
            )

        except Exception as e:
            logger.error(f"Failed to create artifacts repo: {e}")
            return None

    def _get_session_directory(self, app_path: str) -> Path:
        """Get Claude's session directory for the given app path.

        Claude stores sessions at ~/.claude/projects/<encoded-cwd>/
        where <encoded-cwd> is the path with slashes replaced by dashes.
        """
        normalized = str(Path(app_path).resolve())
        encoded = normalized.replace("/", "-")
        return Path.home() / ".claude" / "projects" / encoded

    def _save_sessions_to_artifacts(self, app_path: str, artifacts_dir: str) -> None:
        """Save Claude session files to artifacts repo for persistence.

        Copies session .jsonl files from ~/.claude/projects/<encoded-cwd>/
        to {artifacts_dir}/sessions/ so they can be restored on resume.
        """
        session_dir = self._get_session_directory(app_path)
        if not session_dir.exists():
            logger.info("No session directory to save")
            return

        target_dir = Path(artifacts_dir) / "sessions"
        target_dir.mkdir(parents=True, exist_ok=True)

        saved_count = 0
        for session_file in session_dir.glob("*.jsonl"):
            # Skip very small files (likely failed sessions)
            if session_file.stat().st_size < 1000:
                continue
            target_file = target_dir / session_file.name
            shutil.copy2(session_file, target_file)
            saved_count += 1

        if saved_count > 0:
            logger.info(f"Saved {saved_count} session files to artifacts")

    def _restore_sessions_from_artifacts(self, app_path: str, artifacts_dir: str) -> None:
        """Restore Claude session files from artifacts repo.

        Copies session .jsonl files from {artifacts_dir}/sessions/
        to ~/.claude/projects/<encoded-cwd>/ so they can be resumed.
        """
        source_dir = Path(artifacts_dir) / "sessions"
        if not source_dir.exists():
            logger.info("No sessions to restore from artifacts")
            return

        session_dir = self._get_session_directory(app_path)
        session_dir.mkdir(parents=True, exist_ok=True)

        restored_count = 0
        for session_file in source_dir.glob("*.jsonl"):
            target_file = session_dir / session_file.name
            # Don't overwrite existing sessions (they may be more recent)
            if not target_file.exists():
                shutil.copy2(session_file, target_file)
                restored_count += 1

        if restored_count > 0:
            logger.info(f"Restored {restored_count} session files from artifacts")

    async def _restore_credentials_for_resume(self, app_dir: str) -> None:
        """Restore Supabase credentials to .env on resume.

        On resume, Leo SaaS passes stored credentials (from Vault) as env vars.
        Since .env is gitignored, it won't be in the cloned repo.
        We must write these credentials to .env so the agent can use the
        existing Supabase project instead of creating a new one.

        NOTE: This is ONLY for resume. For new generations, the agent creates
        the Supabase project and writes credentials to .env itself.
        """
        # Check if this is a resume with stored credentials
        is_resume = os.environ.get('IS_RESUME', '').lower() == 'true'
        supabase_url = os.environ.get('SUPABASE_URL')

        if not is_resume:
            logger.debug("Not a resume - skipping credential restoration")
            return

        if not supabase_url:
            logger.info("Resume mode but no stored SUPABASE_URL - agent will create new project")
            return

        logger.info("Restoring stored credentials to .env for resume")

        # Collect all Supabase/DB credentials from env vars
        cred_keys = [
            'SUPABASE_URL',
            'SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_ROLE_KEY',
            'DATABASE_URL',
            'DATABASE_URL_POOLING',
        ]

        lines = [
            "# =============================================================================",
            "# SUPABASE CREDENTIALS - RESTORED FROM VAULT FOR RESUME",
            "# =============================================================================",
            "# These credentials were saved during the original generation.",
            "# The Supabase project already exists - do NOT create a new one.",
            "# =============================================================================",
            "",
            "SUPABASE_SETUP_COMPLETE=true",
            "",
        ]

        for key in cred_keys:
            value = os.environ.get(key)
            if value:
                lines.append(f"{key}={value}")

        # Add standard app config
        lines.extend([
            "",
            "# App configuration",
            "AUTH_MODE=supabase",
            "STORAGE_MODE=database",
            "PORT=5000",
            "VITE_API_URL=http://localhost:5000",
        ])

        # Write to .env
        os.makedirs(app_dir, exist_ok=True)
        env_path = os.path.join(app_dir, '.env')

        with open(env_path, 'w') as f:
            f.write('\n'.join(lines) + '\n')

        logger.info(f"Restored credentials to {env_path}")
        await self._send_message(create_log_message(
            "Restored Supabase credentials from Vault for resume",
            "info"
        ))

    def _read_app_credentials(self, app_path: str) -> List[Dict[str, str]]:
        """Read Supabase/DB credentials from .env file for persistence.

        Only reads specific credential keys that need to survive across sessions.
        These will be stored in Vault and restored on resume.

        Args:
            app_path: Path to the app directory

        Returns:
            List of {"key": str, "value": str} dicts for relevant credentials
        """
        credentials = []
        env_path = os.path.join(app_path, '.env')

        if not os.path.exists(env_path):
            logger.debug(f"No .env file found at {env_path}")
            return credentials

        try:
            with open(env_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    # Skip comments and empty lines
                    if not line or line.startswith('#'):
                        continue
                    # Parse KEY=VALUE
                    if '=' in line:
                        key, value = line.split('=', 1)
                        key = key.strip()
                        value = value.strip()
                        # Store all env vars with non-empty values
                        if key and value:
                            credentials.append({'key': key, 'value': value})

            if credentials:
                logger.info(f"Read {len(credentials)} env vars from .env for persistence")

        except Exception as e:
            logger.warning(f"Failed to read credentials from .env: {e}")

        return credentials

    async def _save_sessions_periodically(self, app_path: str, iteration_num: int) -> None:
        """Save sessions to artifacts repo after each iteration.

        This ensures sessions are persisted even if generation crashes/stops
        before reaching _finish_generation(). Sessions are critical for resume.

        Args:
            app_path: Path to the app being generated
            iteration_num: Current iteration number (for commit message)
        """
        # Artifacts repo is at workspace root, sessions go to leo-artifacts/sessions/
        if not os.path.exists(os.path.join(self.workspace, ".git")):
            logger.debug("No artifacts repo - skipping periodic session save")
            return

        try:
            # Save Claude sessions to leo-artifacts/sessions/
            artifacts_dir = f"{self.workspace}/leo-artifacts"
            self._save_sessions_to_artifacts(app_path, artifacts_dir)

            # Commit and push from workspace root (artifacts repo)
            subprocess.run(["git", "add", "-A"], cwd=self.workspace, capture_output=True, timeout=30)
            result = subprocess.run(
                ["git", "commit", "-m", f"Session checkpoint after iteration {iteration_num}"],
                cwd=self.workspace, capture_output=True, text=True, timeout=30
            )

            # Only push if there were changes to commit
            if result.returncode == 0:
                push_result = subprocess.run(
                    ["git", "push", "origin", "main"],
                    cwd=self.workspace, capture_output=True, text=True, timeout=60
                )
                if push_result.returncode == 0:
                    logger.info(f"Session checkpoint saved after iteration {iteration_num}")
                else:
                    logger.debug(f"Session push skipped: {push_result.stderr[:100]}")
            else:
                logger.debug("No session changes to commit")

        except Exception as e:
            # Non-fatal - don't interrupt generation for session save failures
            logger.warning(f"Periodic session save failed (non-fatal): {e}")

    async def _push_app_periodically(self, app_path: str, iteration_num: int) -> None:
        """Push app code to GitHub after each iteration.

        This ensures code changes are persisted even if generation crashes/stops
        before reaching _finish_generation().

        Args:
            app_path: Path to the app being generated
            iteration_num: Current iteration number (for commit message)
        """
        if not os.path.exists(os.path.join(app_path, ".git")):
            logger.debug("No git repo in app - skipping periodic push")
            return

        try:
            # Stage all changes
            subprocess.run(["git", "add", "-A"], cwd=app_path, capture_output=True, timeout=30)

            # Commit changes
            result = subprocess.run(
                ["git", "commit", "-m", f"Iteration {iteration_num} checkpoint"],
                cwd=app_path, capture_output=True, text=True, timeout=30
            )

            # Only push if there were changes to commit
            if result.returncode == 0:
                push_result = subprocess.run(
                    ["git", "push", "origin", "main"],
                    cwd=app_path, capture_output=True, text=True, timeout=120
                )
                if push_result.returncode == 0:
                    logger.info(f"App code pushed after iteration {iteration_num}")
                    await self._send_message(create_log_message(
                        f"Code checkpoint saved (iteration {iteration_num})", "info"
                    ))
                else:
                    logger.debug(f"App push skipped: {push_result.stderr[:100]}")
            else:
                logger.debug("No app changes to commit")

        except Exception as e:
            # Non-fatal - don't interrupt generation for push failures
            logger.warning(f"Periodic app push failed (non-fatal): {e}")

    async def _download_attachments(self, attachments: List[AttachmentInfo], app_dir: str) -> int:
        """
        Download attached context files from Supabase Storage to .context/ directory.

        Args:
            attachments: List of attachment metadata from start_generation message
            app_dir: App directory path (e.g., /workspace/app)

        Returns:
            Number of files successfully downloaded
        """
        if not attachments:
            return 0

        # Get attachment storage credentials from environment
        # These point to Leo SaaS's Supabase (separate from the app's Supabase)
        supabase_url = os.environ.get('ATTACHMENT_STORAGE_URL')
        supabase_key = os.environ.get('ATTACHMENT_STORAGE_KEY')

        if not supabase_url or not supabase_key:
            # FAIL FAST: Attachments were requested but credentials are missing
            # This indicates a configuration error in Leo SaaS - generation cannot proceed
            error_msg = (
                "FATAL: Cannot download attachments - missing ATTACHMENT_STORAGE_URL/KEY. "
                "This is a Leo SaaS configuration error. "
                "Generation cannot proceed without attachment credentials."
            )
            logger.error(error_msg)
            await self._send_message(create_log_message(error_msg, "error"))
            raise RuntimeError(error_msg)

        # Create .context directory
        context_dir = os.path.join(app_dir, '.context')
        os.makedirs(context_dir, exist_ok=True)

        logger.info(f"Downloading {len(attachments)} attachment(s) to {context_dir}")
        await self._send_message(create_log_message(
            f"Downloading {len(attachments)} context file(s)...",
            "info"
        ))

        downloaded = 0
        async with httpx.AsyncClient() as client:
            for attachment in attachments:
                try:
                    # Construct Supabase Storage URL
                    # Format: {supabase_url}/storage/v1/object/attachments/{storagePath}
                    storage_url = f"{supabase_url}/storage/v1/object/attachments/{attachment.storagePath}"

                    # Download file
                    response = await client.get(
                        storage_url,
                        headers={"Authorization": f"Bearer {supabase_key}"},
                        timeout=60.0
                    )

                    if response.status_code == 200:
                        # Save to .context directory
                        file_path = os.path.join(context_dir, attachment.name)
                        with open(file_path, 'wb') as f:
                            f.write(response.content)

                        downloaded += 1
                        logger.info(f"Downloaded: {attachment.name} ({attachment.size} bytes)")
                        await self._send_message(create_log_message(
                            f"  Downloaded: {attachment.name}",
                            "info"
                        ))
                    else:
                        logger.warning(f"Failed to download {attachment.name}: HTTP {response.status_code}")
                        await self._send_message(create_log_message(
                            f"  Failed to download: {attachment.name} (HTTP {response.status_code})",
                            "warn"
                        ))

                except Exception as e:
                    logger.warning(f"Error downloading {attachment.name}: {e}")
                    await self._send_message(create_log_message(
                        f"  Error downloading: {attachment.name}: {e}",
                        "warn"
                    ))

        logger.info(f"Downloaded {downloaded}/{len(attachments)} attachment(s)")
        await self._send_message(create_log_message(
            f"Context files ready: {downloaded}/{len(attachments)} downloaded to .context/",
            "info"
        ))

        return downloaded

    async def _handle_start_generation(self, message: StartGenerationMessage) -> None:
        """
        Handle start_generation message from orchestrator.

        This is where we actually run the generation using the agent.
        """
        logger.info(f"Received start_generation: mode={message.mode}, prompt={message.prompt[:LOG_TRUNCATE_PROMPT_DEBUG]}{'...' if len(message.prompt) > LOG_TRUNCATE_PROMPT_DEBUG else ''}")

        # Validate state
        if not self.state_machine.is_ready_for_work():
            logger.error(f"Cannot start generation in state: {self.state_machine.state.value}")
            error_msg = create_error_message(
                f"Cannot start generation in state: {self.state_machine.state.value}",
                error_code="INVALID_STATE",
                fatal=False
            )
            await self._send_message(error_msg)
            return

        # Transition to active
        self.state_machine.transition_to(ConnectionState.ACTIVE, "start_generation received")

        # Reset cost tracker for this generation
        CostTracker.reset()
        logger.info("Cost tracker reset for new generation")

        try:
            # Use real Leo agents (mock mode removed from remote CLI)
            create_app_generator = create_real_app_generator
            create_reprompter_fn = create_real_reprompter

            # Initialize artifacts repo at workspace root (separate from app code)
            # Artifacts repo contains: changelog/, summary_changes/, leo-artifacts/
            # This MUST happen for BOTH new and resume operations so context is preserved
            user_id = os.environ.get("USER_ID", "user_dev_local")
            app_id = os.environ.get("APP_ID", f"app_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
            github_clone_url = os.environ.get("GITHUB_CLONE_URL")
            git_manager = GitManager()

            # =====================================================================
            # EFS Persistent Storage Setup
            # =====================================================================
            # Setup EFS workspace EARLY - before any git operations
            # If EFS available: uses /efs/{app_id}/workspace
            # If EFS not available: uses /workspace unchanged
            workspace_path = await self._setup_efs_workspace(app_id)
            self.workspace = str(workspace_path)
            print(f"[DEBUG-EFS] self.workspace set to: {self.workspace}", file=sys.__stderr__, flush=True)
            logger.info(f"Workspace: {self.workspace}")

            # Show EFS status in console (create_log_message goes to UI, logger.info goes to CloudWatch)
            if str(workspace_path).startswith("/efs"):
                await self._send_message(create_log_message(f"EFS workspace ready: {workspace_path}", "info"))

            # IMPORTANT: Set up conversation logging AFTER workspace is configured!
            # This ensures logs go to the correct path (EFS or local).
            # Must be before agent creation - Agent captures callback at construction.
            print(f"[DEBUG-EFS] About to call _setup_conversation_logging with self.workspace={self.workspace}", file=sys.__stderr__, flush=True)
            logger.info("Setting up conversation logging (after workspace configured)")
            self._setup_conversation_logging(generation_id=app_id)
            print(f"[DEBUG-EFS] AGENT_LOG_DIR is now: {os.environ.get('AGENT_LOG_DIR', 'NOT SET')}", file=sys.__stderr__, flush=True)

            # Set output_dir AFTER workspace is configured (so it uses EFS path if available)
            output_dir = message.output_dir or f"{self.workspace}/app"

            # For resume mode: derive artifacts repo name from the app repo URL
            # (to match the original user_id, not the current one)
            if github_clone_url:
                # Extract repo name from URL: https://github.com/owner/gen-XXX-YYY -> gen-XXX-YYY
                app_repo_name = github_clone_url.rstrip('/').split('/')[-1].replace('.git', '')
                artifacts_repo_name = f"{app_repo_name}-artifacts"
                artifacts_repo_url = github_clone_url.rsplit('/', 1)[0] + '/' + artifacts_repo_name

                logger.info(f"Resume mode: using artifacts repo {artifacts_repo_name}")

                # Clone artifacts repo to workspace root (BEFORE cloning app)
                try:
                    artifacts_repo = self._init_or_clone_artifacts_repo(
                        git_manager, self.workspace, artifacts_repo_url, artifacts_repo_name
                    )
                except Exception as e:
                    logger.warning(f"Artifacts repo setup failed (non-fatal): {e}")
                    artifacts_repo = None
            else:
                # New generation: create artifacts repo at workspace root
                artifacts_repo = git_manager.init_artifacts_repo(
                    workspace_dir=self.workspace,
                    app_id=app_id,
                    user_id=user_id,
                )

            if artifacts_repo:
                await self._send_message(create_log_message(f"Artifacts repo ready: {artifacts_repo.url}", "info"))
            else:
                logger.info("Artifacts repo not configured (GitHub token not set or init failed)")

            # Save initial prompt to artifacts for audit trail
            # This is FATAL if it fails - indicates workspace is broken
            prompt_saver = PromptSaver(self.workspace)
            attachments_meta = None
            if message.attachments:
                attachments_meta = [
                    {"name": att.filename, "type": att.content_type}
                    for att in message.attachments
                ]
            prompt_saver.save_initial_prompt(
                prompt=message.prompt,
                mode=message.mode,
                app_name=message.app_name,
                app_path=message.app_path,
                attachments=attachments_meta,
                metadata={
                    "max_iterations": message.max_iterations,
                    "enable_subagents": message.enable_subagents,
                    "resume_session_id": message.resume_session_id,
                    "app_id": app_id,
                    "user_id": user_id,
                }
            )
            self.prompt_saver = prompt_saver  # Store for iteration prompts
            logger.info("Initial prompt saved to artifacts")

            logger.info(f"Creating app generator: output_dir={output_dir}")
            self.agent = create_app_generator(
                output_dir=output_dir,
                enable_expansion=False,  # Always False for WSI
                enable_subagents=message.enable_subagents
            )

            # Send startup logs with all args
            await self._send_message(create_log_message("App Generator starting up...", "info"))
            await self._send_message(create_log_message("=" * 50, "info"))
            await self._send_message(create_log_message("Configuration:", "info"))
            await self._send_message(create_log_message(f"  Mode: {message.mode}", "info"))
            await self._send_message(create_log_message(f"  Max Iterations: {message.max_iterations}", "info"))
            if message.app_name:
                await self._send_message(create_log_message(f"  App Name: {message.app_name} (new app)", "info"))
            if message.app_path:
                await self._send_message(create_log_message(f"  App Path: {message.app_path} (resume)", "info"))
            await self._send_message(create_log_message(f"  Output Directory: {output_dir}", "info"))
            await self._send_message(create_log_message(f"  Enable Subagents: {message.enable_subagents}", "info"))
            if message.resume_session_id:
                await self._send_message(create_log_message(f"  Resume Session: {message.resume_session_id}", "info"))
            await self._send_message(create_log_message(f"  Prompt: {message.prompt[:LOG_TRUNCATE_PROMPT_DISPLAY]}{'...' if len(message.prompt) > LOG_TRUNCATE_PROMPT_DISPLAY else ''}", "info"))
            await self._send_message(create_log_message("=" * 50, "info"))

            # Store iteration state for the loop
            self.iteration_state = {
                "mode": message.mode,
                "max_iterations": message.max_iterations or 10,
                "current_iteration": 0,
                "app_path": None,
                "start_time": datetime.now(),
                "total_duration": 0,
            }

            # Start log streaming - capture ALL agent logs and stream to orchestrator
            # IMPORTANT: Pass artifacts_dir so logs go to EFS path, not hardcoded /workspace
            log_artifacts_dir = f"{self.workspace}/leo-artifacts"
            logger.info(f"[DEBUG-LOGS] Starting log streaming with artifacts_dir={log_artifacts_dir}")
            log_streamer.start_streaming(self, artifacts_dir=log_artifacts_dir)
            # Verify LogFileWriter state
            if log_streamer.file_writer:
                logger.info(f"[DEBUG-LOGS] LogFileWriter initialized: log_path={log_streamer.file_writer.log_path}")
            else:
                logger.warning("[DEBUG-LOGS] LogFileWriter NOT initialized - file logging disabled!")

            # Start screenshot watcher - monitor for new screenshots and stream to browser
            # Watch the entire workspace since Chrome DevTools saves to app/screenshots/
            # and other tools might save to leo-artifacts/screenshots/
            screenshot_dir = self.workspace
            logger.info(f"Starting screenshot watcher: {screenshot_dir} (recursive)")
            self.screenshot_watcher = create_screenshot_watcher(
                wsi_client=self,
                watch_dir=screenshot_dir,
                poll_interval=1.0,  # Check every second
                debounce_seconds=0.5  # Don't send same file twice within 0.5s
            )
            self.screenshot_watcher.start()

            # Note: conversation logging was already set up above (before agent creation)

            # Check for GitHub clone URL (resume from GitHub)
            github_clone_url = os.environ.get("GITHUB_CLONE_URL")
            cloned_app_path = None
            if github_clone_url:
                logger.info(f"Resume from GitHub URL detected: {github_clone_url}")

                # =============================================================
                # EFS-Aware Resume Logic
                # =============================================================
                # If EFS has files for this app, use them directly (instant resume)
                # Try git pull to sync latest changes, fall back to clone if pull fails
                efs_has_files = self._efs_has_app(app_id)
                app_path = Path(f"{self.workspace}/app")

                if efs_has_files:
                    # EFS has existing files - try to sync with remote
                    logger.info(f"EFS has files for app {app_id} - attempting instant resume")
                    await self._send_message(create_log_message(
                        f"EFS cache found for app - attempting instant resume (~10s)", "info"
                    ))

                    pull_success = await self._try_git_pull(app_path)

                    if pull_success:
                        # Git pull succeeded - use EFS files directly
                        cloned_app_path = str(app_path)
                        logger.info(f"EFS instant resume ready: {cloned_app_path}")
                        await self._send_message(create_log_message(
                            "EFS instant resume successful - skipping clone", "info"
                        ))

                        # Restore Claude sessions from artifacts
                        # Required because ~/.claude symlink to EFS is disabled (performance)
                        # Sessions are stored locally and must be restored from artifacts repo
                        artifacts_dir = f"{self.workspace}/leo-artifacts"
                        self._restore_sessions_from_artifacts(cloned_app_path, artifacts_dir)
                    else:
                        # Git pull failed - fall back to full clone
                        logger.info("EFS git pull failed - falling back to full clone")
                        await self._send_message(create_log_message(
                            "EFS sync failed, falling back to full clone...", "info"
                        ))
                        efs_has_files = False  # Force clone path

                if not efs_has_files:
                    # EFS empty or pull failed - full clone from GitHub
                    await self._send_message(create_log_message("Resuming from GitHub repository...", "info"))
                    try:
                        cloned_app_path = await self._clone_from_github(github_clone_url, message.app_name or "resumed-app")
                        logger.info(f"Cloned to: {cloned_app_path}")

                        # NOTE: Schema restore removed - per-app Supabase projects persist
                        # and already have the correct schema from original generation.
                        # If schema needs fixing, the agent can handle it.

                        # Restore Claude sessions from artifacts (at leo-artifacts/sessions/)
                        # Required because ~/.claude symlink to EFS is disabled (performance)
                        artifacts_dir = f"{self.workspace}/leo-artifacts"
                        self._restore_sessions_from_artifacts(cloned_app_path, artifacts_dir)

                    except Exception as e:
                        error_msg = create_error_message(
                            f"Failed to clone from GitHub: {e}",
                            error_code="CLONE_ERROR",
                            fatal=True
                        )
                        await self._send_message(error_msg)
                        self.state_machine.transition_to(ConnectionState.ERROR, str(e))
                        return

            # Execute generation
            start_time = datetime.now()

            # If we cloned from GitHub, use that path for resume
            app_path_for_resume = cloned_app_path or message.app_path

            if app_path_for_resume:
                # Resume existing app (from local path or cloned from GitHub)
                logger.info(f"Resuming app at {app_path_for_resume}")
                await self._send_message(create_log_message(f"Resuming app at {app_path_for_resume}", "info"))

                # Initialize/configure git in the resume path (may already be configured if cloned)
                await self._init_git_for_workspace(app_path_for_resume)

                # Restore credentials from Vault for resume - .env is gitignored
                await self._restore_credentials_for_resume(app_path_for_resume)

                # Download attached context files to .context/
                if message.attachments:
                    await self._download_attachments(message.attachments, app_path_for_resume)

                app_path, expansion_info = await self.agent.resume_generation(
                    app_path_for_resume,
                    message.prompt
                )
            else:
                # New app generation
                if not message.app_name:
                    error_msg = create_error_message(
                        "app_name is required for new app generation",
                        error_code="MISSING_APP_NAME",
                        fatal=True
                    )
                    await self._send_message(error_msg)
                    self.state_machine.transition_to(ConnectionState.ERROR, "missing app_name")
                    return

                logger.info(f"Creating new app: {message.app_name}")
                await self._send_message(create_log_message(f"Creating new app: {message.app_name}", "info"))

                # Initialize GitHub repo and local git BEFORE generation starts
                # This allows the agent to commit/push throughout generation
                # App is created directly at output_dir (per CONTAINER-STRUCTURE.md)
                app_dir = output_dir
                # Note: user_id, app_id, and git_manager already defined above

                initial_repo = git_manager.init_repo_for_generation(
                    app_dir=app_dir,
                    app_id=app_id,
                    user_id=user_id,
                )
                if initial_repo:
                    await self._send_message(create_log_message(f"GitHub repo ready: {initial_repo.url}", "info"))
                else:
                    # Fallback to local git init only
                    await self._init_git_for_workspace(app_dir)

                # Note: artifacts repo was already initialized above (before agent creation)

                # Download attached context files to .context/
                if message.attachments:
                    await self._download_attachments(message.attachments, app_dir)

                app_path, expansion_info = await self.agent.generate_app(
                    message.prompt,
                    message.app_name
                )

            # Calculate duration and cost for first iteration
            iteration_duration = int((datetime.now() - start_time).total_seconds() * 1000)
            iteration_cost = CostTracker.get_instance().get_total()  # First iteration = total so far
            logger.info(f"First iteration complete: app_path={app_path}, duration={iteration_duration}ms, cost=${iteration_cost:.4f}")

            # Update iteration state
            self.iteration_state["current_iteration"] = 1
            self.iteration_state["app_path"] = app_path
            self.iteration_state["total_duration"] = iteration_duration
            self.iteration_state["cost_snapshot"] = iteration_cost  # Snapshot for next iteration

            # Read credentials for early persistence (in case generation crashes)
            credentials = self._read_app_credentials(app_path)

            # Send first iteration complete
            iteration_msg = create_iteration_complete_message(
                iteration=1,
                app_path=app_path,
                session_id=self.agent.current_session_id,
                session_saved=True,
                duration=iteration_duration,
                iteration_cost=iteration_cost,
                credentials=credentials if credentials else None
            )
            await self._send_message(iteration_msg)

            # Initialize reprompter for subsequent iterations
            # DEBUG: Check env var before reprompter creation (stderr for guaranteed visibility)
            print(f"[DEBUG-REPROMPTER] AGENT_LOG_DIR = {os.environ.get('AGENT_LOG_DIR', 'NOT SET')}", file=sys.__stderr__, flush=True)
            print(f"[DEBUG-REPROMPTER] self.workspace = {self.workspace}", file=sys.__stderr__, flush=True)
            logger.info(f"[DEBUG-REPROMPTER] AGENT_LOG_DIR = {os.environ.get('AGENT_LOG_DIR', 'NOT SET')}")
            logger.info(f"[DEBUG-REPROMPTER] self.workspace = {self.workspace}")
            self.reprompter = create_real_reprompter(app_path)
            logger.info("Reprompter initialized for iteration loop")

            # Save session and push code after first iteration (critical for resume if generation stops)
            await self._save_sessions_periodically(app_path, 1)
            await self._push_app_periodically(app_path, 1)

            # Handle mode-specific iteration logic
            if message.mode == "autonomous":
                await self._run_autonomous_loop(message, app_path)
            elif message.mode == "confirm_first":
                await self._send_decision_prompt(app_path)

        except Exception as e:
            # Enhanced error logging with more context
            error_str = str(e)
            error_type = type(e).__name__

            # Try to extract more details from subprocess errors
            error_details = self._extract_error_details(e)

            logger.error(f"Generation failed: {error_type}: {error_str}", exc_info=True)

            # Log system metrics for debugging
            try:
                import psutil
                process = psutil.Process()
                mem_info = process.memory_info()
                logger.error(f"Memory at error: RSS={mem_info.rss / 1024 / 1024:.1f}MB, VMS={mem_info.vms / 1024 / 1024:.1f}MB")
            except Exception:
                pass

            # Build detailed error message for orchestrator
            detailed_error = f"{error_type}: {error_str}"
            if error_details:
                detailed_error += f"\n{error_details}"
                logger.error(f"Error details:\n{error_details}")

            error_msg = create_error_message(
                f"Generation failed: {detailed_error}",
                error_code="GENERATION_ERROR",
                fatal=True
            )
            await self._send_message(error_msg)
            self.state_machine.transition_to(ConnectionState.ERROR, str(e))

        finally:
            # Stop screenshot watcher
            if self.screenshot_watcher:
                logger.info("Stopping screenshot watcher")
                self.screenshot_watcher.stop()
                self.screenshot_watcher = None

            # Stop log streaming
            logger.info("Stopping log streaming")
            log_streamer.stop_streaming()

            # Clean up conversation logging
            logger.info("Stopping conversation logging")
            self._teardown_conversation_logging()

    def _extract_error_details(self, e: Exception) -> str:
        """
        Extract detailed error information from exceptions.

        Handles subprocess.CalledProcessError, RuntimeError with nested info, etc.
        Returns additional context that might help debug the error.
        """
        details = []

        # Check for subprocess.CalledProcessError attributes
        if hasattr(e, 'returncode'):
            details.append(f"Return code: {e.returncode}")
        if hasattr(e, 'cmd'):
            cmd = e.cmd
            if isinstance(cmd, list):
                cmd = ' '.join(str(c) for c in cmd[:5])  # First 5 parts
            details.append(f"Command: {cmd}")
        if hasattr(e, 'stdout') and e.stdout:
            stdout = e.stdout if isinstance(e.stdout, str) else e.stdout.decode('utf-8', errors='replace')
            # Limit stdout to last 500 chars
            if len(stdout) > 500:
                stdout = f"...{stdout[-500:]}"
            details.append(f"stdout: {stdout}")
        if hasattr(e, 'stderr') and e.stderr:
            stderr = e.stderr if isinstance(e.stderr, str) else e.stderr.decode('utf-8', errors='replace')
            # Limit stderr to last 500 chars
            if len(stderr) > 500:
                stderr = f"...{stderr[-500:]}"
            details.append(f"stderr: {stderr}")
        if hasattr(e, 'output') and e.output:
            output = e.output if isinstance(e.output, str) else e.output.decode('utf-8', errors='replace')
            if len(output) > 500:
                output = f"...{output[-500:]}"
            details.append(f"output: {output}")

        # Check for nested exceptions
        if hasattr(e, '__cause__') and e.__cause__:
            details.append(f"Caused by: {type(e.__cause__).__name__}: {e.__cause__}")
        if hasattr(e, '__context__') and e.__context__ and e.__context__ != e.__cause__:
            details.append(f"Context: {type(e.__context__).__name__}: {e.__context__}")

        return '\n'.join(details) if details else ''

    async def _run_autonomous_loop(self, message: StartGenerationMessage, app_path: str) -> None:
        """
        Run autonomous iteration loop until max_iterations reached.

        Uses reprompter to suggest next tasks and executes them automatically.
        """
        max_iterations = self.iteration_state["max_iterations"]
        logger.info(f"Starting autonomous loop: {self.iteration_state['current_iteration']}/{max_iterations}")

        while self.iteration_state["current_iteration"] < max_iterations:
            # Check for cancellation
            if self.cancellation_requested:
                logger.info("Cancellation requested - stopping autonomous loop")
                await self._finish_generation("user_cancelled", app_path)
                return

            iteration_num = self.iteration_state["current_iteration"] + 1
            await self._send_message(create_log_message(
                f"Iteration {iteration_num}/{max_iterations} - getting next task from reprompter...",
                "info"
            ))

            # Get next task from reprompter
            try:
                next_prompt = await self.reprompter.get_next_prompt()
                logger.info(f"Reprompter suggests: {next_prompt[:LOG_TRUNCATE_PROMPT_REPROMPTER]}{'...' if len(next_prompt) > LOG_TRUNCATE_PROMPT_REPROMPTER else ''}")
                await self._send_message(create_log_message(f"Next task: {next_prompt[:LOG_TRUNCATE_PROMPT_MESSAGE]}{'...' if len(next_prompt) > LOG_TRUNCATE_PROMPT_MESSAGE else ''}", "info"))

                # Check if reprompter signals completion (DONE)
                prompt_upper = next_prompt.strip().upper()
                if prompt_upper == "DONE" or prompt_upper.startswith("DONE"):
                    logger.info("Reprompter signaled DONE - finishing generation")
                    await self._send_message(create_log_message("✅ Generation complete - reprompter signaled DONE", "info"))
                    await self._finish_generation("completed", app_path)
                    return

                # Save iteration prompt to artifacts
                if self.prompt_saver:
                    try:
                        self.prompt_saver.save_iteration_prompt(next_prompt, iteration_num)
                    except Exception as save_err:
                        # Iteration prompt save is non-fatal (we have work in progress)
                        logger.warning(f"Failed to save iteration prompt: {save_err}")
            except Exception as e:
                logger.error(f"Reprompter failed: {e}")
                await self._send_message(create_log_message(f"Reprompter error: {e}", "error"))
                await self._finish_generation("reprompter_error", app_path)
                return

            # Execute iteration
            try:
                iteration_start = datetime.now()
                cost_before = self.iteration_state.get("cost_snapshot", 0.0)
                await self._send_message(create_log_message(
                    f"Executing iteration {iteration_num}...",
                    "info"
                ))

                app_path, expansion_info = await self.agent.resume_generation(
                    self.iteration_state["app_path"],
                    next_prompt
                )

                # Update state with duration and cost
                iteration_duration = int((datetime.now() - iteration_start).total_seconds() * 1000)
                current_total = CostTracker.get_instance().get_total()
                iteration_cost = current_total - cost_before
                self.iteration_state["current_iteration"] = iteration_num
                self.iteration_state["app_path"] = app_path
                self.iteration_state["total_duration"] += iteration_duration
                self.iteration_state["cost_snapshot"] = current_total  # Update snapshot for next iteration

                # Read credentials for persistence (only on early iterations when DB is typically set up)
                credentials = None
                if iteration_num <= 3:  # Only check first 3 iterations for efficiency
                    credentials = self._read_app_credentials(app_path)

                # Send iteration complete
                iteration_msg = create_iteration_complete_message(
                    iteration=iteration_num,
                    app_path=app_path,
                    session_id=self.agent.current_session_id,
                    session_saved=True,
                    duration=iteration_duration,
                    iteration_cost=iteration_cost,
                    credentials=credentials if credentials else None
                )
                await self._send_message(iteration_msg)

                # Record task for reprompter's loop detection
                self.reprompter.record_task(next_prompt, success=True)

                logger.info(f"Iteration {iteration_num} complete: duration={iteration_duration}ms, cost=${iteration_cost:.4f}")

                # Save sessions and push code after each iteration (critical for resume if generation stops)
                await self._save_sessions_periodically(app_path, iteration_num)
                await self._push_app_periodically(app_path, iteration_num)

            except Exception as e:
                self.reprompter.record_task(next_prompt, success=False)

                # Check if this is a recoverable error (e.g., buffer overflow)
                if is_recoverable_error(e):
                    logger.warning(f"Iteration {iteration_num} hit recoverable error: {e}")
                    await self._send_message(create_log_message(
                        f"⚠️ Recoverable error (buffer overflow). "
                        f"Use `| head -c 100000` to truncate large outputs. Continuing to next iteration...",
                        "warn"
                    ))
                    # Push any partial work before continuing
                    try:
                        await self._save_sessions_periodically(app_path, iteration_num)
                        await self._push_app_periodically(app_path, iteration_num)
                    except Exception as save_err:
                        logger.warning(f"Failed to save after recoverable error: {save_err}")
                    # Continue to next iteration instead of ending generation
                    continue

                # Non-recoverable error - end generation
                logger.error(f"Iteration {iteration_num} failed: {e}")
                await self._send_message(create_log_message(f"Iteration failed: {e}", "error"))
                await self._finish_generation("error", app_path)
                return

        # Max iterations reached
        logger.info(f"Autonomous loop complete: {max_iterations} iterations")
        await self._finish_generation("max_iterations", app_path)

    async def _send_decision_prompt(self, app_path: str) -> None:
        """
        Send decision prompt to browser for confirm_first mode.

        Gets suggestion from reprompter and asks user to confirm/modify.
        """
        iteration_num = self.iteration_state["current_iteration"]
        max_iterations = self.iteration_state["max_iterations"]

        # Get suggestion from reprompter
        try:
            suggested_task = await self.reprompter.get_next_prompt()
            logger.info(f"Reprompter suggests for confirm: {suggested_task[:LOG_TRUNCATE_PROMPT_CONFIRM]}{'...' if len(suggested_task) > LOG_TRUNCATE_PROMPT_CONFIRM else ''}")
        except Exception as e:
            logger.error(f"Reprompter failed: {e}")
            suggested_task = None

        # Create unique decision ID
        import uuid
        decision_id = str(uuid.uuid4())[:8]

        # Store pending decision
        self.pending_decisions[decision_id] = {
            "app_path": app_path,
            "suggested_task": suggested_task,
            "iteration": iteration_num,
        }

        # Send decision prompt to browser
        decision_prompt = DecisionPromptMessage(
            id=decision_id,
            prompt="What should I work on next?",
            suggested_task=suggested_task,
            allow_editor=True,
            iteration=iteration_num,
            max_iterations=max_iterations,
            options=["yes", "add", "redirect", "done"]
        )
        await self._send_message(decision_prompt)
        logger.info(f"Sent decision_prompt: id={decision_id}")

        # Transition to waiting for decision
        self.state_machine.transition_to(ConnectionState.PROMPTING, "awaiting user decision")

    async def _finish_generation(self, completion_reason: str, app_path: str) -> None:
        """
        Finish generation - push to GitHub and send all_work_complete.
        """
        logger.info(f"Finishing generation: reason={completion_reason}")

        # Initialize URLs and commit SHA
        github_url = None
        github_commit = None

        # Push to GitHub if token is available
        user_id = os.environ.get("USER_ID", "user_dev_local")
        app_id = os.environ.get("APP_ID", f"app_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
        github_clone_url = os.environ.get("GITHUB_CLONE_URL")

        try:
            git_manager = GitManager()
            if git_manager.is_enabled():
                await self._send_message(create_log_message("Pushing to GitHub...", "info"))

                # Resume mode: If we cloned from an existing repo, push directly to it
                # (don't construct new repo name from user_id which may differ from original)
                if github_clone_url and os.path.exists(os.path.join(app_path, ".git")):
                    logger.info(f"Resume mode: pushing to existing repo from {github_clone_url}")

                    # Commit any changes
                    commit_msg = f"Leo generation complete ({self.iteration_state['current_iteration']} iterations)"
                    subprocess.run(["git", "add", "-A"], cwd=app_path, capture_output=True, timeout=30)
                    subprocess.run(
                        ["git", "commit", "-m", commit_msg],
                        cwd=app_path, capture_output=True, timeout=30
                    )

                    # Push to existing remote (already configured from clone)
                    result = subprocess.run(
                        ["git", "push", "origin", "main"],
                        cwd=app_path, capture_output=True, text=True, timeout=120
                    )

                    if result.returncode == 0:
                        # Extract URL for logging (remove token if present)
                        github_url = github_clone_url.split("@")[-1] if "@" in github_clone_url else github_clone_url
                        if not github_url.startswith("https://"):
                            github_url = "https://" + github_url
                        # Get the commit SHA that was pushed
                        sha_result = subprocess.run(
                            ["git", "rev-parse", "HEAD"],
                            cwd=app_path, capture_output=True, text=True, timeout=10
                        )
                        if sha_result.returncode == 0:
                            github_commit = sha_result.stdout.strip()
                        logger.info(f"GitHub push complete: {github_url} @ {github_commit}")
                        await self._send_message(create_log_message(f"GitHub: {github_url}", "info"))
                    else:
                        logger.warning(f"Git push failed: {result.stderr}")
                        await self._send_message(create_log_message(f"GitHub push warning: {result.stderr[:100]}", "warn"))
                else:
                    # New generation: create repo and push
                    repo = git_manager.create_repo_and_push(
                        app_path=app_path,
                        app_id=app_id,
                        user_id=user_id,
                        commit_message=f"Leo generation complete ({self.iteration_state['current_iteration']} iterations)"
                    )
                    github_url = repo.url
                    # Get the commit SHA that was pushed
                    sha_result = subprocess.run(
                        ["git", "rev-parse", "HEAD"],
                        cwd=app_path, capture_output=True, text=True, timeout=10
                    )
                    if sha_result.returncode == 0:
                        github_commit = sha_result.stdout.strip()
                    logger.info(f"GitHub push complete: {github_url} @ {github_commit}")
                    await self._send_message(create_log_message(f"GitHub: {github_url}", "info"))
            else:
                logger.info("GitHub integration not configured - skipping push")
                await self._send_message(create_log_message("GitHub not configured - skipping push", "warn"))
        except Exception as e:
            logger.warning(f"GitHub push failed (non-fatal): {e}")
            await self._send_message(create_log_message(f"GitHub push skipped: {e}", "warn"))

        # Push artifacts repo (changelog, summary_changes, leo-artifacts)
        # Artifacts repo is at workspace root
        try:
            if os.path.exists(os.path.join(self.workspace, ".git")):
                # Save Claude sessions to leo-artifacts/sessions/ for persistence
                artifacts_dir = f"{self.workspace}/leo-artifacts"
                self._save_sessions_to_artifacts(app_path, artifacts_dir)

                # DEBUG: List leo-artifacts contents before git add
                logger.info(f"[DEBUG-LOGS] Contents of {artifacts_dir}:")
                try:
                    for item in Path(artifacts_dir).rglob("*"):
                        if item.is_file():
                            logger.info(f"[DEBUG-LOGS]   {item.relative_to(Path(artifacts_dir))} ({item.stat().st_size} bytes)")
                except Exception as e:
                    logger.warning(f"[DEBUG-LOGS] Failed to list artifacts: {e}")

                await self._send_message(create_log_message("Pushing artifacts to GitHub...", "info"))
                subprocess.run(["git", "add", "-A"], cwd=self.workspace, capture_output=True, timeout=30)
                subprocess.run(
                    ["git", "commit", "-m", f"Generation complete: {self.iteration_state['current_iteration']} iterations"],
                    cwd=self.workspace, capture_output=True, timeout=30
                )
                result = subprocess.run(
                    ["git", "push", "origin", "main"],
                    cwd=self.workspace, capture_output=True, text=True, timeout=60
                )
                if result.returncode == 0:
                    logger.info("Artifacts repo pushed successfully")
                    await self._send_message(create_log_message("Artifacts pushed to GitHub", "info"))
                else:
                    logger.warning(f"Artifacts push warning: {result.stderr}")
        except Exception as e:
            logger.warning(f"Artifacts push failed (non-fatal): {e}")

        # Detect deployment artifacts
        flyio_url: Optional[str] = None
        try:
            artifacts: DeploymentArtifacts = detect_all_artifacts(app_path)
            if artifacts.flyio_url:
                flyio_url = artifacts.flyio_url
                logger.info(f"Detected Fly.io URL: {flyio_url}")
                await self._send_message(create_log_message(f"Fly.io: {flyio_url}", "info"))
        except Exception as e:
            logger.warning(f"Artifact detection failed (non-fatal): {e}")

        # Check for security warnings (e.g., RLS not enabled)
        warnings = await self._check_rls_warnings(app_path)
        if warnings:
            await self._send_message(create_log_message(
                f"⚠️ Security warning: {warnings[0]['message']}",
                "warning"
            ))

        # Read credentials from .env for persistence (survives across sessions)
        credentials = self._read_app_credentials(app_path)

        # Send all_work_complete with total cost, commit SHA, warnings, and credentials
        total_cost = CostTracker.get_instance().get_total()
        cost_summary = CostTracker.get_instance().get_summary()
        logger.info(f"Sending all_work_complete (total_cost=${total_cost:.4f}, calls={cost_summary['agent_calls']}, commit={github_commit}, warnings={len(warnings)}, credentials={len(credentials)})")
        complete_msg = create_all_work_complete_message(
            completion_reason=completion_reason,
            app_path=app_path,
            total_iterations=self.iteration_state["current_iteration"],
            session_id=self.agent.current_session_id,
            total_duration=self.iteration_state["total_duration"],
            total_cost=total_cost,
            github_url=github_url,
            github_commit=github_commit,
            flyio_url=flyio_url,
            warnings=warnings if warnings else None,
            credentials=credentials if credentials else None,
        )
        await self._send_message(complete_msg)

        # Transition to completed
        self.state_machine.transition_to(ConnectionState.COMPLETED, "generation finished")
        logger.info(f"Generation workflow complete: {self.iteration_state['current_iteration']} iterations")

    async def _handle_user_input(self, message: UserInputMessage) -> None:
        """
        Handle user_input message - inject mid-generation user guidance.

        This allows users to send additional prompts to the agent while it's
        actively working, similar to the Claude Code CLI behavior.
        """
        logger.info(f"Received user_input: {message.content[:50]}...")

        if not self.agent:
            logger.warning("No active agent to receive user input")
            await self._send_message(create_log_message("⚠️ No active generation to receive input", "warning"))
            return

        # Get the underlying cc_agent.Agent from AppGeneratorAgent (or use agent directly)
        # AppGeneratorAgent wraps cc_agent.Agent in self.agent attribute
        inner_agent = getattr(self.agent, 'agent', None)

        # If no inner agent, the agent itself might be cc_agent.Agent
        if inner_agent is None:
            inner_agent = self.agent

        # Check if the inner agent supports streaming input injection
        if hasattr(inner_agent, 'inject_user_message'):
            try:
                success = await inner_agent.inject_user_message(message.content)
                if success:
                    await self._send_message(create_log_message(f"📝 User input received: {message.content[:50]}...", "info"))
                    logger.info("User input successfully injected into agent")
                else:
                    await self._send_message(create_log_message("⚠️ Agent not ready for input (no active streaming generation)", "warning"))
                    logger.warning("Agent rejected user input - no active streaming generation")
            except Exception as e:
                logger.error(f"Error injecting user input: {e}")
                await self._send_message(create_log_message(f"❌ Failed to inject user input: {e}", "error"))
        else:
            await self._send_message(create_log_message("⚠️ Agent does not support mid-generation input", "warning"))
            logger.warning(f"Agent type {type(inner_agent).__name__} does not have inject_user_message method")

    async def _handle_decision_response(self, message: DecisionResponseMessage) -> None:
        """
        Handle decision_response message from orchestrator (confirm_first mode).

        Choices:
        - yes: Execute suggested task as-is
        - add: Append user's input to suggested task
        - redirect: Re-generate suggestion with user's guidance
        - done: Finish generation
        - custom: Use user's input as the task
        """
        logger.info(f"Received decision_response: id={message.id}, choice={message.choice}")

        # Find pending decision
        decision_info = self.pending_decisions.pop(message.id, None)
        if not decision_info:
            logger.warning(f"No pending decision found for id: {message.id}")
            return

        app_path = decision_info["app_path"]
        suggested_task = decision_info["suggested_task"]

        # Handle choice
        if message.choice == "done":
            await self._finish_generation("user_done", app_path)
            return

        # Determine the prompt to execute
        if message.choice == "yes":
            next_prompt = suggested_task
        elif message.choice == "add":
            next_prompt = f"{suggested_task}\n\nIMPORTANT: {message.input}"
        elif message.choice == "redirect":
            # Re-get prompt with user's guidance
            try:
                next_prompt = await self.reprompter.get_next_prompt(
                    strategic_guidance=message.input,
                    original_prompt=suggested_task
                )
            except Exception as e:
                logger.error(f"Reprompter redirect failed: {e}")
                next_prompt = message.input or suggested_task
        else:
            # Custom prompt from user
            next_prompt = message.input or suggested_task

        if not next_prompt:
            logger.warning("No prompt to execute, sending new decision prompt")
            await self._send_decision_prompt(app_path)
            return

        # Execute iteration
        try:
            iteration_num = self.iteration_state["current_iteration"] + 1
            iteration_start = datetime.now()
            cost_before = self.iteration_state.get("cost_snapshot", 0.0)

            # Save iteration prompt to artifacts (confirm_first mode)
            if self.prompt_saver:
                try:
                    self.prompt_saver.save_iteration_prompt(
                        next_prompt,
                        iteration_num,
                        metadata={"mode": "confirm_first", "choice": message.choice}
                    )
                except Exception as save_err:
                    # Iteration prompt save is non-fatal (we have work in progress)
                    logger.warning(f"Failed to save iteration prompt: {save_err}")

            await self._send_message(create_log_message(f"Executing: {next_prompt[:LOG_TRUNCATE_PROMPT_EXECUTE]}{'...' if len(next_prompt) > LOG_TRUNCATE_PROMPT_EXECUTE else ''}", "info"))

            app_path, expansion_info = await self.agent.resume_generation(app_path, next_prompt)

            # Update state with duration and cost
            iteration_duration = int((datetime.now() - iteration_start).total_seconds() * 1000)
            current_total = CostTracker.get_instance().get_total()
            iteration_cost = current_total - cost_before
            self.iteration_state["current_iteration"] = iteration_num
            self.iteration_state["app_path"] = app_path
            self.iteration_state["total_duration"] += iteration_duration
            self.iteration_state["cost_snapshot"] = current_total  # Update snapshot for next iteration

            # Read credentials for persistence (only on early iterations when DB is typically set up)
            credentials = None
            if iteration_num <= 3:  # Only check first 3 iterations for efficiency
                credentials = self._read_app_credentials(app_path)

            # Send iteration complete
            iteration_msg = create_iteration_complete_message(
                iteration=iteration_num,
                app_path=app_path,
                session_id=self.agent.current_session_id,
                session_saved=True,
                duration=iteration_duration,
                iteration_cost=iteration_cost,
                credentials=credentials if credentials else None
            )
            await self._send_message(iteration_msg)

            # Record for reprompter
            self.reprompter.record_task(next_prompt, success=True)
            logger.info(f"Iteration {iteration_num} complete: duration={iteration_duration}ms, cost=${iteration_cost:.4f}")

            # Send next decision prompt
            await self._send_decision_prompt(app_path)

        except Exception as e:
            self.reprompter.record_task(next_prompt, success=False)

            # Check if this is a recoverable error (e.g., buffer overflow)
            if is_recoverable_error(e):
                logger.warning(f"Iteration {iteration_num} hit recoverable error: {e}")
                await self._send_message(create_log_message(
                    f"⚠️ Recoverable error (buffer overflow). "
                    f"Use `| head -c 100000` to truncate large outputs.",
                    "warn"
                ))
                # Push any partial work
                try:
                    await self._save_sessions_periodically(app_path, iteration_num)
                    await self._push_app_periodically(app_path, iteration_num)
                except Exception as save_err:
                    logger.warning(f"Failed to save after recoverable error: {save_err}")
                # Go back to decision prompt for confirm_first mode
                await self._send_decision_prompt(app_path)
                return

            # Non-recoverable error - end generation
            logger.error(f"Iteration failed: {e}")
            await self._send_message(create_log_message(f"Error: {e}", "error"))
            await self._finish_generation("error", app_path)

    async def _handle_control_command(self, message: ControlCommandMessage) -> None:
        """
        Handle control_command message from orchestrator.

        Commands:
        - prepare_shutdown: Save work to git and signal ready for termination
        - pause/resume/cancel: Not yet implemented
        """
        logger.info(f"Received control_command: {message.command}")

        if message.command == "prepare_shutdown":
            await self._handle_prepare_shutdown(message)
        else:
            logger.warning(f"Unhandled control command: {message.command}")
            await self._send_message(create_log_message(
                f"Ignoring unhandled control command: {message.command}",
                "warn"
            ))

    async def _handle_prepare_shutdown(self, message: ControlCommandMessage) -> None:
        """
        Handle prepare_shutdown command - save work and signal ready for termination.

        This is part of the graceful shutdown protocol:
        1. Orchestrator sends prepare_shutdown
        2. Container sets cancellation flag and waits briefly for generation to pause
        3. Container calls _finish_generation('cancelled', ...) which:
           - Commits all work to git
           - Pushes app repo to GitHub (if configured)
           - Pushes artifacts repo to GitHub
           - Reads credentials from .env
           - Sends all_work_complete with completion_reason='cancelled'
        4. SaaS receives all_work_complete, updates DB with status='paused'
        5. Orchestrator terminates container
        6. App is resumable (github_url, credentials, session_id all preserved)
        """
        logger.info("Preparing for shutdown - saving work...")
        await self._send_message(create_log_message("Preparing for shutdown - saving work...", "info"))

        # Signal cancellation to any running generation
        self.cancellation_requested = True

        # If generation is running, wait briefly for it to reach a safe point
        # The agent commits periodically, so we just need to let current operation finish
        if self.generation_task and not self.generation_task.done():
            logger.info("Generation in progress - waiting for safe pause point...")
            await self._send_message(create_log_message("Waiting for agent to reach safe point...", "info"))
            try:
                # Wait up to 10 seconds for generation to notice cancellation
                # The agent should check cancellation_requested between operations
                await asyncio.wait_for(asyncio.shield(self.generation_task), timeout=10.0)
            except asyncio.TimeoutError:
                logger.warning("Generation did not stop in time, proceeding with save anyway")
                await self._send_message(create_log_message("Agent busy - saving current state...", "warn"))
            except Exception as e:
                logger.warning(f"Generation task error during shutdown: {e}")

        try:
            # Find the app directory - look for .git in the workspace tree
            # App is generated at: /workspace/app (per CONTAINER-STRUCTURE.md)
            app_path = None

            workspace_path = Path(self.workspace)
            if workspace_path.exists():
                # Search for .git directories (up to 4 levels deep)
                for git_dir in workspace_path.glob("**/.git"):
                    if git_dir.is_dir():
                        app_path = str(git_dir.parent)
                        logger.info(f"Found git repo at: {app_path}")
                        break

            if not app_path:
                # Fallback to workspace/app
                app_path = os.path.join(self.workspace, "app")

            logger.info(f"Saving work from: {app_path}")

            # Check if git repo exists
            git_dir = os.path.join(app_path, ".git")
            if not os.path.exists(git_dir):
                logger.warning(f"No git repo at {app_path}, nothing to save")
                # Still send all_work_complete so SaaS can update status properly
                await self._send_message(create_all_work_complete_message(
                    completion_reason="cancelled",
                    app_path=app_path,
                    total_iterations=self.iteration_state.get("current_iteration", 0),
                    session_id=getattr(self.agent, 'current_session_id', None) if self.agent else None,
                    total_duration=self.iteration_state.get("total_duration", 0),
                    total_cost=CostTracker.get_instance().get_total(),
                ))
                return

            # Commit any uncommitted changes before _finish_generation pushes
            try:
                result = subprocess.run(
                    ["git", "add", "-A"],
                    cwd=app_path,
                    capture_output=True,
                    text=True,
                    timeout=30
                )

                result = subprocess.run(
                    ["git", "status", "--porcelain"],
                    cwd=app_path,
                    capture_output=True,
                    text=True,
                    timeout=30
                )

                if result.stdout.strip():
                    logger.info("Committing uncommitted changes before shutdown...")
                    await self._send_message(create_log_message("Committing changes...", "info"))
                    subprocess.run(
                        ["git", "commit", "-m", "WIP: Auto-save before shutdown"],
                        cwd=app_path,
                        capture_output=True,
                        text=True,
                        timeout=60
                    )
            except Exception as e:
                logger.warning(f"Pre-shutdown commit failed (continuing): {e}")

            # Use _finish_generation to handle GitHub push, credentials, and all_work_complete
            # This ensures cancelled generations have the same data as completed ones
            await self._finish_generation(completion_reason="cancelled", app_path=app_path)

            logger.info("Shutdown preparation complete - all_work_complete sent")

        except Exception as e:
            logger.error(f"Shutdown preparation failed: {e}", exc_info=True)
            await self._send_message(create_shutdown_failed_message(
                reason=str(e)
            ))

    async def disconnect(self) -> None:
        """Disconnect from orchestrator"""
        logger.info("Disconnecting")
        self.running = False
        self.connected = False

        if self.websocket:
            try:
                await self.websocket.close()
            except:
                pass

        logger.info("Disconnected")

    async def run(self) -> None:
        """
        Run the client (connect and process messages until completion).

        This is the main entry point for the client.
        """
        try:
            await self.connect()
            await self.receive_loop()
        except KeyboardInterrupt:
            logger.info("Client interrupted by user")
        finally:
            await self.disconnect()
