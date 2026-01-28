# CLAUDE.md Examples from Community

**Source:** https://github.com/hesreallyhim/awesome-claude-code
**Retrieved:** 2025-07-04

---

Collection of CLAUDE.md files from various projects showing different configuration approaches.

## CLAUDE.md

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the Awesome Claude Code repository - a curated list of slash-commands, CLAUDE.md files, CLI tools, and other resources for enhancing Claude Code workflows. The repository serves as a community resource hub for sharing knowledge and best practices.

## Common Development Tasks

### Adding New Resources

1. **Use the slash-command**: Run `/project:add-new-resource` to be guided through adding a new resource
2. **CSV-based addition (RECOMMENDED)**: Edit `.myob/scripts/resource-metadata.csv` directly and run `make generate` to create a perfectly formatted README.md
3. **Manual addition**: Edit README.md following the existing format and alphabetical ordering

### Generating README from CSV

The repository now supports data-driven README generation:

- Edit resources in `.myob/scripts/resource-metadata.csv` with fields: Display Name, Primary Link, Secondary Link, Author Name, Author Link, Category, Sub-Category, Description, Active, Last Checked
- Run `make generate` to generate README.md from CSV data
- The generated README includes hierarchical table of contents and maintains proper formatting

### Checking Links

Run `/check-links` to verify all links in the README are working properly. The link validation script:

- Validates all URLs in the CSV file
- Updates Active status and Last Checked timestamps
- Fetches license information from GitHub repositories
- Supports GitHub API for repository links
- Includes retry logic and rate limiting
- Supports `MAX_LINKS` parameter for faster testing: `make validate MAX_LINKS=10`

### Downloading and Hosting Resources

Download active resources from GitHub using the download script:

- **Rate Limiting**: GitHub API allows 60 requests/hour without authentication, 5,000 with:
  ```bash
  export GITHUB_TOKEN=your_github_token  # Optional but recommended
  make download-resources
  ```
- Run `make download-resources` to download all active resources
- Filter by category: `make download-resources CATEGORY='Slash-Commands'`
- Filter by license: `make download-resources LICENSE='MIT'`
- Limit downloads for testing: `make download-resources MAX_DOWNLOADS=5`
- Resources are saved to two locations:
  - `.myob/downloads/`: Archive of ALL downloaded resources (gitignored)
  - `resources/`: Only open-source licensed resources for hosting (NOT gitignored)
- Directory structure: Both directories use the same sanitized category names
  - Example categories: `slash-commands`, `claude.md-files`, `workflows-knowledge-guides`, `tooling`, `official-documentation`
- Open-source licenses automatically hosted: MIT, Apache-2.0, BSD, GPL, LGPL, MPL-2.0, ISC, CC-BY, etc.

### Creating Pull Requests

1. Follow the PR template in `.github/PULL_REQUEST_TEMPLATE.md`
2. Ensure entries are properly categorized and alphabetically ordered
3. Use permalinks when linking to GitHub files

## Repository Structure

- **README.md**: Main list of resources, organized by category (generated from CSV)
- **CONTRIBUTING.md**: Contribution guidelines
- **code-of-conduct.md**: Community standards
- **Makefile**: Build system with `generate` target for README generation
- **.myob/scripts/**: Data management and automation scripts
  - `resource-metadata.csv`: Single source of truth for all resource data
  - `generate_readme.py`: Converts CSV to formatted README.md with hierarchical TOC
  - `validate_links.py`: Comprehensive link validation with GitHub API support
- **.claude/commands/**: Custom slash-commands for this project
  - `add-new-resource.md`: Wizard for adding new resources
  - `add-new-claude-md.md`: Helper for adding CLAUDE.md files

## Key Guidelines

1. **Resource Quality**: Only include resources that provide genuine value to Claude Code users
2. **Formatting**: Follow existing formatting exactly - entries are categorized and alphabetically ordered
3. **Attribution**: Always include proper attribution and prefer permalinks for GitHub resources
4. **Categories**:
   - Workflows & Knowledge Guides
   - Tooling
   - Hooks (new)
   - Slash-Commands (organized by command name)
   - CLAUDE.md Files (organized by repository name)
   - Official Documentation

## Working with This Repository

- The repository excludes `.myob` and `.claude` directories from analysis unless specifically requested
- This is a documentation/curation project focused on maintaining high-quality, well-organized content
- **Data-driven approach**: The CSV file serves as the single source of truth for all resource metadata
- **Automated generation**: Use `make generate` to create perfectly formatted README from CSV data
- **Link validation**: Run `make validate` to validate all links. Implemented with GitHub API support, retry logic, and comprehensive status tracking
- Quality assurance features:
  - Link validation tests to ensure all curated resources remain accessible
  - Markdown linting to maintain consistent formatting
  - CSV-based data validation and integrity checks
  - Automated TOC generation with hierarchical structure

## Development Tools and Scripts

The `.myob/scripts/` directory contains several Python utilities for managing repository data:

1. **generate_readme.py**: Main generation script

   - Automatically migrates CSV schema if needed
   - Preserves exact ordering from CSV file
   - Generates hierarchical table of contents
   - Maintains all original README formatting and structure

2. **validate_links.py**: Comprehensive link checker

   - Supports both regular URLs and GitHub repository links
   - Fetches license information from GitHub API
   - Implements exponential backoff for rate limiting
   - Updates CSV with validation status and timestamps
   - GitHub Action compatible with JSON output
   - Supports `--max-links` parameter to limit validation scope

3. **download_resources.py**: Resource download and hosting utility

   - Downloads active resources from GitHub repositories
   - Supports filtering by category and license type
   - Handles files, directories, and gists
   - Implements rate limiting and retry logic
   - Dual output directories:
     - Archive: `.myob/downloads/` for all resources (gitignored)
     - Hosted: `resources/` for open-source licensed resources only
   - Automatically detects and hosts open-source licensed content
   - Maps CSV categories to standardized directory names
   - Supports `--max-downloads` for testing

## Development Best Practices

- When running Python or pip commands, ensure you are working inside the `venv` either by activating or by using the path to the relevant Python binary

```

---

## resources/claude.md-files/TPL/CLAUDE.md

```markdown
# TPL-GO Developer Guide

## Build Commands
- `make` - Format and build project
- `make deps` - Get all dependencies
- `make test` - Run all tests

## Test Commands
- `go test -v ./...` - Run all tests verbosely
- `go test -v -run=TestName` - Run a specific test by name

## Code Style
- Use `goimports` for formatting (run via `make`)
- Follow standard Go formatting conventions
- Group imports: standard library first, then third-party
- Use PascalCase for exported types/methods, camelCase for variables
- Add comments for public API and complex logic
- Place related functionality in logically named files

## Error Handling
- Use custom `Error` type with detailed context
- Include error wrapping with `Unwrap()` method
- Return errors with proper context information (line, position)

## Testing
- Write table-driven tests with clear input/output expectations
- Use package `tpl_test` for external testing perspective
- Include detailed error messages (expected vs. actual)
- Test every exported function and error case

## Dependencies
- Minimum Go version: 1.23.0
- External dependencies managed through go modules

## Modernization Notes
- Use `errors.Is()` and `errors.As()` for error checking
- Replace `interface{}` with `any` type alias
- Replace type assertions with type switches where appropriate
- Use generics for type-safe operations
- Implement context cancellation handling for long operations
- Add proper docstring comments for exported functions and types
- Use log/slog for structured logging
- Add linting and static analysis tools
```

---

## resources/claude.md-files/Cursor-Tools/CLAUDE.md

```markdown
This is the vibe-tools repo. Here we build a cli tool that AI agents can use to execute commands and work with other AI agents.

This repo uses pnpm as the package manager and script runner.

use pnpm dev <command> to run dev commands.

We add AI "teammates" as commands that can be asked questions.
We add "skills" as commands that can be used to execute tasks.

Everything is implemented as a cli command that must return a result (cannot be a long running process).

The released commands are documented below. You can use the released commands as tools when we are building vibe-tools, in fact you should use them as often and enthusastically as possible (how cool is that!)

Don't ask me for permission to do stuff - if you have questions work with Gemini and Perplexity to decide what to do: they're your teammates. You're a team of superhuman expert AIs, believe in yourselves! Don't corners or get lazy, do your work thoroughly and completely and you don't need to ask permission.

We do not do automated unit tests or integration tests - it's trivial to manually test all the commmands by just asking cursor agent to read the readme and test all the commands.

<logging and outputs>
There are three ways that we communicate to the caller.
console.log which goes to stdout
console.error which goes to stderr
do not use console.debug or console.warn or console.info
and yield which is streamed either to stdout (unless the --quiet flag is used) and to the file specified by --save-to (if --save-to is specified).

console.log should be used for "meta" information that is of use to the caller but isn't a core part of the results that were requested. E.g. recording which model is being used to perfom an action.

console.error should be used for error messages.

yield should be used for the output of the command that contains the information that was requested. d
</logging and outputs>

<testing browser commands>
There is a test server for browser command testing and a collection of test files in tests/commands/browser/

Usage:
1. Run with: pnpm serve-test
2. Server starts at http://localhost:3000
3. Place test HTML files in tests/commands/browser/
4. Access files at http://localhost:3000/filename.html

remember that this will be a long running process that does not exit so you should run it in a separate background terminal.

If it won't start because the port is busy run `lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill` to kill the process and free the port.

to run test commands with latest code use `pnpm dev browser <commands>`

For interactive debugging start chrome in debug mode using:
```
open -a "Google Chrome" --args --remote-debugging-port=9222 --no-first-run --no-default-browser-check --user-data-dir="/tmp/chrome-remote-debugging"
```
note: this command will exit as soon as chrome is open so you can just execute it, it doesn't need to be run in a background task.
</testing browser commands>

---
description: Global Rule. This rule should ALWAYS be loaded
globs: *,**/*
alwaysApply: true
---
---
description: Global Rule. This rule should ALWAYS be loaded.
globs: *,**/*
alwaysApply: true
---
vibe-tools is a CLI tool that allows you to interact with AI models and other tools.
vibe-tools is installed on this machine and it is available to you to execute. You're encouraged to use it.

vibe-tools is a CLI tool that allows you to interact with AI models and other tools.
vibe-tools is installed on this machine and it is available to you to execute. You're encouraged to use it.

<vibe-tools Integration>
# Instructions
Use the following commands to get AI assistance:

**Direct Model Queries:**
`vibe-tools ask "<your question>" --provider <provider> --model <model>` - Ask any model from any provider a direct question (e.g., `vibe-tools ask "What is the capital of France?" --provider openai --model o3-mini`). Note that this command is generally less useful than other commands like `repo` or `plan` because it does not include any context from your codebase or repository. In general you should not use the ask command because it does not include any context. The other commands like `web`, `doc`, `repo`, or `plan` are usually better. If you are using it, make sure to include in your question all the information and context that the model might need to answer usefully.

**Ask Command Options:**
--provider=<provider>: AI provider to use (openai, anthropic, perplexity, gemini, modelbox, openrouter, or xai)
--model=<model>: Model to use (required for the ask command)
--reasoning-effort=<low|medium|high>: Control the depth of reasoning for supported models (OpenAI o1/o3-mini models and Claude 3.7 Sonnet). Higher values produce more thorough responses for complex questions.

**Implementation Planning:**
`vibe-tools plan "<query>"` - Generate a focused implementation plan using AI (e.g., `vibe-tools plan "Add user authentication to the login page"`)
The plan command uses multiple AI models to:
1. Identify relevant files in your codebase (using Gemini by default)
2. Extract content from those files
3. Generate a detailed implementation plan (using OpenAI o3-mini by default)

**Plan Command Options:**
--fileProvider=<provider>: Provider for file identification (gemini, openai, anthropic, perplexity, modelbox, openrouter, or xai)
--thinkingProvider=<provider>: Provider for plan generation (gemini, openai, anthropic, perplexity, modelbox, openrouter, or xai)
--fileModel=<model>: Model to use for file identification
--thinkingModel=<model>: Model to use for plan generation
--with-doc=<doc_url>: Fetch content from a document URL and include it as context for both file identification and planning (e.g., `vibe-tools plan "implement feature X following the spec" --with-doc=https://example.com/feature-spec`)

**Web Search:**
`vibe-tools web "<your question>"` - Get answers from the web using a provider that supports web search (e.g., Perplexity models and Gemini Models either directly or from OpenRouter or ModelBox) (e.g., `vibe-tools web "latest shadcn/ui installation instructions"`)
Note: web is a smart autonomous agent with access to the internet and an extensive up to date knowledge base. Web is NOT a web search engine. Always ask the agent for what you want using a proper sentence, do not just send it a list of keywords. In your question to web include the context and the goal that you're trying to acheive so that it can help you most effectively.
when using web for complex queries suggest writing the output to a file somewhere like local-research/<query summary>.md.

**Web Command Options:**
--provider=<provider>: AI provider to use (perplexity, gemini, modelbox, or openrouter)

**Repository Context:**
`vibe-tools repo "<your question>" [--subdir=<path>] [--from-github=<username/repo>] [--with-doc=<doc_url>]` - Get context-aware answers about this repository using Google Gemini (e.g., `vibe-tools repo "explain authentication flow"`). Use the optional `--subdir` parameter to analyze a specific subdirectory instead of the entire repository (e.g., `vibe-tools repo "explain the code structure" --subdir=src/components`). Use the optional `--from-github` parameter to analyze a remote GitHub repository without cloning it locally (e.g., `vibe-tools repo "explain the authentication system" --from-github=username/repo-name`). Use the optional `--with-doc` parameter to include content from a URL as additional context (e.g., `vibe-tools repo "implement feature X following the design spec" --with-doc=https://example.com/design-spec`).

**Documentation Generation:**
`vibe-tools doc [options] [--with-doc=<doc_url>]` - Generate comprehensive documentation for this repository (e.g., `vibe-tools doc --output docs.md`). Can incorporate document context from a URL (e.g., `vibe-tools doc --with-doc=https://example.com/existing-docs`).

**YouTube Video Analysis:**
`vibe-tools youtube "<youtube-url>" [question] [--type=<summary|transcript|plan|review|custom>]` - Analyze YouTube videos and generate detailed reports (e.g., `vibe-tools youtube "https://youtu.be/43c-Sm5GMbc" --type=summary`)
Note: The YouTube command requires a `GEMINI_API_KEY` to be set in your environment or .vibe-tools.env file as the GEMINI API is the only interface that supports YouTube analysis.

**GitHub Information:**
`vibe-tools github pr [number]` - Get the last 10 PRs, or a specific PR by number (e.g., `vibe-tools github pr 123`)
`vibe-tools github issue [number]` - Get the last 10 issues, or a specific issue by number (e.g., `vibe-tools github issue 456`)

**ClickUp Information:**
`vibe-tools clickup task <task_id>` - Get detailed information about a ClickUp task including description, comments, status, assignees, and metadata (e.g., `vibe-tools clickup task "task_id"`)

**Model Context Protocol (MCP) Commands:**
Use the following commands to interact with MCP servers and their specialized tools:
`vibe-tools mcp search "<query>"` - Search the MCP Marketplace for available servers that match your needs (e.g., `vibe-tools mcp search "git repository management"`)
`vibe-tools mcp run "<query>"` - Execute MCP server tools using natural language queries (e.g., `vibe-tools mcp run "list files in the current directory" --provider=openrouter`). The query must include sufficient information for vibe-tools to determine which server to use, provide plenty of context.

The `search` command helps you discover servers in the MCP Marketplace based on their capabilities and your requirements. The `run` command automatically selects and executes appropriate tools from these servers based on your natural language queries. If you want to use a specific server include the server name in your query. E.g. `vibe-tools mcp run "using the mcp-server-sqlite list files in directory --provider=openrouter"`

**Notes on MCP Commands:**
- MCP commands require `ANTHROPIC_API_KEY` or `OPENROUTER_API_KEY` to be set in your environment
- By default the `mcp` command uses Anthropic, but takes a --provider argument that can be set to 'anthropic' or 'openrouter'
- Results are streamed in real-time for immediate feedback
- Tool calls are automatically cached to prevent redundant operations
- Often the MCP server will not be able to run because environment variables are not set. If this happens ask the user to add the missing environment variables to the cursor tools env file at ~/.vibe-tools/.env

**Stagehand Browser Automation:**
`vibe-tools browser open <url> [options]` - Open a URL and capture page content, console logs, and network activity (e.g., `vibe-tools browser open "https://example.com" --html`)
`vibe-tools browser act "<instruction>" --url=<url | 'current'> [options]` - Execute actions on a webpage using natural language instructions (e.g., `vibe-tools browser act "Click Login" --url=https://example.com`)
`vibe-tools browser observe "<instruction>" --url=<url> [options]` - Observe interactive elements on a webpage and suggest possible actions (e.g., `vibe-tools browser observe "interactive elements" --url=https://example.com`)
`vibe-tools browser extract "<instruction>" --url=<url> [options]` - Extract data from a webpage based on natural language instructions (e.g., `vibe-tools browser extract "product names" --url=https://example.com/products`)

**Notes on Browser Commands:**
- All browser commands are stateless unless --connect-to is used to connect to a long-lived interactive session. In disconnected mode each command starts with a fresh browser instance and closes it when done.
- When using `--connect-to`, special URL values are supported:
  - `current`: Use the existing page without reloading
  - `reload-current`: Use the existing page and refresh it (useful in development)
  - If working interactively with a user you should always use --url=current unless you specifically want to navigate to a different page. Setting the url to anything else will cause a page refresh loosing current state.
- Multi step workflows involving state or combining multiple actions are supported in the `act` command using the pipe (|) separator (e.g., `vibe-tools browser act "Click Login | Type 'user@example.com' into email | Click Submit" --url=https://example.com`)
- Video recording is available for all browser commands using the `--video=<directory>` option. This will save a video of the entire browser interaction at 1280x720 resolution. The video file will be saved in the specified directory with a timestamp.
- DO NOT ask browser act to "wait" for anything, the wait command is currently disabled in Stagehand.

**Tool Recommendations:**
- `vibe-tools web` is best for general web information not specific to the repository. Generally call this without additional arguments.
- `vibe-tools repo` is ideal for repository-specific questions, planning, code review and debugging. E.g. `vibe-tools repo "Review recent changes to command error handling looking for mistakes, omissions and improvements"`. Generally call this without additional arguments.
- `vibe-tools plan` is ideal for planning tasks. E.g. `vibe-tools plan "Adding authentication with social login using Google and Github"`. Generally call this without additional arguments.
- `vibe-tools doc` generates documentation for local or remote repositories.
- `vibe-tools youtube` analyzes YouTube videos to generate summaries, transcripts, implementation plans, or custom analyses
- `vibe-tools browser` is useful for testing and debugging web apps and uses Stagehand
- `vibe-tools mcp` enables interaction with specialized tools through MCP servers (e.g., for Git operations, file system tasks, or custom tools)

**Running Commands:**
1. Use `vibe-tools <command>` to execute commands (make sure vibe-tools is installed globally using npm install -g vibe-tools so that it is in your PATH)

**General Command Options (Supported by all commands):**
--provider=<provider>: AI provider to use (openai, anthropic, perplexity, gemini, openrouter, modelbox, or xai). If provider is not specified, the default provider for that task will be used.
--model=<model name>: Specify an alternative AI model to use. If model is not specified, the provider's default model for that task will be used.
--max-tokens=<number>: Control response length
--save-to=<file path>: Save command output to a file (in *addition* to displaying it)
--help: View all available options (help is not fully implemented yet)
--debug: Show detailed logs and error information

**Repository Command Options:**
--provider=<provider>: AI provider to use (gemini, openai, openrouter, perplexity, modelbox, anthropic, or xai)
--model=<model>: Model to use for repository analysis
--max-tokens=<number>: Maximum tokens for response
--from-github=<GitHub username>/<repository name>[@<branch>]: Analyze a remote GitHub repository without cloning it locally
--subdir=<path>: Analyze a specific subdirectory instead of the entire repository
--with-doc=<doc_url>: Fetch content from a document URL and include it as context

**Documentation Command Options:**
--from-github=<GitHub username>/<repository name>[@<branch>]: Generate documentation for a remote GitHub repository
--provider=<provider>: AI provider to use (gemini, openai, openrouter, perplexity, modelbox, anthropic, or xai)
--model=<model>: Model to use for documentation generation
--max-tokens=<number>: Maximum tokens for response
--with-doc=<doc_url>: Fetch content from a document URL and include it as context

**YouTube Command Options:**
--type=<summary|transcript|plan|review|custom>: Type of analysis to perform (default: summary)

**GitHub Command Options:**
--from-github=<GitHub username>/<repository name>[@<branch>]: Access PRs/issues from a specific GitHub repository

**Browser Command Options (for 'open', 'act', 'observe', 'extract'):**
--console: Capture browser console logs (enabled by default, use --no-console to disable)
--html: Capture page HTML content (disabled by default)
--network: Capture network activity (enabled by default, use --no-network to disable)
--screenshot=<file path>: Save a screenshot of the page
--timeout=<milliseconds>: Set navigation timeout (default: 120000ms for Stagehand operations, 30000ms for navigation)
--viewport=<width>x<height>: Set viewport size (e.g., 1280x720). When using --connect-to, viewport is only changed if this option is explicitly provided
--headless: Run browser in headless mode (default: true)
--no-headless: Show browser UI (non-headless mode) for debugging
--connect-to=<port>: Connect to existing Chrome instance. Special values: 'current' (use existing page), 'reload-current' (refresh existing page)
--wait=<time:duration or selector:css-selector>: Wait after page load (e.g., 'time:5s', 'selector:#element-id')
--video=<directory>: Save a video recording (1280x720 resolution, timestamped subdirectory). Not available when using --connect-to
--url=<url>: Required for `act`, `observe`, and `extract` commands. Url to navigate to before the main command or one of the special values 'current' (to stay on the current page without navigating or reloading) or 'reload-current' (to reload the current page)
--evaluate=<string>: JavaScript code to execute in the browser before the main command

**Nicknames**
Users can ask for these tools using nicknames
Gemini is a nickname for vibe-tools repo
Perplexity is a nickname for vibe-tools web
Stagehand is a nickname for vibe-tools browser
If people say "ask Gemini" or "ask Perplexity" or "ask Stagehand" they mean to use the `vibe-tools` command with the `repo`, `web`, or `browser` commands respectively.

**Xcode Commands:**
`vibe-tools xcode build [buildPath=<path>] [destination=<destination>]` - Build Xcode project and report errors.
**Build Command Options:**
--buildPath=<path>: (Optional) Specifies a custom directory for derived build data. Defaults to ./.build/DerivedData.
--destination=<destination>: (Optional) Specifies the destination for building the app (e.g., 'platform=iOS Simulator,name=iPhone 16 Pro'). Defaults to 'platform=iOS Simulator,name=iPhone 16 Pro'.

`vibe-tools xcode run [destination=<destination>]` - Build and run the Xcode project on a simulator.
**Run Command Options:**
--destination=<destination>: (Optional) Specifies the destination simulator (e.g., 'platform=iOS Simulator,name=iPhone 16 Pro'). Defaults to 'platform=iOS Simulator,name=iPhone 16 Pro'.

`vibe-tools xcode lint` - Run static analysis on the Xcode project to find and fix issues.

**Additional Notes:**
- For detailed information, see `node_modules/vibe-tools/README.md` (if installed locally).
- Configuration is in `vibe-tools.config.json` (or `~/.vibe-tools/config.json`).
- API keys are loaded from `.vibe-tools.env` (or `~/.vibe-tools/.env`).
- ClickUp commands require a `CLICKUP_API_TOKEN` to be set in your `.vibe-tools.env` file.
- Available models depend on your configured provider (OpenAI, Anthropic, xAI, etc.) in `vibe-tools.config.json`.
- repo has a limit of 2M tokens of context. The context can be reduced by filtering out files in a .repomixignore file.
- problems running browser commands may be because playwright is not installed. Recommend installing playwright globally.
- MCP commands require `ANTHROPIC_API_KEY` or `OPENROUTER_API_KEY`
- **Remember:** You're part of a team of superhuman expert AIs. Work together to solve complex problems.
- **Repomix Configuration:** You can customize which files are included/excluded during repository analysis by creating a `repomix.config.json` file in your project root. This file will be automatically detected by `repo`, `plan`, and `doc` commands.

<!-- vibe-tools-version: 0.60.6 -->
</vibe-tools Integration>

```

---

## resources/claude.md-files/DroidconKotlin/CLAUDE.md

```markdown
# DroidconKotlin Development Guide

## Build Commands
- Build: `./gradlew build`
- Clean build: `./gradlew clean build`
- Check (includes lint): `./gradlew check`
- Android lint: `./gradlew lint`
- Run tests: `./gradlew test`
- ktlint check: `./gradlew ktlintCheck`
- ktlint format: `./gradlew ktlintFormat`
- Build ios: `cd /Users/kevingalligan/devel/DroidconKotlin/ios/Droidcon && xcodebuild -scheme Droidcon -sdk iphonesimulator`

## Modules

- android: The Android app
- ios: The iOS app
- shared: Shared logic code
- shared-ui: UI implemented with Compose Multiplatform and used by both Android and iOS

## Libraries

- Hyperdrive: KMP-focused architecture library. It is open source but rarely used by other apps. See docs/HyperDrivev1.md

## Code Style
- Kotlin Multiplatform project (Android/iOS)
- Use ktlint for formatting (version 1.4.0)
- Follow dependency injection pattern with Koin
- Repository pattern for data access
- Compose UI for shared UI components
- Class/function names: PascalCase for classes, camelCase for functions
- Interface implementations: Prefix with `Default` (e.g., `DefaultRepository`)
- Organize imports by package, no wildcard imports
- Type-safe code with explicit type declarations
- Coroutines for asynchronous operations
- Proper error handling with try/catch blocks

## Claude Document Formats and Instructions
See APISummaryFormat.md and StructuredInstructionFormats.md

## Architecture Notes
- App startup logic is handled in `co.touchlab.droidcon.viewmodel.ApplicationViewModel`

## Current Task

Cleaning up the app and prepping for release
```

---

## resources/claude.md-files/AWS-MCP-Server/CLAUDE.md

```markdown
# AWS MCP Server Development Guide

## Build & Test Commands

### Using uv (recommended)
- Install dependencies: `uv pip install --system -e .`
- Install dev dependencies: `uv pip install --system -e ".[dev]"`
- Update lock file: `uv pip compile --system pyproject.toml -o uv.lock`
- Install from lock file: `uv pip sync --system uv.lock`

### Using pip (alternative)
- Install dependencies: `pip install -e .`
- Install dev dependencies: `pip install -e ".[dev]"`

### Running the server
- Run server: `python -m aws_mcp_server`
- Run server with SSE transport: `AWS_MCP_TRANSPORT=sse python -m aws_mcp_server`
- Run with MCP CLI: `mcp run src/aws_mcp_server/server.py`

### Testing and linting
- Run tests: `pytest`
- Run single test: `pytest tests/path/to/test_file.py::test_function_name -v`
- Run tests with coverage: `python -m pytest --cov=src/aws_mcp_server tests/`
- Run linter: `ruff check src/ tests/`
- Format code: `ruff format src/ tests/`

## Technical Stack

- **Python version**: Python 3.13+
- **Project config**: `pyproject.toml` for configuration and dependency management
- **Environment**: Use virtual environment in `.venv` for dependency isolation
- **Package management**: Use `uv` for faster, more reliable dependency management with lock file
- **Dependencies**: Separate production and dev dependencies in `pyproject.toml`
- **Version management**: Use `setuptools_scm` for automatic versioning from Git tags
- **Linting**: `ruff` for style and error checking
- **Type checking**: Use VS Code with Pylance for static type checking
- **Project layout**: Organize code with `src/` layout

## Code Style Guidelines

- **Formatting**: Black-compatible formatting via `ruff format`
- **Imports**: Sort imports with `ruff` (stdlib, third-party, local)
- **Type hints**: Use native Python type hints (e.g., `list[str]` not `List[str]`)
- **Documentation**: Google-style docstrings for all modules, classes, functions
- **Naming**: snake_case for variables/functions, PascalCase for classes
- **Function length**: Keep functions short (< 30 lines) and single-purpose
- **PEP 8**: Follow PEP 8 style guide (enforced via `ruff`)

## Python Best Practices

- **File handling**: Prefer `pathlib.Path` over `os.path`
- **Debugging**: Use `logging` module instead of `print`
- **Error handling**: Use specific exceptions with context messages and proper logging
- **Data structures**: Use list/dict comprehensions for concise, readable code
- **Function arguments**: Avoid mutable default arguments
- **Data containers**: Leverage `dataclasses` to reduce boilerplate
- **Configuration**: Use environment variables (via `python-dotenv`) for configuration
- **AWS CLI**: Validate all commands before execution (must start with "aws")
- **Security**: Never store/log AWS credentials, set command timeouts

## Development Patterns & Best Practices

- **Favor simplicity**: Choose the simplest solution that meets requirements
- **DRY principle**: Avoid code duplication; reuse existing functionality
- **Configuration management**: Use environment variables for different environments
- **Focused changes**: Only implement explicitly requested or fully understood changes
- **Preserve patterns**: Follow existing code patterns when fixing bugs
- **File size**: Keep files under 300 lines; refactor when exceeding this limit
- **Test coverage**: Write comprehensive unit and integration tests with `pytest`; include fixtures
- **Test structure**: Use table-driven tests with parameterization for similar test cases
- **Mocking**: Use unittest.mock for external dependencies; don't test implementation details
- **Modular design**: Create reusable, modular components
- **Logging**: Implement appropriate logging levels (debug, info, error)
- **Error handling**: Implement robust error handling for production reliability
- **Security best practices**: Follow input validation and data protection practices
- **Performance**: Optimize critical code sections when necessary
- **Dependency management**: Add libraries only when essential
  - When adding/updating dependencies, update `pyproject.toml` first
  - Regenerate the lock file with `uv pip compile --system pyproject.toml -o uv.lock`
  - Install the new dependencies with `uv pip sync --system uv.lock`

## Development Workflow

- **Version control**: Commit frequently with clear messages
- **Versioning**: Use Git tags for versioning (e.g., `git tag -a 1.2.3 -m "Release 1.2.3"`)
  - For releases, create and push a tag
  - For development, let `setuptools_scm` automatically determine versions
- **Impact assessment**: Evaluate how changes affect other codebase areas
- **Documentation**: Keep documentation up-to-date for complex logic and features
- **Dependencies**: When adding dependencies, always update the `uv.lock` file
- **CI/CD**: All changes should pass CI checks (tests, linting, etc.) before merging

```

---

## resources/claude.md-files/Giselle/CLAUDE.md

```markdown
# Giselle Development Guide

## Build, Test, and Lint Commands
- Build all: `pnpm build`
- Build specific packages: `pnpm build-sdk`, `pnpm build-data-type`
- Type checking: `pnpm check-types`
- Type check packages with modified files: `pnpm -F <modified files packagename> check-types`
- Format code: `pnpm format`
- Development: `pnpm dev` (playground), `pnpm dev:studio.giselles.ai` (studio)
- Run tests: `pnpm -F <package> test` or `cd <directory> && vitest`
- Run specific test: `cd <directory> && vitest <file.test.ts>`
- Lint: `cd <directory> && biome check --write .`
- Format modified files: `pnpm biome check --write [filename]`

## Critical Requirements
- MUST run `pnpm biome check --write [filename]` after EVERY code modification
- MUST run `pnpm -F [packagename in file] check-types` to validate type safety of packages with modified files
- All code changes must be formatted using Biome before being committed
- All code changes must pass type checking in their respective packages before being committed

## Code Style Guidelines
- Use Biome for formatting with tab indentation and double quotes
- Follow organized imports pattern (enabled in biome.json)
- Use TypeScript for type safety; avoid `any` types
- Use functional components with React hooks
- Use Next.js patterns for web applications
- Follow package-based architecture for modularity
- Use async/await for asynchronous code rather than promises
- Error handling: use try/catch blocks and propagate errors appropriately
- Tests should follow `*.test.ts` naming pattern and use Vitest

## Naming Conventions
- **Files**: Use kebab-case for all filenames (e.g., `user-profile.ts`)
- **Components**: Use PascalCase for React components and classes (e.g., `UserProfile`)
- **Variables**: Use camelCase for variables, functions, and methods (e.g., `userEmail`)
- **Boolean Variables and Functions**: Use prefixes like `is`, `has`, `can`, `should` for clarity:
  - For variables: `isEnabled`, `hasPermission` (not `status`)
  - For functions: `isTriggerRequiringCallsign()`, `hasActiveSubscription()` (not `requiresCallsign()` or `checkActive()`)
- **Function Naming**: Use verbs or verb phrases that clearly indicate purpose (e.g., `calculateTotalPrice()`, not `process()`)
- **Consistency**: Follow these conventions throughout the codebase

## Language Support
- This project's core members include non-native English speakers
- Please correct grammar in commit messages, code comments, and pull request comments
- Rewrite user input when necessary to ensure clear communication

```

---

## resources/claude.md-files/Pareto-Mac/CLAUDE.md

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Pareto Security Development Guide

## Build & Test Commands
- Build: `make build`
- Run tests: `make test`
- Run single test: `NSUnbufferedIO=YES xcodebuild -project "Pareto Security.xcodeproj" -scheme "Pareto Security" -test-timeouts-enabled NO -only-testing:ParetoSecurityTests/TestClassName/testMethodName -destination platform=macOS test`
- Lint: `make lint` or `mint run swiftlint .`
- Format: `make fmt` or `mint run swiftformat --swiftversion 5 . && mint run swiftlint . --fix`
- Archive builds: `make archive-debug`, `make archive-release`, `make archive-debug-setapp`, `make archive-release-setapp`
- Create DMG: `make dmg`
- Create PKG: `make pkg`

## Application Architecture

### Core Components
- **Main App (`/Pareto/`)**: SwiftUI-based status bar application
- **Helper Tool (`/ParetoSecurityHelper/`)**: XPC service for privileged operations requiring admin access
- **Security Checks (`/Pareto/Checks/`)**: Modular security check system organized by category

### Security Checks System
The app uses a modular check architecture with these categories:
- **Access Security**: Autologin, password policies, SSH keys, screensaver
- **System Integrity**: FileVault, Gatekeeper, Boot security, Time Machine
- **Firewall & Sharing**: Firewall settings, file sharing, remote access
- **macOS Updates**: System updates, automatic updates
- **Application Updates**: Third-party app update checks

Key files:
- `ParetoCheck.swift` - Base class for all security checks
- `Checks.swift` - Central registry organizing checks into claims
- `Claim.swift` - Groups related checks together

### XPC Helper Tool
The `ParetoSecurityHelper` is a privileged helper tool that:
- Handles firewall configuration checks
- Performs system-level operations requiring admin privileges
- Communicates with the main app via XPC

### Distribution Targets
- **Direct distribution**: Standard macOS app with auto-updater
- **SetApp**: Subscription service integration with separate build target
- **Team/Enterprise**: JWT-based licensing for organization management

## Code Style
- **Imports**: Group imports alphabetically, Foundation/SwiftUI first, then third-party libraries
- **Naming**: Use camelCase for variables/functions, PascalCase for types; be descriptive
- **Error Handling**: Use Swift's do/catch with specific error enums
- **Types**: Prefer explicit typing, especially for collections
- **Formatting**: Max line length 120 chars, use Swift's standard indentation (4 spaces)
- **Comments**: Only add comments for complex logic; include header comment for files
- **Code Organization**: Group related functionality with MARK comments
- **Testing**: All new features should include tests
- **Logging**: Use `os_log` for logging, with appropriate log levels

This project uses SwiftLint for style enforcement and SwiftFormat for auto-formatting.

## Key Dependencies
- **Defaults**: User preferences management
- **LaunchAtLogin**: Auto-launch functionality
- **Alamofire**: HTTP networking for update checks
- **JWTDecode**: Team licensing authentication
- **Cache**: Response caching layer

## URL Scheme Support
The app supports custom URL scheme `paretosecurity://` for:
- `reset` - Reset to default settings
- `showMenu` - Open status bar menu
- `update` - Force update check
- `welcome` - Show welcome window
- `runChecks` - Trigger security checks
- `debug` - Output detailed check status
- `logs` - Copy system logs

## Testing Strategy
- Unit tests in `ParetoSecurityTests/` cover core functionality
- UI tests in `ParetoSecurityUITests/` test user flows
- Tests are organized by feature area (checks, settings, team, updater, welcome)
- Use `make test` for full test suite with formatted output via xcbeautify

## Development Notes
- The app runs as a status bar utility (`LSUIElement: true`)
- Requires Apple Events permission for system automation
- No sandboxing to allow system security checks
- Uses privileged helper tool for admin operations
- Supports both individual and team/enterprise deployments

# Pareto Security App Structure

## Overview
Pareto Security is a macOS security monitoring app built with SwiftUI. It performs various security checks and uses a privileged helper tool for system-level operations on macOS 15+.

## Core Architecture

### Security Checks System
- **Base Class**: `ParetoCheck` (`/Pareto/Checks/ParetoCheck.swift`)
  - All security checks inherit from this base class
  - Key properties: `requiresHelper`, `isRunnable`, `isActive`
  - `menu()` method handles UI display including question mark icons for helper-dependent checks
  - `infoURL` redirects to helper docs when helper authorization missing

- **Check Categories**:
  - Firewall checks: `/Pareto/Checks/Firewall and Sharing/`
  - System checks: `/Pareto/Checks/System/`
  - Application checks: `/Pareto/Checks/Applications/`

### Helper Tool System (macOS 15+ Firewall Checks)
- **Helper Tool**: `/ParetoSecurityHelper/main.swift`
  - XPC service for privileged operations
  - Static version: `helperToolVersion = "1.0.3"`
  - Implements `ParetoSecurityHelperProtocol`
  - Functions: `isFirewallEnabled()`, `isFirewallStealthEnabled()`, `getVersion()`

- **Helper Management**: `/Pareto/Extensions/HelperTool.swift`
  - `HelperToolUtilities`: Static utility methods (non-actor-isolated)
  - `HelperToolManager`: Main actor class for XPC communication
  - Expected version: `expectedHelperVersion = "1.0.3"`
  - Auto-update logic: `ensureHelperIsUpToDate()`

- **Helper Configuration**: `/ParetoSecurityHelper/co.niteo.ParetoSecurityHelper.plist`
  - System daemon configuration
  - Critical: `BundleProgram` must be `Contents/MacOS/ParetoSecurityHelper`

### UI Structure

#### Main Views
- **Welcome Screen**: `/Pareto/Views/Welcome/PermissionsView.swift`
  - Permissions checker with continuous monitoring
  - Firewall permission section (macOS 15+ only)
  - Window size: 450×500

- **Settings**: `/Pareto/Views/Settings/`
  - `AboutSettingsView.swift`: Shows app + helper versions
  - `PermissionsSettingsView.swift`: Continuous permission monitoring
  - Various other settings views

#### Permission System
- **PermissionsChecker**: Continuous monitoring with 2-second timer
- **Properties**: `firewallAuthorized`, other permissions
- **UI States**: Authorized/Disabled buttons, consistent spacing (20pt)

### Key Technical Concepts

#### XPC Communication
- **Service Name**: `co.niteo.ParetoSecurityHelper`
- **Protocol**: `ParetoSecurityHelperProtocol`
- **Connection Management**: Automatic retry, timeout handling
- **Error Handling**: Comprehensive logging, graceful degradation

#### Concurrency & Threading
- **Main Actor**: UI components, HelperToolManager
- **Actor Isolation**: HelperToolUtilities for non-isolated static methods
- **Async/Await**: Proper continuation handling, avoid semaphores in async contexts
- **Thread Safety**: NSLock for XPC continuation management

#### Version Management
- **Manual Versioning**: Static constants for helper versions
- **Update Logic**: Compare current vs expected, auto-reinstall if outdated
- **Version Display**: About screen shows both app and helper versions

## Important Implementation Details

### Helper Tool Requirements
- **macOS 15+ Only**: Firewall checks require helper on macOS 15+
- **Authorization**: User must approve in System Settings > Login Items
- **Question Mark UI**: Shows when helper required but not authorized
- **Live Status Checks**: Always use `HelperToolUtilities.isHelperInstalled()`, never cached values

### Common Patterns
- **Check Implementation**: Override `requiresHelper` and `isRunnable` in check classes
- **Permission Monitoring**: Use Timer with 2-second intervals for continuous checking
- **Error Handling**: Use `os_log` for logging, specific error enums for Swift errors
- **UI Consistency**: 20pt spacing, medium font weight, secondary colors for labels

### Troubleshooting Tools
- **Helper Status**: `launchctl print system/co.niteo.ParetoSecurityHelper`
- **Helper Logs**: Check system logs for "Helper:" prefixed messages
- **XPC Debugging**: Comprehensive logging throughout XPC chain
- **Version Mismatches**: Check both static constants match when updating

## File Locations Reference

### Core Files
- **Base Check**: `/Pareto/Checks/ParetoCheck.swift`
- **Firewall Check**: `/Pareto/Checks/Firewall and Sharing/Firewall.swift`
- **Helper Tool**: `/ParetoSecurityHelper/main.swift`
- **Helper Manager**: `/Pareto/Extensions/HelperTool.swift`

### UI Files
- **Welcome**: `/Pareto/Views/Welcome/PermissionsView.swift`
- **About**: `/Pareto/Views/Settings/AboutSettingsView.swift`
- **Permissions Settings**: `/Pareto/Views/Settings/PermissionsSettingsView.swift`

### Configuration
- **Helper Plist**: `/ParetoSecurityHelper/co.niteo.ParetoSecurityHelper.plist`
- **Build Config**: Use `make build`, `make test`, `make lint`, `make fmt`

## Version Update Procedure
1. Increment `HelperToolUtilities.expectedHelperVersion` in HelperTool.swift
2. Increment `helperToolVersion` in helper's main.swift
3. Both versions must match for proper operation
4. App will auto-detect and reinstall helper on next check
```

---

## resources/claude.md-files/Guitar/CLAUDE.md

```markdown
# Guitar Development Guide

## Build Commands
- Setup dependencies: `sudo apt install build-essential ruby qmake6 libqt6core6 libqt6gui6 libqt6svg6-dev libqt6core5compat6-dev zlib1g-dev libgl1-mesa-dev libssl-dev`
- Prepare environment: `ruby prepare.rb`
- Build project: `mkdir build && cd build && qmake6 ../Guitar.pro && make -j8`
- Release build: `qmake "CONFIG+=release" ../Guitar.pro && make`
- Debug build: `qmake "CONFIG+=debug" ../Guitar.pro && make`

## Code Style Guidelines
- C++17 standard with Qt 6 framework
- Classes use PascalCase naming (MainWindow, GitCommandRunner)
- Methods use camelCase naming (openRepository, setCurrentBranch)
- Private member variables use _ suffix or m pointer (data_, m)
- Constants and enums use UPPER_CASE or PascalCase
- Include order: class header, UI header, project headers, Qt headers, standard headers
- Error handling: prefer return values for operations that can fail
- Whitespace: tabs for indentation, spaces for alignment
- Line endings: LF (\n)
- Max line length: no limits
- Use Qt's signal/slot mechanism for async operations

```

---

## resources/claude.md-files/LangGraphJS/CLAUDE.md

```markdown
# LangGraphJS Development Guide

## Build & Test Commands
- Build: `yarn build`
- Lint: `yarn lint` (fix with `yarn lint:fix`)
- Format: `yarn format` (check with `yarn format:check`)
- Test: `yarn test` (single test: `yarn test:single /path/to/yourtest.test.ts`)
- Integration tests: `yarn test:int` (start deps: `yarn test:int:deps`, stop: `yarn test:int:deps:down`)

## Code Style Guidelines
- **TypeScript**: Target ES2021, NodeNext modules, strict typing enabled
- **Formatting**: 2-space indentation, 80 char width, double quotes, semicolons required
- **Naming**: camelCase (variables/functions), CamelCase (classes), UPPER_CASE (constants)
- **Files**: lowercase .ts, tests use .test.ts or .int.test.ts for integration
- **Error Handling**: Custom error classes that extend BaseLangGraphError
- **Imports**: ES modules with file extensions, order: external deps → internal modules → types
- **Project Structure**: Monorepo with yarn workspaces, libs/ for packages, examples/ for demos
- **New Features**: Match patterns of existing code, ensure proper testing, discuss major abstractions in issues

## Library Architecture

### System Layers
- **Channels Layer**: Base communication & state management (BaseChannel, LastValue, Topic)
- **Checkpointer Layer**: Persistence and state serialization across backends
- **Pregel Layer**: Message passing execution engine with superstep-based computation
- **Graph Layer**: High-level APIs for workflow definition (Graph, StateGraph)

### Key Dependencies
- Channels provide state management primitives used by Pregel nodes
- Checkpointer enables persistence, serialization, and time-travel debugging
- Pregel implements the execution engine using channels for communication
- Graph builds on Pregel adding workflow semantics and node/edge definitions
- StateGraph extends Graph with shared state management capabilities
```

---

## resources/claude.md-files/claude-code-mcp-enhanced/CLAUDE.md

```markdown
# GLOBAL CODING STANDARDS

> Reference guide for all project development. For detailed task planning, see [TASK_PLAN_GUIDE.md](./docs/memory_bank/guides/TASK_PLAN_GUIDE.md)

## 🔴 AGENT INSTRUCTIONS

**IMPORTANT**: As an agent, you MUST read and follow ALL guidelines in this document BEFORE executing any task in a task list. DO NOT skip or ignore any part of these standards. These standards supersede any conflicting instructions you may have received previously.

## Project Structure
```
project_name/
├── docs/
│   ├── CHANGELOG.md
│   ├── memory_bank/
│   └── tasks/
├── examples/
├── pyproject.toml
├── README.md
├── src/
│   └── project_name/
├── tests/
│   ├── fixtures/
│   └── project_name/
└── uv.lock
```

- **Package Management**: Always use uv with pyproject.toml, never pip
- **Mirror Structure**: examples/, tests/ mirror the project structure in src/
- **Documentation**: Keep comprehensive docs in docs/ directory

## Module Requirements
- **Size**: Maximum 500 lines of code per file
- **Documentation Header**: Every file must include:
  - Description of purpose
  - Links to third-party package documentation
  - Sample input
  - Expected output
- **Validation Function**: Every file needs a main block (`if __name__ == "__main__":`) that tests with real data

## Architecture Principles
- **Function-First**: Prefer simple functions over classes
- **Class Usage**: Only use classes when:
  - Maintaining state
  - Implementing data validation models
  - Following established design patterns
- **Async Code**: Never use `asyncio.run()` inside functions - only in main blocks
- **Type Hints**: Use the typing library for clear type annotations to improve code understanding and tooling
  - Type hints should be used for all function parameters and return values
  - Use type hints for key variables where it improves clarity
  - Prefer concrete types over Any when possible
  - Do not add type hints if they significantly reduce code readability
  ```python
  # Good type hint usage:
  from typing import Dict, List, Optional, Union, Tuple
  
  def process_document(doc_id: str, options: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
      """Process a document with optional configuration."""
      # Implementation
      return result
      
  # Simple types don't need annotations inside functions if obvious:
  def get_user_name(user_id: int) -> str:
      name = "John"  # Type inference works here, no annotation needed
      return name
  ```
- **NO Conditional Imports**: 
  - Never use try/except blocks for imports of required packages
  - If a package is in pyproject.toml, import it directly at the top of the file
  - Handle specific errors during usage, not during import
  - Only use conditional imports for truly optional features (rare)
  
  ```python
  # INCORRECT - DO NOT DO THIS:
  try:
      import tiktoken
      TIKTOKEN_AVAILABLE = True
  except ImportError:
      TIKTOKEN_AVAILABLE = False
      
  # CORRECT APPROACH:
  import tiktoken  # Listed in pyproject.toml as a dependency
  
  def count_tokens(text, model="gpt-3.5-turbo"):
      # Handle errors during usage, not import
      try:
          encoding = tiktoken.encoding_for_model(model)
          return len(encoding.encode(text))
      except Exception as e:
          logger.error(f"Token counting error: {e}")
          return len(text) // 4  # Fallback estimation
  ```

## Validation & Testing
- **Real Data**: Always test with actual data, never fake inputs
- **Expected Results**: Verify outputs against concrete expected results
- **No Mocking**: NEVER mock core functionality
- **MagicMock Ban**: MagicMock is strictly forbidden for testing core functionality
- **Meaningful Assertions**: Use assertions that verify specific expected values
- **🔴 Usage Functions Before Tests**: ALL relevant usage functions MUST successfully output expected results BEFORE any creation of tests. Tests are a future-proofing step when Agents improve at test-writing capabilities.
- **🔴 Results Before Lint**: ALL usage functionality MUST produce expected results BEFORE addressing ANY Pylint or other linter warnings. Functionality correctness ALWAYS comes before style compliance.
- **🔴 External Research After 3 Failures**: If a usage function fails validation 3 consecutive times with different approaches, the agent MUST use external research tools (perplexity_ask, perplexity_research, web_search) to find current best practices, package updates, or solutions for the specific problem. Document the research findings in comments.
- **🔴 NO UNCONDITIONAL "TESTS PASSED" MESSAGES**: NEVER include unconditional "All Tests Passed" or similar validation success messages. Success messages MUST be conditional on ACTUAL test results.
- **🔴 TRACK ALL VALIDATION FAILURES**: ALWAYS track ALL validation failures and report them at the end. NEVER stop validation after the first failure.
  ```python
  # INCORRECT - DO NOT DO THIS:
  if __name__ == "__main__":
      test_data = "test input"
      result = process_data(test_data)
      # This always prints regardless of success/failure
      print("✅ VALIDATION PASSED - All tests successful")
  
  # CORRECT IMPLEMENTATION:
  if __name__ == "__main__":
      import sys
      
      # List to track all validation failures
      all_validation_failures = []
      total_tests = 0
      
      # Test 1: Basic functionality
      total_tests += 1
      test_data = "example input"
      result = process_data(test_data)
      expected = {"key": "processed value"}
      if result != expected:
          all_validation_failures.append(f"Basic test: Expected {expected}, got {result}")
      
      # Test 2: Edge case handling
      total_tests += 1
      edge_case = "empty"
      edge_result = process_data(edge_case)
      edge_expected = {"key": ""}
      if edge_result != edge_expected:
          all_validation_failures.append(f"Edge case: Expected {edge_expected}, got {edge_result}")
      
      # Test 3: Error handling
      total_tests += 1
      try:
          error_result = process_data(None)
          all_validation_failures.append("Error handling: Expected exception for None input, but no exception was raised")
      except ValueError:
          # This is expected - test passes
          pass
      except Exception as e:
          all_validation_failures.append(f"Error handling: Expected ValueError for None input, but got {type(e).__name__}")
      
      # Final validation result
      if all_validation_failures:
          print(f"❌ VALIDATION FAILED - {len(all_validation_failures)} of {total_tests} tests failed:")
          for failure in all_validation_failures:
              print(f"  - {failure}")
          sys.exit(1)  # Exit with error code
      else:
          print(f"✅ VALIDATION PASSED - All {total_tests} tests produced expected results")
          print("Function is validated and formal tests can now be written")
          sys.exit(0)  # Exit with success code
  ```

## Standard Components
- **Logging**: Always use loguru for logging
  ```python
  from loguru import logger
  
  # Configure logger
  logger.add("app.log", rotation="10 MB")
  ```
- **CLI Structure**: Every command-line tool must use typer in a `cli.py` file
  ```python
  import typer
  
  app = typer.Typer()
  
  @app.command()
  def command_name(param: str = typer.Argument(..., help="Description")):
      """Command description."""
      # Implementation
  
  if __name__ == "__main__":
      app()
  ```

## Package Selection
- **Research First**: Always research packages before adding dependencies
- **95/5 Rule**: Use 95% package functionality, 5% customization
- **Documentation**: Include links to current documentation in comments

## Development Priority
1. Working Code
2. Validation
3. Readability
4. Static Analysis (address only after code works)

## Execution Standards
- Run scripts with: `uv run script.py`
- Use environment variables: `env VAR_NAME="value" uv run command`

## Task Planning
All task plans must follow the standard structure defined in the Task Plan Guide:

- **Document Location**: Store in `docs/memory_bank/guides/TASK_PLAN_GUIDE.md`
- **Core Principles**: 
  - Detailed task descriptions for consistent understanding
  - Verification-first development approach
  - Version control discipline with frequent commits
  - Human-friendly documentation with usage examples
- **Structure Elements**:
  - Clear objectives and requirements
  - Step-by-step implementation tasks
  - Verification methods for each function
  - Usage tables with examples
  - Version control plan
  - Progress tracking

Refer to the full [Task Plan Guide](./docs/memory_bank/guides/TASK_PLAN_GUIDE.md) for comprehensive details.

## 🔴 VALIDATION OUTPUT REQUIREMENTS

- **NEVER print "All Tests Passed" or similar unless ALL tests actually passed**
- **ALWAYS verify actual results against expected results BEFORE printing ANY success message**
- **ALWAYS test multiple cases, including normal cases, edge cases, and error handling**
- **ALWAYS track ALL failures and report them at the end - don't stop at first failure**
- **ALL validation functions MUST exit with code 1 if ANY tests fail**
- **ALL validation functions MUST exit with code 0 ONLY if ALL tests pass**
- **ALWAYS include count of failed tests and total tests in the output (e.g., "3 of 5 tests failed")**
- **ALWAYS include details of each failure when tests fail**
- **NEVER include irrelevant test output that could hide failures**
- **ALWAYS structure validation in a way that explicitly checks EACH test case**

## 🔴 COMPLIANCE CHECK
As an agent, before completing a task, verify that your work adheres to ALL standards in this document. Confirm each of the following:

1. All files have appropriate documentation headers
2. Each module has a working validation function that produces expected results
3. Type hints are used properly and consistently
4. All functionality is validated with real data before addressing linting issues
5. No asyncio.run() is used inside functions - only in the main block
6. Code is under the 500-line limit for each file
7. If function failed validation 3+ times, external research was conducted and documented
8. Validation functions NEVER include unconditional "All Tests Passed" messages
9. Validation functions ONLY report success if explicitly verified by comparing actual to expected results
10. Validation functions track and report ALL failures, not just the first one encountered
11. Validation output includes count of failed tests out of total tests run

If any standard is not met, fix the issue before submitting the work.

```

---

## resources/claude.md-files/Note-Companion/CLAUDE.md

```markdown
# File Organizer 2000 - Developer Guide

## Styling Guidelines

To avoid styling conflicts between Obsidian's styles and our plugin, follow these guidelines:

### 1. Tailwind Configuration

- The Tailwind configuration has been updated to add the `fo-` prefix to all Tailwind classes.
- This ensures our styles don't conflict with Obsidian's built-in styles.

### 2. Component Style Isolation

For all new components:

1. Import the `StyledContainer` component from components/ui/utils.tsx:
```tsx
import { StyledContainer } from "../../components/ui/utils";
```

2. Wrap your component's root element with StyledContainer:
```tsx
return (
  <StyledContainer>
    {/* Your component content */}
  </StyledContainer>
);
```

3. Use the `tw()` function for class names to ensure proper prefixing:
```tsx
import { tw } from "../../lib/utils";

// ...

<div className={tw("bg-white rounded-lg p-4")}>
  {/* content */}
</div>
```

4. For conditional classes, combine `tw()` with string interpolation:
```tsx
<div className={tw(`bg-white rounded-lg ${isActive ? "border-blue-500" : "border-gray-200"}`)}>
  {/* content */}
</div>
```

### 3. Using Existing Components

Our UI components in `components/ui/` are already configured to use the proper prefixing.
Always prefer using these components when available:

- Button
- Card
- Dialog
- Badge
- etc.

### 4. Troubleshooting Style Issues

If you encounter style conflicts:

1. Check if the component is wrapped in a `StyledContainer`
2. Verify all classNames use the `tw()` function
3. Inspect the rendered HTML to see if classes have the `fo-` prefix
4. Add more specific reset styles to the `.fo-container` class in styles.css if needed
```

---

## resources/claude.md-files/EDSL/CLAUDE.md

```markdown
# EDSL Codebase Reference

## Build & Test Commands
- Install: `make install`
- Run all tests: `make test`
- Run single test: `pytest -xv tests/path/to/test.py`
- Run with coverage: `make test-coverage`
- Run integration tests: `make test-integration`
- Type checking: `make lint` (runs mypy)
- Format code: `make format` (runs black-jupyter)
- Generate docs: `make docs`
- View docs: `make docs-view`

## Code Style Guidelines
- **Formatting**: Use Black for consistent code formatting
- **Imports**: Group by stdlib, third-party, internal modules
- **Type hints**: Required throughout, verified by mypy
- **Naming**: 
  - Classes: PascalCase
  - Methods/functions/variables: snake_case
  - Constants: UPPER_SNAKE_CASE
  - Private items: _prefixed_with_underscore
- **Error handling**: Use custom exception hierarchy with BaseException parent
- **Documentation**: Docstrings for all public functions/classes
- **Testing**: Every feature needs associated tests

## Permissions Guidelines
- **Allowed without asking**: Running tests, linting, code formatting, viewing files
- **Ask before**: Modifying tests, making destructive operations, installing packages
- **Never allowed**: Pushing directly to main branch, changing API keys/secrets
```

---

## resources/claude.md-files/Lamoom-Python/CLAUDE.md

```markdown
# Lamoom Python Project Guide

## Build/Test/Lint Commands
- Install deps: `poetry install`
- Run all tests: `poetry run pytest --cache-clear -vv tests`
- Run specific test: `poetry run pytest tests/path/to/test_file.py::test_function_name -v`
- Run with coverage: `make test`
- Format code: `make format` (runs black, isort, flake8, mypy)
- Individual formatting:
  - Black: `make make-black`
  - isort: `make make-isort`
  - Flake8: `make flake8`
  - Autopep8: `make autopep8`

## Code Style Guidelines
- Python 3.9+ compatible code
- Type hints required for all functions and methods
- Classes: PascalCase with descriptive names
- Functions/Variables: snake_case
- Constants: UPPERCASE_WITH_UNDERSCORES
- Imports organization with isort:
  1. Standard library imports
  2. Third-party imports
  3. Local application imports
- Error handling: Use specific exception types
- Logging: Use the logging module with appropriate levels
- Use dataclasses for structured data when applicable

## Project Conventions
- Use poetry for dependency management
- Add tests for all new functionality
- Maintain >80% test coverage (current min: 81%)
- Follow pre-commit hooks guidelines
- Document public APIs with docstrings
```

---

## resources/claude.md-files/Network-Chronicles/CLAUDE.md

```markdown
# Network Chronicles Development Notes

## Common Commands
- `chmod +x <script_name>` - Make a script executable
- `./bin/service-discovery.sh $(whoami)` - Run service discovery manually 
- `./nc-discover-services.sh` - Run service discovery wrapper script

## Agentic LLM Integration Implementation Plan

### Goals
- Create an Agentic LLM to act as "The Architect" character
- Add dynamic, personalized interactions with the character
- Ensure interactions are contextually aware of player's progress and discoveries
- Maintain narrative consistency while allowing for dynamic conversations

### Implementation Steps
1. Create a LLM-powered Architect Agent
   - Design a system to communicate with an LLM API (e.g., Claude, GPT)
   - Implement appropriate context management
   - Define character parameters and constraints
   - Create conversation history tracking

2. Build context gathering system
   - Collect player's progress data (discoveries, quests, journal entries)
   - Gather relevant game state information
   - Format context for effective LLM prompting

3. Develop triggering mechanisms
   - Create situations where The Architect can appear
   - Implement terminal-based chat interface
   - Add special encrypted message system

4. Ensure narrative consistency
   - Maintain character voice and motivations
   - Align interactions with game story progression
   - Create guardrails to prevent contradictions

5. Add cryptic messaging capabilities
   - Enable The Architect to provide hints in character
   - Create system for encrypted or hidden messages
   - Implement progressive revelation of information

### Technical Implementation

#### 1. Architect Agent System (`bin/architect-agent.sh`)
- Script to manage communication with LLM API
- Handles context management and prompt construction
- Processes responses and formats them appropriately
- Maintains conversation history in player state

#### 2. Context Manager (`bin/utils/context-manager.sh`)
- Gathers and processes game state for context
- Extracts relevant player discoveries and progress
- Formats information for inclusion in prompts
- Manages context window limitations

#### 3. Terminal Chat Interface (`bin/architect-terminal.sh`)
- Provides retro-themed terminal interface for chatting with The Architect
- Simulates encrypted connection
- Handles input/output with appropriate styling
- Maintains immersion with themed elements

#### 4. Prompt Template System
- Base prompt with character definition and constraints
- Dynamic context injection based on game state
- System for tracking conversation history
- Safety guardrails and response guidelines

### Character Guidelines for The Architect

The Architect should embody these characteristics:
- Knowledgeable but cryptic - never gives direct answers
- Paranoid but methodical - believes they're being monitored
- Technical and precise - speaks like an experienced sysadmin
- Mysterious but helpful - wants to guide the player
- Bound by constraints - can't reveal everything at once

### Technical Requirements
- LLM API access (Claude or similar)
- Context window management
- Conversation history tracking
- Reliable error handling
- Rate limiting and token management

## Enhanced Service Discovery Implementation

### Implementation Summary
We've successfully implemented enhanced service discovery capabilities for Network Chronicles:

1. **Service Detection System**
   - Created `service-discovery.sh` script that safely detects running services on the local machine
   - Implemented detection for common services like web servers, databases, and monitoring systems
   - Added support for identifying unknown services on non-standard ports
   - Generates appropriate XP rewards and notifications for discoveries

2. **Template-Based Content System**
   - Created a template processing system (`template-processor.sh`) for dynamic content generation
   - Implemented service-specific templates for common services (web, database, monitoring)
   - Added unknown service template for handling custom/unexpected services
   - Templates include narrative content, challenge definitions, and documentation

3. **Network Map Integration**
   - Enhanced the network map to visually display discovered services
   - Added rich ASCII visualization for different service types
   - Updated the legend to include detailed service information
   - Added support for unknown/custom services in the visualization

4. **Narrative Integration**
   - Created new quest for service discovery
   - Added journal entry generation based on discovered services
   - Implemented conditional challenge generation based on service combinations
   - Enhanced storytelling by connecting discoveries to The Architect's disappearance

5. **Game Engine Integration**
   - Updated the core engine to detect service discovery commands
   - Added hints for players to guide them to service discovery
   - Created workflow integration to ensure natural gameplay progression

### Usage
To use the enhanced service discovery:

1. Players first need to map the basic network (discover network_gateway and local_network)
2. The game then suggests using service discovery with appropriate hints
3. Players can run `nc-discover-services.sh` to scan for services
4. The network map updates to show discovered services
5. New journal entries and challenges are created based on discoveries

### Technical Details
- Service detection uses `ss`, `netstat`, or `lsof` with fallback mechanisms for compatibility
- Template system uses JSON templates with variable substitution for customization
- Generated content is stored in player's documentation directory
- Service-specific challenges and narratives adapt based on combinations of discoveries

### Future Enhancements
- Add more service templates for additional service types
- Implement network scanning of other hosts beyond localhost
- Create more complex multi-stage challenges based on service combinations
- Add service fingerprinting to detect specific versions and configurations
```

---

## resources/claude.md-files/AVS-Vibe-Developer-Guide/CLAUDE.md

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure
- This is a prompt library for EigenLayer AVS (Actively Validated Services) development
- Contains prompt templates for idea refinement, design generation, and prototype implementation
- Test folder contains example AVS ideas and implementations

## Commands
- No build/lint/test commands available as this is primarily a documentation repository
- To validate prompts: test them manually against benchmark examples

## Code Style Guidelines
- Markdown files should be well-structured with clear headings
- Use consistent terminology related to EigenLayer concepts
- Follow AVS development progression: idea → design → implementation
- Keep prompts focused on one Operator Set at a time
- Include sections for: project purpose, operator work, validation logic, and rewards

## Naming Conventions
- Files should use kebab-case for naming
- Stage-specific prompts are named: stage{n}-{purpose}-prompt.md
- Benchmark examples should be placed in appropriately named subdirectories
```

---

## resources/claude.md-files/Basic-Memory/CLAUDE.md

```markdown
# CLAUDE.md - Basic Memory Project Guide

## Project Overview

Basic Memory is a local-first knowledge management system built on the Model Context Protocol (MCP). It enables
bidirectional communication between LLMs (like Claude) and markdown files, creating a personal knowledge graph that can
be traversed using links between documents.

## CODEBASE DEVELOPMENT

### Project information

See the [README.md](README.md) file for a project overview.

### Build and Test Commands

- Install: `just install` or `pip install -e ".[dev]"`
- Run tests: `uv run pytest -p pytest_mock -v` or `just test`
- Single test: `pytest tests/path/to/test_file.py::test_function_name`
- Lint: `just lint` or `ruff check . --fix`
- Type check: `just type-check` or `uv run pyright`
- Format: `just format` or `uv run ruff format .`
- Run all code checks: `just check` (runs lint, format, type-check, test)
- Create db migration: `just migration "Your migration message"`
- Run development MCP Inspector: `just run-inspector`

### Code Style Guidelines

- Line length: 100 characters max
- Python 3.12+ with full type annotations
- Format with ruff (consistent styling)
- Import order: standard lib, third-party, local imports
- Naming: snake_case for functions/variables, PascalCase for classes
- Prefer async patterns with SQLAlchemy 2.0
- Use Pydantic v2 for data validation and schemas
- CLI uses Typer for command structure
- API uses FastAPI for endpoints
- Follow the repository pattern for data access
- Tools communicate to api routers via the httpx ASGI client (in process)
- avoid using "private" functions in modules or classes (prepended with _)

### Codebase Architecture

- `/alembic` - Alembic db migrations
- `/api` - FastAPI implementation of REST endpoints
- `/cli` - Typer command-line interface
- `/markdown` - Markdown parsing and processing
- `/mcp` - Model Context Protocol server implementation
- `/models` - SQLAlchemy ORM models
- `/repository` - Data access layer
- `/schemas` - Pydantic models for validation
- `/services` - Business logic layer
- `/sync` - File synchronization services

### Development Notes

- MCP tools are defined in src/basic_memory/mcp/tools/
- MCP prompts are defined in src/basic_memory/mcp/prompts/
- MCP tools should be atomic, composable operations
- Use `textwrap.dedent()` for multi-line string formatting in prompts and tools
- MCP Prompts are used to invoke tools and format content with instructions for an LLM
- Schema changes require Alembic migrations
- SQLite is used for indexing and full text search, files are source of truth
- Testing uses pytest with asyncio support (strict mode)
- Test database uses in-memory SQLite
- Avoid creating mocks in tests in most circumstances.
- Each test runs in a standalone environment with in memory SQLite and tmp_file directory
- Do not use mocks in tests if possible. Tests run with an in memory sqlite db, so they are not needed. See fixtures in conftest.py

## BASIC MEMORY PRODUCT USAGE

### Knowledge Structure

- Entity: Any concept, document, or idea represented as a markdown file
- Observation: A categorized fact about an entity (`- [category] content`)
- Relation: A directional link between entities (`- relation_type [[Target]]`)
- Frontmatter: YAML metadata at the top of markdown files
- Knowledge representation follows precise markdown format:
    - Observations with [category] prefixes
    - Relations with WikiLinks [[Entity]]
    - Frontmatter with metadata

### Basic Memory Commands

- Sync knowledge: `basic-memory sync` or `basic-memory sync --watch`
- Import from Claude: `basic-memory import claude conversations`
- Import from ChatGPT: `basic-memory import chatgpt`
- Import from Memory JSON: `basic-memory import memory-json`
- Check sync status: `basic-memory status`
- Tool access: `basic-memory tools` (provides CLI access to MCP tools)
    - Guide: `basic-memory tools basic-memory-guide`
    - Continue: `basic-memory tools continue-conversation --topic="search"`

### MCP Capabilities

- Basic Memory exposes these MCP tools to LLMs:

  **Content Management:**
    - `write_note(title, content, folder, tags)` - Create/update markdown notes with semantic observations and relations
    - `read_note(identifier, page, page_size)` - Read notes by title, permalink, or memory:// URL with knowledge graph awareness
    - `edit_note(identifier, operation, content)` - Edit notes incrementally (append, prepend, find/replace, section replace)
    - `move_note(identifier, destination_path)` - Move notes with database consistency and search reindexing
    - `view_note(identifier)` - Display notes as formatted artifacts for better readability in Claude Desktop
    - `read_content(path)` - Read raw file content (text, images, binaries) without knowledge graph processing
    - `delete_note(identifier)` - Delete notes from knowledge base

  **Project Management:**
    - `list_memory_projects()` - List all available projects with status indicators
    - `switch_project(project_name)` - Switch to different project context during conversations
    - `get_current_project()` - Show currently active project with statistics
    - `create_memory_project(name, path, set_default)` - Create new Basic Memory projects
    - `delete_project(name)` - Delete projects from configuration and database
    - `set_default_project(name)` - Set default project in config
    - `sync_status()` - Check file synchronization status and background operations

  **Knowledge Graph Navigation:**
    - `build_context(url, depth, timeframe)` - Navigate the knowledge graph via memory:// URLs for conversation continuity
    - `recent_activity(type, depth, timeframe)` - Get recently updated information with specified timeframe (e.g., "1d", "1 week")
    - `list_directory(dir_name, depth, file_name_glob)` - List directory contents with filtering and depth control

  **Search & Discovery:**
    - `search_notes(query, page, page_size)` - Full-text search across all content with filtering options

  **Visualization:**
    - `canvas(nodes, edges, title, folder)` - Generate Obsidian canvas files for knowledge graph visualization

- MCP Prompts for better AI interaction:
    - `ai_assistant_guide()` - Guidance on effectively using Basic Memory tools for AI assistants
    - `continue_conversation(topic, timeframe)` - Continue previous conversations with relevant historical context
    - `search_notes(query, after_date)` - Search with detailed, formatted results for better context understanding
    - `recent_activity(timeframe)` - View recently changed items with formatted output
    - `json_canvas_spec()` - Full JSON Canvas specification for Obsidian visualization

## AI-Human Collaborative Development

Basic Memory emerged from and enables a new kind of development process that combines human and AI capabilities. Instead
of using AI just for code generation, we've developed a true collaborative workflow:

1. AI (LLM) writes initial implementation based on specifications and context
2. Human reviews, runs tests, and commits code with any necessary adjustments
3. Knowledge persists across conversations using Basic Memory's knowledge graph
4. Development continues seamlessly across different AI sessions with consistent context
5. Results improve through iterative collaboration and shared understanding

This approach has allowed us to tackle more complex challenges and build a more robust system than either humans or AI
could achieve independently.

## GitHub Integration

Basic Memory uses Claude directly into the development workflow through GitHub:

### GitHub MCP Tools

Using the GitHub Model Context Protocol server, Claude can:

- **Repository Management**:
    - View repository files and structure
    - Read file contents
    - Create new branches
    - Create and update files

- **Issue Management**:
    - Create new issues
    - Comment on existing issues
    - Close and update issues
    - Search across issues

- **Pull Request Workflow**:
    - Create pull requests
    - Review code changes
    - Add comments to PRs

This integration enables Claude to participate as a full team member in the development process, not just as a code
generation tool. Claude's GitHub account ([bm-claudeai](https://github.com/bm-claudeai)) is a member of the Basic
Machines organization with direct contributor access to the codebase.

### Collaborative Development Process

With GitHub integration, the development workflow includes:

1. **Direct code review** - Claude can analyze PRs and provide detailed feedback
2. **Contribution tracking** - All of Claude's contributions are properly attributed in the Git history
3. **Branch management** - Claude can create feature branches for implementations
4. **Documentation maintenance** - Claude can keep documentation updated as the code evolves

With this integration, the AI assistant is a full-fledged team member rather than just a tool for generating code
snippets.


### Basic Memory Pro

Basic Memory Pro is a desktop GUI application that wraps the basic-memory CLI/MCP tools:

- Built with Tauri (Rust), React (TypeScript), and a Python FastAPI sidecar
- Provides visual knowledge graph exploration and project management
- Uses the same core codebase but adds a desktop-friendly interface
- Project configuration is shared between CLI and Pro versions
- Multiple project support with visual switching interface

local repo: /Users/phernandez/dev/basicmachines/basic-memory-pro
github: https://github.com/basicmachines-co/basic-memory-pro

## Release and Version Management

Basic Memory uses `uv-dynamic-versioning` for automatic version management based on git tags:

### Version Types
- **Development versions**: Automatically generated from commits (e.g., `0.12.4.dev26+468a22f`)
- **Beta releases**: Created by tagging with beta suffixes (e.g., `v0.13.0b1`, `v0.13.0rc1`)
- **Stable releases**: Created by tagging with version numbers (e.g., `v0.13.0`)

### Release Workflows

#### Development Builds (Automatic)
- Triggered on every push to `main` branch
- Publishes dev versions like `0.12.4.dev26+468a22f` to PyPI
- Allows continuous testing of latest changes
- Users install with: `pip install basic-memory --pre --force-reinstall`

#### Beta/RC Releases (Manual)
- Create beta tag: `git tag v0.13.0b1 && git push origin v0.13.0b1`
- Automatically builds and publishes to PyPI as pre-release
- Users install with: `pip install basic-memory --pre`
- Use for milestone testing before stable release

#### Stable Releases (Automated)
- Use the automated release system: `just release v0.13.0`
- Includes comprehensive quality checks (lint, format, type-check, tests)
- Automatically updates version in `__init__.py`
- Creates git tag and pushes to GitHub
- Triggers GitHub Actions workflow for:
  - PyPI publication
  - Homebrew formula update (requires HOMEBREW_TOKEN secret)

**Manual method (legacy):**
- Create version tag: `git tag v0.13.0 && git push origin v0.13.0`

#### Homebrew Formula Updates
- Automatically triggered after successful PyPI release for **stable releases only**
- **Stable releases** (e.g., v0.13.7) automatically update the main `basic-memory` formula
- **Pre-releases** (dev/beta/rc) are NOT automatically updated - users must specify version manually
- Updates formula in `basicmachines-co/homebrew-basic-memory` repo
- Requires `HOMEBREW_TOKEN` secret in GitHub repository settings:
  - Create a fine-grained Personal Access Token with `Contents: Read and Write` and `Actions: Read` scopes on `basicmachines-co/homebrew-basic-memory`
  - Add as repository secret named `HOMEBREW_TOKEN` in `basicmachines-co/basic-memory`
- Formula updates include new version URL and SHA256 checksum

### For Development
- **Automated releases**: Use `just release v0.13.x` for stable releases and `just beta v0.13.0b1` for beta releases
- **Quality gates**: All releases require passing lint, format, type-check, and test suites
- **Version management**: Versions automatically derived from git tags via `uv-dynamic-versioning`
- **Configuration**: `pyproject.toml` uses `dynamic = ["version"]`
- **Release automation**: `__init__.py` updated automatically during release process
- **CI/CD**: GitHub Actions handles building and PyPI publication

## Development Notes
- make sure you sign off on commits

```

---

## resources/claude.md-files/Perplexity-MCP/CLAUDE.md

```markdown
# Perplexity MCP Server Guide

## Quick Start
1. **Install Dependencies**: `npm install`
2. **Set API Key**: Add to `.env` file or use environment variable:
   ```
   PERPLEXITY_API_KEY=your_api_key_here
   ```
3. **Run Server**: `node server.js`

## Claude Desktop Configuration
Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "perplexity": {
      "command": "node",
      "args": [
        "/absolute/path/to/perplexity-mcp/server.js"
      ],
      "env": {
        "PERPLEXITY_API_KEY": "your_perplexity_api_key"
      }
    }
  }
}
```

## NPM Global Installation
Run: `npm install -g .`

Then configure in Claude Desktop:
```json
{
  "mcpServers": {
    "perplexity": {
      "command": "npx",
      "args": [
        "perplexity-mcp"
      ],
      "env": {
        "PERPLEXITY_API_KEY": "your_perplexity_api_key"
      }
    }
  }
}
```

## NVM Users
If using NVM, you must use absolute paths to both node and the script:
```json
{
  "mcpServers": {
    "perplexity": {
      "command": "/Users/username/.nvm/versions/node/v16.x.x/bin/node",
      "args": [
        "/Users/username/path/to/perplexity-mcp/server.js"
      ],
      "env": {
        "PERPLEXITY_API_KEY": "your_perplexity_api_key"
      }
    }
  }
}
```

## Available Tools
- **perplexity_ask**: Send a single question to Perplexity
  - Default model: `llama-3.1-sonar-small-128k-online`
- **perplexity_chat**: Multi-turn conversation with Perplexity 
  - Default model: `mixtral-8x7b-instruct`

## Troubleshooting
- Check logs with `cat ~/.claude/logs/perplexity.log`
- Ensure your API key is valid and has not expired
- Validate your claude_desktop_config.json format
- Add verbose logging with the `DEBUG=1` environment variable

## Architecture
- Built with the MCP protocol
- Communication via stdio transport
- Lightweight proxy to Perplexity API
```

---

## resources/claude.md-files/Course-Builder/CLAUDE.md

```markdown
# Course Builder Development Guide

## Project Overview

Course Builder is a real-time multiplayer CMS (Content Management System) designed specifically for building and deploying developer education products. This monorepo contains multiple applications and shared packages that work together to provide a comprehensive platform for creating, managing, and delivering educational content.

### Main Features
- Content management for courses, modules, and lessons
- Video processing pipeline with transcription
- AI-assisted content creation and enhancement
- Real-time collaboration for content creators
- Authentication and authorization
- Payment processing and subscription management
- Progress tracking for students

### Key Technologies
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Monorepo**: Turborepo with PNPM workspaces
- **Database**: Drizzle ORM with MySQL/PlanetScale
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **API**: tRPC for type-safe API calls
- **Real-time**: PartyKit/websockets for collaboration
- **Event Processing**: Inngest for workflows and background jobs
- **Media**: Mux for video processing, Deepgram for transcription
- **AI**: OpenAI/GPT for content assistance
- **Payments**: Stripe integration

## Repository Structure

### Apps (`/apps`)
- `ai-hero`: Main application focused on AI-assisted learning
- `astro-party`: An Astro-based implementation
- `course-builder-web`: The main Course Builder web application
- `egghead`: Integration with egghead.io platform
- `epic-react`: Specific implementation for React courses
- `go-local-first`: Implementation with local-first capabilities

### Packages (`/packages`)
- **Core Functionality**:
  - `core`: Framework-agnostic core library
  - `ui`: Shared UI components based on Radix/shadcn
  - `adapter-drizzle`: Database adapter for Drizzle ORM
  - `next`: Next.js specific bindings
  - `commerce-next`: Commerce components and functionality

- **Utility Packages**:
  - `utils-ai`: AI-related utilities
  - `utils-auth`: Authentication and authorization utilities
  - `utils-aws`: AWS service utilities
  - `utils-browser`: Browser-specific utilities (cookies, etc.)
  - `utils-core`: Core utilities like `guid`
  - `utils-email`: Email-related utilities
  - `utils-file`: File handling utilities
  - `utils-media`: Media processing utilities
  - `utils-resource`: Resource filtering and processing utilities
  - `utils-search`: Search functionality utilities
  - `utils-seo`: SEO utilities
  - `utils-string`: String manipulation utilities
  - `utils-ui`: UI utilities like `cn`

### Other Directories
- `cli`: Command-line tools for project bootstrapping
- `docs`: Documentation including shared utilities guide
- `instructions`: Detailed instructions for development tasks
- `plop-templates`: Templates for code generation

## Command Reference

### Build Commands
- `pnpm build:all` - Build all packages and apps
- `pnpm build` - Build all packages (not apps)
- `pnpm build --filter="ai-hero"` - Build specific app
- `pnpm dev:all` - Run dev environment for all packages/apps
- `pnpm dev` - Run dev environment for packages only

### Testing
- `pnpm test` - Run all tests
- `pnpm test --filter="@coursebuilder/utils-file"` - Test specific package
- `pnpm test:watch` - Run tests in watch mode
- `cd packages/package-name && pnpm test` - Run tests for specific package
- `cd packages/package-name && pnpm test src/path/to/test.test.ts` - Run a single test file
- `cd packages/package-name && pnpm test:watch src/path/to/test.test.ts` - Watch single test file

### Linting and Formatting
- `pnpm lint` - Run linting on all packages/apps
- `pnpm format:check` - Check formatting without changing files
- `pnpm format` - Format all files using Prettier
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm manypkg fix` - Fix dependency version mismatches and sort package.json files

Use `--filter="APP_NAME"` to run commands for a specific app

## Code Generation and Scaffolding

### Creating New Utility Packages
Use the custom Plop template to create new utility packages:

```bash
# Create a new utility package using the template
pnpm plop package-utils <domain> <utilityName> <functionName> "<utilityDescription>"

# Example:
pnpm plop package-utils browser cookies getCookies "Browser cookie utility"

# With named parameters:
pnpm plop package-utils -- --domain browser --utilityName cookies --functionName getCookies --utilityDescription "Browser cookie utility"
```

This will create a properly structured package with:
- Correct package.json with exports configuration
- TypeScript configuration
- Basic implementation with proper TSDoc comments
- Test scaffolding

### Working with Utility Packages

#### Adding Dependencies
When updating package.json files to add dependencies:
1. Use string replacement with Edit tool to add dependencies
2. Maintain alphabetical order of dependencies
3. Don't replace entire sections, just add the new line

Example of proper package.json edit:
```
"@coursebuilder/utils-media": "1.0.0",
"@coursebuilder/utils-seo": "1.0.0",

// Replace with:
"@coursebuilder/utils-media": "1.0.0",
"@coursebuilder/utils-resource": "1.0.0", // New line added here
"@coursebuilder/utils-seo": "1.0.0",
```

#### Framework Compatibility
When creating utility packages that interact with framework-specific libraries:
1. Keep framework-specific dependencies (React, Next.js, etc.) as peer dependencies
2. For utilities that use third-party libraries (like Typesense, OpenAI), provide adapters rather than direct implementations
3. Be careful with libraries that might conflict with framework internals
4. Test builds across multiple apps to ensure compatibility

## Code Style
- **Formatting**: Single quotes, no semicolons, tabs (width: 2), 80 char line limit
- **Imports**: Organized by specific order (React → Next → 3rd party → internal)
- **File structure**: Monorepo with apps in /apps and packages in /packages
- **Package Manager**: PNPM (v8.15.5+)
- **Testing Framework**: Vitest

### Conventional Commits
We use conventional commits with package/app-specific scopes:
- Format: `<type>(<scope>): <description>`
- Types: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`
- Scopes:
  - App codes: `aih` (ai-hero), `egh` (egghead), `eweb` (epic-web)
  - Packages: `utils-email`, `core`, `ui`, `mdx-mermaid`, etc.

Examples:
- `fix(egh): convert SanityReference to SanityArrayElementReference`
- `style(mdx-mermaid): make flowcharts nicer`
- `refactor(utils): implement SEO utility package with re-export pattern`
- `feat(utils-email): create email utilities package with sendAnEmail`

## Common Patterns

### Dependency Management
When adding dependencies to packages in the monorepo, ensure that:
1. All packages use consistent dependency versions
2. Dependencies in package.json files are sorted alphabetically

If you encounter linting errors related to dependency versions or sorting:
```bash
# Fix dependency version mismatches and sort package.json files
pnpm manypkg fix
```

### Re-export Pattern for Backward Compatibility
When creating shared utility packages, use the re-export pattern to maintain backward compatibility:

```typescript
// In /apps/app-name/src/utils/some-utility.ts
// Re-export from the shared package
export { someUtility } from '@coursebuilder/utils-domain/some-utility'
```

This preserves existing import paths throughout the codebase while moving the implementation to a shared package.

#### Important: Avoid Object.defineProperty for Re-exports
Do NOT use `Object.defineProperty(exports, ...)` for re-exports as this can cause conflicts with framework internals, especially with Next.js and tRPC:

```typescript
// DON'T DO THIS - can cause "Cannot redefine property" errors in build
Object.defineProperty(exports, 'someFunction', {
  value: function() { /* implementation */ }
})

// INSTEAD DO THIS - standard export pattern
export function someFunction() { /* implementation */ }
```

These conflicts typically manifest as "Cannot redefine property" errors during build and are difficult to debug. They occur because the build process may try to define the same property multiple times through different bundling mechanisms.

### TSDoc Comments for Utilities
Always include comprehensive TSDoc comments for utility functions:

```typescript
/**
 * Brief description of what the function does
 * 
 * Additional details if needed
 * 
 * @param paramName - Description of the parameter
 * @returns Description of the return value
 * 
 * @example
 * ```ts
 * // Example usage code
 * const result = myFunction('input')
 * ```
 */
```

### App Directory Structure Pattern
Most apps follow this general directory structure:
- `src/app` - Next.js App Router pages and layouts
- `src/components` - React components
- `src/lib` - Domain-specific business logic
- `src/utils` - Utility functions
- `src/db` - Database schema and queries
- `src/server` - Server-side functions and API routes
- `src/hooks` - React hooks
- `src/trpc` - tRPC router and procedures

### Database Schema
Most applications use Drizzle ORM with a schema in `src/db/schema.ts` that typically includes:
- Users and authentication
- Content resources (courses, modules, lessons)
- Progress tracking
- Purchases and subscriptions

### Auth Pattern
Authentication usually follows this pattern:
- NextAuth.js for authentication providers
- CASL ability definitions for authorization
- Custom middleware for route protection

```

---

## resources/claude.md-files/AI-IntelliJ-Plugin/CLAUDE.md

```markdown
# AI Integration Plugin Development Guide

## Build Commands
- `./gradlew build` - Build the entire project
- `./gradlew test` - Run all tests
- `./gradlew test --tests "com.didalgo.intellij.chatgpt.chat.metadata.UsageAggregatorTest"` - Run a specific test class
- `./gradlew test --tests "*.StandardLanguageTest.testDetection"` - Run a specific test method
- `./gradlew runIde` - Run the plugin in a development IDE instance
- `./gradlew runPluginVerifier` - Verify plugin compatibility with different IDE versions
- `./gradlew koverReport` - Generate code coverage report

## Code Style Guidelines
- **Package Structure**: Use `com.didalgo.intellij.chatgpt` as base package
- **Imports**: Organize imports alphabetically; no wildcards; static imports last
- **Naming**: CamelCase for classes; camelCase for methods/variables; UPPER_SNAKE_CASE for constants
- **Types**: Use annotations (`@NotNull`, `@Nullable`) consistently; prefer interface types in declarations
- **Error Handling**: Use checked exceptions for recoverable errors; runtime exceptions for programming errors
- **Documentation**: Javadoc for public APIs; comment complex logic; keep code self-explanatory
- **Testing**: Write unit tests for all business logic; integration tests for UI components
- **Architecture**: Follow IDEA plugin architecture patterns; use services for global state

## Coding Patterns
- Use `ChatGptBundle` for internationalized strings
- Leverage IntelliJ Platform APIs when possible instead of custom implementations
- Use dependency injection via constructor parameters rather than service lookups
```

---

## resources/claude.md-files/JSBeeb/CLAUDE.md

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Test Commands

- `npm start` - Start development server (IMPORTANT: Never run this command directly; ask the user to start the server
  as needed)
- `npm run build` - Build production version
- `npm run lint` - Run ESLint
- `npm run lint-fix` - Run ESLint with auto-fix
- `npm run format` - Run Prettier
- `npm run test` - Run all tests
- `npm run test:unit` - Run unit tests
- `npm run test:integration` - Run integration tests
- `npm run test:cpu` - Run CPU compatibility tests
- `npm run ci-checks` - Run linting checks for CI
- `vitest run tests/unit/test-gzip.js` - Run a single test file

### Code Coverage

- `npm run coverage:unit` - Run unit tests with coverage
- `npm run coverage:all-tests` - Run all tests with coverage
- Coverage reports are generated in the `coverage` directory
- HTML report includes line-by-line coverage visualization

## Code Style Guidelines

- **Formatting**: Uses Prettier, configured in package.json
- **Linting**: ESLint with eslint-config-prettier integration
- **Modules**: ES modules with import/export syntax (type: "module")
- **JavaScript Target**: ES2020 with strict null checks
- **Error Handling**: Use try/catch with explicit error messages that provide context about what failed
- **Naming**: camelCase for variables and functions, PascalCase for classes
- **Imports**: Group by source (internal/external) with proper separation
- **Documentation**: Use JSDoc for public APIs and complex functions, add comments for non-obvious code
- **Error Messages**: Use consistent, specific error messages (e.g., "Track buffer overflow" instead of "Overflow in disc building")

## Test Organization

- **Test Consolidation**: All tests for a specific component should be consolidated in a single test file.
  For example, all tests for `emulator.js` should be in `test-emulator.js` - do not create separate test files
  for different aspects of the same component.
- **Test Structure**: Use nested describe blocks to organize tests by component features
- **Test Isolation**: When mocking components in tests, use `vi.spyOn()` with `vi.restoreAllMocks()` in
  `afterEach` hooks rather than global `vi.mock()` to prevent memory leaks and test pollution
- **Memory Management**: Avoid global mocks that can leak between tests and accumulate memory usage over time
- **Test philosophy**
  - Mock as little as possible: Try and rephrase code not to require it.
  - Try not to rely on internal state: don't manipulate objects' inner state in tests

## Project-Specific Knowledge

- **Never commit code unless asked**: Very often we'll work on code and iterate. After you think it's complete, let me
  check it before you commit.

### Code Architecture

- **General Principles**:
  - Follow the existing code style and structure
  - Use `const` and `let` instead of `var`
  - Avoid global variables; use module scope
  - Use arrow functions for callbacks
  - Prefer template literals over string concatenation
  - Use destructuring for objects and arrays when appropriate
  - Use async/await for asynchronous code instead of callbacks or promises
  - Minimise special case handling - prefer explicit over implicit behaviour
  - Consider adding tests first before implementing features
- **When simplifying existing code**

  - Prefer helper functions for repetitive operations (like the `appendParam` function)
  - Remove unnecessary type checking where types are expected to be correct
  - Replace complex conditionals with more readable alternatives when possible
  - Ensure simplifications don't break existing behavior or assumptions
  - Try and modernise the code to use ES6+ features where possible

- Prefer helper functions for repetitive operations (like the `appendParam` function)
- Remove unnecessary type checking where types are expected to be correct
- Replace complex conditionals with more readable alternatives when possible
- Ensure simplifications don't break existing behavior or assumptions

- **Constants and Magic Numbers**:

  - Local un-exported properties should be used for shared constants
  - Local constants should be used for temporary values
  - Always use named constants instead of magic numbers in code
  - Use PascalCase for module-level constants (e.g., `const MaxHfeTrackPulses = 3132;`)
  - Prefer module-level constants over function-local constants for shared values
  - Define constants at the beginning of functions or at the class/module level as appropriate
  - Add comments explaining what the constant represents, especially for non-obvious values

- **Pre-commit Hooks**:
  - The project uses lint-staged with ESLint
  - Watch for unused variables and ensure proper error handling
  - YOU MUST NEVER bypass git commit hooks on checkins. This leads to failures in CI later on

### Git Workflow

- When creating branches with Claude, use the `claude/` prefix (e.g., `claude/fix-esm-import-error`)

```

---

## resources/claude.md-files/SPy/CLAUDE.md

```markdown
# SPy Language - Dev Reference

## General behavior of claude code
- NEVER run tests automatically unless explicitly asked
- when asked to write a test, write just the test without trying to fix it
- avoid writing useless comments: if you need to write a comment, explain WHY
  the code does something instead of WHAT it does



## Common Commands
- When running tests, always use the venv: e.g. `./venv/bin/pytest'
- Run all tests: `pytest`
- Run single test: `pytest spy/tests/path/to/test_file.py::TestClass::test_function`
- Run backend-specific tests: `pytest -m interp` or `-m C` or `-m doppler`
- Type checking: `mypy`
- Test shortcut: `source pytest-shortcut.sh` (enables `p` as pytest alias with tab completion)

## Compile SPy Code
```bash
spy your_file.spy                 # Execute (default)
spy -C your_file.spy              # Generate C code
spy -c your_file.spy              # Compile to executable
spy -O 1 -g your_file.spy         # With optimization and debug symbols
```

## Code Style Guidelines
- Use strict typing (mypy enforced)
- Classes: PascalCase (`CompilerTest`)
- Functions/methods: snake_case (`compile_module()`)
- Constants: SCREAMING_SNAKE_CASE (`ALL_BACKENDS`)
- Organize imports by standard Python conventions
- Prefer specific imports: `from spy.errors import SPyError`
- Tests inherit from `CompilerTest` base class
- Use backend-specific decorators for test filtering (`@only_interp`, `@skip_backends`)

```

---

## resources/claude.md-files/Comm/CLAUDE.md

```markdown
# Comm Project Development Guide

## Build & Test Commands

- Run tests: `yarn workspace [lib|web|keyserver|native] test`
- Test all packages: `yarn jest:all`
- Run lint: `yarn eslint:all`
- Fix lint issues: `yarn eslint:fix`
- Check Flow types: `yarn flow:all` or `yarn workspace [workspace] flow`
- Run dev server: `yarn workspace [workspace] dev`
- Clean install: `yarn cleaninstall`

## Code Style

### Types

- Use Flow for static typing with strict mode enabled
- Always include `// @flow` annotation at the top of JS files
- Export types with explicit naming: `export type MyType = {...}`

### Formatting

- Prettier with 80-char line limit
- Single quotes, trailing commas
- Arrow function parentheses avoided when possible
- React component files named \*.react.js

### Naming

- kebab-case for filenames (enforced by unicorn/filename-case)
- Descriptive variable names

### Imports

- Group imports with newlines between builtin/external and internal
- Alphabetize imports within groups
- No relative imports between workspaces - use workspace references

### React

- Use functional components with hooks
- Follow exhaustive deps rule for useEffect/useCallback
- Component props should use explicit Flow types

### Error Handling

- Use consistent returns in functions
- Handle all promise rejections

```

---

## resources/official-documentation/Anthropic-Quickstarts/CLAUDE.md

```markdown
# Anthropic Quickstarts Development Guide

## Computer-Use Demo

### Setup & Development

- **Setup environment**: `./setup.sh`
- **Build Docker**: `docker build . -t computer-use-demo:local`
- **Run container**: `docker run -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY -v $(pwd)/computer_use_demo:/home/computeruse/computer_use_demo/ -v $HOME/.anthropic:/home/computeruse/.anthropic -p 5900:5900 -p 8501:8501 -p 6080:6080 -p 8080:8080 -it computer-use-demo:local`

### Testing & Code Quality

- **Lint**: `ruff check .`
- **Format**: `ruff format .`
- **Typecheck**: `pyright`
- **Run tests**: `pytest`
- **Run single test**: `pytest tests/path_to_test.py::test_name -v`

### Code Style

- **Python**: snake_case for functions/variables, PascalCase for classes
- **Imports**: Use isort with combine-as-imports
- **Error handling**: Use custom ToolError for tool errors
- **Types**: Add type annotations for all parameters and returns
- **Classes**: Use dataclasses and abstract base classes

## Customer Support Agent

### Setup & Development

- **Install dependencies**: `npm install`
- **Run dev server**: `npm run dev` (full UI)
- **UI variants**: `npm run dev:left` (left sidebar), `npm run dev:right` (right sidebar), `npm run dev:chat` (chat only)
- **Lint**: `npm run lint`
- **Build**: `npm run build` (full UI), see package.json for variants

### Code Style

- **TypeScript**: Strict mode with proper interfaces
- **Components**: Function components with React hooks
- **Formatting**: Follow ESLint Next.js configuration
- **UI components**: Use shadcn/ui components library

## Financial Data Analyst

### Setup & Development

- **Install dependencies**: `npm install`
- **Run dev server**: `npm run dev`
- **Lint**: `npm run lint`
- **Build**: `npm run build`

### Code Style

- **TypeScript**: Strict mode with proper type definitions
- **Components**: Function components with type annotations
- **Visualization**: Use Recharts library for data visualization
- **State management**: React hooks for state

```

---

