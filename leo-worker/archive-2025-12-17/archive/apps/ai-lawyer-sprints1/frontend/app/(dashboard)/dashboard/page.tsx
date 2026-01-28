"use client"

import { useNextAuth } from '@/contexts/nextauth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  MessageSquare, 
  FileText, 
  Shield, 
  BookOpen,
  ArrowRight,
  Sparkles,
  Clock,
  AlertCircle,
  User
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useNextAuth();

  const quickActions = [
    {
      title: 'Ask a Legal Question',
      description: 'Get instant answers about your tenant rights',
      icon: MessageSquare,
      href: '/dashboard/chat',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'View Conversation History',
      description: 'Access your previous legal consultations',
      icon: Clock,
      href: '/dashboard/history',
      color: 'text-green-600 bg-green-50',
    },
    {
      title: 'Security Settings',
      description: 'Manage your account security and 2FA',
      icon: Shield,
      href: '/settings',
      color: 'text-purple-600 bg-purple-50',
    },
    {
      title: 'Profile Settings',
      description: 'Update your personal information',
      icon: User,
      href: '/profile',
      color: 'text-orange-600 bg-orange-50',
    },
  ];

  const recentActivity = [
    {
      type: 'chat',
      title: 'Security deposit question',
      time: '2 hours ago',
      icon: MessageSquare,
    },
    {
      type: 'document',
      title: 'Lease agreement analyzed',
      time: 'Yesterday',
      icon: FileText,
    },
    {
      type: 'knowledge',
      title: 'Read eviction guide',
      time: '3 days ago',
      icon: BookOpen,
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-600 mt-2">
          How can we help you with your {user?.userType === 'tenant' ? 'rental' : 'property'} today?
        </p>
      </div>

      {/* Alert Banner */}
      <Card className="mb-8 border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <CardTitle className="text-lg text-amber-900">Legal Disclaimer</CardTitle>
              <CardDescription className="text-amber-700 mt-1">
                This service provides legal information, not legal advice. For specific legal matters, 
                always consult with a qualified attorney licensed in California.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <activity.icon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                  <Link href="/dashboard/history">
                    <Button variant="outline" className="w-full mt-4">
                      View All History
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No recent activity</p>
                  <Link href="/dashboard/chat">
                    <Button>Start Your First Conversation</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips & Resources */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Tips for {user?.userType === 'tenant' ? 'Tenants' : 'Landlords'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                {user?.userType === 'tenant' ? (
                  <>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Take photos of your unit before move-in and save them</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Your landlord must give 24-hour notice before entering</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Security deposits must be returned within 21 days of move-out</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>You have the right to a habitable living space</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Screen tenants carefully but follow fair housing laws</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Provide proper notice for all entries and inspections</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Document all maintenance and repairs thoroughly</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Keep security deposits in a separate account</span>
                    </li>
                  </>
                )}
              </ul>
              <Link href="/dashboard/chat">
                <Button variant="outline" className="w-full mt-4">
                  Ask a Question
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}