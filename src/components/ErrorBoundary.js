import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { logErrorToFile, flushMemoryLogs } from '../utils/debugUtils';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    this.setState({ errorInfo });
    
    // Log to debug system
    console.error('Error caught by boundary:', error);
    
    try {
      // Log error details for debugging
      logErrorToFile({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        source: 'ErrorBoundary',
        timestamp: new Date().toISOString()
      });
      
      // Make sure logs are flushed
      flushMemoryLogs();
    } catch (loggingError) {
      console.error('Failed to log error to file:', loggingError);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Ionicons name="alert-circle" size={64} color="#8e74ae" />
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            We apologize for the inconvenience. The app encountered an unexpected error.
          </Text>
          
          <ScrollView style={styles.errorDetails}>
            <Text style={styles.errorText}>
              {this.state.error?.toString()}
            </Text>
            <Text style={styles.stackText}>
              {this.state.errorInfo?.componentStack}
            </Text>
          </ScrollView>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={this.resetError}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorDetails: {
    maxHeight: 200,
    width: '100%',
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 20,
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
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorBoundary; 