import { useState, useCallback } from 'react';
import { ModalType } from '../components/modals/ModalComponent';

/**
 * Interface for modal properties
 */
interface ModalProps {
  type: ModalType;
  title: string;
  message: string;
  onConfirm: (() => void) | null;
  confirmText: string;
  cancelText: string;
  hideCloseButton: boolean;
}

/**
 * Interface for the useModal hook return value
 */
interface UseModalReturn {
  isVisible: boolean;
  modalProps: ModalProps;
  showModal: (props?: Partial<ModalProps>) => void;
  hideModal: () => void;
  showSuccessModal: (title: string, message: string, onClose?: () => void) => void;
  showErrorModal: (title: string, message: string) => void;
  showInfoModal: (title: string, message: string) => void;
  showConfirmationModal: (
    title: string, 
    message: string, 
    onConfirm: () => void, 
    confirmText?: string, 
    cancelText?: string
  ) => void;
  showLoadingModal: (message?: string) => void;
}

/**
 * A custom hook for managing modal state
 * @returns An object containing modal state and functions to control it
 */
const useModal = (): UseModalReturn => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [modalProps, setModalProps] = useState<ModalProps>({
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    hideCloseButton: false,
  });

  const showModal = useCallback((props: Partial<ModalProps> = {}) => {
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

  const showSuccessModal = useCallback((title: string, message: string, onClose?: () => void) => {
    showModal({
      type: 'success',
      title,
      message,
      onConfirm: onClose || null,
    });
  }, [showModal]);

  const showErrorModal = useCallback((title: string, message: string) => {
    showModal({
      type: 'error',
      title,
      message,
    });
  }, [showModal]);

  const showInfoModal = useCallback((title: string, message: string) => {
    showModal({
      type: 'info',
      title,
      message,
    });
  }, [showModal]);

  const showConfirmationModal = useCallback((
    title: string, 
    message: string, 
    onConfirm: () => void, 
    confirmText: string = 'Confirm', 
    cancelText: string = 'Cancel'
  ) => {
    showModal({
      type: 'confirmation',
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
    });
  }, [showModal]);

  const showLoadingModal = useCallback((message: string = 'Loading...') => {
    showModal({
      type: 'loading',
      title: 'Loading',
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