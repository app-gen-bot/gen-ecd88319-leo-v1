# Fix ANTHROPIC_AUTH_TOKEN Issue

## Problem
The ANTHROPIC_AUTH_TOKEN was split across two lines, causing an "invalid header value" error when the SDK tries to use it in HTTP headers.

## Solution

### Option 1: Source the fix script (Recommended)
```bash
source ./fix-anthropic-token.sh
```

### Option 2: Set manually in your shell
```bash
export ANTHROPIC_AUTH_TOKEN="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"
unset ANTHROPIC_API_KEY
```

### Option 3: Add to your shell profile permanently
Add this to your `~/.zshrc` or `~/.bashrc`:
```bash
export ANTHROPIC_AUTH_TOKEN="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"
```

## Important Notes
1. The token must be on a SINGLE LINE with no line breaks
2. Do NOT set ANTHROPIC_API_KEY if using the OAuth token
3. The token has been added to `.env` file correctly (line 24)

## Testing
After setting the token, run:
```bash
uv run python run-app-generator.py --app-name RunIQ "Test AI recommendations" --no-expand --resume ~/apps/app-factory/apps/RunIQ/app
```

## Token Format
- **Correct**: One continuous string
- **Wrong**: String with line breaks or spaces in the middle

The token is 108 characters long and should start with `sk-ant-oat01-` and end with `-gcWDrgAA`.