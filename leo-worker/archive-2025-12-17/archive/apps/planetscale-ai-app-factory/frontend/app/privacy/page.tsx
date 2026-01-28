'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Printer } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container-max section-padding">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8 space-y-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Button>
              </Link>
              
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
                  <p className="text-muted-foreground">Last updated: January 1, 2024</p>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="hidden md:flex gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
              </div>
            </div>

            {/* Table of Contents */}
            <div className="mb-12 p-6 bg-muted/50 rounded-lg">
              <h2 className="font-semibold mb-4">Table of Contents</h2>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#information-collection" className="text-primary hover:underline">
                    1. Information Collection
                  </a>
                </li>
                <li>
                  <a href="#data-usage" className="text-primary hover:underline">
                    2. Data Usage
                  </a>
                </li>
                <li>
                  <a href="#third-party" className="text-primary hover:underline">
                    3. Third-Party Services
                  </a>
                </li>
                <li>
                  <a href="#user-rights" className="text-primary hover:underline">
                    4. User Rights
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-primary hover:underline">
                    5. Contact Information
                  </a>
                </li>
              </ul>
            </div>

            {/* Content */}
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <section id="information-collection" className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">1. Information Collection</h2>
                <p className="mb-4">
                  At PlanetScale AI, we collect information to provide better services to our users. 
                  The types of information we collect include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Personal Information:</strong> Name, email address, and company information 
                    when you sign up for our beta program or newsletter.
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Information about how you interact with our service, 
                    including prompts submitted and applications generated.
                  </li>
                  <li>
                    <strong>Technical Data:</strong> IP address, browser type, device information, 
                    and other technical details collected automatically.
                  </li>
                </ul>
              </section>

              <section id="data-usage" className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">2. Data Usage</h2>
                <p className="mb-4">
                  We use the collected information for the following purposes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To provide and maintain our service</li>
                  <li>To notify you about changes to our service</li>
                  <li>To provide customer support</li>
                  <li>To gather analysis or valuable information to improve our service</li>
                  <li>To monitor the usage of our service</li>
                  <li>To detect, prevent and address technical issues</li>
                </ul>
              </section>

              <section id="third-party" className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">3. Third-Party Services</h2>
                <p className="mb-4">
                  We may employ third-party companies and individuals to facilitate our service. 
                  These third parties have access to your personal data only to perform tasks on 
                  our behalf and are obligated not to disclose or use it for any other purpose.
                </p>
                <p className="mb-4">
                  Third-party services we use include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Analytics providers</li>
                  <li>Payment processors</li>
                  <li>Cloud infrastructure providers</li>
                  <li>Communication and support tools</li>
                </ul>
              </section>

              <section id="user-rights" className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">4. User Rights</h2>
                <p className="mb-4">
                  You have certain rights regarding your personal data:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Access:</strong> You can request a copy of your personal data
                  </li>
                  <li>
                    <strong>Correction:</strong> You can request that we correct any inaccurate data
                  </li>
                  <li>
                    <strong>Deletion:</strong> You can request that we delete your personal data
                  </li>
                  <li>
                    <strong>Portability:</strong> You can request to receive your data in a 
                    machine-readable format
                  </li>
                  <li>
                    <strong>Objection:</strong> You can object to certain processing of your data
                  </li>
                </ul>
              </section>

              <section id="contact" className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">5. Contact Information</h2>
                <p className="mb-4">
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <ul className="list-none space-y-2">
                  <li>
                    <strong>Email:</strong>{' '}
                    <a href="mailto:privacy@planetscale-ai.com" className="text-primary hover:underline">
                      privacy@planetscale-ai.com
                    </a>
                  </li>
                  <li>
                    <strong>Address:</strong> PlanetScale AI, Inc.<br />
                    123 AI Boulevard<br />
                    San Francisco, CA 94105<br />
                    United States
                  </li>
                </ul>
              </section>
            </div>

            {/* Back to top */}
            <div className="mt-12 text-center">
              <Button
                variant="outline"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Back to top
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}