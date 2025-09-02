import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext, createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { toast } from "sonner";
import type { AppRouter } from "../../../server/src/routers";

// Enhanced error handling utility
function getReadableErrorMessage(error: any): string {
  // Network errors
  if (error.message === "Failed to fetch") {
    return "Network connection failed. Please check your internet connection.";
  }

  // Server connection errors
  if (error.message.includes("fetch")) {
    return "Unable to reach server. Please try again.";
  }

  // TRPC specific errors
  if (error.data?.code) {
    switch (error.data.code) {
      case "UNAUTHORIZED":
        return "Authentication required. Please log in.";
      case "FORBIDDEN":
        return "Access denied. You don't have permission for this action.";
      case "NOT_FOUND":
        return "Requested resource not found.";
      case "BAD_REQUEST":
        return "Invalid request. Please check your input.";
      case "INTERNAL_SERVER_ERROR":
        return "Server error. Please try again later.";
      case "TIMEOUT":
        return "Request timed out. Please try again.";
    }
  }

  // Custom error messages
  if (error.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

// Check if user is online
function isOnline(): boolean {
  return navigator.onLine;
}

// Retry logic with exponential backoff
function createRetryOptions(attempt: number) {
  const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 seconds
  return {
    delay,
    shouldRetry: attempt < 3 && isOnline(), // Retry max 3 times and only if online
  };
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any) => {
      const readableMessage = getReadableErrorMessage(error);
      const isNetworkError = error.message === "Failed to fetch" || error.message.includes("fetch");
      
      toast.error(readableMessage, {
        action: isNetworkError
          ? {
              label: isOnline() ? "Retry" : "Offline",
              onClick: () => {
                if (isOnline()) {
                  queryClient.invalidateQueries();
                }
              },
            }
          : {
              label: "Dismiss",
              onClick: () => {},
            },
        duration: isNetworkError ? 6000 : 4000, // Longer duration for network errors
      });
    },
  }),
  defaultOptions: { 
    queries: { 
      staleTime: 60 * 1000,
      retry: (failureCount, error: any) => {
        // Don't retry if offline
        if (!isOnline()) {
          return false;
        }
        
        // Don't retry certain error types
        if (error.data?.code === "UNAUTHORIZED" || 
            error.data?.code === "FORBIDDEN" || 
            error.data?.code === "NOT_FOUND") {
          return false;
        }
        
        // Retry up to 3 times for network errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => {
        return Math.min(1000 * Math.pow(2, attemptIndex), 10000);
      },
    } 
  },
});

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${import.meta.env.VITE_SERVER_URL}/trpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});

export const trpc = createTRPCOptionsProxy({
  client: trpcClient,
  queryClient: queryClient,
});

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();

// Online status tracking
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    toast.success("Connection restored", {
      duration: 3000,
    });
    // Retry failed queries when coming back online
    queryClient.invalidateQueries();
  });

  window.addEventListener("offline", () => {
    toast.error("No internet connection", {
      duration: 5000,
      action: {
        label: "Dismiss",
        onClick: () => {},
      },
    });
  });
}

