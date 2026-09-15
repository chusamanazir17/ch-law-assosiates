"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  X,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { SITE } from "@/lib/site";
import { useLanguage } from "@/lib/LanguageContext";
import Logo from "./Logo";

export default function Footer() {
  const { isUrdu, t } = useLanguage();
  const [policyType, setPolicyType] = useState<"privacy" | "terms" | null>(null);

  const quickLinks = [
    { label: t.common.home, href: "/" },
    { label: isUrdu ? "ای سٹامپنگ سروسز" : "E-Stamping", href: "/services/e-stamping" },
    { label: isUrdu ? "پراپرٹی رجسٹری و انتقال" : "Property Registry", href: "/services/property-land" },
    { label: isUrdu ? "بزنس و کمپنی رجسٹریشن" : "Business Registration", href: "/services/business-registration" },
    { label: isUrdu ? "ٹیکس سروسز (FBR)" : "Tax Services", href: "/services/tax" },
    { label: isUrdu ? "ہمارے بارے میں" : "About Us", href: "/#about" },
  ];

  // TODO: Replace with actual social media profile URLs before production launch
  const socials = [
    { icon: Facebook, label: "Facebook", href: "https://facebook.com" },
    { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
    { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
    { icon: Twitter, label: "Twitter", href: "https://twitter.com" },
  ];

  return (
    <>
      <footer className="border-t border-navy-900/10 dark:border-white/10 bg-white dark:bg-[#071224] transition-colors duration-200">
        <div className="container-x pt-12 pb-8 border-b border-navy-900/10 dark:border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <Logo isUrdu={isUrdu} size="lg" />
          <p className="max-w-md text-xs sm:text-sm text-navy-800/70 dark:text-slate-400 leading-relaxed">
            {isUrdu 
              ? "ڈسٹرکٹ کورٹ ساہیوال میں ای سٹامپنگ، پراپرٹی رجسٹری، ٹیکس اور قانونی دستاویزات کا مستند و بااعتماد ادارہ۔" 
              : "Authorized legal documentation & tax advisory firm providing verified E-Stamping, property registration, and corporate compliance services at District Court Sahiwal."}
          </p>
        </div>
        <div className="container-x grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Contact */}
          <div>
            <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-navy-900 dark:text-white">
              {t.footer.contactUs}
            </h4>
            <ul className="space-y-4 text-sm text-navy-800/70 dark:text-slate-300">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                <span>{isUrdu ? "شرقی گیٹ چیمبر نمبر 121، ڈسٹرکٹ کورٹ ساہیوال" : SITE.address}</span>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-semibold text-navy-900 dark:text-white">
                      {isUrdu ? "حاجی نذیر احمد:" : "Haji Nazir Ahmad:"}
                    </span>
                    <a href="tel:+923016922573" className="transition hover:text-gold-600 dark:hover:text-gold-400">
                      0301-6922573
                    </a>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-semibold text-navy-900 dark:text-white">
                      {isUrdu ? "اسامہ نذیر چوہدری:" : "Usama Nazir Ch:"}
                    </span>
                    <a href="tel:+923057902744" className="transition hover:text-gold-600 dark:hover:text-gold-400">
                      0305-7902744
                    </a>
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                <a href={`mailto:${SITE.email}`} className="transition hover:text-gold-600 dark:hover:text-gold-400">
                  {SITE.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-navy-900 dark:text-white">
              {t.footer.businessHours}
            </h4>
            <ul className="space-y-3 text-sm text-navy-800/70 dark:text-slate-300">
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                <span>{isUrdu ? "پیر تا جمعہ: 9:00 بجے صبح تا 6:00 بجے شام" : SITE.hours.weekdays}</span>
              </li>
              <li className="flex gap-3 pl-7 rtl:pr-7 rtl:pl-0">
                {isUrdu ? "ہفتہ: 10:00 بجے صبح تا 2:00 بجے دوپہر" : SITE.hours.saturday}
              </li>
              <li className="flex gap-3 pl-7 rtl:pr-7 rtl:pl-0">
                {isUrdu ? "اتوار: بند ہے" : SITE.hours.sunday}
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-navy-900 dark:text-white">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-3 text-sm">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-navy-800/70 dark:text-slate-300 transition hover:pl-1 rtl:hover:pr-1 rtl:hover:pl-0 hover:text-gold-600 dark:hover:text-gold-400"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-navy-900 dark:text-white">
              {t.footer.followUs}
            </h4>
            <div className="flex gap-3">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-400 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-gold-500 hover:shadow-lg hover:shadow-gold-400/40 focus-visible:ring-2 focus-visible:ring-gold-400 focus:outline-none"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <div className="mt-6 rounded-lg bg-navy-900/[0.04] dark:bg-white/[0.06] p-4 text-xs leading-relaxed text-navy-800/70 dark:text-slate-300 border border-navy-900/5 dark:border-white/5">
              {t.footer.disclaimer}
            </div>
          </div>
        </div>

        <div className="border-t border-navy-900/10 dark:border-white/10">
          <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-xs text-navy-800/55 dark:text-slate-400 sm:flex-row">
            <p>{t.footer.rights}</p>
            <div className="flex gap-6">
              <button
                type="button"
                onClick={() => setPolicyType("privacy")}
                className="transition hover:text-gold-600 dark:hover:text-gold-400 cursor-pointer underline-offset-4 hover:underline focus:outline-none"
              >
                {t.footer.privacy}
              </button>
              <button
                type="button"
                onClick={() => setPolicyType("terms")}
                className="transition hover:text-gold-600 dark:hover:text-gold-400 cursor-pointer underline-offset-4 hover:underline focus:outline-none"
              >
                {t.footer.terms}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Policy Modal */}
      <AnimatePresence>
        {policyType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="policy-title">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPolicyType(null)}
              className="fixed inset-0 bg-navy-950/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-lg rounded-2xl border border-navy-900/10 dark:border-white/15 bg-white dark:bg-[#0c1c33] p-6 sm:p-8 shadow-2xl text-navy-900 dark:text-white z-10 my-auto"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 rounded-t-2xl bg-gradient-to-r from-gold-400 via-gold-500 to-navy-900" />

              <button
                type="button"
                onClick={() => setPolicyType(null)}
                aria-label={isUrdu ? "بند کریں" : "Close"}
                className="absolute top-4 right-4 rtl:left-4 rtl:right-auto flex h-9 w-9 items-center justify-center rounded-full bg-navy-900/5 dark:bg-white/10 text-navy-800 dark:text-slate-300 hover:bg-navy-900/10 dark:hover:bg-white/20 transition"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 pr-8 rtl:pr-0 rtl:pl-8">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-400/15 text-gold-500 dark:text-gold-400">
                  {policyType === "privacy" ? <ShieldCheck className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                </span>
                <h3 id="policy-title" className="font-serif text-xl font-bold">
                  {policyType === "privacy" ? t.footer.privacy : t.footer.terms}
                </h3>
              </div>

              <div className="mt-5 space-y-3.5 text-xs sm:text-sm leading-relaxed text-navy-800/80 dark:text-slate-300 max-h-[60vh] overflow-y-auto pr-2">
                {policyType === "privacy" ? (
                  isUrdu ? (
                    <>
                      <p className="font-semibold text-navy-900 dark:text-white">
                        راز داری و کلائنٹ کا تحفظ (Client Confidentiality):
                      </p>
                      <p>
                        لیگل اسسٹ پاکستان کلائنٹس کے شناختی، کاروباری اور جائیداد سے متعلق تمام کوائف کی مکمل رازداری برقرار رکھنے کا پابند ہے۔ تمام دستاویزات صرف متعلقہ قانونی کارروائی اور تصدیق کے مقاصد کے لیے استعمال کی جاتی ہیں۔
                      </p>
                      <p>
                        ہم کلائنٹ کی واضح اجازت یا مجاز عدالتی حکم کے بغیر کوئی بھی معلومات کسی تیسرے فریق کے ساتھ شیئر نہیں کرتے۔
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-navy-900 dark:text-white">
                        Client Confidentiality & Privacy Standards:
                      </p>
                      <p>
                        Ch Composing Estamp and Tax Advisor strictly adheres to client-attorney confidentiality standards under Pakistani statutory law. Documents submitted for e-stamping, registry, FBR tax compliance, or SECP incorporation are used exclusively for authorized official processing.
                      </p>
                      <p>
                        No personal identity records, land ownership deeds, or financial disclosures are shared with third parties without explicit client consent or lawful regulatory instruction.
                      </p>
                    </>
                  )
                ) : isUrdu ? (
                  <>
                    <p className="font-semibold text-navy-900 dark:text-white">
                      خدمات کی شرائط و ضوابط (Terms of Engagement):
                    </p>
                    <p>
                      تمام قانونی مشاورت اور دستاویزی خدمات کلائنٹ کی جانب سے فراہم کردہ اصل اور مستند معلومات کی بنیاد پر انجام دی جاتی ہیں۔
                    </p>
                    <p>
                      سٹامپ پیپرز، جائیداد کی رجسٹری اور ٹیکس اندراجات میں متعلقہ سرکاری اداروں (FBR, SECP, بورڈ آف ریونیو) کے مقررہ قواعد و ضوابط اور بائیومیٹرک تصدیق کی ضروریات نافذ العمل ہوں گی۔
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-navy-900 dark:text-white">
                      Terms of Service & Engagement:
                    </p>
                    <p>
                      All legal, documentation, and tax services provided by Ch Composing Estamp and Tax Advisor are predicated on authentic, verifiable source documentation provided by the client.
                    </p>
                    <p>
                      Statutory turnaround times, government challan tariffs, and biometric attestation requirements are governed by respective authorities including FBR, SECP, Punjab Revenue Authority, and District Administrations.
                    </p>
                  </>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-navy-900/8 dark:border-white/10 text-right rtl:text-left">
                <button
                  type="button"
                  onClick={() => setPolicyType(null)}
                  className="btn-navy py-2 px-5 text-xs"
                >
                  {isUrdu ? "سمجھ گیا / بند کریں" : "I Understand / Close"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
