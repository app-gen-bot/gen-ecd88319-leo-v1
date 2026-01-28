"use client"

import Link from 'next/link'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Layout from '@/components/layout'

const cookieCategories = [
  {
    name: "Essential Cookies",
    description: "These cookies are necessary for the website to function and cannot be disabled.",
    always_active: true,
    cookies: [
      {
        name: "session_id",
        purpose: "Maintains your session while browsing the site",
        duration: "Session",
        type: "First-party"
      },
      {
        name: "csrf_token",
        purpose: "Protects against cross-site request forgery attacks",
        duration: "Session",
        type: "First-party"
      },
      {
        name: "cookie_consent",
        purpose: "Remembers your cookie preferences",
        duration: "1 year",
        type: "First-party"
      }
    ]
  },
  {
    name: "Analytics Cookies",
    description: "These cookies help us understand how visitors use our website.",
    always_active: false,
    cookies: [
      {
        name: "_ga",
        purpose: "Distinguishes unique users",
        duration: "2 years",
        type: "Third-party (Google)"
      },
      {
        name: "_ga_*",
        purpose: "Used by Google Analytics to collect data on visitor behavior",
        duration: "2 years",
        type: "Third-party (Google)"
      },
      {
        name: "mixpanel_*",
        purpose: "Tracks user interactions and events",
        duration: "1 year",
        type: "Third-party (Mixpanel)"
      }
    ]
  },
  {
    name: "Marketing Cookies",
    description: "These cookies are used to track visitors across websites for marketing purposes.",
    always_active: false,
    cookies: [
      {
        name: "_fbp",
        purpose: "Facebook pixel for conversion tracking",
        duration: "3 months",
        type: "Third-party (Facebook)"
      },
      {
        name: "linkedin_*",
        purpose: "LinkedIn tracking for B2B marketing",
        duration: "2 years",
        type: "Third-party (LinkedIn)"
      },
      {
        name: "intercom_*",
        purpose: "Customer support and messaging",
        duration: "9 months",
        type: "Third-party (Intercom)"
      }
    ]
  },
  {
    name: "Preference Cookies",
    description: "These cookies remember your preferences and settings.",
    always_active: false,
    cookies: [
      {
        name: "theme_preference",
        purpose: "Remembers your dark/light mode preference",
        duration: "1 year",
        type: "First-party"
      },
      {
        name: "language_preference",
        purpose: "Stores your preferred language",
        duration: "1 year",
        type: "First-party"
      }
    ]
  }
]

export default function CookiePolicyPage() {
  return (
    <Layout>
      {/* Header */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <ChevronRightIcon className="h-4 w-4" />
            <Link href="/legal" className="hover:text-gray-700">Legal</Link>
            <ChevronRightIcon className="h-4 w-4" />
            <span className="text-gray-900">Cookie Policy</span>
          </nav>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Cookie Policy
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn about how Happy Llama uses cookies to improve your experience and protect your privacy.
            </p>
            <div className="mt-4 text-sm text-gray-500">
              Last updated: January 22, 2025
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Introduction */}
          <div className="prose prose-lg max-w-none mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What are cookies?</h2>
            <p className="text-gray-600 mb-6">
              Cookies are small text files that are placed on your device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences and 
              understanding how you use our site.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">How we use cookies</h2>
            <p className="text-gray-600 mb-6">
              We use cookies for various purposes including:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-8">
              <li>Essential site functionality and security</li>
              <li>Analyzing site usage and performance</li>
              <li>Personalizing content and advertisements</li>
              <li>Remembering your preferences and settings</li>
              <li>Providing customer support through chat widgets</li>
            </ul>
          </div>

          {/* Cookie Categories */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Types of cookies we use</h2>
            
            {cookieCategories.map((category, index) => (
              <Card key={index} className="border border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{category.name}</CardTitle>
                    {category.always_active ? (
                      <Badge variant="secondary">Always Active</Badge>
                    ) : (
                      <Badge variant="outline">Optional</Badge>
                    )}
                  </div>
                  <p className="text-gray-600">{category.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.cookies.map((cookie, cookieIndex) => (
                      <div key={cookieIndex} className="border-l-4 border-blue-200 pl-4 py-2">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{cookie.name}</h4>
                          <div className="flex space-x-2">
                            <Badge variant="outline" className="text-xs">{cookie.duration}</Badge>
                            <Badge variant="secondary" className="text-xs">{cookie.type}</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{cookie.purpose}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Managing Cookies */}
          <div className="mt-16 prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing your cookie preferences</h2>
            <p className="text-gray-600 mb-6">
              You can control and manage cookies in several ways:
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Browser Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Most browsers allow you to control cookies through their settings preferences.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Block all cookies</li>
                    <li>• Block third-party cookies</li>
                    <li>• Delete existing cookies</li>
                    <li>• Set preferences for specific sites</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cookie Consent Banner</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Use our cookie consent banner to customize your preferences.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Accept or reject optional cookies</li>
                    <li>• Choose specific categories</li>
                    <li>• Change preferences anytime</li>
                    <li>• View detailed cookie information</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-4">Third-party opt-out links</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-sm text-gray-600 mb-4">
                You can opt out of certain third-party cookies directly:
              </p>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Google Analytics:</strong>{' '}
                  <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Google Analytics Opt-out Browser Add-on
                  </a>
                </div>
                <div>
                  <strong>Facebook:</strong>{' '}
                  <a href="https://www.facebook.com/settings?tab=ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Facebook Ad Preferences
                  </a>
                </div>
                <div>
                  <strong>LinkedIn:</strong>{' '}
                  <a href="https://www.linkedin.com/psettings/guest-controls/retargeting-opt-out" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    LinkedIn Advertising Preferences
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact and Updates */}
          <div className="mt-16 border-t pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions or updates</h2>
            <p className="text-gray-600 mb-6">
              This cookie policy may be updated from time to time. We will notify you of any significant 
              changes by posting the new policy on this page and updating the "last updated" date.
            </p>
            <p className="text-gray-600 mb-8">
              If you have any questions about our use of cookies, please contact us:
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/legal/privacy">Privacy Policy</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}