"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  MapPin,
  MessageCircle,
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
import { useLanguage } from "@/lib/LanguageContext";

const BUILDING_IMG =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80";

function Hero() {
  const { isUrdu, t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.25]);

  return (
    <section ref={ref} className="relative flex min-h-[92vh] items-center overflow-hidden">
      <motion.div
        style={{ y }}
        className="absolute inset-0 scale-110 bg-cover bg-center"
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ duration: 9, ease: "easeOut" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGES.home}
          alt="Legal documentation office in Pakistan"
          className="h-full w-full object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 hero-overlay texture-grid" />

      <motion.div style={{ opacity }} className="container-x relative z-10 py-28">
        <motion.span
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="eyebrow"
        >
          <BadgeCheck className="h-3.5 w-3.5" />
          {t.hero.eyebrow}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.12 }}
          className="mt-6 max-w-3xl font-serif text-4xl font-bold leading-[1.12] text-white sm:text-5xl lg:text-6xl"
        >
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
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.24 }}
          className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg"
        >
          {t.hero.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.36 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Link href="#office" className="btn-gold px-8 py-3.5 text-sm">
            <MapPin className="h-4 w-4" /> {t.hero.visitOfficeBtn}
          </Link>
          <a
            href={SITE.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-light px-8 py-3.5 text-sm"
          >
            <MessageCircle className="h-4 w-4" /> {t.hero.whatsappBtn}
          </a>
        </motion.div>

        {/* trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-16 flex flex-wrap gap-x-10 gap-y-4 text-white/70"
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

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="flex h-10 w-6 items-start justify-center rounded-full border border-white/40 p-1.5"
        >
          <span className="h-2 w-1 rounded-full bg-gold-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function ServicesGrid() {
  const { isUrdu, t } = useLanguage();

  const servicesData = [
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.image}
                    alt={s.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
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
    <section id="about" className="bg-white dark:bg-[#091528] py-24 transition-colors duration-200">
      <div className="container-x grid items-center gap-14 lg:grid-cols-2">
        <FadeIn direction="right">
          <span className="inline-flex items-center gap-2 rounded border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-red-600 dark:text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            {t.prepareVisit.badge}
          </span>
          <h2 className="mt-5 font-serif text-3xl font-bold text-navy-900 dark:text-white">
            {t.prepareVisit.title}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-navy-800/70 dark:text-slate-300">
            {t.prepareVisit.description}
          </p>

          <div className="mt-10 space-y-4">
            {t.prepareVisit.steps.map((step, idx) => (
              <div key={step.title} className="flex items-start gap-4">
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

          <div className="mt-10 flex flex-wrap gap-4">
            <a href={SITE.phoneHref} className="btn-navy">
              <Phone className="h-4 w-4" /> {t.prepareVisit.callNowBtn}
            </a>
            <a
              href={SITE.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-navy dark:border-white/20 dark:text-white dark:hover:bg-white/10"
            >
              {t.prepareVisit.requestChecklistBtn}
            </a>
          </div>
        </FadeIn>

        <FadeIn direction="left" delay={0.15}>
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden rounded-lg shadow-card border border-navy-900/5 dark:border-white/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={BUILDING_IMG}
                alt="LegalAssist main office location in Blue Area Islamabad"
                className="h-80 w-full object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="absolute -bottom-10 left-1/2 w-[88%] -translate-x-1/2 rounded-lg border border-navy-900/5 dark:border-white/10 bg-white dark:bg-[#0c1c33] p-6 shadow-card-hover text-navy-900 dark:text-white"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-400/15 text-gold-500">
                  <MapPin className="h-5 w-5" />
                </span>
                <h4 className="font-bold text-navy-900 dark:text-white">
                  {t.prepareVisit.officeCardTitle}
                </h4>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-navy-800/65 dark:text-slate-300">
                {t.prepareVisit.officeCardDesc}
              </p>
              <a
                href={SITE.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold mt-4 w-full py-2.5 text-xs text-center flex items-center justify-center gap-2"
              >
                <MapPin className="h-3.5 w-3.5" /> {t.prepareVisit.getDirectionsBtn}
              </a>
            </motion.div>
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=80"
                alt="Legal agreement handshake"
                className="w-full rounded-xl object-cover shadow-card"
              />
            </div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -right-4 -top-4 rounded-xl bg-navy-900 border border-gold-400/30 px-6 py-5 text-center shadow-card-hover"
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
    { icon: Phone, title: t.finalCta.callSupport, value: SITE.phone, href: SITE.phoneHref },
    { icon: MessageCircle, title: t.finalCta.whatsappDirect, value: SITE.whatsapp, href: SITE.whatsappHref },
    { icon: Clock, title: t.finalCta.visitHours, value: t.finalCta.hoursVal, href: "#office" },
  ];

  return (
    <section id="contact" className="relative overflow-hidden bg-navy-900 py-24 texture-grid">
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-navy-500/20 blur-3xl" />

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
                className="flex flex-col items-center rounded-lg border border-white/10 bg-white/[0.05] p-8 text-center backdrop-blur transition hover:border-gold-400/40 hover:bg-white/[0.08]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-400/15 text-gold-400">
                  <c.icon className="h-5 w-5" />
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

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesGrid />
      <PrepareVisit />
      <WhyTrust />
      <FinalCta />
      <OfficeSection />
    </>
  );
}
