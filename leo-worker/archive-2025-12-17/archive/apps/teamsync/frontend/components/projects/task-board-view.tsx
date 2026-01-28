"use client";

import { useState } from "react";
import { 
  MoreHorizontal, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Circle,
  Calendar,
  User
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Task } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TaskBoardViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
}

const columns = [
  { id: "todo", title: "To Do", icon: Circle, color: "text-gray-500" },
  { id: "in_progress", title: "In Progress", icon: Clock, color: "text-blue-500" },
  { id: "review", title: "Review", icon: AlertCircle, color: "text-yellow-500" },
  { id: "done", title: "Done", icon: CheckCircle2, color: "text-green-500" },
];

const priorityColors = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-yellow-100 text-yellow-700",
  urgent: "bg-red-100 text-red-700",
};

export function TaskBoardView({ tasks, onTaskClick, onTaskUpdate }: TaskBoardViewProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, status: Task["status"]) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (draggedTask && draggedTask.status !== status) {
      await onTaskUpdate(draggedTask.id, { status });
    }
    
    setDraggedTask(null);
  };

  const getTasksByStatus = (status: Task["status"]) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="flex h-full p-6 space-x-4 overflow-x-auto">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.id as Task["status"]);
        const Icon = column.icon;
        
        return (
          <div
            key={column.id}
            className={cn(
              "flex-shrink-0 w-80 flex flex-col rounded-lg border-2 transition-colors",
              dragOverColumn === column.id ? "border-primary bg-primary/5" : "border-transparent"
            )}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id as Task["status"])}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <Icon className={cn("w-5 h-5", column.color)} />
                <h3 className="font-semibold">{column.title}</h3>
                <Badge variant="secondary" className="ml-2">
                  {columnTasks.length}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1 p-2">
              <div className="space-y-2">
                {columnTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onClick={() => onTaskClick(task)}
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm line-clamp-2 flex-1">
                          {task.title}
                        </h4>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-1">
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              onTaskUpdate(task.id, { status: "todo" });
                            }}>
                              Move to To Do
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              onTaskUpdate(task.id, { status: "in_progress" });
                            }}>
                              Move to In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              onTaskUpdate(task.id, { status: "review" });
                            }}>
                              Move to Review
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              onTaskUpdate(task.id, { status: "done" });
                            }}>
                              Move to Done
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={(e) => {
                              e.stopPropagation();
                              // Delete task
                            }}>
                              Delete Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="secondary" 
                          className={cn("text-xs", priorityColors[task.priority])}
                        >
                          {task.priority}
                        </Badge>
                        
                        {task.labels.length > 0 && (
                          <div className="flex gap-1">
                            {task.labels.slice(0, 2).map((label) => (
                              <Badge key={label} variant="outline" className="text-xs">
                                {label}
                              </Badge>
                            ))}
                            {task.labels.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{task.labels.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-3">
                          {task.due_date && (
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {format(new Date(task.due_date), "MMM d")}
                            </div>
                          )}
                          {task.comments_count > 0 && (
                            <div className="flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {task.comments_count}
                            </div>
                          )}
                        </div>
                        
                        {task.assignee && (
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={task.assignee.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {task.assignee.full_name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
}