"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Navigation, Clock, Phone, CheckCircle2, Shield } from "lucide-react";
import { SITE } from "@/lib/site";
import FadeIn from "@/components/motion/FadeIn";
import { useLanguage } from "@/lib/LanguageContext";
import { WhatsAppIcon, OfficialWhatsAppButton } from "@/components/ui/WhatsAppIcon";

const BUILDING_IMG =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=640&q=70";

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
    <section id="office" className="bg-white dark:bg-[#071224] py-14 sm:py-20 transition-colors duration-200 overflow-hidden">
      <div className="container-x">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="section-title text-navy-900 dark:text-white">{sectionTitle}</h2>
          <p className="mt-3 sm:mt-4 text-sm leading-relaxed text-navy-800/60 dark:text-slate-300">{sectionText}</p>
        </FadeIn>

        <div className="mt-10 sm:mt-12 grid gap-6 lg:grid-cols-12">
          {/* Office info card */}
          <FadeIn direction="right" className="lg:col-span-4">
            <div className="flex h-full flex-col rounded-xl sm:rounded-2xl border border-navy-900/8 dark:border-white/10 bg-white dark:bg-[#0c1c33] p-5 sm:p-7 lg:p-8 shadow-card text-navy-900 dark:text-white">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-400/12 text-gold-500">
                  <MapPin className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-bold text-navy-900 dark:text-white">
                  {isUrdu ? "ہمارا ساہیوال چیمبر" : "Our Sahiwal Chamber"}
                </h3>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-navy-800/65 dark:text-slate-300">
                {isUrdu
                  ? "شرقی گیٹ چیمبر نمبر 121، ڈسٹرکٹ کورٹ ساہیوال۔ کچہری احاطے کے مرکزی شرقی گیٹ پر واقع، سائلین، وکلاء اور کاروباری حضرات کے لیے انتہائی آسان رسائی۔"
                  : `${SITE.address}. Situated right at Sharki Gate within the District Court premises for seamless accessibility.`}
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
                    {isUrdu ? "9:00 بجے صبح تا 3:00 بجے دوپہر" : "9:00 AM - 3:00 PM"}
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
              className="relative h-64 sm:h-72 overflow-hidden rounded-xl sm:rounded-2xl lg:h-full shadow-card border border-navy-900/5 dark:border-white/10"
            >
              <Image
                src={BUILDING_IMG}
                alt="Ch Composing Chamber 121, District Court Sahiwal"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 rtl:right-4 rtl:left-auto rounded bg-navy-900/90 dark:bg-black/80 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
                <Clock className="mr-2 rtl:ml-2 rtl:mr-0 inline h-3.5 w-3.5 text-gold-400" />
                {isUrdu ? "کھلا ہے: پیر تا ہفتہ" : "Open Mon – Sat"}
              </div>
            </motion.div>
          </FadeIn>

          {/* Visiting Guidance & Direct Official WhatsApp Action */}
          <FadeIn direction="left" className="lg:col-span-4">
            <div className="flex h-full flex-col justify-between rounded-xl sm:rounded-2xl border border-navy-900/8 dark:border-white/10 bg-navy-900 p-5 sm:p-7 lg:p-8 text-white shadow-card">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-400/20 text-gold-400">
                    <Shield className="h-5 w-5" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400 bg-gold-400/10 px-3 py-1 rounded-full border border-gold-400/20">
                    {isUrdu ? "چیمبر گائیڈ" : "Chamber Guide"}
                  </span>
                </div>

                <h3 className="mt-4 font-serif text-lg font-bold text-white">
                  {isUrdu ? "کچہری تشریف آوری سے پہلے رہنمائی" : "Court Premises Visiting Guide"}
                </h3>

                <ul className="mt-4 space-y-3 text-xs leading-relaxed text-white/75">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gold-400 shrink-0 mt-0.5" />
                    <span>
                      {isUrdu
                        ? "ڈسٹرکٹ کورٹ کے شرقی گیٹ سے داخل ہوتے ہی سامنے گراؤنڈ فلور پر چیمبر 121 واقع ہے۔"
                        : "Enter via Sharki Gate — Chamber 121 is directly accessible on the ground floor legal corridor."}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gold-400 shrink-0 mt-0.5" />
                    <span>
                      {isUrdu
                        ? "ای سٹامپ اور ٹیکس دستاویزات کے لیے پیشگی واٹس ایپ پر تفصیلات بھیج سکتے ہیں۔"
                        : "Send required documents on WhatsApp before visiting for accelerated same-day processing."}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gold-400 shrink-0 mt-0.5" />
                    <span>
                      {isUrdu
                        ? "تمام قانونی ڈرافٹنگ، معاہدہ جات اور بیعانہ سروسز موقع پر دستیاب ہیں۔"
                        : "All legal drafting, agreements, sale deeds, and tax filings processed on-site."}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
                <OfficialWhatsAppButton
                  href={SITE.whatsappHref}
                  label={isUrdu ? "واٹس ایپ پر پیشگی رہنمائی لیں" : "Chat with Chamber on WhatsApp"}
                  size="md"
                  className="w-full text-center"
                />
                <a
                  href={SITE.phoneHref}
                  className="w-full rounded-lg border border-white/20 py-2.5 text-center text-xs font-semibold text-white hover:bg-white/10 transition flex items-center justify-center gap-2"
                >
                  <Phone className="h-3.5 w-3.5 text-gold-400" />
                  <span>{isUrdu ? "چیمبر فون رابطہ" : "Call Chamber Desk"}</span>
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
