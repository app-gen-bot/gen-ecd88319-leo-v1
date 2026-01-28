"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DocumentTextIcon, ScaleIcon } from '@heroicons/react/24/outline';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <ScaleIcon className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              These terms govern your use of Happy Llama&apos;s AI development platform 
              and services. Please read them carefully.
            </p>
            
            <p className="text-sm text-gray-500">
              Last updated: January 22, 2025
            </p>
          </div>
        </div>
      </div>

      {/* Terms Content */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Acceptance of Terms</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>
                    By accessing or using Happy Llama&apos;s services, you agree to be bound by these Terms of Service. 
                    If you do not agree to these terms, you may not use our services.
                  </p>
                  <p>
                    These terms apply to all users, including individual developers, enterprises, and organizations.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Description of Service</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>Happy Llama provides an AI-powered platform that:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Generates production-ready applications from natural language descriptions</li>
                    <li>Offers collaborative development tools and workflows</li>
                    <li>Provides deployment and hosting capabilities</li>
                    <li>Enables team collaboration and project management</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Accounts</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>To use our services, you must:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Be at least 18 years old</li>
                    <li>Provide accurate and complete registration information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Promptly notify us of any unauthorized use</li>
                    <li>Accept responsibility for all activities under your account</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Acceptable Use</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>You agree not to use our services to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Create applications that violate laws or regulations</li>
                    <li>Generate malicious or harmful code</li>
                    <li>Infringe on intellectual property rights</li>
                    <li>Distribute spam, malware, or other unwanted content</li>
                    <li>Attempt to circumvent security measures</li>
                    <li>Reverse engineer or copy our proprietary algorithms</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Intellectual Property</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Your Content</h4>
                      <p>You retain ownership of applications and content you create using our platform.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Our Platform</h4>
                      <p>Happy Llama retains all rights to our platform, AI models, and proprietary technology.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Generated Code</h4>
                      <p>You own the code generated for your applications, subject to any third-party licenses for included libraries.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Terms</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Subscription fees are charged monthly or annually in advance</li>
                    <li>All fees are non-refundable except as required by law</li>
                    <li>We may change pricing with 30 days written notice</li>
                    <li>Accounts may be suspended for non-payment</li>
                    <li>You are responsible for all applicable taxes</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Privacy and Data</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>
                    Our collection and use of personal information is governed by our Privacy Policy. 
                    By using our services, you consent to such collection and use.
                  </p>
                  <p>
                    We may use aggregated, anonymized data to improve our AI models and services.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Availability</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>We strive to provide reliable service but do not guarantee:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Uninterrupted or error-free operation</li>
                    <li>Specific uptime percentages (except under SLA agreements)</li>
                    <li>Compatibility with all systems or configurations</li>
                    <li>Backup or recovery of your data</li>
                  </ul>
                  <p className="mt-4">
                    We recommend maintaining your own backups of important data.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Limitation of Liability</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, HAPPY LLAMA SHALL NOT BE LIABLE 
                    FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING 
                    FROM YOUR USE OF OUR SERVICES.
                  </p>
                  <p>
                    Our total liability for any claim related to our services shall not exceed 
                    the amount paid by you in the 12 months preceding the claim.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Termination</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>Either party may terminate your account:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>At any time with 30 days written notice</li>
                    <li>Immediately for breach of these terms</li>
                    <li>Immediately for illegal or harmful activities</li>
                  </ul>
                  <p className="mt-4">
                    Upon termination, you may download your data for 30 days before deletion.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Changes to Terms</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>
                    We may update these terms periodically. We will notify you of material changes 
                    via email or platform notice. Continued use after changes constitutes acceptance.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    For questions about these Terms of Service, contact us:
                  </p>
                  <div className="space-y-2">
                    <p><strong>Email:</strong> legal@happyllama.ai</p>
                    <p><strong>Address:</strong> Happy Llama Inc., 123 Innovation Way, San Francisco, CA 94105</p>
                  </div>
                  <div className="mt-6">
                    <Button variant="outline">
                      <DocumentTextIcon className="mr-2 h-4 w-4" />
                      Download Terms (PDF)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}