import { useState, useEffect, FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, ArrowRight, Mail, Lock, User, Check } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/apps');
    }
  }, [isAuthenticated, setLocation]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, password, name);
      setLocation('/apps');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-16 relative">
        {/* Background effects */}
        <div className="absolute top-1/4 -right-32 w-80 h-80 bg-cyan-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -left-32 w-64 h-64 bg-purple-500/15 rounded-full blur-[100px]" />

        <div className="w-full max-w-md relative z-10 animate-fade-in-up">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-glow-cyan">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-leo-text mb-2">Create your account</h1>
            <p className="text-leo-text-secondary">Start building with AI in minutes</p>
          </div>

          {/* Form Card */}
          <div className="leo-card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-leo-text">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-leo-text-tertiary" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Jane Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-11 h-12 bg-white/5 border-white/10 text-leo-text placeholder:text-leo-text-tertiary focus:border-cyan-500/50 focus:ring-cyan-500/20 rounded-xl"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-leo-text">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-leo-text-tertiary" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-11 h-12 bg-white/5 border-white/10 text-leo-text placeholder:text-leo-text-tertiary focus:border-cyan-500/50 focus:ring-cyan-500/20 rounded-xl"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-leo-text">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-leo-text-tertiary" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={isLoading}
                    className="pl-11 h-12 bg-white/5 border-white/10 text-leo-text placeholder:text-leo-text-tertiary focus:border-cyan-500/50 focus:ring-cyan-500/20 rounded-xl"
                  />
                </div>
                <p className="text-xs text-leo-text-tertiary">
                  At least 8 characters
                </p>
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
                className="w-full h-12 text-base rounded-xl group bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold shadow-glow-cyan transition-all duration-300"
              >
                {isLoading ? (
                  'Creating account...'
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {/* Benefits */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="space-y-3">
                {[
                  'Generate full-stack apps in minutes',
                  'One-click deployment to the cloud',
                  'Full source code ownership',
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-leo-text-secondary">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-emerald-400" />
                    </div>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Login link */}
            <p className="text-center text-leo-text-secondary mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
