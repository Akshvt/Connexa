import React, { createContext, useContext } from 'react';
import { showToast } from '../components/common/toast.js';
import ToastContainer from '../components/common/ToastContainer.jsx';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const toast = (message, type) => showToast(message, type);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
