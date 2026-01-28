"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  CheckCircleIcon,
  EnvelopeIcon,
  CalendarIcon,
  UserGroupIcon,
  ArrowRightIcon,
  ShareIcon
} from "@heroicons/react/24/outline"

export default function ThankYouPage() {
  const [confettiActive, setConfettiActive] = useState(true)
  const waitlistNumber = 2848 // This would come from the API

  useEffect(() => {
    // Stop confetti after 5 seconds
    const timer = setTimeout(() => {
      setConfettiActive(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  const socialShare = {
    twitter: `I just joined the @HappyLlama beta waitlist! 🎉 Can't wait to build enterprise apps at AI speed. Join me: https://happyllama.ai`,
    linkedin: `Excited to be part of the Happy Llama beta program! This AI-powered platform will revolutionize how we build enterprise applications. Learn more: https://happyllama.ai`
  }

  const handleShare = (platform: "twitter" | "linkedin") => {
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(socialShare.twitter)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://happyllama.ai")}&summary=${encodeURIComponent(socialShare.linkedin)}`
    }
    window.open(urls[platform], "_blank", "width=600,height=400")
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-primary/5 via-background to-primary/5">
      {/* Confetti Effect */}
      {confettiActive && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute h-2 w-2 rounded-full confetti-particle"
              style={{
                background: ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"][i % 5],
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="container max-w-3xl">
        <Card className="p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold mb-2">Welcome to the Future!</h1>
          <p className="text-xl text-muted-foreground mb-6">
            You&apos;re officially on the Happy Llama beta waitlist
          </p>

          {/* Waitlist Number */}
          <Badge variant="outline" className="mb-8 text-lg px-4 py-2">
            You&apos;re #{waitlistNumber} on the waitlist
          </Badge>

          <Separator className="my-8" />

          {/* Next Steps */}
          <div className="text-left space-y-6">
            <h2 className="text-xl font-semibold text-center">What Happens Next?</h2>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="rounded-full bg-primary/10 p-2">
                    <EnvelopeIcon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Check Your Email</h3>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ve sent a confirmation email with your beta access details and next steps.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="rounded-full bg-primary/10 p-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Save the Date</h3>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ll be sending beta invites in waves starting next month. Keep an eye on your inbox!
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="rounded-full bg-primary/10 p-2">
                    <UserGroupIcon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Join Our Community</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect with other beta users and our team on Discord for exclusive updates and discussions.
                  </p>
                  <a
                    href="https://discord.gg/happyllama"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                  >
                    Join Discord Server
                    <ArrowRightIcon className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Social Sharing */}
          <div className="space-y-4">
            <h3 className="font-semibold">Spread the Word</h3>
            <p className="text-sm text-muted-foreground">
              Help us grow the community and move up the waitlist by inviting others!
            </p>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare("twitter")}
              >
                <ShareIcon className="h-4 w-4 mr-2" />
                Share on Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare("linkedin")}
              >
                <ShareIcon className="h-4 w-4 mr-2" />
                Share on LinkedIn
              </Button>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="outline">
                Return to Homepage
              </Button>
            </Link>
            <Link href="/use-cases">
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                Explore Use Cases
              </Button>
            </Link>
          </div>
        </Card>

        {/* Additional Information */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Questions? Contact us at{" "}
            <a href="mailto:beta@happyllama.ai" className="underline">
              beta@happyllama.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}