'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WifiOff, RefreshCw, Home, Heart } from 'lucide-react'

export default function OfflinePage() {
  const handleRetry = () => {
    // Try to go back to the previous page
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary" fill="currentColor" />
            <span className="text-2xl font-bold">LoveyTasks</span>
          </Link>
        </div>

        {/* Offline Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-muted">
                <WifiOff className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">You&apos;re Offline</CardTitle>
            <CardDescription>
              It looks like you&apos;ve lost your internet connection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Don&apos;t worry! Your family&apos;s love is still there.</p>
              <p>Check your connection and try again.</p>
            </div>

            {/* What You Can Do */}
            <div className="text-left space-y-3 p-4 bg-muted rounded-lg">
              <p className="font-medium text-sm">While offline, you can:</p>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>View previously loaded tasks and messages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Draft new tasks (they&apos;ll sync when online)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Access your profile information</span>
                </li>
              </ul>
            </div>

            {/* What You Cannot Do */}
            <div className="text-left space-y-3 p-4 bg-muted rounded-lg">
              <p className="font-medium text-sm">You&apos;ll need internet to:</p>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  <span>Send new tasks to family members</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  <span>Get AI message transformations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  <span>Sync with your family&apos;s updates</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button onClick={handleRetry} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/dashboard">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Connection Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="text-sm text-left space-y-2 text-muted-foreground">
              <li>1. Check if Wi-Fi or mobile data is enabled</li>
              <li>2. Try moving closer to your router</li>
              <li>3. Restart your device</li>
              <li>4. Check if other apps can connect</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}