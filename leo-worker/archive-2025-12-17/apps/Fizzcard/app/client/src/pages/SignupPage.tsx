import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { usePrivy } from '@privy-io/react-auth';
import { useCryptoWallet } from '@/hooks/useCryptoWallet';
import { requestLocationPermission } from '@/lib/geolocation';
import toast from 'react-hot-toast';

/**
 * SignupPage component
 * User registration form
 */
export function SignupPage() {
  const [, setLocation] = useLocation();
  const { signup } = useAuth();
  const { createWallet } = useCryptoWallet();
  const { user: privyUser, ready: privyReady } = usePrivy();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Request location permission
      await requestLocationPermission();

      // Signup user
      await signup(name, email, password);

      // Create embedded wallet if Privy is ready
      if (privyReady && privyUser?.wallet?.address) {
        try {
          console.log('[Signup] Creating crypto wallet:', privyUser.wallet.address);
          createWallet(privyUser.wallet.address);
          toast.success('Crypto wallet created! 🎉');
        } catch (walletErr) {
          console.warn('[Signup] Failed to create wallet, will retry later:', walletErr);
          // Don't fail signup if wallet creation fails
        }
      } else {
        console.log('[Signup] Privy not ready or no embedded wallet yet');
      }

      // Redirect to dashboard
      setLocation('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-12 max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Get Started</h1>
          <p className="text-text-secondary">Create your FizzCard account</p>
        </div>

        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

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
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />

            {error && (
              <div className="p-3 rounded-lg bg-error-500/10 border border-error-500/30 text-error-500 text-sm">
                {error}
              </div>
            )}

            <div className="p-3 rounded-lg bg-primary-500/10 border border-primary-500/30 text-text-secondary text-xs">
              We'll request location permission to capture meeting context when
              you share contacts.
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading}>
              Sign Up
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link href="/login">
              <a className="text-primary-500 hover:underline">Login</a>
            </Link>
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
