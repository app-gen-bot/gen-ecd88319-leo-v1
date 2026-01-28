'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth-context';
import {
  Mail,
  MessageSquare,
  Shield,
  Smartphone,
  Moon,
  Sun,
  Globe,
  Volume2,
  Download,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  Key,
  HelpCircle
} from 'lucide-react';

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  documentReminders: boolean;
  legalDeadlines: boolean;
  rentReminders: boolean;
  securityAlerts: boolean;
  marketingEmails: boolean;
}

interface PrivacySettings {
  profileVisibility: 'private' | 'landlord' | 'public';
  shareDataForImprovements: boolean;
  allowAnalytics: boolean;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  language: string;
  soundEffects: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { logout } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    documentReminders: true,
    legalDeadlines: true,
    rentReminders: true,
    securityAlerts: true,
    marketingEmails: false
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'private',
    shareDataForImprovements: true,
    allowAnalytics: true
  });

  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: 'dark',
    fontSize: 'medium',
    language: 'en',
    soundEffects: true
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Notification preferences saved',
        description: 'Your notification settings have been updated.',
      });
    } catch {
      toast({
        title: 'Failed to save preferences',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please ensure both passwords are the same',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: 'Password changed',
        description: 'Your password has been updated successfully.',
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      toast({
        title: 'Failed to change password',
        description: 'Please check your current password and try again',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate download
      const data = {
        exportDate: new Date().toISOString(),
        accountData: 'Your account data would be here...'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tenant-data-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      toast({
        title: 'Data exported successfully',
        description: 'Your data has been downloaded to your device.',
      });
    } catch {
      toast({
        title: 'Export failed',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: 'Account deletion requested',
        description: 'You will receive an email to confirm this action.',
      });
      setShowDeleteConfirm(false);
    } catch {
      toast({
        title: 'Deletion failed',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account preferences and privacy settings
          </p>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified about important updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications" className="text-base">
                        <Mail className="h-4 w-4 inline mr-2" />
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates via email
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, emailNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sms-notifications" className="text-base">
                        <MessageSquare className="h-4 w-4 inline mr-2" />
                        SMS Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Get text messages for urgent updates
                      </p>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={notifications.smsNotifications}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, smsNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications" className="text-base">
                        <Smartphone className="h-4 w-4 inline mr-2" />
                        Push Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Mobile app notifications
                      </p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, pushNotifications: checked })
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Notification Types</h3>
                  
                  <div className="space-y-3">
                    {[
                      { key: 'documentReminders', label: 'Document Reminders', description: 'Reminders to upload or review documents' },
                      { key: 'legalDeadlines', label: 'Legal Deadlines', description: 'Important dates and deadline alerts' },
                      { key: 'rentReminders', label: 'Rent Reminders', description: 'Monthly rent payment reminders' },
                      { key: 'securityAlerts', label: 'Security Alerts', description: 'Account security and login notifications' },
                      { key: 'marketingEmails', label: 'Marketing Emails', description: 'Tips, updates, and promotional content' }
                    ].map(({ key, label, description }) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm">{label}</Label>
                          <p className="text-sm text-muted-foreground">{description}</p>
                        </div>
                        <Switch
                          checked={notifications[key as keyof NotificationSettings] as boolean}
                          onCheckedChange={(checked) => 
                            setNotifications({ ...notifications, [key]: checked })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handleSaveNotifications} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Preferences'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>

                <Button onClick={handleChangePassword} disabled={isLoading}>
                  {isLoading ? 'Changing...' : 'Change Password'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Enhanced Security</AlertTitle>
                  <AlertDescription>
                    Two-factor authentication helps protect your account from unauthorized access.
                  </AlertDescription>
                </Alert>
                <Button variant="outline">
                  <Key className="h-4 w-4 mr-2" />
                  Enable Two-Factor Authentication
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control your data and privacy preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Profile Visibility</Label>
                  <RadioGroup value={privacy.profileVisibility} onValueChange={(value) => 
                    setPrivacy({ ...privacy, profileVisibility: value as PrivacySettings['profileVisibility'] })
                  }>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="private" />
                      <Label htmlFor="private">Private (Only you can see)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="landlord" id="landlord" />
                      <Label htmlFor="landlord">Visible to Landlord</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="public" />
                      <Label htmlFor="public">Public</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Share Data for Improvements</Label>
                      <p className="text-sm text-muted-foreground">
                        Help us improve our AI by sharing anonymized data
                      </p>
                    </div>
                    <Switch
                      checked={privacy.shareDataForImprovements}
                      onCheckedChange={(checked) => 
                        setPrivacy({ ...privacy, shareDataForImprovements: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow us to collect usage analytics
                      </p>
                    </div>
                    <Switch
                      checked={privacy.allowAnalytics}
                      onCheckedChange={(checked) => 
                        setPrivacy({ ...privacy, allowAnalytics: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Export or delete your account data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Export Your Data</p>
                    <p className="text-sm text-muted-foreground">
                      Download all your data in JSON format
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleExportData} disabled={isLoading}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-destructive">Delete Account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>

            {showDeleteConfirm && (
              <Alert className="border-destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Are you sure?</AlertTitle>
                <AlertDescription>
                  This action cannot be undone. All your data will be permanently deleted.
                  <div className="mt-4 space-x-2">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleDeleteAccount}
                      disabled={isLoading}
                    >
                      Yes, delete my account
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize how the app looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Theme</Label>
                  <RadioGroup value={appearance.theme} onValueChange={(value) => 
                    setAppearance({ ...appearance, theme: value as AppearanceSettings['theme'] })
                  }>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="light" />
                      <Label htmlFor="light" className="flex items-center">
                        <Sun className="h-4 w-4 mr-2" />
                        Light
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="dark" />
                      <Label htmlFor="dark" className="flex items-center">
                        <Moon className="h-4 w-4 mr-2" />
                        Dark
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="system" id="system" />
                      <Label htmlFor="system">System Default</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label>Font Size</Label>
                  <RadioGroup value={appearance.fontSize} onValueChange={(value) => 
                    setAppearance({ ...appearance, fontSize: value as AppearanceSettings['fontSize'] })
                  }>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="small" id="small" />
                      <Label htmlFor="small">Small</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium">Medium (Default)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="large" id="large" />
                      <Label htmlFor="large">Large</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">
                      <Volume2 className="h-4 w-4 inline mr-2" />
                      Sound Effects
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Play sounds for notifications and actions
                    </p>
                  </div>
                  <Switch
                    checked={appearance.soundEffects}
                    onCheckedChange={(checked) => 
                      setAppearance({ ...appearance, soundEffects: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">
                    <Globe className="h-4 w-4 inline mr-2" />
                    Language
                  </Label>
                  <select
                    id="language"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={appearance.language}
                    onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="zh">中文</option>
                    <option value="vi">Tiếng Việt</option>
                    <option value="ko">한국어</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Help Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <HelpCircle className="h-6 w-6 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium mb-1">Need Help?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Check our help center for answers to common questions or contact support.
                </p>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => router.push('/help')}>
                    Visit Help Center
                  </Button>
                  <Button variant="outline" size="sm">
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}