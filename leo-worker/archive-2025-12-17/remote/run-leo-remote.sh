#!/bin/bash
#
# Leo Remote CLI - Test Script
#
# Runs the leo-remote CLI to test containerized app generation.
# Uses the same pattern as run-leosend.sh but via WSI Protocol.
#
# Usage:
#   ./run-leo-remote.sh "Create a simple counter app"
#   ./run-leo-remote.sh "Create a todo app" -i 5
#   ./run-leo-remote.sh "Build a recipe manager" --max-iterations 20
#
# Options:
#   -i, --max-iterations <n>  Maximum iterations (default: 10)
#   -n, --name <name>         App name (default: generated from prompt)
#   -m, --mode <mode>         Generation mode: autonomous, confirm_first, interactive
#   --github-owner <owner>    GitHub repo owner (default: app-gen-bot)
#   --image <image>           Docker image (default: from container-manager.ts)
#   --resume <path>           Resume from existing app
#
# Environment:
#   LEO_CONTAINER_IMAGE       Override default Docker image
#   MAX_ITERATIONS            Override default max iterations
#

set -e

# Configuration with defaults
# Note: LEO_CONTAINER_IMAGE defaults to the latest build in container-manager.ts
# Only export if explicitly set by user
if [ -n "$LEO_CONTAINER_IMAGE" ]; then
    export LEO_CONTAINER_IMAGE
fi
MAX_ITERATIONS="${MAX_ITERATIONS:-50}"

# Script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Check for .env file and source it
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo "⚠️  No .env file found at $SCRIPT_DIR/.env"
    echo ""
    echo "Please create one with your Claude Code OAuth token:"
    echo "  cp $SCRIPT_DIR/.env.example $SCRIPT_DIR/.env"
    echo "  # Then edit and add your token"
    echo ""
    echo "Get your token with: claude config get oauthToken"
    exit 1
fi

# Source .env to make CLAUDE_CODE_OAUTH_TOKEN available
set -a  # automatically export all variables
source "$SCRIPT_DIR/.env"
set +a

# Navigate to CLI directory
cd "$SCRIPT_DIR/cli"

# Build CLI if needed
if [ ! -d "dist" ]; then
    echo "Building CLI..."
    npm run build
fi

# Run CLI with max iterations default and all passed arguments
exec node dist/main.js --max-iterations "$MAX_ITERATIONS" "$@"
