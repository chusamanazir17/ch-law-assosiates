"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X, ArrowRight, MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/site";

const POPUP_DISMISS_KEY = "chamber121_tax_return_popup_v2026";
const WHATSAPP_NUMBER = "0305-7902744";
const WHATSAPP_MESSAGE =
  "Hello Chamber 121, I need assistance with filing my Income Tax Return before the September 30 deadline.";

export default function TaxReturnPopupModal() {
  const pathname = usePathname() || "";
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only show on the landing page, never in admin/office areas
    if (pathname !== "/") {
      return;
    }

    // Check if dismissed in this session
    try {
      const isDismissed = sessionStorage.getItem(POPUP_DISMISS_KEY);
      if (!isDismissed) {
        // Give visitors time to read the page before showing the promo
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 6000);
        return () => clearTimeout(timer);
      }
    } catch {
      // If sessionStorage is unavailable, show after delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsOpen(false);
    try {
      sessionStorage.setItem(POPUP_DISMISS_KEY, "true");
    } catch {
      // Ignore
    }
  };

  if (!isOpen || pathname.startsWith("/admin") || pathname.startsWith("/office")) {
    return null;
  }


  const whatsappUrl = buildWhatsAppUrl(WHATSAPP_NUMBER, WHATSAPP_MESSAGE);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Important Update: File Your Income Tax Return"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-navy-950/75 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 transition-transform duration-300 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button (X) */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close notification"
          className="absolute -top-3 -right-3 sm:-top-3.5 sm:-right-3.5 z-30 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-navy-950 text-white hover:bg-gold-500 hover:text-navy-950 hover:scale-110 active:scale-95 transition shadow-xl border-2 border-white cursor-pointer"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* Clickable Image Banner */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group block relative cursor-pointer overflow-hidden rounded-2xl"
          title="Click to get assistance filing your Income Tax Return on WhatsApp"
        >
          <Image
            src="/images/tax-popup.png"
            alt="File Your Income Tax Return by 30 September 2026 - Chamber 121 Sahiwal"
            width={757}
            height={568}
            priority
            className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.01]"
          />
        </a>

        {/* Mobile Quick Action Footer Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex sm:hidden items-center justify-between gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white px-4 py-2.5 text-xs font-bold transition shadow-sm"
          >
            <span>Get Assistance Now</span>
            <ArrowRight className="h-3.5 w-3.5 text-gold-400" />
          </a>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
