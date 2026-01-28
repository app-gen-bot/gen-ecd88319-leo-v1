'use client';

import { DashboardNav } from '@/components/dashboard-nav';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';

export default function PrivacyPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {user && <DashboardNav />}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: January 13, 2025</p>
        </div>

        <Card>
          <CardContent className="prose dark:prose-invert max-w-none pt-6">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                <p className="text-muted-foreground">
                  Flyra, Inc. ("Flyra," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our money transfer services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
                <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                  <li>Full name and date of birth</li>
                  <li>Email address and phone number</li>
                  <li>Residential address</li>
                  <li>Social Security Number (last 4 digits)</li>
                  <li>Government-issued ID information</li>
                  <li>Income and employment information</li>
                  <li>Bank account details</li>
                </ul>

                <h3 className="text-lg font-medium mb-2">Transaction Information</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                  <li>Recipient details (name, phone number, location)</li>
                  <li>Transfer amounts and frequency</li>
                  <li>Transaction history and patterns</li>
                  <li>Payment method information</li>
                </ul>

                <h3 className="text-lg font-medium mb-2">Technical Information</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Usage data and analytics</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
                <p className="text-muted-foreground mb-2">We use your information to:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Process your money transfers</li>
                  <li>Verify your identity and prevent fraud</li>
                  <li>Comply with legal and regulatory requirements</li>
                  <li>Communicate with you about your transactions</li>
                  <li>Improve our services and user experience</li>
                  <li>Send marketing communications (with your consent)</li>
                  <li>Respond to customer support inquiries</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Information Sharing and Disclosure</h2>
                <p className="text-muted-foreground mb-2">We may share your information with:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li><strong>Payment Partners:</strong> To complete your transfers</li>
                  <li><strong>Identity Verification Services:</strong> For KYC compliance</li>
                  <li><strong>Financial Institutions:</strong> For processing payments</li>
                  <li><strong>Law Enforcement:</strong> When required by law</li>
                  <li><strong>Service Providers:</strong> Who assist in our operations</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  We do not sell, trade, or rent your personal information to third parties for marketing purposes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
                <p className="text-muted-foreground">
                  We implement industry-standard security measures to protect your information, including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>256-bit SSL encryption for data transmission</li>
                  <li>Secure data storage with encryption at rest</li>
                  <li>Multi-factor authentication options</li>
                  <li>Regular security audits and testing</li>
                  <li>Employee access controls and training</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
                <p className="text-muted-foreground">
                  We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Transaction records are typically retained for 5-7 years as required by financial regulations.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Your Rights and Choices</h2>
                <p className="text-muted-foreground mb-2">You have the right to:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your data (subject to legal requirements)</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Disable cookies through your browser settings</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Cookies and Tracking Technologies</h2>
                <p className="text-muted-foreground">
                  We use cookies and similar technologies to enhance your experience, analyze usage patterns, and improve our services. You can manage cookie preferences through your browser settings.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Children's Privacy</h2>
                <p className="text-muted-foreground">
                  Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. International Data Transfers</h2>
                <p className="text-muted-foreground">
                  Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. California Privacy Rights</h2>
                <p className="text-muted-foreground">
                  California residents have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, the right to delete personal information, and the right to opt-out of the sale of personal information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">12. Changes to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">13. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:
                  <br /><br />
                  Flyra, Inc.<br />
                  Privacy Department<br />
                  123 Main Street<br />
                  San Francisco, CA 94105<br />
                  Email: privacy@flyra.com<br />
                  Phone: 1-800-FLYRA-US
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}