import React from 'react';

export interface FormFieldProps {
  /** Field name/id — wired to the input via htmlFor. */
  name: string;
  /** Visible label text. Always rendered (never placeholder-only). */
  label: string;
  /** Show a red asterisk next to the label. */
  required?: boolean;
  /** Validation message; also sets the child's error state visually. */
  error?: string;
  /** Helper text shown under the field when there is no error. */
  hint?: string;
  /** The form control (Input, Textarea, Select, CustomDropdown…). */
  children: React.ReactNode;
  className?: string;
}

/**
 * Label + control + hint/error block. Renders a real <label> for every field
 * (no placeholder-only inputs) and announces errors via role="alert".
 */
export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  required = false,
  error,
  hint,
  children,
  className = '',
}) => {
  const hintId = `${name}-hint`;
  const errorId = `${name}-error`;
  const describedBy = [error ? errorId : null, hint && !error ? hintId : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
      <label htmlFor={name} className="form-label mb-1.5">
        {label}
        {required && (
          <span className="ml-1 text-rose-500" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only">(required)</span>}
      </label>
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<{ id?: string; 'aria-describedby'?: string; error?: boolean | string }>, {
            id: (children as React.ReactElement<{ id?: string }>).props.id ?? name,
            'aria-describedby': describedBy || undefined,
            error: error ?? (children as React.ReactElement<{ error?: boolean | string }>).props.error,
          })
        : children}
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
};

export default FormField;
