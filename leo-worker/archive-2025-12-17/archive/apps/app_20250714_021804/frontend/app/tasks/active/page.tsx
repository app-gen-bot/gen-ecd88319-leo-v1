'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth, AuthCheck } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu'
import { CheckSquare, Clock, Filter, Search, SortAsc, ChevronRight, MoreVertical, Plus } from 'lucide-react'
import { formatDueDate, getInitials, cn } from '@/lib/utils'
import { toast } from 'sonner'

// Mock data
const mockTasks = [
  {
    id: '1',
    description: 'Take out the trash',
    original_message: 'Take out the trash',
    transformed_message: "Hey superstar! 🌟 Could you work your magic and help our home stay fresh by taking out the trash? You&apos;re the best!",
    assignee_id: '1',
    assignee_name: 'Sarah',
    assignee_avatar: '',
    assigned_by_name: 'Mom',
    status: 'pending',
    priority: 'high',
    category: 'household',
    due_date: new Date().toISOString(),
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    description: 'Clean the kitchen',
    original_message: 'Clean the kitchen',
    transformed_message: "Kitchen fairy needed! ✨ Your amazing cleaning skills would make our cooking space sparkle. We appreciate you so much!",
    assignee_id: '2',
    assignee_name: 'Mike',
    assignee_avatar: '',
    assigned_by_name: 'Dad',
    status: 'accepted',
    priority: 'medium',
    category: 'kitchen',
    due_date: new Date(Date.now() + 86400000).toISOString(),
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    description: 'Walk the dog',
    original_message: 'Walk the dog',
    transformed_message: "Our furry friend is hoping for an adventure with their favorite human! 🐶 Ready for some fresh air and tail wags?",
    assignee_id: '3',
    assignee_name: 'Emma',
    assignee_avatar: '',
    assigned_by_name: 'Mom',
    status: 'in_progress',
    priority: 'high',
    category: 'pets',
    due_date: new Date().toISOString(),
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: '4',
    description: 'Buy groceries',
    original_message: 'Buy groceries',
    transformed_message: "Shopping adventure time! 🛒 Your excellent taste and smart choices keep our family well-fed. Thank you for taking care of us!",
    assignee_id: '4',
    assignee_name: 'Dad',
    assignee_avatar: '',
    assigned_by_name: 'Mom',
    status: 'pending',
    priority: 'low',
    category: 'shopping',
    due_date: new Date(Date.now() + 172800000).toISOString(),
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
]

const PRIORITY_COLORS = {
  high: 'destructive',
  medium: 'secondary',
  low: 'outline',
} as const

const STATUS_LABELS = {
  pending: 'Pending',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  completed: 'Completed',
  negotiating: 'Negotiating',
}

export default function ActiveTasksPage() {
  return (
    <AuthCheck>
      <ActiveTasksContent />
    </AuthCheck>
  )
}

function ActiveTasksContent() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState(mockTasks)
  const [filteredTasks, setFilteredTasks] = useState(mockTasks)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('due_date')
  const [filters, setFilters] = useState({
    assignee: [] as string[],
    category: [] as string[],
    priority: [] as string[],
  })

  // Get unique values for filters
  const assignees = Array.from(new Set(tasks.map(t => t.assignee_name)))
  const categories = Array.from(new Set(tasks.map(t => t.category)))

  useEffect(() => {
    let filtered = [...tasks]

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.transformed_message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignee_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply filters
    if (filters.assignee.length > 0) {
      filtered = filtered.filter(task => filters.assignee.includes(task.assignee_name))
    }
    if (filters.category.length > 0) {
      filtered = filtered.filter(task => filters.category.includes(task.category))
    }
    if (filters.priority.length > 0) {
      filtered = filtered.filter(task => filters.priority.includes(task.priority))
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'due_date':
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 }
          return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
        case 'created_date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'assignee':
          return a.assignee_name.localeCompare(b.assignee_name)
        default:
          return 0
      }
    })

    setFilteredTasks(filtered)
  }, [tasks, searchQuery, sortBy, filters])

  const handleCompleteTask = async (taskId: string) => {
    toast.success('Task marked as complete! 🎉')
    setTasks(tasks.filter(t => t.id !== taskId))
  }

  const toggleFilter = (type: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }))
  }

  const clearFilters = () => {
    setFilters({ assignee: [], category: [], priority: [] })
    setSearchQuery('')
  }

  const activeFilterCount = Object.values(filters).flat().length

  if (tasks.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Active Tasks</h1>
          <p className="text-muted-foreground">Tasks that need to be completed</p>
        </div>
        
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed" asChild>
              <Link href="/tasks/completed">Completed</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Card className="flex flex-col items-center justify-center py-12">
          <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">All caught up! 🎉</h3>
          <p className="text-muted-foreground text-center mb-6">
            Your family is doing great! Time to appreciate each other.
          </p>
          <Button asChild>
            <Link href="/create-task">
              <Plus className="mr-2 h-4 w-4" />
              Create New Task
            </Link>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Active Tasks</h1>
        <p className="text-muted-foreground">Tasks that need to be completed</p>
      </div>
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed" asChild>
            <Link href="/tasks/completed">Completed</Link>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              {/* Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <div className="px-2 py-1">
                    <p className="text-sm font-medium mb-2">Assignee</p>
                    {assignees.map(assignee => (
                      <DropdownMenuCheckboxItem
                        key={assignee}
                        checked={filters.assignee.includes(assignee)}
                        onCheckedChange={() => toggleFilter('assignee', assignee)}
                      >
                        {assignee}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  <div className="px-2 py-1">
                    <p className="text-sm font-medium mb-2">Category</p>
                    {categories.map(category => (
                      <DropdownMenuCheckboxItem
                        key={category}
                        checked={filters.category.includes(category)}
                        onCheckedChange={() => toggleFilter('category', category)}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  <div className="px-2 py-1">
                    <p className="text-sm font-medium mb-2">Priority</p>
                    {['high', 'medium', 'low'].map(priority => (
                      <DropdownMenuCheckboxItem
                        key={priority}
                        checked={filters.priority.includes(priority)}
                        onCheckedChange={() => toggleFilter('priority', priority)}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </div>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={clearFilters}>
                    Clear Filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <SortAsc className="mr-2 h-4 w-4" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortBy('due_date')}>
                    Due Date
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('priority')}>
                    Priority
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('created_date')}>
                    Created Date
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('assignee')}>
                    Assignee
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Task List */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No tasks match your filters</p>
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  Clear filters
                </Button>
              </Card>
            ) : (
              filteredTasks.map((task) => (
                <Card
                  key={task.id}
                  className="group hover:shadow-md transition-shadow cursor-pointer"
                >
                  <CardContent className="p-4">
                    <Link href={`/tasks/${task.id}`} className="block">
                      <div className="flex items-start justify-between mb-3">
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
                        
                        <div className="flex items-center space-x-2">
                          <Badge variant={PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]}>
                            {task.priority}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleCompleteTask(task.id)}>
                                Mark Complete
                              </DropdownMenuItem>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Duplicate</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {task.transformed_message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            Due {formatDueDate(task.due_date)}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {task.category}
                          </Badge>
                        </div>
                        
                        <Badge variant="secondary" className="text-xs">
                          {STATUS_LABELS[task.status as keyof typeof STATUS_LABELS]}
                        </Badge>
                      </div>
                    </Link>
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