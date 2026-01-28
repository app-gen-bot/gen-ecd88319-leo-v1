#!/bin/bash
# Run PawsFlow Critic evaluation using the new critic restart functionality

# App name from the checkpoint
APP_NAME="app_20250716_074453"

# Run Critic evaluation for iteration 1
echo "🔍 Running Critic evaluation for PawsFlow (iteration 1)..."
echo "This will evaluate the existing 18,360 lines of generated code"
echo ""

uv run python -m app_factory.main_v2 \
    --start-at-critic \
    --app-name "$APP_NAME" \
    --critic-iteration 1

echo ""
echo "✅ Critic evaluation complete!"
echo ""
echo "To run subsequent iterations with previous feedback:"
echo "uv run python -m app_factory.main_v2 --start-at-critic --app-name $APP_NAME --critic-iteration 2 --critic-feedback-file apps/$APP_NAME/specs/critic_evaluation_result.json"