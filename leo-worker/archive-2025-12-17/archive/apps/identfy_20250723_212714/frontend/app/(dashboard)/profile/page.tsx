"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Camera,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Shield,
  Key,
  History,
  Settings,
  Check,
  Upload
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const timezones = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Australia/Sydney", label: "Sydney (AEDT)" },
];

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "it", label: "Italian" },
  { value: "ja", label: "Japanese" },
  { value: "zh", label: "Chinese" },
  { value: "ko", label: "Korean" },
];

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: session?.user?.name?.split(' ')[0] || "John",
    lastName: session?.user?.name?.split(' ')[1] || "Smith",
    email: session?.user?.email || "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    timezone: "America/New_York",
    language: "en",
    bio: "Senior Risk Analyst specializing in identity verification and fraud prevention.",
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsEditing(false);
    toast.success("Profile updated successfully");
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle file upload
      toast.success("Avatar uploaded successfully");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information and preferences
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Your profile information is used across the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/images/cases/john-smith.png" alt={`${formData.firstName} ${formData.lastName}`} />
                <AvatarFallback>{getInitials(`${formData.firstName} ${formData.lastName}`)}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-1 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4 text-primary-foreground" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{`${formData.firstName} ${formData.lastName}`}</h3>
              <p className="text-muted-foreground">{formData.email}</p>
              <Badge className="mt-2">Admin</Badge>
            </div>
          </div>

          <Separator />

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              {isEditing ? (
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              ) : (
                <p className="text-sm py-2">{formData.firstName}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              {isEditing ? (
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              ) : (
                <p className="text-sm py-2">{formData.lastName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="inline h-4 w-4 mr-1" />
                Email Address
              </Label>
              <p className="text-sm py-2 text-muted-foreground">{formData.email}</p>
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                <Phone className="inline h-4 w-4 mr-1" />
                Phone Number
              </Label>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                  {!phoneVerified && (
                    <Button variant="outline" size="sm" className="w-full">
                      Verify Phone
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-sm py-2">{formData.phone}</p>
                  {phoneVerified && <Check className="h-4 w-4 text-green-600" />}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">
                <Globe className="inline h-4 w-4 mr-1" />
                Timezone
              </Label>
              {isEditing ? (
                <Select
                  value={formData.timezone}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm py-2">
                  {timezones.find(tz => tz.value === formData.timezone)?.label}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">
                <Globe className="inline h-4 w-4 mr-1" />
                Language
              </Label>
              {isEditing ? (
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm py-2">
                  {languages.find(lang => lang.value === formData.language)?.label}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            {isEditing ? (
              <textarea
                id="bio"
                className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-none"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-sm py-2">{formData.bio}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" asChild>
          <Link href="/profile/security">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Settings</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Manage password and two-factor authentication
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" asChild>
          <Link href="/profile/sessions">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                View and manage your active sessions
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" asChild>
          <Link href="/profile/login-history">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Login History</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Review your recent login activity
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Details about your account and subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-muted-foreground">Account ID</Label>
              <p className="text-sm font-mono">usr_1234567890abcdef</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => {
              navigator.clipboard.writeText("usr_1234567890abcdef");
              toast.success("Account ID copied");
            }}>
              Copy
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-muted-foreground">Member Since</Label>
              <p className="text-sm">January 15, 2023</p>
            </div>
            <Badge variant="secondary">2 years</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-muted-foreground">Subscription</Label>
              <p className="text-sm">Professional Plan</p>
            </div>
            <Link href="/settings/billing">
              <Button variant="link" size="sm">
                Manage Billing →
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}