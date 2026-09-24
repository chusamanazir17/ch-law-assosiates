import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  iconBgColor?: string;
  viewDetailsText?: string;
  onViewDetails?: () => void;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  subValue,
  change,
  changeType = 'positive',
  icon,
  iconBgColor = 'bg-blue-50 text-blue-600',
  viewDetailsText,
  onViewDetails,
  className = ''
}) => {
  return (
    <div className={`bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-4.5 sm:p-5 flex flex-col justify-between shadow-2xs hover:border-[#1473E6]/40 dark:hover:border-[#1473E6]/60 hover:shadow-xs transition-all ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${iconBgColor}`}>
            {icon}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-tight mb-1.5">{label}</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-none font-mono">{value}</div>
          </div>
        </div>
        {viewDetailsText && (
          <button
            onClick={onViewDetails}
            className="text-xs sm:text-sm font-semibold text-[#1473E6] dark:text-[#38BDF8] hover:text-[#0F62C4] dark:hover:text-[#7DD3FC] hover:underline flex items-center gap-1 cursor-pointer transition-colors shrink-0 pt-0.5"
          >
            {viewDetailsText}
            <span>&rarr;</span>
          </button>
        )}
      </div>

      {(change || subValue) && (
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          {change && (
            <div className="flex items-center gap-1.5">
              {changeType === 'positive' ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-emerald-200/60 dark:border-emerald-800/60">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  {change}
                </span>
              ) : changeType === 'negative' ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-bold text-xs border border-rose-200/60 dark:border-rose-800/60">
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                  {change}
                </span>
              ) : (
                <span className="text-slate-600 dark:text-slate-300 font-semibold">{change}</span>
              )}
            </div>
          )}
          {subValue && <span className="text-slate-500 dark:text-slate-400 font-medium ml-auto text-xs">{subValue}</span>}
        </div>
      )}
    </div>
  );
};
