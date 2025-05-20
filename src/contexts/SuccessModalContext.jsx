import { createContext, useContext, useState } from 'react';

const SuccessModalContext = createContext();

export const SuccessModalProvider = ({ children }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [successType, setSuccessType] = useState('default');
  const [successData, setSuccessData] = useState({});

  const showSuccessModal = (type, data = {}) => {
    setSuccessType(type);
    setSuccessData(data);
    setShowSuccess(true);
  };

  const hideSuccessModal = () => {
    setShowSuccess(false);
    setSuccessType('default');
    setSuccessData({});
  };

  return (
    <SuccessModalContext.Provider value={{ 
      showSuccess, 
      successType, 
      successData, 
      showSuccessModal, 
      hideSuccessModal 
    }}>
      {children}
    </SuccessModalContext.Provider>
  );
};

export const useSuccessModal = () => {
  const context = useContext(SuccessModalContext);
  if (!context) {
    throw new Error('useSuccessModal must be used within a SuccessModalProvider');
  }
  return context;
}; 