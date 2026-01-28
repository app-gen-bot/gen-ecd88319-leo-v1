'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface VerificationResult {
  success: boolean;
  message: string;
  email?: string;
  waitlistPosition?: number;
}

export default function VerifyEmailPage() {
  const params = useParams();
  const router = useRouter();
  const [verificationState, setVerificationState] = useState<'loading' | 'success' | 'error'>('loading');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const token = params.token as string;

  useEffect(() => {
    // Mock email verification - In real app, this would call backend API
    const verifyEmailToken = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock verification logic - check token format
        if (token && token.length >= 32) {
          // Simulate successful verification
          setResult({
            success: true,
            message: 'Your email has been successfully verified!',
            email: 'user@example.com', // Would come from token/API
            waitlistPosition: Math.floor(Math.random() * 5000) + 1
          });
          setVerificationState('success');
        } else {
          // Invalid token
          setResult({
            success: false,
            message: 'Invalid or expired verification token. Please try signing up again.'
          });
          setVerificationState('error');
        }
      } catch (_error) {
        setResult({
          success: false,
          message: 'An error occurred during verification. Please try again later.'
        });
        setVerificationState('error');
      }
    };

    if (token) {
      verifyEmailToken();
    } else {
      setResult({
        success: false,
        message: 'No verification token provided.'
      });
      setVerificationState('error');
    }
  }, [token]);

  const handleResendVerification = async () => {
    // Mock resend functionality
    alert('Verification email sent! Please check your inbox.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {verificationState === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying Your Email
              </h1>
              <p className="text-gray-600">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {verificationState === 'success' && result && (
            <>
              <div className="relative">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <div className="absolute -top-2 -right-2">
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Email Verified Successfully! 🎉
              </h1>
              
              <p className="text-gray-600 mb-6">
                {result.message}
              </p>

              {result.waitlistPosition && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-blue-800 font-medium">
                    You're #{result.waitlistPosition.toLocaleString()} on our waitlist
                  </p>
                  <p className="text-blue-600 text-sm mt-1">
                    We'll notify you when beta access is available
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => router.push('/beta-signup/thank-you')}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Continue to Dashboard
                </button>
                
                <Link
                  href="/"
                  className="block w-full text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Return to Home
                </Link>
              </div>
            </>
          )}

          {verificationState === 'error' && result && (
            <>
              <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Failed
              </h1>
              
              <p className="text-gray-600 mb-6">
                {result.message}
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleResendVerification}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Resend Verification Email
                </button>
                
                <Link
                  href="/beta-signup"
                  className="block w-full text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Try Signing Up Again
                </Link>
                
                <Link
                  href="/"
                  className="block w-full text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Return to Home
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Additional help section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Having trouble? {' '}
            <Link href="/contact/support" className="text-blue-600 hover:text-blue-700">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}