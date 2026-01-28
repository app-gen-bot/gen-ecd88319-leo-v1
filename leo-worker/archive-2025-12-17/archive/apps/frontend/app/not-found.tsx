'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft, Search, HelpCircle, AlertCircle } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  const suggestions = [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'AI Legal Advisor', path: '/chat', icon: HelpCircle },
    { label: 'Knowledge Base', path: '/knowledge', icon: Search },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 text-center">
        {/* Error Icon and Code */}
        <div className="relative">
          <div className="text-[200px] font-bold text-muted/20 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <AlertCircle className="h-24 w-24 text-muted-foreground" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Page Not Found</h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => router.back()}
            variant="outline"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </Button>
          <Button
            size="lg"
            onClick={() => router.push('/dashboard')}
          >
            <Home className="h-5 w-5 mr-2" />
            Go to Dashboard
          </Button>
        </div>

        {/* Suggestions */}
        <div className="pt-12">
          <h2 className="text-lg font-semibold mb-6">Here are some helpful links:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
            {suggestions.map((item) => (
              <Card
                key={item.path}
                className="cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => router.push(item.path)}
              >
                <CardContent className="p-6 text-center">
                  <item.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <p className="font-medium">{item.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Legal Note */}
        <div className="pt-8 text-sm text-muted-foreground">
          <p>If you believe this is an error, please contact our support team.</p>
          <Button
            variant="link"
            className="text-sm mt-2"
            onClick={() => router.push('/help')}
          >
            Visit Help Center
          </Button>
        </div>
      </div>
    </div>
  );
}