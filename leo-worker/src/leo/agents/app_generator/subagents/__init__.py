"""
Subagent definitions for AppGeneratorAgent.

These specialized agents handle specific aspects of app generation
with isolated context and focused expertise.

DEPRECATED SUBAGENTS:
- schema_designer (2025-11-18): Converted to skill (schema-designer)
  See: ~/.claude/skills/schema-designer/SKILL.md
- api_architect (2025-11-18): Converted to skill (api-architect)
  See: ~/.claude/skills/api-architect/SKILL.md
- ui_designer (2025-11-21): Converted to skill (ui-designer)
  See: ~/.claude/skills/ui-designer/SKILL.md

HYBRID (SUBAGENT + SKILL):
- code_writer (2025-11-23): Restored as subagent, kept skill
  Subagent: For delegation from AppGeneratorAgent (Task tool)
  Skill: For pattern teaching before generation (Skill tool)
  Rationale: AppGeneratorAgent needs dedicated delegation target for code implementation
  See: docs/CODE_WRITER_HYBRID_APPROACH.md
"""

from .research_agent import research_agent
# DEPRECATED: schema_designer converted to skill (2025-11-18)
# See: ~/.claude/skills/schema-designer/SKILL.md
# DEPRECATED: api_architect converted to skill (2025-11-18)
# See: ~/.claude/skills/api-architect/SKILL.md
# DEPRECATED: ui_designer converted to skill (2025-11-21)
# See: ~/.claude/skills/ui-designer/SKILL.md

# Active subagents (each in its own directory with co-located patterns)
from .code_writer import code_writer      # HYBRID - subagent + skill
from .quality_assurer import quality_assurer
from .error_fixer import error_fixer
from .ai_integration import ai_integration

__all__ = [
    "research_agent",
    # "schema_designer",  # DEPRECATED - use schema-designer skill
    # "api_architect",    # DEPRECATED - use api-architect skill
    "code_writer",      # HYBRID - subagent + skill
    # "ui_designer",      # DEPRECATED - use ui-designer skill
    "quality_assurer",
    "error_fixer",
    "ai_integration",
    "get_all_subagents",
    "get_subagent",
]

def get_all_subagents():
    """Get all available subagents as a dictionary."""
    return {
        "research_agent": research_agent,
        # "schema_designer": schema_designer,  # DEPRECATED - use schema-designer skill
        # "api_architect": api_architect,      # DEPRECATED - use api-architect skill
        "code_writer": code_writer,          # HYBRID - subagent + skill
        # "ui_designer": ui_designer,          # DEPRECATED - use ui-designer skill
        "quality_assurer": quality_assurer,
        "error_fixer": error_fixer,
        "ai_integration": ai_integration,
    }

def get_subagent(name: str):
    """Get a specific subagent by name."""
    agents = get_all_subagents()
    return agents.get(name)