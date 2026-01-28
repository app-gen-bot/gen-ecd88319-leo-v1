"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HomeIcon, ArrowLeftIcon } from "@heroicons/react/24/outline"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="container text-center">
        <div className="mx-auto max-w-md">
          <h1 className="text-9xl font-bold text-primary/20">404</h1>
          <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. 
            It might have been moved or doesn&apos;t exist.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="gradient">
                <HomeIcon className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}