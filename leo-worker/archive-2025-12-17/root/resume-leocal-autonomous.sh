#!/bin/bash

# Usage: ./resume-leocal-autonomous.sh [prompt] [--prompt-file <file>]
# Examples:
#   ./resume-leocal-autonomous.sh "Fix the login bug"
#   ./resume-leocal-autonomous.sh --prompt-file prompts/leo-testing-system.md

PROMPT=""
PROMPT_FILE=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --prompt-file)
      PROMPT_FILE="$2"
      shift 2
      ;;
    *)
      PROMPT="$1"
      shift
      ;;
  esac
done

# If prompt file provided, read its contents
if [[ -n "$PROMPT_FILE" ]]; then
  if [[ -f "$PROMPT_FILE" ]]; then
    PROMPT=$(cat "$PROMPT_FILE")
  else
    echo "Error: Prompt file not found: $PROMPT_FILE"
    exit 1
  fi
fi

if [[ -z "$PROMPT" ]]; then
  echo "Error: No prompt provided. Use a direct prompt or --prompt-file <file>"
  exit 1
fi

uv run python run-app-generator.py --resume ~/apps/app-factory/apps/leocal/app "$PROMPT" --no-expand --reprompter-mode autonomous --max-iterations 50

