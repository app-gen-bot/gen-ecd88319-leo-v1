'use client';

import { useAuth } from '@/contexts/auth-context';
import { AuthCheck } from '@/components/auth-check';
import { DashboardNav } from '@/components/dashboard-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Shield, 
  FileText, 
  Bell, 
  Smartphone, 
  CreditCard,
  ChevronRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  const menuItems = [
    {
      icon: User,
      title: 'Personal Information',
      description: 'Update your personal details',
      href: '/profile/edit',
    },
    {
      icon: Shield,
      title: 'Security Settings',
      description: 'Manage your security preferences',
      href: '/profile/security',
    },
    {
      icon: FileText,
      title: 'KYC Status',
      description: 'View your verification status',
      href: '/profile/kyc',
      badge: user?.kyc_status === 'verified' ? 'Verified' : 'Pending',
      badgeVariant: user?.kyc_status === 'verified' ? 'success' : 'warning',
    },
    {
      icon: Bell,
      title: 'Notification Preferences',
      description: 'Control how we contact you',
      href: '/profile/security#notifications',
    },
    {
      icon: Smartphone,
      title: 'Connected Devices',
      description: 'Manage your trusted devices',
      href: '/profile/security#devices',
    },
    {
      icon: CreditCard,
      title: 'Payment Methods',
      description: 'Manage your bank accounts',
      href: '/wallet',
    },
  ];

  return (
    <AuthCheck>
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>

          {/* Profile Header */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold">{user?.name}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {user?.email_verified ? (
                      <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        <CheckCircle className="h-3 w-3" />
                        Email Verified
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Email Not Verified
                      </Badge>
                    )}
                    {user?.phone_verified ? (
                      <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        <CheckCircle className="h-3 w-3" />
                        Phone Verified
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Phone Not Verified
                      </Badge>
                    )}
                  </div>
                </div>
                <Button onClick={() => router.push('/profile/edit')}>
                  Edit Profile
                </Button>
              </div>

              <Separator className="my-6" />

              {/* Account Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                  <p className="text-base mt-1">
                    {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Account Type</p>
                  <p className="text-base mt-1">
                    {user?.account_type || 'Standard'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                  <p className="text-base mt-1">${user?.total_sent?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menu Items */}
          <div className="space-y-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Card 
                  key={item.href}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(item.href)}
                >
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.badge && (
                        <Badge variant={item.badge === 'Verified' ? 'default' : 'secondary'} className={item.badge === 'Verified' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'}>
                          {item.badge}
                        </Badge>
                      )}
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Danger Zone */}
          <Card className="mt-8 border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                These actions are permanent and cannot be undone
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                Close Account
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthCheck>
  );
}