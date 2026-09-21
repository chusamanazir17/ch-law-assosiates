"use client";

import React from "react";
import Link from "next/link";
import {
  Stamp,
  Scale,
  Home,
  Handshake,
  Landmark,
  ShieldCheck,
  FileCheck2,
  BadgeCheck,
  Clock3,
  FileSearch,
  Phone,
  CheckCircle2,
  FileText,
  AlertCircle,
  Banknote,
  ArrowRight,
  MapPin,
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import NoticeBar from "@/components/ui/NoticeBar";
import ServiceCard from "@/components/ui/ServiceCard";
import SplitShowcase from "@/components/ui/SplitShowcase";
import Stagger from "@/components/motion/Stagger";
import FadeIn from "@/components/motion/FadeIn";
import { ContactCards, ConsultationPanel } from "@/components/ui/ContactBlocks";
import { HERO_IMAGES, SITE, buildWhatsAppUrl } from "@/lib/site";
import { useLanguage } from "@/providers/LanguageProvider";
import { useAppTheme } from "@/providers/ThemeProvider";
import { useCms } from "@/lib/hooks/useCms";
import { WhatsAppIcon, OfficialWhatsAppButton } from "@/components/ui/WhatsAppIcon";

const DEFAULT_ICONS = [Stamp, Scale, Home, Handshake, Landmark, ShieldCheck, FileText, Banknote];

interface ServicePageTemplateProps {
  slug: string;
}

export default function ServicePageTemplate({ slug }: ServicePageTemplateProps) {
  const { isUrdu, t } = useLanguage();
  const { isDark } = useAppTheme();
  const { getService, settings } = useCms();

  const cmsService = getService(slug);
  const sp = t.servicePages ? (t.servicePages as Record<string, any>)[slug] : undefined;

  // Resolve titles and descriptions with CMS taking precedence over static defaults
  const pageTitle = isUrdu
    ? (cmsService?.nameUrdu || sp?.heroTitle || cmsService?.name || slug)
    : (cmsService?.name || sp?.heroTitle || slug);

  const pageBadge = isUrdu
    ? (sp?.heroBadge || cmsService?.category || "مستند قانونی سروس")
    : (cmsService?.category || sp?.heroBadge || "Authorized Court Service");

  const pageDescription = isUrdu
    ? (sp?.heroDesc || cmsService?.description || "ڈسٹرکٹ کورٹ ساہیوال میں پیشہ ورانہ قانونی و ٹیکس خدمات۔")
    : (cmsService?.description || sp?.heroDesc || "Professional legal and tax documentation services at District Court Sahiwal.");

  const heroImage =
    cmsService?.heroImage ||
    sp?.image ||
    (HERO_IMAGES as Record<string, string>)[slug] ||
    HERO_IMAGES.home;

  const turnaroundTime = cmsService?.turnaroundTime || "Same-day (15 to 30 mins)";
  const feeInfo = cmsService?.governmentFeeInfo || sp?.disclaimerBox || "Subject to official government schedule and stamp duty rates.";

  // Sub-services cards
  const cards = cmsService?.items && cmsService.items.length > 0
    ? cmsService.items.map((item, idx) => ({
        icon: DEFAULT_ICONS[idx % DEFAULT_ICONS.length],
        title: item.title,
        description: item.description,
        meta: item.badge || undefined,
        bullets: undefined,
        linkLabel: isUrdu ? "معلومات لیں" : "Get Details",
      }))
    : sp?.cards?.map((card: any, idx: number) => ({
        icon: DEFAULT_ICONS[idx % DEFAULT_ICONS.length],
        title: card.title,
        meta: card.meta,
        description: card.description,
        listLabel: card.listLabel,
        bullets: card.bullets,
        linkLabel: card.linkLabel || (isUrdu ? "معلومات لیں" : "Inquire"),
      })) || [];

  // Required documents
  const requiredDocs = cmsService?.requiredDocuments && cmsService.requiredDocuments.length > 0
    ? cmsService.requiredDocuments
    : [
        isUrdu ? "فریقین کے اصل کمپیوٹرائزڈ شناختی کارڈ (CNIC)" : "Original CNIC copies of all concerned parties",
        isUrdu ? "متعلقہ جائیداد / این ٹی این / فرد ملکیت کی نقل" : "Property registry / NTN / Fard Malkiat documentation",
        isUrdu ? "چالان فارم 32-A یا فیس کی رسید" : "Challan 32-A or government fee voucher",
      ];

  const whatsappPhone = settings?.whatsappSettings?.number || settings?.whatsapp || SITE.whatsapp;
  const whatsappMsg = `Hello Ch Composing, I would like to inquire about ${pageTitle} (Chamber 121 Sahiwal).`;
  const whatsappUrl = buildWhatsAppUrl(whatsappPhone, whatsappMsg);

  return (
    <>
      <PageHero
        badge={pageBadge}
        title={pageTitle}
        description={pageDescription}
        image={heroImage}
        backLabel={t.common.backToHome}
        backHref="/"
      />

      {/* Turnaround & Official Government Fee Notice Bar */}
      <div className="border-b border-gold-400/20 bg-gold-400/10 dark:bg-gold-950/20 transition-colors duration-200">
        <div className="container-x py-4">
          <NoticeBar
            tone="info"
            icon={Clock3}
            label={isUrdu ? "پروسیسنگ وقت" : "Processing Speed"}
            title={`${isUrdu ? "تکمیل کا وقت: " : "Turnaround Time: "}${turnaroundTime}`}
            text={`${isUrdu ? "سرکاری فیس و ضوابط: " : "Fee & Compliance: "}${feeInfo}`}
            ctaLabel={isUrdu ? "واٹس ایپ رابطہ" : "Inquire Fee"}
            ctaHref={whatsappUrl}
            className="!border-0 !bg-transparent !p-0"
          />
        </div>
      </div>

      {/* Services Portfolio Grid */}
      <section className="bg-[#f5f7fa] dark:bg-[#071224] py-20 transition-colors duration-200">
        <div className="container-x">
          <FadeIn className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
                {isUrdu ? "دستیاب سروسز" : "Service Catalog"}
              </span>
              <h2 className="section-title text-navy-900 dark:text-white mt-1">
                {isUrdu ? `${pageTitle} کی ذیلی شاخیں` : `Scope of ${pageTitle}`}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-navy-800/60 dark:text-slate-300">
                {isUrdu
                  ? "ہم تمام دستاویزات کی تیاری، سرکاری پورٹل تصدیق اور موقع پر پروسیسنگ مکمل کرتے ہیں۔"
                  : "All documentation, biometric verification, and legal drafting are executed accurately at Chamber 121."}
              </p>
            </div>
            <div className="rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1 text-xs font-semibold text-gold-600 dark:text-gold-400">
              {isUrdu ? `کل سروسز: ${cards.length}` : `Total Services: ${cards.length}`}
            </div>
          </FadeIn>

          <Stagger className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((c: any) => (
              <ServiceCard
                key={c.title}
                icon={c.icon || Stamp}
                title={c.title}
                meta={c.meta}
                description={c.description}
                listLabel={c.listLabel}
                bullets={c.bullets}
                linkLabel={c.linkLabel}
                linkVariant="button"
                linkHref={whatsappUrl}
              />
            ))}
          </Stagger>
        </div>
      </section>

      {/* Required Documents Checklist & Chamber Verification */}
      <section className="bg-white dark:bg-[#05162B] py-20 border-y border-[#E3E7EC] dark:border-white/10 transition-colors duration-200">
        <div className="container-x grid gap-12 lg:grid-cols-12 items-center">
          <FadeIn direction="right" className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
              {isUrdu ? "مطلوبہ دستاویزات چیک لسٹ" : "Prerequisites & Checklist"}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
              {isUrdu ? "چیمبر تشریف لانے کے لیے ضروری کاغذات" : "Documents Required Before Visiting"}
            </h2>
            <p className="text-sm leading-relaxed text-navy-800/70 dark:text-slate-300">
              {isUrdu
                ? "وقت کی بچت کے لیے درج ذیل دستاویزات ساتھ لائیں یا پیشگی واٹس ایپ پر ارسال کریں تاکہ آپ کی فائل پہلے سے تیار کی جا سکے۔"
                : "To ensure immediate same-day processing, please bring the following documents or send them on WhatsApp in advance:"}
            </p>

            <ul className="space-y-3.5 pt-2">
              {requiredDocs.map((doc, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-navy-900 dark:text-slate-200">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 flex flex-wrap gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold px-5 py-3 text-xs shadow-md transition"
              >
                <WhatsAppIcon className="h-4 w-4" />
                <span>{isUrdu ? "چیک لسٹ واٹس ایپ پر منگوائیں" : "Request Checklist on WhatsApp"}</span>
              </a>
              <a
                href={`tel:${(settings?.phone || SITE.phone).replace(/[^\d+]/g, "")}`}
                className="btn-outline-navy py-3 px-5 text-xs inline-flex items-center gap-2"
              >
                <Phone className="h-4 w-4 text-gold-500" />
                <span>{isUrdu ? "فون پر رہنمائی لیں" : "Call Desk"}</span>
              </a>
            </div>
          </FadeIn>

          <FadeIn direction="left" delay={0.15} className="lg:col-span-6">
            <div className="rounded-2xl border border-navy-900/10 dark:border-white/10 bg-[#F7F9FB] dark:bg-[#102943] p-7 sm:p-9 shadow-card text-navy-900 dark:text-white">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/20 text-gold-500">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white">
                    {isUrdu ? "چیمبر 121، ڈسٹرکٹ کورٹ ساہیوال" : "Chamber 121, District Court Sahiwal"}
                  </h3>
                  <p className="text-xs text-navy-800/60 dark:text-[#8792A1]">
                    {settings?.address || SITE.address}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3.5 border-t border-[#E3E7EC] dark:border-white/10 pt-6 text-xs text-navy-800/70 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{isUrdu ? "پیر تا جمعہ:" : "Monday - Friday:"}</span>
                  <span>{settings?.hours?.weekdays || SITE.hours.weekdays}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{isUrdu ? "ہفتہ:" : "Saturday:"}</span>
                  <span>{settings?.hours?.saturday || SITE.hours.saturday}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{isUrdu ? "اتوار:" : "Sunday:"}</span>
                  <span className="text-rose-500 font-semibold">{settings?.hours?.sunday || SITE.hours.sunday}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#E3E7EC] dark:border-white/10 flex items-center justify-between">
                <span className="text-xs text-navy-800/60 dark:text-slate-400">
                  {isUrdu ? "مقام: شرقی گیٹ، کچہری" : "Location: Sharki Gate"}
                </span>
                <Link
                  href="/#office"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline"
                >
                  <span>{isUrdu ? "نقشہ اور اوقات دیکھیں" : "View Live Map"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Immediate Assistance Contact Cards */}
      <section className="bg-[#f5f7fa] dark:bg-[#071224] py-20 transition-colors duration-200">
        <div className="container-x">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 className="section-title text-navy-900 dark:text-white">{t.common.immediateAssistance}</h2>
            <p className="mt-4 text-sm text-navy-800/60 dark:text-slate-300">
              {t.common.immediateAssistanceDesc}
            </p>
          </FadeIn>
          <div className="mt-12">
            <ContactCards featuredFirst />
          </div>
        </div>
      </section>

      {/* Bottom Checklist Banner */}
      <section className="bg-navy-900 py-10 border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-5 sm:flex-row text-white">
          <FadeIn>
            <h3 className="font-serif text-xl font-bold text-gold-400">
              {isUrdu ? `${pageTitle} کے لیے فوری مدد چاہیے؟` : `Need Instant Assistance for ${pageTitle}?`}
            </h3>
            <p className="mt-1 text-sm text-white/70">
              {isUrdu
                ? "ہمارے کنسلٹنٹس ساہیوال کچہری میں آپ کی خدمت کے لیے موجود ہیں۔"
                : "Our licensed advisors are ready to process your documentation at District Court Sahiwal."}
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <a
              href={`tel:${(settings?.phone || SITE.phone).replace(/[^\d+]/g, "")}`}
              className="btn-gold whitespace-nowrap"
            >
              <Phone className="h-4 w-4" /> {settings?.phone || SITE.phone}
            </a>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
