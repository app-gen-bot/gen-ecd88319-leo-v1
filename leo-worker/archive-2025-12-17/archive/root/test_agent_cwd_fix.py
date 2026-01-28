#!/usr/bin/env python3
"""Test to verify the Base Agent cwd fix works correctly."""

import asyncio
import tempfile
import shutil
from pathlib import Path
import sys

# Add the src directory to the path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from cc_agent import Agent, AgentResult


class TestAgent(Agent):
    """Simple test agent to verify cwd handling."""
    
    def __init__(self, cwd=None):
        super().__init__(
            name="Test Agent",
            system_prompt="You are a test agent. Just say 'Hello, I'm working!'",
            allowed_tools=["Write"],
            max_turns=1,
            cwd=cwd,
            verbose=True
        )


async def test_cwd_creation():
    """Test that the agent creates non-existent cwd directories."""
    
    print("Testing Base Agent CWD Fix\n")
    
    # Create a temporary directory for testing
    with tempfile.TemporaryDirectory() as temp_dir:
        # Test 1: Non-existent cwd should be created
        print("1. Testing with non-existent cwd:")
        non_existent_dir = Path(temp_dir) / "test_nonexistent_dir"
        
        # Ensure it doesn't exist
        if non_existent_dir.exists():
            shutil.rmtree(non_existent_dir)
        
        print(f"   Directory exists before: {non_existent_dir.exists()}")
        
        # Create agent with non-existent cwd
        agent = TestAgent(cwd=str(non_existent_dir))
        
        # This should NOT raise an error anymore
        try:
            result = await agent.run("Hello, test!")
            print(f"   ✅ Agent ran successfully!")
            print(f"   Directory exists after: {non_existent_dir.exists()}")
            print(f"   Agent response preview: {result.content[:50]}...")
        except Exception as e:
            print(f"   ❌ Error: {type(e).__name__}: {e}")
        
        # Test 2: Existing cwd should work as before
        print("\n2. Testing with existing cwd:")
        existing_dir = Path(temp_dir) / "test_existing_dir"
        existing_dir.mkdir()
        
        print(f"   Directory exists before: {existing_dir.exists()}")
        
        agent2 = TestAgent(cwd=str(existing_dir))
        
        try:
            result = await agent2.run("Hello again!")
            print(f"   ✅ Agent ran successfully!")
            print(f"   Agent response preview: {result.content[:50]}...")
        except Exception as e:
            print(f"   ❌ Error: {type(e).__name__}: {e}")
        
        # Test 3: No cwd specified
        print("\n3. Testing with no cwd specified:")
        agent3 = TestAgent(cwd=None)
        
        try:
            result = await agent3.run("Hello without cwd!")
            print(f"   ✅ Agent ran successfully!")
            print(f"   Agent response preview: {result.content[:50]}...")
        except Exception as e:
            print(f"   ❌ Error: {type(e).__name__}: {e}")


if __name__ == "__main__":
    print("Note: This test requires the claude CLI to be available in PATH\n")
    asyncio.run(test_cwd_creation())