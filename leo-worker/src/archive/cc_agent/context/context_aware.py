"""
ContextAwareAgent - Base class for agents with automatic context awareness.

This agent automatically maintains context across sessions, preventing duplicate work
and enabling seamless handoffs without requiring manual intervention.
"""

import os
import json
import asyncio
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from pathlib import Path

from ..base import Agent, AgentResult
from ..logging import setup_logging

# Set up logging
logger = setup_logging("context_aware_agent")

# Context awareness prompt addition
CONTEXT_AWARENESS_PROMPT = """

AUTOMATIC CONTEXT AWARENESS PROTOCOL:
You have access to advanced context management tools that help maintain awareness across sessions.

CONTEXT MANAGER INTEGRATION:
The Context Manager orchestrates tool usage based on your queries:
1. Use analyze_query to get tool recommendations for complex tasks
2. Use start_session at the beginning to track your work
3. Use record_tool_use after each tool to build usage patterns
4. Use get_session_context to understand what's been done
5. Use coordinate_tools for multi-tool workflows
6. Use summarize_session before completing tasks

BEFORE STARTING ANY TASK:
1. The system will automatically load previous session context
2. Use search_knowledge_graph to find existing implementations
3. Review the knowledge graph to understand relationships
4. Use analyze_query to determine optimal tool selection

DURING TASK EXECUTION:
1. Use add_knowledge_episode for storing implementation details
2. Use context like 'file:path/to/file.py' for code-related knowledge
3. Use context like 'decision:architecture' for architectural choices
4. Knowledge graph automatically creates relationships between connected concepts

CRITICAL - KNOWLEDGE STORAGE GUIDELINES:
When storing knowledge with add_knowledge_episode, ALWAYS transform content into meaningful descriptions:

✅ GOOD KNOWLEDGE (will be stored):
- "Authentication service validates JWT tokens using RSA-256 algorithm with 24-hour expiration"
- "Database connection pool configured with 10 min/50 max connections for PostgreSQL"
- "API gateway implements rate limiting using Redis-backed token bucket algorithm"

❌ BAD KNOWLEDGE (will be rejected):
- Raw code: "def auth(): return jwt.verify(token)"
- Simple text: "Added authentication"
- Generic descriptions: "Database configuration"

KNOWLEDGE TRANSFORMATION RULES:
1. Code → Architecture Description
   - Instead of: "def calculate_hash(data): return sha256(data)"
   - Store as: "Hashing service implements SHA-256 algorithm for data integrity verification"

2. Configuration → Design Decision
   - Instead of: "MAX_RETRIES = 3"
   - Store as: "Retry mechanism configured with 3 attempts using exponential backoff strategy"

3. Implementation → Pattern & Rationale
   - Instead of: "class UserRepository extends BaseRepository"
   - Store as: "User data access implements Repository pattern for separation of concerns"

CONTEXT PATTERNS FOR KNOWLEDGE:
- architecture:* - High-level design decisions and patterns
- implementation:* - Specific implementation details with rationale
- decision:* - Technical choices and trade-offs
- pattern:* - Design patterns and best practices
- integration:* - How components connect and communicate
- optimization:* - Performance improvements and rationale

AFTER COMPLETING TASKS:
1. Session context is automatically captured
2. Handoff notes are generated for future sessions
3. Use summarize_session to create comprehensive handoff

AVAILABLE CONTEXT TOOLS:
- Context Manager: analyze_query, start_session, record_tool_use, get_session_context, coordinate_tools, summarize_session
- Knowledge Graph (graphiti): add_knowledge_episode, search_knowledge_graph, get_graph_insights
- Code Analysis: tree-sitter tools for parsing and analyzing code structure
- Integration Analysis: compare_with_template, analyze_code_changes, track_api_changes, analyze_project_deep

The system automatically prevents duplicate work and maintains continuity.
Remember: Always describe the WHY and WHAT, not just the HOW.
"""

class ContextAwareAgent(Agent):
    """
    Base agent class with automatic context awareness capabilities.
    
    Extends the base Agent class to automatically:
    - Load context from previous sessions
    - Track all modifications and decisions
    - Prevent duplicate implementations
    - Create comprehensive handoffs
    """
    
    def __init__(
        self,
        name: str,
        system_prompt: str,
        allowed_tools: Optional[List[str]] = None,
        permission_mode: str = "bypassPermissions",
        cwd: Optional[str] = None,
        verbose: bool = True,
        enable_context_awareness: bool = True
    ):
        """
        Initialize a context-aware agent.
        
        Args:
            name: Name of the agent
            system_prompt: Base system prompt
            allowed_tools: List of allowed tools
            permission_mode: Permission mode for tools
            cwd: Working directory
            verbose: Enable verbose logging
            enable_context_awareness: Whether to enable context features
        """
        # Add context awareness to system prompt
        enhanced_prompt = system_prompt
        if enable_context_awareness:
            enhanced_prompt += CONTEXT_AWARENESS_PROMPT
        
        # Initialize allowed tools list if not provided
        if allowed_tools is None:
            allowed_tools = []
        
        # Always include context management tools with MCP naming pattern
        # Format: mcp__<serverName>__<toolName> or just mcp__<serverName> for all tools
        context_tools = [
            "mcp__tree_sitter",  # All tree_sitter tools
            "mcp__context_manager",  # All context_manager tools
            "mcp__integration_analyzer",  # All integration_analyzer tools
            "mcp__graphiti",  # All graphiti tools (handles memory storage via knowledge graph)
            "mcp__oxc",  # Ultra-fast JS/TS linting (50-100x faster than ESLint)
            "mcp__ruff",  # Ultra-fast Python linting (10-150x faster than Pylint/Flake8)
            "mcp__heroicons",  # Heroicons for consistent React icon components
            "mcp__unsplash",  # Unsplash stock photos for professional imagery
            "mcp__browser"  # Browser automation for testing and validation
        ]
        for tool in context_tools:
            if tool not in allowed_tools:
                allowed_tools.append(tool)
        
        # Initialize base agent
        super().__init__(
            name=name,
            system_prompt=enhanced_prompt,
            allowed_tools=allowed_tools,
            permission_mode=permission_mode,
            cwd=cwd,
            verbose=verbose
        )
        
        self.enable_context_awareness = enable_context_awareness
        self.session_id = None
        self.session_start_time = None
        self.files_modified = []
        self.decisions_made = []
        self.todos_completed = []
        
        # Configure MCP servers for context awareness
        if not hasattr(self, 'mcp_config'):
            self.mcp_config = {}
        
        # Load environment variables
        from dotenv import load_dotenv
        load_dotenv(override=True)
        
        # Add context-aware MCP servers
        # Note: OPENAI_API_KEY is still needed for graphiti's embedding functionality
        
        # Build MCP configurations with proper type and env handling
        mcp_configs = {
            "tree_sitter": {
                "type": "stdio",
                "command": "uv",
                "args": ["run", "mcp-tree-sitter"]
            },
            "context_manager": {
                "type": "stdio",
                "command": "uv",
                "args": ["run", "mcp-context-manager"]
            },
            "integration_analyzer": {
                "type": "stdio",
                "command": "uv",
                "args": ["run", "mcp-integration-analyzer"]
            },
            "graphiti": {
                "type": "stdio",
                "command": "uv",
                "args": ["run", "mcp-graphiti"]
            },
            "oxc": {
                "type": "stdio",
                "command": "uv",
                "args": ["run", "python", "-m", "cc_tools.oxc.server"]
            },
            "ruff": {
                "type": "stdio",
                "command": "uv",
                "args": ["run", "python", "-m", "cc_tools.ruff.server"]
            },
            "heroicons": {
                "type": "stdio",
                "command": "uv",
                "args": ["run", "python", "-m", "cc_tools.heroicons.server"]
            },
            "unsplash": {
                "type": "stdio",
                "command": "uv",
                "args": ["run", "python", "-m", "cc_tools.unsplash.server"]
            },
            "browser": {
                "type": "stdio",
                "command": "uv",
                "args": ["run", "python", "-m", "cc_tools.browser.server"]
            }
        }
        
        # Add environment variables only if they have non-None values
        # Context manager env
        context_storage = os.getenv("CONTEXT_STORAGE_PATH", os.path.expanduser("~/.cc_context_manager"))
        if context_storage:
            mcp_configs["context_manager"]["env"] = {"CONTEXT_STORAGE_PATH": context_storage}
        
        # Graphiti env
        graphiti_env = {}
        if os.getenv("OPENAI_API_KEY"):
            graphiti_env["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")
        graphiti_env["FALKORDB_HOST"] = os.getenv("FALKORDB_HOST", "localhost")
        graphiti_env["FALKORDB_PORT"] = os.getenv("FALKORDB_PORT", "6379") 
        graphiti_env["FALKORDB_DATABASE"] = os.getenv("FALKORDB_DATABASE", "default_db")
        if graphiti_env:
            mcp_configs["graphiti"]["env"] = graphiti_env
        
        # Unsplash env
        unsplash_env = {}
        if os.getenv("UNSPLASH_ACCESS_KEY"):
            unsplash_env["UNSPLASH_ACCESS_KEY"] = os.getenv("UNSPLASH_ACCESS_KEY")
        unsplash_env["UNSPLASH_SAVE_DIR"] = os.getenv("UNSPLASH_SAVE_DIR", os.path.join(os.getcwd(), "stock_photos"))
        if unsplash_env:
            mcp_configs["unsplash"]["env"] = unsplash_env
        
        # Browser env
        browser_env = {"BROWSER_HEADLESS": os.getenv("BROWSER_HEADLESS", "false")}
        if browser_env:
            mcp_configs["browser"]["env"] = browser_env
        
        self.mcp_config.update(mcp_configs)
        
        logger.info(f"Initialized ContextAwareAgent: {name}")
        if enable_context_awareness:
            logger.info("Context awareness features enabled")
            # Debug: Log loaded environment variables (redacted)
            logger.debug(f"FALKORDB_HOST: {os.getenv('FALKORDB_HOST', 'not set')}")
            logger.debug(f"FALKORDB_PORT: {os.getenv('FALKORDB_PORT', 'not set')}")
            logger.debug(f"OPENAI_API_KEY: {'set' if os.getenv('OPENAI_API_KEY') else 'not set'}")
        
        # Initialize heartbeat tracking
        self._heartbeat_task = None
        self._last_activity = datetime.now()
        self._heartbeat_interval = int(os.getenv('HEARTBEAT_INTERVAL', '300'))  # seconds (5 minutes)
    
    async def _heartbeat_logger(self):
        """Log progress every N seconds to show the agent is still active."""
        while True:
            try:
                await asyncio.sleep(self._heartbeat_interval)
                elapsed = int((datetime.now() - self._last_activity).total_seconds())
                logger.info(f"[HEARTBEAT] {self.name} active for {elapsed}s - still working...")
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Heartbeat error: {e}")
    
    async def run(
        self,
        user_prompt: str,
        mcp_servers: Optional[Dict[str, Dict[str, Any]]] = None,
        **kwargs
    ) -> AgentResult:
        """
        Run the agent with automatic context management.
        
        This method extends the base run() to:
        1. Load previous context before execution
        2. Track the session
        3. Capture context after execution
        
        Args:
            user_prompt: The task prompt
            mcp_servers: MCP server configuration
            **kwargs: Additional arguments for base Agent
        
        Returns:
            AgentResult with enhanced context tracking
        """
        # Use agent's MCP config if not provided
        if mcp_servers is None:
            mcp_servers = self.mcp_config
        
        # Start session tracking
        self.session_start_time = datetime.now()
        self._last_activity = datetime.now()
        
        # Start heartbeat logger
        self._heartbeat_task = asyncio.create_task(self._heartbeat_logger())
        
        try:
            if self.enable_context_awareness:
                # Load previous context with timeout
                try:
                    context_prompt = await asyncio.wait_for(
                        self._load_previous_context(user_prompt),
                        timeout=60.0  # 1 minute timeout for MCP calls
                    )
                except asyncio.TimeoutError:
                    logger.warning("Loading previous context timed out after 60s, proceeding without context")
                    context_prompt = None
                
                # Enhance prompt with context
                if context_prompt:
                    enhanced_prompt = f"{context_prompt}\n\nCurrent task: {user_prompt}"
                    logger.info("Loaded previous context into prompt")
                else:
                    enhanced_prompt = user_prompt
            else:
                enhanced_prompt = user_prompt
            
            # Log MCP server configuration
            if mcp_servers:
                logger.info(f"MCP servers configured for {self.name}: {list(mcp_servers.keys())}")
                logger.info(f"Allowed tools: {self.allowed_tools}")
                
                # Debug: Log MCP server details
                for server_name, server_config in mcp_servers.items():
                    logger.debug(f"MCP server '{server_name}': command='{server_config.get('command')}', args={server_config.get('args', [])}")
            else:
                logger.warning(f"No MCP servers configured for {self.name}")
            
            # Run the base agent
            logger.info(f"Running base agent with MCP servers: {list(mcp_servers.keys()) if mcp_servers else 'None'}")
            result = await super().run(
                user_prompt=enhanced_prompt,
                mcp_servers=mcp_servers,
                **kwargs
            )
            
            # Log tool usage
            if result.tool_uses:
                logger.info(f"Tools used by {self.name}: {[t.get('name', 'unknown') for t in result.tool_uses]}")
            else:
                logger.warning(f"No tools were used by {self.name}")
            
            if self.enable_context_awareness:
                # Capture session context with timeout
                try:
                    await asyncio.wait_for(
                        self._capture_session_context(user_prompt, result),
                        timeout=60.0  # 1 minute timeout
                    )
                except asyncio.TimeoutError:
                    logger.warning("Capturing session context timed out after 60s")
            
            return result
            
        finally:
            # Stop heartbeat
            if self._heartbeat_task:
                self._heartbeat_task.cancel()
                try:
                    await self._heartbeat_task
                except asyncio.CancelledError:
                    pass
    
    async def _load_previous_context(self, current_prompt: str) -> Optional[str]:
        """
        Load context from previous sessions.
        
        Args:
            current_prompt: The current task prompt
        
        Returns:
            Context prompt to prepend, or None
        """
        try:
            # Create a temporary agent to load context
            # This is a workaround since we can't directly call MCP tools
            context_prompt = f"""
Before proceeding with the task, please check for previous context:
1. Use search_knowledge_graph to find relevant past implementations and decisions
2. Use get_graph_insights to understand the knowledge structure
3. Review any existing knowledge about similar tasks or components

This will help ensure continuity and prevent duplicate work.
"""
            return context_prompt
        except Exception as e:
            logger.error(f"Error loading previous context: {e}")
            return None
    
    async def _capture_session_context(self, prompt: str, result: AgentResult):
        """
        Capture context from the current session.
        
        Args:
            prompt: The task prompt
            result: The agent execution result
        """
        try:
            # Extract information from result
            # In a real implementation, this would parse the result
            # to extract files modified, decisions, etc.
            
            # For now, we'll store basic session info
            session_info = {
                "task": prompt,
                "start_time": self.session_start_time.isoformat(),
                "end_time": datetime.now().isoformat(),
                "success": result.content is not None,
                "tool_uses": len(result.tool_uses) if result.tool_uses else 0
            }
            
            # Store in local context file
            context_dir = Path(self.cwd or os.getcwd()) / ".agent_context"
            context_dir.mkdir(exist_ok=True)
            
            session_file = context_dir / f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(session_file, 'w') as f:
                json.dump(session_info, f, indent=2)
            
            logger.info(f"Captured session context to {session_file}")
            
        except Exception as e:
            logger.error(f"Error capturing session context: {e}")
    
    def track_file_modification(self, file_path: str, operation: str, reason: str):
        """
        Track a file modification.
        
        Args:
            file_path: Path to the modified file
            operation: Type of operation (create, modify, delete)
            reason: Reason for the modification
        """
        self.files_modified.append({
            "file_path": file_path,
            "operation": operation,
            "reason": reason,
            "timestamp": datetime.now().isoformat()
        })
        logger.debug(f"Tracked {operation} on {file_path}")
    
    def track_decision(self, decision: str, rationale: str, alternatives: Optional[List[str]] = None):
        """
        Track an architectural or implementation decision.
        
        Args:
            decision: The decision made
            rationale: Why this decision was made
            alternatives: Other options considered
        """
        self.decisions_made.append({
            "decision": decision,
            "rationale": rationale,
            "alternatives": alternatives or [],
            "timestamp": datetime.now().isoformat()
        })
        logger.debug(f"Tracked decision: {decision}")
    
    def track_todo_completion(self, todo: str):
        """
        Track completion of a todo item.
        
        Args:
            todo: Description of the completed todo
        """
        self.todos_completed.append({
            "todo": todo,
            "timestamp": datetime.now().isoformat()
        })
        logger.debug(f"Tracked todo completion: {todo}")


# Convenience function to create context-aware agents
def create_context_aware_agent(
    name: str,
    system_prompt: str,
    workspace_path: str,
    **kwargs
) -> ContextAwareAgent:
    """
    Create a context-aware agent with sensible defaults.
    
    Args:
        name: Agent name
        system_prompt: Base system prompt
        workspace_path: Project workspace path
        **kwargs: Additional arguments for ContextAwareAgent
    
    Returns:
        Configured ContextAwareAgent instance
    """
    return ContextAwareAgent(
        name=name,
        system_prompt=system_prompt,
        cwd=str(workspace_path),
        enable_context_awareness=True,
        verbose=True,
        **kwargs
    )