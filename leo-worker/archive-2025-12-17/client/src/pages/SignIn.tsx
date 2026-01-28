import { useState, useEffect, FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { apiClient } from '@/lib/api';

export function SignIn() {
  const [, navigate] = useLocation();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRedirectInfo, setShowRedirectInfo] = useState(false);

  // Get redirect parameter from URL
  const getRedirectUrl = (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('redirect');
  };

  // Validate redirect URL for security
  const validateRedirect = (url: string | null): string => {
    if (!url || !url.startsWith('/')) {
      return '/dashboard';
    }
    return url;
  };

  // Email validation helper
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await apiClient.auth.getCurrentUser();

        if (data && data.id) {
          const redirect = getRedirectUrl();
          navigate(validateRedirect(redirect));
        }
      } catch {
        // Not authenticated, stay on login page (expected)
        console.log('User not authenticated, showing login form');
      }
    };

    checkAuth();

    // Show redirect info if redirect parameter exists
    const redirect = getRedirectUrl();
    if (redirect) {
      setShowRedirectInfo(true);
    }
  }, [navigate]);

  // Clear error when user starts typing
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [email, password]);

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client-side validation
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    // Set loading state
    setIsLoading(true);
    setError(null);

    try {
      // API call
      const { data } = await apiClient.auth.login({
        body: {
          email: trimmedEmail,
          password: password
        }
      });

      // Success - store token
      localStorage.setItem('authToken', data.token);

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Get redirect parameter and navigate
      const redirect = getRedirectUrl();
      navigate(validateRedirect(redirect));

    } catch (err: any) {
      // Error handling
      setIsLoading(false);

      if (err.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (err.response?.status === 429) {
        setError('Too many login attempts. Please try again in 15 minutes.');
      } else if (!navigator.onLine) {
        setError('No internet connection. Please check your network.');
      } else {
        setError('Unable to sign in. Please try again later.');
      }

      console.error('Login error:', err);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-950 flex flex-col">
        {/* Simple Header */}
        <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-center px-8">
          <Link href="/">
            <a className="text-2xl font-bold text-neutral-50 hover:text-violet-500 transition-colors">
              ChapelBook
            </a>
          </Link>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-[480px]">
            {/* Redirect Info Banner */}
            {showRedirectInfo && (
              <div className="mb-6 bg-blue-500/10 border border-blue-500 border-l-4 rounded-lg p-3 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <p className="text-blue-500 text-sm">Please sign in to continue</p>
              </div>
            )}

            {/* Form Card */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-lg">
              {/* Card Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-neutral-50 leading-tight mb-2">
                  Welcome Back
                </h1>
                <p className="text-base text-slate-400">
                  Sign in to your account
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="mb-6 bg-red-500/10 border border-red-500 border-l-4 rounded-lg p-3 flex items-start gap-3"
                >
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-500 text-sm flex-1">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                    aria-label="Dismiss error"
                  >
                    ×
                  </button>
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
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={isLoading}
                    aria-required="true"
                    aria-label="Email address"
                    className={`w-full bg-slate-800 border ${
                      error && !email ? 'border-red-500' : 'border-slate-700'
                    } text-neutral-50 rounded-lg px-4 py-3 text-base placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors`}
                  />
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
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                      aria-required="true"
                      aria-label="Password"
                      className={`w-full bg-slate-800 border ${
                        error && !password ? 'border-red-500' : 'border-slate-700'
                      } text-neutral-50 rounded-lg px-4 py-3 pr-12 text-base placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-violet-500/50 rounded p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={isLoading}
                      aria-label="Remember me on this device"
                      className="h-5 w-5 rounded bg-slate-800 border-2 border-slate-700 text-violet-500 focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 text-base text-neutral-50 cursor-pointer select-none"
                    >
                      Remember me
                    </label>
                  </div>

                  <Link href="/forgot-password">
                    <a
                      className="text-sm font-medium text-violet-500 hover:text-violet-600 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/50 rounded px-1"
                      tabIndex={isLoading ? -1 : 0}
                    >
                      Forgot password?
                    </a>
                  </Link>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  aria-busy={isLoading}
                  aria-label={isLoading ? 'Signing in, please wait' : 'Sign in'}
                  className="w-full bg-violet-500 hover:bg-violet-600 text-neutral-50 font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-violet-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2 focus:ring-offset-slate-950 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-800 text-slate-500">or</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <span className="text-base text-slate-400">Don't have an account? </span>
                <Link href="/sign-up">
                  <a
                    className="text-base font-medium text-violet-500 hover:text-violet-600 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/50 rounded px-1"
                    tabIndex={isLoading ? -1 : 0}
                  >
                    Sign up
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* Minimal Footer */}
        <footer className="bg-slate-800 py-8">
          <div className="max-w-7xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <Link href="/">
              <a className="text-slate-400 hover:text-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/50 rounded px-2">
                ← Back to Home
              </a>
            </Link>
            <span className="hidden sm:inline text-slate-700">|</span>
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/50 rounded px-2"
            >
              Privacy Policy
            </a>
            <span className="hidden sm:inline text-slate-700">|</span>
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/50 rounded px-2"
            >
              Terms of Service
            </a>
          </div>
        </footer>
      </div>
    </AppLayout>
  );
}
