"""
WSI Server - WebSocket Server Implementation

Implements the WebSocket server that accepts connections and handles the
WSI Protocol v2.1 message flow.
"""

import asyncio
import logging
import socket
import sys
from pathlib import Path
from typing import Optional, Set
from datetime import datetime

import websockets
from websockets.server import WebSocketServerProtocol

from .protocol import (
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
from .state_machine import StateMachine, ConnectionState

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

logger = logging.getLogger(__name__)


# ============================================================================
# WSI Server
# ============================================================================

class WSIServer:
    """
    WebSocket server implementing WSI Protocol v2.1.

    Handles WebSocket connections and translates WSI Protocol messages to
    AppGeneratorAgent method calls.
    """

    def __init__(
        self,
        host: str = "0.0.0.0",
        port: int = 8765,
        use_mock: bool = True,
        workspace: str = "/workspace"
    ):
        """
        Initialize WSI Server.

        Args:
            host: Host address to bind to (default: 0.0.0.0)
            port: Port to listen on (default: 8765)
            use_mock: Use mock AppGeneratorAgent (default: True)
            workspace: Workspace directory path (default: /workspace)
        """
        self.host = host
        self.port = port
        self.use_mock = use_mock
        self.workspace = workspace

        self.server: Optional[websockets.WebSocketServer] = None
        self.active_connections: Set[WebSocketServerProtocol] = set()
        self.is_running = False

        # Get hostname for container_id
        self.container_id = self._get_container_id()

        # Connection-specific state (keyed by websocket)
        self.connection_agents: dict = {}  # websocket -> (agent, reprompter, iteration_state)
        self.pending_decisions: dict = {}  # decision_id -> (websocket, decision_info)

        logger.info("WSI Server initialized")
        logger.info(f"   Host: {host}:{port}")
        logger.info(f"   Mode: {'MOCK' if use_mock else 'REAL'}")
        logger.info(f"   Workspace: {workspace}")
        logger.info(f"   Container ID: {self.container_id}")

    def _get_container_id(self) -> str:
        """Get container ID from hostname or generate one"""
        try:
            return socket.gethostname()
        except Exception:
            return f"wsi_server_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    async def start(self) -> None:
        """
        Start the WebSocket server and run until interrupted.

        This method blocks until the server is shut down.
        """
        logger.info(f"Starting WebSocket server on {self.host}:{self.port}")

        try:
            async with websockets.serve(
                self.handle_connection,
                self.host,
                self.port,
                ping_interval=30,
                ping_timeout=10,
            ) as server:
                self.server = server
                self.is_running = True
                logger.info(f"WSI Server listening on ws://{self.host}:{self.port}")
                logger.info("Ready to accept connections...")

                # Keep server running until interrupted
                await asyncio.Future()  # Run forever

        except OSError as e:
            logger.error(f"Failed to start server: {e}")
            raise
        except KeyboardInterrupt:
            logger.info("Server interrupted by user")
        finally:
            self.is_running = False
            logger.info("Server stopped")

    async def stop(self) -> None:
        """
        Stop the WebSocket server gracefully.

        Closes all active connections and shuts down the server.
        """
        logger.info("Stopping WSI Server...")

        self.is_running = False

        # Close all active connections
        if self.active_connections:
            logger.info(f"Closing {len(self.active_connections)} active connections")
            await asyncio.gather(
                *[conn.close() for conn in self.active_connections],
                return_exceptions=True
            )
            self.active_connections.clear()

        # Close server
        if self.server:
            self.server.close()
            await self.server.wait_closed()

        logger.info("Server stopped successfully")

    async def handle_connection(
        self,
        websocket: WebSocketServerProtocol
    ) -> None:
        """
        Handle a single WebSocket connection.

        This is the main connection handler that processes the WSI Protocol
        message flow for each client.

        Args:
            websocket: WebSocket connection
        """
        client_addr = f"{websocket.remote_address[0]}:{websocket.remote_address[1]}"
        logger.info(f"New connection from {client_addr}")

        # Track connection
        self.active_connections.add(websocket)

        # Initialize state machine
        state_machine = StateMachine(ConnectionState.CONNECTING)

        try:
            # Send ready message
            state_machine.transition_to(ConnectionState.READY, "connection established")
            ready_msg = create_ready_message(
                container_id=self.container_id,
                workspace=self.workspace,
                generator_mode="mock" if self.use_mock else "real"
            )
            await self._send_message(websocket, ready_msg)
            logger.info(f"Sent ready message to {client_addr}")

            # Message loop
            async for raw_message in websocket:
                try:
                    # Parse message
                    message = MessageParser.parse(raw_message)
                    logger.debug(f"Received {message.type} from {client_addr}")

                    # Route message
                    if isinstance(message, StartGenerationMessage):
                        await self._handle_start_generation(
                            websocket,
                            message,
                            state_machine,
                            client_addr
                        )
                    elif isinstance(message, DecisionResponseMessage):
                        await self._handle_decision_response(
                            websocket,
                            message,
                            state_machine,
                            client_addr
                        )
                    else:
                        logger.warning(f"Unhandled message type: {message.type}")
                        error_msg = create_error_message(
                            f"Unhandled message type: {message.type}",
                            error_code="INVALID_MESSAGE_TYPE",
                            fatal=False
                        )
                        await self._send_message(websocket, error_msg)

                except ValueError as e:
                    logger.error(f"Failed to parse message: {e}")
                    error_msg = create_error_message(
                        f"Invalid message format: {e}",
                        error_code="PARSE_ERROR",
                        fatal=False
                    )
                    await self._send_message(websocket, error_msg)

                except Exception as e:
                    logger.error(f"Error handling message: {e}", exc_info=True)
                    error_msg = create_error_message(
                        f"Internal server error: {e}",
                        error_code="INTERNAL_ERROR",
                        fatal=True
                    )
                    await self._send_message(websocket, error_msg)
                    state_machine.transition_to(ConnectionState.ERROR, str(e))
                    break

        except websockets.exceptions.ConnectionClosed:
            logger.info(f"Connection closed by {client_addr}")
        except Exception as e:
            logger.error(f"Connection error with {client_addr}: {e}", exc_info=True)
        finally:
            # Clean up
            state_machine.transition_to(ConnectionState.DISCONNECTED, "connection closed")
            self.active_connections.discard(websocket)
            logger.info(f"Disconnected from {client_addr}")

    async def _handle_start_generation(
        self,
        websocket: WebSocketServerProtocol,
        message: StartGenerationMessage,
        state_machine: StateMachine,
        client_addr: str
    ) -> None:
        """
        Handle start_generation message.

        Creates AppGeneratorAgent and runs generation with appropriate streaming.
        Supports all three modes: autonomous, confirm_first, and interactive.

        Args:
            websocket: WebSocket connection
            message: Parsed start_generation message
            state_machine: Connection state machine
            client_addr: Client address for logging
        """
        # Validate state
        if not state_machine.is_ready_for_work():
            error_msg = create_error_message(
                f"Cannot start generation in state: {state_machine.state.value}",
                error_code="INVALID_STATE",
                fatal=False
            )
            await self._send_message(websocket, error_msg)
            return

        # Transition to active
        state_machine.transition_to(ConnectionState.ACTIVE, "start_generation received")

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

            # Store in connection state
            self.connection_agents[websocket] = {
                "agent": agent,
                "reprompter": None,  # Will be created after first iteration
                "mode": message.mode,
                "max_iterations": message.max_iterations or 10,
                "current_iteration": 0,
                "start_time": datetime.now(),
                "total_duration": 0,
                "app_path": None,
                "initial_prompt": message.prompt,
            }

            start_time = datetime.now()

            # Send startup logs
            await self._send_message(
                websocket,
                create_log_message("App Generator starting up...", "info")
            )
            await self._send_message(
                websocket,
                create_log_message(
                    f"Mode: {message.mode}",
                    "info"
                )
            )
            await self._send_message(
                websocket,
                create_log_message(
                    f"Output directory: {output_dir}",
                    "info"
                )
            )

            # Determine if new app or resume
            if message.app_path:
                # Resume existing app
                await self._send_message(
                    websocket,
                    create_log_message(f"Resuming app at {message.app_path}", "info")
                )

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
                    await self._send_message(websocket, session_msg)

                self.connection_agents[websocket]["app_path"] = app_path

            else:
                # New app generation
                if not message.app_name:
                    error_msg = create_error_message(
                        "app_name is required for new app generation",
                        error_code="MISSING_APP_NAME",
                        fatal=True
                    )
                    await self._send_message(websocket, error_msg)
                    state_machine.transition_to(ConnectionState.ERROR, "missing app_name")
                    return

                await self._send_message(
                    websocket,
                    create_log_message(
                        f"Creating new app: {message.app_name}",
                        "info"
                    )
                )

                # Execute iteration
                app_path, expansion_info = await agent.generate_app(
                    message.prompt,
                    message.app_name
                )

                self.connection_agents[websocket]["app_path"] = app_path

            # Update iteration count
            self.connection_agents[websocket]["current_iteration"] = 1
            duration = int((datetime.now() - start_time).total_seconds() * 1000)
            self.connection_agents[websocket]["total_duration"] = duration

            # Send iteration complete
            iteration_msg = create_iteration_complete_message(
                iteration=1,
                app_path=app_path,
                session_id=agent.current_session_id,
                session_saved=True,
                duration=duration
            )
            await self._send_message(websocket, iteration_msg)

            # Now handle next step based on mode
            if message.mode == "autonomous":
                # Autonomous mode: no prompting, just finish
                await self._finish_generation(websocket, state_machine, "max_iterations")

            elif message.mode in ("interactive", "confirm_first"):
                # Create reprompter now that we have app_path
                reprompter = create_reprompter_fn(app_path=app_path)
                self.connection_agents[websocket]["reprompter"] = reprompter
                self.connection_agents[websocket]["create_reprompter_fn"] = create_reprompter_fn

                # Interactive modes: send decision prompt
                await self._send_decision_prompt(
                    websocket,
                    state_machine,
                    agent,
                    reprompter
                )

        except Exception as e:
            logger.error(f"Generation failed: {e}", exc_info=True)
            error_msg = create_error_message(
                f"Generation failed: {e}",
                error_code="GENERATION_ERROR",
                fatal=True
            )
            await self._send_message(websocket, error_msg)
            state_machine.transition_to(ConnectionState.ERROR, str(e))
            # Clean up connection state
            self.connection_agents.pop(websocket, None)

    async def _send_decision_prompt(
        self,
        websocket: WebSocketServerProtocol,
        state_machine: StateMachine,
        agent: MockAppGeneratorAgent,
        reprompter: Optional[MockReprompterAgent]
    ) -> None:
        """
        Send decision_prompt to user requesting next action.

        Args:
            websocket: WebSocket connection
            state_machine: Connection state machine
            agent: App generator agent
            reprompter: Reprompter agent (can be None for interactive mode)
        """
        conn_state = self.connection_agents.get(websocket)
        if not conn_state:
            logger.error("No connection state found for decision prompt")
            return

        # Transition to prompting state
        state_machine.transition_to(ConnectionState.PROMPTING, "awaiting user decision")

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
            "websocket": websocket,
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

        await self._send_message(websocket, decision_msg)
        logger.info(f"Sent decision prompt: {decision_id}")

    async def _finish_generation(
        self,
        websocket: WebSocketServerProtocol,
        state_machine: StateMachine,
        completion_reason: str
    ) -> None:
        """
        Finish generation and send all_work_complete message.

        Args:
            websocket: WebSocket connection
            state_machine: Connection state machine
            completion_reason: Reason for completion (max_iterations, user_done, error)
        """
        conn_state = self.connection_agents.get(websocket)
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
        await self._send_message(websocket, complete_msg)

        # Transition to completed
        state_machine.transition_to(ConnectionState.COMPLETED, "generation finished")

        # Clean up connection state
        self.connection_agents.pop(websocket, None)

        logger.info(f"Generation complete: {app_path}")

    async def _handle_decision_response(
        self,
        websocket: WebSocketServerProtocol,
        message: DecisionResponseMessage,
        state_machine: StateMachine,
        client_addr: str
    ) -> None:
        """
        Handle decision_response message.

        Processes user decisions and continues generation accordingly.
        Supports: yes, add, redirect, done, and context commands.

        Args:
            websocket: WebSocket connection
            message: Parsed decision_response message
            state_machine: Connection state machine
            client_addr: Client address for logging
        """
        # Validate state
        if state_machine.state != ConnectionState.PROMPTING:
            error_msg = create_error_message(
                f"Cannot handle decision in state: {state_machine.state.value}",
                error_code="INVALID_STATE",
                fatal=False
            )
            await self._send_message(websocket, error_msg)
            return

        # Get connection state
        conn_state = self.connection_agents.get(websocket)
        if not conn_state:
            error_msg = create_error_message(
                "No active generation session",
                error_code="NO_SESSION",
                fatal=True
            )
            await self._send_message(websocket, error_msg)
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
            await self._send_message(websocket, error_msg)
            return

        agent = conn_state["agent"]
        reprompter = conn_state["reprompter"]
        app_path = conn_state["app_path"]

        try:
            # Handle context commands
            if message.choice.startswith("/"):
                await self._handle_context_command(
                    websocket,
                    state_machine,
                    message.choice,
                    agent,
                    app_path
                )
                # After context command, send another decision prompt
                await self._send_decision_prompt(websocket, state_machine, agent, reprompter)
                return

            # Handle user decisions
            if message.choice == "done":
                # User is done
                await self._send_message(
                    websocket,
                    create_log_message("User indicated completion", "info")
                )
                await self._finish_generation(websocket, state_machine, "user_done")

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
                        await self._send_message(websocket, error_msg)
                        # Send another prompt
                        await self._send_decision_prompt(websocket, state_machine, agent, reprompter)
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
                        await self._send_message(websocket, error_msg)
                        # Send another prompt
                        await self._send_decision_prompt(websocket, state_machine, agent, reprompter)
                        return

                # Execute next iteration
                await self._execute_iteration(
                    websocket,
                    state_machine,
                    agent,
                    reprompter,
                    next_prompt
                )

            else:
                # Custom prompt (not a predefined choice)
                next_prompt = message.choice
                await self._execute_iteration(
                    websocket,
                    state_machine,
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
            await self._send_message(websocket, error_msg)
            state_machine.transition_to(ConnectionState.ERROR, str(e))

    async def _handle_context_command(
        self,
        websocket: WebSocketServerProtocol,
        state_machine: StateMachine,
        command: str,
        agent: MockAppGeneratorAgent,
        app_path: str
    ) -> None:
        """
        Handle context commands: /context, /save, /clear.

        Args:
            websocket: WebSocket connection
            state_machine: Connection state machine
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
                mode=self.connection_agents[websocket]["mode"]
            )
            await self._send_message(websocket, context_msg)
            logger.info(f"Displayed context for session: {agent.current_session_id}")

        elif command == "/save":
            # Save session
            agent.save_session(app_path)

            save_msg = SessionSavedMessage(
                session_id=agent.current_session_id,
                app_path=app_path,
                auto=False  # Explicit save
            )
            await self._send_message(websocket, save_msg)
            logger.info(f"Saved session: {agent.current_session_id}")

        elif command == "/clear":
            # Clear session
            old_session_id = agent.current_session_id
            agent.clear_session(app_path)

            clear_msg = SessionClearedMessage(
                app_path=app_path
            )
            await self._send_message(websocket, clear_msg)
            logger.info(f"Cleared session: {old_session_id}")

        else:
            # Unknown command
            error_msg = create_error_message(
                f"Unknown context command: {command}",
                error_code="UNKNOWN_COMMAND",
                fatal=False,
                recovery_hint="Valid commands: /context, /save, /clear"
            )
            await self._send_message(websocket, error_msg)

    async def _execute_iteration(
        self,
        websocket: WebSocketServerProtocol,
        state_machine: StateMachine,
        agent: MockAppGeneratorAgent,
        reprompter: Optional[MockReprompterAgent],
        prompt: str
    ) -> None:
        """
        Execute one iteration of generation.

        Args:
            websocket: WebSocket connection
            state_machine: Connection state machine
            agent: App generator agent
            reprompter: Reprompter agent (optional)
            prompt: Prompt for this iteration
        """
        conn_state = self.connection_agents.get(websocket)
        if not conn_state:
            logger.error("No connection state for iteration")
            return

        # Check max iterations
        if conn_state["current_iteration"] >= conn_state["max_iterations"]:
            await self._send_message(
                websocket,
                create_log_message("Max iterations reached", "info")
            )
            await self._finish_generation(websocket, state_machine, "max_iterations")
            return

        # Transition back to active
        state_machine.transition_to(ConnectionState.ACTIVE, "executing iteration")

        # Log iteration start
        await self._send_message(
            websocket,
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
        await self._send_message(websocket, iteration_msg)

        # Check if we should continue or finish
        if conn_state["current_iteration"] >= conn_state["max_iterations"]:
            # Max iterations reached
            await self._finish_generation(websocket, state_machine, "max_iterations")
        else:
            # Send next decision prompt
            await self._send_decision_prompt(websocket, state_machine, agent, reprompter)

    async def _send_message(
        self,
        websocket: WebSocketServerProtocol,
        message: WSIMessage
    ) -> None:
        """
        Send a message through the WebSocket.

        Args:
            websocket: WebSocket connection
            message: Message to send

        Raises:
            Exception: If send fails
        """
        try:
            json_str = MessageSerializer.serialize(message)
            await websocket.send(json_str)
            logger.debug(f"Sent {message.type} message")
        except Exception as e:
            logger.error(f"Failed to send message: {e}")
            raise


# ============================================================================
# Convenience Functions
# ============================================================================

async def create_server(
    host: str = "0.0.0.0",
    port: int = 8765,
    use_mock: bool = True,
    workspace: str = "/workspace"
) -> WSIServer:
    """
    Create and return a WSI Server instance.

    Args:
        host: Host address to bind to
        port: Port to listen on
        use_mock: Use mock AppGeneratorAgent
        workspace: Workspace directory path

    Returns:
        WSIServer instance
    """
    return WSIServer(host=host, port=port, use_mock=use_mock, workspace=workspace)
