#!/bin/bash
# Resume ThePlugStreet wireframe generation from iteration 2

echo "🚀 Resuming wireframe generation with API retry protection..."
echo "   If API errors occur, the system will automatically retry with exponential backoff"
echo ""

uv run python -m app_factory.main_v2 \
    --start-at-critic \
    --app-name theplug_20250718_151044 \
    --critic-iteration 2 \
    --critic-feedback-file critic_feedback_theplug_20250718_151044_iter1.json
