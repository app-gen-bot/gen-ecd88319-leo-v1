#!/usr/bin/env python3
"""Test exactly like cc-core - direct execution with manual env loading."""

import os
import sys
from pathlib import Path

# Add paths FIRST
sys.path.insert(0, str(Path(__file__).parent / "src"))

# Load environment BEFORE any imports
from dotenv import load_dotenv
env_path = Path(__file__).parent / ".env"
print(f"Loading env from: {env_path}")
load_dotenv(env_path, override=True)

# Verify env
print(f"OPENAI_API_KEY: {'set' if os.getenv('OPENAI_API_KEY') else 'NOT SET'}")
print(f"NEO4J_URI: {os.getenv('NEO4J_URI', 'NOT SET')}")

# NOW import after env is loaded
import asyncio
from cc_agent.context import ContextAwareAgent

async def main():
    """Test context aware agent directly."""
    print("\nCreating context aware agent...")
    
    # Create agent WITHOUT passing env in MCP config
    agent = ContextAwareAgent(
        name="Direct Test",
        system_prompt="You are a helpful assistant. Use search_memories to find relevant context, then add_memory to store new information.",
        permission_mode="default",
        verbose=True
    )
    
    # Remove the env from MCP config to match cc-core
    for server in agent.mcp_config.values():
        if 'env' in server:
            del server['env']
    
    print(f"MCP servers: {list(agent.mcp_config.keys())}")
    print("Running agent...")
    
    result = await agent.run(
        "Search for any existing memories about 'test', then add a new memory 'Direct test successful' with context 'test:cc_core_style'",
        mcp_servers=agent.mcp_config
    )
    
    print(f"\nSuccess: {result.success}")
    print(f"Cost: ${result.cost:.4f}")
    print(f"Tools: {[t.get('name') for t in result.tool_uses] if result.tool_uses else []}")

if __name__ == "__main__":
    asyncio.run(main())