'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth-context';
import {
  BuildingOfficeIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  BellAlertIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  PlusIcon,
  XMarkIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

export default function ClinicSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [clinicData, setClinicData] = useState({
    // Basic Information
    name: 'Happy Paws Veterinary Clinic',
    address: '123 Pet Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    phone: '(555) 123-4567',
    email: 'info@happypawsvet.com',
    website: 'www.happypawsvet.com',
    taxId: '12-3456789',
    
    // Operating Hours
    hours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '14:00', closed: false },
      sunday: { open: '', close: '', closed: true },
    },
    
    // Services
    services: [
      'Wellness Exams',
      'Vaccinations',
      'Dental Care',
      'Surgery',
      'Emergency Care',
      'Grooming',
    ],
    
    // Appointment Settings
    appointmentDuration: '30',
    bufferTime: '5',
    maxAdvanceBooking: '90',
    allowOnlineBooking: true,
    requireDeposit: false,
    depositAmount: '50',
    
    // Payment Settings
    acceptedPayments: ['cash', 'credit', 'debit', 'check'],
    paymentTerms: '15',
    lateFeePercentage: '1.5',
    
    // Notifications
    appointmentReminders: true,
    reminderTiming: '24',
    vaccineReminders: true,
    birthdayGreetings: false,
  });

  const [newService, setNewService] = useState('');

  // Check if user has permission to view this page
  if (user?.role !== 'practice_manager' && user?.role !== 'admin') {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <ShieldCheckIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
              <p className="text-muted-foreground">
                You need administrator privileges to access clinic settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Settings saved',
        description: 'Clinic settings have been updated successfully.',
      });
      setIsSaving(false);
    }, 1000);
  };

  const addService = () => {
    if (newService.trim()) {
      setClinicData({
        ...clinicData,
        services: [...clinicData.services, newService.trim()],
      });
      setNewService('');
    }
  };

  const removeService = (index: number) => {
    setClinicData({
      ...clinicData,
      services: clinicData.services.filter((_, i) => i !== index),
    });
  };

  const updateHours = (day: string, field: string, value: string | boolean) => {
    setClinicData({
      ...clinicData,
      hours: {
        ...clinicData.hours,
        [day]: {
          ...clinicData.hours[day as keyof typeof clinicData.hours],
          [field]: value,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Clinic Settings</h1>
        <p className="text-muted-foreground">Manage your clinic information and preferences</p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BuildingOfficeIcon className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>Your clinic's contact details and identification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clinic-name">Clinic Name</Label>
              <Input
                id="clinic-name"
                value={clinicData.name}
                onChange={(e) => setClinicData({ ...clinicData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax-id">Tax ID</Label>
              <Input
                id="tax-id"
                value={clinicData.taxId}
                onChange={(e) => setClinicData({ ...clinicData, taxId: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={clinicData.address}
                onChange={(e) => setClinicData({ ...clinicData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={clinicData.city}
                onChange={(e) => setClinicData({ ...clinicData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={clinicData.state}
                onChange={(e) => setClinicData({ ...clinicData, state: e.target.value })}
                maxLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                value={clinicData.zipCode}
                onChange={(e) => setClinicData({ ...clinicData, zipCode: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={clinicData.phone}
                onChange={(e) => setClinicData({ ...clinicData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={clinicData.email}
                onChange={(e) => setClinicData({ ...clinicData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={clinicData.website}
                onChange={(e) => setClinicData({ ...clinicData, website: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operating Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            Operating Hours
          </CardTitle>
          <CardDescription>Set your clinic's business hours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(clinicData.hours).map(([day, hours]) => (
            <div key={day} className="flex items-center gap-4">
              <div className="w-32">
                <Label className="capitalize">{day}</Label>
              </div>
              <Switch
                checked={!hours.closed}
                onCheckedChange={(checked) => updateHours(day, 'closed', !checked)}
                aria-label={`${day} open/closed`}
              />
              {!hours.closed && (
                <>
                  <Select
                    value={hours.open}
                    onValueChange={(value) => updateHours(day, 'open', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <SelectItem key={hour} value={`${hour}:00`}>
                            {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <span>to</span>
                  <Select
                    value={hours.close}
                    onValueChange={(value) => updateHours(day, 'close', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <SelectItem key={hour} value={`${hour}:00`}>
                            {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </>
              )}
              {hours.closed && <span className="text-muted-foreground">Closed</span>}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle>Services Offered</CardTitle>
          <CardDescription>List the services your clinic provides</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {clinicData.services.map((service, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {service}
                <button
                  onClick={() => removeService(index)}
                  className="ml-1 hover:text-destructive"
                  aria-label={`Remove ${service}`}
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a service..."
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addService()}
            />
            <Button onClick={addService} size="icon" variant="outline">
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Appointment Settings
          </CardTitle>
          <CardDescription>Configure appointment booking preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointment-duration">Default Duration (minutes)</Label>
              <Select
                value={clinicData.appointmentDuration}
                onValueChange={(value) => setClinicData({ ...clinicData, appointmentDuration: value })}
              >
                <SelectTrigger id="appointment-duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="buffer-time">Buffer Time (minutes)</Label>
              <Select
                value={clinicData.bufferTime}
                onValueChange={(value) => setClinicData({ ...clinicData, bufferTime: value })}
              >
                <SelectTrigger id="buffer-time">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No buffer</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="advance-booking">Max Advance Booking (days)</Label>
              <Input
                id="advance-booking"
                type="number"
                value={clinicData.maxAdvanceBooking}
                onChange={(e) => setClinicData({ ...clinicData, maxAdvanceBooking: e.target.value })}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="online-booking" className="text-sm font-medium">
                  Allow Online Booking
                </Label>
                <p className="text-sm text-muted-foreground">
                  Clients can book appointments through the portal
                </p>
              </div>
              <Switch
                id="online-booking"
                checked={clinicData.allowOnlineBooking}
                onCheckedChange={(checked) => setClinicData({ ...clinicData, allowOnlineBooking: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="require-deposit" className="text-sm font-medium">
                  Require Deposit
                </Label>
                <p className="text-sm text-muted-foreground">
                  Request deposit for certain appointments
                </p>
              </div>
              <Switch
                id="require-deposit"
                checked={clinicData.requireDeposit}
                onCheckedChange={(checked) => setClinicData({ ...clinicData, requireDeposit: checked })}
              />
            </div>
            
            {clinicData.requireDeposit && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="deposit-amount">Deposit Amount ($)</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  value={clinicData.depositAmount}
                  onChange={(e) => setClinicData({ ...clinicData, depositAmount: e.target.value })}
                  className="w-32"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5" />
            Payment Settings
          </CardTitle>
          <CardDescription>Configure payment options and terms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Accepted Payment Methods</Label>
            <div className="space-y-2">
              {['cash', 'credit', 'debit', 'check'].map((method) => (
                <div key={method} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`payment-${method}`}
                    checked={clinicData.acceptedPayments.includes(method)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setClinicData({
                          ...clinicData,
                          acceptedPayments: [...clinicData.acceptedPayments, method],
                        });
                      } else {
                        setClinicData({
                          ...clinicData,
                          acceptedPayments: clinicData.acceptedPayments.filter(m => m !== method),
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <Label htmlFor={`payment-${method}`} className="capitalize font-normal">
                    {method}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment-terms">Payment Terms (days)</Label>
              <Select
                value={clinicData.paymentTerms}
                onValueChange={(value) => setClinicData({ ...clinicData, paymentTerms: value })}
              >
                <SelectTrigger id="payment-terms">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Due on Receipt</SelectItem>
                  <SelectItem value="15">Net 15</SelectItem>
                  <SelectItem value="30">Net 30</SelectItem>
                  <SelectItem value="60">Net 60</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="late-fee">Late Fee (%)</Label>
              <Input
                id="late-fee"
                type="number"
                step="0.1"
                value={clinicData.lateFeePercentage}
                onChange={(e) => setClinicData({ ...clinicData, lateFeePercentage: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellAlertIcon className="h-5 w-5" />
            Client Notifications
          </CardTitle>
          <CardDescription>Configure automated client communications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="appointment-reminders" className="text-sm font-medium">
                  Appointment Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Send automatic appointment reminders
                </p>
              </div>
              <Switch
                id="appointment-reminders"
                checked={clinicData.appointmentReminders}
                onCheckedChange={(checked) => setClinicData({ ...clinicData, appointmentReminders: checked })}
              />
            </div>
            
            {clinicData.appointmentReminders && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="reminder-timing">Send reminder (hours before)</Label>
                <Select
                  value={clinicData.reminderTiming}
                  onValueChange={(value) => setClinicData({ ...clinicData, reminderTiming: value })}
                >
                  <SelectTrigger id="reminder-timing" className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="48">48 hours</SelectItem>
                    <SelectItem value="72">72 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="vaccine-reminders" className="text-sm font-medium">
                  Vaccine Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Notify when vaccines are due
                </p>
              </div>
              <Switch
                id="vaccine-reminders"
                checked={clinicData.vaccineReminders}
                onCheckedChange={(checked) => setClinicData({ ...clinicData, vaccineReminders: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="birthday-greetings" className="text-sm font-medium">
                  Birthday Greetings
                </Label>
                <p className="text-sm text-muted-foreground">
                  Send birthday wishes to pets
                </p>
              </div>
              <Switch
                id="birthday-greetings"
                checked={clinicData.birthdayGreetings}
                onCheckedChange={(checked) => setClinicData({ ...clinicData, birthdayGreetings: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}