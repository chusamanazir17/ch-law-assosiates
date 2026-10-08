import React from 'react';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  neutral: 'badge-neutral',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

/**
 * Shared status badge. Styled by the .badge / .badge-* design-system classes
 * (app/globals.css); colors follow the status color system
 * (success/warning/danger/info/neutral).
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  className = '',
  children,
  ...rest
}) => (
  <span
    className={`badge ${VARIANT_CLASSES[variant]} ${className}`.trim()}
    {...rest}
  >
    {children}
  </span>
);

export default Badge;
