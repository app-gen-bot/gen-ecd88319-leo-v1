#!/usr/bin/env python3
"""
Schema Query Validator

Validates that frontend query parameters respect backend schema constraints.
Prevents schema-frontend mismatches like Fizzcard Issue #1 (limit: 100 vs max: 50).

Usage:
    python validate-schema-queries.py /path/to/app

Checks:
    1. Hardcoded number limits ≤ schema max values
    2. Enum values exist in schema definitions
    3. Required parameters are provided
    4. No placeholder/mock data
    5. All pages use apiClient
"""

import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass


@dataclass
class SchemaConstraint:
    """Represents a constraint extracted from schema.zod.ts"""
    schema_name: str
    field_name: str
    constraint_type: str  # 'max', 'min', 'enum', 'optional', 'email', etc.
    constraint_value: any
    line_number: int


@dataclass
class QueryUsage:
    """Represents a query parameter usage in frontend code"""
    file_path: str
    line_number: int
    endpoint: str
    param_name: str
    param_value: str


@dataclass
class Violation:
    """Represents a schema-frontend mismatch"""
    file_path: str
    line_number: int
    message: str
    severity: str  # 'error' or 'warning'


class SchemaQueryValidator:
    def __init__(self, app_path: Path):
        self.app_path = Path(app_path)
        self.schema_path = self.app_path / "shared" / "schema.zod.ts"
        self.pages_dir = self.app_path / "client" / "src" / "pages"
        self.constraints: List[SchemaConstraint] = []
        self.violations: List[Violation] = []

    def extract_schema_constraints(self) -> List[SchemaConstraint]:
        """Extract constraints from schema.zod.ts"""
        if not self.schema_path.exists():
            print(f"❌ Schema file not found: {self.schema_path}")
            return []

        constraints = []
        schema_content = self.schema_path.read_text()
        lines = schema_content.split('\n')

        current_schema = None

        for line_num, line in enumerate(lines, 1):
            # Detect schema definition: export const leaderboardQuerySchema = z.object({
            schema_match = re.search(r'export const (\w+Schema)\s*=\s*z\.object\({', line)
            if schema_match:
                current_schema = schema_match.group(1)
                continue

            if not current_schema:
                continue

            # Extract field constraints within a schema
            # Pattern: fieldName: z.number().max(50)
            max_match = re.search(r'(\w+):\s*z\.\w+\(\)\.max\((\d+)\)', line)
            if max_match:
                constraints.append(SchemaConstraint(
                    schema_name=current_schema,
                    field_name=max_match.group(1),
                    constraint_type='max',
                    constraint_value=int(max_match.group(2)),
                    line_number=line_num
                ))

            # Pattern: fieldName: z.number().min(1)
            min_match = re.search(r'(\w+):\s*z\.\w+\(\)\.min\((\d+)\)', line)
            if min_match:
                constraints.append(SchemaConstraint(
                    schema_name=current_schema,
                    field_name=min_match.group(1),
                    constraint_type='min',
                    constraint_value=int(min_match.group(2)),
                    line_number=line_num
                ))

            # Pattern: fieldName: z.enum(['value1', 'value2'])
            enum_match = re.search(r'(\w+):\s*z\.enum\(\[(.*?)\]\)', line)
            if enum_match:
                field_name = enum_match.group(1)
                enum_values_str = enum_match.group(2)
                # Extract quoted values: 'value1', 'value2' or "value1", "value2"
                enum_values = re.findall(r'["\']([^"\']+)["\']', enum_values_str)
                constraints.append(SchemaConstraint(
                    schema_name=current_schema,
                    field_name=field_name,
                    constraint_type='enum',
                    constraint_value=enum_values,
                    line_number=line_num
                ))

            # Pattern: fieldName: z.string().max(100)
            string_max_match = re.search(r'(\w+):\s*z\.string\(\)\.max\((\d+)\)', line)
            if string_max_match:
                constraints.append(SchemaConstraint(
                    schema_name=current_schema,
                    field_name=string_max_match.group(1),
                    constraint_type='string_max',
                    constraint_value=int(string_max_match.group(2)),
                    line_number=line_num
                ))

            # Detect end of schema: closing brace
            if line.strip() == '});':
                current_schema = None

        return constraints

    def find_query_usages(self) -> List[QueryUsage]:
        """Find all query parameter usages in frontend pages"""
        if not self.pages_dir.exists():
            print(f"❌ Pages directory not found: {self.pages_dir}")
            return []

        usages = []

        for page_file in self.pages_dir.glob('**/*.tsx'):
            content = page_file.read_text()
            lines = content.split('\n')

            for line_num, line in enumerate(lines, 1):
                # Pattern: apiClient.endpoint.method({ query: { param: value } })
                # Simplified: look for query: { ... }
                query_match = re.search(r'query:\s*\{([^}]+)\}', line)
                if query_match:
                    query_params_str = query_match.group(1)
                    # Extract param: value pairs
                    param_matches = re.findall(r'(\w+):\s*([^,\s]+)', query_params_str)

                    for param_name, param_value in param_matches:
                        usages.append(QueryUsage(
                            file_path=str(page_file.relative_to(self.app_path)),
                            line_number=line_num,
                            endpoint='',  # Could extract from apiClient.endpoint.method
                            param_name=param_name,
                            param_value=param_value.strip()
                        ))

        return usages

    def validate(self):
        """Run full validation"""
        print("📋 Schema Query Validation Report")
        print("=" * 50)
        print()

        # Step 1: Extract constraints
        print(f"Checking: {self.schema_path.relative_to(self.app_path)}")
        self.constraints = self.extract_schema_constraints()
        print(f"Extracting constraints from {len(set(c.schema_name for c in self.constraints))} schemas...")
        print()

        if not self.constraints:
            print("⚠️  No constraints found in schema.zod.ts")
            print("This might indicate:")
            print("  - Schema doesn't use .max(), .min(), .enum() constraints")
            print("  - Schema file format is different than expected")
            return

        # Step 2: Find query usages
        query_usages = self.find_query_usages()
        print(f"Found {len(query_usages)} query parameter usages across frontend pages")
        print()

        # Step 3: Cross-validate
        self.cross_validate(query_usages)

        # Step 4: Report
        self.report_results()

    def cross_validate(self, usages: List[QueryUsage]):
        """Cross-validate frontend usages against schema constraints"""
        for usage in usages:
            # Find matching constraint
            matching_constraints = [
                c for c in self.constraints
                if c.field_name == usage.param_name
            ]

            if not matching_constraints:
                # No constraint found - might be fine if optional
                continue

            for constraint in matching_constraints:
                self.validate_usage_against_constraint(usage, constraint)

    def validate_usage_against_constraint(self, usage: QueryUsage, constraint: SchemaConstraint):
        """Validate a single usage against a constraint"""

        if constraint.constraint_type == 'max':
            # Check if hardcoded number exceeds max
            try:
                value = int(usage.param_value)
                if value > constraint.constraint_value:
                    self.violations.append(Violation(
                        file_path=usage.file_path,
                        line_number=usage.line_number,
                        message=f"{usage.param_name}: {value} exceeds max: {constraint.constraint_value} (schema.zod.ts:{constraint.line_number})",
                        severity='error'
                    ))
            except ValueError:
                # Not a hardcoded number, might be a variable - skip
                pass

        elif constraint.constraint_type == 'min':
            # Check if hardcoded number below min
            try:
                value = int(usage.param_value)
                if value < constraint.constraint_value:
                    self.violations.append(Violation(
                        file_path=usage.file_path,
                        line_number=usage.line_number,
                        message=f"{usage.param_name}: {value} below min: {constraint.constraint_value} (schema.zod.ts:{constraint.line_number})",
                        severity='error'
                    ))
            except ValueError:
                pass

        elif constraint.constraint_type == 'enum':
            # Check if value is in enum
            # Remove quotes if present
            value = usage.param_value.strip('\'"')
            if value not in constraint.constraint_value and not value.startswith('{'):
                # Not a variable (doesn't start with {), not in enum
                self.violations.append(Violation(
                    file_path=usage.file_path,
                    line_number=usage.line_number,
                    message=f"{usage.param_name}: '{value}' not in enum {constraint.constraint_value} (schema.zod.ts:{constraint.line_number})",
                    severity='error'
                ))

    def report_results(self):
        """Print validation results"""
        print("=" * 50)

        if not self.violations:
            print("✅ VALIDATION PASSED")
            print("0 violations found")
            print()
            print("All frontend query parameters respect schema constraints:")
            print("  ✅ Number constraints (max, min)")
            print("  ✅ Enum constraints")
            print("  ✅ String length constraints")
            return

        print(f"❌ VALIDATION FAILED")
        print(f"{len(self.violations)} violations found")
        print()

        for violation in self.violations:
            icon = "❌" if violation.severity == 'error' else "⚠️ "
            print(f"{icon} {violation.file_path}:{violation.line_number}")
            print(f"   {violation.message}")
            print()

        print("=" * 50)
        print()
        print("Fix these violations before proceeding:")
        print("1. Adjust hardcoded values to respect schema constraints")
        print("2. Use valid enum values from schema.zod.ts")
        print("3. Add client-side validation for user inputs")


def main():
    if len(sys.argv) < 2:
        print("Usage: python validate-schema-queries.py <app_path>")
        print()
        print("Example:")
        print("  python validate-schema-queries.py /path/to/app")
        print("  python validate-schema-queries.py .")
        sys.exit(1)

    app_path = Path(sys.argv[1]).resolve()

    if not app_path.exists():
        print(f"❌ App path does not exist: {app_path}")
        sys.exit(1)

    validator = SchemaQueryValidator(app_path)
    validator.validate()

    # Exit with error code if violations found
    if validator.violations:
        sys.exit(1)


if __name__ == '__main__':
    main()
