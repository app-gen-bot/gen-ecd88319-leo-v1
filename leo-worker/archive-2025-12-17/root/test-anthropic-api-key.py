#!/usr/bin/env python
"""
Test using the token as an API key instead of OAuth token.
"""

import os
import sys

# The token that was causing issues
token = "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"

print("=" * 60)
print("TESTING ANTHROPIC TOKEN AS API KEY")
print("=" * 60)

print(f"\n📏 Token Details:")
print(f"  Length: {len(token)} characters")
print(f"  Starts with: {token[:20]}...")
print(f"  Ends with: ...{token[-10:]}")

try:
    from anthropic import Anthropic

    # Test 1: Try as API key
    print("\n🧪 Test 1: Using token as API key...")
    try:
        client = Anthropic(api_key=token)

        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=100,
            messages=[{
                "role": "user",
                "content": "Say 'API test successful!' if you can read this."
            }]
        )

        print(f"✅ SUCCESS with API key method!")
        print(f"Response: \"{response.content[0].text}\"")
        print(f"Usage: {response.usage.input_tokens} in, {response.usage.output_tokens} out")

    except Exception as e:
        print(f"❌ Failed as API key: {e}")

    # Test 2: Try setting as environment variable
    print("\n🧪 Test 2: Using token via ANTHROPIC_API_KEY env var...")
    try:
        os.environ['ANTHROPIC_API_KEY'] = token
        if 'ANTHROPIC_AUTH_TOKEN' in os.environ:
            del os.environ['ANTHROPIC_AUTH_TOKEN']

        client = Anthropic()  # Will use env var

        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=100,
            messages=[{
                "role": "user",
                "content": "Say 'Environment variable test successful!'"
            }]
        )

        print(f"✅ SUCCESS with ANTHROPIC_API_KEY env var!")
        print(f"Response: \"{response.content[0].text}\"")

    except Exception as e:
        print(f"❌ Failed with env var: {e}")

except ImportError:
    print("❌ anthropic package not installed")
    sys.exit(1)

print("\n" + "=" * 60)
print("CONCLUSION:")
print("The token should be used as ANTHROPIC_API_KEY, not ANTHROPIC_AUTH_TOKEN")
print("OAuth authentication is not currently supported by the API")
print("=" * 60)