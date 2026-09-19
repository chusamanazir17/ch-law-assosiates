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

const BUILDING_IMG =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=640&q=70";

function Hero() {
  const { isUrdu, t } = useLanguage();
  const { getPageContent, settings, homeSections } = useCms();
  const homeCms = getPageContent("/");
  const heroSec = homeSections?.hero;

  const eyebrowText = heroSec?.badge || (isUrdu ? t.hero.eyebrow : homeCms?.heroBadge || t.hero.eyebrow);
  const heroTitle = heroSec?.headline || (homeCms?.heroHeadline || (isUrdu ? t.hero.titlePart1 : "Premier Legal Documentation & Chamber Services"));
  const heroHighlight = heroSec?.highlight || t.hero.countryHighlight;
  const heroDescription = heroSec?.subtitle || (homeCms?.heroSubtitle || (isUrdu ? t.hero.description : "Providing reliable E-Stamping, property registry, and business registration solutions with absolute transparency and professional excellence."));

  const primaryBtn = heroSec?.primaryBtn || {
    text: isUrdu ? t.hero.visitOfficeBtn : (homeCms?.primaryCtaText || t.hero.visitOfficeBtn),
    href: homeCms?.primaryCtaHref || "#office",
    enabled: true,
  };

  const secondaryBtn = heroSec?.secondaryBtn || {
    text: isUrdu ? t.hero.whatsappBtn : "Chat on WhatsApp",
    message: settings?.whatsappSettings?.sectionMessages?.hero || "",
    enabled: true,
  };

  const whatsappPhone = settings?.whatsappSettings?.number || settings?.whatsapp || SITE.whatsapp;
  const whatsappUrl = buildWhatsAppUrl(whatsappPhone, secondaryBtn.message);

  const trustBadges = (heroSec?.trustBadges || [
    { id: "1", label: t.hero.govVerified, enabled: true },
    { id: "2", label: t.hero.sameDay, enabled: true },
    { id: "3", label: t.hero.confidential, enabled: true },
  ]).filter((b) => b.enabled !== false);

  const trustIcons = [FileCheck2, CalendarCheck, ShieldCheck];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#050f1f] via-[#081730] to-[#061226] text-white">
      {/* Ambient background styling */}
      <div className="pointer-events-none absolute inset-0 texture-grid opacity-35" />
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gold-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-navy-600/20 blur-[140px]" />

      <motion.div className="container-x relative z-10 pt-24 pb-14 sm:pt-28 sm:pb-18 lg:pt-32 lg:pb-24">
        <motion.span
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="eyebrow"
          suppressHydrationWarning
        >
          <BadgeCheck className="h-3.5 w-3.5" />
          {eyebrowText}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.12 }}
          className="mt-6 max-w-3xl font-serif text-3xl font-bold leading-[1.14] text-white sm:text-5xl lg:text-6xl"
        >
          {heroTitle}{" "}
          {heroHighlight && (
            <span className="relative whitespace-nowrap text-gold-400">
              {heroHighlight}
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="absolute -bottom-1 left-0 h-[3px] w-full origin-left rounded bg-gold-400/70"
              />
            </span>
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.24 }}
          className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg"
        >
          {heroDescription}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.36 }}
          className="mt-8 sm:mt-10 flex flex-wrap gap-4"
        >
          {primaryBtn.enabled !== false && (
            <Link href={primaryBtn.href || "#office"} className="btn-gold px-8 py-3.5 text-sm">
              <MapPin className="h-4 w-4" /> {primaryBtn.text}
            </Link>
          )}

          {secondaryBtn.enabled !== false && (
            <OfficialWhatsAppButton
              href={whatsappUrl}
              label={secondaryBtn.text}
              size="lg"
            />
          )}
        </motion.div>

        {/* trust strip */}
        {trustBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="mt-12 sm:mt-16 flex flex-wrap gap-x-10 gap-y-4 text-white/70"
          >
            {trustBadges.map((s, idx) => {
              const Icon = trustIcons[idx % trustIcons.length];
              return (
                <span key={s.id || s.label} className="flex items-center gap-2.5 text-xs font-medium uppercase tracking-wider">
                  <Icon className="h-4 w-4 text-gold-400" />
                  {s.label}
                </span>
              );
            })}
          </motion.div>
        )}
      </motion.div>

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
    <section id="services" className="bg-[#f5f7fa] dark:bg-[#071224] py-24 transition-colors duration-200">
      <div className="container-x">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="section-title text-navy-900 dark:text-white">{sectionTitle}</h2>
          <p className="mt-4 text-sm leading-relaxed text-navy-800/60 dark:text-slate-300">
            {sectionSubtitle}
          </p>
        </FadeIn>

        <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {servicesData.map((s) => (
            <StaggerItem key={s.href}>
              <motion.article
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 240, damping: 20 }}
                className="group flex h-full flex-col overflow-hidden rounded-lg border border-navy-900/5 dark:border-white/10 bg-white dark:bg-[#0c1c33] shadow-soft transition-shadow hover:shadow-card-hover"
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
                  <h3 className="text-lg font-bold text-navy-900 dark:text-white">{s.title}</h3>
                  <p className="mt-2 flex-1 text-[13px] leading-relaxed text-navy-800/65 dark:text-slate-300">
                    {s.description}
                  </p>
                  <Link
                    href={s.href}
                    className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-gold-600 dark:text-gold-400 transition hover:text-gold-700"
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
  const { homeSections, settings } = useCms();
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

              {/* Direct Advisor Contacts Box */}
              <div className="rounded-xl border border-navy-900/10 dark:border-white/10 bg-navy-50/70 dark:bg-white/[0.03] p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-navy-900 dark:text-white flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-gold-500" />
                    {isUrdu ? "براہ راست رابطہ برائے رہنمائی" : "Direct Advisor Contacts"}
                  </span>
                  <span className="text-[10px] font-semibold text-gold-600 dark:text-gold-400 bg-gold-400/10 px-2 py-0.5 rounded">
                    {isUrdu ? "فوری رابطہ" : "Fast Response"}
                  </span>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {(settings?.contacts || [
                    { name: "Haji Nazir Ahmad", nameUrdu: "حاجی نذیر احمد", role: "Senior Consultant", roleUrdu: "سینئر مشیر", phone: "0301-6922573", whatsapp: "0301-6922573" },
                    { name: "Usama Nazir Ch", nameUrdu: "اسامہ نذیر چوہدری", role: "E-Stamp & Tax Advisor", roleUrdu: "ای سٹامپ و ٹیکس ایڈوائزر", phone: "0305-7902744", whatsapp: "0305-7902744" }
                  ]).map((contact, i) => (
                    <div key={contact.name} className="rounded-lg border border-navy-900/8 dark:border-white/10 bg-white dark:bg-[#091528] p-3 shadow-xs">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
                        {isUrdu && contact.roleUrdu ? contact.roleUrdu : contact.role}
                      </span>
                      <p className="mt-0.5 text-xs font-bold text-navy-900 dark:text-white">
                        {isUrdu && contact.nameUrdu ? contact.nameUrdu : contact.name}
                      </p>
                      <p className="text-[11px] font-mono font-bold text-navy-800 dark:text-slate-200 mt-0.5">
                        {contact.phone}
                      </p>
                      <div className="mt-2 flex gap-1.5">
                        <a
                          href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
                          className={`flex-1 rounded py-1.5 text-center text-[10px] font-bold transition flex items-center justify-center gap-1 ${
                            i === 1 ? "bg-gold-500 text-navy-950 hover:bg-gold-400" : "bg-navy-900 dark:bg-white/10 text-white hover:bg-navy-800"
                          }`}
                        >
                          <Phone className="h-2.5 w-2.5" />
                          <span>{isUrdu ? "کال کریں" : "Call"}</span>
                        </a>
                        <a
                          href={buildWhatsAppUrl(contact.whatsapp || contact.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center rounded bg-[#25D366] hover:bg-[#20bd5a] px-2.5 py-1.5 text-white text-[10px] font-semibold transition shadow-sm"
                          title={`WhatsApp ${contact.name}`}
                        >
                          <WhatsAppIcon className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
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
  const { homeSections } = useCms();
  const sec = homeSections?.testimonialsSection;

  if (sec?.enabled === false) return null;
  const items = sec?.items?.filter((i) => i.visible !== false) || [];
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
  const { homeSections } = useCms();
  const [openId, setOpenId] = React.useState<string | null>("faq-1");
  const sec = homeSections?.faqSection;

  if (sec?.enabled === false) return null;
  const items = (sec?.items?.filter((i) => i.visible !== false) || []).sort((a, b) => a.order - b.order);
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

  const order = (homeSections?.sectionOrder || [
    "hero",
    "services",
    "about",
    "whyTrust",
    "reminders",
    "office",
    "finalCta",
  ]).filter((key) => key !== "testimonials" && key !== "faq");

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
