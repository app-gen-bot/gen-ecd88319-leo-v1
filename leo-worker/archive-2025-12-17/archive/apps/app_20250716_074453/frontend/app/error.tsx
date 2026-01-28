'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8 max-w-lg">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-destructive">Oops! Something went wrong</h1>
          <p className="text-muted-foreground">
            We're sorry for the inconvenience. An unexpected error has occurred.
          </p>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm font-mono text-muted-foreground break-all">
            {error.message || 'An unknown error occurred'}
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>
            Try Again
          </Button>
          <Button asChild variant="outline">
            <a href="/">
              Go Home
            </a>
          </Button>
        </div>

        <div className="pt-8 text-xs text-muted-foreground">
          Error ID: {error.digest || 'Unknown'}
        </div>
      </div>
    </div>
  );
}