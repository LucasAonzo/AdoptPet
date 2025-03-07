import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import AuthService from '../services/authService';
import supabase from '../config/supabase';

// Create the AuthContext
const AuthContext = createContext(null);

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        setSession(data.session);
        setUser(data.session?.user || null);
        
        // Listen for auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            
            setSession(newSession);
            setUser(newSession?.user || null);
          }
        );

        return () => {
          authListener?.subscription?.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const result = await AuthService.signIn(email, password);
      
      if (!result.success) {
        Alert.alert('Sign In Error', result.error.message);
        return false;
      }
      
      return true;
    } catch (error) {
      Alert.alert('Sign In Error', error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email, password, userData) => {
    try {
      setLoading(true);
      const result = await AuthService.signUp(email, password, userData);
      
      if (!result.success) {
        Alert.alert('Sign Up Error', result.error.message);
        return false;
      }
      
      if (result.warning) {
        console.warn(result.warning);
      }
      
      Alert.alert('Success', 'Account created successfully! Please check your email to confirm your account.');
      return true;
    } catch (error) {
      Alert.alert('Sign Up Error', error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      const result = await AuthService.signOut();
      
      if (!result.success) {
        Alert.alert('Sign Out Error', result.error.message);
        return false;
      }
      
      return true;
    } catch (error) {
      Alert.alert('Sign Out Error', error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Password reset
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      const result = await AuthService.resetPassword(email);
      
      if (!result.success) {
        Alert.alert('Password Reset Error', result.error.message);
        return false;
      }
      
      Alert.alert('Success', 'Password reset instructions sent to your email.');
      return true;
    } catch (error) {
      Alert.alert('Password Reset Error', error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      console.log('Starting Google sign-in process...');
      
      const result = await AuthService.signInWithGoogle();
      console.log('Google sign-in result:', result);
      
      if (!result.success) {
        console.error('Google sign-in error:', result.error);
        Alert.alert('Google Sign In Error', result.error.message);
        return false;
      }
      
      // For OAuth, we need to handle the URL opening differently
      if (result.data?.url) {
        console.log('Opening OAuth URL:', result.data.url);
        
        // For debugging - we'll alert the URL that should be opened
        Alert.alert(
          'OAuth Redirect',
          `Please open this URL in your browser to complete Google login: ${result.data.url}`,
          [
            { 
              text: 'OK', 
              onPress: () => console.log('URL alert closed') 
            }
          ]
        );
      }
      
      return true;
    } catch (error) {
      console.error('Unexpected error in Google sign-in:', error);
      Alert.alert('Google Sign In Error', error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Define the value object to be provided by the context
  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithGoogle,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 