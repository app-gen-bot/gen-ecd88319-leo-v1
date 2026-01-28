'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  Zap, 
  BarChart3,
  CheckCircle,
  Music,
  Database,
  Webhook,
  LineChart,
  Shield,
  HeadphonesIcon,
  ArrowRight
} from 'lucide-react'

const steps = [
  {
    id: 'step-1',
    number: '01',
    title: 'Upload Your Music',
    subtitle: 'Simple drag-and-drop interface',
    description: 'Start by uploading your tracks to our secure platform. We support MP3, WAV, and FLAC formats up to 500MB.',
    icon: Upload,
    features: [
      'Bulk upload multiple tracks at once',
      'Automatic audio quality validation',
      'Secure cloud storage with encryption',
      'Resume interrupted uploads'
    ],
    details: [
      {
        title: 'Metadata Extraction',
        description: 'Our AI automatically extracts title, artist, album, genre, and more from your files.'
      },
      {
        title: 'Audio Fingerprinting',
        description: 'We create unique fingerprints to detect duplicates and track your music across platforms.'
      },
      {
        title: 'Format Optimization',
        description: 'Files are optimized for each platform\'s requirements automatically.'
      }
    ]
  },
  {
    id: 'step-2',
    number: '02',
    title: 'We Register Everywhere',
    subtitle: 'Automated multi-platform submission',
    description: 'Once uploaded, our system automatically submits your music to all selected platforms using their APIs.',
    icon: Zap,
    features: [
      'Simultaneous submission to all platforms',
      'Platform-specific formatting',
      'Automatic retry on failures',
      'Real-time status tracking'
    ],
    details: [
      {
        title: 'MLC Registration',
        description: 'Mechanical licensing for streaming and downloads through the MLC portal.'
      },
      {
        title: 'PRO Registration',
        description: 'Performance rights registration with ASCAP, BMI, and SESAC.'
      },
      {
        title: 'Distribution Partners',
        description: 'Integration with major distribution platforms for maximum reach.'
      }
    ]
  },
  {
    id: 'step-3',
    number: '03',
    title: 'Track Your Royalties',
    subtitle: 'Unified analytics dashboard',
    description: 'Monitor all your registrations and revenue projections in one comprehensive dashboard.',
    icon: BarChart3,
    features: [
      'Cross-platform revenue tracking',
      'Registration status monitoring',
      'Detailed analytics and reports',
      'Payment tracking and history'
    ],
    details: [
      {
        title: 'Revenue Projections',
        description: 'AI-powered projections based on genre, platform data, and market trends.'
      },
      {
        title: 'Real-time Updates',
        description: 'Live updates on registration status and earnings via WebSocket.'
      },
      {
        title: 'Export Reports',
        description: 'Download detailed reports for accounting and tax purposes.'
      }
    ]
  }
]

const workflow = [
  { step: 'Upload', icon: Music, description: 'Add your music files' },
  { step: 'Process', icon: Database, description: 'Extract & validate metadata' },
  { step: 'Submit', icon: Webhook, description: 'Register across platforms' },
  { step: 'Monitor', icon: LineChart, description: 'Track status & revenue' },
  { step: 'Collect', icon: HeadphonesIcon, description: 'Receive your royalties' }
]

const platforms = [
  { 
    name: 'MLC', 
    type: 'Mechanical Licensing',
    description: 'Streaming and download royalties',
    timeline: '1-2 days'
  },
  { 
    name: 'SoundExchange', 
    type: 'Digital Performance',
    description: 'Internet radio and streaming',
    timeline: '2-3 days'
  },
  { 
    name: 'PROs', 
    type: 'Performance Rights',
    description: 'ASCAP, BMI, SESAC registration',
    timeline: '3-5 days'
  },
  { 
    name: 'Distribution', 
    type: 'Digital Distribution',
    description: 'Spotify, Apple Music, etc.',
    timeline: '1-2 weeks'
  }
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 overflow-visible">
              <div className="flex items-center justify-center w-8 h-8 overflow-visible">
                <Music className="h-8 w-8 text-primary flex-shrink-0" style={{ minWidth: '32px', minHeight: '32px' }} />
              </div>
              <span className="text-xl font-bold">The Plug</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/features" className="text-sm font-medium hover:text-primary">
                Features
              </Link>
              <Link href="/pricing" className="text-sm font-medium hover:text-primary">
                Pricing
              </Link>
              <Link href="/how-it-works" className="text-sm font-medium text-primary">
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

      {/* Hero */}
      <section className="pt-32 pb-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge className="mb-4" variant="secondary">Simple 3-Step Process</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            How The Plug Works
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            From upload to royalties in three simple steps. We handle all the complexity 
            so you can focus on making music.
          </p>
        </div>
      </section>

      {/* Visual Workflow */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap justify-between items-center gap-4 p-8 bg-muted rounded-xl">
            {workflow.map((item, index) => (
              <div key={item.step} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <span className="font-semibold">{item.step}</span>
                  <span className="text-sm text-muted-foreground text-center max-w-[100px]">
                    {item.description}
                  </span>
                </div>
                {index < workflow.length - 1 && (
                  <ArrowRight className="h-6 w-6 text-muted-foreground hidden lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Steps */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-32">
            {steps.map((step, index) => (
              <div key={step.id} id={step.id}>
                <div className={`flex flex-col lg:flex-row gap-12 items-start ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}>
                  <div className="flex-1 space-y-6">
                    <div className="flex items-start gap-6">
                      <div className="text-6xl font-bold text-muted-foreground/20">
                        {step.number}
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold mb-2">{step.title}</h2>
                        <p className="text-xl text-primary">{step.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-lg text-muted-foreground">
                      {step.description}
                    </p>
                    <ul className="space-y-3">
                      {step.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-1 space-y-4">
                    {step.details.map((detail) => (
                      <Card key={detail.title}>
                        <CardHeader>
                          <CardTitle className="text-lg">{detail.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription>{detail.description}</CardDescription>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Timeline */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Registration Timeline</h2>
            <p className="text-xl text-muted-foreground">
              How long each platform typically takes to process registrations
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platforms.map((platform) => (
              <Card key={platform.name}>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle>{platform.name}</CardTitle>
                    <Badge variant="secondary">{platform.timeline}</Badge>
                  </div>
                  <p className="text-sm font-medium text-primary">{platform.type}</p>
                </CardHeader>
                <CardContent>
                  <CardDescription>{platform.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              <Shield className="inline h-4 w-4 mr-1" />
              All registrations include automatic retry and human support if needed
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Common Questions
          </h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What file formats do you support?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We support MP3, WAV, and FLAC files up to 500MB each. Files are automatically 
                  converted to meet each platform's requirements.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>How do you handle failed registrations?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our system automatically retries failed registrations. If issues persist, 
                  our support team is notified and will manually resolve the registration.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Can I track registrations in real-time?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! Our dashboard provides real-time updates on all registration statuses. 
                  You'll also receive email notifications for important events.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Do you store my platform credentials?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, credentials are stored using bank-level encryption. We use OAuth when 
                  possible and never store passwords in plain text.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to simplify your music registration?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start your 14-day free trial and see how easy it can be
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Watch Demo
              </Button>
            </Link>
          </div>
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