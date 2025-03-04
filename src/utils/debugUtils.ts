import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

// Define types for our application
interface ErrorInfo {
  type: string;
  message: string;
  stack?: string;
  isFatal?: boolean;
  context?: string;
  timestamp: string;
  deviceInfo?: DeviceInfo;
  [key: string]: any; // For any additional properties
}

interface DeviceInfo {
  platform: string;
  version: number | string;
  device: string;
  timestamp: string;
}

interface Breadcrumb {
  timestamp: string;
  message: string;
  data: Record<string, any>;
}

interface NetworkOperationOptions {
  retries?: number;
  backoffMs?: number;
  timeout?: number;
  validateResponse?: (response: any) => boolean;
}

interface FormSubmissionOptions {
  validation?: (data: any) => { valid: boolean; errors?: Record<string, string> };
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  retries?: number;
}

// Add ErrorUtils to the global interface
declare global {
  interface GlobalErrorUtils {
    getGlobalHandler(): (error: Error, isFatal?: boolean) => void;
    setGlobalHandler(callback: (error: Error, isFatal?: boolean) => void): void;
  }
  
  interface Global {
    ErrorUtils: GlobalErrorUtils;
  }
}

// Store logs in memory as a backup in case file system operations fail
let memoryLogs: ErrorInfo[] = [];
let isInitialized = false;

// Initialize the debug system and add a startup log
const initDebugSystem = async (): Promise<void> => {
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
const setupGlobalErrorHandler = (): void => {
  // Initialize the debug system first
  initDebugSystem();
  
  try {
    // Handle global JavaScript errors
    if ((global as any).ErrorUtils) {
      // Keep track of the original error handler
      const originalErrorHandler = (global as any).ErrorUtils.getGlobalHandler();
      
      // Set up our custom error handler
      (global as any).ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
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
      global.process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
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
const flushMemoryLogs = async (): Promise<void> => {
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
const logErrorToFile = async (errorInfo: ErrorInfo): Promise<boolean> => {
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
    
    let logs: ErrorInfo[] = [];
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
        device: (Platform.constants as any)?.Brand || 'unknown',
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
const getErrorLogs = async (): Promise<ErrorInfo[]> => {
  try {
    const logFilePath = `${FileSystem.documentDirectory}logs/error_logs.json`;
    const fileInfo = await FileSystem.getInfoAsync(logFilePath);
    
    if (fileInfo.exists) {
      try {
        const content = await FileSystem.readAsStringAsync(logFilePath);
        const parsedLogs: ErrorInfo[] = JSON.parse(content);
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
const clearErrorLogs = async (): Promise<boolean> => {
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
const safeExecute = async <T>(operation: () => Promise<T>, context = 'unknown'): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
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
let breadcrumbs: Breadcrumb[] = [];
const MAX_BREADCRUMBS = 100; // Increased max to capture more context

const addBreadcrumb = (message: string, data: Record<string, any> = {}): void => {
  try {
    const breadcrumb: Breadcrumb = {
      timestamp: new Date().toISOString(),
      message,
      data
    };
    
    breadcrumbs.push(breadcrumb);
    
    // Trim if we exceed max
    if (breadcrumbs.length > MAX_BREADCRUMBS) {
      breadcrumbs = breadcrumbs.slice(breadcrumbs.length - MAX_BREADCRUMBS);
    }
    
    // Attempt to save to file in the background
    saveBreadcrumbsToFile().catch(e => 
      console.error('Failed to save breadcrumbs:', e)
    );
  } catch (e) {
    console.error('Error adding breadcrumb:', e);
  }
};

// Save breadcrumbs to persistent storage
const saveBreadcrumbsToFile = async (): Promise<void> => {
  try {
    const logDir = FileSystem.documentDirectory + 'logs/';
    const dirInfo = await FileSystem.getInfoAsync(logDir);
    
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(logDir, { intermediates: true });
    }
    
    const breadcrumbPath = `${logDir}breadcrumbs.json`;
    await FileSystem.writeAsStringAsync(
      breadcrumbPath,
      JSON.stringify(breadcrumbs, null, 2)
    );
  } catch (e) {
    console.error('Failed to save breadcrumbs:', e);
  }
};

// Load breadcrumbs from file
const loadBreadcrumbsFromFile = async (): Promise<Breadcrumb[]> => {
  try {
    const breadcrumbPath = `${FileSystem.documentDirectory}logs/breadcrumbs.json`;
    const fileInfo = await FileSystem.getInfoAsync(breadcrumbPath);
    
    if (fileInfo.exists) {
      const content = await FileSystem.readAsStringAsync(breadcrumbPath);
      return JSON.parse(content);
    }
    
    return [];
  } catch (e) {
    console.error('Failed to load breadcrumbs:', e);
    return [];
  }
};

// Get current breadcrumbs
const getBreadcrumbs = async (): Promise<Breadcrumb[]> => {
  // Combine memory breadcrumbs with persisted ones if available
  const persistedBreadcrumbs = await loadBreadcrumbsFromFile();
  return [...persistedBreadcrumbs, ...breadcrumbs];
};

// Clear breadcrumbs
const clearBreadcrumbs = async (): Promise<boolean> => {
  try {
    breadcrumbs = [];
    const breadcrumbPath = `${FileSystem.documentDirectory}logs/breadcrumbs.json`;
    const fileInfo = await FileSystem.getInfoAsync(breadcrumbPath);
    
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(breadcrumbPath, { idempotent: true });
    }
    
    return true;
  } catch (e) {
    console.error('Failed to clear breadcrumbs:', e);
    return false;
  }
};

// Safe network operation with retries and error handling
const safeNetworkOperation = async <T>(
  operation: () => Promise<T>, 
  operationName = 'database_operation',
  options: NetworkOperationOptions = {}
): Promise<T> => {
  const {
    retries = 3,
    backoffMs = 300,
    timeout = 10000,
    validateResponse = null
  } = options;
  
  let lastError: Error | null = null;
  let attemptCount = 0;
  
  while (attemptCount < retries) {
    attemptCount++;
    
    try {
      // Add operation breadcrumb
      addBreadcrumb(`Network operation: ${operationName}`, {
        attempt: attemptCount,
        timestamp: new Date().toISOString()
      });
      
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Operation ${operationName} timed out after ${timeout}ms`));
        }, timeout);
      });
      
      // Race the operation against the timeout
      const result = await Promise.race([
        operation(),
        timeoutPromise
      ]) as T;
      
      // If validation function is provided, use it to verify response
      if (validateResponse && !validateResponse(result)) {
        throw new Error(`Response validation failed for ${operationName}`);
      }
      
      // Add success breadcrumb
      addBreadcrumb(`Network operation succeeded: ${operationName}`, {
        attempt: attemptCount,
        timestamp: new Date().toISOString()
      });
      
      return result;
    } catch (error: any) {
      lastError = error;
      
      // Log the error
      console.error(`Network operation ${operationName} failed (attempt ${attemptCount}):`, error);
      
      // Add failure breadcrumb
      addBreadcrumb(`Network operation failed: ${operationName}`, {
        attempt: attemptCount,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      // Log the error to file but don't wait
      logErrorToFile({
        type: 'network_operation_error',
        operationName,
        attempt: attemptCount,
        message: error.message || 'Unknown error',
        stack: error.stack || 'No stack trace',
        timestamp: new Date().toISOString()
      }).catch(logError => {
        console.error('Failed to log network error:', logError);
      });
      
      // If we haven't exhausted retries, wait before retry
      if (attemptCount < retries) {
        // Exponential backoff
        const waitTime = backoffMs * Math.pow(2, attemptCount - 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  // If we've exhausted all retries, throw the last error
  if (lastError) {
    throw lastError;
  }
  
  // TypeScript requires this, but it should be unreachable
  throw new Error(`Network operation ${operationName} failed for unknown reasons`);
};

// Safe form submission with validation and error handling
const safeFormSubmission = async <T, R>(
  formData: T,
  submitOperation: (data: T) => Promise<R>,
  formName = 'form',
  options: FormSubmissionOptions = {}
): Promise<R> => {
  const {
    validation,
    onSuccess,
    onError,
    retries = 2
  } = options;
  
  try {
    // Add form submission breadcrumb
    addBreadcrumb(`Form submission started: ${formName}`, {
      timestamp: new Date().toISOString()
    });
    
    // Validate form data if validation function is provided
    if (validation) {
      const validationResult = validation(formData);
      
      if (!validationResult.valid) {
        const errorInfo: ErrorInfo = {
          type: 'form_validation_error',
          message: `Form validation failed for ${formName}`,
          formName,
          errors: validationResult.errors || {},
          timestamp: new Date().toISOString()
        };
        
        // Log validation error but don't wait
        logErrorToFile(errorInfo).catch(logError => {
          console.error('Failed to log validation error:', logError);
        });
        
        addBreadcrumb(`Form validation failed: ${formName}`, {
          errors: validationResult.errors,
          timestamp: new Date().toISOString()
        });
        
        if (onError) {
          onError(errorInfo);
        }
        
        throw new Error(`Form validation failed for ${formName}`);
      }
    }
    
    // Submit the form using safeNetworkOperation
    const result = await safeNetworkOperation<R>(
      () => submitOperation(formData),
      `${formName}_submission`,
      { retries }
    );
    
    // Add success breadcrumb
    addBreadcrumb(`Form submission successful: ${formName}`, {
      timestamp: new Date().toISOString()
    });
    
    if (onSuccess) {
      onSuccess(result);
    }
    
    return result;
  } catch (error: any) {
    // Log the error
    console.error(`Form submission failed for ${formName}:`, error);
    
    // Add failure breadcrumb
    addBreadcrumb(`Form submission failed: ${formName}`, {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    // Log the error to file but don't wait
    logErrorToFile({
      type: 'form_submission_error',
      formName,
      message: error.message || 'Unknown error',
      stack: error.stack || 'No stack trace',
      timestamp: new Date().toISOString()
    }).catch(logError => {
      console.error('Failed to log form error:', logError);
    });
    
    if (onError) {
      onError(error);
    }
    
    throw error;
  }
};

// Safe navigation with error recovery
const safeNavigation = async (
  navigation: any,
  primaryDestination = 'HomeTab',
  fallbackDestination: string | null = null
): Promise<boolean> => {
  try {
    // Validate navigation object
    if (!navigation || typeof navigation.navigate !== 'function') {
      throw new Error('Invalid navigation object');
    }
    
    // Add navigation breadcrumb
    addBreadcrumb('Navigation attempt', {
      destination: primaryDestination,
      timestamp: new Date().toISOString()
    });
    
    // Try to navigate
    navigation.navigate(primaryDestination);
    
    // Add success breadcrumb
    addBreadcrumb('Navigation successful', {
      destination: primaryDestination,
      timestamp: new Date().toISOString()
    });
    
    return true;
  } catch (error: any) {
    // Log the error
    console.error(`Navigation to ${primaryDestination} failed:`, error);
    
    // Add failure breadcrumb
    addBreadcrumb('Navigation failed', {
      destination: primaryDestination,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    // Log the error to file but don't wait
    logErrorToFile({
      type: 'navigation_error',
      destination: primaryDestination,
      message: error.message || 'Unknown error',
      stack: error.stack || 'No stack trace',
      timestamp: new Date().toISOString()
    }).catch(logError => {
      console.error('Failed to log navigation error:', logError);
    });
    
    // Try fallback destination if provided
    if (fallbackDestination && fallbackDestination !== primaryDestination) {
      try {
        navigation.navigate(fallbackDestination);
        
        addBreadcrumb('Fallback navigation successful', {
          destination: fallbackDestination,
          timestamp: new Date().toISOString()
        });
        
        return true;
      } catch (fallbackError: any) {
        await logErrorToFile({
          type: 'fallback_navigation_error',
          destination: fallbackDestination,
          message: `Failed to navigate to fallback: ${fallbackError.message}`,
          stack: fallbackError.stack,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Last resort - reset navigation state
    try {
      navigation.reset({
        index: 0,
        routes: [{ name: primaryDestination }],
      });
      
      addBreadcrumb('Navigation reset successful', { destination: primaryDestination });
      return true;
    } catch (resetError: any) {
      await logErrorToFile({
        type: 'navigation_reset_error',
        message: `Failed to reset navigation: ${resetError.message}`,
        stack: resetError.stack,
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }
};

export {
  setupGlobalErrorHandler,
  initDebugSystem,
  logErrorToFile,
  getErrorLogs,
  clearErrorLogs,
  safeExecute,
  safeNetworkOperation,
  safeFormSubmission,
  addBreadcrumb,
  getBreadcrumbs,
  clearBreadcrumbs,
  flushMemoryLogs,
  safeNavigation
}; 