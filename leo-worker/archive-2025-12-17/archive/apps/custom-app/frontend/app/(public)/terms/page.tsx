import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: January 10, 2024</p>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By using LoveyTasks, you agree to be bound by these Terms of Service. If you don't 
            agree to these terms, please don't use our service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            LoveyTasks is a family task management application that uses AI to transform task 
            messages into loving communications. We provide tools for families to coordinate 
            tasks while strengthening emotional bonds.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            You must create an account to use LoveyTasks. You are responsible for maintaining 
            the confidentiality of your account credentials and for all activities that occur 
            under your account.
          </p>

          <h2>4. Acceptable Use</h2>
          <p>You agree to use LoveyTasks only for:</p>
          <ul>
            <li>Managing family tasks and communications</li>
            <li>Lawful purposes in compliance with all applicable laws</li>
            <li>Positive, family-friendly interactions</li>
          </ul>

          <h2>5. Content Guidelines</h2>
          <p>
            All content must be appropriate for family viewing. We reserve the right to remove 
            content that violates our community standards or is harmful, offensive, or inappropriate.
          </p>

          <h2>6. Privacy and Data</h2>
          <p>
            Your use of LoveyTasks is subject to our Privacy Policy. We respect your family's 
            privacy and protect your data with industry-standard security measures.
          </p>

          <h2>7. Intellectual Property</h2>
          <p>
            LoveyTasks and its original content, features, and functionality are owned by 
            LoveyTasks, Inc. and are protected by international copyright, trademark, and 
            other intellectual property laws.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            LoveyTasks is provided "as is" without warranties of any kind. We are not liable 
            for any indirect, incidental, special, or consequential damages arising from your 
            use of the service.
          </p>

          <h2>9. Changes to Terms</h2>
          <p>
            We may revise these terms from time to time. We will notify you of any changes by 
            posting the new terms on this page and updating the "Last updated" date.
          </p>

          <h2>10. Contact Information</h2>
          <p>
            If you have questions about these Terms of Service, please contact us at{" "}
            <a href="mailto:legal@loveytasks.com" className="text-primary hover:underline">
              legal@loveytasks.com
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