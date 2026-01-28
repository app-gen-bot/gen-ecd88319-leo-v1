import { Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RequestAccessPage from './pages/RequestAccessPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import AccountInactivePage from './pages/AccountInactivePage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import AppsPage from './pages/AppsPage';
import AppDetailPage from './pages/AppDetailPage';
import ConsolePage from './pages/ConsolePage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import PricingPage from './pages/PricingPage';
import BillingPage from './pages/BillingPage';
import SettingsPage from './pages/SettingsPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          {/* Public routes */}
          <Route path="/" component={HomePage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/request-access" component={RequestAccessPage} />
          <Route path="/pricing" component={PricingPage} />
          <Route path="/auth/callback" component={AuthCallbackPage} />
          <Route path="/reset-password" component={ResetPasswordPage} />

          {/* Auth status routes (authenticated but not fully approved) */}
          <Route path="/pending-approval" component={PendingApprovalPage} />
          <Route path="/account-inactive" component={AccountInactivePage} />

          {/* Protected routes (requires approved status) */}
          <Route path="/apps">
            <ProtectedRoute>
              <AppsPage />
            </ProtectedRoute>
          </Route>

          <Route path="/apps/:id">
            <ProtectedRoute>
              <AppDetailPage />
            </ProtectedRoute>
          </Route>

          <Route path="/console/:id?">
            <ProtectedRoute>
              <ConsolePage />
            </ProtectedRoute>
          </Route>

          <Route path="/console">
            <ProtectedRoute>
              <ConsolePage />
            </ProtectedRoute>
          </Route>

          {/* Billing route (protected) */}
          <Route path="/billing">
            <ProtectedRoute>
              <BillingPage />
            </ProtectedRoute>
          </Route>

          {/* Settings route (protected) */}
          <Route path="/settings">
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          </Route>

          {/* Admin routes */}
          <Route path="/admin/analytics">
            <ProtectedRoute>
              <AdminAnalyticsPage />
            </ProtectedRoute>
          </Route>

          {/* 404 */}
          <Route>
            <div className="min-h-screen flex items-center justify-center bg-background">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
                <p className="text-muted-foreground">Page not found</p>
              </div>
            </div>
          </Route>
        </Switch>
      </AuthProvider>
    </QueryClientProvider>
  );
}
