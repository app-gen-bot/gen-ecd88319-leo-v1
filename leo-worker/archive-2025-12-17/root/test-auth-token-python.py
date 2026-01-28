#!/usr/bin/env python
"""
Test using auth_token parameter with Python SDK (similar to TypeScript authToken).
"""

import os
import sys

# The token WITHOUT line break (must be continuous)
token = "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"

print("=" * 60)
print("TESTING AUTH TOKEN WITH PYTHON SDK")
print("=" * 60)

print(f"\n📏 Token Details:")
print(f"  Length: {len(token)} characters")
print(f"  No line breaks: {'✅' if '\\n' not in token else '❌'}")
print(f"  Starts with: {token[:20]}...")
print(f"  Ends with: ...{token[-10:]}")

try:
    import anthropic
    from anthropic import Anthropic

    print(f"\n📦 SDK Version: {anthropic.__version__}")

    # Method 1: Set environment variable and use default client
    print("\n🧪 Method 1: Using ANTHROPIC_AUTH_TOKEN env var...")
    os.environ['ANTHROPIC_AUTH_TOKEN'] = token
    # Make sure API key is NOT set
    if 'ANTHROPIC_API_KEY' in os.environ:
        del os.environ['ANTHROPIC_API_KEY']

    try:
        # The client should pick up ANTHROPIC_AUTH_TOKEN automatically
        client = Anthropic()

        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=50,
            messages=[{"role": "user", "content": "Say 'Method 1 works!'"}]
        )

        print(f"✅ SUCCESS with ANTHROPIC_AUTH_TOKEN env var!")
        print(f"Response: {response.content[0].text}")

    except Exception as e:
        print(f"❌ Method 1 failed: {e}")

    # Method 2: Check if Python SDK has auth_token parameter
    print("\n🧪 Method 2: Looking for auth_token parameter...")

    # Check what parameters Anthropic constructor accepts
    import inspect
    sig = inspect.signature(Anthropic.__init__)
    params = list(sig.parameters.keys())
    print(f"  Available parameters: {params}")

    if 'auth_token' in params:
        print("  ✅ auth_token parameter found!")
        try:
            client = Anthropic(auth_token=token)
            response = client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=50,
                messages=[{"role": "user", "content": "Say 'Method 2 works!'"}]
            )
            print(f"✅ SUCCESS with auth_token parameter!")
            print(f"Response: {response.content[0].text}")
        except Exception as e:
            print(f"❌ Method 2 failed: {e}")
    else:
        print("  ❌ auth_token parameter NOT found in Python SDK")
        print("  The Python SDK may not support OAuth tokens yet")

    # Method 3: Try with custom headers
    print("\n🧪 Method 3: Using custom headers...")
    try:
        # Try passing the token as a Bearer token in headers
        client = Anthropic(
            default_headers={
                "Authorization": f"Bearer {token}"
            }
        )

        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=50,
            messages=[{"role": "user", "content": "Say 'Method 3 works!'"}]
        )

        print(f"✅ SUCCESS with Bearer token in headers!")
        print(f"Response: {response.content[0].text}")

    except Exception as e:
        print(f"❌ Method 3 failed: {str(e)[:200]}")

except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    sys.exit(1)

print("\n" + "=" * 60)
print("SUMMARY:")
print("Check which method worked above.")
print("The token must be one continuous string without line breaks!")
print("=" * 60)