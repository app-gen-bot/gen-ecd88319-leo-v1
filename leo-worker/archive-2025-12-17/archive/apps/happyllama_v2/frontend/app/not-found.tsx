import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto text-center px-4">
        <Card className="p-8">
          <div className="text-6xl mb-4">🦙</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">Go Home</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/contact/support">Contact Support</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}