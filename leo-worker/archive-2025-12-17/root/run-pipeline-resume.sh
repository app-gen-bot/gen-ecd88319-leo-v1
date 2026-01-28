#!/bin/bash

# Resume pipeline from current state
# This script will skip completed stages and continue from where it left off

echo "🚀 Resuming Pipeline from Current State"
echo "========================================"
echo ""
echo "Workspace: test-pipeline-1759180486"
echo ""

# Check current state
echo "📊 Current Status:"
if [ -f "/Users/labheshpatel/apps/app-factory/apps/test-pipeline-1759180486/app/shared/schema.zod.ts" ]; then
    echo "  ✅ Schema Designer: Complete (schema.zod.ts exists)"
else
    echo "  ⏳ Schema Designer: Pending"
fi

if [ -d "/Users/labheshpatel/apps/app-factory/apps/test-pipeline-1759180486/app/shared/contracts" ]; then
    echo "  ✅ Contracts Designer: Complete (contracts/ exists)"
else
    echo "  ⏳ Contracts Designer: Pending"
fi

if [ -f "/Users/labheshpatel/apps/app-factory/apps/test-pipeline-1759180486/app/shared/schema.ts" ]; then
    echo "  ✅ Schema Generator: Complete (schema.ts exists)"
else
    echo "  ⏳ Schema Generator: Pending"
fi

if [ -f "/Users/labheshpatel/apps/app-factory/apps/test-pipeline-1759180486/app/server/storage.ts" ]; then
    echo "  ✅ Storage Generator: Complete (storage.ts exists)"
else
    echo "  ⏳ Storage Generator: Pending"
fi

if [ -f "/Users/labheshpatel/apps/app-factory/apps/test-pipeline-1759180486/app/server/routes.ts" ]; then
    echo "  ✅ Routes Generator: Complete (routes.ts exists)"
else
    echo "  ⏳ Routes Generator: Pending"
fi

echo ""
echo "Starting pipeline..."
echo ""

# Run the pipeline - it will automatically skip completed stages
cd /Users/labheshpatel/apps/app-factory

# Use the existing workspace
uv run python -m app_factory_leonardo_replit.main \
    /Users/labheshpatel/apps/app-factory/apps/test-pipeline-1759180486 \
    "Test Case Management Application with Projects, Test Suites, Test Cases, and Test Runs" \
    --frontend-port 5173