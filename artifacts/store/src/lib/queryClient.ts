import { QueryClient } from "@tanstack/react-query";
import { setupApi } from "./api";

// Initialize the API to include auth tokens
setupApi();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
