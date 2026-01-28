#!/usr/bin/env python3
"""Minimal test to verify MCP is working."""

import asyncio
import os
from claude_code_sdk import query, ClaudeCodeOptions, AssistantMessage
from cc_agent.utils import _extract_text, _extract_tool_uses

async def test_minimal():
    # Load env
    from dotenv import load_dotenv
    load_dotenv(override=True)
    
    # Minimal MCP config
    mcp_servers = {
        "mem0": {
            "command": "uv",
            "args": ["run", "mcp-mem0"]
        }
    }
    
    options = ClaudeCodeOptions(
        system_prompt="You are a test agent. When asked to search, use mcp__mem0__search_memories tool.",
        allowed_tools=["mcp__mem0"],
        mcp_servers=mcp_servers,
        max_turns=3
    )
    
    prompt = "Please search for memories containing 'MCP' using the mem0 search tool."
    
    print("Starting minimal MCP test...")
    all_tool_uses = []
    
    async for message in query(prompt=prompt, options=options):
        if isinstance(message, AssistantMessage):
            text = _extract_text(message)
            if text:
                print(f"Assistant: {text[:200]}...")
            
            tools = _extract_tool_uses(message)
            if tools:
                all_tool_uses.extend(tools)
                for tool in tools:
                    print(f"Tool used: {tool.get('name')} - {tool.get('input', {})}")
    
    print(f"\nTotal tools used: {len(all_tool_uses)}")
    return len(all_tool_uses) > 0

if __name__ == "__main__":
    success = asyncio.run(test_minimal())
    print(f"\nTest {'PASSED' if success else 'FAILED'}")