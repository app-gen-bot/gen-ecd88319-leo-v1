import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search, MessageSquare, AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-32 w-32 bg-primary/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-16 w-16 text-primary" />
            </div>
            <div className="absolute -bottom-2 -right-2 h-12 w-12 bg-orange-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-orange-500">404</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">Page Not Found</h1>
          <p className="text-muted-foreground">
            We couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or never existed.
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Here are some helpful links:</p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard">
              <Button variant="default" className="gap-2 w-full sm:w-auto">
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
            
            <Link href="/knowledge/search">
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <Search className="h-4 w-4" />
                Search Knowledge
              </Button>
            </Link>
          </div>
          
          <div className="pt-4">
            <Link href="/contact" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              Contact Support
            </Link>
          </div>
        </div>
        
        <div className="pt-8 border-t">
          <p className="text-xs text-muted-foreground">
            Error Code: 404 | Page not found
          </p>
        </div>
      </div>
    </div>
  )
}