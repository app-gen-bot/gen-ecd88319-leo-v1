'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { User, Shield, Bell, Palette, HelpCircle, LogOut, ChevronRight, Settings } from 'lucide-react'

const settingsSections = [
  {
    title: 'Account',
    description: 'Manage your account details and preferences',
    icon: User,
    href: '/settings/account',
  },
  {
    title: 'Security',
    description: 'Password and security settings',
    icon: Shield,
    href: '/settings/security',
  },
  {
    title: 'Notifications',
    description: 'Control your notification preferences',
    icon: Bell,
    href: '/profile/notifications',
  },
  {
    title: 'Appearance',
    description: 'Theme and display preferences',
    icon: Palette,
    href: '/settings/appearance',
    comingSoon: true,
  },
  {
    title: 'Help & Support',
    description: 'Get help and contact support',
    icon: HelpCircle,
    href: '/settings/help',
    comingSoon: true,
  },
]

export default function SettingsPage() {
  const router = useRouter()
  const { user, signOut } = useAuth()

  useEffect(() => {
    if (!user) {
      router.push('/signin')
    }
  }, [user, router])

  if (!user) return null

  const handleLogout = async () => {
    await signOut()
    router.push('/signin')
  }

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Settings className="h-8 w-8 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {settingsSections.map((section) => {
          const Icon = section.icon
          return (
            <Card
              key={section.title}
              className={section.comingSoon ? 'opacity-60' : 'hover:bg-accent/50 transition-colors cursor-pointer'}
            >
              {section.comingSoon ? (
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{section.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    Coming Soon
                  </span>
                </CardHeader>
              ) : (
                <Link href={section.href}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-muted">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{section.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {section.description}
                        </CardDescription>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                </Link>
              )}
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild variant="outline" className="w-full justify-start">
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              View Profile
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start">
            <Link href="/family/settings">
              <Settings className="mr-2 h-4 w-4" />
              Family Settings
            </Link>
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* App Version */}
      <div className="text-center text-sm text-muted-foreground">
        <p>LoveyTasks v1.0.0</p>
        <p>Made with ❤️ for families</p>
      </div>
    </div>
  )
}