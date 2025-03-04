import React, { createContext, useContext, ReactNode } from 'react';
import ModalComponent, { ModalType } from './ModalComponent';
import useModal from '../../hooks/useModal';

// Interface for modal context value
interface ModalContextType {
  isVisible: boolean;
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

// Interface for modal properties
interface ModalProps {
  type: ModalType;
  title: string;
  message: string;
  onConfirm: (() => void) | null;
  confirmText: string;
  cancelText: string;
  hideCloseButton: boolean;
}

// Create a context for the modal
const ModalContext = createContext<ModalContextType>({
  isVisible: false,
  showModal: () => {},
  hideModal: () => {},
  showSuccessModal: () => {},
  showErrorModal: () => {},
  showInfoModal: () => {},
  showConfirmationModal: () => {},
  showLoadingModal: () => {},
});

/**
 * Hook to use the modal context
 * @returns {ModalContextType} The modal context
 */
export const useModalContext = (): ModalContextType => useContext(ModalContext);

interface ModalProviderProps {
  children: ReactNode;
}

/**
 * Modal provider component to wrap the app with
 * @param {ModalProviderProps} props - The component props
 */
const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const {
    isVisible,
    modalProps,
    showModal,
    hideModal,
    showSuccessModal,
    showErrorModal,
    showInfoModal,
    showConfirmationModal,
    showLoadingModal,
  } = useModal();

  return (
    <ModalContext.Provider
      value={{
        isVisible,
        showModal,
        hideModal,
        showSuccessModal,
        showErrorModal,
        showInfoModal,
        showConfirmationModal,
        showLoadingModal,
      }}
    >
      {children}
      <ModalComponent 
        visible={isVisible} 
        onClose={hideModal} 
        type={modalProps.type}
        title={modalProps.title}
        message={modalProps.message}
        onConfirm={modalProps.onConfirm}
        confirmText={modalProps.confirmText}
        cancelText={modalProps.cancelText}
        hideCloseButton={modalProps.hideCloseButton}
      />
    </ModalContext.Provider>
  );
};

export default ModalProvider; 