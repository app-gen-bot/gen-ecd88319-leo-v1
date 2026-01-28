'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Calendar, Heart, Clock } from 'lucide-react'
import { formatDueDate, getInitials } from '@/lib/utils'

// Mock completed tasks
const mockCompletedTasks = [
  {
    id: '5',
    description: 'Organize the garage',
    transformed_message: "Garage hero! 🦸 Your organizational superpowers transformed our garage into a masterpiece!",
    assignee_name: 'Sarah',
    assignee_avatar: '',
    assigned_by_name: 'Dad',
    priority: 'medium',
    category: 'household',
    due_date: new Date(Date.now() - 86400000).toISOString(),
    completed_at: new Date(Date.now() - 3600000).toISOString(),
    completion_message: "I finished organizing the garage! It looks fantastic now - you're going to love it! 🎆",
  },
  {
    id: '6',
    description: 'Bake cookies',
    transformed_message: "Master baker! 🍪 Your delicious creations bring so much joy to our family!",
    assignee_name: 'Emma',
    assignee_avatar: '',
    assigned_by_name: 'Mom',
    priority: 'low',
    category: 'kitchen',
    due_date: new Date(Date.now() - 172800000).toISOString(),
    completed_at: new Date(Date.now() - 86400000).toISOString(),
    completion_message: "Cookies are done and they smell amazing! Made extra for everyone 💕",
  },
  {
    id: '7',
    description: 'Wash the car',
    transformed_message: "Car spa specialist! 🚗✨ Thanks to you, our ride shines like new!",
    assignee_name: 'Mike',
    assignee_avatar: '',
    assigned_by_name: 'Mom',
    priority: 'low',
    category: 'outdoor',
    due_date: new Date(Date.now() - 259200000).toISOString(),
    completed_at: new Date(Date.now() - 172800000).toISOString(),
    completion_message: "Car is sparkling clean inside and out! Even vacuumed the seats 🌟",
  },
]

export default function CompletedTasksPage() {
  const [tasks] = useState(mockCompletedTasks)
  const [dateRange, setDateRange] = useState('all')

  const filteredTasks = tasks.filter(task => {
    if (dateRange === 'all') return true
    
    const completedDate = new Date(task.completed_at)
    const now = new Date()
    
    switch (dateRange) {
      case 'today':
        return completedDate.toDateString() === now.toDateString()
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return completedDate >= weekAgo
      case 'month':
        return completedDate.getMonth() === now.getMonth() && 
               completedDate.getFullYear() === now.getFullYear()
      default:
        return true
    }
  })

  if (tasks.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Completed Tasks</h1>
          <p className="text-muted-foreground">Celebrate your family&apos;s accomplishments</p>
        </div>
        
        <Tabs defaultValue="completed" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="active" asChild>
              <Link href="/tasks/active">Active</Link>
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card className="flex flex-col items-center justify-center py-12">
          <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No completed tasks yet</h3>
          <p className="text-muted-foreground text-center mb-6">
            Complete your first task to see it celebrated here!
          </p>
          <Button asChild>
            <Link href="/tasks/active">
              View Active Tasks
            </Link>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Completed Tasks</h1>
        <p className="text-muted-foreground">Celebrate your family&apos;s accomplishments</p>
      </div>
      
      <Tabs defaultValue="completed" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active" asChild>
            <Link href="/tasks/active">Active</Link>
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="completed" className="space-y-4">
          {/* Date Range Filter */}
          <div className="flex gap-2">
            <Button
              variant={dateRange === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange('all')}
            >
              All Time
            </Button>
            <Button
              variant={dateRange === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange('today')}
            >
              Today
            </Button>
            <Button
              variant={dateRange === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange('week')}
            >
              This Week
            </Button>
            <Button
              variant={dateRange === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange('month')}
            >
              This Month
            </Button>
          </div>
          
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Completed</p>
                    <p className="text-2xl font-bold">{filteredTasks.length}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Love Points Earned</p>
                    <p className="text-2xl font-bold">+{filteredTasks.length * 10}</p>
                  </div>
                  <Heart className="h-8 w-8 text-primary" fill="currentColor" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Top Contributor</p>
                    <p className="text-2xl font-bold">Sarah</p>
                  </div>
                  <Badge className="lovely-gradient">Star</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Completed Tasks List */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No completed tasks in this time range</p>
              </Card>
            ) : (
              filteredTasks.map((task) => (
                <Card key={task.id} className="overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-2">
                    <p className="text-center text-sm font-medium text-green-700 dark:text-green-400">
                      ✅ Completed!
                    </p>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={task.assignee_avatar} />
                            <AvatarFallback className="text-xs">
                              {getInitials(task.assignee_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{task.assignee_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Assigned by {task.assigned_by_name}
                            </p>
                          </div>
                        </div>
                        
                        <Badge variant="outline" className="text-xs">
                          +10 💕
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {task.transformed_message}
                        </p>
                        
                        {task.completion_message && (
                          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <p className="text-sm font-medium mb-1">Completion Message:</p>
                            <p className="text-sm">{task.completion_message}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            Was due {formatDueDate(task.due_date)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            Completed {new Date(task.completed_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <Badge variant="outline" className="text-xs">
                          {task.category}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}