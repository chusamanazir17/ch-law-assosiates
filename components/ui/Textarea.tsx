import React from 'react';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** When true (or an error message), the textarea gets error styling and
      aria-invalid. Pair with <FormField error={...}> for the message. */
  error?: boolean | string;
}

/** Shared textarea. Same design-system treatment as Input. */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = '', rows = 4, ...rest }, ref) => {
    const hasError = Boolean(error);
    return (
      <textarea
        ref={ref}
        rows={rows}
        aria-invalid={hasError || undefined}
        className={`input-field min-h-[6rem] resize-y ${
          hasError
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-500/60 dark:focus:border-rose-400'
            : ''
        } ${className}`.trim()}
        {...rest}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
