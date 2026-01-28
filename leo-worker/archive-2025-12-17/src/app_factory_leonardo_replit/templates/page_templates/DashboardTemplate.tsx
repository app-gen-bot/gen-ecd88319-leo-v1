/**
 * DashboardTemplate - Template for user dashboards with stats and data overview
 * 
 * This template provides:
 * - Stats cards with key metrics
 * - Recent activity feed
 * - Quick action buttons
 * - Data visualization areas
 * - Responsive grid layout
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Plus,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import { api } from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';

export function DashboardPage() {
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.dashboard?.getStats?.() || Promise.resolve(null),
  });

  // Fetch recent activity
  const { data: activity, isLoading: activityLoading, error: activityError } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => api.dashboard?.getRecentActivity?.() || Promise.resolve([]),
  });

  if (statsLoading) return <LoadingState variant="card" />;
  if (statsError) return <ErrorState error={statsError} />;

  // Default stats if API doesn't provide them
  const defaultStats = [
    {
      title: 'Total Revenue',
      value: '$45,231.89',
      change: '+20.1%',
      changeType: 'positive' as const,
      icon: DollarSign,
    },
    {
      title: 'Active Users',
      value: '2,350',
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      title: 'Conversion Rate',
      value: '12.5%',
      change: '+2.4%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
    {
      title: 'Monthly Growth',
      value: '8.2%',
      change: '-1.2%',
      changeType: 'negative' as const,
      icon: BarChart3,
    },
  ];

  const displayStats = stats || defaultStats;
  const displayActivity = activity || [
    {
      id: 1,
      type: 'user_signup',
      description: 'New user registration',
      timestamp: new Date().toISOString(),
      user: 'John Doe'
    },
    {
      id: 2,
      type: 'order_completed',
      description: 'Order #1234 completed',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      amount: '$123.45'
    },
    {
      id: 3,
      type: 'payment_received',
      description: 'Payment received',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      amount: '$89.99'
    }
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your account.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Item
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <span
                      className={`inline-flex items-center ${
                        stat.changeType === 'positive' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}
                    >
                      <ArrowUpRight className={`h-3 w-3 mr-1 ${
                        stat.changeType === 'negative' ? 'rotate-90' : ''
                      }`} />
                      {stat.change}
                    </span>
                    <span>from last month</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chart Area */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chart visualization would go here</p>
                  <p className="text-sm">Connect your analytics service</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <LoadingState variant="default" />
              ) : (
                <div className="space-y-4">
                  {displayActivity.map((item) => (
                    <div key={item.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {item.user && (
                            <span className="text-xs text-muted-foreground">
                              {item.user}
                            </span>
                          )}
                          {item.amount && (
                            <Badge variant="secondary" className="text-xs">
                              {item.amount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {displayActivity.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-medium">Schedule</h3>
              <p className="text-sm text-muted-foreground">Manage appointments</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-medium">Customers</h3>
              <p className="text-sm text-muted-foreground">View customer list</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <h3 className="font-medium">Reports</h3>
              <p className="text-sm text-muted-foreground">View detailed reports</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <h3 className="font-medium">Billing</h3>
              <p className="text-sm text-muted-foreground">Manage payments</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}