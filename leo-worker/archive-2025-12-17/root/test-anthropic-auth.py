#!/usr/bin/env python
"""
Quick test to verify ANTHROPIC_AUTH_TOKEN works correctly.
"""

import os
import sys

# First, let's check if the token is set and formatted correctly
auth_token = os.environ.get('ANTHROPIC_AUTH_TOKEN', '')
api_key = os.environ.get('ANTHROPIC_API_KEY', '')

print("=" * 60)
print("ANTHROPIC TOKEN VERIFICATION")
print("=" * 60)

# Check token environment variables
print("\n📋 Environment Check:")
print(f"  ANTHROPIC_AUTH_TOKEN set: {'✅ YES' if auth_token else '❌ NO'}")
print(f"  ANTHROPIC_API_KEY set: {'⚠️  YES (should be unset)' if api_key else '✅ NO (correct)'}")

if auth_token:
    print(f"\n📏 Token Details:")
    print(f"  Length: {len(auth_token)} characters")
    print(f"  Has line breaks: {'❌ YES (BAD)' if '\n' in auth_token else '✅ NO (good)'}")
    print(f"  Starts with: {auth_token[:20]}...")
    print(f"  Ends with: ...{auth_token[-10:]}")

    # Check for the expected format
    if auth_token.startswith("sk-ant-oat01-") and auth_token.endswith("-gcWDrgAA"):
        print(f"  Format: ✅ Correct OAuth token format")
    else:
        print(f"  Format: ❌ Unexpected token format")
else:
    print("\n❌ ERROR: ANTHROPIC_AUTH_TOKEN not set!")
    print("Please run: source ./fix-anthropic-token.sh")
    sys.exit(1)

# Now test with the SDK
print("\n🧪 Testing with Claude SDK...")

try:
    from anthropic import Anthropic

    # Create client with auth token
    client = Anthropic(
        auth_token=auth_token  # Using OAuth token, not API key
    )

    # Make a simple test request
    print("  Sending test message to Claude...")

    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=100,
        messages=[{
            "role": "user",
            "content": "Say 'API test successful!' if you can read this."
        }]
    )

    print(f"\n✅ SUCCESS! Claude responded:")
    print(f"  \"{response.content[0].text}\"")
    print(f"\n📊 Usage:")
    print(f"  Input tokens: {response.usage.input_tokens}")
    print(f"  Output tokens: {response.usage.output_tokens}")

except ImportError:
    print("❌ anthropic package not installed")
    print("Installing: pip install anthropic")
    import subprocess
    subprocess.run([sys.executable, "-m", "pip", "install", "anthropic"])
    print("\nPlease run this script again after installation.")
    sys.exit(1)

except Exception as e:
    print(f"\n❌ API Error: {e}")
    print("\nTroubleshooting:")
    print("1. Make sure you ran: source ./fix-anthropic-token.sh")
    print("2. Check that the token is valid and not expired")
    print("3. Ensure you're connected to the internet")
    sys.exit(1)

print("\n" + "=" * 60)
print("✅ All checks passed! The token is working correctly.")
print("=" * 60)