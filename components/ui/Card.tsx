import React from 'react';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Optional header title rendered in the card head. */
  title?: React.ReactNode;
  /** Optional header subtitle. */
  subtitle?: React.ReactNode;
  /** Optional actions rendered at the right of the header. */
  actions?: React.ReactNode;
  /** Remove the default padding (e.g. for flush tables). */
  noPadding?: boolean;
  className?: string;
}

/**
 * Shared card. Styled by the .card design-system class (app/globals.css);
 * dark-mode aware. Use CardHeader/CardBody/CardFooter for custom layouts.
 */
export const Card = React.forwardRef<HTMLElement, CardProps>(
  ({ title, subtitle, actions, noPadding = false, className = '', children, ...rest }, ref) => {
    const hasHeader = title || subtitle || actions;
    return (
      <section
        ref={ref}
        className={`card ${noPadding ? '!p-0' : ''} ${className}`.trim()}
        {...rest}
      >
        {hasHeader && (
          <div className={`flex flex-wrap items-start justify-between gap-3 ${noPadding ? 'p-5 sm:p-6' : ''} ${children ? 'mb-4' : ''}`}>
            <div className="min-w-0">
              {title && (
                <h3 className="text-base font-bold text-navy-heading dark:text-white">{title}</h3>
              )}
              {subtitle && (
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
          </div>
        )}
        {children}
      </section>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  ...rest
}) => (
  <div
    className={`mb-4 flex flex-wrap items-start justify-between gap-3 ${className}`.trim()}
    {...rest}
  />
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  ...rest
}) => <div className={className} {...rest} />;

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  ...rest
}) => (
  <div
    className={`mt-4 flex flex-wrap items-center justify-end gap-2.5 border-t border-surface-border pt-4 dark:border-white/10 ${className}`.trim()}
    {...rest}
  />
);

export default Card;
