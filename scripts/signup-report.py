#!/usr/bin/env python3
"""
Leo SaaS Signup Report
Queries Supabase directly and outputs signup/approval status.

Usage:
    ./scripts/signup-report.py              # Full report
    ./scripts/signup-report.py --pending    # Only pending approvals
    ./scripts/signup-report.py --json       # JSON output (for automation)

Requires:
    pip install supabase python-dotenv

Environment:
    SUPABASE_URL - Supabase project URL
    SUPABASE_SERVICE_KEY - Service role key (from dashboard)
"""

import os
import sys
import json
import argparse
from datetime import datetime, timedelta

try:
    from supabase import create_client, Client
except ImportError:
    print("ERROR: supabase package not installed")
    print("Run: pip install supabase")
    sys.exit(1)

# Leo-dev Supabase project
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://fwhwbmjwbdvmnrpszirc.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

def get_client() -> Client:
    if not SUPABASE_KEY:
        print("ERROR: SUPABASE_SERVICE_KEY environment variable not set")
        print("Get it from: https://supabase.com/dashboard/project/fwhwbmjwbdvmnrpszirc/settings/api")
        sys.exit(1)
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def get_pending_approvals(client: Client) -> list:
    response = client.table("profiles").select("*").eq("status", "pending_approval").order("created_at", desc=True).execute()
    return response.data

def get_recent_signups(client: Client, days: int = 7) -> list:
    cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
    response = client.table("profiles").select("*").gte("created_at", cutoff).order("created_at", desc=True).execute()
    return response.data

def get_all_users(client: Client) -> list:
    response = client.table("profiles").select("*").order("created_at", desc=True).execute()
    return response.data

def format_date(iso_date: str) -> str:
    dt = datetime.fromisoformat(iso_date.replace("Z", "+00:00"))
    return dt.strftime("%Y-%m-%d %H:%M")

def print_report(pending: list, recent: list, all_users: list):
    print("=" * 60)
    print("LEO SAAS SIGNUP REPORT")
    print(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # Summary
    status_counts = {}
    for user in all_users:
        status = user.get("status", "unknown")
        status_counts[status] = status_counts.get(status, 0) + 1

    print(f"\nTOTAL USERS: {len(all_users)}")
    for status, count in sorted(status_counts.items()):
        emoji = {"approved": "✓", "pending_approval": "⏳", "rejected": "✗", "suspended": "⚠"}.get(status, "?")
        print(f"  {emoji} {status}: {count}")

    # Pending approvals (ACTION NEEDED)
    print(f"\n{'=' * 60}")
    print(f"PENDING APPROVALS ({len(pending)}) - ACTION NEEDED")
    print("=" * 60)
    if pending:
        for user in pending:
            print(f"  📧 {user['email']}")
            print(f"     Name: {user.get('name') or 'N/A'}")
            print(f"     Signed up: {format_date(user['created_at'])}")
            print()
        print("To approve, run SQL:")
        print("  UPDATE profiles SET status='approved', credits_remaining=500, updated_at=NOW()")
        print("  WHERE email = 'user@example.com';")
    else:
        print("  No pending approvals!")

    # Recent signups (last 7 days)
    print(f"\n{'=' * 60}")
    print(f"RECENT SIGNUPS - Last 7 Days ({len(recent)})")
    print("=" * 60)
    if recent:
        for user in recent:
            status_emoji = {"approved": "✓", "pending_approval": "⏳", "rejected": "✗"}.get(user["status"], "?")
            print(f"  {status_emoji} {user['email']} ({user['status']}) - {format_date(user['created_at'])}")
    else:
        print("  No signups in the last 7 days")

    print()

def main():
    parser = argparse.ArgumentParser(description="Leo SaaS Signup Report")
    parser.add_argument("--pending", action="store_true", help="Only show pending approvals")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    parser.add_argument("--days", type=int, default=7, help="Days to look back for recent signups")
    args = parser.parse_args()

    client = get_client()

    pending = get_pending_approvals(client)

    if args.pending:
        if args.json:
            print(json.dumps(pending, indent=2, default=str))
        else:
            if pending:
                print(f"PENDING APPROVALS ({len(pending)}):")
                for user in pending:
                    print(f"  {user['email']} - {format_date(user['created_at'])}")
            else:
                print("No pending approvals")
        return

    recent = get_recent_signups(client, args.days)
    all_users = get_all_users(client)

    if args.json:
        print(json.dumps({
            "generated": datetime.now().isoformat(),
            "pending_approvals": pending,
            "recent_signups": recent,
            "total_users": len(all_users),
            "status_breakdown": {s: sum(1 for u in all_users if u["status"] == s) for s in set(u["status"] for u in all_users)}
        }, indent=2, default=str))
    else:
        print_report(pending, recent, all_users)

if __name__ == "__main__":
    main()
