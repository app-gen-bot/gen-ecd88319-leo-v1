import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuth } from '@/contexts/AuthContext';

/**
 * LoginPage component
 * User login form
 */
export function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get redirect URL from query params (e.g., /login?redirect=/fizzcard/123)
  const redirectUrl = new URLSearchParams(window.location.search).get('redirect');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Redirect to original page or dashboard
      setLocation(redirectUrl || '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-12 max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
          <p className="text-text-secondary">Login to your FizzCard account</p>
        </div>

        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="p-3 rounded-lg bg-error-500/10 border border-error-500/30 text-error-500 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" loading={loading}>
              Login
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-text-secondary">
            Don't have an account?{' '}
            <Link href="/signup">
              <a className="text-primary-500 hover:underline">Sign up</a>
            </Link>
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
