import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, Platform, Linking, Text, TouchableOpacity } from 'react-native';
import AuthNavigator from './AuthNavigator';
import { useAuth } from '../context/AuthContext';
import TabNavigator from './TabNavigator';
import { handleAuthDeepLink, registerURLHandler } from '../utils/URLHandler';
import ErrorBoundary from '../components/common/ErrorBoundary';

const Stack = createStackNavigator();

// Create navigation configuration with optimized settings
const navigationConfig = {
  // Transition animation configuration
  screenOptions: {
    // Enable animations for smooth transitions
    animationEnabled: true,
    // Enable gestures for navigation
    gestureEnabled: true,
    gestureDirection: 'horizontal',
  },
};

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
     
      await handleAuthDeepLink(url);
    };

    // Get initial URL if the app was opened through a deep link
    const checkInitialURL = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        
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

  // Create a fallback component for the ErrorBoundary
  const navigationFallback = (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20, textAlign: 'center' }}>
        There was a problem loading the app. This could be due to a navigation error.
      </Text>
      <TouchableOpacity 
        style={{ 
          backgroundColor: '#8e74ae', 
          paddingVertical: 10, 
          paddingHorizontal: 20, 
          borderRadius: 8 
        }}
        onPress={() => {
          // Try reloading the app
          if (Platform.OS === 'web') {
            window.location.reload();
          } else {
            // For native, we can't really reload, but we can try to reset state
            console.log('Attempting to reset app state');
          }
        }}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>Reload App</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ErrorBoundary fallback={navigationFallback}>
      <NavigationContainer 
        linking={linking}
        // Add performance optimizations
        theme={{
          dark: false,
          colors: {
            primary: '#8e74ae',
            background: '#ffffff',
            card: '#ffffff',
            text: '#000000',
            border: '#cccccc',
            notification: '#ff3b30',
          },
        }}
        // Detach inactive screens to improve memory usage
        detachInactiveScreens={true}
      >
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#f8f8f8' },
            // Enable animations for smooth transitions
            animationEnabled: true,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            detachPreviousScreen: !Platform.isPad,
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
    </ErrorBoundary>
  );
};

export default MainNavigator; 