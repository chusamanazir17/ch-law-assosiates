"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Megaphone,
  AlertTriangle,
  ShieldAlert,
  Info,
  X,
  ExternalLink,
  ArrowRight,
  FileText,
  type LucideIcon,
} from "lucide-react";
import type { SiteAnnouncement } from "@/types/cms";

interface AnnouncementBannerProps {
  onHeightChange?: (height: number) => void;
}

export default function AnnouncementBanner({ onHeightChange }: AnnouncementBannerProps) {
  const pathname = usePathname() || "";
  const containerRef = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = useState<SiteAnnouncement | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchActiveNotice = async () => {
      try {
        const res = await fetch("/api/cms/announcements", { cache: "no-store" });
        const data = await res.json();
        if (isMounted && data.success && data.announcement) {
          const ann = data.announcement as SiteAnnouncement;
          // Check if previously dismissed in this session
          const dismissedId = sessionStorage.getItem("dismissed_announcement_id");
          if (dismissedId !== ann.id) {
            setAnnouncement(ann);
          }
        }
      } catch (err) {
        console.warn("[AnnouncementBanner] Could not load active notice:", err);
      }
    };

    fetchActiveNotice();

    return () => {
      isMounted = false;
    };
  }, []);

  // Report height changes to parent layout (e.g. Header)
  useEffect(() => {
    if (!announcement || dismissed || pathname.startsWith("/admin")) {
      onHeightChange?.(0);
      return;
    }

    const updateHeight = () => {
      if (containerRef.current) {
        onHeightChange?.(containerRef.current.offsetHeight);
      }
    };

    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }

    return () => {
      ro.disconnect();
    };
  }, [announcement, dismissed, pathname, onHeightChange]);

  const handleDismiss = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (announcement) {
      sessionStorage.setItem("dismissed_announcement_id", announcement.id);
    }
    setDismissed(true);
    onHeightChange?.(0);
  };

  if (pathname.startsWith("/admin") || !announcement || dismissed) {
    return null;
  }

  // Tone styling configurations
  const toneConfigs: Record<
    string,
    {
      gradient: string;
      border: string;
      badgeBg: string;
      badgeText: string;
      badgeLabel: string;
      titleColor: string;
      textColor: string;
      dotColor: string;
      btnBg: string;
      icon: LucideIcon;
    }
  > = {
    warning: {
      gradient: "bg-gradient-to-r from-[#180f02] via-[#2a1a05] to-[#180f02]",
      border: "border-b border-amber-500/30",
      badgeBg: "bg-amber-500/15 border border-amber-500/30",
      badgeText: "text-amber-300",
      badgeLabel: "STATUTORY NOTICE",
      titleColor: "text-amber-200",
      textColor: "text-amber-100/90",
      dotColor: "bg-amber-400",
      btnBg: "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold",
      icon: AlertTriangle,
    },
    danger: {
      gradient: "bg-gradient-to-r from-[#1c0505] via-[#2e0909] to-[#1c0505]",
      border: "border-b border-rose-500/30",
      badgeBg: "bg-rose-500/15 border border-rose-500/30",
      badgeText: "text-rose-300",
      badgeLabel: "URGENT ALERT",
      titleColor: "text-rose-200",
      textColor: "text-rose-100/90",
      dotColor: "bg-rose-400",
      btnBg: "bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold",
      icon: ShieldAlert,
    },
    info: {
      gradient: "bg-gradient-to-r from-[#031424] via-[#062038] to-[#031424]",
      border: "border-b border-sky-500/30",
      badgeBg: "bg-sky-500/15 border border-sky-500/30",
      badgeText: "text-sky-300",
      badgeLabel: "PUBLIC ADVISORY",
      titleColor: "text-sky-200",
      textColor: "text-sky-100/90",
      dotColor: "bg-sky-400",
      btnBg: "bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-bold",
      icon: Info,
    },
    dark: {
      gradient: "bg-gradient-to-r from-[#050e1c] via-[#0a1b33] to-[#050e1c]",
      border: "border-b border-gold-400/30",
      badgeBg: "bg-gold-400/15 border border-gold-400/30",
      badgeText: "text-gold-300",
      badgeLabel: "CHAMBER DISPATCH",
      titleColor: "text-gold-200",
      textColor: "text-slate-100/90",
      dotColor: "bg-gold-400",
      btnBg: "bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-navy-950 font-bold",
      icon: Megaphone,
    },
  };

  const current = toneConfigs[announcement.tone] || toneConfigs.warning;
  const Icon = current.icon;

  return (
    <>
      {/* Notice Box Banner Bar */}
      <aside
        ref={containerRef}
        aria-label="Site Announcement"
        className={`w-full ${current.gradient} ${current.border} shadow-md backdrop-blur-md transition-all duration-300`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2 sm:px-6 sm:py-2.5 gap-3">
          {/* Left: Indicator, Badge, Title & Message */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
            {/* Pulsing indicator */}
            <div className="relative flex h-2.5 w-2.5 shrink-0">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${current.dotColor} opacity-75`}
              />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${current.dotColor}`} />
            </div>

            {/* Tone Badge */}
            <span
              className={`hidden sm:inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${current.badgeBg} ${current.badgeText}`}
            >
              <Icon className="h-3 w-3" />
              <span>{current.badgeLabel}</span>
            </span>

            {/* Title & Message */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs min-w-0">
              <span className={`font-bold tracking-tight ${current.titleColor} whitespace-nowrap`}>
                {announcement.title}:
              </span>
              <span className={`${current.textColor} text-xs font-normal line-clamp-1 sm:line-clamp-none`}>
                {announcement.message}
              </span>
            </div>
          </div>

          {/* Right: Actions & Dismiss */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Action CTA Button */}
            {announcement.link_url ? (
              <Link
                href={announcement.link_url}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] sm:text-xs shadow-sm transition-transform active:scale-95 ${current.btnBg}`}
              >
                <span>{announcement.link_text || "View Details"}</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] sm:text-xs shadow-sm transition-transform active:scale-95 ${current.btnBg}`}
              >
                <span>Details</span>
                <FileText className="h-3 w-3" />
              </button>
            )}

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white transition focus:outline-none focus:ring-1 focus:ring-white/40"
              aria-label="Dismiss announcement"
              title="Dismiss announcement"
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Optional Full Details Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 text-white shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${current.badgeBg}`}>
                  <Icon className={`h-5 w-5 ${current.badgeText}`} />
                </div>
                <div>
                  <span
                    className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${current.badgeBg} ${current.badgeText}`}
                  >
                    {current.badgeLabel}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">{announcement.title}</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="py-4 text-xs leading-relaxed text-slate-300">
              <p className="whitespace-pre-line">{announcement.message}</p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs">
              <span className="text-[11px] text-slate-400">
                Chamber 121, District Court Sahiwal
              </span>
              <div className="flex items-center gap-2">
                {announcement.link_url && (
                  <Link
                    href={announcement.link_url}
                    onClick={() => setShowModal(false)}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold ${current.btnBg}`}
                  >
                    <span>{announcement.link_text || "Proceed to Notice"}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
