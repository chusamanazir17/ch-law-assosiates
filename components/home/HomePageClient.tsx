"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Eye,
  FileCheck2,
  CalendarCheck,
  BadgeCheck,
  Star,
  ChevronDown,
  HelpCircle,
  Calendar,
  Award,
  FileText,
  Headphones,
} from "lucide-react";
import { HOME_SERVICES, SITE, buildWhatsAppUrl } from "@/lib/site";
import FadeIn from "@/components/motion/FadeIn";
import Stagger, { StaggerItem } from "@/components/motion/Stagger";
import OfficeSection from "@/components/ui/OfficeSection";
import { ConsultationForm } from "@/components/ui/ContactBlocks";
import { useLanguage } from "@/providers/LanguageProvider";
import { WhatsAppIcon, OfficialWhatsAppButton } from "@/components/ui/WhatsAppIcon";
import TaxReminderSection from "@/features/reminders/TaxReminderSection";
import { useCms } from "@/lib/hooks/useCms";
import { OWNERS } from "@/lib/owners";
import { OwnerAvatar } from "@/components/ui/OwnerAvatar";

const BUILDING_IMG =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=640&q=70";

function Hero() {
  const { isUrdu, t } = useLanguage();
  const { getPageContent, settings, homeSections } = useCms();
  const homeCms = getPageContent("/");
  const heroSec = homeSections?.hero;

  const eyebrowText = isUrdu
    ? "ساہیوال میں بااعتماد قانونی و ٹیکس ایڈوائزری"
    : (heroSec?.badge || "TRUSTED LEGAL & TAX ADVISORY IN SAHIWAL");

  const heroTitleLine1 = isUrdu ? "آپ کے قانونی اور" : "Your Legal &";
  const heroTitleLine2 = isUrdu ? "ٹیکس کے معاملات" : "Tax Matters";
  const heroTitleHighlight = isUrdu ? "ہماری ترجیح" : "Our Priority";

  const heroDescription = isUrdu
    ? "ساہیوال میں مکمل شفافیت اور پیشہ ورانہ مہارت کے ساتھ ای سٹیمپنگ، پراپرٹی رجسٹری، ٹیکس ایڈوائزری اور قانونی دستاویزات کی قابل اعتماد خدمات۔"
    : (heroSec?.subtitle || homeCms?.heroSubtitle || "Providing reliable e-Stamping, property registry, tax advisory and legal documentation services in Sahiwal with complete transparency and professional excellence.");

  const primaryBtn = {
    text: isUrdu ? "مشاورت بک کریں" : (heroSec?.primaryBtn?.text || "Book a Consultation"),
    href: heroSec?.primaryBtn?.href || "#contact",
    enabled: heroSec?.primaryBtn?.enabled !== false,
  };

  const secondaryBtn = {
    text: isUrdu ? "واٹس ایپ پر رابطہ" : (heroSec?.secondaryBtn?.text || "WhatsApp Now"),
    message: isUrdu
      ? "السلام علیکم، میں چیمبر 121 سے قانونی دستاویزات اور ٹیکس ایڈوائزری کے بارے میں معلومات حاصل کرنا چاہتا ہوں۔"
      : (settings?.whatsappSettings?.sectionMessages?.hero || "Hello, I would like to inquire about legal documentation and tax advisory services."),
    enabled: heroSec?.secondaryBtn?.enabled !== false,
  };

  const whatsappPhone = settings?.whatsappSettings?.number || settings?.whatsapp || SITE.whatsapp;
  const whatsappUrl = buildWhatsAppUrl(whatsappPhone, secondaryBtn.message);

  return (
    <section className="relative overflow-hidden bg-[#040c18] text-white">
      {/* Full-bleed Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-scales-justice.jpg"
          alt="Legal desk with golden scales of justice, luxury fountain pen, and law books"
          fill
          priority
          className="object-cover object-right sm:object-center"
          sizes="100vw"
        />
        {/* Left-side gradient shadow to ensure 100% solid dark navy under text on all screen sizes */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#040c18] via-[#040c18]/90 via-45% to-transparent" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#040c18]/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#040c18] to-transparent" />
      </div>

      <div className="container-x relative z-10 pt-6 pb-12 sm:pt-8 sm:pb-16 lg:pt-10 lg:pb-16">
        {/* Main Hero Content Area */}
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-0 lg:min-h-[520px]">
          {/* Left Column (Text, Buttons, Stats) - sits directly on clean dark navy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 flex flex-col justify-center text-left py-4"
          >
            <div>
              {/* Eyebrow */}
              <span className="inline-flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[0.2em] text-gold-400">
                <BadgeCheck className="h-4 w-4 text-gold-400" />
                <span>{eyebrowText}</span>
              </span>

              {/* Headline */}
              <h1 className="mt-4 font-serif text-[clamp(2.5rem,5vw+0.5rem,3.875rem)] font-bold leading-[1.1] text-white tracking-tight">
                {heroTitleLine1}
                <br />
                {heroTitleLine2}
                <br />
                <span className="text-gold-400 relative inline-block">
                  {heroTitleHighlight}
                </span>
              </h1>

              {/* Description Paragraph */}
              <p className="mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-[#F4F6F8]/90 font-normal">
                {heroDescription}
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                {primaryBtn.enabled !== false && (
                  <Link
                    href={primaryBtn.href}
                    className="btn-gold inline-flex items-center gap-2.5 px-6 py-3.5 text-[13.5px] sm:text-sm font-medium shadow-lg shadow-gold-500/20"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>{primaryBtn.text}</span>
                    <ArrowRight className="h-4 w-4 ml-0.5" />
                  </Link>
                )}

                {secondaryBtn.enabled !== false && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] border border-emerald-400/30 px-6 py-3.5 text-[13.5px] sm:text-sm font-medium text-white shadow-lg shadow-[#25D366]/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl hover:shadow-[#25D366]/35"
                  >
                    <WhatsAppIcon className="h-4 w-4 text-white" />
                    <span>{secondaryBtn.text}</span>
                    <ChevronDown className="h-4 w-4 text-white/80" />
                  </a>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="mt-10 pt-8 border-t border-white/10 flex flex-wrap items-center gap-6 sm:gap-10">
              {/* Stat 1 */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-400/15 border border-gold-400/40 text-gold-400 shadow-inner">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white font-serif leading-none">500+</div>
                  <div className="text-[11.5px] sm:text-xs text-[#8792A1] mt-1 font-normal">
                    {isUrdu ? "مطمئن کلائنٹس" : "Satisfied Clients"}
                  </div>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-400/15 border border-gold-400/40 text-gold-400 shadow-inner">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white font-serif leading-none">99%</div>
                  <div className="text-[11.5px] sm:text-xs text-[#8792A1] mt-1 font-normal">
                    {isUrdu ? "کامیابی کی شرح" : "Success Rate"}
                  </div>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-400/15 border border-gold-400/40 text-gold-400 shadow-inner">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white font-serif leading-none">35+</div>
                  <div className="text-[11.5px] sm:text-xs text-[#8792A1] mt-1 font-normal">
                    {isUrdu ? "سال کا تجربہ (1988 سے)" : "Years of Experience"}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Floating overlays matching the mockup (hidden on mobile, visible on desktop) */}
          <div className="hidden lg:block lg:col-span-5 relative h-full min-h-[300px] lg:min-h-[460px] pointer-events-none">
            {/* Elegant Script Overlay in Top Right */}
            <div className="absolute top-2 right-0 sm:top-6 sm:right-4 z-20 text-right drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
              <p className="font-script text-3xl sm:text-4xl lg:text-[42px] text-white leading-[1.08] -rotate-3 select-none">
                Legal Guidance
                <br />
                <span className="text-white/95">for a Better</span>
                <br />
                <span className="relative inline-block text-gold-300">
                  Tomorrow
                  <svg
                    className="absolute -bottom-1.5 left-0 w-full h-3 text-gold-400"
                    viewBox="0 0 100 20"
                    preserveAspectRatio="none"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  >
                    <path d="M2,12 Q50,19 98,8" />
                  </svg>
                </span>
              </p>
            </div>

            {/* Floating Pill Badge at Bottom Right */}
            <div className="absolute bottom-4 right-0 sm:bottom-6 sm:right-4 z-20 flex items-center gap-3 rounded-2xl bg-[#05162B]/90 backdrop-blur-md border border-white/20 px-4 py-3 shadow-2xl max-w-[280px] pointer-events-auto">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-400/20 text-gold-400 border border-gold-400/30">
                <Users className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="text-[10.5px] uppercase tracking-wider text-[#8792A1] block font-medium">
                  {isUrdu ? "بااعتماد برائے" : "Trusted by"}
                </span>
                <span className="text-xs sm:text-sm font-bold text-white block leading-tight">
                  {isUrdu ? "کاروبار، خاندان اور افراد" : "Businesses, Families & Individuals"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Feature Ribbon Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.45 }}
          className="mt-10 lg:mt-14 w-full rounded-2xl bg-white dark:bg-[#102943] border border-[#E3E7EC] dark:border-white/10 shadow-xl p-5 sm:p-6 text-slate-800 dark:text-slate-100"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 lg:divide-x divide-[#E3E7EC] dark:divide-white/10">
            {/* Feature 1 */}
            <div className="flex items-center gap-3.5 lg:px-4 pt-4 sm:pt-0 first:pt-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-950/5 dark:bg-white/10 text-navy-950 dark:text-gold-400 border border-[#E3E7EC] dark:border-white/10">
                <ShieldCheck className="h-5 w-5 text-gold-500 dark:text-gold-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0B1F36] dark:text-white">
                  {isUrdu ? "تیز اور محفوظ عمل" : "Fast & Secure Process"}
                </h4>
                <p className="text-xs text-[#657184] dark:text-[#8792A1]">
                  {isUrdu ? "آسان اور شفاف دستاویزات" : "Hassle-free documentation"}
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-3.5 lg:px-4 pt-4 sm:pt-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-950/5 dark:bg-white/10 text-navy-950 dark:text-gold-400 border border-[#E3E7EC] dark:border-white/10">
                <MapPin className="h-5 w-5 text-gold-500 dark:text-gold-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0B1F36] dark:text-white">
                  {isUrdu ? "مقامی تجربہ" : "Local Expertise"}
                </h4>
                <p className="text-xs text-[#657184] dark:text-[#8792A1]">
                  {isUrdu ? "ساہیوال بیسڈ، ہر وقت دستیاب" : "Sahiwal based, always here"}
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-3.5 lg:px-4 pt-4 sm:pt-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-950/5 dark:bg-white/10 text-navy-950 dark:text-gold-400 border border-[#E3E7EC] dark:border-white/10">
                <FileText className="h-5 w-5 text-gold-500 dark:text-gold-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0B1F36] dark:text-white">
                  {isUrdu ? "واضح اور شفاف فیس" : "Transparent Fees"}
                </h4>
                <p className="text-xs text-[#657184] dark:text-[#8792A1]">
                  {isUrdu ? "کوئی پوشیدہ چارجز نہیں" : "No hidden charges"}
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-3.5 lg:px-4 pt-4 sm:pt-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-950/5 dark:bg-white/10 text-navy-950 dark:text-gold-400 border border-[#E3E7EC] dark:border-white/10">
                <Headphones className="h-5 w-5 text-gold-500 dark:text-gold-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0B1F36] dark:text-white">
                  {isUrdu ? "مکمل معاونت" : "Complete Support"}
                </h4>
                <p className="text-xs text-[#657184] dark:text-[#8792A1]">
                  {isUrdu ? "آغاز سے اختتام تک" : "From start to finish"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom fade for smooth transition to services section */}
      <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#f5f7fa] dark:from-[#071224] to-transparent pointer-events-none" />
    </section>
  );
}

function ServicesGrid() {
  const { isUrdu, t } = useLanguage();
  const { services, homeSections } = useCms();
  const sec = homeSections?.servicesSection;

  if (sec?.enabled === false) return null;

  const defaultServicesData = [
    {
      title: t.categories["e-stamping"].title,
      href: "/services/e-stamping",
      image: HOME_SERVICES[0].image,
      description: t.categories["e-stamping"].description,
    },
    {
      title: t.categories["property-land"].title,
      href: "/services/property-land",
      image: HOME_SERVICES[1].image,
      description: t.categories["property-land"].description,
    },
    {
      title: t.categories["business-registration"].title,
      href: "/services/business-registration",
      image: HOME_SERVICES[2].image,
      description: t.categories["business-registration"].description,
    },
    {
      title: t.categories["tax"].title,
      href: "/services/tax",
      image: HOME_SERVICES[3].image,
      description: t.categories["tax"].description,
    },
  ];

  const activeServices = services && services.length > 0 ? services.filter((s) => s.active) : [];
  const servicesData =
    activeServices.length > 0
      ? activeServices.slice(0, 8).map((s, idx) => ({
          title: isUrdu ? (s.nameUrdu || t.categories[s.slug]?.title || s.name) : s.name,
          href: `/services/${s.slug}`,
          image: s.heroImage || HOME_SERVICES[idx % HOME_SERVICES.length]?.image || HOME_SERVICES[0].image,
          description: isUrdu ? (t.categories[s.slug]?.description || s.description) : s.description,
        }))
      : defaultServicesData;

  const sectionTitle = sec?.title || t.servicesSection.title;
  const sectionSubtitle = sec?.subtitle || t.servicesSection.subtitle;

  return (
    <section id="services" className="bg-[#F7F9FB] dark:bg-[#05162B] py-24 transition-colors duration-200">
      <div className="container-x">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="section-title text-[#0B1F36] dark:text-white">{sectionTitle}</h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#657184] dark:text-[#8792A1]">
            {sectionSubtitle}
          </p>
        </FadeIn>

        <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {servicesData.map((s) => (
            <StaggerItem key={s.href}>
              <motion.article
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 240, damping: 20 }}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#E3E7EC] dark:border-white/10 bg-white dark:bg-[#102943] shadow-soft transition-all duration-300 hover:shadow-card-hover"
              >
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-navy-950/10 to-transparent" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-bold text-[#0B1F36] dark:text-white">{s.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#657184] dark:text-[#8792A1]">
                    {s.description}
                  </p>
                  <Link
                    href={s.href}
                    className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#D39D3D] dark:text-[#DCAA4A] transition hover:text-[#DCAA4A]"
                  >
                    <span>{t.servicesSection.learnMore}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function PrepareVisit() {
  const { isUrdu, t } = useLanguage();
  const { homeSections, settings, teamMembers } = useCms();
  const sec = homeSections?.aboutSection;

  if (sec?.enabled === false) return null;

  const badgeText = sec?.badge || t.prepareVisit.badge;
  const titleText = sec?.title || t.prepareVisit.title;
  const descText = sec?.description || t.prepareVisit.description;
  const steps = sec?.steps && sec.steps.length > 0 ? sec.steps : t.prepareVisit.steps;

  const callBtn = sec?.callBtn || {
    text: t.prepareVisit.callNowBtn,
    href: SITE.phoneHref,
    enabled: true,
  };

  const whatsappPhone = settings?.whatsappSettings?.number || settings?.whatsapp || SITE.whatsapp;
  const whatsappMsg = sec?.whatsappBtn?.message || settings?.whatsappSettings?.sectionMessages?.about || "Hello, please send me the required documents checklist for visiting Chamber 121.";
  const whatsappUrl = buildWhatsAppUrl(whatsappPhone, whatsappMsg);

  const officeCard = sec?.officeCard || {
    image: BUILDING_IMG,
    badgeText: isUrdu ? "ساہیوال کچہری • چیمبر 121" : "Sahiwal District Court • Chamber 121",
    title: isUrdu ? "چیمبر نمبر 121، ڈسٹرکٹ کورٹ" : "Chamber No 121, District Court",
    description: t.prepareVisit.officeCardDesc,
    directionsBtnText: t.prepareVisit.getDirectionsBtn,
    callBtnText: t.prepareVisit.callNowBtn,
  };

  return (
    <section id="about" className="bg-white dark:bg-[#091528] py-14 sm:py-20 lg:py-24 transition-colors duration-200 overflow-hidden">
      <div className="container-x grid items-center gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-14">
        <FadeIn direction="right">
          <span className="inline-flex items-center gap-2 rounded border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-red-600 dark:text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            {badgeText}
          </span>
          <h2 className="mt-5 font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
            {titleText}
          </h2>
          <p className="mt-3 sm:mt-4 max-w-xl text-sm leading-relaxed text-navy-800/70 dark:text-slate-300">
            {descText}
          </p>

          <div className="mt-8 sm:mt-10 space-y-4">
            {steps.map((step, idx) => (
              <div key={step.title} className="flex items-start gap-3.5 sm:gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-400/15 text-xs font-bold text-gold-600 dark:text-gold-400">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-navy-900 dark:text-white">{step.title}</h4>
                  <p className="mt-1 text-xs text-navy-800/65 dark:text-slate-400 leading-relaxed">
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-10 flex flex-wrap gap-3.5 sm:gap-4">
            {callBtn.enabled !== false && (
              <a href={callBtn.href || SITE.phoneHref} className="btn-navy w-full sm:w-auto text-center justify-center">
                <Phone className="h-4 w-4" /> {callBtn.text}
              </a>
            )}
            {sec?.whatsappBtn?.enabled !== false && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-bold px-6 py-3 text-xs shadow-md shadow-[#25D366]/25 transition hover:shadow-lg hover:shadow-[#25D366]/35 w-full sm:w-auto"
              >
                <WhatsAppIcon className="h-4 w-4" />
                <span>{sec?.whatsappBtn?.text || t.prepareVisit.requestChecklistBtn}</span>
              </a>
            )}
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.15}>
          <div className="overflow-hidden rounded-2xl border border-navy-900/10 dark:border-white/10 bg-white dark:bg-[#0c1c33] shadow-card">
            {/* Top Building Image Banner */}
            <div className="relative h-56 sm:h-64 lg:h-72 w-full">
              <Image
                src={officeCard.image || BUILDING_IMG}
                alt={officeCard.title || "Ch Composing Chamber 121, District Court Sahiwal"}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/25 to-transparent" />
              
              {/* Location Badge */}
              <div className="absolute top-3.5 left-3.5 rounded-full bg-navy-900/85 dark:bg-black/85 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur border border-white/10 flex items-center gap-1.5 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{officeCard.badgeText}</span>
              </div>

              {/* Bottom Image Overlay Title */}
              <div className="absolute bottom-3.5 left-4 right-4 text-white">
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-gold-400">
                  {isUrdu ? "مرکزی چیمبر کا پتہ" : "Chamber Location"}
                </p>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white drop-shadow-sm leading-tight">
                  {officeCard.title}
                </h3>
              </div>
            </div>

            {/* Card Content & Actions */}
            <div className="p-5 sm:p-6 lg:p-7 space-y-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-400/15 text-gold-500 shadow-sm">
                  <MapPin className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-navy-900 dark:text-white text-base sm:text-lg leading-snug">
                    {t.prepareVisit.officeCardTitle}
                  </h4>
                  <p className="text-xs sm:text-sm font-semibold text-gold-600 dark:text-gold-400 mt-0.5 leading-relaxed">
                    {settings?.address || SITE.address}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed text-navy-800/70 dark:text-slate-300">
                {officeCard.description}
              </p>

              {/* Chamber 121 Leadership & Contacts Box */}
              <div className="rounded-xl border border-navy-900/10 dark:border-white/10 bg-navy-50/70 dark:bg-white/[0.03] p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-navy-900 dark:text-white flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-gold-500" />
                    {isUrdu ? "چیمبر قیادت و رابطہ" : "Chamber Leadership & Contacts"}
                  </span>
                  <span className="text-[10px] font-semibold text-gold-600 dark:text-gold-400 bg-gold-400/10 px-2 py-0.5 rounded">
                    {isUrdu ? "بانی و سربراہان" : "Founder & Owners"}
                  </span>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-3">
                  {(teamMembers && teamMembers.length > 0
                    ? teamMembers.map((m) => {
                        const initials = (m.name || "")
                          .split(" ")
                          .map((w: string) => w[0])
                          .join("")
                          .slice(0, 3)
                          .toUpperCase();
                        return {
                          id: m.id,
                          name: m.name,
                          nameUrdu: m.nameUrdu || m.name,
                          role: m.role,
                          roleUrdu: m.roleUrdu || m.role,
                          status: m.status,
                          badge: m.badge || (m.status === "late" ? "1988–2014" : "Partner"),
                          badgeUrdu: m.badge || (m.status === "late" ? "1988–2014" : "پارٹنر"),
                          image: m.imageUrl || "/images/owners/haji-nazir-ahmad.jpg",
                          initials,
                          bio: m.bio,
                          bioUrdu: m.bioUrdu,
                          phone: m.phone || undefined,
                          phoneHref: m.phone ? `tel:${m.phone.replace(/[^\d+]/g, "")}` : undefined,
                          whatsapp: m.whatsapp || undefined,
                        };
                      })
                    : OWNERS
                  ).map((owner, i) => {
                    const isLate = owner.status === "late";
                    return (
                      <div
                        key={owner.id}
                        className={`rounded-lg border p-2.5 flex flex-col justify-between ${
                          isLate
                            ? "border-amber-400/30 bg-amber-50/50 dark:bg-amber-950/20"
                            : "border-navy-900/8 dark:border-white/10 bg-white dark:bg-[#091528] shadow-xs"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <OwnerAvatar owner={owner} size="sm" />
                            <div className="min-w-0 flex-1">
                              <span
                                className={`text-[8px] font-bold uppercase tracking-wider ${
                                  isLate
                                    ? "text-amber-700 dark:text-amber-300"
                                    : "text-gold-600 dark:text-gold-400"
                                }`}
                              >
                                {isUrdu ? owner.badgeUrdu : owner.badge}
                              </span>
                              <p className="truncate text-[11px] font-bold text-navy-900 dark:text-white">
                                {isUrdu ? owner.nameUrdu : owner.name}
                              </p>
                              <p className="truncate text-[9px] text-navy-600 dark:text-slate-400">
                                {isUrdu ? owner.roleUrdu : owner.role}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 pt-1.5 border-t border-navy-900/5 dark:border-white/10">
                          {owner.phone ? (
                            <div className="flex gap-1">
                              <a
                                href={owner.phoneHref}
                                className={`flex-1 rounded py-1 text-center text-[9px] font-bold transition flex items-center justify-center gap-1 ${
                                  i === 2
                                    ? "bg-gold-500 text-navy-950 hover:bg-gold-400"
                                    : "bg-navy-900 dark:bg-white/10 text-white hover:bg-navy-800"
                                }`}
                              >
                                <Phone className="h-2 w-2" />
                                <span>{isUrdu ? "کال" : "Call"}</span>
                              </a>
                              <a
                                href={buildWhatsAppUrl(owner.whatsapp)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center rounded bg-[#25D366] hover:bg-[#20bd5a] px-2 py-1 text-white text-[9px] font-semibold transition shadow-xs"
                                title={`WhatsApp ${owner.name}`}
                              >
                                <WhatsAppIcon className="h-2.5 w-2.5" />
                              </a>
                            </div>
                          ) : (
                            <p className="text-[9px] italic text-amber-700 dark:text-amber-400 text-center py-0.5">
                              {isUrdu ? "بانی چیمبر 121" : "Late Founder"}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-navy-900/5 dark:border-white/10 flex flex-col sm:flex-row gap-3">
                <a
                  href={settings?.mapsUrl || SITE.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold flex-1 py-3 text-xs text-center flex items-center justify-center gap-2 shadow-sm"
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>{officeCard.directionsBtnText || t.prepareVisit.getDirectionsBtn}</span>
                </a>
                <a
                  href={`tel:${(settings?.phone || SITE.phone).replace(/[^\d+]/g, "")}`}
                  className="btn-outline-navy dark:border-white/20 dark:text-white dark:hover:bg-white/10 flex-1 py-3 text-xs text-center flex items-center justify-center gap-2"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span>{officeCard.callBtnText || t.prepareVisit.callNowBtn}</span>
                </a>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function WhyTrust() {
  const { isUrdu, t } = useLanguage();
  const { homeSections } = useCms();
  const sec = homeSections?.whyTrustSection;

  if (sec?.enabled === false) return null;

  const trustIcons = [ShieldCheck, Zap, Users, Eye];
  const sectionTitle = sec?.title || t.whyTrust.title;
  const metricNumber = sec?.metricNumber || t.whyTrust.yearsMetric;
  const metricLabel = sec?.metricLabel || t.whyTrust.yearsLabel;
  const features = sec?.features && sec.features.length > 0 ? sec.features : t.whyTrust.features;
  const imageSrc = sec?.image || "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=70";

  return (
    <section className="bg-[#f5f7fa] dark:bg-[#071224] py-24 transition-colors duration-200">
      <div className="container-x grid items-center gap-14 lg:grid-cols-2">
        <FadeIn direction="right" className="order-2 lg:order-1">
          <div className="relative">
            <div className="overflow-hidden rounded-2xl bg-gold-100/40 dark:bg-gold-900/20 p-6">
              <div className="relative h-64 sm:h-80 w-full">
                <Image
                  src={imageSrc}
                  alt="Legal agreement handshake"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="rounded-xl object-cover shadow-card"
                />
              </div>
            </div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -right-4 -top-4 rounded-xl bg-navy-900 border border-gold-400/30 px-6 py-5 text-center shadow-card-hover transform-gpu will-change-transform"
            >
              <p className="font-serif text-2xl font-bold text-gold-400">{metricNumber}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                {metricLabel}
              </p>
            </motion.div>
          </div>
        </FadeIn>

        <FadeIn direction="left" delay={0.1} className="order-1 lg:order-2">
          <h2 className="section-title text-navy-900 dark:text-white">{sectionTitle}</h2>
          <div className="mt-10 grid gap-x-8 gap-y-9 sm:grid-cols-2">
            {features.map((f, i) => {
              const Icon = trustIcons[i % trustIcons.length] || ShieldCheck;
              return (
                <FadeIn key={f.title} delay={i * 0.08}>
                  <div className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gold-400/15 text-gold-500">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-navy-900 dark:text-white">
                        {f.title}
                      </h4>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-navy-800/65 dark:text-slate-300">
                        {f.text}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const { isUrdu } = useLanguage();
  const { homeSections, testimonials } = useCms();
  const sec = homeSections?.testimonialsSection;

  if (sec?.enabled === false) return null;
  const items = testimonials && testimonials.length > 0
    ? testimonials.map((t) => ({
        id: t.id,
        clientName: t.clientName,
        clientRole: t.clientTitle,
        text: t.comment,
        rating: t.rating,
        visible: true,
      }))
    : (sec?.items?.filter((i) => i.visible !== false) || []);
  if (items.length === 0) return null;

  return (
    <section id="testimonials" className="bg-[#f5f7fa] dark:bg-[#071224] py-20 transition-colors duration-200">
      <div className="container-x">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">
            <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
            {isUrdu ? "کلائنٹ کے تاثرات" : "Client Testimonials"}
          </span>
          <h2 className="section-title text-navy-900 dark:text-white mt-4">
            {sec?.title || (isUrdu ? "ہمارے معزز سائلین و کلائنٹس کے تاثرات" : "What Our Clients Say")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-navy-800/60 dark:text-slate-300">
            {sec?.subtitle || (isUrdu ? "ڈسٹرکٹ کورٹ ساہیوال میں ہمارے مشورے اور خدمات پر سائلین کا اعتماد" : "Real feedback from individuals and business owners supported by Chamber 121.")}
          </p>
        </FadeIn>

        <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <StaggerItem key={item.id}>
              <div className="flex h-full flex-col justify-between rounded-xl border border-navy-900/8 dark:border-white/10 bg-white dark:bg-[#0c1c33] p-6 shadow-soft transition-shadow hover:shadow-card-hover">
                <div>
                  <div className="flex items-center gap-1 text-gold-400 mb-3">
                    {Array.from({ length: item.rating || 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-gold-400 text-gold-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-navy-800/80 dark:text-slate-200 italic">
                    "{item.text}"
                  </p>
                </div>
                <div className="mt-6 border-t border-navy-900/6 dark:border-white/10 pt-4">
                  <h4 className="font-bold text-navy-900 dark:text-white text-sm">{item.clientName}</h4>
                  <p className="text-xs text-navy-800/60 dark:text-slate-400 mt-0.5">{item.clientRole}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function FaqSection() {
  const { isUrdu } = useLanguage();
  const { homeSections, faqs } = useCms();
  const [openId, setOpenId] = React.useState<string | null>("faq-1");
  const sec = homeSections?.faqSection;

  if (sec?.enabled === false) return null;
  const items = faqs && faqs.length > 0
    ? faqs
        .filter((f) => f.isPublished)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((f) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
          order: f.displayOrder,
          visible: true,
        }))
    : (sec?.items?.filter((i) => i.visible !== false) || []).sort((a, b) => a.order - b.order);
  if (items.length === 0) return null;

  return (
    <section id="faq" className="bg-white dark:bg-[#091528] py-20 transition-colors duration-200">
      <div className="container-x max-w-4xl">
        <FadeIn className="text-center">
          <span className="eyebrow">
            <HelpCircle className="h-3.5 w-3.5 text-gold-400" />
            {isUrdu ? "عمومی سوالات" : "Common Inquiries"}
          </span>
          <h2 className="section-title text-navy-900 dark:text-white mt-4">
            {sec?.title || (isUrdu ? "اکثر پوچھے جانے والے سوالات" : "Frequently Asked Questions")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-navy-800/60 dark:text-slate-300">
            {sec?.subtitle || (isUrdu ? "ای سٹامپ، ٹیکس ریٹرن، اور کچہری امور کے بارے میں ضروری معلومات" : "Quick answers regarding E-Stamping, FBR tax filings, and visiting Chamber 121.")}
          </p>
        </FadeIn>

        <div className="mt-12 space-y-3.5">
          {items.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-xl border border-navy-900/10 dark:border-white/10 bg-navy-50/40 dark:bg-white/[0.03] overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="w-full flex items-center justify-between p-5 text-left transition hover:bg-navy-50/80 dark:hover:bg-white/[0.05]"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-navy-900 dark:text-white text-sm sm:text-base pr-4">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-gold-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm leading-relaxed text-navy-800/75 dark:text-slate-300 border-t border-navy-900/5 dark:border-white/5">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  const { isUrdu, t } = useLanguage();
  const { homeSections, settings } = useCms();
  const sec = homeSections?.finalCtaSection;

  if (sec?.enabled === false) return null;

  const phone = settings?.phone || SITE.phone;
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`;
  const whatsappPhone = settings?.whatsappSettings?.number || settings?.whatsapp || SITE.whatsapp;
  const whatsappMsg = settings?.whatsappSettings?.sectionMessages?.finalCta || "Hello, I need urgent legal/tax consultation from Chamber 121.";
  const whatsappHref = buildWhatsAppUrl(whatsappPhone, whatsappMsg);

  const cards = [
    {
      icon: Phone,
      title: sec?.callCardTitle || t.finalCta.callSupport,
      value: phone,
      href: phoneHref,
      isWhatsApp: false,
    },
    {
      icon: WhatsAppIcon,
      title: sec?.whatsappCardTitle || t.finalCta.whatsappDirect,
      value: whatsappPhone,
      href: whatsappHref,
      isWhatsApp: true,
    },
    {
      icon: Clock,
      title: sec?.hoursCardTitle || t.finalCta.visitHours,
      value: t.finalCta.hoursVal,
      href: "#office",
      isWhatsApp: false,
    },
  ];

  const sectionTitle = sec?.title || t.finalCta.title;
  const sectionDesc = sec?.description || t.finalCta.description;
  const visitOfficeBtn = sec?.visitOfficeBtn || {
    text: t.finalCta.visitOfficeBtn,
    href: "#office",
    enabled: true,
  };

  return (
    <section id="contact" className="relative overflow-hidden bg-navy-900 py-24 texture-grid">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(200,151,61,0.18)_0%,_transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(30,64,115,0.3)_0%,_transparent_70%)]" />

      <div className="container-x relative">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
            {sectionTitle}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            {sectionDesc}
          </p>
        </FadeIn>

        <Stagger className="mt-12 grid gap-5 md:grid-cols-3">
          {cards.map((c) => (
            <StaggerItem key={c.title}>
              <motion.a
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                whileHover={{ y: -6 }}
                className={`flex flex-col items-center rounded-lg border p-8 text-center backdrop-blur transition ${
                  c.isWhatsApp
                    ? "border-[#25D366]/30 bg-[#25D366]/[0.08] hover:border-[#25D366]/60 hover:bg-[#25D366]/[0.15]"
                    : "border-white/10 bg-white/[0.05] hover:border-gold-400/40 hover:bg-white/[0.08]"
                }`}
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    c.isWhatsApp
                      ? "bg-[#25D366] text-white shadow-md shadow-[#25D366]/30"
                      : "bg-gold-400/15 text-gold-400"
                  }`}
                >
                  <c.icon className="h-6 w-6" />
                </span>
                <h4 className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
                  {c.title}
                </h4>
                <p className="mt-2 text-sm font-semibold text-white">{c.value}</p>
              </motion.a>
            </StaggerItem>
          ))}
        </Stagger>

        {sec?.consultationFormEnabled !== false && (
          <FadeIn delay={0.2} className="mt-14 max-w-2xl mx-auto">
            <ConsultationForm />
          </FadeIn>
        )}

        {visitOfficeBtn.enabled !== false && (
          <FadeIn delay={0.3} className="mt-10 text-center">
            <Link href={visitOfficeBtn.href || "#office"} className="btn-gold px-10 py-4 text-sm">
              <MapPin className="h-4 w-4" /> {visitOfficeBtn.text}
            </Link>
          </FadeIn>
        )}
      </div>
    </section>
  );
}

export default function HomePageClient({ initialCms }: { initialCms?: any }) {
  const { homeSections } = useCms(initialCms);

  const order = homeSections?.sectionOrder || [
    "hero",
    "services",
    "reminders",
    "testimonials",
    "faq",
    "office",
    "finalCta",
  ];

  const sectionMap: Record<string, React.ReactNode> = {
    hero: <Hero key="hero" />,
    services: <ServicesGrid key="services" />,
    about: <PrepareVisit key="about" />,
    whyTrust: <WhyTrust key="whyTrust" />,
    reminders: <TaxReminderSection key="reminders" />,
    testimonials: <TestimonialsSection key="testimonials" />,
    faq: <FaqSection key="faq" />,
    office: (
      <OfficeSection
        key="office"
        title={homeSections?.officeSection?.title}
        text={homeSections?.officeSection?.subtitle}
        addressText={homeSections?.officeSection?.addressText}
        weekdayHours={homeSections?.officeSection?.weekdayHours}
        saturdayHours={homeSections?.officeSection?.saturdayHours}
        guideTitle={homeSections?.officeSection?.guideTitle}
        guidePoints={homeSections?.officeSection?.guidePoints}
        whatsappBtnText={homeSections?.officeSection?.whatsappBtnText}
        callBtnText={homeSections?.officeSection?.callBtnText}
      />
    ),
    finalCta: <FinalCta key="finalCta" />,
  };

  return (
    <>
      {order.map((key) => sectionMap[key] || null)}
    </>
  );
}
