"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { apiClient } from "@/lib/api-client"
import { type Activity } from "@/lib/types"
import { format } from "date-fns"
import { 
  FileText, 
  AlertTriangle, 
  MessageSquare, 
  DollarSign,
  Camera,
  Mail,
  Bot,
  Calendar
} from "lucide-react"
import Link from "next/link"

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [])

  const loadActivities = async () => {
    try {
      const data = await apiClient.getActivity(50)
      setActivities(data)
    } catch (error) {
      console.error('Failed to load activities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'dispute_created':
      case 'dispute_updated':
        return <AlertTriangle className="h-4 w-4" />
      case 'document_uploaded':
      case 'lease_analyzed':
        return <FileText className="h-4 w-4" />
      case 'message_sent':
      case 'message_received':
        return <MessageSquare className="h-4 w-4" />
      case 'deposit_tracked':
      case 'deposit_returned':
        return <DollarSign className="h-4 w-4" />
      case 'property_documented':
        return <Camera className="h-4 w-4" />
      case 'letter_sent':
        return <Mail className="h-4 w-4" />
      case 'ai_question':
        return <Bot className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    if (type.includes('dispute')) return 'destructive'
    if (type.includes('message')) return 'secondary'
    if (type.includes('deposit')) return 'success'
    return 'default'
  }

  const groupActivitiesByDate = (activities: Activity[]) => {
    const grouped: Record<string, Activity[]> = {}
    
    activities.forEach(activity => {
      const date = format(new Date(activity.timestamp), 'yyyy-MM-dd')
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(activity)
    })
    
    return grouped
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const groupedActivities = groupActivitiesByDate(activities)
  const sortedDates = Object.keys(groupedActivities).sort((a, b) => b.localeCompare(a))

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Activity History</h1>
        <p className="text-muted-foreground mt-1">
          Track all your actions and updates
        </p>
      </div>

      {activities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Activity Yet</h3>
            <p className="text-muted-foreground text-center">
              Your activity history will appear here as you use the app.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your last 50 actions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              {sortedDates.map((date) => {
                const dateActivities = groupedActivities[date]
                const formattedDate = format(new Date(date), 'EEEE, MMMM d, yyyy')
                const isToday = date === format(new Date(), 'yyyy-MM-dd')
                const isYesterday = date === format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')
                
                return (
                  <div key={date} className="mb-8">
                    <h3 className="font-semibold text-sm text-muted-foreground mb-4 sticky top-0 bg-background py-2">
                      {isToday ? 'Today' : isYesterday ? 'Yesterday' : formattedDate}
                    </h3>
                    <div className="space-y-4">
                      {dateActivities.map((activity) => (
                        <div key={activity.id} className="flex gap-4">
                          <div className="relative">
                            <div className={`h-8 w-8 rounded-full bg-${getActivityColor(activity.type)}/10 flex items-center justify-center`}>
                              {getActivityIcon(activity.type)}
                            </div>
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {activity.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{format(new Date(activity.timestamp), 'h:mm a')}</span>
                              {activity.link && (
                                <Link href={activity.link} className="text-primary hover:underline">
                                  View details
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}