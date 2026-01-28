"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const handleAcceptAll = () => {
    localStorage.setItem("cookie-consent", "all")
    localStorage.setItem("cookie-consent-date", new Date().toISOString())
    setShowBanner(false)
  }

  const handleRejectAll = () => {
    localStorage.setItem("cookie-consent", "none")
    localStorage.setItem("cookie-consent-date", new Date().toISOString())
    setShowBanner(false)
  }

  const handleCustomize = () => {
    // In a real app, this would open a modal for cookie preferences
    localStorage.setItem("cookie-consent", "custom")
    localStorage.setItem("cookie-consent-date", new Date().toISOString())
    setShowBanner(false)
  }

  if (!mounted || !showBanner) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="mx-auto max-w-4xl p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <h3 className="mb-2 font-semibold">We use cookies</h3>
            <p className="text-sm text-muted-foreground">
              We use cookies to enhance your experience, analyze site traffic, and for marketing purposes. 
              By continuing to use our site, you consent to our use of cookies. 
              Read our <Link href="/cookies" className="underline hover:text-foreground">Cookie Policy</Link> to learn more.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" size="sm" onClick={handleCustomize}>
              Customize
            </Button>
            <Button variant="outline" size="sm" onClick={handleRejectAll}>
              Reject All
            </Button>
            <Button size="sm" onClick={handleAcceptAll}>
              Accept All
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}