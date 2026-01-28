"""Contract Metadata Extractor for ts-rest contracts.

This utility parses ts-rest contract files and extracts structured metadata
that can be used by the FIS Writer to generate correct API calls.
"""

import re
import json
from pathlib import Path
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)


class ContractMethod:
    """Represents a single method in a ts-rest contract."""

    def __init__(self, name: str, http_method: str, path: str):
        self.name = name
        self.http_method = http_method
        self.path = path
        self.query_params: List[str] = []
        self.path_params: List[str] = []
        self.body_schema: Optional[str] = None
        self.response_schema: Optional[str] = None
        self.description: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "name": self.name,
            "http_method": self.http_method,
            "path": self.path,
            "query_params": self.query_params,
            "path_params": self.path_params,
            "has_body": self.body_schema is not None,
            "body_schema": self.body_schema,
            "response_schema": self.response_schema,
            "description": self.description
        }

    def get_usage_example(self, entity_name: str) -> str:
        """Generate a usage example for this method."""
        examples = []

        # Basic call structure
        call = f"apiClient.{entity_name}.{self.name}("

        params = []

        # Add path parameters
        if self.path_params:
            path_obj = "{ " + ", ".join([f"{p}: '{p}Value'" for p in self.path_params]) + " }"
            params.append(f"params: {path_obj}")

        # Add query parameters
        if self.query_params and self.http_method == "GET":
            query_obj = "{ " + ", ".join([f"{p}: value" for p in self.query_params[:3]]) + " }"
            params.append(f"query: {query_obj}")

        # Add body for POST/PUT/PATCH
        if self.body_schema and self.http_method in ["POST", "PUT", "PATCH"]:
            params.append("body: data")

        if params:
            call += "{ " + ", ".join(params) + " }"
        call += ")"

        return call


class ContractMetadataExtractor:
    """Extracts metadata from ts-rest contract files."""

    def __init__(self, contracts_dir: Path):
        """Initialize with contracts directory.

        Args:
            contracts_dir: Path to shared/contracts directory
        """
        self.contracts_dir = Path(contracts_dir)
        self.contracts_metadata = {}

    def extract_contract_methods(self, contract_file: Path) -> List[ContractMethod]:
        """Extract methods from a single contract file.

        Args:
            contract_file: Path to contract file

        Returns:
            List of ContractMethod objects
        """
        content = contract_file.read_text()
        methods = []

        # Find the main contract export
        contract_match = re.search(r'export\s+const\s+\w+Contract\s*=\s*c\.router\(\{([^}]+(?:\{[^}]*\}[^}]*)*)\}\)', content, re.DOTALL)
        if not contract_match:
            logger.warning(f"Could not find contract router in {contract_file}")
            return methods

        contract_body = contract_match.group(1)

        # Extract individual methods
        # Pattern to match method definitions
        method_pattern = r'(\w+)\s*:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}'

        for match in re.finditer(method_pattern, contract_body):
            method_name = match.group(1)
            method_body = match.group(2)

            # Extract HTTP method
            http_method_match = re.search(r'method\s*:\s*[\'"](\w+)[\'"]', method_body)
            if not http_method_match:
                continue
            http_method = http_method_match.group(1)

            # Extract path
            path_match = re.search(r'path\s*:\s*[\'"]([^\'\"]+)[\'"]', method_body)
            if not path_match:
                continue
            path = path_match.group(1)

            method = ContractMethod(method_name, http_method, path)

            # Extract path parameters from the path (e.g., :id)
            path_params = re.findall(r':(\w+)', path)
            method.path_params = path_params

            # Extract query parameters
            query_match = re.search(r'query\s*:\s*z\.object\(\{([^}]+)\}', method_body)
            if query_match:
                query_body = query_match.group(1)
                # Extract parameter names
                param_names = re.findall(r'(\w+)\s*:', query_body)
                method.query_params = param_names

            # Extract body schema
            body_match = re.search(r'body\s*:\s*(z\.\w+[^,\n]*)', method_body)
            if body_match:
                method.body_schema = body_match.group(1).strip()

            # Extract response schema
            response_match = re.search(r'responses\s*:\s*\{[^}]*200\s*:\s*([^,}]+)', method_body)
            if response_match:
                method.response_schema = response_match.group(1).strip()

            methods.append(method)

        return methods

    def extract_all_contracts(self) -> Dict[str, List[ContractMethod]]:
        """Extract metadata from all contract files.

        Returns:
            Dict mapping entity names to lists of ContractMethod objects
        """
        contracts = {}

        for contract_file in self.contracts_dir.glob("*.contract.ts"):
            if contract_file.name == "index.ts":
                continue

            entity_name = contract_file.stem.replace('.contract', '')
            methods = self.extract_contract_methods(contract_file)

            if methods:
                contracts[entity_name] = methods
                logger.info(f"Extracted {len(methods)} methods from {entity_name} contract")

        self.contracts_metadata = contracts
        return contracts

    def generate_usage_guide(self) -> str:
        """Generate a comprehensive usage guide for all contracts.

        Returns:
            Markdown formatted usage guide
        """
        if not self.contracts_metadata:
            self.extract_all_contracts()

        guide = ["# Contract API Usage Guide\n"]
        guide.append("This guide shows the correct way to call each API method using ts-rest.\n")

        for entity_name, methods in self.contracts_metadata.items():
            guide.append(f"\n## {entity_name.capitalize()} Contract\n")

            for method in methods:
                guide.append(f"\n### {method.name}\n")
                guide.append(f"- **HTTP Method**: {method.http_method}\n")
                guide.append(f"- **Path**: `{method.path}`\n")

                if method.path_params:
                    guide.append(f"- **Path Parameters**: {', '.join(method.path_params)}\n")

                if method.query_params:
                    guide.append(f"- **Query Parameters**: {', '.join(method.query_params)}\n")

                if method.body_schema:
                    guide.append(f"- **Body Required**: Yes\n")

                guide.append(f"\n**Usage Example:**\n```typescript\n{method.get_usage_example(entity_name)}\n```\n")

        return "".join(guide)

    def generate_json_metadata(self) -> str:
        """Generate JSON metadata for all contracts.

        Returns:
            JSON string with contract metadata
        """
        if not self.contracts_metadata:
            self.extract_all_contracts()

        output = {}
        for entity_name, methods in self.contracts_metadata.items():
            output[entity_name] = [method.to_dict() for method in methods]

        return json.dumps(output, indent=2)

    def validate_fis_api_calls(self, fis_content: str) -> List[str]:
        """Validate API calls in FIS against actual contracts.

        Args:
            fis_content: Content of the FIS markdown file

        Returns:
            List of validation errors
        """
        if not self.contracts_metadata:
            self.extract_all_contracts()

        errors = []

        # Extract API calls from FIS
        # Look for patterns like apiClient.entity.method or api.entity.method
        api_call_pattern = r'(?:apiClient|api)\.(\w+)\.(\w+)\([^)]*\)'

        for match in re.finditer(api_call_pattern, fis_content):
            entity_name = match.group(1)
            method_name = match.group(2)
            full_call = match.group(0)

            # Check if entity exists
            if entity_name not in self.contracts_metadata:
                errors.append(f"Unknown entity '{entity_name}' in call: {full_call}")
                continue

            # Check if method exists
            methods = self.contracts_metadata[entity_name]
            method_names = [m.name for m in methods]
            if method_name not in method_names:
                errors.append(f"Unknown method '{method_name}' for entity '{entity_name}' in call: {full_call}")
                # Suggest similar method names
                similar = [m for m in method_names if m.lower().startswith(method_name[:3].lower())]
                if similar:
                    errors.append(f"  Did you mean: {', '.join(similar[:3])}?")

            # TODO: Add more sophisticated validation of parameters

        return errors


def main():
    """CLI entry point."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Extract metadata from ts-rest contracts"
    )
    parser.add_argument(
        "contracts_dir",
        help="Path to shared/contracts directory"
    )
    parser.add_argument(
        "--format",
        choices=["guide", "json", "validate"],
        default="guide",
        help="Output format"
    )
    parser.add_argument(
        "--fis-file",
        help="Path to FIS file to validate (when format=validate)"
    )

    args = parser.parse_args()

    extractor = ContractMetadataExtractor(Path(args.contracts_dir))

    if args.format == "guide":
        guide = extractor.generate_usage_guide()
        print(guide)
    elif args.format == "json":
        metadata = extractor.generate_json_metadata()
        print(metadata)
    elif args.format == "validate":
        if not args.fis_file:
            print("Error: --fis-file required when format=validate")
            return 1

        fis_content = Path(args.fis_file).read_text()
        errors = extractor.validate_fis_api_calls(fis_content)

        if errors:
            print("Validation errors found:")
            for error in errors:
                print(f"  - {error}")
            return 1
        else:
            print("No validation errors found")
            return 0

    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())