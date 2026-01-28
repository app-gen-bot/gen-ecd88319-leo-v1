"""Deterministic ts-rest client generator from contract files.

This utility programmatically generates a proper ts-rest client from contract files
without using an LLM. It parses the contract structure and generates the exact
client code needed.
"""

import re
import json
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)


class TsRestClientGenerator:
    """Generates ts-rest client code from contract files."""

    def __init__(self, contracts_dir: Path, output_dir: Path):
        """Initialize generator with paths.

        Args:
            contracts_dir: Path to shared/contracts directory
            output_dir: Path to client/src directory
        """
        self.contracts_dir = Path(contracts_dir)
        self.output_dir = Path(output_dir)
        self.contracts = {}
        self.contract_methods = {}

    def parse_contracts(self) -> Dict[str, List[str]]:
        """Parse all contract files to extract structure.

        Returns:
            Dict mapping contract names to their methods
        """
        contracts = {}

        for contract_file in self.contracts_dir.glob("*.contract.ts"):
            if contract_file.name == "index.ts":
                continue

            contract_name = contract_file.stem.replace('.contract', '')
            content = contract_file.read_text()

            # Extract exported contract name
            # Look for: export const xxxContract = c.router({
            contract_var_match = re.search(r'export\s+const\s+(\w+Contract)\s*=', content)
            if not contract_var_match:
                logger.warning(f"Could not find contract export in {contract_file}")
                continue

            contract_var_name = contract_var_match.group(1)

            # Extract method names from the contract
            # Look for patterns like: methodName: { method: 'GET/POST/etc'
            methods = []
            method_pattern = r'(\w+)\s*:\s*\{[^}]*method\s*:\s*[\'"](\w+)[\'"]'
            for match in re.finditer(method_pattern, content):
                method_name = match.group(1)
                http_method = match.group(2)
                methods.append({
                    'name': method_name,
                    'http_method': http_method
                })

            contracts[contract_name] = {
                'var_name': contract_var_name,
                'methods': methods,
                'file_name': contract_file.name
            }

        self.contracts = contracts
        return contracts

    def generate_api_client(self) -> str:
        """Generate the main api-client.ts file.

        Returns:
            Generated TypeScript code for api-client.ts
        """
        if not self.contracts:
            self.parse_contracts()

        imports = []
        router_entries = []

        # Generate imports for each contract
        for contract_name, contract_info in self.contracts.items():
            var_name = contract_info['var_name']
            file_name = contract_info['file_name']
            imports.append(f"import {{ {var_name} }} from '@shared/contracts/{file_name}';")
            router_entries.append(f"  {contract_name}: {var_name}")

        # Generate the client code
        code = f"""import {{ initClient }} from '@ts-rest/core';
{chr(10).join(imports)}

// Build contracts router from all contracts
const contractsRouter = {{
{','.join(router_entries)}
}};

// Initialize ts-rest client with all contracts
export const apiClient = initClient(contractsRouter, {{
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5173',
  baseHeaders: {{
    'Content-Type': 'application/json'
  }}
}});

// Export for convenience
export default apiClient;
"""
        return code

    def generate_hooks_for_contract(self, contract_name: str, contract_info: dict) -> str:
        """Generate React Query hooks for a specific contract.

        Args:
            contract_name: Name of the contract (e.g., 'users')
            contract_info: Contract information with methods

        Returns:
            Generated TypeScript code for hooks
        """
        # Capitalize first letter for type names
        entity_name = contract_name[0].upper() + contract_name[1:] if contract_name else contract_name
        singular_entity = entity_name.rstrip('s') if entity_name.endswith('s') else entity_name

        hooks = []

        for method in contract_info['methods']:
            method_name = method['name']
            http_method = method['http_method'].upper()

            if http_method == 'GET':
                # Generate query hooks for GET methods
                if 'get' in method_name.lower() and 'id' not in method_name.lower():
                    # List/search method
                    hook_name = f"use{method_name[0].upper() + method_name[1:]}"
                    hooks.append(f"""
export const {hook_name} = (filters?: any) => {{
  return useQuery({{
    queryKey: ['{contract_name}', filters],
    queryFn: () => apiClient.{contract_name}.{method_name}(filters ? {{ query: filters }} : {{}}),
    staleTime: 5 * 60 * 1000
  }});
}};""")
                else:
                    # Single item method
                    hook_name = f"use{method_name[0].upper() + method_name[1:]}"
                    hooks.append(f"""
export const {hook_name} = (id: string) => {{
  return useQuery({{
    queryKey: ['{contract_name}', id],
    queryFn: () => apiClient.{contract_name}.{method_name}({{ params: {{ id }} }}),
    enabled: !!id
  }});
}};""")

            elif http_method in ['POST', 'PUT', 'PATCH', 'DELETE']:
                # Generate mutation hooks
                hook_name = f"use{method_name[0].upper() + method_name[1:]}"

                if http_method == 'DELETE':
                    hooks.append(f"""
export const {hook_name} = () => {{
  const queryClient = useQueryClient();
  return useMutation({{
    mutationFn: (id: string) =>
      apiClient.{contract_name}.{method_name}({{ params: {{ id }} }}),
    onSuccess: () => {{
      queryClient.invalidateQueries({{ queryKey: ['{contract_name}'] }});
    }}
  }});
}};""")
                else:
                    # POST/PUT/PATCH
                    hooks.append(f"""
export const {hook_name} = () => {{
  const queryClient = useQueryClient();
  return useMutation({{
    mutationFn: (data: any) =>
      apiClient.{contract_name}.{method_name}({{ body: data }}),
    onSuccess: () => {{
      queryClient.invalidateQueries({{ queryKey: ['{contract_name}'] }});
    }}
  }});
}};""")

        # Generate the complete hooks file
        code = f"""import {{ useQuery, useMutation, useQueryClient }} from '@tanstack/react-query';
import {{ apiClient }} from '@/lib/api-client';
{chr(10).join(hooks)}
"""
        return code

    def generate_hooks_index(self) -> str:
        """Generate the barrel export for all hooks.

        Returns:
            Generated TypeScript code for hooks index
        """
        exports = []

        for contract_name in self.contracts.keys():
            exports.append(f"export * from './{contract_name}.hooks';")

        return chr(10).join(exports) + chr(10)

    def write_files(self) -> List[Path]:
        """Write all generated files to the output directory.

        Returns:
            List of paths to generated files
        """
        generated_files = []

        # Ensure directories exist
        lib_dir = self.output_dir / "lib"
        hooks_dir = self.output_dir / "hooks" / "api"
        lib_dir.mkdir(parents=True, exist_ok=True)
        hooks_dir.mkdir(parents=True, exist_ok=True)

        # Generate and write api-client.ts
        api_client_path = lib_dir / "api-client.ts"
        api_client_code = self.generate_api_client()
        api_client_path.write_text(api_client_code)
        generated_files.append(api_client_path)
        logger.info(f"Generated {api_client_path}")

        # Generate and write hooks for each contract
        for contract_name, contract_info in self.contracts.items():
            hooks_path = hooks_dir / f"{contract_name}.hooks.ts"
            hooks_code = self.generate_hooks_for_contract(contract_name, contract_info)
            hooks_path.write_text(hooks_code)
            generated_files.append(hooks_path)
            logger.info(f"Generated {hooks_path}")

        # Generate and write hooks index
        hooks_index_path = hooks_dir / "index.ts"
        hooks_index_code = self.generate_hooks_index()
        hooks_index_path.write_text(hooks_index_code)
        generated_files.append(hooks_index_path)
        logger.info(f"Generated {hooks_index_path}")

        return generated_files

    def generate(self) -> Tuple[bool, str]:
        """Main method to generate the complete ts-rest client.

        Returns:
            Tuple of (success, message)
        """
        try:
            # Parse contracts
            contracts = self.parse_contracts()
            if not contracts:
                return False, "No contracts found to generate client from"

            logger.info(f"Found {len(contracts)} contracts: {list(contracts.keys())}")

            # Write all files
            generated_files = self.write_files()

            message = f"Successfully generated ts-rest client with {len(generated_files)} files"
            return True, message

        except Exception as e:
            logger.error(f"Failed to generate ts-rest client: {e}")
            return False, str(e)


def main():
    """CLI entry point for testing."""
    import argparse

    parser = argparse.ArgumentParser(description="Generate ts-rest client from contracts")
    parser.add_argument("contracts_dir", help="Path to shared/contracts directory")
    parser.add_argument("output_dir", help="Path to client/src directory")

    args = parser.parse_args()

    generator = TsRestClientGenerator(
        contracts_dir=Path(args.contracts_dir),
        output_dir=Path(args.output_dir)
    )

    success, message = generator.generate()
    print(message)
    return 0 if success else 1


if __name__ == "__main__":
    import sys
    sys.exit(main())