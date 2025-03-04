import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import React from 'react';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './src/config/queryClient';
import MainNavigator from './src/navigation/MainNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { ModalProvider } from './src/components/modals';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { 
  StyleSheet, 
  LogBox, 
  Text, 
  View, 
  ActivityIndicator, 
  AppState, 
  AppStateStatus 
} from 'react-native';
import { 
  setupGlobalErrorHandler, 
  initDebugSystem, 
  addBreadcrumb, 
  flushMemoryLogs 
} from './src/utils/debugUtils';
import ErrorBoundary from './src/components/common/ErrorBoundary';

// Ignore specific warnings that might not be relevant
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'ViewPropTypes will be removed from React Native',
]);

export default function App(): React.ReactElement {
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Handle app state changes to flush logs when app goes to background
  const handleAppStateChange = (nextAppState: AppStateStatus): void => {
    addBreadcrumb('App state changed', { nextAppState });
    
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      addBreadcrumb('App going to background, flushing logs');
      flushMemoryLogs().catch(err => console.error('Error flushing logs:', err));
    }
  };

  // Set up global error handler and system when app mounts
  useEffect(() => {
    const initialize = async (): Promise<void> => {
      try {
        console.log('Initializing app and debug systems...');
        
        // Initialize the debug system
        await initDebugSystem();
        
        // Set up global error handler
        setupGlobalErrorHandler();
        
        addBreadcrumb('App initialization complete');
        console.log('App initialization complete');
      } catch (error) {
        console.error('Error during app initialization:', error);
      } finally {
        // Always mark initialization as complete
        setIsInitializing(false);
      }
    };

    initialize();

    // Set up app state change listener
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup function
    return () => {
      subscription.remove();
      addBreadcrumb('App component unmounting');
      flushMemoryLogs().catch(err => console.error('Error flushing logs on unmount:', err));
    };
  }, []);

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8e74ae" />
        <Text style={styles.loadingText}>Initializing app...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SafeAreaProvider>
              <ModalProvider>
                <MainNavigator />
              </ModalProvider>
            </SafeAreaProvider>
          </AuthProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  }
}); 