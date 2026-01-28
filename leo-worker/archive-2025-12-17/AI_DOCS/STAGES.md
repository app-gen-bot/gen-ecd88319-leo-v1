# STAGES

## Stage Signature
```python
async def run_stage(
    primary_input: Path,  # e.g., plan_path
    output_dir: Path,     # where to write artifacts
    **kwargs
) -> Tuple[AgentResult, str]:  # (result, summary_message)
```

## Stage Types & Examples

1. **Simple Processing** - No agents
   - Example: `stages/design_system_stage.py`
   - Pattern: Read input → Process → Write output

2. **Single Agent** - One agent call
   - Example: `stages/plan_stage.py`
   - Pattern: Call agent → Return result

3. **Sequential Agents** - Multiple agents in order
   - Example: `stages/backend_spec_stage.py` (NEW)
   - Pattern: Agent1 → if success → Agent2

4. **Writer-Critic Loops** - Validation & iteration
   - Example: `stages/build_stage.py`
   - Pattern: Use `run_writer_critic_loop()` helper
   - Max 20 iterations for convergence

## Adding to Pipeline (main.py)

```python
# Check if artifacts exist (auto-detection)
if not (workspace / "specs" / "schema.zod.ts").exists():
    result, message = await your_stage.run_stage(...)
    if not result.success:
        return results  # Critical stage - stop pipeline
```

## Key Rules

- **Stateless**: Check for existing artifacts, skip if present
- **Early return**: Stop pipeline on critical failures
- **Cost tracking**: Sum all agent costs
- **Clear paths**: Use Path objects, not strings
- **UTF-8**: Always specify encoding

## Directory Guidelines

**Planning artifacts** (plan.md, specs) go in stage-specific dirs:
- `plan/` - Planning documents
- `design-system/` - Design configuration
- `preview-*/` - Preview artifacts

**Runtime code** ALWAYS goes in `app/` directory:
- `app/shared/` - Schemas, contracts, shared types
- `app/client/` - Frontend code
- `app/server/` - Backend code

Never mix planning docs with executable code!

## Critic Implementation

Critics return `(decision, evaluation_data)` where:
- `decision`: Binary "continue" or "complete"  
- `evaluation_data`: Dict with `errors` and `raw_response`

```python
# Parse XML (returns exactly 2 values)
decision, errors = parse_critic_xml(result.content)

# Build standard evaluation data
eval_data = {
    "decision": decision,
    "errors": errors,
    "raw_response": result.content
}

return decision, eval_data
```

**No scores, no regex, no complexity** - just binary pass/fail.
If Writer needs details, it runs oxc/tests directly.