# Session Management Implementation (v2 - App-Specific)

## Overview
Implemented app-specific session management that automatically maintains context per app. Sessions are now stored in each app's directory and automatically discovered when resuming work, solving the issue where the agent "forgets everything" between prompts.

## Problem Statement
Previously, each `agent.run()` call in interactive mode created a new conversation, losing all context about:
- The app being built
- Previous modifications
- Architecture decisions
- Feature implementations

## Solution: ClaudeSDKClient Session Management

### Architecture Changes

#### 1. **cc_agent/base.py** - Added Session Support
```python
from claudesdk import ClaudeSDKClient

class Agent:
    async def run_with_session(self, user_prompt: str, session_id: Optional[str] = None):
        """Execute agent with session support for context preservation."""
        # Uses ClaudeSDKClient instead of stateless query()
        # Maintains conversation history across calls
```

#### 2. **AppGeneratorAgent** - Session Persistence
```python
class AppGeneratorAgent:
    def save_session(self):
        """Save session to ~/.app_generator_session.json"""

    def load_session(self):
        """Load session from disk"""

    async def resume_with_session(self, app_path, instructions, session_id):
        """Resume with preserved context"""
```

#### 3. **run-app-generator.py** - Interactive Loop Enhancement
- Automatically loads/saves sessions
- Context management commands: `/context`, `/save`, `/clear`
- Shows session ID and features in UI
- `--resume-session` CLI flag for direct session resumption

## Usage

### Interactive Mode (Automatic)
```bash
# Start generation
uv run python run-app-generator.py "Create a blog" --app-name my-blog

# In interactive mode:
💬 What else can I help you with? add user authentication

# Context is automatically preserved! Agent remembers:
# - The blog structure
# - Previous features
# - Architecture decisions
```

### Session Commands in Interactive Mode
- `/context` - View current session information
- `/save` - Explicitly save session to disk
- `/clear` - Clear session and start fresh

### CLI Session Resumption (Automatic)
```bash
# Automatic - finds and uses app's existing session
uv run python run-app-generator.py \
  --resume apps/my-blog/app \
  "Add comment system"
# → Automatically loads apps/my-blog/app/.agent_session.json

# Optional - override with specific session ID
uv run python run-app-generator.py \
  --resume apps/my-blog/app \
  --resume-session abc123def \
  "Restore to specific state"
```

### App-Specific Session Benefits
1. **No Manual Tracking**: Session IDs are auto-discovered
2. **Per-App Context**: Each app has independent session history
3. **Seamless Resume**: `--resume` automatically continues where you left off
4. **Multiple Apps**: Work on different apps with separate contexts
5. **Zero Configuration**: Just use `--resume`, sessions handle themselves

## Implementation Details

### Session File Format
Location: `{app_directory}/.agent_session.json` (e.g., `apps/my-blog/app/.agent_session.json`)
```json
{
  "session_id": "abc123def456...",
  "app_path": "/path/to/app",
  "timestamp": "2025-01-17T10:30:00",
  "context": {
    "app_name": "my-blog",
    "features": ["authentication", "user profiles", "posts"],
    "entities": ["users", "posts", "comments"],
    "last_action": "Added user authentication",
    "generated_at": "2025-01-17T09:00:00"
  }
}
```

**Key Changes:**
- Sessions stored IN each app directory (not globally)
- Each app maintains its own independent session
- Automatic discovery when using `--resume`

### CLAUDE.md Generation
Each app gets a `CLAUDE.md` file with:
- Session ID for resumption
- Architecture decisions
- Features implemented
- Technical context

This file is automatically read by Claude when working on the app, providing persistent context even across different sessions.

## Benefits

1. **Context Preservation**: Agent remembers everything about the app
2. **Seamless Continuation**: Pick up exactly where you left off
3. **Multiple Sessions**: Work on different apps with separate contexts
4. **Explicit Control**: Save/load/clear sessions as needed
5. **Long-term Memory**: CLAUDE.md provides context even after session expires

## Testing

Run the test suite:
```bash
uv run python test-session-resumption.py
```

Tests verify:
- Session creation during generation
- Session persistence to disk
- Context preservation during resume
- CLAUDE.md generation
- Session clearing

## Migration Notes

This implementation is **backward compatible**:
- Existing `agent.run()` calls continue to work
- New `agent.run_with_session()` is opt-in
- Interactive mode automatically uses sessions
- Non-interactive mode unchanged

## Technical Notes

- Uses Claude's native `ClaudeSDKClient` for stateful sessions
- Session IDs are UUIDs that persist across restarts
- Sessions stored in JSON for easy inspection
- Context includes both technical and business decisions
- Automatic session creation in interactive mode