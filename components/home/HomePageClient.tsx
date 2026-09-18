"use client";

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
} from "lucide-react";
import { HOME_SERVICES, HERO_IMAGES, SITE } from "@/lib/site";
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
  const { getPageContent, settings } = useCms();
  const homeCms = getPageContent("/");

  const heroImage = homeCms?.heroImage || HERO_IMAGES.home;
  const eyebrowText = homeCms?.heroBadge || t.hero.eyebrow;
  const heroDescription = homeCms?.heroSubtitle || t.hero.description;
  const visitOfficeText = homeCms?.primaryCtaText || t.hero.visitOfficeBtn;
  const visitOfficeUrl = homeCms?.primaryCtaHref || "#office";

  return (
    <section className="relative overflow-hidden bg-[#061226] text-white">
      {/* Full width hero background image */}
      <div className="absolute inset-0 w-full h-full overflow-hidden will-change-transform transform-gpu">
        <Image
          src={heroImage}
          alt="Ch Composing Estamp and Tax Advisor office in Pakistan"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 hero-overlay texture-grid" />
      </div>

      <motion.div className="container-x relative z-10 pt-24 pb-14 sm:pt-28 sm:pb-18 lg:pt-32 lg:pb-24">
        <motion.span
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="eyebrow"
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
          {homeCms?.heroHeadline ? (
            homeCms.heroHeadline
          ) : (
            <>
              {t.hero.titlePart1}{" "}
              <span className="relative whitespace-nowrap text-gold-400">
                {t.hero.countryHighlight}
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                  className="absolute -bottom-1 left-0 h-[3px] w-full origin-left rounded bg-gold-400/70"
                />
              </span>
            </>
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
          <Link href={visitOfficeUrl} className="btn-gold px-8 py-3.5 text-sm">
            <MapPin className="h-4 w-4" /> {visitOfficeText}
          </Link>
          <OfficialWhatsAppButton
            href={settings?.whatsapp ? `https://wa.me/92${settings.whatsapp.replace(/^0|[^\d]/g, "")}` : SITE.whatsappHref}
            label={t.hero.whatsappBtn}
            size="lg"
          />
        </motion.div>

        {/* trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-12 sm:mt-16 flex flex-wrap gap-x-10 gap-y-4 text-white/70"
        >
          {[
            { icon: FileCheck2, label: t.hero.govVerified },
            { icon: CalendarCheck, label: t.hero.sameDay },
            { icon: ShieldCheck, label: t.hero.confidential },
          ].map((s) => (
            <span key={s.label} className="flex items-center gap-2.5 text-xs font-medium uppercase tracking-wider">
              <s.icon className="h-4 w-4 text-gold-400" />
              {s.label}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom fade for smooth transition to services section */}
      <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#f5f7fa] dark:from-[#071224] to-transparent pointer-events-none" />
    </section>
  );
}

function ServicesGrid() {
  const { isUrdu, t } = useLanguage();
  const { services } = useCms();

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
          title: isUrdu && s.nameUrdu ? s.nameUrdu : s.name,
          href: `/services/${s.slug}`,
          image: s.heroImage || HOME_SERVICES[idx % HOME_SERVICES.length]?.image || HOME_SERVICES[0].image,
          description: s.description,
        }))
      : defaultServicesData;

  return (
    <section id="services" className="bg-[#f5f7fa] dark:bg-[#071224] py-24 transition-colors duration-200">
      <div className="container-x">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="section-title text-navy-900 dark:text-white">{t.servicesSection.title}</h2>
          <p className="mt-4 text-sm leading-relaxed text-navy-800/60 dark:text-slate-300">
            {t.servicesSection.subtitle}
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
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
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

  return (
    <section id="about" className="bg-white dark:bg-[#091528] py-14 sm:py-20 lg:py-24 transition-colors duration-200 overflow-hidden">
      <div className="container-x grid items-center gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-14">
        <FadeIn direction="right">
          <span className="inline-flex items-center gap-2 rounded border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-red-600 dark:text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            {t.prepareVisit.badge}
          </span>
          <h2 className="mt-5 font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
            {t.prepareVisit.title}
          </h2>
          <p className="mt-3 sm:mt-4 max-w-xl text-sm leading-relaxed text-navy-800/70 dark:text-slate-300">
            {t.prepareVisit.description}
          </p>

          <div className="mt-8 sm:mt-10 space-y-4">
            {t.prepareVisit.steps.map((step, idx) => (
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
            <a href={SITE.phoneHref} className="btn-navy w-full sm:w-auto text-center justify-center">
              <Phone className="h-4 w-4" /> {t.prepareVisit.callNowBtn}
            </a>
            <a
              href={SITE.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-navy dark:border-white/20 dark:text-white dark:hover:bg-white/10 w-full sm:w-auto text-center justify-center inline-flex items-center gap-2"
            >
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
              <span>{t.prepareVisit.requestChecklistBtn}</span>
            </a>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.15}>
          <div className="overflow-hidden rounded-2xl border border-navy-900/10 dark:border-white/10 bg-white dark:bg-[#0c1c33] shadow-card">
            {/* Top Building Image Banner */}
            <div className="relative h-56 sm:h-64 lg:h-72 w-full">
              <Image
                src={BUILDING_IMG}
                alt="Ch Composing Chamber 121, District Court Sahiwal"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/25 to-transparent" />
              
              {/* Location Badge */}
              <div className="absolute top-3.5 left-3.5 rtl:left-auto rtl:right-3.5 rounded-full bg-navy-900/85 dark:bg-black/85 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur border border-white/10 flex items-center gap-1.5 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{isUrdu ? "ساہیوال کچہری • چیمبر 121" : "Sahiwal District Court • Chamber 121"}</span>
              </div>

              {/* Bottom Image Overlay Title */}
              <div className="absolute bottom-3.5 left-4 right-4 rtl:left-auto rtl:right-4 text-white">
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-gold-400">
                  {isUrdu ? "مرکزی چیمبر کا پتہ" : "Chamber Location"}
                </p>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white drop-shadow-sm leading-tight">
                  {isUrdu ? "چیمبر نمبر 121، ڈسٹرکٹ کورٹ" : "Chamber No 121, District Court"}
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
                    {SITE.address}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed text-navy-800/70 dark:text-slate-300">
                {t.prepareVisit.officeCardDesc}
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
                  {/* Haji Nazir Ahmad */}
                  <div className="rounded-lg border border-navy-900/8 dark:border-white/10 bg-white dark:bg-[#091528] p-3 shadow-xs">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
                      {isUrdu ? "سینئر مشیر" : "Senior Consultant"}
                    </span>
                    <p className="mt-0.5 text-xs font-bold text-navy-900 dark:text-white">
                      {isUrdu ? "حاجی نذیر احمد" : "Haji Nazir Ahmad"}
                    </p>
                    <p className="text-[11px] font-mono font-bold text-navy-800 dark:text-slate-200 mt-0.5">
                      0301-6922573
                    </p>
                    <div className="mt-2 flex gap-1.5">
                      <a
                        href="tel:+923016922573"
                        className="flex-1 rounded bg-navy-900 dark:bg-white/10 py-1.5 text-center text-[10px] font-bold text-white hover:bg-navy-800 transition flex items-center justify-center gap-1"
                      >
                        <Phone className="h-2.5 w-2.5 text-gold-400" />
                        <span>Call</span>
                      </a>
                      <a
                        href="https://wa.me/923016922573"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center rounded bg-[#25D366] hover:bg-[#20bd5a] px-2.5 py-1.5 text-white text-[10px] font-semibold transition shadow-sm"
                        title="WhatsApp Haji Nazir Ahmad"
                      >
                        <WhatsAppIcon className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Usama Nazir Ch */}
                  <div className="rounded-lg border border-navy-900/8 dark:border-white/10 bg-white dark:bg-[#091528] p-3 shadow-xs">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
                      {isUrdu ? "ای سٹامپ و ٹیکس ایڈوائزر" : "E-Stamp & Tax Advisor"}
                    </span>
                    <p className="mt-0.5 text-xs font-bold text-navy-900 dark:text-white">
                      {isUrdu ? "اسامہ نذیر چوہدری" : "Usama Nazir Ch"}
                    </p>
                    <p className="text-[11px] font-mono font-bold text-navy-800 dark:text-slate-200 mt-0.5">
                      0305-7902744
                    </p>
                    <div className="mt-2 flex gap-1.5">
                      <a
                        href="tel:+923057902744"
                        className="flex-1 rounded bg-gold-500 py-1.5 text-center text-[10px] font-bold text-navy-950 hover:bg-gold-400 transition flex items-center justify-center gap-1"
                      >
                        <Phone className="h-2.5 w-2.5" />
                        <span>Call</span>
                      </a>
                      <a
                        href="https://wa.me/923057902744"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center rounded bg-[#25D366] hover:bg-[#20bd5a] px-2.5 py-1.5 text-white text-[10px] font-semibold transition shadow-sm"
                        title="WhatsApp Usama Nazir Ch"
                      >
                        <WhatsAppIcon className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-navy-900/5 dark:border-white/10 flex flex-col sm:flex-row gap-3">
                <a
                  href={SITE.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold flex-1 py-3 text-xs text-center flex items-center justify-center gap-2 shadow-sm"
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>{t.prepareVisit.getDirectionsBtn}</span>
                </a>
                <a
                  href={SITE.phoneHref}
                  className="btn-outline-navy dark:border-white/20 dark:text-white dark:hover:bg-white/10 flex-1 py-3 text-xs text-center flex items-center justify-center gap-2"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span>{t.prepareVisit.callNowBtn}</span>
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

  const trustIcons = [ShieldCheck, Zap, Users, Eye];

  return (
    <section className="bg-[#f5f7fa] dark:bg-[#071224] py-24 transition-colors duration-200">
      <div className="container-x grid items-center gap-14 lg:grid-cols-2">
        <FadeIn direction="right" className="order-2 lg:order-1">
          <div className="relative">
            <div className="overflow-hidden rounded-2xl bg-gold-100/40 dark:bg-gold-900/20 p-6">
              <div className="relative h-64 sm:h-80 w-full">
                <Image
                  src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=70"
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
              <p className="font-serif text-2xl font-bold text-gold-400">{t.whyTrust.yearsMetric}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                {t.whyTrust.yearsLabel}
              </p>
            </motion.div>
          </div>
        </FadeIn>

        <FadeIn direction="left" delay={0.1} className="order-1 lg:order-2">
          <h2 className="section-title text-navy-900 dark:text-white">{t.whyTrust.title}</h2>
          <div className="mt-10 grid gap-x-8 gap-y-9 sm:grid-cols-2">
            {t.whyTrust.features.map((f, i) => {
              const Icon = trustIcons[i] || ShieldCheck;
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

function FinalCta() {
  const { isUrdu, t } = useLanguage();

  const cards = [
    { icon: Phone, title: t.finalCta.callSupport, value: SITE.phone, href: SITE.phoneHref, isWhatsApp: false },
    { icon: WhatsAppIcon, title: t.finalCta.whatsappDirect, value: SITE.whatsapp, href: SITE.whatsappHref, isWhatsApp: true },
    { icon: Clock, title: t.finalCta.visitHours, value: t.finalCta.hoursVal, href: "#office", isWhatsApp: false },
  ];

  return (
    <section id="contact" className="relative overflow-hidden bg-navy-900 py-24 texture-grid">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(200,151,61,0.18)_0%,_transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(30,64,115,0.3)_0%,_transparent_70%)]" />

      <div className="container-x relative">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
            {t.finalCta.title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            {t.finalCta.description}
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
                      ? "bg-[#25D366]/20 text-[#25D366]"
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

        <FadeIn delay={0.2} className="mt-14 max-w-2xl mx-auto">
          <ConsultationForm />
        </FadeIn>

        <FadeIn delay={0.3} className="mt-10 text-center">
          <Link href="#office" className="btn-gold px-10 py-4 text-sm">
            <MapPin className="h-4 w-4" /> {t.finalCta.visitOfficeBtn}
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}

export default function HomePageClient() {
  return (
    <>
      <Hero />
      <ServicesGrid />
      <PrepareVisit />
      <WhyTrust />
      <TaxReminderSection />
      <OfficeSection />
      <FinalCta />
    </>
  );
}
