# WCL Core Principles

## Primary Goal

Make it trivial for an LLM to implement a Writer-Critic loop by providing ONLY domain-specific prompts.

## Essential Components

### 1. Three Distinct Agents

- **Writer**: Creates/improves content based on requirements and feedback
- **Critic**: Evaluates Writer's output and provides feedback (markdown)
- **Loop Exit Agent (LEA)**: Makes structured continue/complete decision (JSON)

### 2. File-Based Communication

- **Deterministic naming**: `phase{P}_step{S}_iter{N}_{role}.{ext}`
- **Writer output**: `.md` file with the actual work
- **Critic output**: `.md` file with evaluation and feedback
- **LEA output**: `.json` file with structured decision

### 3. WCL Handles ALL Mechanics

The framework automatically manages:

- File naming and paths
- Iteration tracking
- Context injection (previous files)
- Subprompt appending (tells agents WHERE to write)
- LEA validation loop (guarantees valid JSON)
- Cost tracking

### 4. LLM Provides ONLY Prompts

```python
# This is ALL an LLM should need to provide:
wcl = WCL(
    writer_system_prompt="You are an expert X",
    writer_user_prompt="Create Y",
    critic_system_prompt="You are a reviewer",
    critic_user_prompt="Evaluate Y for Z",
    # Everything else has sensible defaults
)
result = await wcl.run()
```

### 5. Loop Exit Agent (LEA) Guarantees Structure

- LEA runs AFTER Critic completes
- Uses structured output mode (if available)
- Has validation loop with retries
- Falls back to parsing if structured output unavailable
- Produces guaranteed valid JSON:

```json
{
  "decision": "CONTINUE|DONE",
  "compliance_score": 0-100,
  "reason": "explanation"
}
```

### 6. Subprompt Injection is Automatic

WCL appends instructions to each agent:

- **Writer**: "Save your work to phase1_step1_iter1_writer.md"
- **Critic**: "Read phase1_step1_iter1_writer.md, write evaluation to phase1_step1_iter1_critic.md"
- **LEA**: "Read phase1_step1_iter1_critic.md, write JSON decision to phase1_step1_iter1_decision.json"

## Key Design Decisions

### What WCL MUST Do

1. Handle all file I/O and naming
2. Inject context about where files are
3. Track iteration state
4. Run LEA with validation loop
5. Parse results and decide continue/done
6. Return comprehensive result object

### What WCL MUST NOT Do

1. Understand domain logic
2. Validate domain-specific content
3. Parse Writer/Critic markdown (except LEA)
4. Require complex configuration
5. Need custom adapters per agent type

### Optional Extensions (Keep Simple)

- Hooks for logging: `before_writer`, `after_critic`, etc.
- Dynamic prompt builders: Functions that build prompts based on iteration
- MCP tool configuration: Pass through to agents
- Model selection: Different models for different roles

## Success Metrics

1. **Integration simplicity**: <10 lines to use WCL
2. **No boilerplate**: Zero adapter/parser code needed
3. **Reliability**: LEA guarantees valid decisions
4. **Debuggability**: All state in readable files
5. **LLM-friendly**: An LLM can use it without understanding internals

## Anti-Patterns

❌ Requiring the Critic to output valid JSON
❌ Parsing free-form text for decisions
❌ Complex specs, adapters, or result parsers
❌ Making LLM understand WCL internals
❌ Coupling to specific agent implementations

## Summary

The WCL is a simple orchestrator that runs three agents in sequence, handles all file management, and uses a Loop Exit
Agent with validation to make reliable continue/done decisions. The LLM using it only needs to provide prompts -
everything else is automatic.