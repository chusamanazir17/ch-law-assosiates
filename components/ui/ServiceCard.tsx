"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, type LucideIcon } from "lucide-react";
import { staggerItem } from "@/components/motion/Stagger";

type ServiceCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  bullets?: string[];
  tags?: string[];
  meta?: string;
  linkLabel?: string;
  linkHref?: string;
  linkVariant?: "arrow" | "button" | "outlined";
  listLabel?: string;
};

export default function ServiceCard({
  icon: Icon,
  title,
  description,
  bullets,
  tags,
  meta,
  linkLabel = "Learn More",
  linkHref = "#contact",
  linkVariant = "arrow",
  listLabel,
}: ServiceCardProps) {
  return (
    <motion.article
      variants={staggerItem}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-navy-900/8 dark:border-white/10 bg-white dark:bg-[#0c1c33] p-7 shadow-soft transition-shadow duration-300 hover:shadow-card-hover"
    >
      {/* hover gold accent line */}
      <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-gold-400 to-gold-600 transition-transform duration-500 group-hover:scale-x-100" />

      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-navy-900/[0.04] dark:bg-white/10 text-navy-900 dark:text-gold-400 transition-colors duration-300 group-hover:bg-navy-900 group-hover:text-gold-400 dark:group-hover:bg-gold-400 dark:group-hover:text-navy-950">
        <Icon size={22} />
      </div>

      {meta && (
        <p className="mb-1 text-xs font-medium text-navy-800/50 dark:text-slate-400">{meta}</p>
      )}

      <h3 className="mb-2.5 text-lg font-bold text-navy-900 dark:text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-navy-800/65 dark:text-slate-300">{description}</p>

      {tags && tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded bg-navy-900/[0.04] dark:bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-navy-800/70 dark:text-slate-300"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {bullets && bullets.length > 0 && (
        <div className="mt-5 flex-1">
          {listLabel && (
            <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-navy-800/45 dark:text-slate-400">
              {listLabel}
            </p>
          )}
          <ul className="space-y-2">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-[13px] text-navy-800/70 dark:text-slate-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="pt-6 mt-auto">
        {linkVariant === "outlined" ? (
          <a
            href={linkHref}
            className="flex w-full items-center justify-center gap-2 rounded border border-navy-900/20 dark:border-white/20 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-navy-800 dark:text-white transition hover:border-navy-900 hover:bg-navy-900 hover:text-white dark:hover:bg-white/10"
          >
            {linkLabel}
          </a>
        ) : linkVariant === "button" ? (
          <a
            href={linkHref}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-gold-600 dark:text-gold-400 transition hover:text-gold-700 dark:hover:text-gold-300"
          >
            {linkLabel}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </a>
        ) : (
          <a
            href={linkHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-800/70 dark:text-slate-300 transition group-hover:gap-2.5 group-hover:text-gold-600 dark:group-hover:text-gold-400"
          >
            {linkLabel}
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </a>
        )}
      </div>
    </motion.article>
  );
}
