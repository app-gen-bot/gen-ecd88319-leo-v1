import { Link } from 'wouter';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import {
  Compass,
  Layers,
  Rocket,
  ArrowRight,
  Check,
  Sparkles,
  Pencil,
  Play,
  Zap,
} from 'lucide-react';

export default function HomePage() {
  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="leo-hero relative">
        {/* Decorative geometric elements */}
        <div className="absolute top-20 left-10 w-32 h-32 border border-leo-sketch/30 rounded-full opacity-40 animate-float" />
        <div
          className="absolute bottom-32 right-20 w-48 h-48 border border-leo-sketch/20 rounded-full opacity-30 animate-float"
          style={{ animationDelay: '2s' }}
        />
        <div className="absolute top-1/3 right-1/4 w-24 h-24 border border-leo-gold/20 opacity-40" style={{ transform: 'rotate(45deg)' }} />

        {/* Golden ratio spiral decoration */}
        <svg
          className="absolute left-0 top-1/4 w-[500px] h-[500px] opacity-[0.04] pointer-events-none"
          viewBox="0 0 200 200"
        >
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-leo-sienna"
            d="M100,100 a50,50 0 0,1 50,50 a31,31 0 0,1 -31,31 a19,19 0 0,1 -19,-19 a12,12 0 0,1 12,-12 a7,7 0 0,1 7,7 a5,5 0 0,1 -5,5"
          />
        </svg>

        <div className="leo-hero-content">
          {/* Badge */}
          <div className="leo-badge mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4 text-leo-gold" />
            <span>Now in Private Beta</span>
          </div>

          {/* Main headline - Bold serif typography */}
          <h1 className="mb-8 animate-slide-in">
            <span className="block text-foreground">The Art &amp; Science of</span>
            <span className="leo-gradient-text">Building Apps</span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            Describe your vision. Watch Leo engineer a production-ready application
            with the precision of a master craftsman.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            <Link href="/request-access">
              <Button className="leo-btn-primary text-lg px-8 py-6 rounded-xl group">
                Request Beta Access
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button className="leo-btn-secondary text-lg px-8 py-6 rounded-xl group">
                <Play className="mr-2 h-5 w-5" />
                View Demo
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div
            className="mt-16 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm text-muted-foreground animate-fade-in-up"
            style={{ animationDelay: '0.6s' }}
          >
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-leo-verdigris" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-leo-verdigris" />
              <span>Deploy in seconds</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-leo-verdigris" />
              <span>Full source code ownership</span>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="leo-divider max-w-4xl mx-auto" />

      {/* Features Section */}
      <section className="leo-section-alt relative">
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Section header */}
          <div className="text-center mb-16">
            <h2 className="text-foreground mb-4">
              Engineered for Excellence
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every masterpiece requires the right tools. Leo provides everything
              you need, from concept to deployment.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 stagger-children">
            {/* Feature 1: AI-Powered */}
            <div className="leo-feature-card group">
              <div
                className="leo-feature-icon"
                style={{
                  background: 'linear-gradient(135deg, hsl(25 85% 45% / 0.15), hsl(35 80% 50% / 0.1))',
                }}
              >
                <Compass className="h-7 w-7 text-leo-sienna" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                AI-Guided Design
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Describe your app in plain language. Our AI understands context,
                requirements, and best practices to engineer production-quality code.
              </p>
            </div>

            {/* Feature 2: Full Stack */}
            <div className="leo-feature-card group">
              <div
                className="leo-feature-icon"
                style={{
                  background: 'linear-gradient(135deg, hsl(220 60% 35% / 0.15), hsl(220 50% 45% / 0.1))',
                }}
              >
                <Layers className="h-7 w-7 text-leo-ultramarine" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Complete Architecture
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Every app includes React frontend, Express backend, PostgreSQL database,
                authentication, and TypeScript throughout.
              </p>
            </div>

            {/* Feature 3: One-Click Deploy */}
            <div className="leo-feature-card group">
              <div
                className="leo-feature-icon"
                style={{
                  background: 'linear-gradient(135deg, hsl(150 40% 35% / 0.15), hsl(150 35% 45% / 0.1))',
                }}
              >
                <Rocket className="h-7 w-7 text-leo-verdigris" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Instant Deployment
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Deploy to Fly.io with a single click. Get a live URL in seconds with
                automatic SSL, scaling, and global edge network.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="leo-section">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-foreground mb-4">
              The Creative Process
            </h2>
            <p className="text-xl text-muted-foreground">
              Three deliberate steps from vision to reality.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="relative">
              <div className="leo-step">
                <div className="leo-step-number leo-step-number-1">1</div>
                <div className="flex-1 h-[2px] bg-gradient-to-r from-leo-sienna/30 to-transparent hidden md:block" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Describe Your Vision
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Tell Leo what you want to build. "A task manager for creative teams"
                or "An invoice system for freelancers."
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="leo-step">
                <div className="leo-step-number leo-step-number-2">2</div>
                <div className="flex-1 h-[2px] bg-gradient-to-r from-leo-ultramarine/30 to-transparent hidden md:block" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Watch It Materialize
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Leo plans the architecture, generates code, sets up the database,
                and creates a polished UI — all in real-time.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="leo-step">
                <div className="leo-step-number leo-step-number-3">3</div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Deploy &amp; Iterate
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Deploy with one click, get your live URL, and continue refining.
                Request changes anytime — Leo remembers your entire project.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="leo-divider max-w-4xl mx-auto" />

      {/* CTA Section */}
      <section className="leo-section relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />

        {/* Corner decorations */}
        <div className="absolute top-8 left-8 w-20 h-20 border-l-2 border-t-2 border-leo-sketch/20 opacity-50" />
        <div className="absolute bottom-8 right-8 w-20 h-20 border-r-2 border-b-2 border-leo-sketch/20 opacity-50" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="leo-badge mb-8">
            <Zap className="h-4 w-4 text-leo-gold" />
            <span>Limited time: Free tier available</span>
          </div>

          <h2 className="mb-6">
            <span className="leo-gold-text">Ready to Create?</span>
          </h2>

          <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
            Join developers who are building faster with AI.
            Your next masterpiece is just one conversation away.
          </p>

          <Link href="/request-access">
            <Button className="leo-btn-primary text-xl px-12 py-7 rounded-xl group shadow-sienna">
              <Pencil className="mr-3 h-5 w-5" />
              Start Building
              <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </AppLayout>
  );
}
