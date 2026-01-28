'use client';

import { useState } from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import { handleApiError } from '@/lib/handle-api-error';
import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statuses = [
  { value: 'online', label: 'Active', color: 'text-green-500' },
  { value: 'away', label: 'Away', color: 'text-yellow-500' },
  { value: 'offline', label: 'Offline', color: 'text-gray-500' },
] as const;

export function StatusPicker({ open, onOpenChange }: StatusPickerProps) {
  const { user, updateUser } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState(user?.status || 'online');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!user || selectedStatus === user.status) {
      onOpenChange(false);
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.updateStatus(selectedStatus as any);
      updateUser({ ...user, status: selectedStatus as any });
      onOpenChange(false);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set your status</DialogTitle>
          <DialogDescription>
            Let your team know your availability
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <RadioGroup value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as 'online' | 'away' | 'offline')}>
            {statuses.map((status) => (
              <div key={status.value} className="flex items-center space-x-2 py-2">
                <RadioGroupItem value={status.value} id={status.value} />
                <Label
                  htmlFor={status.value}
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <Circle className={cn('h-2 w-2 fill-current', status.color)} />
                  {status.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
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
          <Button
            onClick={handleSave}
            disabled={isLoading || selectedStatus === user?.status}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}