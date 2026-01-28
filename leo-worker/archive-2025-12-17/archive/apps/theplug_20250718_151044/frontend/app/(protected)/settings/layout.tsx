"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  User, 
  Key, 
  Bell, 
  Shield, 
  CreditCard,
  Users
} from 'lucide-react'

const settingsNav = [
  {
    title: 'Profile',
    href: '/settings/profile',
    icon: User,
  },
  {
    title: 'API Credentials',
    href: '/settings/api-credentials',
    icon: Key,
  },
  {
    title: 'Notifications',
    href: '/settings/notifications',
    icon: Bell,
  },
  {
    title: 'Security',
    href: '/settings/security',
    icon: Shield,
  },
  {
    title: 'Billing',
    href: '/settings/billing',
    icon: CreditCard,
  },
  {
    title: 'Team',
    href: '/settings/team',
    icon: Users,
    disabled: true,
    badge: 'Phase 2',
  },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            {settingsNav.map((item) => (
              <Link
                key={item.href}
                href={item.disabled ? '#' : item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                  item.disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={item.disabled ? (e) => e.preventDefault() : undefined}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
                {item.badge && (
                  <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  )
}