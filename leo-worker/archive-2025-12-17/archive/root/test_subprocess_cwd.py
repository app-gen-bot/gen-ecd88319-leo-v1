#!/usr/bin/env python3
"""Test to verify subprocess.Popen behavior with non-existent cwd"""

import subprocess
import tempfile
import os

print("Testing subprocess.Popen behavior with different scenarios:\n")

# Test 1: Valid command with valid cwd
print("1. Valid command with valid cwd:")
try:
    result = subprocess.run(['echo', 'hello'], cwd='/tmp', capture_output=True, text=True)
    print(f"   ✅ Success: {result.stdout.strip()}")
except Exception as e:
    print(f"   ❌ Error: {type(e).__name__}: {e}")

# Test 2: Valid command with non-existent cwd
print("\n2. Valid command with non-existent cwd:")
try:
    result = subprocess.run(['echo', 'hello'], cwd='/non/existent/directory', capture_output=True, text=True)
    print(f"   ✅ Success: {result.stdout.strip()}")
except Exception as e:
    print(f"   ❌ Error: {type(e).__name__}: {e}")
    print(f"   Error details: errno={e.errno}, filename='{e.filename}'")

# Test 3: Non-existent command with valid cwd
print("\n3. Non-existent command with valid cwd:")
try:
    result = subprocess.run(['nonexistent_command_xyz'], cwd='/tmp', capture_output=True, text=True)
    print(f"   ✅ Success: {result.stdout.strip()}")
except Exception as e:
    print(f"   ❌ Error: {type(e).__name__}: {e}")
    print(f"   Error details: errno={e.errno}, filename='{e.filename}'")

# Test 4: Verify claude exists
print("\n4. Checking if claude exists:")
try:
    result = subprocess.run(['which', 'claude'], capture_output=True, text=True)
    if result.returncode == 0:
        print(f"   ✅ Claude found at: {result.stdout.strip()}")
    else:
        print("   ❌ Claude not found in PATH")
except Exception as e:
    print(f"   ❌ Error: {type(e).__name__}: {e}")

# Test 5: Recreate the exact error scenario
print("\n5. Recreating the exact error scenario:")
test_dir = "/tmp/test_nonexistent_dir_xyz"
if os.path.exists(test_dir):
    os.rmdir(test_dir)

try:
    # This should fail with FileNotFoundError because cwd doesn't exist
    result = subprocess.run(['claude', '--version'], cwd=test_dir, capture_output=True, text=True)
    print(f"   ✅ Success: {result.stdout.strip()}")
except FileNotFoundError as e:
    print(f"   ❌ Error: {type(e).__name__}: {e}")
    print(f"   Error details: errno={e.errno}, filename='{e.filename}'")
    print(f"   Note: The error is about the cwd, not the claude binary!")