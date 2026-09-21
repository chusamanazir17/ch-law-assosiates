"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  ThumbsUp,
  Phone,
  MapPin,
  Sparkles,
  Heart,
  ExternalLink,
  BadgeCheck,
  Calendar,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/providers/LanguageProvider";
import { useAppTheme } from "@/providers/ThemeProvider";
import { SITE, buildWhatsAppUrl } from "@/lib/site";
import { OWNERS } from "@/lib/owners";
import { OwnerAvatar } from "@/components/ui/OwnerAvatar";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import FadeIn from "@/components/motion/FadeIn";
import Stagger, { StaggerItem } from "@/components/motion/Stagger";
import { useCms } from "@/lib/hooks/useCms";

export default function AboutPageClient() {
  const { isUrdu } = useLanguage();
  const { isDark } = useAppTheme();
  const { getPageContent, settings } = useCms();
  const aboutCms = getPageContent("/about");

  const lateFounder = OWNERS.find((o) => o.status === "late") || OWNERS[0];
  const currentOwners = OWNERS.filter((o) => o.status === "current");

  const heroBadge = isUrdu
    ? "ہماری تاریخ اور عزم • چیمبر 121"
    : (aboutCms?.heroBadge || "OUR STORY. A STRONGER TOMORROW.");

  const heroHeadline = isUrdu
    ? "ہمارے چیمبر کے بارے میں"
    : (aboutCms?.heroHeadline || "About Our Legal Chamber");

  const heroDescription = isUrdu
    ? "چوہدری کمپوزنگ، ای اسٹامپ و ٹیکس ایڈوائزر ساہیوال کی معزز اور مستند قانونی فرم ہے۔ ہم ای اسٹیمپنگ، رجسٹری بیعنامہ، ایف بی آر انکم ٹیکس و سیلز ٹیکس، عدالتی بیاناتِ حلفی، دستاویزات کی اردو و انگلش کمپوزنگ اور ایس ای سی پی کارپوریٹ رجسٹریشن کی مکمل، فوری اور شفاف خدمات فراہم کرتے ہیں۔ ہمارا مقصد شہریوں اور کاروباری اداروں کو پیچیدہ قانونی عمل سے بچا کر آسان، محفوظ اور تیز ترین سروس فراہم کرنا ہے۔"
    : (aboutCms?.heroSubtitle || aboutCms?.leadContent || "Ch Composing Estamp & Tax Advisor provides reliable e-stamp, property registry, tax advisory, document composing, typing, affidavit, scanning, printing, and online filing services to individuals, property owners, and businesses.");

  const whatsappPhone = settings?.whatsappSettings?.number || settings?.whatsapp || SITE.whatsapp;
  const whatsappUrl = buildWhatsAppUrl(whatsappPhone, settings?.whatsappSettings?.sectionMessages?.about || "Hello, I would like to inquire about Chamber 121 legal services.");

  return (
    <div className="min-h-screen bg-white dark:bg-[#071224] text-navy-900 dark:text-white transition-colors duration-200">
      {/* ========================================================================= */}
      {/* 1. FIRST: ABOUT OUR CHAMBER HERO                                         */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-[#040c18] text-white">
        {/* Full-bleed Background Image Layer */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/about-hero.jpg"
            alt="Chamber 121 legal consultation desk with heritage law library and scales of justice"
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
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[460px] lg:min-h-[520px]">
            {/* Left Column (Text, Buttons, Trust Badges) - sits directly on clean dark navy */}
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
                  <span>{heroBadge}</span>
                </span>

                {/* Headline */}
                <h1 className="mt-4 font-serif text-[clamp(2.5rem,5vw+0.5rem,3.875rem)] font-bold leading-[1.1] text-white tracking-tight">
                  {heroHeadline}
                </h1>

                {/* Description */}
                <p className="mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-[#F4F6F8]/90 font-normal">
                  {heroDescription}
                </p>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href="/#office"
                    className="btn-gold inline-flex items-center gap-2.5 px-6 py-3.5 text-[13.5px] sm:text-sm font-medium shadow-lg shadow-gold-500/20"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>{isUrdu ? "ہمارے دفتر تشریف لائیں" : "Visit Our Chamber"}</span>
                    <ArrowRight className="h-4 w-4 ml-0.5" />
                  </Link>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] border border-emerald-400/30 px-6 py-3.5 text-[13.5px] sm:text-sm font-medium text-white shadow-lg shadow-[#25D366]/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl hover:shadow-[#25D366]/35"
                  >
                    <WhatsAppIcon className="h-4 w-4 text-white" />
                    <span>{isUrdu ? "واٹس ایپ پر رابطہ" : "WhatsApp Us"}</span>
                    <ChevronDown className="h-4 w-4 text-white/80" />
                  </a>
                </div>
              </div>

              {/* 3 Trust Badges */}
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-8 border-t border-white/10">
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#05162B]/80 backdrop-blur-md p-3 shadow-lg">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">
                      {isUrdu ? "مستند سروس" : "Reliable Service"}
                    </p>
                    <p className="text-[10px] text-[#8792A1]">
                      {isUrdu ? "100% قانونی تصدیق" : "100% Gov Verified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#05162B]/80 backdrop-blur-md p-3 shadow-lg">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-400/20 text-gold-400 border border-gold-400/30">
                    <Users className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">
                      {isUrdu ? "عوامی خدمت" : "Community Focused"}
                    </p>
                    <p className="text-[10px] text-[#8792A1]">
                      {isUrdu ? "شہریوں کا بھروسہ" : "Decades of Trust"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#05162B]/80 backdrop-blur-md p-3 shadow-lg">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <ThumbsUp className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">
                      {isUrdu ? "ہماری کمٹمنٹ" : "Your Documents"}
                    </p>
                    <p className="text-[10px] text-[#8792A1]">
                      {isUrdu ? "مکمل رازداری و حفاظت" : "Our Commitment"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Floating overlays matching the home hero */}
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
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SECOND: OUR FOUNDER (Late Haji Faqir Muhammad)                         */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 lg:py-24 border-b border-navy-900/5 dark:border-white/10 bg-slate-50/60 dark:bg-[#060e1d]">
        <div className="container-x relative">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
            {/* Framed Portrait (Gold/Wood Frame with Brass Plaque) */}
            <div className="lg:col-span-5 flex justify-center">
              <FadeIn direction="right">
                <div className="relative group">
                  {/* Ornate Gold & Dark Wood Frame */}
                  <div className="relative rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-[#d4af37] via-[#997928] to-[#5a4312] shadow-[0_20px_50px_rgba(0,0,0,0.35)] border-4 border-[#ecd27e]">
                    {/* Inner Bevel Border */}
                    <div className="relative rounded-xl p-2.5 bg-[#121927] border-2 border-[#b89535]">
                      {/* Photo Container */}
                      <div className="relative h-72 w-60 sm:h-84 sm:w-72 overflow-hidden rounded-lg bg-navy-950 shadow-inner">
                        <OwnerAvatar
                          owner={lateFounder}
                          size="xl"
                          className="!h-full !w-full !rounded-lg !border-0 !ring-0"
                        />
                      </div>

                      {/* Brass Nameplate / Memorial Plaque */}
                      <div className="mt-3 rounded border border-amber-300/60 bg-gradient-to-r from-[#b38728] via-[#fbf5b7] to-[#aa771c] px-4 py-1.5 text-center shadow-md">
                        <p className="font-serif text-xs sm:text-sm font-extrabold uppercase tracking-widest text-navy-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]">
                          {isUrdu ? lateFounder.nameUrdu : lateFounder.name}
                        </p>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-navy-900/80">
                          {isUrdu ? "بانی • 1988–2014" : "Founder • 1988–2014"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Floral & Remembrance Ornament at Corner */}
                  <div className="absolute -bottom-4 -left-4 sm:-bottom-5 sm:-left-5 flex items-center gap-2 rounded-full border border-amber-300/40 bg-white dark:bg-[#0b1930] px-3.5 py-1.5 shadow-lg">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300">
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                      {isUrdu ? "لازوال روایات" : "Eternal Legacy"}
                    </span>
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Founder Biography & Quote Callout */}
            <div className="lg:col-span-7">
              <FadeIn direction="left">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-400">
                    {isUrdu ? "ہمارے بانی" : "OUR FOUNDER"}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300/50">
                    {isUrdu ? lateFounder.badgeUrdu : lateFounder.badge}
                  </span>
                  <span className="h-0.5 w-12 bg-gold-500/60" />
                </div>

                <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-900 dark:text-white leading-tight">
                  {isUrdu ? lateFounder.nameUrdu : lateFounder.name}
                </h2>

                <p className="mt-2 text-sm sm:text-base font-semibold text-gold-600 dark:text-gold-400">
                  {isUrdu ? lateFounder.roleUrdu : lateFounder.role}
                </p>

                <div className="mt-5 space-y-4 text-sm sm:text-base leading-relaxed text-navy-800/80 dark:text-slate-300">
                  <p>
                    {isUrdu ? lateFounder.bioUrdu : lateFounder.bio}
                  </p>
                </div>

                {/* Legacy Quote */}
                <div className="mt-6 rounded-xl border-l-4 border-gold-500 bg-gold-400/10 dark:bg-gold-500/5 p-4 italic text-navy-900 dark:text-white font-serif text-base">
                  &ldquo;{isUrdu ? "دیانت، خدمت اور خلوص کی روایت ہمیشہ زندہ رہے گی۔" : "A legacy of honesty, service and care lives on."}&rdquo;
                </div>

                {/* Side Tribute Note */}
                <div className="mt-6 flex items-start gap-3.5 rounded-xl border border-navy-900/10 dark:border-white/10 bg-white dark:bg-[#0a1832] p-4 shadow-xs">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <Heart className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-serif text-sm font-bold text-navy-900 dark:text-white leading-snug italic">
                      &ldquo;{isUrdu
                        ? "اچھے لوگ کبھی جدا نہیں ہوتے، وہ ہر روز اپنے اصولوں سے ہماری رہنمائی کرتے ہیں۔"
                        : "Good people never leave us, they continue to inspire us every day."}&rdquo;
                    </p>
                    <p className="mt-1 text-xs text-gold-600 dark:text-gold-400 font-semibold">
                      {isUrdu ? "یادگار بانی چیمبر • دعا گو چیمبر 121 فیملی" : "In Loving Memory • Chamber 121 Family"}
                    </p>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. THIRD: NOW MANAGED BY (Haji Nazir Ahmed & Usama Ch)                    */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-[#071224] border-b border-navy-900/5 dark:border-white/10">
        <div className="container-x">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-navy-900/10 dark:border-white/10">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                  {isUrdu ? "موجودہ قیادت" : "Now Managed By"}
                </h2>
                <span className="h-0.5 w-12 bg-gold-500" />
              </div>
              <p className="mt-2 text-xs sm:text-sm text-navy-800/70 dark:text-slate-400">
                {isUrdu
                  ? "چیمبر 121 کے سینئر سربراہ اور مینیجنگ پارٹنرز سے براہ راست رابطہ۔"
                  : "Direct guidance and senior counsel from our licensed partners."}
              </p>
            </div>

            <div className="text-right">
              <span className="font-serif italic text-sm text-gold-600 dark:text-gold-400">
                {isUrdu ? "وہی اصول، روشن کل" : "Same Values, Brighter Tomorrow"}
              </span>
            </div>
          </div>

          {/* 2 Leadership Cards Side-by-Side */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            {currentOwners.map((owner) => (
              <div
                key={owner.id}
                className="flex flex-col justify-between rounded-2xl border border-navy-900/10 dark:border-white/15 bg-slate-50/60 dark:bg-[#0b1930] p-6 sm:p-7 shadow-lg transition hover:shadow-xl"
              >
                <div>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <OwnerAvatar owner={owner} size="xl" className="shadow-md" />

                    <div className="text-center sm:text-left flex-1">
                      <span className="inline-block rounded-md bg-gold-400/15 border border-gold-400/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-700 dark:text-gold-300">
                        {isUrdu ? owner.badgeUrdu : owner.badge}
                      </span>
                      <h3 className="mt-1.5 font-serif text-xl font-bold text-navy-900 dark:text-white">
                        {isUrdu ? owner.nameUrdu : owner.name}
                      </h3>
                      <p className="text-xs font-semibold text-gold-600 dark:text-gold-400">
                        {isUrdu ? owner.roleUrdu : owner.role}
                      </p>
                      <p className="mt-3 text-xs leading-relaxed text-navy-800/75 dark:text-slate-300">
                        {isUrdu ? owner.bioUrdu : owner.bio}
                      </p>
                    </div>
                  </div>

                  {/* Skills/Tags Pills */}
                  <div className="mt-6 flex flex-wrap gap-1.5">
                    {owner.id === "haji-nazir-ahmad" ? (
                      <>
                        <span className="rounded-md bg-white dark:bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-navy-700 dark:text-slate-300">
                          {isUrdu ? "ای اسٹیمپنگ" : "E-Stamp"}
                        </span>
                        <span className="rounded-md bg-white dark:bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-navy-700 dark:text-slate-300">
                          {isUrdu ? "رجسٹری بیعنامہ" : "Property Registry"}
                        </span>
                        <span className="rounded-md bg-white dark:bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-navy-700 dark:text-slate-300">
                          {isUrdu ? "قانونی بیاناتِ حلفی" : "Affidavits"}
                        </span>
                        <span className="rounded-md bg-white dark:bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-navy-700 dark:text-slate-300">
                          {isUrdu ? "عدالتی تصدیقات" : "Legal Verification"}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="rounded-md bg-white dark:bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-navy-700 dark:text-slate-300">
                          {isUrdu ? "ایف بی آر انکم ٹیکس" : "FBR Income Tax"}
                        </span>
                        <span className="rounded-md bg-white dark:bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-navy-700 dark:text-slate-300">
                          {isUrdu ? "سیلز ٹیکس و پی آر اے" : "Sales Tax & PRA"}
                        </span>
                        <span className="rounded-md bg-white dark:bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-navy-700 dark:text-slate-300">
                          {isUrdu ? "ایس ای سی پی کارپوریٹ" : "SECP Registration"}
                        </span>
                        <span className="rounded-md bg-white dark:bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-navy-700 dark:text-slate-300">
                          {isUrdu ? "ڈیجیٹل مشاورتی خدمات" : "Digital Advisory"}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="mt-6 pt-4 border-t border-navy-900/10 dark:border-white/10 flex items-center gap-2.5">
                  {owner.phone && (
                    <a
                      href={owner.phoneHref}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 dark:bg-white/10 hover:bg-navy-800 dark:hover:bg-white/20 px-4 py-2.5 text-xs font-bold text-white transition shadow-sm"
                    >
                      <Phone className="h-3.5 w-3.5 text-gold-400" />
                      <span>{owner.phone}</span>
                    </a>
                  )}
                  {owner.whatsapp && (
                    <a
                      href={buildWhatsAppUrl(owner.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] px-4 py-2.5 text-xs font-bold text-white transition shadow-sm"
                      title={`WhatsApp ${owner.name}`}
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FOURTH: OUR COMMITMENT & OUR SERVICES                                  */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-slate-50/70 dark:bg-[#060e1d] border-b border-navy-900/5 dark:border-white/10">
        <div className="container-x">
          <div className="max-w-4xl mx-auto text-center">
            <FadeIn>
              {/* Legacy Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-gold-400/15 border border-gold-400/30 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-gold-700 dark:text-gold-300">
                <Sparkles className="h-3.5 w-3.5 text-gold-500" />
                <span>
                  {isUrdu
                    ? "1988 سے خدمت کی لازوال روایت، اگلی نسل تک جاری"
                    : "A legacy of service since 1988, continuing into the next generation."}
                </span>
              </div>

              {/* Our Commitment */}
              <h2 className="mt-6 font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-900 dark:text-white">
                {isUrdu ? "ہمارا عزم" : "Our Commitment"}
              </h2>

              <p className="mt-4 font-serif text-base sm:text-lg lg:text-xl italic text-navy-800/90 dark:text-slate-200 leading-relaxed max-w-3xl mx-auto">
                &ldquo;{isUrdu
                  ? "تین دہائیوں سے زائد عرصے سے، ہمارا کام بھروسے، وسیع تجربے، دیانت داری، ذمہ داری اور پیشہ ورانہ خدمات کے اعلیٰ معیار پر مبنی ہے۔"
                  : "For more than three decades, our work has been guided by trust, experience, integrity, responsibility, and professional service."}&rdquo;
              </p>

              {/* 5 Core Values Pillars */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { en: "Trust", ur: "بھروسہ" },
                  { en: "Experience", ur: "تجربہ" },
                  { en: "Integrity", ur: "دیانت داری" },
                  { en: "Responsibility", ur: "ذمہ داری" },
                  { en: "Professional Service", ur: "پیشہ ورانہ خدمت" },
                ].map((val, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-navy-900/10 dark:border-white/10 bg-white dark:bg-[#0b1930] p-3 shadow-xs text-center"
                  >
                    <p className="text-xs font-bold text-navy-900 dark:text-white">
                      {isUrdu ? val.ur : val.en}
                    </p>
                  </div>
                ))}
              </div>

              <div className="my-10 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />

              {/* Our Services */}
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-400">
                  {isUrdu ? "ہماری خدمات" : "OUR SERVICES"}
                </span>
                <h3 className="mt-2 font-serif text-xl sm:text-2xl font-bold text-navy-900 dark:text-white">
                  {isUrdu ? "مکمل قانونی، دستاویزی و مشاورتی سہولیات" : "Comprehensive Legal, Documentation & Advisory Services"}
                </h3>

                {/* Service Pills / Chips */}
                <div className="mt-6 flex flex-wrap justify-center items-center gap-2 sm:gap-3">
                  {[
                    { en: "Stamp Vendor Services", ur: "اسٹامپ وینڈر سروسز" },
                    { en: "Documentation", ur: "دستاویزی تیاری" },
                    { en: "E-Stamping", ur: "ای اسٹیمپنگ" },
                    { en: "Property Documentation", ur: "پراپرٹی دستاویزات" },
                    { en: "Agreements", ur: "اقرار نامہ و معاہدات" },
                    { en: "Affidavits", ur: "بیاناتِ حلفی" },
                    { en: "Taxation", ur: "ٹیکسیشن سروسز" },
                    { en: "Legal Support", ur: "قانونی معاونت" },
                    { en: "Consultancy", ur: "کنسلٹنسی و مشاورت" },
                  ].map((service, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 rounded-xl border border-navy-900/10 dark:border-white/10 bg-white dark:bg-[#0b1930] px-4 py-2.5 text-xs sm:text-sm font-semibold text-navy-900 dark:text-slate-200 shadow-xs hover:border-gold-500/40 transition"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
                      <span>{isUrdu ? service.ur : service.en}</span>
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FIFTH: VISIT CHAMBER 121 CTA BANNER                                    */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-[#08152b] via-[#0d2146] to-[#08152b] text-white">
        <div className="container-x text-center max-w-3xl mx-auto">
          <span className="inline-block rounded-full bg-gold-400/20 border border-gold-400/30 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-gold-300">
            {isUrdu ? "چیمبر وزٹ کی دعوت" : "VISIT CHAMBER 121 TODAY"}
          </span>

          <h2 className="mt-4 font-serif text-2xl sm:text-4xl font-extrabold leading-tight">
            {isUrdu
              ? "ڈسٹرکٹ کورٹ ساہیوال تشریف لائیں اور تسلی بخش قانونی سروس حاصل کریں"
              : "Visit Us at District Court Sahiwal for Seamless Legal Documentation"}
          </h2>

          <p className="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isUrdu
              ? "شرقی گیٹ، چیمبر نمبر 121، ڈسٹرکٹ کورٹ ساہیوال۔ وزٹ سے پہلے دستاویزات کی لسٹ کے لیے ہم سے واٹس ایپ یا فون پر رابطہ کریں۔"
              : "Sharki Gate Chamber No 121 District Court Sahiwal. Contact us beforehand on WhatsApp for a quick checklist of required documents."}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href={SITE.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-gold-500 hover:bg-gold-400 px-6 py-3 text-xs font-bold text-navy-950 transition shadow-lg hover:shadow-gold-500/25"
            >
              <MapPin className="h-4 w-4" />
              <span>{isUrdu ? "گوگل میپس پر راستہ دیکھیں" : "Get Office Directions"}</span>
            </a>

            <a
              href={SITE.phoneHref}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 text-xs font-bold text-white transition"
            >
              <Phone className="h-4 w-4 text-gold-400" />
              <span>{isUrdu ? "چیمبر ڈیسک پر کال کریں" : "Call Chamber Desk"}</span>
            </a>

            <a
              href={SITE.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] px-6 py-3 text-xs font-bold text-white transition shadow-lg shadow-[#25D366]/25"
            >
              <WhatsAppIcon className="h-4 w-4" />
              <span>{isUrdu ? "واٹس ایپ رابطہ" : "WhatsApp Us"}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
