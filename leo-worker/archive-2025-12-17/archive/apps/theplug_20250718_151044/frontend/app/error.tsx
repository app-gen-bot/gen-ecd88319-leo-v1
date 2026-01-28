'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Home, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    // In production, this would send to Sentry, LogRocket, etc.
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="mx-auto w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Something went wrong!</h1>
          <p className="text-muted-foreground">
            We&apos;re sorry, but something unexpected happened. Don&apos;t worry, our team has been notified.
          </p>
          {error.message && (
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md font-mono">
              {error.message}
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Link href="/dashboard">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
        
        <div className="pt-8">
          <p className="text-sm text-muted-foreground">
            If this problem persists, please{' '}
            <Link href="/help/contact" className="text-primary hover:underline">
              contact our support team
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}