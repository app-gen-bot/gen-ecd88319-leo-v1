#!/usr/bin/env python
"""Fix API client to use proper ts-rest instead of basic fetch.

This script replaces the basic fetch-based api.ts with a proper ts-rest client
that matches the contracts exactly. It also compiles metadata into an API registry.
"""

import sys
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

def to_camel_case(snake_str: str) -> str:
    """Convert snake-case or kebab-case to camelCase.

    Examples:
        blocked-dates -> blockedDates
        blocked_dates -> blockedDates
        chapel-bookings -> chapelBookings
        chapels -> chapels (single word unchanged)

    Args:
        snake_str: String in snake-case or kebab-case format

    Returns:
        String in camelCase format
    """
    # Replace hyphens and underscores with spaces, then split
    components = snake_str.replace('-', ' ').replace('_', ' ').split()

    # Handle empty or single-word strings
    if not components:
        return snake_str
    if len(components) == 1:
        return components[0].lower()

    # First component stays lowercase, rest are capitalized
    return components[0].lower() + ''.join(x.capitalize() for x in components[1:])

def extract_contract_name(contract_file: Path) -> str:
    """Extract actual contract export name from TypeScript file.

    This reads the actual export statement instead of guessing from filename,
    which is more reliable for compound words (e.g., "timeSlots" vs "timeslots").

    Args:
        contract_file: Path to .contract.ts file

    Returns:
        Actual contract variable name (e.g., "timeSlotsContract")
    """
    import re

    try:
        content = contract_file.read_text()

        # Match: export const {name}Contract
        match = re.search(r'export\s+const\s+(\w+Contract)\s*=', content)

        if match:
            contract_name = match.group(1)
            print(f"   📝 {contract_file.name} → {contract_name}")
            return contract_name

    except Exception as e:
        print(f"   ⚠️  Could not read {contract_file.name}: {e}")

    # Fallback to filename-based conversion if reading fails
    entity_name = contract_file.stem.replace('.contract', '')
    entity_name_camel = to_camel_case(entity_name)
    fallback_name = f"{entity_name_camel}Contract"
    print(f"   ⚠️  {contract_file.name} → {fallback_name} (fallback)")
    return fallback_name

def generate_tsrest_client(contracts_dir: Path) -> str:
    """Generate proper ts-rest client code.

    Args:
        contracts_dir: Path to shared/contracts directory

    Returns:
        TypeScript code for api-client.ts
    """

    # Find all contract files
    contract_files = sorted([f for f in contracts_dir.glob("*.contract.ts")
                            if f.name != "index.ts"])

    if not contract_files:
        raise ValueError(f"No contract files found in {contracts_dir}")

    print(f"📖 Reading contract exports from {len(contract_files)} files...")

    # Generate imports by reading actual exports
    imports = []
    router_entries = []

    for contract_file in contract_files:
        # Extract actual contract name from file (e.g., "timeSlotsContract")
        contract_var = extract_contract_name(contract_file)

        # Derive entity name by removing "Contract" suffix (e.g., "timeSlots")
        entity_name_camel = contract_var.replace('Contract', '')

        imports.append(f"import {{ {contract_var} }} from '@shared/contracts/{contract_file.name}';")
        router_entries.append(f"  {entity_name_camel}: {contract_var}")

    # Generate the client code with auth support
    code = f"""// Auto-generated ts-rest client with authentication support
// This file is generated to match the ts-rest contracts exactly
// DO NOT EDIT MANUALLY - regenerate using fix_api_client.py

import {{ initClient }} from '@ts-rest/core';
{chr(10).join(imports)}

// Get auth token from localStorage
const getAuthToken = (): string | null => {{
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}};

// Combine all contracts into a single router
const contractsRouter = {{
{','.join(router_entries)}
}};

// Initialize the ts-rest client with all contracts
export const apiClient = initClient(contractsRouter, {{
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5013',
  baseHeaders: () => {{
    const token = getAuthToken();
    return {{
      'Content-Type': 'application/json',
      ...(token ? {{ 'Authorization': `Bearer ${{token}}` }} : {{}})
    }};
  }}
}});

// Type exports for use in components
export type ApiClient = typeof apiClient;
export type ContractsRouter = typeof contractsRouter;

// Helper to set auth token
export const setAuthToken = (token: string | null) => {{
  if (token) {{
    localStorage.setItem('auth_token', token);
  }} else {{
    localStorage.removeItem('auth_token');
  }}
}};

// Helper to check if user is authenticated
export const isAuthenticated = (): boolean => {{
  return !!getAuthToken();
}};

// Default export for convenience (some components may expect it)
export default apiClient;

// Legacy api export for backward compatibility
// Components using 'api' instead of 'apiClient' will still work
export const api = apiClient;
"""

    return code


def compile_api_registry_from_metadata(contracts_dir: Path, output_path: Path) -> bool:
    """Compile API registry from metadata files.

    Reads all .contract.meta.json files and compiles them into a lightweight
    markdown registry that downstream agents can use.

    Args:
        contracts_dir: Path to shared/contracts directory
        output_path: Path to output api-registry.md file

    Returns:
        True if successful, False otherwise
    """
    try:
        # Find all metadata files
        metadata_files = sorted(contracts_dir.glob("*.contract.meta.json"))

        if not metadata_files:
            print(f"⚠️  No metadata files found in {contracts_dir}")
            print("    Contracts may not have been generated with metadata support yet.")
            return False

        # Parse all metadata files
        all_metadata: List[Dict[str, Any]] = []
        for meta_file in metadata_files:
            try:
                with open(meta_file, 'r') as f:
                    metadata = json.load(f)
                    all_metadata.append(metadata)
            except json.JSONDecodeError as e:
                print(f"❌ Invalid JSON in {meta_file.name}: {e}")
                return False
            except Exception as e:
                print(f"❌ Error reading {meta_file.name}: {e}")
                return False

        # Generate markdown registry
        registry_md = f"""# API Registry

**Generated**: {datetime.now().isoformat()}
**Purpose**: Authoritative list of all API methods available in apiClient

This registry is automatically compiled from contract metadata files. All API methods
listed here are guaranteed to exist in the ts-rest contracts.

---

"""

        # Add table of contents
        registry_md += "## Table of Contents\n\n"
        for meta in all_metadata:
            entity = meta.get('entity', 'unknown')
            method_count = len(meta.get('methods', []))
            registry_md += f"- [{entity}](#{entity}) ({method_count} methods)\n"
        registry_md += "\n---\n\n"

        # Add detailed sections for each entity
        for meta in all_metadata:
            entity = meta.get('entity', 'unknown')
            api_namespace = meta.get('apiNamespace', f'apiClient.{entity}')
            methods = meta.get('methods', [])
            contract_file = meta.get('contractFile', f'{entity}.contract.ts')

            registry_md += f"## {entity}\n\n"
            registry_md += f"**Namespace**: `{api_namespace}`  \n"
            registry_md += f"**Contract File**: `{contract_file}`  \n"
            registry_md += f"**Methods**: {len(methods)}  \n\n"

            if not methods:
                registry_md += "_No methods defined._\n\n"
                continue

            # Add methods table
            registry_md += "| Method | HTTP | Path | Description | Auth |\n"
            registry_md += "|--------|------|------|-------------|------|\n"

            for method in methods:
                name = method.get('name', 'unknown')
                http_method = method.get('httpMethod', 'GET')
                path = method.get('path', '/')
                description = method.get('description', '').replace('|', '\\|')[:50]
                auth_required = method.get('authRequired', False)
                required_role = method.get('requiredRole')

                auth_str = ""
                if auth_required:
                    auth_str = f"🔒 {required_role}" if required_role else "🔒"

                registry_md += f"| `{name}` | {http_method} | `{path}` | {description} | {auth_str} |\n"

            registry_md += "\n### Method Details\n\n"

            # Add detailed method signatures
            for method in methods:
                name = method.get('name', 'unknown')
                signature = method.get('signature', '')
                description = method.get('description', 'No description')
                http_method = method.get('httpMethod', 'GET')
                path = method.get('path', '/')
                returns = method.get('returns', 'void')
                parameters = method.get('parameters', {})

                registry_md += f"#### `{api_namespace}.{name}()`\n\n"
                registry_md += f"**Signature**: `{signature}`  \n"
                registry_md += f"**HTTP**: `{http_method} {path}`  \n"
                registry_md += f"**Returns**: `{returns}`  \n"
                registry_md += f"**Description**: {description}  \n"

                # Add parameters if any
                if parameters:
                    registry_md += "\n**Parameters**:\n"
                    for param_type, param_list in parameters.items():
                        if param_list:
                            registry_md += f"- `{param_type}`: {', '.join(param_list)}\n"

                registry_md += "\n"

            registry_md += "---\n\n"

        # Add footer
        registry_md += """## Usage Guidelines

### For FIS Generators

When designing frontend interactions, ONLY use methods listed in this registry.

```typescript
// ✅ CORRECT - Method exists in registry
const chapels = await apiClient.chapels.getChapels({ query: { page: 1 } });

// ❌ WRONG - Method not in registry (hallucinated)
const images = await apiClient.chapels.getChapelImages({ params: { id } });
```

### For Page Generators

Validate that all `apiClient.*` calls exist in this registry before generating code.

### For Critics

If you see an API method call that doesn't exist in this registry, flag it as an error.

---

**This registry is the source of truth for all API methods.**
"""

        # Write registry file
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(registry_md)

        # Calculate stats
        total_methods = sum(len(m.get('methods', [])) for m in all_metadata)
        file_size = len(registry_md.encode('utf-8'))

        print(f"✅ Generated API registry at {output_path}")
        print(f"   📊 {len(all_metadata)} entities, {total_methods} methods")
        print(f"   💾 {file_size:,} bytes (~{file_size/1024:.1f} KB)")

        return True

    except Exception as e:
        print(f"❌ Failed to compile API registry: {e}")
        import traceback
        traceback.print_exc()
        return False


def fix_api_client(app_dir: Path) -> bool:
    """Generate the API client in an app directory.

    Args:
        app_dir: Path to app directory (contains client/, server/, shared/)

    Returns:
        True if successful
    """
    # Check directories exist
    contracts_dir = app_dir / "shared" / "contracts"
    lib_dir = app_dir / "client" / "src" / "lib"
    api_client_file = lib_dir / "api-client.ts"

    if not contracts_dir.exists():
        print(f"❌ Contracts directory not found: {contracts_dir}")
        return False

    if not lib_dir.exists():
        lib_dir.mkdir(parents=True, exist_ok=True)

    try:
        # Generate new client code with auth support
        new_code = generate_tsrest_client(contracts_dir)

        # Backup existing api-client.ts if it exists
        if api_client_file.exists():
            backup = api_client_file.with_suffix('.ts.backup')
            api_client_file.rename(backup)
            print(f"📦 Backed up existing api-client.ts to {backup.name}")

        # Write client with auth to api-client.ts
        api_client_file.write_text(new_code)
        print(f"✅ Generated auth-enabled ts-rest client at api-client.ts")

        # Generate API registry from metadata
        registry_path = lib_dir / "api-registry.md"
        print(f"\n📝 Compiling API registry from metadata...")
        registry_success = compile_api_registry_from_metadata(contracts_dir, registry_path)

        if not registry_success:
            print(f"⚠️  API registry generation skipped (metadata files may not exist yet)")
            print(f"    The registry will be generated automatically once contracts are regenerated with metadata support.")

        return True

    except Exception as e:
        print(f"❌ Failed to generate ts-rest client: {e}")
        return False


def main():
    """CLI entry point."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Fix API client to use proper ts-rest"
    )
    parser.add_argument(
        "app_dir",
        type=Path,
        help="Path to app directory (contains client/, server/, shared/)"
    )

    args = parser.parse_args()

    if not args.app_dir.exists():
        print(f"❌ App directory not found: {args.app_dir}")
        return 1

    success = fix_api_client(args.app_dir)
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())