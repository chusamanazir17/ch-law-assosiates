"use client";

import {
  Stamp, Scale, Home, Handshake, Landmark, ShieldCheck,
  FileCheck2, BadgeCheck, Clock3, FileSearch, Phone
} from "lucide-react";
import { Chip } from "@mui/material";
import PageHero from "@/components/ui/PageHero";
import NoticeBar from "@/components/ui/NoticeBar";
import ServiceCard from "@/components/ui/ServiceCard";
import SplitShowcase from "@/components/ui/SplitShowcase";
import Stagger from "@/components/motion/Stagger";
import FadeIn from "@/components/motion/FadeIn";
import { ContactCards } from "@/components/ui/ContactBlocks";
import { HERO_IMAGES, SITE } from "@/lib/site";
import { useLanguage } from "@/lib/LanguageContext";
import { useAppTheme } from "@/lib/ThemeContext";

const cardIcons = [Stamp, Scale, Home, Handshake, Landmark, ShieldCheck];
const featureIcons = [FileCheck2, BadgeCheck, Clock3];

export default function EStampingPage() {
  const { isUrdu, t } = useLanguage();
  const { isDark } = useAppTheme();
  const sp = t.servicePages["e-stamping"];

  const features = sp.whyFeatures.map((f, i) => ({
    icon: featureIcons[i] || ShieldCheck,
    title: f.title,
    text: f.text,
  }));

  return (
    <>
      <PageHero
        badge={sp.heroBadge}
        title={sp.heroTitle}
        description={sp.heroDesc}
        image={HERO_IMAGES.estamp}
        backLabel={t.common.backToHome}
      />

      <div className="border-b border-red-100 dark:border-red-950/40 bg-red-50 dark:bg-red-950/30 transition-colors duration-200">
        <div className="container-x py-5">
          <NoticeBar
            tone="warning"
            icon={Clock3}
            label={sp.noticeLabel}
            title={sp.noticeTitle}
            text={sp.noticeText}
            ctaLabel={sp.noticeCta}
            ctaHref={SITE.phoneHref}
            className="!border-0 !bg-transparent !p-0"
          />
        </div>
      </div>

      <section className="bg-[#f5f7fa] dark:bg-[#071224] py-20 transition-colors duration-200">
        <div className="container-x">
          <FadeIn className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="section-title text-navy-900 dark:text-white">{sp.portfolioTitle}</h2>
              <p className="mt-4 text-sm leading-relaxed text-navy-800/60 dark:text-slate-300">
                {sp.portfolioSubtitle}
              </p>
            </div>
            <Chip
              label={isUrdu ? "کل سروسز: 6" : "Total Services: 6"}
              variant="outlined"
              sx={{
                borderColor: isDark ? "rgba(212,164,76,0.3)" : "rgba(11,29,56,.2)",
                color: isDark ? "#dfbb6e" : "#0b1d38",
                fontWeight: 600,
                borderRadius: 999,
                px: 1,
              }}
            />
          </FadeIn>

          <Stagger className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sp.cards.map((s, idx) => (
              <ServiceCard
                key={s.title}
                icon={cardIcons[idx] || Stamp}
                title={s.title}
                meta={s.meta}
                description={s.description}
                listLabel={s.listLabel}
                bullets={s.bullets}
                linkLabel={s.linkLabel}
                linkVariant="button"
              />
            ))}
          </Stagger>
        </div>
      </section>

      <SplitShowcase
        eyebrow={sp.whyEyebrow}
        title={sp.whyTitle}
        paragraphs={sp.whyParagraphs}
        features={features}
        image="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=640&q=70"
        imageAlt="E-stamp paper being processed by a documentation expert"
        imageTip={sp.imageTip}
      >
        {sp.disclaimerBox && (
          <div className="mt-8 flex gap-4 rounded-lg border border-navy-900/10 dark:border-white/10 bg-navy-900 p-5 text-white shadow-card">
            <FileSearch className="h-8 w-8 shrink-0 text-gold-400" />
            <p className="text-xs leading-relaxed text-white/75">
              <span className="font-bold text-white">{isUrdu ? "چوہدری کمپوزنگ: " : "Ch Composing: "}</span>
              {sp.disclaimerBox}
            </p>
          </div>
        )}
      </SplitShowcase>

      <section className="bg-white dark:bg-[#091528] py-20 transition-colors duration-200">
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

      {/* checklist banner */}
      <section className="bg-navy-900 py-10 border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-5 sm:flex-row">
          <FadeIn>
            <h3 className="font-serif text-xl font-bold text-gold-400">{sp.checklistBannerTitle}</h3>
            <p className="mt-1 text-sm text-white/70">
              {sp.checklistBannerDesc}
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <a href={SITE.phoneHref} className="btn-gold whitespace-nowrap">
              <Phone className="h-4 w-4" /> {SITE.phone}
            </a>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
