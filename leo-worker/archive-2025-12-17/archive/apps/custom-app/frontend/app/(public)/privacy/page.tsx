import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

export default function PrivacyPage() {
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
            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground">About</Link>
            <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground">Contact</Link>
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

      {/* Content */}
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: January 10, 2024</p>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h2>Introduction</h2>
          <p>
            At LoveyTasks, we take your privacy seriously. This Privacy Policy explains how we collect, 
            use, and protect your family's information when you use our service.
          </p>

          <h2>Information We Collect</h2>
          <p>We collect information you provide directly to us, such as:</p>
          <ul>
            <li>Account information (name, email, password)</li>
            <li>Family member information</li>
            <li>Task content and messages</li>
            <li>Usage data and preferences</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and maintain our service</li>
            <li>Transform your messages with AI</li>
            <li>Send notifications about tasks</li>
            <li>Improve our service</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your family's data. 
            All data is encrypted in transit and at rest. We never share your family's 
            information with third parties without your consent.
          </p>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and data</li>
            <li>Export your data</li>
            <li>Opt-out of communications</li>
          </ul>

          <h2>Children's Privacy</h2>
          <p>
            LoveyTasks is designed for families and complies with COPPA. We do not knowingly 
            collect personal information from children under 13 without parental consent.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:privacy@loveytasks.com" className="text-primary hover:underline">
              privacy@loveytasks.com
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 LoveyTasks. All rights reserved. Made with ❤️ for families everywhere.
        </div>
      </footer>
    </div>
  )
}