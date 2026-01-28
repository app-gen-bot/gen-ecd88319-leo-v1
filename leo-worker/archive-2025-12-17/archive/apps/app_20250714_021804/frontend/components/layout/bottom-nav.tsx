'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CheckSquare, Plus, MessageSquare, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const pathname = usePathname()

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
      isSpecial: true,
    },
    {
      href: '/messages/history',
      icon: MessageSquare,
      label: 'Messages',
    },
    {
      href: '/family/members',
      icon: Users,
      label: 'Family',
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          if (item.isSpecial) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center relative"
              >
                <div className="absolute -top-6 bg-primary rounded-full p-3 shadow-lg">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-xs transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}