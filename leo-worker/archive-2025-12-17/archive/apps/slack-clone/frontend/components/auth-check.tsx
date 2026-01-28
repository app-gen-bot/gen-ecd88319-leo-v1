'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

interface AuthCheckProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function AuthCheck({ children, requireAdmin = false }: AuthCheckProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // TODO: Implement admin check when role is available
  if (requireAdmin) {
    // For now, allow all authenticated users
    return <>{children}</>;
  }

  return <>{children}</>;
}