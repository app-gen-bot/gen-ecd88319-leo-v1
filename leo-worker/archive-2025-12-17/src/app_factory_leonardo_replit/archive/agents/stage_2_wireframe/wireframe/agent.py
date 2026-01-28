"""Wireframe Generator agent class."""

import logging
from pathlib import Path
from cc_agent import ContextAwareAgent
from .system_prompt import SYSTEM_PROMPT
from .config import AGENT_CONFIG


class WireframeAgent(ContextAwareAgent):
    """Context-aware agent for generating Next.js wireframes with memory and learning capabilities."""
    
    def __init__(self, output_dir: Path | str, logger: logging.Logger = None, enable_context_awareness: bool = True):
        """Initialize the context-aware wireframe agent with an output directory.
        
        Args:
            output_dir: Directory where the wireframe files will be generated
            logger: Optional logger instance to use
            enable_context_awareness: Whether to enable context awareness features (default: True)
        """
        self.output_dir = Path(output_dir)
        
        # Extend allowed tools with context-aware tools
        allowed_tools = AGENT_CONFIG["allowed_tools"].copy()
        # Note: Context tools are automatically added by ContextAwareAgent
        
        super().__init__(
            name=AGENT_CONFIG["name"],
            system_prompt=SYSTEM_PROMPT,
            allowed_tools=allowed_tools,
            permission_mode=AGENT_CONFIG["permission_mode"],
            cwd=str(self.output_dir),
            verbose=True,
            enable_context_awareness=enable_context_awareness
        )
        
        # Store logger if provided
        if logger:
            self.logger = logger
        
        # Set max_turns after initialization
        self.max_turns = AGENT_CONFIG["max_turns"]
    
    async def run(self, user_prompt: str, **kwargs):
        """Override run to monitor and warn about length constraint mentions."""
        result = await super().run(user_prompt, **kwargs)
        
        # Check if the agent mentioned length constraints
        forbidden_phrases = [
            "due to length",
            "length constraint",
            "continue in the next response",
            "save our progress and continue",
            "implement the remaining features more efficiently"
        ]
        
        if result.success and result.content:
            content_lower = result.content.lower()
            violations_found = []
            
            for phrase in forbidden_phrases:
                if phrase in content_lower:
                    violations_found.append(phrase)
            
            if violations_found:
                # Log warnings but don't fail
                if hasattr(self, 'logger') and self.logger:
                    self.logger.warning(f"⚠️ AGENT MENTIONED FORBIDDEN PHRASES: {violations_found}")
                    self.logger.warning("The agent should complete EVERYTHING without shortcuts or mentions of length constraints!")
                
                # Add a note to metadata about the violation
                if not hasattr(result, 'metadata') or result.metadata is None:
                    result.metadata = {}
                result.metadata['length_constraint_violations'] = violations_found
                result.metadata['warning'] = "Agent mentioned length constraints but was allowed to continue. Future iterations should avoid this."
                
                # Optionally append a reminder to the content (commented out for now)
                # result.content += "\n\n⚠️ REMINDER: The agent mentioned length constraints, which is forbidden. All features must be implemented in full detail without shortcuts."
        
        return result