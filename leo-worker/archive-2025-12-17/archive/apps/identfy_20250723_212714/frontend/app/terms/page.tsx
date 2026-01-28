import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, FileText, Calendar, Mail } from "lucide-react";

export default function TermsOfServicePage() {
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
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold">Terms of Service</h1>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <p>Last updated: January 1, 2024</p>
            </div>
          </div>

          {/* Content Card */}
          <Card className="p-8">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="mb-6 text-muted-foreground">
                By accessing and using Identfy's identity verification services ("Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use our Services.
              </p>

              <h2 className="text-2xl font-semibold mb-4">2. Description of Services</h2>
              <p className="mb-6 text-muted-foreground">
                Identfy provides automated identity verification services including but not limited to:
              </p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>Document verification and authentication</li>
                <li>Biometric verification including facial recognition</li>
                <li>Watchlist screening and compliance checks</li>
                <li>Risk assessment and fraud detection</li>
                <li>API integration services</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
              <p className="mb-6 text-muted-foreground">
                To use our Services, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use Policy</h2>
              <p className="mb-4 text-muted-foreground">
                You agree not to use our Services to:
              </p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit malicious code or interfere with the Services</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use the Services for any illegal or fraudulent purpose</li>
                <li>Resell or redistribute the Services without authorization</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">5. Data Privacy and Security</h2>
              <p className="mb-6 text-muted-foreground">
                We take data privacy seriously. Our collection and use of personal data is governed by our Privacy Policy. By using our Services, you acknowledge that:
              </p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>You have the necessary rights to submit personal data for verification</li>
                <li>You will comply with all applicable data protection laws</li>
                <li>We implement industry-standard security measures</li>
                <li>No method of transmission over the internet is 100% secure</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
              <p className="mb-6 text-muted-foreground">
                All content, features, and functionality of our Services are owned by Identfy and are protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, or reverse engineer any part of our Services.
              </p>

              <h2 className="text-2xl font-semibold mb-4">7. Fees and Payment</h2>
              <p className="mb-6 text-muted-foreground">
                Use of our Services requires payment of fees as outlined in your subscription plan. You agree to:
              </p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>Pay all fees according to your selected pricing plan</li>
                <li>Provide valid payment information</li>
                <li>Authorize automatic billing for subscription services</li>
                <li>Pay any applicable taxes</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">8. Service Level Agreement</h2>
              <p className="mb-6 text-muted-foreground">
                We strive to maintain 99.9% uptime for our Services. However, we do not guarantee uninterrupted or error-free operation. Scheduled maintenance will be communicated in advance when possible.
              </p>

              <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
              <p className="mb-6 text-muted-foreground">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IDENTFY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
              </p>

              <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
              <p className="mb-6 text-muted-foreground">
                You agree to indemnify and hold harmless Identfy, its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the Services or violation of these Terms.
              </p>

              <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
              <p className="mb-6 text-muted-foreground">
                Either party may terminate this agreement at any time. Upon termination:
              </p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>Your access to the Services will be disabled</li>
                <li>You must cease all use of the Services</li>
                <li>Any outstanding fees remain payable</li>
                <li>Certain provisions of these Terms will survive termination</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
              <p className="mb-6 text-muted-foreground">
                We reserve the right to modify these Terms at any time. We will notify you of any material changes via email or through the Services. Your continued use constitutes acceptance of the modified Terms.
              </p>

              <h2 className="text-2xl font-semibold mb-4">13. Governing Law</h2>
              <p className="mb-6 text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of the United States and the State of California, without regard to its conflict of law provisions.
              </p>

              <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
              <p className="mb-4 text-muted-foreground">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="bg-muted rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Legal Department</p>
                    <p className="text-sm text-muted-foreground">legal@identfy.com</p>
                    <p className="text-sm text-muted-foreground">1-800-IDENTFY</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center space-y-4 pb-8">
            <p className="text-sm text-muted-foreground">
              By using Identfy, you acknowledge that you have read and agree to these Terms of Service.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/privacy">Privacy Policy</Link>
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