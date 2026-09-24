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
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium select-none">
        <span className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
          <svg className="w-3.5 h-3.5 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </span>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <span className="text-slate-500 dark:text-slate-400 hover:text-[#1473E6] cursor-pointer">CH Admin Portal</span>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-500 dark:text-slate-400 hover:text-[#1473E6] cursor-pointer">Website CMS</span>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-[#1473E6] dark:text-[#38BDF8] font-semibold">{breadcrumb[breadcrumb.length - 1] || 'Office Management'}</span>
      </div>

      {/* Main Header Banner */}
      <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs relative overflow-hidden">
        {/* Subtle decorative courthouse architectural background */}
        <div className="absolute right-0 top-0 bottom-0 w-80 md:w-96 pointer-events-none opacity-15 dark:opacity-10 overflow-hidden hidden sm:block">
          <svg className="w-full h-full object-cover text-slate-900 dark:text-slate-100" viewBox="0 0 350 100" fill="currentColor">
            <path d="M0,100 L350,100 L350,85 L320,85 L320,50 L330,50 L330,45 L310,45 L310,25 L290,25 L290,45 L280,45 L280,50 L290,50 L290,85 L260,85 L260,50 L270,50 L270,45 L250,45 L250,15 L240,10 L230,15 L230,45 L210,45 L210,50 L220,50 L220,85 L180,85 L180,50 L190,50 L190,45 L170,45 L170,10 L160,0 L150,10 L150,45 L130,45 L130,50 L140,50 L140,85 L110,85 L110,50 L120,50 L120,45 L100,45 L100,25 L80,25 L80,45 L70,45 L70,50 L80,50 L80,85 L0,85 Z" />
          </svg>
        </div>

        {/* Left: Icon, Title & Subtitle */}
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-12 h-12 rounded-xl bg-[#0B1B2C] text-white flex items-center justify-center shadow-sm shrink-0">
            {icon}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal mt-0.5 leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right side: Quote, Tagline and Location Badge */}
        <div className="flex items-center gap-4 shrink-0 z-10 w-full md:w-auto justify-between md:justify-end">
          {children}

          <div className="hidden lg:flex flex-col items-end pr-4 border-r border-slate-200 dark:border-slate-800 text-right">
            <span className="font-serif italic text-base text-[#1473E6] dark:text-[#38BDF8] font-semibold leading-tight">
              {quote}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-1 leading-snug">
              Professional Composing<br />
              <span className="italic">E-Stamp & Tax Advisory Services in Sahiwal</span>
            </span>
          </div>

          {/* Location Badge */}
          <div className="flex items-center gap-2.5 bg-blue-50/70 dark:bg-[#0A1322] border border-blue-100 dark:border-slate-800 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-[#1473E6] text-white flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="leading-tight text-left">
              <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Chamber No. 121,</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Kachahri Sahiwal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
