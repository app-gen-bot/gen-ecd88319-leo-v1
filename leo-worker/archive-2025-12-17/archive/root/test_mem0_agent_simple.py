#!/usr/bin/env python3
"""Test mem0 through ContextAwareAgent - simplified version."""

import asyncio
import sys
import os
from pathlib import Path

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from cc_agent import Agent  # Use base Agent first to isolate issues


async def test_mem0_with_base_agent():
    """Test mem0 with base Agent first."""
    
    print("\n🔍 Testing mem0 with Base Agent")
    print("=" * 80)
    
    # Create a basic agent
    agent = Agent(
        name="Mem0BaseTest",
        system_prompt="You are a test agent. Use the mem0 tools to store and retrieve memories.",
        allowed_tools=["mcp__mem0"],
        permission_mode="bypassPermissions"
    )
    
    print("✅ Created base Agent with mem0 access")
    
    # Simple test prompt
    prompt = """Use the mem0 add_memory tool to add this memory:
    "Testing mem0 integration with base agent"
    
    Then use search_memories to find "mem0 integration"
    
    Report what happens."""
    
    try:
        result = await agent.run(
            user_prompt=prompt,
            mcp_servers={
                "mem0": {
                    "command": "uv",
                    "args": ["run", "mcp-mem0"]
                }
            }
        )
        
        if result.success:
            print("\n✅ Result:")
            print(result.content)
            
            # Check tool usage
            if result.tool_uses:
                print(f"\n🔧 Tools used: {[t.get('name', 'unknown') for t in result.tool_uses]}")
        else:
            print(f"\n❌ Failed: {result.content}")
            
    except Exception as e:
        print(f"\n❌ Exception: {e}")
        import traceback
        traceback.print_exc()


async def test_mem0_with_context_aware():
    """Test mem0 with ContextAwareAgent."""
    
    print("\n\n🔍 Testing mem0 with ContextAwareAgent")
    print("=" * 80)
    
    from cc_agent import ContextAwareAgent
    
    # Create context aware agent
    agent = ContextAwareAgent(
        name="Mem0ContextTest",
        system_prompt="You are a test agent with context awareness.",
        allowed_tools=["mcp__mem0"],
        permission_mode="bypassPermissions",
        enable_context_awareness=True
    )
    
    print("✅ Created ContextAwareAgent with mem0 access")
    
    prompt = """Add a memory about "ContextAwareAgent successfully integrated with mem0"
    Then search for "ContextAwareAgent mem0"
    Report the results."""
    
    try:
        result = await agent.run(
            user_prompt=prompt,
            mcp_servers={
                "mem0": {
                    "command": "uv",
                    "args": ["run", "mcp-mem0"]
                }
            }
        )
        
        if result.success:
            print("\n✅ Result:")
            print(result.content)
            
            if result.tool_uses:
                print(f"\n🔧 Tools used: {[t.get('name', 'unknown') for t in result.tool_uses]}")
        else:
            print(f"\n❌ Failed: {result.content}")
            
    except Exception as e:
        print(f"\n❌ Exception: {e}")
        import traceback
        traceback.print_exc()


async def main():
    """Run all tests."""
    # Load environment variables
    from dotenv import load_dotenv
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)
        print(f"✅ Loaded environment from {env_path}")
    
    # Check if Claude CLI is available
    import shutil
    claude_path = shutil.which("claude")
    if claude_path:
        print(f"✅ Claude CLI found at: {claude_path}")
    else:
        print("❌ Claude CLI not found in PATH")
        
        # Try to find it in common locations
        possible_paths = [
            "/usr/local/bin/claude",
            os.path.expanduser("~/.local/bin/claude"),
            "/opt/homebrew/bin/claude"
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                print(f"   Found at: {path}")
                # Add to PATH
                os.environ["PATH"] = f"{os.path.dirname(path)}:{os.environ.get('PATH', '')}"
                break
    
    # Test with base agent first
    await test_mem0_with_base_agent()
    
    # Then test with context aware agent
    await test_mem0_with_context_aware()


if __name__ == "__main__":
    asyncio.run(main())