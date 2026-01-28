'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Moon, Sun, Bell, Volume2, Monitor, Smartphone } from 'lucide-react';

export default function PreferencesPage() {
  const router = useRouter();
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState({
    desktop: true,
    mobile: true,
    email: false,
    mentions: true,
    threads: true,
    dms: true,
  });
  const [sounds, setSounds] = useState({
    messages: true,
    mentions: true,
    calls: true,
  });
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('America/New_York');

  const handleSave = () => {
    // In a real app, would save preferences
    toast({
      title: 'Preferences saved',
      description: 'Your preferences have been updated successfully.',
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Preferences</h1>
            <p className="text-sm text-muted-foreground">
              Customize your Slack Clone experience
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how Slack Clone looks on your device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="theme" className="text-base">Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred color theme
                  </p>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Choose what you want to be notified about
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="desktop-notif" className="text-base">
                    <Monitor className="h-4 w-4 inline mr-2" />
                    Desktop notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show notifications on your desktop
                  </p>
                </div>
                <Switch
                  id="desktop-notif"
                  checked={notifications.desktop}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, desktop: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="mobile-notif" className="text-base">
                    <Smartphone className="h-4 w-4 inline mr-2" />
                    Mobile push notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications on your mobile device
                  </p>
                </div>
                <Switch
                  id="mobile-notif"
                  checked={notifications.mobile}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, mobile: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-sm font-medium">Notify me about...</p>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="mentions-notif">All new messages</Label>
                  <Switch
                    id="mentions-notif"
                    checked={notifications.mentions}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, mentions: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="threads-notif">Thread replies</Label>
                  <Switch
                    id="threads-notif"
                    checked={notifications.threads}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, threads: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="dms-notif">Direct messages</Label>
                  <Switch
                    id="dms-notif"
                    checked={notifications.dms}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, dms: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sounds */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Volume2 className="h-5 w-5 inline mr-2" />
                Sounds
              </CardTitle>
              <CardDescription>
                Choose when to play notification sounds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="message-sounds">Message sounds</Label>
                <Switch
                  id="message-sounds"
                  checked={sounds.messages}
                  onCheckedChange={(checked) => 
                    setSounds(prev => ({ ...prev, messages: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="mention-sounds">Mention sounds</Label>
                <Switch
                  id="mention-sounds"
                  checked={sounds.mentions}
                  onCheckedChange={(checked) => 
                    setSounds(prev => ({ ...prev, mentions: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="call-sounds">Call ringtone</Label>
                <Switch
                  id="call-sounds"
                  checked={sounds.calls}
                  onCheckedChange={(checked) => 
                    setSounds(prev => ({ ...prev, calls: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Language & Region */}
          <Card>
            <CardHeader>
              <CardTitle>Language & Region</CardTitle>
              <CardDescription>
                Set your language and timezone preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English (US)</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave}>Save Preferences</Button>
          </div>
        </div>
      </div>
    </div>
  );
}