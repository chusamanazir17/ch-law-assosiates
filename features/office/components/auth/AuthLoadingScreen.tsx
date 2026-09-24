import React from 'react';

export const AuthLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#070D18] text-slate-100 select-none">
      <div className="flex flex-col items-center animate-in fade-in duration-200">
        {/* CH Gold Shield Emblem with subtle pulse */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EAB308] via-[#CA8A04] to-[#A16207] p-0.5 shadow-2xl mb-4 animate-pulse">
          <div className="w-full h-full bg-[#0B1B2C] rounded-[14px] flex items-center justify-center">
            <span className="font-['Playfair_Display',serif] font-black text-3xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
              CH
            </span>
          </div>
        </div>

        <div className="text-base font-bold font-heading text-white tracking-wide uppercase">
          CH Composing
        </div>
        <div className="text-xs font-semibold text-amber-400 tracking-wider uppercase mt-0.5">
          E-Stamp & Tax Advisor
        </div>
        <div className="text-xs text-slate-400 mt-1">
          Chamber No. 121, District Courts Sahiwal
        </div>

        {/* Loading Spinner */}
        <div className="mt-6 flex items-center gap-2.5 text-xs text-slate-400">
          <div className="w-4 h-4 border-2 border-[#1473E6]/30 border-t-[#1473E6] rounded-full animate-spin" />
          <span>Verifying authentication...</span>
        </div>
      </div>
    </div>
  );
};
