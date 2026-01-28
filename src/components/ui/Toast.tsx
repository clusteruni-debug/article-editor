'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    // 3초 후 자동 제거
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, [removeToast]);

  const success = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const error = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const info = useCallback((message: string) => showToast(message, 'info'), [showToast]);
  const warning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, success, error, info, warning, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const styles: Record<ToastType, { bg: string; icon: string; iconColor: string }> = {
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: '✓',
      iconColor: 'text-green-500 bg-green-100',
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: '✕',
      iconColor: 'text-red-500 bg-red-100',
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: 'i',
      iconColor: 'text-blue-500 bg-blue-100',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      icon: '!',
      iconColor: 'text-amber-500 bg-amber-100',
    },
  };

  const style = styles[toast.type];

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[280px] max-w-[400px] animate-slide-in ${style.bg}`}
    >
      <span
        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${style.iconColor}`}
      >
        {style.icon}
      </span>
      <p className="flex-1 text-sm text-gray-800">{toast.message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
