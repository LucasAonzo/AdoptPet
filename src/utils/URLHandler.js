import { Linking } from 'react-native';
import supabase from '../config/supabase';

/**
 * Process a URL from a deep link and handle any auth-related actions
 * @param {string} url - The deep link URL to process
 * @returns {Promise<boolean>} - Whether the URL was successfully processed
 */
export const handleAuthDeepLink = async (url) => {
  if (!url) return false;
  
  console.log('Processing auth deep link:', url);
  
  try {
    // If the URL is a Supabase OAuth callback URL
    if (url.includes('auth/callback') || url.includes('reset-password')) {
      console.log('Processing auth callback URL...');
      
      // Extract the URL parameters
      const urlParams = new URL(url);
      const params = Object.fromEntries(urlParams.searchParams.entries());
      
      // Log the extracted parameters (without sensitive info)
      console.log('Auth params detected:', Object.keys(params));
      
      // Let Supabase handle the URL
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session after URL handling:', error);
        return false;
      }
      
      // Log successful authentication
      if (data?.session) {
        console.log('Successfully authenticated user from deep link');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error handling deep link:', error);
    return false;
  }
};

/**
 * Register a listener for deep links
 * @param {Function} callback - Function to call when a deep link is opened
 * @returns {Function} - Function to unsubscribe the listener
 */
export const registerURLHandler = (callback) => {
  const subscription = Linking.addEventListener('url', ({ url }) => {
    if (url) {
      console.log('URL opened:', url);
      callback(url);
    }
  });
  
  return () => subscription.remove();
};

export default {
  handleAuthDeepLink,
  registerURLHandler,
}; 