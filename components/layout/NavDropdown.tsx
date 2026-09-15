"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Phone } from "lucide-react";
import type { ServiceCategory } from "@/lib/site";
import type { CategoryTrans, Translations } from "@/lib/translations";
import { SITE } from "@/lib/site";
import { getSubServiceIcon, getCategoryHeaderIcon } from "@/lib/icon-map";

interface CategoryDropdownPanelProps {
  category: ServiceCategory;
  categoryTrans: CategoryTrans;
  onClose: () => void;
  align?: "left" | "right" | "center";
  isUrdu: boolean;
  isDark: boolean;
  t: Translations;
  id?: string;
}

export function CategoryDropdownPanel({
  category,
  categoryTrans,
  onClose,
  align = "left",
  isUrdu,
  isDark,
  t,
  id,
}: CategoryDropdownPanelProps) {
  const alignClass =
    align === "center"
      ? "left-1/2"
      : align === "right"
      ? "right-0"
      : "left-0";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      id={id}
      role="region"
      aria-label={`${categoryTrans.title} navigation menu`}
      initial={{
        opacity: 0,
        y: 10,
        scale: 0.98,
        x: align === "center" ? "-50%" : 0,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        x: align === "center" ? "-50%" : 0,
      }}
      exit={{
        opacity: 0,
        y: 8,
        scale: 0.98,
        x: align === "center" ? "-50%" : 0,
      }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`absolute top-full mt-2 w-[580px] max-w-[calc(100vw-32px)] ${alignClass} rounded-2xl border ${
        isDark
          ? "border-white/15 bg-[#0c1c33] text-white shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
          : "border-navy-900/10 bg-white text-navy-900 shadow-2xl"
      } p-6 z-50 overflow-hidden before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']`}
    >
      {/* Top Gold Accent Stripe */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-navy-900" />

      {/* Header bar */}
      <div
        className={`flex items-center justify-between pb-3.5 border-b ${
          isDark ? "border-white/10" : "border-navy-900/8"
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gold-400/15 text-gold-400">
              <BadgeCheck className="h-4 w-4" />
            </span>
            <h3
              className={`font-serif text-base font-bold ${
                isDark ? "text-white" : "text-navy-900"
              }`}
            >
              {categoryTrans.title}
            </h3>
          </div>
          <p
            className={`mt-1 text-[11px] leading-tight ${
              isDark ? "text-slate-300" : "text-navy-800/60"
            }`}
          >
            {categoryTrans.tagline} &bull; {categoryTrans.description}
          </p>
        </div>
        <Link
          href={category.href}
          onClick={onClose}
          className={`group inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold transition ${
            isDark
              ? "bg-white/10 text-gold-400 hover:bg-gold-500 hover:text-navy-950"
              : "bg-navy-900/5 text-gold-600 hover:bg-gold-500 hover:text-white"
          }`}
        >
          <span>{t.nav.overview}</span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* 2-column Grid of Sub-Services */}
      <div className="mt-4 grid grid-cols-2 gap-2.5" role="list">
        {categoryTrans.items.map((item, idx) => {
          const ItemIcon = getSubServiceIcon(idx, category.items[idx]?.title || item.title);
          return (
            <Link
              key={item.title}
              href={category.href}
              onClick={onClose}
              role="listitem"
              className={`group flex items-start gap-3 rounded-xl p-2.5 text-left transition border ${
                isDark
                  ? "border-transparent hover:border-gold-500/30 hover:bg-white/5"
                  : "border-transparent hover:border-gold-300/40 hover:bg-gold-50/50"
              }`}
            >
              <span
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                  isDark
                    ? "bg-white/10 text-gold-400 group-hover:bg-gold-500 group-hover:text-navy-950"
                    : "bg-navy-900/5 text-navy-800 group-hover:bg-navy-900 group-hover:text-gold-400"
                }`}
              >
                <ItemIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-xs font-bold transition ${
                    isDark
                      ? "text-white group-hover:text-gold-400"
                      : "text-navy-900 group-hover:text-gold-600"
                  }`}
                >
                  {item.title}
                </p>
                <p
                  className={`mt-0.5 text-[11px] leading-tight line-clamp-2 ${
                    isDark ? "text-slate-300" : "text-navy-800/60"
                  }`}
                >
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer Notice / Pre-visit Tip */}
      <div
        className={`mt-4 flex items-center justify-between rounded-xl px-3.5 py-2.5 border text-[11px] ${
          isDark
            ? "bg-black/30 border-white/10 text-slate-200"
            : "bg-slate-50 border-navy-900/5 text-navy-800/70"
        }`}
      >
        <span className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 text-gold-500" />
          {t.nav.checklistTip}{" "}
          <strong className={isDark ? "text-white" : "text-navy-900"}>
            {SITE.phone}
          </strong>
        </span>
        <Link
          href={category.href}
          onClick={onClose}
          className="font-bold text-gold-400 hover:text-gold-300 hover:underline"
        >
          {t.nav.viewFullDetails} &rarr;
        </Link>
      </div>
    </motion.div>
  );
}

interface LegalGroupDropdownPanelProps {
  categories: ServiceCategory[];
  categoriesTrans: Record<string, CategoryTrans>;
  onClose: () => void;
  isUrdu: boolean;
  isDark: boolean;
  id?: string;
}

export function LegalGroupDropdownPanel({
  categories,
  categoriesTrans,
  onClose,
  isUrdu,
  isDark,
  id,
}: LegalGroupDropdownPanelProps) {
  const alignClass = isUrdu ? "left-0" : "right-0";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      id={id}
      role="region"
      aria-label="Legal and family services navigation menu"
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`absolute top-full mt-2 w-[680px] max-w-[calc(100vw-32px)] ${alignClass} rounded-2xl border ${
        isDark
          ? "border-white/15 bg-[#0c1c33] text-white shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
          : "border-navy-900/10 bg-white text-navy-900 shadow-2xl"
      } p-6 z-50 overflow-hidden before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']`}
    >
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-navy-900" />

      <div
        className={`flex items-center justify-between pb-3 border-b ${
          isDark ? "border-white/10" : "border-navy-900/8"
        }`}
      >
        <div>
          <h3
            className={`font-serif text-base font-bold ${
              isDark ? "text-white" : "text-navy-900"
            }`}
          >
            {isUrdu
              ? "قانونی، خاندانی، بینکنگ و آئی پی سروسز"
              : "Legal, Family, Banking & IP Services"}
          </h3>
          <p
            className={`text-[11px] ${
              isDark ? "text-slate-300" : "text-navy-800/60"
            }`}
          >
            {isUrdu
              ? "عدالتی تصدیقات، رجسٹری دستاویزات، بینک فنانسنگ، اور انٹلیکچوئل پراپرٹی حقوق۔"
              : "Court certifications, registry deeds, banking documentation, and intellectual property."}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4" role="list">
        {categories.map((cat) => {
          const HeaderIcon = getCategoryHeaderIcon(cat.id);
          const catTrans = categoriesTrans[cat.id] || {
            title: cat.title,
            shortTitle: cat.shortTitle,
            tagline: cat.tagline,
            description: cat.description,
            items: cat.items,
          };
          return (
            <div
              key={cat.id}
              role="listitem"
              className={`rounded-xl border p-3 ${
                isDark
                  ? "border-white/10 bg-white/[0.04]"
                  : "border-navy-900/5 bg-slate-50/50"
              }`}
            >
              <Link
                href={cat.href}
                onClick={onClose}
                className={`group flex items-center justify-between pb-2 border-b ${
                  isDark ? "border-white/10" : "border-navy-900/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <HeaderIcon className="h-4 w-4 text-gold-500" />
                  <span
                    className={`text-xs font-bold transition ${
                      isDark
                        ? "text-white group-hover:text-gold-400"
                        : "text-navy-900 group-hover:text-gold-600"
                    }`}
                  >
                    {catTrans.title}
                  </span>
                </div>
                <ArrowRight className="h-3 w-3 text-gold-500 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <ul className="mt-2 space-y-1">
                {catTrans.items?.slice(0, 3).map((item) => (
                  <li key={item.title}>
                    <Link
                      href={cat.href}
                      onClick={onClose}
                      className={`text-[11px] transition block py-0.5 ${
                        isDark
                          ? "text-slate-300 hover:text-gold-400"
                          : "text-navy-800/70 hover:text-gold-600"
                      }`}
                    >
                      &bull; {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
