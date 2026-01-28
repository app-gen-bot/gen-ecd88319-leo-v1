'use client';

import { DashboardNav } from '@/components/dashboard-nav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { 
  UserPlus, 
  Wallet, 
  Send, 
  CheckCircle, 
  Shield,
  Globe,
  Zap,
  DollarSign,
  Smartphone,
  ArrowRight,
  Play
} from 'lucide-react';
import { useState } from 'react';

export default function HowItWorksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      icon: UserPlus,
      title: 'Create Your Account',
      description: 'Sign up in minutes with just your email and phone number. Complete KYC verification to unlock all features.',
      details: [
        'Quick registration process',
        'Secure identity verification',
        'One-time setup',
      ],
    },
    {
      icon: Wallet,
      title: 'Fund Your Wallet',
      description: 'Add money to your Flyra wallet using ACH bank transfer. Your funds are converted to USDC stablecoin.',
      details: [
        'Free ACH deposits',
        '3-5 business days processing',
        'Secure and regulated',
      ],
    },
    {
      icon: Send,
      title: 'Send Money Instantly',
      description: 'Choose your recipient, enter the amount, and send. Money arrives in seconds to their mobile wallet.',
      details: [
        'Real-time delivery',
        'Transparent exchange rates',
        'Track every transfer',
      ],
    },
    {
      icon: CheckCircle,
      title: 'Recipient Gets Paid',
      description: 'Your recipient receives money directly in their mobile money account or bank, ready to use immediately.',
      details: [
        'No recipient fees',
        'Local currency delivered',
        'SMS notifications',
      ],
    },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Most transfers complete in under 30 seconds',
    },
    {
      icon: DollarSign,
      title: 'Low Fixed Fee',
      description: 'Just $2.99 per transfer, any amount',
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Send to Kenya, India, Nigeria, Philippines & more',
    },
    {
      icon: Shield,
      title: 'Secure & Regulated',
      description: 'Licensed money transmitter with bank-level security',
    },
  ];

  const recipientProcess = [
    {
      country: 'Kenya',
      provider: 'M-PESA',
      process: 'Money arrives directly in M-PESA wallet. Recipient gets SMS confirmation.',
    },
    {
      country: 'India',
      provider: 'UPI/Bank',
      process: 'Instant credit to UPI ID or bank account. Works with all major banks.',
    },
    {
      country: 'Nigeria',
      provider: 'Bank Transfer',
      process: 'Direct deposit to any Nigerian bank account within minutes.',
    },
    {
      country: 'Philippines',
      provider: 'GCash',
      process: 'Instant delivery to GCash wallet. Can cash out at any GCash partner.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {user && <DashboardNav />}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">How Flyra Works</h1>
          <p className="text-muted-foreground">Send money home in 4 simple steps</p>
        </div>

        {/* Video Demo Section */}
        <Card className="mb-8">
          <CardContent className="p-0">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2"
                onClick={() => alert('Demo video coming soon!')}
              >
                <Play className="h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Step by Step Process */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Simple 4-Step Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === index;
              
              return (
                <Card 
                  key={index}
                  className={`cursor-pointer transition-all ${
                    isActive ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4">
                      <div className={`p-3 rounded-full ${
                        isActive ? 'bg-primary' : 'bg-muted'
                      }`}>
                        <Icon className={`h-8 w-8 ${
                          isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                        }`} />
                      </div>
                    </div>
                    <CardTitle className="text-lg">
                      Step {index + 1}: {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      {step.description}
                    </p>
                    {isActive && (
                      <ul className="space-y-2">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Key Features */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">Why Choose Flyra?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="text-center">
                    <Icon className="h-12 w-12 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recipient Experience */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How Recipients Receive Money</CardTitle>
            <CardDescription>
              Money is delivered instantly to local payment methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recipientProcess.map((item, index) => (
                <div key={index} className="flex space-x-4">
                  <div>
                    <Smartphone className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{item.country}</h3>
                      <Badge variant="secondary">{item.provider}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.process}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Security is Our Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Shield className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Bank-Level Encryption</h3>
                <p className="text-sm text-muted-foreground">
                  All data is encrypted using industry-standard protocols
                </p>
              </div>
              <div>
                <Shield className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Regulated & Licensed</h3>
                <p className="text-sm text-muted-foreground">
                  Licensed as a money transmitter in all operating states
                </p>
              </div>
              <div>
                <Shield className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">USDC Stablecoin</h3>
                <p className="text-sm text-muted-foreground">
                  Your funds are backed 1:1 with US dollars
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Send Money Home?</h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of users who trust Flyra for their remittances
            </p>
            <div className="flex justify-center gap-4">
              {user ? (
                <Button size="lg" onClick={() => router.push('/send')}>
                  Send Money Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Button size="lg" onClick={() => router.push('/register')}>
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => router.push('/login')}>
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}