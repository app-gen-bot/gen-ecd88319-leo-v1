import { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Protected Route Component
 *
 * Redirects to login if user is not authenticated.
 * Shows loading state while checking authentication.
 *
 * Usage:
 *   <Route path="/dashboard">
 *     <ProtectedRoute>
 *       <DashboardPage />
 *     </ProtectedRoute>
 *   </Route>
 *
 *   // Or with custom redirect
 *   <ProtectedRoute redirectTo="/auth/login">
 *     <AdminPanel />
 *   </ProtectedRoute>
 */

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to={redirectTo} />;
  }

  return <>{children}</>;
}
