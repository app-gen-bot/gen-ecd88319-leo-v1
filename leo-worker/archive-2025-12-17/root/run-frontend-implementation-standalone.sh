#!/bin/bash

# Frontend Implementation Standalone Test Runner
# This script runs the Frontend Implementation stage in isolation to test page generation

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Default app directory
DEFAULT_APP_DIR="apps/timeless-weddings-phase1/app"
APP_DIR="${1:-$DEFAULT_APP_DIR}"

echo -e "${PURPLE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║  Frontend Implementation - Standalone Test Runner         ║${NC}"
echo -e "${PURPLE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Resolve absolute path
if [[ "$APP_DIR" != /* ]]; then
    APP_DIR="$(pwd)/$APP_DIR"
fi

echo -e "${BLUE}📂 App Directory:${NC} $APP_DIR"
echo ""

# Verify directory exists
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}❌ Error: App directory not found: $APP_DIR${NC}"
    echo ""
    echo "Usage: ./run-frontend-implementation-standalone.sh [app_directory]"
    echo ""
    echo "Examples:"
    echo "  ./run-frontend-implementation-standalone.sh"
    echo "  ./run-frontend-implementation-standalone.sh apps/timeless-weddings-phase1/app"
    echo "  ./run-frontend-implementation-standalone.sh /absolute/path/to/app"
    exit 1
fi

# Verify required files exist
echo -e "${BLUE}🔍 Verifying required files...${NC}"

REQUIRED_FILES=(
    "$APP_DIR/specs/frontend-interaction-spec-master.md"
    "$APP_DIR/shared/schema.zod.ts"
    "$APP_DIR/shared/contracts"
)

ALL_PRESENT=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -e "$file" ]; then
        echo -e "${GREEN}  ✓${NC} $(basename "$file")"
    else
        echo -e "${RED}  ✗${NC} $(basename "$file") ${RED}(missing)${NC}"
        ALL_PRESENT=false
    fi
done

if [ "$ALL_PRESENT" = false ]; then
    echo ""
    echo -e "${RED}❌ Missing required files. Run these stages first:${NC}"
    echo "   1. FIS Master Spec generation"
    echo "   2. Schema generation (schema.zod.ts)"
    echo "   3. Contracts generation"
    exit 1
fi

# Check if AppLayout exists
APP_LAYOUT="$APP_DIR/client/src/components/layout/AppLayout.tsx"
if [ -f "$APP_LAYOUT" ]; then
    echo -e "${GREEN}  ✓${NC} AppLayout.tsx ${YELLOW}(will be reused, not regenerated)${NC}"
else
    echo -e "${YELLOW}  ⚠${NC}  AppLayout.tsx ${YELLOW}(missing - will be generated as fallback)${NC}"
fi

echo ""

# Ask for confirmation to delete existing pages
PAGES_DIR="$APP_DIR/client/src/pages"
PAGE_COUNT=$(find "$PAGES_DIR" -type f -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')

if [ "$PAGE_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Warning: Found $PAGE_COUNT existing page(s) in $PAGES_DIR${NC}"
    echo ""
    read -p "Delete existing pages before running? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🗑️  Deleting existing pages...${NC}"
        rm -rf "$PAGES_DIR"
        mkdir -p "$PAGES_DIR"
        echo -e "${GREEN}  ✓ Pages directory cleaned${NC}"
        echo ""
    else
        echo -e "${YELLOW}  Keeping existing pages (Frontend Implementation will update/overwrite them)${NC}"
        echo ""
    fi
fi

# Run the standalone test
echo -e "${PURPLE}════════════════════════════════════════════════════════════${NC}"
echo -e "${PURPLE}  Starting Frontend Implementation Test${NC}"
echo -e "${PURPLE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}⏱️  This may take 5-15 minutes depending on complexity...${NC}"
echo -e "${BLUE}💡 Watch for:${NC}"
echo -e "   ${GREEN}✓${NC} Detection of existing AppLayout"
echo -e "   ${GREEN}✓${NC} Shared component generation"
echo -e "   ${GREEN}✓${NC} Page generation (9 pages expected)"
echo -e "   ${GREEN}✓${NC} OXC validation passing"
echo ""

# Create log directory
LOG_DIR="logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/frontend-impl-standalone-$(date +%Y%m%d-%H%M%S).log"

# Run the test and capture output
echo -e "${BLUE}📝 Logging to:${NC} $LOG_FILE"
echo ""

uv run python src/app_factory_leonardo_replit/standalone/test_frontend_implementation.py "$APP_DIR" 2>&1 | tee "$LOG_FILE"

# Capture exit code
EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo -e "${PURPLE}════════════════════════════════════════════════════════════${NC}"

# Check results
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ SUCCESS - Frontend Implementation completed!${NC}"
    echo ""

    # Count generated pages
    NEW_PAGE_COUNT=$(find "$PAGES_DIR" -type f -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
    echo -e "${GREEN}📄 Generated Pages:${NC} $NEW_PAGE_COUNT"

    if [ $NEW_PAGE_COUNT -gt 0 ]; then
        echo ""
        echo -e "${BLUE}Generated files:${NC}"
        find "$PAGES_DIR" -type f -name "*.tsx" -exec basename {} \; | sort | sed 's/^/  • /'
    fi

    # Check if AppLayout was modified
    if [ -f "$APP_LAYOUT" ]; then
        echo ""
        echo -e "${BLUE}🔍 AppLayout Status:${NC}"
        LAYOUT_TIME=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$APP_LAYOUT" 2>/dev/null || stat -c "%y" "$APP_LAYOUT" 2>/dev/null | cut -d'.' -f1)
        echo -e "   Last modified: $LAYOUT_TIME"

        # Check if any page imports AppLayout
        IMPORT_COUNT=$(grep -l "AppLayout" "$PAGES_DIR"/*.tsx 2>/dev/null | wc -l | tr -d ' ')
        if [ "$IMPORT_COUNT" -gt 0 ]; then
            echo -e "   ${GREEN}✓${NC} Imported by $IMPORT_COUNT page(s)"
        fi
    fi

else
    echo -e "${RED}❌ FAILED - Frontend Implementation did not complete successfully${NC}"
    echo ""
    echo -e "${YELLOW}Check the log file for details:${NC}"
    echo -e "  $LOG_FILE"
    echo ""
    echo -e "${YELLOW}Common issues:${NC}"
    echo "  • Missing FIS specifications"
    echo "  • Missing schema or contracts"
    echo "  • OXC validation errors"
    echo "  • TypeScript compilation errors"
fi

echo -e "${PURPLE}════════════════════════════════════════════════════════════${NC}"
echo ""

exit $EXIT_CODE
