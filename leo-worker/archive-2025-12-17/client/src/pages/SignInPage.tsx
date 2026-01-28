import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'wouter';
import { AppLayout } from '@/components/layout/AppLayout';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

export function SignInPage() {
  const [, navigate] = useNavigate();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract redirect parameter
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get('redirect');

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await apiClient.auth.getCurrentUser();

        if (data && data.id) {
          // User already authenticated, redirect
          navigate(validateRedirect(redirectUrl));
        }
      } catch {
        // Not authenticated, stay on login page (expected)
        console.log('User not authenticated, showing login form');
      }
    };

    checkAuth();
  }, [navigate, redirectUrl]);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateRedirect = (url: string | null): string => {
    // Only allow internal redirects
    if (!url || !url.startsWith('/')) {
      return '/dashboard';
    }
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setError(null);

    // Client-side validation
    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    // Set loading state
    setIsLoading(true);

    try {
      // API call
      const { data } = await apiClient.auth.login({
        body: {
          email: email.trim(),
          password: password
        }
      });

      // Success - store token
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Navigate to redirect URL or dashboard
      navigate(validateRedirect(redirectUrl));

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

  // Clear error when user starts typing
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(null);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-950 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-center px-4">
          <Link href="/">
            <a className="text-2xl font-bold text-violet-500 hover:text-violet-400 transition-colors">
              ChapelBook
            </a>
          </Link>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-[480px]">
            {/* Redirect Info Banner */}
            {redirectUrl && (
              <div className="mb-6 bg-blue-500/10 border border-blue-500 border-l-4 rounded-lg p-3 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <p className="text-blue-500 text-sm">Please sign in to continue</p>
              </div>
            )}

            {/* Card Container */}
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
                  className="mb-6 bg-red-500/10 border border-red-500 border-l-4 rounded-lg p-3 flex items-center gap-3"
                >
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-500 text-sm flex-1">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-500 hover:text-red-400"
                    aria-label="Dismiss error"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div>
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
                    onChange={handleEmailChange}
                    placeholder="you@example.com"
                    disabled={isLoading}
                    required
                    aria-required="true"
                    aria-label="Email address"
                    className={`w-full bg-slate-800 border ${
                      error && !email ? 'border-red-500' : 'border-slate-700'
                    } text-neutral-50 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition-colors`}
                  />
                </div>

                {/* Password Input */}
                <div>
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
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      disabled={isLoading}
                      required
                      aria-required="true"
                      aria-label="Password"
                      className={`w-full bg-slate-800 border ${
                        error && !password ? 'border-red-500' : 'border-slate-700'
                      } text-neutral-50 rounded-lg px-4 py-3 pr-12 text-base focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition-colors`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-violet-500/50 rounded p-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={isLoading}
                      aria-label="Remember me on this device"
                      className="h-5 w-5 bg-slate-800 border-2 border-slate-700 rounded text-violet-500 focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 text-base text-neutral-50"
                    >
                      Remember me
                    </label>
                  </div>
                  <Link href="/forgot-password">
                    <a
                      className="text-sm font-medium text-violet-500 hover:text-violet-400 hover:underline focus:outline-none focus:ring-2 focus:ring-violet-500/50 rounded px-1"
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
                  className="w-full bg-violet-500 text-neutral-50 rounded-lg px-6 py-3 text-base font-semibold hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:bg-violet-500 disabled:cursor-not-allowed transition-colors mt-6"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-neutral-50"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-800 text-slate-500">or</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <span className="text-base text-slate-400">
                  Don't have an account?{' '}
                </span>
                <Link href="/sign-up">
                  <a
                    className="text-base font-medium text-violet-500 hover:text-violet-400 hover:underline focus:outline-none focus:ring-2 focus:ring-violet-500/50 rounded px-1"
                    tabIndex={isLoading ? -1 : 0}
                  >
                    Sign up
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-slate-800 border-t border-slate-700 py-8">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-slate-400">
            <Link href="/">
              <a className="hover:text-neutral-50 transition-colors">
                ← Back to Home
              </a>
            </Link>
            <span className="hidden sm:inline">|</span>
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-50 transition-colors"
            >
              Privacy Policy
            </a>
            <span className="hidden sm:inline">|</span>
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-50 transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </footer>
      </div>
    </AppLayout>
  );
}
