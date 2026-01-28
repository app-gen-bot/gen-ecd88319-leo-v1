"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNextAuth } from '@/contexts/nextauth-context';
import { Loader2 } from 'lucide-react';

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useNextAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/sign-in');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}