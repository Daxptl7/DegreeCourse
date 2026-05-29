import React from 'react';
import './ToastContainer.css';

/**
 * ToastContainer — renders the active toasts on screen.
 * Receives `toasts` array and `dismiss` from the ToastContext.
 */
const ToastContainer = ({ toasts, dismiss }) => {
    if (!toasts || toasts.length === 0) return null;

    return (
        <div className="toast-viewport" aria-live="polite" aria-atomic="false">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`toast toast--${t.type}`}
                    role="status"
                >
                    <span className="toast__icon">
                        {t.type === 'success' && '✓'}
                        {t.type === 'error'   && '✕'}
                        {t.type === 'warning' && '⚠'}
                        {t.type === 'info'    && 'ℹ'}
                        {t.type === 'default' && '•'}
                    </span>
                    <span className="toast__message">{t.message}</span>
                    <button
                        className="toast__close"
                        onClick={() => dismiss(t.id)}
                        aria-label="Dismiss notification"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
