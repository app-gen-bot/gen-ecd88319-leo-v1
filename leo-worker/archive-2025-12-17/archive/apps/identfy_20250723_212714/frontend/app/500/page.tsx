import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw, Mail } from "lucide-react";

export default function Error500Page() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 text-center">
        <div className="space-y-6">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">500</h1>
            <h2 className="text-2xl font-semibold">Internal Server Error</h2>
            <p className="text-muted-foreground">
              Oops! Something went wrong on our end. Our team has been notified and is working to fix the issue.
            </p>
          </div>

          {/* Error Details */}
          <div className="bg-muted rounded-lg p-4 text-left">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>What happened?</strong>
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>The server encountered an unexpected error</li>
              <li>This is not your fault - it's a problem on our side</li>
              <li>Our engineering team has been automatically notified</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              variant="default" 
              className="w-full"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go to Homepage
              </Link>
            </Button>
          </div>

          {/* Support Info */}
          <div className="border-t pt-6">
            <p className="text-sm text-muted-foreground mb-3">
              Need immediate assistance?
            </p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href="mailto:support@identfy.com" className="text-primary hover:underline">
                support@identfy.com
              </a>
            </div>
          </div>

          {/* Error ID */}
          <div className="text-xs text-muted-foreground">
            Error ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
          </div>
        </div>
      </Card>
    </div>
  );
}