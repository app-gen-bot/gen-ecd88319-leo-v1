"""Interaction Specification Agent - Generates detailed interaction specs from PRDs."""

from .agent import InteractionSpecAgent, interaction_spec_agent
from .config import INTERACTION_SPEC_NAME, INTERACTION_SPEC_DESCRIPTION
from .user_prompt import create_user_prompt

__all__ = [
    "InteractionSpecAgent",
    "interaction_spec_agent",
    "INTERACTION_SPEC_NAME",
    "INTERACTION_SPEC_DESCRIPTION",
    "create_user_prompt"
]