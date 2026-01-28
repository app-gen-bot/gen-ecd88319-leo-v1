#!/bin/bash

# ReclaMatch - Intelligent Team Scheduling Platform Generator
# This script runs the app generator with the ReclaMatch prompt

uv run python run-app-generator.py \
  --prompt-file prompts/reclamatch-scheduling-platform.md \
  --app-name reclamatch \
  --no-expand \
  --reprompter-mode autonomous \
  --max-iterations 25
