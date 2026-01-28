'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, X, HelpCircle, Music } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      { name: 'Up to 5 songs', included: true },
      { name: 'Basic platforms (MLC only)', included: true },
      { name: 'Email support', included: true },
      { name: 'Registration status tracking', included: true },
      { name: 'Basic analytics', included: true },
      { name: 'PRO registration', included: false },
      { name: 'Distribution partners', included: false },
      { name: 'Revenue projections', included: false },
      { name: 'Priority support', included: false },
      { name: 'API access', included: false },
    ],
    cta: 'Start Free',
    href: '/sign-up?plan=free',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For serious independent artists',
    features: [
      { name: 'Unlimited songs', included: true },
      { name: 'All platforms', included: true, tooltip: 'MLC, PROs, SoundExchange, Distribution' },
      { name: 'Priority email & chat support', included: true },
      { name: 'Advanced registration tracking', included: true },
      { name: 'Revenue projections & analytics', included: true },
      { name: 'PRO registration (ASCAP, BMI, SESAC)', included: true },
      { name: 'Distribution partner integration', included: true },
      { name: 'Bulk registration', included: true },
      { name: 'Export reports', included: true },
      { name: 'API access', included: false },
    ],
    cta: 'Start Pro Trial',
    href: '/sign-up?plan=pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For labels and publishers',
    features: [
      { name: 'Everything in Pro', included: true },
      { name: 'Custom integrations', included: true },
      { name: 'Dedicated account manager', included: true },
      { name: 'Phone & video support', included: true },
      { name: 'Team management', included: true, tooltip: 'Multiple users with role-based access' },
      { name: 'White-label options', included: true },
      { name: 'Full API access', included: true },
      { name: 'Custom reporting', included: true },
      { name: 'SLA guarantee', included: true },
      { name: 'Training & onboarding', included: true },
    ],
    cta: 'Contact Sales',
    href: '/contact?type=enterprise',
    popular: false,
  },
]

const faqs = [
  {
    question: 'Can I change plans anytime?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll be prorated for the remainder of your billing cycle. When downgrading, the change takes effect at your next renewal.',
  },
  {
    question: 'What happens to my songs if I downgrade?',
    answer: 'Your existing registrations remain active. However, if you exceed the song limit on a lower plan, you won\'t be able to add new songs until you\'re within the limit or upgrade again.',
  },
  {
    question: 'Do you offer discounts for annual billing?',
    answer: 'Yes! Save 20% with annual billing on Pro and Enterprise plans. That\'s 2 months free when you pay yearly.',
  },
  {
    question: 'What platforms are included?',
    answer: 'Pro and Enterprise plans include: MLC (Mechanical Licensing Collective), all major PROs (ASCAP, BMI, SESAC), SoundExchange, major distribution partners, and Copyright Office registration (Phase 2).',
  },
  {
    question: 'Is there a setup fee?',
    answer: 'No setup fees for any plan. Start your 14-day free trial today and only pay when you\'re ready to continue.',
  },
]

export default function PricingPage() {
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
              <Link href="/pricing" className="text-sm font-medium text-primary">
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
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Choose the perfect plan for your music career
          </p>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm">
            <CheckCircle className="h-4 w-4" />
            14-day free trial • No credit card required • Cancel anytime
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <TooltipProvider>
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <Card 
                  key={plan.name} 
                  className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="px-3 py-1">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <CardDescription className="mb-4">{plan.description}</CardDescription>
                    <div className="text-4xl font-bold">
                      {plan.price}
                      <span className="text-lg font-normal text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Link href={plan.href}>
                      <Button 
                        className="w-full" 
                        variant={plan.popular ? 'default' : 'outline'}
                        size="lg"
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                    <div className="space-y-3 pt-4">
                      {plan.features.map((feature) => (
                        <div key={feature.name} className="flex items-start gap-3">
                          {feature.included ? (
                            <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${!feature.included ? 'text-muted-foreground/50' : ''}`}>
                            {feature.name}
                            {feature.tooltip && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="inline h-3 w-3 ml-1 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">{feature.tooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TooltipProvider>

          {/* Annual Billing */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-muted px-6 py-3 rounded-lg">
              <span className="text-sm font-medium">Save 20% with annual billing</span>
              <Badge variant="secondary">2 months free</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <Link href="/contact">
              <Button variant="outline">Contact Support</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to streamline your music registrations?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start your 14-day free trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up?plan=pro">
              <Button size="lg" className="text-lg px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Try Demo
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