"""
Configuration for the App Generator Agent.

This agent generates complete full-stack applications from natural language prompts
using the pipeline-prompt-v2.md system prompt.
"""

# Agent configuration
AGENT_CONFIG = {
    "name": "AppGeneratorAgent",
    "model": "claude-opus-4-5",  # Claude Opus 4.5
    "max_turns": 1000,  # Extended turns for complete app generation
    "allowed_tools": [
        # Core file operations
        "Read",
        "Write",
        "Edit",
        "Glob",
        "Grep",

        # Task management
        "TodoWrite",
        "Task",

        # System operations
        "Bash",
        "WebSearch",
        "WebFetch",

        # MCP Tools - Chrome DevTools (replaces browser tool)
        # Navigation & Page Management
        "mcp__chrome_devtools__new_page",
        "mcp__chrome_devtools__navigate_page",
        "mcp__chrome_devtools__list_pages",
        "mcp__chrome_devtools__select_page",
        "mcp__chrome_devtools__close_page",
        # Interaction
        # "mcp__chrome_devtools__take_snapshot",  # REMOVED: Exceeds 1MB buffer on complex apps
        "mcp__chrome_devtools__click",
        "mcp__chrome_devtools__fill",
        "mcp__chrome_devtools__fill_form",
        "mcp__chrome_devtools__wait_for",
        "mcp__chrome_devtools__hover",
        "mcp__chrome_devtools__drag",
        "mcp__chrome_devtools__upload_file",
        "mcp__chrome_devtools__handle_dialog",
        # Debugging & Analysis
        "mcp__chrome_devtools__list_console_messages",
        "mcp__chrome_devtools__get_console_message",
        "mcp__chrome_devtools__list_network_requests",
        "mcp__chrome_devtools__get_network_request",
        # CRITICAL: take_screenshot REQUIRES filePath parameter to avoid buffer overflow
        # ALWAYS call with: filePath="./screenshots/test.png", fullPage=True
        "mcp__chrome_devtools__take_screenshot",
        "mcp__chrome_devtools__evaluate_script",

        # MCP Tools - Build and test
        "mcp__build_test__verify_project",

        # MCP Tools - Package management
        "mcp__package_manager__package_management",

        # MCP Tools - Dev server
        "mcp__dev_server__start_dev_server",
        "mcp__dev_server__stop_dev_server",
        "mcp__dev_server__check_dev_server_status",
        "mcp__dev_server__get_dev_server_logs",

        # MCP Tools - shadcn/ui components
        # NOTE: "mcp__shadcn__shadcn_add" DISABLED - hangs indefinitely on component installs
        # Use npx shadcn-ui@latest add <component> via Bash instead

        # MCP Tools - CWD and path utilities
        "mcp__cwd_reporter__get_cwd",
        "mcp__cwd_reporter__resolve_path",
        "mcp__cwd_reporter__list_files",
        "mcp__cwd_reporter__test_path_access",

        # MCP Tools - Integration analysis
        "mcp__integration_analyzer__compare_with_template",
    ],
}

# Container paths (absolute - no dynamic resolution needed in container)
# Pipeline prompts are co-located with the agent at /factory/leo/agents/app_generator/
PIPELINE_PROMPT_PATH = "/factory/leo/agents/app_generator/pipeline-prompt-v2.md"
PROMPTING_GUIDE_PATH = "/factory/leo/agents/app_generator/PROMPTING-GUIDE.md"
# Skills are at Anthropic standard location
SKILLS_DIR = "/home/leo-user/.claude/skills"
# App is generated directly here (per CONTAINER-STRUCTURE.md) - no subdirectories
APPS_OUTPUT_DIR = "/workspace/app"

# Prompt expansion configuration
EXPANSION_CONFIG = {
    "model": "sonnet",  # Better quality prompt expansion
    "max_turns": 5,      # Allow up to 5 turns for thorough expansion
    "enabled": True,
}
