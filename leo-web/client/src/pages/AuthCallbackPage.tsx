import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const { isAuthenticated, isApproved, isPending, isRejected, isSuspended, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check for error in URL params
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    if (error) {
      setStatus('error');
      setErrorMessage(errorDescription || error);
      return;
    }

    // Wait for auth to finish loading
    if (isLoading) {
      return;
    }

    // If authenticated, redirect based on status
    if (isAuthenticated) {
      setStatus('success');

      // Small delay for UX
      setTimeout(() => {
        if (isPending) {
          setLocation('/pending-approval');
        } else if (isRejected || isSuspended) {
          setLocation('/account-inactive');
        } else if (isApproved) {
          setLocation('/apps');
        } else {
          // Default to pending (new users without profile yet)
          setLocation('/pending-approval');
        }
      }, 1000);
    } else {
      // Not authenticated after loading - something went wrong
      setStatus('error');
      setErrorMessage('Authentication failed. Please try again.');
    }
  }, [isAuthenticated, isApproved, isPending, isRejected, isSuspended, isLoading, setLocation]);

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-16">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 text-cyan-400 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-leo-text mb-2">
                Completing sign in...
              </h2>
              <p className="text-leo-text-secondary">
                Please wait while we verify your account.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-leo-text mb-2">
                Sign in successful!
              </h2>
              <p className="text-leo-text-secondary">
                Redirecting you now...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-leo-text mb-2">
                Sign in failed
              </h2>
              <p className="text-leo-text-secondary mb-4">
                {errorMessage || 'An unexpected error occurred.'}
              </p>
              <button
                onClick={() => setLocation('/request-access')}
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Try again
              </button>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
