"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSlackData } from "@/hooks/use-slack-data";
import { useToast } from "@/hooks/use-toast";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { currentUser } = useSlackData();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    title: currentUser?.title || "",
    bio: currentUser?.bio || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/v1/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("slack-auth-token")}`,
        },
        body: JSON.stringify({
          name: formData.name,
          title: formData.title,
          bio: formData.bio,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Avatar image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would upload to S3 or similar
    toast({
      title: "Info",
      description: "Avatar upload not implemented in demo",
    });
  };

  const handleDeleteAccount = () => {
    // In a real app, this would show a confirmation dialog
    toast({
      title: "Info",
      description: "Account deletion not implemented in demo",
    });
  };

  return (
    <div className="min-h-screen bg-[#1a1d21]">
      <div className="container max-w-4xl py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <Card className="bg-[#2c2f33] border-[#40444b]">
          <CardHeader>
            <CardTitle className="text-white">Profile Settings</CardTitle>
            <CardDescription className="text-gray-400">
              Manage your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={currentUser?.avatar_url} alt={formData.name} />
                  <AvatarFallback className="text-2xl">
                    {formData.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>
                        <Camera className="mr-2 h-4 w-4" />
                        Upload Avatar
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <p className="text-xs text-gray-400 mt-1">Max size: 5MB</p>
                </div>
              </div>

              <Separator className="bg-[#40444b]" />

              {/* Basic Information */}
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-white">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-[#40444b] border-[#40444b] text-white"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    className="bg-[#40444b] border-[#40444b] text-white"
                    disabled
                  />
                  <p className="text-xs text-gray-400">Email cannot be changed</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="title" className="text-white">Job Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Software Engineer"
                    className="bg-[#40444b] border-[#40444b] text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bio" className="text-white">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    className="bg-[#40444b] border-[#40444b] text-white placeholder:text-gray-500"
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-400">
                    {formData.bio.length}/500 characters
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="border-[#40444b] text-gray-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>

            <Separator className="bg-[#40444b]" />

            {/* Danger Zone */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Danger Zone</h3>
              <div className="border border-red-900 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-2">Delete Account</h4>
                <p className="text-sm text-gray-400 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  className="bg-red-900 hover:bg-red-800"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}