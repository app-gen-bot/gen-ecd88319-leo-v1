'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import {
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  CalendarIcon,
  ClockIcon,
  ComputerDesktopIcon,
  SunIcon,
  MoonIcon,
  LanguageIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';

export default function PreferencesPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [preferences, setPreferences] = useState({
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    appointmentReminders: true,
    taskNotifications: true,
    inventoryAlerts: true,
    reportNotifications: false,
    
    // Display
    theme: 'system',
    sidebarCollapsed: false,
    compactMode: false,
    showPatientPhotos: true,
    
    // Calendar
    defaultView: 'week',
    workingHoursStart: '08:00',
    workingHoursEnd: '18:00',
    appointmentDuration: '30',
    
    // Language & Region
    language: 'en',
    timezone: 'America/Los_Angeles',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
  });

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Preferences saved',
        description: 'Your preferences have been updated successfully.',
      });
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Preferences</h1>
        <p className="text-muted-foreground">Customize your PawsFlow experience</p>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notification Channels */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Notification Channels</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="email-notifications" className="text-sm font-medium">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, emailNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DevicePhoneMobileIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="sms-notifications" className="text-sm font-medium">
                      SMS Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive text message alerts
                    </p>
                  </div>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={preferences.smsNotifications}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, smsNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BellIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="push-notifications" className="text-sm font-medium">
                      Push Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Browser and mobile app notifications
                    </p>
                  </div>
                </div>
                <Switch
                  id="push-notifications"
                  checked={preferences.pushNotifications}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, pushNotifications: checked })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Notification Types */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Notification Types</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="appointment-reminders" className="text-sm font-normal">
                  Appointment Reminders
                </Label>
                <Switch
                  id="appointment-reminders"
                  checked={preferences.appointmentReminders}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, appointmentReminders: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="task-notifications" className="text-sm font-normal">
                  Task Assignments
                </Label>
                <Switch
                  id="task-notifications"
                  checked={preferences.taskNotifications}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, taskNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="inventory-alerts" className="text-sm font-normal">
                  Inventory Alerts
                </Label>
                <Switch
                  id="inventory-alerts"
                  checked={preferences.inventoryAlerts}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, inventoryAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="report-notifications" className="text-sm font-normal">
                  Report Summaries
                </Label>
                <Switch
                  id="report-notifications"
                  checked={preferences.reportNotifications}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, reportNotifications: checked })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Display</CardTitle>
          <CardDescription>Customize the appearance of your workspace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="theme">Theme</Label>
              <RadioGroup
                id="theme"
                value={preferences.theme}
                onValueChange={(value) => setPreferences({ ...preferences, theme: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className="flex items-center gap-2 font-normal">
                    <SunIcon className="h-4 w-4" />
                    Light
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className="flex items-center gap-2 font-normal">
                    <MoonIcon className="h-4 w-4" />
                    Dark
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system" className="flex items-center gap-2 font-normal">
                    <ComputerDesktopIcon className="h-4 w-4" />
                    System
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compact-mode" className="text-sm font-medium">
                    Compact Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce spacing between elements
                  </p>
                </div>
                <Switch
                  id="compact-mode"
                  checked={preferences.compactMode}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, compactMode: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-photos" className="text-sm font-medium">
                    Show Patient Photos
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Display pet photos in lists and cards
                  </p>
                </div>
                <Switch
                  id="show-photos"
                  checked={preferences.showPatientPhotos}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, showPatientPhotos: checked })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
          <CardDescription>Set your default calendar preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default-view">Default View</Label>
              <Select
                value={preferences.defaultView}
                onValueChange={(value) => setPreferences({ ...preferences, defaultView: value })}
              >
                <SelectTrigger id="default-view">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day View</SelectItem>
                  <SelectItem value="week">Week View</SelectItem>
                  <SelectItem value="month">Month View</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointment-duration">Default Appointment Duration</Label>
              <Select
                value={preferences.appointmentDuration}
                onValueChange={(value) => setPreferences({ ...preferences, appointmentDuration: value })}
              >
                <SelectTrigger id="appointment-duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="working-hours-start">Working Hours Start</Label>
              <Select
                value={preferences.workingHoursStart}
                onValueChange={(value) => setPreferences({ ...preferences, workingHoursStart: value })}
              >
                <SelectTrigger id="working-hours-start">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return (
                      <SelectItem key={hour} value={`${hour}:00`}>
                        {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="working-hours-end">Working Hours End</Label>
              <Select
                value={preferences.workingHoursEnd}
                onValueChange={(value) => setPreferences({ ...preferences, workingHoursEnd: value })}
              >
                <SelectTrigger id="working-hours-end">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return (
                      <SelectItem key={hour} value={`${hour}:00`}>
                        {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language & Region */}
      <Card>
        <CardHeader>
          <CardTitle>Language & Region</CardTitle>
          <CardDescription>Set your language and regional preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={preferences.language}
                onValueChange={(value) => setPreferences({ ...preferences, language: value })}
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={preferences.timezone}
                onValueChange={(value) => setPreferences({ ...preferences, timezone: value })}
              >
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-format">Date Format</Label>
              <Select
                value={preferences.dateFormat}
                onValueChange={(value) => setPreferences({ ...preferences, dateFormat: value })}
              >
                <SelectTrigger id="date-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time-format">Time Format</Label>
              <Select
                value={preferences.timeFormat}
                onValueChange={(value) => setPreferences({ ...preferences, timeFormat: value })}
              >
                <SelectTrigger id="time-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                  <SelectItem value="24h">24-hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}