"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, MessageSquare, AlertCircle, CheckCircle, XCircle, Smartphone } from "lucide-react";
import { useState } from "react";

export default function NotificationSettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState({
    caseUpdates: true,
    workflowChanges: true,
    teamActivity: false,
    systemAlerts: true,
    weeklyReports: true,
  });

  const [pushNotifications, setPushNotifications] = useState({
    enabled: true,
    caseAssignments: true,
    urgentAlerts: true,
    mentions: true,
  });

  const [notificationFrequency, setNotificationFrequency] = useState("instant");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notification Settings</h1>
        <p className="text-muted-foreground">
          Choose how and when you want to be notified
        </p>
      </div>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Email Notifications</CardTitle>
          </div>
          <CardDescription>
            Manage which email notifications you receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="case-updates">Case Updates</Label>
              <p className="text-xs text-muted-foreground">
                Status changes, new comments, and resolution updates
              </p>
            </div>
            <Switch
              id="case-updates"
              checked={emailNotifications.caseUpdates}
              onCheckedChange={(checked) =>
                setEmailNotifications({ ...emailNotifications, caseUpdates: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="workflow-changes">Workflow Changes</Label>
              <p className="text-xs text-muted-foreground">
                Updates to workflows you've created or are assigned to
              </p>
            </div>
            <Switch
              id="workflow-changes"
              checked={emailNotifications.workflowChanges}
              onCheckedChange={(checked) =>
                setEmailNotifications({ ...emailNotifications, workflowChanges: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="team-activity">Team Activity</Label>
              <p className="text-xs text-muted-foreground">
                New team members, role changes, and team updates
              </p>
            </div>
            <Switch
              id="team-activity"
              checked={emailNotifications.teamActivity}
              onCheckedChange={(checked) =>
                setEmailNotifications({ ...emailNotifications, teamActivity: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="system-alerts">System Alerts</Label>
              <p className="text-xs text-muted-foreground">
                Important system updates and security notifications
              </p>
            </div>
            <Switch
              id="system-alerts"
              checked={emailNotifications.systemAlerts}
              onCheckedChange={(checked) =>
                setEmailNotifications({ ...emailNotifications, systemAlerts: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="weekly-reports">Weekly Reports</Label>
              <p className="text-xs text-muted-foreground">
                Summary of your activity and key metrics
              </p>
            </div>
            <Switch
              id="weekly-reports"
              checked={emailNotifications.weeklyReports}
              onCheckedChange={(checked) =>
                setEmailNotifications({ ...emailNotifications, weeklyReports: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            <CardTitle>Push Notifications</CardTitle>
          </div>
          <CardDescription>
            Real-time notifications on your devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="push-enabled">Enable Push Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Receive notifications on your browser and mobile devices
              </p>
            </div>
            <Switch
              id="push-enabled"
              checked={pushNotifications.enabled}
              onCheckedChange={(checked) =>
                setPushNotifications({ ...pushNotifications, enabled: checked })
              }
            />
          </div>
          {pushNotifications.enabled && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="case-assignments">Case Assignments</Label>
                    <p className="text-xs text-muted-foreground">
                      When a new case is assigned to you
                    </p>
                  </div>
                  <Switch
                    id="case-assignments"
                    checked={pushNotifications.caseAssignments}
                    onCheckedChange={(checked) =>
                      setPushNotifications({ ...pushNotifications, caseAssignments: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="urgent-alerts">Urgent Alerts</Label>
                    <p className="text-xs text-muted-foreground">
                      High-priority cases and critical system alerts
                    </p>
                  </div>
                  <Switch
                    id="urgent-alerts"
                    checked={pushNotifications.urgentAlerts}
                    onCheckedChange={(checked) =>
                      setPushNotifications({ ...pushNotifications, urgentAlerts: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="mentions">Mentions</Label>
                    <p className="text-xs text-muted-foreground">
                      When someone mentions you in a comment or note
                    </p>
                  </div>
                  <Switch
                    id="mentions"
                    checked={pushNotifications.mentions}
                    onCheckedChange={(checked) =>
                      setPushNotifications({ ...pushNotifications, mentions: checked })
                    }
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notification Frequency */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notification Frequency</CardTitle>
          </div>
          <CardDescription>
            How often you want to receive notification digests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={notificationFrequency} onValueChange={setNotificationFrequency}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="instant" id="instant" />
              <Label htmlFor="instant" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium">Instant</p>
                  <p className="text-xs text-muted-foreground">
                    Get notified as soon as something happens
                  </p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 mt-3">
              <RadioGroupItem value="hourly" id="hourly" />
              <Label htmlFor="hourly" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium">Hourly Digest</p>
                  <p className="text-xs text-muted-foreground">
                    Receive a summary every hour
                  </p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 mt-3">
              <RadioGroupItem value="daily" id="daily" />
              <Label htmlFor="daily" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium">Daily Digest</p>
                  <p className="text-xs text-muted-foreground">
                    Get a daily summary at 9:00 AM
                  </p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Success Messages</span>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm">Warning Messages</span>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm">Error Messages</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}