"use client";

import {
  Gavel, FileSignature, KeySquare, MailWarning,
  BadgeCheck, Globe2, ShieldCheck, Clock3, Phone
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import NoticeBar from "@/components/ui/NoticeBar";
import ServiceCard from "@/components/ui/ServiceCard";
import SplitShowcase from "@/components/ui/SplitShowcase";
import Stagger from "@/components/motion/Stagger";
import FadeIn from "@/components/motion/FadeIn";
import { ContactCards } from "@/components/ui/ContactBlocks";
import { HERO_IMAGES, SITE } from "@/lib/site";
import { useLanguage } from "@/lib/LanguageContext";

const cardIcons = [Gavel, FileSignature, KeySquare, MailWarning];
const featureIcons = [BadgeCheck, Globe2, ShieldCheck, Clock3];

export default function LegalDocumentationPage() {
  const { isUrdu, t } = useLanguage();
  const sp = t.servicePages["legal-documentation"];

  const features = sp.whyFeatures.map((f, i) => ({
    icon: featureIcons[i] || BadgeCheck,
    title: f.title,
    text: f.text,
  }));

  return (
    <>
      <PageHero
        badge={sp.heroBadge}
        title={sp.heroTitle}
        image={HERO_IMAGES.legal}
        description={sp.heroDesc}
        backLabel={t.common.backToHome}
      />

      <div className="border-b border-amber-200/60 dark:border-amber-950/40 bg-amber-50/70 dark:bg-amber-950/25 transition-colors duration-200">
        <div className="container-x py-5">
          <NoticeBar
            tone="warning"
            icon={Gavel}
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
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 className="section-title text-navy-900 dark:text-white">{sp.portfolioTitle}</h2>
            <p className="mt-4 text-sm text-navy-800/60 dark:text-slate-300">
              {sp.portfolioSubtitle}
            </p>
          </FadeIn>

          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {sp.cards.map((s, idx) => (
              <ServiceCard
                key={s.title}
                icon={cardIcons[idx] || Gavel}
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

      <SplitShowcase
        bg="white"
        eyebrow={sp.whyEyebrow}
        title={sp.whyTitle}
        paragraphs={sp.whyParagraphs}
        features={features}
        image="https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?auto=format&fit=crop&w=1000&q=80"
        imageAlt="Legal agreements and attested affidavits"
      />

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
