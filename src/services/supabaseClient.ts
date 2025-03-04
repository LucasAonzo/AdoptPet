import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://your-supabase-url.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

/**
 * Supabase client instance for the application
 */
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Checks if a user is currently logged in
 * @returns The current user or null if not logged in
 */
export const checkUserLoggedIn = async (): Promise<User | null> => {
  // Using the newer Supabase Auth API
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return data.user;
};

/**
 * Logs out the current user
 * @returns A promise that resolves when the user is logged out
 */
export const logOutUser = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Error logging out:', error);
}; 