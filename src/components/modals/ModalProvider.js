import React, { createContext, useContext } from 'react';
import ModalComponent from './ModalComponent';
import useModal from '../../hooks/useModal';

// Create a context for the modal
const ModalContext = createContext({
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
 * @returns {Object} The modal context
 */
export const useModalContext = () => useContext(ModalContext);

/**
 * Modal provider component to wrap the app with
 * @param {Object} props - The component props
 * @param {React.ReactNode} props.children - The children to render
 */
const ModalProvider = ({ children }) => {
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
      <ModalComponent visible={isVisible} onClose={hideModal} {...modalProps} />
    </ModalContext.Provider>
  );
};

export default ModalProvider; 