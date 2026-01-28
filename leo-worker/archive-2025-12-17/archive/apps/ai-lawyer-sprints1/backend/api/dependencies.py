"""
API dependencies - NextAuth integration
"""

from utils.nextauth import get_current_user_nextauth, get_current_active_user_nextauth

# Re-export NextAuth dependencies
get_current_user = get_current_user_nextauth
get_current_active_user = get_current_active_user_nextauth