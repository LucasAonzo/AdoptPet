import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Alert } from 'react-native';
import Constants from 'expo-constants';
import { logError } from '../../shared/utils/errorHandler';

// For development only - in production these would come from environment variables
// Remove before deploying to production!
const DEV_SUPABASE_URL: string = "https://your-project.supabase.co";
const DEV_SUPABASE_ANON_KEY: string = "your-anon-key";

// Get Supabase URL and anon key from environment variables or constants
const supabaseUrl: string = Constants.expoConfig?.extra?.supabaseUrl || 
                   process.env.SUPABASE_URL || 
                   DEV_SUPABASE_URL;

const supabaseAnonKey: string = Constants.expoConfig?.extra?.supabaseAnonKey || 
                       process.env.SUPABASE_ANON_KEY || 
                       DEV_SUPABASE_ANON_KEY;

// Validate required configuration
if (!supabaseUrl || !supabaseAnonKey) {
  const missingKeys: string[] = [];
  if (!supabaseUrl) missingKeys.push('SUPABASE_URL');
  if (!supabaseAnonKey) missingKeys.push('SUPABASE_ANON_KEY');

  const errorMessage: string = `Missing Supabase configuration: ${missingKeys.join(', ')}`;

  // Log the error
  logError('Supabase initialization', errorMessage);

  // In development, provide clear error message about missing configuration
  if (__DEV__) {
    console.error(
      `Error: ${errorMessage}\n\n` +
      `Please ensure these environment variables are set in your app.config.js or .env file:\n` +
      `${missingKeys.map(key => `- ${key}`).join('\n')}`
    );
  }
}

/**
 * Create a single Supabase client for interacting with the database
 * This client is configured with persistent authentication and custom error handling
 */
const supabase: SupabaseClient = createClient(
  // Use placeholder values if not configured (will cause API errors, but prevents crash)
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Disable for React Native
    },
    global: {
      // Add global error handler for network issues
      fetch: (...args: Parameters<typeof fetch>) => {
        return fetch(...args).catch((err: Error) => {
          // Handle network errors
          if (
            typeof navigator !== 'undefined' && 
            !navigator.onLine || 
            err.message?.includes('network') || 
            err.message?.includes('fetch')
          ) {
            Alert.alert(
              'Network Error',
              'Please check your internet connection and try again.'
            );
          }
          throw err;
        });
      }
    }
  }
);

export default supabase; 