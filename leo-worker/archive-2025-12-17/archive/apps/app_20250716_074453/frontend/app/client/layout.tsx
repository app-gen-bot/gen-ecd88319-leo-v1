'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AuthCheck } from '@/components/auth-check';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { 
  Calendar,
  Heart,
  FileText,
  CreditCard,
  MessageSquare,
  Menu,
  Home,
  Settings,
  LogOut,
  HelpCircle,
  Bell,
  Pill
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/client/dashboard', icon: Home },
  { name: 'My Pets', href: '/client/pets', icon: Heart },
  { name: 'Appointments', href: '/client/appointments', icon: Calendar },
  { name: 'Records', href: '/client/records', icon: FileText },
  { name: 'Prescriptions', href: '/client/prescriptions', icon: Pill },
  { name: 'Billing', href: '/client/billing', icon: CreditCard },
  { name: 'Messages', href: '/client/messages', icon: MessageSquare },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <AuthCheck allowedRoles={['pet_owner']}>
      <div className="min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <div className="flex flex-col flex-1 border-r bg-card">
            <div className="flex h-16 items-center px-4 border-b">
              <Link href="/client/dashboard" className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">P</span>
                </div>
                <span className="text-xl font-bold">PawsFlow</span>
              </Link>
            </div>
            <ScrollArea className="flex-1 px-3 py-4">
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </ScrollArea>
            <div className="p-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                Powered by PlanetScale
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="lg:hidden fixed top-0 z-40 w-full bg-background border-b">
          <div className="flex h-16 items-center justify-between px-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex h-16 items-center px-4 border-b">
                  <Link href="/client/dashboard" className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-primary-foreground font-bold">P</span>
                    </div>
                    <span className="text-xl font-bold">PawsFlow</span>
                  </Link>
                </div>
                <ScrollArea className="flex-1 px-3 py-4">
                  <nav className="space-y-1">
                    {navigation.map((item) => {
                      const isActive = pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </ScrollArea>
              </SheetContent>
            </Sheet>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/client/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Help
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="lg:pl-64">
          <main className="pt-16 lg:pt-0">
            {children}
          </main>
        </div>
      </div>
    </AuthCheck>
  );
}