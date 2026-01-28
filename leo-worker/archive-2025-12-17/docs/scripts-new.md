# Command Line Reference

## App Generator Agent

### Basic Usage

```bash
# Generate new app (app-name is REQUIRED)
uv run python run-app-generator.py "Create a todo app" --app-name todo-app

# Generate with custom output directory
uv run python run-app-generator.py "Create a marketplace" --app-name advisory-board --output-dir ~/projects

# Disable interactive mode (exit after generation)
uv run python run-app-generator.py "Create a blog" --app-name my-blog --no-interactive

# Disable prompt expansion
uv run python run-app-generator.py "Create an app" --app-name my-app --no-expand
```

### Resume/Modify Existing App

```bash
# Modify existing app (auto-finds app's session)
uv run python run-app-generator.py --resume apps/my-app/app "Add dark mode"

# Fix issues in existing app (maintains context)
uv run python run-app-generator.py --resume apps/my-app/app "Fix the login page"

# Resume with specific session ID (optional override)
uv run python run-app-generator.py --resume apps/my-app/app --resume-session abc123 "Restore state"
```

**Session Management:**
- Sessions stored in `{app}/.agent_session.json`
- Automatically loaded when using `--resume`
- Each app maintains independent context

### Interactive Mode

After generation, you'll be prompted:
```
✅ Done! What else can I help you with? (or 'done' to exit):
> Seed it with companies
> Add a dashboard page
> done
```

**Session Commands:**
- `/context` - View current session info
- `/save` - Save session to app directory
- `/clear` - Clear app's session
- `done` or `exit` - Exit interactive mode

**Features:**
- LLM-based prompt expansion (short inputs → detailed instructions)
- Automatic git commits before each modification
- Continue refining without restarting
- Session context preserved between interactions

### Flags

- `--app-name` - Directory name for the app (REQUIRED for new apps)
- `--output-dir` - Custom output location (default: `~/apps/app-factory/apps/`)
- `--resume APP_PATH` - Modify existing app at path (auto-loads session)
- `--resume-session ID` - Resume specific session (optional, use with --resume)
- `--interactive` - Enable interactive mode (default: True)
- `--no-interactive` - Disable interactive mode
- `--no-expand` - Disable LLM prompt expansion
- `--disable-subagents` - Disable specialized subagents

## Generated App Commands

```bash
# Navigate to generated app
cd apps/[app-name]/app

# Install dependencies
npm install

# Run dev server (port 5000)
npm run dev

# Build for production
npm run build
```

## Conversation Logging

**Monitor live agent execution:**
```bash
./monitor-conversations.sh              # Monitor all agents (auto-detects new files)
./monitor-conversations.sh text         # Text logs only
./monitor-conversations.sh jsonl        # JSONL logs only
./monitor-conversations.sh Reprompter   # Specific agent
```

**View complete conversations:**
```bash
./view-conversation.sh                  # List all available logs
./view-conversation.sh latest           # View latest (opens pager)
./view-conversation.sh latest --follow  # View from start + follow live
./view-conversation.sh AppGeneratorAgent # Latest for specific agent
./view-conversation.sh Reprompter -f    # View + follow agent
```

**Analyze JSONL logs:**
```bash
python analyze-conversation.py logs/conversations/conversation_*.jsonl
```

**Logs location:** `logs/conversations/`
**See:** `docs/CONVERSATION_LOGGING.md` for details

## Testing

```bash
# Test interactive mode implementation
uv run python test-interactive-mode.py

# Test session resumption functionality
uv run python test-session-resumption.py

# Test app-specific session management
uv run python test-app-specific-sessions.py

# Test modular FIS generation
./run-modular-fis-timeless-weddings.sh

# Test parallel frontend generation
uv run python run-parallel-frontend.py apps/timeless-weddings-phase1/app
```
