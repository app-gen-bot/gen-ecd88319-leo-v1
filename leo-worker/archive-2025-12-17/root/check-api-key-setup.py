#!/usr/bin/env python
"""
Check Anthropic API key configuration and test it.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=" * 60)
print("ANTHROPIC API KEY CONFIGURATION CHECK")
print("=" * 60)

# Check for API key
api_key = os.environ.get('ANTHROPIC_API_KEY', '')
auth_token = os.environ.get('ANTHROPIC_AUTH_TOKEN', '')

print("\n📋 Current Configuration:")
print(f"  ANTHROPIC_API_KEY: {'✅ SET' if api_key else '❌ NOT SET'}")
print(f"  ANTHROPIC_AUTH_TOKEN: {'⚠️ SET (should be removed)' if auth_token else '✅ NOT SET (correct)'}")

if api_key:
    # Check the format
    if api_key == "YOUR_API_KEY_HERE":
        print("\n❌ ERROR: You need to replace 'YOUR_API_KEY_HERE' with your actual API key!")
        print("\n📝 To fix this:")
        print("1. Get your API key from https://console.anthropic.com/")
        print("2. Edit .env file and replace YOUR_API_KEY_HERE with your actual key")
        print("3. The key should start with 'sk-ant-api03-'")
        sys.exit(1)
    elif api_key.startswith("sk-ant-api03-"):
        print(f"\n✅ API key format looks correct!")
        print(f"  Key starts with: {api_key[:20]}...")
    elif api_key.startswith("sk-ant-oat01-"):
        print(f"\n❌ ERROR: This is an OAuth token, not an API key!")
        print("  OAuth tokens (sk-ant-oat01-...) don't work with the API")
        print("  You need an API key from console.anthropic.com")
        sys.exit(1)
    else:
        print(f"\n⚠️ WARNING: Unexpected API key format")
        print(f"  Key starts with: {api_key[:20] if len(api_key) > 20 else api_key}...")
        print("  Expected format: sk-ant-api03-...")

if auth_token:
    print("\n⚠️ WARNING: ANTHROPIC_AUTH_TOKEN is still set")
    print("  This OAuth token won't work with the API")
    print("  Consider removing it from .env to avoid confusion")

if not api_key or api_key == "YOUR_API_KEY_HERE":
    print("\n" + "=" * 60)
    print("❌ SETUP INCOMPLETE")
    print("=" * 60)
    print("\nYou need to add your Anthropic API key to .env file:")
    print("\n1. Get your API key from: https://console.anthropic.com/")
    print("2. Edit .env file")
    print("3. Replace 'YOUR_API_KEY_HERE' with your actual API key")
    print("4. The key should look like: sk-ant-api03-xxxxxxxxxxxxx")
    print("\nExample:")
    print("  ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here")
    sys.exit(1)

# Test the API key
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

    print("\n" + "=" * 60)
    print("✅ API KEY IS WORKING!")
    print("=" * 60)
    print("\nYou can now run the app generator:")
    print("  uv run python run-app-generator.py")
    print("\nOr the pipeline:")
    print("  uv run python src/app_factory_leonardo_replit/run.py \"Your app idea\"")

except ImportError:
    print("❌ anthropic package not installed")
    print("Run: pip install anthropic")
    sys.exit(1)

except Exception as e:
    print(f"\n❌ API Error: {e}")

    if "401" in str(e) or "authentication" in str(e).lower():
        print("\nYour API key is invalid or not properly set. Please:")
        print("1. Verify your API key at console.anthropic.com")
        print("2. Make sure it's correctly set in .env file")
        print("3. Ensure the key starts with 'sk-ant-api03-'")
    else:
        print("\nCheck:")
        print("1. Internet connection")
        print("2. API key validity")
        print("3. Anthropic service status")
    sys.exit(1)

print("\n" + "=" * 60)