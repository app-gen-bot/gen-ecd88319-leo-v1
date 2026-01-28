import { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Protected Route Component
 *
 * Redirects based on user authentication and approval status:
 * - Not authenticated → Login page
 * - Pending approval → Pending approval page
 * - Rejected/Suspended → Account inactive page
 * - Approved → Shows children
 *
 * Usage:
 *   <Route path="/dashboard">
 *     <ProtectedRoute>
 *       <DashboardPage />
 *     </ProtectedRoute>
 *   </Route>
 *
 *   // With requireApproval=false to allow pending users
 *   <ProtectedRoute requireApproval={false}>
 *     <ProfilePage />
 *   </ProtectedRoute>
 */

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  requireApproval?: boolean;
}

export function ProtectedRoute({
  children,
  redirectTo = '/login',
  requireApproval = true
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isApproved, isPending, isRejected, isSuspended, profile } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-leo-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-leo-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to={redirectTo} />;
  }

  // Check approval status if required
  if (requireApproval && profile) {
    if (isPending) {
      return <Redirect to="/pending-approval" />;
    }

    if (isRejected || isSuspended) {
      return <Redirect to="/account-inactive" />;
    }

    if (!isApproved) {
      // Profile exists but status is unknown - default to pending
      return <Redirect to="/pending-approval" />;
    }
  }

  return <>{children}</>;
}
