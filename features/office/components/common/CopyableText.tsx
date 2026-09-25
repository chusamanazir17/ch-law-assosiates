import React, { useCallback, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyableTextProps {
  value: string;
  children?: React.ReactNode;
  className?: string;
  label?: string;
}

/**
 * Text that copies to the clipboard: shows a copy icon on hover, copies on
 * click, and also supports a long-press (~450ms) on touch/mouse. Shows a
 * checkmark briefly after copying.
 */
export const CopyableText: React.FC<CopyableTextProps> = ({
  value,
  children,
  className = '',
  label = 'value'
}) => {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const longPressed = useRef(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard API can be unavailable on non-secure contexts
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch {
        // give up silently
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopied(false), 1500);
  }, [value]);

  const startPress = () => {
    longPressed.current = false;
    longPressTimer.current = window.setTimeout(() => {
      longPressed.current = true;
      copy();
    }, 450);
  };

  const endPress = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        if (longPressed.current) {
          longPressed.current = false;
          return;
        }
        copy();
      }}
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={endPress}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      title={`Click or long-press to copy ${label}`}
      className={`group/ct inline-flex items-center gap-1 cursor-pointer align-middle transition-colors hover:text-[#B8832A] dark:hover:text-sky-300 ${className}`}
    >
      {children ?? value}
      {copied ? (
        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
      ) : (
        <Copy className="w-3 h-3 opacity-0 group-hover/ct:opacity-60 shrink-0 transition-opacity" />
      )}
    </span>
  );
};
