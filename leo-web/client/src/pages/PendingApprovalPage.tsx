import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Clock, Mail, RefreshCw, LogOut } from 'lucide-react';

export default function PendingApprovalPage() {
  const { user, isAuthenticated, isApproved, isPending, signOut, refreshProfile } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // If not authenticated, redirect to request access
    if (!isAuthenticated) {
      setLocation('/request-access');
      return;
    }

    // If approved, redirect to apps
    if (isApproved) {
      setLocation('/apps');
    }
  }, [isAuthenticated, isApproved, setLocation]);

  const handleRefresh = async () => {
    await refreshProfile();
  };

  const handleSignOut = async () => {
    await signOut();
    setLocation('/');
  };

  // Don't render if not pending
  if (!isPending) {
    return null;
  }

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-16 relative">
        {/* Background effects */}
        <div className="absolute top-1/4 -left-32 w-80 h-80 bg-amber-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-purple-500/15 rounded-full blur-[100px]" />

        <div className="w-full max-w-md relative z-10 animate-fade-in-up">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Clock className="h-10 w-10 text-amber-400" />
            </div>
          </div>

          {/* Content Card */}
          <div className="leo-card p-8 text-center">
            <h1 className="text-2xl font-bold text-leo-text mb-3">
              Access Request Pending
            </h1>

            <p className="text-leo-text-secondary mb-6">
              Thank you for your interest in Leo! Your request to join our beta program is being reviewed.
            </p>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-amber-400">
                <Mail className="h-4 w-4" />
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
              <p className="text-xs text-amber-400/70 mt-2">
                We'll notify you at this email when your access is approved.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="w-full h-11 rounded-xl bg-white/5 border-white/10 text-leo-text hover:bg-white/10 hover:border-white/20"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Status
              </Button>

              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="w-full h-11 rounded-xl text-leo-text-secondary hover:text-leo-text hover:bg-white/5"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-sm text-leo-text-tertiary">
                Questions? Contact us at{' '}
                <a href="mailto:support@leo.ai" className="text-cyan-400 hover:text-cyan-300">
                  support@leo.ai
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
