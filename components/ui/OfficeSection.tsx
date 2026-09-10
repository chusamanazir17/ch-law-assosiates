"use client";

import { motion } from "framer-motion";
import { MapPin, Navigation, Clock, Phone, MessageCircle } from "lucide-react";
import { SITE } from "@/lib/site";
import FadeIn from "@/components/motion/FadeIn";
import { useLanguage } from "@/lib/LanguageContext";

const BUILDING_IMG =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80";

export default function OfficeSection({
  title,
  text,
}: {
  title?: string;
  text?: string;
}) {
  const { isUrdu, t } = useLanguage();

  const sectionTitle = title || t.officeSection.title;
  const sectionText = text || t.officeSection.subtitle;

  return (
    <section id="office" className="bg-white dark:bg-[#071224] py-20 transition-colors duration-200">
      <div className="container-x">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="section-title text-navy-900 dark:text-white">{sectionTitle}</h2>
          <p className="mt-4 text-sm leading-relaxed text-navy-800/60 dark:text-slate-300">{sectionText}</p>
        </FadeIn>

        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          {/* Office info card */}
          <FadeIn direction="right" className="lg:col-span-4">
            <div className="flex h-full flex-col rounded-lg border border-navy-900/8 dark:border-white/10 bg-white dark:bg-[#0c1c33] p-8 shadow-card text-navy-900 dark:text-white">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-400/12 text-gold-500">
                  <MapPin className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-bold text-navy-900 dark:text-white">
                  {isUrdu ? "ہمارا اسلام آباد دفتر" : "Our Islamabad Office"}
                </h3>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-navy-800/65 dark:text-slate-300">
                {isUrdu ? "آفس 402، بزنس ٹاور، بلیو ایریا، اسلام آباد۔ شہر کے مرکزی مالیاتی اور تجارتی مرکز میں واقع، بینکنگ ڈسٹرکٹ سے انتہائی آسان رسائی۔" : `${SITE.address}. Situated conveniently near major financial hubs for easy accessibility from the city's banking district.`}
              </p>

              <div className="mt-6 space-y-3 border-t border-navy-900/8 dark:border-white/10 pt-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-navy-800/50 dark:text-slate-400">
                    {isUrdu ? "پیر تا جمعہ" : "Weekdays"}
                  </span>
                  <span className="font-semibold text-navy-900 dark:text-slate-100">
                    {isUrdu ? "9:00 بجے صبح تا 6:00 بجے شام" : "9:00 AM - 6:00 PM"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-navy-800/50 dark:text-slate-400">
                    {isUrdu ? "ہفتہ" : "Saturdays"}
                  </span>
                  <span className="font-semibold text-navy-900 dark:text-slate-100">
                    {isUrdu ? "10:00 بجے صبح تا 2:00 بجے دوپہر" : "10:00 AM - 2:00 PM"}
                  </span>
                </div>
              </div>

              <a
                href={SITE.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold mt-7 w-full text-center flex items-center justify-center gap-2"
              >
                <Navigation className="h-4 w-4" /> {t.officeSection.getDirectionsBtn}
              </a>
            </div>
          </FadeIn>

          {/* Building image */}
          <FadeIn delay={0.1} className="lg:col-span-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5 }}
              className="relative h-72 overflow-hidden rounded-lg lg:h-full shadow-card border border-navy-900/5 dark:border-white/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={BUILDING_IMG}
                alt="LegalAssist Pakistan office in Blue Area, Islamabad"
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-4 left-4 rtl:right-4 rtl:left-auto rounded bg-navy-900/90 dark:bg-black/80 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
                <Clock className="mr-2 rtl:ml-2 rtl:mr-0 inline h-3.5 w-3.5 text-gold-400" />
                {isUrdu ? "کھلا ہے: پیر تا جمعہ" : "Open Mon – Fri"}
              </div>
            </motion.div>
          </FadeIn>

          {/* Contact cards */}
          <div className="grid gap-6 lg:col-span-4">
            <FadeIn direction="left">
              <div className="rounded-lg bg-navy-900 p-7 text-white shadow-card">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-400/20 text-gold-400">
                  <Phone className="h-5 w-5" />
                </span>
                <h4 className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">
                  {isUrdu ? "ماہر سے گفتگو کریں" : "Speak to an Expert"}
                </h4>
                <p className="mt-1 text-lg font-bold text-gold-400">{SITE.phone}</p>
                <a href={SITE.phoneHref} className="btn-gold mt-5 w-full text-center">
                  {t.prepareVisit.callNowBtn}
                </a>
              </div>
            </FadeIn>
            <FadeIn direction="left" delay={0.1}>
              <div className="rounded-lg border border-navy-900/8 dark:border-white/10 bg-white dark:bg-[#0c1c33] p-7 shadow-soft text-navy-900 dark:text-white">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-900/[0.06] dark:bg-white/10 text-navy-900 dark:text-white">
                  <MessageCircle className="h-5 w-5 text-emerald-500" />
                </span>
                <h4 className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-navy-800/60 dark:text-slate-400">
                  {t.hero.whatsappBtn}
                </h4>
                <p className="mt-1 text-sm text-navy-800/70 dark:text-slate-300">
                  {isUrdu ? "چیک لسٹ کی فوری فراہمی کے لیے رابطہ کریں۔" : "Immediate response for checklist requests."}
                </p>
                <a
                  href={SITE.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex w-full items-center justify-center rounded border border-navy-900/20 dark:border-white/20 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-navy-900 dark:text-white transition hover:border-navy-900 hover:bg-navy-900 hover:text-white dark:hover:bg-white/10"
                >
                  {isUrdu ? "میسج بھیجیں" : "Message Us"}
                </a>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
