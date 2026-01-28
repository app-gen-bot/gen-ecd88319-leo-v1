"""Wireframe Generator agent class."""

import logging
from pathlib import Path
from cc_agent import Agent
from .system_prompt import SYSTEM_PROMPT
from .config import AGENT_CONFIG


class WireframeAgent(Agent):
    """Agent for generating Next.js wireframes with explicit output directory."""
    
    def __init__(self, output_dir: Path | str, logger: logging.Logger = None):
        """Initialize the wireframe agent with an output directory.
        
        Args:
            output_dir: Directory where the wireframe files will be generated
            logger: Optional logger instance to use
        """
        self.output_dir = Path(output_dir)
        
        super().__init__(
            name=AGENT_CONFIG["name"],
            system_prompt=SYSTEM_PROMPT,
            allowed_tools=AGENT_CONFIG["allowed_tools"],
            max_turns=AGENT_CONFIG["max_turns"],
            permission_mode=AGENT_CONFIG["permission_mode"],
            cwd=str(self.output_dir),
            logger=logger
        )