"use client"

import { HowItWorksSection } from "@/components/sections/how-it-works-section"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen pt-20">
      <div className="container py-12">
        <div
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 sm:text-5xl md:text-6xl">
            How Happy Llama Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our AI-powered platform transforms your ideas into production-ready applications 
            through a revolutionary automated development process.
          </p>
        </div>
      </div>
      
      <HowItWorksSection />
      
      <div className="container py-16">
        <div
          className="text-center bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-12"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Experience AI-Speed Development?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our beta program and start building enterprise-grade applications in hours instead of months.
          </p>
          <Link href="/beta-signup">
            <Button size="lg" variant="gradient">
              Join the Beta Waitlist
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}