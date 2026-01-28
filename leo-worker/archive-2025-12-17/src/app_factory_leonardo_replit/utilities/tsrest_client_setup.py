"""Setup proper ts-rest client using official @ts-rest/core library.

This utility generates the proper ts-rest client setup code using the official
@ts-rest/core library, which is the standard way to use ts-rest contracts.
No custom code generation needed - just proper initialization.
"""

import re
from pathlib import Path
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)


class TsRestClientSetup:
    """Sets up proper ts-rest client using official libraries."""

    def __init__(self, contracts_dir: Path, client_src_dir: Path):
        """Initialize setup with paths.

        Args:
            contracts_dir: Path to shared/contracts directory
            client_src_dir: Path to client/src directory
        """
        self.contracts_dir = Path(contracts_dir)
        self.client_src_dir = Path(client_src_dir)

    def analyze_contracts(self) -> Dict[str, str]:
        """Analyze contract files to extract exported names.

        Returns:
            Dict mapping entity names to contract variable names
        """
        contracts = {}

        for contract_file in self.contracts_dir.glob("*.contract.ts"):
            if contract_file.name == "index.ts":
                continue

            entity_name = contract_file.stem.replace('.contract', '')
            content = contract_file.read_text()

            # Extract exported contract name (e.g., export const chapelsContract)
            match = re.search(r'export\s+const\s+(\w+Contract)\s*=', content)
            if match:
                contract_var_name = match.group(1)
                contracts[entity_name] = contract_var_name
                logger.info(f"Found contract: {entity_name} -> {contract_var_name}")

        return contracts

    def generate_api_client_code(self, contracts: Dict[str, str]) -> str:
        """Generate the api-client.ts initialization code.

        Args:
            contracts: Mapping of entity names to contract variable names

        Returns:
            TypeScript code for api-client.ts
        """
        # Generate imports
        imports = []
        for entity_name, contract_var in contracts.items():
            imports.append(f"import {{ {contract_var} }} from '@shared/contracts/{entity_name}.contract';")

        # Generate router object
        router_entries = []
        for entity_name, contract_var in contracts.items():
            router_entries.append(f"  {entity_name}: {contract_var}")

        code = f"""// Auto-generated ts-rest client setup using official @ts-rest/core
// This follows the official ts-rest documentation pattern exactly

import {{ initClient }} from '@ts-rest/core';
{chr(10).join(imports)}

// Combine all contracts into a single router
const contractsRouter = {{
{','.join(router_entries)}
}};

// Initialize the ts-rest client with all contracts
// This is the official way to create a ts-rest client
export const apiClient = initClient(contractsRouter, {{
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5173',
  baseHeaders: {{
    'Content-Type': 'application/json'
  }}
}});

// Type exports for use in components
export type ApiClient = typeof apiClient;
export type ContractsRouter = typeof contractsRouter;

// Default export for convenience
export default apiClient;
"""
        return code

    def generate_react_query_hooks(self, contracts: Dict[str, str]) -> Dict[str, str]:
        """Generate React Query hooks for each contract.

        Args:
            contracts: Mapping of entity names to contract variable names

        Returns:
            Dict of filename -> code for each hooks file
        """
        hooks_files = {}

        for entity_name in contracts.keys():
            # Basic template for hooks - actual implementation would need
            # to parse contract methods, but this shows the pattern
            code = f"""// React Query hooks for {entity_name} contract
import {{ useQuery, useMutation, useQueryClient }} from '@tanstack/react-query';
import {{ apiClient }} from '@/lib/api-client';

// Example hooks - actual implementation would parse contract methods
// This shows the pattern for using ts-rest with React Query

export const use{entity_name.capitalize()}List = (query?: any) => {{
  return useQuery({{
    queryKey: ['{entity_name}', 'list', query],
    queryFn: async () => {{
      const result = await apiClient.{entity_name}.get{entity_name.capitalize()}(
        query ? {{ query }} : {{}}
      );
      if (result.status === 200) {{
        return result.body;
      }}
      throw new Error('Failed to fetch {entity_name}');
    }}
  }});
}};

export const use{entity_name.capitalize()}ById = (id: string) => {{
  return useQuery({{
    queryKey: ['{entity_name}', id],
    queryFn: async () => {{
      const result = await apiClient.{entity_name}.get{entity_name.capitalize()}ById({{
        params: {{ id }}
      }});
      if (result.status === 200) {{
        return result.body;
      }}
      throw new Error('Failed to fetch {entity_name}');
    }},
    enabled: !!id
  }});
}};

export const useCreate{entity_name.capitalize()} = () => {{
  const queryClient = useQueryClient();

  return useMutation({{
    mutationFn: async (data: any) => {{
      const result = await apiClient.{entity_name}.create{entity_name.capitalize()}({{
        body: data
      }});
      if (result.status === 201) {{
        return result.body;
      }}
      throw new Error('Failed to create {entity_name}');
    }},
    onSuccess: () => {{
      queryClient.invalidateQueries({{ queryKey: ['{entity_name}'] }});
    }}
  }});
}};

export const useUpdate{entity_name.capitalize()} = () => {{
  const queryClient = useQueryClient();

  return useMutation({{
    mutationFn: async ({{ id, data }}: {{ id: string; data: any }}) => {{
      const result = await apiClient.{entity_name}.update{entity_name.capitalize()}({{
        params: {{ id }},
        body: data
      }});
      if (result.status === 200) {{
        return result.body;
      }}
      throw new Error('Failed to update {entity_name}');
    }},
    onSuccess: () => {{
      queryClient.invalidateQueries({{ queryKey: ['{entity_name}'] }});
    }}
  }});
}};

export const useDelete{entity_name.capitalize()} = () => {{
  const queryClient = useQueryClient();

  return useMutation({{
    mutationFn: async (id: string) => {{
      const result = await apiClient.{entity_name}.delete{entity_name.capitalize()}({{
        params: {{ id }}
      }});
      if (result.status === 204 || result.status === 200) {{
        return;
      }}
      throw new Error('Failed to delete {entity_name}');
    }},
    onSuccess: () => {{
      queryClient.invalidateQueries({{ queryKey: ['{entity_name}'] }});
    }}
  }});
}};
"""
            hooks_files[f"{entity_name}.hooks.ts"] = code

        # Generate index file
        index_exports = []
        for entity_name in contracts.keys():
            index_exports.append(f"export * from './{entity_name}.hooks';")

        hooks_files["index.ts"] = "// Barrel export for all API hooks\n" + "\n".join(index_exports) + "\n"

        return hooks_files

    def setup_client(self) -> Tuple[bool, str, List[Path]]:
        """Set up the complete ts-rest client.

        Returns:
            Tuple of (success, message, list of created files)
        """
        created_files = []

        try:
            # Analyze contracts
            contracts = self.analyze_contracts()
            if not contracts:
                return False, "No contracts found", []

            # Create api-client.ts
            lib_dir = self.client_src_dir / "lib"
            lib_dir.mkdir(parents=True, exist_ok=True)

            api_client_path = lib_dir / "api-client.ts"
            api_client_code = self.generate_api_client_code(contracts)
            api_client_path.write_text(api_client_code)
            created_files.append(api_client_path)
            logger.info(f"Created {api_client_path}")

            # Create hooks
            hooks_dir = self.client_src_dir / "hooks" / "api"
            hooks_dir.mkdir(parents=True, exist_ok=True)

            hooks_files = self.generate_react_query_hooks(contracts)
            for filename, code in hooks_files.items():
                hooks_path = hooks_dir / filename
                hooks_path.write_text(code)
                created_files.append(hooks_path)
                logger.info(f"Created {hooks_path}")

            message = f"Successfully set up ts-rest client with {len(created_files)} files"
            return True, message, created_files

        except Exception as e:
            logger.error(f"Failed to set up ts-rest client: {e}")
            return False, str(e), []


def main():
    """CLI entry point."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Set up proper ts-rest client using official libraries"
    )
    parser.add_argument(
        "contracts_dir",
        help="Path to shared/contracts directory"
    )
    parser.add_argument(
        "client_src_dir",
        help="Path to client/src directory"
    )

    args = parser.parse_args()

    setup = TsRestClientSetup(
        contracts_dir=Path(args.contracts_dir),
        client_src_dir=Path(args.client_src_dir)
    )

    success, message, files = setup.setup_client()
    print(message)
    if files:
        print(f"Created files:")
        for f in files:
            print(f"  - {f}")

    return 0 if success else 1


if __name__ == "__main__":
    import sys
    sys.exit(main()