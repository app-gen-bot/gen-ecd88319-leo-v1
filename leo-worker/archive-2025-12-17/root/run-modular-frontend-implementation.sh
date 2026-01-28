#!/bin/bash

# Modular Frontend Implementation Runner
# This script runs the CORRECT modular frontend implementation that:
# - Uses master spec for shared components
# - Generates pages in PARALLEL using individual specs
# - Properly leverages the Task tool for parallelization

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
echo -e "${PURPLE}║  MODULAR Frontend Implementation - Parallel Generation    ║${NC}"
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
    echo "Usage: ./run-modular-frontend-implementation.sh [app_directory]"
    echo ""
    echo "Examples:"
    echo "  ./run-modular-frontend-implementation.sh"
    echo "  ./run-modular-frontend-implementation.sh apps/timeless-weddings-phase1/app"
    echo "  ./run-modular-frontend-implementation.sh /absolute/path/to/app"
    exit 1
fi

# Verify required files exist
echo -e "${BLUE}🔍 Verifying modular FIS structure...${NC}"

MASTER_SPEC="$APP_DIR/specs/frontend-interaction-spec-master.md"
PAGES_DIR="$APP_DIR/specs/pages"
SCHEMA="$APP_DIR/shared/schema.zod.ts"
CONTRACTS_DIR="$APP_DIR/shared/contracts"

# Check master spec
if [ -f "$MASTER_SPEC" ]; then
    echo -e "${GREEN}  ✓${NC} Master spec found"
else
    echo -e "${RED}  ✗${NC} Master spec missing: $MASTER_SPEC"
    echo -e "${RED}     Run modular FIS generation first${NC}"
    exit 1
fi

# Check page specs directory
if [ -d "$PAGES_DIR" ]; then
    PAGE_COUNT=$(find "$PAGES_DIR" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$PAGE_COUNT" -gt 0 ]; then
        echo -e "${GREEN}  ✓${NC} Page specs found: $PAGE_COUNT pages"
        # List page specs
        echo -e "${BLUE}     Pages to generate in parallel:${NC}"
        for spec in "$PAGES_DIR"/*.md; do
            basename "$spec" | sed 's/.md$//' | sed 's/^/       • /'
        done
    else
        echo -e "${RED}  ✗${NC} No page specs found in: $PAGES_DIR"
        exit 1
    fi
else
    echo -e "${RED}  ✗${NC} Page specs directory missing: $PAGES_DIR"
    exit 1
fi

# Check schema
if [ -f "$SCHEMA" ]; then
    echo -e "${GREEN}  ✓${NC} Schema found"
else
    echo -e "${RED}  ✗${NC} Schema missing: $SCHEMA"
    exit 1
fi

# Check contracts
if [ -d "$CONTRACTS_DIR" ]; then
    CONTRACT_COUNT=$(find "$CONTRACTS_DIR" -name "*.contract.ts" 2>/dev/null | wc -l | tr -d ' ')
    echo -e "${GREEN}  ✓${NC} Contracts found: $CONTRACT_COUNT files"
else
    echo -e "${RED}  ✗${NC} Contracts directory missing: $CONTRACTS_DIR"
    exit 1
fi

# Check if AppLayout exists
APP_LAYOUT="$APP_DIR/client/src/components/layout/AppLayout.tsx"
if [ -f "$APP_LAYOUT" ]; then
    echo -e "${GREEN}  ✓${NC} AppLayout.tsx ${YELLOW}(exists - will be reused)${NC}"
else
    echo -e "${YELLOW}  ⚠${NC}  AppLayout.tsx ${YELLOW}(missing - will be generated)${NC}"
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
        echo -e "${YELLOW}  Keeping existing pages (will be overwritten)${NC}"
        echo ""
    fi
fi

# Run the modular implementation
echo -e "${PURPLE}════════════════════════════════════════════════════════════${NC}"
echo -e "${PURPLE}  Starting MODULAR Frontend Implementation${NC}"
echo -e "${PURPLE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}🚀 Key features of modular approach:${NC}"
echo -e "   ${GREEN}✓${NC} Master spec defines shared patterns"
echo -e "   ${GREEN}✓${NC} Pages generated in PARALLEL using Task tool"
echo -e "   ${GREEN}✓${NC} Each page uses its individual spec"
echo -e "   ${GREEN}✓${NC} No combining of specs into single document"
echo -e "   ${GREEN}✓${NC} True parallel generation as designed"
echo ""
echo -e "${BLUE}⏱️  This may take 10-20 minutes depending on page count...${NC}"
echo ""

# Create log directory
LOG_DIR="logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/modular-frontend-impl-$(date +%Y%m%d-%H%M%S).log"

echo -e "${BLUE}📝 Logging to:${NC} $LOG_FILE"
echo ""

# Run the modular implementation
uv run python src/app_factory_leonardo_replit/standalone/run_modular_frontend_implementation.py "$APP_DIR" 2>&1 | tee "$LOG_FILE"

# Capture exit code
EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo -e "${PURPLE}════════════════════════════════════════════════════════════${NC}"

# Check results
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ SUCCESS - Modular Frontend Implementation completed!${NC}"
    echo ""

    # Count generated pages
    NEW_PAGE_COUNT=$(find "$PAGES_DIR" -type f -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
    echo -e "${GREEN}📄 Generated Pages:${NC} $NEW_PAGE_COUNT"

    if [ $NEW_PAGE_COUNT -gt 0 ]; then
        echo ""
        echo -e "${BLUE}Generated files:${NC}"
        find "$PAGES_DIR" -type f -name "*.tsx" -exec basename {} \; | sort | sed 's/^/  • /'
    fi

    echo ""
    echo -e "${BLUE}🎯 Key achievements:${NC}"
    echo -e "   ${GREEN}✓${NC} Pages generated in parallel"
    echo -e "   ${GREEN}✓${NC} Master spec patterns applied"
    echo -e "   ${GREEN}✓${NC} AppLayout wrapper on all pages"
    echo -e "   ${GREEN}✓${NC} API hooks from master spec"
    echo -e "   ${GREEN}✓${NC} Design system consistency"

else
    echo -e "${RED}❌ FAILED - Modular Frontend Implementation did not complete${NC}"
    echo ""
    echo -e "${YELLOW}Check the log file for details:${NC}"
    echo -e "  $LOG_FILE"
    echo ""
    echo -e "${YELLOW}Common issues:${NC}"
    echo "  • Missing FIS specifications"
    echo "  • OXC validation errors"
    echo "  • TypeScript compilation errors"
    echo "  • Browser test failures"
fi

echo -e "${PURPLE}════════════════════════════════════════════════════════════${NC}"
echo ""

exit $EXIT_CODE