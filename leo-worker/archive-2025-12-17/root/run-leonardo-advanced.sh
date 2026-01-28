#!/bin/bash

# Leonardo App Factory - Advanced Runner Script with Phase Selection
# This script provides full control over the Leonardo pipeline phases

# Color codes for pretty output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       🚀 Leonardo App Factory - Advanced Runner         ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to display usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -p, --prompt PROMPT         App description (default: wedding chapel platform)"
    echo "  -w, --workspace NAME        Workspace name (default: generated with timestamp)"
    echo "  -f, --frontend-port PORT    Frontend port (default: 5173)"
    echo "  -b, --backend-port PORT     Backend port (default: 8000)"
    echo "  -P, --phase NUMBER          Phase to build (1-3, default: 1)"
    echo "  -e, --entities NUMBER       Max entities per phase (default: 5)"
    echo "  -h, --help                  Show this help message"
    echo ""
    echo "Phase Descriptions:"
    echo "  Phase 1: Core MVP features (basic functionality)"
    echo "  Phase 2: Enhanced features (additional functionality)"
    echo "  Phase 3: Advanced features (full application)"
    echo ""
    echo "Examples:"
    echo "  # Build Phase 1 (MVP) with default settings"
    echo "  $0"
    echo ""
    echo "  # Build Phase 2 with custom prompt"
    echo "  $0 --phase 2 --prompt \"Create a task management app\""
    echo ""
    echo "  # Build Phase 3 with all features"
    echo "  $0 --phase 3 --workspace my-app --entities 6"
    exit 0
}

# Default values
PROMPT="Create a wedding chapel booking platform with stunning DARK THEME design following docs/design-best-practices/design-requirements.md"
WORKSPACE=""
FRONTEND_PORT=5173
BACKEND_PORT=8000
PHASE=1
MAX_ENTITIES=5

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--prompt)
            PROMPT="$2"
            shift 2
            ;;
        -w|--workspace)
            WORKSPACE="$2"
            shift 2
            ;;
        -f|--frontend-port)
            FRONTEND_PORT="$2"
            shift 2
            ;;
        -b|--backend-port)
            BACKEND_PORT="$2"
            shift 2
            ;;
        -P|--phase)
            PHASE="$2"
            shift 2
            ;;
        -e|--entities)
            MAX_ENTITIES="$2"
            shift 2
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            usage
            ;;
    esac
done

# Generate workspace name if not provided
if [ -z "$WORKSPACE" ]; then
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    WORKSPACE="app-phase${PHASE}-${TIMESTAMP}"
fi

# Validate phase number
if [[ ! "$PHASE" =~ ^[1-3]$ ]]; then
    echo -e "${RED}Error: Phase must be 1, 2, or 3${NC}"
    exit 1
fi

# Display configuration
echo -e "${GREEN}Configuration:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "📝 Prompt:        ${YELLOW}$PROMPT${NC}"
echo -e "📁 Workspace:     ${YELLOW}apps/$WORKSPACE${NC}"
echo -e "🔌 Frontend Port: ${YELLOW}$FRONTEND_PORT${NC}"
echo -e "🔌 Backend Port:  ${YELLOW}$BACKEND_PORT${NC}"
echo -e "📊 Phase:         ${YELLOW}$PHASE${NC}"
echo -e "📈 Entities/Phase:${YELLOW}$MAX_ENTITIES${NC}"
echo ""

# Describe what will be built based on phase
case $PHASE in
    1)
        echo -e "${BLUE}Phase 1 - Core MVP:${NC}"
        echo "• Basic entity models and database schema"
        echo "• Essential CRUD operations"
        echo "• Core user authentication"
        echo "• Fundamental UI components"
        echo "• ASTOUNDING dark theme design"
        ;;
    2)
        echo -e "${BLUE}Phase 2 - Enhanced Features:${NC}"
        echo "• All Phase 1 features PLUS:"
        echo "• Advanced entity relationships"
        echo "• Enhanced user interactions"
        echo "• Additional business logic"
        echo "• Richer UI components"
        echo "• Professional Unsplash imagery"
        ;;
    3)
        echo -e "${BLUE}Phase 3 - Full Application:${NC}"
        echo "• All Phase 1 & 2 features PLUS:"
        echo "• Complete feature set"
        echo "• Advanced integrations"
        echo "• Premium UI components"
        echo "• Full business functionality"
        echo "• Mind-blowing user experience"
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Confirm before proceeding
read -p "$(echo -e ${GREEN}Continue with Phase $PHASE generation? [y/N]: ${NC})" -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Generation cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}Starting Leonardo App Factory Pipeline...${NC}"
echo ""

# Run the Leonardo App Factory with specified configuration
uv run python src/app_factory_leonardo_replit/run.py \
    "$PROMPT" \
    --workspace-name "$WORKSPACE" \
    --frontend-port "$FRONTEND_PORT" \
    --backend-port "$BACKEND_PORT" \
    --phase "$PHASE" \
    --max-entities-phase1 "$MAX_ENTITIES"

# Check if the command succeeded
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           ✅ Phase $PHASE Generation Complete!            ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📁 App Location:${NC} apps/$WORKSPACE"
    echo ""
    echo -e "${YELLOW}To run your ASTOUNDING app:${NC}"
    echo -e "  ${GREEN}cd apps/$WORKSPACE/app${NC}"
    echo -e "  ${GREEN}npm install${NC}"
    echo -e "  ${GREEN}npm run dev${NC}"
    echo ""
    echo -e "${BLUE}Your app will be available at:${NC}"
    echo -e "  Frontend: ${YELLOW}http://localhost:$FRONTEND_PORT${NC}"
    echo -e "  Backend:  ${YELLOW}http://localhost:$BACKEND_PORT${NC}"
else
    echo ""
    echo -e "${RED}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║           ❌ Phase $PHASE Generation Failed              ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Check the logs for details in:${NC}"
    echo -e "  apps/$WORKSPACE/logs/"
    exit 1
fi