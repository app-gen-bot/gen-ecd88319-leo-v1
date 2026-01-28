#!/usr/bin/env python3
"""
Factory Lazy Initialization Validator

Detects eager factory initialization patterns that cause environment variable bugs.
Prevents Fizzcard Issue #3 (factory always used memory despite STORAGE_MODE=database).

Usage:
    python validate-lazy-init.py /path/to/app

Checks:
    1. No eager factory initialization (export const x = createFactory())
    2. Lazy Proxy pattern is used
    3. Instance variables are nullable
    4. Environment variables read inside functions (not at module level)
"""

import re
import sys
from pathlib import Path
from typing import List, Dict
from dataclasses import dataclass


@dataclass
class Violation:
    """Represents an eager initialization violation"""
    file_path: str
    line_number: int
    pattern: str
    message: str
    severity: str  # 'error' or 'warning'


class LazyInitValidator:
    def __init__(self, app_path: Path):
        self.app_path = Path(app_path)
        self.factory_files = [
            self.app_path / "server" / "lib" / "auth" / "factory.ts",
            self.app_path / "server" / "lib" / "storage" / "factory.ts",
        ]
        self.violations: List[Violation] = []

    def validate(self):
        """Run full validation"""
        print("🔧 Factory Lazy Initialization Validation")
        print("=" * 50)
        print()

        for factory_file in self.factory_files:
            if not factory_file.exists():
                print(f"⚠️  Factory file not found: {factory_file.relative_to(self.app_path)}")
                print("   Skipping...")
                print()
                continue

            print(f"Checking: {factory_file.relative_to(self.app_path)}")
            self.validate_factory_file(factory_file)
            print()

        self.report_results()

    def validate_factory_file(self, file_path: Path):
        """Validate a single factory file"""
        content = file_path.read_text()
        lines = content.split('\n')

        for line_num, line in enumerate(lines, 1):
            # Check 1: Eager initialization pattern
            self.check_eager_initialization(file_path, line_num, line)

            # Check 2: Module-level env var reads
            self.check_module_level_env_reads(file_path, line_num, line)

        # Check 3: Proxy pattern used
        self.check_proxy_pattern_exists(file_path, content)

        # Check 4: Instance variable is nullable
        self.check_nullable_instance(file_path, content)

    def check_eager_initialization(self, file_path: Path, line_num: int, line: str):
        """Check for eager factory initialization"""
        # Pattern: export const storage = createStorage()
        eager_pattern = re.search(r'export\s+const\s+(\w+)\s*=\s*create\w+\(\)', line)
        if eager_pattern:
            var_name = eager_pattern.group(1)
            self.violations.append(Violation(
                file_path=str(file_path.relative_to(self.app_path)),
                line_number=line_num,
                pattern='eager_init',
                message=f"Eager initialization detected: export const {var_name} = create...()  "
                        f"This executes immediately, before dotenv loads. Use lazy Proxy pattern instead.",
                severity='error'
            ))

    def check_module_level_env_reads(self, file_path: Path, line_num: int, line: str):
        """Check for environment variable reads at module level"""
        # Skip if inside a function
        if line.strip().startswith('function ') or line.strip().startswith('const ') and '{' not in line:
            return

        # Pattern: const MODE = process.env.STORAGE_MODE
        env_read = re.search(r'(const|let|var)\s+\w+\s*=\s*process\.env\.\w+', line)
        if env_read and 'function' not in line:
            # Check if this is inside a function by looking for indentation
            # This is a simple heuristic - in practice, would need proper AST parsing
            if not line.startswith('  '):
                self.violations.append(Violation(
                    file_path=str(file_path.relative_to(self.app_path)),
                    line_number=line_num,
                    pattern='module_level_env',
                    message=f"Environment variable read at module level. "
                            f"Move inside factory function to ensure dotenv has loaded.",
                    severity='error'
                ))

    def check_proxy_pattern_exists(self, file_path: Path, content: str):
        """Check if Proxy pattern is used"""
        # Look for: new Proxy(
        if 'new Proxy(' not in content:
            self.violations.append(Violation(
                file_path=str(file_path.relative_to(self.app_path)),
                line_number=0,
                pattern='no_proxy',
                message=f"Lazy Proxy pattern not found. Factory should use: "
                        f"export const x = new Proxy(...) to delay initialization.",
                severity='error'
            ))

    def check_nullable_instance(self, file_path: Path, content: str):
        """Check if instance variable is nullable"""
        # Look for: let instance: T | null = null
        nullable_instance = re.search(r'let\s+instance:\s*\w+\s*\|\s*null\s*=\s*null', content)
        if not nullable_instance:
            self.violations.append(Violation(
                file_path=str(file_path.relative_to(self.app_path)),
                line_number=0,
                pattern='non_nullable_instance',
                message=f"Nullable instance variable not found. "
                        f"Should have: let instance: IFactory | null = null",
                severity='warning'
            ))

    def report_results(self):
        """Print validation results"""
        print("=" * 50)

        if not self.violations:
            print("✅ VALIDATION PASSED")
            print()
            print("All factories use lazy initialization:")
            print("  ✅ Lazy Proxy pattern used")
            print("  ✅ No eager initialization detected")
            print("  ✅ Instance variables are nullable")
            print("  ✅ Environment variables read inside functions")
            print()
            print("Factories will initialize AFTER dotenv loads.")
            return

        # Separate errors and warnings
        errors = [v for v in self.violations if v.severity == 'error']
        warnings = [v for v in self.violations if v.severity == 'warning']

        if errors:
            print(f"❌ VALIDATION FAILED")
            print(f"{len(errors)} error(s), {len(warnings)} warning(s) found")
        else:
            print(f"⚠️  VALIDATION PASSED WITH WARNINGS")
            print(f"{len(warnings)} warning(s) found")

        print()

        # Print errors first
        for violation in errors:
            print(f"❌ {violation.file_path}:{violation.line_number if violation.line_number > 0 else ''}")
            print(f"   {violation.message}")
            print()

        # Then warnings
        for violation in warnings:
            print(f"⚠️  {violation.file_path}:{violation.line_number if violation.line_number > 0 else ''}")
            print(f"   {violation.message}")
            print()

        if errors:
            print("=" * 50)
            print()
            print("Fix these errors before proceeding:")
            print()
            print("Use the lazy Proxy pattern:")
            print()
            print("```typescript")
            print("let instance: IStorage | null = null;")
            print()
            print("function createStorage(): IStorage {")
            print("  const mode = process.env.STORAGE_MODE || 'memory';")
            print("  // ... factory logic")
            print("}")
            print()
            print("export const storage = new Proxy({} as IStorage, {")
            print("  get(target, prop) {")
            print("    if (!instance) {")
            print("      instance = createStorage();")
            print("    }")
            print("    return instance[prop as keyof IStorage];")
            print("  }")
            print("}) as IStorage;")
            print("```")
            print()
            print("See: ~/.claude/skills/factory-lazy-init/templates/lazy-factory-correct.ts")


def main():
    if len(sys.argv) < 2:
        print("Usage: python validate-lazy-init.py <app_path>")
        print()
        print("Example:")
        print("  python validate-lazy-init.py /path/to/app")
        print("  python validate-lazy-init.py .")
        sys.exit(1)

    app_path = Path(sys.argv[1]).resolve()

    if not app_path.exists():
        print(f"❌ App path does not exist: {app_path}")
        sys.exit(1)

    validator = LazyInitValidator(app_path)
    validator.validate()

    # Exit with error code if errors found (not warnings)
    errors = [v for v in validator.violations if v.severity == 'error']
    if errors:
        sys.exit(1)


if __name__ == '__main__':
    main()
