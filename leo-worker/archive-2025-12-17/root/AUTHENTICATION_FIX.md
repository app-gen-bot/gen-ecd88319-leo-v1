# Anthropic Authentication Fix

## Problem
The error `Headers.append: "Bearer sk-ant-oat01-...` indicates that:
1. An ANTHROPIC_AUTH_TOKEN (OAuth token) is being used instead of ANTHROPIC_API_KEY (API key)
2. The token has a line break in it, making it invalid for HTTP headers
3. OAuth tokens don't work with the Anthropic API - you need an API key

## Root Cause
The `ANTHROPIC_AUTH_TOKEN` environment variable is likely set in your current shell session from a previous command, possibly with a line break. The Anthropic SDK checks for `ANTHROPIC_AUTH_TOKEN` first, before `ANTHROPIC_API_KEY`, so it's using the wrong credential.

## Solution

### Quick Fix (Recommended)
Run this command in your terminal to fix the environment variables:

```bash
source ./fix-anthropic-env.sh
```

This will:
- Clear any ANTHROPIC_AUTH_TOKEN from your environment
- Load the correct ANTHROPIC_API_KEY from your .env file
- Verify the setup is correct

Then run your app generator command in the **same shell**:

```bash
uv run python run-app-generator.py "Test AI recommendations" --no-expand --app-name RaiseIQ
```

### Manual Fix
If you prefer to do it manually:

```bash
# 1. Unset the OAuth token
unset ANTHROPIC_AUTH_TOKEN

# 2. Export the API key from .env (make sure it's on one line, no line breaks)
export ANTHROPIC_API_KEY="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"

# 3. Verify
echo "ANTHROPIC_AUTH_TOKEN: ${ANTHROPIC_AUTH_TOKEN:-<not set>}"
echo "ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY:0:20}..."
```

### Permanent Fix
To prevent this issue in future shell sessions, ensure your shell profile (~/.zshrc or ~/.bashrc) does NOT export ANTHROPIC_AUTH_TOKEN.

## Verification
After fixing, you should see:
- `ANTHROPIC_AUTH_TOKEN: <not set>`
- `ANTHROPIC_API_KEY: sk-ant-api03-xcdGVv... (108 chars)`

## Key Points
1. ✅ **USE**: ANTHROPIC_API_KEY (starts with `sk-ant-api03-`)
2. ❌ **DON'T USE**: ANTHROPIC_AUTH_TOKEN (starts with `sk-ant-oat01-`)
3. The .env file is correctly configured - the issue is the shell environment
4. OAuth tokens are for Claude.ai web/desktop, not for API access

## For RaiseIQ App
The RaiseIQ app's .env file is already correctly configured with the API key. The app will work once you fix your shell environment and run the app generator.

## Testing
After fixing the environment, test with:

```bash
# Test the API key works
python3 -c "import os; from anthropic import Anthropic; print('API Key:', os.getenv('ANTHROPIC_API_KEY')[:20] if os.getenv('ANTHROPIC_API_KEY') else 'Not set'); client = Anthropic(); print('Client initialized successfully')"

# Run the app generator
uv run python run-app-generator.py "Test AI recommendations" --no-expand --app-name RaiseIQ
```
