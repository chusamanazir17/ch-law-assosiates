import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm', className = '' }) => {
  const norm = status.toLowerCase().trim();

  let styles = 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-850';

  if (
    norm === 'paid' ||
    norm === 'active' ||
    norm === 'completed' ||
    norm === 'ok' ||
    norm === 'success' ||
    norm === 'online' ||
    norm === 'delivered'
  ) {
    styles = 'bg-[#ECFDF5] dark:bg-emerald-950/40 text-[#059669] dark:text-emerald-400 border-[#A7F3D0] dark:border-emerald-800/60';
  } else if (
    norm === 'overdue' ||
    norm === 'cancelled' ||
    norm === 'critical' ||
    norm === 'failed' ||
    norm === 'high' ||
    norm === 'urgent' ||
    norm === 'low'
  ) {
    styles = 'bg-[#FFF1F2] dark:bg-rose-950/40 text-[#E11D48] dark:text-rose-400 border-[#FECDD3] dark:border-rose-800/60';
  } else if (
    norm === 'partial' ||
    norm === 'pending' ||
    norm === 'due soon' ||
    norm === 'documents required' ||
    norm === 'waiting client' ||
    norm === 'medium' ||
    norm === 'outstanding' ||
    norm === 'unpaid'
  ) {
    styles = 'bg-[#FFF7ED] dark:bg-amber-950/40 text-[#D97706] dark:text-amber-400 border-[#FED7AA] dark:border-amber-800/60';
  } else if (
    norm === 'in progress' ||
    norm === 'ready to file' ||
    norm === 'submitted' ||
    norm === 'staff' ||
    norm === 'filer' ||
    norm === 'tax consultant'
  ) {
    styles = 'bg-[#EFF6FF] dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 border-[#BFDBFE] dark:border-blue-800/60';
  } else if (
    norm === 'admin' ||
    norm === 'stamp vendor' ||
    norm === 'accountant'
  ) {
    styles = 'bg-[#F5F3FF] dark:bg-purple-950/40 text-[#7C3AED] dark:text-purple-400 border-[#DDD6FE] dark:border-purple-800/60';
  } else if (norm === 'non-filer' || norm === 'offline' || norm === 'inactive') {
    styles = 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700';
  }

  const sizeClasses = size === 'sm' ? 'px-2.5 py-1 text-xs font-bold tracking-wide' : 'px-3 py-1.5 text-xs font-bold tracking-wider';

  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg border leading-tight uppercase whitespace-nowrap select-none ${sizeClasses} ${styles} ${className}`}
    >
      {status}
    </span>
  );
};
