'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth-context';
import {
  User,
  Mail,
  Phone,
  Home,
  Calendar,
  Shield,
  FileText,
  Download,
  Camera,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Award,
  Star
} from 'lucide-react';
import { format } from 'date-fns';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  currentAddress: string;
  moveInDate: string;
  landlordName: string;
  landlordPhone: string;
  landlordEmail: string;
  monthlyRent: string;
  securityDeposit: string;
  leaseEndDate: string;
  emergencyContact: string;
  emergencyPhone: string;
}

interface UserStats {
  documentsUploaded: number;
  lettersGenerated: number;
  disputesWon: number;
  savedAmount: number;
  memberSince: Date;
  lastActive: Date;
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    phone: '(555) 123-4567',
    currentAddress: '123 Main St, Apt 4B, Los Angeles, CA 90001',
    moveInDate: '2023-01-15',
    landlordName: 'ABC Property Management',
    landlordPhone: '(555) 987-6543',
    landlordEmail: 'contact@abcproperties.com',
    monthlyRent: '2500',
    securityDeposit: '5000',
    leaseEndDate: '2025-01-14',
    emergencyContact: 'Jane Doe',
    emergencyPhone: '(555) 111-2222'
  });

  const [stats] = useState<UserStats>({
    documentsUploaded: 24,
    lettersGenerated: 7,
    disputesWon: 2,
    savedAmount: 1250,
    memberSince: new Date('2023-01-15'),
    lastActive: new Date()
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Profile updated',
        description: 'Your information has been saved successfully.',
      });
      
      setIsEditing(false);
    } catch {
      toast({
        title: 'Update failed',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const exportData = () => {
    const data = {
      profile,
      stats,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenant-profile-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    
    toast({
      title: 'Data exported',
      description: 'Your profile data has been downloaded.',
    });
  };

  const achievements = [
    { id: 1, title: 'First Document', description: 'Uploaded your first document', icon: FileText, earned: true },
    { id: 2, title: 'Letter Writer', description: 'Generated 5+ letters', icon: Mail, earned: true },
    { id: 3, title: 'Dispute Champion', description: 'Won your first dispute', icon: Award, earned: true },
    { id: 4, title: 'Money Saver', description: 'Saved over $1000', icon: TrendingUp, earned: true },
    { id: 5, title: 'Power User', description: 'Active for 30+ days', icon: Star, earned: false }
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account and rental information
            </p>
          </div>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Personal Information</CardTitle>
                  {!isEditing ? (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="space-x-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-2xl">
                      {profile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      <User className="h-4 w-4 inline mr-1" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="moveInDate">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Move-in Date
                    </Label>
                    <Input
                      id="moveInDate"
                      type="date"
                      value={profile.moveInDate}
                      onChange={(e) => setProfile({ ...profile, moveInDate: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">
                    <Home className="h-4 w-4 inline mr-1" />
                    Current Address
                  </Label>
                  <Textarea
                    id="address"
                    value={profile.currentAddress}
                    onChange={(e) => setProfile({ ...profile, currentAddress: e.target.value })}
                    disabled={!isEditing}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="rental" className="w-full">
              <TabsList>
                <TabsTrigger value="rental">Rental Details</TabsTrigger>
                <TabsTrigger value="emergency">Emergency Info</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>
              
              <TabsContent value="rental">
                <Card>
                  <CardHeader>
                    <CardTitle>Rental Information</CardTitle>
                    <CardDescription>Details about your current rental</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="landlordName">Landlord/Property Manager</Label>
                        <Input
                          id="landlordName"
                          value={profile.landlordName}
                          onChange={(e) => setProfile({ ...profile, landlordName: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="landlordPhone">Landlord Phone</Label>
                        <Input
                          id="landlordPhone"
                          value={profile.landlordPhone}
                          onChange={(e) => setProfile({ ...profile, landlordPhone: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="landlordEmail">Landlord Email</Label>
                        <Input
                          id="landlordEmail"
                          type="email"
                          value={profile.landlordEmail}
                          onChange={(e) => setProfile({ ...profile, landlordEmail: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rent">Monthly Rent</Label>
                        <Input
                          id="rent"
                          value={profile.monthlyRent}
                          onChange={(e) => setProfile({ ...profile, monthlyRent: e.target.value })}
                          disabled={!isEditing}
                          placeholder="$0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deposit">Security Deposit</Label>
                        <Input
                          id="deposit"
                          value={profile.securityDeposit}
                          onChange={(e) => setProfile({ ...profile, securityDeposit: e.target.value })}
                          disabled={!isEditing}
                          placeholder="$0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="leaseEnd">Lease End Date</Label>
                        <Input
                          id="leaseEnd"
                          type="date"
                          value={profile.leaseEndDate}
                          onChange={(e) => setProfile({ ...profile, leaseEndDate: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="emergency">
                <Card>
                  <CardHeader>
                    <CardTitle>Emergency Contact</CardTitle>
                    <CardDescription>Who to contact in case of emergency</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContact">Contact Name</Label>
                        <Input
                          id="emergencyContact"
                          value={profile.emergencyContact}
                          onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyPhone">Contact Phone</Label>
                        <Input
                          id="emergencyPhone"
                          value={profile.emergencyPhone}
                          onChange={(e) => setProfile({ ...profile, emergencyPhone: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="achievements">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Achievements</CardTitle>
                    <CardDescription>Milestones you've reached</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievements.map(achievement => (
                        <div
                          key={achievement.id}
                          className={`flex items-start space-x-3 p-3 rounded-lg border ${
                            achievement.earned ? 'bg-muted/50' : 'opacity-50'
                          }`}
                        >
                          <achievement.icon className={`h-8 w-8 ${achievement.earned ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div className="flex-1">
                            <p className="font-medium">{achievement.title}</p>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          </div>
                          {achievement.earned && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Stats Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Documents Uploaded</span>
                    <span className="font-bold text-lg">{stats.documentsUploaded}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Letters Generated</span>
                    <span className="font-bold text-lg">{stats.lettersGenerated}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Disputes Won</span>
                    <span className="font-bold text-lg">{stats.disputesWon}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Money Saved</span>
                    <span className="font-bold text-lg text-green-600">${stats.savedAmount}</span>
                  </div>
                </div>
                <div className="pt-4 border-t space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member Since</span>
                    <span>{format(stats.memberSince, 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Active</span>
                    <span>Today</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/documentation/capture')}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Upload Documents
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/letter-generator')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Letter
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/security-deposit')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Track Deposit
                </Button>
              </CardContent>
            </Card>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Lease ending soon!</strong> Your lease ends on {format(new Date(profile.leaseEndDate), 'MMM d, yyyy')}. 
                <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/knowledge')}>
                  Learn about renewal rights →
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
}