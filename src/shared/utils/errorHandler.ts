/**
 * Error handling utilities for the application
 */

// Define error log structure
export interface ErrorLog {
  source: string;
  message: string;
  timestamp: string;
  details?: any;
}

// In-memory store of recent errors (for debugging)
const recentErrors: ErrorLog[] = [];
const MAX_RECENT_ERRORS = 10;

/**
 * Log an error with source context
 * @param source The source/component where the error occurred
 * @param message Error message
 * @param details Optional additional error details
 */
export const logError = (source: string, message: string, details?: any): void => {
  // Create error log object
  const errorLog: ErrorLog = {
    source,
    message,
    timestamp: new Date().toISOString(),
    details
  };

  // Add to recent errors, maintaining max size
  recentErrors.push(errorLog);
  if (recentErrors.length > MAX_RECENT_ERRORS) {
    recentErrors.shift();
  }

  // Console log in dev mode
  if (__DEV__) {
    console.error(`[${errorLog.source}] ${errorLog.message}`, details || '');
  }

  // In a production app, we would send this to a logging service
  // Example: sendToLoggingService(errorLog);
};

/**
 * Get recent application errors (useful for debugging views)
 */
export const getRecentErrors = (): ErrorLog[] => {
  return [...recentErrors];
};

/**
 * Clear recent error logs
 */
export const clearErrorLogs = (): void => {
  recentErrors.length = 0;
};

/**
 * Format an error for display to users
 * Provides user-friendly messages for common errors
 */
export const formatErrorMessage = (error: any): string => {
  // Handle null/undefined error
  if (!error) return 'An unknown error occurred';
  
  // Handle string errors
  if (typeof error === 'string') return error;
  
  // Handle Error objects or objects with message property
  const errorMessage = error.message || error.error || JSON.stringify(error);
  
  // Map common error messages to user-friendly versions
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  if (errorMessage.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  
  if (errorMessage.includes('authentication') || errorMessage.includes('auth') || errorMessage.includes('401')) {
    return 'Authentication error. Please sign in again.';
  }
  
  if (errorMessage.includes('permission') || errorMessage.includes('403')) {
    return 'You do not have permission to perform this action.';
  }
  
  // Return the error message or a fallback
  return errorMessage || 'An unexpected error occurred';
}; 