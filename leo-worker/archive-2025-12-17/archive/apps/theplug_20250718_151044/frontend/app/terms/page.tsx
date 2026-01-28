'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Music } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Music className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">The Plug</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/features" className="text-sm font-medium hover:text-primary">
                Features
              </Link>
              <Link href="/pricing" className="text-sm font-medium hover:text-primary">
                Pricing
              </Link>
              <Link href="/how-it-works" className="text-sm font-medium hover:text-primary">
                How It Works
              </Link>
              <Link href="/about" className="text-sm font-medium hover:text-primary">
                About
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Start Free Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 1, 2024</p>

          <Card>
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none p-8">
              <h2>1. Agreement to Terms</h2>
              <p>
                By accessing or using The Plug's music registration platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
              </p>

              <h2>2. Description of Service</h2>
              <p>
                The Plug provides an automated music registration platform that enables artists to register their music with various rights organizations, distribution platforms, and copyright offices. Our Service includes:
              </p>
              <ul>
                <li>Automated submission to multiple platforms</li>
                <li>Registration status tracking</li>
                <li>Revenue projections and analytics</li>
                <li>Secure credential management</li>
                <li>Support services</li>
              </ul>

              <h2>3. User Accounts</h2>
              <h3>Account Creation</h3>
              <p>
                To use our Service, you must create an account. You agree to:
              </p>
              <ul>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be responsible for all activities under your account</li>
              </ul>

              <h3>Account Termination</h3>
              <p>
                We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent activity.
              </p>

              <h2>4. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul>
                <li>Upload content that infringes on others' intellectual property rights</li>
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Reverse engineer or attempt to extract source code</li>
                <li>Use automated systems or software to extract data</li>
              </ul>

              <h2>5. Intellectual Property Rights</h2>
              <h3>Your Content</h3>
              <p>
                You retain all rights to your music and content. By using our Service, you grant us a limited license to:
              </p>
              <ul>
                <li>Process and submit your content to third-party platforms</li>
                <li>Store and display your content within the Service</li>
                <li>Use your content as necessary to provide the Service</li>
              </ul>

              <h3>Our Property</h3>
              <p>
                The Service, including its original content, features, and functionality, is owned by The Plug and protected by international copyright, trademark, and other intellectual property laws.
              </p>

              <h2>6. Payment Terms</h2>
              <h3>Subscription Fees</h3>
              <ul>
                <li>Subscription fees are billed in advance on a monthly or annual basis</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>We reserve the right to change fees with 30 days' notice</li>
              </ul>

              <h3>Free Trial</h3>
              <p>
                We offer a 14-day free trial. You may cancel anytime during the trial without charge. After the trial, you will be automatically charged unless you cancel.
              </p>

              <h2>7. Third-Party Services</h2>
              <p>
                Our Service integrates with third-party platforms (MLC, PROs, distributors, etc.). You acknowledge that:
              </p>
              <ul>
                <li>We are not responsible for third-party platform policies or actions</li>
                <li>You must comply with each platform's terms of service</li>
                <li>Platform availability may change without notice</li>
                <li>Registration success depends on meeting platform requirements</li>
              </ul>

              <h2>8. Disclaimers</h2>
              <h3>Service Availability</h3>
              <p>
                The Service is provided "as is" and "as available." We do not guarantee uninterrupted or error-free operation.
              </p>

              <h3>Registration Success</h3>
              <p>
                While we strive for a high success rate, we cannot guarantee acceptance by third-party platforms. Registration approval is at the discretion of each platform.
              </p>

              <h3>Revenue Projections</h3>
              <p>
                Revenue projections are estimates based on available data and should not be considered guaranteed earnings.
              </p>

              <h2>9. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, The Plug shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including lost profits, lost revenue, or lost data.
              </p>

              <h2>10. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless The Plug and its officers, directors, employees, and agents from any claims, damages, or expenses arising from:
              </p>
              <ul>
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
              </ul>

              <h2>11. Privacy</h2>
              <p>
                Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the Site and informs users of our data collection practices.
              </p>

              <h2>12. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of Tennessee, without regard to its conflict of law provisions.
              </p>

              <h2>13. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of any material changes via email or through the Service. Your continued use constitutes acceptance of the modified Terms.
              </p>

              <h2>14. Contact Information</h2>
              <p>
                For questions about these Terms, please contact us at:
              </p>
              <ul>
                <li>Email: legal@theplug.com</li>
                <li>Address: The Plug, 123 Music Row, Nashville, TN 37203</li>
                <li>Phone: +1 (555) 123-4567</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features" className="hover:text-foreground">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="/how-it-works" className="hover:text-foreground">How It Works</Link></li>
                <li><Link href="/api-docs" className="hover:text-foreground">API</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
                <li><Link href="/status" className="hover:text-foreground">Status</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-foreground">Help Center</Link></li>
                <li><Link href="/changelog" className="hover:text-foreground">What's New</Link></li>
                <li><Link href="/demo" className="hover:text-foreground">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
                <li><Link href="/cookie-policy" className="hover:text-foreground">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div>© 2025 The Plug. All rights reserved.</div>
            <div>Powered by PlanetScale</div>
          </div>
        </div>
      </footer>
    </div>
  )
}