import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircleIcon } from "@heroicons/react/24/outline"

export default function BetaSignupConfirmPage() {
  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircleIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Email Confirmed!</CardTitle>
          <CardDescription>
            Your email has been successfully verified. You&apos;re all set to join the beta program.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <h3 className="mb-2 font-semibold">What&apos;s next?</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• We&apos;ll notify you when your beta access is ready</li>
              <li>• You&apos;ll receive onboarding materials via email</li>
              <li>• Join our Discord community for early access updates</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/" className="w-full">
              <Button className="w-full">Return to Homepage</Button>
            </Link>
            <Link href="/use-cases" className="w-full">
              <Button variant="outline" className="w-full">
                Explore Use Cases
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}