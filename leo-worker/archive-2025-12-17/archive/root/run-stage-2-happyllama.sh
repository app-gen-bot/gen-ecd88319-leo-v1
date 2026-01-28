#!/bin/bash

# Run Stage 2 (Wireframe Generation) standalone for Happy Llama v2
# This uses existing specs and runs the Writer-Critic loop

echo "🦙 Running Stage 2 Wireframe Generation for Happy Llama v2"
echo "========================================================="
echo ""
echo "This will:"
echo "  - Use existing specs from apps/happyllama_v2/specs/"
echo "  - Run Writer-Critic loop with 'sonnet' model"
echo "  - Continue until Critic approves or 10 iterations"
echo ""

# Run the standalone Stage 2 runner
uv run python -m app_factory.standalone.run_stage_2 happyllama_v2 sonnet

echo ""
echo "Stage 2 standalone execution complete!"