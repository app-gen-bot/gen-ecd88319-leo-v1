# New Scripts and Commands

## Reprompter System

The reprompter enables autonomous development iterations by analyzing your app's state and generating the next task prompt.

### Three Modes

**1. Confirm-First (Default)**
Reprompter suggests next task, you confirm before proceeding:
```bash
uv run python run-app-generator.py --resume apps/my-app/app "Initial task"
```

**2. Autonomous**
Runs automatically for N iterations without confirmation:
```bash
# Run for 10 iterations (default)
uv run python run-app-generator.py --resume apps/my-app/app "Initial task" \
  --reprompter-mode autonomous

# Run for custom iterations
uv run python run-app-generator.py --resume apps/my-app/app "Initial task" \
  --reprompter-mode autonomous --max-iterations 20
```

**3. Interactive**
Classic manual mode - you provide each prompt:
```bash
uv run python run-app-generator.py --resume apps/my-app/app "Initial task" \
  --reprompter-mode interactive
```

### Test Reprompter

Test the reprompter without running full pipeline:
```bash
uv run python test-reprompter.py
```

### How It Works

The reprompter:
1. Reads latest changelog, plans, error logs, git status, task history
2. Asks LLM to analyze and generate next prompt
3. Emphasizes liberal use of subagents (error_fixer, quality_assurer, code, research)
4. Detects loops (same task 2+ times) and suggests alternatives
5. Generates multi-paragraph prompts with clear action items

### What It Analyzes

- **Recent work**: Last 2 changelog entries (400 lines each to avoid "prompt too long")
- **Planned work**: Files in `plan/` or `specs/` directories (first 200 lines each as preview)
- **Errors**: Last 100 lines of dev server logs
- **Git status**: Current changes and recent diffs
- **Task history**: Last 5 tasks for loop detection

**Note**: The reprompter can use the Read tool to access full files if it needs more context beyond the previews.

### Session Commands

**Confirm-First Mode** (when reprompter suggests a prompt):
- `y` / `yes` / `<enter>` - Accept reprompter's suggestion as-is
- `add` - Add additional instructions (two-step interactive)
- `add:<text>` - Append text inline (e.g., `add:Make sure to add tests`)
- `append:<text>` - Same as `add:` (alias)
- `redirect` - Provide strategic guidance to regenerate prompt (two-step)
- `redirect:<text>` - Provide strategic guidance inline
- Custom text - Replace prompt completely with your own
- `done` / `exit` / `quit` - Exit the loop

**All Modes** (while in interactive loop):
- `done` / `exit` / `quit` - Exit the loop
- `/autonomous <n>` - Switch to autonomous mode for N iterations
- `/context` - Show current session info
- `/save` - Save session explicitly
- `/clear` - Clear session data

### Append to Prompt Feature

The `add` command lets you augment the reprompter's suggestion without retyping everything:

**Two-step mode:**
```bash
✅ Proceed? (y/yes/add/custom prompt/done): add
➕ What should I add to this prompt? Make sure to add comprehensive tests
```

**Inline mode:**
```bash
✅ Proceed? (y/yes/add/custom prompt/done): add:Make sure to add comprehensive tests
```

Both append your text with `IMPORTANT:` prefix to the reprompter's prompt, signaling the agent to give special attention to your addition.

### Strategic Redirect Feature

Sometimes the reprompter's suggestion doesn't align with your strategic vision. Use `redirect` to provide high-level guidance and get a completely new prompt generated.

**Difference from other commands:**
- `y/yes` - Accept suggestion as-is
- `add` - Augment existing suggestion (appends to it)
- `redirect` - **Completely regenerate** with new strategic direction
- Custom text - You write the entire prompt yourself

**Two-step mode:**
```bash
📝 Reprompter suggests:
Add comprehensive tests for the wallet feature with browser automation...

✅ Proceed? (y/yes/add/redirect/custom prompt/done): redirect
🎯 What strategic direction should I take? Focus on building the next major feature instead of testing

🔄 Redirect #1: Focus on building the next major feature instead of testing
🤖 Reprompter regenerating with strategic guidance...

📝 New suggestion based on your guidance:
Build the social sharing feature that allows users to share their FizzCards on social media platforms.

First, delegate to research subagent to:
1. Research social media sharing APIs (Twitter, LinkedIn, Facebook)
2. Analyze best practices for og:meta tags and preview cards
3. Document secure image generation for card previews
...
```

**Inline mode:**
```bash
📝 Reprompter suggests:
Fix the remaining ESLint warnings in the components directory...

✅ Proceed?: redirect:Build revenue features instead of code cleanup

🔄 Redirect #1: Build revenue features instead of code cleanup
🤖 Reprompter regenerating with strategic guidance...

📝 New suggestion based on your guidance:
Implement subscription payment system with Stripe integration.

First, delegate to research subagent to:
1. Research Stripe subscription best practices
2. Compare pricing tier strategies
3. Document webhook security requirements
...
```

**How it works:**
- Reprompter analyzes the app state AGAIN with your strategic guidance
- Generates a completely new prompt aligned with your vision
- You can redirect multiple times (unlimited) until satisfied
- Each redirect re-runs the reprompter with fresh analysis

**Example strategic guidance:**
- "Focus on the next major feature instead of testing"
- "Build revenue features instead of UI polish"
- "Shift to performance optimization"
- "Work on the blockchain integration we've been planning"
- "Prioritize mobile responsiveness over new features"

**When to use redirect vs add:**
- Use `redirect` when you want to change direction completely
- Use `add` when the suggestion is good but needs extra requirements
- Can redirect multiple times to explore different strategic directions

### Multi-Line Input Support

All input prompts support multi-line editing via your preferred editor.

**How to use:**
1. When prompted for input, type `edit` instead of text
2. Your $EDITOR (or nano by default) opens in a temporary file
3. Write your multi-line prompt, save and close
4. Lines starting with `#` are automatically stripped

**Example:**
```bash
✅ Proceed? (y/yes/add/redirect/custom prompt/done): edit

# Opens editor with:
# Enter your input below, save and close to continue
# (Lines starting with # will be ignored)

Build the analytics dashboard feature.

First, research the best React charting libraries
and their performance characteristics. Then implement
a dashboard with the following sections:
- User engagement metrics
- Revenue trends
- Geographic distribution

Make sure to use TypeScript and TanStack Query.
```

**Works everywhere:**
- Initial task prompts
- Add mode (two-step)
- Redirect mode (two-step)
- Custom prompts
- Interactive mode prompts
- Fallback mode

### Autonomous Mode Guidance File

When running in autonomous mode, you can guide the reprompter's behavior without stopping the loop by editing a guidance file.

**File Location:**
```
apps/your-app/app/.reprompter_guidance.txt
```

This file is automatically created at session start and persists throughout. It's checked at the beginning of each iteration.

#### Four Guidance Commands

**1. override** - Bypass reprompter, use your exact prompt
```
override
Build the payment checkout flow with Stripe integration.
Include error handling and webhook verification.
```
Effect: Your text becomes the exact prompt (reprompter skipped). One-time only.

**2. redirect** - Reprompter regenerates with your strategic guidance
```
redirect
Focus on building revenue features instead of tests.
The priority is getting to market, not perfect coverage.
```
Effect: Reprompter re-analyzes app state with your guidance and generates a new prompt. One-time only. The reprompter sees its original suggestion and can intelligently merge based on your phrasing.

**3. add** - Append your requirements to reprompter's suggestion
```
add
Make sure to add comprehensive browser automation tests.
Also ensure all components have proper TypeScript types.
```
Effect: Appends your text with `IMPORTANT:` prefix to reprompter's suggestion. One-time only.

**4. strategic** - Persistent guidance for all remaining iterations
```
strategic
Focus exclusively on core revenue features.
Prioritize functionality over polish.
Defer all testing and refactoring tasks.
```
Effect: Stored in memory and applied to EVERY subsequent iteration until session ends. Use this to shift the entire direction of autonomous work.

#### File Format

```
# Autonomous mode guidance file
# Commands: override | redirect | add | strategic
#
# Write command on first line, guidance below, then save

<command>
<your guidance text>
<can be multiple lines>
```

Lines starting with `#` are ignored. The file is cleared (not deleted) after being read.

#### Lifecycle

1. **Session Start**: File created with instructions
2. **Each Iteration**: File checked at start
3. **If Guidance Found**:
   - Command and text parsed
   - Guidance applied (one-time or persistent)
   - File cleared (emptied but kept)
4. **Next Iteration**: Ready for new guidance

#### Example Workflows

**Scenario 1: Quick Override**
```bash
# You're in autonomous mode, reprompter is about to suggest next task
# You want to build a specific feature right now

# Edit .reprompter_guidance.txt:
override
Add user profile editing with avatar upload and bio fields.

# Next iteration: Your exact prompt is used, reprompter bypassed
# File is cleared, ready for next guidance
```

**Scenario 2: Strategic Redirect**
```bash
# Reprompter keeps suggesting tests, but you want features first

# Edit .reprompter_guidance.txt:
redirect
Build the next major feature instead of testing.
We need to get to MVP faster.

# Next iteration: Reprompter re-analyzes with your guidance
# Generates new prompt focused on features
# File is cleared
```

**Scenario 3: Persistent Strategic Guidance**
```bash
# You want ALL remaining iterations to focus on revenue

# Edit .reprompter_guidance.txt:
strategic
Focus exclusively on revenue-generating features.
Prioritize payment flows, subscriptions, and analytics.
Defer all polish, testing, and refactoring.

# Next iteration: Applied to prompt
# Subsequent iterations: Applied to every prompt
# Stays active until session ends
```

**Scenario 4: Switching to Autonomous Mid-Session**
```bash
# You're in confirm-first or interactive mode
# You want to switch to autonomous for 10 iterations

✅ Proceed?: /autonomous 10

🤖 Switching to autonomous mode for 10 iterations...
   Will run until iteration 15
   Edit apps/your-app/app/.reprompter_guidance.txt to provide guidance

# Now in autonomous mode, guidance file ready for use
```

#### Tips

- **Strategic command** is powerful - it affects ALL remaining iterations
- **Override** is fastest when you know exactly what to do next
- **Redirect** is best when reprompter's direction is wrong
- **Add** is best when reprompter's direction is right but needs extras
- File is always present and ready - no need to create it
- Use multi-line guidance for clarity
- Comments (lines starting with `#`) are ignored