'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { getMockStaff } from '@/lib/mock-data';
import { format } from 'date-fns';
import { 
  Plus, 
  CalendarIcon, 
  Clock, 
  User, 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  Filter,
  Search,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo: string;
  assignedBy: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
  createdAt: string;
  patientId?: string;
  patientName?: string;
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Follow up with Mrs. Johnson about Max',
    description: 'Call to check on post-surgery recovery',
    assignedTo: '1',
    assignedBy: '2',
    priority: 'high',
    status: 'pending',
    dueDate: new Date().toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    patientName: 'Max (Dog)',
  },
  {
    id: '2',
    title: 'Order more surgical supplies',
    description: 'Running low on sutures and gauze',
    assignedTo: '3',
    assignedBy: '1',
    priority: 'medium',
    status: 'in_progress',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: '3',
    title: 'Review lab results for Bella',
    assignedTo: '2',
    assignedBy: '3',
    priority: 'urgent',
    status: 'pending',
    dueDate: new Date().toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    patientName: 'Bella (Cat)',
  },
];

const priorityConfig = {
  low: { label: 'Low', color: 'bg-gray-500' },
  medium: { label: 'Medium', color: 'bg-yellow-500' },
  high: { label: 'High', color: 'bg-orange-500' },
  urgent: { label: 'Urgent', color: 'bg-red-500' },
};

const statusConfig = {
  pending: { label: 'Pending', icon: Circle },
  in_progress: { label: 'In Progress', icon: Clock },
  completed: { label: 'Completed', icon: CheckCircle2 },
};

export default function TasksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [filter, setFilter] = useState<'all' | 'my_tasks' | 'assigned_by_me'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const staff = getMockStaff();

  // New task form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium' as Task['priority'],
    dueDate: undefined as Date | undefined,
    patientId: '',
  });

  const filteredTasks = tasks.filter(task => {
    // Filter by assignment
    if (filter === 'my_tasks' && task.assignedTo !== user?.id) return false;
    if (filter === 'assigned_by_me' && task.assignedBy !== user?.id) return false;
    
    // Filter by status
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    
    // Filter by search term
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    return true;
  });

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.assignedTo) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      assignedTo: newTask.assignedTo,
      assignedBy: user?.id || '',
      priority: newTask.priority,
      status: 'pending',
      dueDate: newTask.dueDate?.toISOString(),
      createdAt: new Date().toISOString(),
      patientName: newTask.patientId ? 'Patient Name' : undefined,
    };

    setTasks(prev => [task, ...prev]);
    setIsNewTaskOpen(false);
    setNewTask({
      title: '',
      description: '',
      assignedTo: '',
      priority: 'medium',
      dueDate: undefined,
      patientId: '',
    });

    toast({
      title: 'Task created',
      description: 'The task has been assigned successfully.',
    });
  };

  const handleTaskStatusChange = (taskId: string, completed: boolean) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: completed ? 'completed' : 'pending' }
        : task
    ));
  };

  const getStaffName = (staffId: string) => {
    const staffMember = staff.find(s => s.id === staffId);
    return staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : 'Unknown';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage team tasks and assignments</p>
        </div>
        <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Assign a task to a team member
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add task details..."
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assign To *</Label>
                  <Select
                    value={newTask.assignedTo}
                    onValueChange={(value) => setNewTask(prev => ({ ...prev, assignedTo: value }))}
                  >
                    <SelectTrigger id="assignedTo">
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.firstName} {member.lastName} ({member.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value as Task['priority'] }))}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorityConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <div className={cn("h-2 w-2 rounded-full", config.color)} />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newTask.dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newTask.dueDate ? format(newTask.dueDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newTask.dueDate}
                      onSelect={(date) => setNewTask(prev => ({ ...prev, dueDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNewTaskOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTask}>
                  Create Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
              <TabsList>
                <TabsTrigger value="all">All Tasks</TabsTrigger>
                <TabsTrigger value="my_tasks">My Tasks</TabsTrigger>
                <TabsTrigger value="assigned_by_me">Assigned by Me</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No tasks found</p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => {
            const StatusIcon = statusConfig[task.status].icon;
            
            return (
              <Card key={task.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={task.status === 'completed'}
                      onCheckedChange={(checked) => 
                        handleTaskStatusChange(task.id, checked as boolean)
                      }
                      className="mt-1"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className={cn(
                            "font-medium",
                            task.status === 'completed' && "line-through text-muted-foreground"
                          )}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline"
                            className={cn(
                              "text-xs",
                              task.priority === 'urgent' && "border-red-500 text-red-500",
                              task.priority === 'high' && "border-orange-500 text-orange-500",
                              task.priority === 'medium' && "border-yellow-500 text-yellow-500"
                            )}
                          >
                            <div className={cn(
                              "h-2 w-2 rounded-full mr-1",
                              priorityConfig[task.priority].color
                            )} />
                            {priorityConfig[task.priority].label}
                          </Badge>
                          
                          <Button size="icon" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>Assigned to {getStaffName(task.assignedTo)}</span>
                        </div>
                        
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            <span>Due {format(new Date(task.dueDate), 'MMM d')}</span>
                          </div>
                        )}
                        
                        {task.patientName && (
                          <div className="flex items-center gap-1">
                            <span>Patient: {task.patientName}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <StatusIcon className="h-3 w-3" />
                          <span>{statusConfig[task.status].label}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}