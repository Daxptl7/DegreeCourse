import React, { createContext, useContext } from 'react';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/common/ToastContainer';

const ToastCtx = createContext(null);

/**
 * Wrap your app with <ToastProvider> (done in App.jsx).
 * Then call useToastContext() anywhere to get the `toast` function.
 */
export const ToastProvider = ({ children }) => {
    const { toast, toasts, dismiss } = useToast();

    return (
        <ToastCtx.Provider value={{ toast }}>
            {children}
            <ToastContainer toasts={toasts} dismiss={dismiss} />
        </ToastCtx.Provider>
    );
};

export const useToastContext = () => {
    const ctx = useContext(ToastCtx);
    if (!ctx) throw new Error('useToastContext must be used inside <ToastProvider>');
    return ctx;
};
