'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeftIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';
import { toast } from '@/lib/use-toast';

export default function PracticeSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Settings saved',
        description: 'Practice information has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/staff/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Practice Information</h1>
          <p className="text-gray-400">Manage your clinic details and settings</p>
        </div>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100">Basic Information</CardTitle>
          <CardDescription className="text-gray-400">
            Update your clinic's basic information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clinic-name">Clinic Name</Label>
              <Input
                id="clinic-name"
                defaultValue="PawsFlow Veterinary Clinic"
                className="bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license">License Number</Label>
              <Input
                id="license"
                defaultValue="VET-12345"
                className="bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              defaultValue="123 Main Street, Suite 100&#10;Anytown, ST 12345"
              className="bg-gray-700 border-gray-600 text-gray-100"
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                defaultValue="(555) 123-4567"
                className="bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                defaultValue="info@pawsflowvet.com"
                className="bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              defaultValue="https://www.pawsflowvet.com"
              className="bg-gray-700 border-gray-600 text-gray-100"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100">Operating Hours</CardTitle>
          <CardDescription className="text-gray-400">
            Set your clinic's operating hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <div key={day} className="grid grid-cols-3 gap-4 items-center">
                <Label className="text-gray-300">{day}</Label>
                <Input
                  type="time"
                  defaultValue={day === 'Sunday' ? '' : '09:00'}
                  className="bg-gray-700 border-gray-600 text-gray-100"
                  disabled={day === 'Sunday'}
                />
                <Input
                  type="time"
                  defaultValue={day === 'Sunday' ? '' : '17:00'}
                  className="bg-gray-700 border-gray-600 text-gray-100"
                  disabled={day === 'Sunday'}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}