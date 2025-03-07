import { Alert } from 'react-native';

/**
 * Utility function to show an alert with a title and message
 * @param {string} title - The title of the alert
 * @param {string} message - The message to display in the alert
 * @param {Array} buttons - Optional buttons configuration (defaults to a single OK button)
 * @param {Object} options - Additional options for the alert
 */
export const showAlert = (title, message, buttons = [{ text: 'OK' }], options = {}) => {
  Alert.alert(title, message, buttons, options);
};

/**
 * Utility function to show a success alert
 * @param {string} message - The success message to display
 * @param {Array} buttons - Optional buttons configuration (defaults to a single OK button)
 */
export const showSuccessAlert = (message, buttons) => {
  showAlert('Success', message, buttons);
};

/**
 * Utility function to show an error alert
 * @param {string} message - The error message to display
 * @param {Array} buttons - Optional buttons configuration (defaults to a single OK button)
 */
export const showErrorAlert = (message, buttons) => {
  showAlert('Error', message, buttons);
};

/**
 * Utility function to show a confirmation alert with Yes/No options
 * @param {string} title - The title of the confirmation
 * @param {string} message - The confirmation message
 * @param {Function} onConfirm - Function to execute when user confirms
 * @param {Function} onCancel - Function to execute when user cancels
 */
export const showConfirmationAlert = (title, message, onConfirm, onCancel) => {
  const buttons = [
    {
      text: 'Cancel',
      style: 'cancel',
      onPress: onCancel,
    },
    {
      text: 'Yes',
      onPress: onConfirm,
    },
  ];
  
  showAlert(title, message, buttons);
}; 