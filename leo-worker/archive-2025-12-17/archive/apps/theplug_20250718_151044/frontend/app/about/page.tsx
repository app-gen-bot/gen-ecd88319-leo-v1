'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Music, 
  Users, 
  Target, 
  Heart,
  Zap,
  Shield,
  Globe,
  TrendingUp
} from 'lucide-react'

const values = [
  {
    icon: Heart,
    title: 'Artist First',
    description: 'We believe artists should focus on creating, not paperwork. Every feature we build starts with artist needs.'
  },
  {
    icon: Zap,
    title: 'Simplicity',
    description: 'Complex processes made simple. One upload should be all it takes to register everywhere.'
  },
  {
    icon: Shield,
    title: 'Transparency',
    description: 'No hidden fees, no surprises. Clear pricing and honest communication at every step.'
  },
  {
    icon: Globe,
    title: 'Accessibility',
    description: 'Music registration should be available to every artist, regardless of technical expertise or location.'
  }
]

const stats = [
  { value: '10,000+', label: 'Artists Served' },
  { value: '50,000+', label: 'Songs Registered' },
  { value: '99.9%', label: 'Success Rate' },
  { value: '24/7', label: 'Support Available' }
]

const team = [
  {
    name: 'Sarah Chen',
    role: 'CEO & Co-founder',
    bio: 'Former music industry executive with 15 years experience at major labels.',
    image: '/team/sarah.jpg'
  },
  {
    name: 'Marcus Johnson',
    role: 'CTO & Co-founder',
    bio: 'Engineering leader who built registration systems for top music platforms.',
    image: '/team/marcus.jpg'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Head of Artist Relations',
    bio: 'Independent artist turned advocate, ensuring we serve artist needs.',
    image: '/team/emily.jpg'
  },
  {
    name: 'David Kim',
    role: 'Head of Engineering',
    bio: 'API integration expert making complex systems work seamlessly together.',
    image: '/team/david.jpg'
  }
]

const milestones = [
  {
    year: '2021',
    title: 'The Beginning',
    description: 'Founded with a mission to simplify music registration for independent artists.'
  },
  {
    year: '2022',
    title: 'Platform Launch',
    description: 'Launched with MLC and PRO integrations, serving our first 1,000 artists.'
  },
  {
    year: '2023',
    title: 'Rapid Growth',
    description: 'Expanded to 10,000+ artists and added SoundExchange and distribution partners.'
  },
  {
    year: '2024',
    title: 'Industry Leader',
    description: 'Became the go-to platform for automated music registration with 99.9% success rate.'
  }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Music className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">The Plug</span>
            </Link>
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
              <Link href="/about" className="text-sm font-medium text-primary">
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
          <Badge className="mb-4" variant="secondary">About The Plug</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Empowering Artists to Own Their Future
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            We're on a mission to democratize music registration, making it accessible, 
            transparent, and effortless for every artist worldwide.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Target className="h-12 w-12 text-primary" />
                <h2 className="text-3xl font-bold">Our Mission</h2>
              </div>
              <p className="text-lg text-muted-foreground">
                The music industry is complex, with countless organizations, platforms, 
                and requirements. Artists shouldn't need a law degree or technical expertise 
                to ensure they're properly registered and collecting their rightful royalties.
              </p>
              <p className="text-lg text-muted-foreground">
                The Plug exists to bridge this gap. We handle the complexity so artists can 
                focus on what they do best: creating music. Our platform automates the entire 
                registration process, ensuring no royalty goes uncollected.
              </p>
              <div className="pt-4">
                <Link href="/sign-up">
                  <Button size="lg">Join Our Mission</Button>
                </Link>
              </div>
            </div>
            <div className="bg-muted rounded-lg aspect-video flex items-center justify-center">
              <span className="text-muted-foreground">Mission Video</span>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="text-center">
                <CardHeader>
                  <value.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{value.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
            <p className="text-xl text-muted-foreground">
              Making a difference in the music industry
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet the Team</h2>
            <p className="text-xl text-muted-foreground">
              Industry experts dedicated to simplifying music registration
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <Card key={member.name} className="text-center">
                <CardHeader>
                  <div className="h-32 w-32 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <CardTitle>{member.name}</CardTitle>
                  <p className="text-sm text-primary">{member.role}</p>
                </CardHeader>
                <CardContent>
                  <CardDescription>{member.bio}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
            <p className="text-xl text-muted-foreground">
              Building the future of music registration
            </p>
          </div>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={milestone.year} className="flex gap-8">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    {milestone.year.slice(-2)}
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="w-0.5 h-24 bg-border mt-4" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-8">
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-full border-2 border-primary flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">The Future</h3>
                <p className="text-muted-foreground">
                  Expanding globally and adding copyright registration to become the complete 
                  solution for music rights management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Join Us in Transforming Music Registration
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Be part of the movement making music rights accessible to all
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Start Your Journey
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Get in Touch
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