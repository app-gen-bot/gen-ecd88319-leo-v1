import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">P</span>
                </div>
                <span className="text-xl font-bold">PawsFlow</span>
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/features" className="text-sm font-medium hover:text-primary">
                  Features
                </Link>
                <Link href="/pricing" className="text-sm font-medium hover:text-primary">
                  Pricing
                </Link>
                <Link href="/contact" className="text-sm font-medium hover:text-primary">
                  Contact
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            Trusted by 1,000+ veterinary clinics
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Modern Veterinary Practice Management
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Streamline your clinic operations with our all-in-one platform. From appointments to medical records, we've got you covered.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8">
                Start Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to run your practice
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Appointment Scheduling</CardTitle>
                <CardDescription>
                  Drag-and-drop scheduling with multi-provider support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Online booking for clients</li>
                  <li>• Automated reminders</li>
                  <li>• Room management</li>
                  <li>• Recurring appointments</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Electronic Health Records</CardTitle>
                <CardDescription>
                  Complete medical history at your fingertips
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• SOAP notes</li>
                  <li>• Vaccination tracking</li>
                  <li>• Lab results integration</li>
                  <li>• Document storage</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Billing &amp; Invoicing</CardTitle>
                <CardDescription>
                  Streamlined financial management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Automatic invoice generation</li>
                  <li>• Multiple payment methods</li>
                  <li>• Insurance processing</li>
                  <li>• Financial reporting</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Client Portal</CardTitle>
                <CardDescription>
                  Empower pet owners with self-service
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Online appointment booking</li>
                  <li>• Medical record access</li>
                  <li>• Prescription refills</li>
                  <li>• Secure messaging</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Inventory Management</CardTitle>
                <CardDescription>
                  Never run out of supplies again
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Real-time stock tracking</li>
                  <li>• Low stock alerts</li>
                  <li>• Expiration tracking</li>
                  <li>• Automated reordering</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Team Communication</CardTitle>
                <CardDescription>
                  Keep your team connected and informed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Internal messaging</li>
                  <li>• Task management</li>
                  <li>• Shift scheduling</li>
                  <li>• Announcements</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to modernize your practice?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of veterinarians who trust PawsFlow
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
            <div className="mb-4 md:mb-0">
              © 2024 PawsFlow. All rights reserved.
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/privacy" className="hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground">
                Terms of Service
              </Link>
              <span className="text-xs">Powered by PlanetScale</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}