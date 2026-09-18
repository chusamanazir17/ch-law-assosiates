"use client";

import {
  ContactRound, FileSpreadsheet, TrendingUp, BadgePercent, FileSearch2, Building2,
  ShieldCheck, Receipt, Info, Phone, MapPin
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import SplitShowcase from "@/components/ui/SplitShowcase";
import ServiceCard from "@/components/ui/ServiceCard";
import Stagger from "@/components/motion/Stagger";
import FadeIn from "@/components/motion/FadeIn";
import { ConsultationPanel } from "@/components/ui/ContactBlocks";
import { HERO_IMAGES, SITE } from "@/lib/site";
import { useLanguage } from "@/providers/LanguageProvider";

const cardIcons = [ContactRound, FileSpreadsheet, TrendingUp, BadgePercent, FileSearch2, Building2];
const featureIcons = [ShieldCheck, Receipt];

export default function TaxPage() {
  const { isUrdu, t } = useLanguage();
  const sp = t.servicePages["tax"];

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
        image={HERO_IMAGES.tax}
        description={sp.heroDesc}
        backLabel={t.common.backToHome}
        backHref="/"
      />

      <SplitShowcase
        bg="white"
        eyebrow={sp.whyEyebrow}
        title={sp.whyTitle}
        paragraphs={sp.whyParagraphs}
        features={features}
        image="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=640&q=70"
        imageAlt="Tax consultant advising a client"
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
                icon={cardIcons[idx] || ContactRound}
                title={s.title}
                meta={s.meta}
                description={s.description}
                bullets={s.bullets}
                linkLabel={s.linkLabel}
                linkVariant="button"
              />
            ))}
          </Stagger>

          {/* Mandatory notice */}
          <FadeIn className="mt-14">
            <div className="flex flex-col items-start gap-5 rounded-lg border-2 border-navy-900/10 dark:border-white/10 bg-white dark:bg-[#0c1c33] p-8 sm:flex-row sm:items-center shadow-card text-navy-900 dark:text-white">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy-900 dark:bg-gold-400 text-white dark:text-navy-950">
                <Info className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-navy-900 dark:text-white">
                  {sp.noticeTitle}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-navy-800/65 dark:text-slate-300">
                  {sp.noticeText}
                </p>
                <a href={SITE.phoneHref} className="btn-outline-navy dark:border-white/20 dark:text-white dark:hover:bg-white/10 mt-5 py-2.5 text-xs inline-flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" /> {sp.noticeCta}: {SITE.phone}
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <ConsultationPanel
        title={sp.checklistBannerTitle}
        text={sp.checklistBannerDesc}
        bullets={[
          { icon: MapPin, label: isUrdu ? "دفتر کا پتہ" : "Office Location", value: isUrdu ? "بلیو ایریا، اسلام آباد" : "4th Floor, Business Tower, Blue Area" },
          { icon: Phone, label: isUrdu ? "ہیلپ لائن" : "Helpline", value: `${SITE.phone} | Mon–Fri 9am–6pm` },
        ]}
      />
    </>
  );
}
