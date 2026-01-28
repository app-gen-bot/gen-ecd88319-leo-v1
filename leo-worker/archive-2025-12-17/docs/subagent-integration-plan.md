# Subagent Integration Plan - How It Actually Works

## Research Summary (October 15, 2025)

Based on official Claude Code documentation and testing, here's the comprehensive plan for integrating subagents with AppGeneratorAgent.

## Key Discoveries

### 1. ✅ Task Tool is Already Available

**Status**: The Task tool is **already in our allowed_tools** list (config.py:23)

```python
"allowed_tools": [
    # ... other tools ...
    "Task",  # ← Already present!
]
```

**What this means**: Our AppGeneratorAgent can already use the Task tool to delegate work to subagents!

### 2. How Automatic Delegation Works

Claude Code **automatically delegates** tasks to subagents when:

1. **Description Match**: Task description matches subagent's `description` field
2. **Proactive Keywords**: Subagent description contains "use PROACTIVELY" or "MUST BE USED"
3. **Context Alignment**: Current task context matches subagent's expertise
4. **Tool Availability**: Subagent has tools needed for the task

**From Official Docs** (docs.claude.com/en/docs/claude-code/sub-agents):
> "Claude Code proactively selects subagents based on: Task description, Subagent description field, Current context, and Available tools"

### 3. Current Implementation Gap

**What We Have**:
- ✅ Subagent definitions (7 specialized agents)
- ✅ Task tool in allowed_tools
- ✅ Feature flag --enable-subagents
- ✅ AgentDefinition dataclass

**What We're Missing**:
- ❌ Subagents not passed to Claude Code SDK
- ❌ System prompt doesn't encourage delegation
- ❌ Pipeline doesn't know to delegate specific tasks

## How to Fix It

### Option 1: SDK Configuration (CORRECT WAY)

Pass subagents to the Claude Code SDK via `ClaudeCodeOptions`:

```python
# In agent.py
from claude_code_sdk import ClaudeCodeOptions, AgentDefinition

# When creating the agent with subagents enabled:
agent_definitions = {}
if self.enable_subagents:
    for name, subagent in self.subagents.items():
        agent_definitions[name] = AgentDefinition(
            description=subagent.description,
            prompt=subagent.prompt,
            tools=subagent.tools,
            model=subagent.model
        )

# Pass to SDK
self.agent = Agent(
    system_prompt=self.pipeline_prompt,
    allowed_tools=[...],  # Includes "Task"
    mcp_tools=[...],
    cwd=self.output_dir,
    name=AGENT_CONFIG["name"],
    model=AGENT_CONFIG["model"],
    max_turns=AGENT_CONFIG["max_turns"],
    # NEW: Pass subagent definitions
    agents=agent_definitions  # ← This is the key!
)
```

**Why This Works**:
- Claude Code SDK receives agent definitions at initialization
- Main agent can automatically delegate to subagents
- No manual Task tool calls needed
- Automatic routing based on task description

### Option 2: System Prompt Enhancement (COMPLEMENTARY)

Update pipeline-prompt.md to encourage delegation:

```markdown
## SUBAGENT DELEGATION (When --enable-subagents is enabled)

You have access to specialized subagents via the Task tool. When appropriate,
delegate work to these specialists:

1. **research_agent** (Opus) - MUST USE for complex requirements research
   - Web search for best practices
   - Research unfamiliar technologies
   - Find architectural patterns

2. **schema_designer** (Sonnet) - Use for database design
   - Zod schema creation
   - Database structure optimization

3. **api_architect** (Sonnet) - Use for API design
   - RESTful endpoint design
   - Contract creation

4. **ui_designer** (Sonnet) - Use for UI/UX design
   - Component hierarchy
   - Dark mode design systems

5. **code_writer** (Sonnet) - Use for production code
   - TypeScript/React implementation
   - Component generation

6. **quality_assurer** (Haiku) - MUST USE before completion
   - Browser automation testing
   - API endpoint validation

7. **error_fixer** (Opus) - Use when errors occur
   - Debug TypeScript errors
   - Fix build issues

CRITICAL: Delegate complex/specialized tasks to appropriate subagents for
better results and faster execution.
```

## Implementation Phases

### Phase 1: SDK Integration (HIGH PRIORITY)

**Goal**: Pass subagent definitions to Claude Code SDK

**Tasks**:
1. ✅ Import AgentDefinition from claude_code_sdk
2. ✅ Convert our subagent definitions to SDK format
3. ✅ Pass `agents` parameter when creating Agent
4. ✅ Test automatic delegation

**Implementation**:

```python
# agent.py - In __init__ method

def __init__(self, ..., enable_subagents: bool = False):
    # ... existing code ...

    # Prepare SDK agent definitions
    sdk_agents = None
    if self.enable_subagents and self.subagents:
        sdk_agents = {}
        for name, subagent_def in self.subagents.items():
            sdk_agents[name] = AgentDefinition(
                description=subagent_def.description,
                prompt=subagent_def.prompt,
                tools=subagent_def.tools,
                model=subagent_def.model
            )

    # Create agent with subagents
    self.agent = Agent(
        system_prompt=self.pipeline_prompt,
        mcp_tools=[...],
        cwd=self.output_dir,
        name=AGENT_CONFIG["name"],
        model=AGENT_CONFIG["model"],
        max_turns=AGENT_CONFIG["max_turns"],
        agents=sdk_agents  # ← Pass to SDK
    )
```

**Testing**:
```bash
# Should now automatically delegate
uv run python run-app-generator.py \
  "Create a todo app with AI recommendations" \
  --app-name todo-ai \
  --enable-subagents

# Look for in logs:
# "🤖 Delegating to research_agent"
# "🤖 Using subagent: schema_designer"
```

### Phase 2: System Prompt Updates (MEDIUM PRIORITY)

**Goal**: Encourage delegation in pipeline-prompt.md

**Tasks**:
1. Add subagent delegation section
2. Describe when to use each subagent
3. Emphasize proactive usage
4. Add examples of delegation

**Location**: docs/pipeline-prompt.md (or wherever the system prompt is)

**Testing**: Verify agent delegates more frequently

### Phase 3: Subagent Description Optimization (MEDIUM PRIORITY)

**Goal**: Improve automatic routing with better descriptions

**Current Example**:
```python
research_agent = AgentDefinition(
    description="Research complex app requirements and create implementation strategy",
    ...
)
```

**Improved Example**:
```python
research_agent = AgentDefinition(
    description="Research complex app requirements and create implementation strategy. Use PROACTIVELY when: user requests unfamiliar technology, app needs research for best practices, or requirements are complex/ambiguous. MUST BE USED for AI/ML integrations, fine-tuning platforms, or domain-specific applications.",
    ...
)
```

**Update All Subagents**:
- Add "Use PROACTIVELY when:" clauses
- Add "MUST BE USED for:" clauses
- Make descriptions more specific
- Include trigger keywords

### Phase 4: Monitoring & Metrics (LOW PRIORITY)

**Goal**: Track subagent usage and performance

**Metrics to Track**:
- Delegation frequency per subagent
- Task completion rates
- Cost per subagent
- Time savings from parallel execution
- Error rates by subagent

**Implementation**:
```python
# In AppGeneratorAgent
class SubagentMetrics:
    def __init__(self):
        self.delegations = {}  # {agent_name: count}
        self.costs = {}        # {agent_name: total_cost}
        self.successes = {}    # {agent_name: success_count}
        self.failures = {}     # {agent_name: failure_count}

    def record_delegation(self, agent_name, cost, success):
        # Track metrics
        pass
```

## Testing Strategy

### Test 1: Simple App (Baseline)
```bash
# Without subagents
uv run python run-app-generator.py "Create a todo app" --app-name todo-baseline

# With subagents
uv run python run-app-generator.py "Create a todo app" --app-name todo-subagents --enable-subagents
```

**Expected Behavior**:
- Quality assurer should run browser tests
- Code writer should generate components
- Schema designer should handle database

### Test 2: Complex App (Research Required)
```bash
uv run python run-app-generator.py \
  "Create a platform for fine-tuning open source LLMs with GPU management" \
  --app-name ml-platform \
  --enable-subagents
```

**Expected Behavior**:
- Research agent should search for LLM fine-tuning patterns
- Research agent should find GPU management libraries
- Schema designer should create complex model schemas
- API architect should design training job endpoints

### Test 3: Error Recovery
```bash
# Generate an app, introduce a TypeScript error, then ask to fix it
uv run python run-app-generator.py "Create a blog app" --app-name blog --enable-subagents
# Manually introduce error in generated code
uv run python run-app-generator.py --resume apps/blog/app "Fix the TypeScript errors"
```

**Expected Behavior**:
- Error fixer subagent should be automatically invoked
- Should use Opus model for complex debugging
- Should apply minimal fixes

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│              AppGeneratorAgent (Main)                    │
│  - Pipeline orchestration                                │
│  - High-level decision making                            │
│  - Subagent coordination                                 │
└────────┬──────────────────────────────────┬─────────────┘
         │                                   │
         │ Automatic Delegation              │
         │ (via Task tool)                   │
         │                                   │
    ┌────▼────┐  ┌──────────┐  ┌───────────▼──┐
    │Research │  │  Schema  │  │      UI       │
    │ Agent   │  │ Designer │  │   Designer    │
    │ (Opus)  │  │ (Sonnet) │  │  (Sonnet)     │
    └─────────┘  └──────────┘  └───────────────┘
         │            │              │
         │ Parallel   │ Execution    │
         │            │              │
    ┌────▼────┐  ┌───▼──────┐  ┌────▼──────┐
    │   API   │  │   Code   │  │  Quality  │
    │Architect│  │  Writer  │  │  Assurer  │
    │(Sonnet) │  │ (Sonnet) │  │  (Haiku)  │
    └─────────┘  └──────────┘  └───────────┘
                                     │
                                ┌────▼──────┐
                                │   Error   │
                                │   Fixer   │
                                │  (Opus)   │
                                └───────────┘
```

## Key Benefits

1. **Automatic Routing**: No manual delegation code needed
2. **Parallel Execution**: Up to 10 subagents run simultaneously
3. **Cost Optimization**: Use cheaper models for simple tasks
4. **Context Isolation**: Each subagent has its own 200K context
5. **Specialization**: Better results from domain experts
6. **Reliability**: Error fixer handles failures automatically

## Critical Code Changes Needed

### 1. Update agent.py __init__

```python
# Add at top
from claude_code_sdk import AgentDefinition as SDKAgentDefinition

# In __init__
def __init__(self, output_dir=None, enable_expansion=True, enable_subagents=False):
    # ... existing code ...

    # Convert subagents to SDK format
    sdk_agents = None
    if self.enable_subagents and self.subagents:
        sdk_agents = {}
        for name, def in self.subagents.items():
            sdk_agents[name] = SDKAgentDefinition(
                description=def.description,
                prompt=def.prompt,
                tools=def.tools,
                model=def.model
            )
        logger.info(f"Passing {len(sdk_agents)} subagents to SDK")

    # Pass to Agent
    self.agent = Agent(
        system_prompt=self.pipeline_prompt,
        mcp_tools=[...],
        agents=sdk_agents,  # ← NEW!
        ...
    )
```

### 2. Verify Task Tool Availability

Already present in config.py - no changes needed ✅

### 3. Update Subagent Descriptions

Make descriptions more explicit about when to use:

```python
# research_agent.py
research_agent = AgentDefinition(
    description="Research complex app requirements and create implementation strategy. Use PROACTIVELY when user requests unfamiliar technology or when requirements need research. MUST BE USED for AI/ML integrations, fine-tuning platforms, or domain-specific applications requiring specialized knowledge.",
    ...
)
```

## Success Criteria

- [ ] AppGeneratorAgent passes subagents to SDK
- [ ] Automatic delegation works (visible in logs)
- [ ] ResearchAgent is used for complex apps
- [ ] QualityAssurer runs browser tests automatically
- [ ] ErrorFixer handles TypeScript errors
- [ ] Cost and performance metrics collected
- [ ] Documentation updated

## Next Steps

1. **Immediate**: Implement Phase 1 (SDK integration)
2. **This Week**: Test with simple and complex apps
3. **Next Week**: Optimize descriptions and system prompt
4. **Future**: Add monitoring and metrics

## References

- [Claude Code Subagents Docs](https://docs.claude.com/en/docs/claude-code/sub-agents)
- [Claude Agent SDK Python Docs](https://docs.claude.com/en/api/agent-sdk/python)
- [Task Tool Guide](https://claudelog.com/mechanics/task-agent-tools/)
- [Subagent Deep Dive](https://cuong.io/blog/2025/06/24-claude-code-subagent-deep-dive)

---

**Status**: Ready for implementation
**Priority**: HIGH - This unblocks automatic delegation
**Complexity**: LOW - Simple SDK configuration change
**Risk**: LOW - Feature flag controls rollout