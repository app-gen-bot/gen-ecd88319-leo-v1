import { toast } from "@/hooks/use-toast";
import { ApiError, ErrorCode } from "./api-client";

// Global error handler using toast notifications
export function handleApiError(error: unknown) {
  if (!(error instanceof ApiError)) {
    // Handle non-API errors
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "An unexpected error occurred",
      variant: "destructive",
    });
    return;
  }

  switch (error.code) {
    case ErrorCode.FORBIDDEN:
      toast({
        title: "Permission Denied",
        description: error.message,
        variant: "destructive",
      });
      break;

    case ErrorCode.NOT_FOUND:
      toast({
        title: "Not Found",
        description: error.message,
        variant: "destructive",
      });
      break;

    case ErrorCode.RATE_LIMITED:
      toast({
        title: "Slow Down",
        description: error.message,
        variant: "destructive",
      });
      break;

    case ErrorCode.SERVER_ERROR:
      toast({
        title: "Server Error",
        description: error.message,
        variant: "destructive",
      });
      break;

    case ErrorCode.NETWORK_ERROR:
      toast({
        title: "Connection Lost",
        description: "Please check your internet connection",
        variant: "destructive",
      });
      break;

    case ErrorCode.VALIDATION_ERROR:
      toast({
        title: "Validation Error",
        description: error.message,
        variant: "destructive",
      });
      break;

    case ErrorCode.INVALID_CREDENTIALS:
      // Don't show toast for login errors - handle in form
      break;

    case ErrorCode.UNAUTHORIZED:
      // Don't show toast - user is being redirected to login
      break;

    default:
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
  }
}

// Retry logic with exponential backoff
export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (
      retries === 0 ||
      (error instanceof ApiError && error.code === ErrorCode.FORBIDDEN)
    ) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
    return fetchWithRetry(fn, retries - 1, delay * 2);
  }
}