"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  msg: string;
  type: ToastType;
  timeout: number;
}

interface ToastContextType {
  showToast: (msg: string, type?: ToastType, timeoutMs?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback((msg: string, type: ToastType = 'info', timeoutMs = 2500) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts(prev => [...prev, { id, msg, type, timeout: timeoutMs }]);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map(t => setTimeout(() => {
      setToasts(prev => prev.filter(x => x.id !== t.id));
    }, t.timeout));
    return () => { timers.forEach(clearTimeout); };
  }, [toasts]);

  const tone = (t: ToastType) => t === 'success'
    ? 'bg-green-900/60 text-green-100 border-green-700'
    : t === 'error'
      ? 'bg-red-900/60 text-red-100 border-red-700'
      : 'bg-secondary/80 text-foreground border';

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-16 right-6 z-50 space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-2 rounded border shadow ${tone(t.type)}`}>{t.msg}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export default ToastProvider;
