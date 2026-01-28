import { useLocation, Link } from 'wouter';
import { Home, Scan, Wallet, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: typeof Home;
  path: string;
  center?: boolean;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
  { id: 'scan', label: 'Scan', icon: Scan, path: '/scan', center: true },
  { id: 'wallet', label: 'Wallet', icon: Wallet, path: '/wallet' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

/**
 * BottomNav component
 * Mobile navigation at bottom of screen
 */
export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 backdrop-blur-xl bg-[rgba(26,26,36,0.9)] border-t border-border-default z-[1030] md:hidden">
      <div className="flex items-center justify-around h-full px-4 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;

          if (item.center) {
            // Center scan button (elevated)
            return (
              <Link key={item.id} href={item.path}>
                <a
                  className={cn(
                    'relative -top-4 w-14 h-14 rounded-full flex items-center justify-center',
                    'bg-gradient-to-r from-primary-500 to-accent-500',
                    'shadow-[0_4px_16px_rgba(0,217,255,0.5)]',
                    'active:scale-90 transition-transform'
                  )}
                >
                  <Icon className="w-6 h-6 text-white" />
                </a>
              </Link>
            );
          }

          return (
            <Link key={item.id} href={item.path}>
              <a className="relative flex flex-col items-center gap-1 min-w-[64px] py-2 active:scale-90 transition-transform">
                <Icon
                  className={cn(
                    'w-6 h-6 transition-colors',
                    isActive ? 'text-primary-500' : 'text-text-tertiary'
                  )}
                />
                <span
                  className={cn(
                    'text-xs transition-colors',
                    isActive ? 'text-primary-500' : 'text-text-tertiary'
                  )}
                >
                  {item.label}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -bottom-1 w-8 h-1 bg-primary-500 rounded-full" />
                )}
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
