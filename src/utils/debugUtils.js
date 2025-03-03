import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

// Store logs in memory as a backup in case file system operations fail
let memoryLogs = [];
let isInitialized = false;

// Initialize the debug system and add a startup log
const initDebugSystem = async () => {
  if (isInitialized) return;
  
  try {
    console.log('Initializing debug system...');
    // Add initial breadcrumb
    addBreadcrumb('App started', { 
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      version: Platform.Version
    });
    
    // Check if logs directory exists, create if not
    const logDir = FileSystem.documentDirectory + 'logs/';
    const dirInfo = await FileSystem.getInfoAsync(logDir);
    
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(logDir, { intermediates: true });
      console.log('Created logs directory');
    }
    
    // Write an initialization marker
    await FileSystem.writeAsStringAsync(
      logDir + 'debug_init.txt',
      `Debug system initialized: ${new Date().toISOString()}`
    );
    
    // Force immediate log write
    await logErrorToFile({
      type: 'system_init',
      message: 'Debug system initialized',
      timestamp: new Date().toISOString()
    });
    
    isInitialized = true;
    console.log('Debug system initialized successfully');
  } catch (error) {
    console.error('Failed to initialize debug system:', error);
  }
};

// Global error handler to catch otherwise uncaught errors
const setupGlobalErrorHandler = () => {
  // Initialize the debug system first
  initDebugSystem();
  
  try {
    // Handle global JavaScript errors
    if (global.ErrorUtils) {
      // Keep track of the original error handler
      const originalErrorHandler = global.ErrorUtils.getGlobalHandler();
      
      // Set up our custom error handler
      global.ErrorUtils.setGlobalHandler((error, isFatal) => {
        try {
          // Log the error details
          console.error('GLOBAL ERROR CAUGHT:', error);
          console.error('Is Fatal:', isFatal);
          console.error('Stack:', error.stack);
          
          // Capture the error details synchronously to memory
          memoryLogs.push({
            type: 'uncaught_global',
            message: error.message || 'Unknown error',
            stack: error.stack || 'No stack trace',
            isFatal,
            timestamp: new Date().toISOString()
          });
          
          // Immediately try to flush the logs to file system, but don't wait
          try {
            flushMemoryLogs();
          } catch (flushError) {
            console.error('Error flushing logs:', flushError);
          }
          
          // Show an alert with the error details
          setTimeout(() => {
            try {
              Alert.alert(
                'Application Error',
                `An unexpected error occurred: ${error.message}\n\nPlease restart the app.`,
                [{ text: 'OK' }]
              );
            } catch (alertError) {
              console.error('Failed to show alert:', alertError);
            }
          }, 100);
        } catch (handlerError) {
          console.error('Error in global error handler:', handlerError);
        } finally {
          // Always call the original handler
          if (originalErrorHandler) {
            originalErrorHandler(error, isFatal);
          }
        }
      });
      
      console.log('Global error handler configured successfully');
    } else {
      console.warn('ErrorUtils not available, global error handling disabled');
    }
    
    // Set up unhandled promise rejection handler
    if (global.process && typeof global.process.on === 'function') {
      global.process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Promise Rejection:', reason);
        
        logErrorToFile({
          type: 'unhandled_promise',
          message: reason?.message || 'Unknown promise rejection',
          stack: reason?.stack || 'No stack trace',
          timestamp: new Date().toISOString()
        });
      });
      
      console.log('Unhandled promise rejection handler configured');
    }
  } catch (error) {
    console.error('Failed to setup global error handler:', error);
  }
};

// Flush memory logs to file system
const flushMemoryLogs = async () => {
  if (memoryLogs.length === 0) return;
  
  try {
    // Get existing logs
    const existingLogs = await getErrorLogs();
    
    // Combine with memory logs
    const combinedLogs = [...existingLogs, ...memoryLogs];
    
    // Write all logs back to file
    const logFilePath = `${FileSystem.documentDirectory}logs/error_logs.json`;
    await FileSystem.writeAsStringAsync(
      logFilePath,
      JSON.stringify(combinedLogs, null, 2)
    );
    
    // Clear memory logs after successful write
    console.log('Successfully flushed', memoryLogs.length, 'logs to file');
    memoryLogs = [];
  } catch (error) {
    console.error('Error flushing memory logs:', error);
  }
};

// Log error information to a file for later analysis
const logErrorToFile = async (errorInfo) => {
  try {
    // Add to memory logs immediately (synchronous)
    memoryLogs.push(errorInfo);
    
    // Ensure the logs directory exists
    const logDir = FileSystem.documentDirectory + 'logs/';
    const dirInfo = await FileSystem.getInfoAsync(logDir);
    
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(logDir, { intermediates: true });
    }
    
    // Define the log file path
    const logFilePath = `${logDir}error_logs.json`;
    
    // Check if the file exists
    const fileInfo = await FileSystem.getInfoAsync(logFilePath);
    
    let logs = [];
    if (fileInfo.exists) {
      try {
        // Read existing logs
        const content = await FileSystem.readAsStringAsync(logFilePath);
        logs = JSON.parse(content);
      } catch (readError) {
        console.error('Error reading logs file, creating new:', readError);
      }
    }
    
    // Add the new error log with device info
    logs.push({
      ...errorInfo,
      deviceInfo: {
        platform: Platform.OS,
        version: Platform.Version,
        device: Platform.constants?.Brand || 'unknown',
        timestamp: new Date().toISOString()
      }
    });
    
    // Write back to the file
    await FileSystem.writeAsStringAsync(
      logFilePath,
      JSON.stringify(logs, null, 2)
    );
    
    console.log('Error logged to file:', logFilePath);
    
    // Clear memory logs since we've written successfully
    memoryLogs = memoryLogs.filter(log => log !== errorInfo);
    
    return true;
  } catch (e) {
    console.error('Failed to log error to file:', e);
    return false;
  }
};

// Function to retrieve logged errors
const getErrorLogs = async () => {
  try {
    const logFilePath = `${FileSystem.documentDirectory}logs/error_logs.json`;
    const fileInfo = await FileSystem.getInfoAsync(logFilePath);
    
    if (fileInfo.exists) {
      try {
        const content = await FileSystem.readAsStringAsync(logFilePath);
        const parsedLogs = JSON.parse(content);
        return parsedLogs;
      } catch (parseError) {
        console.error('Error parsing logs file:', parseError);
        return [];
      }
    }
    
    // If we have memory logs but no file, return those
    if (memoryLogs.length > 0) {
      return [...memoryLogs];
    }
    
    return [];
  } catch (e) {
    console.error('Failed to retrieve error logs:', e);
    
    // Return memory logs as fallback
    if (memoryLogs.length > 0) {
      return [...memoryLogs];
    }
    
    return [];
  }
};

// Clear error logs
const clearErrorLogs = async () => {
  try {
    const logFilePath = `${FileSystem.documentDirectory}logs/error_logs.json`;
    const fileInfo = await FileSystem.getInfoAsync(logFilePath);
    
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(logFilePath, { idempotent: true });
    }
    
    // Also clear memory logs
    memoryLogs = [];
    console.log('Error logs cleared');
    return true;
  } catch (e) {
    console.error('Failed to clear error logs:', e);
    return false;
  }
};

// Function to wrap async operations with better error handling
const safeExecute = async (operation, context = 'unknown') => {
  try {
    return await operation();
  } catch (error) {
    console.error(`Error in ${context}:`, error);
    await logErrorToFile({
      type: 'caught_operation',
      context,
      message: error.message || 'Unknown error',
      stack: error.stack || 'No stack trace',
      timestamp: new Date().toISOString()
    });
    
    // Rethrow or handle as needed
    throw error;
  }
};

// Create debug breadcrumbs to track execution flow
let breadcrumbs = [];
const MAX_BREADCRUMBS = 100; // Increased max to capture more context

const addBreadcrumb = (message, data = {}) => {
  try {
    const breadcrumb = {
      timestamp: new Date().toISOString(),
      message,
      data: data || {}
    };
    
    breadcrumbs.push(breadcrumb);
    if (breadcrumbs.length > MAX_BREADCRUMBS) {
      breadcrumbs.shift();
    }
    
    console.log(`BREADCRUMB: ${message}`, data);
    
    // Periodically save breadcrumbs to file
    if (breadcrumbs.length % 10 === 0) {
      saveBreadcrumbsToFile().catch(error => {
        console.error('Failed to save breadcrumbs:', error);
      });
    }
    
    return breadcrumb;
  } catch (error) {
    console.error('Error adding breadcrumb:', error);
    return null;
  }
};

// Save breadcrumbs to file system for persistence
const saveBreadcrumbsToFile = async () => {
  try {
    const logDir = FileSystem.documentDirectory + 'logs/';
    const dirInfo = await FileSystem.getInfoAsync(logDir);
    
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(logDir, { intermediates: true });
    }
    
    const breadcrumbsPath = `${logDir}breadcrumbs.json`;
    await FileSystem.writeAsStringAsync(
      breadcrumbsPath,
      JSON.stringify(breadcrumbs, null, 2)
    );
    
    return true;
  } catch (error) {
    console.error('Error saving breadcrumbs to file:', error);
    return false;
  }
};

// Load saved breadcrumbs from file
const loadBreadcrumbsFromFile = async () => {
  try {
    const breadcrumbsPath = `${FileSystem.documentDirectory}logs/breadcrumbs.json`;
    const fileInfo = await FileSystem.getInfoAsync(breadcrumbsPath);
    
    if (fileInfo.exists) {
      const content = await FileSystem.readAsStringAsync(breadcrumbsPath);
      const loadedBreadcrumbs = JSON.parse(content);
      
      // Merge with existing breadcrumbs, avoiding duplicates by timestamp
      const existingTimestamps = new Set(breadcrumbs.map(crumb => crumb.timestamp));
      const newBreadcrumbs = loadedBreadcrumbs.filter(
        crumb => !existingTimestamps.has(crumb.timestamp)
      );
      
      breadcrumbs = [...breadcrumbs, ...newBreadcrumbs]
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .slice(-MAX_BREADCRUMBS);
        
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error loading breadcrumbs from file:', error);
    return false;
  }
};

const getBreadcrumbs = async () => {
  // Try to load from file first to get any from previous sessions
  try {
    await loadBreadcrumbsFromFile();
  } catch (error) {
    console.error('Error loading breadcrumbs:', error);
  }
  
  return [...breadcrumbs];
};

const clearBreadcrumbs = async () => {
  try {
    breadcrumbs = [];
    
    // Also clear the file
    const breadcrumbsPath = `${FileSystem.documentDirectory}logs/breadcrumbs.json`;
    const fileInfo = await FileSystem.getInfoAsync(breadcrumbsPath);
    
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(breadcrumbsPath, { idempotent: true });
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing breadcrumbs:', error);
    return false;
  }
};

export {
  setupGlobalErrorHandler,
  initDebugSystem,
  logErrorToFile,
  getErrorLogs,
  clearErrorLogs,
  safeExecute,
  addBreadcrumb,
  getBreadcrumbs,
  clearBreadcrumbs,
  flushMemoryLogs
}; 