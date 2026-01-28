'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-32 w-32 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-16 w-16 text-destructive" />
            </div>
            <div className="absolute -bottom-2 -right-2 h-12 w-12 bg-orange-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-orange-500">500</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">Something went wrong!</h1>
          <p className="text-muted-foreground">
            We encountered an unexpected error. Our team has been notified and is working on a fix.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="default" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
        
        <div className="pt-8 border-t">
          <p className="text-xs text-muted-foreground">
            If this problem persists, please contact support at support@tenantrightsadvisor.com
          </p>
        </div>
      </div>
    </div>
  )
}