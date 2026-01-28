'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { AuthCheck } from '@/components/auth-check';
import { DashboardNav } from '@/components/dashboard-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, Key, Smartphone, Bell, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function SecuritySettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: true,
    marketing: false,
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Password Updated',
        description: 'Your password has been changed successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinReset = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'PIN Reset',
        description: 'A PIN reset link has been sent to your email.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset PIN. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const trustedDevices = [
    { id: 1, name: 'iPhone 14 Pro', lastUsed: '2 hours ago', current: true },
    { id: 2, name: 'MacBook Pro', lastUsed: '1 day ago', current: false },
    { id: 3, name: 'iPad Air', lastUsed: '1 week ago', current: false },
  ];

  return (
    <AuthCheck>
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => router.push('/profile')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Security Settings</h1>
            <p className="text-muted-foreground">Manage your security preferences and authentication</p>
          </div>

          <Tabs defaultValue="password" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="authentication">Authentication</TabsTrigger>
              <TabsTrigger value="devices">Devices</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="password" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password regularly to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        placeholder="Enter current password"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Enter new password"
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        Must be at least 8 characters with 1 uppercase, 1 number, and 1 special character
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm new password"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card id="reset-pin">
                <CardHeader>
                  <CardTitle>Transaction PIN</CardTitle>
                  <CardDescription>
                    Reset your 6-digit PIN used for transaction authorization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handlePinReset} variant="outline" disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Reset PIN'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="authentication" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">SMS Authentication</div>
                      <div className="text-sm text-muted-foreground">
                        Receive codes via SMS to your registered phone
                      </div>
                    </div>
                    <Switch
                      checked={twoFactorEnabled}
                      onCheckedChange={setTwoFactorEnabled}
                    />
                  </div>
                  {twoFactorEnabled && (
                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm">
                        2FA is enabled. You'll receive a code at {user?.phone || '+1 *** *** 4567'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Biometric Authentication</CardTitle>
                  <CardDescription>
                    Use fingerprint or face recognition for quick access
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">Enable Biometric Login</div>
                      <div className="text-sm text-muted-foreground">
                        Sign in using your device's biometric authentication
                      </div>
                    </div>
                    <Switch
                      checked={biometricEnabled}
                      onCheckedChange={setBiometricEnabled}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="devices" id="devices" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Trusted Devices</CardTitle>
                  <CardDescription>
                    Manage devices that have access to your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trustedDevices.map((device) => (
                      <div
                        key={device.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center space-x-4">
                          <Smartphone className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              {device.name}
                              {device.current && (
                                <Badge variant="secondary" className="text-xs">
                                  Current
                                </Badge>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Last used: {device.lastUsed}
                            </p>
                          </div>
                        </div>
                        {!device.current && (
                          <Button variant="ghost" size="sm" className="text-destructive">
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">
                      <AlertCircle className="inline h-4 w-4 mr-1" />
                      Removing a device will require re-authentication on that device
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" id="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">Email Notifications</div>
                        <div className="text-sm text-muted-foreground">
                          Receive transaction updates via email
                        </div>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={(checked) => 
                          setNotifications(prev => ({ ...prev, email: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">SMS Notifications</div>
                        <div className="text-sm text-muted-foreground">
                          Get important alerts via text message
                        </div>
                      </div>
                      <Switch
                        checked={notifications.sms}
                        onCheckedChange={(checked) => 
                          setNotifications(prev => ({ ...prev, sms: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">Push Notifications</div>
                        <div className="text-sm text-muted-foreground">
                          Real-time updates on your device
                        </div>
                      </div>
                      <Switch
                        checked={notifications.push}
                        onCheckedChange={(checked) => 
                          setNotifications(prev => ({ ...prev, push: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">Marketing Communications</div>
                        <div className="text-sm text-muted-foreground">
                          Receive updates about new features and promotions
                        </div>
                      </div>
                      <Switch
                        checked={notifications.marketing}
                        onCheckedChange={(checked) => 
                          setNotifications(prev => ({ ...prev, marketing: checked }))
                        }
                      />
                    </div>
                  </div>
                  <Button 
                    className="mt-4" 
                    onClick={() => toast({
                      title: 'Preferences Saved',
                      description: 'Your notification preferences have been updated.',
                    })}
                  >
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthCheck>
  );
}