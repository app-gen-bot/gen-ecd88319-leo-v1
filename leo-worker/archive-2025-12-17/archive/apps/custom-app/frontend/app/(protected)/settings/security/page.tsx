"use client"

import { useState } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Shield, Key, Smartphone, Monitor, AlertTriangle, Download, Trash2 } from "lucide-react"
import { VALIDATION } from "@/lib/constants"

interface Session {
  id: string
  device: string
  browser: string
  location: string
  last_active: string
  current: boolean
}

export default function SecuritySettingsPage() {
  const { user, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  })
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  
  // Mock sessions data
  const [sessions] = useState<Session[]>([
    {
      id: "1",
      device: "MacBook Pro",
      browser: "Chrome",
      location: "San Francisco, CA",
      last_active: new Date().toISOString(),
      current: true
    },
    {
      id: "2",
      device: "iPhone 14",
      browser: "Safari",
      location: "San Francisco, CA",
      last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      current: false
    }
  ])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your new passwords match.",
        variant: "destructive"
      })
      return
    }
    
    if (passwordData.new_password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      toast({
        title: "Password too short",
        description: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters.`,
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsLoading(true)
      // In real app, this would call the API
      // await apiClient.updatePassword(passwordData.current_password, passwordData.new_password)
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully."
      })
      
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: ""
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOutOtherSessions = async () => {
    try {
      setIsLoading(true)
      // In real app, this would call the API
      
      toast({
        title: "Sessions signed out",
        description: "All other sessions have been terminated."
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out sessions",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      setIsLoading(true)
      // In real app, this would call the API
      
      toast({
        title: "Data export requested",
        description: "You'll receive an email with your data within 24 hours."
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to request data export",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast({
        title: "Invalid confirmation",
        description: "Please type DELETE to confirm account deletion.",
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsLoading(true)
      // In real app, this would call the API
      
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted."
      })
      
      // Log out and redirect
      logout()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getDeviceIcon = (device: string) => {
    if (device.includes("Phone")) return <Smartphone className="h-4 w-4" />
    return <Monitor className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Security Settings</h1>
        <p className="text-muted-foreground">
          Manage your account security and privacy
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password">Current Password</Label>
              <Input
                id="current_password"
                type="password"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                required
                minLength={VALIDATION.PASSWORD_MIN_LENGTH}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least {VALIDATION.PASSWORD_MIN_LENGTH} characters
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm New Password</Label>
              <Input
                id="confirm_password"
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                required
              />
            </div>
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">
                {twoFactorEnabled 
                  ? "Your account is protected with 2FA"
                  : "Secure your account with an authenticator app"
                }
              </p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>
          
          {!twoFactorEnabled && (
            <div className="mt-4 p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">
                When you enable 2FA, you'll need to enter a code from your authenticator app 
                in addition to your password when signing in.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Devices where you're currently signed in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between py-3 border-b last:border-0">
              <div className="flex items-start gap-3">
                {getDeviceIcon(session.device)}
                <div>
                  <p className="font-medium text-sm">
                    {session.device}
                    {session.current && (
                      <Badge variant="secondary" className="ml-2">Current</Badge>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {session.browser} • {session.location}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last active: {new Date(session.last_active).toLocaleString()}
                  </p>
                </div>
              </div>
              {!session.current && (
                <Button variant="outline" size="sm">
                  Sign Out
                </Button>
              )}
            </div>
          ))}
          
          <Button
            variant="outline"
            onClick={handleSignOutOtherSessions}
            disabled={isLoading}
          >
            Sign Out Other Sessions
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>
            Export your data or delete your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Export My Data</p>
              <p className="text-sm text-muted-foreground">
                Download all your LoveyTasks data
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleExportData}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="font-medium text-destructive">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Delete Account
                  </DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm">
                    To confirm deletion, please type <strong>DELETE</strong> below:
                  </p>
                  <Input
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Type DELETE to confirm"
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteDialog(false)
                      setDeleteConfirmation("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmation !== "DELETE" || isLoading}
                  >
                    {isLoading ? "Deleting..." : "Delete Account"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}