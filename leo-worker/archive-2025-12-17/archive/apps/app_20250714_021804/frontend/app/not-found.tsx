import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary" fill="currentColor" />
            <span className="text-2xl font-bold">LoveyTasks</span>
          </Link>
        </div>
        
        <div className="space-y-4">
          <div className="text-6xl font-bold text-primary">404</div>
          <h1 className="text-3xl font-bold">Page not found</h1>
          <p className="text-muted-foreground">
            Looks like this page went on vacation. Let&apos;s get you back home!
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild>
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              Contact Support
            </Link>
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground pt-8">
          Error ID: {Math.random().toString(36).substr(2, 9)}
        </p>
      </div>
    </div>
  )
}