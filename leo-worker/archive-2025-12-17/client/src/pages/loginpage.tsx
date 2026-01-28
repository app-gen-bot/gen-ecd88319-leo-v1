import { useState, FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { Eye, EyeOff, XCircle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { apiClient } from '@/lib/api';

export default function LoginPage() {
  const [, setLocation] = useLocation();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Field validation errors
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Extract redirect parameter from URL
  const getRedirectUrl = () => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('redirect') || '/dashboard';
  };

  const redirectUrl = getRedirectUrl();
  const showGuestLink = new URLSearchParams(window.location.search).has('redirect');

  // Email validation
  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError(null);
    return true;
  };

  // Password validation
  const validatePassword = (value: string): boolean => {
    if (!value) {
      setPasswordError('Password is required');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setError(null);

    // Validate fields
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.auth.login({
        body: {
          email,
          password,
          rememberMe
        }
      });

      // Success - redirect to intended destination
      setLocation(redirectUrl);
    } catch (err: any) {
      setIsLoading(false);

      // Handle specific error codes
      if (err.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (err.status === 429) {
        setError('Too many login attempts. Please try again in a few minutes.');
      } else {
        setError('Unable to sign in. Please check your connection and try again.');
      }
    }
  };

  // Check if form is valid
  const isFormValid = email.trim() !== '' && password.trim() !== '';

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8">
        {/* Centered Card Container */}
        <div className="w-full max-w-[480px] bg-slate-800 border border-slate-700 rounded-xl p-8">
          {/* Page Title */}
          <h1 className="text-4xl font-bold text-neutral-50 text-center mb-2">
            Welcome Back
          </h1>

          {/* Subtitle */}
          <p className="text-base text-slate-400 text-center mb-8">
            Sign in to manage your bookings
          </p>

          {/* Error Message Container */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 mb-6 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-500 flex-1">{error}</p>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Email Input */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-400 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) validateEmail(e.target.value);
                }}
                onBlur={(e) => validateEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isLoading}
                className={`w-full bg-slate-800 border ${
                  emailError ? 'border-red-500' : 'border-slate-700'
                } text-neutral-50 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-3 focus:ring-violet-500/20 focus:border-violet-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed`}
              />
              {emailError && (
                <p className="text-sm text-red-500 mt-1">{emailError}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-400 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) validatePassword(e.target.value);
                  }}
                  onBlur={(e) => validatePassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className={`w-full bg-slate-800 border ${
                    passwordError ? 'border-red-500' : 'border-slate-700'
                  } text-neutral-50 rounded-lg px-4 py-3 pr-12 text-base focus:outline-none focus:ring-3 focus:ring-violet-500/20 focus:border-violet-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-neutral-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-violet-500/30 rounded"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-sm text-red-500 mt-1">{passwordError}</p>
              )}
            </div>

            {/* Form Options Row */}
            <div className="flex items-center justify-between mb-6">
              {/* Remember Me Checkbox */}
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="w-5 h-5 bg-slate-800 border-2 border-slate-700 rounded text-violet-500 focus:ring-3 focus:ring-violet-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <span className="ml-2 text-base text-neutral-50 select-none">
                  Remember me
                </span>
              </label>

              {/* Forgot Password Link */}
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-violet-500 hover:text-violet-600 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/30 rounded px-1"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="w-full bg-violet-500 hover:bg-violet-600 text-neutral-50 font-semibold rounded-lg px-6 py-3 text-base transition-colors disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed focus:outline-none focus:ring-3 focus:ring-violet-500/30 flex items-center justify-center gap-2"
            >
              {isLoading && (
                <div className="w-5 h-5 border-2 border-neutral-50 border-t-transparent rounded-full animate-spin" />
              )}
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="border-t border-slate-700 my-6" />

          {/* Sign Up Link */}
          <p className="text-base text-slate-400 text-center">
            Don't have an account?{' '}
            <Link
              href="/sign-up"
              className="font-semibold text-violet-500 hover:text-violet-600 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/30 rounded px-1"
            >
              Sign up
            </Link>
          </p>

          {/* Guest Checkout Link */}
          {showGuestLink && (
            <p className="text-sm text-center mt-4">
              or{' '}
              <Link
                href={redirectUrl}
                className="text-violet-500 hover:text-violet-600 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/30 rounded px-1"
              >
                Continue as guest
              </Link>
            </p>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block text-violet-500 hover:text-violet-600 hover:underline transition-colors mb-4 focus:outline-none focus:ring-2 focus:ring-violet-500/30 rounded px-2 py-1"
          >
            ← Back to Home
          </Link>

          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/30 rounded px-1"
            >
              Privacy Policy
            </a>
            <span>•</span>
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/30 rounded px-1"
            >
              Terms of Service
            </a>
          </div>
        </footer>
      </div>
    </AppLayout>
  );
}
