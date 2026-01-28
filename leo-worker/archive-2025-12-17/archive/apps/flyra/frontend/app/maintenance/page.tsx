'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, RefreshCcw } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8 pb-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Wrench className="h-8 w-8 text-primary" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Under Maintenance</h1>
          <p className="text-muted-foreground mb-6">
            We're performing scheduled maintenance to improve your experience. 
            We'll be back online shortly.
          </p>
          
          <div className="bg-muted rounded-lg p-4 mb-6">
            <p className="text-sm font-medium mb-1">Estimated Downtime</p>
            <p className="text-2xl font-bold">2-3 hours</p>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh Page
          </Button>
          
          <p className="text-sm text-muted-foreground mt-6">
            Need urgent assistance? Contact us at{' '}
            <a href="mailto:support@flyra.com" className="text-primary hover:underline">
              support@flyra.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}