import React from 'react';
import { WifiOff, Database } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="pwa-offline-banner"
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center justify-between gap-3 rounded-xl bg-[#0B1B2C]/95 text-white border border-amber-500/40 p-3 shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <WifiOff className="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <div className="text-xs font-bold text-amber-400 font-heading tracking-wide">
            Offline Mode Active
          </div>
          <div className="text-xs text-slate-300 font-medium">
            Core administrative data is served from local offline cache.
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/10 text-[11px] font-mono font-semibold text-slate-200 shrink-0">
        <Database className="w-3.5 h-3.5 text-emerald-400" />
        <span>Cached</span>
      </div>
    </div>
  );
};
