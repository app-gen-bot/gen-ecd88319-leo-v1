import { useState, useEffect, FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Rocket } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/apps');
    }
  }, [isAuthenticated, setLocation]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);
      setLocation('/apps');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)] py-12">
        <Card className="w-full max-w-md bg-leo-bg-secondary border-leo-border shadow-glow-md animate-slide-in">
          <CardHeader className="space-y-6 pb-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-2xl bg-leo-primary/10 flex items-center justify-center shadow-glow-sm">
                <Rocket className="h-10 w-10 text-leo-primary" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold text-leo-text">Welcome Back</CardTitle>
              <CardDescription className="text-leo-text-secondary text-base">Sign in to your Leo account</CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-leo-text font-medium">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-leo-bg-tertiary border-leo-border text-leo-text placeholder:text-leo-text-tertiary focus:border-leo-primary focus:ring-leo-primary/20 h-12"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-leo-text font-medium">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-leo-bg-tertiary border-leo-border text-leo-text placeholder:text-leo-text-tertiary focus:border-leo-primary focus:ring-leo-primary/20 h-12"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 animate-slide-in">
                  <p className="text-sm text-destructive font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-leo-primary hover:bg-leo-primary-dark text-white font-semibold rounded-lg shadow-glow-sm hover:shadow-glow-md transition-all duration-300 transform hover:scale-[1.02] mt-6"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              {/* Register Link */}
              <div className="text-center text-sm text-leo-text-secondary pt-2">
                Don't have an account?{' '}
                <Link href="/register" className="text-leo-primary hover:text-leo-primary-light font-semibold transition-colors">
                  Create one now
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
