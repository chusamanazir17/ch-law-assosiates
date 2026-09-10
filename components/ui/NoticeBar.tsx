"use client";

import { motion } from "framer-motion";
import { Info, AlertTriangle, PhoneCall, ArrowRight, type LucideIcon } from "lucide-react";

type Tone = "info" | "warning" | "danger" | "dark";

const tones: Record<
  Tone,
  { wrap: string; iconWrap: string; title: string; ctaClass: string }
> = {
  info: {
    wrap: "border-gold-400/40 bg-gold-50 dark:bg-gold-950/25 dark:border-gold-500/30",
    iconWrap: "bg-gold-400/15 text-gold-600 dark:bg-gold-400/20 dark:text-gold-400",
    title: "text-gold-700 dark:text-gold-400",
    ctaClass: "bg-navy-900 text-white hover:bg-navy-800 dark:bg-gold-400 dark:text-navy-950 dark:hover:bg-gold-300",
  },
  warning: {
    wrap: "border-red-300/60 bg-red-50 dark:bg-red-950/30 dark:border-red-800/40",
    iconWrap: "bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400",
    title: "text-red-600 dark:text-red-400",
    ctaClass: "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500",
  },
  danger: {
    wrap: "border-red-300/50 bg-red-50/80 dark:bg-red-950/40 dark:border-red-800/50",
    iconWrap: "bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400",
    title: "text-red-600 dark:text-red-400",
    ctaClass: "bg-red-500 text-white hover:bg-red-600",
  },
  dark: {
    wrap: "border-navy-700 bg-navy-900 dark:bg-[#071224] dark:border-white/10 text-white",
    iconWrap: "bg-gold-400/20 text-gold-400",
    title: "text-gold-400",
    ctaClass: "bg-gold-400 text-white hover:bg-gold-500 dark:text-navy-950 dark:bg-gold-400 dark:hover:bg-gold-300",
  },
};

export default function NoticeBar({
  tone = "info",
  icon,
  label,
  title,
  text,
  ctaLabel,
  ctaHref = "tel:+92511234567",
  className = "",
}: {
  tone?: Tone;
  icon?: LucideIcon;
  label?: string;
  title: string;
  text: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}) {
  const t = tones[tone];
  const Icon: LucideIcon =
    icon ?? (tone === "info" || tone === "dark" ? Info : AlertTriangle);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55 }}
      className={`flex flex-col items-start gap-4 rounded-lg border p-5 sm:flex-row sm:items-center sm:gap-5 ${t.wrap} ${className}`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${t.iconWrap}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <p className={`text-[11px] font-bold uppercase tracking-[0.16em] ${t.title}`}>
          {label ?? title}
        </p>
        <p
          className={`mt-1 text-sm leading-relaxed ${
            tone === "dark" ? "text-white/75" : "text-navy-800/70 dark:text-slate-300"
          }`}
        >
          {text}
        </p>
      </div>
      {ctaLabel && (
        <a
          href={ctaHref}
          className={`inline-flex shrink-0 items-center gap-2 rounded px-5 py-2.5 text-xs font-bold uppercase tracking-wide transition ${t.ctaClass}`}
        >
          {tone !== "dark" && <PhoneCall className="h-3.5 w-3.5" />}
          {ctaLabel}
          {tone === "dark" && <ArrowRight className="h-3.5 w-3.5" />}
        </a>
      )}
    </motion.div>
  );
}
