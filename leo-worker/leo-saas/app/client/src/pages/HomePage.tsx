import { Link } from 'wouter';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, CheckCircle, Download } from 'lucide-react';

export default function HomePage() {
  return (
    <AppLayout>
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto text-center space-y-12 py-24">
        <div className="space-y-8 animate-slide-in">
          <h1 className="text-7xl md:text-8xl font-bold tracking-tight bg-leo-gradient-text bg-clip-text text-transparent leading-tight">
            Turn Ideas into Apps in Minutes
          </h1>
          <p className="text-2xl md:text-3xl text-leo-text-secondary max-w-4xl mx-auto leading-relaxed">
            Leo uses AI to instantly generate production-ready SaaS applications from your ideas. No coding required.
          </p>
        </div>

        {/* CTA Button with Leo styling */}
        <div className="pt-4">
          <Link href="/register">
            <Button size="lg" className="text-xl px-12 py-8 bg-leo-primary hover:bg-leo-primary-dark text-white font-semibold rounded-xl shadow-glow-md hover:shadow-glow-lg transition-all duration-300 transform hover:scale-105">
              Get Started Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto py-20 px-4">
        <h2 className="text-4xl font-bold text-center mb-16 text-leo-text">
          Everything You Need to Launch Fast
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1: AI-Powered Generation */}
          <Card className="bg-leo-bg-secondary border border-leo-border hover:border-leo-primary hover:shadow-glow-sm transition-all duration-300 transform hover:scale-105">
            <CardHeader>
              <div className="w-14 h-14 rounded-xl bg-leo-primary/10 flex items-center justify-center mb-6 shadow-glow-sm">
                <Rocket className="h-7 w-7 text-leo-primary" />
              </div>
              <CardTitle className="text-xl text-leo-text mb-3">AI-Powered Generation</CardTitle>
              <CardDescription className="text-leo-text-secondary leading-relaxed">
                Describe your app idea and our AI generates a complete, working application with database, authentication, and modern UI.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 2: Production Ready */}
          <Card className="bg-leo-bg-secondary border border-leo-border hover:border-leo-primary hover:shadow-glow-sm transition-all duration-300 transform hover:scale-105">
            <CardHeader>
              <div className="w-14 h-14 rounded-xl bg-leo-primary/10 flex items-center justify-center mb-6 shadow-glow-sm">
                <CheckCircle className="h-7 w-7 text-leo-primary" />
              </div>
              <CardTitle className="text-xl text-leo-text mb-3">Production Ready</CardTitle>
              <CardDescription className="text-leo-text-secondary leading-relaxed">
                Every generated app includes TypeScript, React, authentication, database setup, and deployment configuration out of the box.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 3: Instant Download */}
          <Card className="bg-leo-bg-secondary border border-leo-border hover:border-leo-primary hover:shadow-glow-sm transition-all duration-300 transform hover:scale-105">
            <CardHeader>
              <div className="w-14 h-14 rounded-xl bg-leo-primary/10 flex items-center justify-center mb-6 shadow-glow-sm">
                <Download className="h-7 w-7 text-leo-primary" />
              </div>
              <CardTitle className="text-xl text-leo-text mb-3">Instant Download</CardTitle>
              <CardDescription className="text-leo-text-secondary leading-relaxed">
                Get your complete application as a downloadable package. Deploy anywhere or continue building on top of it.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="max-w-4xl mx-auto text-center py-24 space-y-8 px-4">
        <h2 className="text-5xl font-bold text-leo-text">Ready to Build Your Next App?</h2>
        <p className="text-2xl text-leo-text-secondary leading-relaxed">
          Join developers who are shipping faster with AI-powered app generation.
        </p>
        <Link href="/register">
          <Button size="lg" className="text-lg px-12 py-8 bg-leo-primary hover:bg-leo-primary-dark text-white font-semibold rounded-lg shadow-glow-md hover:shadow-glow-lg transition-all duration-300 transform hover:scale-105">
            Start Building for Free
          </Button>
        </Link>
      </div>
    </AppLayout>
  );
}
