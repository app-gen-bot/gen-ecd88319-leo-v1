#!/bin/bash
#
# LeoCal - AI-Powered Scheduling Platform (Autonomous Mode)
#
# Uses pipeline-prompt-v2.md with mandatory skill invocation
# Single implementations only: DrizzleStorage, SupabaseAuth
#

export RESEND_API_KEY=re_LX2tSg9r_Dd4EwvA9BYH2MW3SLXq7f8eC
export FROM_EMAIL=hello@leodavinci.ai

uv run python run-app-generator.py \
  --app-name leocal \
  --prompt-file docs/prompts/leocal.md \
  --no-expand \
  --reprompter-mode autonomous \
  --max-iterations 100
