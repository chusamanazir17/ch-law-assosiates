import React from 'react';
import { Loader2 } from 'lucide-react';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

const SPINNER_SIZES: Record<SpinnerSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
};

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  /** Accessible label announced to screen readers. */
  label?: string;
}

/** Loading spinner. Always pairs with visible or sr-only text. */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className = '',
  label = 'Loading…',
}) => (
  <span role="status" className={`inline-flex items-center justify-center ${className}`.trim()}>
    <Loader2 className={`${SPINNER_SIZES[size]} animate-spin text-[#B8832A]`} aria-hidden="true" />
    <span className="sr-only">{label}</span>
  </span>
);

export interface SkeletonProps {
  className?: string;
}

/** Shimmer placeholder block for loading content. */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div
    aria-hidden="true"
    className={`animate-pulse rounded-lg bg-slate-200/80 dark:bg-white/10 ${className}`.trim()}
  />
);

export interface SkeletonRowsProps {
  /** Number of placeholder rows. */
  rows?: number;
  className?: string;
}

/** Stacked skeleton lines, e.g. while a table or list loads. */
export const SkeletonRows: React.FC<SkeletonRowsProps> = ({ rows = 4, className = '' }) => (
  <div className={`space-y-2.5 ${className}`.trim()} aria-hidden="true">
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-10 w-full" />
    ))}
  </div>
);

export default Spinner;
