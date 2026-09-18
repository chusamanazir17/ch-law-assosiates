"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Megaphone, AlertTriangle, ShieldAlert, Info, X, ExternalLink, type LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { SiteAnnouncement } from "@/types/cms";

export default function AnnouncementBanner() {
  const pathname = usePathname() || "";
  const [announcement, setAnnouncement] = useState<SiteAnnouncement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchActiveNotice = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("site_announcements")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          // Check if user previously dismissed this exact notice
          const dismissedId = sessionStorage.getItem("dismissed_announcement_id");
          if (dismissedId !== data[0].id) {
            setAnnouncement(data[0]);
          }
        }
      } catch {
        // Announcement loading is optional and must not block page rendering.
      }
    };

    fetchActiveNotice();
  }, []);

  const handleDismiss = () => {
    if (announcement) {
      sessionStorage.setItem("dismissed_announcement_id", announcement.id);
    }
    setDismissed(true);
  };

  if (pathname.startsWith("/admin") || !announcement || dismissed) {
    return null;
  }

  // Tone styles
  const toneClasses: Record<string, { bg: string; border: string; text: string; icon: LucideIcon }> = {
    warning: {
      bg: "bg-amber-600/90 text-white",
      border: "border-b border-amber-500",
      text: "text-amber-100",
      icon: AlertTriangle,
    },
    danger: {
      bg: "bg-red-700/90 text-white",
      border: "border-b border-red-600",
      text: "text-red-100",
      icon: ShieldAlert,
    },
    info: {
      bg: "bg-sky-700/90 text-white",
      border: "border-b border-sky-600",
      text: "text-sky-100",
      icon: Info,
    },
    dark: {
      bg: "bg-[#061226] text-white",
      border: "border-b border-gold-400/30",
      text: "text-gold-300",
      icon: Megaphone,
    },
  };

  const current = toneClasses[announcement.tone] || toneClasses.warning;
  const Icon = current.icon;

  return (
    <div
      className={`relative z-50 ${current.bg} ${current.border} px-4 py-2 text-xs backdrop-blur-md transition-all`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <Icon className="h-4 w-4 shrink-0" />
          <div className="flex flex-wrap items-center gap-1.5 truncate">
            <span className="font-bold tracking-tight">{announcement.title}:</span>
            <span className="text-white/90 truncate">{announcement.message}</span>
            {announcement.link_url && (
              <Link
                href={announcement.link_url}
                className="ml-1 inline-flex items-center gap-0.5 font-bold underline hover:opacity-80"
              >
                <span>{announcement.link_text || "Read Details"}</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="rounded p-1 text-white/80 hover:bg-white/10 hover:text-white"
          aria-label="Dismiss notice"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
