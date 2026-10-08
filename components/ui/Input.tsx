import React from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** When true (or an error message), the input gets error styling and
      aria-invalid. Pair with <FormField error={...}> for the message. */
  error?: boolean | string;
}

/**
 * Shared text input. Styled by the .input-field / .form-input design-system
 * class (app/globals.css) with dark-mode support built in.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...rest }, ref) => {
    const hasError = Boolean(error);
    return (
      <input
        ref={ref}
        aria-invalid={hasError || undefined}
        className={`input-field ${
          hasError
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-500/60 dark:focus:border-rose-400'
            : ''
        } ${className}`.trim()}
        {...rest}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;
