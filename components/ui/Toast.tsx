'use client';

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastOptions {
  title: string;
  message?: string;
  variant?: ToastVariant;
  /** Auto-dismiss delay in ms. Set to 0 to keep until dismissed. */
  duration?: number;
}

interface ToastItem extends Required<Omit<ToastOptions, 'message'>> {
  id: number;
  message?: string;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, { icon: React.ReactNode; classes: string; live: 'polite' | 'assertive' }> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden="true" />,
    classes: 'border-emerald-200 dark:border-emerald-800/60',
    live: 'polite',
  },
  error: {
    icon: <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" aria-hidden="true" />,
    classes: 'border-rose-200 dark:border-rose-800/60',
    live: 'assertive',
  },
  info: {
    icon: <Info className="h-5 w-5 shrink-0 text-blue-500" aria-hidden="true" />,
    classes: 'border-blue-200 dark:border-blue-800/60',
    live: 'polite',
  },
};

/**
 * Tiny toast system (replaces window.alert() for user feedback — UX-02).
 * Mount <ToastProvider> once near the app root, then call useToast().
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, message, variant = 'info', duration = 4000 }: ToastOptions) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev.slice(-4), { id, title, message, variant, duration }]);
      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss]
  );

  const value: ToastContextValue = {
    toast,
    success: (title, message) => toast({ title, message, variant: 'success' }),
    error: (title, message) => toast({ title, message, variant: 'error' }),
    info: (title, message) => toast({ title, message, variant: 'info' }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-[min(92vw,380px)] flex-col gap-2.5"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const style = VARIANT_STYLES[t.variant];
          return (
            <div
              key={t.id}
              role={t.variant === 'error' ? 'alert' : 'status'}
              aria-live={style.live}
              className={`animate-scale-up pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-3.5 pr-2.5 shadow-xl dark:bg-[#0E1A2E] ${style.classes}`}
            >
              {style.icon}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{t.title}</div>
                {t.message && (
                  <div className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {t.message}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="flex min-h-[32px] min-w-[32px] items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>.');
  }
  return ctx;
}

export default ToastProvider;
