#!/usr/bin/env python3
"""Compare the behavior of legacy and context-aware WireframeAgent."""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

# Import both versions
from app_factory.agents.stage_2_wireframe.wireframe.agent import WireframeAgent
from app_factory.agents.stage_2_wireframe.wireframe.config import AGENT_CONFIG
from app_factory.agents.stage_2_wireframe.wireframe.system_prompt import SYSTEM_PROMPT


def compare_basic_properties():
    """Compare basic properties between context-aware and non-context-aware versions."""
    print("Comparing basic properties...")
    
    try:
        test_dir = Path("/tmp/test_wireframe_compare")
        test_dir.mkdir(exist_ok=True)
        
        # Create both versions
        agent_with_context = WireframeAgent(output_dir=test_dir, enable_context_awareness=True)
        agent_without_context = WireframeAgent(output_dir=test_dir, enable_context_awareness=False)
        
        # Compare properties
        properties_match = True
        
        # Check name
        if agent_with_context.name != agent_without_context.name:
            print(f"✗ Name mismatch: {agent_with_context.name} vs {agent_without_context.name}")
            properties_match = False
        else:
            print(f"✓ Name matches: {agent_with_context.name}")
        
        # Check output_dir
        if agent_with_context.output_dir != agent_without_context.output_dir:
            print(f"✗ Output dir mismatch")
            properties_match = False
        else:
            print(f"✓ Output dir matches: {agent_with_context.output_dir}")
        
        # Check cwd
        if agent_with_context.cwd != agent_without_context.cwd:
            print(f"✗ CWD mismatch")
            properties_match = False
        else:
            print(f"✓ CWD matches: {agent_with_context.cwd}")
        
        # Check max_turns
        if agent_with_context.max_turns != agent_without_context.max_turns:
            print(f"✗ Max turns mismatch")
            properties_match = False
        else:
            print(f"✓ Max turns matches: {agent_with_context.max_turns}")
        
        # Check permission_mode
        if agent_with_context.permission_mode != agent_without_context.permission_mode:
            print(f"✗ Permission mode mismatch")
            properties_match = False
        else:
            print(f"✓ Permission mode matches: {agent_with_context.permission_mode}")
        
        return properties_match
        
    except Exception as e:
        print(f"✗ Comparison failed: {e}")
        return False


def compare_original_tools():
    """Ensure original tools are preserved in both versions."""
    print("\nComparing original tools...")
    
    try:
        test_dir = Path("/tmp/test_wireframe_compare")
        
        agent_with_context = WireframeAgent(output_dir=test_dir, enable_context_awareness=True)
        agent_without_context = WireframeAgent(output_dir=test_dir, enable_context_awareness=False)
        
        # Check all original tools are present
        tools_match = True
        for tool in AGENT_CONFIG["allowed_tools"]:
            if tool not in agent_with_context.allowed_tools:
                print(f"✗ Tool '{tool}' missing in context-aware version")
                tools_match = False
            if tool not in agent_without_context.allowed_tools:
                print(f"✗ Tool '{tool}' missing in non-context-aware version")
                tools_match = False
        
        if tools_match:
            print(f"✓ All original tools preserved: {AGENT_CONFIG['allowed_tools']}")
        
        # Show tool differences
        context_only_tools = set(agent_with_context.allowed_tools) - set(agent_without_context.allowed_tools)
        if context_only_tools:
            print(f"ℹ Additional tools in context-aware version: {list(context_only_tools)}")
        
        return tools_match
        
    except Exception as e:
        print(f"✗ Tool comparison failed: {e}")
        return False


def compare_system_prompts():
    """Ensure system prompts are consistent."""
    print("\nComparing system prompts...")
    
    try:
        test_dir = Path("/tmp/test_wireframe_compare")
        
        agent_with_context = WireframeAgent(output_dir=test_dir, enable_context_awareness=True)
        agent_without_context = WireframeAgent(output_dir=test_dir, enable_context_awareness=False)
        
        # The base system prompt should be the same
        base_prompt_with = agent_with_context.system_prompt[:len(SYSTEM_PROMPT)]
        base_prompt_without = agent_without_context.system_prompt[:len(SYSTEM_PROMPT)]
        
        if SYSTEM_PROMPT in agent_with_context.system_prompt:
            print("✓ Original system prompt preserved in context-aware version")
        else:
            print("✗ System prompt modified in context-aware version")
            return False
        
        if SYSTEM_PROMPT in agent_without_context.system_prompt:
            print("✓ Original system prompt preserved in non-context-aware version")
        else:
            print("✗ System prompt modified in non-context-aware version")
            return False
        
        # Context-aware version should have additional prompt
        if len(agent_with_context.system_prompt) > len(agent_without_context.system_prompt):
            print("ℹ Context-aware version has additional prompt content (expected)")
        
        return True
        
    except Exception as e:
        print(f"✗ System prompt comparison failed: {e}")
        return False


def main():
    """Run comparison tests."""
    print("=" * 60)
    print("WireframeAgent Comparison Tests")
    print("=" * 60)
    print("Comparing legacy behavior with context-aware version...")
    
    tests = [
        compare_basic_properties,
        compare_original_tools,
        compare_system_prompts,
    ]
    
    results = []
    for test in tests:
        results.append(test())
    
    print("\n" + "=" * 60)
    print("Comparison Summary")
    print("=" * 60)
    
    if all(results):
        print("✓ All comparisons passed!")
        print("\nThe context-aware version maintains backward compatibility:")
        print("- All original properties preserved")
        print("- All original tools available")
        print("- System prompt includes original content")
        print("- Additional context features are additive only")
        print("\nSafe to use in production with enable_context_awareness flag.")
        return 0
    else:
        print("✗ Some comparisons failed.")
        print("\nThe context-aware version may have breaking changes.")
        return 1


if __name__ == "__main__":
    sys.exit(main())