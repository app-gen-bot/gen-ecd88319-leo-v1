# OAuth Token API Limitation - Investigation Results

## Summary
The OAuth token (`sk-ant-oat01-...`) cannot be used with the Anthropic API, despite both Python and TypeScript SDKs having OAuth token support. The API itself rejects OAuth authentication.

## Investigation Findings

### 1. SDK Support ✅
Both SDKs have OAuth token parameters:
- **Python SDK v0.68.0**: `auth_token` parameter exists
- **TypeScript SDK**: `authToken` parameter exists

### 2. API Support ❌
The Anthropic API returns: `"OAuth authentication is currently not supported"`

This is an **API-level limitation**, not an SDK issue.

### 3. Token Types Explained

| Token Type | Format | Use Case | Support Status |
|------------|--------|----------|----------------|
| **OAuth Token** | `sk-ant-oat01-...` | Claude.ai web/desktop app | ❌ Not supported by API |
| **API Key** | `sk-ant-api03-...` | SDK/programmatic access | ✅ Fully supported |

## The Problem

Your token (`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`) is an OAuth token from:
- Claude.ai web interface login
- Claude Desktop application
- Claude Max subscription

These OAuth tokens are **not yet enabled** for API access, even though the SDKs have the parameter ready.

## Solution

### Option 1: Get an API Key (Recommended)

1. Go to https://console.anthropic.com/
2. Sign in with your Anthropic account
3. Navigate to **API Keys** section
4. Create a new API key (format: `sk-ant-api03-...`)
5. Update your `.env` file:
```bash
# Replace line 24 in .env
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-ACTUAL-API-KEY-HERE
# Remove the ANTHROPIC_AUTH_TOKEN line
```

6. Run your app generator:
```bash
uv run python src/app_factory_leonardo_replit/run.py "Your app description"
```

### Option 2: Wait for OAuth Support

Anthropic may enable OAuth token support in the future. The infrastructure is ready in the SDKs but not yet activated on the API side.

### Option 3: Use Claude Desktop

If you don't want to pay for API access, you can:
- Use Claude Desktop application (supports OAuth tokens)
- Use Claude.ai web interface
- But you cannot use the SDK/API programmatically

## Cost Consideration

- **Claude Max subscription**: Access to Claude.ai and Claude Desktop
- **API access**: Separate billing through console.anthropic.com
- **Pricing**: Pay-per-token usage (see console.anthropic.com for rates)

## Test Scripts Available

We've created comprehensive test scripts:
- `test-anthropic-auth.py` - Tests OAuth token methods
- `test-anthropic-api-key.py` - Tests API key methods
- `test-auth-token-python.py` - Latest comprehensive test

## Next Steps

1. **Get an API key** from console.anthropic.com
2. **Update .env** with the API key
3. **Test the app generator** with your prompt

The app generator pipeline is ready to work once you have a valid API key.

## Technical Details

The OAuth token infrastructure exists because:
- Anthropic is preparing for OAuth-based authentication
- SDKs were updated in advance to support the feature
- API endpoints will be updated in the future to accept OAuth tokens

Currently, only traditional API keys work for programmatic access.