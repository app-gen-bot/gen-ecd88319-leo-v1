"use client"

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircleIcon, RocketLaunchIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function BetaSignupThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="h-10 w-10 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Happy Llama Beta!
              </h1>
              
              <p className="text-lg text-gray-600 mb-6">
                Your beta access has been confirmed. You&apos;re now part of an exclusive group 
                of early adopters shaping the future of AI-powered development.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li>• Check your email for beta access instructions</li>
                  <li>• Join our private Discord community</li>
                  <li>• Get early access to new features and updates</li>
                  <li>• Provide feedback to help shape the platform</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <Button size="lg" className="w-full">
                  <RocketLaunchIcon className="mr-2 h-4 w-4" />
                  Access Beta Platform
                </Button>
                
                <Button size="lg" variant="outline" className="w-full">
                  <UserGroupIcon className="mr-2 h-4 w-4" />
                  Join Discord Community
                </Button>
                
                <Button size="lg" variant="ghost" className="w-full" asChild>
                  <Link href="/">
                    Return to Homepage
                  </Link>
                </Button>
              </div>
              
              <p className="text-sm text-gray-500 mt-6">
                Questions? Reach out to beta@happyllama.ai
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}