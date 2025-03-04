import React, { useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { StatusBar, StatusBarStyle, Linking } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import TabNavigator from './TabNavigator';
import AuthNavigator from './AuthNavigator';
import { useAuth } from '../../context/AuthContext';
import theme from '../../styles/theme';

interface AppTheme {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
  }
}

// Mock type for useAuth hook
interface AuthContextType {
  isAuthenticated: boolean;
  // Add other properties as needed
}

/**
 * Main application navigator
 * Controls flow between authenticated and unauthenticated states
 */
const MainNavigator: React.FC = () => {
  const [url, setUrl] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Handle deep links
  useEffect(() => {
    // Get the initial URL
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL();
      setUrl(initialUrl);
    };

    getUrlAsync();

    // Listen for deep links while the app is open
    const listener = Linking.addEventListener('url', (event) => {
      setUrl(event.url);
    });

    return () => {
      listener.remove();
    };
  }, []);

  // Set navigation theme
  const MyTheme: AppTheme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      ...DefaultTheme.colors,
      primary: '#3F51B5', // Use literal primary color
      background: '#FFFFFF', // Use literal background color
      card: '#FFFFFF', // Use literal card color 
      text: '#212121', // Use literal text color
      border: '#E0E0E0', // Use literal border color
      notification: '#F44336', // Use literal notification color
    },
  };

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={'light-content' as StatusBarStyle}
        backgroundColor="#3F51B5" // Use literal primary color
      />
      <NavigationContainer theme={MyTheme}>
        {isAuthenticated ? <TabNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default MainNavigator; 