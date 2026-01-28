'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'
import { ChevronLeft, Save, Bell, MessageSquare, CheckSquare, Heart, Trophy, Clock, Smartphone, Mail } from 'lucide-react'
import { toast } from 'sonner'

interface NotificationSetting {
  id: string
  name: string
  description: string
  icon: React.ElementType
  enabled: boolean
  channels: {
    push: boolean
    email: boolean
  }
}

const defaultSettings: NotificationSetting[] = [
  {
    id: 'new-tasks',
    name: 'New Tasks',
    description: 'When someone assigns you a task',
    icon: CheckSquare,
    enabled: true,
    channels: { push: true, email: false },
  },
  {
    id: 'task-responses',
    name: 'Task Responses',
    description: 'When someone responds to your task',
    icon: MessageSquare,
    enabled: true,
    channels: { push: true, email: false },
  },
  {
    id: 'task-completed',
    name: 'Task Completions',
    description: 'When someone completes a task you assigned',
    icon: Trophy,
    enabled: true,
    channels: { push: true, email: true },
  },
  {
    id: 'lovely-messages',
    name: 'Lovely Messages',
    description: 'When you receive appreciation messages',
    icon: Heart,
    enabled: true,
    channels: { push: true, email: false },
  },
  {
    id: 'reminders',
    name: 'Task Reminders',
    description: 'Reminders for upcoming or overdue tasks',
    icon: Clock,
    enabled: true,
    channels: { push: true, email: false },
  },
  {
    id: 'family-updates',
    name: 'Family Updates',
    description: 'New members, achievements, and milestones',
    icon: Bell,
    enabled: false,
    channels: { push: false, email: true },
  },
]

export default function NotificationsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [settings, setSettings] = useState<NotificationSetting[]>(defaultSettings)
  const [masterPush, setMasterPush] = useState(true)
  const [masterEmail, setMasterEmail] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/signin')
    }
  }, [user, router])

  if (!user) return null

  const handleSettingToggle = (settingId: string, field: 'enabled' | 'push' | 'email') => {
    setSettings(prev => prev.map(setting => {
      if (setting.id === settingId) {
        if (field === 'enabled') {
          return { ...setting, enabled: !setting.enabled }
        } else {
          return {
            ...setting,
            channels: {
              ...setting.channels,
              [field]: !setting.channels[field as 'push' | 'email'],
            },
          }
        }
      }
      return setting
    }))
  }

  const handleMasterToggle = (channel: 'push' | 'email', value: boolean) => {
    if (channel === 'push') {
      setMasterPush(value)
      if (!value) {
        // Disable all push notifications
        setSettings(prev => prev.map(setting => ({
          ...setting,
          channels: { ...setting.channels, push: false },
        })))
      }
    } else {
      setMasterEmail(value)
      if (!value) {
        // Disable all email notifications
        setSettings(prev => prev.map(setting => ({
          ...setting,
          channels: { ...setting.channels, email: false },
        })))
      }
    }
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Notification preferences saved!')
      router.push('/profile')
    } catch (error) {
      toast.error('Failed to save preferences')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestNotification = async () => {
    try {
      // Mock sending test notification
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success('Test notification sent! Check your device.')
    } catch (error) {
      toast.error('Failed to send test notification')
    }
  }

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profile">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Notification Settings</h1>
          <p className="text-muted-foreground">Control when and how you receive notifications</p>
        </div>
      </div>

      {/* Master Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>Enable or disable notification channels globally</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                <Label htmlFor="master-push">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications on your device
                </p>
              </div>
            </div>
            <Switch
              id="master-push"
              checked={masterPush}
              onCheckedChange={(value) => handleMasterToggle('push', value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                <Label htmlFor="master-email">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
            </div>
            <Switch
              id="master-email"
              checked={masterEmail}
              onCheckedChange={(value) => handleMasterToggle('email', value)}
            />
          </div>

          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={handleTestNotification}>
              Send Test Notification
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Individual Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>Customize notifications for different events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {settings.map((setting) => {
              const Icon = setting.icon
              return (
                <div key={setting.id} className="space-y-4 pb-6 border-b last:border-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={setting.id}>{setting.name}</Label>
                          {!setting.enabled && (
                            <span className="text-xs text-muted-foreground">(Disabled)</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                    </div>
                    <Switch
                      id={setting.id}
                      checked={setting.enabled}
                      onCheckedChange={() => handleSettingToggle(setting.id, 'enabled')}
                    />
                  </div>
                  
                  {setting.enabled && (
                    <div className="ml-8 flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={setting.channels.push}
                          onChange={() => handleSettingToggle(setting.id, 'push')}
                          disabled={!masterPush}
                          className="rounded border-gray-300"
                        />
                        <span className={`text-sm ${!masterPush ? 'text-muted-foreground' : ''}`}>
                          Push
                        </span>
                      </label>
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={setting.channels.email}
                          onChange={() => handleSettingToggle(setting.id, 'email')}
                          disabled={!masterEmail}
                          className="rounded border-gray-300"
                        />
                        <span className={`text-sm ${!masterEmail ? 'text-muted-foreground' : ''}`}>
                          Email
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Quiet Hours</CardTitle>
          <CardDescription>Pause notifications during specific times</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="quiet-hours">Enable Quiet Hours</Label>
              <p className="text-sm text-muted-foreground">
                No notifications between 10 PM - 7 AM
              </p>
            </div>
            <Switch id="quiet-hours" />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            'Saving...'
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/profile">Cancel</Link>
        </Button>
      </div>
    </div>
  )
}