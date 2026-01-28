'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Upload, 
  Zap, 
  CheckCircle, 
  DollarSign, 
  Users, 
  Shield,
  BarChart3,
  Music,
  Globe,
  Clock,
  FileText,
  Bot
} from 'lucide-react'

const features = [
  {
    id: 'one-upload',
    title: 'One Upload, All Platforms',
    description: 'Upload your music once and we automatically register it across all major platforms.',
    icon: Upload,
    details: [
      'Automatic submission to MLC (Mechanical Licensing Collective)',
      'PRO registration (ASCAP, BMI, SESAC)',
      'SoundExchange for digital performance royalties',
      'Distribution partner integration',
      'Copyright Office automation (coming in Phase 2)',
      'Bulk upload support for catalogs'
    ],
    screenshot: '/screenshots/upload.png'
  },
  {
    id: 'metadata',
    title: 'Automatic Metadata Extraction',
    description: 'Our AI-powered system extracts and validates all metadata from your audio files.',
    icon: Bot,
    details: [
      'Audio fingerprinting for duplicate detection',
      'Automatic title, artist, and album extraction',
      'Genre classification and mood detection',
      'ISRC code generation and management',
      'Writer and publisher information parsing',
      'Smart validation and error correction'
    ],
    screenshot: '/screenshots/metadata.png'
  },
  {
    id: 'status',
    title: 'Real-time Registration Status',
    description: 'Track every registration with live updates and detailed progress monitoring.',
    icon: CheckCircle,
    details: [
      'Live status updates via WebSocket',
      'Platform-specific progress tracking',
      'Email and in-app notifications',
      'Detailed timeline for each registration',
      'Error detection and retry mechanisms',
      'Human-in-the-loop escalation when needed'
    ],
    screenshot: '/screenshots/status.png'
  },
  {
    id: 'revenue',
    title: 'Revenue Projections & Analytics',
    description: 'See estimated royalties and earnings across all platforms with powerful analytics.',
    icon: DollarSign,
    details: [
      'Cross-platform revenue aggregation',
      'Historical earnings tracking',
      'Future projection modeling',
      'Platform performance comparison',
      'Downloadable reports and exports',
      'Real-time analytics dashboard'
    ],
    screenshot: '/screenshots/analytics.png'
  },
  {
    id: 'support',
    title: 'Human Support When Needed',
    description: 'Our expert team steps in when registrations require manual intervention.',
    icon: Users,
    details: [
      'Automatic escalation for complex cases',
      'Expert review of rejected registrations',
      'Direct communication with support team',
      'Priority handling for Pro members',
      'Detailed issue tracking and resolution',
      '99.9% registration success rate'
    ],
    screenshot: '/screenshots/support.png'
  },
  {
    id: 'security',
    title: 'Bank-Level Security',
    description: 'Your data and credentials are protected with enterprise-grade security.',
    icon: Shield,
    details: [
      '256-bit AES encryption at rest',
      'TLS 1.3 for data in transit',
      'OAuth 2.0 for platform connections',
      'Regular security audits and penetration testing',
      'GDPR and CCPA compliant',
      'Secure credential storage with HSM'
    ],
    screenshot: '/screenshots/security.png'
  }
]

const additionalFeatures = [
  {
    icon: Globe,
    title: 'Global Platform Coverage',
    description: 'Register with platforms worldwide, not just US-based organizations.'
  },
  {
    icon: Clock,
    title: 'Scheduled Releases',
    description: 'Plan your releases in advance and automate registration timing.'
  },
  {
    icon: FileText,
    title: 'Document Management',
    description: 'Store and manage all your music-related documents in one place.'
  },
  {
    icon: BarChart3,
    title: 'Advanced Reporting',
    description: 'Generate detailed reports for tax purposes and business planning.'
  },
  {
    icon: Music,
    title: 'Catalog Management',
    description: 'Organize and manage your entire music catalog efficiently.'
  },
  {
    icon: Zap,
    title: 'API Access',
    description: 'Integrate The Plug with your existing tools and workflows.'
  }
]

export default function FeaturesPage() {
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
              <Link href="/features" className="text-sm font-medium text-primary">
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

      {/* Hero */}
      <section className="pt-32 pb-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Powerful Features for Modern Musicians
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Everything you need to register, track, and monetize your music across all platforms.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg">Start Free Trial</Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline">Watch Demo</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-32">
            {features.map((feature, index) => (
              <div 
                key={feature.id} 
                id={feature.id}
                className={`flex flex-col lg:flex-row gap-12 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold">{feature.title}</h2>
                  </div>
                  <p className="text-xl text-muted-foreground">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1">
                  <div className="bg-muted rounded-lg aspect-video flex items-center justify-center">
                    <span className="text-muted-foreground">Feature Screenshot</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">And So Much More</h2>
            <p className="text-xl text-muted-foreground">
              Additional features to supercharge your music business
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="h-8 w-8 text-primary mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Partners */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Integrated with Industry Leaders</h2>
            <p className="text-xl text-muted-foreground">
              Seamless connections to all major music platforms and organizations
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {['MLC', 'ASCAP', 'BMI', 'SESAC', 'SoundExchange', 'Copyright Office'].map((partner) => (
              <div key={partner} className="flex items-center justify-center p-6 bg-muted rounded-lg">
                <span className="font-semibold text-muted-foreground">{partner}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Experience The Plug?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of artists who've simplified their music registration process
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Start Your Free Trial
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                View Pricing
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