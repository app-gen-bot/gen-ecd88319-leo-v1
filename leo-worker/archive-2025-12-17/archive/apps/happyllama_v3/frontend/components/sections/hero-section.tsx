"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowDownIcon } from "@heroicons/react/24/outline"

export function HeroSection() {

  const scrollToNextSection = () => {
    const element = document.getElementById("how-it-works")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 py-32 text-center">
        <div className="mx-auto max-w-4xl fade-in-up">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Your Ideas → Enterprise Apps,{" "}
            <span className="text-gradient">at AI Speed</span>
          </h1>
        </div>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl fade-in-up animation-delay-200">
          Transform concepts into production-ready applications without writing
          code. Happy Llama ensures enterprise-grade quality, complete
          documentation, and full compliance—regardless of your technical
          expertise.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center fade-in-up animation-delay-400">
          <Link href="/beta-signup">
            <Button size="lg" variant="gradient" className="w-full sm:w-auto">
              Join the Beta Waitlist
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => {
              const howItWorks = document.getElementById("how-it-works")
              if (howItWorks) {
                howItWorks.scrollIntoView({ behavior: "smooth" })
              }
            }}
          >
            See How It Works
          </Button>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={scrollToNextSection}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 transition-transform hover:translate-y-1"
          aria-label="Scroll to next section"
        >
          <ArrowDownIcon className="h-6 w-6 animate-bounce text-muted-foreground" />
        </button>
      </div>
    </section>
  )
}