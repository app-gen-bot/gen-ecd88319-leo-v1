# Intelligent Reprompter System

**Version:** 2.0 - LLM-First Approach
**Status:** Design Document
**Created:** January 2025

---

## Executive Summary

The Intelligent Reprompter System transforms the app generator from a single-shot tool into an autonomous development agent that can iterate through multiple cycles of development, testing, and refinement with minimal human intervention.

**Problem**: Currently, when `run-app-generator.py` completes a task, it prompts: `What else can I help you with?` and waits for user input. The agent often documents clear next steps in changelogs (e.g., "Debug children endpoint", "Add two children", "Test AI discovery"), but requires manual prompting to continue.

**Solution**: A simple, LLM-native reprompter that:
1. Reads context files (changelog, plans, logs) as plain text
2. Asks an LLM: "What should we do next?"
3. Generates prompts that encourage subagent use and context efficiency
4. Operates in configurable modes (autonomous, confirm-first, interactive)
5. Naturally detects loops by seeing its own history
6. Always emphasizes testing and proper research for complex tasks

**Key Principle**: **No brittle parsing code** - Let the LLM understand context naturally

---

## Architecture Overview - Simple LLM-First Design

```
┌─────────────────────────────────────────────────────────────┐
│                Interactive Loop (run-app-generator.py)       │
│                                                              │
│  ┌──────────────┐                                           │
│  │ Task Complete│                                           │
│  └──────┬───────┘                                           │
│         ▼                                                    │
│  ┌──────────────────────────────────┐                       │
│  │ Gather Context (Simple Reads)    │                       │
│  │ - Latest changelog entries       │                       │
│  │ - Plan/implementation files      │                       │
│  │ - Error logs (tail -100)         │                       │
│  │ - Git status/diff                │                       │
│  └──────┬───────────────────────────┘                       │
│         ▼                                                    │
│  ┌──────────────────────────────────┐                       │
│  │ Ask LLM (ReprompterAgent)        │                       │
│  │ "What should we do next?"        │                       │
│  │ + Full context as text           │                       │
│  │ + Task history (loop detection)  │                       │
│  └──────┬───────────────────────────┘                       │
│         ▼                                                    │
│  ┌──────────────────────────────────┐                       │
│  │ LLM Returns Next Prompt          │                       │
│  │ (Multi-paragraph, subagent-aware)│                       │
│  └──────┬───────────────────────────┘                       │
│         ▼                                                    │
│  ┌──────────────────────────────────┐                       │
│  │ Mode Check                       │                       │
│  │ - Autonomous: Execute            │                       │
│  │ - Confirm: Ask user approval     │                       │
│  │ - Interactive: Show suggestion   │                       │
│  └──────┬───────────────────────────┘                       │
│         ▼                                                    │
│  ┌──────────────────────────────────┐                       │
│  │ Execute Next Task                │                       │
│  │ (Main AppGeneratorAgent)         │                       │
│  └──────────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

**Total Complexity**: ~150 lines of code (vs 1000+ in complex design)

---

## Core Components (Simplified)

### 1. Context Gatherer (Not Parser!)

**Purpose**: Simply read relevant files as text - no parsing, no logic.

**Implementation**:
```python
class ContextGatherer:
    """
    Dead simple: Just read files and return text.
    No parsing. No complex logic. Just files → strings.
    """

    def gather_context(self, app_path: str) -> Dict[str, str]:
        """Return context as plain text strings."""
        return {
            'latest_changelog': self._read_latest_changelog(app_path),
            'plan_files': self._read_plan_files(app_path),
            'error_logs': self._read_error_logs(app_path),
            'git_status': self._run_git_status(app_path),
            'recent_tasks': self._get_recent_tasks(app_path),  # For loop detection
        }

    def _read_latest_changelog(self, app_path: str) -> str:
        """Read last 2 changelog entries as-is."""
        changelog_dir = Path(app_path).parent / "changelog"
        if not changelog_dir.exists():
            return "No changelog found."

        # Just read the files, don't parse
        files = sorted(changelog_dir.glob("*.md"), reverse=True)[:2]
        content = []
        for f in files:
            content.append(f"=== {f.name} ===\n{f.read_text()}")
        return "\n\n".join(content)

    def _read_plan_files(self, app_path: str) -> str:
        """Read plan.md, implementation-plan.md, etc as-is."""
        plan_dir = Path(app_path).parent / "plan"
        if not plan_dir.exists():
            return "No plan files found."

        # Read all markdown files
        files = list(plan_dir.glob("*.md"))
        content = []
        for f in files:
            content.append(f"=== {f.name} ===\n{f.read_text()}")
        return "\n\n".join(content)

    def _read_error_logs(self, app_path: str) -> str:
        """Tail recent error logs."""
        # Just use tail, don't parse
        result = subprocess.run(
            f"tail -100 {app_path}/.dev_server_*.log 2>/dev/null || echo 'No logs'",
            shell=True, capture_output=True, text=True
        )
        return result.stdout

    def _run_git_status(self, app_path: str) -> str:
        """Get git status and recent diff."""
        result = subprocess.run(
            f"cd {app_path} && git status && git diff --stat HEAD~1",
            shell=True, capture_output=True, text=True
        )
        return result.stdout

    def _get_recent_tasks(self, app_path: str) -> str:
        """Read last 5 tasks from session for loop detection."""
        session_file = Path(app_path) / ".agent_session.json"
        if not session_file.exists():
            return "No task history."

        session = json.loads(session_file.read_text())
        tasks = session.get("reprompter_context", {}).get("task_history", [])[-5:]
        return "\n".join([f"- {t['task']}" for t in tasks])
```

**Key Point**: Just read files, return strings. The LLM does all the "analysis".

### 2. Prompt Generator Agent (LLM-Powered)

**Purpose**: Ask an LLM to generate the next prompt based on context. Simple!

**Configuration**:
```python
REPROMPTER_CONFIG = {
    "name": "ReprompterAgent",
    "model": "sonnet",  # Claude Sonnet 4.5 (same as AppGeneratorAgent)
    "max_turns": 10,    # Just for analysis/prompt generation
    "allowed_tools": [
        "Read",      # Might need to read files for deeper context
        "Bash",      # Might need to check logs/status
    ],
}
```

**System Prompt** (Emphasizes Subagents & Context Efficiency):
```markdown
You are a development task strategist for an AI app generator system.

Your job is to analyze the current state and generate the NEXT PROMPT for the main agent.

## CONTEXT PROVIDED
You'll receive:
1. Recent changelog entries (what was just done)
2. Plan/implementation files (what's planned)
3. Error logs (what's broken)
4. Git status (what changed)
5. Recent task history (to detect loops)

## YOUR OUTPUT
Generate a multi-paragraph prompt (NOT just one sentence) that guides the main agent.

## CRITICAL PRINCIPLES

### 1. USE SUBAGENTS LIBERALLY

The main agent has access to specialized subagents. **Your prompts should ALWAYS encourage delegating work to subagents.**

**Available Subagents**:
- **research** - Deep research on complex topics, unfamiliar tech, best practices
- **error_fixer** - Diagnosing and fixing errors, debugging issues
- **quality_assurer** - Testing, validation, quality checks
- **code** - Writing/refactoring code, implementing features

**When to delegate** (almost always!):

- **Any error/bug**: Delegate to **error_fixer** subagent
- **Any testing**: Delegate to **quality_assurer** subagent
- **Any coding task**: Delegate to **code** subagent (especially complex features)
- **Any research needed**: Delegate to **research** subagent
- **Complex integrations** (blockchain, AI, etc.): **research** then **code**
- **Stuck on same issue**: **research** to investigate alternatives
- **New feature**: **research** best practices → **code** to implement → **quality_assurer** to test

Example prompts:
```
The /api/children endpoint is returning 500 errors.

Delegate to error_fixer subagent to:
1. Analyze the error logs and stack traces
2. Identify the root cause
3. Implement the fix
4. Verify it works

Then delegate to quality_assurer subagent to test the endpoint thoroughly.
```

```
We need to add user profile editing functionality.

First, delegate to research subagent to:
1. Research best practices for profile editing UX
2. Find secure file upload patterns for avatars
3. Review validation requirements

Then delegate to code subagent to:
1. Implement the backend profile update endpoint
2. Create the frontend profile edit form
3. Add proper validation and error handling

Finally, delegate to quality_assurer subagent to:
1. Test all CRUD operations
2. Test file upload edge cases
3. Verify validation works correctly
```

**KEY PRINCIPLE**: The main agent should orchestrate and delegate, not do everything itself. This keeps context clean and leverages specialized expertise.

### 2. ENCOURAGE PLANNING BEFORE IMPLEMENTING
For non-trivial tasks, delegate planning to research, then implementation to code:

```
We need to add blockchain wallet integration with Base Sepolia.

Step 1: Delegate to research subagent to:
1. Research Base Sepolia integration patterns
2. Compare wallet libraries (wagmi, viem, ethers.js)
3. Document security best practices
4. Create detailed implementation plan

Step 2: Delegate to code subagent to implement based on the research

Step 3: Delegate to quality_assurer subagent to:
1. Test wallet connection flow
2. Test transaction signing
3. Verify error handling
```

### 3. CONTEXT EFFICIENCY
Keep the main agent's context lean by delegating to subagents:
- **research** subagent handles research (doesn't pollute main context)
- **code** subagent handles implementation (keeps code context separate)
- **error_fixer** subagent handles debugging (isolates error investigation)
- **quality_assurer** subagent handles testing (separate test context)

Main agent orchestrates: "Do X, then Y, then Z" - subagents execute.

### 4. ALWAYS INCLUDE TESTING
Delegate testing to **quality_assurer** subagent:
- Browser automation for UI changes
- API testing (curl) for backend changes
- Comprehensive test coverage for new features
- Seed data when needed for realistic testing

### 5. DETECT LOOPS AND ESCALATE TO APPROPRIATE SUBAGENT
If you see the same task in recent history 2+ times, change approach:
```
We've attempted to fix the /api/children endpoint three times without success.

This requires a different approach. Delegate to error_fixer subagent to:
1. Perform deep analysis of the error pattern
2. Check for underlying architectural issues
3. Review similar issues in the codebase
4. Propose alternative solution strategies

If error_fixer can't resolve it, escalate to research subagent to investigate external resources and best practices.
```

## OUTPUT FORMAT
Return ONLY the prompt text (multi-paragraph, detailed).
DO NOT return JSON or structured data - just the prompt as a string.

## PRIORITY ORDER
1. **CRITICAL ERRORS** - Use error_fixer subagent
2. **STUCK TASKS** - Escalate: error_fixer → research → code
3. **EXPLICIT NEXT STEPS** - From changelog, delegate to appropriate subagents
4. **COMPLEX INTEGRATIONS** - research → code → quality_assurer pipeline
5. **PLANNED FEATURES** - Delegate to code, then quality_assurer
6. **TESTING GAPS** - Delegate to quality_assurer
7. **CODE QUALITY** - Delegate to code subagent

## SUBAGENT ORCHESTRATION PATTERN

**Default Pattern for Most Tasks**:
1. **Plan/Research** (if needed) → research subagent
2. **Implement** → code subagent
3. **Test** → quality_assurer subagent
4. **Fix Issues** → error_fixer subagent → back to step 3

**For Errors**:
1. **Diagnose & Fix** → error_fixer subagent
2. **Verify** → quality_assurer subagent
3. **If stuck** → research subagent for alternative approaches

**Remember**: The main agent should be the conductor, not the orchestra. Delegate liberally!
```

**Example Generated Prompts**:

1. **Error Fix (Uses error_fixer subagent)**:
```
The /api/children endpoint is returning 500 errors.

Delegate to error_fixer subagent to:
1. Analyze the error logs and identify the root cause
2. Check for database query issues or schema mismatches
3. Implement the fix with proper error handling
4. Verify the fix works correctly

After the fix, delegate to quality_assurer subagent to test the endpoint with various inputs.
```

2. **New Feature (Uses research → code → quality_assurer)**:
```
We need to add AI-powered opportunity recommendations for the KidIQ app.

Step 1: Delegate to research subagent to:
1. Research recommendation algorithms for educational content
2. Compare AI providers (OpenAI, Anthropic, local models)
3. Review privacy considerations for children's data
4. Create implementation plan with API design

Step 2: Delegate to code subagent to:
1. Implement the recommendation service
2. Add API endpoints for fetching recommendations
3. Create frontend components to display recommendations

Step 3: Delegate to quality_assurer subagent to:
1. Test recommendation quality with seed data
2. Verify API performance under load
3. Test edge cases and error handling
```

3. **Stuck Issue (Escalates through subagents)**:
```
We've tried fixing the /api/children endpoint error three times without success.

Step 1: Delegate to error_fixer subagent to perform deep analysis:
1. Review all previous fix attempts and why they failed
2. Check for architectural issues causing the problem
3. Analyze similar patterns in the codebase
4. Propose alternative solution approaches

Step 2: If error_fixer can't resolve, delegate to research subagent to:
1. Search for similar Drizzle ORM issues online
2. Review best practices for this type of query
3. Find alternative approaches from the community

Step 3: Delegate to code subagent to implement the best solution found

Step 4: Delegate to quality_assurer subagent to verify the fix thoroughly
```

4. **Testing-Only Task (Uses quality_assurer)**:
```
The blockchain wallet integration was just implemented but needs comprehensive testing.

Delegate to quality_assurer subagent to:
1. Seed test data for blockchain scenarios
2. Test wallet connection flow with browser automation
3. Test transaction signing and error handling
4. Verify display of balances and transaction history
5. Test edge cases (network failures, rejected transactions)
6. Test across different wallet providers (MetaMask, WalletConnect)
7. Document all test results and any issues found

If issues are discovered, delegate to error_fixer subagent to resolve them.
```

5. **Code Refactoring (Uses code subagent)**:
```
The authentication code has grown complex and needs refactoring for maintainability.

Delegate to code subagent to:
1. Review current auth implementation
2. Refactor into cleaner, more modular structure
3. Add proper TypeScript types throughout
4. Improve error handling and validation
5. Add code comments for complex logic

After refactoring, delegate to quality_assurer subagent to ensure all auth flows still work correctly.
```

### 3. Simple Implementation Example

**The entire reprompter in ~150 lines**:

```python
class SimpleReprompter:
    """
    LLM-first reprompter. No complex logic, just context → LLM → prompt.
    """

    def __init__(self, app_path: str):
        self.app_path = app_path
        self.context_gatherer = ContextGatherer()

        # Simple reprompter agent
        self.agent = Agent(
            system_prompt=REPROMPTER_SYSTEM_PROMPT,
            model="sonnet",
            max_turns=10,
            allowed_tools=["Read", "Bash"],
        )

    async def get_next_prompt(self) -> str:
        """
        Main method: Gather context, ask LLM, return prompt.
        """
        # 1. Gather context (just read files)
        context = self.context_gatherer.gather_context(self.app_path)

        # 2. Build user message for LLM
        user_message = f"""
Analyze the current state and generate the next development task prompt.

## RECENT WORK (Changelog)
{context['latest_changelog']}

## PLANNED WORK
{context['plan_files']}

## RECENT ERRORS
{context['error_logs']}

## GIT STATUS
{context['git_status']}

## RECENT TASKS (Last 5 - for loop detection)
{context['recent_tasks']}

Generate a multi-paragraph prompt for the main agent that:
- Addresses the highest priority task
- Encourages subagent use for research/complex work
- Includes testing requirements
- Detects if we're stuck (same task 2+ times)
"""

        # 3. Ask LLM
        result = await self.agent.run(user_message)

        # 4. Return the prompt (LLM outputs plain text, not JSON)
        return result.content.strip()

    def should_continue(self, iteration: int, config: Dict) -> bool:
        """Simple iteration limit check."""
        return iteration < config.get("max_iterations", 10)

    def record_task(self, task: str, success: bool):
        """Track task in session for loop detection."""
        session_file = Path(self.app_path) / ".agent_session.json"

        if session_file.exists():
            session = json.loads(session_file.read_text())
        else:
            session = {"reprompter_context": {"task_history": []}}

        session["reprompter_context"]["task_history"].append({
            "task": task,
            "success": success,
            "timestamp": datetime.now().isoformat()
        })

        session_file.write_text(json.dumps(session, indent=2))
```

**That's it!** No complex parsers, no brittle rules, just context → LLM → prompt.

### 4. Loop Orchestrator (Minimal)

**Purpose**: Just track iterations and provide mode control.

**Configuration Schema** (`reprompter-config.yaml`):
```yaml
reprompter:
  enabled: true
  mode: "confirm_first"  # Options: "autonomous", "confirm_first", "interactive"
  max_iterations: 10     # Stop after N iterations and ask user
```

That's it! Simple configuration. Loop detection happens naturally in the LLM (it sees task history).

---

## Integration with run-app-generator.py

**Simple modification to `interactive_loop()`**:

```python
# In run-app-generator.py

async def interactive_loop(agent, app_path: str, config: Dict = None):
    """
    Interactive loop with optional reprompter.
    """
    reprompter = None
    if config and config.get("reprompter", {}).get("enabled"):
        reprompter = SimpleReprompter(app_path)

    iteration = 0
    max_iterations = config.get("reprompter", {}).get("max_iterations", 10)
    mode = config.get("reprompter", {}).get("mode", "confirm_first")

    while True:
        print("\n" + "=" * 80)
        print("✅ Task completed!")
        print("=" * 80)

        # Check if we should continue
        if reprompter and iteration >= max_iterations:
            print(f"\n⏸️  Reached {max_iterations} iterations.")
            choice = input("Continue? (y/n): ").strip().lower()
            if choice != 'y':
                break
            iteration = 0  # Reset counter

        # Get next prompt based on mode
        if reprompter and mode == "autonomous":
            # Autonomous mode: Generate and execute
            next_prompt = await reprompter.get_next_prompt()
            print(f"\n🤖 Auto-continuing (iteration {iteration + 1}):\n{next_prompt}\n")
            user_input = next_prompt

        elif reprompter and mode == "confirm_first":
            # Confirm-first mode: Generate, show, ask permission
            next_prompt = await reprompter.get_next_prompt()
            print(f"\n💡 Suggested next task:\n\n{next_prompt}\n")
            choice = input("Proceed? (y/n/edit): ").strip().lower()

            if choice == 'y':
                user_input = next_prompt
            elif choice == 'n':
                break
            elif choice == 'edit':
                user_input = input("\nEnter modified prompt:\n> ").strip()
            else:
                continue

        else:
            # Interactive mode (original behavior)
            user_input = input("\n💬 What else can I help you with? (or 'done', '/suggest'): ").strip()

            # Add /suggest command
            if user_input == '/suggest' and reprompter:
                suggestion = await reprompter.get_next_prompt()
                print(f"\n💡 Suggestion:\n\n{suggestion}\n")
                continue

        if user_input.lower() in ['done', 'exit', 'quit']:
            break

        # Execute the task
        try:
            app_path, expansion = await agent.resume_generation(app_path, user_input)
            reprompter.record_task(user_input, success=True)
            iteration += 1
        except Exception as e:
            logger.error(f"Error: {e}")
            reprompter.record_task(user_input, success=False)
            continue
```

**That's the entire integration!** ~50 lines added to the existing interactive loop.

---

## Operation Modes

### Mode 1: Autonomous

**Behavior**: Run N iterations without user confirmation.

**Use Case**: Overnight development, CI/CD pipelines

**Example**:
```bash
uv run python run-app-generator.py \
  --resume apps/my-app/app \
  --autonomous \
  --max-iterations 20 \
  "Continue development following the plan"
```

**Workflow**:
1. Complete initial task
2. Analyze context → Generate prompt → Execute (repeat N times)
3. After N iterations: Print summary and exit
4. User reviews logs and decides next steps

### Mode 2: Confirm First (Default)

**Behavior**: Generate prompt, show to user, wait for confirmation.

**Use Case**: Active development with human oversight

**Example**:
```bash
uv run python run-app-generator.py \
  --resume apps/my-app/app \
  --confirm-first \
  "Test the application thoroughly"
```

**Workflow**:
1. Complete initial task
2. Analyze context → Generate prompt
3. **Show prompt to user**: "I suggest: 'Debug the children endpoint...'. Proceed? (y/n/edit)"
4. User options:
   - `y` - Execute as-is
   - `n` - Stop and enter interactive mode
   - `edit` - Modify the prompt before executing
   - `auto N` - Switch to autonomous mode for N iterations
5. Execute and repeat

### Mode 3: Interactive (Current Behavior)

**Behavior**: Ask user for next prompt after each completion.

**Use Case**: Exploratory development, learning

**Example**: Current `run-app-generator.py` behavior

**Enhancement**: Add `/suggest` command:
```
What else can I help you with? /suggest

💡 Suggested next task (based on changelog):
   "Add two children (ages 12 and 6) and test the AI discovery feature with browser automation."

   Rationale: Changelog lists 5 testing steps, only 1 completed.

   Options:
   1. Use this prompt
   2. Edit this prompt
   3. Enter your own prompt

   Your choice (1/2/3):
```

---

## Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1)

**Deliverables**:
- `ContextAnalyzer` class with changelog/plan parsing
- `ReprompterAgent` with basic prompt generation
- Integration into `run-app-generator.py` interactive loop
- Unit tests for context analysis

**Files to Create**:
```
src/app_factory_leonardo_replit/agents/reprompter/
├── __init__.py
├── agent.py              # ReprompterAgent class
├── config.py             # REPROMPTER_CONFIG (borrows from app-generator)
├── context_analyzer.py   # ContextAnalyzer class
├── loop_orchestrator.py  # LoopOrchestrator class
├── prompts.py            # System prompt templates
└── tests/
    ├── test_context_analyzer.py
    └── test_loop_orchestrator.py

config/
└── reprompter-config.yaml  # User-facing configuration
```

**Integration Point**:
```python
# In run-app-generator.py, modify interactive_loop()

async def interactive_loop(agent, app_path: str, reprompter_config: Dict = None):
    """
    Interactive loop with optional reprompter.
    """
    # Initialize reprompter if config provided
    reprompter = None
    if reprompter_config and reprompter_config.get("enabled"):
        from app_factory_leonardo_replit.agents.reprompter import create_reprompter
        reprompter = create_reprompter(reprompter_config)

    while True:
        print("\n" + "=" * 80)
        print("✅ Task completed!")
        print("=" * 80)

        # Reprompter modes
        if reprompter:
            if reprompter_config["mode"] == "autonomous":
                # Generate and execute automatically
                next_prompt = await reprompter.generate_next_prompt(app_path)
                if reprompter.should_continue():
                    print(f"\n🤖 Auto-continuing: {next_prompt}\n")
                    # Execute...
                else:
                    # Reached limit, ask user
                    break

            elif reprompter_config["mode"] == "confirm_first":
                # Generate prompt and ask for confirmation
                suggestion = await reprompter.generate_next_prompt(app_path)
                print(f"\n💡 Suggested next task:\n   {suggestion.prompt}")
                print(f"\n   Rationale: {suggestion.rationale}\n")

                user_choice = input("Proceed? (y/n/edit/auto N): ").strip().lower()
                if user_choice == 'y':
                    user_input = suggestion.prompt
                elif user_choice == 'n':
                    break
                elif user_choice.startswith('edit'):
                    user_input = input("Enter modified prompt: ").strip()
                elif user_choice.startswith('auto'):
                    # Switch to autonomous mode
                    parts = user_choice.split()
                    iterations = int(parts[1]) if len(parts) > 1 else 10
                    reprompter_config["mode"] = "autonomous"
                    reprompter_config["max_iterations"] = iterations
                    continue
                else:
                    continue

        else:
            # Original interactive behavior
            user_input = input("\n💬 What else can I help you with? (or 'done' to exit): ").strip()

            # Add /suggest command
            if user_input == '/suggest' and reprompter:
                suggestion = await reprompter.generate_next_prompt(app_path)
                print(f"\n💡 Suggested: {suggestion.prompt}")
                print(f"   Rationale: {suggestion.rationale}\n")
                continue

        # Rest of interactive loop...
```

### Phase 2: Advanced Features (Week 2)

**Deliverables**:
- Stuck task detection with semantic similarity
- Progress tracking (detect when no meaningful changes occur)
- Smart test injection (auto-add browser testing)
- Configuration file support (`reprompter-config.yaml`)

**Features**:
```python
# In context_analyzer.py
class ContextAnalyzer:
    def _detect_incomplete_features(self, app_path: str) -> List[Feature]:
        """
        Detect features that are partially implemented.

        Indicators:
        - TODO comments in code
        - Empty function bodies
        - Placeholder text in UI
        - Missing error handling
        """
        pass

    def _identify_testing_gaps(self, app_path: str) -> List[TestGap]:
        """
        Identify areas lacking test coverage.

        Focus:
        - New pages without browser tests
        - New API endpoints without curl tests
        - Changed files without updated tests
        """
        pass
```

### Phase 3: Intelligence Layer (Week 3)

**Deliverables**:
- LLM-based prompt generation (not just template-based)
- Semantic similarity for stuck detection
- Learning from past iterations (via session history)
- Smart prioritization based on dependencies

**Example Prompt Generation**:
```python
async def generate_next_prompt(self, app_path: str) -> PromptSuggestion:
    """
    Use LLM to intelligently generate next prompt.
    """
    analysis = await self.context_analyzer.analyze(app_path)

    # Read relevant context files
    changelog = self._read_latest_changelog(app_path)
    plan = self._read_plan_files(app_path)
    errors = self._extract_error_logs(app_path)

    # Generate prompt using LLM
    system_prompt = REPROMPTER_SYSTEM_PROMPT
    user_message = f"""
    Analyze the current state and suggest the next task:

    CHANGELOG EXCERPT:
    {changelog}

    PLAN FILES:
    {plan}

    RECENT ERRORS:
    {errors}

    CONTEXT ANALYSIS:
    Priority: {analysis.priority}
    Description: {analysis.description}

    Generate a clear, actionable prompt for the main agent.
    Always include testing (browser automation for UI, curl for APIs).
    """

    result = await self.agent.run(user_message)

    return PromptSuggestion(
        prompt=result.parsed_output["next_prompt"],
        rationale=result.parsed_output["rationale"],
        priority=result.parsed_output["priority"],
        requires_browser_testing=result.parsed_output["requires_browser_testing"]
    )
```

### Phase 4: Production Hardening (Week 4)

**Deliverables**:
- Comprehensive error handling
- Logging and observability
- Performance optimization (cache analysis results)
- Documentation and examples

---

## Configuration Examples

### Example 1: Aggressive Autonomous Development
```yaml
# reprompter-config.yaml
reprompter:
  enabled: true
  mode: "autonomous"
  max_iterations: 50
  max_consecutive_errors: 5

  stuck_detection:
    enabled: true
    same_task_threshold: 3
    no_progress_threshold: 5

  prompt_generation:
    include_browser_testing: true
    include_api_testing: true
    auto_seed_data: true

  testing:
    always_test_after_change: true
    browser_automation_required: true

  exit_conditions:
    all_plan_items_complete: true
    no_errors: true
```

**Usage**:
```bash
# Start development, let it run overnight
uv run python run-app-generator.py \
  --resume apps/kidiq/app \
  --config config/reprompter-config.yaml \
  "Continue implementing features from the plan"

# Next morning: review logs, fix any issues, repeat
```

### Example 2: Careful Confirm-First Development
```yaml
reprompter:
  enabled: true
  mode: "confirm_first"
  max_iterations: 10
  max_consecutive_errors: 2

  stuck_detection:
    enabled: true
    same_task_threshold: 2

  prompt_generation:
    include_browser_testing: true
```

**Usage**:
```bash
uv run python run-app-generator.py \
  --resume apps/marketplace/app \
  --config config/reprompter-config.yaml \
  "Fix the authentication issues"

# Agent suggests next task, user approves each step
```

### Example 3: Enhanced Interactive Mode
```yaml
reprompter:
  enabled: true
  mode: "interactive"  # Still ask user, but provide smart suggestions

  prompt_generation:
    include_browser_testing: true
    include_api_testing: true
```

**Usage**:
```bash
uv run python run-app-generator.py \
  --resume apps/fizzcard/app \
  "Test the application"

# After completion, user can type /suggest to get AI recommendation
```

---

## Smart Prompt Templates

### Template 1: Critical Error Fix
```
Priority: CRITICAL
Pattern: API endpoint returning 500 error

Prompt Template:
"""
Debug and fix the {endpoint} endpoint that's returning 500 errors.

Steps:
1. Check the server logs for the exact error message
2. Review the route handler in {file_path}
3. Verify database query syntax and field names
4. Test the fix with curl:
   curl -X {method} http://localhost:{port}{endpoint} -H "Content-Type: application/json" -d '{sample_payload}'
5. Verify the fix in the browser with proper authentication

The error appears to be related to: {error_context}
"""
```

### Template 2: Continue Testing
```
Priority: HIGH
Pattern: Explicit next steps in changelog

Prompt Template:
"""
Continue end-to-end testing from the changelog next steps:

{extracted_next_steps}

Use browser automation for comprehensive testing:
1. Open the browser and navigate to the app
2. Test each feature listed above
3. Take screenshots at each step
4. Document any errors or issues found
5. Verify all user flows work correctly

Test credentials: {test_credentials}
"""
```

### Template 3: Implement Feature from Plan
```
Priority: MEDIUM
Pattern: Feature marked TODO in plan.md

Prompt Template:
"""
Implement the "{feature_name}" feature from the plan:

{feature_description}

Implementation steps:
1. Backend: {backend_steps}
2. Frontend: {frontend_steps}
3. Testing: {testing_steps}

After implementation:
- Test the API endpoints with curl
- Test the UI with browser automation
- Update the IMPLEMENTATION-STATUS.md file
"""
```

### Template 4: Testing After Changes
```
Priority: HIGH
Pattern: Code changes without tests

Prompt Template:
"""
{changes_summary}

Now thoroughly test these changes:

Backend Testing:
{api_tests}

Frontend Testing (Browser Automation):
1. Seed test data: curl -X POST http://localhost:{port}/api/seed/enhanced
2. Open browser and login
3. Test each modified feature:
{ui_tests}
4. Verify error handling
5. Test edge cases

Document all test results in a TEST_REPORT.md file.
"""
```

---

## Success Metrics

### Quantitative Metrics
1. **Automation Rate**: % of iterations completed without user intervention
2. **Iteration Efficiency**: Average time per iteration
3. **Error Recovery**: % of errors auto-fixed without escalation
4. **Loop Prevention**: % of stuck situations correctly detected
5. **Test Coverage**: % of changes with automated tests

### Qualitative Metrics
1. **Prompt Quality**: Human evaluation of generated prompts
2. **Context Relevance**: Accuracy of priority detection
3. **User Satisfaction**: Friction reduction in development flow
4. **Code Quality**: Consistency of generated code over iterations

---

## Future Enhancements

### Version 2.0 Features
1. **Multi-Agent Coordination**: Reprompter delegates to specialized subagents
2. **Learning from Feedback**: Improve prompts based on success/failure patterns
3. **Code Coverage Integration**: Auto-detect untested code paths
4. **Visual Regression Testing**: Screenshot comparison across iterations
5. **Performance Monitoring**: Detect performance regressions automatically
6. **Dependency Management**: Auto-update dependencies when needed
7. **Security Scanning**: Auto-fix common security issues (XSS, SQL injection)

### Version 3.0 Features
1. **Multi-App Learning**: Learn patterns across different generated apps
2. **Predictive Planning**: Anticipate needed features before user asks
3. **Collaborative Development**: Multiple agents working in parallel
4. **Self-Improvement**: Reprompter improves its own prompting strategies

---

## Risk Mitigation

### Risk 1: Infinite Loops
**Mitigation**:
- Hard limits on iterations (max_iterations)
- Semantic similarity detection for repeated tasks
- Progress tracking (file changes, test results)
- Escalation to user after threshold

### Risk 2: Breaking Working Code
**Mitigation**:
- Git commits after each successful iteration
- Rollback mechanism on critical failures
- Always test before marking task complete
- Comprehensive browser + API testing

### Risk 3: Cost Explosion
**Mitigation**:
- Token usage tracking and limits
- Efficient context analysis (avoid reading entire codebase)
- Cache analysis results within iterations
- Configurable model selection (use cheaper models for analysis)

### Risk 4: Missing User Intent
**Mitigation**:
- Confirm-first mode as default
- Clear rationale for each suggested prompt
- Easy override and manual mode switching
- Preserve session context for review

---

## Comparison with Alternatives

### Alternative 1: Hardcoded Task Queue
**Pros**: Predictable, simple
**Cons**: Not adaptive, requires manual planning
**Why Reprompter is Better**: Adapts to errors, learns from context

### Alternative 2: Random/Round-Robin Tasks
**Pros**: Ensures all areas get attention
**Cons**: Ignores priorities, may work on wrong things
**Why Reprompter is Better**: Intelligent prioritization based on state

### Alternative 3: User Always Prompts
**Pros**: Maximum control
**Cons**: High friction, slow iteration
**Why Reprompter is Better**: Reduces manual work while maintaining oversight

---

## Conclusion

The Intelligent Reprompter System transforms the app generator from a tool into an autonomous development agent while maintaining human oversight and control. By intelligently analyzing context, generating appropriate prompts, and operating in configurable modes, it enables:

1. **Faster Iteration**: Reduce manual prompting overhead
2. **Better Testing**: Always include comprehensive browser + API testing
3. **Error Recovery**: Auto-fix common issues without escalation
4. **Progress Continuity**: Follow plans and next steps automatically
5. **Human Oversight**: Multiple modes to balance autonomy vs. control

The phased implementation approach allows incremental value delivery while building toward a sophisticated autonomous development system.

---

## Appendix A: Agent Configuration

Based on `AppGeneratorAgent` configuration:

```python
# src/app_factory_leonardo_replit/agents/reprompter/config.py

REPROMPTER_CONFIG = {
    "name": "ReprompterAgent",
    "model": "sonnet",  # Claude Sonnet 4.5 (same as AppGeneratorAgent)
    "max_turns": 10,     # Lighter than AppGeneratorAgent (1000) - just for analysis/prompt generation
    "allowed_tools": [
        # File operations for analysis
        "Read",
        "Glob",
        "Grep",

        # System operations for logs/status
        "Bash",

        # Task management (if needed for sub-delegation)
        "Task",
    ],
}

# Context analysis configuration
CONTEXT_CONFIG = {
    "max_changelog_entries": 3,  # Analyze last N changelog entries
    "max_plan_files": 5,         # Analyze up to N plan files
    "error_log_lines": 100,      # Tail N lines of error logs
    "cache_ttl_seconds": 60,     # Cache analysis results for N seconds
}

# Loop orchestration defaults
LOOP_CONFIG = {
    "default_mode": "confirm_first",
    "default_max_iterations": 10,
    "default_stuck_threshold": 2,
    "default_error_threshold": 3,
}
```

---

## Appendix B: Sample Session Log

```
🤖 AI APP GENERATOR - Prompt to URL
================================================================================
📂 Mode: RESUME
📁 App Path: apps/kidiq/app
📝 Instructions: Test everything thoroughly from the frontend using the browser tool
================================================================================

[... Initial task execution ...]

================================================================================
✅ Task completed!
================================================================================

💡 Suggested next task (Priority: CRITICAL):
   "Debug and fix the /api/children endpoint that's returning 500 errors.
    Check route handler error handling and database query syntax."

   Rationale: API endpoint failure preventing dashboard load.
   Estimated: Simple fix

Proceed? (y/n/edit/auto N): y

🔄 Working on: Debug and fix the /api/children endpoint...

[... Agent fixes the issue ...]

================================================================================
✅ Task completed! (Iteration 1/10)
================================================================================

💡 Suggested next task (Priority: HIGH):
   "Continue end-to-end testing: Add two children (ages 12 and 6, Dorado, Puerto Rico),
    browse opportunities, test AI discovery, verify development dashboard, and test
    complete user flow. Use browser automation for comprehensive frontend testing."

   Rationale: Changelog lists 5 testing steps, only 1 completed.
   Estimated: Moderate complexity

Proceed? (y/n/edit/auto N): auto 5

Switching to autonomous mode for 5 iterations...

🤖 Auto-continuing (Iteration 2/5): Continue end-to-end testing...

[... 5 autonomous iterations ...]

================================================================================
✅ All 5 autonomous iterations completed!
================================================================================

📊 Summary:
   - 5/5 tasks completed successfully
   - 0 errors encountered
   - All tests passing
   - Total time: 45 minutes

💬 What else can I help you with? (or 'done' to exit, '/suggest' for next task): done

👋 Goodbye!
```

---

---

## Summary: Why This Design Works

### Simplicity Wins

**Original Complex Design**: 1000+ lines of code with:
- Brittle regex parsers for changelog/plan files
- Complex priority detection algorithms
- Semantic similarity calculations
- Multiple state machines
- Hard-coded rules for every scenario

**LLM-First Design**: ~200 lines of code with:
- Simple file readers (no parsing!)
- One LLM call to determine next action
- Natural loop detection (LLM sees history)
- Adaptive to any format/structure
- Easy to maintain and extend

### Key Insights

1. **LLMs are better at context understanding than regex**
   - Original: Parse "Next Steps" sections with regex
   - LLM-First: Give LLM the entire changelog, it understands next steps naturally

2. **LLMs can detect patterns we'd miss**
   - Original: Hard-code "if same task 3 times, escalate"
   - LLM-First: LLM sees task history and suggests research when stuck

3. **Prompts are more powerful than code**
   - Original: Thousands of lines to inject testing requirements
   - LLM-First: System prompt says "always include testing" - works universally

4. **Subagent usage is a prompt engineering problem**
   - Original: Code tries to detect when to use research agent
   - LLM-First: Prompt teaches LLM when to suggest research - more adaptive

5. **Context efficiency through subagent delegation**
   - Reprompter prompts encourage using ALL subagents liberally
   - **research** subagent: Keeps research context separate
   - **code** subagent: Keeps implementation context separate
   - **error_fixer** subagent: Isolates debugging context
   - **quality_assurer** subagent: Separates testing context
   - Main agent stays lean, just orchestrates workflow

### Trade-offs

**What we lose**:
- Deterministic behavior (but we gain adaptability)
- Fine-grained control over every decision (but we gain flexibility)

**What we gain**:
- Works with any changelog format
- Works with any plan structure
- Adapts to new scenarios without code changes
- Much easier to maintain and debug
- Naturally improves as LLMs improve
- **Excellent context management** - Each subagent has focused context
- **Specialized expertise** - Right tool for each job
- **Scalability** - Can run subagents in parallel
- **Better delegation** - Main agent orchestrates, doesn't micromanage

### Implementation Timeline

**Phase 1** (1-2 days):
- Context gatherer (~50 lines)
- Simple reprompter with basic system prompt (~100 lines)
- Integration into run-app-generator.py (~50 lines)

**Phase 2** (1 day):
- Refine system prompt based on testing
- Add mode configurations
- Polish user experience

**Total**: ~3 days vs. 4 weeks for complex version

---

**Document Version**: 2.0 - LLM-First Approach
**Last Updated**: January 2025
**Status**: Design Complete - Ready for Implementation
**Complexity**: ~200 LOC vs 1000+ LOC in v1.0
