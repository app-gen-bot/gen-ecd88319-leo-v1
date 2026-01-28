#!/usr/bin/env python3
"""
Integration test: Verify single DATABASE_URL works for both migrations and runtime.

This test:
1. Creates a Supabase project via MCP tool
2. Verifies the DATABASE_URL format (pooled, port 6543)
3. Runs drizzle-kit push to test migrations
4. Runs a simple query to test runtime connections

Prerequisites:
- Supabase CLI installed and authenticated (`supabase login`)
- Node.js and npm installed

Usage:
    uv run python tests/test-supabase-single-url.py
"""

import asyncio
import json
import os
import subprocess
import sys
import tempfile
import shutil
from pathlib import Path


class TestSupabaseSingleURL:
    def __init__(self):
        self.test_dir = None
        self.project_ref = None
        self.database_url = None
        self.results = []

    def log(self, msg: str, status: str = "INFO"):
        icons = {"PASS": "✅", "FAIL": "❌", "INFO": "ℹ️", "WARN": "⚠️"}
        print(f"{icons.get(status, '•')} {msg}")
        if status in ["PASS", "FAIL"]:
            self.results.append((msg, status == "PASS"))

    async def setup_test_directory(self):
        """Create a temporary test directory with minimal Drizzle setup."""
        self.test_dir = Path(tempfile.mkdtemp(prefix="supabase-url-test-"))
        self.log(f"Created test directory: {self.test_dir}")

        # Create package.json
        package_json = {
            "name": "supabase-url-test",
            "type": "module",
            "scripts": {
                "db:push": "drizzle-kit push"
            },
            "dependencies": {
                "drizzle-orm": "^0.38.0",
                "postgres": "^3.4.5"
            },
            "devDependencies": {
                "drizzle-kit": "^0.30.0",
                "tsx": "^4.21.0"
            }
        }
        (self.test_dir / "package.json").write_text(json.dumps(package_json, indent=2))

        # Create shared/schema.ts
        (self.test_dir / "shared").mkdir()
        schema_ts = '''
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const testItems = pgTable('test_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
'''
        (self.test_dir / "shared" / "schema.ts").write_text(schema_ts)

        # Create drizzle.config.ts
        drizzle_config = '''
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './shared/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
'''
        (self.test_dir / "drizzle.config.ts").write_text(drizzle_config)

        # Create test-query.ts for runtime test
        test_query = '''
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const client = postgres(connectionString, {
  ssl: 'require',
  prepare: false,  // REQUIRED for Supabase transaction pooler
});

async function testQuery() {
  try {
    // Test 1: Simple SELECT
    const result = await client`SELECT 1 as test`;
    console.log('SELECT 1 result:', result);

    // Test 2: Insert into test_items
    const inserted = await client`
      INSERT INTO test_items (name)
      VALUES ('test-item-' || ${Date.now()})
      RETURNING *
    `;
    console.log('INSERT result:', inserted);

    // Test 3: Select from test_items
    const items = await client`SELECT * FROM test_items LIMIT 5`;
    console.log('SELECT items:', items);

    console.log('\\n✅ All runtime queries successful!');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Query failed:', error.message);
    await client.end();
    process.exit(1);
  }
}

testQuery();
'''
        (self.test_dir / "test-query.ts").write_text(test_query)

        # Install dependencies
        self.log("Installing npm dependencies...")
        result = subprocess.run(
            ["npm", "install"],
            cwd=self.test_dir,
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            self.log(f"npm install failed: {result.stderr}", "FAIL")
            return False

        self.log("Test directory setup complete")
        return True

    async def create_supabase_project(self):
        """Create Supabase project using the MCP tool approach (simulated via CLI)."""
        self.log("Creating Supabase project...")

        # Get organization
        result = subprocess.run(
            ["supabase", "orgs", "list", "-o", "json"],
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            self.log(f"Failed to list orgs: {result.stderr}", "FAIL")
            return False

        orgs = json.loads(result.stdout)
        if not orgs:
            self.log("No Supabase organizations found", "FAIL")
            return False

        org_id = orgs[0]["id"]
        self.log(f"Using org: {org_id}")

        # Generate password
        import secrets
        import string
        password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(24))

        # Create project
        project_name = f"url-test-{secrets.token_hex(4)}"
        result = subprocess.run(
            ["supabase", "projects", "create", project_name,
             "--org-id", org_id,
             "--db-password", password,
             "--region", "us-east-1",
             "-o", "json"],
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            self.log(f"Failed to create project: {result.stderr}", "FAIL")
            return False

        project_data = json.loads(result.stdout)
        self.project_ref = project_data["id"]
        self.log(f"Created project: {self.project_ref}")

        # Detect pooler variant with retries
        import urllib.parse
        encoded_password = urllib.parse.quote(password, safe='')

        # Try up to 4 times with increasing wait
        for attempt in range(4):
            wait_time = 45 + (attempt * 20)  # 45s, 65s, 85s, 105s
            self.log(f"Attempt {attempt + 1}/4: Waiting {wait_time}s for project startup...")
            await asyncio.sleep(wait_time)

            for variant in ["aws-1", "aws-0"]:  # Try aws-1 first (more common)
                test_url = f"postgresql://postgres.{self.project_ref}:{encoded_password}@{variant}-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
                self.log(f"  Testing {variant}...")
                try:
                    result = subprocess.run(
                        ["psql", test_url, "-c", "SELECT 1"],
                        capture_output=True,
                        text=True,
                        timeout=20
                    )
                    if result.returncode == 0:
                        # Use URL without sslmode for the app (ssl is set in code)
                        self.database_url = f"postgresql://postgres.{self.project_ref}:{encoded_password}@{variant}-us-east-1.pooler.supabase.com:6543/postgres"
                        self.log(f"Pooler variant detected: {variant}")
                        break
                    else:
                        # Show more of the error
                        err = result.stderr.strip().replace('\n', ' ')
                        self.log(f"    {variant}: {err[:200]}", "WARN")
                except subprocess.TimeoutExpired:
                    self.log(f"    {variant} timed out", "WARN")
                except Exception as e:
                    self.log(f"    {variant} error: {e}", "WARN")

            if self.database_url:
                break

        if not self.database_url:
            self.log("Failed to detect pooler variant after 4 attempts", "FAIL")
            self.log(f"Project ref: {self.project_ref}", "INFO")
            return False

        # Write .env
        (self.test_dir / ".env").write_text(f"DATABASE_URL={self.database_url}\n")
        self.log("Wrote .env with DATABASE_URL")

        return True

    def verify_url_format(self):
        """Verify DATABASE_URL is in correct pooled format."""
        self.log("Verifying DATABASE_URL format...")

        if not self.database_url:
            self.log("DATABASE_URL not set", "FAIL")
            return False

        # Check format
        checks = [
            ("starts with postgresql://", self.database_url.startswith("postgresql://")),
            ("has postgres.{ref} username", f"postgres.{self.project_ref}" in self.database_url),
            ("uses pooler.supabase.com", "pooler.supabase.com" in self.database_url),
            ("uses port 6543", ":6543/" in self.database_url),
            ("no ?pgbouncer=true", "pgbouncer=true" not in self.database_url),
        ]

        all_passed = True
        for check_name, passed in checks:
            status = "PASS" if passed else "FAIL"
            self.log(f"  {check_name}", status)
            if not passed:
                all_passed = False

        return all_passed

    async def test_migrations(self):
        """Test that drizzle-kit push works with pooled URL."""
        self.log("Testing migrations (drizzle-kit push)...")

        env = os.environ.copy()
        env["DATABASE_URL"] = self.database_url

        result = subprocess.run(
            ["npm", "run", "db:push"],
            cwd=self.test_dir,
            capture_output=True,
            text=True,
            env=env
        )

        if result.returncode == 0:
            self.log("drizzle-kit push succeeded", "PASS")
            return True
        else:
            self.log(f"drizzle-kit push failed: {result.stderr}", "FAIL")
            return False

    async def test_runtime_queries(self):
        """Test that runtime queries work with prepare: false."""
        self.log("Testing runtime queries...")

        env = os.environ.copy()
        env["DATABASE_URL"] = self.database_url

        result = subprocess.run(
            ["npx", "tsx", "test-query.ts"],
            cwd=self.test_dir,
            capture_output=True,
            text=True,
            env=env
        )

        if result.returncode == 0:
            self.log("Runtime queries succeeded", "PASS")
            print(result.stdout)
            return True
        else:
            self.log(f"Runtime queries failed: {result.stderr}", "FAIL")
            return False

    async def cleanup(self):
        """Delete Supabase project and temp directory."""
        self.log("Cleaning up...")

        if self.project_ref:
            # Note: supabase projects delete requires confirmation, skip for now
            self.log(f"Project {self.project_ref} created - delete manually if needed", "WARN")

        if self.test_dir and self.test_dir.exists():
            shutil.rmtree(self.test_dir)
            self.log(f"Deleted test directory")

    def print_summary(self):
        """Print test summary."""
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)

        passed = sum(1 for _, p in self.results if p)
        failed = sum(1 for _, p in self.results if not p)

        for msg, success in self.results:
            icon = "✅" if success else "❌"
            print(f"  {icon} {msg}")

        print("-" * 60)
        print(f"  Passed: {passed}, Failed: {failed}")
        print("=" * 60)

        return failed == 0


async def main():
    test = TestSupabaseSingleURL()

    try:
        # Setup
        if not await test.setup_test_directory():
            return 1

        # Create project
        if not await test.create_supabase_project():
            return 1

        # Verify URL format
        test.verify_url_format()

        # Test migrations
        await test.test_migrations()

        # Test runtime
        await test.test_runtime_queries()

    except KeyboardInterrupt:
        print("\nInterrupted")
    except Exception as e:
        test.log(f"Unexpected error: {e}", "FAIL")
    finally:
        await test.cleanup()

    success = test.print_summary()
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
