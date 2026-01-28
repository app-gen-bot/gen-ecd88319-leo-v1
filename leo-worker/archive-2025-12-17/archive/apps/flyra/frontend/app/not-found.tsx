import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Search, HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-12 pb-8 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-primary">404</h1>
            <h2 className="text-2xl font-semibold">Page Not Found</h2>
            <p className="text-muted-foreground">
              Sorry, we couldn&apos;t find the page you&apos;re looking for.
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/" className="block">
              <Button className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Go to Homepage
              </Button>
            </Link>
            
            <Link href="/dashboard" className="block">
              <Button variant="outline" className="w-full">
                Go to Dashboard
              </Button>
            </Link>

            <Link href="/support" className="block">
              <Button variant="ghost" className="w-full">
                <HelpCircle className="mr-2 h-4 w-4" />
                Get Help
              </Button>
            </Link>
          </div>

          <div className="pt-4">
            <p className="text-sm text-muted-foreground">
              Popular pages:
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              <Link href="/send" className="text-sm text-primary hover:underline">
                Send Money
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link href="/wallet" className="text-sm text-primary hover:underline">
                Wallet
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link href="/transactions" className="text-sm text-primary hover:underline">
                Transactions
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link href="/recipients" className="text-sm text-primary hover:underline">
                Recipients
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}