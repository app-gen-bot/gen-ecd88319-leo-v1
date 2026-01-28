"""Retrospective agent class."""

import logging
from pathlib import Path
from cc_agent import ContextAwareAgent
from .system_prompt import SYSTEM_PROMPT
from .config import AGENT_CONFIG


class RetrospectiveAgent(ContextAwareAgent):
    """Context-aware agent for analyzing execution logs and generating improvement recommendations."""
    
    def __init__(self, output_dir: Path | str, logger: logging.Logger = None, enable_context_awareness: bool = True):
        """Initialize the context-aware retrospective agent.
        
        Args:
            output_dir: Directory where the retrospective report will be saved
            logger: Optional logger instance to use
            enable_context_awareness: Whether to enable context awareness features (default: True)
        """
        self.output_dir = Path(output_dir)
        
        super().__init__(
            name=AGENT_CONFIG["name"],
            system_prompt=SYSTEM_PROMPT,
            allowed_tools=AGENT_CONFIG["allowed_tools"],
            permission_mode=AGENT_CONFIG["permission_mode"],
            cwd=str(self.output_dir),
            enable_context_awareness=enable_context_awareness
        )
        
        # Store logger if provided
        if logger:
            self.logger = logger
        
        # Set max_turns after initialization
        self.max_turns = AGENT_CONFIG["max_turns"]