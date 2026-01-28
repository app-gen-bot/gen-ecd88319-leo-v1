import type { Task } from "@shared/schema";
import TaskItem from "./task-item";
import { Button } from "@/components/ui/button";

type FilterType = "all" | "active" | "completed";

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  activeFilter: FilterType;
}

export default function TaskList({ tasks, isLoading, activeFilter }: TaskListProps) {
  const focusTaskInput = () => {
    const input = document.querySelector('[data-testid="input-new-task"]') as HTMLInputElement;
    if (input) {
      input.focus();
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="bg-card rounded-xl shadow-lg border border-border p-8">
          <i className="fas fa-spinner loading-spinner text-4xl text-primary mb-4"></i>
          <p className="text-muted-foreground">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    const getEmptyMessage = () => {
      switch (activeFilter) {
        case "active":
          return "All your tasks are completed! 🎉";
        case "completed":
          return "No completed tasks yet.";
        default:
          return "Start by adding your first task above.";
      }
    };

    return (
      <div className="text-center py-12">
        <div className="bg-card rounded-xl shadow-lg border border-border p-8">
          <i className="fas fa-clipboard-list text-6xl text-muted-foreground mb-4"></i>
          <h3 className="text-xl font-semibold text-foreground mb-2">No tasks found</h3>
          <p className="text-muted-foreground mb-4">{getEmptyMessage()}</p>
          {activeFilter === "all" && (
            <Button
              data-testid="button-focus-input"
              onClick={focusTaskInput}
              className="btn-primary bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Your First Task
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="task-list">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
