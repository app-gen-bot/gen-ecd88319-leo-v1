'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  BeakerIcon,
  CubeIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    title: 'Appointment Management',
    description: 'Streamline scheduling with smart conflict detection and automated reminders',
    icon: CalendarDaysIcon,
    highlights: [
      'Online booking portal',
      'Automated SMS/email reminders',
      'Drag-and-drop scheduling',
      'Multi-provider calendars',
    ],
  },
  {
    title: 'Electronic Medical Records',
    description: 'Comprehensive EMR system designed specifically for veterinary practices',
    icon: ClipboardDocumentListIcon,
    highlights: [
      'SOAP note templates',
      'Custom forms builder',
      'Document management',
      'Vaccination tracking',
    ],
  },
  {
    title: 'Client Portal',
    description: 'Empower pet owners with 24/7 access to their pet\'s health information',
    icon: UserGroupIcon,
    highlights: [
      'Appointment booking',
      'Medical records access',
      'Prescription refills',
      'Secure messaging',
    ],
  },
  {
    title: 'Billing & Payments',
    description: 'Integrated billing system with modern payment processing',
    icon: CurrencyDollarIcon,
    highlights: [
      'Automated invoicing',
      'Insurance claims',
      'Payment plans',
      'Financial reporting',
    ],
  },
  {
    title: 'Laboratory Integration',
    description: 'Seamlessly manage in-house labs and external reference labs',
    icon: BeakerIcon,
    highlights: [
      'Result tracking',
      'Automated alerts',
      'Equipment monitoring',
      'Lab report generation',
    ],
  },
  {
    title: 'Inventory Management',
    description: 'Never run out of supplies with smart inventory tracking',
    icon: CubeIcon,
    highlights: [
      'Auto-reorder points',
      'Expiration tracking',
      'Usage analytics',
      'Supplier management',
    ],
  },
];

const integrations = [
  { name: 'IDEXX', logo: '🔬', description: 'Reference lab integration' },
  { name: 'Antech', logo: '🧪', description: 'Diagnostics integration' },
  { name: 'QuickBooks', logo: '📊', description: 'Accounting sync' },
  { name: 'Twilio', logo: '📱', description: 'SMS reminders' },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              PawsFlow
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="text-sm font-medium text-primary">
                Features
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary">
                Pricing
              </Link>
              <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-primary">
                Contact
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            Comprehensive Practice Management
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Everything You Need to Run<br />Your Veterinary Practice
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            From appointment scheduling to billing, PawsFlow provides all the tools modern veterinary practices need to deliver exceptional care.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Start Free Trial
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Request Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Built for Modern Veterinary Practices</h2>
            <p className="text-lg text-muted-foreground">
              Discover how PawsFlow can transform your practice operations
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-2">
                        <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4" variant="secondary">
                Mobile Experience
              </Badge>
              <h2 className="text-3xl font-bold mb-4">
                Access Your Practice<br />From Anywhere
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Stay connected to your practice with our mobile-optimized platform. Check schedules, review records, and communicate with your team from any device.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <DevicePhoneMobileIcon className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Responsive Design</h3>
                    <p className="text-sm text-muted-foreground">
                      Works seamlessly on phones, tablets, and desktops
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheckIcon className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Secure Access</h3>
                    <p className="text-sm text-muted-foreground">
                      HIPAA-compliant security with role-based permissions
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-muted rounded-lg p-8 flex items-center justify-center">
              <div className="text-center">
                <DevicePhoneMobileIcon className="h-48 w-48 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground">Mobile App Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Seamless Integrations</h2>
          <p className="text-lg text-muted-foreground mb-12">
            Connect PawsFlow with your favorite tools and services
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {integrations.map((integration) => (
              <Card key={integration.name} className="text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl mb-2">{integration.logo}</div>
                  <h3 className="font-semibold">{integration.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {integration.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of veterinary practices using PawsFlow
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="gap-2">
                Start Free Trial
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="text-primary border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2024 PawsFlow. All rights reserved.</p>
          <p className="mt-2">Powered by PlanetScale</p>
        </div>
      </footer>
    </div>
  );
}