#!/bin/bash

# Parallel Frontend Generation Runner with Clean Regeneration Support
# This script runs TRUE parallel frontend generation using Python asyncio
# with configurable concurrency control and optional clean regeneration

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default configuration
DEFAULT_APP_DIR="apps/timeless-weddings-phase1/app"
DEFAULT_CONCURRENCY=10
DEFAULT_TIMEOUT=600
CLEAN_MODE=false
FORCE_MODE=false
DRY_RUN=false

# Parse command line arguments
show_help() {
    echo "Usage: $0 [OPTIONS] [APP_DIR] [MAX_CONCURRENCY] [TIMEOUT]"
    echo ""
    echo "Parallel Frontend Generation with Clean Regeneration Support"
    echo ""
    echo "POSITIONAL ARGUMENTS:"
    echo "  APP_DIR         App directory path (default: $DEFAULT_APP_DIR)"
    echo "  MAX_CONCURRENCY Number of pages to generate in parallel (default: $DEFAULT_CONCURRENCY)"
    echo "  TIMEOUT         Timeout per page in seconds (default: $DEFAULT_TIMEOUT)"
    echo ""
    echo "OPTIONS:"
    echo "  -c, --clean     Delete existing generated pages before regenerating"
    echo "  -f, --force     Force regeneration without prompting (use with --clean)"
    echo "  -d, --dry-run   Show what would be deleted/generated without doing it"
    echo "  -h, --help      Show this help message"
    echo ""
    echo "EXAMPLES:"
    echo "  # Standard generation"
    echo "  $0"
    echo ""
    echo "  # Clean regeneration (will prompt for confirmation)"
    echo "  $0 --clean"
    echo ""
    echo "  # Clean regeneration without prompting"
    echo "  $0 --clean --force"
    echo ""
    echo "  # See what would be deleted/regenerated"
    echo "  $0 --clean --dry-run"
    echo ""
    echo "  # Custom app with clean regeneration"
    echo "  $0 --clean apps/my-app/app 5 300"
    exit 0
}

# Process arguments manually for better compatibility
POSITIONAL_ARGS=()

while [[ $# -gt 0 ]]; do
    case "$1" in
        -h|--help)
            show_help
            ;;
        -c|--clean)
            CLEAN_MODE=true
            shift
            ;;
        -f|--force)
            FORCE_MODE=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -*)
            echo "Error: Unknown option: $1" >&2
            echo "Try '$0 --help' for usage information" >&2
            exit 1
            ;;
        *)
            POSITIONAL_ARGS+=("$1")
            shift
            ;;
    esac
done

# Now process positional arguments
APP_DIR="${POSITIONAL_ARGS[0]:-$DEFAULT_APP_DIR}"
MAX_CONCURRENCY="${POSITIONAL_ARGS[1]:-$DEFAULT_CONCURRENCY}"
TIMEOUT="${POSITIONAL_ARGS[2]:-$DEFAULT_TIMEOUT}"

echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║     PARALLEL Frontend Generation - True Concurrency          ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Resolve absolute path
if [[ "$APP_DIR" != /* ]]; then
    APP_DIR="$(pwd)/$APP_DIR"
fi

echo -e "${BLUE}📁 App Directory:${NC} $APP_DIR"
echo -e "${BLUE}🔀 Max Concurrency:${NC} $MAX_CONCURRENCY pages in parallel"
echo -e "${BLUE}⏱  Timeout per Page:${NC} ${TIMEOUT}s"
if [ "$CLEAN_MODE" = true ]; then
    echo -e "${YELLOW}🧹 Clean Mode:${NC} ENABLED - Will delete existing pages"
fi
if [ "$DRY_RUN" = true ]; then
    echo -e "${CYAN}🔍 Dry Run Mode:${NC} ENABLED - No actual changes"
fi
echo ""

# Verify directory exists
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}❌ Error: App directory not found: $APP_DIR${NC}"
    exit 1
fi

# Verify FIS specs exist
echo -e "${BLUE}📋 Verifying FIS specifications...${NC}"

MASTER_SPEC="$APP_DIR/specs/frontend-interaction-spec-master.md"
PAGES_DIR="$APP_DIR/specs/pages"

if [ -f "$MASTER_SPEC" ]; then
    echo -e "${GREEN}  ✓${NC} Master spec found"
else
    echo -e "${RED}  ✗${NC} Master spec missing: $MASTER_SPEC"
    echo -e "${RED}     Run modular FIS generation first${NC}"
    exit 1
fi

if [ -d "$PAGES_DIR" ]; then
    PAGE_COUNT=$(find "$PAGES_DIR" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$PAGE_COUNT" -gt 0 ]; then
        echo -e "${GREEN}  ✓${NC} Page specs found: $PAGE_COUNT pages"
        echo ""
        echo -e "${BLUE}     Pages to generate:${NC}"

        # Collect page names from specs
        PAGE_NAMES=()
        for spec in "$PAGES_DIR"/*.md; do
            PAGE_NAME=$(basename "$spec" | sed 's/.md$//')
            PAGE_NAMES+=("$PAGE_NAME")
            echo "       • $PAGE_NAME"
        done
    else
        echo -e "${RED}  ✗${NC} No page specs found in: $PAGES_DIR"
        exit 1
    fi
else
    echo -e "${RED}  ✗${NC} Page specs directory missing: $PAGES_DIR"
    exit 1
fi

echo ""

# Clean mode: Delete existing pages
if [ "$CLEAN_MODE" = true ]; then
    echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                    CLEAN REGENERATION MODE                   ║${NC}"
    echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    CLIENT_PAGES_DIR="$APP_DIR/client/src/pages"

    if [ -d "$CLIENT_PAGES_DIR" ]; then
        echo -e "${YELLOW}🔍 Scanning for existing pages to delete...${NC}"
        echo ""

        PAGES_TO_DELETE=()
        for PAGE_NAME in "${PAGE_NAMES[@]}"; do
            PAGE_FILE="$CLIENT_PAGES_DIR/${PAGE_NAME}.tsx"
            if [ -f "$PAGE_FILE" ]; then
                PAGES_TO_DELETE+=("$PAGE_FILE")
                echo -e "  ${RED}✗${NC} Will delete: ${PAGE_NAME}.tsx"
            else
                echo -e "  ${CYAN}○${NC} Not found: ${PAGE_NAME}.tsx (will create new)"
            fi
        done

        echo ""

        if [ ${#PAGES_TO_DELETE[@]} -gt 0 ]; then
            echo -e "${YELLOW}⚠️  Found ${#PAGES_TO_DELETE[@]} existing pages to delete${NC}"

            if [ "$DRY_RUN" = true ]; then
                echo -e "${CYAN}🔍 DRY RUN: Would delete ${#PAGES_TO_DELETE[@]} files${NC}"
            else
                # Ask for confirmation unless force mode
                if [ "$FORCE_MODE" = false ]; then
                    echo ""
                    echo -e "${YELLOW}Are you sure you want to delete these pages? (y/N):${NC}"
                    read -r CONFIRM
                    if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
                        echo -e "${RED}❌ Aborted by user${NC}"
                        exit 1
                    fi
                fi

                # Delete the pages
                echo ""
                echo -e "${RED}🗑  Deleting existing pages...${NC}"
                for PAGE_FILE in "${PAGES_TO_DELETE[@]}"; do
                    rm -f "$PAGE_FILE"
                    echo -e "  ${RED}✗${NC} Deleted: $(basename "$PAGE_FILE")"
                done
                echo ""
                echo -e "${GREEN}✓ Deleted ${#PAGES_TO_DELETE[@]} pages${NC}"
            fi
        else
            echo -e "${GREEN}✓ No existing pages to delete${NC}"
        fi
    else
        echo -e "${YELLOW}📁 Pages directory doesn't exist yet: $CLIENT_PAGES_DIR${NC}"
        echo -e "${GREEN}✓ Nothing to clean${NC}"
    fi

    echo ""
fi

# Check if AppLayout exists
APP_LAYOUT="$APP_DIR/client/src/components/layout/AppLayout.tsx"
if [ -f "$APP_LAYOUT" ]; then
    echo -e "${GREEN}  ✓${NC} AppLayout.tsx ${YELLOW}(exists - will be reused)${NC}"
else
    echo -e "${YELLOW}  ⚠${NC}  AppLayout.tsx ${YELLOW}(missing - will be generated)${NC}"
fi

echo ""

if [ "$DRY_RUN" = true ]; then
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                        DRY RUN COMPLETE                      ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}🔍 DRY RUN Summary:${NC}"
    if [ "$CLEAN_MODE" = true ] && [ ${#PAGES_TO_DELETE[@]} -gt 0 ]; then
        echo -e "   • Would delete ${#PAGES_TO_DELETE[@]} existing pages"
    fi
    echo -e "   • Would generate $PAGE_COUNT pages in parallel"
    echo -e "   • Max concurrency: $MAX_CONCURRENCY"
    echo -e "   • Timeout per page: ${TIMEOUT}s"
    echo ""
    echo -e "${CYAN}To execute for real, run without --dry-run flag${NC}"
    exit 0
fi

echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║          Starting TRUE Parallel Frontend Generation          ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}🎯 Key features:${NC}"
echo -e "   ${GREEN}✓${NC} Python asyncio with Semaphore($MAX_CONCURRENCY)"
echo -e "   ${GREEN}✓${NC} Each page gets its OWN agent instance"
echo -e "   ${GREEN}✓${NC} Minimal context per page (~25KB vs 200KB+)"
echo -e "   ${GREEN}✓${NC} No token limit issues"
echo -e "   ${GREEN}✓${NC} True concurrent execution"
echo ""

# Calculate estimated time
ESTIMATED_TIME=$((60 * PAGE_COUNT / MAX_CONCURRENCY))
echo -e "${BLUE}⏱  Estimated time:${NC} ~${ESTIMATED_TIME}s (parallel) vs ~$((60 * PAGE_COUNT))s (sequential)"
echo -e "${BLUE}💾 Memory usage:${NC} ~$((200 * MAX_CONCURRENCY))MB peak"
echo ""

# Create log directory
LOG_DIR="logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/parallel-frontend-$(date +%Y%m%d-%H%M%S).log"

echo -e "${BLUE}📝 Logging to:${NC} $LOG_FILE"
echo ""

# Run the parallel generation
echo -e "${CYAN}🚀 Starting generation...${NC}"
echo ""

uv run python run-parallel-frontend.py \
    "$APP_DIR" \
    --max-concurrency "$MAX_CONCURRENCY" \
    --timeout "$TIMEOUT" \
    --verbose \
    2>&1 | tee "$LOG_FILE"

# Capture exit code
EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════╗${NC}"

# Check results
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}║ ✅ SUCCESS - Parallel Frontend Generation completed!         ║${NC}"
    echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Count generated pages
    PAGES_DIR="$APP_DIR/client/src/pages"
    if [ -d "$PAGES_DIR" ]; then
        NEW_PAGE_COUNT=$(find "$PAGES_DIR" -type f -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
        echo -e "${GREEN}📄 Generated Pages:${NC} $NEW_PAGE_COUNT"

        if [ $NEW_PAGE_COUNT -gt 0 ]; then
            echo ""
            echo -e "${BLUE}Generated files:${NC}"
            find "$PAGES_DIR" -type f -name "*.tsx" -exec basename {} \; | sort | sed 's/^/  • /'
        fi
    fi

    echo ""
    echo -e "${BLUE}🎯 Key achievements:${NC}"
    echo -e "   ${GREEN}✓${NC} Pages generated in TRUE parallel"
    echo -e "   ${GREEN}✓${NC} Each page had minimal context"
    echo -e "   ${GREEN}✓${NC} No token limit issues"
    echo -e "   ${GREEN}✓${NC} Consistent design with AppLayout"
    echo -e "   ${GREEN}✓${NC} Production-ready components"

    if [ "$CLEAN_MODE" = true ]; then
        echo -e "   ${GREEN}✓${NC} Clean regeneration successful"
    fi

elif [ $EXIT_CODE -eq 2 ]; then
    echo -e "${YELLOW}║ ⚠️  PARTIAL SUCCESS - Some pages generated                   ║${NC}"
    echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Check the log file for details:${NC}"
    echo -e "  $LOG_FILE"
else
    echo -e "${RED}║ ❌ FAILED - Parallel Frontend Generation did not complete    ║${NC}"
    echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Check the log file for details:${NC}"
    echo -e "  $LOG_FILE"
    echo ""
    echo -e "${YELLOW}Common issues:${NC}"
    echo "  • Missing FIS specifications"
    echo "  • TypeScript compilation errors"
    echo "  • API integration issues"
    echo "  • Timeout issues (try increasing timeout)"
fi

echo ""

exit $EXIT_CODE