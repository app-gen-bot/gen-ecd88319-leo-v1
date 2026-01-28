'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useAuth, AuthCheck } from '@/contexts/auth-context'
import { getInitials, formatDueDate } from '@/lib/utils'
import { 
  ChevronLeft, Heart, Trophy, Star, CheckCircle, Clock, 
  TrendingUp, Calendar, Award, MessageCircle, Settings,
  Shield, UserX, Loader2, ArrowRight
} from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

// Mock member data
const mockMember = {
  id: '2',
  name: 'Sarah Johnson',
  email: 'sarah@example.com',
  avatar: '',
  role: 'child' as const,
  personality_type: 'playful' as const,
  message_styles: ['encouraging', 'funny'],
  family_id: '1',
  created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  stats: {
    total_tasks: 45,
    completed_tasks: 38,
    completion_rate: 84,
    love_score_contribution: 320,
    current_streak: 5,
    longest_streak: 12,
  },
  active_tasks: [
    {
      id: '1',
      description: 'Clean your room',
      due_date: new Date(Date.now() + 86400000).toISOString(),
      priority: 'medium',
      category: 'chores',
      status: 'in_progress',
    },
    {
      id: '2',
      description: 'Finish math homework',
      due_date: new Date().toISOString(),
      priority: 'high',
      category: 'homework',
      status: 'pending',
    },
  ],
  recent_achievements: [
    {
      id: '1',
      title: 'Task Master',
      description: '5 day completion streak',
      icon: '🔥',
      earned_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '2',
      title: 'Speed Demon',
      description: 'Completed 3 tasks in one day',
      icon: '⚡',
      earned_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ],
}

const ROLE_LABELS = {
  parent: 'Parent/Guardian',
  partner: 'Partner',
  child: 'Child',
  other: 'Family Member',
}

const PERSONALITY_LABELS = {
  formal: 'Formal & Respectful',
  playful: 'Playful & Fun',
  romantic: 'Romantic & Sweet',
  funny: 'Funny & Silly',
  friendly: 'Friendly & Warm',
}

export default function MemberProfilePage() {
  return (
    <AuthCheck>
      <MemberProfileContent />
    </AuthCheck>
  )
}

function MemberProfileContent() {
  const router = useRouter()
  const params = useParams()
  const { user, family } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const isCurrentUser = user?.id === params.memberId
  const isAdmin = user?.role === 'parent'

  const handleSendAppreciation = () => {
    router.push(`/create-task?type=appreciation&recipient=${params.memberId}`)
  }

  const handleRemoveMember = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Member removed from family')
      router.push('/family/members')
    } catch (error) {
      toast.error('Failed to remove member')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
      case 'completed':
        return 'bg-green-500/10 text-green-700 dark:text-green-400'
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-700 dark:text-red-400'
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
      case 'low':
        return 'bg-green-500/10 text-green-700 dark:text-green-400'
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
    }
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/family/members">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Member Profile</h1>
            <p className="text-muted-foreground">View family member details</p>
          </div>
        </div>
        
        {isCurrentUser && (
          <Button asChild>
            <Link href="/profile/edit">
              <Settings className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        )}
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={mockMember.avatar} />
              <AvatarFallback className="text-2xl">{getInitials(mockMember.name)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h2 className="text-2xl font-bold">{mockMember.name}</h2>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Badge variant="secondary">{ROLE_LABELS[mockMember.role]}</Badge>
                  {mockMember.id === '1' && (
                    <Badge variant="default">
                      <Shield className="mr-1 h-3 w-3" />
                      Admin
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-muted-foreground">{mockMember.email}</p>
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge variant="outline">
                  {PERSONALITY_LABELS[mockMember.personality_type]}
                </Badge>
                {mockMember.message_styles.map((style) => (
                  <Badge key={style} variant="outline" className="capitalize">
                    {style}
                  </Badge>
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground">
                Member since {new Date(mockMember.created_at).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              {!isCurrentUser && (
                <>
                  <Button onClick={handleSendAppreciation}>
                    <Heart className="mr-2 h-4 w-4" />
                    Send Appreciation
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/tasks?assignee=${params.memberId}`}>
                      View Tasks
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{mockMember.stats.completion_rate}%</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <Progress value={mockMember.stats.completion_rate} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Love Score Contribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{mockMember.stats.love_score_contribution}</span>
              <Heart className="h-4 w-4 text-pink-500" fill="currentColor" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Points added to family</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{mockMember.stats.current_streak}</span>
              <span className="text-muted-foreground">days</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Best: {mockMember.stats.longest_streak} days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{mockMember.stats.completed_tasks}</span>
              <span className="text-muted-foreground">/ {mockMember.stats.total_tasks}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Completed tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Active Tasks</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Last 7 days of activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Completed &quot;Clean the kitchen&quot;</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-yellow-500/10">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Earned &quot;Task Master&quot; achievement</p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-500/10">
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Responded to task request</p>
                    <p className="text-xs text-muted-foreground">2 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tasks" className="space-y-4">
          {mockMember.active_tasks.length > 0 ? (
            mockMember.active_tasks.map((task) => (
              <Card key={task.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{task.description}</CardTitle>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-3 w-3" />
                        <span className="text-muted-foreground">
                          Due {formatDueDate(task.due_date)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge variant="secondary" className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/tasks/${task.id}`}>
                      View Task
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active tasks</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="achievements" className="space-y-4">
          {mockMember.recent_achievements.map((achievement) => (
            <Card key={achievement.id}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{achievement.title}</CardTitle>
                    <CardDescription>{achievement.description}</CardDescription>
                    <p className="text-xs text-muted-foreground mt-1">
                      Earned {new Date(achievement.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
          
          <Button variant="outline" className="w-full">
            View All Achievements
          </Button>
        </TabsContent>
      </Tabs>

      {/* Admin Actions */}
      {isAdmin && !isCurrentUser && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Admin Actions</CardTitle>
            <CardDescription>Manage this family member</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <UserX className="mr-2 h-4 w-4" />
                  Remove from Family
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove {mockMember.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove them from the family and delete all their tasks and messages.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRemoveMember}
                    disabled={isLoading}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Removing...
                      </>
                    ) : (
                      'Remove Member'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
    </div>
  )
}