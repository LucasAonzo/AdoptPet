import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * A reusable modal component for the AdoptMe app
 * @param {boolean} visible - Whether the modal is visible
 * @param {function} onClose - Function to call when the modal is closed
 * @param {string} type - Type of modal ('success', 'error', 'info', 'confirmation', 'loading')
 * @param {string} title - Title text for the modal
 * @param {string} message - Main message text for the modal
 * @param {function} onConfirm - Function to call when the confirm button is pressed (for confirmation modals)
 * @param {string} confirmText - Text for the confirm button (defaults to "Confirm")
 * @param {string} cancelText - Text for the cancel button (defaults to "Cancel")
 * @param {boolean} hideCloseButton - Whether to hide the close button (for loading modals)
 */
const ModalComponent = ({
  visible,
  onClose,
  type = 'info',
  title,
  message,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  hideCloseButton = false,
}) => {
  // Debug log
  console.log('ModalComponent rendering with props:', {
    visible,
    type,
    title,
    message,
    hideCloseButton
  });

  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={50} color="#4CAF50" />;
      case 'error':
        return <Ionicons name="alert-circle" size={50} color="#e74c3c" />;
      case 'info':
        return <Ionicons name="information-circle" size={50} color="#3498db" />;
      case 'confirmation':
        return <Ionicons name="help-circle" size={50} color="#8e74ae" />;
      case 'loading':
        return <ActivityIndicator size="large" color="#8e74ae" />;
      default:
        return <Ionicons name="information-circle" size={50} color="#3498db" />;
    }
  };

  const renderButtons = () => {
    if (type === 'loading') {
      return null; // No buttons for loading modals
    }
    
    if (type === 'confirmation') {
      return (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>{cancelText}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.confirmButton}
            onPress={() => {
              if (onConfirm) {
                onConfirm();
              }
              if (onClose) {
                onClose();
              }
            }}
          >
            <LinearGradient
              colors={['#a58fd8', '#8e74ae', '#7d5da7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.confirmButtonGradient}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity 
        style={styles.singleButton}
        onPress={() => {
          if (onConfirm) {
            onConfirm();
          }
          if (onClose) {
            onClose();
          }
        }}
      >
        <LinearGradient
          colors={['#a58fd8', '#8e74ae', '#7d5da7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.singleButtonGradient}
        >
          <Text style={styles.singleButtonText}>OK</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={type !== 'loading' ? onClose : null}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {!hideCloseButton && (
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Ionicons name="close" size={24} color="#888" />
                </TouchableOpacity>
              )}
              
              <View style={styles.iconContainer}>
                {getIcon()}
              </View>
              
              {title && <Text style={styles.title}>{title}</Text>}
              {message && <Text style={styles.message}>{message}</Text>}
              
              {renderButtons()}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  iconContainer: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 16,
  },
  confirmButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  confirmButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  singleButton: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
  },
  singleButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  singleButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ModalComponent; 