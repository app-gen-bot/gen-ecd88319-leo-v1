#!/usr/bin/env python3
"""Validate all agent config files against cc_agent.Agent signature.

This script:
1. Finds all config.py files in the agents directory
2. Imports each AGENT_CONFIG
3. Validates parameters against cc_agent.Agent.__init__ signature
4. Reports any invalid parameters

Run before commits to catch configuration errors early.
"""

import ast
import inspect
import sys
from pathlib import Path
from typing import Dict, List, Set

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root / "src"))
sys.path.insert(0, str(project_root / "vendor"))

try:
    from cc_agent import Agent
except ImportError as e:
    print(f"❌ Cannot import cc_agent: {e}")
    print(f"💡 Make sure cc-agent is installed or in vendor/ directory")
    # For validation purposes, create a mock if cc_agent isn't available
    print("⚠️  Using mock validation (check parameter names manually)")

    # Known valid parameters as of cc_agent latest version
    KNOWN_VALID_PARAMS = {
        'system_prompt', 'allowed_tools', 'max_turns', 'permission_mode',
        'mcp_tools', 'mcp_servers', 'cwd', 'model', 'name'
    }

    class Agent:
        def __init__(self, **kwargs):
            pass

    # Monkey-patch to return known params
    import inspect
    original_signature = inspect.signature
    def mock_signature(obj):
        if obj == Agent.__init__:
            from inspect import Parameter, Signature
            params = [Parameter('self', Parameter.POSITIONAL_OR_KEYWORD)]
            for param_name in KNOWN_VALID_PARAMS:
                params.append(Parameter(param_name, Parameter.KEYWORD_ONLY, default=None))
            return Signature(params)
        return original_signature(obj)
    inspect.signature = mock_signature


def get_agent_init_params() -> Set[str]:
    """Get valid parameter names for Agent.__init__."""
    sig = inspect.signature(Agent.__init__)
    # Exclude 'self'
    return {param for param in sig.parameters.keys() if param != 'self'}


def extract_config_keys(file_path: Path) -> Set[str]:
    """Extract keys from AGENT_CONFIG dict in a Python file."""
    try:
        with open(file_path, 'r') as f:
            tree = ast.parse(f.read(), filename=str(file_path))

        for node in ast.walk(tree):
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name) and target.id == 'AGENT_CONFIG':
                        if isinstance(node.value, ast.Dict):
                            keys = set()
                            for key in node.value.keys:
                                if isinstance(key, ast.Constant):
                                    keys.add(key.value)
                            return keys
        return set()
    except Exception as e:
        print(f"⚠️  Error parsing {file_path}: {e}")
        return set()


def find_all_agent_configs() -> List[Path]:
    """Find all agent config.py files."""
    agents_dir = project_root / "src" / "app_factory_leonardo_replit" / "agents"
    config_files = list(agents_dir.rglob("config.py"))
    return sorted(config_files)


def validate_configs():
    """Validate all agent configs."""
    print("🔍 Validating agent configurations...\n")

    valid_params = get_agent_init_params()
    print(f"✅ Valid cc_agent.Agent parameters: {sorted(valid_params)}\n")

    config_files = find_all_agent_configs()
    print(f"📁 Found {len(config_files)} config files\n")

    all_valid = True
    issues: Dict[str, List[str]] = {}

    for config_file in config_files:
        relative_path = config_file.relative_to(project_root)
        config_keys = extract_config_keys(config_file)

        if not config_keys:
            continue

        # Check for invalid parameters
        invalid_params = config_keys - valid_params

        if invalid_params:
            all_valid = False
            issues[str(relative_path)] = sorted(invalid_params)
            print(f"❌ {relative_path}")
            for param in sorted(invalid_params):
                print(f"   - Invalid parameter: '{param}'")
            print()
        else:
            print(f"✅ {relative_path}")

    print("\n" + "="*60)

    if all_valid:
        print("✅ All agent configs are valid!")
        return 0
    else:
        print(f"❌ Found {len(issues)} config files with invalid parameters:\n")
        for file_path, invalid in issues.items():
            print(f"  {file_path}:")
            for param in invalid:
                print(f"    - {param}")
        print("\n💡 Remove these parameters or update cc_agent.Agent to support them")
        return 1


if __name__ == "__main__":
    sys.exit(validate_configs())
