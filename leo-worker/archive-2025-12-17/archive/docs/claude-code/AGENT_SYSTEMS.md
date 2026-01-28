# Multi-Sequential Agent Systems with Claude Code SDK

This document provides comprehensive guidance for building multi-sequential agent agentic systems using the Claude Code Python SDK.

## Table of Contents

1. [Introduction](#introduction)
2. [Core Concepts](#core-concepts)
3. [Architecture Patterns](#architecture-patterns)
4. [Complete Code Examples](#complete-code-examples)
5. [Advanced Patterns](#advanced-patterns)
6. [Best Practices](#best-practices)
7. [Additional Resources](#additional-resources)

## Introduction

The Claude Code SDK enables building sophisticated multi-agent systems where multiple Claude instances can work together sequentially or in parallel to accomplish complex tasks. The SDK's async architecture and rich tool ecosystem make it ideal for orchestrating agent workflows.

### Key Features for Agent Systems

- **Agent Tool**: Spawn sub-agents for delegated tasks
- **Async/Await**: Native support for concurrent agent execution
- **Tool Specialization**: Configure agents with specific capabilities
- **Message Streaming**: Real-time inter-agent communication
- **State Management**: Conversation continuation and resumption
- **Permission Control**: Fine-grained tool access management

## Core Concepts

### 1. Agent Hierarchy

Agents can spawn sub-agents using the `Agent` tool, creating hierarchical structures:

```python
# Parent agent can delegate to child agents
options = ClaudeCodeOptions(
    allowed_tools=["Agent"],  # Parent can spawn sub-agents
    system_prompt="You are a project manager that delegates tasks"
)
```

### 2. Message Flow

The SDK provides typed message objects for agent communication:

```python
from claude_code_sdk import (
    UserMessage,      # Input from user
    AssistantMessage, # Agent responses
    SystemMessage,    # System metadata
    ResultMessage,    # Completion status
    TextBlock,        # Text content
    ToolUseBlock,     # Tool invocations
    ToolResultBlock   # Tool results
)
```

### 3. Tool Orchestration

Available tools for agents (from the SDK):

- **Agent**: Run sub-agents for complex tasks
- **Bash**: Execute shell commands
- **Read/Write**: File operations
- **Edit/MultiEdit**: File modifications
- **Glob/Grep/LS**: File system navigation
- **TodoRead/TodoWrite**: Task management
- **WebFetch/WebSearch**: Web access
- **NotebookRead/NotebookEdit**: Jupyter support

### 4. Permission Modes

Control tool execution behavior:

```python
PermissionMode = Literal[
    "default",           # CLI prompts for dangerous tools
    "acceptEdits",       # Auto-accept file edits
    "bypassPermissions"  # Allow all tools (use with caution)
]
```

## Architecture Patterns

### 1. Sequential Agent Chain

Agents execute one after another, passing results forward:

```python
import anyio
from claude_code_sdk import query, ClaudeCodeOptions, AssistantMessage, TextBlock

async def sequential_agent_chain():
    """Execute agents sequentially with data passing."""
    
    # Agent 1: Research
    research_result = ""
    options1 = ClaudeCodeOptions(
        allowed_tools=["WebSearch", "WebFetch"],
        system_prompt="You are a research agent. Find information and summarize it."
    )
    
    async for message in query(
        prompt="Research the latest Python async patterns",
        options=options1
    ):
        if isinstance(message, AssistantMessage):
            for block in message.content:
                if isinstance(block, TextBlock):
                    research_result += block.text
    
    # Agent 2: Code Generation
    code_result = ""
    options2 = ClaudeCodeOptions(
        allowed_tools=["Write"],
        system_prompt="You are a code generation agent. Create examples based on research."
    )
    
    async for message in query(
        prompt=f"Based on this research, create code examples:\n{research_result}",
        options=options2
    ):
        if isinstance(message, AssistantMessage):
            for block in message.content:
                if isinstance(block, TextBlock):
                    code_result += block.text
    
    # Agent 3: Documentation
    options3 = ClaudeCodeOptions(
        allowed_tools=["Write"],
        system_prompt="You are a documentation agent. Create clear docs."
    )
    
    async for message in query(
        prompt=f"Document these code examples:\n{code_result}",
        options=options3
    ):
        # Process documentation
        pass
```

### 2. Parallel Agent Pool

Execute multiple agents concurrently:

```python
async def parallel_agent_pool():
    """Run multiple agents in parallel."""
    
    async def run_agent(task: str, tools: list[str]) -> str:
        """Run a single agent with specific tools."""
        result = ""
        options = ClaudeCodeOptions(
            allowed_tools=tools,
            permission_mode="acceptEdits"
        )
        
        async for message in query(prompt=task, options=options):
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        result += block.text
        return result
    
    # Define parallel tasks
    tasks = [
        ("Analyze codebase structure", ["Read", "Glob", "LS"]),
        ("Check for security issues", ["Read", "Grep"]),
        ("Generate test cases", ["Read", "Write"]),
        ("Update documentation", ["Read", "Write", "Edit"])
    ]
    
    # Execute all agents concurrently
    async with anyio.create_task_group() as tg:
        results = []
        for task, tools in tasks:
            tg.start_soon(lambda t=task, tl=tools: results.append(run_agent(t, tl)))
    
    return results
```

### 3. Hierarchical Agent Tree

Agents spawn sub-agents for specialized tasks:

```python
async def hierarchical_agent_tree():
    """Create a tree of agents with parent-child relationships."""
    
    # Root coordinator agent
    coordinator_options = ClaudeCodeOptions(
        allowed_tools=["Agent", "TodoWrite", "TodoRead"],
        system_prompt="""You are a project coordinator. Break down complex tasks 
        and delegate to specialized agents.""",
        max_turns=5
    )
    
    prompt = """
    Create a full-stack web application with:
    1. Backend API (Python FastAPI)
    2. Frontend (React)
    3. Database schema (PostgreSQL)
    4. Docker deployment
    
    Use the Agent tool to delegate each component to specialized agents.
    """
    
    async for message in query(prompt=prompt, options=coordinator_options):
        # Coordinator will spawn sub-agents for each component
        if isinstance(message, AssistantMessage):
            print("Coordinator:", message)
```

### 4. Agent Pipeline with State

Maintain state across agent executions:

```python
from dataclasses import dataclass
from typing import Dict, Any

@dataclass
class AgentState:
    """Shared state between agents."""
    data: Dict[str, Any]
    session_id: str
    completed_tasks: list[str]

async def stateful_agent_pipeline():
    """Pipeline with persistent state across agents."""
    
    # Initialize shared state
    state = AgentState(
        data={},
        session_id="pipeline-001",
        completed_tasks=[]
    )
    
    # Agent 1: Initialize project
    init_options = ClaudeCodeOptions(
        allowed_tools=["Write", "Bash"],
        system_prompt="Initialize a new Python project"
    )
    
    async for message in query(
        prompt="Create a new Python project structure with pyproject.toml",
        options=init_options
    ):
        if isinstance(message, ResultMessage):
            state.completed_tasks.append("project_init")
            state.data["project_path"] = "/workspace/new_project"
    
    # Agent 2: Add dependencies (using state from Agent 1)
    deps_options = ClaudeCodeOptions(
        allowed_tools=["Edit", "Bash"],
        cwd=state.data.get("project_path"),  # Use path from state
        system_prompt="Manage Python dependencies"
    )
    
    async for message in query(
        prompt="Add FastAPI, SQLAlchemy, and Pydantic to the project",
        options=deps_options
    ):
        if isinstance(message, ResultMessage):
            state.completed_tasks.append("dependencies")
```

## Complete Code Examples

### Example 1: Multi-Agent Code Review System

```python
#!/usr/bin/env python3
"""Multi-agent code review system."""

import anyio
from pathlib import Path
from claude_code_sdk import (
    query, ClaudeCodeOptions, AssistantMessage, 
    TextBlock, ToolUseBlock, ResultMessage
)

async def code_review_system(file_path: str):
    """Perform comprehensive code review using multiple specialized agents."""
    
    reviews = {}
    
    # Agent 1: Security Reviewer
    security_options = ClaudeCodeOptions(
        allowed_tools=["Read", "Grep"],
        system_prompt="""You are a security expert. Review code for:
        - SQL injection vulnerabilities
        - XSS vulnerabilities  
        - Hardcoded secrets
        - Insecure dependencies"""
    )
    
    async for message in query(
        prompt=f"Review {file_path} for security issues",
        options=security_options
    ):
        if isinstance(message, AssistantMessage):
            reviews["security"] = extract_text(message)
    
    # Agent 2: Performance Reviewer
    perf_options = ClaudeCodeOptions(
        allowed_tools=["Read"],
        system_prompt="""You are a performance expert. Review code for:
        - Inefficient algorithms
        - Memory leaks
        - Unnecessary computations
        - Database query optimization"""
    )
    
    async for message in query(
        prompt=f"Review {file_path} for performance issues",
        options=perf_options
    ):
        if isinstance(message, AssistantMessage):
            reviews["performance"] = extract_text(message)
    
    # Agent 3: Style Reviewer
    style_options = ClaudeCodeOptions(
        allowed_tools=["Read"],
        system_prompt="""You are a code style expert. Review for:
        - PEP 8 compliance
        - Naming conventions
        - Code organization
        - Documentation quality"""
    )
    
    async for message in query(
        prompt=f"Review {file_path} for style issues",
        options=style_options
    ):
        if isinstance(message, AssistantMessage):
            reviews["style"] = extract_text(message)
    
    # Agent 4: Report Generator
    report_options = ClaudeCodeOptions(
        allowed_tools=["Write"],
        system_prompt="You are a technical writer. Create clear, actionable reports."
    )
    
    report_prompt = f"""
    Create a comprehensive code review report for {file_path}:
    
    Security Review: {reviews.get('security', 'No issues found')}
    Performance Review: {reviews.get('performance', 'No issues found')}
    Style Review: {reviews.get('style', 'No issues found')}
    
    Format as markdown with priorities and action items.
    """
    
    async for message in query(prompt=report_prompt, options=report_options):
        if isinstance(message, ResultMessage):
            print(f"Review complete. Cost: ${message.total_cost_usd:.4f}")
    
    return reviews

def extract_text(message: AssistantMessage) -> str:
    """Extract text from assistant message."""
    text = ""
    for block in message.content:
        if isinstance(block, TextBlock):
            text += block.text + "\n"
    return text.strip()

# Run the review system
if __name__ == "__main__":
    anyio.run(code_review_system, "src/main.py")
```

### Example 2: Autonomous Project Generator

```python
#!/usr/bin/env python3
"""Autonomous project generator using agent hierarchy."""

import anyio
import json
from claude_code_sdk import query, ClaudeCodeOptions, AssistantMessage

async def generate_project(project_spec: dict):
    """Generate a complete project using multiple specialized agents."""
    
    # Master Architect Agent
    architect_options = ClaudeCodeOptions(
        allowed_tools=["Agent", "Write", "TodoWrite", "TodoRead"],
        system_prompt="""You are a software architect. Design the project structure
        and delegate implementation to specialized agents.""",
        permission_mode="acceptEdits",
        max_turns=10
    )
    
    architect_prompt = f"""
    Create a project based on this specification:
    {json.dumps(project_spec, indent=2)}
    
    Use the Agent tool to delegate:
    1. Backend implementation to a backend specialist
    2. Frontend implementation to a frontend specialist  
    3. Database design to a database specialist
    4. Testing to a QA specialist
    5. Documentation to a technical writer
    
    Coordinate the work and ensure all components integrate properly.
    """
    
    async for message in query(prompt=architect_prompt, options=architect_options):
        # The architect agent will spawn and coordinate sub-agents
        if isinstance(message, AssistantMessage):
            print("Architect:", extract_text(message))

# Example usage
project_spec = {
    "name": "TaskFlow",
    "type": "web_application",
    "description": "A task management system with real-time collaboration",
    "tech_stack": {
        "backend": "Python FastAPI",
        "frontend": "React with TypeScript",
        "database": "PostgreSQL",
        "cache": "Redis",
        "deployment": "Docker + Kubernetes"
    },
    "features": [
        "User authentication",
        "Real-time updates",
        "Task assignments",
        "File attachments",
        "Email notifications"
    ]
}

if __name__ == "__main__":
    anyio.run(generate_project, project_spec)
```

### Example 3: Iterative Refinement Pipeline

```python
#!/usr/bin/env python3
"""Iterative refinement using multiple agent passes."""

import anyio
from claude_code_sdk import query, ClaudeCodeOptions, ResultMessage

async def iterative_refinement(initial_code: str, max_iterations: int = 3):
    """Refine code through multiple agent iterations."""
    
    current_code = initial_code
    iteration_history = []
    
    for i in range(max_iterations):
        print(f"\n--- Iteration {i+1} ---")
        
        # Analyzer Agent
        analyzer_options = ClaudeCodeOptions(
            allowed_tools=["Read"],
            system_prompt="""Analyze code and identify specific improvements for:
            - Performance optimization
            - Error handling
            - Code clarity
            - Edge cases"""
        )
        
        analysis = ""
        async for message in query(
            prompt=f"Analyze this code and suggest improvements:\n```python\n{current_code}\n```",
            options=analyzer_options
        ):
            if isinstance(message, AssistantMessage):
                analysis = extract_text(message)
        
        # Refactoring Agent
        refactor_options = ClaudeCodeOptions(
            allowed_tools=["Write"],
            system_prompt="You are a refactoring expert. Implement the suggested improvements.",
            permission_mode="acceptEdits"
        )
        
        async for message in query(
            prompt=f"Refactor based on this analysis:\n{analysis}\n\nCode:\n```python\n{current_code}\n```",
            options=refactor_options
        ):
            if isinstance(message, AssistantMessage):
                # Extract new code from response
                current_code = extract_code(message)
        
        # Testing Agent
        test_options = ClaudeCodeOptions(
            allowed_tools=["Write", "Bash"],
            system_prompt="You are a QA engineer. Write and run tests.",
            permission_mode="acceptEdits"
        )
        
        test_results = ""
        async for message in query(
            prompt=f"Write unit tests for:\n```python\n{current_code}\n```",
            options=test_options
        ):
            if isinstance(message, ResultMessage):
                iteration_history.append({
                    "iteration": i + 1,
                    "analysis": analysis,
                    "code": current_code,
                    "cost": message.total_cost_usd
                })
    
    return current_code, iteration_history

def extract_code(message: AssistantMessage) -> str:
    """Extract code from message (simplified)."""
    text = extract_text(message)
    # In practice, parse code blocks properly
    return text

# Example usage
initial_code = '''
def process_data(data):
    result = []
    for item in data:
        if item > 0:
            result.append(item * 2)
    return result
'''

if __name__ == "__main__":
    final_code, history = anyio.run(iterative_refinement, initial_code)
    print(f"\nFinal refined code:\n{final_code}")
```

## Advanced Patterns

### 1. Agent Communication Protocol

Implement structured communication between agents:

```python
from dataclasses import dataclass
from typing import Any, Optional
import json

@dataclass
class AgentMessage:
    """Structured message for inter-agent communication."""
    from_agent: str
    to_agent: str
    message_type: str  # "request", "response", "error"
    payload: dict[str, Any]
    correlation_id: str
    timestamp: float

class AgentCommunicator:
    """Manages communication between agents."""
    
    def __init__(self):
        self.message_queue: list[AgentMessage] = []
        self.agents: dict[str, ClaudeCodeOptions] = {}
    
    async def register_agent(self, name: str, options: ClaudeCodeOptions):
        """Register an agent with the communicator."""
        self.agents[name] = options
    
    async def send_message(self, message: AgentMessage):
        """Send a message to an agent."""
        self.message_queue.append(message)
        
        # Process message with target agent
        if message.to_agent in self.agents:
            options = self.agents[message.to_agent]
            prompt = f"""
            You received a message:
            Type: {message.message_type}
            From: {message.from_agent}
            Payload: {json.dumps(message.payload)}
            
            Process and respond appropriately.
            """
            
            async for response in query(prompt=prompt, options=options):
                # Handle response
                pass
```

### 2. Cost-Optimized Agent Orchestration

Minimize costs by strategic agent deployment:

```python
async def cost_optimized_pipeline(task: str):
    """Run agents with cost optimization strategies."""
    
    # Phase 1: Quick analysis with limited tools
    quick_options = ClaudeCodeOptions(
        allowed_tools=["Read"],  # Minimal tools
        max_thinking_tokens=1000,  # Limit thinking
        max_turns=1  # Single turn
    )
    
    needs_deep_analysis = False
    async for message in query(
        prompt=f"Quick analysis: does this task require complex processing? {task}",
        options=quick_options
    ):
        if isinstance(message, AssistantMessage):
            # Parse response to determine complexity
            response = extract_text(message).lower()
            needs_deep_analysis = "complex" in response or "difficult" in response
    
    if needs_deep_analysis:
        # Phase 2: Deep analysis with full capabilities
        deep_options = ClaudeCodeOptions(
            allowed_tools=["Agent", "Read", "Write", "Bash", "WebSearch"],
            max_thinking_tokens=8000,
            permission_mode="acceptEdits"
        )
        
        async for message in query(prompt=task, options=deep_options):
            # Process complex task
            pass
    else:
        # Phase 2: Simple processing
        simple_options = ClaudeCodeOptions(
            allowed_tools=["Write"],
            max_turns=2
        )
        
        async for message in query(prompt=task, options=simple_options):
            # Process simple task
            pass
```

### 3. Error Recovery and Resilience

Build robust agent systems with error handling:

```python
from claude_code_sdk import (
    ClaudeSDKError, CLIConnectionError, 
    ProcessError, CLIJSONDecodeError
)

async def resilient_agent_execution(task: str, max_retries: int = 3):
    """Execute agent with automatic retry and fallback."""
    
    for attempt in range(max_retries):
        try:
            options = ClaudeCodeOptions(
                allowed_tools=["Read", "Write"],
                permission_mode="acceptEdits"
            )
            
            async for message in query(prompt=task, options=options):
                # Process normally
                if isinstance(message, ResultMessage):
                    return message
                    
        except CLIConnectionError:
            print(f"Connection error on attempt {attempt + 1}")
            if attempt < max_retries - 1:
                await anyio.sleep(2 ** attempt)  # Exponential backoff
                continue
            else:
                # Fallback to limited agent
                return await fallback_agent(task)
                
        except ProcessError as e:
            print(f"Process error: {e.exit_code}")
            # Try with different options
            options.allowed_tools = ["Read"]  # Limit tools
            
        except CLIJSONDecodeError:
            print("JSON decode error - trying with simplified prompt")
            task = simplify_prompt(task)

async def fallback_agent(task: str):
    """Minimal fallback agent for error scenarios."""
    options = ClaudeCodeOptions(
        allowed_tools=[],  # No tools
        max_turns=1,
        system_prompt="Provide a simple response without using tools"
    )
    
    async for message in query(prompt=task, options=options):
        return message
```

### 4. Performance Monitoring

Track and optimize agent performance:

```python
import time
from collections import defaultdict

class AgentPerformanceMonitor:
    """Monitor agent performance metrics."""
    
    def __init__(self):
        self.metrics = defaultdict(lambda: {
            "total_time": 0.0,
            "total_cost": 0.0,
            "execution_count": 0,
            "errors": 0,
            "tool_usage": defaultdict(int)
        })
    
    async def monitor_agent(self, agent_name: str, task: str, options: ClaudeCodeOptions):
        """Execute agent with performance monitoring."""
        start_time = time.time()
        agent_metrics = self.metrics[agent_name]
        
        try:
            async for message in query(prompt=task, options=options):
                # Track tool usage
                if isinstance(message, AssistantMessage):
                    for block in message.content:
                        if isinstance(block, ToolUseBlock):
                            agent_metrics["tool_usage"][block.name] += 1
                
                # Track completion
                if isinstance(message, ResultMessage):
                    agent_metrics["total_time"] += time.time() - start_time
                    agent_metrics["total_cost"] += message.total_cost_usd or 0
                    agent_metrics["execution_count"] += 1
                    
        except Exception as e:
            agent_metrics["errors"] += 1
            raise
    
    def get_report(self) -> dict:
        """Generate performance report."""
        report = {}
        for agent_name, metrics in self.metrics.items():
            if metrics["execution_count"] > 0:
                report[agent_name] = {
                    "avg_time": metrics["total_time"] / metrics["execution_count"],
                    "avg_cost": metrics["total_cost"] / metrics["execution_count"],
                    "total_executions": metrics["execution_count"],
                    "error_rate": metrics["errors"] / metrics["execution_count"],
                    "most_used_tools": sorted(
                        metrics["tool_usage"].items(), 
                        key=lambda x: x[1], 
                        reverse=True
                    )[:5]
                }
        return report
```

## Best Practices

### 1. Security Considerations

- **Tool Permissions**: Always use the most restrictive tool set necessary
- **Input Validation**: Validate all inputs before passing to agents
- **Secrets Management**: Never pass secrets directly in prompts
- **Audit Logging**: Log all agent actions for security audits

```python
# Good: Restricted tools
secure_options = ClaudeCodeOptions(
    allowed_tools=["Read"],  # Read-only access
    disallowed_tools=["Bash"],  # Explicitly disallow
    permission_mode="default"  # Require user confirmation
)

# Bad: Overly permissive
insecure_options = ClaudeCodeOptions(
    allowed_tools=["Bash", "Write"],
    permission_mode="bypassPermissions"  # Dangerous!
)
```

### 2. Cost Management

- **Token Limits**: Set appropriate `max_thinking_tokens`
- **Turn Limits**: Use `max_turns` to prevent runaway agents
- **Tool Selection**: Minimize expensive tool usage
- **Batch Operations**: Group related tasks

### 3. Debugging Multi-Agent Systems

```python
import logging

# Configure logging for agent debugging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

async def debug_agent(name: str, task: str, options: ClaudeCodeOptions):
    """Wrapper for debugging agent execution."""
    logger = logging.getLogger(f"agent.{name}")
    
    logger.info(f"Starting agent with task: {task[:100]}...")
    logger.debug(f"Options: {options}")
    
    message_count = 0
    async for message in query(prompt=task, options=options):
        message_count += 1
        logger.debug(f"Message {message_count}: {type(message).__name__}")
        
        if isinstance(message, AssistantMessage):
            for block in message.content:
                if isinstance(block, ToolUseBlock):
                    logger.info(f"Tool use: {block.name} with {block.input}")
        
        elif isinstance(message, ResultMessage):
            logger.info(f"Completed - Cost: ${message.total_cost_usd:.4f}")
```

### 4. State Management Best Practices

- **Immutable State**: Treat state as immutable between agents
- **State Versioning**: Version state for rollback capability
- **Persistence**: Save state for long-running workflows
- **Clean Handoffs**: Ensure clear state contracts between agents

## Additional Resources

### SDK Documentation
- [Claude Code SDK Documentation](https://docs.anthropic.com/en/docs/claude-code/sdk)
- [API Reference](src/claude_code_sdk/types.py)
- [Examples Directory](examples/)

### Related Tools and Concepts
- **MCP (Model Communication Protocol)**: For custom tool integration
- **Async Programming**: [Python asyncio documentation](https://docs.python.org/3/library/asyncio.html)
- **anyio**: [anyio documentation](https://anyio.readthedocs.io/)

### Environment Setup

```bash
# Install the SDK
pip install claude-code-sdk

# Install with development dependencies
pip install -e ".[dev]"

# Required: Install Claude Code CLI
npm install -g @anthropic-ai/claude-code
```

### Quick Reference

```python
# Import everything you need
from claude_code_sdk import (
    query,
    ClaudeCodeOptions,
    AssistantMessage,
    UserMessage,
    SystemMessage,
    ResultMessage,
    TextBlock,
    ToolUseBlock,
    ToolResultBlock,
    ClaudeSDKError,
    CLIConnectionError,
    CLINotFoundError,
    ProcessError,
    CLIJSONDecodeError
)

# Basic agent configuration
options = ClaudeCodeOptions(
    # Core settings
    system_prompt="Agent role and behavior",
    max_turns=5,
    model="claude-3-5-haiku-latest",  # Optional model selection
    
    # Tool configuration
    allowed_tools=["Read", "Write", "Agent"],
    disallowed_tools=["Bash"],
    permission_mode="acceptEdits",
    
    # Advanced settings
    max_thinking_tokens=8000,
    cwd="/workspace",
    continue_conversation=False,
    resume="session-id",  # Resume previous session
    
    # MCP integration
    mcp_tools=["custom-tool"],
    mcp_servers={
        "my-server": {
            "command": "my-mcp-server",
            "args": ["--port", "3000"]
        }
    }
)
```

This document provides a comprehensive foundation for building multi-sequential agent systems with the Claude Code SDK. The patterns and examples can be adapted and combined to create sophisticated agent architectures for your specific needs.