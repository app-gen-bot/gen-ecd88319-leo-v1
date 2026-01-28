"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Key, Shield, Bell, Palette, Globe, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

interface SettingItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const settingSections: {
    title: string;
    items: SettingItem[];
  }[] = [
    {
      title: "Account",
      items: [
        {
          title: "Profile",
          description: "Manage your personal information and avatar",
          icon: <User className="h-5 w-5" />,
          href: "/app/settings/profile",
        },
        {
          title: "Email & Notifications",
          description: "Configure email preferences and notification settings",
          icon: <Bell className="h-5 w-5" />,
          href: "/app/settings/notifications",
        },
        {
          title: "Security",
          description: "Password, two-factor authentication, and sessions",
          icon: <Shield className="h-5 w-5" />,
          href: "/app/settings/security",
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          title: "Appearance",
          description: "Theme, font size, and display options",
          icon: <Palette className="h-5 w-5" />,
          href: "/app/settings/appearance",
        },
        {
          title: "Language & Region",
          description: "Language preferences and timezone settings",
          icon: <Globe className="h-5 w-5" />,
          href: "/app/settings/language",
        },
      ],
    },
  ];

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/app/settings/profile")}
          >
            <User className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/app/settings/security")}
          >
            <Key className="mr-2 h-4 w-4" />
            Change Password
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              toast({
                title: "Download Started",
                description: "Your data export will be ready shortly.",
              });
            }}
          >
            Download Your Data
          </Button>
        </CardContent>
      </Card>

      {/* Settings Sections */}
      <div className="space-y-8">
        {settingSections.map((section) => (
          <div key={section.title}>
            <h2 className="text-lg font-semibold mb-4">{section.title}</h2>
            <div className="space-y-3">
              {section.items.map((item) => (
                <Card
                  key={item.href}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => router.push(item.href)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 text-muted-foreground">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-8" />

      {/* Danger Zone */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-destructive">
          Danger Zone
        </h2>
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Delete Account</CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data. This action
              cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => {
                toast({
                  title: "Account Deletion",
                  description: "Please contact support to delete your account.",
                });
              }}
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}