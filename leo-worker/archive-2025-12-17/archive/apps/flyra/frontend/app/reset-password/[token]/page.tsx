'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter, useParams } from 'next/navigation';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);
  
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
  });

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    Object.values(checks).forEach(passed => {
      if (passed) score++;
    });

    const messages = [
      'Too weak',
      'Weak',
      'Fair',
      'Good',
      'Strong',
    ];

    setPasswordStrength({
      score,
      message: messages[score] || messages[0],
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPasswords(prev => ({ ...prev, password: newPassword }));
    checkPasswordStrength(newPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.password !== passwords.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: 'Please make sure both passwords are the same.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordStrength.score < 3) {
      toast({
        title: 'Weak Password',
        description: 'Please choose a stronger password.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsReset(true);
      toast({
        title: 'Password Reset Successfully',
        description: 'You can now sign in with your new password.',
      });
    } catch (error) {
      toast({
        title: 'Reset Failed',
        description: 'Invalid or expired reset link. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isReset) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Password Reset Complete</h2>
              <p className="text-muted-foreground mb-6">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
              
              <Button 
                className="w-full"
                onClick={() => router.push('/login')}
              >
                Go to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Flyra</h1>
          <p className="text-muted-foreground mt-2">Create a new password</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reset Your Password</CardTitle>
            <CardDescription>
              Enter a new password for your account. Make sure it's strong and unique.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={passwords.password}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </Button>
                </div>
                
                {passwords.password && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            passwordStrength.score <= 1 ? 'bg-red-500' :
                            passwordStrength.score <= 2 ? 'bg-orange-500' :
                            passwordStrength.score <= 3 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {passwordStrength.message}
                      </span>
                    </div>
                    <ul className="text-xs space-y-1">
                      <li className={passwords.password.length >= 8 ? 'text-green-600' : 'text-muted-foreground'}>
                        • At least 8 characters
                      </li>
                      <li className={/[A-Z]/.test(passwords.password) ? 'text-green-600' : 'text-muted-foreground'}>
                        • One uppercase letter
                      </li>
                      <li className={/[0-9]/.test(passwords.password) ? 'text-green-600' : 'text-muted-foreground'}>
                        • One number
                      </li>
                      <li className={/[^A-Za-z0-9]/.test(passwords.password) ? 'text-green-600' : 'text-muted-foreground'}>
                        • One special character
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  placeholder="Confirm new password"
                />
                {passwords.confirmPassword && passwords.password !== passwords.confirmPassword && (
                  <p className="text-sm text-destructive">Passwords do not match</p>
                )}
              </div>

              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Make sure to use a password you haven't used before on this account.
                </AlertDescription>
              </Alert>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !passwords.password || !passwords.confirmPassword}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto"
              onClick={() => router.push('/login')}
            >
              Sign in instead
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}