"""
WSI Client v2 - WebSocket Client Implementation (Full Feature Parity)

BASED ON: wsi_server/server.py (full business logic implementation)
ADAPTED FOR: Client connection model (connect + retry instead of serve)

This implementation has 100% feature parity with the server:
- All 3 modes: autonomous, interactive, confirm_first
- Decision prompts and responses
- Context commands: /context, /save, /clear
- Multi-iteration workflow
- Session management

KEY DIFFERENCES FROM SERVER:
1. Connection: websockets.connect() instead of websockets.serve()
2. Single connection: Direct context storage instead of dict[websocket, context]
3. Reconnection: Exponential backoff retry logic
4. Log streaming: Integrated with log_streamer
5. Message loop: await websocket.recv() instead of async for
"""

import asyncio
import logging
import socket
import sys
import os
from pathlib import Path
from typing import Optional
from datetime import datetime

import websockets
from websockets.client import WebSocketClientProtocol

# Import from wsi_server package - reuse protocol and state machine
from ..wsi_server.protocol import (
    MessageParser,
    MessageSerializer,
    WSIMessage,
    StartGenerationMessage,
    DecisionResponseMessage,
    DecisionPromptMessage,
    SessionLoadedMessage,
    SessionSavedMessage,
    SessionClearedMessage,
    ContextDisplayMessage,
    create_ready_message,
    create_log_message,
    create_error_message,
    create_all_work_complete_message,
    create_iteration_complete_message,
)
from ..wsi_server.state_machine import StateMachine, ConnectionState

# Import real Leo agents (required - no mock mode in remote CLI)
from app_factory_leonardo_replit.agents.app_generator import (
    create_app_generator as create_real_app_generator,
    AppGeneratorAgent,
)
from app_factory_leonardo_replit.agents.reprompter import (
    create_reprompter as create_real_reprompter,
    SimpleReprompter,
)
REAL_LEO_AVAILABLE = True

# Import log streaming (CLIENT-SPECIFIC)
from ..wsi_client.log_streamer import log_streamer

logger = logging.getLogger(__name__)


# ============================================================================
# WSI Client v2 - Full Feature Parity with Server
# ============================================================================

class WSIClient:
    """
    WebSocket client implementing WSI Protocol v2.1 with full feature parity.

    BASED ON WSIServer but adapted for client connection model:
    - Connects TO orchestrator (instead of accepting connections)
    - Single connection (instead of multiple clients)
    - Retry with exponential backoff (client-specific)
    - Log streaming integration (client-specific)

    Supports all features:
    - All 3 modes: autonomous, interactive, confirm_first
    - Decision prompts and handling
    - Context commands: /context, /save, /clear
    - Multi-iteration workflow
    - Session management
    """

    def __init__(
        self,
        ws_url: str,
        use_mock: bool = True,
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
            use_mock: Use mock AppGeneratorAgent (default: True)
            workspace: Workspace directory path (default: /workspace)
            connect_timeout: Timeout for connection in seconds (default: 30)
            send_timeout: Timeout for sending messages in seconds (default: 10)
            max_retries: Maximum connection retry attempts (default: 5)
            retry_backoff_base: Base delay for exponential backoff (default: 1.0)
        """
        self.ws_url = ws_url
        self.use_mock = use_mock
        self.workspace = workspace
        self.connect_timeout = connect_timeout
        self.send_timeout = send_timeout
        self.max_retries = max_retries
        self.retry_backoff_base = retry_backoff_base

        # CLIENT-SPECIFIC: Connection state
        self.websocket: Optional[WebSocketClientProtocol] = None
        self.connected = False
        self.running = True
        self.retry_count = 0

        # Get container ID
        self.container_id = self._get_container_id()

        # CLIENT-SPECIFIC: Single connection context (not a dict like server)
        # This stores the same data as server's connection_agents[websocket]
        self.connection_context: Optional[dict] = None
        self.pending_decisions: dict = {}  # decision_id -> decision_info

        # State machine
        self.state_machine = StateMachine(ConnectionState.CONNECTING)

        logger.info("WSI Client v2 initialized (full feature parity)")
        logger.info(f"   URL: {ws_url}")
        logger.info(f"   Mode: {'MOCK' if use_mock else 'REAL'}")
        logger.info(f"   Workspace: {workspace}")
        logger.info(f"   Container ID: {self.container_id}")

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

        CLIENT-SPECIFIC: Implements exponential backoff on connection failures.
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
            generator_mode="mock" if self.use_mock else "real"
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

        except Exception as e:
            logger.error(f"Failed to send message: {e}", exc_info=True)
            self.connected = False
            raise

    async def receive_loop(self) -> None:
        """
        Main receive loop - processes messages from orchestrator.

        CLIENT-SPECIFIC: Automatically attempts to reconnect on connection loss.
        """
        logger.info("Starting receive loop")

        while self.running:
            try:
                # Ensure we're connected
                if not self.connected:
                    logger.info("Not connected, attempting to connect")
                    await self.connect()

                # CLIENT-SPECIFIC: Message loop with recv() instead of async for
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

                        # Route message (same logic as server!)
                        if isinstance(message, StartGenerationMessage):
                            await self._handle_start_generation(message)
                        elif isinstance(message, DecisionResponseMessage):
                            await self._handle_decision_response(message)
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

    # ========================================================================
    # Message Handlers (COPIED FROM SERVER - Full Feature Parity)
    # ========================================================================

    async def _handle_start_generation(self, message: StartGenerationMessage) -> None:
        """
        Handle start_generation message from orchestrator.

        COPIED FROM SERVER with adaptations:
        - Uses self.connection_context instead of self.connection_agents[websocket]
        - Adds log streaming (CLIENT-SPECIFIC)
        """
        logger.info(f"Received start_generation: mode={message.mode}, prompt={message.prompt[:50]}...")

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

        try:
            # Create agent (always with enable_expansion=False for WSI)
            output_dir = message.output_dir or f"{self.workspace}/app"

            # Choose factory function based on mode
            if self.use_mock:
                create_app_generator = create_mock_app_generator
                create_reprompter_fn = create_mock_reprompter
            else:
                if not REAL_LEO_AVAILABLE:
                    raise RuntimeError("Real Leo not available - app-factory not installed")
                create_app_generator = create_real_app_generator
                create_reprompter_fn = create_real_reprompter

            agent = create_app_generator(
                output_dir=output_dir,
                enable_expansion=False,  # Always False for WSI
                enable_subagents=message.enable_subagents
            )

            # Create reprompter if interactive/confirm_first mode
            # (Note: reprompter needs app_path, so we'll create it after we know the path)
            reprompter: Optional[MockReprompterAgent] = None

            # CLIENT-SPECIFIC: Store in single connection context (not dict)
            self.connection_context = {
                "agent": agent,
                "reprompter": None,  # Will be created after first iteration
                "mode": message.mode,
                "max_iterations": message.max_iterations or 10,
                "current_iteration": 0,
                "start_time": datetime.now(),
                "total_duration": 0,
                "app_path": None,
                "initial_prompt": message.prompt,
                "create_reprompter_fn": create_reprompter_fn,
            }

            start_time = datetime.now()

            # Send startup logs
            await self._send_message(create_log_message("App Generator starting up...", "info"))
            await self._send_message(create_log_message(f"Mode: {message.mode}", "info"))
            await self._send_message(create_log_message(f"Output directory: {output_dir}", "info"))

            # CLIENT-SPECIFIC: Start log streaming
            logger.info("Starting log streaming for generation")
            log_streamer.start_streaming(self)

            try:
                # Determine if new app or resume
                if message.app_path:
                    # Resume existing app
                    await self._send_message(create_log_message(f"Resuming app at {message.app_path}", "info"))

                    # Execute iteration
                    app_path, expansion_info = await agent.resume_generation(
                        message.app_path,
                        message.prompt
                    )

                    # Send session loaded if session exists
                    if agent.current_session_id:
                        session_msg = SessionLoadedMessage(
                            session_id=agent.current_session_id,
                            app_path=app_path,
                            features=agent.generation_context.get("features", []),
                            iterations=agent.generation_context.get("total_iterations", 0),
                            last_action=agent.generation_context.get("last_action", "")
                        )
                        await self._send_message(session_msg)

                    self.connection_context["app_path"] = app_path

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

                    await self._send_message(create_log_message(f"Creating new app: {message.app_name}", "info"))

                    # Execute iteration
                    app_path, expansion_info = await agent.generate_app(
                        message.prompt,
                        message.app_name
                    )

                    self.connection_context["app_path"] = app_path

                # Update iteration count
                self.connection_context["current_iteration"] = 1
                duration = int((datetime.now() - start_time).total_seconds() * 1000)
                self.connection_context["total_duration"] = duration

                # Send iteration complete
                iteration_msg = create_iteration_complete_message(
                    iteration=1,
                    app_path=app_path,
                    session_id=agent.current_session_id,
                    session_saved=True,
                    duration=duration
                )
                await self._send_message(iteration_msg)

                # Now handle next step based on mode
                if message.mode == "autonomous":
                    # Autonomous mode: no prompting, just finish
                    await self._finish_generation("autonomous_complete")

                elif message.mode in ("interactive", "confirm_first"):
                    # Create reprompter now that we have app_path
                    reprompter = create_reprompter_fn(app_path=app_path)
                    self.connection_context["reprompter"] = reprompter

                    # Interactive modes: send decision prompt
                    await self._send_decision_prompt(agent, reprompter)

            finally:
                # CLIENT-SPECIFIC: Stop log streaming
                logger.info("Stopping log streaming")
                log_streamer.stop_streaming()

        except Exception as e:
            logger.error(f"Generation failed: {e}", exc_info=True)
            error_msg = create_error_message(
                f"Generation failed: {e}",
                error_code="GENERATION_ERROR",
                fatal=True
            )
            await self._send_message(error_msg)
            self.state_machine.transition_to(ConnectionState.ERROR, str(e))
            # Clean up connection state
            self.connection_context = None

    async def _send_decision_prompt(
        self,
        agent: MockAppGeneratorAgent,
        reprompter: Optional[MockReprompterAgent]
    ) -> None:
        """
        Send decision_prompt to user requesting next action.

        COPIED FROM SERVER with adaptations:
        - Uses self.connection_context instead of self.connection_agents[websocket]

        Args:
            agent: App generator agent
            reprompter: Reprompter agent (can be None for interactive mode)
        """
        conn_state = self.connection_context
        if not conn_state:
            logger.error("No connection state found for decision prompt")
            return

        # Transition to prompting state
        self.state_machine.transition_to(ConnectionState.PROMPTING, "awaiting user decision")

        # Get suggested task from reprompter (if confirm_first mode)
        suggested_task = None
        if conn_state["mode"] == "confirm_first" and reprompter:
            suggested_task = await reprompter.get_next_prompt(
                original_prompt=conn_state["initial_prompt"]
            )

        # Generate decision ID
        import uuid
        decision_id = f"decision_{uuid.uuid4().hex[:8]}"

        # Store decision info
        self.pending_decisions[decision_id] = {
            "suggested_task": suggested_task,
        }

        # Create decision prompt message
        decision_msg = DecisionPromptMessage(
            id=decision_id,
            prompt="What would you like to do next?",
            suggested_task=suggested_task,
            allow_editor=True,
            iteration=conn_state["current_iteration"],
            max_iterations=conn_state["max_iterations"],
            options=["yes", "add", "redirect", "done", "/context", "/save", "/clear"]
        )

        await self._send_message(decision_msg)
        logger.info(f"Sent decision prompt: {decision_id}")

    async def _finish_generation(self, completion_reason: str) -> None:
        """
        Finish generation and send all_work_complete message.

        COPIED FROM SERVER with adaptations:
        - Uses self.connection_context instead of self.connection_agents[websocket]

        Args:
            completion_reason: Reason for completion (max_iterations, user_done, error)
        """
        conn_state = self.connection_context
        if not conn_state:
            logger.error("No connection state found for finish")
            return

        agent = conn_state["agent"]
        app_path = conn_state["app_path"]

        # Send all work complete
        complete_msg = create_all_work_complete_message(
            completion_reason=completion_reason,
            app_path=app_path,
            total_iterations=conn_state["current_iteration"],
            session_id=agent.current_session_id,
            total_duration=conn_state["total_duration"]
        )
        await self._send_message(complete_msg)

        # Transition to completed
        self.state_machine.transition_to(ConnectionState.COMPLETED, "generation finished")

        # Clean up connection state
        self.connection_context = None

        logger.info(f"Generation complete: {app_path}")

    async def _handle_decision_response(self, message: DecisionResponseMessage) -> None:
        """
        Handle decision_response message.

        COPIED FROM SERVER with adaptations:
        - Uses self.connection_context instead of self.connection_agents[websocket]

        Processes user decisions and continues generation accordingly.
        Supports: yes, add, redirect, done, and context commands.

        Args:
            message: Parsed decision_response message
        """
        # Validate state
        if self.state_machine.state != ConnectionState.PROMPTING:
            error_msg = create_error_message(
                f"Cannot handle decision in state: {self.state_machine.state.value}",
                error_code="INVALID_STATE",
                fatal=False
            )
            await self._send_message(error_msg)
            return

        # Get connection state
        conn_state = self.connection_context
        if not conn_state:
            error_msg = create_error_message(
                "No active generation session",
                error_code="NO_SESSION",
                fatal=True
            )
            await self._send_message(error_msg)
            return

        # Get decision info
        decision_info = self.pending_decisions.pop(message.id, None)
        if not decision_info:
            logger.warning(f"Unknown decision ID: {message.id}")
            error_msg = create_error_message(
                "Invalid decision ID",
                error_code="INVALID_DECISION_ID",
                fatal=False
            )
            await self._send_message(error_msg)
            return

        agent = conn_state["agent"]
        reprompter = conn_state["reprompter"]
        app_path = conn_state["app_path"]

        try:
            # Handle context commands
            if message.choice.startswith("/"):
                await self._handle_context_command(
                    message.choice,
                    agent,
                    app_path
                )
                # After context command, send another decision prompt
                await self._send_decision_prompt(agent, reprompter)
                return

            # Handle user decisions
            if message.choice == "done":
                # User is done
                await self._send_message(create_log_message("User indicated completion", "info"))
                await self._finish_generation("user_done")

            elif message.choice in ("yes", "add", "redirect"):
                # Determine next prompt
                next_prompt = None

                if message.choice == "yes":
                    # Use suggested task
                    next_prompt = decision_info.get("suggested_task")
                    if not next_prompt:
                        error_msg = create_error_message(
                            "No suggested task available for 'yes'",
                            error_code="NO_SUGGESTION",
                            fatal=False
                        )
                        await self._send_message(error_msg)
                        # Send another prompt
                        await self._send_decision_prompt(agent, reprompter)
                        return

                elif message.choice in ("add", "redirect"):
                    # Use custom input
                    next_prompt = message.input
                    if not next_prompt:
                        error_msg = create_error_message(
                            f"'{message.choice}' requires input field",
                            error_code="MISSING_INPUT",
                            fatal=False
                        )
                        await self._send_message(error_msg)
                        # Send another prompt
                        await self._send_decision_prompt(agent, reprompter)
                        return

                # Execute next iteration
                await self._execute_iteration(
                    agent,
                    reprompter,
                    next_prompt
                )

            else:
                # Custom prompt (not a predefined choice)
                next_prompt = message.choice
                await self._execute_iteration(
                    agent,
                    reprompter,
                    next_prompt
                )

        except Exception as e:
            logger.error(f"Error handling decision: {e}", exc_info=True)
            error_msg = create_error_message(
                f"Failed to process decision: {e}",
                error_code="DECISION_ERROR",
                fatal=True
            )
            await self._send_message(error_msg)
            self.state_machine.transition_to(ConnectionState.ERROR, str(e))

    async def _handle_context_command(
        self,
        command: str,
        agent: MockAppGeneratorAgent,
        app_path: str
    ) -> None:
        """
        Handle context commands: /context, /save, /clear.

        COPIED FROM SERVER with adaptations:
        - Uses self.connection_context instead of self.connection_agents[websocket]

        Args:
            command: Context command (/context, /save, /clear)
            agent: App generator agent
            app_path: App path
        """
        if command == "/context":
            # Get session context
            context_info = agent.get_session_context()

            context_msg = ContextDisplayMessage(
                session_id=agent.current_session_id,
                app_path=app_path,
                features=context_info.get("features", []),
                iterations=context_info.get("total_iterations", 0),
                last_action=context_info.get("last_action", ""),
                mode=self.connection_context["mode"]
            )
            await self._send_message(context_msg)
            logger.info(f"Displayed context for session: {agent.current_session_id}")

        elif command == "/save":
            # Save session
            agent.save_session(app_path)

            save_msg = SessionSavedMessage(
                session_id=agent.current_session_id,
                app_path=app_path,
                auto=False  # Explicit save
            )
            await self._send_message(save_msg)
            logger.info(f"Saved session: {agent.current_session_id}")

        elif command == "/clear":
            # Clear session
            old_session_id = agent.current_session_id
            agent.clear_session(app_path)

            clear_msg = SessionClearedMessage(
                app_path=app_path
            )
            await self._send_message(clear_msg)
            logger.info(f"Cleared session: {old_session_id}")

        else:
            # Unknown command
            error_msg = create_error_message(
                f"Unknown context command: {command}",
                error_code="UNKNOWN_COMMAND",
                fatal=False,
                recovery_hint="Valid commands: /context, /save, /clear"
            )
            await self._send_message(error_msg)

    async def _execute_iteration(
        self,
        agent: MockAppGeneratorAgent,
        reprompter: Optional[MockReprompterAgent],
        prompt: str
    ) -> None:
        """
        Execute one iteration of generation.

        COPIED FROM SERVER with adaptations:
        - Uses self.connection_context instead of self.connection_agents[websocket]

        Args:
            agent: App generator agent
            reprompter: Reprompter agent (optional)
            prompt: Prompt for this iteration
        """
        conn_state = self.connection_context
        if not conn_state:
            logger.error("No connection state for iteration")
            return

        # Check max iterations
        if conn_state["current_iteration"] >= conn_state["max_iterations"]:
            await self._send_message(create_log_message("Max iterations reached", "info"))
            await self._finish_generation("max_iterations")
            return

        # Transition back to active
        self.state_machine.transition_to(ConnectionState.ACTIVE, "executing iteration")

        # Log iteration start
        await self._send_message(
            create_log_message(f"Starting iteration {conn_state['current_iteration'] + 1}: {prompt}", "info")
        )

        # Execute iteration
        start_time = datetime.now()
        app_path, expansion_info = await agent.resume_generation(
            conn_state["app_path"],
            prompt
        )

        # Update state
        conn_state["current_iteration"] += 1
        conn_state["app_path"] = app_path
        duration = int((datetime.now() - start_time).total_seconds() * 1000)
        conn_state["total_duration"] += duration

        # Send iteration complete
        iteration_msg = create_iteration_complete_message(
            iteration=conn_state["current_iteration"],
            app_path=app_path,
            session_id=agent.current_session_id,
            session_saved=True,
            duration=duration
        )
        await self._send_message(iteration_msg)

        # Check if we should continue or finish
        if conn_state["current_iteration"] >= conn_state["max_iterations"]:
            # Max iterations reached
            await self._finish_generation("max_iterations")
        else:
            # Send next decision prompt
            await self._send_decision_prompt(agent, reprompter)

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
