"use client"

import { useState } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Bell, Mail, Clock } from "lucide-react"

interface NotificationSettings {
  push_enabled: boolean
  email_enabled: boolean
  notification_types: {
    task_assigned: boolean
    task_response: boolean
    task_completed: boolean
    achievement_earned: boolean
    family_invite: boolean
    daily_summary: boolean
  }
  email_frequency: "instant" | "daily" | "weekly"
  quiet_hours_enabled: boolean
  quiet_hours_start: string
  quiet_hours_end: string
  daily_summary_time: string
}

export default function NotificationSettingsPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings>({
    push_enabled: true,
    email_enabled: true,
    notification_types: {
      task_assigned: true,
      task_response: true,
      task_completed: true,
      achievement_earned: true,
      family_invite: true,
      daily_summary: false
    },
    email_frequency: "instant",
    quiet_hours_enabled: false,
    quiet_hours_start: "22:00",
    quiet_hours_end: "08:00",
    daily_summary_time: "09:00"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)
      // In real app, this would call the API
      // await apiClient.updateNotificationSettings(settings)
      
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated."
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateNotificationType = (type: keyof NotificationSettings["notification_types"], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notification_types: {
        ...prev.notification_types,
        [type]: value
      }
    }))
  }

  const notificationTypes = [
    {
      key: "task_assigned" as const,
      label: "New task assigned",
      description: "When someone assigns you a task"
    },
    {
      key: "task_response" as const,
      label: "Task responses",
      description: "When someone responds to your task"
    },
    {
      key: "task_completed" as const,
      label: "Task completed",
      description: "When a family member completes a task"
    },
    {
      key: "achievement_earned" as const,
      label: "Achievements",
      description: "When you earn a new achievement"
    },
    {
      key: "family_invite" as const,
      label: "Family invites",
      description: "When someone joins your family"
    },
    {
      key: "daily_summary" as const,
      label: "Daily summary",
      description: "Daily recap of family activity"
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notification Settings</h1>
        <p className="text-muted-foreground">
          Choose how and when you want to be notified
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Push Notifications
            </CardTitle>
            <CardDescription>
              Receive notifications on your device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-enabled" className="flex-1">
                Enable push notifications
              </Label>
              <Switch
                id="push-enabled"
                checked={settings.push_enabled}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, push_enabled: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications
            </CardTitle>
            <CardDescription>
              Receive notifications via email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-enabled" className="flex-1">
                Enable email notifications
              </Label>
              <Switch
                id="email-enabled"
                checked={settings.email_enabled}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, email_enabled: checked }))
                }
              />
            </div>
            
            {settings.email_enabled && (
              <div className="space-y-2">
                <Label htmlFor="email-frequency">Email frequency</Label>
                <Select
                  value={settings.email_frequency}
                  onValueChange={(value: NotificationSettings["email_frequency"]) => 
                    setSettings(prev => ({ ...prev, email_frequency: value }))
                  }
                >
                  <SelectTrigger id="email-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Instant</SelectItem>
                    <SelectItem value="daily">Daily digest</SelectItem>
                    <SelectItem value="weekly">Weekly summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
            <CardDescription>
              Choose which events you want to be notified about
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notificationTypes.map((type) => (
                <div key={type.key} className="flex items-start space-x-3">
                  <Switch
                    id={type.key}
                    checked={settings.notification_types[type.key]}
                    onCheckedChange={(checked) => updateNotificationType(type.key, checked)}
                    disabled={!settings.push_enabled && !settings.email_enabled}
                  />
                  <div className="flex-1">
                    <Label htmlFor={type.key} className="font-medium cursor-pointer">
                      {type.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                </div>
              ))}
              
              {settings.notification_types.daily_summary && (
                <div className="ml-9 space-y-2">
                  <Label htmlFor="summary-time">Daily summary time</Label>
                  <Input
                    id="summary-time"
                    type="time"
                    value={settings.daily_summary_time}
                    onChange={(e) => 
                      setSettings(prev => ({ ...prev, daily_summary_time: e.target.value }))
                    }
                    className="w-32"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Quiet Hours
            </CardTitle>
            <CardDescription>
              Pause notifications during specific hours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="quiet-hours" className="flex-1">
                Enable quiet hours
              </Label>
              <Switch
                id="quiet-hours"
                checked={settings.quiet_hours_enabled}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, quiet_hours_enabled: checked }))
                }
              />
            </div>
            
            {settings.quiet_hours_enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiet-start">Start time</Label>
                  <Input
                    id="quiet-start"
                    type="time"
                    value={settings.quiet_hours_start}
                    onChange={(e) => 
                      setSettings(prev => ({ ...prev, quiet_hours_start: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiet-end">End time</Label>
                  <Input
                    id="quiet-end"
                    type="time"
                    value={settings.quiet_hours_end}
                    onChange={(e) => 
                      setSettings(prev => ({ ...prev, quiet_hours_end: e.target.value }))
                    }
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSettings({
                push_enabled: true,
                email_enabled: true,
                notification_types: {
                  task_assigned: true,
                  task_response: true,
                  task_completed: true,
                  achievement_earned: true,
                  family_invite: true,
                  daily_summary: false
                },
                email_frequency: "instant",
                quiet_hours_enabled: false,
                quiet_hours_start: "22:00",
                quiet_hours_end: "08:00",
                daily_summary_time: "09:00"
              })
            }}
          >
            Reset to Defaults
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  )
}