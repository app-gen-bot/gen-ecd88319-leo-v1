import { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { useAuth } from '@/contexts/AuthContext';

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * AppLayout component
 * Main layout wrapper with navigation
 */
export function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background-primary text-text-primary">
      <Header />

      <main className="pb-20 md:pb-8">
        {children}
      </main>

      {isAuthenticated && <BottomNav />}
    </div>
  );
}
