"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { useSlackData } from "@/hooks/use-slack-data";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api-client";

interface CreateChannelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateChannelModal({ open, onOpenChange }: CreateChannelModalProps) {
  const router = useRouter();
  const { currentWorkspace } = useSlackData();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPrivate: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Channel name is required",
        variant: "destructive",
      });
      return;
    }

    // Validate channel name format
    if (!/^[a-z0-9-]+$/.test(formData.name)) {
      toast({
        title: "Error",
        description: "Channel name can only contain lowercase letters, numbers, and hyphens",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const channel = await apiClient.createChannel({
        workspace_id: currentWorkspace?.id || "",
        name: formData.name,
        description: formData.description,
        type: formData.isPrivate ? "Private" : "Public",
      });
      
      toast({
        title: "Success",
        description: `Channel #${channel.name} created successfully`,
      });

      // Reset form and close modal
      setFormData({ name: "", description: "", isPrivate: false });
      onOpenChange(false);
      
      // Navigate to the new channel
      router.push(`/channel/${channel.id}`);
    } catch {
      toast({
        title: "Error",
        description: "Failed to create channel. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a channel</DialogTitle>
            <DialogDescription>
              Channels are where your team communicates. They&apos;re best when organized around a topic — #marketing, for example.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g. plan-budget"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase() })}
                maxLength={30}
                required
              />
              <p className="text-xs text-muted-foreground">
                Names must be lowercase, without spaces or periods, and can&apos;t be longer than 30 characters.
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="What's this channel about?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                maxLength={250}
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="private"
                checked={formData.isPrivate}
                onCheckedChange={(checked) => setFormData({ ...formData, isPrivate: checked as boolean })}
              />
              <Label
                htmlFor="private"
                className="text-sm font-normal cursor-pointer"
              >
                Make private
              </Label>
            </div>
            {formData.isPrivate && (
              <p className="text-xs text-muted-foreground">
                When a channel is set to private, it can only be viewed or joined by invitation.
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}