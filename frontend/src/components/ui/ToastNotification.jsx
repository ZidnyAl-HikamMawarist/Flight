import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { theme } from '../../../theme';

// ─── Context ───────────────────────────────────────
const ToastContext = createContext(null);

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
    return ctx;
};

// ─── Provider ──────────────────────────────────────
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success', duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    const icons = {
        success: <CheckCircle size={18} color="#10b981" />,
        error: <XCircle size={18} color="#ef4444" />,
        warning: <AlertCircle size={18} color="#f59e0b" />,
        info: <Info size={18} color="#0194f3" />,
    };

    const colors = {
        success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
        error:   { bg: '#fff1f2', border: '#fecdd3', text: '#be123c' },
        warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
        info:    { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
    };

    return (
        <ToastContext.Provider value={{ toast: addToast }}>
            {children}
            {/* Toast Container */}
            <div style={{
                position: 'fixed', top: 20, right: 20,
                zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 8,
                maxWidth: 360, width: '90vw',
                pointerEvents: 'none',
            }}>
                <AnimatePresence>
                    {toasts.map(t => {
                        const c = colors[t.type] || colors.info;
                        return (
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0, x: 60, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 60, scale: 0.9 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    background: c.bg,
                                    border: `1.5px solid ${c.border}`,
                                    borderRadius: 14,
                                    padding: '12px 16px',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                    fontFamily: 'Inter, system-ui, sans-serif',
                                    fontSize: 14, fontWeight: 600, color: c.text,
                                    pointerEvents: 'auto',
                                    cursor: 'default',
                                }}
                            >
                                {icons[t.type]}
                                <span style={{ flex: 1 }}>{t.message}</span>
                                <button
                                    onClick={() => removeToast(t.id)}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: c.text, opacity: 0.6, padding: 2,
                                        display: 'flex', alignItems: 'center',
                                    }}
                                >
                                    <X size={14} />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export default ToastProvider;

