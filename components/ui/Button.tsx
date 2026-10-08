import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'gold'
  | 'navy'
  | 'outline-light'
  | 'ghost'
  | 'link';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  // Design-system classes from app/globals.css — single source of truth.
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  gold: 'btn-gold',
  navy: 'btn-navy',
  'outline-light': 'btn-outline-light',
  ghost:
    'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-primary disabled:pointer-events-none disabled:opacity-60 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white',
  link:
    'inline-flex min-h-[44px] items-center justify-center gap-1 rounded px-1 text-sm font-semibold text-[#B8832A] transition-colors hover:text-[#96691B] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-primary disabled:pointer-events-none disabled:opacity-60 dark:text-[#E3BA63] dark:hover:text-[#DCAA4A]',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3.5 py-1.5 text-xs',
  md: '',
  lg: 'min-h-12 px-7 py-3 text-base',
  icon: 'min-h-[44px] min-w-[44px] p-0',
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner, disables the button, and sets aria-busy. Use while a
      form submission is pending to prevent double-submit. */
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Shared button primitive. Variants map 1:1 to the design-system classes in
 * app/globals.css (btn-primary, btn-secondary, btn-danger, btn-gold,
 * btn-navy, btn-outline-light).
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      children,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={`${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`.trim()}
        {...rest}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
