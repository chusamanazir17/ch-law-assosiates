"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/site";
import { useLanguage } from "@/lib/LanguageContext";

export function WhatsAppIcon({
  className = "h-4 w-4",
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M17.472 14.382c-.301-.15-1.782-.88-2.058-.98-.276-.1-.477-.15-.678.15-.201.3-.778.98-.954 1.18-.176.2-.351.23-.652.08-.301-.15-1.272-.47-2.423-1.498-.896-.8-1.501-1.788-1.677-2.089-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.201-.301.301-.502.1-.201.05-.376-.025-.527-.075-.15-.678-1.631-.929-2.233-.244-.586-.492-.507-.678-.516l-.577-.01c-.201 0-.527.075-.803.376-.276.301-1.054 1.029-1.054 2.509 0 1.48 1.079 2.909 1.23 3.11.15.2 2.122 3.24 5.141 4.544.718.31 1.279.495 1.716.634.721.23 1.377.197 1.896.12.578-.086 1.782-.728 2.033-1.431.251-.703.251-1.305.176-1.431-.075-.126-.276-.201-.577-.351zM12.052 21.808c-1.77 0-3.504-.476-5.029-1.378l-.361-.214-3.738.98.997-3.644-.235-.374a9.78 9.78 0 0 1-1.506-5.212c0-5.412 4.403-9.815 9.819-9.815 2.624 0 5.09 1.023 6.946 2.879a9.774 9.774 0 0 1 2.872 6.936c0 5.413-4.403 9.818-9.819 9.818zm8.334-16.757A11.758 11.758 0 0 0 12.052 1.6C5.558 1.6.273 6.885.273 13.379c0 2.075.541 4.099 1.569 5.882L0 23.636l4.49-1.178a11.735 11.735 0 0 0 5.845 1.55h.005c6.494 0 11.779-5.285 11.779-11.78 0-3.147-1.226-6.105-3.453-8.331z" />
    </svg>
  );
}

export function OfficialWhatsAppButton({
  href = SITE.whatsappHref,
  label,
  className = "",
  size = "md",
}: {
  href?: string;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const { isUrdu } = useLanguage();
  const defaultLabel = isUrdu ? "واٹس ایپ پر رابطہ کریں" : "Chat on WhatsApp";
  const displayLabel = label || defaultLabel;

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-5 py-3 text-sm gap-2",
    lg: "px-8 py-3.5 text-sm gap-2.5 font-bold",
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center rounded-lg bg-[#25D366] text-white font-semibold shadow-md shadow-[#25D366]/20 transition-all duration-200 hover:bg-[#20bd5a] hover:shadow-lg hover:shadow-[#25D366]/30 hover:-translate-y-0.5 active:translate-y-0 ${sizeClasses[size]} ${className}`}
      title={displayLabel}
    >
      <WhatsAppIcon className={iconSizes[size]} />
      <span>{displayLabel}</span>
    </a>
  );
}

export function FloatingWhatsApp() {
  const pathname = usePathname() || "";
  const { isUrdu } = useLanguage();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <aside
      aria-label="WhatsApp Quick Contact"
      className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50 flex items-center group pointer-events-auto select-none"
    >
      <a
        href={SITE.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={isUrdu ? "واٹس ایپ پر فوری رابطہ کریں" : "Chat on WhatsApp with Advisor"}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/40 transition-transform duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
      >
        {/* Pulsing subtle aura */}
        <span className="absolute inset-0 -z-10 rounded-full bg-[#25D366] opacity-75 animate-ping" />
        
        {/* Official WhatsApp Icon */}
        <WhatsAppIcon className={iconSizes_7} />

        {/* Floating Tooltip Pill on Hover */}
        <span className="absolute right-16 rtl:right-auto rtl:left-16 hidden sm:inline-flex whitespace-nowrap rounded-lg bg-navy-900/90 dark:bg-black/90 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none border border-white/10">
          {isUrdu ? "واٹس ایپ پر فوری رابطہ کریں" : "Chat on WhatsApp"}
        </span>
      </a>
    </aside>
  );
}

const iconSizes_7 = "h-7 w-7";

export default WhatsAppIcon;
