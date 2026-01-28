import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema, type InsertTask } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";

export default function TaskForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertTask>({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      text: "",
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: InsertTask) => {
      const response = await apiRequest("POST", "/api/tasks", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      form.reset();
      toast({
        title: "Task added successfully!",
        description: "Your task has been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertTask) => {
    createTaskMutation.mutate(data);
  };

  return (
    <div className="bg-card rounded-xl shadow-lg border border-border p-6 mb-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-3">
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    {...field}
                    data-testid="input-new-task"
                    placeholder="Add a new task..."
                    className="task-input w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            data-testid="button-add-task"
            disabled={createTaskMutation.isPending}
            className="btn-primary bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <i className="fas fa-plus"></i>
            <span className="hidden sm:inline">
              {createTaskMutation.isPending ? "Adding..." : "Add Task"}
            </span>
          </Button>
        </form>
      </Form>

      {/* Loading state for task creation */}
      {createTaskMutation.isPending && (
        <div className="mt-4 flex items-center justify-center text-muted-foreground">
          <i className="fas fa-spinner loading-spinner mr-2"></i>
          <span>Adding task...</span>
        </div>
      )}
    </div>
  );
}
