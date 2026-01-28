'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { 
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Shield,
  CreditCard,
  Music,
  Trophy,
  TrendingUp,
  Settings,
  Camera,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react'

const mockUserData = {
  name: 'Demo User',
  email: 'demo@example.com',
  phone: '+1 (555) 123-4567',
  website: 'www.demoartist.com',
  location: 'Los Angeles, CA',
  bio: 'Independent artist and producer. Creating music that moves souls.',
  joinDate: '2024-01-15',
  plan: 'Pro',
  verified: true,
  stats: {
    songsUploaded: 124,
    platformsConnected: 4,
    totalRegistrations: 486,
    successRate: 98.5
  },
  achievements: [
    { id: 1, name: 'Early Adopter', description: 'Joined in the first month', icon: Star },
    { id: 2, name: 'Century Club', description: 'Uploaded 100+ songs', icon: Trophy },
    { id: 3, name: 'Platform Master', description: 'Connected 4+ platforms', icon: Shield },
    { id: 4, name: 'Registration Pro', description: '95%+ success rate', icon: CheckCircle }
  ],
  preferences: {
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    publicProfile: true,
    showStats: true
  }
}

export default function ProfilePage() {
  const { user } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: mockUserData.name,
    email: mockUserData.email,
    phone: mockUserData.phone,
    website: mockUserData.website,
    location: mockUserData.location,
    bio: mockUserData.bio
  })
  const [preferences, setPreferences] = useState(mockUserData.preferences)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePreferenceChange = (field: string, value: boolean) => {
    setPreferences(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = () => {
    // Simulate save
    toast.success('Profile updated successfully')
    setIsEditing(false)
  }

  const handleSavePreferences = () => {
    // Simulate save
    toast.success('Preferences saved')
  }

  const handleCancelEdit = () => {
    setFormData({
      name: mockUserData.name,
      email: mockUserData.email,
      phone: mockUserData.phone,
      website: mockUserData.website,
      location: mockUserData.location,
      bio: mockUserData.bio
    })
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="stats">Stats & Achievements</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="plan">Plan & Billing</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details and public profile</CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleCancelEdit}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user?.imageUrl} />
                      <AvatarFallback>
                        {formData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <div>
                        <Button variant="outline" size="sm">
                          <Camera className="h-4 w-4 mr-2" />
                          Change Photo
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          JPG, PNG or GIF. Max 5MB.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Form Fields */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={!isEditing}
                        />
                        {mockUserData.verified && (
                          <Badge variant="default" className="shrink-0">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="joinDate">Member Since</Label>
                      <Input
                        id="joinDate"
                        value={new Date(mockUserData.joinDate).toLocaleDateString()}
                        disabled
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      disabled={!isEditing}
                      rows={4}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Brief description for your public profile
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats & Achievements Tab */}
          <TabsContent value="stats">
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Music className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{mockUserData.stats.songsUploaded}</p>
                        <p className="text-sm text-muted-foreground">Songs Uploaded</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{mockUserData.stats.platformsConnected}</p>
                        <p className="text-sm text-muted-foreground">Platforms Connected</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{mockUserData.stats.totalRegistrations}</p>
                        <p className="text-sm text-muted-foreground">Total Registrations</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{mockUserData.stats.successRate}%</p>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>Milestones you've reached on The Plug</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {mockUserData.achievements.map((achievement) => (
                      <Card key={achievement.id} className="border-muted">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                              <achievement.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{achievement.name}</h4>
                              <p className="text-sm text-muted-foreground">{achievement.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Control your privacy and notification settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-4">Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-notifications">Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive updates about your registrations</p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={preferences.emailNotifications}
                          onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="push-notifications">Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">Browser notifications for important updates</p>
                        </div>
                        <Switch
                          id="push-notifications"
                          checked={preferences.pushNotifications}
                          onCheckedChange={(checked) => handlePreferenceChange('pushNotifications', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="marketing-emails">Marketing Emails</Label>
                          <p className="text-sm text-muted-foreground">News, tips, and promotional content</p>
                        </div>
                        <Switch
                          id="marketing-emails"
                          checked={preferences.marketingEmails}
                          onCheckedChange={(checked) => handlePreferenceChange('marketingEmails', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-4">Privacy</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="public-profile">Public Profile</Label>
                          <p className="text-sm text-muted-foreground">Allow others to view your profile</p>
                        </div>
                        <Switch
                          id="public-profile"
                          checked={preferences.publicProfile}
                          onCheckedChange={(checked) => handlePreferenceChange('publicProfile', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="show-stats">Show Statistics</Label>
                          <p className="text-sm text-muted-foreground">Display your stats on your public profile</p>
                        </div>
                        <Switch
                          id="show-stats"
                          checked={preferences.showStats}
                          onCheckedChange={(checked) => handlePreferenceChange('showStats', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleSavePreferences}>
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plan & Billing Tab */}
          <TabsContent value="plan">
            <div className="space-y-6">
              <Card className="border-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Current Plan</CardTitle>
                      <CardDescription>You're currently on the Pro plan</CardDescription>
                    </div>
                    <Badge className="text-lg px-4 py-1">Pro</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Monthly Cost</p>
                        <p className="text-2xl font-bold">$29/month</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Next Billing Date</p>
                        <p className="text-2xl font-bold">Feb 15, 2024</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Member Since</p>
                        <p className="text-2xl font-bold">Jan 15, 2024</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button variant="outline">Change Plan</Button>
                      <Button variant="outline">Update Payment Method</Button>
                      <Button variant="outline">Download Invoices</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You have 71 songs remaining in your monthly upload limit. 
                  Your limit will reset on February 15, 2024.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}