#!/bin/bash

# Leonardo App Factory Runner Script
# Usage: ./run-leonardo.sh "Your app description"
# Or: ./run-leonardo.sh (uses default prompt)

if [ -z "$1" ]; then
    echo "Running Leonardo App Factory with default prompt..."
    uv run python src/app_factory_leonardo_replit/run.py
else
    echo "Running Leonardo App Factory with prompt: $1"
    uv run python src/app_factory_leonardo_replit/run.py "$1"
fi