import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://your-supabase-url.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const checkUserLoggedIn = async () => {
  const user = supabase.auth.user();
  return user;
};

export const logOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Error logging out:', error);
}; 