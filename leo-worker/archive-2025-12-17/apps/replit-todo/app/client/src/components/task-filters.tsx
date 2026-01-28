import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

type FilterType = "all" | "active" | "completed";

interface TaskFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  completedCount: number;
}

export default function TaskFilters({ activeFilter, onFilterChange, completedCount }: TaskFiltersProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const clearCompletedMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/tasks/completed/clear");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Completed tasks cleared",
        description: `${data.deletedCount} tasks were removed.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear completed tasks. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClearCompleted = () => {
    if (completedCount > 0) {
      clearCompletedMutation.mutate();
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-lg border border-border p-4 mb-6">
      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        <Button
          data-testid="filter-all"
          onClick={() => onFilterChange("all")}
          variant={activeFilter === "all" ? "default" : "ghost"}
          className={`filter-btn px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
            activeFilter === "all"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <i className="fas fa-list mr-2"></i>
          All Tasks
        </Button>
        <Button
          data-testid="filter-active"
          onClick={() => onFilterChange("active")}
          variant={activeFilter === "active" ? "default" : "ghost"}
          className={`filter-btn px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
            activeFilter === "active"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <i className="fas fa-clock mr-2"></i>
          Active
        </Button>
        <Button
          data-testid="filter-completed"
          onClick={() => onFilterChange("completed")}
          variant={activeFilter === "completed" ? "default" : "ghost"}
          className={`filter-btn px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
            activeFilter === "completed"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <i className="fas fa-check mr-2"></i>
          Completed
        </Button>
      </div>

      <div className="flex justify-center sm:justify-end mt-4 pt-4 border-t border-border">
        <Button
          data-testid="button-clear-completed"
          onClick={handleClearCompleted}
          disabled={completedCount === 0 || clearCompletedMutation.isPending}
          variant="ghost"
          className="text-destructive hover:text-destructive/80 text-sm font-medium px-4 py-2 rounded-lg hover:bg-destructive/10 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <i className="fas fa-trash mr-2"></i>
          {clearCompletedMutation.isPending ? "Clearing..." : "Clear Completed"}
        </Button>
      </div>
    </div>
  );
}
