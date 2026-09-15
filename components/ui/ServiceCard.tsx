"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  X,
  Phone,
  MapPin,
  FileText,
  ShieldCheck,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { staggerItem } from "@/components/motion/Stagger";
import { SITE } from "@/lib/site";
import { useLanguage } from "@/lib/LanguageContext";

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
  onClick?: () => void;
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
  onClick,
}: ServiceCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { isUrdu } = useLanguage();

  const isRealLink = linkHref && (linkHref.startsWith("/") || linkHref.startsWith("http")) && !linkHref.startsWith("/#");

  const handleActionClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
      return;
    }

    if (!isRealLink) {
      e.preventDefault();
      setModalOpen(true);
    }
  };

  const whatsappInquiryUrl = `${SITE.whatsappHref}?text=${encodeURIComponent(
    isUrdu
      ? `السلام علیکم چوہدری کمپوزنگ ای سٹامپ اور ٹیکس ایڈوائزر، مجھے "${title}" کے لیے دستاویزات کی فہرست اور طریقہ کار معلوم کرنا ہے۔`
      : `Hello Ch Composing Estamp and Tax Advisor, I would like to inquire about requirements and processing for: "${title}".`
  )}`;

  return (
    <>
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
            <button
              type="button"
              onClick={handleActionClick}
              className="flex w-full items-center justify-center gap-2 rounded border border-navy-900/20 dark:border-white/20 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-navy-800 dark:text-white transition hover:border-navy-900 hover:bg-navy-900 hover:text-white dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-gold-400 focus:outline-none active:scale-[0.98]"
            >
              {linkLabel}
            </button>
          ) : linkVariant === "button" ? (
            <button
              type="button"
              onClick={handleActionClick}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-gold-600 dark:text-gold-400 transition hover:text-gold-700 dark:hover:text-gold-300 focus-visible:ring-2 focus-visible:ring-gold-400 focus:outline-none active:scale-[0.98]"
            >
              <span>{linkLabel}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleActionClick}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-800/70 dark:text-slate-300 transition group-hover:gap-2.5 group-hover:text-gold-600 dark:group-hover:text-gold-400 focus-visible:ring-2 focus-visible:ring-gold-400 focus:outline-none active:scale-[0.98]"
            >
              <span>{linkLabel}</span>
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </button>
          )}
        </div>
      </motion.article>

      {/* Interactive Service Detail & Inquiry Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-navy-950/75 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg rounded-2xl border border-navy-900/10 dark:border-white/15 bg-white dark:bg-[#0c1c33] p-6 sm:p-8 shadow-2xl text-navy-900 dark:text-white z-10 my-auto"
            >
              {/* Gold Top Accent Bar */}
              <div className="absolute top-0 inset-x-0 h-1.5 rounded-t-2xl bg-gradient-to-r from-gold-400 via-gold-500 to-navy-900" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label={isUrdu ? "بند کریں" : "Close"}
                className="absolute top-4 right-4 rtl:left-4 rtl:right-auto flex h-9 w-9 items-center justify-center rounded-full bg-navy-900/5 dark:bg-white/10 text-navy-800 dark:text-slate-300 transition hover:bg-navy-900/10 dark:hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-gold-400 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-start gap-3.5 pr-8 rtl:pr-0 rtl:pl-8">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-400/15 text-gold-500 dark:text-gold-400">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  {meta && (
                    <span className="inline-block rounded bg-gold-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 mb-1">
                      {meta}
                    </span>
                  )}
                  <h3 className="font-serif text-xl font-bold leading-tight">{title}</h3>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-navy-800/75 dark:text-slate-300">
                {description}
              </p>

              {/* Requirement Checklist */}
              <div className="mt-6 rounded-xl border border-navy-900/8 dark:border-white/10 bg-[#f8fafc] dark:bg-[#071224] p-4 sm:p-5">
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy-900 dark:text-white">
                  <FileText className="h-4 w-4 text-gold-500" />
                  {isUrdu ? "مطلوبہ دستاویزات و طریقہ کار" : "Required Documents & Process Checklist"}
                </h4>
                <ul className="mt-3 space-y-2.5">
                  {(bullets && bullets.length > 0
                    ? bullets
                    : isUrdu
                    ? [
                        "اصل قومی شناختی کارڈ (CNIC) بمطابق ریکارڈ",
                        "2 عدد پاسپورٹ سائز تصاویر اور متعلقہ کوائف",
                        "مالکانہ ثبوت یا متعلقہ اتھارٹی کی رسمی دستاویزات",
                        "دفتر میں بائیومیٹرک تصدیق یا سرکاری چالان کی ادائیگی",
                      ]
                    : [
                        "Original CNIC / NADRA Smart Card of all parties",
                        "2 Passport-sized photographs & relevant authority forms",
                        "Title deed / ownership proof / registry records",
                        "Biometric verification at our Sahiwal District Court chamber",
                      ]
                  ).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs leading-relaxed text-navy-800/80 dark:text-slate-300">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Processing Guarantee Notice */}
              <div className="mt-4 flex items-center gap-2.5 text-[11px] text-navy-800/60 dark:text-slate-400">
                <ShieldCheck className="h-4 w-4 text-gold-500 shrink-0" />
                <span>
                  {isUrdu
                    ? "تمام کارروائی قانون پاکستان اور مجاز سرکاری پورٹل کے تحت مکمل کی جاتی ہے۔"
                    : "Fully verified under relevant Pakistani statutory and regulatory frameworks."}
                </span>
              </div>

              {/* Fast Action Buttons */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#25d366] px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#20bd5a] focus-visible:ring-2 focus-visible:ring-[#25d366] focus:outline-none"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  <span>{isUrdu ? "واٹس ایپ معلومات حاصل کریں" : "WhatsApp Inquiry"}</span>
                </a>

                <a
                  href={SITE.phoneHref}
                  className="flex items-center justify-center gap-2 rounded-lg bg-navy-900 dark:bg-gold-400 px-4 py-3 text-xs font-bold text-white dark:text-navy-950 shadow-sm transition hover:bg-navy-800 dark:hover:bg-gold-300 focus-visible:ring-2 focus-visible:ring-gold-400 focus:outline-none"
                >
                  <Phone className="h-4 w-4" />
                  <span>{isUrdu ? "کال پر بات کریں" : "Call Helpline"}</span>
                </a>
              </div>

              {/* Office Location Link */}
              <div className="mt-4 pt-3 border-t border-navy-900/8 dark:border-white/10 text-center">
                <Link
                  href="/#office"
                  onClick={() => setModalOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-800/75 dark:text-slate-300 hover:text-gold-600 dark:hover:text-gold-400 transition"
                >
                  <MapPin className="h-3.5 w-3.5 text-gold-500" />
                  <span>
                    {isUrdu
                      ? "ہمارے ساہیوال چیمبر کا پتہ اور اوقات دیکھیں"
                      : "View Sahiwal Chamber Location & Timings"}
                  </span>
                  <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
