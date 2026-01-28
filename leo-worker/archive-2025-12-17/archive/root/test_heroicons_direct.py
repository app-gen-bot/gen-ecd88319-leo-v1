#!/usr/bin/env python3
"""Direct test of Heroicons server functions"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

import asyncio
import json
from cc_tools.heroicons.server import (
    search_icons,
    get_icon,
    list_categories,
    generate_react_component,
    suggest_icon
)

async def test_direct():
    """Test Heroicons functions directly"""
    
    print("1. Testing search_icons...")
    result = await search_icons("user", "all", 5)
    print(json.loads(result))
    print()
    
    print("2. Testing get_icon...")
    result = await get_icon("user-circle", "outline", 24, "both")
    print(json.loads(result))
    print()
    
    print("3. Testing list_categories...")
    result = await list_categories()
    categories = json.loads(result)
    print(f"Found {categories['total_categories']} categories")
    print()
    
    print("4. Testing generate_react_component...")
    result = await generate_react_component(
        "plus",
        "outline",
        "h-5 w-5 text-blue-500",
        True,
        True
    )
    component = json.loads(result)
    print("Generated component:")
    print(component['example_usage'])
    print()
    
    print("5. Testing suggest_icon...")
    result = await suggest_icon("delete button", "action", 3)
    suggestions = json.loads(result)
    print(f"Suggestions for 'delete button':")
    for s in suggestions['suggestions']:
        print(f"  - {s['name']} (score: {s['score']})")

if __name__ == "__main__":
    asyncio.run(test_direct())