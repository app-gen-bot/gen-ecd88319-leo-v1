"use client"

import React, { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { NextAuthProvider } from '@/contexts/nextauth-context';
import { Toaster } from '@/components/ui/toaster';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Start MSW in development if not using real API
    if (
      process.env.NODE_ENV === 'development' &&
      process.env.NEXT_PUBLIC_USE_REAL_API !== 'true'
    ) {
      import('@/mocks/browser').then(({ worker, workerOptions }) => {
        worker.start(workerOptions).then(() => {
          console.log('MSW started');
        });
      });
    }
  }, []);

  return (
    <SessionProvider>
      <NextAuthProvider>
        {children}
        <Toaster />
      </NextAuthProvider>
    </SessionProvider>
  );
}