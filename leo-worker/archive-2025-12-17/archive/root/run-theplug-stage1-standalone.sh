#!/bin/bash

# Run Stage 1 (Interaction Specification) standalone for ThePlugStreet PRD
echo "Running Stage 1 Interaction Specification for ThePlugStreet..."

# Run the standalone stage 1 script
uv run python -m app_factory.standalone.run_stage_1 \
    --prd-path apps/theplug/specs/business_prd.md \
    --output-dir apps/theplug/specs \
    --iterative

echo "Stage 1 completed. Check apps/theplug/specs for the generated interaction specification."