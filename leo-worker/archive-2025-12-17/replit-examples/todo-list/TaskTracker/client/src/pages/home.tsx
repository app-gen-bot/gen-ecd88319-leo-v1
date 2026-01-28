import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Task } from "@shared/schema";
import TaskForm from "@/components/task-form";
import TaskList from "@/components/task-list";
import TaskFilters from "@/components/task-filters";

type FilterType = "all" | "active" | "completed";

export default function Home() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const filteredTasks = tasks.filter((task) => {
    switch (activeFilter) {
      case "active":
        return !task.completed;
      case "completed":
        return task.completed;
      default:
        return true;
    }
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const activeTasks = totalTasks - completedTasks;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* App Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            <i className="fas fa-tasks text-primary mr-3"></i>
            TodoList
          </h1>
          <p className="text-muted-foreground text-lg">Stay organized, get things done</p>
          
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <span className="bg-card px-4 py-2 rounded-lg shadow-sm border border-border">
              <span data-testid="total-tasks" className="font-semibold text-foreground">
                {totalTasks}
              </span>
              <span className="text-muted-foreground ml-1">total tasks</span>
            </span>
            <span className="bg-card px-4 py-2 rounded-lg shadow-sm border border-border">
              <span data-testid="completed-tasks" className="font-semibold text-primary">
                {completedTasks}
              </span>
              <span className="text-muted-foreground ml-1">completed</span>
            </span>
          </div>
        </header>

        {/* Task Input Form */}
        <TaskForm />

        {/* Task Filters */}
        <TaskFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          completedCount={completedTasks}
        />

        {/* Task List */}
        <TaskList
          tasks={filteredTasks}
          isLoading={isLoading}
          activeFilter={activeFilter}
        />

        {/* Footer */}
        <footer className="mt-12 text-center text-muted-foreground text-sm">
          <div className="bg-card rounded-xl shadow-lg border border-border p-6">
            <p className="mb-2">Built with modern web technologies</p>
            <div className="flex justify-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <i className="fas fa-database"></i>
                In-memory storage
              </span>
              <span className="flex items-center gap-1">
                <i className="fas fa-mobile-alt"></i>
                Responsive design
              </span>
              <span className="flex items-center gap-1">
                <i className="fas fa-universal-access"></i>
                Accessible
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
