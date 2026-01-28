"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Plus, 
  LayoutGrid, 
  List, 
  Calendar,
  Filter,
  Search,
  ChevronRight,
  MoreHorizontal,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { TaskBoardView } from "@/components/projects/task-board-view";
import { TaskListView } from "@/components/projects/task-list-view";
import { TaskTimelineView } from "@/components/projects/task-timeline-view";
import { CreateTaskDialog } from "@/components/projects/create-task-dialog";
import { TaskDetailPanel } from "@/components/projects/task-detail-panel";
import type { Project, Task } from "@/types";

type ViewMode = "board" | "list" | "timeline";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const projectId = params.projectId as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [projectData, tasksData] = await Promise.all([
        apiClient.getProjects("ws-1").then(projects => 
          projects.find(p => p.id === projectId)
        ),
        apiClient.getTasks(projectId),
      ]);
      
      if (!projectData) {
        throw new Error("Project not found");
      }
      
      setProject(projectData);
      setTasks(tasksData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load project data",
        variant: "destructive",
      });
      router.push("/app/projects");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreate = async (taskData: any) => {
    try {
      const newTask = await apiClient.createTask({
        ...taskData,
        project_id: projectId,
      });
      setTasks([...tasks, newTask]);
      setCreateTaskOpen(false);
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await apiClient.updateTask(taskId, updates);
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
      if (selectedTask?.id === taskId) {
        setSelectedTask(updatedTask);
      }
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setRightPanelOpen(true);
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "todo":
        return <Circle className="w-4 h-4 text-gray-400" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "review":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "done":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
  };

  if (loading || !project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading project...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/app/projects")}
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </Button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-semibold">{project.name}</h1>
              <Badge variant="outline" className="capitalize">
                {project.status}
              </Badge>
            </div>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {project.description}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button onClick={() => setCreateTaskOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/app/projects/${projectId}/settings`)}>
                Project Settings
              </DropdownMenuItem>
              <DropdownMenuItem>Export Tasks</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Archive Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Project Stats */}
      <div className="p-6 border-b bg-muted/30">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.progress}%</div>
              <Progress value={project.progress} className="mt-2 h-1" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {project.task_count.completed}/{project.task_count.total}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="text-2xl font-bold mr-3">
                  {project.team_members.length}
                </div>
                <div className="flex -space-x-2">
                  {project.team_members.slice(0, 3).map((member) => (
                    <Avatar key={member.id} className="w-6 h-6 border-2 border-background">
                      <AvatarImage src={member.user.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {member.user.full_name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {project.team_members.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <span className="text-xs">+{project.team_members.length - 3}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Due Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {project.due_date 
                  ? new Date(project.due_date).toLocaleDateString("en-US", { 
                      month: "short", 
                      day: "numeric" 
                    })
                  : "No due date"
                }
              </div>
              {project.due_date && (
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.ceil((new Date(project.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* View Controls */}
      <div className="flex items-center justify-between p-4 border-b">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="board">
              <LayoutGrid className="w-4 h-4 mr-2" />
              Board
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="w-4 h-4 mr-2" />
              List
            </TabsTrigger>
            <TabsTrigger value="timeline">
              <Calendar className="w-4 h-4 mr-2" />
              Timeline
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Task Views */}
      <div className="flex-1 overflow-hidden flex">
        <div className={`flex-1 overflow-auto ${rightPanelOpen ? 'pr-0' : ''}`}>
          {viewMode === "board" && (
            <TaskBoardView
              tasks={filteredTasks}
              onTaskClick={handleTaskClick}
              onTaskUpdate={handleTaskUpdate}
            />
          )}
          {viewMode === "list" && (
            <TaskListView
              tasks={filteredTasks}
              onTaskClick={handleTaskClick}
              onTaskUpdate={handleTaskUpdate}
            />
          )}
          {viewMode === "timeline" && (
            <TaskTimelineView
              tasks={filteredTasks}
              onTaskClick={handleTaskClick}
              onTaskUpdate={handleTaskUpdate}
            />
          )}
        </div>
        
        {/* Right Panel for Task Details */}
        {rightPanelOpen && selectedTask && (
          <TaskDetailPanel
            task={selectedTask}
            onClose={() => {
              setRightPanelOpen(false);
              setSelectedTask(null);
            }}
            onUpdate={(updates) => handleTaskUpdate(selectedTask.id, updates)}
          />
        )}
      </div>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        onSubmit={handleTaskCreate}
        projectId={projectId}
      />
    </div>
  );
}