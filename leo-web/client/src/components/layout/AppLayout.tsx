import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/auth/UserMenu';
import { LeoLogo, LeoLogoMark } from '@/components/ui/LeoLogo';
import { LayoutGrid, Terminal, Menu, X } from 'lucide-react';
import { ReactNode, useState } from 'react';

export function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, profile } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;

  // Users with 'user' role cannot create new apps - hide Console nav
  const canCreateApps = profile?.role !== 'user';

  return (
    <div className="min-h-screen bg-background relative">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 leo-dots-pattern opacity-30 pointer-events-none" />

      {/* Navigation */}
      <nav className="leo-nav">
        <div className="leo-nav-inner">
          {/* Logo */}
          <Link href="/" className="group">
            {/* Desktop logo */}
            <div className="hidden sm:block">
              <LeoLogo size="md" />
            </div>
            {/* Mobile logo */}
            <div className="sm:hidden">
              <LeoLogoMark size={36} />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link href="/apps">
                  <Button
                    variant="ghost"
                    className={`flex items-center gap-2 text-sm font-medium transition-all duration-200 min-h-11 px-4 rounded-lg ${
                      isActive('/apps')
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    My Apps
                  </Button>
                </Link>
                {/* Only show Console nav for users who can create apps (not 'user' role) */}
                {canCreateApps && (
                  <Link href="/console">
                    <Button
                      variant="ghost"
                      className={`flex items-center gap-2 text-sm font-medium transition-all duration-200 min-h-11 px-4 rounded-lg ${
                        isActive('/console') || location.startsWith('/console/')
                          ? 'text-accent bg-accent/10'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <Terminal className="h-4 w-4" />
                      Console
                    </Button>
                  </Link>
                )}
                <div className="ml-2 pl-4 border-l border-border">
                  <UserMenu />
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium min-h-11 px-4"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/request-access">
                  <Button className="leo-btn-primary text-sm px-6 py-2.5">
                    Request Access
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="md:hidden min-h-11 min-w-11 p-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-4 py-4 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link href="/apps" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start gap-3 min-h-12 text-base ${
                        isActive('/apps')
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <LayoutGrid className="h-5 w-5" />
                      My Apps
                    </Button>
                  </Link>
                  {/* Only show Console nav for users who can create apps (not 'user' role) */}
                  {canCreateApps && (
                    <Link href="/console" onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start gap-3 min-h-12 text-base ${
                          isActive('/console')
                            ? 'text-accent bg-accent/10'
                            : 'text-muted-foreground'
                        }`}
                      >
                        <Terminal className="h-5 w-5" />
                        Console
                      </Button>
                    </Link>
                  )}
                  <div className="pt-2 border-t border-border">
                    <UserMenu />
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start min-h-12 text-base text-muted-foreground"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/request-access" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full leo-btn-primary min-h-12 text-base">
                      Request Access
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-16 md:pt-20 min-h-screen">
        {children}
      </main>

      {/* Footer */}
      <footer className="leo-footer">
        <div className="leo-footer-inner">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <LeoLogoMark size={24} />
              <span className="text-sm font-medium text-muted-foreground">
                Leo — Where Engineering Meets Art
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2025 Leo. Build production-ready apps with AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
