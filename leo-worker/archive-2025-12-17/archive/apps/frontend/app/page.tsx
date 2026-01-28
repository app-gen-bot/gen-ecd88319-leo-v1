'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  MessageSquare, 
  FileSearch, 
  Camera, 
  FileText, 
  Mail, 
  DollarSign,
  BookOpen,
  Shield
} from 'lucide-react'
import { VideoModal } from '@/components/video-modal'

export default function LandingPage() {
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const getFeatureDetails = (index: number): string[] => {
    const details = [
      // AI Legal Advisor Chat
      ["24/7 availability for legal questions", "Trained on California tenant law", "Instant responses with citations", "Voice input support on mobile"],
      // Smart Documentation
      ["AI-powered damage detection", "Automatic timestamping", "Cloud storage with encryption", "Annotation and labeling tools"],
      // Document Review
      ["Identify illegal clauses instantly", "Check for missing disclosures", "Compare against CA requirements", "Export detailed reports"],
      // Dispute Wizard
      ["Step-by-step guidance", "Evidence organization", "Timeline builder", "Legal form generation"],
      // Letter Generator
      ["Pre-approved legal templates", "Automatic formatting", "Delivery tracking", "Response monitoring"],
      // Security Deposit Tracker
      ["Interest calculations", "Deduction documentation", "Legal deadline reminders", "Export for small claims"],
      // Communication Hub
      ["Legally admissible records", "Read receipts", "Template responses", "Export conversation history"],
      // Knowledge Base
      ["Updated CA laws", "Required forms library", "Video tutorials", "FAQ section"],
    ]
    return details[index] || []
  }

  const features = [
    {
      icon: MessageSquare,
      title: "AI Legal Advisor Chat",
      description: "Get instant answers about California tenant laws from our AI trained on state regulations.",
    },
    {
      icon: Camera,
      title: "Smart Documentation",
      description: "Document property conditions with AI-powered damage detection and timestamped evidence.",
    },
    {
      icon: FileSearch,
      title: "Document Review",
      description: "Upload your lease to identify illegal clauses and missing disclosures automatically.",
    },
    {
      icon: Shield,
      title: "Dispute Wizard",
      description: "Build strong cases with guided evidence collection and timeline creation.",
    },
    {
      icon: FileText,
      title: "Letter Generator",
      description: "Generate legally compliant notices and letters with proper formatting and delivery tracking.",
    },
    {
      icon: DollarSign,
      title: "Security Deposit Tracker",
      description: "Track deposits, calculate interest, and document deductions with legal compliance.",
    },
    {
      icon: Mail,
      title: "Communication Hub",
      description: "Maintain legally admissible message trails with your landlord or tenants.",
    },
    {
      icon: BookOpen,
      title: "Knowledge Base",
      description: "Access comprehensive California tenant law information and required forms.",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">AI Tenant Rights Advisor</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#how-it-works" className="text-sm hover:text-primary" onClick={(e) => handleSmoothScroll(e, 'how-it-works')}>
              How It Works
            </Link>
            <Link href="#features" className="text-sm hover:text-primary" onClick={(e) => handleSmoothScroll(e, 'features')}>
              Features
            </Link>
            <Link href="/pricing" className="text-sm hover:text-primary">
              Pricing
            </Link>
            <Link href="/signin">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Know Your Rights. Protect Your Home.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AI-powered legal guidance for California tenants and landlords. Get instant answers, 
            document everything, and resolve disputes without expensive lawyers.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">Start Free</Button>
            </Link>
            <VideoModal />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Navigate California Rental Laws
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                const element = document.getElementById(`feature-detail-${index}`)
                if (element) element.scrollIntoView({ behavior: 'smooth' })
              }}>
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary mb-4" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Ask Questions</h3>
              <p className="text-muted-foreground">
                Chat with our AI about your rights, upload documents for review, or start documenting issues.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Get Guidance</h3>
              <p className="text-muted-foreground">
                Receive instant legal insights, identify issues in your lease, and build strong documentation.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">Take Action</h3>
              <p className="text-muted-foreground">
                Generate legal letters, track communications, and resolve disputes with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Feature Sections */}
      <section className="py-20 px-4">
        <div className="container mx-auto space-y-20">
          {features.map((feature, index) => (
            <div key={index} id={`feature-detail-${index}`} className="grid md:grid-cols-2 gap-12 items-center">
              <div className={index % 2 === 0 ? 'order-1' : 'order-2'}>
                <feature.icon className="h-12 w-12 text-primary mb-6" />
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-lg text-muted-foreground mb-6">{feature.description}</p>
                <div className="space-y-3">
                  {getFeatureDetails(index).map((detail, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                      <p className="text-muted-foreground">{detail}</p>
                    </div>
                  ))}
                </div>
                <Link href="/signup">
                  <Button className="mt-6">Get Started</Button>
                </Link>
              </div>
              <div className={`${index % 2 === 0 ? 'order-2' : 'order-1'} bg-muted rounded-lg p-8`}>
                <div className="aspect-video bg-background/50 rounded flex items-center justify-center">
                  <feature.icon className="h-24 w-24 text-muted-foreground/30" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Protect Your Rights?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of California residents who are taking control of their rental situations.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-semibold">AI Tenant Rights Advisor</span>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-primary">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-primary">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-primary">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 AI Tenant Rights Advisor. Not a substitute for legal counsel.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}