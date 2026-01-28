"""
App Generator Agent

Generates complete full-stack applications from natural language prompts
using the pipeline-prompt.md system prompt.
"""

import logging
import os
import json
import uuid
from pathlib import Path
from typing import Optional, Dict, Any
from datetime import datetime

from cc_agent import Agent, find_latest_meaningful_session, find_sessions_for_cwd
from .config import AGENT_CONFIG, PIPELINE_PROMPT_PATH, APPS_OUTPUT_DIR, PROMPTING_GUIDE_PATH, EXPANSION_CONFIG
from .prompt_expander import PromptExpander
from .git_helper import GitHelper

# Import subagents if available
try:
    from .subagents import get_all_subagents, get_subagent
    SUBAGENTS_AVAILABLE = True
except ImportError:
    SUBAGENTS_AVAILABLE = False
    logger.warning("Subagents module not found - subagent functionality disabled")

logger = logging.getLogger(__name__)


class AppGeneratorAgent:
    """
    Agent that generates complete full-stack applications from prompts.

    This agent uses pipeline-prompt.md as its system prompt and has access
    to all necessary tools (MCP tools, file operations, browser automation, etc.)
    to build complete applications end-to-end.
    """

    def __init__(self, output_dir: Optional[str] = None, enable_expansion: bool = True, enable_subagents: bool = True):
        """
        Initialize the App Generator Agent.

        Args:
            output_dir: Directory where apps will be generated.
                       Defaults to /workspace/app
            enable_expansion: Whether to enable prompt expansion (default: True)
            enable_subagents: Whether to enable specialized subagents (default: True)
        """
        # Unset ANTHROPIC_API_KEY to use Claude Max OAuth token instead
        # This prevents "Credit balance too low" errors when on Claude Max plan
        import os
        if 'ANTHROPIC_API_KEY' in os.environ:
            logger.info("🔓 Removing ANTHROPIC_API_KEY to use Claude Max OAuth token")
            del os.environ['ANTHROPIC_API_KEY']

        self.output_dir = output_dir or APPS_OUTPUT_DIR
        self.pipeline_prompt = self._load_pipeline_prompt()
        self.enable_expansion = enable_expansion and EXPANSION_CONFIG["enabled"]
        self.enable_subagents = enable_subagents and SUBAGENTS_AVAILABLE

        # Initialize prompt expander and git helper
        if self.enable_expansion:
            self.prompt_expander = PromptExpander(PROMPTING_GUIDE_PATH)
        else:
            self.prompt_expander = None

        self.git_helper = GitHelper()

        # Initialize subagents if enabled
        self.subagents = {}
        sdk_agents = None
        if self.enable_subagents:
            self._initialize_subagents()
            sdk_agents = self._convert_subagents_to_sdk_format()
            logger.info(f"✅ Subagents configured programmatically (SDK v0.1.4)")

            # Also write to filesystem as fallback
            self._write_subagent_files()

        # Initialize the agent with pipeline prompt as system prompt
        # Use MCP tools instead of listing individual tool names
        self.agent = Agent(
            system_prompt=self.pipeline_prompt,
            allowed_tools=AGENT_CONFIG["allowed_tools"],  # Include all allowed tools (Task, etc.)
            mcp_tools=[
                "chrome_devtools",  # Replaces "browser" - advanced DevTools capabilities
                "build_test",
                "package_manager",
                # "dev_server",  # REMOVED: Hangs frequently, unreliable
                # "shadcn",  # REMOVED: Not needed
                "cwd_reporter",
                "integration_analyzer",
                "supabase_setup",  # Autonomous Supabase project creation (uses Supabase CLI + API)
            ],
            cwd=self.output_dir,
            name=AGENT_CONFIG["name"],
            model=AGENT_CONFIG["model"],
            max_turns=AGENT_CONFIG["max_turns"],
            agents=sdk_agents,  # Programmatic agents (claude-agent-sdk v0.1.4)
            setting_sources=["user", "project"],  # CRITICAL: Enable Skills discovery from filesystem
        )

        logger.info("✅ AppGeneratorAgent initialized")
        logger.info(f"📁 Output directory: {self.output_dir}")
        logger.info(f"🤖 Model: {AGENT_CONFIG['model']}")
        logger.info(f"🔄 Max turns: {AGENT_CONFIG['max_turns']}")
        logger.info(f"🛠️  Tools: {len(AGENT_CONFIG['allowed_tools'])} tools available")
        logger.info(f"📝 Prompt expansion: {'enabled' if self.enable_expansion else 'disabled'}")
        logger.info(f"🤖 Subagents: {'enabled' if self.enable_subagents else 'disabled'}")

        # Lightweight summarization agent (no tools, haiku model for cost efficiency)
        # Uses the global conversation callback so summaries go through WSI
        self._summary_agent = Agent(
            name="summarizer",
            system_prompt="You are a concise summarizer. Summarize development work in 2-3 factual sentences. Focus on WHAT was done and the RESULT. Skip process details.",
            allowed_tools=[],  # No tools - pure text completion
            model="claude-haiku-4-5",  # Fast and cheap
            max_turns=10,  # Allow multiple turns for complex summaries
            cwd=self.output_dir,
        )

        # Session management
        self.current_session_id: Optional[str] = None
        self.current_app_path: Optional[str] = None
        self.generation_context: Dict[str, Any] = {}

    def _initialize_subagents(self):
        """
        Initialize all available subagents and convert to SDK format.
        """
        if not SUBAGENTS_AVAILABLE:
            logger.warning("Subagents module not available - skipping initialization")
            return

        # Get all available subagents
        self.subagents = get_all_subagents()

        logger.info(f"✅ Loaded {len(self.subagents)} subagents:")
        for name, agent_def in self.subagents.items():
            logger.info(f"   - {name}: {agent_def.description[:50]}...")
            logger.info(f"     Model: {agent_def.model}, Tools: {len(agent_def.tools) if agent_def.tools else 0}")

    def _write_subagent_files(self):
        """
        Write subagent definitions to .claude/agents/ directory.

        This serves as a fallback mechanism. With claude-agent-sdk v0.1.4,
        subagents are configured programmatically via the agents parameter,
        but we also write them to the filesystem for debugging and compatibility.
        """
        if not self.subagents:
            return

        # Create .claude/agents/ in the output directory
        agents_dir = Path(self.output_dir) / ".claude" / "agents"
        agents_dir.mkdir(parents=True, exist_ok=True)

        written_count = 0
        for name, agent_def in self.subagents.items():
            # Create markdown file with YAML frontmatter
            agent_file = agents_dir / f"{name}.md"

            # Build YAML frontmatter
            frontmatter_lines = ["---", f"name: {name}", f"description: {agent_def.description}"]

            if agent_def.tools:
                tools_str = ", ".join(agent_def.tools)
                frontmatter_lines.append(f"tools: {tools_str}")

            if agent_def.model:
                frontmatter_lines.append(f"model: {agent_def.model}")

            frontmatter_lines.append("---")

            # Combine frontmatter and prompt
            content = "\n".join(frontmatter_lines) + "\n\n" + agent_def.prompt

            # Write to file
            agent_file.write_text(content, encoding="utf-8")
            written_count += 1

        logger.info(f"✅ Wrote {written_count} subagent files to {agents_dir}")

    def _convert_subagents_to_sdk_format(self) -> Dict[str, Any]:
        """
        Pass our AgentDefinition dataclass instances to claude-agent-sdk.

        Returns:
            Dictionary mapping agent names to AgentDefinition dataclass instances.

        With claude-agent-sdk v0.1.4+, the SDK expects dataclass instances
        and will call asdict() internally to convert them.
        """
        if not self.subagents:
            return {}

        # Pass dataclass instances directly - SDK will handle conversion
        sdk_agents = {name: agent_def for name, agent_def in self.subagents.items()}

        logger.info(f"✅ Prepared {len(sdk_agents)} subagents for SDK (as dataclass instances)")
        return sdk_agents

    async def delegate_to_subagent(self, subagent_name: str, task: str) -> Optional[str]:
        """
        Delegate a task to a specialized subagent.

        Args:
            subagent_name: Name of the subagent to use
            task: The task description to delegate

        Returns:
            The result from the subagent, or None if subagents are disabled
        """
        if not self.enable_subagents:
            logger.debug(f"Subagents disabled - skipping delegation to {subagent_name}")
            return None

        subagent = self.subagents.get(subagent_name)
        if not subagent:
            logger.warning(f"Subagent '{subagent_name}' not found")
            return None

        logger.info(f"🤖 Delegating to {subagent_name}: {task[:100]}...")

        # Note: In a real implementation, this would use the Task tool
        # For now, we'll log and return None to maintain backward compatibility
        logger.info(f"   Would delegate task to {subagent_name} with model {subagent.model}")
        logger.info(f"   Task: {task}")

        # TODO: Implement actual Task tool delegation when agent supports it
        # result = await self.agent.use_tool("Task", {
        #     "subagent_type": subagent_name,
        #     "description": subagent.description,
        #     "prompt": f"{subagent.prompt}\n\nTask: {task}"
        # })

        return None

    def _load_pipeline_prompt(self) -> str:
        """
        Load the pipeline prompt from pipeline-prompt.md.

        Returns:
            The pipeline prompt content as a string.

        Raises:
            FileNotFoundError: If pipeline-prompt.md doesn't exist.
        """
        prompt_path = Path(PIPELINE_PROMPT_PATH)

        if not prompt_path.exists():
            raise FileNotFoundError(
                f"Pipeline prompt not found at: {PIPELINE_PROMPT_PATH}\n"
                f"Expected location: {prompt_path.absolute()}"
            )

        with open(prompt_path, 'r', encoding='utf-8') as f:
            content = f.read()

        logger.info(f"✅ Loaded pipeline prompt: {len(content):,} characters")
        return content

    async def expand_prompt(
        self,
        user_input: str,
        app_path: Optional[str] = None
    ) -> dict:
        """
        Expand a user prompt using LLM-based expansion.

        Args:
            user_input: The user's input to expand
            app_path: Optional app path for context

        Returns:
            Dict with 'original', 'expanded', 'was_expanded', 'expansion_note'
        """
        if not self.enable_expansion or not self.prompt_expander:
            return {
                "original": user_input,
                "expanded": user_input,
                "was_expanded": False,
                "expansion_note": "Expansion disabled"
            }

        # Get recent commits for context if app exists
        recent_commits = None
        if app_path and Path(app_path).exists():
            recent_commits = self.git_helper.get_commit_history(app_path, limit=3)

        # Expand the prompt
        result = await self.prompt_expander.expand(
            user_input,
            app_path=app_path,
            recent_commits=recent_commits
        )

        return result

    async def generate_app(self, user_prompt: str, app_name: str) -> tuple:
        """
        Generate a complete application from a user prompt.

        This method:
        1. Expands the user prompt if needed
        2. Uses the pipeline-prompt.md system prompt to guide generation
        3. Creates the full application in the output directory
        4. Initializes git and creates initial commit
        5. Tests and validates the application

        Args:
            user_prompt: Natural language description of the app to build.
                        Example: "Create a todo app with authentication"
            app_name: Required name for the app directory.

        Returns:
            Tuple of (app_path, expansion_result)

        Example:
            agent = AppGeneratorAgent()
            app_path, expansion = await agent.generate_app(
                "Create a travel itinerary planner with AI recommendations",
                app_name="travel-planner"
            )
        """
        logger.info("\n" + "=" * 80)
        logger.info("🚀 STARTING APP GENERATION")
        logger.info("=" * 80)
        logger.info(f"\n📝 User Prompt:\n{user_prompt}\n")

        if app_name:
            logger.info(f"📁 App Name: {app_name}")

        # Expand the prompt
        expansion_result = await self.expand_prompt(user_prompt)
        prompt_to_use = expansion_result["expanded"]

        if expansion_result["was_expanded"]:
            logger.info("\n📋 Prompt Expansion:")
            logger.info("─" * 80)
            logger.info(expansion_result["expanded"])
            logger.info("─" * 80)

        # Prepare the generation prompt
        generation_prompt = self._build_generation_prompt(prompt_to_use, app_name)

        logger.info("\n🤖 Calling agent with full context...")
        logger.info(f"📊 System Prompt: {len(self.pipeline_prompt):,} chars")
        logger.info(f"📊 User Prompt: {len(generation_prompt):,} chars")
        logger.info("-" * 80)

        # Run the agent with session support (async) with fallback to non-session mode
        result = None
        try:
            result = await self.agent.run_with_session(generation_prompt)
        except Exception as e:
            error_msg = str(e).lower()
            # Check if it's a session-related error (expired, not found, terminated process, etc.)
            if "session" in error_msg or "command failed" in error_msg or "not found" in error_msg or "uuid" in error_msg or "terminated" in error_msg:
                logger.warning(f"⚠️  Session mode failed: {str(e)[:100]}")
                logger.info("🔄 Creating fresh session as fallback...")

                # Force cleanup of dead client to allow reinitialization
                try:
                    await self.agent.disconnect_session()
                except Exception:
                    pass  # Ignore disconnect errors
                self.agent.client = None  # Force reinitialization on next call

                # Create a fresh resumable session (no session_id = new session)
                result = await self.agent.run_with_session(generation_prompt)
                # Session ID will be captured below from agent.session_id
            else:
                # Re-raise if it's not a session-related error
                raise

        logger.info("\n" + "=" * 80)
        logger.info("✅ APP GENERATION COMPLETE")
        logger.info("=" * 80)

        # Capture the full agent summary for changelog
        agent_summary = result.content if hasattr(result, 'content') else str(result)

        # Extract app path from result
        app_path = self._extract_app_path(result, app_name)

        logger.info(f"\n📁 App Location: {app_path}")

        # Initialize git and create initial commit
        commit_hash = None
        if Path(app_path).exists():
            self.git_helper.initialize_repo(app_path)
            commit_hash = self.git_helper.create_initial_commit(
                app_path,
                app_name or "new-app"
            )
            if commit_hash:
                logger.info(f"💾 Git: Initial commit created ({commit_hash})")

        logger.info(f"🎯 To run: cd {app_path} && npm install && npm run dev")

        # Save session context
        self.current_app_path = app_path
        self.generation_context = {
            "app_name": app_name,
            "original_request": user_prompt,
            "features": self._extract_features(result.content),
            "entities": self._extract_entities(result.content),
            "generated_at": datetime.now().isoformat()
        }

        # Get session ID directly from agent (bypasses session_active check)
        if hasattr(self.agent, 'session_id'):
            self.current_session_id = self.agent.session_id
            logger.info(f"📂 Session ID captured: {self.current_session_id[:8] if self.current_session_id else 'None'}")

        # Save session to app directory
        self.save_session(app_path)

        # Append to changelog with full agent summary
        await self.append_to_changelog(
            app_path=app_path,
            operation_type="Initial Generation",
            user_request=user_prompt,
            agent_summary=agent_summary,
            commit_hash=commit_hash
        )

        # Append to summary changelog with concise summary
        await self.append_to_summary_changelog(
            app_path=app_path,
            operation_type="Initial Generation",
            user_request=user_prompt,
            agent_summary=agent_summary,
            commit_hash=commit_hash
        )

        # Generate CLAUDE.md for context persistence
        await self.generate_claude_md(app_path)

        return app_path, expansion_result

    def _extract_features(self, content: str) -> list:
        """Extract features from generation result (simplified)."""
        # This is a simplified extraction - in production, could use LLM or parsing
        features = []
        if "authentication" in content.lower():
            features.append("User authentication")
        if "crud" in content.lower():
            features.append("CRUD operations")
        if "api" in content.lower():
            features.append("RESTful API")
        if not features:
            features = ["Core functionality"]
        return features

    def _extract_entities(self, content: str) -> list:
        """Extract entities from generation result (simplified)."""
        # This is a simplified extraction
        entities = []
        if "users" in content.lower():
            entities.append("users")
        # Look for common entity patterns
        for word in ["products", "items", "posts", "comments", "orders", "categories"]:
            if word in content.lower():
                entities.append(word)
        if not entities:
            entities = ["users"]  # Default
        return entities

    def _build_generation_prompt(self, user_prompt: str, app_name: str) -> str:
        """
        Build the complete prompt for app generation.

        Args:
            user_prompt: The user's app description
            app_name: Required app name

        Returns:
            The complete prompt to send to the agent.
        """
        prompt_parts = [
            "# GENERATE COMPLETE APPLICATION",
            "",
            "## User Request",
            user_prompt,
            "",
            "## App Name",
            f"App name: `{app_name}`",
            "",
            "## Output Directory - REQUIRED",
            f"You MUST create all files directly in: `{self.output_dir}`",
            f"Do NOT create subdirectories like `{app_name}/` or `app/` - files go directly in `{self.output_dir}`.",
            "",
        ]

        prompt_parts.extend([
            "## Instructions",
            "",
            "Following the pipeline in your system prompt:",
            "",
            "1. **Stage 1: Plan** - Create plan/plan.md with full feature specification",
            "2. **Stage 2: Build** - Generate complete application:",
            "   - Backend: Schema, contracts, auth, storage, routes, AI (if needed)",
            "   - Frontend: API client, auth context, layout, all pages",
            "3. **Stage 3: Validate** - Run type check, lint, build test",
            "",
            "## Critical Requirements",
            "",
            "- ✅ Follow pipeline-prompt.md exactly (in your system prompt)",
            "- ✅ Schema-first development (schema.zod.ts is source of truth)",
            "- ✅ Complete route coverage (all entities get full CRUD)",
            "- ✅ NO mock data in frontend (all pages use real API)",
            "- ✅ Verify integration end-to-end before completing",
            "- ✅ Use TodoWrite to track progress",
            "- ✅ Test the app with Chrome DevTools (console, network, UI)",
            "",
            "## Output Location",
            f"Create all files directly in: `{self.output_dir}`",
            "",
            "Begin generation now. Use TodoWrite to track your progress through the pipeline stages.",
        ])

        return "\n".join(prompt_parts)

    def _extract_app_path(self, result, app_name: str) -> str:
        """
        Return the app path (output_dir).

        Args:
            result: The agent result object (unused, kept for compatibility)
            app_name: App name (unused, kept for compatibility)

        Returns:
            The path to the generated app directory.
        """
        # App is generated directly in output_dir (per CONTAINER-STRUCTURE.md)
        return str(self.output_dir)

    async def resume_generation(self, app_path: str, additional_instructions: str) -> tuple:
        """
        Resume or modify an existing app generation with automatic session support.

        This method automatically finds and uses the app's existing session if available,
        maintaining context across modifications.

        Args:
            app_path: Path to the existing app directory
            additional_instructions: What to add/fix/modify

        Returns:
            Tuple of (app_path, expansion_result)

        Example:
            app_path, expansion = await agent.resume_generation(
                "/workspace/app",
                "Add dark mode support to the UI"
            )
        """
        logger.info("\n" + "=" * 80)
        logger.info("🔄 RESUMING APP GENERATION")
        logger.info("=" * 80)
        logger.info(f"\n📁 App Path: {app_path}")

        # Automatically check for existing session for this app
        session_data = self.load_session(app_path)
        session_id = None
        if session_data:
            session_id = session_data.get("session_id")
            logger.info(f"📂 Found existing session: {session_id[:8]} - using session context")
            # Load context from session
            if session_data.get("context"):
                self.generation_context = session_data["context"]
        else:
            logger.info("📂 No existing session found - will create new session")

        # Use resume_with_session for automatic session handling
        return await self.resume_with_session(app_path, additional_instructions, session_id=session_id)

    def get_app_session_file(self, app_path: str) -> Path:
        """Get the session file path for a specific app."""
        return Path(app_path) / ".agent_session.json"

    def save_session(self, app_path: Optional[str] = None) -> None:
        """Save current session ID and context to app-specific file."""
        # Use provided app_path or current app path
        app_path = app_path or self.current_app_path
        if not app_path:
            logger.warning("No app path available for session save")
            return

        # Get session ID from agent if not already set
        if not self.current_session_id and hasattr(self.agent, 'session_id'):
            self.current_session_id = self.agent.session_id
            logger.info(f"📂 Retrieved session ID from agent: {self.current_session_id[:8] if self.current_session_id else 'None'}")

        if not self.current_session_id:
            logger.warning("No session ID available to save")
            return

        session_data = {
            "session_id": self.current_session_id,
            "app_path": app_path,
            "timestamp": datetime.now().isoformat(),
            "context": self.generation_context
        }

        try:
            session_file = self.get_app_session_file(app_path)
            session_file.parent.mkdir(parents=True, exist_ok=True)
            session_file.write_text(json.dumps(session_data, indent=2))
            logger.info(f"💾 Session saved to {session_file}: {self.current_session_id[:8]}")
        except Exception as e:
            logger.error(f"Failed to save session: {e}")

    def load_session(self, app_path: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Load session for a specific app or the current app."""
        app_path = app_path or self.current_app_path
        if not app_path:
            # Try legacy global session location for backward compatibility
            legacy_session = Path(self.output_dir) / ".agent_session.json"
            if legacy_session.exists():
                try:
                    session_data = json.loads(legacy_session.read_text())
                    logger.info(f"📂 Found legacy session: {session_data['session_id'][:8]} (will migrate on save)")
                    return session_data
                except Exception as e:
                    logger.error(f"Failed to load legacy session: {e}")
            return None

        # Check app-specific session file
        session_file = self.get_app_session_file(app_path)
        if not session_file.exists():
            return None

        try:
            session_data = json.loads(session_file.read_text())
            logger.info(f"📂 Found app session: {session_data['session_id'][:8]} for {app_path}")
            return session_data
        except Exception as e:
            logger.error(f"Failed to load session: {e}")
            return None

    def _is_valid_uuid(self, session_id: Optional[str]) -> bool:
        """Check if a session ID is a valid UUID format."""
        if not session_id:
            return False
        try:
            uuid.UUID(session_id)
            return True
        except (ValueError, AttributeError):
            return False

    async def resume_with_session(self, app_path: str, additional_instructions: str, session_id: Optional[str] = None) -> tuple:
        """
        Resume or modify an existing app with session support.

        Args:
            app_path: Path to the existing app directory
            additional_instructions: What to add/fix/modify
            session_id: Optional session ID to resume (if not provided, loads from app)

        Returns:
            Tuple of (app_path, expansion_result)
        """
        logger.info("\n" + "=" * 80)
        logger.info("🔄 RESUMING WITH SESSION SUPPORT")
        logger.info("=" * 80)
        logger.info(f"\n📁 App Path: {app_path}")

        # Load app-specific session if no session_id provided
        if not session_id:
            session_data = self.load_session(app_path)
            if session_data:
                session_id = session_data["session_id"]
                # Validate session ID is a proper UUID
                if not self._is_valid_uuid(session_id):
                    logger.warning(f"⚠️  Invalid session ID format: {session_id[:20]}... (not a UUID)")
                    logger.info("📝 Will create new session")
                    session_id = None
                    self.clear_session(app_path)
                else:
                    logger.info(f"📂 Using app's existing session: {session_id[:8]}")

        # Update current state
        self.current_app_path = app_path
        self.current_session_id = session_id

        # Expand the prompt
        expansion_result = await self.expand_prompt(additional_instructions, app_path=app_path)
        instructions_to_use = expansion_result["expanded"]

        if expansion_result["was_expanded"]:
            logger.info("\n📋 Expanded Instructions:")
            logger.info("─" * 80)
            logger.info(instructions_to_use)
            logger.info("─" * 80 + "\n")

        # Create checkpoint commit if needed
        if Path(app_path).exists() and self.git_helper.has_uncommitted_changes(app_path):
            logger.info("💾 Creating checkpoint commit before modifications...")
            commit_hash = self.git_helper.create_checkpoint_commit(
                app_path,
                additional_instructions,
                instructions_to_use if expansion_result["was_expanded"] else None
            )
            if commit_hash:
                logger.info(f"✅ Checkpoint created ({commit_hash})")

        # Change working directory to the app path
        original_cwd = self.agent.cwd
        self.agent.cwd = app_path

        # Build context-aware prompt
        context_msg = ""
        if self.generation_context:
            context_msg = f"""
## Previous Context
App: {self.generation_context.get('app_name', 'Unknown')}
Features: {', '.join(self.generation_context.get('features', []))}
Last Action: {self.generation_context.get('last_action', 'Unknown')}

"""

        resume_prompt = f"""
# RESUME/MODIFY APPLICATION

## App Location
Working in: `{app_path}`

## Database Status: ✅ ALREADY CONFIGURED
**IMPORTANT**: The database is already set up and connected. DO NOT:
- Try to create a new Supabase project
- Try to run supabase init or supabase link
- Look for supabase CLI or MCP tools for database setup
- Create memory storage adapters as a workaround

The app's `.env` file has `DATABASE_URL` and `DATABASE_URL_POOLING` configured.
The schema was restored during resume setup via `drizzle-kit push`.
You can use the existing `db` instance from `server/lib/db.ts` directly.

If you need to query the database, just import and use the existing db:
```typescript
import {{ db }} from './server/lib/db';
// Use db.select(), db.insert(), etc.
```

{context_msg}## Instructions
{instructions_to_use}

## Task
Modify the existing application according to the instructions above.

Follow the same quality standards from your system prompt:
- Schema-first development
- Complete integration
- No mock data
- Test changes thoroughly

Use TodoWrite to track your modifications.
"""

        # Session discovery: Use provided session_id OR find latest existing session
        # DON'T generate random UUIDs - Claude creates its own session IDs
        if not session_id:
            # Try to discover an existing session from disk
            discovered_session = find_latest_meaningful_session(app_path, min_size_bytes=5000)
            if discovered_session:
                logger.info(f"📂 Discovered existing session: {discovered_session[:8]}...")
                session_id = discovered_session
            else:
                logger.info("📝 No existing sessions found, will create new session...")

        # Try to use session-aware run with smart fallback cascade
        result = None
        tried_sessions = set()

        async def cleanup_dead_client():
            """Force cleanup of dead client to allow reinitialization."""
            try:
                await self.agent.disconnect_session()
            except Exception:
                pass  # Ignore disconnect errors
            self.agent.client = None  # Force reinitialization on next call

        # First attempt with the provided/discovered session
        try:
            if session_id:
                tried_sessions.add(session_id)
            result = await self.agent.run_with_session(resume_prompt, session_id=session_id)
        except Exception as e:
            error_msg = str(e).lower()
            # Check if it's a session-related error
            is_session_error = any(term in error_msg for term in [
                "session", "command failed", "not found", "uuid", "terminated", "conversation"
            ])

            if not is_session_error:
                # Re-raise if it's not a session-related error
                raise

            logger.warning(f"⚠️ Session {session_id[:8] if session_id else 'N/A'} failed: {str(e)[:100]}")

            # Clear the invalid session from our tracking
            self.clear_session(app_path)
            await cleanup_dead_client()

            # Try to find and use other existing sessions (fallback cascade)
            sessions = find_sessions_for_cwd(app_path)
            session_found = False

            for session_info in sessions:
                if session_info.session_id in tried_sessions:
                    continue
                if session_info.size < 5000:  # Skip tiny/failed sessions
                    continue

                logger.info(f"🔄 Trying older session: {session_info.session_id[:8]}... ({session_info.size // 1024}KB)")
                tried_sessions.add(session_info.session_id)

                try:
                    result = await self.agent.run_with_session(resume_prompt, session_id=session_info.session_id)
                    session_found = True
                    break  # Success!
                except Exception as retry_error:
                    logger.warning(f"⚠️ Session {session_info.session_id[:8]} also failed: {str(retry_error)[:50]}")
                    await cleanup_dead_client()
                    continue

            # If all existing sessions failed, start completely fresh (let Claude generate ID)
            if not session_found:
                logger.info("🆕 All existing sessions failed, starting fresh session...")
                result = await self.agent.run_with_session(resume_prompt)
                # Session ID will be captured below from agent.session_id

        # Get session ID directly from agent (bypasses session_active check)
        # Validate it's a real UUID (not a placeholder like "session-12345")
        if hasattr(self.agent, 'session_id') and self.agent.session_id:
            try:
                uuid.UUID(self.agent.session_id)  # Validate UUID format
                self.current_session_id = self.agent.session_id
                logger.info(f"📂 Session ID captured after run: {self.current_session_id[:8]}...")
            except ValueError:
                # Placeholder ID, don't save - let next run discover from disk
                logger.warning(f"⚠️ Got placeholder session ID ({self.agent.session_id[:20]}...), not saving")
                self.current_session_id = None
        elif session_id:
            # Use the session_id we started with (already validated as existing)
            self.current_session_id = session_id
            logger.info(f"📂 Using discovered/provided session ID: {session_id[:8]}...")
        else:
            # No session ID available
            logger.info("📂 No session ID to save (will discover on next run)")

        # Capture the full agent summary for changelog
        agent_summary = result.content if hasattr(result, 'content') else str(result)

        # Update context
        self.generation_context["last_action"] = additional_instructions[:100]
        self.generation_context["last_modified"] = datetime.now().isoformat()

        # Save session to app directory
        self.save_session(app_path)

        # Append to changelog with full agent summary
        await self.append_to_changelog(
            app_path=app_path,
            operation_type="Modification",
            user_request=additional_instructions,
            agent_summary=agent_summary,
            commit_hash=None  # No commit for modifications (could add if needed)
        )

        # Append to summary changelog with concise summary
        await self.append_to_summary_changelog(
            app_path=app_path,
            operation_type="Modification",
            user_request=additional_instructions,
            agent_summary=agent_summary,
            commit_hash=None
        )

        # Restore original working directory
        self.agent.cwd = original_cwd

        logger.info("\n" + "=" * 80)
        logger.info("✅ MODIFICATIONS COMPLETE (Session preserved)")
        logger.info("=" * 80)

        return app_path, expansion_result

    def get_session_context(self) -> Dict[str, Any]:
        """Get current session context for display or inspection."""
        return {
            "session_id": self.current_session_id,
            "app_path": self.current_app_path,
            "context": self.generation_context,
            "session_active": self.agent.session_active if hasattr(self.agent, 'session_active') else False
        }

    def clear_session(self, app_path: Optional[str] = None) -> None:
        """Clear session for a specific app or current app."""
        app_path = app_path or self.current_app_path

        # Clear current session if it matches
        if app_path and app_path == self.current_app_path:
            self.current_session_id = None
            self.generation_context = {}

        # Remove app-specific session file
        if app_path:
            session_file = self.get_app_session_file(app_path)
            if session_file.exists():
                session_file.unlink()
                logger.info(f"🧹 Session cleared for {app_path}")

        # Also clear legacy global session if exists
        legacy_session = Path(self.output_dir) / ".agent_session.json"
        if legacy_session.exists():
            legacy_session.unlink()
            logger.info("🧹 Legacy session cleared")

    def _get_current_changelog_file(self, app_path: str, app_name: str) -> tuple:
        """
        Get the current changelog file to write to, handling 5MB rotation.

        Creates new numbered files when current file exceeds 5MB.
        Never overwrites older files - only appends to current or creates new.

        Args:
            app_path: Path to the app directory (e.g., apps/Fizzcard/app)
            app_name: Name of the app

        Returns:
            Tuple of (file_path, file_number)
        """
        # Changelog directory at app root level (not inside /app)
        app_root = Path(app_path).parent  # apps/Fizzcard/app -> apps/Fizzcard
        changelog_dir = app_root / "changelog"
        changelog_dir.mkdir(parents=True, exist_ok=True)

        # Find highest numbered file
        existing_files = sorted(changelog_dir.glob("changelog-*.md"))

        if not existing_files:
            # First file
            return changelog_dir / "changelog-001.md", 1

        # Get latest file
        latest_file = existing_files[-1]
        file_number = int(latest_file.stem.split("-")[1])

        # Check size (5MB = 5,242,880 bytes)
        MAX_SIZE = 5 * 1024 * 1024  # 5MB
        if latest_file.stat().st_size >= MAX_SIZE:
            # Create next file (NEVER overwrite older files)
            file_number += 1
            return changelog_dir / f"changelog-{file_number:03d}.md", file_number

        return latest_file, file_number

    def _update_changelog_readme(self, app_path: str, app_name: str) -> None:
        """
        Update the changelog README.md with file index and navigation.

        Args:
            app_path: Path to the app directory
            app_name: Name of the app
        """
        app_root = Path(app_path).parent
        changelog_dir = app_root / "changelog"
        readme_file = changelog_dir / "README.md"

        # Get all changelog files with their metadata
        changelog_files = sorted(changelog_dir.glob("changelog-*.md"))

        # Count total entries across all files
        total_entries = 0
        file_info = []

        for file in changelog_files:
            try:
                content = file.read_text(encoding="utf-8")
                entry_count = content.count("## 📅")
                total_entries += entry_count

                file_info.append({
                    "name": file.name,
                    "entries": entry_count,
                    "size_mb": file.stat().st_size / (1024 * 1024)
                })
            except Exception:
                # If we can't read a file, just skip it
                continue

        # Build README content
        readme_parts = [
            f"# {app_name} - Development Changelog",
            "",
            "This folder contains the complete conversation history between you and the AI App Generator.",
            "Each entry shows your prompts and the agent's complete implementation summaries.",
            "",
            "## Files",
            ""
        ]

        for info in file_info:
            readme_parts.append(
                f"- [{info['name']}](./{info['name']}) - "
                f"{info['entries']} entries, {info['size_mb']:.2f} MB"
            )

        readme_parts.extend([
            "",
            f"**Total Entries**: {total_entries} across {len(file_info)} file(s)",
            "",
            "To view the complete history, read files in order starting with changelog-001.md.",
            "",
            "## Format",
            "",
            "Each entry contains:",
            "- 👤 **User Prompt**: What you asked the agent to do",
            "- 🤖 **Implementation Summary**: Complete details of what the agent accomplished",
            "- **Metadata**: Session ID, git commits, files changed",
            ""
        ])

        try:
            readme_file.write_text("\n".join(readme_parts), encoding="utf-8")
        except Exception as e:
            logger.error(f"Failed to update changelog README: {e}")

    async def _generate_concise_summary(self, agent_output: str, max_chars: int = 500) -> str:
        """
        Generate a concise 2-3 sentence summary of agent output using LLM.

        Uses a lightweight summarization agent (haiku model, no tools) for
        cost-efficient summarization. The agent uses the global conversation
        callback so summaries go through WSI for visibility.

        Args:
            agent_output: Full verbose agent output
            max_chars: Target maximum characters for summary

        Returns:
            Concise summary string (200-500 chars typically)
        """
        if not agent_output:
            return "No summary available."

        # Truncate if too long (only send first 10K chars to save tokens)
        content = agent_output[:10000] if len(agent_output) > 10000 else agent_output

        prompt = f"""Summarize this development work in 2-3 concise sentences (max {max_chars} chars):

{content}

Focus on WHAT was done, WHAT changed, and the RESULT. Skip process details like "I clicked...", "Let me check...", "Perfect!". Be factual and concise."""

        try:
            # Use lightweight summarization agent (haiku, no tools)
            # Goes through WSI via global conversation callback
            summary_result = await self._summary_agent.run(prompt)
            summary = summary_result.content.strip()

            # Enforce length limit (truncate if needed)
            if len(summary) > max_chars:
                # Try to break at sentence boundary
                truncated = summary[:max_chars]
                last_period = truncated.rfind('.')
                if last_period > max_chars // 2:
                    summary = truncated[:last_period + 1]
                else:
                    summary = truncated[:max_chars-3] + "..."

            return summary

        except Exception as e:
            logger.warning(f"Failed to generate LLM summary: {e}")
            # Fallback: simple text extraction
            lines = agent_output.strip().split('\n')
            meaningful = [l.strip() for l in lines if len(l.strip()) > 20][:3]
            fallback = ' '.join(meaningful)
            if len(fallback) > max_chars:
                fallback = fallback[:max_chars-3] + "..."
            return fallback if fallback else "Development work completed."

    async def append_to_changelog(
        self,
        app_path: str,
        operation_type: str,
        user_request: str,
        agent_summary: Optional[str] = None,
        commit_hash: Optional[str] = None
    ) -> None:
        """
        Append an entry to the app's changelog with automatic file rotation.

        Creates entries in a dedicated changelog/ folder at app root level.
        Automatically rotates to new files when current file exceeds 5MB.
        Never overwrites older files - only appends to current or creates new.

        Args:
            app_path: Path to the app directory (e.g., apps/Fizzcard/app)
            operation_type: Type of operation (e.g., "Initial Generation", "Modification")
            user_request: The user's request/prompt
            agent_summary: Full implementation summary from agent (optional)
            commit_hash: Optional git commit hash
        """
        # Extract app name from path (e.g., apps/RaiseIQ/app -> RaiseIQ)
        app_path_obj = Path(app_path)
        app_name = app_path_obj.parent.name if app_path_obj.name == "app" else app_path_obj.name

        # Get current changelog file (handles rotation automatically)
        changelog_file, file_number = self._get_current_changelog_file(app_path, app_name)

        # Format timestamp
        timestamp = datetime.now().strftime("%b %d, %Y %I:%M %p")

        # Get files changed count from git if available
        files_changed_count = 0
        try:
            if commit_hash and (Path(app_path) / ".git").exists():
                # Get files from last commit
                import subprocess
                result = subprocess.run(
                    ["git", "diff-tree", "--no-commit-id", "--name-only", "-r", commit_hash],
                    cwd=app_path,
                    capture_output=True,
                    text=True,
                    check=False
                )
                if result.returncode == 0 and result.stdout:
                    files_changed_count = len([f for f in result.stdout.strip().split('\n') if f])
        except Exception:
            pass  # Silently fail if git info unavailable

        # Build the changelog entry with new format
        entry_parts = [
            f"## 📅 {timestamp} - {operation_type}",
            "",
            "### 👤 User Prompt",
            "",
            f"> {user_request}",
            "",
            "### 🤖 Implementation Summary",
            "",
            agent_summary or "No detailed summary available.",
            "",
            "**Metadata**",
        ]

        # Add metadata
        if self.current_session_id:
            entry_parts.append(f"- Session ID: `{self.current_session_id}`")
        if commit_hash:
            entry_parts.append(f"- Git Commit: `{commit_hash}`")
        if files_changed_count > 0:
            entry_parts.append(f"- Files Changed: {files_changed_count}")

        entry_parts.extend(["", "---", ""])

        entry = "\n".join(entry_parts)

        try:
            # Read existing content if file exists
            existing_content = ""
            if changelog_file.exists():
                existing_content = changelog_file.read_text(encoding="utf-8")

            # Check if this is a new file (doesn't exist or empty)
            if not existing_content.strip():
                # Add header for new changelog file
                header = f"# {app_name} - Changelog Part {file_number}\n\n"
                header += f"This file is part of a multi-file changelog. See [README.md](./README.md) for all files.\n\n"
                header += "---\n\n"
                new_content = header + entry
            else:
                # APPEND mode: Add new entry at END (newest at bottom)
                new_content = existing_content + entry

            # Write the updated changelog
            changelog_file.write_text(new_content, encoding="utf-8")

            # Update the README index
            self._update_changelog_readme(app_path, app_name)

            logger.info(f"📝 Updated changelog: {changelog_file}")

        except Exception as e:
            logger.error(f"Failed to update changelog: {e}")

    async def append_to_summary_changelog(
        self,
        app_path: str,
        operation_type: str,
        user_request: str,
        agent_summary: Optional[str] = None,
        commit_hash: Optional[str] = None
    ) -> None:
        """
        Append a CONCISE entry to the summary changelog.

        Similar to append_to_changelog() but with LLM-generated concise summaries
        instead of full verbose agent output. Enables token-efficient history review.

        Args:
            app_path: Path to the app directory
            operation_type: Type of operation (e.g., "Initial Generation", "Modification")
            user_request: The user's request/prompt
            agent_summary: Full implementation summary (will be condensed)
            commit_hash: Optional git commit hash
        """
        # Extract app name
        app_path_obj = Path(app_path)
        app_name = app_path_obj.parent.name if app_path_obj.name == "app" else app_path_obj.name

        # Summary changelog directory at app root level
        app_root = app_path_obj.parent
        summary_dir = app_root / "summary_changes"
        summary_dir.mkdir(parents=True, exist_ok=True)

        # Get current summary file (1MB rotation vs 5MB for full changelog)
        summary_file = self._get_current_summary_file(app_path, app_name)

        # Format timestamp
        timestamp = datetime.now().strftime("%b %d, %Y %I:%M %p")

        # Get files changed count
        files_changed_count = 0
        try:
            if commit_hash and (Path(app_path) / ".git").exists():
                import subprocess
                result = subprocess.run(
                    ["git", "diff-tree", "--no-commit-id", "--name-only", "-r", commit_hash],
                    cwd=app_path,
                    capture_output=True,
                    text=True,
                    check=False
                )
                if result.returncode == 0 and result.stdout:
                    files_changed_count = len([f for f in result.stdout.strip().split('\n') if f])
        except Exception:
            pass

        # Generate concise summary using LLM
        concise_summary = "No summary available."
        if agent_summary:
            concise_summary = await self._generate_concise_summary(agent_summary, max_chars=500)

        # Build the CONCISE changelog entry
        entry_parts = [
            f"## 📅 {timestamp} - {operation_type}",
            "",
            f"**User**: {user_request}",
            "",
            f"**Summary**: {concise_summary}",
            ""
        ]

        # Add metadata in compact format
        metadata_parts = []
        if self.current_session_id:
            metadata_parts.append(f"Session {self.current_session_id[:8]}...")
        if commit_hash:
            metadata_parts.append(f"Commit {commit_hash[:8]}")
        if files_changed_count > 0:
            metadata_parts.append(f"{files_changed_count} files")

        if metadata_parts:
            entry_parts.append(f"**Meta**: {', '.join(metadata_parts)}")
            entry_parts.append("")

        entry_parts.extend(["---", ""])

        entry = "\n".join(entry_parts)

        try:
            # Read existing content if file exists
            existing_content = ""
            if summary_file.exists():
                existing_content = summary_file.read_text(encoding="utf-8")

            # Check if this is a new file
            if not existing_content.strip():
                # Add header for new summary file
                file_number = self._get_summary_file_number(summary_file)
                header = f"# {app_name} - Summary Changes Part {file_number}\n\n"
                header += f"Concise summaries of development sessions. See `changelog/` for full details.\n\n"
                header += "---\n\n"
                new_content = header + entry
            else:
                # APPEND mode: Add new entry at END
                new_content = existing_content + entry

            # Write the updated summary
            summary_file.write_text(new_content, encoding="utf-8")

            # Update README
            self._update_summary_readme(app_path, app_name)

            logger.info(f"📝 Updated summary changelog: {summary_file}")

        except Exception as e:
            logger.error(f"Failed to update summary changelog: {e}")

    def _get_current_summary_file(self, app_path: str, app_name: str) -> Path:
        """Get current summary file with 1MB rotation."""
        app_root = Path(app_path).parent
        summary_dir = app_root / "summary_changes"
        summary_dir.mkdir(parents=True, exist_ok=True)

        # Find highest numbered file
        existing_files = sorted(summary_dir.glob("summary-*.md"))

        if not existing_files:
            return summary_dir / "summary-001.md"

        # Get latest file
        latest_file = existing_files[-1]
        file_number = int(latest_file.stem.split("-")[1])

        # Check size (1MB = 1,048,576 bytes)
        MAX_SIZE = 1 * 1024 * 1024
        if latest_file.stat().st_size >= MAX_SIZE:
            file_number += 1
            return summary_dir / f"summary-{file_number:03d}.md"

        return latest_file

    def _get_summary_file_number(self, summary_file: Path) -> int:
        """Extract file number from summary filename."""
        return int(summary_file.stem.split("-")[1])

    def _update_summary_readme(self, app_path: str, app_name: str) -> None:
        """Update the summary changelog README with file index."""
        app_root = Path(app_path).parent
        summary_dir = app_root / "summary_changes"
        readme_file = summary_dir / "README.md"

        # Get all summary files
        summary_files = sorted(summary_dir.glob("summary-*.md"))

        total_entries = 0
        file_info = []

        for file in summary_files:
            try:
                content = file.read_text(encoding="utf-8")
                entry_count = content.count("## 📅")
                total_entries += entry_count

                file_info.append({
                    "name": file.name,
                    "entries": entry_count,
                    "size_kb": file.stat().st_size / 1024
                })
            except Exception:
                continue

        # Build README content
        readme_parts = [
            f"# {app_name} - Summary Changes",
            "",
            "This folder contains **concise summaries** of development sessions.",
            "Each entry is 2-3 sentences capturing what was done, what changed, and the result.",
            "",
            "For full verbose details, see `../changelog/`.",
            "",
            "## Files",
            ""
        ]

        for info in file_info:
            readme_parts.append(
                f"- [{info['name']}](./{info['name']}) - "
                f"{info['entries']} entries, {info['size_kb']:.1f} KB"
            )

        readme_parts.extend([
            "",
            f"**Total Entries**: {total_entries} across {len(file_info)} file(s)",
            "",
            "## Format",
            "",
            "Each entry contains:",
            "- **User**: What you asked",
            "- **Summary**: 2-3 sentence summary of what was done",
            "- **Meta**: Session ID, commit hash, files changed",
            ""
        ])

        try:
            readme_file.write_text("\n".join(readme_parts), encoding="utf-8")
        except Exception as e:
            logger.error(f"Failed to update summary README: {e}")

    async def generate_claude_md(self, app_path: str) -> None:
        """Generate CLAUDE.md file with app context for persistence."""
        claude_md = Path(app_path) / "CLAUDE.md"

        content = f"""# {self.generation_context.get('app_name', 'App')} - Context

Generated: {datetime.now().isoformat()}
Session: {self.current_session_id or 'No active session'}

## Architecture Overview

### Entities
{', '.join(self.generation_context.get('entities', ['Not recorded']))}

### Tech Stack
- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL (via Supabase)
- ORM: Drizzle
- API: ts-rest contracts

### Features
{chr(10).join('- ' + f for f in self.generation_context.get('features', ['Not recorded']))}

## Key Files and Directories

- `shared/schema.zod.ts` - Zod validation schemas (source of truth)
- `shared/schema.ts` - Drizzle ORM schemas
- `shared/contracts/` - ts-rest API contracts
- `server/routes/` - API route implementations
- `server/lib/auth/` - Authentication adapters (mock/Supabase)
- `server/lib/storage/` - Storage adapters (memory/database)
- `client/src/pages/` - React page components
- `client/src/components/` - Reusable UI components
- `client/src/contexts/` - React contexts (Auth, etc.)
- `client/src/lib/` - Client utilities (api-client, auth-helpers)

## Recent Changes

{self.generation_context.get('last_action', 'No recent changes recorded')}
Last modified: {self.generation_context.get('last_modified', 'Unknown')}

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (port 5013)
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Environment Variables

See `.env` file for configuration. Key variables:
- `AUTH_MODE`: mock (dev) or supabase (prod)
- `STORAGE_MODE`: memory (dev) or database (prod)
- `PORT`: Server port (default: 5013)
- `VITE_API_URL`: API endpoint for client

## Notes for Future Development

This file helps Claude Code maintain context across sessions. When resuming work,
Claude will read this file to understand the app's architecture and recent changes.
"""

        try:
            claude_md.write_text(content)
            logger.info(f"📝 Generated CLAUDE.md at {claude_md}")
        except Exception as e:
            logger.error(f"Failed to generate CLAUDE.md: {e}")


def create_app_generator(
    output_dir: Optional[str] = None,
    enable_expansion: bool = True,
    enable_subagents: bool = True
) -> AppGeneratorAgent:
    """
    Factory function to create an AppGeneratorAgent.

    Args:
        output_dir: Optional custom output directory
        enable_expansion: Whether to enable prompt expansion (default: True)
        enable_subagents: Whether to enable specialized subagents (default: True)

    Returns:
        An initialized AppGeneratorAgent instance
    """
    return AppGeneratorAgent(
        output_dir=output_dir,
        enable_expansion=enable_expansion,
        enable_subagents=enable_subagents
    )
