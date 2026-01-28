import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, ChevronLeft, Shield, Lock, Eye, Users, Database, Globe } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: December 2024</p>
        </div>
      </div>

      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle>Your Privacy Matters</CardTitle>
          <CardDescription>
            At LoveyTasks, we believe in transparency and protecting your family&apos;s privacy.
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            This Privacy Policy explains how we collect, use, and protect your information when you use LoveyTasks. 
            We&apos;re committed to ensuring your family&apos;s data remains private and secure.
          </p>
        </CardContent>
      </Card>

      {/* Data Collection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Information We Collect</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Account Information</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Email address and password (encrypted)</li>
              <li>• Family member names and roles</li>
              <li>• Profile pictures (optional)</li>
              <li>• Personality and message style preferences</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Task and Message Data</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Task descriptions and assignments</li>
              <li>• Original and transformed messages</li>
              <li>• Task completion status and history</li>
              <li>• Message reactions and responses</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Usage Information</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Login times and frequency</li>
              <li>• Feature usage patterns</li>
              <li>• Device and browser information</li>
              <li>• General location (country/region)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Data Usage */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <CardTitle>How We Use Your Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">We use your information to:</p>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Provide and improve the LoveyTasks service</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Transform your messages using AI while maintaining privacy</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Send notifications about tasks and family activities</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Analyze usage patterns to enhance features</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Provide customer support and respond to inquiries</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Data Protection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>How We Protect Your Data</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="font-medium">Encryption</h4>
                <p className="text-sm text-muted-foreground">
                  All data is encrypted in transit and at rest using industry-standard protocols
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="font-medium">Family Isolation</h4>
                <p className="text-sm text-muted-foreground">
                  Each family&apos;s data is completely isolated from other families
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="font-medium">No Third-Party Sharing</h4>
                <p className="text-sm text-muted-foreground">
                  We never sell or share your personal data with third parties for marketing
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Rights */}
      <Card>
        <CardHeader>
          <CardTitle>Your Privacy Rights</CardTitle>
          <CardDescription>You have control over your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">You have the right to:</p>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li>• Access all data we have about you</li>
            <li>• Download your data in a portable format</li>
            <li>• Update or correct your information</li>
            <li>• Delete your account and all associated data</li>
            <li>• Opt out of non-essential communications</li>
            <li>• Request restrictions on data processing</li>
          </ul>
          <div className="pt-2">
            <Button asChild variant="outline">
              <Link href="/settings/account">Manage Your Data</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI and Message Transformation */}
      <Card>
        <CardHeader>
          <CardTitle>AI and Message Transformation</CardTitle>
          <CardDescription>How we handle your messages with care</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            When transforming your messages, we:
          </p>
          <ul className="space-y-2">
            <li>• Process messages in real-time without storing them separately</li>
            <li>• Never use your messages to train AI models</li>
            <li>• Keep both original and transformed messages within your family only</li>
            <li>• Allow you to delete any message at any time</li>
          </ul>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Questions or Concerns?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            If you have any questions about this Privacy Policy or how we handle your data, 
            please contact us:
          </p>
          <div className="space-y-2 text-sm">
            <p>Email: privacy@loveytasks.com</p>
            <p>Address: LoveyTasks, Inc.<br />123 Family Way<br />San Francisco, CA 94105</p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center pt-6">
        <Link href="/" className="inline-flex items-center space-x-2 text-muted-foreground hover:text-primary">
          <Heart className="h-4 w-4" fill="currentColor" />
          <span className="text-sm">Back to LoveyTasks</span>
        </Link>
      </div>
    </div>
  )
}