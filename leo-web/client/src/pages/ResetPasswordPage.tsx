import { useState, useEffect, FormEvent } from 'react';
import { useLocation } from 'wouter';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Lock, CheckCircle, XCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const { updatePassword, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check if we have a valid recovery session
    // Supabase automatically handles the token from the URL hash
    // and establishes a session when the page loads
    const checkSession = () => {
      // If user is authenticated, they have a valid recovery session
      if (isAuthenticated) {
        setIsValidSession(true);
      } else {
        // Give Supabase a moment to process the URL token
        setTimeout(() => {
          // Still not authenticated after delay - invalid or expired link
          if (!isAuthenticated) {
            setIsValidSession(false);
          }
        }, 2000);
      }
    };

    checkSession();
  }, [isAuthenticated]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword(password);
      setIsSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        setLocation('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Still checking session validity
  if (isValidSession === null) {
    return (
      <AppLayout>
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-16">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-leo-text-secondary">Verifying reset link...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Invalid or expired link
  if (isValidSession === false) {
    return (
      <AppLayout>
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-md">
            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-leo-text mb-2">Invalid or Expired Link</h2>
            <p className="text-leo-text-secondary mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Button
              onClick={() => setLocation('/login')}
              className="leo-btn-primary rounded-xl"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <AppLayout>
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-md">
            <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-leo-text mb-2">Password Updated!</h2>
            <p className="text-leo-text-secondary">
              Your password has been successfully updated. Redirecting to login...
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-16 relative">
        {/* Background effects */}
        <div className="absolute top-1/4 -left-32 w-80 h-80 bg-purple-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-cyan-500/15 rounded-full blur-[100px]" />

        <div className="w-full max-w-md relative z-10 animate-fade-in-up">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-glow-md">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-leo-text mb-2">Reset Password</h1>
            <p className="text-leo-text-secondary">Enter your new password below</p>
          </div>

          {/* Form Card */}
          <div className="leo-card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-leo-text">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-leo-text-tertiary" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-11 h-12 bg-white/5 border-white/10 text-leo-text placeholder:text-leo-text-tertiary focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-leo-text">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-leo-text-tertiary" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-11 h-12 bg-white/5 border-white/10 text-leo-text placeholder:text-leo-text-tertiary focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 animate-fade-in-up">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full leo-btn-primary h-12 text-base rounded-xl"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
