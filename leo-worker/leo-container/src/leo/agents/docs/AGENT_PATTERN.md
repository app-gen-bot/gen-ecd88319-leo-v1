# THE Definitive Agent Pattern Guide

This is **THE** authoritative reference for creating and using agents in the Leonardo App Factory. Follow this pattern exactly to avoid architectural debt and integration issues.

## The Problem

**❌ WRONG: Creating Agents in Stages**
```python
# DON'T DO THIS - from design_system_stage.py
from ..agents.design_system.agent import DesignSystemAgent

async def run_stage(plan_path, output_dir):
    # Creating agent in stage = WRONG
    agent = DesignSystemAgent()
    result = await agent.run(user_prompt="...", cwd=str(output_dir))
```

**Problems with this approach:**
- Business logic mixed with infrastructure code
- No domain-specific methods
- Hard to test, maintain, and extend
- Violates separation of concerns
- Creates tight coupling between stages and agents

## The Solution: Three-Layer Agent Architecture

### Layer 1: Agent Wrapper Class
**File**: `agents/[agent_name]/agent.py`

```python
"""[Agent Name] Agent implementation."""

import logging
from pathlib import Path
from typing import Tuple
from cc_agent import Agent, AgentResult
from .config import AGENT_CONFIG
from .system_prompt import SYSTEM_PROMPT
from .user_prompt import create_user_prompt

logger = logging.getLogger(__name__)

class [AgentName]Agent:
    """Agent that [does specific domain task]."""
    
    def __init__(self, cwd: str = None):
        """Initialize the [Agent Name] Agent.
        
        Args:
            cwd: Working directory for the agent and its tools
        """
        # Use simplified MCP tool configuration
        self.agent = Agent(
            system_prompt=SYSTEM_PROMPT,
            mcp_tools=["oxc", "tree_sitter"],  # Tools specific to this agent
            cwd=cwd,
            **AGENT_CONFIG
        )
        self.verbose = True  # Enable verbose logging for debugging
    
    async def [domain_method](self, domain_params) -> Tuple[bool, str, str]:
        """[Domain-specific method that encapsulates the business logic].
        
        Args:
            domain_params: Domain-specific parameters
            
        Returns:
            Tuple of (success, result_data, message)
        """
        try:
            logger.info(f"🤖 {AGENT_CONFIG['name']}: Starting [task description]")
            
            # Create user prompt from domain parameters
            user_prompt = create_user_prompt(domain_params)
            
            # Run the agent - it handles file I/O via tools
            logger.info("🤖 Running agent...")
            result = await self.agent.run(user_prompt)
            
            if not result.success:
                error_msg = f"Agent failed: {result.content}"
                logger.error(f"❌ {error_msg}")
                return False, "", error_msg
            
            logger.info("✅ Task completed successfully")
            return True, result.content, "Task completed successfully"
            
        except Exception as e:
            error_msg = f"Task failed: {str(e)}"
            logger.error(f"❌ {error_msg}")
            return False, "", error_msg

# Convenience function for backward compatibility
async def run_[agent_name](cwd: str = None) -> Tuple[AgentResult, str]:
    """Convenience function to run the agent."""
    agent = [AgentName]Agent(cwd=cwd)
    success, result_data, message = await agent.[domain_method]()
    
    result = AgentResult(
        content=result_data if success else message,
        cost=0.0,  # TODO: Track actual cost from agent
        success=success
    )
    
    return result, result_data
```

### Layer 2: Configuration
**File**: `agents/[agent_name]/config.py`

```python
"""Configuration for [Agent Name] Agent."""

AGENT_CONFIG = {
    "name": "[Human Readable Agent Name]",
    "model": "opus",  # Use most capable model for complex tasks
    "allowed_tools": [
        # Core development tools
        "Write",
        "Read",
        "Edit",
        "MultiEdit",
        
        # MCP tools are auto-added by base Agent class:
        # - mcp__oxc (Ultra-fast TypeScript linting)  
        # - mcp__tree_sitter (AST analysis)
        # - mcp__build_test (Compilation verification)
        
        # Pattern searching for validation
        "Grep",
        "Glob",
    ],
    "max_turns": 10,  # Allow for validation cycles
    "permission_mode": "default"
}
```

### Layer 3: Prompts
**File**: `agents/[agent_name]/system_prompt.py`

```python
"""System prompt for [Agent Name] Agent."""

SYSTEM_PROMPT = """You are a [Domain] Agent specialized in [specific task].

## Your Role
[Detailed description of what this agent does and its expertise]

## Key Responsibilities
1. [Primary responsibility]
2. [Secondary responsibility] 
3. [Additional responsibilities]

## [Domain-Specific Guidelines]
[Detailed guidelines specific to this agent's domain]

## Implementation Process
1. [Step 1 of the process]
2. [Step 2 of the process]
3. [Step N of the process]

Focus on [key outcomes] while maintaining [quality standards]."""
```

**File**: `agents/[agent_name]/user_prompt.py`

```python
"""User prompt builders for [Agent Name] Agent."""

def create_user_prompt(domain_params) -> str:
    """Create user prompt from domain parameters.
    
    Args:
        domain_params: Domain-specific input parameters
        
    Returns:
        Formatted user prompt string
    """
    return f"""[Task description based on domain parameters]

Input: {domain_params}

[Specific instructions for this task]
[File locations and expected outputs]
[Quality requirements and validation criteria]"""
```

## Stage Integration Pattern

### ✅ CORRECT: How Stages Use Agents

**File**: `stages/[stage_name]_stage.py`

```python
"""[Stage Name] Stage - [Brief description]."""

from pathlib import Path
from typing import Tuple
from cc_agent import AgentResult

# Import agent wrapper class (not base Agent)
from ..agents.[agent_name] import [AgentName]Agent

async def run_stage(
    input_path: Path,
    output_dir: Path,
    **kwargs
) -> Tuple[AgentResult, str]:
    """Run the [Stage Name] stage.
    
    Args:
        input_path: Path to input file
        output_dir: Output directory for generated files
        **kwargs: Additional stage parameters
        
    Returns:
        Tuple of (AgentResult, summary_message)
    """
    try:
        # Read input if needed
        input_content = input_path.read_text()
        
        # Create agent instance with working directory
        agent = [AgentName]Agent(cwd=str(output_dir))
        
        # Call domain-specific method (not generic run())
        success, result_data, message = await agent.[domain_method](
            input_content=input_content,
            **kwargs
        )
        
        if success:
            return AgentResult(
                success=True,
                content=result_data,
                cost=0.0  # TODO: Track cost
            ), f"[Stage] completed: {message}"
        else:
            return AgentResult(
                success=False,
                content=message,
                cost=0.0
            ), f"[Stage] failed: {message}"
            
    except Exception as e:
        error_result = AgentResult(
            success=False,
            content=f"[Stage] stage failed: {str(e)}",
            cost=0.0
        )
        return error_result, f"Error: {str(e)}"
```

## MCP Tools Configuration (MODERN)

### ✅ CORRECT: Use mcp_tools
```python
# NEW: Simple tool list - registry handles configuration
self.agent = Agent(
    system_prompt=SYSTEM_PROMPT,
    mcp_tools=["oxc", "tree_sitter", "build_test"],  # Simple!
    cwd=cwd,
    **AGENT_CONFIG
)
```

### ❌ WRONG: Use mcp_servers  
```python
# OLD: Don't do this anymore
mcp_servers = {
    "oxc": {
        "command": "uv",
        "args": ["run", "python", "-m", "cc_tools.oxc.server"]
    }
}
```

### Available MCP Tools
- `oxc` - Ultra-fast TypeScript/JavaScript linting (50-100x faster than ESLint)
- `tree_sitter` - AST analysis for code structure understanding
- `build_test` - TypeScript compilation and testing verification
- `ruff` - Ultra-fast Python linting (10-150x faster than traditional linters)
- `heroicons` - React icon component generation
- `graphiti` - Knowledge graph integration
- `mem0` - Vector memory storage and retrieval

## Complete Example: Good vs Bad

### ❌ BAD: Current DesignSystemAgent Pattern

```python
# In design_system_stage.py - WRONG
from ..agents.design_system.agent import DesignSystemAgent

async def run_stage(plan_path, output_dir):
    # Creating agent in stage = BAD
    agent = DesignSystemAgent()
    
    # Building prompt in stage = BAD  
    result = await agent.run(
        user_prompt=f"""Customize the design system files...
        Plan: {plan_content}
        Template: {template_name}
        ...""",
        cwd=str(output_dir)
    )
```

### ✅ GOOD: SchemaGeneratorAgent Pattern

```python
# In schema_generator/agent.py - GOOD
class SchemaGeneratorAgent:
    def __init__(self, cwd: str = None):
        self.agent = Agent(
            system_prompt=SYSTEM_PROMPT,
            mcp_tools=["oxc", "tree_sitter"],
            cwd=cwd,
            **AGENT_CONFIG
        )
    
    async def generate_schema(self, previous_critic_xml: str = "") -> Tuple[bool, str, str]:
        """Domain-specific method with clear interface."""
        user_prompt = create_user_prompt(previous_critic_xml=previous_critic_xml)
        result = await self.agent.run(user_prompt)
        # Handle result and return structured response
```

```python
# In build_stage.py - GOOD
from ..agents.schema_generator import SchemaGeneratorAgent

async def run_stage():
    # Create agent with cwd
    agent = SchemaGeneratorAgent(cwd=cwd)
    
    # Call domain method
    success, result_data, message = await agent.generate_schema()
```

## Anti-Patterns to Avoid

### ❌ DON'T: Create Agent in Stage
```python
# NEVER DO THIS
from cc_agent import Agent

async def run_stage():
    agent = Agent(system_prompt="...", mcp_tools=["..."])  # WRONG
```

### ❌ DON'T: Build Prompts in Stage
```python
# NEVER DO THIS
async def run_stage():
    user_prompt = f"Complex prompt with {variables}..."  # WRONG
    result = await agent.run(user_prompt)
```

### ❌ DON'T: Use Old MCP Configuration
```python
# NEVER DO THIS
mcp_servers = {"tool": {"command": "...", "args": ["..."]}}  # WRONG
```

### ❌ DON'T: Mix Business Logic in Stage
```python
# NEVER DO THIS
async def run_stage():
    # Complex business logic in stage = WRONG
    if condition:
        template = select_template(...)
        tokens = load_tokens(...)
    # This belongs in the agent
```

## File Structure Template

```
agents/[agent_name]/
├── __init__.py
├── agent.py              # Wrapper class with domain methods
├── config.py             # Agent configuration
├── system_prompt.py      # Agent behavior definition
├── user_prompt.py        # Prompt building functions
├── docs/                 # Agent-specific documentation
│   └── [agent_name].md   # Usage guide and examples
└── critic/               # If agent has critic pattern
    ├── __init__.py
    ├── agent.py
    ├── config.py
    ├── system_prompt.py
    └── user_prompt.py
```

## Checklist for New Agents

- [ ] Created wrapper class extending base Agent
- [ ] Used mcp_tools (not mcp_servers) configuration  
- [ ] Separated configuration into config.py
- [ ] Created system_prompt.py with agent behavior
- [ ] Created user_prompt.py with prompt builders
- [ ] Added domain-specific methods (not just run())
- [ ] Stage imports wrapper class (not base Agent)
- [ ] Stage calls domain methods (not generic run())
- [ ] No business logic in stage file
- [ ] No prompt building in stage file

## Reference Implementations

- **✅ SchemaGeneratorAgent** - Perfect example of the pattern
- **✅ PreviewGeneratorAgent** - Good domain method design
- **✅ StorageGeneratorAgent** - Clean separation of concerns
- **❌ DesignSystemAgent** - Needs refactoring (anti-pattern example)

Follow the good examples, avoid the anti-patterns, and you'll never need this explanation again.

## Need Help?

1. Copy an existing good agent (SchemaGeneratorAgent recommended)
2. Follow the three-layer pattern exactly
3. Use mcp_tools configuration
4. Create domain-specific methods
5. Keep stages simple and clean

**Remember**: Agents handle the "how", stages handle the "what". Keep them separated.