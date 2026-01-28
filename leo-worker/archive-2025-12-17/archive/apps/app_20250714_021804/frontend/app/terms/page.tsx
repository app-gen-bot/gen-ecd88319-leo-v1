import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, ChevronLeft, FileText, Scale, Users, Ban, AlertCircle } from 'lucide-react'

export default function TermsPage() {
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
          <h1 className="text-2xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground">Effective Date: December 2024</p>
        </div>
      </div>

      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle>Welcome to LoveyTasks</CardTitle>
          <CardDescription>
            Please read these terms carefully before using our service
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) govern your use of LoveyTasks, a family task management 
            application that transforms everyday tasks into expressions of love and appreciation. 
            By using LoveyTasks, you agree to these Terms.
          </p>
        </CardContent>
      </Card>

      {/* Acceptance of Terms */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            By creating an account or using LoveyTasks, you acknowledge that you have read, 
            understood, and agree to be bound by these Terms and our Privacy Policy.
          </p>
          <p>
            If you are using LoveyTasks on behalf of a family or household, you represent that 
            you have the authority to bind all family members to these Terms.
          </p>
        </CardContent>
      </Card>

      {/* Use of Service */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>2. Use of Service</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Eligibility</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• You must be at least 13 years old to use LoveyTasks</li>
              <li>• Children under 13 may use the service with parental supervision</li>
              <li>• Parents are responsible for their children&apos;s use of the service</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Account Responsibilities</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• You are responsible for maintaining account security</li>
              <li>• Keep your password confidential</li>
              <li>• Notify us immediately of any unauthorized access</li>
              <li>• You are responsible for all activities under your account</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Acceptable Use</h4>
            <p className="text-sm text-muted-foreground mb-2">
              You agree to use LoveyTasks only for lawful purposes and in ways that:
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Promote positive family interactions</li>
              <li>• Respect all family members</li>
              <li>• Do not harm or harass others</li>
              <li>• Comply with all applicable laws</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Prohibited Conduct */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-primary" />
            <CardTitle>3. Prohibited Conduct</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">You may not:</p>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li>• Use the service for any illegal or harmful purpose</li>
            <li>• Upload inappropriate, offensive, or harmful content</li>
            <li>• Attempt to gain unauthorized access to the service</li>
            <li>• Interfere with or disrupt the service</li>
            <li>• Use automated systems to access the service</li>
            <li>• Impersonate others or provide false information</li>
            <li>• Share your account with non-family members</li>
          </ul>
        </CardContent>
      </Card>

      {/* Content and IP */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <CardTitle>4. Content and Intellectual Property</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Your Content</h4>
            <p className="text-sm text-muted-foreground">
              You retain ownership of all content you create, including tasks, messages, and photos. 
              By using LoveyTasks, you grant us a license to process and display your content 
              within your family&apos;s account for the purpose of providing the service.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Our Content</h4>
            <p className="text-sm text-muted-foreground">
              LoveyTasks and its features, including AI transformations, user interface, and branding, 
              are protected by copyright, trademark, and other intellectual property laws. 
              You may not copy, modify, or distribute our content without permission.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Transformations */}
      <Card>
        <CardHeader>
          <CardTitle>5. AI Message Transformations</CardTitle>
          <CardDescription>Understanding our AI features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            LoveyTasks uses AI to transform task messages into more positive, encouraging versions. 
            By using this feature:
          </p>
          <ul className="space-y-2">
            <li>• You understand that AI transformations are suggestions only</li>
            <li>• You can always edit or reject transformed messages</li>
            <li>• We do not guarantee the accuracy or appropriateness of all transformations</li>
            <li>• Original messages are always preserved</li>
            <li>• You remain responsible for all messages sent</li>
          </ul>
        </CardContent>
      </Card>

      {/* Subscription and Billing */}
      <Card>
        <CardHeader>
          <CardTitle>6. Subscription and Billing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            LoveyTasks is currently free for families with up to 10 members. We may introduce 
            paid features or subscriptions in the future. If we do:
          </p>
          <ul className="space-y-2">
            <li>• We will notify you in advance of any changes</li>
            <li>• Current features will remain free for existing users</li>
            <li>• You can choose whether to upgrade to paid features</li>
            <li>• Billing terms will be clearly disclosed before any charges</li>
          </ul>
        </CardContent>
      </Card>

      {/* Termination */}
      <Card>
        <CardHeader>
          <CardTitle>7. Termination</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            You may delete your account at any time through account settings. We may suspend 
            or terminate accounts that violate these Terms. Upon termination:
          </p>
          <ul className="space-y-2">
            <li>• Your access to the service will end immediately</li>
            <li>• Your data may be deleted after a grace period</li>
            <li>• Some provisions of these Terms will survive termination</li>
          </ul>
        </CardContent>
      </Card>

      {/* Disclaimers */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            <CardTitle>8. Disclaimers and Limitations</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p className="font-medium">
            LoveyTasks is provided &ldquo;as is&rdquo; without warranties of any kind.
          </p>
          <p>
            We do not guarantee that the service will be uninterrupted, secure, or error-free. 
            To the fullest extent permitted by law, we disclaim all warranties and shall not be 
            liable for any damages arising from your use of the service.
          </p>
          <p>
            Our total liability to you shall not exceed the amount you have paid us in the 
            twelve months preceding any claim.
          </p>
        </CardContent>
      </Card>

      {/* Changes to Terms */}
      <Card>
        <CardHeader>
          <CardTitle>9. Changes to Terms</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            We may update these Terms from time to time. We will notify you of any material 
            changes via email or through the app. Your continued use of LoveyTasks after 
            changes indicates acceptance of the updated Terms.
          </p>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle>10. Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            If you have questions about these Terms, please contact us:
          </p>
          <div className="space-y-2 text-sm">
            <p>Email: legal@loveytasks.com</p>
            <p>Address: LoveyTasks, Inc.<br />123 Family Way<br />San Francisco, CA 94105</p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center pt-6 space-y-4">
        <div className="flex justify-center gap-4 text-sm">
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link href="/" className="text-primary hover:underline">
            Back to LoveyTasks
          </Link>
        </div>
        <div className="flex justify-center">
          <Heart className="h-4 w-4 text-muted-foreground" fill="currentColor" />
        </div>
      </div>
    </div>
  )
}