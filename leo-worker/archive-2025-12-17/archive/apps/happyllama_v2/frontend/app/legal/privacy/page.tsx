"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheckIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <ShieldCheckIcon className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your privacy is important to us. This policy explains how we collect, 
              use, and protect your personal information.
            </p>
            
            <p className="text-sm text-gray-500">
              Last updated: January 22, 2025
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Content */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Information We Collect</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>We collect information you provide directly to us, such as:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Account information (name, email, company)</li>
                    <li>Profile information and preferences</li>
                    <li>Application descriptions and generated code</li>
                    <li>Communication content and feedback</li>
                    <li>Payment and billing information</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How We Use Your Information</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Generate AI-powered code and applications</li>
                    <li>Communicate with you about updates and support</li>
                    <li>Process payments and billing</li>
                    <li>Analyze usage patterns to enhance user experience</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Security</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>We implement appropriate technical and organizational measures to protect your personal information:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Encryption in transit and at rest (AES-256)</li>
                    <li>Regular security audits and penetration testing</li>
                    <li>Access controls and authentication requirements</li>
                    <li>Employee training on data protection</li>
                    <li>Incident response and breach notification procedures</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Sharing</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>We do not sell, trade, or otherwise transfer your personal information to third parties except:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>With your explicit consent</li>
                    <li>To trusted service providers who assist our operations</li>
                    <li>When required by law or to protect our rights</li>
                    <li>In connection with a merger, acquisition, or sale of assets</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Rights</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Access and review your personal information</li>
                    <li>Correct inaccurate or incomplete data</li>
                    <li>Delete your personal information (right to be forgotten)</li>
                    <li>Port your data to another service</li>
                    <li>Opt out of certain data processing activities</li>
                    <li>File a complaint with supervisory authorities</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cookies and Tracking</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>We use cookies and similar technologies to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Maintain your session and preferences</li>
                    <li>Analyze site usage and performance</li>
                    <li>Provide personalized experiences</li>
                    <li>Deliver targeted content and advertisements</li>
                  </ul>
                  <p className="mt-4">
                    You can control cookie settings through your browser preferences.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>International Transfers</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>
                    Your information may be transferred to and processed in countries other than your own. 
                    We ensure appropriate safeguards are in place to protect your data in accordance with 
                    applicable privacy laws, including GDPR and CCPA.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    If you have any questions about this Privacy Policy, please contact us:
                  </p>
                  <div className="space-y-2">
                    <p><strong>Email:</strong> privacy@happyllama.ai</p>
                    <p><strong>Address:</strong> Happy Llama Inc., 123 Innovation Way, San Francisco, CA 94105</p>
                  </div>
                  <div className="mt-6">
                    <Button variant="outline">
                      <DocumentTextIcon className="mr-2 h-4 w-4" />
                      Download Privacy Policy (PDF)
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