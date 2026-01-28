import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Sorry, the page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/">
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">
              Sign In
            </Link>
          </Button>
        </div>

        <div className="pt-8 text-xs text-muted-foreground">
          If you believe this is an error, please contact support.
        </div>
      </div>
    </div>
  );
}