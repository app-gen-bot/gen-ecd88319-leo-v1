"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <ExclamationTriangleIcon className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl">Something went wrong!</CardTitle>
          <CardDescription>
            We encountered an unexpected error. The issue has been logged and will be investigated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">
              Error: {error.message || "Unknown error occurred"}
            </p>
            {error.digest && (
              <p className="mt-1 text-xs text-muted-foreground">
                Reference: {error.digest}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={reset} className="w-full">
              Try Again
            </Button>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = "/"}>
              Go to Homepage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}