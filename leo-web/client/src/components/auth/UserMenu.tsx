import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { LogOut, User, Coins, BarChart3, Settings } from 'lucide-react';

export function UserMenu() {
  const { user, profile, creditsRemaining, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  const isDeveloper = profile?.role === 'admin' || profile?.role === 'dev';

  return (
    <div className="flex items-center gap-3">
      {/* Settings Link (for dev/admin users) */}
      {isDeveloper && (
        <Link href="/settings">
          <Button
            variant="ghost"
            size="sm"
            className="text-leo-text-tertiary hover:text-leo-text hover:bg-white/5"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
      )}

      {/* Admin Analytics Link */}
      {isDeveloper && (
        <Link href="/admin/analytics">
          <Button
            variant="ghost"
            size="sm"
            className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
        </Link>
      )}

      {/* Credits Display */}
      {profile && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <Coins className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-sm font-medium text-amber-400">
            {creditsRemaining}
          </span>
        </div>
      )}

      {/* User Info */}
      <div className="flex items-center gap-2 text-sm px-2">
        <User className="h-4 w-4 text-leo-text-tertiary" />
        <span className="text-leo-text-secondary max-w-[120px] truncate">
          {profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0]}
        </span>
      </div>

      {/* Logout Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="text-leo-text-tertiary hover:text-leo-text hover:bg-white/5"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
