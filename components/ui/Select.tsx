import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** When true (or an error message), the select gets error styling and
      aria-invalid. Pair with <FormField error={...}> for the message. */
  error?: boolean | string;
}

/** Shared native select — keyboard and screen-reader accessible by default. */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, className = '', children, ...rest }, ref) => {
    const hasError = Boolean(error);
    return (
      <span className="relative block">
        <select
          ref={ref}
          aria-invalid={hasError || undefined}
          className={`input-field appearance-none pr-10 ${
            hasError
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-500/60 dark:focus:border-rose-400'
              : ''
          } ${className}`.trim()}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
      </span>
    );
  }
);

Select.displayName = 'Select';

export default Select;
