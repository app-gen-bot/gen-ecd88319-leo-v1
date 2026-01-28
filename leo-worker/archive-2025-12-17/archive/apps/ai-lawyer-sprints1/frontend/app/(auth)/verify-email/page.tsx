"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useNextAuth } from '@/contexts/nextauth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Scale, Loader2, Mail, CheckCircle, XCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [email, setEmail] = useState<string | null>(null);
  
  const { verifyUserEmail } = useNextAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    const emailFromUrl = searchParams.get('email');
    
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
    
    if (tokenFromUrl) {
      verifyEmail(tokenFromUrl);
    }
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    setIsVerifying(true);
    
    try {
      await verifyUserEmail(token);
      setVerificationStatus('success');
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (error: any) {
      setVerificationStatus('error');
      toast({
        title: "Verification failed",
        description: error.message || "Unable to verify email",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Scale className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">AI Tenant Rights</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Mail className="h-5 w-5" />
              Email Verification
            </CardTitle>
            <CardDescription className="text-center">
              {verificationStatus === 'pending' && 'Verifying your email address...'}
              {verificationStatus === 'success' && 'Your email has been verified!'}
              {verificationStatus === 'error' && 'Verification failed'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              {isVerifying && (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-gray-600">Verifying your email...</p>
                </div>
              )}
              
              {!isVerifying && verificationStatus === 'success' && (
                <div className="flex flex-col items-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
                  <p className="text-green-600 font-medium mb-2">Email verified successfully!</p>
                  <p className="text-sm text-gray-600">
                    You'll be redirected to your dashboard in a moment...
                  </p>
                </div>
              )}
              
              {!isVerifying && verificationStatus === 'error' && (
                <div className="flex flex-col items-center">
                  <XCircle className="h-12 w-12 text-red-600 mb-4" />
                  <p className="text-red-600 font-medium mb-2">Verification failed</p>
                  <p className="text-sm text-gray-600 mb-4">
                    The verification link may be invalid or expired.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/sign-in')}
                  >
                    Back to Sign In
                  </Button>
                </div>
              )}
              
              {!isVerifying && verificationStatus === 'pending' && email && (
                <div className="flex flex-col items-center">
                  <Mail className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">
                    We've sent a verification link to:
                  </p>
                  <p className="font-medium text-gray-900 mb-4">{email}</p>
                  <p className="text-sm text-gray-600">
                    Please check your email and click the verification link.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          {verificationStatus !== 'success' && (
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Didn't receive the email?{' '}
                <Button variant="link" className="p-0 h-auto">
                  Resend verification email
                </Button>
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}