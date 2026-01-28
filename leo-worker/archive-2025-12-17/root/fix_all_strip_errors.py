#!/usr/bin/env python
"""Fix all .strip() errors in critics by adding defensive checks."""

import re
from pathlib import Path


def add_defensive_checks(file_path: Path) -> bool:
    """Add defensive checks before using .strip() on errors.

    Args:
        file_path: Path to critic file

    Returns:
        True if fixed, False otherwise
    """
    try:
        content = file_path.read_text()

        # Find lines with errors.strip()
        if "if errors.strip():" not in content:
            print(f"  No .strip() found in: {file_path.name}")
            return False

        # Replace simple if errors.strip() with defensive version
        new_content = re.sub(
            r'(\s+)if errors\.strip\(\):',
            r'''\1# Defensive check to prevent dict.strip() error
\1if not isinstance(errors, str):
\1    errors = str(errors) if errors else ""
\1if errors and errors.strip():''',
            content
        )

        if new_content != content:
            file_path.write_text(new_content)
            print(f"  ✅ Fixed: {file_path}")
            return True
        else:
            print(f"  Already has checks: {file_path.name}")
            return False

    except Exception as e:
        print(f"  ❌ Error: {file_path}: {e}")
        return False


def main():
    """Fix all critics with defensive checks."""
    base_dir = Path("/Users/labheshpatel/apps/app-factory/src/app_factory_leonardo_replit/agents")

    # Find all critic files
    critic_files = [
        base_dir / "api_client_generator/critic/agent.py",
        base_dir / "app_shell_generator/critic/agent.py",
        base_dir / "context_provider_generator/critic/agent.py",
        base_dir / "main_page_generator/critic/agent.py",
        base_dir / "routes_generator/critic/agent.py",
        base_dir / "storage_generator/critic/agent.py",
        base_dir / "schema_generator/critic/agent.py",
        # Add any others
    ]

    print("Adding defensive checks to prevent dict.strip() errors...")
    print("")

    fixed_count = 0
    for file_path in critic_files:
        if file_path.exists():
            if add_defensive_checks(file_path):
                fixed_count += 1
        else:
            print(f"  File not found: {file_path}")

    print(f"\n✅ Fixed {fixed_count} files with defensive checks")

    # Also ensure errors extraction is correct
    print("\nEnsuring proper errors extraction from eval_data...")

    for file_path in critic_files:
        if not file_path.exists():
            continue

        content = file_path.read_text()

        # Check if it has proper extraction before the check
        if "if errors.strip():" in content or "if errors and errors.strip():" in content:
            # Look for the extraction line
            if "errors = eval_data.get" not in content:
                print(f"  ⚠️ {file_path.name}: Missing errors extraction")

                # Add extraction before the strip check
                new_content = re.sub(
                    r'(\s+)# Defensive check',
                    r'\1errors = eval_data.get("errors", "")\n\1# Defensive check',
                    content
                )

                file_path.write_text(new_content)
                print(f"    Added extraction line")

    print("\n✅ All critics should now handle errors safely")


if __name__ == "__main__":
    main()