/**
 * useToast — Lightweight toast notification hook.
 * API mirrors sonner so you can swap to `import { toast } from 'sonner'`
 * at any time with zero other changes.
 *
 * Usage:
 *   const { toast, ToastContainer } = useToast();
 *   toast.success('Saved!');
 *   toast.error('Failed.');
 *   toast('Neutral message');
 */

import { useState, useCallback, useRef } from 'react';

let _idCounter = 0;
const nextId = () => ++_idCounter;

const DURATION = 4000; // ms

export const useToast = () => {
    const [toasts, setToasts] = useState([]);
    const timers = useRef({});

    const dismiss = useCallback((id) => {
        clearTimeout(timers.current[id]);
        delete timers.current[id];
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const add = useCallback(
        (message, type = 'default', duration = DURATION) => {
            const id = nextId();
            setToasts((prev) => [...prev, { id, message, type }]);
            timers.current[id] = setTimeout(() => dismiss(id), duration);
            return id;
        },
        [dismiss]
    );

    const toast = useCallback(
        (message, opts = {}) => add(message, opts.type || 'default', opts.duration),
        [add]
    );
    toast.success = (msg, opts) => add(msg, 'success', opts?.duration);
    toast.error   = (msg, opts) => add(msg, 'error', opts?.duration);
    toast.info    = (msg, opts) => add(msg, 'info', opts?.duration);
    toast.warning = (msg, opts) => add(msg, 'warning', opts?.duration);

    return { toast, toasts, dismiss };
};
