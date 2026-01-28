# Context Awareness Module - Technical Documentation

This module implements the context awareness capabilities for AI agents, enabling automatic memory management, session continuity, and intelligent context loading.

## Module Structure

```
context/
├── __init__.py          # Module exports
├── context_aware.py     # Main ContextAwareAgent class
├── memory_formatter.py  # Content transformation utilities
└── README.md           # This file
```

## Core Components

### 1. ContextAwareAgent

The main agent class that extends the base Agent with context awareness capabilities.

```python
from cc_agent.context import ContextAwareAgent

agent = ContextAwareAgent(
    name="Dev Assistant",
    system_prompt="You help with development",
    cwd="/workspace",
    permission_mode="bypassPermissions",
    enable_context_awareness=True  # Default: True
)
```

#### Key Features

1. **Automatic MCP Configuration**
   - Automatically includes mem0 and tree-sitter tools
   - No manual MCP setup required
   - Handles tool initialization

2. **Enhanced System Prompt**
   - Injects context awareness instructions
   - Guides content transformation
   - Ensures proper memory storage

3. **Session Tracking**
   - Tracks session start/end times
   - Records modifications and decisions
   - Enables session handoffs

#### Constructor Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| name | str | required | Agent name |
| system_prompt | str | required | Base system prompt |
| allowed_tools | List[str] | None | Additional tools to allow |
| permission_mode | str | "default" | Permission handling mode (acceptEdits, bypassPermissions, default, plan) |
| cwd | str | None | Working directory |
| verbose | bool | True | Enable verbose logging |
| enable_context_awareness | bool | True | Enable context features |

### 2. MemoryFormatter

Utility class for transforming various content types into mem0-compatible descriptions.

```python
from cc_agent.context import MemoryFormatter

# Transform code snippet
content, context = MemoryFormatter.format_code_snippet(
    code="def auth(token): return jwt.verify(token)",
    language="python",
    purpose="user authentication"
)
# Returns: ("Authentication function 'auth' implements JWT token verification for user authentication", "function:auth")
```

#### Available Methods

##### format_code_snippet
```python
@staticmethod
def format_code_snippet(
    code: str,
    language: str = "python",
    purpose: Optional[str] = None
) -> Tuple[str, str]
```
Transforms code into architectural description.

##### format_architecture_decision
```python
@staticmethod
def format_architecture_decision(
    decision: str,
    rationale: str,
    alternatives: Optional[List[str]] = None
) -> Tuple[str, str]
```
Formats architectural decisions with context.

##### format_api_endpoint
```python
@staticmethod
def format_api_endpoint(
    method: str,
    path: str,
    description: str,
    params: Optional[Dict] = None
) -> Tuple[str, str]
```
Formats API endpoint information.

##### format_database_schema
```python
@staticmethod
def format_database_schema(
    table_name: str,
    columns: Dict[str, str],
    relationships: Optional[List[str]] = None
) -> Tuple[str, str]
```
Formats database schema information.

##### format_configuration
```python
@staticmethod
def format_configuration(
    config_type: str,
    settings: Dict[str, Any],
    purpose: str
) -> Tuple[str, str]
```
Formats configuration details.

##### suggest_context
```python
@staticmethod
def suggest_context(content: str) -> str
```
Suggests appropriate context based on content.

### 3. Enhanced System Prompt

The `CONTEXT_AWARENESS_PROMPT` constant provides detailed instructions for agents:

#### Key Instructions

1. **Memory Transformation Rules**
   - Code → Architecture Description
   - Configuration → Design Decision
   - Implementation → Pattern & Rationale

2. **Context Patterns**
   - `architecture:*` - High-level design decisions
   - `implementation:*` - Specific implementation details
   - `decision:*` - Technical choices and trade-offs
   - `pattern:*` - Design patterns used
   - `integration:*` - Service integrations
   - `file:*` - File-specific memories
   - `function:*` - Function-specific memories
   - `class:*` - Class-specific memories

3. **Good vs Bad Memories**
   ```python
   # ✅ GOOD - Will be stored
   "Authentication service validates JWT tokens using RSA-256 algorithm with 24-hour expiration"
   
   # ❌ BAD - Will be rejected
   "def auth(): return jwt.verify(token)"
   ```

## Integration with MCP Tools

### Automatic MCP Configuration

The ContextAwareAgent automatically configures these MCP servers:

```python
self.mcp_config = {
    "mem0": {
        "command": "mcp-mem0"
    },
    "tree_sitter": {
        "command": "mcp-server-tree-sitter"
    }
}
```

### Using the Agent

Always pass the MCP configuration when running:

```python
result = await agent.run(
    "Implement user authentication",
    mcp_servers=agent.mcp_config,  # Required!
    model="claude-3-5-sonnet-20241022"
)
```

## Memory Storage Mechanics

### How mem0 Filters Content

mem0 has selective content filtering that rejects:
- Raw code snippets
- Simple text without context
- Generic descriptions
- TODO comments

### Automatic Transformation

The agent automatically transforms content:

1. **Detection**: Agent identifies code/config in input
2. **Transformation**: Converts to meaningful description
3. **Context Assignment**: Adds appropriate context pattern
4. **Storage**: Sends to mem0 for vector storage

### Graph Relationships

When content is stored, graph nodes are created:

```cypher
// Memory node
CREATE (m:Memory {
    id: "uuid",
    content: "transformed content",
    context: "pattern:type",
    timestamp: "ISO"
})

// Related entities
CREATE (f:Function {name: "auth"})
CREATE (m)-[:DESCRIBES]->(f)
```

## Session Management

### Session Tracking

The agent tracks:
- Session start/end times
- Files modified
- Decisions made
- TODOs completed

### Session Persistence

Session data is stored in:
```
<cwd>/.agent_context/session_YYYYMMDD_HHMMSS.json
```

### Future: Automatic Handoffs

Coming in Phase 3:
- Automatic session summaries
- Context compression
- Seamless continuity

## Best Practices

### 1. Content Guidelines

Always provide context and rationale:
```python
# Good
"Implemented JWT authentication with RSA-256 because we need stateless auth for microservices"

# Bad
"Added authentication"
```

### 2. Use Consistent Contexts

Stick to established patterns:
```python
# Good
"architecture:microservices"
"decision:database:postgresql"
"pattern:repository:user"

# Bad
"misc:auth"
"random_context"
```

### 3. Let the Agent Work

Don't try to format for mem0:
```python
# Good - Let agent transform
"Here's the auth function: def auth(token): ..."

# Bad - Don't pre-format
"Architecture: Authentication function using JWT"
```

## Troubleshooting

### Memories Not Storing

1. Check content is meaningful
2. Verify OpenAI API key is set
3. Ensure services are running
4. Check logs: `cc-tools/logs/mem0_server.log`

### Context Not Loading

1. Verify MCP servers configured
2. Check previous memories exist
3. Ensure consistent user_id
4. Review context patterns used

## Future Enhancements

### Phase 2: Tree-sitter Integration
- Deep AST analysis
- Automatic code structure extraction
- Pattern detection

### Phase 3: Context Manager
- Intelligent tool orchestration
- Automatic session handoffs
- Predictive context loading

### Phase 4: Graphiti
- Advanced relationship analysis
- Pattern recognition
- Impact prediction

### Phase 5: Full Automation
- Zero manual intervention
- Predictive capabilities
- Seamless operation

## API Reference

### ContextAwareAgent Methods

#### run()
```python
async def run(
    self,
    user_prompt: str,
    mcp_servers: Optional[Dict[str, Dict[str, Any]]] = None,
    **kwargs
) -> AgentResult
```
Main execution method with automatic context management.

#### track_file_modification()
```python
def track_file_modification(
    self,
    file_path: str,
    operation: str,
    reason: str
) -> None
```
Track file changes for session history.

#### track_decision()
```python
def track_decision(
    self,
    decision: str,
    rationale: str,
    alternatives: Optional[List[str]] = None
) -> None
```
Track architectural decisions.

#### track_todo_completion()
```python
def track_todo_completion(
    self,
    todo: str
) -> None
```
Track completed tasks.

### MemoryFormatter Methods

See class documentation above for all available formatting methods.

## Contributing

When extending this module:

1. Maintain backward compatibility
2. Add comprehensive tests
3. Update documentation
4. Follow established patterns
5. Consider mem0's content filtering

## References

- [mem0 Documentation](https://mem0.ai/docs)
- [MCP Specification](https://github.com/anthropics/mcp)
- [Context Awareness Architecture](/docs/context-awareness-architecture.md)
- [Implementation Plan](/docs/context-awareness-implementation-plan.md)