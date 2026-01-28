#!/usr/bin/env python3
"""Test orchestrator directly without pipeline."""

import os
import asyncio
from pathlib import Path
from dotenv import load_dotenv

# Load environment FIRST
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path, override=True)

from app_factory.agents.stage_0_orchestrator import orchestrator_agent

async def test():
    print("Testing orchestrator directly...")
    
    result = await orchestrator_agent.generate_prd(
        "Create a simple todo app",
        skip_questions=True
    )
    
    print(f"\nSuccess: {result['success']}")
    print(f"Cost: ${result.get('cost', 0):.4f}")
    
    # Check for tool usage
    if 'agent_result' in result:
        tools = result['agent_result'].tool_uses if hasattr(result['agent_result'], 'tool_uses') else []
        print(f"Tools used: {[t.get('name') for t in tools] if tools else 'None'}")

if __name__ == "__main__":
    asyncio.run(test())