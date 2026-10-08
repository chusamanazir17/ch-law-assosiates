'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-6xl',
};

export interface ModalProps {
  /** Controls visibility. Render the modal unconditionally and let `open`
      mount/unmount it (keeps focus/scroll handling in one place). */
  open: boolean;
  onClose: () => void;
  /** Accessible name for the dialog (rendered as the header title). */
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  /** Extra classes for the panel. */
  className?: string;
  /** Hide the header X button (provide your own close control instead). */
  hideCloseButton?: boolean;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Shared modal dialog implementing the WAI-ARIA dialog pattern (FE-04, FE-25):
 * role="dialog" + aria-modal, Escape-to-close, body scroll-lock, initial
 * focus on the dialog, and a Tab focus trap with focus return on close.
 */
export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className = '',
  hideCloseButton = false,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Scroll lock + initial focus + focus return
  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = originalOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [open ]);

  // Escape to close + focus trap
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => el.offsetParent !== null);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`animate-scale-up relative flex max-h-[calc(100vh-2rem)] w-full ${SIZE_CLASSES[size]} flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl focus:outline-none dark:border-white/10 dark:bg-[#0B1F36] ${className}`}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <h2 className="truncate font-heading text-lg font-bold text-navy-heading dark:text-white">
            {title}
          </h2>
          {!hideCloseButton && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 custom-scrollbar">
          {children}
        </div>
        {footer && (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2.5 border-t border-slate-200 bg-slate-50/60 px-5 py-4 dark:border-white/10 dark:bg-white/5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
