'use client';

import { DashboardNav } from '@/components/dashboard-nav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Heart, Globe, Shield, Users, Target, Award } from 'lucide-react';

export default function AboutPage() {
  const { user } = useAuth();
  const router = useRouter();

  const values = [
    {
      icon: Heart,
      title: 'Family First',
      description: 'We understand the importance of supporting loved ones back home. Every transfer is a connection that matters.',
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Breaking down barriers to make international money transfers accessible to everyone, everywhere.',
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Your money and data are protected with bank-level security and regulatory compliance.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Built by immigrants, for immigrants. We understand your needs because we\'ve been there.',
    },
  ];

  const stats = [
    { value: '50K+', label: 'Happy Customers' },
    { value: '$10M+', label: 'Money Transferred' },
    { value: '4', label: 'Countries Supported' },
    { value: '<30s', label: 'Average Transfer Time' },
  ];

  const team = [
    {
      name: 'Sarah Chen',
      role: 'CEO & Co-founder',
      bio: 'Former fintech executive with 15 years experience in payments.',
    },
    {
      name: 'David Okonkwo',
      role: 'CTO & Co-founder',
      bio: 'Blockchain expert and former lead engineer at major crypto exchange.',
    },
    {
      name: 'Maria Rodriguez',
      role: 'Head of Compliance',
      bio: 'Regulatory expert ensuring safe and compliant money transfers.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {user && <DashboardNav />}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">About Flyra</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're on a mission to make sending money home as easy, fast, and affordable as sending a text message.
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="mb-12">
          <CardHeader>
            <Target className="h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-2xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">
              Flyra was born from a simple observation: sending money internationally is too expensive, 
              too slow, and too complicated. We're changing that by leveraging blockchain technology 
              and stablecoins to create a remittance platform that works for real people with real needs.
            </p>
            <p className="text-lg leading-relaxed mt-4">
              Every day, millions of people work hard to support their families back home. They deserve 
              a service that respects their money and their time. That's why we built Flyra - to ensure 
              more of your money reaches the people who matter most.
            </p>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Values Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Icon className="h-8 w-8 text-primary" />
                      <CardTitle>{value.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Story Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Our Story</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="leading-relaxed">
              Flyra started in 2023 when our founders experienced firsthand the frustration of sending 
              money to family abroad. High fees, poor exchange rates, and days of waiting were the norm.
            </p>
            <p className="leading-relaxed">
              We knew there had to be a better way. By combining the stability of USDC with the speed 
              of blockchain technology, we created a platform that delivers money in seconds, not days, 
              with transparent pricing that puts customers first.
            </p>
            <p className="leading-relaxed">
              Today, we're proud to serve thousands of customers who trust us with their hard-earned 
              money. But we're just getting started. Our vision is a world where sending money across 
              borders is as simple and affordable as sending money to your neighbor.
            </p>
          </CardContent>
        </Card>

        {/* Team Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4" />
                  <CardTitle className="text-center">{member.name}</CardTitle>
                  <CardDescription className="text-center">{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Awards & Recognition */}
        <Card className="mb-12">
          <CardHeader>
            <Award className="h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-2xl">Recognition</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>2024 Fintech Innovation Award - Best Remittance Platform</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Featured in TechCrunch: "The Future of International Money Transfer"</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>A+ Rating from Better Business Bureau</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Member of the Digital Dollar Project</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <h2 className="text-2xl font-bold mb-4">Join the Flyra Family</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Experience the future of remittances. Send money home with confidence, 
              knowing you're getting the best rates and fastest service.
            </p>
            <div className="flex justify-center gap-4">
              {user ? (
                <Button size="lg" onClick={() => router.push('/send')}>
                  Send Money Now
                </Button>
              ) : (
                <>
                  <Button size="lg" onClick={() => router.push('/register')}>
                    Get Started
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => router.push('/fees')}>
                    View Pricing
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