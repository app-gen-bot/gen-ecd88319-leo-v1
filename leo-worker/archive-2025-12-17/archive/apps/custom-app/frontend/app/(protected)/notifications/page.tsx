"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Bell, Target, Check, Trophy, Users, CheckCheck } from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import type { Notification } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

export default function NotificationsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  useEffect(() => {
    loadNotifications()
  }, [user])

  const loadNotifications = async () => {
    try {
      setIsLoading(true)
      // Mock data - in real app, this would be an API call
      const mockNotifications: Notification[] = [
        {
          id: "1",
          user_id: user?.id || "user-1",
          type: "task_assigned",
          title: "New task assigned",
          message: "Mom assigned you \"Clean your room with sparkles ✨\"",
          action_url: "/tasks/task-1",
          created_at: new Date().toISOString(),
          read: false,
                  },
        {
          id: "2",
          user_id: user?.id || "user-1",
          type: "task_completed",
          title: "Task completed",
          message: "Dad completed \"Take out the trash\" and earned 20 love points!",
          action_url: "/tasks/task-2",
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
        },
        {
          id: "3",
          user_id: user?.id || "user-1",
          type: "achievement_earned",
          title: "Achievement unlocked!",
          message: "You've earned the \"Week Warrior\" badge for a 7-day streak!",
          action_url: "/stats/achievements",
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read: true,
        },
        {
          id: "4",
          user_id: user?.id || "user-1",
          type: "task_response",
          title: "Task response",
          message: "Sarah accepted your task \"Help with homework\" with love!",
          action_url: "/tasks/task-3",
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
        },
        {
          id: "5",
          user_id: user?.id || "user-1",
          type: "family_invite",
          title: "New family member",
          message: "Grandma has joined your family!",
          action_url: "/family",
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
        }
      ]
      setNotifications(mockNotifications)
    } catch (error: any) {
      toast({
        title: "Error loading notifications",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      // Mock update - in real app, this would be an API call
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
      toast({
        title: "Marked as read",
        description: "Notification marked as read"
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to mark as read",
        variant: "destructive"
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      // Mock update - in real app, this would be an API call
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      )
      toast({
        title: "All caught up!",
        description: "All notifications marked as read"
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to mark all as read",
        variant: "destructive"
      })
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task_assigned":
      case "task_response":
        return <Target className="h-5 w-5" />
      case "task_completed":
        return <Check className="h-5 w-5" />
      case "achievement_earned":
        return <Trophy className="h-5 w-5" />
      case "family_invite":
        return <Users className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getNotificationLink = (notification: Notification): string | null => {
    return notification.action_url || null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  const filteredNotifications = filter === "unread" 
    ? notifications.filter(n => !n.read)
    : notifications

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-2">
            Stay updated with your family's activities
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">
            All
            <Badge variant="secondary" className="ml-2">
              {notifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <Badge className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  {filter === "unread" ? "All caught up!" : "No notifications yet"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {filter === "unread" 
                    ? "You've read all your notifications" 
                    : "When you get notifications, they'll appear here"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => {
                const link = getNotificationLink(notification)
                const content = (
                  <Card 
                    className={`transition-all cursor-pointer hover:shadow-md ${
                      notification.read ? "bg-muted/20" : "bg-primary/5 border-primary/20"
                    }`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full ${
                          notification.read ? "bg-muted" : "bg-primary/10"
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <p className={`font-medium ${!notification.read && "text-foreground"}`}>
                                {notification.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {notification.message}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-primary" />
                              )}
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )

                return link ? (
                  <Link key={notification.id} href={link}>
                    {content}
                  </Link>
                ) : (
                  <div key={notification.id}>
                    {content}
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}