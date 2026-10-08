import React from 'react';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  /** Heading shown when there is nothing to display. */
  title: string;
  /** Supporting copy. */
  description?: string;
  /** Decorative icon. */
  icon?: React.ReactNode;
  /** Optional call-to-action (e.g. a "Create" Button). */
  action?: React.ReactNode;
  className?: string;
}

/** Standard empty state for lists, tables and search results. */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => (
  <div
    className={`flex flex-col items-center justify-center px-6 py-12 text-center ${className}`.trim()}
  >
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500">
      {icon ?? <Inbox className="h-6 w-6" aria-hidden="true" />}
    </div>
    <h3 className="text-base font-bold text-navy-heading dark:text-white">{title}</h3>
    {description && (
      <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
