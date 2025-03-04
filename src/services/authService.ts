import supabase from '../config/supabase';
import { User } from '../types/user';
import { Provider } from '@supabase/supabase-js';

/**
 * Interface for authentication response
 */
interface AuthResponse {
  success: boolean;
  user?: User;
  session?: any;
  error?: Error;
  warning?: string;
  data?: any;
}

/**
 * Interface for user data during registration
 */
interface UserData {
  name?: string;
  profile_picture?: string;
  bio?: string;
  [key: string]: any;
}

/**
 * Service for managing authentication with Supabase
 */
const AuthService = {
  /**
   * Sign up a new user
   * @param email - User's email
   * @param password - User's password
   * @param userData - Additional user data
   * @returns Result of the signup operation
   */
  signUp: async (email: string, password: string, userData: UserData): Promise<AuthResponse> => {
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // If signup was successful, create a user profile in the users table
      if (authData?.user) {
        console.log('Creating user profile for:', authData.user.id);
        
        // Check if user already exists in the users table
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('id', authData.user.id)
          .single();
          
        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking if user exists:', checkError);
        }
        
        // Only create a new user if they don't already exist
        if (!existingUser) {
          const { data: profileData, error: profileError } = await supabase
            .from('users')
            .insert([{
              id: authData.user.id,
              email: email,
              name: userData.name || '',
              profile_picture: userData.profile_picture || '',
              bio: userData.bio || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
            .select();

          if (profileError) {
            console.error('Error creating user profile:', profileError);
            console.error('Profile data attempted:', {
              id: authData.user.id,
              email: email,
              name: userData.name || ''
            });
            // Even if profile creation fails, return auth success
            return { 
              success: true, 
              user: authData.user as User,
              warning: 'Authentication successful but profile creation failed: ' + profileError.message
            };
          }
          
          console.log('User profile created successfully:', profileData);
        } else {
          console.log('User profile already exists, skipping creation');
        }
      }

      return { success: true, user: authData?.user as User };
    } catch (error) {
      console.error('Error in sign up:', error instanceof Error ? error.message : 'Unknown error');
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Unknown error in signup')
      };
    }
  },

  /**
   * Sign in an existing user
   * @param email - User's email
   * @param password - User's password
   * @returns Result of the signin operation
   */
  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { success: true, user: data?.user as User, session: data?.session };
    } catch (error) {
      console.error('Error in sign in:', error instanceof Error ? error.message : 'Unknown error');
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Unknown error in signin')
      };
    }
  },

  /**
   * Sign out the current user
   * @returns Result of the signout operation
   */
  signOut: async (): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error in sign out:', error instanceof Error ? error.message : 'Unknown error');
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Unknown error in signout')
      };
    }
  },

  /**
   * Get the current session
   * @returns The current session
   */
  getSession: async (): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      return { 
        success: true, 
        session: data.session, 
        user: data.session?.user as User
      };
    } catch (error) {
      console.error('Error getting session:', error instanceof Error ? error.message : 'Unknown error');
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Unknown error in getSession')
      };
    }
  },

  /**
   * Get the current user
   * @returns The current user
   */
  getCurrentUser: async (): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      return { success: true, user: data.user as User };
    } catch (error) {
      console.error('Error getting current user:', error instanceof Error ? error.message : 'Unknown error');
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Unknown error in getCurrentUser')
      };
    }
  },
  
  /**
   * Reset password
   * @param email - User's email
   * @returns Result of the password reset operation
   */
  resetPassword: async (email: string): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'adoptmeapp://reset-password',
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error instanceof Error ? error.message : 'Unknown error');
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Unknown error in resetPassword')
      };
    }
  },

  /**
   * Sign in with Google OAuth
   * @returns Result of the Google sign in operation
   */
  signInWithGoogle: async (): Promise<AuthResponse> => {
    try {
      console.log('Initiating Google OAuth sign-in process...');
      
      // Set up the OAuth options
      const options = {
        provider: 'google' as Provider,
        options: {
          redirectTo: 'https://naryyzfncswysrbrzizo.supabase.co/auth/v1/callback',
          skipBrowserRedirect: false,
        },
      };
      
      console.log('OAuth options:', JSON.stringify(options));
      
      // Trigger the OAuth flow
      const { data, error } = await supabase.auth.signInWithOAuth(options);
      
      console.log('Supabase auth.signInWithOAuth response:', JSON.stringify(data || {}));
      
      if (error) {
        console.error('Supabase OAuth error:', error);
        throw error;
      }
      
      // For mobile platforms, we need to open the URL manually
      if (data?.url) {
        console.log('OAuth URL to open:', data.url);
        
        // Try to use React Native's Linking API if available in this context
        try {
          const Linking = require('react-native').Linking;
          console.log('Opening URL with Linking API...');
          await Linking.openURL(data.url);
          console.log('URL opened successfully');
        } catch (openError) {
          console.warn('Could not automatically open URL with Linking API:', openError);
          // We'll return the URL so the caller can handle opening it
        }
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Error in Google sign in:', error instanceof Error ? error.message : 'Unknown error');
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Unknown error in signInWithGoogle')
      };
    }
  }
};

export default AuthService; 