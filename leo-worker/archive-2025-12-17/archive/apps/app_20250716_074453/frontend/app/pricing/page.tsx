'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const plans = {
  monthly: [
    {
      name: 'Starter',
      price: 149,
      description: 'Perfect for small practices just getting started',
      features: [
        { name: 'Up to 2 providers', included: true },
        { name: 'Basic appointment scheduling', included: true },
        { name: 'Client portal', included: true },
        { name: 'Email reminders', included: true },
        { name: 'Basic reporting', included: true },
        { name: 'Email support', included: true },
        { name: 'SMS reminders', included: false },
        { name: 'Inventory management', included: false },
        { name: 'Custom forms', included: false },
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Professional',
      price: 299,
      description: 'Everything you need to run a modern practice',
      features: [
        { name: 'Up to 5 providers', included: true },
        { name: 'Advanced scheduling', included: true },
        { name: 'Client portal', included: true },
        { name: 'Email & SMS reminders', included: true },
        { name: 'Advanced reporting', included: true },
        { name: 'Priority support', included: true },
        { name: 'Inventory management', included: true },
        { name: 'Custom forms', included: true },
        { name: 'Lab integrations', included: false },
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 499,
      description: 'For large practices with advanced needs',
      features: [
        { name: 'Unlimited providers', included: true },
        { name: 'Multi-location support', included: true },
        { name: 'Client portal', included: true },
        { name: 'Email & SMS reminders', included: true },
        { name: 'Custom reporting', included: true },
        { name: 'Dedicated support', included: true },
        { name: 'Inventory management', included: true },
        { name: 'Custom forms', included: true },
        { name: 'All integrations', included: true },
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ],
  annual: [
    {
      name: 'Starter',
      price: 119,
      originalPrice: 149,
      description: 'Perfect for small practices just getting started',
      features: [
        { name: 'Up to 2 providers', included: true },
        { name: 'Basic appointment scheduling', included: true },
        { name: 'Client portal', included: true },
        { name: 'Email reminders', included: true },
        { name: 'Basic reporting', included: true },
        { name: 'Email support', included: true },
        { name: 'SMS reminders', included: false },
        { name: 'Inventory management', included: false },
        { name: 'Custom forms', included: false },
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Professional',
      price: 239,
      originalPrice: 299,
      description: 'Everything you need to run a modern practice',
      features: [
        { name: 'Up to 5 providers', included: true },
        { name: 'Advanced scheduling', included: true },
        { name: 'Client portal', included: true },
        { name: 'Email & SMS reminders', included: true },
        { name: 'Advanced reporting', included: true },
        { name: 'Priority support', included: true },
        { name: 'Inventory management', included: true },
        { name: 'Custom forms', included: true },
        { name: 'Lab integrations', included: false },
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 399,
      originalPrice: 499,
      description: 'For large practices with advanced needs',
      features: [
        { name: 'Unlimited providers', included: true },
        { name: 'Multi-location support', included: true },
        { name: 'Client portal', included: true },
        { name: 'Email & SMS reminders', included: true },
        { name: 'Custom reporting', included: true },
        { name: 'Dedicated support', included: true },
        { name: 'Inventory management', included: true },
        { name: 'Custom forms', included: true },
        { name: 'All integrations', included: true },
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ],
};

const faqs = [
  {
    question: 'Can I try PawsFlow before committing?',
    answer: 'Yes! All plans come with a 30-day free trial. No credit card required.',
  },
  {
    question: 'Can I change plans later?',
    answer: 'Absolutely. You can upgrade or downgrade your plan at any time.',
  },
  {
    question: 'Do you offer discounts for non-profits?',
    answer: 'Yes, we offer special pricing for registered non-profit animal welfare organizations.',
  },
  {
    question: 'Is there a setup fee?',
    answer: 'No, there are no setup fees. We also offer free data migration from most practice management systems.',
  },
];

export default function PricingPage() {
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
              <Link href="/features" className="text-sm font-medium text-muted-foreground hover:text-primary">
                Features
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-primary">
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
              <Link href="/signup">
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
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Choose the Right Plan<br />for Your Practice
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start with a 30-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="container mx-auto">
          <Tabs defaultValue="monthly" className="w-full">
            <div className="flex flex-col items-center mb-12">
              <TabsList className="grid w-48 grid-cols-2">
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="annual">Annual</TabsTrigger>
              </TabsList>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  Save 20% with annual billing
                </Badge>
              </div>
            </div>
            
            <TabsContent value="monthly">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {plans.monthly.map((plan) => (
                  <Card 
                    key={plan.name} 
                    className={plan.popular ? 'border-primary shadow-lg scale-105' : ''}
                  >
                    {plan.popular && (
                      <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                        Most Popular
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {plan.features.map((feature) => (
                          <li key={feature.name} className="flex items-start gap-2">
                            {feature.included ? (
                              <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <XMarkIcon className="h-5 w-5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                            )}
                            <span className={feature.included ? '' : 'text-muted-foreground/50'}>
                              {feature.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Link href={plan.cta === 'Contact Sales' ? '/contact' : '/signup'} className="w-full">
                        <Button 
                          className="w-full" 
                          variant={plan.popular ? 'default' : 'outline'}
                        >
                          {plan.cta}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="annual">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {plans.annual.map((plan) => (
                  <Card 
                    key={plan.name} 
                    className={plan.popular ? 'border-primary shadow-lg scale-105' : ''}
                  >
                    {plan.popular && (
                      <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                        Most Popular
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/month</span>
                        {plan.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through ml-2">
                            ${plan.originalPrice}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Billed annually
                      </p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {plan.features.map((feature) => (
                          <li key={feature.name} className="flex items-start gap-2">
                            {feature.included ? (
                              <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <XMarkIcon className="h-5 w-5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                            )}
                            <span className={feature.included ? '' : 'text-muted-foreground/50'}>
                              {feature.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Link href={plan.cta === 'Contact Sales' ? '/contact' : '/signup'} className="w-full">
                        <Button 
                          className="w-full" 
                          variant={plan.popular ? 'default' : 'outline'}
                        >
                          {plan.cta}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-3xl">
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of practices already using PawsFlow
          </p>
          <Link href="/signup">
            <Button size="lg">
              Start Your Free Trial
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • 30-day free trial
          </p>
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