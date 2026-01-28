"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Calendar, Search, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiClient } from "@/lib/api-client";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { Message, Project, User, CreateTaskFormData } from "@/types";
import { cn } from "@/lib/utils";

interface MessageToTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: Message;
  onSuccess: (taskId: string) => void;
}

export function MessageToTaskModal({
  open,
  onOpenChange,
  message,
  onSuccess,
}: MessageToTaskModalProps) {
  const { currentWorkspace } = useWorkspaceStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [priority, setPriority] = useState<CreateTaskFormData["priority"]>("medium");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) {
      // Pre-fill task title with message content (truncated)
      const truncatedTitle = message.content.length > 100 
        ? message.content.substring(0, 97) + "..."
        : message.content;
      setTaskTitle(truncatedTitle);
      
      // Include full message content in description
      setTaskDescription(`From message:\n\n"${message.content}"\n\n- ${message.user.full_name}, ${format(new Date(message.created_at), "MMM d, h:mm a")}\n\n---\n\n`);
      
      // Load projects
      loadProjects();
    }
  }, [open, message]);

  useEffect(() => {
    if (searchQuery) {
      searchUsers();
    }
  }, [searchQuery]);

  const loadProjects = async () => {
    if (!currentWorkspace) return;
    
    try {
      setLoadingProjects(true);
      const projectsData = await apiClient.getProjects(currentWorkspace.id);
      setProjects(projectsData.filter(p => p.status === "active"));
      
      // Auto-select project if there's only one
      if (projectsData.length === 1) {
        setSelectedProject(projectsData[0].id);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const searchUsers = async () => {
    try {
      setLoadingUsers(true);
      const results = await apiClient.searchUsers(searchQuery);
      setUsers(results);
    } catch (error) {
      console.error("Failed to search users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateTask = async () => {
    if (!selectedProject || !taskTitle) return;
    
    try {
      setCreating(true);
      
      const taskData: CreateTaskFormData = {
        title: taskTitle,
        project_id: selectedProject,
        description: taskDescription,
        priority,
        assignee_id: selectedUser?.id,
        due_date: selectedDate?.toISOString(),
      };
      
      const newTask = await apiClient.createTask(taskData);
      
      // Update the message to link to the task
      // In a real app, this would update the message in the backend
      
      onSuccess(newTask.id);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setSelectedProject("");
    setTaskTitle("");
    setTaskDescription("");
    setPriority("medium");
    setSelectedDate(undefined);
    setSelectedUser(null);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Convert Message to Task</DialogTitle>
          <DialogDescription>
            Create a task from this message. The message content will be included in the task description.
          </DialogDescription>
        </DialogHeader>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium">Original message from {message.user.full_name}:</div>
              <div className="text-sm italic">"{message.content}"</div>
            </div>
          </AlertDescription>
        </Alert>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="project">Project *</Label>
            {loadingProjects ? (
              <div className="text-sm text-muted-foreground">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No active projects found. Create a project first.
              </div>
            ) : (
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center">
                        <span>{project.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({project.task_count.total} tasks)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Enter task title"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Add additional details..."
              rows={6}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label>Assignee</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start text-left font-normal"
                >
                  {selectedUser ? (
                    <div className="flex items-center">
                      <Avatar className="w-6 h-6 mr-2">
                        <AvatarImage src={selectedUser.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {selectedUser.full_name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      {selectedUser.full_name}
                    </div>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search for assignee...
                    </>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <div className="p-2">
                  <Input
                    placeholder="Search team members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-2"
                  />
                  {loadingUsers ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      Searching...
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-auto">
                      {users.map((user) => (
                        <Button
                          key={user.id}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            setSelectedUser(user);
                          }}
                        >
                          <Avatar className="w-6 h-6 mr-2">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {user.full_name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <div className="text-sm">{user.full_name}</div>
                            {user.title && (
                              <div className="text-xs text-muted-foreground">{user.title}</div>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={creating}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateTask} 
            disabled={!selectedProject || !taskTitle || creating}
          >
            {creating ? (
              <>Creating...</>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Create Task
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}