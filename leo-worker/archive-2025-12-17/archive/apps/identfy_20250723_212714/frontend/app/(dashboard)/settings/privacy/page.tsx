"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Eye, Download, Trash2, Users, Globe, Lock } from "lucide-react";
import { useState } from "react";

export default function PrivacySettingsPage() {
  const [profileVisibility, setProfileVisibility] = useState("team");
  const [activityVisibility, setActivityVisibility] = useState(true);
  const [dataSharing, setDataSharing] = useState({
    analytics: true,
    improvements: true,
    marketing: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Privacy Settings</h1>
        <p className="text-muted-foreground">
          Control your privacy and data sharing preferences
        </p>
      </div>

      {/* Profile Visibility */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            <CardTitle>Profile Visibility</CardTitle>
          </div>
          <CardDescription>
            Control who can see your profile information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={profileVisibility} onValueChange={setProfileVisibility}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="public" id="public" />
              <Label htmlFor="public" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Public</p>
                    <p className="text-xs text-muted-foreground">
                      Anyone can view your profile
                    </p>
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 mt-3">
              <RadioGroupItem value="team" id="team" />
              <Label htmlFor="team" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Team Only</p>
                    <p className="text-xs text-muted-foreground">
                      Only your team members can view your profile
                    </p>
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 mt-3">
              <RadioGroupItem value="private" id="private" />
              <Label htmlFor="private" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Private</p>
                    <p className="text-xs text-muted-foreground">
                      Only you can view your profile
                    </p>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Activity Visibility */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Settings</CardTitle>
          <CardDescription>
            Control what activity information is visible to others
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="activity-visibility">Show Activity Status</Label>
              <p className="text-xs text-muted-foreground">
                Let others see when you're active on the platform
              </p>
            </div>
            <Switch
              id="activity-visibility"
              checked={activityVisibility}
              onCheckedChange={setActivityVisibility}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Sharing */}
      <Card>
        <CardHeader>
          <CardTitle>Data Sharing Preferences</CardTitle>
          <CardDescription>
            Choose how your data is used to improve our services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="analytics">Usage Analytics</Label>
              <p className="text-xs text-muted-foreground">
                Help us understand how you use the platform
              </p>
            </div>
            <Switch
              id="analytics"
              checked={dataSharing.analytics}
              onCheckedChange={(checked) =>
                setDataSharing({ ...dataSharing, analytics: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="improvements">Product Improvements</Label>
              <p className="text-xs text-muted-foreground">
                Use your data to improve features and performance
              </p>
            </div>
            <Switch
              id="improvements"
              checked={dataSharing.improvements}
              onCheckedChange={(checked) =>
                setDataSharing({ ...dataSharing, improvements: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="marketing">Marketing Communications</Label>
              <p className="text-xs text-muted-foreground">
                Receive updates about new features and offers
              </p>
            </div>
            <Switch
              id="marketing"
              checked={dataSharing.marketing}
              onCheckedChange={(checked) =>
                setDataSharing({ ...dataSharing, marketing: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Export or delete your personal data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <Download className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium">Export Your Data</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Download a copy of all your data including profile information, activity logs, and settings
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  Request Data Export
                </Button>
              </div>
            </div>
          </div>
          <div className="p-4 border border-red-200 dark:border-red-900 rounded-lg space-y-3 bg-red-50 dark:bg-red-950">
            <div className="flex items-start gap-3">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-900 dark:text-red-100">Delete Account</h4>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button variant="destructive" size="sm" className="mt-3">
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Policy */}
      <Card>
        <CardHeader>
          <CardTitle>Legal Documents</CardTitle>
          <CardDescription>
            Review our privacy policy and terms of service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <a href="/privacy" target="_blank">
                Privacy Policy
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/terms" target="_blank">
                Terms of Service
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}