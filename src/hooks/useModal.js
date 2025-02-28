import { useState, useCallback } from 'react';

/**
 * A custom hook for managing modal state
 * @returns {Object} An object containing modal state and functions to control it
 */
const useModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [modalProps, setModalProps] = useState({
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    hideCloseButton: false,
  });

  const showModal = useCallback((props = {}) => {
    console.log('showModal called with props:', props);
    setModalProps((prevProps) => {
      const newProps = {
        ...prevProps,
        ...props,
      };
      console.log('New modal props:', newProps);
      return newProps;
    });
    setIsVisible(true);
    console.log('Modal should be visible now, isVisible set to true');
  }, []);

  const hideModal = useCallback(() => {
    console.log('hideModal called, setting isVisible to false');
    setIsVisible(false);
  }, []);

  const showSuccessModal = useCallback((title, message, onClose) => {
    showModal({
      type: 'success',
      title,
      message,
      onConfirm: onClose,
    });
  }, [showModal]);

  const showErrorModal = useCallback((title, message) => {
    showModal({
      type: 'error',
      title,
      message,
    });
  }, [showModal]);

  const showInfoModal = useCallback((title, message) => {
    showModal({
      type: 'info',
      title,
      message,
    });
  }, [showModal]);

  const showConfirmationModal = useCallback((title, message, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel') => {
    showModal({
      type: 'confirmation',
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
    });
  }, [showModal]);

  const showLoadingModal = useCallback((message = 'Loading...') => {
    showModal({
      type: 'loading',
      message,
      hideCloseButton: true,
    });
  }, [showModal]);

  return {
    isVisible,
    modalProps,
    showModal,
    hideModal,
    showSuccessModal,
    showErrorModal,
    showInfoModal,
    showConfirmationModal,
    showLoadingModal,
  };
};

export default useModal; 