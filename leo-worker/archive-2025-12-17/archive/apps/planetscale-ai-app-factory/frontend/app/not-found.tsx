import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Home, ArrowLeft, MessageCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center">
        <div className="container-max section-padding text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Animated 404 */}
            <div className="relative">
              <h1 className="text-[150px] md:text-[200px] font-bold leading-none">
                <span className="gradient-text inline-block animate-pulse">404</span>
              </h1>
              <div className="absolute inset-0 blur-3xl opacity-30">
                <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Lost in Space?</h2>
              <p className="text-xl text-muted-foreground max-w-md mx-auto">
                This page seems to have drifted into another dimension. Let&apos;s get you back on track.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg" variant="gradient" className="gap-2">
                  <Home className="w-5 h-5" />
                  Return Home
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2">
                <MessageCircle className="w-5 h-5" />
                Contact Support
              </Button>
            </div>

            {/* Suggested Links */}
            <div className="pt-12 border-t">
              <h3 className="text-lg font-semibold mb-4">Popular Pages</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <Link
                  href="/#process"
                  className="p-4 rounded-lg border hover:border-primary transition-colors"
                >
                  <h4 className="font-medium mb-1">How It Works</h4>
                  <p className="text-sm text-muted-foreground">
                    Learn about our process
                  </p>
                </Link>
                <Link
                  href="/#technology"
                  className="p-4 rounded-lg border hover:border-primary transition-colors"
                >
                  <h4 className="font-medium mb-1">Technology</h4>
                  <p className="text-sm text-muted-foreground">
                    Explore ACE system
                  </p>
                </Link>
                <Link
                  href="/#showcase"
                  className="p-4 rounded-lg border hover:border-primary transition-colors"
                >
                  <h4 className="font-medium mb-1">Showcase</h4>
                  <p className="text-sm text-muted-foreground">
                    See success stories
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}