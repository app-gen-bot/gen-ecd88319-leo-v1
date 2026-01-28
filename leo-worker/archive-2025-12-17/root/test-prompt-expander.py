#!/usr/bin/env python3
"""
Quick test to verify prompt expander works correctly after JSON escaping fix.
"""

import asyncio
import sys
from pathlib import Path

# Add src to path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

from app_factory_leonardo_replit.agents.app_generator.prompt_expander import PromptExpander
from app_factory_leonardo_replit.agents.app_generator.config import PROMPTING_GUIDE_PATH

async def test_prompt_expander():
    """Test various prompts to ensure expansion works correctly."""

    # Initialize prompt expander
    expander = PromptExpander(PROMPTING_GUIDE_PATH)

    # Test cases
    test_cases = [
        ("Fix a typo in the header", False),  # Should NOT expand
        ("Add a delete button to posts", True),  # Should expand with testing
        ("Seed it with companies", True),  # Should expand with JSON examples
        ("Create a comments system", True),  # Should expand with full testing
    ]

    print("=" * 80)
    print("TESTING PROMPT EXPANDER")
    print("=" * 80)

    for prompt, should_expand in test_cases:
        print(f"\n📝 Testing: '{prompt}'")
        print(f"   Expected: {'EXPAND' if should_expand else 'NO EXPANSION'}")

        try:
            result = await expander.expand(prompt)

            was_expanded = result["was_expanded"]
            print(f"   Result: {'EXPANDED' if was_expanded else 'NOT EXPANDED'} ✓")

            if was_expanded != should_expand:
                print(f"   ⚠️ MISMATCH - Expected {should_expand}, got {was_expanded}")

            if was_expanded:
                # Check that expansion includes testing steps
                expanded_text = result["expanded"]
                has_curl = "curl" in expanded_text
                has_browser = "browser" in expanded_text or "mcp__browser" in expanded_text

                print(f"   Contains curl tests: {'✓' if has_curl else '✗'}")
                print(f"   Contains browser tests: {'✓' if has_browser else '✗'}")

                # Show first 200 chars of expansion
                preview = expanded_text[:200] + "..." if len(expanded_text) > 200 else expanded_text
                print(f"   Preview: {preview}")

        except Exception as e:
            print(f"   ❌ ERROR: {e}")
            return False

    print("\n" + "=" * 80)
    print("✅ All tests completed successfully!")
    print("=" * 80)
    return True

if __name__ == "__main__":
    success = asyncio.run(test_prompt_expander())
    sys.exit(0 if success else 1)