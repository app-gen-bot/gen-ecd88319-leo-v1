"use client";

import { useState } from "react";
import { 
  MoreHorizontal, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Circle,
  Calendar,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Paperclip
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Task } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TaskListViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
}

const statusConfig = {
  todo: { icon: Circle, label: "To Do", color: "text-gray-500" },
  in_progress: { icon: Clock, label: "In Progress", color: "text-blue-500" },
  review: { icon: AlertCircle, label: "Review", color: "text-yellow-500" },
  done: { icon: CheckCircle2, label: "Done", color: "text-green-500" },
};

const priorityColors = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-yellow-100 text-yellow-700",
  urgent: "bg-red-100 text-red-700",
};

export function TaskListView({ tasks, onTaskClick, onTaskUpdate }: TaskListViewProps) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["todo", "in_progress", "review"]);

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const toggleGroupExpansion = (status: string) => {
    setExpandedGroups(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = [];
    }
    acc[task.status].push(task);
    return acc;
  }, {} as Record<Task["status"], Task[]>);

  const handleStatusChange = async (taskId: string, newStatus: Task["status"]) => {
    await onTaskUpdate(taskId, { status: newStatus });
  };

  return (
    <div className="p-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedTasks.length === tasks.length && tasks.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedTasks(tasks.map(t => t.id));
                    } else {
                      setSelectedTasks([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead>Task</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-24">Priority</TableHead>
              <TableHead className="w-32">Assignee</TableHead>
              <TableHead className="w-28">Due Date</TableHead>
              <TableHead className="w-20 text-center">Activity</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(["todo", "in_progress", "review", "done"] as const).map((status) => {
              const statusTasks = groupedTasks[status] || [];
              if (statusTasks.length === 0) return null;
              
              const StatusIcon = statusConfig[status].icon;
              const isExpanded = expandedGroups.includes(status);
              
              return (
                <>
                  <TableRow 
                    key={`group-${status}`}
                    className="bg-muted/50 hover:bg-muted/50"
                  >
                    <TableCell colSpan={8}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 -ml-1"
                        onClick={() => toggleGroupExpansion(status)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 mr-2" />
                        ) : (
                          <ChevronRight className="w-4 h-4 mr-2" />
                        )}
                        <StatusIcon className={cn("w-4 h-4 mr-2", statusConfig[status].color)} />
                        <span className="font-medium">{statusConfig[status].label}</span>
                        <Badge variant="secondary" className="ml-2">
                          {statusTasks.length}
                        </Badge>
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {isExpanded && statusTasks.map((task) => (
                    <TableRow 
                      key={task.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onTaskClick(task)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedTasks.includes(task.id)}
                          onCheckedChange={() => toggleTaskSelection(task.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {task.description}
                            </div>
                          )}
                          {task.labels.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {task.labels.map((label) => (
                                <Badge key={label} variant="outline" className="text-xs">
                                  {label}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8">
                              <StatusIcon className={cn("w-4 h-4 mr-2", statusConfig[status].color)} />
                              {statusConfig[status].label}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {(["todo", "in_progress", "review", "done"] as const).map((s) => {
                              const Icon = statusConfig[s].icon;
                              return (
                                <DropdownMenuItem
                                  key={s}
                                  onClick={() => handleStatusChange(task.id, s)}
                                >
                                  <Icon className={cn("w-4 h-4 mr-2", statusConfig[s].color)} />
                                  {statusConfig[s].label}
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={cn("text-xs", priorityColors[task.priority])}
                        >
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {task.assignee ? (
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={task.assignee.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {task.assignee.full_name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{task.assignee.full_name.split(" ")[0]}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {task.due_date ? (
                          <div className="flex items-center text-sm">
                            <Calendar className="w-3 h-3 mr-1 text-muted-foreground" />
                            {format(new Date(task.due_date), "MMM d")}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No due date</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                          {task.comments_count > 0 && (
                            <div className="flex items-center">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              <span className="text-xs">{task.comments_count}</span>
                            </div>
                          )}
                          {task.attachments_count > 0 && (
                            <div className="flex items-center">
                              <Paperclip className="w-3 h-3 mr-1" />
                              <span className="text-xs">{task.attachments_count}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Task</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem>Copy Link</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Delete Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}