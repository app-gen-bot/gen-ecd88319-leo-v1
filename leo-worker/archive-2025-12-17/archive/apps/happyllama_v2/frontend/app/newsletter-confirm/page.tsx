"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircleIcon, BellIcon, BookOpenIcon, RssIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Layout from '@/components/layout'

interface NewsletterPreference {
  id: string
  title: string
  description: string
  frequency: string
  icon: string
  enabled: boolean
}

const newsletterTypes: NewsletterPreference[] = [
  {
    id: 'product-updates',
    title: 'Product Updates',
    description: 'Latest features, improvements, and product announcements',
    frequency: 'Bi-weekly',
    icon: '🚀',
    enabled: true
  },
  {
    id: 'educational-content',
    title: 'Educational Content',
    description: 'AI development tips, best practices, and technical insights',
    frequency: 'Weekly',
    icon: '📚',
    enabled: true
  },
  {
    id: 'company-news',
    title: 'Company News',
    description: 'Funding announcements, team updates, and company milestones',
    frequency: 'Monthly',
    icon: '📈',
    enabled: false
  },
  {
    id: 'community-events',
    title: 'Community & Events',
    description: 'Webinars, meetups, conferences, and community highlights',
    frequency: 'As scheduled',
    icon: '🎪',
    enabled: false
  },
  {
    id: 'industry-insights',
    title: 'Industry Insights',
    description: 'AI industry trends, market analysis, and thought leadership',
    frequency: 'Monthly',
    icon: '🔍',
    enabled: false
  }
]

const recentArticles = [
  {
    title: 'How AI Agents are Revolutionizing Software Development',
    date: '2025-01-18',
    readTime: '5 min read',
    category: 'Industry Insights'
  },
  {
    title: 'Building Type-Safe Applications with AI: A Complete Guide',
    date: '2025-01-15',
    readTime: '8 min read',
    category: 'Educational'
  },
  {
    title: 'Happy Llama Series A: Scaling AI Development for Everyone',
    date: '2025-01-12',
    readTime: '3 min read',
    category: 'Company News'
  },
  {
    title: 'From Prototype to Production in 48 Hours: A Case Study',
    date: '2025-01-10',
    readTime: '6 min read',
    category: 'Success Stories'
  }
]

export default function NewsletterConfirmPage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [preferences, setPreferences] = useState(newsletterTypes)
  const [_isConfirmed, setIsConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'confirming' | 'confirmed' | 'preferences'>('confirming')

  useEffect(() => {
    // Get email from URL params or simulate confirmation
    const emailParam = searchParams?.get('email') || ''
    const token = searchParams?.get('token')
    
    if (emailParam) {
      setEmail(emailParam)
    }

    // Simulate email confirmation process
    const confirmEmail = async () => {
      if (token) {
        setLoading(true)
        // Simulate API call to confirm email
        await new Promise(resolve => setTimeout(resolve, 2000))
        setIsConfirmed(true)
        setStep('confirmed')
        setLoading(false)
      }
    }

    confirmEmail()
  }, [searchParams])

  const handlePreferenceToggle = (id: string) => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      )
    )
  }

  const handleSavePreferences = async () => {
    setLoading(true)
    // Simulate saving preferences
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    setStep('confirmed')
  }

  if (loading && step === 'confirming') {
    return (
      <Layout>
        <section className="py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-8"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Confirming your subscription...
            </h1>
            <p className="text-gray-600">
              Please wait while we verify your email address.
            </p>
          </div>
        </section>
      </Layout>
    )
  }

  if (step === 'preferences') {
    return (
      <Layout>
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Customize Your Newsletter Experience
              </h1>
              <p className="text-xl text-gray-600">
                Choose what type of content you'd like to receive from Happy Llama.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {preferences.map((pref) => (
                <Card 
                  key={pref.id} 
                  className={`cursor-pointer transition-all ${
                    pref.enabled 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handlePreferenceToggle(pref.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{pref.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{pref.title}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {pref.frequency}
                          </Badge>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        pref.enabled 
                          ? 'bg-blue-600 border-blue-600' 
                          : 'border-gray-300'
                      }`}>
                        {pref.enabled && (
                          <CheckCircleIcon className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{pref.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button 
                onClick={handleSavePreferences}
                disabled={loading || !preferences.some(p => p.enabled)}
                size="lg"
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                You can change these preferences anytime from any newsletter email.
              </p>
            </div>
          </div>
        </section>
      </Layout>
    )
  }

  return (
    <Layout>
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Confirmation Success */}
          <div className="text-center mb-12">
            <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to the Happy Llama Newsletter!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your email {email && `(${email})`} has been confirmed. You're now subscribed to receive 
              the latest updates about AI-powered development and Happy Llama.
            </p>
          </div>

          {/* What to Expect */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center">
              <CardHeader>
                <RssIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Product Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Be the first to know about new features, improvements, and major product announcements.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BookOpenIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Educational Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Learn about AI development best practices, tutorials, and insights from our team.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BellIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Exclusive Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Get early access to new features, beta programs, and special events.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Newsletter Customization */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-12">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Want to customize your experience?
              </h2>
              <p className="text-gray-600">
                Choose exactly what type of content you'd like to receive.
              </p>
            </div>
            <div className="text-center">
              <Button 
                onClick={() => setStep('preferences')}
                variant="outline"
                size="lg"
              >
                Customize Newsletter Preferences
              </Button>
            </div>
          </div>

          {/* Recent Content */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Recent Newsletter Content
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {recentArticles.map((article, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">{article.category}</Badge>
                      <div className="text-xs text-gray-500">{article.readTime}</div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <div className="text-xs text-gray-500">
                      {new Date(article.date).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-6">
              <Button asChild variant="outline">
                <Link href="/blog">View All Articles</Link>
              </Button>
            </div>
          </div>

          {/* Social & Community */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
            <p className="text-lg mb-6 opacity-90">
              Connect with other builders, get support, and share your creations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild variant="secondary" size="lg">
                <Link href="https://twitter.com/happyllama" target="_blank">
                  Follow on Twitter
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Link href="https://linkedin.com/company/happyllama" target="_blank">
                  Connect on LinkedIn
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="text-white hover:bg-white/10">
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="text-center mt-12">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg">
                <Link href="/beta-signup">Join the Beta</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/">Explore Platform</Link>
              </Button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">
                Change your preferences or unsubscribe anytime from any newsletter email.
              </p>
              <div className="flex justify-center space-x-4 text-sm">
                <Link href="/legal/privacy" className="text-gray-500 hover:text-gray-700">
                  Privacy Policy
                </Link>
                <span className="text-gray-300">|</span>
                <Link href="/legal/terms" className="text-gray-500 hover:text-gray-700">
                  Terms of Service
                </Link>
                <span className="text-gray-300">|</span>
                <Link href="/contact" className="text-gray-500 hover:text-gray-700">
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}