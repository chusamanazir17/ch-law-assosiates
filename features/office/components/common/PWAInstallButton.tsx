import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'sidebar' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header', className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 4000);
    }
  };

  if (justInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <span>App Installed!</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'sidebar') {
      return (
        <button
          id="pwa-install-sidebar-btn"
          onClick={handleInstall}
          className={`w-full flex items-center justify-center gap-2 bg-[#1473E6] hover:bg-[#0F62C4] text-white py-2 px-3 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer ${className}`}
        >
          <Download className="w-4 h-4 shrink-0" />
          <span className="truncate">Install App Offline</span>
        </button>
      );
    }

    return (
      <button
        id="pwa-install-header-btn"
        onClick={handleInstall}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B1B2C] hover:bg-[#142639] text-white text-xs font-semibold shadow-xs border border-slate-700/80 transition-all cursor-pointer ${className}`}
        title="Install CH Office Management System for faster offline loading"
      >
        <Download className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        {variant === 'sidebar' ? (
          <button
            id="pwa-install-ios-sidebar-btn"
            onClick={() => setShowIOSGuide(true)}
            className={`w-full flex items-center justify-center gap-2 bg-[#122538] hover:bg-[#1a344f] text-slate-200 border border-slate-600 py-2 px-3 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer ${className}`}
          >
            <Download className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">Install on iOS</span>
          </button>
        ) : (
          <button
            id="pwa-install-ios-header-btn"
            onClick={() => setShowIOSGuide(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-semibold shadow-2xs transition-all cursor-pointer ${className}`}
          >
            <Download className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#0B1B2C] text-amber-400 flex items-center justify-center font-bold text-sm">
                    CH
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-heading text-slate-900">Install CH Office</h3>
                    <p className="text-xs text-slate-500">Add to iPhone / iPad Home Screen</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 mb-5">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-1">
                      Tap the Share button <Share className="w-3.5 h-3.5 text-blue-600 inline" />
                    </div>
                    <div className="text-slate-500 mt-0.5">Found at the bottom menu bar in Safari.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-1">
                      Select "Add to Home Screen" <PlusSquare className="w-3.5 h-3.5 text-slate-700 inline" />
                    </div>
                    <div className="text-slate-500 mt-0.5">Scroll down in the share sheet and tap Add to Home Screen.</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-[#0B1B2C] hover:bg-[#142639] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
