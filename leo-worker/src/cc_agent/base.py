"""Base Agent class for Claude Code multi-agent systems."""

import asyncio
import logging
import os
from dataclasses import dataclass, field
from typing import Optional, Any, Union, AsyncGenerator
from pathlib import Path
from claude_agent_sdk import (
    query, ClaudeAgentOptions, AssistantMessage, ResultMessage,
    SystemMessage, UserMessage, ClaudeSDKClient
)
from .utils import _extract_text, _extract_tool_uses, get_disallowed_tools
from .logging import get_logger
from .retry_handler import retry_async_generator
from .conversation_logger import ConversationLogger, ConversationCallback
from .cost_tracker import CostTracker

# Global callback for conversation logging - allows WSI or other orchestrators
# to receive real-time conversation events from all agents
_global_conversation_callback: Optional[ConversationCallback] = None


def set_global_conversation_callback(callback: Optional[ConversationCallback]) -> None:
    """
    Set a global callback for conversation logging.

    This allows orchestrators (like WSI) to receive real-time conversation
    events from all agents without modifying agent creation code.

    Args:
        callback: Function that receives log entry dicts, or None to clear
    """
    global _global_conversation_callback
    _global_conversation_callback = callback


def get_global_conversation_callback() -> Optional[ConversationCallback]:
    """Get the currently registered global conversation callback."""
    return _global_conversation_callback


@dataclass
class AgentResult:
    """Structured result from an agent execution."""
    content: str
    cost: float
    success: bool
    metadata: dict[str, Any] = field(default_factory=dict)
    tool_uses: list[dict] = field(default_factory=list)
    # New fields for enhanced observability
    termination_reason: str = "unknown"  # "completed", "max_turns_reached", "error"
    turns_used: int = 0
    max_turns: int = 0
    error_details: Optional[dict[str, Any]] = None


class Agent:
    """Base class for Claude Code agents with common execution pattern."""
    
    def __init__(
        self,
        name: str,
        system_prompt: str,
        allowed_tools: Optional[list[str]] = None,
        max_turns: int = 5,
        permission_mode: str = "bypassPermissions",
        max_thinking_tokens: Optional[int] = None,
        cwd: Optional[Union[str, Path]] = None,
        verbose: bool = True,
        preview_length: int = 0,
        file_preview_length: int = 0,
        logger: Optional[logging.Logger] = None,
        restrict_to_allowed_tools: bool = False,
        model: Optional[str] = None,
        mcp_tools: Optional[list[str]] = None,
        mcp_servers: Optional[dict[str, Any]] = None,
        agents: Optional[dict[str, dict[str, Any]]] = None,
        setting_sources: Optional[list[str]] = None
    ):
        """Initialize an agent with configuration.

        Args:
            name: Display name for the agent
            system_prompt: System prompt defining agent behavior
            allowed_tools: List of allowed tool names
            max_turns: Maximum conversation turns
            permission_mode: Permission mode for tool execution
            max_thinking_tokens: Maximum thinking tokens (optional)
            cwd: Working directory for tool execution
            verbose: Whether to print progress messages
            preview_length: Maximum characters to show in console (default: 0 = no truncation)
            file_preview_length: Maximum characters to log to file (0 = no truncation)
            logger: Optional logger instance (creates one if not provided)
            restrict_to_allowed_tools: If True, automatically populate disallowed_tools
                                     to restrict agent to ONLY allowed_tools
            model: Model to use (e.g., 'claude-sonnet-4-20250514' or 'opus')
            mcp_tools: List of MCP tool names to auto-configure (e.g., ['oxc', 'tree_sitter'])
            mcp_servers: MCP server configurations to enable for this agent (takes precedence over mcp_tools)
            agents: Subagent configurations for automatic task delegation
                   Format: {'agent-name': {'description': str, 'prompt': str, 'tools': list, 'model': str}}
            setting_sources: Sources to load settings from (e.g., ['user', 'project'])
                           Required for Skills to work - loads from ~/.claude/skills/ and .claude/skills/
        """
        self.name = name
        self.system_prompt = system_prompt
        self.max_turns = max_turns
        self.permission_mode = permission_mode
        self.max_thinking_tokens = max_thinking_tokens
        self.cwd = cwd
        self.verbose = verbose
        self.preview_length = preview_length
        self.file_preview_length = file_preview_length
        self.restrict_to_allowed_tools = restrict_to_allowed_tools
        self.model = model
        self.agents = agents
        self.setting_sources = setting_sources

        # Set up logger FIRST - needed for MCP configuration
        if logger is None:
            self.logger = get_logger(f"cc_agent.{name.replace(' ', '_')}")
        else:
            self.logger = logger

        # Initialize conversation logger if environment variable is set
        self.conversation_logger: Optional[ConversationLogger] = None
        if os.environ.get("ENABLE_CONVERSATION_LOGGING") == "true":
            log_dir = Path(os.environ.get("AGENT_LOG_DIR", "logs"))
            self.conversation_logger = ConversationLogger(
                agent_name=name,
                log_dir=log_dir / "conversations",
                enable_jsonl=True,
                enable_text=True,
                on_log=get_global_conversation_callback()  # Use global callback if set
            )
        
        # Handle MCP configuration - build from registry if mcp_tools provided
        if mcp_tools and mcp_servers:
            raise ValueError("Cannot specify both mcp_tools and mcp_servers. Use mcp_tools for simplified configuration or mcp_servers for full control.")
        
        if mcp_tools:
            # Build MCP configuration from registry
            try:
                from cc_tools.mcp_registry import get_mcp_config_with_env
                self.mcp_servers = get_mcp_config_with_env(mcp_tools)
                if self.verbose:
                    self.logger.debug(f"Built MCP config from registry for tools: {mcp_tools}")
            except ImportError:
                self.logger.error("MCP registry not found. Cannot use mcp_tools parameter.")
                self.mcp_servers = {}
            except KeyError as e:
                self.logger.error(f"MCP registry error: {e}")
                self.mcp_servers = {}
        else:
            # Use provided mcp_servers or empty dict
            self.mcp_servers = mcp_servers or {}
        
        # Initialize allowed_tools and auto-add MCP tools
        if allowed_tools is None:
            allowed_tools = []
        
        # Automatically add MCP tools for configured servers
        if self.mcp_servers:
            for server_name in self.mcp_servers.keys():
                mcp_tool = f"mcp__{server_name}"
                if mcp_tool not in allowed_tools:
                    allowed_tools.append(mcp_tool)
        
        self.allowed_tools = allowed_tools

        # Session management
        self.session_id: Optional[str] = None
        self.client: Optional[ClaudeSDKClient] = None
        self.session_active: bool = False

        # Streaming input support for mid-generation user messages
        self._input_queue: asyncio.Queue[dict] = asyncio.Queue()
        self._generation_active: bool = False

    async def run(self, user_prompt: str, mcp_servers: Optional[dict[str, Any]] = None, **kwargs) -> AgentResult:
        """Execute the agent with the given prompt.
        
        Args:
            user_prompt: The prompt to send to the agent
            mcp_servers: Optional MCP server configurations
            **kwargs: Additional options to pass to ClaudeAgentOptions
            
        Returns:
            AgentResult with content, cost, and metadata
            
        Note:
            If a working directory (cwd) is specified, this method ensures it exists
            before passing it to the SDK. This prevents misleading "Claude Code not found"
            errors that actually occur when the cwd doesn't exist.
        """
        if self.verbose:
            self.logger.info(f"🤖 {self.name}: Starting...")
            
        # Build options with defaults and overrides
        options_dict = {
            "system_prompt": self.system_prompt,
            "allowed_tools": self.allowed_tools,
            "max_turns": self.max_turns,
            "permission_mode": self.permission_mode,
        }

        # If restrict_to_allowed_tools is True, generate disallowed_tools list
        if self.restrict_to_allowed_tools and self.allowed_tools:
            options_dict["disallowed_tools"] = get_disallowed_tools(self.allowed_tools)

        if self.max_thinking_tokens is not None:
            options_dict["max_thinking_tokens"] = self.max_thinking_tokens

        if self.cwd is not None:
            # Ensure the working directory exists to avoid misleading "Claude Code not found" errors
            cwd_path = Path(self.cwd)
            if not cwd_path.exists():
                self.logger.info(f"Creating working directory: {cwd_path}")
                cwd_path.mkdir(parents=True, exist_ok=True)
            options_dict["cwd"] = str(self.cwd)

        if self.model is not None:
            options_dict["model"] = self.model

        # Note: Subagents can be configured programmatically via 'agents' parameter (SDK v0.1.4+)
        # or via filesystem (.claude/agents/) for backward compatibility
        if self.agents is not None:
            options_dict["agents"] = self.agents
            if self.verbose:
                self.logger.info(f"🤖 Subagents configured programmatically: {list(self.agents.keys())}")

        # Add setting_sources if specified (required for Skills to work)
        if self.setting_sources is not None:
            options_dict["setting_sources"] = self.setting_sources
            if self.verbose:
                self.logger.info(f"📚 Setting sources configured: {self.setting_sources}")

        # Use passed mcp_servers or fall back to stored ones
        mcp_servers = mcp_servers or self.mcp_servers

        # Add MCP servers if available
        if mcp_servers:
            options_dict["mcp_servers"] = mcp_servers
            self.logger.info(f"🔌 MCP servers passed to SDK for '{self.name}': {list(mcp_servers.keys())}")
            if self.verbose:
                self.logger.debug(f"MCP server details: {mcp_servers}")
        else:
            self.logger.info(f"⚠️  No MCP servers passed to SDK for '{self.name}'")
            
        # Apply any additional options
        options_dict.update(kwargs)

        options = ClaudeAgentOptions(**options_dict)
        
        # Initialize result with enhanced fields
        result = AgentResult(
            content="",
            cost=0.0,
            success=False,
            metadata={"agent_name": self.name},
            termination_reason="unknown",
            turns_used=0,
            max_turns=self.max_turns,
            error_details=None
        )
        
        all_content = []
        current_turn = 0

        # Log user prompt to conversation logger
        if self.conversation_logger:
            self.conversation_logger.log_user_prompt(user_prompt)

        try:
            # Use retry logic for API calls with exponential backoff
            async for message in retry_async_generator(
                query,
                prompt=user_prompt,
                options=options,
                logger=self.logger  # Pass our configured logger for proper output
            ):
                if isinstance(message, AssistantMessage):
                    # Track turn number
                    current_turn += 1
                    result.turns_used = current_turn

                    # Log full message to conversation logger
                    if self.conversation_logger:
                        self.conversation_logger.log_assistant_message(
                            message, current_turn, self.max_turns
                        )

                    # Log turn information (INFO for first turn, DEBUG for others)
                    if current_turn == 1:
                        self.logger.info(f"🔄 [{self.name}] Turn {current_turn}/{self.max_turns} - Starting agent execution")
                    else:
                        self.logger.debug(f"🔄 [{self.name}] Turn {current_turn}/{self.max_turns} - Continuing execution")
                    # Extract text content
                    text = _extract_text(message)
                    if text:
                        all_content.append(text)
                        if self.verbose:
                            # Simple logging approach - let the normal logging system handle it
                            msg_prefix = f"{self.name}: "
                            if len(text) > self.preview_length and self.preview_length > 0:
                                # Log truncated version
                                truncated_text = text[:self.preview_length] + "..."
                                self.logger.info(f"{msg_prefix}{truncated_text}")
                                # If file needs different truncation, log at debug level
                                if self.file_preview_length != self.preview_length:
                                    if self.file_preview_length > 0 and len(text) > self.file_preview_length:
                                        file_truncated = text[:self.file_preview_length] + "..."
                                        self.logger.debug(f"{msg_prefix}(extended): {file_truncated}")
                                    else:
                                        self.logger.debug(f"{msg_prefix}(full): {text}")
                            else:
                                # Text is short enough, just log it
                                self.logger.info(f"{msg_prefix}{text}")
                    
                    # Extract and log tool uses
                    tool_uses = _extract_tool_uses(message)
                    if tool_uses:
                        result.tool_uses.extend(tool_uses)
                        # Log tool usage at appropriate level
                        for tool in tool_uses:
                            tool_msg = f"🔧 [{self.name}] Turn {current_turn}/{self.max_turns} - Using tool: {tool['name']}"
                            if current_turn == 1:
                                self.logger.info(tool_msg)
                            else:
                                self.logger.debug(tool_msg)
                        
                elif isinstance(message, ResultMessage):
                    # Capture final cost and status
                    result.cost = message.total_cost_usd or 0.0

                    # Register cost with global tracker
                    await CostTracker.get_instance().add_cost(result.cost, self.name)

                    # Determine termination reason
                    if current_turn >= self.max_turns:
                        result.termination_reason = "max_turns_reached"
                        result.success = False  # Mark as unsuccessful if max turns reached
                        if self.verbose:
                            self.logger.warning(f"⚠️  {self.name} hit max turns limit ({current_turn}/{self.max_turns}). Cost: ${result.cost:.4f}")
                    else:
                        result.termination_reason = "completed"
                        result.success = True
                        if self.verbose:
                            self.logger.info(f"✅ {self.name} complete. Turns: {current_turn}/{self.max_turns}, Cost: ${result.cost:.4f}")

                    # Log result to conversation logger
                    if self.conversation_logger:
                        self.conversation_logger.log_result(
                            message, result.success, result.termination_reason
                        )
                        
        except Exception as e:
            result.success = False
            result.termination_reason = "error"
            result.metadata["error"] = str(e)

            # Capture detailed error context
            result.error_details = {
                "error_type": type(e).__name__,
                "error_message": str(e),
                "turn_when_failed": current_turn,
                "tools_attempted": len(result.tool_uses),
                "partial_content_length": len("\n\n".join(all_content))
            }

            # Log error to conversation logger
            if self.conversation_logger:
                self.conversation_logger.log_error(
                    e, current_turn, "\n\n".join(all_content)
                )

            if self.verbose:
                self.logger.error(f"❌ {self.name} failed at turn {current_turn}/{self.max_turns}: {e}")
            raise
        finally:
            # Finalize conversation logger
            if self.conversation_logger:
                self.conversation_logger.finalize()

        # Combine all content
        result.content = "\n\n".join(all_content)
        return result

    async def run_with_session(self, user_prompt: str, session_id: Optional[str] = None, **kwargs) -> AgentResult:
        """Execute the agent with session support for context preservation.

        Args:
            user_prompt: The prompt to send to the agent
            session_id: Optional session ID to resume (uses existing or creates new)
            **kwargs: Additional options

        Returns:
            AgentResult with content, cost, and metadata including session_id
        """
        if self.verbose:
            self.logger.info(f"🤖 {self.name}: Starting with session support...")

        # Initialize or reuse client
        # IMPORTANT: Also reinitialize if cwd has changed, because Claude CLI
        # looks for sessions based on working directory. Sessions are stored in
        # ~/.claude/projects/<encoded-cwd>/<session-id>.jsonl
        # If cwd changes but client is reused, session resume will fail with
        # "No conversation found" error (exit code 143/SIGTERM).
        current_cwd = str(self.cwd) if self.cwd else None
        cwd_changed = (
            self.client is not None and
            hasattr(self, '_last_session_cwd') and
            self._last_session_cwd != current_cwd
        )

        # Check if the client's underlying subprocess is still alive
        # Prevents "Cannot write to terminated process" errors
        process_dead = self.client is not None and not self._is_client_alive()

        if not self.client or (session_id and session_id != self.session_id) or cwd_changed or process_dead:
            if cwd_changed:
                self.logger.info(f"📂 CWD changed ({self._last_session_cwd} → {current_cwd}), reinitializing client...")
            if process_dead:
                self.logger.warning(f"⚠️ Client process is dead, reinitializing...")
            await self._initialize_session_client(session_id)

        # Track the cwd used for this session
        self._last_session_cwd = current_cwd

        # Build result object
        result = AgentResult(
            content="",
            cost=0.0,
            success=False,
            metadata={
                "agent_name": self.name,
                "session_id": self.session_id
            },
            termination_reason="unknown",
            turns_used=0,
            max_turns=self.max_turns,
            error_details=None
        )

        all_content = []
        current_turn = 0

        # Log user prompt to conversation logger
        if self.conversation_logger:
            self.conversation_logger.log_user_prompt(
                user_prompt,
                metadata={"session_id": self.session_id}
            )

        # Enable injection of user messages during session execution
        self._generation_active = True

        # Background task to forward queued user messages to the client
        async def _forward_queued_messages():
            """Monitor input queue and forward messages to the active client."""
            while self._generation_active and self.client:
                try:
                    # Check for queued messages with short timeout
                    msg = await asyncio.wait_for(
                        self._input_queue.get(),
                        timeout=0.5
                    )
                    # Extract content from the queued message
                    content = msg.get("message", {}).get("content", "")
                    if content and self.client:
                        self.logger.info(f"📤 Forwarding injected message to agent: {content[:50]}...")
                        # Send the message to the ongoing conversation
                        await self.client.query(content)
                except asyncio.TimeoutError:
                    # No message available, continue monitoring
                    continue
                except asyncio.CancelledError:
                    break
                except Exception as e:
                    self.logger.error(f"Error forwarding queued message: {e}")

        # Start the message forwarding task
        forward_task = asyncio.create_task(_forward_queued_messages())

        try:
            # Send prompt to existing session
            await self.client.query(user_prompt)

            # Receive and process messages
            async for message in self.client.receive_messages():
                # Check for SystemMessage with init subtype to capture real session ID
                if isinstance(message, SystemMessage):
                    # Try to extract session_id from init message data
                    if hasattr(message, 'subtype') and message.subtype == 'init':
                        # Session ID is in message.data dict
                        if hasattr(message, 'data') and isinstance(message.data, dict):
                            session_id_from_init = message.data.get('session_id')
                            if session_id_from_init:
                                # Update with the REAL session ID from Claude!
                                self.session_id = session_id_from_init
                                self.logger.info(f"📂 Captured real session ID from init: {self.session_id[:8]}...")
                                result.metadata["session_id"] = self.session_id

                elif isinstance(message, AssistantMessage):
                    current_turn += 1
                    result.turns_used = current_turn

                    # Log full message to conversation logger
                    if self.conversation_logger:
                        self.conversation_logger.log_assistant_message(
                            message, current_turn, self.max_turns
                        )

                    # Extract text content
                    text = _extract_text(message)
                    if text:
                        all_content.append(text)
                        if self.verbose:
                            self._log_content(text)

                    # Extract tool uses
                    tool_uses = _extract_tool_uses(message)
                    if tool_uses:
                        result.tool_uses.extend(tool_uses)

                elif isinstance(message, ResultMessage):
                    # Capture final cost and status
                    result.cost = message.total_cost_usd or 0.0
                    result.success = True
                    result.termination_reason = "completed"

                    # Register cost with global tracker
                    await CostTracker.get_instance().add_cost(result.cost, self.name)

                    # Log result to conversation logger
                    if self.conversation_logger:
                        self.conversation_logger.log_result(
                            message, result.success, result.termination_reason
                        )

                    if self.verbose:
                        self.logger.info(f"✅ {self.name} complete (session). Cost: ${result.cost:.4f}")
                    break

        except Exception as e:
            result.success = False
            result.termination_reason = "error"
            result.metadata["error"] = str(e)
            result.error_details = {
                "error_type": type(e).__name__,
                "error_message": str(e),
                "turn_when_failed": current_turn,
                "session_id": self.session_id
            }

            # Log error to conversation logger
            if self.conversation_logger:
                self.conversation_logger.log_error(
                    e, current_turn, "\n\n".join(all_content)
                )

            if self.verbose:
                self.logger.error(f"❌ {self.name} session error: {e}")
            raise
        finally:
            # Stop accepting injected messages
            self._generation_active = False
            # Cancel the message forwarding task
            forward_task.cancel()
            try:
                await forward_task
            except asyncio.CancelledError:
                pass
            # Finalize conversation logger
            if self.conversation_logger:
                self.conversation_logger.finalize()

        # Combine all content
        result.content = "\n\n".join(all_content)
        result.metadata["session_id"] = self.session_id
        return result

    async def _initialize_session_client(self, session_id: Optional[str] = None):
        """Initialize or reinitialize the ClaudeSDKClient with optional session resumption."""
        # Clean up existing client if present
        if self.client:
            try:
                await self.client.disconnect()
            except:
                pass  # Ignore disconnect errors

        # Build options
        options_dict = self._build_options_dict()

        # Add session resumption if provided
        if session_id:
            options_dict["resume"] = session_id
            self.logger.info(f"📂 Resuming session: {session_id[:8]}...")
        else:
            self.logger.info("📂 Starting new session...")

        options = ClaudeAgentOptions(**options_dict)

        # Create and connect client
        self.client = ClaudeSDKClient(options=options)
        await self.client.connect()

        # Try to get session ID from the client itself after connecting
        if hasattr(self.client, 'session_id') and self.client.session_id:
            # Client already has a session ID
            self.session_id = self.client.session_id
            self.logger.info(f"✅ Session initialized: {self.session_id[:8]}...")
        elif session_id:
            # We're resuming with provided session ID
            self.session_id = session_id
            self.logger.info(f"✅ Session initialized: {self.session_id[:8]}...")
        else:
            # New session - will get real ID from init message during first query
            self.session_id = f"session-{id(self.client)}"
            self.logger.info(f"✅ Session initialized: {self.session_id[:8]}...")

        self.session_active = True

    def _build_options_dict(self) -> dict:
        """Build the options dictionary for ClaudeAgentOptions."""
        options_dict = {
            "system_prompt": self.system_prompt,
            "allowed_tools": self.allowed_tools,
            "max_turns": self.max_turns,
            "permission_mode": self.permission_mode,
        }

        if self.restrict_to_allowed_tools and self.allowed_tools:
            options_dict["disallowed_tools"] = get_disallowed_tools(self.allowed_tools)

        if self.max_thinking_tokens is not None:
            options_dict["max_thinking_tokens"] = self.max_thinking_tokens

        if self.cwd is not None:
            cwd_path = Path(self.cwd)
            if not cwd_path.exists():
                self.logger.info(f"Creating working directory: {cwd_path}")
                cwd_path.mkdir(parents=True, exist_ok=True)
            options_dict["cwd"] = str(self.cwd)

        if self.model is not None:
            options_dict["model"] = self.model

        if self.mcp_servers:
            options_dict["mcp_servers"] = self.mcp_servers

        # Add agents configuration for SDK v0.1.4+ subagent support
        if self.agents:
            options_dict["agents"] = self.agents

        return options_dict

    def _log_content(self, text: str):
        """Helper to log content with truncation if needed."""
        msg_prefix = f"{self.name}: "
        if len(text) > self.preview_length and self.preview_length > 0:
            truncated_text = text[:self.preview_length] + "..."
            self.logger.info(f"{msg_prefix}{truncated_text}")
        else:
            self.logger.info(f"{msg_prefix}{text}")

    async def disconnect_session(self):
        """Disconnect the current session cleanly."""
        if self.client and self.session_active:
            try:
                await self.client.disconnect()
                self.logger.info(f"👋 Session {self.session_id[:8] if self.session_id else 'unknown'} disconnected")
            except Exception as e:
                self.logger.error(f"Error disconnecting session: {e}")
            finally:
                self.client = None
                self.session_active = False

    def _is_client_alive(self) -> bool:
        """Check if the underlying client subprocess is still running.

        The ClaudeSDKClient uses a subprocess transport. This method checks
        if that subprocess is still alive to avoid "Cannot write to terminated
        process" errors.

        Returns:
            True if client exists and process is alive, False otherwise
        """
        if not self.client:
            return False

        # Access the transport layer to check process status
        try:
            # ClaudeSDKClient uses _transport which has a process attribute
            transport = getattr(self.client, '_transport', None)
            if transport:
                process = getattr(transport, 'process', None)
                if process:
                    # poll() returns None if running, exit code if terminated
                    return process.poll() is None
        except Exception:
            pass

        # If we can't determine, assume alive (let the actual call fail with clear error)
        return True

    def get_session_id(self) -> Optional[str]:
        """Get the current session ID if a session is active."""
        return self.session_id if self.session_active else None

    async def inject_user_message(self, content: str) -> bool:
        """
        Inject a user message into an active streaming generation.

        This allows sending additional guidance to the agent while it's working,
        similar to typing in the Claude Code CLI while the agent is running.

        Args:
            content: The user message to inject

        Returns:
            True if message was queued successfully, False if no generation is active
        """
        if not self._generation_active:
            self.logger.warning("Cannot inject message: no active generation")
            return False

        await self._input_queue.put({
            "type": "user",
            "message": {"role": "user", "content": content}
        })
        self.logger.info(f"📝 Injected user message: {content[:50]}...")
        return True

    def is_generation_active(self) -> bool:
        """Check if a streaming generation is currently active."""
        return self._generation_active

    async def run_with_streaming_input(
        self,
        initial_prompt: str,
        session_id: Optional[str] = None,
        **kwargs
    ) -> AgentResult:
        """
        Execute the agent with streaming input support.

        This method allows injecting additional user messages during execution
        via the inject_user_message() method. Messages are queued and processed
        sequentially by the agent.

        Args:
            initial_prompt: The initial prompt to start generation
            session_id: Optional session ID to resume
            **kwargs: Additional options for ClaudeAgentOptions

        Returns:
            AgentResult with content, cost, and metadata
        """
        if self.verbose:
            self.logger.info(f"🤖 {self.name}: Starting with streaming input support...")

        # Clear the input queue
        while not self._input_queue.empty():
            try:
                self._input_queue.get_nowait()
            except asyncio.QueueEmpty:
                break

        self._generation_active = True

        # Build options
        options_dict = self._build_options_dict()
        if session_id:
            options_dict["resume"] = session_id
            self.logger.info(f"📂 Resuming session: {session_id[:8]}...")
        options_dict.update(kwargs)
        options = ClaudeAgentOptions(**options_dict)

        # Build result
        result = AgentResult(
            content="",
            cost=0.0,
            success=False,
            metadata={
                "agent_name": self.name,
                "streaming_input": True
            },
            termination_reason="unknown",
            turns_used=0,
            max_turns=self.max_turns,
            error_details=None
        )

        all_content = []
        current_turn = 0

        # Create async generator for streaming input
        async def message_generator():
            """Async generator that yields messages including injected user input."""
            # Yield initial prompt
            yield {
                "type": "user",
                "message": {"role": "user", "content": initial_prompt}
            }

            # Continue yielding any injected messages while generation is active
            while self._generation_active:
                try:
                    # Check for injected messages with a short timeout
                    msg = await asyncio.wait_for(
                        self._input_queue.get(),
                        timeout=0.1
                    )
                    self.logger.info(f"📤 Yielding injected message to agent")
                    yield msg
                except asyncio.TimeoutError:
                    # No message available, continue waiting
                    continue
                except asyncio.CancelledError:
                    break

        # Log user prompt to conversation logger
        if self.conversation_logger:
            self.conversation_logger.log_user_prompt(
                initial_prompt,
                metadata={"streaming_input": True}
            )

        try:
            # Use ClaudeSDKClient with async generator for streaming input
            async with ClaudeSDKClient(options=options) as client:
                # Send the streaming input generator
                await client.query(message_generator())

                # Receive and process responses
                async for message in client.receive_messages():
                    if isinstance(message, SystemMessage):
                        # Capture session ID from init message
                        if hasattr(message, 'subtype') and message.subtype == 'init':
                            if hasattr(message, 'data') and isinstance(message.data, dict):
                                session_id_from_init = message.data.get('session_id')
                                if session_id_from_init:
                                    self.session_id = session_id_from_init
                                    result.metadata["session_id"] = self.session_id
                                    self.logger.info(f"📂 Session ID: {self.session_id[:8]}...")

                    elif isinstance(message, AssistantMessage):
                        current_turn += 1
                        result.turns_used = current_turn

                        # Log to conversation logger
                        if self.conversation_logger:
                            self.conversation_logger.log_assistant_message(
                                message, current_turn, self.max_turns
                            )

                        # Extract text content
                        text = _extract_text(message)
                        if text:
                            all_content.append(text)
                            if self.verbose:
                                self._log_content(text)

                        # Extract tool uses
                        tool_uses = _extract_tool_uses(message)
                        if tool_uses:
                            result.tool_uses.extend(tool_uses)

                    elif isinstance(message, ResultMessage):
                        # Capture final cost and status
                        result.cost = message.total_cost_usd or 0.0
                        result.success = True
                        result.termination_reason = "completed"

                        # Register cost with global tracker
                        await CostTracker.get_instance().add_cost(result.cost, self.name)

                        # Log result
                        if self.conversation_logger:
                            self.conversation_logger.log_result(
                                message, result.success, result.termination_reason
                            )

                        if self.verbose:
                            self.logger.info(
                                f"✅ {self.name} complete (streaming). "
                                f"Turns: {current_turn}/{self.max_turns}, Cost: ${result.cost:.4f}"
                            )
                        break

        except Exception as e:
            result.success = False
            result.termination_reason = "error"
            result.metadata["error"] = str(e)
            result.error_details = {
                "error_type": type(e).__name__,
                "error_message": str(e),
                "turn_when_failed": current_turn,
            }

            if self.conversation_logger:
                self.conversation_logger.log_error(
                    e, current_turn, "\n\n".join(all_content)
                )

            if self.verbose:
                self.logger.error(f"❌ {self.name} streaming error: {e}")
            raise
        finally:
            self._generation_active = False
            if self.conversation_logger:
                self.conversation_logger.finalize()

        result.content = "\n\n".join(all_content)
        return result

    def with_options(self, **kwargs) -> "Agent":
        """Create a new agent with modified options.
        
        Useful for creating variations of an agent with different settings.
        """
        # Copy current settings
        new_kwargs = {
            "name": self.name,
            "system_prompt": self.system_prompt,
            "allowed_tools": self.allowed_tools.copy() if self.allowed_tools else [],
            "max_turns": self.max_turns,
            "permission_mode": self.permission_mode,
            "max_thinking_tokens": self.max_thinking_tokens,
            "cwd": self.cwd,
            "verbose": self.verbose,
            "preview_length": self.preview_length,
            "file_preview_length": self.file_preview_length,
            "logger": self.logger,
            "model": self.model,
        }
        # Apply overrides
        new_kwargs.update(kwargs)
        return Agent(**new_kwargs)
    
    def list_available_tools(self) -> list[str]:
        """List all tools available to this agent.
        
        Returns:
            List of tool names that this agent can use
        """
        return self.allowed_tools.copy() if self.allowed_tools else []
    
    def list_mcp_servers(self) -> list[str]:
        """List configured MCP servers for this agent.
        
        Returns:
            List of MCP server names configured for this agent
        """
        return list(self.mcp_servers.keys()) if self.mcp_servers else []
    
    @classmethod
    def list_all_mcp_tools(cls) -> dict[str, str]:
        """List all available MCP tools with descriptions.
        
        Returns:
            Dictionary mapping tool names to descriptions
            
        Example:
            >>> tools = Agent.list_all_mcp_tools()
            >>> print(f"Available: {', '.join(tools.keys())}")
        """
        try:
            from cc_tools.mcp_registry import list_available_tools
            return list_available_tools()
        except ImportError:
            return {}
    
    @classmethod
    def list_tools_by_tag(cls, tag: str) -> list[str]:
        """Get MCP tools that have a specific tag.
        
        Args:
            tag: Tag to search for (e.g., "linting", "typescript", "memory")
            
        Returns:
            List of tool names with the specified tag
            
        Example:
            >>> linting_tools = Agent.list_tools_by_tag("linting")
            >>> # Returns: ['oxc', 'ruff']
        """
        try:
            from cc_tools.mcp_registry import list_tools_by_tag
            return list_tools_by_tag(tag)
        except ImportError:
            return []
    
    @classmethod
    def validate_mcp_environment(cls, tool_names: list[str]) -> dict[str, list[str]]:
        """Check which environment variables are missing for the specified tools.
        
        Args:
            tool_names: List of tool names to validate
            
        Returns:
            Dictionary mapping tool names to lists of missing required env vars
            
        Example:
            >>> missing = Agent.validate_mcp_environment(["graphiti", "mem0"])
            >>> if any(missing.values()):
            ...     print("Some tools are missing environment variables!")
        """
        try:
            from cc_tools.mcp_registry import validate_tool_environment
            return validate_tool_environment(tool_names)
        except ImportError:
            return {name: [] for name in tool_names}