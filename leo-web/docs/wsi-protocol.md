# WSI Protocol Specification (WebSocket Interface)

**Version:** 2.1
**Purpose:**
Provide a bidirectional message protocol over WebSocket that replicates CLI behavior for app generation and iteration.
The protocol maps CLI REPL behavior (`run-app-generator.py`) to WebSocket messages, enabling remote control of the leo-websocket container.
The protocol is **descriptive**, not prescriptive — it defines message semantics, not client UI.

---

## 1. Architecture Context

### Container Lifecycle
```
1. Orchestrator: DockerManager.startContainer(ws_url)
2. Container: Connects WebSocket → sends 'ready'
3. Orchestrator: Sends 'start_generation' with prompt/mode
4. Container: Loads session (if resuming) → sends 'session_loaded'
5. Container: Generates → saves session → commits → pushes GitHub → uploads S3
6. Container: Sends 'iteration_complete' (per iteration) or 'all_work_complete' (when done)
7. Orchestrator: Updates database, can send another job or stopContainer()
```

### CLI Behavior Mapping
- **CLI (New App)**: `run-app-generator.py --app-name myapp "prompt"`
- **CLI (Resume)**: `run-app-generator.py --resume ~/app --mode autonomous "prompt"`
- **WS**: Container receives `start_generation` message, runs `AppGeneratorAgent`, sends progress via WebSocket

### WSI-Specific Requirements

**CRITICAL: Expansion Must Always Be Disabled**

The WSI protocol operates in a single-container-per-user architecture where the container's `/workspace/app` is the only active workspace. Unlike the CLI which may support multiple concurrent apps, WSI must always set `enable_expansion=false` internally.

**Key Architectural Differences:**
- **CLI**: Multi-user system, can expand to other directories
- **WSI**: Single container per generation, `/workspace/app` is fixed workspace
- **Result**: The `enable_expansion` parameter is NOT configurable via WSI messages

**Implementation Requirement:**
When processing `start_generation`, the container MUST always pass `enable_expansion=False` to the `AppGeneratorAgent`, regardless of any client input. This prevents path confusion and ensures predictable container behavior.

---

## 2. Protocol Overview (Message Matrix)

| Origin     | Message Type          | Purpose                                    | CLI Equivalent                             |
| ---------- | --------------------- | ------------------------------------------ | ------------------------------------------ |
| **Server** | `ready`               | Container initialized, awaiting commands   | (implicit - process starts)                |
| **Client** | `start_generation`    | Begin new generation                       | `uv run python run-app-generator.py`       |
| **Server** | `session_loaded`      | **NEW in v2.1** - Session restored from disk | "💾 Loaded session: abc123"              |
| **Server** | `log`                 | Console output streaming                   | stdout/stderr                              |
| **Server** | `progress`            | Stage/step progress updates                | "🔄 Iteration 3/10"                        |
| **Server** | `decision_prompt`     | Request user input (interactive mode)      | `✅ Proceed? (y/yes/add/...): `           |
| **Server** | `decision_follow_up`  | **NEW in v2.1** - Follow-up prompt for add/redirect | `Enter additional details: `      |
| **Client** | `decision_response`   | User's decision                            | User types "yes"                           |
| **Server** | `iteration_complete`  | Single iteration done, more work following | "✅ Task completed!" (mid-loop)            |
| **Server** | `session_saved`       | **NEW in v2.1** - Session saved to disk    | "💾 Session saved: abc123"                |
| **Server** | `session_cleared`     | **NEW in v2.1** - Session cleared          | "🗑️  Session cleared"                     |
| **Server** | `context_display`     | **NEW in v2.1** - Response to /context     | Session info display                       |
| **Server** | `all_work_complete`   | All iterations done, ready for shutdown    | Process exit (success)                     |
| **Server** | `task_interrupted`    | **NEW in v2.1** - User interrupted (Ctrl+C) | "⚠️  Task interrupted"                   |
| **Server** | `error`               | Fatal or non-fatal error occurred          | Process exit (non-zero) or warning         |

---

## 3. Message Specifications

### Container Lifecycle Messages

#### `ready`

**Origin:** Server (Container)
**Timing:** Sent immediately after WebSocket connection established
**Description:** Signals container is initialized and ready to accept `start_generation` commands.

**Fields:**

| Field           | Type   | Required | Description                           |
| --------------- | ------ | -------- | ------------------------------------- |
| `type`          | string | ✓        | Always `"ready"`                      |
| `container_id`  | string | –        | Docker container ID                   |
| `workspace`     | string | –        | Container workspace path              |
| `generator_mode`| string | –        | "real" or "mock"                      |

**Example:**
```json
{
  "type": "ready",
  "container_id": "gen_123",
  "workspace": "/workspace",
  "generator_mode": "real"
}
```

**CLI Equivalent:** None (implicit - process ready when started)

---

#### `start_generation`

**Origin:** Client (Orchestrator)
**Timing:** Sent after receiving `ready` message
**Description:** Initiates app generation with specified prompt and mode.

**Fields:**

| Field              | Type   | Required | Description                                      |
| ------------------ | ------ | -------- | ------------------------------------------------ |
| `type`             | string | ✓        | Always `"start_generation"`                      |
| `prompt`           | string | ✓        | User's natural language instruction              |
| `mode`             | string | ✓        | `"interactive"`, `"confirm_first"`, `"autonomous"` |
| `max_iterations`   | number | –        | Max iterations for autonomous mode (default: 10) |
| `app_path`         | string | –        | Resume existing app (omit for new generation)    |
| `app_name`         | string | –        | **NEW in v2.1** - Required for new apps, used as directory/repo name |
| `resume_session_id`| string | –        | **NEW in v2.1** - Optional session ID to override auto-load |
| `enable_expansion` | boolean| –        | **NEW in v2.1** - Must always be `false` for WSI (see WSI-Specific Requirements) |
| `enable_subagents` | boolean| –        | **NEW in v2.1** - Enable sub-agent execution (default: true) |
| `output_dir`       | string | –        | **NEW in v2.1** - Custom output directory (default: /workspace/app) |

**Example (New App):**
```json
{
  "type": "start_generation",
  "prompt": "Create a todo app with dark mode",
  "mode": "autonomous",
  "max_iterations": 5,
  "app_name": "todo-app",
  "enable_expansion": false,
  "enable_subagents": true
}
```

**Example (Resume Existing):**
```json
{
  "type": "start_generation",
  "prompt": "Add user authentication",
  "mode": "confirm_first",
  "app_path": "/workspace/app",
  "enable_expansion": false
}
```

**CLI Equivalent (New App):**
```bash
uv run python run-app-generator.py \
  --app-name todo-app \
  --mode autonomous \
  --max-iterations 5 \
  --no-expand \
  "Create a todo app with dark mode"
```

**CLI Equivalent (Resume):**
```bash
uv run python run-app-generator.py \
  --resume /workspace/app \
  --mode confirm_first \
  --no-expand \
  "Add user authentication"
```

**CRITICAL:** The `enable_expansion` field must always be `false` in WSI. The container MUST enforce this regardless of client input. See "WSI-Specific Requirements" section.

---

#### `session_loaded` **NEW in v2.1**

**Origin:** Server (Container)
**Timing:** Sent immediately after loading session from disk (when resuming an app)
**Description:** Confirms session was successfully loaded with context details.

**Fields:**

| Field         | Type   | Required | Description                           |
| ------------- | ------ | -------- | ------------------------------------- |
| `type`        | string | ✓        | Always `"session_loaded"`             |
| `session_id`  | string | ✓        | Unique session identifier             |
| `app_path`    | string | ✓        | Path to app directory                 |
| `features`    | array  | –        | List of features in this app          |
| `iterations`  | number | –        | Total iterations completed so far     |
| `last_action` | string | –        | Description of last action performed  |

**Example:**
```json
{
  "type": "session_loaded",
  "session_id": "db83f079",
  "app_path": "/workspace/app",
  "features": ["user authentication", "dark mode", "todo list"],
  "iterations": 3,
  "last_action": "Added dark mode toggle"
}
```

**CLI Equivalent:**
```
💾 Loaded session from /workspace/app/.agent_session.json: db83f079
📋 Previous work: 3 iterations completed
```

---

### Streaming Output Messages

#### `log`

**Origin:** Server (Container)
**Timing:** Sent continuously during generation (maps to stdout/stderr)
**Description:** Streams console output from AppGeneratorAgent.

**Fields:**

| Field   | Type   | Required | Description                          |
| ------- | ------ | -------- | ------------------------------------ |
| `type`  | string | ✓        | Always `"log"`                       |
| `line`  | string | ✓        | Single line of console output        |
| `level` | string | –        | `"info"`, `"warn"`, `"error"`, `"debug"` |

**Example:**
```json
{
  "type": "log",
  "line": "🚀 App Generator starting up...",
  "level": "info"
}
```

**CLI Equivalent:**
```
🚀 App Generator starting up...
✅ Loaded pipeline prompt: 36,760 characters
📁 Output directory: /workspace/app
```

---

#### `progress`

**Origin:** Server (Container)
**Timing:** Sent at key generation milestones
**Description:** Reports structured progress (stage, step, percentage).

**Fields:**

| Field       | Type   | Required | Description                              |
| ----------- | ------ | -------- | ---------------------------------------- |
| `type`      | string | ✓        | Always `"progress"`                      |
| `stage`     | string | –        | Current stage (e.g., "planning", "coding") |
| `step`      | string | –        | Current step description                 |
| `percentage`| number | –        | Progress 0-100                           |
| `iteration` | number | –        | Current iteration number (autonomous mode) |
| `total_iterations` | number | – | Total planned iterations              |

**Example:**
```json
{
  "type": "progress",
  "stage": "coding",
  "step": "Generating frontend components",
  "percentage": 45,
  "iteration": 3,
  "total_iterations": 10
}
```

**CLI Equivalent:**
```
🔄 Iteration 3/10
📝 Generating frontend components... (45%)
```

---

### Interactive Decision Messages

#### `decision_prompt`

**Origin:** Server (Container)
**Timing:** Sent in interactive/confirm_first modes when user input needed
**Description:** Requests user decision (proceed, modify, redirect, custom prompt, done, context commands).

**Fields:**

| Field               | Type                  | Required | Description                            |
| ------------------- | --------------------- | -------- | -------------------------------------- |
| `type`              | string                | ✓        | Always `"decision_prompt"`             |
| `id`                | string                | ✓        | Correlation ID for response matching   |
| `prompt`            | string                | ✓        | Prompt text to display                 |
| `suggested_task`    | string                | –        | **UPDATED in v2.1** - Reprompter's suggested next task (was `suggested_prompt`) |
| `allow_editor`      | boolean               | –        | **NEW in v2.1** - UI hint: allow multi-line editor (default: true) |
| `iteration`         | number                | –        | Current iteration number               |
| `max_iterations`    | number                | –        | Maximum iterations allowed             |
| `options`           | array<string>         | –        | Valid responses (e.g., `["y", "yes", "add", "redirect", "done", "/context", "/save", "/clear"]`) |

**Example:**
```json
{
  "type": "decision_prompt",
  "id": "prompt_001",
  "prompt": "✅ Proceed? (y/yes/add/redirect/custom prompt/done): ",
  "suggested_task": "Add user authentication with email/password",
  "allow_editor": true,
  "iteration": 3,
  "max_iterations": 10,
  "options": ["y", "yes", "add", "redirect", "done", "/context", "/save", "/clear"]
}
```

**CLI Equivalent:**
```
================================================================================
📝 Reprompter suggests:
================================================================================

Add user authentication with email/password

✅ Proceed? (y/yes/add/redirect/custom prompt/done):
   Context commands: /context, /save, /clear
```

---

#### `decision_follow_up` **NEW in v2.1**

**Origin:** Server (Container)
**Timing:** Sent after user chooses "add" or "redirect" to request additional input
**Description:** Two-step decision flow - requests follow-up details for add/redirect operations.

**Fields:**

| Field       | Type   | Required | Description                              |
| ----------- | ------ | -------- | ---------------------------------------- |
| `type`      | string | ✓        | Always `"decision_follow_up"`            |
| `id`        | string | ✓        | New correlation ID for this follow-up    |
| `parent_id` | string | ✓        | ID of original decision_prompt           |
| `prompt`    | string | ✓        | Follow-up prompt text                    |
| `action`    | string | ✓        | `"add"` or `"redirect"` - the action being followed up |

**Example (Add Follow-Up):**
```json
{
  "type": "decision_follow_up",
  "id": "followup_001",
  "parent_id": "prompt_001",
  "prompt": "Enter text to add to the prompt: ",
  "action": "add"
}
```

**Example (Redirect Follow-Up):**
```json
{
  "type": "decision_follow_up",
  "id": "followup_002",
  "parent_id": "prompt_001",
  "prompt": "Enter guidance for reprompter: ",
  "action": "redirect"
}
```

**CLI Equivalent:**
```
✅ Proceed? (y/yes/add/redirect/custom prompt/done): add
Enter text to add to the prompt: Include password reset functionality
```

---

#### `decision_response`

**Origin:** Client (Orchestrator/UI)
**Timing:** Sent in response to `decision_prompt` or `decision_follow_up`
**Description:** User's decision on how to proceed.

**Fields:**

| Field       | Type   | Required | Description                                    |
| ----------- | ------ | -------- | ---------------------------------------------- |
| `type`      | string | ✓        | Always `"decision_response"`                   |
| `id`        | string | ✓        | Matches `decision_prompt.id` or `decision_follow_up.id` |
| `parent_id` | string | –        | **NEW in v2.1** - If responding to follow-up, references original prompt |
| `choice`    | string | ✓        | User's choice: `"yes"`, `"add"`, `"redirect"`, `"done"`, `"/context"`, `"/save"`, `"/clear"`, or custom prompt |
| `input`     | string | –        | Additional input (for follow-ups or custom prompts) |

**Example (yes):**
```json
{
  "type": "decision_response",
  "id": "prompt_001",
  "choice": "yes"
}
```

**Example (add - first step):**
```json
{
  "type": "decision_response",
  "id": "prompt_001",
  "choice": "add"
}
```

**Example (add - second step with follow-up):**
```json
{
  "type": "decision_response",
  "id": "followup_001",
  "parent_id": "prompt_001",
  "choice": "add",
  "input": "Make sure to include password reset functionality"
}
```

**Example (custom prompt):**
```json
{
  "type": "decision_response",
  "id": "prompt_001",
  "choice": "Focus on the database schema first, then the API"
}
```

**Example (context command):**
```json
{
  "type": "decision_response",
  "id": "prompt_001",
  "choice": "/context"
}
```

**CLI Equivalent:**
```
✅ Proceed? (y/yes/add/redirect/custom prompt/done): yes
```
or
```
✅ Proceed? (y/yes/add/redirect/custom prompt/done): add
Enter text to add to the prompt: Make sure to include password reset
```
or
```
✅ Proceed? (y/yes/add/redirect/custom prompt/done): /context
```

---

### Session Management Messages **NEW in v2.1**

#### `session_saved`

**Origin:** Server (Container)
**Timing:** Sent after explicitly saving session (via /save command) or automatically after each iteration
**Description:** Confirms session was saved to disk with updated context.

**Fields:**

| Field        | Type   | Required | Description                           |
| ------------ | ------ | -------- | ------------------------------------- |
| `type`       | string | ✓        | Always `"session_saved"`              |
| `session_id` | string | ✓        | Unique session identifier             |
| `app_path`   | string | ✓        | Path to app directory                 |
| `auto`       | boolean| –        | True if auto-saved (vs explicit /save)|

**Example (Explicit Save):**
```json
{
  "type": "session_saved",
  "session_id": "db83f079",
  "app_path": "/workspace/app",
  "auto": false
}
```

**Example (Auto Save):**
```json
{
  "type": "session_saved",
  "session_id": "db83f079",
  "app_path": "/workspace/app",
  "auto": true
}
```

**CLI Equivalent:**
```
💾 Session saved to /workspace/app/.agent_session.json: db83f079
```

---

#### `session_cleared`

**Origin:** Server (Container)
**Timing:** Sent in response to /clear command
**Description:** Confirms session was cleared from disk.

**Fields:**

| Field     | Type   | Required | Description                           |
| --------- | ------ | -------- | ------------------------------------- |
| `type`    | string | ✓        | Always `"session_cleared"`            |
| `app_path`| string | ✓        | Path to app directory                 |

**Example:**
```json
{
  "type": "session_cleared",
  "app_path": "/workspace/app"
}
```

**CLI Equivalent:**
```
🗑️  Session cleared for /workspace/app
```

---

#### `context_display`

**Origin:** Server (Container)
**Timing:** Sent in response to /context command
**Description:** Displays current session context information.

**Fields:**

| Field         | Type   | Required | Description                           |
| ------------- | ------ | -------- | ------------------------------------- |
| `type`        | string | ✓        | Always `"context_display"`            |
| `session_id`  | string | –        | Current session ID (if exists)        |
| `app_path`    | string | ✓        | Path to app directory                 |
| `features`    | array  | –        | List of features in this app          |
| `iterations`  | number | –        | Total iterations completed            |
| `last_action` | string | –        | Description of last action performed  |
| `mode`        | string | –        | Current operation mode                |

**Example:**
```json
{
  "type": "context_display",
  "session_id": "db83f079",
  "app_path": "/workspace/app",
  "features": ["user authentication", "dark mode", "todo list"],
  "iterations": 3,
  "last_action": "Added dark mode toggle",
  "mode": "confirm_first"
}
```

**CLI Equivalent:**
```
================================================================================
📋 Session Context
================================================================================
Session ID: db83f079
App Path: /workspace/app
Mode: confirm_first
Iterations: 3
Features: user authentication, dark mode, todo list
Last Action: Added dark mode toggle
```

---

### Completion Messages

#### `iteration_complete`

**Origin:** Server (Container)
**Timing:** Sent after each iteration completes (in all modes)
**Description:** Signals one iteration finished, more work may follow.

**Fields:**

| Field          | Type   | Required | Description                          |
| -------------- | ------ | -------- | ------------------------------------ |
| `type`         | string | ✓        | Always `"iteration_complete"`        |
| `iteration`    | number | ✓        | Iteration number just completed      |
| `session_id`   | string | –        | **NEW in v2.1** - Current session ID |
| `session_saved`| boolean| –        | **NEW in v2.1** - Whether session was saved |
| `app_path`     | string | ✓        | Path to generated app                |
| `stats`        | object | –        | Generation stats (files, lines, etc.) |
| `duration`     | number | –        | Iteration duration (milliseconds)    |

**Example:**
```json
{
  "type": "iteration_complete",
  "iteration": 3,
  "session_id": "db83f079",
  "session_saved": true,
  "app_path": "/workspace/app",
  "stats": {
    "files_created": 12,
    "lines_of_code": 850
  },
  "duration": 45000
}
```

**CLI Equivalent:**
```
================================================================================
✅ Task completed!
================================================================================
💾 Session saved to /workspace/app/.agent_session.json: db83f079
```

**Orchestrator Action:** Update UI progress (e.g., "Iteration 3/10 complete"), DO NOT shutdown container.

---

#### `all_work_complete`

**Origin:** Server (Container)
**Timing:** Sent when ALL iterations complete OR user says "done"
**Description:** Signals generation finished, container ready for shutdown. Container has already pushed to GitHub and uploaded to S3.

**Fields:**

| Field              | Type   | Required | Description                              |
| ------------------ | ------ | -------- | ---------------------------------------- |
| `type`             | string | ✓        | Always `"all_work_complete"`             |
| `completion_reason`| string | ✓        | **NEW in v2.1** - `"max_iterations"`, `"user_done"`, `"error"` |
| `app_path`         | string | ✓        | Path to generated app                    |
| `session_id`       | string | –        | **NEW in v2.1** - Final session ID       |
| `github_url`       | string | –        | GitHub repository URL                    |
| `s3_url`           | string | –        | S3 download URL                          |
| `download_url`     | string | –        | Public download URL                      |
| `total_iterations` | number | ✓        | Total iterations performed               |
| `total_duration`   | number | –        | Total generation time (milliseconds)     |
| `stats`            | object | –        | Final generation statistics              |

**Example (Max Iterations):**
```json
{
  "type": "all_work_complete",
  "completion_reason": "max_iterations",
  "app_path": "/workspace/app",
  "session_id": "db83f079",
  "github_url": "https://github.com/user/generated-app",
  "s3_url": "https://s3.amazonaws.com/bucket/gen_123.zip",
  "download_url": "https://app.example.com/api/generations/123/download",
  "total_iterations": 10,
  "total_duration": 234000,
  "stats": {
    "files_created": 45,
    "lines_of_code": 3200,
    "total_cost": 2.45
  }
}
```

**Example (User Done):**
```json
{
  "type": "all_work_complete",
  "completion_reason": "user_done",
  "app_path": "/workspace/app",
  "session_id": "db83f079",
  "github_url": "https://github.com/user/generated-app",
  "total_iterations": 5,
  "total_duration": 120000
}
```

**CLI Equivalent (Max Iterations):**
```
================================================================================
✅ MODIFICATIONS COMPLETE (Session preserved)
================================================================================
💾 Session saved to /workspace/app/.agent_session.json: db83f079

🔄 Iteration 10/10 (max iterations reached)
```

**CLI Equivalent (User Done):**
```
================================================================================
✅ MODIFICATIONS COMPLETE (Session preserved)
================================================================================
💾 Session saved to /workspace/app/.agent_session.json: db83f079

User requested completion
```

**Orchestrator Action:**
1. Update database with URLs (github_url, s3_url, download_url)
2. Broadcast `status_change` to UI (show download button)
3. **Safe to call `stopContainer()`** (or keep alive for next job)

---

### Error and Interruption Messages

#### `task_interrupted` **NEW in v2.1**

**Origin:** Server (Container)
**Timing:** Sent when user interrupts task (Ctrl+C in CLI, stop button in UI)
**Description:** Reports graceful interruption, session state preserved.

**Fields:**

| Field        | Type   | Required | Description                           |
| ------------ | ------ | -------- | ------------------------------------- |
| `type`       | string | ✓        | Always `"task_interrupted"`           |
| `iteration`  | number | –        | Iteration when interrupted            |
| `session_id` | string | –        | Current session ID (preserved)        |
| `app_path`   | string | ✓        | Path to app directory                 |
| `can_resume` | boolean| –        | Whether work can be resumed (default: true) |

**Example:**
```json
{
  "type": "task_interrupted",
  "iteration": 3,
  "session_id": "db83f079",
  "app_path": "/workspace/app",
  "can_resume": true
}
```

**CLI Equivalent:**
```
⚠️  Task interrupted by user (Ctrl+C)
💾 Session preserved - you can resume with: run-app-generator.py --resume /workspace/app
```

**Orchestrator Action:**
- Update UI to show "paused" state
- Allow user to resume with new `start_generation` message
- DO NOT automatically shutdown container

---

#### `error`

**Origin:** Server (Container)
**Timing:** Sent on error that prevents or disrupts continuation
**Description:** Reports error details for orchestrator to log and display. Can be fatal or non-fatal.

**Fields:**

| Field       | Type   | Required | Description                       |
| ----------- | ------ | -------- | --------------------------------- |
| `type`      | string | ✓        | Always `"error"`                  |
| `message`   | string | ✓        | Human-readable error message      |
| `error_code`| string | –        | Machine-readable error code       |
| `details`   | object | –        | Additional error context          |
| `fatal`     | boolean| –        | **UPDATED in v2.1** - If true, container cannot continue; if false, container can recover (default: true) |
| `recovery_hint`| string | –     | **NEW in v2.1** - Suggestion for recovery (if fatal=false) |

**Example (Fatal Error):**
```json
{
  "type": "error",
  "message": "Failed to generate app: Claude API rate limit exceeded",
  "error_code": "RATE_LIMIT",
  "details": {
    "retry_after": 60
  },
  "fatal": true
}
```

**Example (Non-Fatal Error):**
```json
{
  "type": "error",
  "message": "GitHub push failed: network timeout",
  "error_code": "GITHUB_TIMEOUT",
  "fatal": false,
  "recovery_hint": "Generation completed successfully, but GitHub push can be retried manually"
}
```

**CLI Equivalent (Fatal):**
```
❌ Fatal error: Claude API rate limit exceeded
```

**CLI Equivalent (Non-Fatal):**
```
⚠️  Warning: GitHub push failed (network timeout)
✅ Generation completed successfully, you can push manually later
```

**Orchestrator Action (Fatal):**
1. Update database (status='failed', errorMessage)
2. Broadcast error to UI
3. Call `stopContainer()`

**Orchestrator Action (Non-Fatal):**
1. Log warning to database
2. Show warning in UI
3. Continue normal flow (may still receive `all_work_complete`)

---

## 4. Session Management Lifecycle

### Overview

Sessions are the container's mechanism for maintaining state across iterations and enabling resume functionality. The CLI automatically handles session loading, saving, and clearing. WSI must replicate this behavior through explicit messages.

### Session File Structure

Sessions are stored as `.agent_session.json` in the app directory:

```json
{
  "session_id": "db83f079",
  "app_path": "/workspace/app",
  "created_at": "2025-01-06T10:30:00Z",
  "updated_at": "2025-01-06T11:45:00Z",
  "features": ["user authentication", "dark mode"],
  "iterations": 3,
  "last_action": "Added dark mode toggle",
  "mode": "confirm_first"
}
```

### Session Lifecycle by Mode

#### New App Generation
```
1. Container receives start_generation (no app_path)
2. Container creates new session
3. Container sends session_saved (after first iteration)
4. Container sends session_saved after each iteration
5. Container sends all_work_complete (session preserved)
```

#### Resume Existing App
```
1. Container receives start_generation (with app_path)
2. Container loads session from app_path/.agent_session.json
3. Container sends session_loaded (with context)
4. Container sends session_saved after each iteration
5. Container sends all_work_complete (session preserved)
```

### Automatic Session Saving

The container MUST automatically save session:
- After each successful iteration
- Before sending `iteration_complete`
- Before sending `all_work_complete`
- After processing context commands

This ensures session state is never lost, even if container crashes.

### Session Management via Context Commands

Users can explicitly manage sessions through decision_response:

**View Session:** `/context` → `context_display`
**Save Session:** `/save` → `session_saved`
**Clear Session:** `/clear` → `session_cleared`

These commands are only available in interactive/confirm_first modes at decision prompts.

---

## 5. Context Commands

**NEW in v2.1**: Context commands enable users to view and manage session state during interactive/confirm_first modes.

### Available Commands

#### `/context` - View Session Information

**Purpose:** Display current session context without modifying state.

**Request:**
```json
{
  "type": "decision_response",
  "id": "prompt_001",
  "choice": "/context"
}
```

**Response:**
```json
{
  "type": "context_display",
  "session_id": "db83f079",
  "app_path": "/workspace/app",
  "features": ["user authentication", "dark mode"],
  "iterations": 3,
  "last_action": "Added dark mode toggle",
  "mode": "confirm_first"
}
```

**After Response:** Container sends another `decision_prompt` to continue workflow.

---

#### `/save` - Explicitly Save Session

**Purpose:** Force session save to disk (normally happens automatically after each iteration).

**Request:**
```json
{
  "type": "decision_response",
  "id": "prompt_001",
  "choice": "/save"
}
```

**Response:**
```json
{
  "type": "session_saved",
  "session_id": "db83f079",
  "app_path": "/workspace/app",
  "auto": false
}
```

**After Response:** Container sends another `decision_prompt` to continue workflow.

**CLI Equivalent:**
```
✅ Proceed? (y/yes/add/redirect/custom prompt/done): /save
💾 Session saved to /workspace/app/.agent_session.json: db83f079
✅ Proceed? (y/yes/add/redirect/custom prompt/done):
```

---

#### `/clear` - Clear Session

**Purpose:** Delete session file from disk, start fresh on next iteration.

**Request:**
```json
{
  "type": "decision_response",
  "id": "prompt_001",
  "choice": "/clear"
}
```

**Response:**
```json
{
  "type": "session_cleared",
  "app_path": "/workspace/app"
}
```

**After Response:** Container sends another `decision_prompt` to continue workflow.

**Warning:** Clearing session removes all context. Next iteration will start without previous task history.

**CLI Equivalent:**
```
✅ Proceed? (y/yes/add/redirect/custom prompt/done): /clear
🗑️  Session cleared for /workspace/app
✅ Proceed? (y/yes/add/redirect/custom prompt/done):
```

---

### Command Availability

| Mode | Context Commands Available? |
|------|----------------------------|
| interactive | ✓ Yes (at all decision prompts) |
| confirm_first | ✓ Yes (at all decision prompts) |
| autonomous | ✗ No (no user interaction) |

---

## 6. Message Flow Examples

### Example 1: Autonomous Mode (Happy Path)

```
1. Container → Orchestrator: ready
2. Orchestrator → Container: start_generation (mode="autonomous", max_iterations=3, app_name="myapp", enable_expansion=false)
3. Container → Orchestrator: log ("🚀 App Generator starting up...")
4. Container → Orchestrator: log ("✅ Loaded pipeline prompt...")
5. Container → Orchestrator: progress (iteration=1, percentage=10)
6. Container → Orchestrator: log ("AppGeneratorAgent: Creating database schema...")
7. Container → Orchestrator: progress (iteration=1, percentage=50)
8. Container → Orchestrator: session_saved (session_id="abc123", auto=true)
9. Container → Orchestrator: iteration_complete (iteration=1, session_saved=true)
10. Container → Orchestrator: progress (iteration=2, percentage=60)
11. Container → Orchestrator: log ("AppGeneratorAgent: Building frontend...")
12. Container → Orchestrator: session_saved (session_id="abc123", auto=true)
13. Container → Orchestrator: iteration_complete (iteration=2, session_saved=true)
14. Container → Orchestrator: progress (iteration=3, percentage=90)
15. Container → Orchestrator: session_saved (session_id="abc123", auto=true)
16. Container → Orchestrator: iteration_complete (iteration=3, session_saved=true)
17. Container → Orchestrator: log ("Pushing to GitHub...")
18. Container → Orchestrator: log ("Uploading to S3...")
19. Container → Orchestrator: all_work_complete (completion_reason="max_iterations", github_url, s3_url, total_iterations=3)
20. Orchestrator → Container: (closes connection or sends another start_generation)
```

---

### Example 2: Interactive Mode with Context Commands

```
1. Container → Orchestrator: ready
2. Orchestrator → Container: start_generation (mode="interactive", app_name="myapp", enable_expansion=false)
3. Container → Orchestrator: log ("🚀 App Generator starting up...")
4. Container → Orchestrator: progress (iteration=1, percentage=30)
5. Container → Orchestrator: session_saved (session_id="xyz789", auto=true)
6. Container → Orchestrator: iteration_complete (iteration=1, session_saved=true)
7. Container → Orchestrator: decision_prompt (id="p1", prompt="Next task?", options=[..."/context"...])
8. Orchestrator → Container: decision_response (id="p1", choice="/context")
9. Container → Orchestrator: context_display (session_id="xyz789", iterations=1, features=[...])
10. Container → Orchestrator: decision_prompt (id="p2", prompt="Next task?")
11. Orchestrator → Container: decision_response (id="p2", choice="Add dark mode support")
12. Container → Orchestrator: progress (iteration=2, percentage=60)
13. Container → Orchestrator: session_saved (session_id="xyz789", auto=true)
14. Container → Orchestrator: iteration_complete (iteration=2, session_saved=true)
15. Container → Orchestrator: decision_prompt (id="p3", prompt="Continue?")
16. Orchestrator → Container: decision_response (id="p3", choice="done")
17. Container → Orchestrator: all_work_complete (completion_reason="user_done", total_iterations=2)
```

---

### Example 3: Confirm-First Mode with Two-Step Add Flow

```
1. Container → Orchestrator: ready
2. Orchestrator → Container: start_generation (mode="confirm_first", max_iterations=5, app_name="myapp", enable_expansion=false)
3. Container → Orchestrator: progress (iteration=1)
4. Container → Orchestrator: session_saved (auto=true)
5. Container → Orchestrator: iteration_complete (iteration=1)
6. Container → Orchestrator: decision_prompt (id="p1", suggested_task="Add user authentication")
7. Orchestrator → Container: decision_response (id="p1", choice="add")
8. Container → Orchestrator: decision_follow_up (id="f1", parent_id="p1", prompt="Enter text to add:", action="add")
9. Orchestrator → Container: decision_response (id="f1", parent_id="p1", input="Include password reset functionality")
10. Container → Orchestrator: progress (iteration=2)
11. Container → Orchestrator: session_saved (auto=true)
12. Container → Orchestrator: iteration_complete (iteration=2)
13. Container → Orchestrator: decision_prompt (id="p2", suggested_task="Add 2FA support")
14. Orchestrator → Container: decision_response (id="p2", choice="yes")
15. Container → Orchestrator: progress (iteration=3)
16. Container → Orchestrator: session_saved (auto=true)
17. Container → Orchestrator: iteration_complete (iteration=3)
18. ... (continues until max_iterations or user says "done")
```

---

### Example 4: Resume with Session Load

```
1. Container → Orchestrator: ready
2. Orchestrator → Container: start_generation (mode="confirm_first", app_path="/workspace/app", enable_expansion=false)
3. Container → Orchestrator: session_loaded (session_id="db83f079", iterations=3, features=["auth", "dark mode"])
4. Container → Orchestrator: log ("Resuming from previous session...")
5. Container → Orchestrator: decision_prompt (id="p1", suggested_task="Add email notifications")
6. Orchestrator → Container: decision_response (id="p1", choice="yes")
7. Container → Orchestrator: progress (iteration=4)
8. Container → Orchestrator: session_saved (session_id="db83f079", auto=true)
9. Container → Orchestrator: iteration_complete (iteration=4)
10. Container → Orchestrator: decision_prompt (id="p2", prompt="Continue?")
11. Orchestrator → Container: decision_response (id="p2", choice="done")
12. Container → Orchestrator: all_work_complete (completion_reason="user_done", total_iterations=4)
```

---

### Example 5: Interruption and Recovery

```
1. Container → Orchestrator: ready
2. Orchestrator → Container: start_generation (mode="autonomous", max_iterations=10, app_name="myapp", enable_expansion=false)
3. Container → Orchestrator: progress (iteration=1)
4. Container → Orchestrator: session_saved (auto=true)
5. Container → Orchestrator: iteration_complete (iteration=1)
6. Container → Orchestrator: progress (iteration=2)
7. [User clicks Stop button in UI]
8. Orchestrator → Container: (sends interruption signal)
9. Container → Orchestrator: session_saved (session_id="abc123", auto=true)
10. Container → Orchestrator: task_interrupted (iteration=2, session_id="abc123", can_resume=true)
11. [User later clicks Resume]
12. Orchestrator → Container: start_generation (mode="autonomous", app_path="/workspace/app", enable_expansion=false)
13. Container → Orchestrator: session_loaded (session_id="abc123", iterations=2)
14. Container → Orchestrator: progress (iteration=3)
15. ... (continues normally)
```

---

### Example 6: Non-Fatal Error Recovery

```
1. Container → Orchestrator: ready
2. Orchestrator → Container: start_generation (mode="autonomous", max_iterations=5, app_name="myapp", enable_expansion=false)
3. Container → Orchestrator: progress (iteration=1)
4. Container → Orchestrator: session_saved (auto=true)
5. Container → Orchestrator: iteration_complete (iteration=1)
6. Container → Orchestrator: progress (iteration=2)
7. Container → Orchestrator: session_saved (auto=true)
8. Container → Orchestrator: iteration_complete (iteration=2)
9. Container → Orchestrator: progress (iteration=3)
10. Container → Orchestrator: log ("Pushing to GitHub...")
11. Container → Orchestrator: error (message="GitHub push failed: network timeout", fatal=false, recovery_hint="Can push manually")
12. Container → Orchestrator: session_saved (auto=true)
13. Container → Orchestrator: iteration_complete (iteration=3)
14. ... (continues to iteration 4-5, then all_work_complete)
```

---

### Example 7: Fatal Error Case

```
1. Container → Orchestrator: ready
2. Orchestrator → Container: start_generation (mode="autonomous", app_name="myapp", enable_expansion=false)
3. Container → Orchestrator: log ("🚀 Starting...")
4. Container → Orchestrator: progress (iteration=1, percentage=20)
5. Container → Orchestrator: error (message="API token invalid", error_code="AUTH_ERROR", fatal=true)
6. Orchestrator: Updates DB (status='failed'), stops container
```

---

## 7. Timing Contracts

### Rule 1: Wait for `ready` before sending `start_generation`
**Violation:** Race condition - command sent before container listening
**Enforcement:** Orchestrator blocks until `ready` received (30s timeout)

### Rule 2: Only shutdown after `all_work_complete`, `task_interrupted`, or fatal `error`
**Violation:** Container killed mid-iteration, work lost
**Enforcement:** Orchestrator waits for completion signal, not arbitrary timeout

### Rule 3: Container pushes GitHub/S3 BEFORE sending `all_work_complete`
**Violation:** URLs in message but files not actually uploaded
**Enforcement:** Container validates uploads succeeded before sending message

### Rule 4: `iteration_complete` does NOT signal shutdown readiness
**Violation:** Orchestrator shuts down after first iteration in autonomous mode
**Enforcement:** Orchestrator distinguishes `iteration_complete` (progress) from `all_work_complete` (done)

### Rule 5: Session saved before `iteration_complete` **NEW in v2.1**
**Violation:** Session state lost if container crashes between iteration and save
**Enforcement:** Container sends `session_saved` before `iteration_complete`, includes `session_saved=true` in iteration_complete

### Rule 6: Two-step decision flow for add/redirect **NEW in v2.1**
**Violation:** Container processes "add" choice without follow-up input
**Enforcement:** When user chooses "add" or "redirect", container MUST send `decision_follow_up` and wait for `decision_response` with input before proceeding

### Rule 7: Context commands return to decision prompt **NEW in v2.1**
**Violation:** Container ends workflow after /context or /save command
**Enforcement:** After processing context command, container MUST send new `decision_prompt` to continue workflow

---

## 8. Protocol Invariants

1. **One `ready` per container** - Sent once after connection, never again
2. **One `start_generation` per job** - Starts new work (or multiple if container reused)
3. **Zero or one `session_loaded` per job** - Only when resuming existing app
4. **Many `log` messages** - Unbounded streaming during generation
5. **Many `session_saved` messages** - One per iteration (automatic) plus optional explicit saves
6. **Many `iteration_complete` messages** - One per iteration (1 to max_iterations)
7. **One `all_work_complete` per job** - Sent exactly once when done
8. **Zero or one `task_interrupted` per job** - If sent, no `all_work_complete` follows (until resumed)
9. **Zero or one fatal `error` per job** - If sent, no `all_work_complete` follows
10. **Many non-fatal `error` messages** - Can occur without ending workflow
11. **`decision_follow_up` always follows specific `decision_response`** - Only after "add" or "redirect" choice
12. **Context commands (`context_display`, `session_saved`, `session_cleared`) always followed by new `decision_prompt`** - Workflow continues after context operations

---

## 9. Migration from Protocol v2.0

### Changes in v2.1

#### Breaking Changes
- `decision_prompt.suggested_prompt` renamed to `suggested_task` (semantic clarity)
- `start_generation.flags` removed (replaced with explicit fields)
- `enable_expansion` must always be `false` (architectural requirement)

#### New Required Fields
- `start_generation.app_name` (required for new apps)
- `start_generation.enable_expansion` (must be false)
- `all_work_complete.completion_reason` (required)

#### New Optional Fields
- `start_generation.resume_session_id`
- `start_generation.enable_subagents`
- `start_generation.output_dir`
- `decision_prompt.allow_editor`
- `decision_response.parent_id`
- `iteration_complete.session_id`
- `iteration_complete.session_saved`
- `error.fatal` (default: true)
- `error.recovery_hint`

#### New Message Types
- `session_loaded` - Session restoration confirmation
- `session_saved` - Explicit session save confirmation
- `session_cleared` - Session deletion confirmation
- `context_display` - Session context information
- `decision_follow_up` - Two-step decision flow
- `task_interrupted` - Graceful interruption handling

#### New Functionality
- Session management lifecycle (automatic save/load)
- Context commands (/context, /save, /clear)
- Two-step decision flow for add/redirect
- Non-fatal error support
- Explicit completion reasons

### Migration Path

**For Container Implementations:**
1. Add session management (load on resume, save after each iteration)
2. Send `session_loaded` when resuming
3. Send `session_saved` after each iteration
4. Implement context command handlers
5. Implement two-step add/redirect flow
6. Add `completion_reason` to `all_work_complete`
7. Support `fatal` field in errors
8. Always enforce `enable_expansion=false`

**For Orchestrator/UI Implementations:**
1. Update `start_generation` to include `app_name` for new apps
2. Always set `enable_expansion=false`
3. Handle new session management messages
4. Support context commands in UI
5. Implement two-step flow for add/redirect
6. Handle `task_interrupted` for stop/resume
7. Display non-fatal errors as warnings
8. Show `completion_reason` in UI

**Backward Compatibility:**
- v2.0 containers will still work (missing fields have defaults)
- v2.0 orchestrators should ignore unknown message types
- `suggested_prompt` accepted as alias for `suggested_task` (deprecated)

---

## 10. Summary

This protocol enables remote control of the CLI REPL (`run-app-generator.py`) via WebSocket messages with complete behavioral parity.

**Key principles:**
- **CLI as reference** - Protocol maps CLI behavior, doesn't invent new behavior
- **Explicit timing** - Each message has clear timing contract
- **Session preservation** - Automatic session management ensures state never lost
- **Self-contained container** - Container owns generation, session, GitHub push, S3 upload
- **Orchestrator as router** - Orchestrator routes messages, updates database, manages lifecycle
- **Expansion always disabled** - WSI enforces single-workspace architecture

**Core message types:**
- `ready` - Container initialized
- `start_generation` - Begin work (with app_name for new apps, enable_expansion always false)
- `session_loaded` - Session restored from disk
- `log` - Console output streaming
- `progress` - Structured progress updates
- `decision_prompt` / `decision_follow_up` / `decision_response` - Interactive decisions with two-step flow
- `session_saved` / `session_cleared` / `context_display` - Session management
- `iteration_complete` - One iteration done (session saved, more work following)
- `all_work_complete` - All work done (with completion_reason, safe to shutdown)
- `task_interrupted` - Graceful interruption (session preserved, can resume)
- `error` - Fatal or non-fatal errors

**New in v2.1:**
- Comprehensive session management with automatic save/load
- Context commands for runtime session control
- Two-step decision flow (add/redirect require follow-up)
- Interruption handling with resume capability
- Non-fatal error support for graceful degradation
- Explicit completion reasons for better UI feedback
- Enforced `enable_expansion=false` for WSI architecture

This protocol eliminates timing races, enables container reuse, supports interruption/resume, provides session continuity, and ensures complete behavioral parity with CLI REPL.
