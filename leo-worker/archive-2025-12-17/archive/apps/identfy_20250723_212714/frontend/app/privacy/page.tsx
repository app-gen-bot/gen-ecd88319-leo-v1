import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Shield, Calendar, Mail, Lock, Eye, Database, Globe } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold">
                I
              </div>
              <span className="font-bold text-xl">Identfy</span>
            </Link>
            <Button variant="ghost" asChild>
              <Link href="/sign-in">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Title Section */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="p-3 bg-primary/10 rounded-full">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <p>Last updated: January 1, 2024</p>
            </div>
          </div>

          {/* Content Card */}
          <Card className="p-8">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="mb-6 text-muted-foreground">
                Identfy ("we," "our," or "us") is committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our identity verification services.
              </p>

              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <p className="mb-4 text-muted-foreground">
                We collect various types of information to provide and improve our Services:
              </p>
              
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Personal Information
              </h3>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>Full name and date of birth</li>
                <li>Government-issued identification numbers</li>
                <li>Address and contact information</li>
                <li>Biometric data (facial features, fingerprints)</li>
                <li>Document images (ID cards, passports, driver's licenses)</li>
                <li>Device information and IP addresses</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Automatically Collected Information
              </h3>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>Browser type and version</li>
                <li>Operating system information</li>
                <li>Access times and dates</li>
                <li>Pages viewed and interactions</li>
                <li>Geographic location data</li>
                <li>Device identifiers and characteristics</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="mb-4 text-muted-foreground">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>Verify your identity as requested by our clients</li>
                <li>Prevent fraud and enhance security</li>
                <li>Comply with legal and regulatory requirements</li>
                <li>Improve our services and develop new features</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Send service-related communications</li>
                <li>Maintain records for audit and compliance purposes</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">4. Legal Basis for Processing</h2>
              <p className="mb-4 text-muted-foreground">
                We process your personal data based on the following legal grounds:
              </p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li><strong>Consent:</strong> When you provide explicit consent for specific processing activities</li>
                <li><strong>Contract:</strong> To fulfill our contractual obligations to you or our clients</li>
                <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
                <li><strong>Legitimate Interests:</strong> For fraud prevention and security purposes</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">5. Data Sharing and Disclosure</h2>
              <p className="mb-4 text-muted-foreground">
                We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>With the organization that requested your verification</li>
                <li>With our trusted service providers and partners</li>
                <li>To comply with legal obligations or court orders</li>
                <li>To prevent fraud or investigate suspected illegal activities</li>
                <li>In connection with a business merger or acquisition</li>
                <li>With your explicit consent</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
              <div className="bg-muted rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-2">Security Measures</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• End-to-end encryption for data transmission</li>
                      <li>• AES-256 encryption for data at rest</li>
                      <li>• Regular security audits and penetration testing</li>
                      <li>• Strict access controls and authentication</li>
                      <li>• Compliance with ISO 27001 and SOC 2 standards</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
              <p className="mb-6 text-muted-foreground">
                We retain personal data only for as long as necessary to fulfill the purposes for which it was collected and to comply with legal requirements. Typical retention periods:
              </p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>Verification data: 7 years or as required by law</li>
                <li>Biometric data: Deleted immediately after verification</li>
                <li>Account information: Duration of account plus 30 days</li>
                <li>Marketing data: Until consent is withdrawn</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">8. Your Rights</h2>
              <p className="mb-4 text-muted-foreground">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Erasure:</strong> Request deletion of your data (subject to legal obligations)</li>
                <li><strong>Portability:</strong> Receive your data in a structured format</li>
                <li><strong>Objection:</strong> Object to certain processing activities</li>
                <li><strong>Restriction:</strong> Limit how we process your data</li>
                <li><strong>Withdraw Consent:</strong> Revoke previously given consent</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
              <div className="bg-muted rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-2">Cross-Border Transfers</p>
                    <p className="text-sm text-muted-foreground">
                      Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place, including Standard Contractual Clauses and adequacy decisions.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
              <p className="mb-6 text-muted-foreground">
                Our Services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child, we will take steps to delete it.
              </p>

              <h2 className="text-2xl font-semibold mb-4">11. California Privacy Rights</h2>
              <p className="mb-6 text-muted-foreground">
                California residents have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, the right to delete personal information, and the right to opt-out of the sale of personal information (which we do not sell).
              </p>

              <h2 className="text-2xl font-semibold mb-4">12. Updates to This Policy</h2>
              <p className="mb-6 text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
              </p>

              <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
              <p className="mb-4 text-muted-foreground">
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-muted rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Data Protection Officer</p>
                    <p className="text-sm text-muted-foreground">privacy@identfy.com</p>
                    <p className="text-sm text-muted-foreground">1-800-IDENTFY</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Identfy Inc.<br />
                      123 Security Blvd, Suite 400<br />
                      San Francisco, CA 94105<br />
                      United States
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-semibold mb-4">14. Data Protection Authority</h2>
              <p className="mb-6 text-muted-foreground">
                If you are located in the European Economic Area and believe we have not addressed your concerns adequately, you have the right to lodge a complaint with your local data protection authority.
              </p>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center space-y-4 pb-8">
            <p className="text-sm text-muted-foreground">
              Your privacy is important to us. We are committed to protecting your personal information.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/terms">Terms of Service</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}