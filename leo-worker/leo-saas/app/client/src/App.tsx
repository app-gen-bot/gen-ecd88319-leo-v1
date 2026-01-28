import { Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AppsPage from './pages/AppsPage';
import ConsolePage from './pages/ConsolePage';

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

          {/* Protected routes */}
          <Route path="/apps">
            <ProtectedRoute>
              <AppsPage />
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
