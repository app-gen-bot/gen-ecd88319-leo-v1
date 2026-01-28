#!/bin/bash
# IMPORTANT: OAuth tokens are not currently supported by Anthropic API
# You need an API key (sk-ant-api03-...) not an OAuth token (sk-ant-oat01-...)

echo "⚠️  WARNING: OAuth authentication is not supported by Anthropic API"
echo ""
echo "The token 'sk-ant-oat01-...' is an OAuth token for Claude.ai web/desktop"
echo "For API/SDK access, you need an API key from console.anthropic.com"
echo ""
echo "API keys look like: sk-ant-api03-xxxxxxxxxxxxx"
echo "OAuth tokens look like: sk-ant-oat01-xxxxxxxxxxxxx"
echo ""
echo "To get a valid API key:"
echo "1. Go to https://console.anthropic.com/"
echo "2. Sign in and navigate to API Keys"
echo "3. Create a new API key"
echo "4. Update this script with your API key"
echo ""
echo "Once you have an API key, uncomment and update the line below:"
echo ""
echo "# export ANTHROPIC_API_KEY=\"sk-ant-api03-YOUR-ACTUAL-API-KEY-HERE\""
echo ""

# Uncomment and update this line when you have a valid API key:
# export ANTHROPIC_API_KEY="sk-ant-api03-YOUR-ACTUAL-API-KEY-HERE"