import { QueryClient, DefaultOptions } from '@tanstack/react-query';

// Define default options with proper typing
const defaultOptions: DefaultOptions = {
  queries: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    retry: 1,
  },
};

// Create a client
const queryClient = new QueryClient({ defaultOptions });

export default queryClient; 