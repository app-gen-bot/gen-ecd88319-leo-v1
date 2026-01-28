import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { XCircle, Ban, Mail, RefreshCw, LogOut } from 'lucide-react';

export default function AccountInactivePage() {
  const { user, profile, isAuthenticated, isApproved, isRejected, isSuspended, signOut, refreshProfile } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      setLocation('/login');
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

  // Determine the state
  const isInactive = isRejected || isSuspended;
  const statusMessage = isRejected
    ? 'Your access request was not approved'
    : isSuspended
    ? 'Your account has been suspended'
    : 'Your account is inactive';

  const statusDescription = isRejected
    ? "We appreciate your interest in Leo, but we're unable to approve your access request at this time."
    : isSuspended
    ? 'Your account has been temporarily suspended. Please contact support for more information.'
    : 'Your account is currently inactive.';

  // Don't render if not in an inactive state
  if (!isInactive) {
    return null;
  }

  const Icon = isRejected ? XCircle : Ban;
  const iconBgColor = isRejected ? 'bg-red-500/20' : 'bg-orange-500/20';
  const iconColor = isRejected ? 'text-red-400' : 'text-orange-400';
  const borderColor = isRejected ? 'border-red-500/30' : 'border-orange-500/30';
  const bgColor = isRejected ? 'bg-red-500/10' : 'bg-orange-500/10';
  const textColor = isRejected ? 'text-red-400' : 'text-orange-400';

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-16 relative">
        {/* Background effects */}
        <div className="absolute top-1/4 -left-32 w-80 h-80 bg-red-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px]" />

        <div className="w-full max-w-md relative z-10 animate-fade-in-up">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className={`w-20 h-20 rounded-full ${iconBgColor} flex items-center justify-center`}>
              <Icon className={`h-10 w-10 ${iconColor}`} />
            </div>
          </div>

          {/* Content Card */}
          <div className="leo-card p-8 text-center">
            <h1 className="text-2xl font-bold text-leo-text mb-3">
              {statusMessage}
            </h1>

            <p className="text-leo-text-secondary mb-6">
              {statusDescription}
            </p>

            <div className={`${bgColor} border ${borderColor} rounded-xl p-4 mb-6`}>
              <div className={`flex items-center justify-center gap-2 ${textColor}`}>
                <Mail className="h-4 w-4" />
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
              <p className={`text-xs ${textColor}/70 mt-2`}>
                Status: <span className="font-semibold capitalize">{profile?.status?.replace('_', ' ')}</span>
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
                Need help? Contact us at{' '}
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
