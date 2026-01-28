'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useAuth, AuthCheck } from '@/contexts/auth-context'
import { getInitials } from '@/lib/utils'
import { Edit, Settings, Bell, Heart, Trophy, Target, Sparkles, Calendar, Camera } from 'lucide-react'
import { toast } from 'sonner'

// Mock user stats
const mockStats = {
  tasksCompleted: 42,
  tasksAssigned: 15,
  loveScore: 450,
  streak: 7,
  joinedDate: '2024-01-15',
  achievements: [
    { id: '1', name: 'Task Master', description: 'Complete 10 tasks', icon: Trophy, unlocked: true },
    { id: '2', name: 'Love Spreader', description: 'Send 50 lovely messages', icon: Heart, unlocked: true },
    { id: '3', name: 'Team Player', description: 'Help 5 family members', icon: Target, unlocked: true },
    { id: '4', name: 'Consistency King', description: '7-day streak', icon: Calendar, unlocked: true },
    { id: '5', name: 'Super Helper', description: 'Complete 100 tasks', icon: Sparkles, unlocked: false, progress: 42 },
  ],
  recentActivity: [
    { id: '1', type: 'completed', description: 'Completed "Take out the trash"', time: '2 hours ago' },
    { id: '2', type: 'received', description: 'Received lovely message from Mom', time: '5 hours ago' },
    { id: '3', type: 'assigned', description: 'Assigned "Clean the garage" to Dad', time: '1 day ago' },
  ]
}

// Mock personality types
const personalityTypes = {
  'formal': { name: 'Formal & Respectful', icon: '🎩' },
  'playful': { name: 'Playful & Fun', icon: '🎮' },
  'romantic': { name: 'Romantic & Sweet', icon: '💕' },
  'funny': { name: 'Funny & Silly', icon: '😄' },
}

// Mock message styles
const messageStyles = {
  'encouraging': { name: 'Encouraging', color: 'bg-green-500/10 text-green-700 dark:text-green-400' },
  'humorous': { name: 'Humorous', color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400' },
  'loving': { name: 'Loving', color: 'bg-pink-500/10 text-pink-700 dark:text-pink-400' },
  'motivational': { name: 'Motivational', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
  'gen-z': { name: 'Gen-Z Slang', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400' },
  'poetic': { name: 'Poetic', color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' },
}

export default function ProfilePage() {
  return (
    <AuthCheck>
      <ProfileContent />
    </AuthCheck>
  )
}

function ProfileContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!user) {
      router.push('/signin')
    }
  }, [user, router])

  if (!user) return null

  const memberSince = new Date(mockStats.joinedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                asChild
              >
                <Link href="/profile/edit">
                  <Camera className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <Badge variant="secondary">{user.role}</Badge>
              </div>
              <p className="text-muted-foreground">Member since {memberSince}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{personalityTypes[user.personality_type as keyof typeof personalityTypes].icon}</span>
                  <span className="text-sm">{personalityTypes[user.personality_type as keyof typeof personalityTypes].name}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/profile/edit">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/profile/preferences">
                  <Settings className="mr-2 h-4 w-4" />
                  Preferences
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.tasksCompleted}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Love Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{mockStats.loveScore}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.streak} days</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.tasksAssigned}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Message Styles */}
          <Card>
            <CardHeader>
              <CardTitle>Message Styles</CardTitle>
              <CardDescription>Your preferred message transformation styles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {user.message_styles.map((style) => {
                  const styleConfig = messageStyles[style as keyof typeof messageStyles]
                  return (
                    <Badge key={style} variant="secondary" className={styleConfig.color}>
                      {styleConfig.name}
                    </Badge>
                  )
                })}
              </div>
              <Button variant="link" className="mt-4 p-0" asChild>
                <Link href="/profile/preferences">Manage Preferences →</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Control when and how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span>Push notifications are enabled</span>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/profile/notifications">
                    Configure
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Achievements</CardTitle>
              <CardDescription>Celebrate your contributions to the family</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockStats.achievements.map((achievement) => {
                const Icon = achievement.icon
                return (
                  <div
                    key={achievement.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      achievement.unlocked ? 'bg-accent/50' : 'opacity-60'
                    }`}
                  >
                    <div className={`p-3 rounded-full ${
                      achievement.unlocked ? 'bg-primary/10 text-primary' : 'bg-muted'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{achievement.name}</h4>
                        {achievement.unlocked && (
                          <Badge variant="secondary" className="text-xs">Unlocked</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      {!achievement.unlocked && achievement.progress && (
                        <div className="space-y-1">
                          <Progress value={(achievement.progress / 100) * 100} className="h-2" />
                          <p className="text-xs text-muted-foreground">{achievement.progress}/100</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions and interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockStats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-muted">
                      {activity.type === 'completed' && <Trophy className="h-4 w-4" />}
                      {activity.type === 'received' && <Heart className="h-4 w-4" />}
                      {activity.type === 'assigned' && <Target className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}