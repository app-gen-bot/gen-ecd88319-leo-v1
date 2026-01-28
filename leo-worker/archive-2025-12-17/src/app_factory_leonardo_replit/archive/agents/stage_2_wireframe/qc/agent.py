"""Quality Control agent class."""

import logging
from pathlib import Path
from cc_agent import ContextAwareAgent
from .system_prompt import SYSTEM_PROMPT
from .config import AGENT_CONFIG


class QCAgent(ContextAwareAgent):
    """Context-aware agent for validating wireframe implementations with memory of past validations."""
    
    def __init__(self, output_dir: Path | str, logger: logging.Logger = None, enable_context_awareness: bool = True):
        """Initialize the context-aware QC agent with an output directory.
        
        Args:
            output_dir: Directory containing the wireframe to validate
            logger: Optional logger instance to use
            enable_context_awareness: Whether to enable context awareness features (default: True)
        """
        self.output_dir = Path(output_dir)
        
        # Extend allowed tools with context-aware tools
        allowed_tools = AGENT_CONFIG["allowed_tools"].copy()
        # Note: Context tools are automatically added by ContextAwareAgent
        # integration_analyzer is already in the list
        
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