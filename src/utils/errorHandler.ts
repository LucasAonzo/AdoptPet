import { showErrorAlert } from './alertUtils';
import { logErrorToFile } from './debugUtils';

/**
 * Logs an error to the console and optionally shows an alert
 * @param error The error object to log
 * @param context Optional context information about where the error occurred
 * @param showAlert Whether to show an alert to the user (defaults to false)
 */
export const logError = (
  error: unknown, 
  context: string = 'application', 
  showAlert: boolean = false
): void => {
  // Convert to Error object if it's not already
  const errorObj = error instanceof Error ? error : new Error(String(error));
  
  // Log to console
  console.error(`Error in ${context}:`, errorObj);
  
  // Log to file system using debugUtils
  logErrorToFile({
    type: 'application_error',
    context,
    message: errorObj.message,
    stack: errorObj.stack,
    timestamp: new Date().toISOString()
  }).catch(e => {
    console.error('Failed to log error to file:', e);
  });
  
  // Show alert if requested
  if (showAlert) {
    showErrorAlert(`An error occurred: ${errorObj.message}`);
  }
}; 