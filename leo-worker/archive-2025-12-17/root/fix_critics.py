#!/usr/bin/env python
"""Fix all critics to properly handle parse_critic_xml return value.

The parse_critic_xml function returns (decision, eval_data) where eval_data is a dict,
but many critics expect (decision, errors) where errors is a string.
"""

import os
import re
from pathlib import Path

def fix_critic_file(file_path: Path) -> bool:
    """Fix a single critic file.

    Args:
        file_path: Path to the critic agent.py file

    Returns:
        True if fixed, False if no fix needed or failed
    """
    try:
        content = file_path.read_text()

        # Pattern to find the problematic code
        pattern = r'(decision, errors = parse_critic_xml\([^)]+\))'

        if not re.search(pattern, content):
            print(f"  No fix needed: {file_path}")
            return False

        # Replace with eval_data
        new_content = re.sub(
            r'decision, errors = parse_critic_xml\(([^)]+)\)',
            r'decision, eval_data = parse_critic_xml(\1)',
            content
        )

        # Also fix references to 'errors' that should be eval_data.get("errors", "")
        # Look for patterns like if errors.strip() or similar
        new_content = re.sub(
            r'if errors\.strip\(\):',
            r'errors = eval_data.get("errors", "")\n            if errors.strip():',
            new_content
        )

        # Fix the evaluation_data creation
        old_eval_pattern = r'''evaluation_data = \{
                "decision": decision,
                "errors": errors,
                "compliance_score": (\d+) if decision == "complete" else (\d+),
                "raw_response": content
            \}'''

        new_eval = r'''# Use the eval_data from parser and add compliance score
            evaluation_data = eval_data
            if "compliance_score" not in evaluation_data or evaluation_data["compliance_score"] == 0:
                evaluation_data["compliance_score"] = \1 if decision == "complete" else \2
            evaluation_data["decision"] = decision'''

        new_content = re.sub(old_eval_pattern, new_eval, new_content)

        # Write back
        file_path.write_text(new_content)
        print(f"  ✅ Fixed: {file_path}")
        return True

    except Exception as e:
        print(f"  ❌ Error fixing {file_path}: {e}")
        return False


def main():
    """Fix all critic files."""
    base_dir = Path("/Users/labheshpatel/apps/app-factory/src/app_factory_leonardo_replit/agents")

    # Find all critic agent.py files
    critic_files = [
        base_dir / "schema_designer/critic/agent.py",
        base_dir / "routes_generator/critic/agent.py",
        base_dir / "app_shell_generator/critic/agent.py",
        base_dir / "main_page_generator/critic/agent.py",
        base_dir / "contracts_designer/critic/agent.py",
        base_dir / "api_client_generator/critic/agent.py",
        base_dir / "storage_generator/critic/agent.py",
        base_dir / "context_provider_generator/critic/agent.py",
        # Schema Generator already fixed manually
    ]

    print("Fixing Critic files to handle parse_critic_xml return value correctly...")
    print("")

    fixed_count = 0
    for file_path in critic_files:
        if file_path.exists():
            if fix_critic_file(file_path):
                fixed_count += 1
        else:
            print(f"  File not found: {file_path}")

    print("")
    print(f"✅ Fixed {fixed_count} files")

    # Also create a simpler universal fix
    print("\nApplying universal fix using sed...")

    # Simple sed command to fix the basic issue
    sed_cmd = r'''find /Users/labheshpatel/apps/app-factory/src/app_factory_leonardo_replit/agents -name "agent.py" -path "*/critic/*" -exec sed -i '' 's/decision, errors = parse_critic_xml/decision, eval_data = parse_critic_xml/g' {} \;'''

    os.system(sed_cmd)

    # Fix error references
    sed_cmd2 = r'''find /Users/labheshpatel/apps/app-factory/src/app_factory_leonardo_replit/agents -name "agent.py" -path "*/critic/*" -exec sed -i '' 's/"errors": errors/"errors": eval_data.get("errors", "")/g' {} \;'''

    os.system(sed_cmd2)

    print("✅ Universal sed fixes applied")


if __name__ == "__main__":
    main()