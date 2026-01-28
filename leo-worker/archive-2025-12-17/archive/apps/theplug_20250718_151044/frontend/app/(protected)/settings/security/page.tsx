'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { 
  ArrowLeft,
  Shield,
  Key,
  Smartphone,
  Monitor,
  Globe,
  AlertTriangle,
  CheckCircle,
  XCircle,
  LogOut,
  QrCode,
  Copy
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

// Mock active sessions data
const mockActiveSessions = [
  {
    id: 'session_1',
    device: 'Chrome on MacBook Pro',
    location: 'San Francisco, CA',
    ipAddress: '192.168.1.100',
    lastActive: '2024-01-18T12:30:00Z',
    current: true
  },
  {
    id: 'session_2',
    device: 'Safari on iPhone',
    location: 'San Francisco, CA',
    ipAddress: '192.168.1.101',
    lastActive: '2024-01-18T10:15:00Z',
    current: false
  },
  {
    id: 'session_3',
    device: 'Firefox on Windows',
    location: 'New York, NY',
    ipAddress: '74.125.224.72',
    lastActive: '2024-01-17T18:45:00Z',
    current: false
  }
]

// Mock login history
const mockLoginHistory = [
  {
    id: 'login_1',
    device: 'Chrome on MacBook Pro',
    location: 'San Francisco, CA',
    ipAddress: '192.168.1.100',
    timestamp: '2024-01-18T08:00:00Z',
    status: 'success'
  },
  {
    id: 'login_2',
    device: 'Unknown Device',
    location: 'Moscow, Russia',
    ipAddress: '185.220.101.45',
    timestamp: '2024-01-17T23:30:00Z',
    status: 'failed'
  },
  {
    id: 'login_3',
    device: 'Safari on iPhone',
    location: 'San Francisco, CA',
    ipAddress: '192.168.1.101',
    timestamp: '2024-01-17T14:20:00Z',
    status: 'success'
  }
]

export default function SecuritySettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setIsChangingPassword(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsChangingPassword(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    toast.success('Password changed successfully')
  }

  const handleEnable2FA = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }

    // Simulate enabling 2FA
    const codes = Array(8).fill(0).map(() => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    )
    setBackupCodes(codes)
    setTwoFactorEnabled(true)
    setShowQRCode(false)
    toast.success('Two-factor authentication enabled')
  }

  const handleDisable2FA = async () => {
    if (confirm('Are you sure you want to disable two-factor authentication?')) {
      setTwoFactorEnabled(false)
      setBackupCodes([])
      toast.success('Two-factor authentication disabled')
    }
  }

  const revokeSession = async (sessionId: string) => {
    if (confirm('Are you sure you want to end this session?')) {
      toast.success('Session ended successfully')
    }
  }

  const revokeAllSessions = async () => {
    if (confirm('This will log you out of all devices except this one. Continue?')) {
      toast.success('All other sessions ended')
    }
  }

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n')
    navigator.clipboard.writeText(codesText)
    toast.success('Backup codes copied to clipboard')
  }

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return null
    if (password.length < 8) return 'weak'
    if (password.length < 12 && /^[a-zA-Z0-9]+$/.test(password)) return 'medium'
    return 'strong'
  }

  const passwordStrength = getPasswordStrength(newPassword)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Security Settings</h1>
            <p className="text-muted-foreground">Manage your account security</p>
          </div>
        </div>

        {/* Security Overview */}
        <Alert className="mb-6">
          <Shield className="h-4 w-4" />
          <AlertTitle>Security Status</AlertTitle>
          <AlertDescription>
            Your account security is {twoFactorEnabled ? 'strong' : 'moderate'}. 
            {!twoFactorEnabled && ' Enable two-factor authentication for enhanced security.'}
          </AlertDescription>
        </Alert>

        {/* Password Change */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password regularly to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {passwordStrength && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        passwordStrength === 'weak' ? 'w-1/3 bg-red-500' :
                        passwordStrength === 'medium' ? 'w-2/3 bg-yellow-500' :
                        'w-full bg-green-500'
                      }`}
                    />
                  </div>
                  <span className={`text-sm ${
                    passwordStrength === 'weak' ? 'text-red-500' :
                    passwordStrength === 'medium' ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                    {passwordStrength}
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button 
              onClick={handlePasswordChange}
              disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
            >
              {isChangingPassword ? 'Changing Password...' : 'Change Password'}
            </Button>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!twoFactorEnabled ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Status: Disabled</p>
                    <p className="text-sm text-muted-foreground">
                      Protect your account with 2FA using an authenticator app
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button onClick={() => setShowQRCode(true)}>
                        <Smartphone className="h-4 w-4 mr-2" />
                        Enable 2FA
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
                        <DialogDescription>
                          Scan this QR code with your authenticator app
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="bg-white p-4 rounded-lg mx-auto w-fit">
                          <QrCode className="h-48 w-48 text-black" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="verificationCode">Verification Code</Label>
                          <Input
                            id="verificationCode"
                            placeholder="Enter 6-digit code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            maxLength={6}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleEnable2FA}>
                          Verify and Enable
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Status: Enabled</p>
                      <Badge className="bg-green-500">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your account is protected with two-factor authentication
                    </p>
                  </div>
                  <Button variant="destructive" onClick={handleDisable2FA}>
                    Disable 2FA
                  </Button>
                </div>
                
                {backupCodes.length > 0 && (
                  <Alert>
                    <Key className="h-4 w-4" />
                    <AlertTitle>Backup Codes</AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">Save these backup codes in a secure place:</p>
                      <div className="grid grid-cols-2 gap-2 mt-2 mb-3">
                        {backupCodes.map((code, index) => (
                          <code key={index} className="bg-muted px-2 py-1 rounded text-sm">
                            {code}
                          </code>
                        ))}
                      </div>
                      <Button size="sm" variant="outline" onClick={copyBackupCodes}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy All
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>
                  Manage devices where you're currently logged in
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={revokeAllSessions}>
                End All Other Sessions
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockActiveSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-start gap-4">
                    <Monitor className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-medium">
                        {session.device}
                        {session.current && (
                          <Badge variant="outline" className="ml-2">Current</Badge>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {session.location} • {session.ipAddress}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Last active: {new Date(session.lastActive).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revokeSession(session.id)}
                    >
                      <LogOut className="h-4 w-4" />
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
            <CardDescription>
              Review recent login attempts to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockLoginHistory.map((login) => (
                <div
                  key={login.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-start gap-4">
                    {login.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className="font-medium">{login.device}</p>
                      <p className="text-sm text-muted-foreground">
                        {login.location} • {login.ipAddress}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(login.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={login.status === 'success' ? 'default' : 'destructive'}>
                    {login.status}
                  </Badge>
                </div>
              ))}
            </div>
            {mockLoginHistory.some(login => login.status === 'failed') && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Suspicious Activity Detected</AlertTitle>
                <AlertDescription>
                  We noticed failed login attempts from unfamiliar locations. 
                  If this wasn't you, consider changing your password.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}