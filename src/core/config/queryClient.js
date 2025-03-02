import { QueryClient } from '@tanstack/react-query';
import { logError } from '../../shared/utils/errorHandler';

/**
 * React Query client with custom configuration
 * - Optimized caching strategies
 * - Centralized error handling
 * - Performance settings
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Only retry network errors, not 4xx or 5xx errors
        if (error?.message?.includes('network') || error?.message?.includes('TIMEOUT')) {
          return failureCount < 3; // Retry network errors up to 3 times
        }
        return false; // Don't retry other errors
      },
      // Global error handler for queries
      onError: (error) => {
        logError('react-query', error);
      },
    },
    mutations: {
      // Don't retry mutations as they can have side effects
      retry: false,
      // Global error handler for mutations
      onError: (error) => {
        logError('react-query:mutation', error);
      },
    },
  },
});

export default queryClient; 