'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Music, BarChart3, Shield, Users, Zap, Play, Upload, DollarSign } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 overflow-visible">
              <div className="flex items-center justify-center w-8 h-8 overflow-visible">
                <Music className="h-8 w-8 text-primary flex-shrink-0" style={{ minWidth: '32px', minHeight: '32px' }} />
              </div>
              <span className="text-xl font-bold">The Plug</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/features" className="text-sm font-medium hover:text-primary">
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
              <Link href="/dashboard">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/dashboard">
                <Button>Start Free Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Register Your Music Everywhere<br />
              <span className="text-primary">in One Click</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Upload once. We handle MLC, PROs, Copyright, and more automatically. 
              Track all your registrations and revenue projections in one unified dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-8">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Platform Logos */}
      <section className="py-12 border-y bg-muted/50">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground mb-8">
            TRUSTED BY ARTISTS TO REGISTER WITH
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {['MLC', 'ASCAP', 'BMI', 'SESAC', 'SoundExchange', 'Copyright Office'].map((platform) => (
              <div key={platform} className="text-2xl font-bold text-muted-foreground/60">
                {platform}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Overview */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">
              Three simple steps to register your music everywhere
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Upload Your Music',
                description: 'Drag and drop your tracks. We automatically extract metadata and prepare for registration.',
                icon: Upload,
              },
              {
                step: '2',
                title: 'We Register Everywhere',
                description: 'Our system automatically submits to MLC, PROs, distributors, and copyright offices.',
                icon: Zap,
              },
              {
                step: '3',
                title: 'Track Your Royalties',
                description: 'Monitor registration status and view revenue projections in your unified dashboard.',
                icon: BarChart3,
              },
            ].map((item) => (
              <Link key={item.step} href={`/how-it-works#step-${item.step}`}>
                <Card className="text-center h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>
                      <span className="text-sm text-muted-foreground">Step {item.step}</span>
                      <br />
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{item.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground">
              Powerful features to simplify music registration
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'One Upload, All Platforms',
                description: 'Upload once and we handle registration across MLC, PROs, distributors, and copyright offices.',
                icon: Upload,
                href: '/features#one-upload',
              },
              {
                title: 'Automatic Metadata Extraction',
                description: 'Our AI extracts and validates metadata from your audio files automatically.',
                icon: Zap,
                href: '/features#metadata',
              },
              {
                title: 'Real-time Registration Status',
                description: 'Track the progress of each registration with live updates and notifications.',
                icon: CheckCircle,
                href: '/features#status',
              },
              {
                title: 'Revenue Projections',
                description: 'See estimated royalties across all platforms with detailed analytics.',
                icon: DollarSign,
                href: '/features#revenue',
              },
              {
                title: 'Human Support When Needed',
                description: 'Our team steps in when registrations require manual intervention.',
                icon: Users,
                href: '/features#support',
              },
              {
                title: 'Secure API Integrations',
                description: 'Bank-level security for all your platform credentials and data.',
                icon: Shield,
                href: '/features#security',
              },
            ].map((feature) => (
              <Link key={feature.title} href={feature.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <feature.icon className="h-8 w-8 text-primary mb-4" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/features">
              <Button variant="outline">Learn More</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground">
              Choose the plan that works for your music career
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Free',
                price: '$0',
                description: 'Perfect for getting started',
                features: ['Up to 5 songs', 'Basic platforms', 'Email support'],
                href: '/dashboard',
              },
              {
                name: 'Pro',
                price: '$29',
                description: 'For serious independent artists',
                features: ['Unlimited songs', 'All platforms', 'Priority support', 'Revenue analytics'],
                popular: true,
                href: '/dashboard',
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                description: 'For labels and publishers',
                features: ['Custom integrations', 'Dedicated support', 'Team management', 'API access'],
                href: '/contact?type=enterprise',
              },
            ].map((plan) => (
              <Card key={plan.name} className={plan.popular ? 'border-primary shadow-lg' : ''}>
                <CardHeader>
                  {plan.popular && (
                    <Badge className="w-fit mb-2">Most Popular</Badge>
                  )}
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    {plan.price}
                    {plan.price !== 'Custom' && <span className="text-base font-normal text-muted-foreground">/month</span>}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} className="block">
                    <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                      {plan.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/pricing" className="text-primary hover:underline">
              See Full Pricing Details →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to simplify your music registration?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of artists who trust The Plug to handle their registrations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Start Your Free Trial
              </Button>
            </Link>
            <Link href="/contact?type=demo">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Book a Demo
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
                <li><Link href="/changelog" className="hover:text-foreground">What&apos;s New</Link></li>
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