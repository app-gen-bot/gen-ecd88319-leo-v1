# Agent Library Enhancement Request

## ✅ IMPLEMENTED - 2025-09-25

The enhancements described in this document have been implemented with the following modifications:
- Turn-by-turn logging: First turn logs at INFO (console+file), subsequent turns at DEBUG (file only)
- Max turns detection: Clear indication via `termination_reason` field
- Enhanced error context: Structured `error_details` field with comprehensive information
- Performance metrics: Not implemented per user request
- Full backward compatibility maintained

See `examples/enhanced_observability.py` for usage examples.

## Executive Summary

The `cc_agent.Agent` library needs enhancements to improve observability, error handling, and pipeline control when agents hit iteration limits or experience failures.

## Current Issues

### 1. Lack of Turn-by-Turn Logging
**Problem**: Agents run for 40+ minutes with no visibility into what's happening. We cannot debug or optimize our pipelines without seeing:
- What the agent is doing in each turn
- Which tools are being called
- How much time each turn takes
- What decisions the agent is making

**Impact**: Pipeline optimization is impossible when we're blind to agent behavior.

### 2. No Indication of Max Turns Reached
**Problem**: When an agent hits `max_turns`, it returns a result but doesn't clearly indicate that it terminated due to iteration limit rather than successful completion.

**Impact**: Pipelines continue to downstream stages wasting time and money when they should fail fast.

### 3. Insufficient Error Propagation
**Problem**: When Writer-Critic loops hit max iterations (e.g., 40 attempts), the failure reason isn't clearly communicated up the stack.

**Impact**: Users don't know if failure was due to:
- Agent hitting max_turns
- Writer-Critic hitting max_iterations
- Actual code generation failure
- Network/API issues

## Proposed Enhancements

### 1. Turn-by-Turn Logging

Add configurable logging that shows:
```python
# Example usage
agent = Agent(
    system_prompt=SYSTEM_PROMPT,
    log_level="INFO",  # Show turn-by-turn progress
    log_turns=True,     # Log each turn's activity
    **config
)

# Would produce logs like:
# INFO: [Agent:SchemaDesigner] Turn 1/10 - Reading file: app/shared/schema.zod.ts
# INFO: [Agent:SchemaDesigner] Turn 2/10 - Writing file: app/shared/contracts/users.contract.ts (2.3KB)
# INFO: [Agent:SchemaDesigner] Turn 3/10 - Running tool: oxc (validating TypeScript)
# INFO: [Agent:SchemaDesigner] Turn 3/10 - Tool result: 3 errors found
# INFO: [Agent:SchemaDesigner] Turn 4/10 - Fixing TypeScript errors...
```

### 2. Clear Max Turns Indication

Return a structured result that includes termination reason:
```python
class AgentResult:
    success: bool
    content: str
    cost: float
    termination_reason: str  # "completed", "max_turns_reached", "error"
    turns_used: int
    max_turns: int
    
# Usage in pipeline:
result = await agent.run(prompt)
if result.termination_reason == "max_turns_reached":
    logger.error(f"Agent hit limit: {result.turns_used}/{result.max_turns} turns")
    # Fail fast, don't continue pipeline
```

### 3. Enhanced Error Context

Provide detailed error information:
```python
class AgentResult:
    # ... existing fields ...
    error_details: Optional[Dict[str, Any]]  # {
    #     "phase": "validation",
    #     "iteration": 15,
    #     "specific_error": "Missing index.ts file",
    #     "tools_attempted": ["Write", "MultiEdit", "oxc"],
    #     "time_elapsed": 2465.3
    # }
```

### 4. Performance Metrics

Track and return performance data:
```python
class AgentResult:
    # ... existing fields ...
    metrics: Dict[str, Any]  # {
    #     "total_time": 2465.3,
    #     "turns_breakdown": {
    #         "reading": 5,
    #         "writing": 8, 
    #         "validation": 12
    #     },
    #     "tokens_used": 45000,
    #     "tools_called": {"Read": 5, "Write": 8, "oxc": 12}
    # }
```

## Implementation Priority

1. **CRITICAL**: Turn-by-turn logging (we're blind without this)
2. **HIGH**: Clear max_turns indication (prevents wasted pipeline runs)
3. **MEDIUM**: Enhanced error context (helps debug failures)
4. **LOW**: Performance metrics (nice for optimization)

## Backward Compatibility

All enhancements should be backward compatible:
- Logging disabled by default
- New fields in AgentResult should be optional
- Existing code should continue working unchanged

## Summary

The Agent library works well functionally but lacks the observability and control needed for production pipelines. These enhancements would dramatically improve our ability to debug, optimize, and control agent behavior in complex multi-stage pipelines.