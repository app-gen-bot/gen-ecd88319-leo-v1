import { toast } from "sonner";
import { ApiError } from "./api-client";

export function handleApiError(error: ApiError | Error) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case "FORBIDDEN":
        toast.error("Permission Denied", {
          description: error.message,
        });
        break;
      case "NOT_FOUND":
        toast.error("Not Found", {
          description: error.message,
        });
        break;
      case "RATE_LIMITED":
        toast.warning("Slow Down", {
          description: error.message,
        });
        break;
      case "SERVER_ERROR":
        toast.error("Server Error", {
          description: error.message,
          action: {
            label: "Retry",
            onClick: () => window.location.reload(),
          },
        });
        break;
      case "NETWORK_ERROR":
        toast.warning("Connection Lost", {
          description: "Please check your internet connection",
        });
        break;
      case "VALIDATION_ERROR":
        toast.error("Validation Error", {
          description: error.message,
        });
        break;
      default:
        toast.error("Error", {
          description: error.message,
        });
    }
  } else {
    toast.error("Unexpected Error", {
      description: "An unexpected error occurred. Please try again.",
    });
  }
}

export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0 || (error instanceof ApiError && error.code === "FORBIDDEN")) {
      throw error;
    }

    await new Promise(resolve => setTimeout(resolve, delay));
    return fetchWithRetry(fn, retries - 1, delay * 2);
  }
}