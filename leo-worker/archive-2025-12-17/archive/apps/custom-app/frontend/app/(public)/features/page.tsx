import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Sparkles, Users, Trophy, MessageSquare, Shield, Zap, Calendar } from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Message Transformation",
    description: "Turn mundane tasks into loving messages that make family members smile",
    details: [
      "5 unique transformation styles",
      "Personalized based on preferences",
      "Blocked word filtering",
      "Emoji level customization"
    ]
  },
  {
    icon: Users,
    title: "Family-Centered Design",
    description: "Built for families of all sizes and structures",
    details: [
      "Multi-family support",
      "Role-based permissions",
      "Family code invitations",
      "Private family spaces"
    ]
  },
  {
    icon: Trophy,
    title: "Gamification & Rewards",
    description: "Make chores fun with achievements and love points",
    details: [
      "Love Score tracking",
      "Achievement badges",
      "Streak rewards",
      "Family leaderboards"
    ]
  },
  {
    icon: MessageSquare,
    title: "Positive Communication",
    description: "Every interaction spreads love and appreciation",
    details: [
      "Task responses with love",
      "Encouraging notifications",
      "Thank you messages",
      "Celebration animations"
    ]
  },
  {
    icon: Calendar,
    title: "Smart Task Management",
    description: "Organize family tasks with ease and flexibility",
    details: [
      "Category organization",
      "Priority levels",
      "Due date tracking",
      "Quick assignment"
    ]
  },
  {
    icon: Shield,
    title: "Privacy & Security",
    description: "Your family data stays private and secure",
    details: [
      "End-to-end encryption",
      "COPPA compliant",
      "Data export options",
      "Secure authentication"
    ]
  }
]

export default function FeaturesPage() {
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
            <Link href="/features" className="text-sm font-medium">Features</Link>
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">Pricing</Link>
            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground">About</Link>
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
            Features that spread love
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Discover how LoveyTasks transforms family task management into a journey of appreciation
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="h-full">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.details.map((detail) => (
                      <li key={detail} className="flex items-start">
                        <Zap className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to transform your family tasks?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of families who are spreading love while getting things done
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Contact Us
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