#!/usr/bin/env python3
"""
Validate that all routes follow consistent patterns.
This prevents the /api routing confusion that causes 404 errors.

Usage:
    python scripts/validate-routing-consistency.py apps/my-app/app
"""

import re
import sys
from pathlib import Path


def check_contracts_for_api_prefix(contracts_dir: Path) -> list[str]:
    """Ensure no contract has /api in path."""
    errors = []
    if not contracts_dir.exists():
        return ["contracts directory not found"]

    for file in contracts_dir.glob("*.contract.ts"):
        content = file.read_text()
        if re.search(r"path:\s*['\"]\/api", content):
            errors.append(f"{file.name}: Contains /api prefix in contract path")
    return errors


def check_auth_routes_consistency(auth_file: Path) -> list[str]:
    """Ensure auth routes don't hardcode /api."""
    if not auth_file.exists():
        return ["auth routes file not found"]

    content = auth_file.read_text()
    errors = []

    # Check for hardcoded /api in route definitions
    matches = re.findall(r"router\.(post|get|put|delete)\(['\"]([^'\"]+)", content)
    for method, path in matches:
        if path.startswith('/api'):
            errors.append(f"Auth route {method.upper()} '{path}' contains hardcoded /api prefix")

    return errors


def check_server_mounting(server_file: Path) -> list[str]:
    """Ensure routes are properly mounted at /api."""
    if not server_file.exists():
        return ["server/index.ts not found"]

    content = server_file.read_text()
    errors = []

    # Check for proper mounting pattern
    if not re.search(r"app\.use\(['\"]\/api['\"],\s*authRoutes", content):
        errors.append("Auth routes not mounted at /api")

    if not re.search(r"app\.use\(['\"]\/api['\"],\s*apiRoutes", content):
        errors.append("API routes not mounted at /api")

    # Check for incorrect mounting (without /api)
    if re.search(r"app\.use\(authRoutes\)", content):
        errors.append("Auth routes mounted without /api prefix")

    if re.search(r"app\.use\(apiRoutes\)", content):
        errors.append("API routes mounted without /api prefix")

    return errors


def validate_project(app_dir: str) -> bool:
    """Validate routing consistency in a project."""
    app_path = Path(app_dir)

    if not app_path.exists():
        print(f"❌ Directory not found: {app_dir}")
        return False

    print(f"🔍 Validating routing consistency in: {app_dir}")
    print("-" * 50)

    all_errors = []

    # Check contracts
    print("📝 Checking contract paths...")
    contracts_errors = check_contracts_for_api_prefix(app_path / "shared/contracts")
    if contracts_errors:
        all_errors.extend([f"[Contracts] {e}" for e in contracts_errors])
    else:
        print("  ✓ All contract paths are relative")

    # Check auth routes
    print("🔐 Checking auth routes...")
    auth_errors = check_auth_routes_consistency(app_path / "server/routes/auth.ts")
    if auth_errors:
        all_errors.extend([f"[Auth] {e}" for e in auth_errors])
    else:
        print("  ✓ Auth routes use relative paths")

    # Check server mounting
    print("🚀 Checking server mounting...")
    server_errors = check_server_mounting(app_path / "server/index.ts")
    if server_errors:
        all_errors.extend([f"[Server] {e}" for e in server_errors])
    else:
        print("  ✓ Routes properly mounted at /api")

    print("-" * 50)

    if all_errors:
        print("\n❌ ROUTING CONSISTENCY VIOLATIONS FOUND:\n")
        for error in all_errors:
            print(f"  • {error}")
        print("\n🔧 Fix: Ensure all paths are relative and mounted at /api")
        print("  - Contracts: path: '/users' (no /api)")
        print("  - Auth: router.post('/auth/login', ...) (no /api)")
        print("  - Server: app.use('/api', routes)")
        return False

    print("\n✅ All routes follow consistent patterns!")
    print("  - Contract paths: relative ✓")
    print("  - Auth routes: relative ✓")
    print("  - Server mounting: at /api ✓")
    return True


def main():
    if len(sys.argv) != 2:
        print("Usage: python validate-routing-consistency.py <app-directory>")
        print("Example: python validate-routing-consistency.py apps/my-app/app")
        sys.exit(1)

    app_dir = sys.argv[1]
    success = validate_project(app_dir)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()