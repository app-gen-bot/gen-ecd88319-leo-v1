#!/bin/bash

# Migrate Leo Dev Database
# Runs drizzle-kit push against leo-dev (production) database
#
# Usage: ./scripts/migrate-leo-dev.sh
#
# This applies all schema changes from the generated Leo codebase
# to the leo-dev Supabase project.

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LEO_GENERATED_DIR="$HOME/WORK/LEO/saas-dev-agent/repos/gen-219eda6b-032862af"

# Leo-dev database URL (session mode, port 5432 for migrations)
# UPDATE THIS with your own leo-dev project credentials!
# Format: postgresql://postgres.{PROJECT_ID}:{PASSWORD}@aws-0-{REGION}.pooler.supabase.com:5432/postgres
LEO_DEV_DATABASE_URL="${LEO_DEV_DATABASE_URL:-}"

if [[ -z "$LEO_DEV_DATABASE_URL" ]]; then
    echo -e "${RED}Error: LEO_DEV_DATABASE_URL not set${NC}"
    echo "Set it in your environment or edit this script with your credentials."
    echo "Example: export LEO_DEV_DATABASE_URL='postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres'"
    exit 1
fi

echo -e "${YELLOW}=== Leo Dev Migration ===${NC}"
echo "Using DATABASE_URL from environment"
echo ""

# Verify generated Leo directory exists
if [[ ! -d "$LEO_GENERATED_DIR" ]]; then
    echo -e "${RED}Error: Leo generated directory not found${NC}"
    echo "Expected: $LEO_GENERATED_DIR"
    exit 1
fi

# Verify drizzle config exists
if [[ ! -f "$LEO_GENERATED_DIR/drizzle.config.ts" ]]; then
    echo -e "${RED}Error: drizzle.config.ts not found${NC}"
    exit 1
fi

cd "$LEO_GENERATED_DIR"

# Ensure dependencies are installed
if [[ ! -d "node_modules" ]]; then
    echo "Installing dependencies..."
    npm install --silent
fi

# Show what migrations exist
echo "Migration files:"
ls -la drizzle/*.sql 2>/dev/null | tail -5 || echo "  (none found)"
echo ""

# Run drizzle-kit push
echo -e "${YELLOW}Running drizzle-kit push...${NC}"
LEO_DATABASE_URL="$LEO_DEV_DATABASE_URL" npx drizzle-kit push --force

echo ""
echo -e "${GREEN}=== Migration Complete ===${NC}"
echo "Leo-dev schema is now up to date with generated code."
