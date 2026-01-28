"""FIS Validator - Validates Frontend Interaction Specification against contracts.

This tool validates that the FIS correctly uses API contracts and provides
actionable feedback for improvements. It acts like a "compiler" for the FIS.
"""

import re
import json
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class ValidationError:
    """Represents a validation error in the FIS."""
    severity: str  # "error", "warning", "info"
    line_number: Optional[int]
    context: str
    message: str
    suggestion: Optional[str] = None


@dataclass
class ApiCall:
    """Represents an API call found in the FIS."""
    raw_text: str
    entity: str
    method: str
    parameters: Optional[str]
    line_number: int


class FISValidator:
    """Validates Frontend Interaction Specification documents."""

    def __init__(self, contracts_dir: Path, fis_path: Path):
        """Initialize validator.

        Args:
            contracts_dir: Path to shared/contracts directory
            fis_path: Path to FIS markdown file
        """
        self.contracts_dir = Path(contracts_dir)
        self.fis_path = Path(fis_path)
        self.fis_content = ""
        self.fis_lines = []
        self.contracts = {}
        self.errors: List[ValidationError] = []

    def load_fis(self) -> bool:
        """Load the FIS file.

        Returns:
            True if loaded successfully
        """
        try:
            self.fis_content = self.fis_path.read_text()
            self.fis_lines = self.fis_content.split('\n')
            return True
        except Exception as e:
            logger.error(f"Failed to load FIS: {e}")
            return False

    def parse_contracts(self) -> Dict[str, Dict[str, Any]]:
        """Parse contract files to extract available methods.

        Returns:
            Dict of entity -> methods with their signatures
        """
        contracts = {}

        for contract_file in self.contracts_dir.glob("*.contract.ts"):
            if contract_file.name == "index.ts":
                continue

            entity_name = contract_file.stem.replace('.contract', '')
            content = contract_file.read_text()

            # Find contract export
            contract_match = re.search(r'export\s+const\s+(\w+Contract)\s*=', content)
            if not contract_match:
                continue

            # Extract methods
            methods = {}
            method_pattern = r'(\w+)\s*:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}'

            for match in re.finditer(method_pattern, content):
                method_name = match.group(1)
                method_body = match.group(2)

                # Extract HTTP method
                http_match = re.search(r'method\s*:\s*[\'"](\w+)[\'"]', method_body)
                if not http_match:
                    continue

                method_info = {
                    'http_method': http_match.group(1),
                    'has_query': 'query:' in method_body,
                    'has_body': 'body:' in method_body,
                    'has_path_params': 'pathParams:' in method_body or ':' in method_body
                }

                methods[method_name] = method_info

            if methods:
                contracts[entity_name] = methods
                logger.info(f"Found {len(methods)} methods in {entity_name} contract")

        self.contracts = contracts
        return contracts

    def extract_api_calls(self) -> List[ApiCall]:
        """Extract all API calls from the FIS.

        Returns:
            List of ApiCall objects found in the FIS
        """
        api_calls = []

        # Patterns to match API calls
        patterns = [
            # apiClient.entity.method(...)
            r'apiClient\.(\w+)\.(\w+)\(([^)]*)\)',
            # api.entity.method(...)
            r'api\.(\w+)\.(\w+)\(([^)]*)\)',
            # await apiClient.entity.method(...)
            r'await\s+apiClient\.(\w+)\.(\w+)\(([^)]*)\)',
            # const result = apiClient.entity.method(...)
            r'=\s*apiClient\.(\w+)\.(\w+)\(([^)]*)\)',
        ]

        for line_num, line in enumerate(self.fis_lines, 1):
            for pattern in patterns:
                for match in re.finditer(pattern, line):
                    call = ApiCall(
                        raw_text=match.group(0),
                        entity=match.group(1),
                        method=match.group(2),
                        parameters=match.group(3) if len(match.groups()) > 2 else None,
                        line_number=line_num
                    )
                    api_calls.append(call)

        return api_calls

    def validate_api_call(self, call: ApiCall) -> List[ValidationError]:
        """Validate a single API call.

        Args:
            call: The API call to validate

        Returns:
            List of validation errors for this call
        """
        errors = []

        # Check if entity exists
        if call.entity not in self.contracts:
            error = ValidationError(
                severity="error",
                line_number=call.line_number,
                context=call.raw_text,
                message=f"Unknown entity '{call.entity}'",
                suggestion=f"Available entities: {', '.join(self.contracts.keys())}"
            )
            errors.append(error)
            return errors

        # Check if method exists
        entity_methods = self.contracts[call.entity]
        if call.method not in entity_methods:
            # Find similar method names
            similar = [m for m in entity_methods.keys()
                      if m.lower().startswith(call.method[:3].lower())]

            error = ValidationError(
                severity="error",
                line_number=call.line_number,
                context=call.raw_text,
                message=f"Method '{call.method}' does not exist for entity '{call.entity}'",
                suggestion=f"Did you mean: {', '.join(similar[:3])}?" if similar
                          else f"Available methods: {', '.join(list(entity_methods.keys())[:5])}"
            )
            errors.append(error)
            return errors

        # Validate parameter structure
        method_info = entity_methods[call.method]
        if call.parameters:
            params = call.parameters.strip()

            # Check for proper parameter structure
            if method_info['has_query'] and 'query:' not in params and method_info['http_method'] == 'GET':
                error = ValidationError(
                    severity="warning",
                    line_number=call.line_number,
                    context=call.raw_text,
                    message=f"GET method '{call.method}' expects query parameters",
                    suggestion=f"Use: apiClient.{call.entity}.{call.method}({{ query: {{ ... }} }})"
                )
                errors.append(error)

            if method_info['has_body'] and 'body:' not in params and method_info['http_method'] in ['POST', 'PUT', 'PATCH']:
                error = ValidationError(
                    severity="warning",
                    line_number=call.line_number,
                    context=call.raw_text,
                    message=f"{method_info['http_method']} method '{call.method}' expects body parameter",
                    suggestion=f"Use: apiClient.{call.entity}.{call.method}({{ body: data }})"
                )
                errors.append(error)

            if method_info['has_path_params'] and 'params:' not in params and 'pathParams:' not in params:
                error = ValidationError(
                    severity="warning",
                    line_number=call.line_number,
                    context=call.raw_text,
                    message=f"Method '{call.method}' expects path parameters",
                    suggestion=f"Use: apiClient.{call.entity}.{call.method}({{ params: {{ id: value }} }})"
                )
                errors.append(error)

        return errors

    def check_contract_coverage(self) -> List[ValidationError]:
        """Check if all contract methods are used in the FIS.

        Returns:
            List of warnings for unused contract methods
        """
        warnings = []

        # Track which methods are used
        used_methods = set()
        api_calls = self.extract_api_calls()
        for call in api_calls:
            used_methods.add(f"{call.entity}.{call.method}")

        # Find unused methods
        for entity, methods in self.contracts.items():
            for method in methods:
                full_method = f"{entity}.{method}"
                if full_method not in used_methods:
                    warning = ValidationError(
                        severity="info",
                        line_number=None,
                        context=f"Contract method: {full_method}",
                        message=f"Contract method '{method}' in entity '{entity}' is not used in the FIS",
                        suggestion="Consider if this functionality should be exposed in the UI"
                    )
                    warnings.append(warning)

        return warnings

    def validate(self) -> Tuple[bool, List[ValidationError], Dict[str, Any]]:
        """Run full validation on the FIS.

        Returns:
            Tuple of (is_valid, errors, statistics)
        """
        # Load FIS
        if not self.load_fis():
            return False, [ValidationError(
                severity="error",
                line_number=None,
                context="File loading",
                message=f"Failed to load FIS from {self.fis_path}"
            )], {}

        # Parse contracts
        self.parse_contracts()
        if not self.contracts:
            return False, [ValidationError(
                severity="error",
                line_number=None,
                context="Contract parsing",
                message="No contracts found in contracts directory"
            )], {}

        # Extract and validate API calls
        api_calls = self.extract_api_calls()
        all_errors = []

        for call in api_calls:
            errors = self.validate_api_call(call)
            all_errors.extend(errors)

        # Check contract coverage
        coverage_warnings = self.check_contract_coverage()
        all_errors.extend(coverage_warnings)

        # Calculate statistics
        stats = {
            'total_api_calls': len(api_calls),
            'unique_entities': len(set(c.entity for c in api_calls)),
            'unique_methods': len(set(f"{c.entity}.{c.method}" for c in api_calls)),
            'total_contract_methods': sum(len(methods) for methods in self.contracts.values()),
            'errors': len([e for e in all_errors if e.severity == "error"]),
            'warnings': len([e for e in all_errors if e.severity == "warning"]),
            'info': len([e for e in all_errors if e.severity == "info"])
        }

        # Calculate coverage percentage
        if stats['total_contract_methods'] > 0:
            stats['coverage_percentage'] = (stats['unique_methods'] / stats['total_contract_methods']) * 100
        else:
            stats['coverage_percentage'] = 0

        # Determine if valid (no errors)
        is_valid = stats['errors'] == 0

        return is_valid, all_errors, stats

    def generate_report(self) -> str:
        """Generate a validation report.

        Returns:
            Formatted validation report
        """
        is_valid, errors, stats = self.validate()

        report = ["# FIS Validation Report\n"]

        # Summary
        status = "✅ VALID" if is_valid else "❌ INVALID"
        report.append(f"## Status: {status}\n")

        # Statistics
        report.append("## Statistics\n")
        report.append(f"- Total API calls: {stats['total_api_calls']}\n")
        report.append(f"- Unique entities used: {stats['unique_entities']}\n")
        report.append(f"- Unique methods used: {stats['unique_methods']}\n")
        report.append(f"- Total contract methods: {stats['total_contract_methods']}\n")
        report.append(f"- Coverage: {stats['coverage_percentage']:.1f}%\n")
        report.append(f"- Errors: {stats['errors']}\n")
        report.append(f"- Warnings: {stats['warnings']}\n")
        report.append(f"- Info: {stats['info']}\n")

        # Errors by severity
        if errors:
            report.append("\n## Issues Found\n")

            # Group by severity
            for severity in ["error", "warning", "info"]:
                severity_errors = [e for e in errors if e.severity == severity]
                if severity_errors:
                    report.append(f"\n### {severity.upper()}S\n")
                    for error in severity_errors:
                        if error.line_number:
                            report.append(f"- **Line {error.line_number}**: {error.message}\n")
                        else:
                            report.append(f"- {error.message}\n")

                        if error.context:
                            report.append(f"  - Context: `{error.context}`\n")

                        if error.suggestion:
                            report.append(f"  - Suggestion: {error.suggestion}\n")

        else:
            report.append("\n## No Issues Found\n")
            report.append("The FIS correctly uses all API contracts.\n")

        return "".join(report)


def main():
    """CLI entry point."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Validate Frontend Interaction Specification against contracts"
    )
    parser.add_argument(
        "fis_path",
        help="Path to FIS markdown file"
    )
    parser.add_argument(
        "contracts_dir",
        help="Path to shared/contracts directory"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output as JSON instead of markdown report"
    )

    args = parser.parse_args()

    validator = FISValidator(
        contracts_dir=Path(args.contracts_dir),
        fis_path=Path(args.fis_path)
    )

    if args.json:
        is_valid, errors, stats = validator.validate()
        output = {
            "is_valid": is_valid,
            "statistics": stats,
            "errors": [
                {
                    "severity": e.severity,
                    "line_number": e.line_number,
                    "message": e.message,
                    "context": e.context,
                    "suggestion": e.suggestion
                }
                for e in errors
            ]
        }
        print(json.dumps(output, indent=2))
    else:
        report = validator.generate_report()
        print(report)

    # Exit with error code if invalid
    is_valid, _, _ = validator.validate()
    return 0 if is_valid else 1


if __name__ == "__main__":
    import sys
    sys.exit(main())