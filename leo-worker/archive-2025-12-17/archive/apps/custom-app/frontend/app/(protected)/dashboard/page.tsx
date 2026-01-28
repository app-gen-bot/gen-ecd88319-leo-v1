'use client'

import { useAuth } from '@/lib/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  MessageSquare, 
  FileText, 
  Scale, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Shield,
  Camera,
  Mail,
  BookOpen,
  ArrowRight,
  Info,
  Building2,
  Calendar,
  Bell,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { format, formatDistanceToNow } from 'date-fns'

interface DashboardStats {
  activeDisputes: number
  pendingDocuments: number
  unreadMessages: number
  totalDeposits: number
  recentActivity: Array<{
    id: string
    type: string
    title: string
    timestamp: string
    status?: string
  }>
  upcomingDeadlines: Array<{
    id: string
    title: string
    dueDate: string
    type: string
    daysRemaining: number
  }>
}

export default function DashboardPage() {
  const { user, currentProperty } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Load all dashboard data
        const [disputes, documents, messages, deposits] = await Promise.all([
          apiClient.disputes.list(),
          apiClient.documentation.getSessions(),
          apiClient.messages.list({ unread: true }),
          apiClient.deposits.list(),
        ])

        // Calculate stats
        const activeDisputes = disputes.filter(d => d.status === 'open' || d.status === 'in_progress').length
        const pendingDocuments = 0 // No pending documents in mock data
        const unreadMessages = messages.filter(m => !m.read).length
        const totalDeposits = deposits.reduce((sum, d) => sum + d.amount, 0)

        // Build recent activity
        const recentActivity = [
          ...disputes.slice(0, 2).map(d => ({
            id: d.id,
            type: 'dispute',
            title: d.title,
            timestamp: d.updated_at,
            status: d.status
          })),
          ...documents.slice(0, 2).map(d => ({
            id: d.id,
            type: 'documentation',
            title: `${d.type.charAt(0).toUpperCase() + d.type.slice(1).replace('_', ' ')} Documentation`,
            timestamp: d.created_at,
            status: d.status
          })),
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5)

        // Build upcoming deadlines
        const upcomingDeadlines = [
          {
            id: '1',
            title: 'Rent Due',
            dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
            type: 'payment',
            daysRemaining: Math.ceil((new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          },
          ...disputes
            .filter(d => d.status === 'open')
            .map(d => ({
              id: d.id,
              title: `${d.title} - Response Due`,
              dueDate: new Date(new Date(d.created_at).getTime() + 30 * 86400000).toISOString(), // 30 days from creation
              type: 'dispute',
              daysRemaining: Math.ceil((new Date(new Date(d.created_at).getTime() + 30 * 86400000).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            }))
        ].filter(d => d.daysRemaining > 0 && d.daysRemaining <= 30)
          .sort((a, b) => a.daysRemaining - b.daysRemaining)

        setStats({
          activeDisputes,
          pendingDocuments,
          unreadMessages,
          totalDeposits,
          recentActivity,
          upcomingDeadlines
        })
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
        setError('Failed to load dashboard data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadDashboardData()
    }
  }, [user])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getQuickTip = () => {
    const tips = [
      'Document everything - photos, emails, and texts can be crucial evidence.',
      'Always communicate with your landlord in writing for a paper trail.',
      'Know your rights - California law strongly protects tenant interests.',
      'Security deposits must be returned within 21 days of move-out.',
      'Landlords must give 24-hour notice before entering your unit.',
    ]
    return tips[Math.floor(Math.random() * tips.length)]
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">
          {getGreeting()}, {user?.first_name}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's your tenant rights overview
        </p>
      </div>

      {/* Current Property */}
      {currentProperty && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Current Property</CardTitle>
              </div>
              <Link href="/properties">
                <Button variant="ghost" size="sm">
                  Manage
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{currentProperty.address}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>Move-in: {format(new Date(currentProperty.move_in_date), 'MMM d, yyyy')}</span>
              <Badge variant="secondary">
                {currentProperty.property_type.replace('_', ' ')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Disputes</CardTitle>
            <Scale className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.activeDisputes || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.activeDisputes === 0 ? 'All resolved' : 'Needs attention'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Documents</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.pendingDocuments || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Ready to review
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <Mail className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.unreadMessages || 0}</div>
                <p className="text-xs text-muted-foreground">
                  From landlord
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  ${stats?.totalDeposits?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tracking interest
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/ai-advisor">
          <Button className="w-full justify-start" variant="outline">
            <MessageSquare className="mr-2 h-4 w-4" />
            Ask AI Legal Advisor
          </Button>
        </Link>
        <Link href="/documentation/new">
          <Button className="w-full justify-start" variant="outline">
            <Camera className="mr-2 h-4 w-4" />
            Document an Issue
          </Button>
        </Link>
        <Link href="/document-review">
          <Button className="w-full justify-start" variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Review Lease
          </Button>
        </Link>
        <Link href="/letters/new">
          <Button className="w-full justify-start" variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Generate Letter
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Upcoming Deadlines */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Deadlines</CardTitle>
              <Badge variant="secondary">
                <Clock className="mr-1 h-3 w-3" />
                Next 30 days
              </Badge>
            </div>
            <CardDescription>
              Important dates and deadlines to remember
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : stats?.upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p>No upcoming deadlines!</p>
                <p className="text-sm">You're all caught up</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {deadline.type === 'payment' && <DollarSign className="h-5 w-5 text-green-500" />}
                      {deadline.type === 'dispute' && <Scale className="h-5 w-5 text-orange-500" />}
                      <div>
                        <p className="font-medium text-sm">{deadline.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(deadline.dueDate), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <Badge variant={deadline.daysRemaining <= 7 ? 'destructive' : 'secondary'}>
                      {deadline.daysRemaining} days
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Link href="/activity">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <CardDescription>
              Your latest actions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : stats?.recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">Start documenting to see updates</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {activity.type === 'dispute' && <Scale className="h-4 w-4 text-orange-500" />}
                      {activity.type === 'documentation' && <Camera className="h-4 w-4 text-blue-500" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                        {activity.status && (
                          <Badge variant="outline" className="text-xs">
                            {activity.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Tip */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Daily Tip</AlertTitle>
        <AlertDescription>
          {getQuickTip()}
        </AlertDescription>
      </Alert>

      {/* Resources Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Resources</CardTitle>
          <CardDescription>
            Essential information at your fingertips
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/knowledge/tenant-rights-basics">
              <div className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-medium">Know Your Rights</h3>
                  <p className="text-sm text-muted-foreground">
                    California tenant law basics
                  </p>
                </div>
              </div>
            </Link>
            
            <Link href="/knowledge/emergency-resources">
              <div className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                <AlertCircle className="h-8 w-8 text-orange-500" />
                <div>
                  <h3 className="font-medium">Emergency Resources</h3>
                  <p className="text-sm text-muted-foreground">
                    Urgent help and contacts
                  </p>
                </div>
              </div>
            </Link>
            
            <Link href="/knowledge/forms">
              <div className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                <BookOpen className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="font-medium">Legal Forms</h3>
                  <p className="text-sm text-muted-foreground">
                    Templates and documents
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}