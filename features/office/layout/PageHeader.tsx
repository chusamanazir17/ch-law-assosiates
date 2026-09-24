import React from 'react';
import { MapPin, ChevronRight } from 'lucide-react';

interface PageHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  breadcrumb?: string[];
  quote?: string;
  tagline?: string;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  title,
  subtitle,
  breadcrumb = ['Office Management'],
  quote = '“Compliance Today, Growth Tomorrow”',
  children
}) => {
  return (
    <div className="mb-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium select-none">
        {breadcrumb.map((crumb, idx) => (
          <React.Fragment key={crumb}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />}
            <span className={idx === breadcrumb.length - 1 ? 'text-slate-900 dark:text-slate-100 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-[#1473E6] dark:hover:text-[#38BDF8] transition-colors cursor-pointer'}>
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Main Header Card */}
      <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs relative overflow-hidden">
        {/* Subtle decorative courthouse architectural skyline watermark in background */}
        <div className="absolute right-40 top-0 bottom-0 pointer-events-none opacity-[0.04] dark:opacity-[0.07] flex items-center">
          <svg className="w-96 h-28 text-slate-900 dark:text-slate-100" viewBox="0 0 300 80" fill="currentColor">
            <path d="M10,70 L290,70 L290,65 L270,65 L270,40 L280,40 L280,35 L260,35 L260,20 L240,20 L240,35 L230,35 L230,40 L240,40 L240,65 L210,65 L210,40 L220,40 L220,35 L200,35 L200,10 L190,5 L180,10 L180,35 L160,35 L160,40 L170,40 L170,65 L130,65 L130,40 L140,40 L140,35 L120,35 L120,5 L110,0 L100,5 L100,35 L80,35 L80,40 L90,40 L90,65 L60,65 L60,40 L70,40 L70,35 L50,35 L50,20 L30,20 L30,35 L20,35 L20,40 L30,40 L30,65 L10,65 Z" />
          </svg>
        </div>

        {/* Left: Icon & Title */}
        <div className="flex items-center gap-3 sm:gap-4 z-10">
          <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-gradient-to-br from-[#0B1B2C] to-[#1473E6] text-white flex items-center justify-center shadow-sm shrink-0">
            {icon}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-heading text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm md:text-[15px] text-slate-500 dark:text-slate-400 font-normal mt-0.5 sm:mt-1 leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right side: Quote, courthouse photo banner badge and Location */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 shrink-0 z-10 w-full md:w-auto justify-start md:justify-end">
          {children}

          <div className="hidden lg:flex flex-col items-end pr-3.5 border-r border-slate-200 dark:border-slate-800">
            <span className="font-serif italic text-sm text-[#1473E6] dark:text-[#38BDF8] font-semibold leading-tight">
              {quote}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium tracking-wider uppercase mt-1">
              CH Chamber Services
            </span>
          </div>

          {/* Location Badge */}
          <div className="hidden sm:flex items-center gap-2.5 bg-slate-50 dark:bg-[#0A1322] border border-slate-200/90 dark:border-slate-800 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1473E6] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="leading-tight text-left">
              <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Chamber No. 121</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Kachahri Sahiwal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
