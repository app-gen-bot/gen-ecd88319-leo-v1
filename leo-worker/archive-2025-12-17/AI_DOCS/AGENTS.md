# AGENTS

## Critical Rule: NEVER Access Agent Internals

**The Agent class is an external library - treat it as a black box!**

## Writer-Critic Pattern Clarification

**Writers**: Generate code AND self-validate (compile, lint, basic checks)
**Critics**: Validate only - NEVER modify code, just return continue/complete

Writers MUST self-validate because agents tend to declare success prematurely. Critics act as inspectors that catch when Writers claim success but the code doesn't actually work/compile/exist. Critics send Writers back to fix issues until everything is completely correct, then allow the stage to proceed.

## Three-Layer Architecture (REQUIRED)

See `agents/docs/AGENT_PATTERN.md` for full details.

```
agents/[agent_name]/
├── agent.py         # Wrapper with domain methods
├── config.py        # AGENT_CONFIG dict
├── system_prompt.py # Agent expertise
├── user_prompt.py   # Prompt builders
└── critic/          # (optional) for Writer-Critic
    └── agent.py
```

## Quick Examples

**Simple Agent**: `agents/plan_orchestrator/`
**Writer-Critic**: `agents/schema_generator/` + `critic/`

## Key Rules

1. **NO generic run()** - Use domain methods like `generate_schema()`
2. **MCP tools** in agent init: `mcp_tools=["oxc", "tree_sitter"]`
3. **Config**: Use "sonnet" for speed, "opus" for complex
4. **Never create agents in stages** - Stages call agent methods

## Writer-Critic Pattern

Writers generate and self-test. Critics validate independently.
```python
# In stage
success, result = await run_writer_critic_loop(
    writer_agent=SchemaGeneratorAgent(cwd=cwd),
    critic_agent=SchemaGeneratorCritic(cwd=cwd),
    agent_name="Schema Generator",
    max_iterations=20
)
```

## Common MCP Tools
- `oxc` - TypeScript/JS linting (50-100x faster than ESLint)
- `tree_sitter` - AST analysis
- `build_test` - Compilation check

## Writer-Critic Loop (WCL) Implementation

The new WCL implementation uses a three-agent architecture with Loop Exit Agent. See `AI_DOCS/WCL_CORE_PRINCIPLES.md` for design principles.

### CRITICAL: Agent Class Requirements

**The Agent class REQUIRES these parameters:**
```python
agent = Agent(
    name="Agent Name",  # REQUIRED - descriptive name
    system_prompt="...",  # REQUIRED - agent expertise
    model="claude-3-5-sonnet-20241022",  # optional - defaults to sonnet
    mcp_tools=["oxc"],  # optional - MCP tools list
    cwd="/path/to/work",  # optional - working directory
    max_turns=30  # optional - max conversation turns
)
```

**Common Error**: Forgetting the `name` parameter causes:
```
Agent.__init__() missing 1 required positional argument: 'name'
```

### Using WCL in Stages

```python
from ..wcl_proper import WCL, WCLResult

# Create prompt builders
def writer_prompt_builder(iteration: int, prev_feedback: str) -> str:
    return create_original_writer_prompt(plan_content, prev_feedback)

def critic_prompt_builder(iteration: int) -> str:
    return create_original_critic_prompt(iteration, True)

# Create and run WCL (just 10 lines!)
wcl = WCL(
    writer_system_prompt=WRITER_SYSTEM,
    writer_user_prompt=writer_prompt_builder,
    critic_system_prompt=CRITIC_SYSTEM,
    critic_user_prompt=critic_prompt_builder,
    name="Schema Designer",  # Base name for agents
    phase=1,
    step=1,
    output_dir=output_dir / "_wcl_schema",
    cwd=cwd,
    max_iterations=40,
    compliance_threshold=90,
    writer_tools=["oxc"],
    critic_tools=["oxc"],
)

result = await wcl.run()
```

### How WCL Names Agents

The `name` parameter is used as a prefix for all three agents:
- Writer: `"{name} Writer"` → "Schema Designer Writer"
- Critic: `"{name} Critic"` → "Schema Designer Critic"  
- Loop Exit Agent: `"{name} Loop Exit Agent"` → "Schema Designer Loop Exit Agent"

### WCL Architecture

1. **Writer Agent**: Creates/improves content, writes to `.md` file
2. **Critic Agent**: Evaluates writer's work, writes evaluation to `.md` file
3. **Loop Exit Agent**: Reads critic's evaluation, writes validated `.json` decision
   - Tries up to 3 times to produce valid JSON
   - Each retry gets error feedback
   - Falls back to CONTINUE if validation fails

### WCL File Structure

```
output_dir/
├── phase1_step1_iter1_writer.md     # Writer's work
├── phase1_step1_iter1_critic.md     # Critic's evaluation
├── phase1_step1_iter1_decision.json # LEA's decision
├── phase1_step1_iter2_writer.md     # Next iteration...
└── phase1_step1_iter2_decision_attempt2.json  # LEA retry if needed
```

### Key Points for Agent Developers

1. **You only provide prompts** - WCL handles all file management
2. **Automatic subprompts** - WCL tells agents where to read/write
3. **LEA guarantees structure** - Critics write markdown, LEA ensures valid JSON
4. **Fresh agents each iteration** - No context accumulation issues
5. **Name parameter is REQUIRED** - Always provide descriptive agent names

### Common Pitfalls

❌ **Forgetting the name parameter**
```python
# WRONG - will cause error
writer_agent = Agent(
    system_prompt="...",
    cwd=cwd
)

# CORRECT
writer_agent = Agent(
    name="Schema Writer",
    system_prompt="...",
    cwd=cwd
)
```

❌ **Trying to parse Critic output for decisions**
- Don't do this! The Loop Exit Agent handles structured decisions
- Critics just write markdown evaluations

❌ **Not using prompt builders**
- Use functions to build prompts dynamically with iteration context
- Static strings work but miss the power of iteration-aware prompts

### Performance Considerations

⚠️ **Current Performance Issue** (2025-01-26):
- The WCL is functional but agents are running slowly
- Writers and Critics are taking 30+ seconds for simple tasks
- This is likely due to complex agent configurations for simple operations

### Optimization Recommendations

When optimizing the WCL for speed:
1. **Review agent configurations** - Reduce max_turns from 30 to 10-15 for most tasks
2. **Consider faster models** - Use lighter models for simpler validation tasks
3. **Add timeouts** - Prevent agents from hanging on edge cases
4. **Optimize the Loop Exit Agent** - Streamline the validation loop (currently 3 attempts)
5. **Simplify prompts** - Remove unnecessary complexity from system/user prompts
6. **Reduce tool usage** - Only include essential MCP tools for each agent
7. **Batch operations** - Combine related validations where possible

**Note**: Once optimized in this repo, the WCL should be moved to the production cc_agent repo for long-term use.