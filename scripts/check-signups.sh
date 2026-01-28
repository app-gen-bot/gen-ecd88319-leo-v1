#!/bin/bash
# Check Leo SaaS signups and pending approvals
# Run: ./scripts/check-signups.sh
# Or set up as daily cron: 0 9 * * * /path/to/check-signups.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ID="fwhwbmjwbdvmnrpszirc"

echo -e "${BLUE}=== Leo SaaS Signup Report ===${NC}"
echo "Generated: $(date)"
echo ""

# Use Claude Code's Supabase MCP to query
# This script outputs what to query - run the actual queries via MCP

cat << 'EOF'
Run these queries via Supabase MCP (project: fwhwbmjwbdvmnrpszirc):

1. PENDING APPROVALS (need action):
   SELECT email, name, created_at
   FROM profiles
   WHERE status = 'pending_approval'
   ORDER BY created_at DESC;

2. NEW SIGNUPS (last 24 hours):
   SELECT email, name, status, created_at
   FROM profiles
   WHERE created_at > NOW() - INTERVAL '24 hours'
   ORDER BY created_at DESC;

3. NEW SIGNUPS (last 7 days):
   SELECT email, name, status, created_at
   FROM profiles
   WHERE created_at > NOW() - INTERVAL '7 days'
   ORDER BY created_at DESC;

4. ALL USERS SUMMARY:
   SELECT status, COUNT(*) as count
   FROM profiles
   GROUP BY status;

To approve a user:
   UPDATE profiles
   SET status = 'approved', credits_remaining = 500, updated_at = NOW()
   WHERE email = 'user@example.com';
EOF
