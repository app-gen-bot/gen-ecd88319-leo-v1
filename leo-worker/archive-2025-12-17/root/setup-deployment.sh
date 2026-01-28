#!/bin/bash

# AI App Factory - Deployment Setup Script
# This script sets up the deployment automation pipeline

set -e

echo "🚀 AI App Factory - Deployment Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Change to deployment automation directory
cd scripts/deploy-automation

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Run the interactive setup
echo "🔧 Starting interactive setup..."
echo ""
npm run setup

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Deploy the notetaker app:"
echo "      cd scripts/deploy-automation"
echo "      npm run deploy -- quick --name \"notetaker\" --path \"../../apps/notetaker/app\""
echo ""
echo "   2. Or deploy any other app:"
echo "      npm run deploy -- quick --name \"your-app\" --path \"path/to/app\""
echo ""