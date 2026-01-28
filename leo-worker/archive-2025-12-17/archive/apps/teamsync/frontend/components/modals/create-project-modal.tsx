"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Users } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";
import { User } from "@/types";
import useSWR from "swr";
import { useAuth } from "@/contexts/auth-context";

const createProjectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  description: z.string().optional(),
  due_date: z.date().optional(),
  template: z.enum(["blank", "marketing", "development", "design"]).optional(),
  create_linked_channel: z.boolean(),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema> & {
  team_members: string[];
};

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: users } = useSWR("/users", () => apiClient.searchUsers(""));

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      create_linked_channel: true,
      template: "blank",
    },
  });

  const dueDate = watch("due_date");
  const createLinkedChannel = watch("create_linked_channel");

  const onSubmit = async (data: CreateProjectFormData) => {
    setIsLoading(true);

    try {
      const project = await apiClient.createProject({
        ...data,
        due_date: data.due_date?.toISOString(),
        team_members: selectedMembers,
      });

      toast({
        title: "Project created!",
        description: createLinkedChannel
          ? `Project created! Channel #${data.name.toLowerCase().replace(/\s+/g, "-")} was also created`
          : "Your project has been created successfully.",
      });

      router.push(`/app/project/${project.id}`);
      onOpenChange(false);
      reset();
      setSelectedMembers([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Set up a new project to organize your team's work. A linked channel will be
            created automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="Website Redesign"
                {...register("name")}
                autoFocus
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Complete overhaul of the company website..."
                {...register("description")}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="due_date"
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={(date) => setValue("due_date", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="template">Template</Label>
                <Select
                  value={watch("template")}
                  onValueChange={(value: any) => setValue("template", value)}
                >
                  <SelectTrigger id="template">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blank">Blank</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Team Members</Label>
              <div className="border rounded-md p-3 space-y-2 max-h-[150px] overflow-y-auto">
                {users?.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={member.id}
                      checked={selectedMembers.includes(member.id)}
                      onCheckedChange={() => toggleMember(member.id)}
                      disabled={member.id === user?.id}
                    />
                    <Label
                      htmlFor={member.id}
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <Users className="h-4 w-4" />
                      <span>{member.full_name}</span>
                      {member.id === user?.id && (
                        <span className="text-xs text-muted-foreground">(You)</span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Selected: {selectedMembers.length + 1} members (including you)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="create_channel"
                checked={createLinkedChannel}
                onCheckedChange={(checked) =>
                  setValue("create_linked_channel", checked as boolean)
                }
              />
              <Label
                htmlFor="create_channel"
                className="text-sm font-normal cursor-pointer"
              >
                Create linked channel for this project
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}