'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShieldExclamationIcon, HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8 max-w-lg">
        <div className="mx-auto w-32 h-32 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldExclamationIcon className="h-16 w-16 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold">403 - Access Forbidden</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this resource.
          </p>
        </div>

        <Card className="p-6 bg-muted/50">
          <p className="text-sm text-muted-foreground">
            This page may be restricted to certain user roles or you may need to be authenticated. 
            If you believe this is an error, please contact your system administrator.
          </p>
        </Card>

        <div className="flex gap-4 justify-center pt-4">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Go Back
          </Button>
          <Button
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <HomeIcon className="h-4 w-4" />
            Go Home
          </Button>
        </div>

        <div className="pt-8 border-t">
          <p className="text-xs text-muted-foreground">
            If you continue to experience issues, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}