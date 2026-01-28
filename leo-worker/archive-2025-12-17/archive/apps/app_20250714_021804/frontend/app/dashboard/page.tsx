'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth, AuthCheck } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowRight, Heart, Trophy, Star, TrendingUp, CheckCircle, Clock, Users } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { formatDueDate, getInitials } from '@/lib/utils'
import Link from 'next/link'
import { toast } from 'sonner'

export default function DashboardPage() {
  return (
    <AuthCheck>
      <DashboardContent />
    </AuthCheck>
  )
}

function DashboardContent() {
  const { user, family } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)

  const fetchDashboardData = useCallback(async () => {
    try {
      // Mock dashboard data for now
      const mockData = {
        family: {
          id: family?.id,
          name: family?.name || 'The Smith Family',
          love_score: 850,
          member_count: 4,
        },
        active_tasks: [
          {
            id: '1',
            description: 'Take out the trash',
            transformed_message: "Hey superstar! 🌟 Could you work your magic and help our home stay fresh by taking out the trash? You&apos;re the best!",
            assignee_name: 'Sarah',
            assignee_avatar: '',
            due_date: new Date().toISOString(),
            priority: 'high',
            category: 'household',
          },
          {
            id: '2',
            description: 'Clean the kitchen',
            transformed_message: "Kitchen fairy needed! ✨ Your amazing cleaning skills would make our cooking space sparkle. We appreciate you so much!",
            assignee_name: 'Mike',
            assignee_avatar: '',
            due_date: new Date(Date.now() + 86400000).toISOString(),
            priority: 'medium',
            category: 'kitchen',
          },
          {
            id: '3',
            description: 'Walk the dog',
            transformed_message: "Our furry friend is hoping for an adventure with their favorite human! 🐶 Ready for some fresh air and tail wags?",
            assignee_name: 'Emma',
            assignee_avatar: '',
            due_date: new Date().toISOString(),
            priority: 'high',
            category: 'pets',
          },
        ],
        recent_messages: [
          {
            id: '1',
            sender_name: 'Mom',
            transformed_content: 'Thank you for being such an amazing helper today! Your contribution makes our home so much happier! 💕',
            message_type: 'appreciation',
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: '2',
            sender_name: 'Sarah',
            transformed_content: "I finished organizing the garage! It looks fantastic now - you're going to love it! 🎆",
            message_type: 'celebration',
            created_at: new Date(Date.now() - 7200000).toISOString(),
          },
        ],
        achievements: [
          {
            id: '1',
            name: 'Task Master',
            description: 'Complete 10 tasks',
            icon: '🏆',
            progress: 8,
            total: 10,
          },
          {
            id: '2',
            name: 'Helping Hand',
            description: 'Help 5 family members',
            icon: '🤝',
            progress: 5,
            total: 5,
            unlocked_at: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Speed Demon',
            description: 'Complete tasks before deadline',
            icon: '⚡',
            progress: 3,
            total: 5,
          },
        ],
        member_stats: [
          {
            member_id: '1',
            name: 'Sarah',
            avatar: '',
            active_tasks: 3,
            completed_today: 2,
          },
          {
            member_id: '2',
            name: 'Mike',
            avatar: '',
            active_tasks: 2,
            completed_today: 1,
          },
          {
            member_id: '3',
            name: 'Emma',
            avatar: '',
            active_tasks: 1,
            completed_today: 3,
          },
          {
            member_id: '4',
            name: 'Dad',
            avatar: '',
            active_tasks: 2,
            completed_today: 0,
          },
        ],
      }
      
      setDashboardData(mockData)
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [family?.id, family?.name])
  
  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-muted rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg" />
          ))}
        </div>
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with {family?.name || 'your family'} today.
        </p>
      </div>

      {/* Love Score Card */}
      <Card className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Family Love Score</CardTitle>
              <CardDescription>Keep spreading love and watch it grow!</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold lovely-gradient-text">
                {dashboardData?.family.love_score}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                +50 this week
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={85} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            850 / 1000 points to next milestone
          </p>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.active_tasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.active_tasks.filter((t: any) => t.priority === 'high').length} high priority
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.member_stats.reduce((sum: number, m: any) => sum + m.completed_today, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Great job, team!
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Family Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.family.member_count}</div>
            <p className="text-xs text-muted-foreground">
              All actively participating
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.achievements.filter((a: any) => a.unlocked_at).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.achievements.length - dashboardData?.achievements.filter((a: any) => a.unlocked_at).length} in progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Member Task Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Family Task Overview</CardTitle>
            <Button variant="ghost" asChild>
              <Link href="/family/members">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData?.member_stats.map((member: any) => (
              <div key={member.member_id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.completed_today} completed today
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {member.active_tasks} active
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Tasks</CardTitle>
              <Button variant="ghost" asChild>
                <Link href="/tasks/active">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.active_tasks.slice(0, 3).map((task: any) => (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={task.assignee_avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(task.assignee_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{task.assignee_name}</span>
                    </div>
                    <Badge
                      variant={task.priority === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {task.transformed_message}
                  </p>
                  <div className="flex items-center mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    Due {formatDueDate(task.due_date)}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Love Messages</CardTitle>
              <Button variant="ghost" asChild>
                <Link href="/messages/history">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.recent_messages.map((message: any) => (
                <div key={message.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{message.sender_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {message.transformed_content}
                  </p>
                  {message.message_type === 'appreciation' && (
                    <Badge variant="outline" className="text-xs">
                      <Heart className="h-3 w-3 mr-1" />
                      Appreciation
                    </Badge>
                  )}
                  {message.message_type === 'celebration' && (
                    <Badge variant="outline" className="text-xs">
                      <Trophy className="h-3 w-3 mr-1" />
                      Celebration
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Family Achievements</CardTitle>
          <CardDescription>
            Keep completing tasks to unlock more achievements!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {dashboardData?.achievements.map((achievement: any) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border ${achievement.unlocked_at ? 'bg-primary/5 border-primary/20' : 'opacity-60'}`}
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <h3 className="font-medium mb-1">{achievement.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {achievement.description}
                </p>
                {achievement.unlocked_at ? (
                  <Badge className="text-xs">Unlocked!</Badge>
                ) : (
                  <div className="space-y-1">
                    <Progress value={(achievement.progress / achievement.total) * 100} className="h-1" />
                    <p className="text-xs text-muted-foreground">
                      {achievement.progress} / {achievement.total}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Action */}
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">Ready to spread more love?</h3>
        <Button asChild size="lg" className="lovely-gradient">
          <Link href="/create-task">
            Create a New Task
            <Heart className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}