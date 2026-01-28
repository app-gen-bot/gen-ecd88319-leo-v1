#!/bin/bash
# Run PlanetScale website generation

echo "🚀 Starting PlanetScale Website Generation..."
echo "This will create a modern, minimalist website showcasing PlanetScale's AI app factory"
echo ""

# Check if we're starting from critic
if [ "$1" == "--critic" ]; then
    ITERATION=${2:-1}
    echo "Starting from Critic evaluation at iteration $ITERATION..."
    uv run python -m app_factory.main_v2 --start-at-critic --app-name planetscale-website --critic-iteration $ITERATION
else
    echo "Running full pipeline..."
    # Read the prompt from file and pass it as argument
    PROMPT_CONTENT=$(cat prompts/planetscale-website-prompt.md)
    uv run python -m app_factory.main_v2 \
        --user-prompt "$PROMPT_CONTENT" \
        --app-name "planetscale-website" \
        --skip-questions \
        --iterative-stage-1
fi

echo ""
echo "✅ PlanetScale website generation complete!"
echo "Check apps/planetscale-website/ for the generated code"