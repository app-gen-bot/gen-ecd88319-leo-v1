#!/bin/bash

echo "========================================="
echo "Anthropic API Key Setup Helper"
echo "========================================="
echo ""
echo "This script will help you set up your Anthropic API key."
echo ""

# Check current .env status
if [ -f ".env" ]; then
    echo "📄 Current .env file detected"

    # Check for OAuth token
    if grep -q "ANTHROPIC_AUTH_TOKEN" .env; then
        echo "⚠️  OAuth token found (sk-ant-oat01-...) - This won't work with the API"
    fi

    # Check for API key
    if grep -q "ANTHROPIC_API_KEY" .env; then
        current_key=$(grep "ANTHROPIC_API_KEY" .env | cut -d'=' -f2 | tr -d '"')
        if [[ $current_key == sk-ant-api03-* ]]; then
            echo "✅ Valid API key format detected!"
            echo "   Key starts with: ${current_key:0:20}..."
        else
            echo "❌ Invalid API key format in .env"
        fi
    else
        echo "❌ No API key found in .env"
    fi
else
    echo "❌ No .env file found"
fi

echo ""
echo "To fix your authentication:"
echo "========================================="
echo ""
echo "1. Get your API key from: https://console.anthropic.com/"
echo "   - Sign in and go to API Keys section"
echo "   - Create a new key (format: sk-ant-api03-...)"
echo ""
echo "2. Update your .env file:"
echo "   - Remove or comment out: ANTHROPIC_AUTH_TOKEN=..."
echo "   - Add: ANTHROPIC_API_KEY=sk-ant-api03-YOUR-KEY-HERE"
echo ""
echo "3. Test your setup:"
echo "   uv run python test-anthropic-api-key.py"
echo ""
echo "4. Run the app generator:"
echo "   uv run python src/app_factory_leonardo_replit/run.py \"Your app idea\""
echo ""

# Offer to update .env if user provides key
echo "========================================="
read -p "Do you have an API key to add now? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Please paste your API key (should start with sk-ant-api03-):"
    read -r api_key

    # Validate format
    if [[ $api_key == sk-ant-api03-* ]]; then
        echo "✅ Valid API key format!"

        # Backup existing .env
        if [ -f ".env" ]; then
            cp .env .env.backup
            echo "📦 Backed up .env to .env.backup"
        fi

        # Remove OAuth token line if exists
        if [ -f ".env" ]; then
            sed -i.tmp '/ANTHROPIC_AUTH_TOKEN=/d' .env
            rm -f .env.tmp
        fi

        # Check if API key already exists
        if grep -q "ANTHROPIC_API_KEY=" .env 2>/dev/null; then
            # Update existing key
            sed -i.tmp "s/ANTHROPIC_API_KEY=.*/ANTHROPIC_API_KEY=$api_key/" .env
            rm -f .env.tmp
            echo "✅ Updated existing API key in .env"
        else
            # Add new key
            echo "" >> .env
            echo "# Anthropic API Key (from console.anthropic.com)" >> .env
            echo "ANTHROPIC_API_KEY=$api_key" >> .env
            echo "✅ Added API key to .env"
        fi

        echo ""
        echo "🎉 Setup complete! You can now run:"
        echo "   uv run python test-anthropic-api-key.py"
        echo "   uv run python src/app_factory_leonardo_replit/run.py \"Your app idea\""

    else
        echo "❌ Invalid key format. API keys should start with 'sk-ant-api03-'"
        echo "   OAuth tokens (sk-ant-oat01-...) are not supported by the API"
    fi
else
    echo ""
    echo "No problem! When you get your API key, you can:"
    echo "1. Run this script again, or"
    echo "2. Manually update .env file"
fi

echo ""
echo "========================================="
echo "For more details, see: docs/oauth-token-api-limitation.md"
echo "========================================="