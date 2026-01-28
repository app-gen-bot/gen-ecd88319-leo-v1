#!/bin/bash

# Standalone Frontend Interaction Specification (FIS) Runner
# This script runs just the FIS generation stage for an existing app

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if app directory is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: No app directory provided${NC}"
    echo "Usage: $0 <app-directory> [max-iterations]"
    echo "Example: $0 apps/app-phase2-20250927-175050"
    exit 1
fi

APP_DIR="$1"
MAX_ITERATIONS="${2:-5}"  # Default to 5 iterations if not specified

# Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}Error: App directory not found: $APP_DIR${NC}"
    exit 1
fi

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Frontend Interaction Specification Generator        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}📁 App Directory:${NC} $APP_DIR"
echo -e "${GREEN}🔄 Max Iterations:${NC} $MAX_ITERATIONS"
echo -e "${GREEN}📝 Verbose Logging:${NC} Enabled"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"
if [ -f "$APP_DIR/plan/plan.md" ]; then
    echo -e "  ✅ Application plan found"
else
    echo -e "  ❌ Application plan missing: $APP_DIR/plan/plan.md"
fi

if [ -f "$APP_DIR/plan/ui-component-spec.md" ]; then
    echo -e "  ✅ UI component spec found"
else
    echo -e "  ❌ UI component spec missing: $APP_DIR/plan/ui-component-spec.md"
fi

if [ -f "$APP_DIR/app/shared/schema.ts" ]; then
    echo -e "  ✅ Database schema found"
else
    echo -e "  ❌ Database schema missing: $APP_DIR/app/shared/schema.ts"
fi

if [ -d "$APP_DIR/app/shared/contracts" ]; then
    CONTRACT_COUNT=$(ls -1 "$APP_DIR/app/shared/contracts"/*.contract.ts 2>/dev/null | wc -l)
    if [ "$CONTRACT_COUNT" -gt 0 ]; then
        echo -e "  ✅ API contracts found ($CONTRACT_COUNT files)"
    else
        echo -e "  ❌ No contract files in: $APP_DIR/app/shared/contracts"
    fi
else
    echo -e "  ❌ Contracts directory missing: $APP_DIR/app/shared/contracts"
fi

echo ""
echo -e "${BLUE}Starting FIS generation...${NC}"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Run the FIS standalone script with uv
uv run python -m app_factory_leonardo_replit.standalone.run_fis \
    "$APP_DIR" \
    --max-iterations "$MAX_ITERATIONS" \
    --verbose

# Capture exit code
EXIT_CODE=$?

echo ""
echo "═══════════════════════════════════════════════════════════"

if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ FIS generation completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📄 FIS Location:${NC} $APP_DIR/plan/frontend-interaction-spec.md"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Review the generated FIS"
    echo "2. Run the Frontend Implementation stage:"
    echo "   ./run-frontend-implementation-standalone.sh $APP_DIR/app"
else
    echo -e "${RED}❌ FIS generation failed${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo "1. Check the error messages above"
    echo "2. Ensure all prerequisites are in place"
    echo "3. Try running with fewer iterations"
    echo "4. Check the logs for more details"
fi

exit $EXIT_CODE