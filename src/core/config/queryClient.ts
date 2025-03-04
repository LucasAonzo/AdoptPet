import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { logError } from '../../shared/utils/errorHandler';

/**
 * Create a custom React Query client with specific settings for our app
 * This client handles caching, retries, and error handling
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for network errors
        return failureCount < 3;
      }
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      logError(
        'QueryCache',
        `Error in query: ${query.queryKey.toString()}`,
        error
      );
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, variables, context, mutation) => {
      logError(
        'MutationCache',
        `Error in mutation: ${mutation.options.mutationKey?.toString() || 'anonymous'}`,
        { error, variables }
      );
    },
  }),
});

export default queryClient; 