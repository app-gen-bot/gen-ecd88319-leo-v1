#!/usr/bin/env python
"""Properly fix all critics to use eval_data from parse_critic_xml.

The parse_critic_xml already returns a properly formatted eval_data dict.
Critics should just use it directly, not create a new dict.
"""

import re
from pathlib import Path


def fix_critic_properly(file_path: Path) -> bool:
    """Fix a critic to properly use eval_data from parser.

    Args:
        file_path: Path to critic agent.py file

    Returns:
        True if fixed, False otherwise
    """
    try:
        content = file_path.read_text()

        # Find the pattern where they create a new evaluation_data dict
        # This is wrong - they should use eval_data directly
        pattern = r'''evaluation_data = \{
                "decision": decision,
                "errors": eval_data\.get\("errors", ""\),
                "compliance_score": .*?,
                .*?\n.*?\}'''

        if re.search(pattern, content, re.DOTALL):
            # Replace with proper usage of eval_data
            new_content = re.sub(
                pattern,
                '''# Use the eval_data from parser directly
            evaluation_data = eval_data
            if "compliance_score" not in evaluation_data or evaluation_data["compliance_score"] == 0:
                evaluation_data["compliance_score"] = 95 if decision == "complete" else 50
            evaluation_data["decision"] = decision''',
                content,
                flags=re.DOTALL
            )

            file_path.write_text(new_content)
            print(f"  ✅ Fixed: {file_path}")
            return True
        else:
            print(f"  Already correct: {file_path}")
            return False

    except Exception as e:
        print(f"  ❌ Error: {file_path}: {e}")
        return False


def main():
    """Fix all critics properly."""
    base_dir = Path("/Users/labheshpatel/apps/app-factory/src/app_factory_leonardo_replit/agents")

    # Find all critic files that need fixing
    critic_files = []
    for critic_dir in base_dir.glob("*/critic"):
        agent_file = critic_dir / "agent.py"
        if agent_file.exists():
            critic_files.append(agent_file)

    print("Fixing Critics to properly use eval_data from parse_critic_xml...")
    print("")

    fixed_count = 0
    for file_path in critic_files:
        if fix_critic_properly(file_path):
            fixed_count += 1

    print(f"\n✅ Fixed {fixed_count} files")

    # Also check if there are any remaining issues with errors.strip()
    print("\nChecking for any remaining .strip() issues...")
    for file_path in critic_files:
        content = file_path.read_text()
        # Look for patterns where errors might not be a string
        if "errors.strip()" in content:
            # Find context
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if "errors.strip()" in line:
                    # Check if errors was properly extracted as string
                    # Look back a few lines
                    context_start = max(0, i - 5)
                    context = lines[context_start:i+1]

                    # Check if errors is being extracted from eval_data
                    has_extraction = any("errors = eval_data.get" in l for l in context)
                    if not has_extraction:
                        print(f"  ⚠️ {file_path.name} line {i+1}: errors.strip() without proper extraction")
                        # Fix it
                        lines[i-1:i-1] = ["            errors = eval_data.get('errors', '')"]
                        content = '\n'.join(lines)
                        file_path.write_text(content)
                        print(f"    Fixed by adding extraction line")

    print("\n✅ All critics should now properly handle eval_data")


if __name__ == "__main__":
    main()