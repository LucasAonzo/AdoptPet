import supabase from '../config/supabase';

/**
 * Service for managing authentication with Supabase
 */
const AuthService = {
  /**
   * Sign up a new user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {object} userData - Additional user data
   * @returns {Promise<Object>} - Result of the signup operation
   */
  signUp: async (email, password, userData) => {
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
              user: authData.user,
              warning: 'Authentication successful but profile creation failed: ' + profileError.message
            };
          }
          
          console.log('User profile created successfully:', profileData);
        } else {
          console.log('User profile already exists, skipping creation');
        }
      }

      return { success: true, user: authData?.user };
    } catch (error) {
      console.error('Error in sign up:', error.message);
      return { success: false, error };
    }
  },

  /**
   * Sign in an existing user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} - Result of the signin operation
   */
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { success: true, user: data?.user, session: data?.session };
    } catch (error) {
      console.error('Error in sign in:', error.message);
      return { success: false, error };
    }
  },

  /**
   * Sign out the current user
   * @returns {Promise<Object>} - Result of the signout operation
   */
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error in sign out:', error.message);
      return { success: false, error };
    }
  },

  /**
   * Get the current session
   * @returns {Promise<Object>} - The current session
   */
  getSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      return { 
        success: true, 
        session: data.session, 
        user: data.session?.user 
      };
    } catch (error) {
      console.error('Error getting session:', error.message);
      return { success: false, error };
    }
  },

  /**
   * Get the current user
   * @returns {Promise<Object>} - The current user
   */
  getCurrentUser: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Error getting current user:', error.message);
      return { success: false, error };
    }
  },
  
  /**
   * Reset password
   * @param {string} email - User's email
   * @returns {Promise<Object>} - Result of the password reset operation
   */
  resetPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'adoptmeapp://reset-password',
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error.message);
      return { success: false, error };
    }
  }
};

export default AuthService; 