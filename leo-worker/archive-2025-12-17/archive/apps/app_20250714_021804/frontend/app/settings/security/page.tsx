'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '@/contexts/auth-context'
import { ChevronLeft, Lock, Shield, Smartphone, History, AlertCircle, Check, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

// Mock security data
const mockSecurityData = {
  passwordLastChanged: '2024-10-15',
  twoFactorEnabled: false,
  activeSessions: [
    { id: '1', device: 'Chrome on MacOS', location: 'San Francisco, CA', lastActive: '2 minutes ago', current: true },
    { id: '2', device: 'Safari on iPhone', location: 'San Francisco, CA', lastActive: '1 hour ago', current: false },
    { id: '3', device: 'Chrome on Windows', location: 'New York, NY', lastActive: '3 days ago', current: false },
  ],
  loginHistory: [
    { id: '1', date: '2024-12-12', time: '2:30 PM', device: 'Chrome on MacOS', location: 'San Francisco, CA', success: true },
    { id: '2', date: '2024-12-11', time: '9:15 AM', device: 'Safari on iPhone', location: 'San Francisco, CA', success: true },
    { id: '3', date: '2024-12-10', time: '7:45 PM', device: 'Unknown', location: 'Los Angeles, CA', success: false },
  ],
}

export default function SecuritySettingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (!user) {
      router.push('/signin')
    }
  }, [user, router])

  if (!user) return null

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Password changed successfully!')
      setShowPasswordDialog(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error('Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnable2FA = async () => {
    toast.info('Two-factor authentication setup coming soon!')
  }

  const handleRevokeSession = async (sessionId: string) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Session revoked successfully')
    } catch (error) {
      toast.error('Failed to revoke session')
    }
  }

  const daysSincePasswordChange = Math.floor(
    (new Date().getTime() - new Date(mockSecurityData.passwordLastChanged).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Security Settings</h1>
          <p className="text-muted-foreground">Keep your account secure</p>
        </div>
      </div>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Manage your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">
                  Last changed {daysSincePasswordChange} days ago
                </p>
              </div>
            </div>
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">Change Password</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and choose a new one
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handlePasswordChange} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {daysSincePasswordChange > 90 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                It&apos;s been over 90 days since you last changed your password. Consider updating it for better security.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">2FA Status</p>
                <p className="text-sm text-muted-foreground">
                  {mockSecurityData.twoFactorEnabled ? 'Enabled' : 'Not enabled'}
                </p>
              </div>
            </div>
            {mockSecurityData.twoFactorEnabled ? (
              <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                <Check className="mr-1 h-3 w-3" />
                Enabled
              </Badge>
            ) : (
              <Button variant="outline" onClick={handleEnable2FA}>
                Enable 2FA
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Devices currently signed in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockSecurityData.activeSessions.map((session) => (
              <div key={session.id} className="flex items-start justify-between p-3 rounded-lg border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{session.device}</p>
                    {session.current && (
                      <Badge variant="secondary" className="text-xs">Current</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {session.location} • {session.lastActive}
                  </p>
                </div>
                {!session.current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Login Activity</CardTitle>
          <CardDescription>Recent login attempts to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockSecurityData.loginHistory.map((login) => (
              <div key={login.id} className="flex items-start justify-between p-3 rounded-lg border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {login.date} at {login.time}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {login.device} • {login.location}
                  </p>
                </div>
                <Badge
                  variant={login.success ? 'secondary' : 'destructive'}
                  className={login.success ? 'bg-green-500/10 text-green-700 dark:text-green-400' : ''}
                >
                  {login.success ? (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      Success
                    </>
                  ) : (
                    <>
                      <X className="mr-1 h-3 w-3" />
                      Failed
                    </>
                  )}
                </Badge>
              </div>
            ))}
          </div>
          
          {mockSecurityData.loginHistory.some(login => !login.success) && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                We detected failed login attempts. If this wasn&apos;t you, consider changing your password.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}