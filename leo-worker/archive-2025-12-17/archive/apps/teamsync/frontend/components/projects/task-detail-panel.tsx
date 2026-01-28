"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  Paperclip, 
  MessageSquare,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  AlertCircle,
  Send,
  Upload
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import type { Task, TaskComment, User as UserType } from "@/types";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

interface TaskDetailPanelProps {
  task: Task;
  onClose: () => void;
  onUpdate: (updates: Partial<Task>) => void;
}

const statusOptions = [
  { value: "todo", label: "To Do", icon: Circle, color: "text-gray-500" },
  { value: "in_progress", label: "In Progress", icon: Clock, color: "text-blue-500" },
  { value: "review", label: "Review", icon: AlertCircle, color: "text-yellow-500" },
  { value: "done", label: "Done", icon: CheckCircle2, color: "text-green-500" },
];

const priorityOptions = [
  { value: "low", label: "Low", color: "bg-gray-100 text-gray-700" },
  { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-700" },
  { value: "high", label: "High", color: "bg-yellow-100 text-yellow-700" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-700" },
];

export function TaskDetailPanel({ task, onClose, onUpdate }: TaskDetailPanelProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || "");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    task.due_date ? new Date(task.due_date) : undefined
  );
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [newSubtask, setNewSubtask] = useState("");

  useEffect(() => {
    // Load comments and attachments
    loadTaskDetails();
  }, [task.id]);

  const loadTaskDetails = async () => {
    // In a real app, load comments and attachments from API
    // Mock data for now
    setComments([
      {
        id: "comment-1",
        task_id: task.id,
        user_id: "user-2",
        content: "I've started working on this. Should have an update by tomorrow.",
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
        user: {
          id: "user-2",
          email: "alice@teamsync.com",
          full_name: "Alice Johnson",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
          status: "online",
          last_seen_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
    ]);
  };

  const handleSave = () => {
    const updates: Partial<Task> = {
      title: editedTitle,
      description: editedDescription,
      due_date: selectedDate?.toISOString(),
    };
    onUpdate(updates);
    setIsEditing(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    // In a real app, send to API
    const newCommentObj: TaskComment = {
      id: `comment-${Date.now()}`,
      task_id: task.id,
      user_id: "user-1",
      content: newComment,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: {
        id: "user-1",
        email: "demo@teamsync.com",
        full_name: "Demo User",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
        status: "online",
        last_seen_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
    
    setComments([...comments, newCommentObj]);
    setNewComment("");
    toast({ title: "Comment added" });
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    
    const newSubtaskObj = {
      id: `subtask-${Date.now()}`,
      task_id: task.id,
      title: newSubtask,
      is_completed: false,
      position: subtasks.length,
      created_at: new Date().toISOString(),
    };
    
    setSubtasks([...subtasks, newSubtaskObj]);
    setNewSubtask("");
  };

  const toggleSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.map(st => 
      st.id === subtaskId 
        ? { ...st, is_completed: !st.is_completed, completed_at: !st.is_completed ? new Date().toISOString() : undefined }
        : st
    ));
  };

  const StatusIcon = statusOptions.find(s => s.value === task.status)?.icon || Circle;
  const statusColor = statusOptions.find(s => s.value === task.status)?.color || "";

  return (
    <div className="w-[480px] h-full border-l bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <StatusIcon className={cn("w-5 h-5", statusColor)} />
          <Select value={task.status} onValueChange={(value: any) => onUpdate({ status: value })}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => {
                const Icon = option.icon;
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <Icon className={cn("w-4 h-4 mr-2", option.color)} />
                      {option.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Save" : "Edit"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Duplicate Task</DropdownMenuItem>
              <DropdownMenuItem>Copy Link</DropdownMenuItem>
              <DropdownMenuItem>Move to Another Project</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Delete Task</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Title */}
          {isEditing ? (
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="text-xl font-semibold"
            />
          ) : (
            <h2 className="text-xl font-semibold">{task.title}</h2>
          )}
          
          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Priority</label>
              <Select 
                value={task.priority} 
                onValueChange={(value: any) => onUpdate({ priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <Badge variant="secondary" className={cn("text-xs", option.color)}>
                        {option.label}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Due Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <Calendar className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Set due date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      if (!isEditing) {
                        onUpdate({ due_date: date?.toISOString() });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Assignee</label>
              <Button variant="outline" className="w-full justify-start">
                {task.assignee ? (
                  <div className="flex items-center">
                    <Avatar className="w-5 h-5 mr-2">
                      <AvatarImage src={task.assignee.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {task.assignee.full_name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {task.assignee.full_name}
                  </div>
                ) : (
                  <>
                    <User className="mr-2 h-4 w-4" />
                    Assign someone
                  </>
                )}
              </Button>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Labels</label>
              <Button variant="outline" className="w-full justify-start">
                <Tag className="mr-2 h-4 w-4" />
                {task.labels.length > 0 ? task.labels.join(", ") : "Add labels"}
              </Button>
            </div>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Description</label>
            {isEditing ? (
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Add a description..."
                rows={4}
              />
            ) : (
              <div className="text-sm text-muted-foreground">
                {task.description || "No description"}
              </div>
            )}
          </div>
          
          {/* Subtasks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Subtasks</label>
              {subtasks.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {subtasks.filter(st => st.is_completed).length}/{subtasks.length}
                </span>
              )}
            </div>
            {subtasks.length > 0 && (
              <Progress 
                value={(subtasks.filter(st => st.is_completed).length / subtasks.length) * 100} 
                className="h-2 mb-2"
              />
            )}
            <div className="space-y-2">
              {subtasks.map(subtask => (
                <div key={subtask.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={subtask.is_completed}
                    onCheckedChange={() => toggleSubtask(subtask.id)}
                  />
                  <span className={cn(
                    "text-sm flex-1",
                    subtask.is_completed && "line-through text-muted-foreground"
                  )}>
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Add a subtask..."
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddSubtask()}
              />
              <Button size="sm" onClick={handleAddSubtask}>Add</Button>
            </div>
          </div>
          
          <Separator />
          
          {/* Tabs for Comments and Attachments */}
          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="comments">
                Comments ({comments.length})
              </TabsTrigger>
              <TabsTrigger value="attachments">
                Attachments ({attachments.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="comments" className="space-y-4">
              {/* Comments List */}
              {comments.map(comment => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.user.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {comment.user.full_name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{comment.user.full_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.created_at), "MMM d, h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
              
              {/* Add Comment */}
              <div className="flex space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=demo" />
                  <AvatarFallback>DU</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex space-x-2">
                  <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleAddComment()}
                  />
                  <Button size="icon" onClick={handleAddComment}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="attachments" className="space-y-4">
              {attachments.length === 0 ? (
                <div className="text-center py-8">
                  <Paperclip className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No attachments yet</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Attachment list would go here */}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
      
      {/* Save Changes Button */}
      {isEditing && (
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}