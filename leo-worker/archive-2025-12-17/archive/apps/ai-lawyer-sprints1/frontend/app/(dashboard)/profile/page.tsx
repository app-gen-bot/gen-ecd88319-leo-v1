"use client"

import { useState, useEffect } from 'react';
import { useNextAuth } from '@/contexts/nextauth-context';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { AuthCheck } from '@/components/auth-check';
import { 
  User, 
  Mail, 
  Phone, 
  Home,
  Calendar,
  Shield,
  Bell,
  Loader2,
  Save
} from 'lucide-react';
import type { UserProfile } from '@/shared/types/api';

export default function ProfilePage() {
  const { user, updateUser } = useNextAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    userType: 'tenant' as 'tenant' | 'landlord',
    notification_email: true,
    notification_sms: false,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await apiClient.getUserProfile();
      setProfile(profileData);
      
      // Populate form with existing data
      setFormData({
        name: user?.name || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        userType: profileData.userType || 'tenant',
        notification_email: true,
        notification_sms: false,
      });
    } catch (error: any) {
      toast({
        title: 'Error loading profile',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const updatedProfile = await apiClient.updateUserProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        userType: formData.userType,
      });
      
      // Update user name if changed
      if (user && formData.name !== user.name) {
        updateUser({ ...user, name: formData.name });
      }
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error saving profile',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <AuthCheck>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AuthCheck>
    );
  }

  return (
    <AuthCheck>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6" />
            Profile Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your account information and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="userType">Account Type</Label>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <Input
                      id="userType"
                      value={user?.userType || ''}
                      disabled
                      className="bg-gray-50 capitalize"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rental Information */}
          <Card>
            <CardHeader>
              <CardTitle>Rental Information</CardTitle>
              <CardDescription>
                Details about your current rental situation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Current Rental Address</Label>
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-gray-400" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="123 Main St, San Francisco, CA 94105"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="userType">User Type</Label>
                <Select
                  value={formData.userType}
                  onValueChange={(value) => updateField('userType', value as 'tenant' | 'landlord')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tenant">Tenant</SelectItem>
                    <SelectItem value="landlord">Landlord</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to receive updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotif" className="flex items-center gap-2 cursor-pointer">
                    <Bell className="h-4 w-4" />
                    Email Notifications
                  </Label>
                  <p className="text-sm text-gray-500">
                    Receive important updates via email
                  </p>
                </div>
                <Switch
                  id="emailNotif"
                  checked={formData.notification_email}
                  onCheckedChange={(checked) => updateField('notification_email', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="smsNotif" className="flex items-center gap-2 cursor-pointer">
                    <Phone className="h-4 w-4" />
                    SMS Notifications
                  </Label>
                  <p className="text-sm text-gray-500">
                    Get text alerts for urgent matters
                  </p>
                </div>
                <Switch
                  id="smsNotif"
                  checked={formData.notification_sms}
                  onCheckedChange={(checked) => updateField('notification_sms', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}