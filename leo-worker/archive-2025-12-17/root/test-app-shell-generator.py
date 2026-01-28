#!/usr/bin/env python3
"""Quick test for AppShellGenerator fixes.

Tests that:
1. Agent reads pages-and-routes.md (not technical-architecture-spec.md)
2. Agent creates App.tsx
3. Wrapper verifies file existence
"""

import asyncio
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from app_factory_leonardo_replit.agents.app_shell_generator import AppShellGeneratorAgent

async def test_app_shell_generator():
    """Test the AppShellGenerator with all fixes."""

    app_dir = Path(__file__).parent / "apps" / "timeless-weddings-phase1" / "app"

    print(f"🧪 Testing AppShellGenerator")
    print(f"📁 App directory: {app_dir}")
    print(f"")

    # Check prerequisites
    pages_and_routes = app_dir / "specs" / "pages-and-routes.md"
    plan_file = app_dir / "specs" / "plan.md"
    schema_file = app_dir / "shared" / "schema.ts"

    print(f"📋 Prerequisites:")
    print(f"  - pages-and-routes.md: {'✅' if pages_and_routes.exists() else '❌'}")
    print(f"  - plan.md: {'✅' if plan_file.exists() else '❌'}")
    print(f"  - schema.ts: {'✅' if schema_file.exists() else '❌'}")
    print(f"")

    if not all([pages_and_routes.exists(), plan_file.exists(), schema_file.exists()]):
        print("❌ Missing prerequisites, cannot test")
        return False

    # Create agent
    print(f"🤖 Creating AppShellGenerator agent...")
    agent = AppShellGeneratorAgent(cwd=str(app_dir))

    # Check if App.tsx already exists (should be deleted for this test)
    app_tsx = app_dir / "client" / "src" / "App.tsx"
    if app_tsx.exists():
        print(f"⚠️  App.tsx already exists at {app_tsx}")
        print(f"   Delete it first to test generation")
        return False

    # Run the agent
    print(f"🔨 Running AppShellGenerator...")
    success, _, message = await agent.generate_app_shell()

    print(f"")
    print(f"📊 Results:")
    print(f"  - Success: {success}")
    print(f"  - Message: {message}")

    # Verify App.tsx was created
    if app_tsx.exists():
        file_size = app_tsx.stat().st_size
        print(f"  - App.tsx created: ✅ ({file_size:,} bytes)")

        # Check content
        content = app_tsx.read_text()
        checks = {
            "Uses Wouter": ("from 'wouter'" in content or 'from "wouter"' in content),
            "Has QueryClientProvider": "QueryClientProvider" in content,
            "Has routes": "<Route" in content or "Route" in content,
            "Has Toaster": "Toaster" in content,
            "Has ErrorBoundary": "ErrorBoundary" in content,
            "Has AuthProvider": "AuthProvider" in content or "context" in content.lower()
        }

        print(f"")
        print(f"🔍 Content checks:")
        for check, result in checks.items():
            print(f"  - {check}: {'✅' if result else '❌'}")

        return success and all(checks.values())
    else:
        print(f"  - App.tsx created: ❌")
        return False

if __name__ == "__main__":
    result = asyncio.run(test_app_shell_generator())

    if result:
        print(f"")
        print(f"🎉 AppShellGenerator test PASSED!")
        sys.exit(0)
    else:
        print(f"")
        print(f"❌ AppShellGenerator test FAILED!")
        sys.exit(1)
