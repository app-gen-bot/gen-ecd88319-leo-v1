"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Hash, Lock, Loader2 } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

const createChannelSchema = z.object({
  name: z
    .string()
    .min(1, "Channel name is required")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only"),
  description: z.string().optional(),
  is_private: z.boolean(),
});

type CreateChannelFormData = z.infer<typeof createChannelSchema>;

interface CreateChannelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateChannelModal({ open, onOpenChange }: CreateChannelModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateChannelFormData>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      is_private: false,
    },
  });

  const isPrivate = watch("is_private");

  const onSubmit = async (data: CreateChannelFormData) => {
    setIsLoading(true);

    try {
      // TODO: Implement channel creation API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Channel created!",
        description: `#${data.name} has been created successfully.`,
      });

      router.push(`/app/channel/${data.name}`);
      onOpenChange(false);
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create channel. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>Create a channel</DialogTitle>
          <DialogDescription>
            Channels are where your team communicates. They're best when organized
            around a topic — #marketing, for example.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  #
                </span>
                <Input
                  id="name"
                  placeholder="e.g. plan-budget"
                  className="pl-7"
                  {...register("name")}
                  autoFocus
                />
              </div>
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Names must be lowercase, without spaces or periods, and can't be
                longer than 50 characters.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">
                Description <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="What's this channel about?"
                {...register("description")}
                rows={2}
              />
            </div>

            <div className="grid gap-3">
              <Label>Privacy</Label>
              <RadioGroup
                value={isPrivate ? "private" : "public"}
                onValueChange={(value) => setValue("is_private", value === "private")}
              >
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="public" id="public" className="mt-1" />
                  <div className="grid gap-1">
                    <Label htmlFor="public" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Public - anyone in your workspace
                      </div>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      When a channel is set to public, anyone in your workspace can
                      see and join it.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="private" id="private" className="mt-1" />
                  <div className="grid gap-1">
                    <Label htmlFor="private" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Private - only specific people
                      </div>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      When a channel is set to private, it can only be viewed or
                      joined by invitation.
                    </p>
                  </div>
                </div>
              </RadioGroup>
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
                "Create Channel"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}