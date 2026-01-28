"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  LayoutDashboard, 
  Music, 
  FileCheck, 
  Link2, 
  BarChart3, 
  Settings,
  Upload,
  CheckCircle,
  TrendingUp,
  HelpCircle
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Music', href: '/music', icon: Music },
  { name: 'Registrations', href: '/registrations', icon: FileCheck },
  { name: 'Integrations', href: '/integrations', icon: Link2 },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const platformStatus = [
  { name: 'MLC', href: '/integrations/mlc', status: 'connected' },
  { name: 'SoundExchange', href: '/integrations/soundexchange', status: 'disconnected' },
  { name: 'Distribution', href: '/integrations/distribution', status: 'connected' },
  { name: 'PROs', href: '/integrations/pro', status: 'error' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-60 flex-col fixed left-0 top-16 bottom-0 border-r bg-background">
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-4 py-4">
          {/* Quick Actions */}
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold">Quick Actions</h2>
            <div className="space-y-1">
              <Link href="/music/upload">
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New Song
                </Button>
              </Link>
              <Link href="/registrations">
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Check Registration Status
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </Link>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold">Navigation</h2>
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Platform Status */}
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold">Platform Status</h2>
            <div className="space-y-1">
              {platformStatus.map((platform) => (
                <Link
                  key={platform.name}
                  href={platform.href}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-accent"
                >
                  <span>{platform.name}</span>
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      platform.status === 'connected' && "bg-green-500",
                      platform.status === 'disconnected' && "bg-gray-500",
                      platform.status === 'error' && "bg-red-500"
                    )}
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Bottom Section */}
      <div className="border-t p-4">
        <Link href="/help">
          <Button variant="ghost" className="w-full justify-start">
            <HelpCircle className="mr-2 h-4 w-4" />
            Help & Support
          </Button>
        </Link>
      </div>
    </div>
  )
}