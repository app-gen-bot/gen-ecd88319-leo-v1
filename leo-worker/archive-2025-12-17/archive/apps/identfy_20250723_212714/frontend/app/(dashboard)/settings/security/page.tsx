"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Key, Smartphone, History, AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function SecuritySettingsPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(true);
  const [ipRestriction, setIpRestriction] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Security Settings</h1>
        <p className="text-muted-foreground">
          Manage your account security and access controls
        </p>
      </div>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <CardTitle>Two-Factor Authentication</CardTitle>
            </div>
            <Badge variant={twoFactorEnabled ? "success" : "secondary"}>
              {twoFactorEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm">
                Require authentication code from your mobile device
              </p>
              <p className="text-xs text-muted-foreground">
                You'll need to enter a code from your authenticator app when signing in
              </p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>
          {twoFactorEnabled && (
            <div className="mt-4">
              <Button variant="outline" size="sm">
                Configure 2FA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <CardTitle>Password</CardTitle>
          </div>
          <CardDescription>
            Update your password regularly to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Last changed: 30 days ago
              </p>
            </div>
            <Button variant="outline">Change Password</Button>
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <CardTitle>Session Management</CardTitle>
          </div>
          <CardDescription>
            Control your active sessions and security preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="session-timeout">Automatic Session Timeout</Label>
              <p className="text-xs text-muted-foreground">
                Automatically sign out after 30 minutes of inactivity
              </p>
            </div>
            <Switch
              id="session-timeout"
              checked={sessionTimeout}
              onCheckedChange={setSessionTimeout}
            />
          </div>
          <Separator />
          <div>
            <h4 className="text-sm font-medium mb-3">Active Sessions</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Current Session</p>
                  <p className="text-xs text-muted-foreground">
                    Chrome on macOS • San Francisco, CA
                  </p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" className="mt-3">
              View All Sessions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* IP Restrictions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>IP Restrictions</CardTitle>
          </div>
          <CardDescription>
            Restrict access to your account from specific IP addresses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="ip-restriction">Enable IP Allowlist</Label>
              <p className="text-xs text-muted-foreground">
                Only allow access from specified IP addresses
              </p>
            </div>
            <Switch
              id="ip-restriction"
              checked={ipRestriction}
              onCheckedChange={setIpRestriction}
            />
          </div>
          {ipRestriction && (
            <div className="mt-4 space-y-3">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Warning: Enabling IP restrictions may lock you out if not configured properly
                </p>
              </div>
              <Button variant="outline" size="sm">
                Manage IP Allowlist
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Security Activity</CardTitle>
          <CardDescription>
            Recent security-related events on your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">View Security Logs</Button>
        </CardContent>
      </Card>
    </div>
  );
}