import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Lightbulb, Users, Target } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">LoveyTasks</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/features" className="text-sm font-medium text-muted-foreground hover:text-foreground">Features</Link>
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">Pricing</Link>
            <Link href="/about" className="text-sm font-medium">About</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Our Story
          </h1>
          <p className="text-xl text-muted-foreground">
            How a simple idea transformed family dynamics forever
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg dark:prose-invert mx-auto">
            <p className="text-xl leading-relaxed mb-8">
              LoveyTasks was born from a simple observation: families communicate about chores 
              more than almost any other topic, yet these conversations often feel negative or 
              transactional. What if we could transform these everyday interactions into 
              opportunities to express love and appreciation?
            </p>
            
            <p className="mb-8">
              As parents ourselves, we noticed how asking our kids to clean their rooms often 
              led to eye rolls and groans. But when we playfully asked them to "make their 
              magical kingdom sparkle," suddenly the task became an adventure. This sparked 
              an idea: could AI help every family find their own language of love?
            </p>

            <p className="mb-8">
              We started LoveyTasks with a mission to strengthen family bonds through positive 
              communication. By using AI to transform mundane requests into loving messages, 
              we're not just getting chores done – we're building stronger, happier families 
              one task at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <Heart className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Love First</h3>
                <p className="text-sm text-muted-foreground">
                  Every feature we build starts with the question: "Will this spread more love?"
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <Users className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Family-Centered</h3>
                <p className="text-sm text-muted-foreground">
                  We design for real families with all their beautiful complexity and diversity.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <Lightbulb className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Playful Innovation</h3>
                <p className="text-sm text-muted-foreground">
                  We use cutting-edge AI to make family life more fun and connected.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <Target className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Privacy Focused</h3>
                <p className="text-sm text-muted-foreground">
                  Your family's data is sacred. We protect it like we protect our own.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Built by Families, for Families</h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Our team is made up of parents, siblings, and family members who understand 
            the joy (and chaos) of family life. We're passionate about using technology 
            to bring families closer together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg">
                Get in Touch
              </Button>
            </Link>
            <Link href="/help">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">LoveyTasks</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Turning chores into love notes, one task at a time.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features" className="hover:text-foreground">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="/help" className="hover:text-foreground">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Stay updated with our latest features
              </p>
              <Button variant="outline" className="w-full">
                Join Newsletter
              </Button>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2024 LoveyTasks. All rights reserved. Made with ❤️ for families everywhere.
          </div>
        </div>
      </footer>
    </div>
  )
}