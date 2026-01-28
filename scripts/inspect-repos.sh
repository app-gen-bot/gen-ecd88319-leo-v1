#!/bin/bash
#
# inspect-repos.sh - Clone and inspect generated app and artifacts repos
#
# Usage:
#   ./scripts/inspect-repos.sh gen-ecd88319-2ca2741b
#   ./scripts/inspect-repos.sh gen-ecd88319-2ca2741b 4    # custom depth
#
# Clones both repos to /tmp/leo-repo-inspect/ and shows tree structure.
# Reuses same tmp location to save disk space.
# Creates report in jake/reports/inspect-<repo>-<timestamp>.md
#
# Token: Uses GITHUB_BOT_TOKEN env var if set, otherwise fetches from AWS Secrets Manager.

set -e

# Configuration
INSPECT_DIR="/tmp/leo-repo-inspect"
REPORT_DIR="$(cd "$(dirname "$0")/.." && pwd)/jake/reports"
GITHUB_ORG="app-gen-bot"
AWS_PROFILE="${AWS_PROFILE:-jake-dev}"
AWS_REGION="${AWS_REGION:-us-east-1}"
DEFAULT_DEPTH=3

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Usage
if [[ -z "$1" ]]; then
    echo "Usage: $0 <repo-name> [depth]"
    echo "Example: $0 gen-ecd88319-2ca2741b"
    echo "Example: $0 gen-ecd88319-2ca2741b 4"
    exit 1
fi

REPO_NAME="$1"
DEPTH="${2:-$DEFAULT_DEPTH}"

APP_REPO="${REPO_NAME}"
ARTIFACTS_REPO="${REPO_NAME}-artifacts"

log_info "Inspecting: $REPO_NAME (depth: $DEPTH)"

# Get GitHub token - prefer env var, fallback to AWS Secrets Manager
if [[ -n "$GITHUB_BOT_TOKEN" ]]; then
    GITHUB_TOKEN="$GITHUB_BOT_TOKEN"
    log_success "Using GITHUB_BOT_TOKEN from environment"
else
    log_info "Fetching GitHub token from AWS Secrets Manager..."
    GITHUB_TOKEN=$(aws secretsmanager get-secret-value \
        --secret-id leo/github-bot-token \
        --region "$AWS_REGION" \
        --profile "$AWS_PROFILE" \
        --query SecretString \
        --output text 2>/dev/null)

    if [[ -z "$GITHUB_TOKEN" ]]; then
        log_error "Failed to get GitHub token from AWS Secrets Manager"
        log_error "Either set GITHUB_BOT_TOKEN env var or ensure leo/github-bot-token exists"
        exit 1
    fi
    log_success "GitHub token retrieved from AWS"
fi

# Prepare inspect directory
log_info "Preparing $INSPECT_DIR..."
rm -rf "$INSPECT_DIR"
mkdir -p "$INSPECT_DIR"

# Clone app repo
APP_URL="https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_ORG}/${APP_REPO}.git"
APP_DIR="$INSPECT_DIR/$APP_REPO"

log_info "Cloning app repo: $APP_REPO"
if git clone --quiet "$APP_URL" "$APP_DIR" 2>/dev/null; then
    log_success "App repo cloned"
else
    log_warn "App repo not found or clone failed"
fi

# Clone artifacts repo
ARTIFACTS_URL="https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_ORG}/${ARTIFACTS_REPO}.git"
ARTIFACTS_DIR="$INSPECT_DIR/$ARTIFACTS_REPO"

log_info "Cloning artifacts repo: $ARTIFACTS_REPO"
if git clone --quiet "$ARTIFACTS_URL" "$ARTIFACTS_DIR" 2>/dev/null; then
    log_success "Artifacts repo cloned"
else
    log_warn "Artifacts repo not found or clone failed"
fi

# Create report directory and file
mkdir -p "$REPORT_DIR"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REPORT_FILE="$REPORT_DIR/inspect-${REPO_NAME}-${TIMESTAMP}.md"

# Function to write to both console and report
report() {
    echo -e "$1"
    # Strip color codes for report file
    echo "$1" | sed 's/\x1b\[[0-9;]*m//g' >> "$REPORT_FILE"
}

# Start report
cat > "$REPORT_FILE" << EOF
# Repo Inspection Report

**Repo:** $REPO_NAME
**Date:** $(date '+%Y-%m-%d %H:%M:%S')
**Depth:** $DEPTH

---

EOF

echo ""
echo "=========================================="
echo "  INSPECTION RESULTS"
echo "=========================================="
echo ""

# Show app repo tree
if [[ -d "$APP_DIR" ]]; then
    report "## APP REPO: $APP_REPO"
    report ""

    echo '```' >> "$REPORT_FILE"
    if command -v tree &> /dev/null; then
        # Use tree with -a to show hidden files, skip the first line (.)
        (cd "$APP_DIR" && tree -a -L "$DEPTH" --dirsfirst -I '.git' --noreport .) | tail -n +2 | tee -a "$REPORT_FILE"
    else
        # Fallback: format find output as relative paths, skip the .
        (cd "$APP_DIR" && find . -maxdepth "$DEPTH" -not -path './.git/*' -not -name '.git' -not -name '.' | sort | head -100) | tee -a "$REPORT_FILE"
    fi
    echo '```' >> "$REPORT_FILE"
    report ""

    # Show recent commits
    report "### Recent commits"
    echo '```' >> "$REPORT_FILE"
    (cd "$APP_DIR" && git log --oneline -10) | tee -a "$REPORT_FILE"
    echo '```' >> "$REPORT_FILE"
    report ""

    # Count files by type
    report "### File counts"
    echo '```' >> "$REPORT_FILE"
    echo "Total files: $(find "$APP_DIR" -type f -not -path '*/.git/*' | wc -l | tr -d ' ')" | tee -a "$REPORT_FILE"
    echo "Directories: $(find "$APP_DIR" -type d -not -path '*/.git/*' | wc -l | tr -d ' ')" | tee -a "$REPORT_FILE"
    echo '```' >> "$REPORT_FILE"
    report ""

    # Show .gitignore contents
    report "### .gitignore"
    if [[ -f "$APP_DIR/.gitignore" ]]; then
        echo '```' >> "$REPORT_FILE"
        cat "$APP_DIR/.gitignore" | tee -a "$REPORT_FILE"
        echo '```' >> "$REPORT_FILE"
    else
        report "_Not found_"
    fi
    report ""

    # Show .env contents (redact sensitive values)
    report "### .env"
    if [[ -f "$APP_DIR/.env" ]]; then
        echo '```' >> "$REPORT_FILE"
        # Show keys and partial values (first 20 chars + ...)
        while IFS= read -r line || [[ -n "$line" ]]; do
            if [[ "$line" =~ ^[A-Z_]+= ]]; then
                key="${line%%=*}"
                value="${line#*=}"
                # Show first 20 chars of value
                if [[ ${#value} -gt 20 ]]; then
                    echo "${key}=${value:0:20}..." | tee -a "$REPORT_FILE"
                else
                    echo "${key}=${value}" | tee -a "$REPORT_FILE"
                fi
            else
                echo "$line" | tee -a "$REPORT_FILE"
            fi
        done < "$APP_DIR/.env"
        echo '```' >> "$REPORT_FILE"
    else
        report "_Not found_"
    fi
    report ""

    # Show .dockerignore contents
    report "### .dockerignore"
    if [[ -f "$APP_DIR/.dockerignore" ]]; then
        echo '```' >> "$REPORT_FILE"
        cat "$APP_DIR/.dockerignore" | tee -a "$REPORT_FILE"
        echo '```' >> "$REPORT_FILE"
    else
        report "_Not found_"
    fi
    report ""
else
    report "## APP REPO: NOT FOUND"
    log_warn "App repo not available"
fi

# Show artifacts repo tree
if [[ -d "$ARTIFACTS_DIR" ]]; then
    report "---"
    report ""
    report "## ARTIFACTS REPO: $ARTIFACTS_REPO"
    report ""

    echo '```' >> "$REPORT_FILE"
    if command -v tree &> /dev/null; then
        # Use tree with -a to show hidden files, skip the first line (.)
        (cd "$ARTIFACTS_DIR" && tree -a -L "$DEPTH" --dirsfirst -I '.git' --noreport .) | tail -n +2 | tee -a "$REPORT_FILE"
    else
        # Fallback: format find output as relative paths, skip the .
        (cd "$ARTIFACTS_DIR" && find . -maxdepth "$DEPTH" -not -path './.git/*' -not -name '.git' -not -name '.' | sort | head -100) | tee -a "$REPORT_FILE"
    fi
    echo '```' >> "$REPORT_FILE"
    report ""

    # Show recent commits
    report "### Recent commits"
    echo '```' >> "$REPORT_FILE"
    (cd "$ARTIFACTS_DIR" && git log --oneline -10) | tee -a "$REPORT_FILE"
    echo '```' >> "$REPORT_FILE"
    report ""

    # Count files
    report "### File counts"
    echo '```' >> "$REPORT_FILE"
    echo "Total files: $(find "$ARTIFACTS_DIR" -type f -not -path '*/.git/*' | wc -l | tr -d ' ')" | tee -a "$REPORT_FILE"
    echo "Sessions: $(find "$ARTIFACTS_DIR" -name "*.jsonl" | wc -l | tr -d ' ')" | tee -a "$REPORT_FILE"
    echo '```' >> "$REPORT_FILE"
    report ""
else
    report "---"
    report ""
    report "## ARTIFACTS REPO: NOT FOUND"
    log_warn "Artifacts repo not available"
fi

echo "=========================================="
echo "  Repos cloned to: $INSPECT_DIR"
echo "  Report saved to: $REPORT_FILE"
echo "=========================================="
