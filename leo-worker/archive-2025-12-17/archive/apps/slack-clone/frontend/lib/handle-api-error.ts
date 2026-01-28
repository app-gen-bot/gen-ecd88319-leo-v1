import { toast } from '@/components/ui/use-toast';
import { ApiError } from './api-error';

export function handleApiError(error: unknown) {
  if (!(error instanceof ApiError)) {
    toast({
      title: 'Error',
      description: 'An unexpected error occurred',
      variant: 'destructive',
    });
    return;
  }

  switch (error.code) {
    case 'FORBIDDEN':
      toast({
        title: 'Permission Denied',
        description: error.message,
        variant: 'destructive',
      });
      break;
    case 'NOT_FOUND':
      toast({
        title: 'Not Found',
        description: error.message,
        variant: 'destructive',
      });
      break;
    case 'RATE_LIMITED':
      toast({
        title: 'Slow Down',
        description: error.message,
        // @ts-ignore - variant type issue
        variant: 'warning',
      });
      break;
    case 'SERVER_ERROR':
      toast({
        title: 'Server Error',
        description: error.message,
        variant: 'destructive',
      });
      break;
    case 'NETWORK_ERROR':
      toast({
        title: 'Connection Lost',
        description: 'Please check your internet connection',
        // @ts-ignore - variant type issue
        variant: 'warning',
      });
      break;
    case 'VALIDATION_ERROR':
      toast({
        title: 'Invalid Input',
        description: error.message,
        variant: 'destructive',
      });
      break;
    case 'INVALID_CREDENTIALS':
      // Don't show toast for login errors - handle in form
      break;
    case 'DUPLICATE_RESOURCE':
      toast({
        title: 'Already Exists',
        description: error.message,
        variant: 'destructive',
      });
      break;
    default:
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
  }
}