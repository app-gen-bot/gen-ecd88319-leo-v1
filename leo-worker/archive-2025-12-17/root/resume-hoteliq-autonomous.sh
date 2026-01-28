#!/bin/bash
uv run python run-app-generator.py --resume ~/apps/app-factory/apps/hoteliq/app "$1" --no-expand --reprompter-mode autonomous --max-iterations 50

