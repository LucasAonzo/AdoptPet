import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, Platform, Linking } from 'react-native';
import AuthNavigator from './AuthNavigator';
import { useAuth } from '../context/AuthContext';
import TabNavigator from './TabNavigator';
import { handleAuthDeepLink, registerURLHandler } from '../utils/URLHandler';

const Stack = createStackNavigator();

const MainNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  // Configure deep linking
  const linking = {
    prefixes: ['adoptmeapp://', 'https://adoptme.app'],
    config: {
      screens: {
        Auth: {
          screens: {
            Login: 'login',
            SignUp: 'signup',
            ForgotPassword: 'reset-password',
          }
        },
        Main: {
          screens: {
            Home: 'home',
            Profile: 'profile',
          }
        }
      }
    },
    // Custom function to handle Supabase auth callbacks
    async getInitialURL() {
      // First, check if the app was opened via a deep link
      const url = await Linking.getInitialURL();
      console.log('Initial URL:', url);
      
      if (url !== null) {
        // Process any auth-related URLs
        await handleAuthDeepLink(url);
        return url;
      }
      
      return null;
    },
    // Custom function to subscribe to incoming links
    subscribe(listener) {
      // Listen to incoming links from deep linking
      const linkingSubscription = Linking.addEventListener('url', async ({ url }) => {
        console.log('Incoming URL:', url);
        
        // Process any auth-related URLs
        await handleAuthDeepLink(url);
        
        listener(url);
      });

      return () => {
        // Clean up the event listener when unmounting
        linkingSubscription.remove();
      };
    },
  };

  useEffect(() => {
    // Add a listener for auth state changes through URL handling
    const handleURL = async (url) => {
      console.log('Handling URL in effect:', url);
      await handleAuthDeepLink(url);
    };

    // Get initial URL if the app was opened through a deep link
    const checkInitialURL = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        console.log('App opened with initial URL:', url);
        await handleURL(url);
      }
    };

    // Check for initial URL
    checkInitialURL();

    // Register URL handler for when app is already open
    const unsubscribe = registerURLHandler(handleURL);

    return () => {
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0077B6" />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#f8f8f8' },
        }}
      >
        {isAuthenticated ? (
          // User is signed in
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          // User is not signed in
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigator; 