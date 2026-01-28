#!/bin/bash
set -e

# Get Recent Logs - Deterministic Log Discovery and Reading
# Full path: /home/jake/WORK/APP_GEN_SAAS/V1/infra/scripts/get-recent-logs.sh
#
# Finds all relevant log groups and shows recent log entries.
# Solves the problem of CDK-generated log group names that change on deployment.

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# AWS Configuration
AWS_PROFILE="${AWS_PROFILE:-jake-dev}"
AWS_REGION="${AWS_REGION:-us-east-1}"

# Parse arguments
MINUTES="${1:-5}"  # Default to last 5 minutes
COMPONENT="${2:-all}"  # all, saas, or generator
FILTER="${3:-}"  # Optional grep filter

echo -e "${CYAN}======================================${NC}"
echo -e "${CYAN}Recent Logs Discovery${NC}"
echo -e "${CYAN}======================================${NC}"
echo -e "${BLUE}Time range: Last ${MINUTES} minutes${NC}"
echo -e "${BLUE}Component: ${COMPONENT}${NC}"
if [ -n "$FILTER" ]; then
  echo -e "${BLUE}Filter: ${FILTER}${NC}"
fi
echo ""

# Function to get logs from a log group
get_logs() {
  local log_group=$1
  local component_name=$2
  local filter=$3

  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}📋 ${component_name}${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}Log Group: ${log_group}${NC}"
  echo ""

  # Get logs
  if [ -n "$filter" ]; then
    echo -e "${YELLOW}Filtering for: ${filter}${NC}"
    aws logs tail "$log_group" \
      --since "${MINUTES}m" \
      --profile "$AWS_PROFILE" \
      --region "$AWS_REGION" \
      --format short 2>&1 | grep -E "$filter" || echo -e "${YELLOW}No matching logs found${NC}"
  else
    aws logs tail "$log_group" \
      --since "${MINUTES}m" \
      --profile "$AWS_PROFILE" \
      --region "$AWS_REGION" \
      --format short 2>&1 | head -200 || echo -e "${YELLOW}No logs found${NC}"
  fi

  echo ""
}

# Find Orchestrator (SAAS) log groups
if [ "$COMPONENT" = "all" ] || [ "$COMPONENT" = "saas" ] || [ "$COMPONENT" = "orchestrator" ]; then
  echo -e "${GREEN}🔍 Finding Orchestrator log groups...${NC}"
  SAAS_LOG_GROUPS=$(aws logs describe-log-groups \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" \
    --query 'logGroups[?contains(logGroupName, `AppGenSaasTaskDefappgensaasappLogGroup`) || contains(logGroupName, `app-gen-saas-app`)].logGroupName' \
    --output text 2>&1)

  if [ -n "$SAAS_LOG_GROUPS" ]; then
    for log_group in $SAAS_LOG_GROUPS; do
      get_logs "$log_group" "ORCHESTRATOR (SAAS)" "$FILTER"
    done
  else
    echo -e "${YELLOW}⚠️  No orchestrator log groups found${NC}"
    echo ""
  fi
fi

# Find Generator log groups
if [ "$COMPONENT" = "all" ] || [ "$COMPONENT" = "generator" ] || [ "$COMPONENT" = "gen" ]; then
  echo -e "${GREEN}🔍 Finding Generator log groups...${NC}"
  GEN_LOG_GROUPS=$(aws logs describe-log-groups \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" \
    --query 'logGroups[?contains(logGroupName, `AppGeneratorTaskDefappgeneratorLogGroup`) || contains(logGroupName, `app-gen-saas-generator`)].logGroupName' \
    --output text 2>&1)

  if [ -n "$GEN_LOG_GROUPS" ]; then
    for log_group in $GEN_LOG_GROUPS; do
      get_logs "$log_group" "GENERATOR" "$FILTER"
    done
  else
    echo -e "${YELLOW}⚠️  No generator log groups found${NC}"
    echo ""
  fi
fi

# Summary
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Summary${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓${NC} Searched last ${MINUTES} minutes"
if [ "$COMPONENT" = "all" ]; then
  echo -e "${GREEN}✓${NC} Components: Orchestrator + Generator"
else
  echo -e "${GREEN}✓${NC} Component: ${COMPONENT}"
fi
echo ""
echo -e "${CYAN}Usage:${NC}"
echo "  $0 [minutes] [component] [filter]"
echo ""
echo -e "${CYAN}Examples:${NC}"
echo "  $0 10                    # Last 10 minutes, all components"
echo "  $0 5 generator           # Last 5 minutes, generator only"
echo "  $0 5 saas 'error'        # Last 5 minutes, saas, filter for 'error'"
echo "  $0 10 all 'config|validation|ANTHROPIC'  # Config validation logs"
echo ""
