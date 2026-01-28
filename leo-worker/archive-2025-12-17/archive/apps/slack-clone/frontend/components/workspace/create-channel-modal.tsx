'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { apiClient } from '@/lib/api-client';
import { ApiError } from '@/lib/api-error';
import { handleApiError } from '@/lib/handle-api-error';

interface CreateChannelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateChannelModal({ open, onOpenChange, onSuccess }: CreateChannelModalProps) {
  const { user, workspace } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = user?.id === workspace?.owner_id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate channel name
    const channelName = name.toLowerCase().replace(/\s+/g, '-');
    if (channelName.length < 3 || channelName.length > 30) {
      setError('Channel name must be between 3 and 30 characters');
      setIsLoading(false);
      return;
    }

    if (!/^[a-z0-9-]+$/.test(channelName)) {
      setError('Channel name can only contain lowercase letters, numbers, and hyphens');
      setIsLoading(false);
      return;
    }

    try {
      const channel = await apiClient.createChannel({
        name: channelName,
        description: description.trim(),
        is_private: isPrivate,
      });

      // Navigate to the new channel
      router.push(`/channel/${channel.name}`);
      
      // Reset form
      setName('');
      setDescription('');
      setIsPrivate(false);
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'DUPLICATE_RESOURCE') {
          setError('A channel with this name already exists');
        } else {
          setError(error.message);
        }
      } else {
        setError('Failed to create channel');
      }
      handleApiError(error);
    } finally {
      setIsLoading(false);
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
          
          <div className="space-y-4 py-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g. plan-budget"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                maxLength={30}
              />
              <p className="text-xs text-muted-foreground">
                Names must be lowercase, without spaces or periods, and can&apos;t be longer than 30 characters.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="What's this channel about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                maxLength={250}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Let people know what this channel is for.
              </p>
            </div>

            {isAdmin && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="private"
                  checked={isPrivate}
                  onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
                  disabled={isLoading}
                />
                <label
                  htmlFor="private"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Make private
                </label>
              </div>
            )}

            {!isAdmin && isPrivate && (
              <p className="text-xs text-muted-foreground">
                Only workspace admins can create private channels.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}