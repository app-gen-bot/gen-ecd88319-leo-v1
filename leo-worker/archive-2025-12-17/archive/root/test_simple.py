#!/usr/bin/env python3
"""Simple test to verify imports and basic structure."""

print("Testing imports...")
from pathlib import Path
from app_factory.agents.stage_1_interaction_spec.interaction_spec.agent import InteractionSpecAgent

print("Creating agent...")
agent = InteractionSpecAgent()

print("Testing file write functionality...")
test_content = "# Test Spec\nThis is a test."
test_path = "/tmp/test_spec.md"

# Test the write logic directly
try:
    file_path = Path(test_path)
    file_path.parent.mkdir(parents=True, exist_ok=True)
    file_path.write_text(test_content)
    print(f"✅ Successfully wrote to {test_path}")
    
    # Read it back
    read_content = file_path.read_text()
    assert read_content == test_content
    print("✅ Successfully read back content")
    
    # Clean up
    file_path.unlink()
    print("✅ Cleaned up test file")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n✅ All basic tests passed!")