"use client"

import { AuthCheck } from '@/components/auth-check';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNextAuth } from '@/contexts/nextauth-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Scale, 
  MessageSquare, 
  FileText, 
  Shield, 
  BookOpen,
  User,
  LogOut,
  Home,
  History,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'AI Legal Chat', href: '/dashboard/chat', icon: MessageSquare },
  { name: 'Conversation History', href: '/dashboard/history', icon: History },
  // Sprint 2+ features - commented out for Sprint 1
  // { name: 'Document Review', href: '/dashboard/documents', icon: FileText },
  // { name: 'Security Deposit', href: '/dashboard/deposit', icon: Shield },
  // { name: 'Knowledge Base', href: '/dashboard/knowledge', icon: BookOpen },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useNextAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AuthCheck>
      <div className="flex h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow overflow-y-auto bg-white border-r">
            <div className="flex items-center justify-center h-16 px-4 border-b">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <Scale className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">AI Tenant Rights</span>
              </Link>
            </div>
            
            <ScrollArea className="flex-1 px-3 py-4">
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </ScrollArea>

            <Separator />

            <div className="p-4 space-y-2">
              <Link href="/profile">
                <Button variant="ghost" className="w-full justify-start">
                  <User className="mr-3 h-5 w-5" />
                  Profile
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" className="w-full justify-start">
                  <Shield className="mr-3 h-5 w-5" />
                  Security Settings
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={logout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
              </Button>
            </div>

            <div className="p-4 border-t">
              <div className="text-sm">
                <p className="font-medium">{user?.name}</p>
                <p className="text-gray-500">{user?.email}</p>
                <p className="text-xs text-gray-400 capitalize mt-1">{user?.userType}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b">
          <div className="flex items-center justify-between h-16 px-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Scale className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">AI Tenant Rights</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-white pt-16">
            <ScrollArea className="h-full px-4 py-4">
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="mr-3 h-5 w-5" />
                    Profile
                  </Button>
                </Link>
                <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Shield className="mr-3 h-5 w-5" />
                    Security Settings
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-600"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sign Out
                </Button>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-gray-500">{user?.email}</p>
                  <p className="text-xs text-gray-400 capitalize mt-1">{user?.userType}</p>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="bg-white border-t px-6 py-3">
            <p className="text-xs text-center text-gray-500">
              Powered by PlanetScale | Legal information, not legal advice
            </p>
          </footer>
        </div>
      </div>
    </AuthCheck>
  );
}