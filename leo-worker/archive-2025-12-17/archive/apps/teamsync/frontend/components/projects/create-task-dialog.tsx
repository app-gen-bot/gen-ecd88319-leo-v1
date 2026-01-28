"use client";

import { useState, useEffect } from "react";
import { Calendar, Search, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import type { User, CreateTaskFormData } from "@/types";
import { cn } from "@/lib/utils";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTaskFormData) => void;
  projectId: string;
  initialData?: Partial<CreateTaskFormData>;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  onSubmit,
  projectId,
  initialData,
}: CreateTaskDialogProps) {
  const [formData, setFormData] = useState<CreateTaskFormData>({
    title: "",
    project_id: projectId,
    description: "",
    priority: "medium",
    ...initialData,
  });
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialData?.due_date ? new Date(initialData.due_date) : undefined
  );
  
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState("");

  useEffect(() => {
    if (searchQuery) {
      searchUsers();
    }
  }, [searchQuery]);

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

  const handleSubmit = () => {
    const taskData: CreateTaskFormData = {
      ...formData,
      due_date: selectedDate?.toISOString(),
    };
    onSubmit(taskData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      project_id: projectId,
      description: "",
      priority: "medium",
    });
    setSelectedDate(undefined);
    setSelectedUser(null);
    setLabels([]);
    setNewLabel("");
  };

  const addLabel = () => {
    if (newLabel && !labels.includes(newLabel)) {
      setLabels([...labels, newLabel]);
      setNewLabel("");
    }
  };

  const removeLabel = (label: string) => {
    setLabels(labels.filter(l => l !== label));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your project. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Implement user authentication"
              className="col-span-3"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add a detailed description..."
              rows={4}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
              >
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
                            setFormData({ ...formData, assignee_id: user.id });
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
          
          <div className="grid gap-2">
            <Label>Labels</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {labels.map((label) => (
                <Badge key={label} variant="secondary">
                  {label}
                  <button
                    onClick={() => removeLabel(label)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a label..."
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addLabel()}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addLabel}
                disabled={!newLabel}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.title}>
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}