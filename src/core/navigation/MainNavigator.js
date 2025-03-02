import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { registerURLHandler } from '../../shared/utils/URLHandler';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import { useAuth } from '../../features/auth/hooks/useAuth';
import theme from '../../shared/styles/theme';

/**
 * Main application navigator
 * Controls flow between authenticated and unauthenticated states
 */
const MainNavigator = () => {
  // State to track URL handling
  const [initialUrl, setInitialUrl] = useState(null);
  
  // Get authentication state from auth hook
  const { isAuthenticated, isLoading } = useAuth();

  // Handle deep links
  useEffect(() => {
    // Register URL handler for deep links
    const unsubscribe = registerURLHandler((event) => {
      setInitialUrl(event.url);
    });

    // Clean up the URL handler when component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  // If loading, we could show a splash screen here
  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar
        backgroundColor={theme.colors.background}
        barStyle="dark-content"
      />
      {isAuthenticated ? <TabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default MainNavigator; 