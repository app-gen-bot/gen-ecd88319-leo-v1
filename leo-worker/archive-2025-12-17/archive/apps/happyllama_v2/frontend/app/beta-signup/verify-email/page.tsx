"use client"

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnvelopeIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email address';
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Start cooldown timer when page loads
  useEffect(() => {
    setResendCooldown(60);
  }, []);

  // Countdown effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    setIsResending(true);
    
    // Mock API call to resend email
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reset cooldown and show success
      setResendCooldown(60);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (error) {
      // Handle error
      console.error('Failed to resend email:', error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              {/* Animated envelope */}
              <div className="relative w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <EnvelopeIcon className="h-10 w-10 text-blue-600" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Check Your Email
              </h1>
              
              <p className="text-lg text-gray-600 mb-2">
                We&apos;ve sent a verification link to:
              </p>
              
              <p className="text-lg font-semibold text-blue-600 mb-6">
                {email}
              </p>
              
              <p className="text-gray-600 mb-8">
                Click the link in the email to complete your beta signup and see your position on the waitlist.
              </p>
              
              {/* Success message */}
              {resendSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                    <p className="text-green-700 font-medium">
                      Verification email sent successfully!
                    </p>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <Button 
                  size="lg" 
                  className="w-full" 
                  onClick={handleResendEmail}
                  disabled={resendCooldown > 0 || isResending}
                >
                  {isResending ? (
                    <>
                      <ClockIcon className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : resendCooldown > 0 ? (
                    `Resend Available in ${resendCooldown}s`
                  ) : (
                    'Resend Verification Email'
                  )}
                </Button>
                
                <Button size="lg" variant="outline" className="w-full" asChild>
                  <Link href="/beta-signup">
                    Use Different Email
                  </Link>
                </Button>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-4">
                  <strong>Didn&apos;t receive the email?</strong>
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Check your spam/junk folder</li>
                  <li>• Make sure {email} is correct</li>
                  <li>• Wait a few minutes for delivery</li>
                </ul>
                
                <p className="text-sm text-gray-400 mt-4">
                  Still having issues? {' '}
                  <Link href="/contact/support" className="text-blue-600 hover:text-blue-700">
                    Contact Support
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}