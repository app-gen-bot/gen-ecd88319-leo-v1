'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Bell,
  Mail,
  Smartphone,
  Volume2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Calendar,
  Save
} from 'lucide-react'
import { toast } from 'sonner'

// Notification categories
const notificationCategories = [
  {
    id: 'registrations',
    title: 'Registration Updates',
    description: 'Notifications about your music registrations',
    icon: CheckCircle,
    notifications: [
      {
        id: 'registration_completed',
        label: 'Registration completed',
        description: 'When a registration is successfully completed',
        email: true,
        push: true,
        inApp: true
      },
      {
        id: 'registration_failed',
        label: 'Registration failed',
        description: 'When a registration fails and needs attention',
        email: true,
        push: true,
        inApp: true
      },
      {
        id: 'registration_pending',
        label: 'Registration pending review',
        description: 'When a registration requires manual review',
        email: true,
        push: false,
        inApp: true
      }
    ]
  },
  {
    id: 'platforms',
    title: 'Platform Updates',
    description: 'Updates about platform connections and status',
    icon: AlertCircle,
    notifications: [
      {
        id: 'platform_connected',
        label: 'Platform connected',
        description: 'When a new platform is successfully connected',
        email: true,
        push: false,
        inApp: true
      },
      {
        id: 'platform_disconnected',
        label: 'Platform disconnected',
        description: 'When a platform connection is lost',
        email: true,
        push: true,
        inApp: true
      },
      {
        id: 'platform_credentials_expiring',
        label: 'Credentials expiring',
        description: 'When platform credentials are about to expire',
        email: true,
        push: true,
        inApp: true
      }
    ]
  },
  {
    id: 'revenue',
    title: 'Revenue & Analytics',
    description: 'Updates about earnings and analytics',
    icon: Calendar,
    notifications: [
      {
        id: 'monthly_revenue_report',
        label: 'Monthly revenue report',
        description: 'Monthly summary of your earnings',
        email: true,
        push: false,
        inApp: true
      },
      {
        id: 'payment_received',
        label: 'Payment received',
        description: 'When you receive a payment from a platform',
        email: true,
        push: true,
        inApp: true
      },
      {
        id: 'revenue_milestone',
        label: 'Revenue milestone',
        description: 'When you reach a revenue milestone',
        email: true,
        push: true,
        inApp: true
      }
    ]
  },
  {
    id: 'account',
    title: 'Account & Security',
    description: 'Important account and security notifications',
    icon: Bell,
    notifications: [
      {
        id: 'new_login',
        label: 'New login detected',
        description: 'When your account is accessed from a new device',
        email: true,
        push: true,
        inApp: true
      },
      {
        id: 'password_changed',
        label: 'Password changed',
        description: 'Confirmation when your password is changed',
        email: true,
        push: true,
        inApp: true
      },
      {
        id: 'subscription_renewal',
        label: 'Subscription renewal',
        description: 'Reminders about subscription renewals',
        email: true,
        push: false,
        inApp: true
      }
    ]
  }
]

export default function NotificationSettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState<Record<string, Record<string, boolean>>>({})
  const [emailFrequency, setEmailFrequency] = useState('immediate')
  const [quietHours, setQuietHours] = useState(false)
  const [quietHoursStart, setQuietHoursStart] = useState('22:00')
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00')

  // Initialize notification settings
  useState(() => {
    const initialSettings: Record<string, Record<string, boolean>> = {}
    notificationCategories.forEach(category => {
      category.notifications.forEach(notification => {
        initialSettings[notification.id] = {
          email: notification.email,
          push: notification.push,
          inApp: notification.inApp
        }
      })
    })
    setNotificationSettings(initialSettings)
  })

  const handleToggle = (notificationId: string, channel: 'email' | 'push' | 'inApp') => {
    setNotificationSettings(prev => ({
      ...prev,
      [notificationId]: {
        ...prev[notificationId],
        [channel]: !prev[notificationId]?.[channel]
      }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSaving(false)
    toast.success('Notification preferences saved')
  }

  const enableAll = (channel: 'email' | 'push' | 'inApp') => {
    const newSettings = { ...notificationSettings }
    Object.keys(newSettings).forEach(key => {
      newSettings[key][channel] = true
    })
    setNotificationSettings(newSettings)
  }

  const disableAll = (channel: 'email' | 'push' | 'inApp') => {
    const newSettings = { ...notificationSettings }
    Object.keys(newSettings).forEach(key => {
      newSettings[key][channel] = false
    })
    setNotificationSettings(newSettings)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Notification Preferences</h1>
              <p className="text-muted-foreground">Choose how you want to be notified</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Notification Channels */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notification Channels</CardTitle>
            <CardDescription>
              Enable or disable all notifications for each channel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Email</span>
                </div>
                <div className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => enableAll('email')}>
                    Enable All
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => disableAll('email')}>
                    Disable All
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Push Notifications</span>
                </div>
                <div className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => enableAll('push')}>
                    Enable All
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => disableAll('push')}>
                    Disable All
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">In-App</span>
                </div>
                <div className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => enableAll('inApp')}>
                    Enable All
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => disableAll('inApp')}>
                    Disable All
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Categories */}
        <div className="space-y-6">
          {notificationCategories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <category.icon className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {category.notifications.map((notification) => (
                    <div key={notification.id} className="space-y-3">
                      <div>
                        <p className="font-medium">{notification.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {notification.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`${notification.id}-email`}
                            checked={notificationSettings[notification.id]?.email || false}
                            onCheckedChange={() => handleToggle(notification.id, 'email')}
                          />
                          <Label
                            htmlFor={`${notification.id}-email`}
                            className="text-sm cursor-pointer"
                          >
                            Email
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`${notification.id}-push`}
                            checked={notificationSettings[notification.id]?.push || false}
                            onCheckedChange={() => handleToggle(notification.id, 'push')}
                          />
                          <Label
                            htmlFor={`${notification.id}-push`}
                            className="text-sm cursor-pointer"
                          >
                            Push
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`${notification.id}-inApp`}
                            checked={notificationSettings[notification.id]?.inApp || false}
                            onCheckedChange={() => handleToggle(notification.id, 'inApp')}
                          />
                          <Label
                            htmlFor={`${notification.id}-inApp`}
                            className="text-sm cursor-pointer"
                          >
                            In-App
                          </Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Email Preferences */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Email Preferences</CardTitle>
            <CardDescription>
              Control how often you receive email notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={emailFrequency} onValueChange={setEmailFrequency}>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="immediate" id="immediate" />
                  <Label htmlFor="immediate" className="cursor-pointer">
                    <div>
                      <p className="font-medium">Immediate</p>
                      <p className="text-sm text-muted-foreground">
                        Get emails as soon as events happen
                      </p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="daily" id="daily" />
                  <Label htmlFor="daily" className="cursor-pointer">
                    <div>
                      <p className="font-medium">Daily Digest</p>
                      <p className="text-sm text-muted-foreground">
                        Get a summary of all notifications once a day
                      </p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly" className="cursor-pointer">
                    <div>
                      <p className="font-medium">Weekly Digest</p>
                      <p className="text-sm text-muted-foreground">
                        Get a summary of all notifications once a week
                      </p>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quiet Hours</CardTitle>
            <CardDescription>
              Pause push notifications during specific hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Enable Quiet Hours</p>
                  <p className="text-sm text-muted-foreground">
                    No push notifications between {quietHoursStart} and {quietHoursEnd}
                  </p>
                </div>
                <Switch
                  checked={quietHours}
                  onCheckedChange={setQuietHours}
                />
              </div>
              {quietHours && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quietStart">Start Time</Label>
                    <input
                      type="time"
                      id="quietStart"
                      value={quietHoursStart}
                      onChange={(e) => setQuietHoursStart(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quietEnd">End Time</Label>
                    <input
                      type="time"
                      id="quietEnd"
                      value={quietHoursEnd}
                      onChange={(e) => setQuietHoursEnd(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}