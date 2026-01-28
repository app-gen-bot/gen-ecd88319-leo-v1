"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Circle,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Task } from "@/types";
import { cn } from "@/lib/utils";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isToday, isSameDay } from "date-fns";

interface TaskTimelineViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
}

const statusColors = {
  todo: "bg-gray-200 border-gray-400",
  in_progress: "bg-blue-200 border-blue-400",
  review: "bg-yellow-200 border-yellow-400",
  done: "bg-green-200 border-green-400",
};

const priorityIndicators = {
  low: "border-l-2",
  medium: "border-l-4",
  high: "border-l-4 border-yellow-500",
  urgent: "border-l-4 border-red-500",
};

export function TaskTimelineView({ tasks, onTaskClick, onTaskUpdate }: TaskTimelineViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = week view, 2 = month view
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const startDate = startOfWeek(currentDate);
  const endDate = endOfWeek(addWeeks(currentDate, zoomLevel === 1 ? 3 : 11));
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  const dayWidth = zoomLevel === 1 ? 120 : 40;
  
  useEffect(() => {
    // Scroll to today on mount
    if (scrollRef.current) {
      const todayIndex = days.findIndex(day => isToday(day));
      if (todayIndex !== -1) {
        scrollRef.current.scrollLeft = todayIndex * dayWidth - 200;
      }
    }
  }, []);
  
  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentDate(prev => 
      direction === "next" ? addWeeks(prev, 1) : subWeeks(prev, 1)
    );
  };
  
  const getTaskPosition = (task: Task) => {
    if (!task.due_date) return null;
    
    const taskDate = new Date(task.due_date);
    const dayIndex = days.findIndex(day => isSameDay(day, taskDate));
    
    if (dayIndex === -1) return null;
    
    // Calculate task duration (mock - in real app this would come from task data)
    const duration = task.priority === "urgent" ? 1 : task.priority === "high" ? 2 : 3;
    
    return {
      left: dayIndex * dayWidth,
      width: duration * dayWidth,
      top: 0, // This would be calculated based on assignee grouping
    };
  };
  
  const groupedTasks = tasks.reduce((acc, task) => {
    const assigneeId = task.assignee_id || "unassigned";
    if (!acc[assigneeId]) {
      acc[assigneeId] = [];
    }
    acc[assigneeId].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="flex flex-col h-full">
      {/* Timeline Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateWeek("prev")}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateWeek("next")}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <span className="font-medium">
            {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setZoomLevel(Math.max(1, zoomLevel - 1))}
            disabled={zoomLevel === 1}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setZoomLevel(Math.min(2, zoomLevel + 1))}
            disabled={zoomLevel === 2}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
        </div>
      </div>
      
      {/* Timeline Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="relative">
            {/* Date Headers */}
            <div className="sticky top-0 z-10 bg-background border-b">
              <div className="flex">
                <div className="w-48 flex-shrink-0 p-4 border-r bg-muted/50">
                  <span className="font-medium">Team Members</span>
                </div>
                <div className="flex">
                  {days.map((day, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex-shrink-0 p-2 text-center border-r",
                        isToday(day) && "bg-primary/10",
                        day.getDay() === 0 || day.getDay() === 6 ? "bg-muted/30" : ""
                      )}
                      style={{ width: dayWidth }}
                    >
                      <div className="text-xs text-muted-foreground">
                        {format(day, "EEE")}
                      </div>
                      <div className={cn(
                        "text-sm font-medium",
                        isToday(day) && "text-primary"
                      )}>
                        {format(day, "d")}
                      </div>
                      {day.getDate() === 1 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {format(day, "MMM")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Timeline Grid */}
            <div className="relative">
              {/* Grid Lines */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="flex">
                  <div className="w-48 flex-shrink-0 border-r" />
                  {days.map((day, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex-shrink-0 border-r",
                        isToday(day) && "bg-primary/5"
                      )}
                      style={{ width: dayWidth }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Task Rows */}
              <div className="relative">
                {Object.entries(groupedTasks).map(([assigneeId, assigneeTasks], rowIndex) => {
                  const assignee = assigneeTasks[0]?.assignee;
                  
                  return (
                    <div key={assigneeId} className="flex border-b min-h-[80px]">
                      <div className="w-48 flex-shrink-0 p-4 border-r bg-muted/30">
                        {assignee ? (
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={assignee.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {assignee.full_name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">
                                {assignee.full_name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {assigneeTasks.length} tasks
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            Unassigned ({assigneeTasks.length})
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 relative" style={{ minHeight: 80 }}>
                        {assigneeTasks.map((task, taskIndex) => {
                          const position = getTaskPosition(task);
                          if (!position) return null;
                          
                          return (
                            <TooltipProvider key={task.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={cn(
                                      "absolute cursor-pointer rounded px-2 py-1 text-xs font-medium border",
                                      statusColors[task.status],
                                      priorityIndicators[task.priority],
                                      "hover:shadow-md transition-shadow"
                                    )}
                                    style={{
                                      left: position.left + 4,
                                      width: position.width - 8,
                                      top: 8 + (taskIndex % 3) * 24, // Stack tasks
                                    }}
                                    onClick={() => onTaskClick(task)}
                                  >
                                    <div className="truncate">{task.title}</div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    <div className="font-medium">{task.title}</div>
                                    <div className="text-xs">
                                      Status: {task.status.replace("_", " ")}
                                    </div>
                                    <div className="text-xs">
                                      Priority: {task.priority}
                                    </div>
                                    {task.due_date && (
                                      <div className="text-xs">
                                        Due: {format(new Date(task.due_date), "MMM d, yyyy")}
                                      </div>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}