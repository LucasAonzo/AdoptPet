import { useQuery, UseQueryResult, UseQueryOptions } from '@tanstack/react-query';
import { supabase } from '../services/supabaseClient';
import { User } from '../types/user';

/**
 * Fetches all users from the database
 * @returns Promise resolving to an array of users
 */
const fetchUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw new Error(error.message);
  return data as User[];
};

/**
 * Hook to fetch and manage user data
 * @returns Query result containing users data, loading state, and error
 */
export const useUserData = (): UseQueryResult<User[], Error> => {
  return useQuery<User[], Error, User[], string[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: true,
  });
};

export default useUserData; 