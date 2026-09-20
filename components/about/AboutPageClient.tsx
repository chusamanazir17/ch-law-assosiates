"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  ThumbsUp,
  Award,
  Phone,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Calendar,
  Sparkles,
  Heart,
  Clock,
  FileText,
  Building2,
  Infinity as InfinityIcon,
  Handshake,
  Sprout,
  ExternalLink,
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

export default function AboutPageClient() {
  const { isUrdu } = useLanguage();
  const { isDark } = useAppTheme();

  const lateFounder = OWNERS.find((o) => o.status === "late") || OWNERS[0];
  const currentOwners = OWNERS.filter((o) => o.status === "current");

  return (
    <div className="min-h-screen bg-white dark:bg-[#071224] text-navy-900 dark:text-white transition-colors duration-200">
      {/* ========================================================================= */}
      {/* 1. FIRST: OUR FOUNDER (Late Haji Faqir Muhammad)                          */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24 border-b border-navy-900/5 dark:border-white/10 bg-gradient-to-b from-slate-50 via-white to-white dark:from-[#091833] dark:via-[#071224] dark:to-[#071224]">
        {/* Subtle decorative background glow & watermark */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-[700px] rounded-full bg-gold-400/10 dark:bg-gold-500/5 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 opacity-5 dark:opacity-10 text-gold-500">
          <Award className="w-full h-full" />
        </div>

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
                          {isUrdu ? "بانی چیمبر 121 • رحمتہ اللہ علیہ" : "In Loving Memory • Founder"}
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
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-400">
                    {isUrdu ? "ہمارے بانی" : "OUR FOUNDER"}
                  </span>
                  <span className="h-0.5 w-12 bg-gold-500/60" />
                </div>

                <h1 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-900 dark:text-white leading-tight">
                  {isUrdu ? lateFounder.nameUrdu : lateFounder.name}
                </h1>

                <p className="mt-1 text-sm font-semibold text-gold-600 dark:text-gold-400">
                  {isUrdu ? lateFounder.roleUrdu : "Founder of Chamber 121 & Pioneer of Honest Legal Practice"}
                </p>

                <div className="mt-5 space-y-4 text-sm sm:text-base leading-relaxed text-navy-800/80 dark:text-slate-300">
                  <p>
                    {isUrdu
                      ? "حاجی فقیر محمد (مرحوم) نے ساہیوال ڈسٹرکٹ کورٹ میں چیمبر 121 کا آغاز دیانت، محنت اور سچے عوامی خدمت کے جذبے کے ساتھ کیا۔ ان کا مقصد تھا کہ ساہیوال اور گردونواح سے آنے والے سائلین، کسانوں، جائیداد خریداروں اور تاجروں کو عدالتی دستاویزات، اسٹامپ پیپرز اور رجسٹری کے عمل میں بلارکاوٹ اور مکمل شفاف رہنمائی میسر آئے۔"
                      : "Late Haji Faqir Muhammad started Chamber 121 with honesty, dedication, and a deep sense of service to the community. His vision was to make legal document services easier, transparent, and more accessible for everyone across Sahiwal District Court."}
                  </p>
                  <p>
                    {isUrdu
                      ? "اگرچہ آج وہ ہمارے درمیان نہیں ہیں، لیکن ان کے وضع کردہ اعلیٰ اخلاقی اصول، دیانت داری اور ہمدردی کی روایات آج بھی ہمارے ہر روز کے کام اور فیصلے کی رہنمائی کرتی ہیں۔"
                      : "Although he is no longer with us, his values, principles, and compassion continue to guide our work every single day."}
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
      {/* 2. SECOND: NOW MANAGED BY (Haji Nazir Ahmad & Usama Nazir Ch)              */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 lg:py-24 bg-slate-50/60 dark:bg-[#060e1d] border-b border-navy-900/5 dark:border-white/10">
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
                className="flex flex-col justify-between rounded-2xl border border-navy-900/10 dark:border-white/15 bg-white dark:bg-[#0b1930] p-6 sm:p-7 shadow-lg transition hover:shadow-xl"
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
                        <span className="rounded-md bg-slate-100 dark:bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-navy-700 dark:text-slate-300">
                          {isUrdu ? "ای اسٹیمپنگ" : "E-Stamp"}
                        </span>
                        <span className="rounded-md bg-slate-100 dark:bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-navy-700 dark:text-slate-300">
                          {isUrdu ? "رجسٹری بیعنامہ" : "Property Registry"}
                        </span>
                        <span className="rounded-md bg-slate-100 dark:bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-navy-700 dark:text-slate-300">
                          {isUrdu ? "قانونی بیاناتِ حلفی" : "Affidavits"}
                        </span>
                        <span className="rounded-md bg-slate-100 dark:bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-navy-700 dark:text-slate-300">
                          {isUrdu ? "عدالتی تصدیقات" : "Legal Verification"}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="rounded-md bg-slate-100 dark:bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-navy-700 dark:text-slate-300">
                          {isUrdu ? "ایف بی آر انکم ٹیکس" : "FBR Income Tax"}
                        </span>
                        <span className="rounded-md bg-slate-100 dark:bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-navy-700 dark:text-slate-300">
                          {isUrdu ? "سیلز ٹیکس و پی آر اے" : "Sales Tax & PRA"}
                        </span>
                        <span className="rounded-md bg-slate-100 dark:bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-navy-700 dark:text-slate-300">
                          {isUrdu ? "ایس ای سی پی کارپوریٹ" : "SECP Registration"}
                        </span>
                        <span className="rounded-md bg-slate-100 dark:bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-navy-700 dark:text-slate-300">
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
      {/* 3. THIRD: ABOUT OUR CHAMBER                                               */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24 border-b border-navy-900/5 dark:border-white/10 bg-white dark:bg-[#071224]">
        <div className="container-x relative">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left Column: Heading & Description */}
            <div className="lg:col-span-7">
              <FadeIn direction="up">
                <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-400">
                  {isUrdu ? "ہماری تاریخ اور عزم • چیمبر 121" : "OUR STORY. A STRONGER TOMORROW."}
                </span>

                <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-navy-900 dark:text-white leading-[1.15]">
                  {isUrdu ? (
                    <>
                      ہمارے چیمبر کے <span className="text-gold-600 dark:text-gold-400">بارے میں</span>
                    </>
                  ) : (
                    <>
                      About <span className="text-gold-600 dark:text-gold-400">Our Chamber</span>
                    </>
                  )}
                </h2>

                <p className="mt-5 text-sm sm:text-base leading-relaxed text-navy-800/80 dark:text-slate-300 max-w-2xl">
                  {isUrdu
                    ? "چوہدری کمپوزنگ، ای اسٹامپ و ٹیکس ایڈوائزر ساہیوال کی معزز اور مستند قانونی فرم ہے۔ ہم ای اسٹیمپنگ، رجسٹری بیعنامہ، ایف بی آر انکم ٹیکس و سیلز ٹیکس، عدالتی بیاناتِ حلفی، دستاویزات کی اردو و انگلش کمپوزنگ اور ایس ای سی پی کارپوریٹ رجسٹریشن کی مکمل، فوری اور شفاف خدمات فراہم کرتے ہیں۔ ہمارا مقصد شہریوں اور کاروباری اداروں کو پیچیدہ قانونی عمل سے بچا کر آسان، محفوظ اور تیز ترین سروس فراہم کرنا ہے۔"
                    : "Ch Composing Estamp & Tax Advisor provides reliable e-stamp, property registry, tax advisory, document composing, typing, affidavit, scanning, printing, and online filing services to individuals, property owners, and businesses. We are committed to making your important legal and documentation work simple, fast, and completely hassle-free."}
                </p>

                {/* 3 Trust Badges */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-6 border-t border-navy-900/10 dark:border-white/10">
                  <div className="flex items-center gap-3 rounded-xl border border-navy-900/5 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] p-3 shadow-xs">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-navy-900 dark:text-white">
                        {isUrdu ? "مستند سروس" : "Reliable Service"}
                      </p>
                      <p className="text-[10px] text-navy-600 dark:text-slate-400">
                        {isUrdu ? "100% قانونی تصدیق" : "100% Gov Verified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-navy-900/5 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] p-3 shadow-xs">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-400/20 text-gold-600 dark:text-gold-400">
                      <Users className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-navy-900 dark:text-white">
                        {isUrdu ? "عوامی خدمت" : "Community Focused"}
                      </p>
                      <p className="text-[10px] text-navy-600 dark:text-slate-400">
                        {isUrdu ? "شہریوں کا بھروسہ" : "Decades of Trust"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-navy-900/5 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] p-3 shadow-xs">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
                      <ThumbsUp className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-navy-900 dark:text-white">
                        {isUrdu ? "ہماری کمٹمنٹ" : "Your Documents"}
                      </p>
                      <p className="text-[10px] text-navy-600 dark:text-slate-400">
                        {isUrdu ? "مکمل رازداری و حفاظت" : "Our Commitment"}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Right Column: Center Visual & Service Highlight Card */}
            <div className="lg:col-span-5">
              <FadeIn direction="left" delay={0.2}>
                <div className="relative mx-auto max-w-md rounded-2xl border border-navy-900/10 dark:border-white/15 bg-gradient-to-br from-[#0a1b38] via-[#0d2247] to-[#071328] p-6 sm:p-7 text-white shadow-2xl overflow-hidden">
                  {/* Gold accent top bar */}
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-gold-400 via-amber-300 to-gold-600" />
                  
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-gold-400">
                        {isUrdu ? "چیمبر 121 • ڈسٹرکٹ کورٹ" : "CHAMBER 121 • DISTRICT COURT"}
                      </span>
                      <h3 className="mt-1 font-serif text-lg font-bold">
                        {isUrdu ? "دستاویزات اور ٹیکس ایڈوائزری" : "Legal Documentation & Tax Hub"}
                      </h3>
                    </div>
                    <div className="rounded-lg bg-gold-400/15 border border-gold-400/30 px-2.5 py-1 text-[10px] font-bold text-gold-300">
                      {isUrdu ? "ساہیوال" : "Sahiwal"}
                    </div>
                  </div>

                  <div className="my-5 rounded-xl bg-white/[0.04] border border-white/10 p-4 text-center">
                    <p className="font-serif text-base sm:text-lg italic text-amber-200 leading-snug">
                      &ldquo;Documents Today, A Brighter Tomorrow&rdquo;
                    </p>
                    <p className="mt-1 text-[11px] text-slate-300">
                      {isUrdu ? "آج کی مستند دستاویزات، کل کا پرسکون مستقبل" : "Serving with Integrity, Precision & Timely Delivery"}
                    </p>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-200">
                    <div className="flex items-center gap-2.5 py-1 px-2 rounded-lg bg-white/[0.03]">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                      <span>{isUrdu ? "پنجاب ای اسٹیمپنگ و 32-A چالان" : "Punjab E-Stamping & Challan 32-A"}</span>
                    </div>
                    <div className="flex items-center gap-2.5 py-1 px-2 rounded-lg bg-white/[0.03]">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                      <span>{isUrdu ? "رجسٹری بیعنامہ، انتقال و اقرار نامہ" : "Property Registry, Sale Deeds & Transfer"}</span>
                    </div>
                    <div className="flex items-center gap-2.5 py-1 px-2 rounded-lg bg-white/[0.03]">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                      <span>{isUrdu ? "عدالتی بیاناتِ حلفی و قانونی ڈرافٹنگ" : "Court Affidavits, Agreements & Attestation"}</span>
                    </div>
                    <div className="flex items-center gap-2.5 py-1 px-2 rounded-lg bg-white/[0.03]">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                      <span>{isUrdu ? "ایف بی آر انکم ٹیکس و سیلز ٹیکس فائلنگ" : "FBR IRIS Income Tax, Sales Tax & PRA"}</span>
                    </div>
                    <div className="flex items-center gap-2.5 py-1 px-2 rounded-lg bg-white/[0.03]">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                      <span>{isUrdu ? "ایس ای سی پی کارپوریٹ و فرم رجسٹریشن" : "SECP Company, Firm & NTN Registration"}</span>
                    </div>
                    <div className="flex items-center gap-2.5 py-1 px-2 rounded-lg bg-white/[0.03]">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                      <span>{isUrdu ? "آن لائن فارمز، اسکیننگ و قانونی کمپوزنگ" : "Online Forms, Scanning & Legal Composing"}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gold-300">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <MapPin className="h-3.5 w-3.5 text-gold-400" />
                      <span>Sharki Gate, Chamber 121</span>
                    </span>
                    <a
                      href={SITE.directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline font-bold text-[11px] flex items-center gap-1"
                    >
                      <span>{isUrdu ? "راستہ دیکھیں" : "Get Directions"}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FOURTH: A JOURNEY OF PURPOSE (Timeline)                                */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 lg:py-24 bg-slate-50/60 dark:bg-[#060e1d] border-b border-navy-900/5 dark:border-white/10">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto">
            <FadeIn direction="up">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-400">
                {isUrdu ? "ہمارا سفر" : "OUR MILESTONES"}
              </span>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                {isUrdu ? "مقصد اور اعتماد کا سفر" : "A Journey of Purpose"}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-navy-800/70 dark:text-slate-400">
                {isUrdu
                  ? "چیمبر 121 کے قیام سے لے کر جدید ڈیجیٹل دور تک کی بااعتماد تاریخ۔"
                  : "From the foundational vision at District Court Sahiwal to modern digital tax & legal services."}
              </p>
            </FadeIn>
          </div>

          {/* Connected Horizontal Timeline (responsive on mobile) */}
          <div className="mt-12 lg:mt-16 relative">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-1/2 left-12 right-12 h-1 -translate-y-1/2 bg-gradient-to-r from-emerald-500 via-gold-500 to-blue-500 opacity-30 z-0" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {/* Step 1: Founded */}
              <div className="flex flex-col items-center text-center p-5 rounded-2xl border border-navy-900/5 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-xs">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-4 ring-slate-50 dark:ring-[#060e1d] shadow-md">
                  <Sprout className="h-7 w-7" />
                </div>
                <h3 className="mt-4 font-serif text-base font-bold text-navy-900 dark:text-white">
                  {isUrdu ? "بنیاد" : "Founded"}
                </h3>
                <p className="mt-1 text-xs text-navy-800/70 dark:text-slate-300 leading-relaxed">
                  {isUrdu ? "عوامی خدمت اور شفاف قانونی مشاورت کا لازوال وژن۔" : "A vision to serve the community with honesty and clarity."}
                </p>
              </div>

              {/* Step 2: Built on Trust */}
              <div className="flex flex-col items-center text-center p-5 rounded-2xl border border-navy-900/5 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-xs">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-400/20 text-gold-600 dark:text-gold-400 ring-4 ring-slate-50 dark:ring-[#060e1d] shadow-md">
                  <Handshake className="h-7 w-7" />
                </div>
                <h3 className="mt-4 font-serif text-base font-bold text-navy-900 dark:text-white">
                  {isUrdu ? "اعتماد کی تعمیر" : "Built on Trust"}
                </h3>
                <p className="mt-1 text-xs text-navy-800/70 dark:text-slate-300 leading-relaxed">
                  {isUrdu ? "ہر دستاویز اور مشورے میں صداقت اور امانت داری۔" : "Honesty and dedication in every document and deed."}
                </p>
              </div>

              {/* Step 3: Serving the Community */}
              <div className="flex flex-col items-center text-center p-5 rounded-2xl border border-navy-900/5 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-xs">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 ring-4 ring-slate-50 dark:ring-[#060e1d] shadow-md">
                  <Building2 className="h-7 w-7" />
                </div>
                <h3 className="mt-4 font-serif text-base font-bold text-navy-900 dark:text-white">
                  {isUrdu ? "عوامی خدمت" : "Serving the Community"}
                </h3>
                <p className="mt-1 text-xs text-navy-800/70 dark:text-slate-300 leading-relaxed">
                  {isUrdu ? "شہریوں، جائیداد مالکان اور تاجروں کا دہائیوں سے مکمل اعتماد۔" : "Years of trusted support to individuals, families, and businesses."}
                </p>
              </div>

              {/* Step 4: Continuing the Legacy */}
              <div className="flex flex-col items-center text-center p-5 rounded-2xl border border-navy-900/5 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-xs">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 ring-4 ring-slate-50 dark:ring-[#060e1d] shadow-md">
                  <InfinityIcon className="h-7 w-7" />
                </div>
                <h3 className="mt-4 font-serif text-base font-bold text-navy-900 dark:text-white">
                  {isUrdu ? "روایت کا تسلسل" : "Continuing the Legacy"}
                </h3>
                <p className="mt-1 text-xs text-navy-800/70 dark:text-slate-300 leading-relaxed">
                  {isUrdu ? "روایتی اقدار کے ساتھ جدید ڈیجیٹل ٹیکس و قانونی سہولیات۔" : "Still guided by the same core values with modern digital expertise."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FIFTH: WHY PEOPLE TRUST US                                             */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-[#071224] border-b border-navy-900/5 dark:border-white/10">
        <div className="container-x">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-navy-900/10 dark:border-white/10">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                  {isUrdu ? "عوام ہم پر اعتماد کیوں کرتے ہیں؟" : "Why People Trust Us"}
                </h2>
                <span className="h-0.5 w-12 bg-gold-500" />
              </div>
              <p className="mt-2 text-xs sm:text-sm text-navy-800/70 dark:text-slate-400">
                {isUrdu
                  ? "دیانت، شفافیت اور درست قانونی عمل ہمارے کام کی پہچان ہے۔"
                  : "Known for accuracy, transparency, and dependable results."}
              </p>
            </div>

            <div className="text-right">
              <span className="font-serif italic text-sm text-gold-600 dark:text-gold-400">
                {isUrdu ? "صرف کاغذات نہیں، ہم لوگوں کے محافظ ہیں" : "More Than Documents, We Serve People"}
              </span>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl border border-navy-900/5 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] shadow-xs">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-serif text-base font-bold text-navy-900 dark:text-white">
                {isUrdu ? "بااعتماد سروس" : "Trusted Service"}
              </h3>
              <p className="mt-1.5 text-xs text-navy-800/70 dark:text-slate-300 leading-relaxed">
                {isUrdu
                  ? "دیانت، ساکھ اور پیشہ ورانہ مہارت کی بدولت ساہیوال بھر میں مشہور۔"
                  : "Known across Sahiwal for honesty, reliability, and professional work."}
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl border border-navy-900/5 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] shadow-xs">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Clock className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-serif text-base font-bold text-navy-900 dark:text-white">
                {isUrdu ? "فوری تکمیل" : "Quick Processing"}
              </h3>
              <p className="mt-1.5 text-xs text-navy-800/70 dark:text-slate-300 leading-relaxed">
                {isUrdu
                  ? "ہم آپ کے قیمتی وقت کی قدر کرتے ہیں اور اسی دن تیز ترین سروس فراہم کرتے ہیں۔"
                  : "We value your time and ensure fast turnaround with same-day drafting."}
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl border border-navy-900/5 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] shadow-xs">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                <FileText className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-serif text-base font-bold text-navy-900 dark:text-white">
                {isUrdu ? "درست دستاویزات" : "Accurate Documentation"}
              </h3>
              <p className="mt-1.5 text-xs text-navy-800/70 dark:text-slate-300 leading-relaxed">
                {isUrdu
                  ? "غلطی سے پاک نتائج کے لیے ہر قانونی کاغذ کا باریک بینی سے جائزہ۔"
                  : "Careful handling and legal verification for completely error-free results."}
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl border border-navy-900/5 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] shadow-xs">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
                <Users className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-serif text-base font-bold text-navy-900 dark:text-white">
                {isUrdu ? "مخلصانہ رہنمائی" : "Friendly Support"}
              </h3>
              <p className="mt-1.5 text-xs text-navy-800/70 dark:text-slate-300 leading-relaxed">
                {isUrdu
                  ? "ہم ہمیشہ خندہ پیشانی اور احترام کے ساتھ آپ کی رہنمائی کے لیے تیار ہیں۔"
                  : "We are always here to help you with clarity, respect, and a warm smile."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SIXTH: VISIT CHAMBER 121 CTA BANNER                                    */}
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
