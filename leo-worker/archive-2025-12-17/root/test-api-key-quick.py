#!/usr/bin/env python
"""
Quick test to verify API key works correctly.
Run this after setting up your API key in .env
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=" * 60)
print("QUICK API KEY TEST")
print("=" * 60)

# Check environment
api_key = os.environ.get('ANTHROPIC_API_KEY', '')
auth_token = os.environ.get('ANTHROPIC_AUTH_TOKEN', '')

print("\n📋 Environment Check:")
print(f"  ANTHROPIC_API_KEY set: {'✅ YES' if api_key else '❌ NO'}")
print(f"  ANTHROPIC_AUTH_TOKEN set: {'⚠️ YES (should be removed)' if auth_token else '✅ NO (correct)'}")

if not api_key:
    print("\n❌ ERROR: ANTHROPIC_API_KEY not set!")
    print("Please run: ./setup-api-key.sh")
    sys.exit(1)

# Check format
if api_key.startswith("sk-ant-api03-"):
    print(f"\n✅ API key format is correct!")
    print(f"  Starts with: {api_key[:20]}...")
elif api_key.startswith("sk-ant-oat01-"):
    print(f"\n❌ ERROR: This is an OAuth token, not an API key!")
    print("  OAuth tokens (sk-ant-oat01-...) don't work with the API")
    print("  You need an API key from console.anthropic.com")
    sys.exit(1)
else:
    print(f"\n⚠️ WARNING: Unexpected API key format")
    print(f"  Key starts with: {api_key[:20]}...")

# Test the API
print("\n🧪 Testing API connection...")

try:
    from anthropic import Anthropic

    client = Anthropic()  # Will use ANTHROPIC_API_KEY env var

    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=50,
        messages=[{
            "role": "user",
            "content": "Reply with exactly: 'API connection successful!'"
        }]
    )

    print(f"\n✅ SUCCESS! Claude responded:")
    print(f"  \"{response.content[0].text}\"")

    print("\n🎉 Your API key is working perfectly!")
    print("\nYou can now run the app generator:")
    print("  uv run python src/app_factory_leonardo_replit/run.py \"Your app idea\"")

except ImportError:
    print("❌ anthropic package not installed")
    print("Run: pip install anthropic")
    sys.exit(1)

except Exception as e:
    print(f"\n❌ API Error: {e}")

    if "401" in str(e) or "authentication" in str(e).lower():
        print("\nYour API key is invalid. Please:")
        print("1. Get a new key from console.anthropic.com")
        print("2. Run: ./setup-api-key.sh")
    else:
        print("\nPlease check:")
        print("1. Internet connection")
        print("2. API key validity")
        print("3. Anthropic service status")
    sys.exit(1)

print("\n" + "=" * 60)