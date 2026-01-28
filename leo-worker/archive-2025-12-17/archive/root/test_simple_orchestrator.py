#!/usr/bin/env python3
"""Simple test of orchestrator with environment pre-loaded."""

import os
import asyncio
from pathlib import Path
from dotenv import load_dotenv

# CRITICAL: Load environment variables BEFORE importing any modules
env_path = Path(__file__).parent / ".env"
print(f"Loading environment from: {env_path}")
load_dotenv(env_path, override=True)

# Verify environment is loaded
print("Environment check:")
print(f"  OPENAI_API_KEY: {'set' if os.getenv('OPENAI_API_KEY') else 'NOT SET'}")
print(f"  NEO4J_URI: {os.getenv('NEO4J_URI', 'NOT SET')}")
print(f"  QDRANT_URL: {os.getenv('QDRANT_URL', 'NOT SET')}")

# NOW import the modules
from app_factory.agents.stage_0_orchestrator import orchestrator_agent

async def test_orchestrator():
    """Test orchestrator with pre-loaded environment."""
    print("\nTesting orchestrator...")
    
    # Don't pass MCP servers - let the agent use its own config
    result = await orchestrator_agent.generate_prd(
        "Create a simple task tracking app",
        skip_questions=True
    )
    
    print(f"\nResult: {result['success']}")
    if result['success']:
        print(f"App name: {result.get('app_name', 'N/A')}")
        print(f"Cost: ${result.get('cost', 0):.4f}")
        print(f"PRD preview: {result.get('prd_content', '')[:200]}...")
    else:
        print(f"Error: {result.get('error', 'Unknown error')}")

if __name__ == "__main__":
    asyncio.run(test_orchestrator())