"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UsersIcon } from "@heroicons/react/24/outline"

export function BetaSignupSection() {
  const waitlistCount = 2847 // This would come from an API in production

  return (
    <section className="py-24 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
      <div className="container">
        <div
          className="text-center max-w-3xl mx-auto"
        >
          <Badge variant="outline" className="mb-4">
            <UsersIcon className="h-3 w-3 mr-1" />
            Limited Beta
          </Badge>
          
          <h2 className="text-3xl font-bold mb-4 sm:text-4xl md:text-5xl">
            Be Among the First to Build at AI Speed
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8">
            Join our exclusive beta program and shape the future of application development
          </p>

          <div
            className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-8 bg-background/50 rounded-full px-4 py-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Join <span className="font-semibold text-foreground">{waitlistCount.toLocaleString()}</span> innovators already on the waitlist
          </div>

          <div
          >
            <Link href="/beta-signup">
              <Button size="lg" variant="gradient" className="text-lg px-8">
                Secure Your Spot
              </Button>
            </Link>
          </div>

          <div
            className="mt-12 grid gap-4 sm:grid-cols-3 text-center"
          >
            <div>
              <p className="text-3xl font-bold text-primary">Free</p>
              <p className="text-sm text-muted-foreground">During Beta</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">24/7</p>
              <p className="text-sm text-muted-foreground">Support</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">Unlimited</p>
              <p className="text-sm text-muted-foreground">Projects</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}