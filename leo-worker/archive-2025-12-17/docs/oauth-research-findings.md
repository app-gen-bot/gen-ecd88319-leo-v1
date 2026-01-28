# OAuth Token Research Findings - January 2025

## Executive Summary

After extensive research, I've found that **OAuth tokens (`sk-ant-oat01-...`) are for Claude Code/Desktop authentication, not for direct API SDK usage**. The Anthropic API itself doesn't support OAuth authentication yet, despite SDKs having the infrastructure ready.

## Research Findings

### 1. OAuth Token Purpose
OAuth tokens with format `sk-ant-oat01-...` are designed for:
- Claude Code application authentication
- Claude Desktop authentication
- Claude.ai web interface

They are **NOT** for:
- Direct API access via Python/TypeScript SDKs
- Programmatic access to Anthropic's API endpoints

### 2. Known Issues in 2025

#### GitHub Issues Reviewed:
- **#6058**: "OAuth authentication is currently not supported" error
- **#5956**: OAuth fails on highest plan tier
- **#7508**: Authentication error with ANTHROPIC_AUTH_TOKEN in v1.0.111
- **#1618**: OpenCode hangs with OAuth authentication

#### Common Error:
```json
{
  "type": "authentication_error",
  "message": "OAuth authentication is currently not supported."
}
```

### 3. SDK Implementation

The Python SDK **does** have OAuth support infrastructure:
```python
# From anthropic-sdk-python source:
@property
def _bearer_auth(self) -> dict[str, str]:
    auth_token = self.auth_token
    if auth_token is None:
        return {}
    return {"Authorization": f"Bearer {auth_token}"}
```

However, the API backend rejects these Bearer tokens.

### 4. Official Documentation

The official Anthropic API documentation only mentions:
- **X-Api-Key** header authentication
- API keys from console.anthropic.com
- No mention of OAuth/Bearer tokens

## Token Format Comparison

| Token Type | Format | Example | Use Case |
|------------|--------|---------|----------|
| OAuth Access Token | `sk-ant-oat01-...` | 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 | Claude Code/Desktop |
| OAuth Refresh Token | `sk-ant-ort01-...` | sk-ant-ort01-xxxxx | Claude Code token refresh |
| API Key | `sk-ant-api03-...` | sk-ant-api03-xxxxx | SDK/API access |

## Working Solution

### Option 1: Get an API Key (Recommended)

Since OAuth isn't supported for API access, you need to:

1. Go to https://console.anthropic.com/
2. Navigate to API Keys section
3. Create a new API key (format: `sk-ant-api03-...`)
4. Use it in your code:

```python
# Python
from anthropic import Anthropic
client = Anthropic(api_key="sk-ant-api03-...")

# Or via environment variable
export ANTHROPIC_API_KEY="sk-ant-api03-..."
```

```typescript
// TypeScript
import Anthropic from '@anthropic-ai/sdk';
const client = new Anthropic({
  apiKey: 'sk-ant-api03-...'
});
```

### Option 2: Use Claude Code Application

If you want to use your OAuth token, you can:
- Use Claude Code desktop application (supports OAuth)
- Use Claude.ai web interface
- But you cannot use SDKs programmatically

### Option 3: Wait for OAuth Support

The infrastructure exists in SDKs (auth_token parameter), suggesting OAuth support may come in the future. The API currently returns "OAuth authentication is currently not supported."

## Community Workarounds

Some users reported success by:
1. **Downgrading Claude Code**: Version 1.0.81 reportedly works better than 1.0.83/1.0.111
2. **Using API keys instead**: Most stable solution
3. **Using Claude Desktop**: OAuth works there

## Conclusion

Your OAuth token (`sk-ant-oat01-...`) is valid but **not for API/SDK usage**. It's meant for Claude Code/Desktop applications. For programmatic access via Python SDK in your app factory, you need an API key from console.anthropic.com.

## Action Items

1. ✅ Get an API key from https://console.anthropic.com/
2. ✅ Replace OAuth token with API key in .env:
   ```bash
   # Remove or comment out
   # ANTHROPIC_AUTH_TOKEN=sk-ant-oat01-...

   # Add
   ANTHROPIC_API_KEY=sk-ant-api03-YOUR-KEY-HERE
   ```
3. ✅ Test with: `uv run python test-api-key-quick.py`
4. ✅ Run app generator: `uv run python src/app_factory_leonardo_replit/run.py "Your app"`

## References

- [Anthropic Python SDK Source](https://github.com/anthropics/anthropic-sdk-python)
- [Claude Code Issues](https://github.com/anthropics/claude-code/issues)
- [Official API Documentation](https://docs.claude.com/en/api/)
- [Console for API Keys](https://console.anthropic.com/)