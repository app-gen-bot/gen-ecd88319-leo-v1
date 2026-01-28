import { Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { InstallPrompt } from './components/pwa/InstallPrompt';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { PrivyProviderWrapper } from './providers/PrivyProviderWrapper';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyFizzCardPage } from './pages/MyFizzCardPage';
import { ScannerPage } from './pages/ScannerPage';
import { ProfilePage } from './pages/ProfilePage';
import { ConnectionsPage } from './pages/ConnectionsPage';
import { ConnectionRequestsPage } from './pages/ConnectionRequestsPage';
import { WalletPage } from './pages/WalletPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { EventsPage } from './pages/EventsPage';
import { SettingsPage } from './pages/SettingsPage';
import { IntroductionsPage } from './pages/IntroductionsPage';
import { CreateIntroductionPage } from './pages/CreateIntroductionPage';
import { IntroductionRequestsPage } from './pages/IntroductionRequestsPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { CreateEventPage } from './pages/CreateEventPage';
import NetworkGraphPage from './pages/NetworkGraphPage';
import { ViewFizzCardPage } from './pages/ViewFizzCardPage';
import { WhitepaperPage } from './pages/WhitepaperPage';

// Create a query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

/**
 * Main App component
 * Sets up routing, auth, React Query, and toast notifications
 */
export default function App() {
  return (
    <PrivyProviderWrapper>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <OfflineIndicator />
          <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(42, 42, 58, 0.95)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Switch>
          {/* Public routes */}
          <Route path="/" component={HomePage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/signup" component={SignupPage} />
          <Route path="/whitepaper" component={WhitepaperPage} />

          {/* Public FizzCard view - MUST be public for QR code scanning to work */}
          <Route path="/fizzcard/:id" component={ViewFizzCardPage} />

          {/* Protected routes */}
          <Route path="/dashboard">
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          </Route>

          <Route path="/my-fizzcard">
            <ProtectedRoute>
              <MyFizzCardPage />
            </ProtectedRoute>
          </Route>

          <Route path="/scan">
            <ProtectedRoute>
              <ScannerPage />
            </ProtectedRoute>
          </Route>

          <Route path="/connections">
            <ProtectedRoute>
              <ConnectionsPage />
            </ProtectedRoute>
          </Route>

          <Route path="/connection-requests">
            <ProtectedRoute>
              <ConnectionRequestsPage />
            </ProtectedRoute>
          </Route>

          <Route path="/wallet">
            <ProtectedRoute>
              <WalletPage />
            </ProtectedRoute>
          </Route>

          <Route path="/leaderboard">
            <ProtectedRoute>
              <LeaderboardPage />
            </ProtectedRoute>
          </Route>

          <Route path="/events">
            <ProtectedRoute>
              <EventsPage />
            </ProtectedRoute>
          </Route>

          <Route path="/events/create">
            <ProtectedRoute>
              <CreateEventPage />
            </ProtectedRoute>
          </Route>

          <Route path="/events/:id">
            <ProtectedRoute>
              <EventDetailsPage />
            </ProtectedRoute>
          </Route>

          <Route path="/profile">
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          </Route>

          <Route path="/settings">
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          </Route>

          <Route path="/introductions">
            <ProtectedRoute>
              <IntroductionsPage />
            </ProtectedRoute>
          </Route>

          <Route path="/introductions/create">
            <ProtectedRoute>
              <CreateIntroductionPage />
            </ProtectedRoute>
          </Route>

          <Route path="/introductions/requests">
            <ProtectedRoute>
              <IntroductionRequestsPage />
            </ProtectedRoute>
          </Route>

          <Route path="/network">
            <ProtectedRoute>
              <NetworkGraphPage />
            </ProtectedRoute>
          </Route>

          {/* 404 fallback */}
          <Route>
            <HomePage />
          </Route>
        </Switch>
        <InstallPrompt />
      </AuthProvider>
    </QueryClientProvider>
    </PrivyProviderWrapper>
  );
}
