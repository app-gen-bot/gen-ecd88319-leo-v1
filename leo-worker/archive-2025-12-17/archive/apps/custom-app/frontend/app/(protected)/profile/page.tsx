"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Heart,
  Trophy,
  TrendingUp,
  Calendar,
  Edit,
  Camera,
  CheckCircle2,
  Clock,
  Star,
  Zap,
  Target,
  Award,
  MessageSquareHeart,
  Settings
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { MESSAGE_STYLES, PERSONALITY_TRAITS } from "@/lib/constants"
import { cn } from "@/lib/utils"

// Mock data
const mockProfile = {
  id: "1",
  name: "John Johnson",
  email: "john@example.com",
  avatar: null,
  bio: "Dad, husband, and lover of dad jokes. Making chores fun one pun at a time!",
  member_since: "2024-01-01",
  love_score: 520,
  tasks_completed: 38,
  love_messages_sent: 142,
  current_streak: 7,
  longest_streak: 14,
  favorite_completion_time: "Morning",
  response_time_avg: "2 hours",
  message_styles: ["funny", "encouraging"],
  personality_traits: ["Playful", "Motivating", "Sweet"]
}

const mockAchievements = [
  {
    id: "1",
    name: "Task Master",
    description: "Complete 25 tasks",
    icon: Trophy,
    earned_at: "2024-01-15",
    progress: 25,
    max_progress: 25
  },
  {
    id: "2",
    name: "Love Spreader",
    description: "Send 100 love messages",
    icon: Heart,
    earned_at: "2024-01-10",
    progress: 100,
    max_progress: 100
  },
  {
    id: "3",
    name: "Week Warrior",
    description: "Complete tasks 7 days in a row",
    icon: Zap,
    earned_at: "2024-01-18",
    progress: 7,
    max_progress: 7
  },
  {
    id: "4",
    name: "Early Bird",
    description: "Complete 10 tasks before 9 AM",
    icon: Clock,
    earned_at: null,
    progress: 7,
    max_progress: 10
  },
  {
    id: "5",
    name: "Perfect Week",
    description: "100% completion rate for a week",
    icon: Star,
    earned_at: null,
    progress: 85,
    max_progress: 100
  }
]

const mockTaskHistory = [
  { id: "1", title: "Take out the trash", completed_at: "2024-01-20", love_score: 10, category: "household" },
  { id: "2", title: "Mow the lawn", completed_at: "2024-01-19", love_score: 15, category: "household" },
  { id: "3", title: "Grocery shopping", completed_at: "2024-01-18", love_score: 20, category: "shopping" },
  { id: "4", title: "Cook dinner", completed_at: "2024-01-17", love_score: 15, category: "household" },
  { id: "5", title: "Help with homework", completed_at: "2024-01-16", love_score: 25, category: "personal" }
]

const categoryColors = {
  household: "bg-blue-500",
  shopping: "bg-green-500",
  school: "bg-purple-500",
  work: "bg-orange-500",
  personal: "bg-pink-500",
  other: "bg-gray-500"
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editedBio, setEditedBio] = useState(mockProfile.bio)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleAvatarUpload = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Avatar upload will be available soon!",
    })
  }

  const handleSaveProfile = () => {
    setIsEditingProfile(false)
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully!",
    })
  }

  const getAchievementProgress = (achievement: typeof mockAchievements[0]) => {
    if (achievement.earned_at) return 100
    return (achievement.progress / achievement.max_progress) * 100
  }

  // Task completion by category
  const tasksByCategory = mockTaskHistory.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={mockProfile.avatar || undefined} />
                <AvatarFallback className="text-2xl">
                  {getInitials(mockProfile.name)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                onClick={handleAvatarUpload}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{mockProfile.name}</h1>
                  <p className="text-muted-foreground">{mockProfile.email}</p>
                </div>
                <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>
                        Update your profile information
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input id="name" defaultValue={mockProfile.name} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={editedBio}
                          onChange={(e) => setEditedBio(e.target.value)}
                          rows={3}
                          maxLength={200}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                          {editedBio.length}/200
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile}>
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              {mockProfile.bio && (
                <p className="text-sm">{mockProfile.bio}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Member since {new Date(mockProfile.member_since).toLocaleDateString()}
                </span>
                <Link href="/settings/preferences">
                  <Button variant="ghost" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Message Settings
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              Love Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProfile.love_score}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Personal total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Tasks Done
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProfile.tasks_completed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquareHeart className="h-4 w-4 text-pink-500" />
              Messages Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProfile.love_messages_sent}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Spreading love
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProfile.current_streak} days</div>
            <p className="text-xs text-muted-foreground mt-1">
              Best: {mockProfile.longest_streak} days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Showcase */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Achievement Showcase</CardTitle>
            <Link href="/stats/achievements">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <CardDescription>
            Your progress and earned badges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockAchievements.slice(0, 6).map((achievement) => {
              const Icon = achievement.icon
              const progress = getAchievementProgress(achievement)
              const isEarned = achievement.earned_at !== null
              
              return (
                <Card 
                  key={achievement.id} 
                  className={cn(
                    "relative overflow-hidden",
                    isEarned ? "bg-primary/5 border-primary/20" : ""
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-full",
                        isEarned ? "bg-primary/20" : "bg-muted"
                      )}>
                        <Icon className={cn(
                          "h-5 w-5",
                          isEarned ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium text-sm">{achievement.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {achievement.description}
                        </p>
                        {isEarned ? (
                          <p className="text-xs text-primary">
                            Earned {new Date(achievement.earned_at).toLocaleDateString()}
                          </p>
                        ) : (
                          <div className="space-y-1">
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                              {achievement.progress}/{achievement.max_progress}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    {isEarned && (
                      <div className="absolute top-2 right-2">
                        <Award className="h-4 w-4 text-yellow-500" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Message Style Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Message Style</CardTitle>
              <CardDescription>
                How your tasks get transformed
              </CardDescription>
            </div>
            <Link href="/settings/preferences">
              <Button variant="outline" size="sm">
                Update Styles
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Selected Styles</p>
            <div className="flex flex-wrap gap-2">
              {mockProfile.message_styles.map((style) => {
                const styleInfo = MESSAGE_STYLES.find(s => s.value === style)
                return styleInfo ? (
                  <Badge key={style} variant="secondary">
                    {styleInfo.label}
                  </Badge>
                ) : null
              })}
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Personality Traits</p>
            <div className="flex flex-wrap gap-2">
              {mockProfile.personality_traits.map((trait) => (
                <Badge key={trait} variant="outline">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <p className="text-sm font-medium">Example Transformation</p>
            <Card className="bg-muted/50">
              <CardContent className="pt-4 space-y-2">
                <p className="text-sm text-muted-foreground">Original:</p>
                <p className="text-sm">"Take out the trash"</p>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4 space-y-2">
                <p className="text-sm text-muted-foreground">Transformed:</p>
                <p className="text-sm">"Time for the weekly trash adventure! Those bins won't walk themselves to the curb (yet) 😄"</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Task History & Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>
              Your latest completed tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockTaskHistory.map((task) => (
                <div key={task.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      categoryColors[task.category as keyof typeof categoryColors]
                    )} />
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(task.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    +{task.love_score}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Task Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Task Insights</CardTitle>
            <CardDescription>
              Your task completion patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">By Category</p>
              <div className="space-y-2">
                {Object.entries(tasksByCategory).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-3 w-3 rounded-full",
                        categoryColors[category as keyof typeof categoryColors]
                      )} />
                      <span className="text-sm capitalize">{category}</span>
                    </div>
                    <span className="text-sm font-medium">{count} tasks</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Favorite Time</p>
                <p className="font-medium">{mockProfile.favorite_completion_time}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg Response</p>
                <p className="font-medium">{mockProfile.response_time_avg}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}