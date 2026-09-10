"use client";

import {
  FileSignature, Send, SearchCheck, Landmark, ScrollText, FileKey,
  ShieldCheck, PenLine, AlertTriangle, Phone
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import NoticeBar from "@/components/ui/NoticeBar";
import ServiceCard from "@/components/ui/ServiceCard";
import Stagger from "@/components/motion/Stagger";
import FadeIn from "@/components/motion/FadeIn";
import SplitShowcase from "@/components/ui/SplitShowcase";
import { ContactCards } from "@/components/ui/ContactBlocks";
import { HERO_IMAGES, SITE } from "@/lib/site";
import { useLanguage } from "@/lib/LanguageContext";

const cardIcons = [FileSignature, Send, SearchCheck, Landmark, ScrollText, FileKey];
const featureIcons = [ShieldCheck, PenLine, Landmark, AlertTriangle];

export default function PropertyLandPage() {
  const { isUrdu, t } = useLanguage();
  const sp = t.servicePages["property-land"];

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
        image={HERO_IMAGES.property}
        description={sp.heroDesc}
        backLabel={t.common.backToHome}
      />

      <div className="border-b border-amber-200/60 dark:border-amber-950/40 bg-amber-50/80 dark:bg-amber-950/25 transition-colors duration-200">
        <div className="container-x py-5">
          <NoticeBar
            tone="warning"
            icon={AlertTriangle}
            label={sp.noticeLabel}
            title={sp.noticeTitle}
            text={sp.noticeText}
            ctaLabel={sp.noticeCta}
            ctaHref={SITE.phoneHref}
            className="!border-0 !bg-transparent !p-0"
          />
        </div>
      </div>

      <SplitShowcase
        bg="white"
        eyebrow={sp.whyEyebrow}
        title={sp.whyTitle}
        paragraphs={sp.whyParagraphs}
        features={features}
        image="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80"
        imageAlt="Property title verification and sale deed"
      />

      <section className="bg-[#f5f7fa] dark:bg-[#071224] py-20 transition-colors duration-200">
        <div className="container-x">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 className="section-title text-navy-900 dark:text-white">{sp.portfolioTitle}</h2>
            <p className="mt-4 text-sm text-navy-800/60 dark:text-slate-300">
              {sp.portfolioSubtitle}
            </p>
          </FadeIn>

          <Stagger className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sp.cards.map((s, idx) => (
              <ServiceCard
                key={s.title}
                icon={cardIcons[idx] || FileSignature}
                title={s.title}
                meta={s.meta}
                description={s.description}
                bullets={s.bullets}
                linkLabel={s.linkLabel}
                linkVariant="button"
              />
            ))}
          </Stagger>
        </div>
      </section>

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

      <section className="bg-navy-900 py-10 border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-5 sm:flex-row">
          <FadeIn>
            <h3 className="font-serif text-xl font-bold text-gold-400">{sp.checklistBannerTitle}</h3>
            <p className="mt-1 text-sm text-white/70">{sp.checklistBannerDesc}</p>
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
