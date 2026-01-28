import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Cookie } from 'lucide-react'

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Title Section */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Cookie className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Cookie Policy</h1>
            <p className="text-muted-foreground">Last updated: January 1, 2024</p>
          </div>

          {/* Content Cards */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What Are Cookies</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray dark:prose-invert max-w-none">
                <p>
                  Cookies are small text files that are placed on your device when you visit our website. 
                  They help us provide you with a better experience by remembering your preferences and 
                  understanding how you use our platform.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How We Use Cookies</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray dark:prose-invert max-w-none">
                <p>The Plug uses cookies for the following purposes:</p>
                <ul>
                  <li><strong>Essential Cookies:</strong> Required for the platform to function properly, including authentication and security.</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform to improve the service.</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences for a personalized experience.</li>
                  <li><strong>Performance Cookies:</strong> Monitor platform performance and identify technical issues.</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Types of Cookies We Use</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Session Cookies</h4>
                    <p className="text-sm text-muted-foreground">
                      Temporary cookies that expire when you close your browser. Used for maintaining your session while using the platform.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Persistent Cookies</h4>
                    <p className="text-sm text-muted-foreground">
                      Remain on your device for a set period. Used to remember your preferences and login information.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Third-Party Cookies</h4>
                    <p className="text-sm text-muted-foreground">
                      Set by our partners (Clerk for authentication, analytics providers) to provide their services.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Managing Cookies</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray dark:prose-invert max-w-none">
                <p>
                  You can control and manage cookies through your browser settings. Please note that removing or 
                  blocking cookies may impact your user experience and some platform features may not function properly.
                </p>
                <p>
                  Most browsers allow you to:
                </p>
                <ul>
                  <li>View what cookies are stored on your device</li>
                  <li>Delete cookies individually or entirely</li>
                  <li>Block third-party cookies</li>
                  <li>Block all cookies from specific websites</li>
                  <li>Block all cookies from being set</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  If you have any questions about our Cookie Policy, please contact us at:
                </p>
                <div className="mt-4 space-y-1">
                  <p className="text-sm">Email: privacy@theplug.com</p>
                  <p className="text-sm">Support: support@theplug.com</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 The Plug. All rights reserved. Powered by PlanetScale.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}