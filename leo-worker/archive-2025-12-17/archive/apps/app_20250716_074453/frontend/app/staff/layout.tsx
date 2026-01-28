'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthCheck } from '@/components/auth-check';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  HomeIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  BeakerIcon,
  CubeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BellIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  BellAlertIcon,
  EnvelopeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  CurrencyDollarIcon as CurrencyDollarIconSolid,
  BeakerIcon as BeakerIconSolid,
  CubeIcon as CubeIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
} from '@heroicons/react/24/solid';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  activeIcon: any;
  badge?: number;
  subItems?: {
    name: string;
    href: string;
  }[];
}

// Define navigation items based on user role
const getNavigationItems = (role: string): NavItem[] => {
  const baseItems: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/staff/dashboard',
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
    },
    {
      name: 'Appointments',
      href: '/staff/appointments',
      icon: CalendarDaysIcon,
      activeIcon: CalendarDaysIconSolid,
      badge: 3,
      subItems: [
        { name: 'Today', href: '/staff/appointments/today' },
        { name: 'Calendar', href: '/staff/appointments/calendar' },
        { name: 'Check-in', href: '/staff/appointments/checkin' },
      ],
    },
    {
      name: 'Patients',
      href: '/staff/patients',
      icon: UserGroupIcon,
      activeIcon: UserGroupIconSolid,
      subItems: [
        { name: 'All Patients', href: '/staff/patients' },
        { name: 'Add New', href: '/staff/patients/new' },
        { name: 'Records', href: '/staff/patients/records' },
      ],
    },
  ];

  if (['veterinarian', 'technician'].includes(role)) {
    baseItems.push({
      name: 'Medical Records',
      href: '/staff/medical-records',
      icon: ClipboardDocumentListIcon,
      activeIcon: ClipboardDocumentListIconSolid,
      subItems: [
        { name: 'SOAP Notes', href: '/staff/medical-records/soap' },
        { name: 'Lab Results', href: '/staff/medical-records/labs' },
        { name: 'Imaging', href: '/staff/medical-records/imaging' },
        { name: 'Prescriptions', href: '/staff/medical-records/prescriptions' },
      ],
    });
    
    baseItems.push({
      name: 'Laboratory',
      href: '/staff/laboratory',
      icon: BeakerIcon,
      activeIcon: BeakerIconSolid,
      badge: 2,
      subItems: [
        { name: 'Pending Tests', href: '/staff/laboratory/pending' },
        { name: 'Results', href: '/staff/laboratory/results' },
        { name: 'Equipment', href: '/staff/laboratory/equipment' },
      ],
    });
  }

  if (['front_desk', 'practice_manager', 'admin'].includes(role)) {
    baseItems.push({
      name: 'Billing',
      href: '/staff/billing',
      icon: CurrencyDollarIcon,
      activeIcon: CurrencyDollarIconSolid,
      subItems: [
        { name: 'Invoices', href: '/staff/billing/invoices' },
        { name: 'Payments', href: '/staff/billing/payments' },
        { name: 'Insurance', href: '/staff/billing/insurance' },
      ],
    });
  }

  if (['practice_manager', 'admin', 'veterinarian'].includes(role)) {
    baseItems.push({
      name: 'Inventory',
      href: '/staff/inventory',
      icon: CubeIcon,
      activeIcon: CubeIconSolid,
      badge: 5,
      subItems: [
        { name: 'Stock Levels', href: '/staff/inventory' },
        { name: 'Orders', href: '/staff/inventory/orders' },
        { name: 'Suppliers', href: '/staff/inventory/suppliers' },
      ],
    });
  }

  if (['practice_manager', 'admin'].includes(role)) {
    baseItems.push({
      name: 'Reports',
      href: '/staff/reports',
      icon: ChartBarIcon,
      activeIcon: ChartBarIconSolid,
      subItems: [
        { name: 'Financial', href: '/staff/reports/financial' },
        { name: 'Clinical', href: '/staff/reports/clinical' },
        { name: 'Inventory', href: '/staff/reports/inventory' },
        { name: 'Staff Performance', href: '/staff/reports/performance' },
      ],
    });
    
    baseItems.push({
      name: 'Documents',
      href: '/staff/documents',
      icon: DocumentTextIcon,
      activeIcon: DocumentTextIconSolid,
      subItems: [
        { name: 'Forms', href: '/staff/documents/forms' },
        { name: 'Protocols', href: '/staff/documents/protocols' },
        { name: 'Compliance', href: '/staff/documents/compliance' },
      ],
    });
  }

  if (['admin'].includes(role)) {
    baseItems.push({
      name: 'Settings',
      href: '/staff/settings',
      icon: Cog6ToothIcon,
      activeIcon: Cog6ToothIconSolid,
      subItems: [
        { name: 'Practice Info', href: '/staff/settings/practice' },
        { name: 'Staff Management', href: '/staff/settings/staff' },
        { name: 'Services', href: '/staff/settings/services' },
        { name: 'System', href: '/staff/settings/system' },
      ],
    });
  }

  return baseItems;
};

// Mock notifications - in real app, fetch from API
const mockNotifications = [
  {
    id: '1',
    type: 'appointment',
    title: 'Appointment starting soon',
    description: 'Max (Golden Retriever) - Dr. Smith in 15 minutes',
    time: '5 minutes ago',
    icon: ClockIcon,
    unread: true,
  },
  {
    id: '2',
    type: 'lab',
    title: 'Lab results ready',
    description: 'Blood work results for Luna (Cat) are available',
    time: '1 hour ago',
    icon: BeakerIcon,
    unread: true,
  },
  {
    id: '3',
    type: 'inventory',
    title: 'Low inventory alert',
    description: 'Rabies vaccine stock below reorder point',
    time: '2 hours ago',
    icon: ExclamationCircleIcon,
    unread: false,
  },
];

// Staff-specific roles that can access this layout
const STAFF_ROLES = ['veterinarian', 'technician', 'front_desk', 'practice_manager', 'admin'];

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const navigationItems = user ? getNavigationItems(user.role) : [];
  const unreadNotifications = mockNotifications.filter(n => n.unread).length;

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isActiveRoute = (href: string) => {
    if (href === '/staff/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <AuthCheck allowedRoles={STAFF_ROLES} redirectTo="/login?portal=staff">
      <div className="min-h-screen bg-gray-900 text-gray-100">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-900/80 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center justify-between px-6 border-b border-gray-700">
              <Link href="/staff/dashboard" className="flex items-center">
                <span className="text-xl font-bold text-blue-400">PawsFlow</span>
                <span className="ml-2 text-sm text-gray-400">Staff</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-gray-400 hover:text-gray-100"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3 py-4">
              <nav className="space-y-1">
                {navigationItems.map((item) => {
                  const isActive = isActiveRoute(item.href);
                  const isExpanded = expandedItems.includes(item.name);
                  const Icon = isActive ? item.activeIcon : item.icon;

                  return (
                    <div key={item.name}>
                      <Link
                        href={item.href}
                        onClick={(e) => {
                          if (item.subItems) {
                            e.preventDefault();
                            toggleExpanded(item.name);
                          }
                        }}
                        className={cn(
                          'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-gray-700 text-blue-400'
                            : 'text-gray-300 hover:bg-gray-700/50 hover:text-gray-100'
                        )}
                      >
                        <div className="flex items-center">
                          <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                          {item.name}
                        </div>
                        <div className="flex items-center">
                          {item.badge && (
                            <Badge
                              variant="secondary"
                              className="ml-2 bg-blue-500/20 text-blue-400 border-0"
                            >
                              {item.badge}
                            </Badge>
                          )}
                          {item.subItems && (
                            <ChevronDownIcon
                              className={cn(
                                'h-4 w-4 ml-1 transition-transform',
                                isExpanded ? 'rotate-180' : ''
                              )}
                            />
                          )}
                        </div>
                      </Link>

                      {/* Sub-items */}
                      {item.subItems && isExpanded && (
                        <div className="mt-1 space-y-1 pl-11">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={cn(
                                'block px-3 py-2 rounded-lg text-sm transition-colors',
                                pathname === subItem.href
                                  ? 'bg-gray-700/50 text-blue-400'
                                  : 'text-gray-400 hover:bg-gray-700/30 hover:text-gray-200'
                              )}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </ScrollArea>

            {/* User section */}
            <div className="border-t border-gray-700 p-4">
              <div className="flex items-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gray-600 text-gray-200">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-200">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">
                    {user?.role.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-700 bg-gray-800/95 backdrop-blur px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-gray-400 hover:text-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-5 w-5" />
            </Button>

            {/* Search bar - placeholder for future implementation */}
            <div className="flex-1" />

            {/* Header actions */}
            <div className="flex items-center gap-2">
              {/* Messages */}
              <Link href="/staff/messages">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-gray-400 hover:text-gray-100"
                >
                  <EnvelopeIcon className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 text-[10px] font-bold text-white flex items-center justify-center">
                    2
                  </span>
                </Button>
              </Link>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-gray-400 hover:text-gray-100"
                  >
                    {unreadNotifications > 0 ? (
                      <BellAlertIcon className="h-5 w-5 text-blue-400" />
                    ) : (
                      <BellIcon className="h-5 w-5" />
                    )}
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                        {unreadNotifications}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-80 bg-gray-800 border-gray-700 text-gray-100"
                >
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  {mockNotifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={cn(
                        'flex items-start gap-3 p-3 cursor-pointer',
                        notification.unread
                          ? 'bg-gray-700/30'
                          : '',
                        'hover:bg-gray-700/50'
                      )}
                    >
                      <notification.icon
                        className={cn(
                          'h-5 w-5 mt-0.5 flex-shrink-0',
                          notification.unread
                            ? 'text-blue-400'
                            : 'text-gray-500'
                        )}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-100">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {notification.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.time}
                        </p>
                      </div>
                      {notification.unread && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem className="text-center hover:bg-gray-700/50">
                    <Link
                      href="/staff/notifications"
                      className="text-sm text-blue-400 hover:text-blue-300 w-full"
                    >
                      View all notifications
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-gray-300 hover:text-gray-100"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-gray-600 text-gray-200">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline-block text-sm font-medium">
                      {user?.firstName}
                    </span>
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-gray-800 border-gray-700 text-gray-100"
                >
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user?.firstName} {user?.lastName}</span>
                      <span className="text-xs text-gray-400 font-normal">
                        {user?.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem className="hover:bg-gray-700/50">
                    <UserCircleIcon className="mr-2 h-4 w-4" />
                    <Link href="/staff/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-700/50">
                    <Cog6ToothIcon className="mr-2 h-4 w-4" />
                    <Link href="/staff/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-400 hover:text-red-300 hover:bg-gray-700/50"
                  >
                    <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main content area */}
          <main className="flex-1 p-6">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-gray-700 bg-gray-800/50 px-6 py-4">
            <p className="text-center text-sm text-gray-400">
              Powered by <span className="text-blue-400 font-semibold">PlanetScale</span>
            </p>
          </footer>
        </div>
      </div>
    </AuthCheck>
  );
}