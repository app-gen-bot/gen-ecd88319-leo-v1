import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Heart, Sparkles, Users, CheckCircle, Gift, Trophy, MessageCircle } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-primary" fill="currentColor" />
            <span className="text-xl font-bold">LoveyTasks</span>
          </Link>
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Start Free</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center min-h-screen text-center pt-16 pb-32">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="relative">
            <Sparkles className="absolute -top-6 -left-6 h-8 w-8 text-primary animate-sparkle" />
            <Sparkles className="absolute -bottom-6 -right-6 h-6 w-6 text-purple-500 animate-sparkle animation-delay-300" />
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Transform Chores into
              <span className="block mt-2 lovely-gradient-text">Expressions of Love</span>
            </h1>
          </div>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            LoveyTasks uses AI to transform everyday household tasks into meaningful messages
            that strengthen family bonds and make everyone feel appreciated.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="lovely-gradient">
              <Link href="/signup">
                Start Your Lovely Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">See How It Works</Link>
            </Button>
          </div>

          {/* Demo Animation */}
          <div className="mt-12 p-6 rounded-lg border bg-card">
            <div className="space-y-4">
              <div className="text-left">
                <p className="text-sm text-muted-foreground mb-2">You type:</p>
                <p className="text-lg font-medium">&ldquo;Take out the trash&rdquo;</p>
              </div>
              <div className="flex justify-center">
                <ArrowRight className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <div className="text-left">
                <p className="text-sm text-muted-foreground mb-2">Your family sees:</p>
                <p className="text-lg font-medium lovely-gradient-text">
                  &ldquo;Hey superstar! 🌟 Could you work your magic and help our home stay fresh by taking out the trash? You&apos;re the best!&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-24 space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Features That Spread Love</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Every feature is designed to make task management feel like sharing love
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <Sparkles className="h-10 w-10 text-primary mb-4" />
              <CardTitle>AI Transformation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Turn mundane requests into messages that inspire and appreciate
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Family Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Personalized messages based on each family member&apos;s personality
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <Trophy className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Love Score</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track your family&apos;s journey of appreciation and kindness
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <Gift className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Celebrations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Every completed task becomes a celebration of contribution
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-24">
        <div className="mx-auto max-w-4xl space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">How LoveyTasks Works</h2>
            <p className="text-xl text-muted-foreground">
              Three simple steps to transform your family&apos;s task management
            </p>
          </div>

          <div className="space-y-12">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-semibold">Create Your Family</h3>
                <p className="text-muted-foreground">
                  Sign up and invite your family members. Each person creates their own profile
                  with their preferred communication style.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-semibold">Assign Tasks with Love</h3>
                <p className="text-muted-foreground">
                  Type a simple task description. Our AI instantly transforms it into a message
                  that matches the recipient&apos;s personality and makes them feel valued.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-semibold">Celebrate Together</h3>
                <p className="text-muted-foreground">
                  As tasks are completed, celebrate achievements, earn badges, and watch your
                  family&apos;s Love Score grow. Every contribution is recognized and appreciated.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-24">
        <div className="mx-auto max-w-4xl space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Families Love LoveyTasks</h2>
            <p className="text-xl text-muted-foreground">
              See how families are transforming their daily routines
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">The Johnson Family</p>
                    <p className="text-sm text-muted-foreground">Parents + 2 Kids</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground italic">
                  &ldquo;Our kids actually look forward to doing chores now! The positive messages
                  make them feel like superheroes instead of being nagged.&rdquo;
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Sarah & Mike</p>
                    <p className="text-sm text-muted-foreground">Young Couple</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground italic">
                  &ldquo;LoveyTasks turned our task discussions from potential arguments into moments
                  of appreciation. It&apos;s been a game-changer for our relationship!&rdquo;
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">The Chen Family</p>
                    <p className="text-sm text-muted-foreground">3 Generations</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground italic">
                  &ldquo;Having personalized message styles means grandma gets respectful requests
                  while the teens get fun, relatable messages. Everyone feels understood!&rdquo;
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <div className="mx-auto max-w-2xl text-center space-y-8 p-8 rounded-2xl bg-primary/5 border">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Transform Your Family&apos;s Daily Life?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of families who are turning chores into expressions of love.
            Start your free trial today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="lovely-gradient">
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            No credit card required • Free for up to 10 family members
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-primary" fill="currentColor" />
                <span className="font-semibold">LoveyTasks</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Transforming chores into love, one task at a time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground">Features</Link></li>
                <li><Link href="#" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="#" className="hover:text-foreground">Updates</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">About</Link></li>
                <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} LoveyTasks. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}