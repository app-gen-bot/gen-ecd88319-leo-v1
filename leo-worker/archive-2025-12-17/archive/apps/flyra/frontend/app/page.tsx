'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, CheckCircle, Globe, Shield, Zap, Menu, X } from 'lucide-react';
import { formatCurrency, getExchangeRate, getCurrencySymbol } from '@/lib/utils';
import { CountrySelectorModal } from '@/components/country-selector-modal';
import { ContactModal } from '@/components/contact-modal';

export default function LandingPage() {
  const [amount, setAmount] = useState('100');
  const [country, setCountry] = useState('KE');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const countries = [
    { code: 'KE', name: 'Kenya', currency: 'KES' },
    { code: 'NG', name: 'Nigeria', currency: 'NGN' },
    { code: 'IN', name: 'India', currency: 'INR' },
  ];

  const selectedCountry = countries.find(c => c.code === country) || countries[0];
  const exchangeRate = getExchangeRate('USD', selectedCountry.currency);
  const localAmount = parseFloat(amount || '0') * exchangeRate;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Globe className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Flyra</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link href="/fees" className="text-sm font-medium hover:text-primary transition-colors">
              Fees
            </Link>
            <Link href="/support" className="text-sm font-medium hover:text-primary transition-colors">
              Support
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t">
            <nav className="container py-4 space-y-4">
              <Link href="/how-it-works" className="block text-sm font-medium hover:text-primary">
                How It Works
              </Link>
              <Link href="/fees" className="block text-sm font-medium hover:text-primary">
                Fees
              </Link>
              <Link href="/support" className="block text-sm font-medium hover:text-primary">
                Support
              </Link>
              <Link href="/login" className="block">
                <Button variant="outline" size="sm" className="w-full">Sign In</Button>
              </Link>
              <Link href="/register" className="block">
                <Button size="sm" className="w-full">Get Started</Button>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="container pt-32 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Send money home{' '}
              <span className="text-primary">instantly</span> with stablecoins
            </h1>
            <p className="text-xl text-muted-foreground">
              Transfer USDC to mobile money accounts worldwide. Fast, secure, and 
              at a fraction of traditional costs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Send Money Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Calculator Card */}
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Calculate Your Transfer</CardTitle>
              <CardDescription>See how much your recipient gets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amount">You Send (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  max="2999"
                />
              </div>
              <div>
                <Label htmlFor="country">Destination Country</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger id="country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Transfer fee</span>
                  <span className="text-sm font-medium">$2.99</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Exchange rate</span>
                  <span className="text-sm font-medium">
                    1 USD = {exchangeRate} {selectedCountry.currency}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">Recipient gets</span>
                  <span className="text-lg font-bold text-primary">
                    {getCurrencySymbol(selectedCountry.currency)}
                    {localAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose Flyra?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We&apos;re revolutionizing international money transfers with blockchain technology
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Zap className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Lightning Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Send money that arrives in seconds, not days. Your family gets 
                funds when they need them most.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Secure & Compliant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Licensed money transmitter with bank-level security. Your funds 
                are always safe with us.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Transparent Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Just $2.99 per transfer. No hidden fees, no exchange rate markups. 
                What you see is what you pay.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Send money in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-foreground">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Fund Your Wallet</h3>
            <p className="text-muted-foreground">
              Add USDC to your Flyra wallet using bank transfer or debit card
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-foreground">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Choose Recipient</h3>
            <p className="text-muted-foreground">
              Enter your recipient's mobile money number and amount to send
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-foreground">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Send Instantly</h3>
            <p className="text-muted-foreground">
              Confirm and send. Your recipient gets local currency in seconds
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/register">
            <Button size="lg">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-primary">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/fees" className="text-sm text-muted-foreground hover:text-primary">
                    Fees
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-sm text-muted-foreground hover:text-primary">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/support#faq" className="text-sm text-muted-foreground hover:text-primary">
                    FAQ
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={() => setShowContactModal(true)}
                    className="text-sm text-muted-foreground hover:text-primary text-left"
                  >
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <p className="text-sm text-muted-foreground">
                Licensed money transmitter. NMLS #123456
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Flyra Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CountrySelectorModal
        open={showCountryModal}
        onOpenChange={setShowCountryModal}
        selectedCountry={country}
        onCountrySelect={(selected) => setCountry(selected.code)}
      />
      
      <ContactModal
        open={showContactModal}
        onOpenChange={setShowContactModal}
      />
    </div>
  );
}