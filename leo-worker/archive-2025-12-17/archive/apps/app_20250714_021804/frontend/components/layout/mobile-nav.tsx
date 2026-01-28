'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, CheckSquare, Plus, MessageCircle, Users } from 'lucide-react'

const navItems = [
  {
    href: '/dashboard',
    icon: Home,
    label: 'Dashboard',
  },
  {
    href: '/tasks/active',
    icon: CheckSquare,
    label: 'Tasks',
  },
  {
    href: '/create-task',
    icon: Plus,
    label: 'Create',
    isPrimary: true,
  },
  {
    href: '/messages/history',
    icon: MessageCircle,
    label: 'Messages',
  },
  {
    href: '/family/members',
    icon: Users,
    label: 'Family',
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 relative",
                isActive && !item.isPrimary && "text-primary",
                !isActive && !item.isPrimary && "text-muted-foreground",
                item.isPrimary && "text-primary-foreground"
              )}
            >
              {item.isPrimary ? (
                <div className="absolute -top-2 bg-primary rounded-full p-3 shadow-lg">
                  <Icon className="h-5 w-5" />
                </div>
              ) : (
                <>
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{item.label}</span>
                </>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}