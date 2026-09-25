import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CopyableText } from './CopyableText';

interface KpiCardProps {
  label?: string;
  title?: string;
  value: string | number;
  subValue?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  trend?: 'positive' | 'negative' | 'neutral' | 'up' | 'down';
  color?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  viewDetailsText?: string;
  onViewDetails?: () => void;
  className?: string;
  centered?: boolean;
  copyable?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  title,
  value,
  subValue,
  change,
  changeType,
  trend,
  color,
  icon,
  iconBgColor,
  viewDetailsText,
  onViewDetails,
  className = '',
  centered = false,
  copyable = false
}) => {
  const displayLabel = label || title || '';
  const resolvedChangeType =
    changeType ||
    (trend === 'up' ? 'positive' : trend === 'down' ? 'negative' : trend) ||
    'positive';

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  const resolvedBgColor =
    iconBgColor ||
    (color && colorMap[color] ? colorMap[color] : 'bg-blue-50 text-blue-600');

  return (
    <div className={`bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:border-[#B8832A]/40 dark:hover:border-[#B8832A]/60 hover:shadow-xs transition-all ${centered ? 'items-center text-center' : ''} ${className}`}>
      <div className={`${centered ? 'flex-col items-center gap-2 w-full' : 'flex items-start justify-between gap-3'}`}>
        <div className={`${centered ? 'flex flex-col items-center gap-2 w-full' : 'flex items-center gap-3.5 min-w-0'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${resolvedBgColor}`}>
            {icon}
          </div>
          <div className="min-w-0">
            <div className={`text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-tight mb-1.5 truncate ${centered ? 'text-center' : ''}`}>{displayLabel}</div>
            <div className={`${String(value).length > 10 ? 'text-base sm:text-lg leading-snug' : 'text-xl sm:text-2xl leading-none'} font-bold text-slate-900 dark:text-slate-100 tracking-tight tabular-nums`}>{copyable ? <CopyableText value={String(value)} label={displayLabel} className="text-inherit dark:text-inherit">{value}</CopyableText> : value}</div>
          </div>
        </div>
        {viewDetailsText && (
          <button
            onClick={onViewDetails}
            className="text-xs font-semibold text-[#B8832A] dark:text-[#E3BA63] hover:text-[#96691B] dark:hover:text-[#7DD3FC] hover:underline flex items-center gap-1 whitespace-nowrap cursor-pointer transition-colors shrink-0 pt-0.5"
          >
            {viewDetailsText}
            <span aria-hidden="true">&rarr;</span>
          </button>
        )}
      </div>

      {(change || subValue) && (
        <div className={`mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400 font-medium w-full ${centered ? 'text-center' : ''}`}>
          {change && (
            <div className="flex items-center gap-1.5 min-w-0">
              {resolvedChangeType === 'positive' ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px] border border-emerald-200/60 dark:border-emerald-800/60">
                  <ArrowUpRight className="w-3 h-3 mr-0.5 shrink-0" />
                  <span className="truncate">{change}</span>
                </span>
              ) : resolvedChangeType === 'negative' ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-semibold text-[11px] border border-rose-200/60 dark:border-rose-800/60">
                  <ArrowDownRight className="w-3 h-3 mr-0.5 shrink-0" />
                  <span className="truncate">{change}</span>
                </span>
              ) : (
                <span className="text-slate-600 dark:text-slate-300 font-semibold truncate">{change}</span>
              )}
            </div>
          )}
          {subValue && <span className={`text-slate-500 dark:text-slate-400 font-medium text-[11px] ${centered ? '' : 'ml-auto text-right'}`}>{subValue}</span>}
        </div>
      )}
    </div>
  );
};
