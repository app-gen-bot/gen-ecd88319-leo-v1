#!/bin/bash

# Test script for BinaryAgent implementation
# This tests the new iteration-aware Schema Generator in isolation

echo "==========================================="
echo "🧪 Testing BinaryAgent Implementation"
echo "==========================================="
echo ""

# Create a test workspace
TEST_DIR="/tmp/binary_agent_test_$(date +%Y%m%d_%H%M%S)"
echo "📁 Creating test workspace: $TEST_DIR"
mkdir -p "$TEST_DIR"

# Copy a simple test plan
cat > "$TEST_DIR/plan.md" << 'EOF'
# Simple Todo App

## Application Overview
A simple todo list application for testing the BinaryAgent implementation.

## Features
1. Add new todo items
2. Mark todos as complete
3. Delete todos
4. Filter by status (all, active, completed)

## Data Model
- Todo: id, title, description, completed, createdAt, updatedAt
- User: id, name, email

## Technical Requirements
- Use TypeScript
- RESTful API
- React frontend
EOF

echo "📝 Created test plan"

# Create a Python test script
cat > "$TEST_DIR/test_schema_binary.py" << 'EOF'
"""Test the Schema Generator Binary implementation."""

import asyncio
import sys
import logging
from pathlib import Path

# Add the app-factory source to path
sys.path.append('/Users/labheshpatel/apps/app-factory/src')

from app_factory_leonardo_replit.agents.schema_generator.binary import SchemaGeneratorBinary

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_schema_generation():
    """Test the Schema Generator Binary."""

    workspace = Path.cwd()

    # Ensure shared directory exists
    shared_dir = workspace / "shared"
    shared_dir.mkdir(exist_ok=True)

    logger.info("🚀 Starting Schema Generator Binary test")
    logger.info(f"   Workspace: {workspace}")

    # Create the Schema Generator Binary
    generator = SchemaGeneratorBinary(str(workspace), verbose=True)

    # Run the generation (includes Writer-Critic loop)
    success, data, message = await generator.generate_schema()

    # Check results
    logger.info(f"\n📊 Results:")
    logger.info(f"   Success: {success}")
    logger.info(f"   Message: {message}")
    logger.info(f"   Data: {data}")

    # Check if schema file was created
    schema_file = workspace / "shared" / "schema.ts"
    if schema_file.exists():
        logger.info(f"✅ Schema file created: {schema_file}")
        logger.info(f"   Size: {schema_file.stat().st_size} bytes")
    else:
        logger.error(f"❌ Schema file not found at {schema_file}")

    # Check convergence history
    history = generator.get_convergence_history()
    logger.info(f"\n📈 Convergence History:")
    for point in history:
        logger.info(f"   Iteration {point['iteration']}: {point['compliance_score']}% compliance")

    # Check state persistence
    state_file = workspace / ".iteration" / "schema_generator_state.yaml"
    if state_file.exists():
        logger.info(f"✅ State file created: {state_file}")
    else:
        logger.error(f"❌ State file not found")

    return success

if __name__ == "__main__":
    success = asyncio.run(test_schema_generation())

    if success:
        print("\n✨ Schema Generator Binary test PASSED!")
        sys.exit(0)
    else:
        print("\n❌ Schema Generator Binary test FAILED")
        sys.exit(1)
EOF

echo "🔧 Created test script"

# Change to test directory
cd "$TEST_DIR"

# Run the test with uv
echo ""
echo "▶️ Running test with uv..."
echo "==========================================="
uv run python test_schema_binary.py

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "==========================================="
    echo "✅ BinaryAgent implementation test PASSED!"
    echo "==========================================="

    # Show generated schema if it exists
    if [ -f "shared/schema.ts" ]; then
        echo ""
        echo "📄 Generated schema preview:"
        echo "----------------------------"
        head -30 shared/schema.ts
        echo "..."
    fi
else
    echo ""
    echo "==========================================="
    echo "❌ BinaryAgent implementation test FAILED"
    echo "==========================================="
fi

echo ""
echo "Test workspace: $TEST_DIR"
echo "You can inspect the results there."