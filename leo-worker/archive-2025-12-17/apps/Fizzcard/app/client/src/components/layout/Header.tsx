import React from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { FizzCoinDisplay } from '@/components/ui/FizzCoinDisplay';
import { cn } from '@/lib/utils';

/**
 * Header component
 * Desktop navigation
 */
export function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Whitepaper', path: '/whitepaper' },
    { label: 'Connections', path: '/connections' },
    { label: 'Network', path: '/network' },
    { label: 'Leaderboard', path: '/leaderboard' },
    { label: 'Events', path: '/events' },
    ...(isAuthenticated ? [{ label: 'Wallet', path: '/wallet' }] : []),
  ];

  return (
    <header className="sticky top-0 h-18 backdrop-blur-xl bg-[rgba(26,26,36,0.8)] border-b border-border-default z-[1030]">
      <div className="flex items-center justify-between h-full px-4 md:px-8 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center font-bold text-white">
              F
            </div>
            <span className="text-xl font-bold text-white hidden sm:inline">
              FizzCard
            </span>
          </a>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.path} href={link.path}>
              <a
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary-500',
                  location === link.path ? 'text-primary-500' : 'text-text-secondary'
                )}
              >
                {link.label}
              </a>
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <>
              {/* FizzCoin Balance (desktop) */}
              <div className="hidden md:block">
                <FizzCoinDisplay amount={0} size="sm" />
              </div>

              {/* User Menu */}
              <Link href="/profile">
                <a>
                  <Avatar
                    src={user.avatarUrl}
                    alt={user.name}
                    size="sm"
                    className="cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
                  />
                </a>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <a className="text-sm font-medium text-text-secondary hover:text-primary-500 transition-colors">
                  Login
                </a>
              </Link>
              <Link href="/signup">
                <a className="px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg text-sm font-semibold hover:shadow-[0_8px_20px_rgba(0,217,255,0.5)] transition-shadow">
                  Sign Up
                </a>
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-primary-500"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border-default bg-background-secondary">
          <nav className="flex flex-col p-4 gap-2">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <a
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    location === link.path
                      ? 'bg-primary-500/10 text-primary-500'
                      : 'text-text-secondary hover:bg-white/5'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
