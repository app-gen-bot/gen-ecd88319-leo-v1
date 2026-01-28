#!/usr/bin/env python3
"""
Test script for subagent definitions.

This script validates that all subagents are properly defined
and can be loaded without breaking anything.
"""

import sys
from pathlib import Path

# Add src to path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

def test_subagent_definitions():
    """Test that all subagent definitions can be loaded."""
    print("=" * 80)
    print("🧪 TESTING SUBAGENT DEFINITIONS")
    print("=" * 80)

    try:
        # Import subagents
        from app_factory_leonardo_replit.agents.app_generator.subagents import (
            research_agent,
            schema_designer,
            api_architect,
            ui_designer,
            code_writer,
            quality_assurer,
            error_fixer,
            get_all_subagents,
            get_subagent
        )

        print("\n✅ All subagent modules imported successfully")

        # Test each subagent
        subagents = {
            "research_agent": research_agent,
            "schema_designer": schema_designer,
            "api_architect": api_architect,
            "ui_designer": ui_designer,
            "code_writer": code_writer,
            "quality_assurer": quality_assurer,
            "error_fixer": error_fixer,
        }

        print("\n📋 Subagent Definitions:")
        print("-" * 80)

        for name, agent in subagents.items():
            print(f"\n🤖 {name}:")
            print(f"   Description: {agent.description[:50]}...")
            print(f"   Model: {agent.model}")
            print(f"   Tools: {len(agent.tools) if agent.tools else 0} tools")
            if agent.tools:
                print(f"   Tool List: {', '.join(agent.tools[:3])}...")
            print(f"   Prompt Length: {len(agent.prompt)} chars")

        # Test get_all_subagents
        print("\n" + "-" * 80)
        all_agents = get_all_subagents()
        print(f"\n✅ get_all_subagents() returned {len(all_agents)} agents")

        # Test get_subagent
        test_agent = get_subagent("research_agent")
        assert test_agent == research_agent
        print("✅ get_subagent('research_agent') works correctly")

        # Test invalid subagent
        invalid = get_subagent("invalid_agent")
        assert invalid is None
        print("✅ get_subagent('invalid_agent') returns None as expected")

        # Validate each subagent has required fields
        print("\n📊 Validation Results:")
        print("-" * 80)

        for name, agent in subagents.items():
            errors = []

            # Check required fields
            if not agent.description:
                errors.append("Missing description")
            if not agent.prompt:
                errors.append("Missing prompt")
            if agent.model not in ["sonnet", "opus", "haiku", None]:
                errors.append(f"Invalid model: {agent.model}")

            # Check tools are valid strings
            if agent.tools:
                for tool in agent.tools:
                    if not isinstance(tool, str):
                        errors.append(f"Invalid tool type: {type(tool)}")

            if errors:
                print(f"❌ {name}: {', '.join(errors)}")
            else:
                print(f"✅ {name}: Valid")

        print("\n" + "=" * 80)
        print("✨ ALL TESTS PASSED!")
        print("=" * 80)

        # Print summary
        print("\n📈 Summary:")
        print(f"   Total Subagents: {len(subagents)}")
        print(f"   Models Used: {set(a.model for a in subagents.values())}")
        print(f"   Total Tools: {sum(len(a.tools) if a.tools else 0 for a in subagents.values())}")

        return True

    except ImportError as e:
        print(f"\n❌ Import Error: {e}")
        print("\nMake sure you're running from the app-factory directory")
        return False
    except Exception as e:
        print(f"\n❌ Test Failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_subagent_definitions()
    sys.exit(0 if success else 1)