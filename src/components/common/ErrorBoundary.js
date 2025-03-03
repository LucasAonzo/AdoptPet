import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { logErrorToFile, flushMemoryLogs, addBreadcrumb } from '../../utils/debugUtils';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    // Add a breadcrumb for the error
    addBreadcrumb('Error caught by boundary', {
      type: 'error',
      message: error.message || 'Unknown error',
      source: 'ErrorBoundary',
    });
    
    // Log detailed error information
    console.error('Error caught by ErrorBoundary:', error);
    
    try {
      // Log to file system for later debugging
      logErrorToFile({
        message: error.message || 'Unknown error',
        name: error.name,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
        source: 'ErrorBoundary'
      });
      
      // Make sure logs are persisted
      flushMemoryLogs();
    } catch (loggingError) {
      console.error('Failed to log error details:', loggingError);
    }
  }

  resetError = () => {
    addBreadcrumb('User reset error in ErrorBoundary');
    this.setState({ hasError: false, error: null, errorInfo: null });
  }
  
  toggleDetails = () => {
    this.setState(prevState => ({ showDetails: !prevState.showDetails }));
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Ionicons name="warning" size={60} color="#FF6B6B" />
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          
          <TouchableOpacity 
            style={styles.detailsToggle} 
            onPress={this.toggleDetails}
          >
            <Text style={styles.detailsToggleText}>
              {this.state.showDetails ? 'Hide Details' : 'Show Details'}
            </Text>
          </TouchableOpacity>
          
          {this.state.showDetails && (
            <ScrollView style={styles.errorDetails}>
              <Text style={styles.errorText}>
                {this.state.error?.toString()}
              </Text>
              <Text style={styles.stackText}>
                {this.state.errorInfo?.componentStack}
              </Text>
            </ScrollView>
          )}
          
          {this.props.fallback || (
            <TouchableOpacity
              style={styles.button}
              onPress={this.resetError}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
    lineHeight: 22,
  },
  detailsToggle: {
    marginBottom: 16,
  },
  detailsToggleText: {
    color: '#8e74ae',
    textDecorationLine: 'underline',
  },
  errorDetails: {
    maxHeight: 200,
    width: '100%',
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#e74c3c',
    marginBottom: 10,
  },
  stackText: {
    fontSize: 12,
    color: '#777',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  button: {
    backgroundColor: '#8e74ae',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ErrorBoundary; 