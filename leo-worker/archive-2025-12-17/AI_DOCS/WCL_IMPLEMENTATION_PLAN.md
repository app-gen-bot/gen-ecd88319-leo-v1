# WCL Implementation Plan

Based on Core Principles and lessons from all 4 design iterations.

## Architecture Overview

```
Writer Agent → writes → phase1_step1_iter1_writer.md
                            ↓
Critic Agent → reads → evaluates → writes → phase1_step1_iter1_critic.md
                                                  ↓
Loop Exit Agent → reads → validates → writes → phase1_step1_iter1_decision.json
                                                      ↓
                                            WCL parses decision
                                                      ↓
                                        CONTINUE (loop) or DONE (exit)
```

## Implementation Structure

```python
class WCL:
    def __init__(self,
                 writer_system_prompt: str,
                 writer_user_prompt: str | Callable,
                 critic_system_prompt: str,
                 critic_user_prompt: str | Callable,
                 # Optional with defaults
                 phase: int = 1,
                 step: int = 1,
                 output_dir: Path = Path("wcl_output"),
                 max_iterations: int = 3,
                 compliance_threshold: int = 85,
                 cwd: str = None)

    async def run(self) -> WCLResult:
        for iteration in range(1, max_iterations + 1):
            # 1. Run Writer with subprompt
            await self._run_writer(iteration)

            # 2. Run Critic with subprompt  
            await self._run_critic(iteration)

            # 3. Run LEA with validation loop
            decision = await self._run_loop_exit_agent(iteration)

            # 4. Check exit condition
            if decision["decision"] == "DONE" and decision["score"] >= threshold:
                return WCLResult(success=True, ...)

        return WCLResult(success=False, ...)  # Max iterations
```

## Key Implementation Details

### 1. Loop Exit Agent with Validation Loop

```python
async def _run_loop_exit_agent(self, iteration: int, critic_file: Path) -> Dict:
    """Run LEA with validation loop to guarantee valid JSON."""
    max_attempts = 3

    for attempt in range(1, max_attempts + 1):
        # Build LEA prompt
        lea_prompt = self._create_lea_prompt(critic_file, attempt)

        # Run LEA (preferably with structured output mode)
        lea_agent = Agent(
            system_prompt="You are a Loop Exit Agent. Write valid JSON decisions.",
            cwd=str(self.output_dir),
            max_turns=5  # Limited turns for focused task
        )

        decision_file = f"phase{phase}_step{step}_iter{iteration}_decision.json"
        if attempt > 1:
            decision_file = f"phase{phase}_step{step}_iter{iteration}_decision_attempt{attempt}.json"

        # Add instruction to write JSON file
        full_prompt = lea_prompt + f"\n\nWrite your JSON decision to: {decision_file}"

        result = await lea_agent.run(full_prompt)

        # Validate the JSON file
        validation = self._validate_json_file(decision_file)
        if validation["valid"]:
            return validation["data"]

        # Add error feedback for next attempt
        # Loop continues with error context

    # Fallback after max attempts
    return {"decision": "CONTINUE", "score": 50, "reason": "LEA validation failed"}


def _validate_json_file(self, filepath: Path) -> Dict:
    """Validate LEA output file contains required JSON structure."""
    try:
        if not filepath.exists():
            return {"valid": False, "errors": ["File not created"]}

        with open(filepath) as f:
            data = json.load(f)

        # Validate required fields
        required = ["decision", "compliance_score", "reason"]
        missing = [field for field in required if field not in data]

        if missing:
            return {"valid": False, "errors": [f"Missing fields: {missing}"]}

        if data["decision"] not in ["CONTINUE", "DONE"]:
            return {"valid": False, "errors": ["Invalid decision value"]}

        return {"valid": True, "data": data}

    except json.JSONDecodeError as e:
        return {"valid": False, "errors": [f"Invalid JSON: {e}"]}
```

### 2. Subprompt Templates

```python
def _create_writer_subprompt(self, iteration: int) -> str:
    """Tells Writer exactly where to write output."""
    writer_file = f"phase{self.phase}_step{self.step}_iter{iteration}_writer.md"

    subprompt = f"""
## Writer-Critic Loop Context
You are the WRITER in iteration {iteration}.
Output file: {self.output_dir}/{writer_file}

REQUIRED: Save ALL your work to this file using the Write tool."""

    if iteration > 1:
        # Add previous context references
        prev_writer = f"phase{self.phase}_step{self.step}_iter{iteration - 1}_writer.md"
        prev_critic = f"phase{self.phase}_step{self.step}_iter{iteration - 1}_critic.md"
        subprompt += f"""

Previous files to read:
- Your previous work: {prev_writer}
- Critic feedback: {prev_critic}"""

    return subprompt
```

### 3. Simple User Interface

```python
# Minimal usage - LLM only provides these
wcl = WCL(
    writer_system_prompt="You are an expert programmer",
    writer_user_prompt="Write a Fibonacci function",
    critic_system_prompt="You are a code reviewer",
    critic_user_prompt="Review for correctness and efficiency"
)
result = await wcl.run()


# With dynamic prompts
def build_writer_prompt(iteration: int, prev_feedback: str) -> str:
    base = "Create a REST API"
    if iteration > 1:
        base += f"\n\nAddress issues:\n{prev_feedback}"
    return base


wcl = WCL(
    writer_system_prompt="You are a backend developer",
    writer_user_prompt=build_writer_prompt,  # Callable
    critic_system_prompt="You are an API architect",
    critic_user_prompt="Review for REST best practices"
)
```

## Critical Design Choices

### Use Agent Class (not SDK)

- Consistent with rest of pipeline
- Supports MCP tools directly
- Fresh instance per iteration

### LEA as Third Agent

- Separate concerns: Critic evaluates, LEA structures
- Validation loop guarantees valid JSON
- Can use structured output mode when available

### File-Based State

- Everything debuggable
- Can resume from any point
- Clear audit trail

### No Complex Abstractions

- No specs, adapters, parsers
- Direct Agent instantiation
- Simple prompt concatenation

## What This Solves

1. **Critic unreliability**: LEA handles structure, Critic just evaluates
2. **JSON validation**: LEA validation loop with retries
3. **LLM simplicity**: Just provide 4 prompts
4. **Consistency**: Same pattern for all Writer-Critic pairs
5. **Debuggability**: Everything in files with clear names

## Key Implementation Decisions

### 1. **Three-Agent Architecture**

- Writer → Critic → Loop Exit Agent (LEA)
- Each writes to a specific file type (.md, .md, .json)
- Fresh Agent instances each iteration

### 2. **LEA Validation Loop** (Critical Innovation)

- Up to 3 attempts to get valid JSON
- Each attempt gets error feedback
- Writes to different files for debugging (decision.json, decision_attempt2.json, etc.)
- Fallback to CONTINUE if validation fails

### 3. **Simple Interface**

- LLM provides just 4 prompts
- Everything else has sensible defaults
- Support for both static strings and dynamic builders

### 4. **Automatic Subprompts**

- WCL tells each agent exactly where to read/write
- Previous context automatically injected
- No need for LLM to understand file naming

### 5. **Use Agent Class**

- Consistent with rest of pipeline
- Direct MCP tool support
- No SDK complexity

The implementation should be ~300-400 lines total, with the LEA validation loop being the most complex part (but hidden
from users). The LLM interface remains dead simple - just provide prompts and run.

This approach solves the core problem: Critics can write messy markdown, but LEA guarantees structured JSON output
through validation and retries.

## Next Steps

1. Implement core WCL class (~300 lines)
2. Test with simple example (Fibonacci)
3. Integrate with backend_spec_stage
4. Validate with real agents