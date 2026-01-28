import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateTaskSchema, type Task, type UpdateTask } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";

interface TaskItemProps {
  task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UpdateTask>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      text: task.text,
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: UpdateTask) => {
      const response = await apiRequest("PATCH", `/api/tasks/${task.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsEditing(false);
      toast({
        title: "Task updated successfully!",
        description: "Your changes have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/tasks/${task.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task deleted",
        description: "Task has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggleCompleted = (checked: boolean) => {
    updateTaskMutation.mutate({ completed: checked });
  };

  const handleEditSubmit = (data: UpdateTask) => {
    if (data.text?.trim() && data.text !== task.text) {
      updateTaskMutation.mutate({ text: data.text.trim() });
    } else {
      setIsEditing(false);
    }
  };

  const handleEditKeydown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsEditing(false);
      form.reset({ text: task.text });
    } else if (e.key === "Enter") {
      e.preventDefault();
      form.handleSubmit(handleEditSubmit)();
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    form.reset({ text: task.text });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate();
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const taskDate = new Date(date);
    const diffInMs = now.getTime() - taskDate.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `Created today at ${taskDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    } else if (diffInHours < 48) {
      return `Created yesterday at ${taskDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    } else {
      return `Created on ${taskDate.toLocaleDateString()}`;
    }
  };

  return (
    <div
      data-testid={`task-item-${task.id}`}
      className={`task-item fade-in bg-card rounded-xl shadow-lg border border-border p-4 hover:shadow-xl transition-all duration-200 ${
        task.completed ? "task-completed opacity-60" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <Checkbox
            data-testid={`checkbox-task-${task.id}`}
            checked={task.completed}
            onCheckedChange={handleToggleCompleted}
            disabled={updateTaskMutation.isPending}
            className="task-checkbox w-5 h-5 rounded border border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-0"
          />
        </div>

        <div className="flex-1 min-w-0">
          {!isEditing ? (
            <div>
              <p
                className={`task-text text-foreground font-medium text-base leading-relaxed ${
                  task.completed ? "line-through text-muted-foreground" : ""
                }`}
                data-testid={`text-task-${task.id}`}
              >
                {task.text}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                {formatDate(task.createdAt)}
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleEditSubmit)}>
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          data-testid={`input-edit-task-${task.id}`}
                          onKeyDown={handleEditKeydown}
                          onBlur={() => form.handleSubmit(handleEditSubmit)()}
                          autoFocus
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          )}
        </div>

        <div className="flex-shrink-0 flex items-center gap-2">
          <Button
            data-testid={`button-edit-task-${task.id}`}
            onClick={handleStartEdit}
            disabled={updateTaskMutation.isPending || deleteTaskMutation.isPending || isEditing}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary p-2 rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <i className="fas fa-edit text-sm"></i>
          </Button>

          <Button
            data-testid={`button-delete-task-${task.id}`}
            onClick={handleDelete}
            disabled={updateTaskMutation.isPending || deleteTaskMutation.isPending}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive p-2 rounded-lg hover:bg-destructive/10 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <i className="fas fa-trash text-sm"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}
