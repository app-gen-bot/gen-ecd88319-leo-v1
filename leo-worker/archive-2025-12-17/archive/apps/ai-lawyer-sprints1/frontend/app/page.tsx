import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LandingChatInput } from '@/components/landing-chat-input';
import { 
  MessageSquare, 
  FileText, 
  Shield, 
  BookOpen,
  CheckCircle,
  ArrowRight,
  Scale,
  Home
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: MessageSquare,
      title: 'AI Legal Advisor Chat',
      description: 'Get instant answers to your tenant rights questions from our AI trained on California Civil Code.',
    },
    {
      icon: FileText,
      title: 'Smart Documentation',
      description: 'Upload lease agreements for AI-powered analysis. Identify illegal clauses and missing disclosures.',
    },
    {
      icon: Shield,
      title: 'Security Deposit Tracker',
      description: 'Calculate interest, track deductions, and know your rights for deposit returns.',
    },
    {
      icon: BookOpen,
      title: 'Knowledge Base',
      description: 'Access comprehensive guides, legal forms, and resources for California tenants.',
    },
  ];

  const benefits = [
    'Available 24/7 for immediate assistance',
    'Trained on California Civil Code 1940-1954.1',
    'Plain English explanations with legal citations',
    'Secure and confidential conversations',
    'Export documentation for legal proceedings',
    'Regular updates with latest law changes',
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Scale className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">AI Tenant Rights Advisor</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="#features">
                <Button variant="ghost">Features</Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="ghost">How It Works</Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Know Your Rights. Protect Your Home.
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            AI-powered legal assistance for California tenants. Get instant answers, review your lease,
            track deposits, and document disputes - all in one place.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                Start Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Try with demo account: demo@example.com / DemoRocks2025!
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything You Need to Protect Your Rights
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Comprehensive tools and resources for California tenants
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary mb-4" />
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

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600">
              Get legal assistance in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600">
                Create your free account and tell us if you're a tenant or landlord
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Ask Questions</h3>
              <p className="text-gray-600">
                Chat with our AI about your rights, upload documents, or start tracking disputes
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Take Action</h3>
              <p className="text-gray-600">
                Get clear guidance, generate letters, and export documentation for your records
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Try It Now Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Try It Now</h2>
            <p className="mt-4 text-lg text-gray-600">
              Ask your tenant rights question and get started for free
            </p>
          </div>
          <LandingChatInput />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose AI Tenant Rights Advisor?
              </h2>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-100 rounded-lg p-8">
              <Home className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-semibold mb-4">
                Protect Your Home with Knowledge
              </h3>
              <p className="text-gray-600 mb-6">
                Don't let landlords take advantage of you. Understand your rights,
                document everything properly, and get the legal assistance you deserve.
              </p>
              <Link href="/sign-up">
                <Button className="w-full">Get Started Free</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Scale className="h-6 w-6" />
                <span className="text-xl font-bold">AI Tenant Rights</span>
              </div>
              <p className="text-gray-400">
                Empowering California tenants with AI-powered legal assistance.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
                <li><Link href="#how-it-works" className="hover:text-white">How It Works</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/knowledge" className="hover:text-white">Knowledge Base</Link></li>
                <li><Link href="/guides" className="hover:text-white">Guides</Link></li>
                <li><Link href="/forms" className="hover:text-white">Legal Forms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/disclaimer" className="hover:text-white">Legal Disclaimer</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 AI Tenant Rights Advisor. All rights reserved. Powered by PlanetScale.</p>
            <p className="mt-2 text-sm">
              This service provides legal information, not legal advice. 
              Always consult with a qualified attorney for specific legal matters.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}