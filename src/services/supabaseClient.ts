import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://your-supabase-url.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

// Create a strongly typed Supabase client
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Checks if a user is currently logged in
 * @returns The currently logged in user or null if no user is logged in
 */
export const checkUserLoggedIn = async (): Promise<User | null> => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return data.user;
};

/**
 * Logs out the currently authenticated user
 * @returns A promise that resolves when the logout process is complete
 */
export const logOutUser = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Error logging out:', error);
}; 